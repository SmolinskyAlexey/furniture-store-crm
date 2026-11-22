const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const card = fs.readFileSync(require('node:path').join(__dirname, '../Tpl/cards/order_card.php'), 'utf8');
const handler = card.match(/onclick="(event\.preventDefault\(\); if \(this\.dataset\.saving\)[^"]+)"/)[1]
    .replace(/\\'/g, "'")
    .replace(/' \.(.*?)\. '/, '0');
let resolveSave;
let calls = 0;
let receivedEvent;
const window = { universalHandleObjectCreateOrUpdate(type, id, event) {
    calls++;
    receivedEvent = event;
    return new Promise(resolve => { resolveSave = resolve; });
} };
const click = new Function('window', 'event', handler);
const button = { dataset: {} };
const event = { target: button, preventDefault() {} };
click.call(button, window, event);
click.call(button, window, event);
assert.equal(calls, 1, 'A second click while saving must not submit');
assert.equal(receivedEvent, event, 'The save button event reaches the shared handler');
resolveSave();
setImmediate(() => {
    click.call(button, window, event);
    assert.equal(calls, 2, 'A new attempt is possible after completion');
    console.log('PASS: order save suppresses concurrent clicks and passes the save button event');
});
