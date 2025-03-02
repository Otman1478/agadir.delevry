const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(express.static('public')); // Serve all files in public/
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.json());

const db = new sqlite3.Database('database.db', (err) => {
    if (err) console.error('Database error:', err);
    else console.log('Connected to SQLite database');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price REAL,
        category TEXT,
        image TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        phone TEXT,
        location TEXT,
        items TEXT,
        total REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
    });
});

app.post('/api/products', upload.single('image'), (req, res) => {
    const { name, price, category } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';
    db.run('INSERT INTO products (name, price, category, image) VALUES (?, ?, ?, ?)',
        [name, price, category, image], (err) => {
            if (err) res.status(500).json({ error: err.message });
            else res.json({ success: true });
        });
});

app.post('/api/orders', (req, res) => {
    const { name, phone, location, items, total } = req.body;
    db.run('INSERT INTO orders (name, phone, location, items, total) VALUES (?, ?, ?, ?, ?)',
        [name, phone, location, JSON.stringify(items), total], (err) => {
            if (err) res.status(500).json({ error: err.message });
            else res.json({ success: true });
        });
});

app.get('/api/orders', (req, res) => {
    db.all('SELECT * FROM orders', [], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
    });
});

app.delete('/api/orders/:id', (req, res) => {
    const orderId = req.params.id;
    db.run('DELETE FROM orders WHERE id = ?', [orderId], (err) => {
        if (err) {
            console.error('Delete order error:', err);
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true });
        }
    });
});

app.delete('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    db.run('DELETE FROM products WHERE id = ?', [productId], (err) => {
        if (err) {
            console.error('Delete product error:', err);
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});