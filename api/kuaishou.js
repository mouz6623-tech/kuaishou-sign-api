// api/kuaishou.js - 快手签名API服务
const express = require('express');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
app.use(express.json());

// 允许跨域（方便前端调用）
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// 首页：显示服务信息
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    service: '快手签名API服务',
    version: '1.0.0',
    endpoints: [
      'GET / - 服务状态',
      'GET /health - 健康检查',
      'POST /api/sign - 生成签名',
      'POST /api/access_token - 获取access_token（示例）'
    ],
    usage: '请使用POST方法调用接口，参数参考文档',
    timestamp: new Date().toISOString()
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    time: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 🎯 核心功能：生成快手签名
app.post('/api/sign', (req, res) => {
  try {
    const { params, app_secret, sign_method = 'md5' } = req.body;
    
    // 验证必要参数
    if (!params || typeof params !== 'object') {
      return res.status(400).json({ 
        success: false, 
        error: '缺少params参数或格式不正确（应为JSON对象）' 
      });
    }
    
    if (!app_secret) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少app_secret参数' 
      });
    }
    
    // 复制参数，避免修改原对象
    const signParams = { ...params };
    
    // 删除可能存在的sign字段
    delete signParams.sign;
    delete signParams.signature;
    
    // 1. 按key字典序排序
    const sortedKeys = Object.keys(signParams).sort();
    
    // 2. 拼接字符串 key1=value1&key2=value2...
    const paramStr = sortedKeys
      .map(key => {
        const value = signParams[key];
        // 确保值是字符串
        return `${key}=${encodeURIComponent(String(value))}`;
      })
      .join('&');
    
    // 3. 末尾加上app_secret
    const signString = paramStr + app_secret;
    
    // 4. 计算签名
    let signature;
    if (sign_method.toLowerCase() === 'sha256') {
      signature = crypto.createHmac('sha256', app_secret)
        .update(paramStr)
        .digest('hex');
    } else {
      // 默认使用MD5
      signature = crypto.createHash('md5')
        .update(signString)
        .digest('hex');
    }
    
    // 返回结果
    res.json({
      success: true,
      data: {
        original_params: params,
        sign_string: signString, // 实际使用时可以隐藏
        signature: signature,
        signed_params: { ...params, sign: signature },
        sign_method: sign_method,
        timestamp: new Date().getTime()
      },
      tips: [
        '重要：请勿在前端暴露app_secret！',
        '实际调用快手API时，将signature作为sign参数传递',
        '不同业务可能使用不同的签名算法，请参考快手官方文档'
      ]
    });
    
  } catch (error) {
    console.error('签名生成错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
      message: error.message
    });
  }
});

// 示例：获取access_token（需要替换为真实的快手API调用）
app.post('/api/access_token', async (req, res) => {
  try {
    const { app_id, app_secret, code } = req.body;
    
    if (!app_id || !app_secret || !code) {
      return res.status(400).json({
        success: false,
        error: '缺少参数：app_id, app_secret, code'
      });
    }
    
    // 这里是示例逻辑，实际需要调用快手API
    // 由于需要你的真实app_secret，这里只返回示例响应
    
    res.json({
      success: true,
      message: '这是一个示例接口，需要你根据快手文档实现真实调用',
      required_steps: [
        '1. 阅读快手开放平台文档',
        '2. 替换此处的代码为真实API调用',
        '3. 确保app_secret安全存储（使用环境变量）'
      ],
      sample_request: {
        app_id: app_id,
        code: code,
        grant_type: 'authorization_code'
      },
      note: '不要在前端直接调用此接口暴露app_secret！'
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: '服务器错误',
    message: err.message 
  });
});
