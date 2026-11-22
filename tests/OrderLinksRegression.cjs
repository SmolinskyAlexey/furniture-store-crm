const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const context = vm.createContext({window: {}, ui: {v: x => x ?? '—', name: x => x, money: x => x}, LANGS: {get: () => 'Открыть заказ'}});
for (const file of ['SupplierRequestsTemplates.js', 'RefundsTemplates.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets/js', file), 'utf8'), context);
}
test('supplier request has an independent order link; unlinked requests have no order action', () => {
    const render = context.window.SupplierRequestsTemplates.renderSupplierRequests;
    const html = render([{id: 1, order_id: 817, order_html_info: '№ 817', products: []}]);
    assert.match(html, /<a href="#" class="row-link"/);
    assert.match(html, /stopPropagation\(\);window\.showUniversalModal\('orders',817\)/);
    assert.doesNotMatch(render([{id: 2, order_id: 0, products: []}]), /showUniversalModal\('orders'/);
});
test('refund order link displays escaped date and status and does not invoke row action', () => {
    const render = context.window.RefundsTemplates.renderRefunds;
    const html = render([{id: 1, order_id: 753, order_created_date: '22.11.2026', order_status: '<В работе>'}]);
    assert.match(html, /stopPropagation\(\);window\.showUniversalModal\('orders',753\)/);
    assert.match(html, /22\.11\.2026/);
    assert.match(html, /&lt;В работе&gt;/);
    assert.doesNotMatch(render([{id: 2, order_id: 0}]), /showUniversalModal\('orders'/);
});
