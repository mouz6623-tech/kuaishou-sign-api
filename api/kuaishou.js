// api/kuaishou.js - 快手签名API服务（Vercel优化版）
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// 允许跨域
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// 首页
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    service: '快手签名API服务（Vercel部署版）',
    version: '1.0.1',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET / - 服务状态',
      'GET /health - 健康检查',
      'POST /api/sign - 生成签名'
    ]
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    time: new Date().toISOString() 
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
      signed_params: { ...params, sign: signature }
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    available: ['/', '/health', '/api/sign']
  });
});

// ⭐⭐ 关键修改：Vercel Serverless兼容格式 ⭐⭐
// 方式1：直接导出app（推荐）
module.exports = app;
