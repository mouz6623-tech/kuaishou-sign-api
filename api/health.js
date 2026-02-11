// api/health.js - 健康检查
module.exports = (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'Vercel Serverless',
    region: process.env.VERCEL_REGION || 'unknown'
  });
};
