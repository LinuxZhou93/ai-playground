const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../'))); // Serve frontend static files

// --- API Routes ---

// 1. Register
app.post('/api/auth/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, msg: 'Missing fields' });

    if (db.findUser(username)) {
        return res.json({ success: false, msg: 'User already exists' });
    }

    // Create expired user (needs voucher)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const newUser = {
        username,
        password, // TODO: Hash in production
        expiry: yesterday.toISOString().split('T')[0],
        createdAt: new Date().toISOString()
    };

    db.saveUser(newUser);
    res.json({ success: true, msg: 'Registration successful' });
});

// 2. Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.findUser(username);

    if (!user || user.password !== password) {
        return res.json({ success: false, msg: 'Invalid credentials' });
    }

    // Return user info (excluding password)
    const { password: _, ...userInfo } = user;
    res.json({ success: true, user: userInfo });
});

// 3. Redeem Voucher
app.post('/api/vip/redeem', (req, res) => {
    const { username, code } = req.body;
    const user = db.findUser(username);

    if (!user) return res.status(404).json({ success: false, msg: 'User not found' });

    const vouchers = db.getVouchers();
    const voucher = vouchers.find(v => v.code === code);

    if (!voucher) return res.json({ success: false, msg: 'Invalid voucher code' });
    if (voucher.status !== 'active') return res.json({ success: false, msg: 'Voucher already used' });

    // Mark used
    voucher.status = 'used';
    voucher.usedBy = username;
    voucher.usedAt = new Date().toISOString();

    // Extend expiry
    let currentExpiry = new Date();
    // If currently valid, add to expiry. If expired, add to today.
    const userExpiry = new Date(user.expiry);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (userExpiry >= today) {
        currentExpiry = userExpiry;
    }

    currentExpiry.setMonth(currentExpiry.getMonth() + voucher.durationMonths);
    user.expiry = currentExpiry.toISOString().split('T')[0];

    // Save changes
    db.saveUser(user);
    db.saveVouchers(vouchers);

    res.json({ success: true, msg: 'Voucher redeemed successfully', expiry: user.expiry });
});

// 4. Admin Generate Voucher (Simple endpoint)
app.post('/api/admin/generate-voucher', (req, res) => {
    // In real app, check admin auth here
    const { count = 1, months = 12 } = req.body;
    const vouchers = db.getVouchers();
    const newVouchers = [];

    for (let i = 0; i < count; i++) {
        const code = 'VIP-' + Math.random().toString(36).substr(2, 4).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
        newVouchers.push({
            code,
            status: 'active',
            durationMonths: months,
            createdAt: new Date().toISOString()
        });
    }

    vouchers.push(...newVouchers);
    db.saveVouchers(vouchers);

    res.json({ success: true, vouchers: newVouchers });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
