// api/test.js - Vercel Serverless Function测试
module.exports = (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 返回测试响应
  res.status(200).json({
    success: true,
    message: '✅ Vercel Serverless Function测试成功！',
    timestamp: new Date().toISOString(),
    service: '快手签名API',
    version: '1.0.0',
    method: req.method,
    path: req.url,
    query: req.query,
    body: req.body || {},
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent']
    },
    server_info: {
      platform: process.platform,
      node_version: process.version,
      region: process.env.VERCEL_REGION || 'unknown',
      runtime: 'Vercel Serverless Functions'
    },
    endpoints: [
      'GET /api/status - 服务状态',
      'GET /api/health - 健康检查',
      'POST /api/sign - 签名生成',
      'GET /api/test - 此测试页面'
    ],
    next_steps: [
      '1. 访问 /api/status 确认服务运行',
      '2. 访问 /api/health 检查健康状态',
      '3. 使用POST请求测试 /api/sign 签名接口'
    ]
  });
};
