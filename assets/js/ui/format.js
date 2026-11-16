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
    // Кнопка строки, которая открывает карточку записи («Открыть», «Редактировать», «Просмотр»)
    rowOpenButton(tr) {
        if (tr.dataset.orderId) return null; // главная: свой обработчик
        return [...tr.querySelectorAll('button[onclick*="showUniversalModal"]')]
            .find(b => /редакт|просмотр|открыть/i.test(`${b.title || ''} ${b.textContent || ''}`)) || null;
    },
    // Телефон: строки таблиц становятся карточками; подпись каждой ячейки — из шапки таблицы
    labelTables(root = document) {
        root.querySelectorAll('.content-area table.table').forEach((table) => {
            const heads = [...table.querySelectorAll(':scope > thead th')].map(th => th.textContent.replace(/\s+/g, ' ').trim());
            if (!heads.length) return;
            table.classList.add('is-cards');
            table.querySelectorAll(':scope > tbody > tr').forEach((tr) => {
                const canOpen = !!window.ui.rowOpenButton(tr);
                tr.classList.toggle('row-open', canOpen);
                // Номер записи («#804», «№ 12») в первой ячейке — ссылка на запись
                const first = tr.children[0];
                if (canOpen && first && !first.querySelector('.row-link')) {
                    const num = [...first.querySelectorAll('strong, b, span')].find(el => /^\s*(#|№)\s*\d+/.test(el.textContent));
                    if (num) { num.classList.add('row-link'); num.title = 'Открыть'; }
                }
                window.ui.mergeActions(tr);
                let col = 0;
                [...tr.children].forEach((td) => {
                    const span = td.colSpan || 1;
                    td.setAttribute('data-label', span > 1 ? '' : (heads[col] || ''));
                    col += span;
                });
            });
            const merged = table.querySelector(':scope > tbody > tr > td.col-merged');
            table.querySelector(':scope > thead tr > th:last-child')?.classList.toggle('col-merged', !!merged);
        });
    },
    // Последняя колонка «Действия» с одной-двумя кнопками-значками → значки рядом с номером записи
    mergeActions(tr) {
        const cell = tr.lastElementChild;
        const link = tr.children[0]?.querySelector('.row-link');
        if (!cell || cell === tr.children[0] || !cell.classList.contains('actions-cell') || !link) return;
        const box = cell.querySelector(':scope > .actions-wrapper');
        const buttons = box ? box.querySelectorAll('button, a') : [];
        if (!box || !buttons.length || buttons.length > 2 || [...buttons].some(b => /[A-Za-zА-Яа-яЁё]/.test(b.textContent) || /продать/i.test(b.title))) return; // «Продать» в витрине — своя колонка
        link.after(box);
        cell.classList.add('col-merged');
    },
};

// Строки таблиц: клик — выделить строку, двойной клик или клик по номеру записи — открыть
// (открытие = та же кнопка «Открыть»/«Редактировать» этой строки). Ссылки, кнопки, поля и ячейки со своим действием — как раньше.
if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    const rowOf = (event) => event.target.closest?.('.content-area table.table > tbody > tr');
    const ownAction = (event) => event.target.closest('a, button, input, select, textarea, label, [onclick]:not(.row-link)');
    document.addEventListener('click', (event) => {
        const tr = rowOf(event);
        if (!tr || ownAction(event)) return;
        if (event.target.closest('.row-link') && tr.classList.contains('row-open')) {
            window.ui.rowOpenButton(tr)?.click();
            return;
        }
        if (String(window.getSelection?.() || '').trim()) return;
        const was = tr.classList.contains('is-selected');
        tr.closest('tbody').querySelectorAll(':scope > tr.is-selected').forEach(row => row.classList.remove('is-selected'));
        if (!was) tr.classList.add('is-selected');
    });
    document.addEventListener('dblclick', (event) => {
        const tr = rowOf(event);
        if (!tr || !tr.classList.contains('row-open') || ownAction(event)) return;
        window.getSelection?.()?.removeAllRanges?.();
        window.ui.rowOpenButton(tr)?.click();
    });
}

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
