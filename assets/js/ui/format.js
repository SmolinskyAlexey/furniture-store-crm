// Отображение значений в таблицах: пусто вместо null, суммы в ₴, русские названия кодов
window.ui = {
    v(value) {
        return (value === null || value === undefined || value === 'null' || value === '') ? '<span class="muted">—</span>' : value;
    },
    money(value) {
        if (value === null || value === undefined || value === '' || value === 'null') return '<span class="muted">—</span>';
        const n = Number(value);
        if (!Number.isFinite(n)) return value;
        return `<span class="num">${(n < 0 ? '−' : '') + Math.abs(Math.round(n)).toLocaleString('ru-RU')}&nbsp;₴</span>`;
    },
    names: {
        money: 'Деньги', exchange: 'Обмен',
        pending: 'В обработке', received: 'Принят', new: 'Новая', canceled: 'Отменена', cancelled: 'Отменена',
    },
    name(code) {
        return this.names[code] || this.v(code);
    },
    count(n, one, few, many) {
        const a = Math.abs(n) % 100, b = a % 10;
        const word = (a > 10 && a < 20) ? many : (b === 1 ? one : (b >= 2 && b <= 4 ? few : many));
        return `Всего ${n} ${word}`;
    },
};
