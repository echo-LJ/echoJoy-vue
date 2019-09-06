module.exports = function (app) {
  app.get("/api/erp/getLoginInfo", (req, res) => {
    res.json({
      errno: 10000,
      errmsg: 'OK',
      data: 'mock接口成功啦！！'
    });
  });
};