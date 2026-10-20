import { session } from './lib.mjs';
const today = new Date().toISOString().slice(0, 10);
const d = (m, day) => { const t = new Date(); t.setMonth(t.getMonth() - m, day); const r = t.toISOString().slice(0, 10); return r > today ? today : r; };
const tx = []; let id = 1;
const add = (type, amount, description, accountId, category, date, transferId) => tx.push({ id: id++, type, amount: type === 'withdrawal' ? -Math.abs(amount) : amount, description, accountId, category, date, ...(transferId ? { transferId } : {}) });
for (let m = 5; m >= 0; m--) {
  add('income', 4180, 'Salary', 1, 'Income', d(m, 25));
  add('withdrawal', 1850, 'Rent', 1, 'Housing', d(m, 1));
  add('withdrawal', 96.4 + (m % 3) * 11, 'Power and internet', 1, 'Utilities', d(m, 8));
  add('withdrawal', 412 + ((m * 37) % 90), 'Groceries', 1, 'Food', d(m, 12));
  add('withdrawal', 188 + ((m * 53) % 70), 'Groceries', 1, 'Food', d(m, 22));
  add('withdrawal', 64 + ((m * 17) % 40), 'Fuel', 1, 'Transport', d(m, 15));
  add('withdrawal', 78 + ((m * 29) % 60), 'Dinner out', 1, 'Eating out', d(m, 18));
  add('transfer', -600, 'To savings', 1, 'Savings', d(m, 26), 100 + m);
  add('transfer', 600, 'To savings', 2, 'Savings', d(m, 26), 100 + m);
}
add('withdrawal', 240, 'New headphones', 1, 'Shopping', d(2, 5));
add('withdrawal', 1180, 'Flights', 3, 'Travel', d(1, 3));
add('income', 320, 'Freelance job', 1, 'Income', d(3, 14));
const db = {
  version: 4, exportedAt: new Date().toISOString(),
  accounts: [{ id: 1, name: 'Everyday', unaccounted: 2140, locked: false, lockedBalance: 0 }, { id: 2, name: 'Savings', unaccounted: 8600, locked: false, lockedBalance: 0 }, { id: 3, name: 'Travel card', unaccounted: 1500, locked: false, lockedBalance: 0 }],
  transactions: tx,
  people: [{ id: 1, name: 'Sam' }, { id: 2, name: 'Mum' }],
  categories: ['Income', 'Housing', 'Utilities', 'Food', 'Transport', 'Eating out', 'Shopping', 'Travel', 'Savings', 'Subscriptions'].map((name, i) => ({ id: i + 1, name })),
  subscriptions: [
    { id: 1, name: 'Streaming', amount: 18.99, currency: 'NZD', billingCycle: 'monthly', startDate: d(8, 3), category: 'Subscriptions', active: true, kind: 'own', paidByMe: true, accountId: 1, rounding: 'nearest' },
    { id: 2, name: 'Gym', amount: 14.5, currency: 'NZD', billingCycle: 'weekly', startDate: d(9, 6), category: 'Subscriptions', active: true, kind: 'own', paidByMe: true, accountId: 1, rounding: 'nearest' },
    { id: 3, name: 'Cloud storage', amount: 2.99, currency: 'USD', billingCycle: 'monthly', startDate: d(10, 11), category: 'Subscriptions', active: true, kind: 'own', paidByMe: true, accountId: 1, rounding: 'up' },
    { id: 4, name: 'Domain renewal', amount: 24, currency: 'NZD', billingCycle: 'annual', startDate: d(7, 20), category: 'Subscriptions', active: true, kind: 'own', paidByMe: true, accountId: 1, rounding: 'nearest' },
    { id: 5, name: 'Sam: phone plan', amount: 35, currency: 'NZD', billingCycle: 'monthly', startDate: d(6, 14), category: 'Subscriptions', active: true, kind: 'other', personId: 1, paidByMe: false, accountId: 1, rounding: 'nearest' },
  ],
  debts: [
    { id: 1, direction: 'owe', name: 'Car loan', personId: 2, amount: 6000, currency: 'NZD', dateCreated: d(9, 1), notes: 'Borrowed for the car; $250 a month', currentBalance: 3750, repayments: [{ id: 1, date: d(5, 28), amount: 250 }, { id: 2, date: d(4, 28), amount: 250 }, { id: 3, date: d(3, 28), amount: 250 }, { id: 4, date: d(2, 28), amount: 250 }, { id: 5, date: d(1, 28), amount: 250 }, { id: 6, date: d(0, 1), amount: 250 }] },
    { id: 2, direction: 'owed', name: 'Concert tickets', personId: 1, amount: 180, currency: 'NZD', dateCreated: d(1, 9), currentBalance: 90, repayments: [{ id: 1, date: d(0, 2), amount: 90 }] },
  ],
  interestRules: [{ id: 1, name: 'Savings interest', accountId: 2, ratePct: 4.5, billingCycle: 'monthly', startDate: d(6, 1), applyTax: true, rounding: 'nearest', active: true }],
  taxRules: [{ id: 1, name: 'RWT on interest', ratePct: 33, base: 'interest', incomeIsGross: false, rounding: 'nearest', active: true }],
  interestHistory: [], timelines: [],
};
const s = await session({ w: 1440, h: 900, storage: { 'budget-track-data': db } });
const { p, shot } = s;
await p.goto('http://127.0.0.1:5301/', { waitUntil: 'load' });
await p.waitForTimeout(2500);
await shot('budget-desk-accounts');
for (const [label, name, wait] of [['Subscriptions', 'subs', 1200], ['Debts', 'debts', 1200], ['History', 'history', 1500], ['Graphs', 'graphs', 2500]]) {
  await p.getByRole('tab', { name: label }).first().click().catch(() => p.getByText(label, { exact: true }).first().click());
  await shot(`budget-desk-${name}`, wait);
}
await s.close();
