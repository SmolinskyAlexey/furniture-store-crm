window.SuppliersTemplates = class {



    static renderSuppliers (suppliers = []) {



        return suppliers.map(supplier =>{



            return `

            <tr>

                <td><strong>#${supplier.id}</strong></td>

                <td>${ui.v(supplier.name)}</td>

                <td>${ui.v(supplier.phone)}</td>

                <td>${ui.v(supplier.email)}</td>

                <td>${ui.v(supplier.comment)}</td>

                <td>${ui.v(supplier.group_id)}</td>

                <td>${ui.v(supplier.created_at)}</td>

                <td class="actions-cell">
                    
                    <div class="actions-wrapper">
                   
                        <button class="btn btn-icon btn-secondary" onclick="window.showUniversalModal('suppliers',${supplier.id})" title="Редактировать">✏️</button>
                    
                    </div>
                    
                </td>

            </tr>

            `



        }).join("");



    };



};