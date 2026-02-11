// api/index.js - 最终修复版
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// 跨域
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// ⭐ 根路径：对应外部访问 /api
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    service: '快手签名API - Vercel部署版',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api - 服务状态',
      'GET /api/health - 健康检查', 
      'POST /api/sign - 生成签名',
      'GET /api/test - 测试'
    ],
    note: '恭喜！API服务已成功部署！'
  });
});

// ⭐ 健康检查：对应外部 /api/health
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    server: 'Vercel Serverless Functions'
  });
});

// ⭐ 测试路由：对应外部 /api/test
app.get('/test', (req, res) => {
  res.json({
    message: '✅ 测试成功！API完全正常工作！',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// ⭐ 签名接口：对应外部 /api/sign（注意这里路径是 /sign）
app.post('/sign', (req, res) => {
  try {
    const { params, app_secret } = req.body;
    
    if (!params || !app_secret) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少必要参数：params, app_secret' 
      });
    }
    
    const signParams = { ...params };
    delete signParams.sign;
    
    const sortedKeys = Object.keys(signParams).sort();
    const paramStr = sortedKeys
      .map(key => `${key}=${encodeURIComponent(String(signParams[key]))}`)
      .join('&');
    
    const signString = paramStr + app_secret;
    const signature = crypto.createHash('md5')
      .update(signString)
      .digest('hex');
    
    res.json({
      success: true,
      signature: signature,
      signed_params: { ...params, sign: signature },
      timestamp: new Date().toISOString(),
      note: '请将signature作为sign参数传递给快手API'
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
    error: '接口不存在',
    available_endpoints: [
      '/',        // 对应 /api
      '/health',  // 对应 /api/health
      '/test',    // 对应 /api/test
      '/sign'     // 对应 /api/sign
    ],
    requested_url: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// ⭐ 关键导出：使用函数包装
module.exports = (req, res) => {
  return app(req, res);
};
