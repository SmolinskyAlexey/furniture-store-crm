const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

async function save(accept) {
    let requests = 0, closed = false;
    const date = {value: '2026-01-01'};
    const form = {querySelector: () => date};
    const classes = {add() {}, remove() {}};
    const modal = {querySelector: selector => selector === 'form' ? form : {classList: classes, disabled: false}};
    const notices = [];
    class Data {
        constructor() { this.fields = {actual_expense_date: date.value}; }
        set(k, v) { this.fields[k] = v; }
    }
    let sent;
    const context = {
        window: {confirm: () => accept, closeUniversalModal: () => {closed = true;}},
        document: {getElementById: () => modal}, FormData: Data,
        fetch: async (url, opts) => {
            requests++;
            sent = {...opts.body.fields};
            if (requests === 1) return {ok: true, headers: {get: () => 'application/json'}, text: async () => JSON.stringify({status: 'error', code: 'cash_date_mismatch', cash_date: '2026-11-22'})};
            return {ok: true, json: async () => ({status: 'ok'})};
        },
        console, showNotification: (...args) => notices.push(args),
    };
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets/js/features/persistence.js'), 'utf8'), context);
    await context.window.universalHandleObjectCreateOrUpdate('overhead_expenses', 0);
    return {requests, closed, date: date.value, sent};
}
test('old cash date asks and sends current date only after approval', async () => {
    const result = await save(true);
    assert.equal(result.requests, 2);
    assert.equal(result.sent.actual_expense_date, '2026-11-22');
    assert.equal(result.date, '2026-11-22');
    assert.equal(result.closed, true);
});
test('declining a date change leaves the expense unsaved and modal open', async () => {
    const result = await save(false);
    assert.equal(result.requests, 1);
    assert.equal(result.date, '2026-01-01');
    assert.equal(result.closed, false);
});
