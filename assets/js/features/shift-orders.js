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




function loadCurrentShiftOrders() {
    let warehouse_select = document.querySelector("#select-warehouse");
    let warehouse_id = 'all';
    if (warehouse_select) {
        //Обновление листа при выборе салона
        warehouse_select.addEventListener('change', function (e) {
            loadCurrentShiftOrders();
        });
        warehouse_id = 0;//warehouse_select.value;
    }
    fetch('/ajax/shifts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=get_orders_for_current_shift&warehouse_id=' + warehouse_id
    })

        .then(r => r.json())
        .then(data => {
            const tbody = document.querySelector('#current_shift_orders_table tbody');
            tbody.innerHTML = ''; // очистка

            if (!data.list || !data.list.length) {
                tbody.innerHTML = '<tr><td colspan="5">Нет заказов</td></tr>';
                return;
            }

            const title = document.querySelector('#current_shift_orders_count');

            title.innerHTML = `Текущие заказы смены (` + data.total_num + `)`;

            data.list.forEach(order => {

                const row = document.createElement('tr');

                row.innerHTML = `
            <tr>
                <td><strong>#${order.id}</strong>  |  ${order.created_at}</td>
                <td>${order.client.name}<br><small>${order.client_info}</small></td>
                <td>
                    ${order.products?.map(product => product.name).join(", ")}
                    <br/>
                    <div class="photos-preview">
                        ${order.products?.map(product => {

                    if (!product.images || product.images.length === 0) { return ''; }

                    return product.images.map(image => {
                        // Используем preview если есть, иначе full
                        const imageUrl = image.preview || image.full || '';
                        return imageUrl ? `<img src="${imageUrl}" />` : '';
                    }).join('');

                }).join("")}
                    </div>
                </td>

                <td>${order.prepay === 0 ? '-' : order.prepay + '&nbsp;<small>₴</small>'}</td>
                <td>${order.postpay === 0 ? '-' : order.postpay + '&nbsp;<small>₴</small>'}</td>
                <td class="comment-cell">${order.comment}</td>

                <td class="total-status-cell">
                    <div class="total-status-wrapper">
                        <strong>${order.total}&nbsp;<small>₴</small></strong>
                        <span class="badge badge-success">${order.status}</span>
                    </div>
                </td>
                `+ (order.shift ? ("<td>" + order.warehouse_name + "</td>") : "") + `
                <td class="actions-cell">
                    <div class="actions-wrapper">

                        <button class="btn btn-icon btn-secondary" onclick="window.showUniversalModal('orders',${order.id})"
                         ${order.isEditable ? `title="Редактировать">✏️` : `title="Просмотр">👁️`}
                        </button>

                        <button class="btn btn-icon btn-secondary" onclick="window.generateUniversalPDF('orders', ${order.id})" title="Печать">📠</button>

                    </div>
                </td>
            </tr>`;

                tbody.appendChild(row);

            });
        });

}

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
