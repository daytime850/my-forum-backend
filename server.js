const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors()); // 允许前端访问
app.use(express.json());

// 连接数据库
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 根目录欢迎语
app.get('/', (req, res) => {
  res.send('论坛后端运行中！');
});

// 获取帖子列表
app.get('/posts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    // 如果表不存在，我们自动创建一个
    if (err.code === '42P01') {
        await pool.query('CREATE TABLE IF NOT EXISTS posts (id SERIAL PRIMARY KEY, title TEXT, content TEXT)');
        return res.json([]);
    }
    res.status(500).json({ error: err.message });
  }
});

// 发布新帖子
app.post('/posts', async (req, res) => {
  const { title, content } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO posts (title, content) VALUES ($1, $2) RETURNING *',
      [title, content]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`服务跑在端口 ${PORT}`));