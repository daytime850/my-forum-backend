require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

// 连接云端数据库
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Neon 必须开启 SSL
});

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

// 测试接口：看看后端通没通
app.get('/', (req, res) => res.send('论坛后端运行中！'));

// 接口：获取排行榜
app.get('/api/leaderboard', async (req, res) => {
  try {
    const result = await pool.query('SELECT username, reputation FROM users ORDER BY reputation DESC LIMIT 10');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));