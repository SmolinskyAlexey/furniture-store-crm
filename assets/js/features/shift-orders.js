function viewOrder(orderId) {

    fetch('/ajax/orders/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=get_order&id=' + encodeURIComponent(orderId)
    })

        .then(response => response.text())
        .then(html => {
            document.getElementById('modalContainer').innerHTML = html;
            document.getElementById('currentOrderModal').style.display = 'block';
        })

        .catch(console.error);

}



function getShiftsOrders() {

}



function registerOrderPaymentInShift(orderId, amount, comment = '') {
    fetch('/ajax/shifts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            action: 'add_cash_from_order',
            order_id: orderId,
            amount: amount,
            comment: comment
        })
    })
        .then(r => r.json())
        .then(json => {
            if (json.saved) {
                console.log('Кассовая операция зарегистрирована');
            } else {
                console.warn('Ошибка при сохранении движения по смене');
            }
        })
        .catch(console.error);
}




function saveOrder(orderData) {
    fetch('/ajax/shifts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=get_current_shift_id'
    })
    .then(async r => {
        const contentType = r.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return r.json();
        } else {
            const text = await r.text();
            alert('Ответ сервера смен не в формате JSON:\n\n' + text);
            throw new Error('Ответ сервера смен не JSON');
        }
    })
    .then(json => {
        if (!json.shift_id) {
            alert("Нет активной смены!");
            return;
        }

        orderData.shift_id = json.shift_id;

        return fetch('/ajax/orders/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'create_order',
                data: orderData
            })
        });
    })
    .then(async r => {
        if (!r) return; // если нет смены

        const contentType = r.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return r.json();
        } else {
            const text = await r.text();
            alert('Ответ сервера заказов не в формате JSON:\n\n' + text);
            throw new Error('Ответ сервера заказов не JSON');
        }
    })
    .then(response => {
        if (!response) return;

        if (response.success) {
            registerOrderPaymentInShift(response.order_id, orderData.total_sum);
            closeNewOrderModal();
        } else {
            alert('Ошибка при создании заказа');
        }
    })
    .catch(error => {
        alert('Ошибка: ' + error.message);
    });
}




// Заказы сегодняшних смен на главной + плитки дня (только отображение; данные — те же, что и раньше)
const shiftOrdersEsc = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shiftOrdersMoney = (value) => (Number(value) || 0) === 0 ? '<span class="muted">—</span>' : `<span class="num">${Math.round(Number(value)).toLocaleString('ru-RU')}&nbsp;₴</span>`;
const shiftOrdersStatusClass = (name) => {
    const s = String(name || '').toLowerCase();
    if (/отмен|удал/.test(s)) return ' is-cancel';
    if (/заверш|оплач|выполн|выдан|достав/.test(s)) return ' is-done';
    if (/брон|ожид|предоплат/.test(s)) return ' is-hold';
    return '';
};

function renderShiftKpis(list) {
    const box = document.querySelector('#home_kpis');
    if (!box) return;
    const num = (v) => Number(v) || 0;
    const fmt = (v) => Math.round(v).toLocaleString('ru-RU') + '&nbsp;₴';
    let sales = 0, paid = 0, debt = 0, debtors = 0, delivery = 0;
    list.forEach((o) => {
        sales += num(o.total_amount_income ?? o.total);
        paid += num(o.prepay) + num(o.prepay_2) + num(o.postpay) + num(o.postpay2);
        if (num(o.total_amount_debt) > 0) { debt += num(o.total_amount_debt); debtors++; }
        if (o.delivery_date) delivery++;
    });
    const n = list.length;
    const ordersWord = (k) => { const a = k % 100, b = k % 10; return (a > 10 && a < 20) ? 'заказам' : (b === 1 ? 'заказу' : 'заказам'); };
    box.innerHTML = `
        <div class="home-kpi"><small>Заказов за сегодня</small><b>${n}</b><span>${delivery ? `${delivery} с доставкой` : 'по всем салонам'}</span></div>
        <div class="home-kpi"><small>Продажи</small><b>${fmt(sales)}</b><span>сумма заказов</span></div>
        <div class="home-kpi"><small>Внесено клиентами</small><b>${fmt(paid)}</b><span>предоплаты и доплаты</span></div>
        <div class="home-kpi${debt > 0 ? ' is-debt' : ''}"><small>Долг клиентов</small><b>${fmt(debt)}</b><span>${debtors ? `по ${debtors} ${ordersWord(debtors)}` : 'долгов нет'}</span></div>`;
    box.hidden = false;
}

function loadCurrentShiftOrders() {
    const warehouse_select = document.querySelector("#select-warehouse");
    let warehouse_id = 'all';
    if (warehouse_select) {
        // Обновление списка при выборе салона (обработчик — один раз)
        if (!warehouse_select.dataset.bound) {
            warehouse_select.dataset.bound = '1';
            warehouse_select.addEventListener('change', () => loadCurrentShiftOrders());
        }
        warehouse_id = warehouse_select.value || 'all';
    }
    fetch('/ajax/shifts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=get_orders_for_current_shift&warehouse_id=' + encodeURIComponent(warehouse_id)
    })

        .then(r => r.json())
        .then(data => {
            const tbody = document.querySelector('#current_shift_orders_table tbody');
            if (!tbody) return;
            const cols = document.querySelectorAll('#current_shift_orders_table thead th').length || 9;
            const list = Array.isArray(data.list) ? data.list : Object.values(data.list || {});
            const title = document.querySelector('#current_shift_orders_count');
            if (title) title.innerHTML = `Заказы за сегодня <span class="badge-count">${list.length}</span>`;
            renderShiftKpis(list);

            if (!list.length) {
                tbody.innerHTML = `<tr><td colspan="${cols}" class="table-empty"><i class="fas fa-receipt"></i>Сегодня заказов пока нет</td></tr>`;
                return;
            }

            tbody.innerHTML = list.map(order => {
                const products = Array.isArray(order.products) ? order.products : Object.values(order.products || {});
                const photos = products.flatMap(product => (Array.isArray(product.images) ? product.images : Object.values(product.images || {})))
                    .map(image => image && (image.preview || image.full)).filter(Boolean)
                    .map(url => `<img src="${shiftOrdersEsc(url)}" alt="" loading="lazy">`).join('');
                const debt = Number(order.total_amount_debt) || 0;
                const prepay = (Number(order.prepay) || 0) + (Number(order.prepay_2) || 0);
                const postpay = (Number(order.postpay) || 0) + (Number(order.postpay2) || 0);
                const editTitle = order.isEditable ? 'Редактировать' : 'Просмотр';
                return `<tr data-order-id="${Number(order.id)}">
                <td><span class="order-no row-link" title="Открыть заказ">#${Number(order.id)}</span><div class="p-sub num">${shiftOrdersEsc(order.created_at)}</div></td>
                <td>${shiftOrdersEsc(order.client?.name || '—')}<div class="p-sub">${shiftOrdersEsc(order.client_info || '')}</div></td>
                <td><div class="p-name">${shiftOrdersEsc(products.map(product => product.name).join(', ') || '—')}</div>${photos ? `<div class="photos-preview">${photos}</div>` : ''}</td>
                <td class="num">${shiftOrdersMoney(prepay)}</td>
                <td class="num">${shiftOrdersMoney(postpay)}</td>
                <td class="comment-cell">${order.comment ? shiftOrdersEsc(order.comment) : '<span class="muted">—</span>'}</td>
                <td class="total-status-cell">
                    <div class="total-status-wrapper">
                        <strong class="num">${Math.round(Number(order.total) || 0).toLocaleString('ru-RU')}&nbsp;₴</strong>
                        ${debt > 0 ? `<span class="order-debt">долг ${Math.round(debt).toLocaleString('ru-RU')}&nbsp;₴</span>` : ''}
                        <span class="status-badge${shiftOrdersStatusClass(order.status)}">${shiftOrdersEsc(order.status)}</span>
                    </div>
                </td>
                ${order.shift ? `<td>${shiftOrdersEsc(order.warehouse_name)}</td>` : ''}
                <td class="actions-cell">
                    <div class="actions-wrapper">
                        <button class="btn btn-icon btn-secondary" onclick="window.showUniversalModal('orders',${Number(order.id)})" title="${editTitle}"></button>
                        <button class="btn btn-icon btn-secondary" onclick="window.generateUniversalPDF('orders', ${Number(order.id)})" title="Печать"></button>
                    </div>
                </td>
            </tr>`;
            }).join('');
        });

}

// Заказы дня на главной: номер заказа или двойной клик по строке открывают заказ (клик по строке — выделение, общий обработчик)
document.addEventListener('click', (event) => {
    const no = event.target.closest('#current_shift_orders_table .order-no');
    if (no) window.showUniversalModal('orders', Number(no.closest('tr').dataset.orderId));
});
document.addEventListener('dblclick', (event) => {
    const row = event.target.closest('#current_shift_orders_table tbody tr[data-order-id]');
    if (!row || event.target.closest('button, a, input, select, textarea')) return;
    window.showUniversalModal('orders', Number(row.dataset.orderId));
});

window.loadCurrentShiftOrders = loadCurrentShiftOrders;


document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/' || window.location.pathname === '/index.php') {

        loadCurrentShiftOrders();

    }
});


// Закрытие окон по Escape

function closeCashInModal() {
    const modal = document.querySelector('#cash-in-modal');
    if (modal) {
        modal.classList.remove('modal--visible');
    }
}

function closeCashOutModal() {
    const modal = document.querySelector('#cash-out-modal');
    if (modal) {
        modal.classList.remove('modal--visible');
    }
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeShiftModal();
        closeFiltersModal();
    }
});
