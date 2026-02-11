// api/index.js - 正确版本
const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

// ⭐ 处理根路径：当访问 /api 时，在代码里路径是 /
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    service: '快手签名API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    note: '访问 /api/health 检查状态，/api/sign 生成签名'
  });
});

// ⭐ 健康检查：访问 /api/health，在代码里路径是 /health
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'Vercel Serverless'
  });
});

// ⭐ 签名接口：访问 /api/sign，在代码里路径是 /sign
app.post('/sign', (req, res) => {
  try {
    const { params, app_secret } = req.body;
    
    if (!params || !app_secret) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少参数' 
      });
    }
    
    // 签名计算逻辑...
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

// ⭐ 关键导出
module.exports = (req, res) => {
  return app(req, res);
};
