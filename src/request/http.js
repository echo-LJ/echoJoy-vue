import {
  mergeWith, omit, isPlainObject
} from 'lodash';
import qs from 'qs';
import saveAs from 'file-saver';
import axios from 'axios';
import Vue from 'vue';
// import router from '@/router';
// import { isValidCode, getErrorTip } from './busi.utils';

/**
 * 用于配置请求基本信息的常量
 */
const BASE_URL = '/ccs-api';
const TIMEOUT = 30000;

/**
 * 用于标识 errno 业务逻辑错误的常量
 */
const ERR_CODE = 'err_code';

/**
 * 判断 HTTP 请求是否成功
 * @param {number} status - HTTP 状态码
 * @returns {Boolean}
 */
const isBadRequest = status => status >= 300;

/**
 * 映射 HTTP 错误时的提示语句
 * @param {enhanceError} error
 * @returns {Object}
 */
const badStatusMap = error => ({
  400: '请求错误',
  401: '未授权，请登录',
  403: '拒绝访问',
  404: `请求地址出错 ${error.response ? error.response.config.url : ''}`,
  408: '请求超时',
  500: '服务器内部错误',
  501: '服务未实现',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
  505: 'HTTP版本不受支持'
});

/**
 * 根据 getGlobalConfig 接口获得的返回值对业务逻辑错误做出通用的提示
 * @param {string} reqStr - 错误发生时的接口请求 URL，格式为 `${method} ${url}`
 * @param {object} resData - 返回的 {errno, errmsg, data} 对象
 * @param {boolean} isValid
 * @param {boolean} noWarn
 */
const warnByResponse = (reqStr, resData, isValid = false, noWarn = false) => {
  if (noWarn) return;

  // const _msg = getErrorTip(reqStr, resData);
  console.log(reqStr, _msg, '=====================');

  if (_msg) {
    Vue.prototype.Config.ROOT_VUE.$message({
      message: _msg,
      type: isValid
        ? 'success'
        : 'error',
      duration: isValid
        ? 3000
        : 7000
    });
  }
};

/**
 * 从响应中分解数据等部分
 * @param {Object} response
 */
const takeapartResponse = (response) => {
  const resText = typeof response.data !== 'undefined'
    ? response.data
    : response.request.responseText;

  let resData = null;

  try {
    resData = typeof resText === 'object'
      ? resText
      : JSON.parse(resText);
  } catch (ex) {
    console.log('[AxiosWrapper] json parse error', ex);
  }

  const { url, baseURL } = response.config;
  const reqURL = url.replace(baseURL, '');

  return [reqURL, resData];
};

/**
 * 修复 axios 转换 bug，如可能把请求中的日期等转成空对象的问题
 *  'utils.merge' in 'node_modules\axios\lib\core\Axios.js'
 * @param {any} obj
 */
const fixAxiosDateMerge = (obj) => {
  if (!obj) return obj;
  if (obj instanceof Date) return obj.getTime();
  if (!isPlainObject(obj)) return obj;
  Object.keys(obj).forEach((key) => {
    obj[key] = fixAxiosDateMerge(obj[key]);
  });
  return obj;
};

/** ************************************************************** */

/**
 * AxiosWrapper
 * @param {Object} [globalOption]
 */

function axiosWrapper(globalOption) {
  return function (option) {
    option = mergeWith({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache'
      },
      timeout: TIMEOUT,
      withCredentials: true,
      responseType: '',
      validateStatus: status => !isBadRequest(status)
    }, globalOption, option);

    if (option.data) {
      option.data = fixAxiosDateMerge(option.data);
    }
    if (option.params) {
      option.params = fixAxiosDateMerge(option.params);
    }

    const r = axios.create(option);

    // timeout
    r.interceptors.request.use(
      config => config,
      (error) => {
        if (error && error.code === 'ECONNABORTED'
          && ~error.message.indexOf('timeout')) {
          console.log('[AxiosWrapper] request timeout');
        }
        return Promise.reject(error);
      }
    );

    // other errors
    r.interceptors.request.use(
      config => config,
      (error) => {
        const errorInfo = error.response;
        if (errorInfo) {
          const errorStatus = errorInfo.status;
          // router.push({
          //   path: `/error/${errorStatus}`
          // });
        }
        return Promise.reject(error);
      }
    );

    // make data
    r.interceptors.request.use(
      (opt) => {
        const params = mergeWith({}, opt.data, opt.params); // cloneDeep(opt.data);
        opt = omit(opt, ['data', 'params']);
        const needBody = /^(put|post|patch)$/i.test(opt.method);
        const sendJSON = opt.headers
          && opt.headers['Content-Type'] === 'application/json';
        if (needBody) {
          opt.data = sendJSON
            ? JSON.stringify(params)
            : qs.stringify(params);
        } else {
          opt.params = params;
        }
        return opt;
      }
    );

    // bad HTTP request
    r.interceptors.response.use(
      response => response,
      (error) => {
        if (error && error.response) {
          const { status, statusText } = error.response;
          if (isBadRequest(status)) {
            console.warn('[AxiosWrapper] bad HTTP request: status is %s \n', status, error.response);
            error.message = badStatusMap(error)[status] || statusText;
            if (!error.message) {
              try {
                error.message = JSON.parse(error.response.request.responseText).errmsg;
              } catch (ex) {
                console.log('[AxiosWrapper] json parse error', ex);
              }
            }
            Vue.prototype.Config.ROOT_VUE.$message.error(error.message);
            return Promise.reject(new Error(error.message));
          }
        }
        return Promise.reject(error);
      }
    );

    // check business logic
    r.interceptors.response.use(
      (response) => {
        if (option.responseType === 'arraybuffer') {
          return response;
        }
        const [reqURL, resData] = takeapartResponse(response);
        const noWarn = 'no-global-config-warn' in response.config.headers
          && !!response.config.headers['no-global-config-warn'];
        // const isValid = isValidCode(resData.errno);
        const isValid = resData.errno
        const method = response.config.method.toUpperCase();
        if (!isValid) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject({
            type: ERR_CODE,
            reqURL,
            resData,
            noWarn,
            method
          });
        }
        const reqStr = `${method} ${reqURL}`;
        warnByResponse(reqStr, resData, true, noWarn);
        return resData;
      }
    );

    // wrong business logic
    r.interceptors.response.use(
      response => response,
      (error) => {
        if (error.type === ERR_CODE) {
          const reqStr = `${error.method} ${error.reqURL}`;
          warnByResponse(reqStr, error.resData, false, error.noWarn);
        }
        return Promise.reject(error.resData);
      }
    );

    return r(option);
  };
}

/** ************************************************************** */


/**
 * 获得一般的 wrapper
 * @param {Object} [option]
 */
export default option => axiosWrapper({
  transformResponse: data => void (0), // eslint-disable-line no-unused-vars
})(option);

/**
 * 获得用于下载的 wrapper
 * @param {Object} [option]
 * @param {string} [option.defaultFilename] - 获取不到文件名时的默认下载文件名
 */
export const download = option => axiosWrapper({
  responseType: 'arraybuffer'
})(option)
  .then((res) => {
    const contentType = res.headers['content-type'];

    if (~contentType.indexOf('json')) {
      const resData = res.data || res.request.response;
      const text = Buffer.from(resData).toString('utf8');
      const json = JSON.parse(text);
      return Promise.reject(json);
    }

    const disposition = res.headers['content-disposition'];
    if (disposition && disposition.match(/attachment/)) {
      let filename = disposition.replace(/attachment;.*filename=/, '').replace(/"/g, '');
      filename = filename && filename !== ''
        ? filename
        : (option.defaultFilename || 'noname');
      const blob = new Blob([res.data], { type: contentType });
      saveAs(blob, filename);
    }

    return Promise.resolve(res);
  });
