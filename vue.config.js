const origin_proxy_url = 'http://xx.com';
const local_proxy_port = 3002;
const local_proxy_url = `http://localhost:${local_proxy_port}`;

const { original } = JSON.parse(process.env.npm_config_argv);
const use_local = ~original.indexOf('--local');
const proxy_url = use_local
  ? local_proxy_url
  : origin_proxy_url;
var renewal_url = 'http://renewal-xx.jcloud.com';


module.exports = {
  // origin_proxy_url,
  // local_proxy_port,
  // local_proxy_url,
  devServer: {
    proxy: {
      '/ccs-api': {
        target: proxy_url, // 接口域名
        changeOrigin: true, //是否跨域
        pathRewrite: {
          '^/ccs-api': '' //需要rewrite的,
        }
      },
      '/renewal': {
        target: renewal_url, // 接口域名
        changeOrigin: true, //是否跨域
        pathRewrite: {
          '^/renewal': renewal_url //需要rewrite的,
        }
      }
    }
  }
  
}