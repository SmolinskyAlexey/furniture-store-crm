window.ShiftsTemplates = class {



    static renderShifts (shifts = []) {



        return shifts.map(shift =>{



            return `

            <tr>

                <td><strong>#${shift.id}</strong></td>

                <td>${ui.v(shift.warehouse_id)}</td>

                <td>${shift.closed_at && shift.closed_at !== 'null' ? shift.closed_at : '<span class="badge badge-in_work">Открыта</span>'}</td>

                <td>${ui.money(shift.start_cash)}</td>

                <td>${ui.money(shift.end_cash)}</td>

                <td>${ui.v(shift.start_comment)}</td>

                <td>${ui.v(shift.end_comment)}</td>

                <td>${ui.v(shift.created_at)}</td>

                <td>${ui.v(shift.updated_at)}</td>

                <td class="actions-cell">
                    
                    <div class="actions-wrapper">
                   
                            <button class="btn btn-icon btn-secondary" onclick="window.showUniversalModal(\'shifts\', \'${shift.id}\')" title="Просмотр">👁️</button>
                    
                    </div>
                    
                </td>

            </tr>

            `



        }).join("");



    };



};