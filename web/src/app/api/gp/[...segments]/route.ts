import { NextRequest, NextResponse } from 'next/server'

/**
 * Full reverse proxy for Lovable guideline apps.
 *
 * URL scheme: /api/gp/{host}/{path}
 *   - /api/gp/bridas.lovable.app          → https://bridas.lovable.app/
 *   - /api/gp/bridas.lovable.app/assets/x → https://bridas.lovable.app/assets/x
 *
 * For HTML: rewrites asset paths + injects branding fix script.
 * For JS:   rewrites "/assets/" string literals so dynamic imports work.
 * For CSS:  rewrites url() references.
 * For other files (images, fonts): passes through unchanged.
 */

const ALLOWED_HOST = /^[a-z0-9-]+\.lovable\.app$/

const BRANDING_FIX_SCRIPT = `
<script>
(function() {
  function fixBranding() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var node;
    while (node = walker.nextNode()) {
      if (node.textContent && node.textContent.indexOf('MedPocketbook') !== -1) {
        node.textContent = node.textContent.replace(/MedPocketbook/g, 'AGIR');
      }
    }
    if (document.title.indexOf('MedPocketbook') !== -1) {
      document.title = document.title.replace(/MedPocketbook/g, 'AGIR');
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixBranding);
  } else {
    fixBranding();
  }
  var observer = new MutationObserver(fixBranding);
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  setTimeout(fixBranding, 1000);
  setTimeout(fixBranding, 3000);
})();
</script>
`

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ segments: string[] }> },
) {
  const { segments } = await params

  if (!segments || segments.length === 0) {
    return NextResponse.json({ error: 'Missing host segment' }, { status: 400 })
  }

  const host = segments[0]
  if (!ALLOWED_HOST.test(host)) {
    return NextResponse.json({ error: 'Host not allowed' }, { status: 403 })
  }

  const resourcePath = segments.slice(1).join('/')
  const targetUrl = `https://${host}/${resourcePath}`
  const proxyBase = `/api/gp/${host}`

  try {
    const res = await fetch(targetUrl, {
      headers: {
        Accept: request.headers.get('accept') || '*/*',
        'User-Agent': 'Mozilla/5.0 (compatible; AGIR/1.0)',
      },
    })

    if (!res.ok) {
      return new NextResponse(null, { status: res.status })
    }

    const contentType = res.headers.get('content-type') || 'application/octet-stream'

    // ── HTML: rewrite paths + inject branding fix ──
    if (contentType.includes('text/html')) {
      let html = await res.text()

      // Inject history.replaceState BEFORE any scripts load so the SPA's
      // router sees "/" instead of "/api/gp/host" and renders correctly.
      const routerFix = `<script>history.replaceState(null, '', '/');</script>`
      html = html.replace(/<head([^>]*)>/, `<head$1>${routerFix}`)

      // Rewrite root-relative paths in src and href attributes
      html = html.replace(/(src|href)=(["'])\//g, `$1=$2${proxyBase}/`)

      // Remove crossorigin and integrity attributes (same-origin now)
      html = html.replace(/\s+crossorigin(?:="[^"]*")?/gi, '')
      html = html.replace(/\s+integrity="[^"]*"/gi, '')

      // Inject branding fix script
      if (html.includes('</body>')) {
        html = html.replace('</body>', `${BRANDING_FIX_SCRIPT}</body>`)
      } else {
        html += BRANDING_FIX_SCRIPT
      }

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      })
    }

    // ── JavaScript: rewrite asset path string literals ──
    if (contentType.includes('javascript') || resourcePath.endsWith('.js')) {
      let js = await res.text()

      // Rewrite "/assets/..." and "/lovable-uploads/..." in string literals
      js = js.replace(/"\/assets\//g, `"${proxyBase}/assets/`)
      js = js.replace(/'\/assets\//g, `'${proxyBase}/assets/`)
      js = js.replace(/`\/assets\//g, '`' + proxyBase + '/assets/')
      js = js.replace(/"\/lovable-uploads\//g, `"${proxyBase}/lovable-uploads/`)
      js = js.replace(/'\/lovable-uploads\//g, `'${proxyBase}/lovable-uploads/`)

      return new NextResponse(js, {
        headers: {
          'Content-Type': 'application/javascript; charset=utf-8',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    }

    // ── CSS: rewrite url() references ──
    if (contentType.includes('text/css') || resourcePath.endsWith('.css')) {
      let css = await res.text()

      // Rewrite url(/...) to url(/api/gp/host/...)
      css = css.replace(/url\(\s*(['"]?)\//g, `url($1${proxyBase}/`)

      return new NextResponse(css, {
        headers: {
          'Content-Type': 'text/css; charset=utf-8',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    }

    // ── Everything else (images, fonts, etc.): pass through ──
    const body = await res.arrayBuffer()
    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Guideline proxy error:', error)
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 })
  }
}
