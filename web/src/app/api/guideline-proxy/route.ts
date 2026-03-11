import { NextRequest, NextResponse } from 'next/server'

// Allowed Lovable domains for security
const ALLOWED_HOSTS = ['.lovable.app']

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ALLOWED_HOSTS.some(host => parsed.hostname.endsWith(host))
  } catch {
    return false
  }
}

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

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  if (!isAllowedUrl(url)) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 403 })
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AGIR/1.0)',
        Accept: 'text/html',
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch guideline' }, { status: response.status })
    }

    let html = await response.text()

    // Inject <base> tag so relative assets still load from the Lovable domain
    const parsedUrl = new URL(url)
    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}/`
    const baseTag = `<base href="${baseUrl}">`

    // Insert base tag after <head> and branding fix script before </head>
    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>${baseTag}`)
    } else if (html.includes('<head ')) {
      html = html.replace(/<head([^>]*)>/, `<head$1>${baseTag}`)
    }

    // Inject branding fix script before </body>
    if (html.includes('</body>')) {
      html = html.replace('</body>', `${BRANDING_FIX_SCRIPT}</body>`)
    } else {
      html += BRANDING_FIX_SCRIPT
    }

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Guideline proxy error:', error)
    return NextResponse.json({ error: 'Failed to proxy guideline' }, { status: 500 })
  }
}
