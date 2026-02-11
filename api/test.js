// api/test.js - 最简单的测试
module.exports = (req, res) => {
  res.json({ 
    message: 'Hello from Vercel Serverless!',
    timestamp: new Date().toISOString(),
    path: req.url
  });
};
