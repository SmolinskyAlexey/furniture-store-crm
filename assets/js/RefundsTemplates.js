window.RefundsTemplates = class {



    static renderRefunds (refunds = []) {



        return refunds.map(refund =>{



            return `

            <tr>

                <td><strong>#${refund.id}</strong>${refund.created_at ? `<div>${String(refund.created_at).trim().split(/\s+/)[0].replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</div>` : ''}</td>

                <td>${Number(refund.order_id) > 0 ? `<a href="#" class="row-link" title="${LANGS.get('open_order')}" onclick="event.preventDefault();event.stopPropagation();window.showUniversalModal('orders',${Number(refund.order_id)})">№ ${Number(refund.order_id)}</a>${refund.order_created_date ? `<div>${String(refund.order_created_date).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</div>` : ''}${refund.order_status ? `<div>${String(refund.order_status).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</div>` : ''}` : '—'}</td>

                <td>${ui.v(refund.product_ids)}</td>

                <td>${ui.v(refund.reason)}</td>

                <td>${ui.name(refund.type)}</td>

                <td>${ui.v(refund.comment)}</td>

                <td>${ui.v(refund.warehouse_id)}</td>

                 <td>${ui.money(refund.total_refund_amount)}</td>

                <td class="actions-cell">
                    
                    <div class="actions-wrapper">
                   
                        <button class="btn btn-icon btn-secondary" onclick="window.showUniversalModal('refunds',${refund.id})" title="Редактировать">✏️</button>
                    
                    </div>
                    
                </td>

            </tr>

            `



        }).join("");



    };



};
