/**
 * Hellfire Ledger - Express REST API
 * Provides endpoints for CSV upload, data cleaning, and debt optimization.
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Papa = require('papaparse');
const { parseAndClean } = require('./csvParser');
const { optimizeDebts, getNetBalances } = require('./debtOptimizer');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Allow requests from Next.js dev server
app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] }));
app.use(express.json());

/**
 * GET /api/health
 * Health check endpoint.
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString(), system: 'HELLFIRE MAINFRAME ONLINE' });
});

/**
 * POST /api/upload
 * Accepts a CSV file upload (multipart/form-data, field name: "csv")
 * Returns: cleaned records, flagged records, net balances, and optimized transactions.
 */
app.post('/api/upload', upload.single('csv'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No CSV file uploaded. Field name must be "csv".' });
    }

    const csvText = req.file.buffer.toString('utf-8');

    // Parse CSV
    const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        trimHeaders: true,
    });

    if (parsed.errors && parsed.errors.length > 0) {
        console.warn('CSV parse warnings:', parsed.errors);
    }

    const rawRows = parsed.data || [];

    if (rawRows.length === 0) {
        return res.status(400).json({ error: 'CSV file is empty or could not be parsed.' });
    }

    // Clean the data
    const { clean, flagged } = parseAndClean(rawRows);

    // Optimize debts
    const transactions = optimizeDebts(clean);

    // Net balance summary
    const netBalances = getNetBalances(clean);

    res.json({
        success: true,
        summary: {
            totalRows: rawRows.length,
            cleanRows: clean.length,
            flaggedRows: flagged.length,
            transactionsNeeded: transactions.length,
        },
        clean,
        flagged,
        transactions,
        netBalances,
    });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`\n🔥 HELLFIRE MAINFRAME ONLINE at http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log(`   Upload: POST http://localhost:${PORT}/api/upload\n`);
});
