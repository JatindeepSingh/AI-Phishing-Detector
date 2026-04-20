/*
 * server.js — Tiny Express bridge
 * Runs the compiled C++ detector and serves results to the frontend.
 *
 * Install once: npm install
 * Run:          node server.js
 * Open:         http://localhost:3000
 */

const express  = require('express');
const { exec } = require('child_process');
const path     = require('path');
const fs       = require('fs');
const os       = require('os');

const app  = express();
const PORT = 3000;

// Detect OS for binary name
const BINARY = os.platform() === 'win32' ? 'detector.exe' : './detector';

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'frontend')));

// ─── POST /api/detect ───────────────────────────────────────────────────────
//  Body: { text: string, pattern: string }
//  Returns: JSON from the C++ binary
app.post('/api/detect', (req, res) => {
    const { text, pattern } = req.body;

    if (!text || !pattern) {
        return res.status(400).json({ error: 'text and pattern are required' });
    }

    // Write text to a temp file to avoid shell injection via argv
    const tmpFile = path.join(os.tmpdir(), `ppd_${Date.now()}.txt`);
    fs.writeFileSync(tmpFile, text, 'utf8');

    // Escape pattern for shell
    const safePattern = pattern.replace(/["\\]/g, '\\$&');
    const cmd = `${BINARY} "${tmpFile}" "${safePattern}" --file`;

    exec(cmd, { cwd: __dirname, timeout: 10000 }, (err, stdout, stderr) => {
        fs.unlink(tmpFile, () => {}); // cleanup temp file

        if (err) {
            console.error('Binary error:', stderr || err.message);
            return res.status(500).json({ error: stderr || err.message });
        }
        try {
            const result = JSON.parse(stdout);
            res.json(result);
        } catch (parseErr) {
            res.status(500).json({ error: 'Failed to parse C++ output', raw: stdout });
        }
    });
});

// ─── GET / ─────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🔍 Pattern & Plagiarism Detector running`);
    console.log(`   → http://localhost:${PORT}\n`);
});