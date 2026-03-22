const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// 1. 基础配置：允许跨域和 JSON 解析
app.use(cors());
app.use(express.json());

// 2. 数据库连接 (使用 Railway 的环境变量)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// 3. 获取帖子接口
app.get('/posts', async (req, res) => {
  try {
    // 明确查询 image_url 字段
    const result = await pool.query('SELECT id, title, content, image_url, created_at FROM posts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error("读取数据库出错:", err);
    res.status(500).send("读取失败");
  }
});

// 4. 发布帖子接口 (纠错增强版)
app.post('/posts', async (req, res) => {
  const { title, content, image_url } = req.body;
  
  // 【调试重点】这行代码会在 Railway 的 Logs 里打印出收到的数据
  console.log("=== 收到新帖子请求 ===");
  console.log("标题:", title);
  console.log("图片链接是否存在:", !!image_url);
  console.log("图片链接内容:", image_url || "无图片");

  try {
    // 执行插入操作
    const result = await pool.query(
      'INSERT INTO posts (title, content, image_url) VALUES ($1, $2, $3) RETURNING *',
      [title, content, image_url || null]
    );
    console.log("数据库写入成功，ID:", result.rows[0].id);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("数据库写入失败，详细错误:", err.message);
    res.status(500).send("存入失败: " + err.message);
  }
});

// 5. 启动
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务已启动，监听端口: ${PORT}`);
});
