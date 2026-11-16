window.ClientsTemplates = class {



    static renderClients (clients = []) {



        return clients.map(client =>{



            return `

            <tr>

                <td><strong>#${client.id}</strong></td>

                <td>${ui.v(client.name)}</td>

                <td>${ui.v(client.phone)}</td>

                <td>${ui.v(client.email)}</td>

                <td>${ui.v(client.addressFull)}</td>

                <td>${ui.v(client.comment)}</td>

                <td>${ui.v(client.last_order)}</td>

                <td>${ui.v(client.created_at)}</td>

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