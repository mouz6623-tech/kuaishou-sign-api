// api/index.js - Vercel Serverless Function版本
const express = require('express');
const crypto = require('crypto');

// 创建Express应用
const app = express();
app.use(express.json());

// 允许跨域
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// 根路由
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    service: '快手签名API服务 - Vercel Serverless版',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    note: '使用Vercel Serverless Functions部署',
    endpoints: ['/', '/health', '/api/sign']
  });
});

// 测试路由
app.get('/test', (req, res) => {
  res.json({ 
    message: '🎉 API终于工作了！', 
    timestamp: new Date().toISOString(),
    status: 'success' 
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 签名接口
app.post('/api/sign', (req, res) => {
  try {
    const { params, app_secret } = req.body;
    
    if (!params || !app_secret) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少必要参数' 
      });
    }
    
    const signParams = { ...params };
    delete signParams.sign;
    
    const sortedKeys = Object.keys(signParams).sort();
    const paramStr = sortedKeys
      .map(key => `${key}=${encodeURIComponent(signParams[key])}`)
      .join('&');
    
    const signString = paramStr + app_secret;
    const signature = crypto.createHash('md5')
      .update(signString)
      .digest('hex');
    
    res.json({
      success: true,
      signature: signature,
      signed_params: { ...params, sign: signature },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    available_endpoints: ['/', '/health', '/test', '/api/sign'],
    requested_url: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// ⭐⭐⭐ Vercel Serverless关键导出 ⭐⭐⭐
// 方式A：导出app（推荐）
module.exports = app;

// 方式B：如果A不行，用这个函数包装
// module.exports = (req, res) => {
//   return app(req, res);
// };
