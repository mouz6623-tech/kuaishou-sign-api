// api/index.js - 简化测试版
const express = require('express');
const app = express();

app.use(express.json());

// 测试路由
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Express应用在Vercel上运行成功！',
    timestamp: new Date().toISOString(),
    endpoints: ['/', '/api/test', '/api']
  });
});

// ⭐ 关键导出：Vercel Serverless Function格式
module.exports = (req, res) => {
  return app(req, res);
};
