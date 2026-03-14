/**
 * Hellfire Ledger - CSV Data Cleaning Engine
 * Handles messy debt/IOU records: typos, missing values,
 * duplicate entries, and inconsistent formatting.
 */

/**
 * Clean and normalize raw CSV rows.
 * @param {Array} rows - Raw parsed CSV rows (array of objects)
 * @returns {{ clean: Array, flagged: Array }} - Cleaned rows + flagged problem rows
 */
function parseAndClean(rows) {
  const clean = [];
  const flagged = [];
  const seen = new Set();

  rows.forEach((row, index) => {
    const issues = [];

    // Normalize field names (handle various CSV column naming conventions)
    const rawDebtor =
      row.debtor || row.Debtor || row.DEBTOR || row.from || row.From || row.payer || '';
    const rawCreditor =
      row.creditor || row.Creditor || row.CREDITOR || row.to || row.To || row.payee || '';
    const rawAmount =
      row.amount || row.Amount || row.AMOUNT || row.value || row.Value || row.debt || '';
    const rawCurrency =
      row.currency || row.Currency || row.CURRENCY || 'HFG';

    // --- Clean fields ---
    const debtor = String(rawDebtor).trim().toUpperCase().replace(/[^A-Z0-9 _-]/g, '');
    const creditor = String(rawCreditor).trim().toUpperCase().replace(/[^A-Z0-9 _-]/g, '');
    const amountStr = String(rawAmount).trim().replace(/[^0-9.-]/g, '');
    const amount = parseFloat(amountStr);
    const currency = String(rawCurrency).trim().toUpperCase() || 'HFG';

    // --- Validate ---
    if (!debtor || debtor.length < 1) {
      issues.push('MISSING_DEBTOR');
    }
    if (!creditor || creditor.length < 1) {
      issues.push('MISSING_CREDITOR');
    }
    if (debtor && creditor && debtor === creditor) {
      issues.push('SELF_TRANSACTION');
    }
    if (isNaN(amount)) {
      issues.push('INVALID_AMOUNT');
    } else if (amount <= 0) {
      issues.push('NON_POSITIVE_AMOUNT');
    } else if (amount > 1_000_000) {
      issues.push('SUSPICIOUSLY_LARGE');
    }

    // --- Duplicate detection ---
    const sigKey = `${debtor}|${creditor}|${amount}`;
    if (seen.has(sigKey)) {
      issues.push('DUPLICATE_ENTRY');
    } else {
      seen.add(sigKey);
    }

    const record = {
      id: index + 1,
      debtor,
      creditor,
      amount: isNaN(amount) ? 0 : amount,
      currency,
      raw: row,
    };

    if (issues.length > 0) {
      flagged.push({ ...record, issues });
    } else {
      clean.push(record);
    }
  });

  return { clean, flagged };
}

module.exports = { parseAndClean };
