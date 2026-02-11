// api/status.js - 服务状态
module.exports = (req, res) => {
  res.json({
    status: 'running',
    service: '快手签名API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/status',
      '/api/health', 
      '/api/sign',
      '/api/test'
    ],
    note: '恭喜！API拆分部署成功！'
  });
};
