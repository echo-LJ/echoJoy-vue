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


