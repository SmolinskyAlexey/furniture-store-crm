window.ClientsTemplates = class {



    static renderClients (clients = []) {



        return clients.map(client =>{



            return `

            <tr>

                <td><strong>#${client.id}</strong></td>

                <td>${client.name}</td>

                <td>${client.phone}</td>

                <td>${client.email}</td>

                <td>${client.addressFull}</td>

                <td>${client.comment}</td>

                <td>${client.last_order}</td>

                <td>${client.created_at}</td>

                <td class="actions-cell">
                    
                    <div class="actions-wrapper">
                   
                        <button class="btn btn-icon btn-secondary" onclick="window.showUniversalModal('clients',${client.id})" title="Редактировать">✏️</button>
                    
                    </div>
                    
                </td>

            </tr>

            `



        }).join("");



    };



};