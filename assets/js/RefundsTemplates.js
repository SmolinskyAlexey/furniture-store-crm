window.RefundsTemplates = class {



    static renderRefunds (refunds = []) {



        return refunds.map(refund =>{



            return `

            <tr>

                <td><strong>#${refund.id}</strong></td>

                <td>${ui.v(refund.order_id)}</td>

                <td>${ui.v(refund.product_ids)}</td>

                <td>${ui.v(refund.reason)}</td>

                <td>${ui.name(refund.type)}</td>

                <td>${ui.v(refund.comment)}</td>

                <td>${ui.v(refund.warehouse_id)}</td>

                 <td>${ui.money(refund.total_refund_amount)}</td>

                <td>${ui.v(refund.created_at)}</td>


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