// ============================================================
// ARGOTURO ERP — Automated Double-Entry Accounting Generator
// All posted entries must balance: Total Debit == Total Credit
// ============================================================

import { JournalEntry, JournalEntryLine, Account } from '../types';

export function createBalancedJournal(
  entryNumber: string,
  referenceType: JournalEntry['referenceType'],
  referenceNumber: string,
  description: string,
  lines: Omit<JournalEntryLine, 'id'>[],
  postedBy: string
): JournalEntry {
  const fullLines: JournalEntryLine[] = lines.map((line, idx) => ({
    ...line,
    id: `jel-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
  }));

  const totalDebit = fullLines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = fullLines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);

  // Validate balance
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error(
      `Unbalanced Journal Entry (${entryNumber}): Debit ${totalDebit} does not equal Credit ${totalCredit}`
    );
  }

  return {
    id: `je-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    entryNumber,
    date: new Date().toISOString(),
    referenceType,
    referenceNumber,
    description,
    lines: fullLines,
    totalDebit,
    totalCredit,
    status: 'posted',
    postedBy,
    createdAt: new Date().toISOString(),
  };
}

export function updateAccountBalances(accounts: Account[], journals: JournalEntry[]): Account[] {
  // Reset balances to zero and re-calculate from all posted journals
  const balances: Record<string, number> = {};

  for (const acc of accounts) {
    balances[acc.code] = 0;
  }

  for (const je of journals) {
    if (je.status !== 'posted') continue;
    for (const line of je.lines) {
      if (balances[line.accountCode] === undefined) {
        balances[line.accountCode] = 0;
      }
      balances[line.accountCode] += (line.debit || 0) - (line.credit || 0);
    }
  }

  return accounts.map((acc) => {
    const rawNet = balances[acc.code] || 0;
    // If normal balance is credit (Liabilities, Equity, Revenue), flip sign for positive display
    const currentBalance = acc.normalBalance === 'credit' ? -rawNet : rawNet;
    return {
      ...acc,
      currentBalance,
    };
  });
}

