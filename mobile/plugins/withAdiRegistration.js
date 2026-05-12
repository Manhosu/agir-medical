const { withDangerousMod } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

// Config plugin que copia adi-registration.properties para os assets nativos
// do Android. Necessario para verificacao de propriedade do pacote no
// Google Play Console (o Google valida pelo arquivo dentro do APK).
const withAdiRegistration = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const assetsDir = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'assets'
      )

      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true })
      }

      fs.writeFileSync(
        path.join(assetsDir, 'adi-registration.properties'),
        'CMOSBELVBGJWYAAAAAAAAAAAAA'
      )

      return config
    },
  ])
}

module.exports = withAdiRegistration
