module.exports = {
  runtimeCompiler: true,
  devServer: {
    port:4020
	/*,    proxyTable: {},
    env: require('./dev.env'),
    port: 4545,
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    cssSourceMap: false*/
	
  }
  
  ,publicPath:process.env.VUE_APP_PUBLIC_PATH
}