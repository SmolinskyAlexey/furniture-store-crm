window.OrdersTemplates = class {

    static money(value) {
        return Math.round(Number(value) || 0).toLocaleString('ru-RU') + '&nbsp;₴';
    }

    // Только внесённые платежи, полоса «оплачено из суммы», долг отдельной строкой
    static renderPayments(order) {
        const lines = [
            ['Предоплата', order.prepay, order.pay_method_name],
            ['Предоплата 2', order.prepay_2, order.pay_method_name_2],
            ['Доплата', order.postpay, order.pay_method_postpay_name],
            ['Доплата 2', order.postpay2, order.pay_method_postpay2_name],
        ].filter(([, sum]) => Number(sum) > 0);
        const services = Number(order.services_pay) || 0;

        const paid = lines.reduce((acc, [, sum]) => acc + Number(sum), 0);
        const debt = Number(order.residual) || 0;
        const base = paid + Math.max(debt, 0);
        const percent = base > 0 ? Math.min(100, Math.round(paid / base * 100)) : 0;

        let html = `<div class="order-pay">`;
        html += `<div class="order-pay-sum">Оплачено <b class="num">${this.money(paid)}</b>${base > 0 ? ` из <span class="num">${this.money(base)}</span>` : ''}</div>`;
        if (base > 0) html += `<div class="order-pay-bar"><span style="width:${percent}%"></span></div>`;
        html += lines.map(([title, sum, method]) =>
            `<div class="order-pay-line">${title}: <span class="num">${this.money(sum)}</span>${method ? ` <small>${method}</small>` : ''}</div>`
        ).join('');
        if (services > 0) {
            html += `<div class="order-pay-line">Оплата доставки: <span class="num">${this.money(services)}</span>${order.payment_method_services_name ? ` <small>${order.payment_method_services_name}</small>` : ''}</div>`;
        }
        if (debt > 0) html += `<div class="order-pay-debt">Долг <span class="num">${this.money(debt)}</span></div>`;
        else if (debt < 0) html += `<div class="order-pay-debt">Переплата <span class="num">${this.money(-debt)}</span></div>`;

        (order.payment_errors || []).forEach(message => {
            const safe = String(message).replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[ch]));
            html += `<div role="alert" style="color:#b91c1c;background:#fef2f2;font-weight:700;padding:4px;margin-top:4px;border-radius:6px">${safe}</div>`;
        });
        return html + `</div>`;
    }

    // «Имя, телефон» → имя, ниже телефон
    static client(info) {
        const text = String(info ?? '');
        const at = text.indexOf(',');
        return at < 0 ? text : `${text.slice(0, at)}<div class="client-contact">${text.slice(at + 1).trim()}</div>`;
    }

    static renderOrders(orders = []) {

        return orders.map(order =>{

            return `
            <tr>
                <td class="order-head">
                    <strong>#${order.id}</strong>
                    <div class="actions-wrapper order-actions">
                        <button class="btn btn-secondary" hidden onclick="window.showUniversalModal('orders',${order.id})"
                         title="${order.isEditable ? 'Редактировать заказ' : 'Просмотр заказа'}">${order.isEditable ? 'Открыть' : 'Просмотр'}</button>
                        <button class="btn btn-secondary" onclick="window.showUniversalModal('refunds', 0, ${order.id})" title="Возврат по заказу"><i class="fa-solid fa-rotate-left"></i></button>
                        <button class="btn btn-secondary" onclick="window.generateUniversalPDF('orders', ${order.id})" title="Накладная (PDF)"><i class="fa-solid fa-print"></i></button>
                    </div>
                    <span class="order-date">${order.created_at}</span>
                </td>
                <td>${this.client(order.client_info)}</td>
                <td>
                    ${order.products?.map(product => {
                            let prodHTML = '<div class=\'product-in-order\'>';
                            let attributesHTML = '';
                            if(product.attributes){
                                for (var i = 0; i < product.attributes.length; i++) {
                                    attributesHTML += '<div class="attr_row"><div class="attr_name">'+product.attributes[i].attribute_name+':&nbsp;</div><div class="attr_value">'+product.attributes[i].attribute_value+'</div></div>\n';
                                }
                            }

                            prodHTML+='<span class="prod-name">'+product.name+'</span><div class="product-attributes">'+attributesHTML+'</div>';
                            prodHTML+='</div>';
                            return prodHTML;
                        }).join(" ")}
                <div class="photos-preview">
                    ${order.products?.map(product => {

						if (!product.images || product.images.length === 0) {return '';}

						return product.images.map(image => {
							// Используем preview если есть, иначе full
							const imageUrl = image.preview || image.full || '';
							return imageUrl ? `<img src="${imageUrl}" />` : '';
						}).join('');

					}).join("")}
                </div>
                </td>
                <td>
                        ${window.OrdersTemplates.renderPayments(order)}
                </td>

                <td class="total-status-cell">
                    <div class="total-status-wrapper">
                        <strong class="num">${order.total.toLocaleString('ru-RU')}&nbsp;₴</strong>
                        <span class="badge badge-${order.status_tech_name}">${order.status}</span>
                    </div>
                </td>

                <td>${order.warehouse_name}<br><span class="muted">${order.manager_name}</span></td>

                <td class="num">
                    ${order.services != 0 ? window.OrdersTemplates.money(order.services) : '<span class="muted">—</span>'}
                </td>

                <td class="comment-cell">${order.comment}</td>
            </tr>
            `

        }).join("");

    };

};
