const origin_proxy_url = "http://ccs-operation-api.jdcloud.com";
const local_proxy_port = 3002;
const local_proxy_url = `http://localhost:${local_proxy_port}`;

const { original } = JSON.parse(process.env.npm_config_argv);
console.log(process.env.npm_config_argv);
const use_local = ~original.indexOf('--local');
const proxy_url = use_local
  ? local_proxy_url
  : origin_proxy_url;
var renewal_url = "http://renewal-console.jcloud.com";


// export const config = {
//   origin_proxy_url,
//   local_proxy_port,
//   local_proxy_url
// };
module.exports = {
  
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
};