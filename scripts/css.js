const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const EventHooksPlugin = require('event-hooks-webpack-plugin')
const webpackBaseConfig = require('../webpack.config')

const srcPath = path.join(__dirname, '../src')

function main() {
  const dirs = fs.readdirSync(srcPath)
  const configs = dirs
    .map((dir) => {
      // remove root index
      if (dir === 'index.tsx') {
        return null
      }
      return {
        ...webpackBaseConfig,
        entry: {
          main: {
            import: [path.join(srcPath, dir, 'index.tsx'), path.join(srcPath, dir, 'index.css')],
          },
        },
        output: {
          filename: 'unused.js',
          path: path.resolve(__dirname, '../dist', dir),
        },
        plugins: [
          ...webpackBaseConfig.plugins,
          new EventHooksPlugin({
            emit(compilation) {
              // 移除JS， css重命名
              compilation.assets['index.css'] = compilation.assets['main.css']
              delete compilation.assets['unused.js']
              delete compilation.assets['main.css']
            },
          }),
        ],
      }
    })
    .filter((_) => _)

  webpack(configs, (err, stats) => {
    if (err || stats.hasErrors()) {
      console.log(err, stats.toString())
      process.exit(1)
    }
    console.log('compiled successfully')
  })
}

main()
