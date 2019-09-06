# echojoy-ui-use

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


### axios封装&使用

* axios 封装思路参照 blog 文件中的draft ->axios.md
* request > index.js作用： 将所有分装的接口暴露出来。 
* 在main.js文件中引入即可使用。
```
import api from '@/request/index';
Vue.use(api);
```
> axios中所有的依赖通过npm install 安装即可。

### 利用express 实现本地代码+本地mock+环境接口数据

> `npm run devlocal`

说明：

- 该方式目的为测试/预发环境上相关接口尚未提供或数据不全时，本地可以做出模拟
- 会以 api/server.js 为入口文件，自动启动一个 express 服务器实例
- 在 api/ 目录中修改或新增 XXX.api.js，会自动注册到上述服务器实例中
- 在该本地服务器中定义过的 get/post 等接口，会优先得到响应，测试/预发环境上的同名接口则被覆盖
- 如果测试/预发环境的相关接口已经稳定，则屏蔽本地相关接口，或直接运行 `npm run dev` 即可


