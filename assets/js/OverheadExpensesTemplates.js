window.OverheadExpensesTemplates = class {



    static renderOverheadExpenses (overheadExpenses = []) {



        return overheadExpenses.map(ovhexp =>{



            return `

            <tr>

                <td><strong>#${ovhexp.id}</strong></td>

                <td>${ovhexp.warehouse_id}</td>

                <td>${ovhexp.date}</td>

                <td>${ovhexp.service_id}</td>

                <td>${ovhexp.amount}</td>

                <td>${ovhexp.comment}</td>

                <td>${ovhexp.created_at}</td>

                <td class="actions-cell">
                    
                    <div class="actions-wrapper">
                   
                        <button class="btn btn-icon btn-secondary" onclick="window.showUniversalModal('overhead_expenses',${ovhexp.id})" title="Редактировать">✏️</button>
                    
                    </div>
                    
                </td>

            </tr>

            `



        }).join("");



    };



};