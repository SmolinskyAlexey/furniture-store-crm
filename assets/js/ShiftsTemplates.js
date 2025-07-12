window.ShiftsTemplates = class {



    static renderShifts (shifts = []) {



        return shifts.map(shift =>{



            return `

            <tr>

                <td><strong>#${shift.id}</strong></td>

                <td>${shift.warehouse_id}</td>

                <td>${shift.closed_at}</td>

                <td>${shift.start_cash}&nbsp;uah</td>

                <td>${shift.end_cash}&nbsp;uah</td>

                <td>${shift.start_comment}</td>

                <td>${shift.end_comment}</td>

                <td>${shift.created_at}</td>

                <td>${shift.updated_at}</td>

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