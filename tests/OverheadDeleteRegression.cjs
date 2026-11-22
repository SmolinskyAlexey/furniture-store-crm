const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

async function run(result) {
    const sent = [];
    const notices = [];
    let closed = false;
    class FakeFormData { append(k, v) { sent.push([k, v]); } }
    const context = {
        window: {closeUniversalModal() { closed = true; }, location: {reload() {}}},
        document: {querySelector: () => ({value: '7'})},
        confirm: () => true,
        fetch: async () => ({ok: true, json: async () => result}),
        FormData: FakeFormData,
        showNotification: (...args) => notices.push(args),
        setTimeout: () => {},
    };
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets/js/features/persistence.js'), 'utf8'), context);
    await context.window.universalHandleObjectDelete('overhead_expenses', 42);
    return {sent, notices, closed};
}
test('delete sends the expense version and keeps the modal open on a cash error', async () => {
    const result = await run({status: 'error', error: 'Нет открытой смены'});
    assert.deepEqual(result.sent, [['action', 'delete'], ['item_id', 42], ['cash_version', '7']]);
    assert.equal(result.closed, false);
    assert.equal(result.notices[0][0], 'Нет открытой смены');
});
test('delete closes the modal after server success', async () => {
    const result = await run({status: 'ok'});
    assert.equal(result.closed, true);
});
