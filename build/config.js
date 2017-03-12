
import path from 'path'

const config = new Map();

config.set('host','localhost')
config.set('port', 3200)

config.set('host_port',
  `http://${config.get('host')}:${config.get('port')}`
);

config.set('titleTag','React Studio')

config.set('setProxy',false)

config.set('proxy',{
	"/api": {
    target: "http://localhost:3000",
    pathRewrite: {"^/api" : ""},
    secure: false
  }
})

config.set('vendor_dependencies', [
  'preact-compat'
]);

config.set('build_dependencies',[
  'babel-polyfill',
  'classlist-polyfill'
])

config.set('product_dependencies', config.get('vendor_dependencies').concat(config.get('build_dependencies')))

config.set('vendor_ui', [
	"bulma/css/bulma.css"
]);

config.set('assetsRoot',"dist");
config.set('assetsPublic','/assets/');
config.set('assetsRootPath',path.join(config.get('assetsRoot'),config.get('assetsPublic')))

config.set('isBuild',process.env.NODE_ENV !== 'development')

export default config
