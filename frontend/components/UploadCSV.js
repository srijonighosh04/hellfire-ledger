import { useState, useRef } from 'react';
import Papa from 'papaparse';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function UploadCSV({ onDataReady }) {
    const [dragOver, setDragOver] = useState(false);
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [log, setLog] = useState([]);
    const fileRef = useRef();

    const addLog = (text, type = '') => setLog(prev => [...prev, { text, type }]);

    const processFile = async (file) => {
        if (!file || !file.name.endsWith('.csv')) {
            addLog('⚠ ERROR: Only .csv files are accepted.', 'error');
            return;
        }
        setFileName(file.name);
        setLoading(true);
        setProgress(10);
        setLog([]);
        addLog(`> DISK INSERTED: ${file.name}`, 'info');
        addLog('> READING DATA STREAM...');

        // Try backend API first
        try {
            setProgress(30);
            const formData = new FormData();
            formData.append('csv', file);

            const res = await fetch(`${BACKEND_URL}/api/upload`, { method: 'POST', body: formData });

            if (res.ok) {
                const data = await res.json();
                setProgress(80);
                addLog(`> RECORDS PARSED: ${data.summary.totalRows}`, 'info');
                addLog(`> CLEAN RECORDS: ${data.summary.cleanRows}`, 'info');
                addLog(data.summary.flaggedRows > 0
                    ? `> FLAGGED RECORDS: ${data.summary.flaggedRows}` : '> NO FLAGGED RECORDS',
                    data.summary.flaggedRows > 0 ? 'warn' : '');
                addLog(`> MIN TRANSACTIONS NEEDED: ${data.summary.transactionsNeeded}`, 'info');
                setProgress(100);
                addLog('> OPTIMIZATION COMPLETE. LOADING DASHBOARD...', 'info');
                setTimeout(() => onDataReady(data), 800);
                return;
            }
        } catch (err) {
            addLog('> BACKEND OFFLINE — FALLING BACK TO CLIENT-SIDE PARSE', 'warn');
        }

        // Client-side fallback
        setProgress(40);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                const rows = result.data;
                addLog(`> CLIENT PARSE: ${rows.length} records found`, 'info');
                setProgress(70);

                // Basic client-side clean
                const clean = [];
                const flagged = [];
                const seen = new Set();
                rows.forEach((row, idx) => {
                    const debtor = (row.debtor || row.from || row.Debtor || '').trim().toUpperCase();
                    const creditor = (row.creditor || row.to || row.Creditor || '').trim().toUpperCase();
                    const amount = parseFloat((row.amount || row.Amount || '').toString().replace(/[^0-9.-]/g, ''));
                    const issues = [];
                    if (!debtor) issues.push('MISSING_DEBTOR');
                    if (!creditor) issues.push('MISSING_CREDITOR');
                    if (isNaN(amount) || amount <= 0) issues.push('INVALID_AMOUNT');
                    if (debtor && creditor && debtor === creditor) issues.push('SELF_TRANSACTION');
                    const key = `${debtor}|${creditor}|${amount}`;
                    if (seen.has(key)) issues.push('DUPLICATE_ENTRY');
                    else seen.add(key);
                    const record = { id: idx + 1, debtor, creditor, amount: isNaN(amount) ? 0 : amount, currency: 'HFG' };
                    issues.length > 0 ? flagged.push({ ...record, issues }) : clean.push(record);
                });

                // Optimize
                const transactions = optimizeClient(clean);
                setProgress(100);
                addLog(`> CLEAN: ${clean.length} | FLAGGED: ${flagged.length} | TRANSACTIONS: ${transactions.length}`, 'info');
                addLog('> LOADING DASHBOARD...', 'info');
                setTimeout(() => onDataReady({
                    success: true,
                    summary: { totalRows: rows.length, cleanRows: clean.length, flaggedRows: flagged.length, transactionsNeeded: transactions.length },
                    clean, flagged, transactions, netBalances: {}
                }), 600);
            },
            error: (err) => { addLog(`> PARSE ERROR: ${err.message}`, 'error'); setLoading(false); }
        });
    };

    const onFileChange = (e) => { if (e.target.files[0]) processFile(e.target.files[0]); };
    const onDrop = (e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Drop zone */}
            <div
                className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                id="csv-drop-zone"
            >
                <input ref={fileRef} type="file" accept=".csv" onChange={onFileChange} style={{ display: 'none' }} />
                <div style={{ fontFamily: 'var(--font-terminal)', fontSize: '3rem', marginBottom: '0.5rem' }}>💾</div>
                <div style={{ fontFamily: 'var(--font-terminal)', fontSize: '1.4rem', color: 'var(--color-neon-green)', marginBottom: '0.4rem', letterSpacing: '0.1em' }}>
                    {fileName ? `DISK: ${fileName}` : 'INSERT DATA DISK'}
                </div>
                <div style={{ color: 'rgba(57,255,20,0.5)', fontSize: '0.85rem' }}>
                    {dragOver ? '> DROP TO UPLOAD' : 'DRAG & DROP .CSV — OR CLICK TO BROWSE'}
                </div>
            </div>

            {/* Progress */}
            {loading && (
                <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(57,255,20,0.6)', marginBottom: '0.3rem' }}>
                        PROCESSING: {progress}%
                    </div>
                    <div className="progress-bar-wrap">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            )}

            {/* Terminal log */}
            {log.length > 0 && (
                <div className="terminal-output">
                    {log.map((l, i) => (
                        <span key={i} className={`terminal-line ${l.type}`}>{l.text}</span>
                    ))}
                    {loading && <span className="terminal-line"><span className="blink">█</span></span>}
                </div>
            )}
        </div>
    );
}

function optimizeClient(records) {
    const balances = {};
    records.forEach(r => {
        if (!r.debtor || !r.creditor) return;
        const amt = parseFloat(r.amount);
        if (isNaN(amt) || amt <= 0) return;
        if (!(r.debtor in balances)) balances[r.debtor] = 0;
        if (!(r.creditor in balances)) balances[r.creditor] = 0;
        balances[r.debtor] -= amt;
        balances[r.creditor] += amt;
    });
    const debtors = [], creditors = [];
    for (const [name, bal] of Object.entries(balances)) {
        if (bal < -0.001) debtors.push({ name, amount: -bal });
        else if (bal > 0.001) creditors.push({ name, amount: bal });
    }
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);
    const txs = []; let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
        const settled = Math.min(debtors[i].amount, creditors[j].amount);
        txs.push({ from: debtors[i].name, to: creditors[j].name, amount: parseFloat(settled.toFixed(4)) });
        debtors[i].amount -= settled; creditors[j].amount -= settled;
        if (debtors[i].amount < 0.001) i++;
        if (creditors[j].amount < 0.001) j++;
    }
    return txs;
}
