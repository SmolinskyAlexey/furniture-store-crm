window.RefundsTemplates = class {



    static renderRefunds (refunds = []) {



        return refunds.map(refund =>{



            return `

            <tr>

                <td><strong>#${refund.id}</strong></td>

                <td>${refund.order_id}</td>

                <td>${refund.product_ids}</td>

                <td>${refund.reason}</td>

                <td>${refund.type}</td>

                <td>${refund.comment}</td>

                <td>${refund.warehouse_id}</td>

                 <td>${refund.total_refund_amount}</td>

                <td>${refund.created_at}</td>


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