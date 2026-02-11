// 1. 验证Content-Type
if (req.headers['content-type'] !== 'application/json') {
  return res.status(400).json({
    success: false,
    error: 'Content-Type必须是application/json'
  });
}

// 2. 验证请求大小（防止DoS）
const contentLength = parseInt(req.headers['content-length'] || '0');
if (contentLength > 1024 * 10) { // 限制10KB
  return res.status(413).json({
    success: false,
    error: '请求体过大'
  });
}
// api/sign.js - 快手签名生成
const crypto = require('crypto');

module.exports = (req, res) => {
  // 只处理POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: '只支持POST请求',
      method: req.method
    });
  }
  
  try {
    const { params, app_secret } = req.body;
    
    if (!params || !app_secret) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少参数：params 和 app_secret',
        required: ['params', 'app_secret']
      });
    }
    
    // 复制参数，删除已有sign
    const signParams = { ...params };
    delete signParams.sign;
    
    // 1. 按key排序
    const sortedKeys = Object.keys(signParams).sort();
    
    // 2. 拼接字符串
    const paramStr = sortedKeys
      .map(key => {
        const value = signParams[key];
        return `${key}=${encodeURIComponent(String(value))}`;
      })
      .join('&');
    
    // 3. 加上app_secret
    const signString = paramStr + app_secret;
    
    // 4. 计算MD5签名
    const signature = crypto.createHash('md5')
      .update(signString)
      .digest('hex');
    
    // 返回结果
    res.json({
      success: true,
      signature: signature,
      signed_params: { ...params, sign: signature },
      timestamp: new Date().toISOString(),
      algorithm: 'MD5',
      tips: [
        '将signature值作为sign参数传递给快手API',
        '请确保app_secret安全，不要在前端暴露'
      ]
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '签名生成失败',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
