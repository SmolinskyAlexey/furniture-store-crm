window.SuppliersTemplates = class {



    static renderSuppliers (suppliers = []) {



        return suppliers.map(supplier =>{



            return `

            <tr>

                <td><strong>#${supplier.id}</strong></td>

                <td>${supplier.name}</td>

                <td>${supplier.phone}</td>

                <td>${supplier.email}</td>

                <td>${supplier.comment}</td>

                <td>${supplier.group_id}</td>

                <td>${supplier.created_at}</td>

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