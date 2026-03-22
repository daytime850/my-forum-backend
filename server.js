const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // 允许处理较大的图片数据

// 数据库连接配置
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 初始化数据库表
async function initDB() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS posts (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            image_url TEXT, 
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
}
initDB();

// 获取帖子列表
app.get('/posts', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 发布新帖子（支持图片链接）
app.post('/posts', async (req, res) => {
    const { title, content, image_url } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO posts (title, content, image_url) VALUES ($1, $2, $3) RETURNING *',
            [title, content, image_url]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("服务器保存失败");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
});