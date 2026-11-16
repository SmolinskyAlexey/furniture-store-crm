// Отображение значений в таблицах: пусто вместо null, суммы в ₴, русские названия кодов
window.ui = {
    v(value) {
        return (value === null || value === undefined || value === 'null' || value === '') ? '<span class="muted">—</span>' : value;
    },
    money(value) {
        if (value === null || value === undefined || value === '' || value === 'null') return '<span class="muted">—</span>';
        const n = Number(String(value).replace(/[\s ]/g, '').replace(',', '.'));
        if (!Number.isFinite(n)) return value;
        return `<span class="num">${(n < 0 ? '−' : '') + Math.abs(Math.round(n)).toLocaleString('ru-RU')}&nbsp;₴</span>`;
    },
    names: {
        money: 'Деньги', exchange: 'Обмен', warehouse: 'На склад', delivered: 'Доставлен',
        pending: 'В обработке', 'automatic open': 'Автоматически', 'automatic close': 'Автоматически', received: 'Принят', new: 'Новая', canceled: 'Отменена', cancelled: 'Отменена',
    },
    name(code) {
        return this.names[code] || this.v(code);
    },
    count(n, one, few, many) {
        const a = Math.abs(n) % 100, b = a % 10;
        const word = (a > 10 && a < 20) ? many : (b === 1 ? one : (b >= 2 && b <= 4 ? few : many));
        return `Всего ${n} ${word}`;
    },
    // Остаток «Склад: <b>N</b><br>…» с сервера → бейджи «N шт» (минус красным) и имя склада
    stock(value) {
        if (value === null || value === undefined || value === '' || value === 'null') return this.v(value);
        const badge = (n) => `<span class="stock-badge${n < 0 ? ' is-neg' : (n === 0 ? ' is-zero' : '')}">${String(n).replace('-', '−')}&nbsp;шт</span>`;
        const text = String(value);
        const lines = [...text.matchAll(/([^<>:]+?):\s*<b>\s*(-?\d+(?:[.,]\d+)?)\s*<\/b>/g)];
        if (!lines.length) {
            const n = Number(text);
            return Number.isFinite(n) && text.trim() !== '' ? badge(n) : text;
        }
        return lines.map(m => `<div class="stock-line">${badge(Number(m[2].replace(',', '.')))}<span class="stock-wh">${m[1].trim()}</span></div>`).join('');
    },
    // Телефон: строки таблиц становятся карточками; подпись каждой ячейки — из шапки таблицы
    labelTables(root = document) {
        root.querySelectorAll('.content-area table.table').forEach((table) => {
            const heads = [...table.querySelectorAll(':scope > thead th')].map(th => th.textContent.replace(/\s+/g, ' ').trim());
            if (!heads.length) return;
            table.classList.add('is-cards');
            table.querySelectorAll(':scope > tbody > tr').forEach((tr) => {
                let col = 0;
                [...tr.children].forEach((td) => {
                    const span = td.colSpan || 1;
                    td.setAttribute('data-label', span > 1 ? '' : (heads[col] || ''));
                    col += span;
                });
            });
        });
    },
};

if (typeof document !== 'undefined' && typeof MutationObserver === 'function') {
    const startTableLabels = () => {
        const area = document.querySelector('#contentArea');
        if (!area) return;
        let queued = false;
        const run = () => { queued = false; window.ui.labelTables(area); };
        new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(run); } }).observe(area, { childList: true, subtree: true });
        run();
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startTableLabels);
    else startTableLabels();
}
