const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

// Initialize Local JSON Database
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], deposits: [] }, null, 2));
}

function readDB() {
    try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        return { users: [], deposits: [] };
    }
}

function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ─── AUTHENTICATION ENDPOINTS ──────────────────

// Register User
app.post('/api/auth/signup', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: '필수 정보가 누락되었습니다.' });
    }

    const db = readDB();
    const exists = db.users.find(u => u.email === email);
    if (exists) {
        return res.status(400).json({ error: '이미 가입된 이메일 주소입니다.' });
    }

    const newUser = { username, email, password, premium: false };
    db.users.push(newUser);
    writeDB(db);

    res.json({ success: true, user: { username, email, premium: false } });
});

// Helper to check and handle 30-day expiration
function checkUserExpiration(user, db) {
    if (!user) return false;
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    if (user.premium && user.expiresAt && Date.now() > user.expiresAt) {
        user.premium = false;
        user.isExpired = true;
        writeDB(db);
        return true;
    }
    return false;
}

// Login User
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        return res.status(400).json({ error: '가입되지 않은 계정이거나 비밀번호가 일치하지 않습니다.' });
    }

    checkUserExpiration(user, db);

    res.json({ 
        success: true, 
        user: { 
            username: user.username, 
            email: user.email, 
            premium: user.premium,
            expiresAt: user.expiresAt || null,
            isExpired: user.isExpired || false
        } 
    });
});

// Get User Premium Status
app.get('/api/user/status', (req, res) => {
    const { email } = req.query;
    const db = readDB();
    const user = db.users.find(u => u.email === email);
    if (user) {
        const hasExpired = checkUserExpiration(user, db);
        res.json({ 
            premium: user.premium, 
            expiresAt: user.expiresAt || null,
            isExpired: hasExpired || user.isExpired || false
        });
    } else {
        res.json({ premium: false, expiresAt: null, isExpired: false });
    }
});

// ─── TOSS PAYMENT ENDPOINTS ─────────────────────

// Request Deposit Verification
app.post('/api/payment/request', (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: '입금자명과 이메일을 입력하세요.' });
    }

    const db = readDB();
    const newDeposit = {
        id: Date.now().toString(),
        name,
        email,
        time: new Date().toISOString(),
        status: 'pending'
    };
    db.deposits.push(newDeposit);
    writeDB(db);

    res.json({ success: true, deposit: newDeposit });
});

// Check deposit status for pending page
app.get('/api/payment/status', (req, res) => {
    const { email } = req.query;
    const db = readDB();
    const user = db.users.find(u => u.email === email);
    if (user) checkUserExpiration(user, db);

    const deposits = db.deposits.filter(d => d.email === email);
    if (deposits.length > 0) {
        const lastDep = deposits[deposits.length - 1];
        res.json({ 
            status: lastDep.status,
            expiresAt: lastDep.expiresAt || null
        });
    } else {
        res.json({ status: 'none', expiresAt: null });
    }
});

// ─── ADMIN ENDPOINTS (SECURE GATING) ───────────

const ADMIN_PASSWORD = 'jhkh0219!';

// Middleware to verify admin password header
function adminAuth(req, res, next) {
    const pwd = req.headers['x-admin-password'];
    if (pwd !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: '권한이 없습니다. 관리자 비밀번호를 확인하세요.' });
    }
    next();
}

// Get all deposits
app.get('/api/admin/deposits', adminAuth, (req, res) => {
    const db = readDB();
    res.json(db.deposits);
});

// Approve a deposit (Sets 30 days active period)
app.post('/api/admin/approve', adminAuth, (req, res) => {
    const { id } = req.body;
    const db = readDB();
    const deposit = db.deposits.find(d => d.id === id);
    
    if (!deposit) {
        return res.status(404).json({ error: '해당 신청 건을 찾을 수 없습니다.' });
    }

    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const approvedAt = Date.now();
    const expiresAt = approvedAt + THIRTY_DAYS_MS;

    deposit.status = 'approved';
    deposit.approvedAt = approvedAt;
    deposit.expiresAt = expiresAt;
    
    // Find the user with this email and set premium = true & expiresAt
    const user = db.users.find(u => u.email === deposit.email);
    if (user) {
        user.premium = true;
        user.approvedAt = approvedAt;
        user.expiresAt = expiresAt;
        user.isExpired = false;
    }
    
    writeDB(db);
    res.json({ success: true, expiresAt });
});

// Reject a deposit
app.post('/api/admin/reject', adminAuth, (req, res) => {
    const { id } = req.body;
    const db = readDB();
    const deposit = db.deposits.find(d => d.id === id);
    
    if (!deposit) {
        return res.status(404).json({ error: '해당 신청 건을 찾을 수 없습니다.' });
    }

    deposit.status = 'rejected';
    writeDB(db);
    res.json({ success: true });
});

// Revoke premium (Cancel subscription)
app.post('/api/admin/revoke', adminAuth, (req, res) => {
    const { id } = req.body;
    const db = readDB();
    const deposit = db.deposits.find(d => d.id === id);
    
    if (!deposit) {
        return res.status(404).json({ error: '해당 신청 건을 찾을 수 없습니다.' });
    }

    deposit.status = 'cancelled';
    
    // Revoke user premium
    const user = db.users.find(u => u.email === deposit.email);
    if (user) {
        user.premium = false;
    }

    writeDB(db);
    res.json({ success: true });
});

// Serve frontend static assets
app.use(express.static(__dirname));

// Start server
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 JISP Fullstack Secure Backend Server running!`);
    console.log(`💻 Local URL: http://localhost:${PORT}`);
    console.log(`🔒 Admin Password Set: jhkh0219!`);
    console.log(`====================================================`);
});
