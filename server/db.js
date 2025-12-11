const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const VOUCHERS_FILE = path.join(DATA_DIR, 'vouchers.json');

// Ensure data files exist
function initDB() {
    if (!fs.existsSync(USERS_FILE)) {
        // Default Demo User
        const defaultUser = [{
            username: "student01",
            password: "abc",
            expiry: "2026-12-31",
            createdAt: new Date().toISOString()
        }];
        fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUser, null, 2));
    }
    if (!fs.existsSync(VOUCHERS_FILE)) {
        // Default Demo Voucher
        const defaultVouchers = [{
            code: "VIP-DEMO-2025",
            status: "active",
            durationMonths: 12,
            createdAt: new Date().toISOString()
        }];
        fs.writeFileSync(VOUCHERS_FILE, JSON.stringify(defaultVouchers, null, 2));
    }
}

function readJSON(file) {
    try {
        const data = fs.readFileSync(file, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

function writeJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Users API
exports.getUsers = () => readJSON(USERS_FILE);
exports.saveUser = (user) => {
    const users = readJSON(USERS_FILE);
    const existingIndex = users.findIndex(u => u.username === user.username);
    if (existingIndex >= 0) {
        users[existingIndex] = user;
    } else {
        users.push(user);
    }
    writeJSON(USERS_FILE, users);
};
exports.findUser = (username) => readJSON(USERS_FILE).find(u => u.username === username);

// Vouchers API
exports.getVouchers = () => readJSON(VOUCHERS_FILE);
exports.saveVouchers = (vouchers) => writeJSON(VOUCHERS_FILE, vouchers);

// Init on load
initDB();
