import axios, { download } from "./http";

export const getLoginInfo = params => axios({
  url: '/api/erp/getLoginInfo',
  method: 'get',
  params,
});
export default {
  getLoginInfo
};