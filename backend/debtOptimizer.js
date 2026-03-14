/**
 * Hellfire Ledger - Debt Optimization Engine
 * Uses a cash-flow minimization (greedy net-balance) algorithm
 * to reduce N debt records into the minimum number of transactions.
 */

/**
 * Minimize number of transactions to settle all debts.
 * Algorithm:
 *   1. Calculate net balance per person (positive = owed to them, negative = they owe)
 *   2. Separate into creditors (+) and debtors (-)
 *   3. Greedily match largest debtor to largest creditor
 * @param {Array} cleanRecords - Cleaned debt records {debtor, creditor, amount}
 * @returns {Array} - Minimal transactions [{from, to, amount}]
 */
function optimizeDebts(cleanRecords) {
    // Step 1: Calculate net balances
    const balances = {};

    cleanRecords.forEach((record) => {
        const debtor = record.debtor;
        const creditor = record.creditor;
        const amount = parseFloat(record.amount);

        if (!debtor || !creditor || isNaN(amount) || amount <= 0) return;

        if (!(debtor in balances)) balances[debtor] = 0;
        if (!(creditor in balances)) balances[creditor] = 0;

        balances[debtor] -= amount;   // debtor owes → negative balance
        balances[creditor] += amount; // creditor is owed → positive balance
    });

    // Step 2: Separate debtors (net negative) from creditors (net positive)
    const debtors = [];
    const creditors = [];

    for (const [name, balance] of Object.entries(balances)) {
        if (balance < -0.001) {
            debtors.push({ name, amount: -balance }); // store as positive
        } else if (balance > 0.001) {
            creditors.push({ name, amount: balance });
        }
        // Those at ~0 are already settled
    }

    // Sort descending so we match largest debts first (more efficient)
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    // Step 3: Greedy matching
    const transactions = [];
    let i = 0; // debtor pointer
    let j = 0; // creditor pointer

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        const settlementAmount = Math.min(debtor.amount, creditor.amount);

        transactions.push({
            from: debtor.name,
            to: creditor.name,
            amount: parseFloat(settlementAmount.toFixed(4)),
        });

        debtor.amount -= settlementAmount;
        creditor.amount -= settlementAmount;

        if (debtor.amount < 0.001) i++;
        if (creditor.amount < 0.001) j++;
    }

    return transactions;
}

/**
 * Build a summary of net balances per person.
 */
function getNetBalances(cleanRecords) {
    const balances = {};
    cleanRecords.forEach((record) => {
        const { debtor, creditor, amount } = record;
        if (!debtor || !creditor) return;
        const amt = parseFloat(amount);
        if (isNaN(amt)) return;
        if (!(debtor in balances)) balances[debtor] = 0;
        if (!(creditor in balances)) balances[creditor] = 0;
        balances[debtor] -= amt;
        balances[creditor] += amt;
    });
    return balances;
}

module.exports = { optimizeDebts, getNetBalances };
