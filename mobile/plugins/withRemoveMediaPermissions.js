const { withAndroidManifest, AndroidConfig } = require('@expo/config-plugins')

// Remove permissoes READ_MEDIA_IMAGES e READ_MEDIA_VIDEO que o
// expo-image-picker injeta automaticamente no manifest Android.
//
// Justificativa: o app so usa galeria pra trocar foto de perfil (uso
// esporadico), entao o Google Play Store exige uso do Android Photo
// Picker, que NAO precisa dessas permissoes. Manter as permissoes
// viola a "Photo and Video Permissions Policy".
const PERMISSIONS_TO_REMOVE = [
  'android.permission.READ_MEDIA_IMAGES',
  'android.permission.READ_MEDIA_VIDEO',
]

const withRemoveMediaPermissions = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest

    if (!manifest['uses-permission']) {
      return config
    }

    manifest['uses-permission'] = manifest['uses-permission'].filter((entry) => {
      const name = entry?.$?.['android:name']
      return !PERMISSIONS_TO_REMOVE.includes(name)
    })

    // Adiciona tag tools:node="remove" pra garantir que mesmo se outra
    // biblioteca tentar injetar a permissao via manifest merger, ela sera
    // removida na build final.
    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools'
    }

    for (const perm of PERMISSIONS_TO_REMOVE) {
      manifest['uses-permission'].push({
        $: {
          'android:name': perm,
          'tools:node': 'remove',
        },
      })
    }

    return config
  })
}

module.exports = withRemoveMediaPermissions
