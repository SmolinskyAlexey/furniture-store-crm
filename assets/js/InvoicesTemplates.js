window.InvoicesTemplates = class {
    static renderInvoices(invoices = []) {
        return invoices.map(invoice => {
            return `
            <tr>
                <td><strong>#${invoice.id}</strong></td>
                <td>${ui.v(invoice.supplier_id)}</td>
                <td>${ui.v(invoice.warehouse_id)}</td>
                <td>${ui.v(invoice.date_received)}</td>
                <td>${ui.money(invoice.total_sum)}</td>
                <td>${invoice.is_paid ? 'Оплачен' : 'Не оплачен'}</td>
                <td>${ui.v(invoice.comment)}</td>
                <td>${ui.v(invoice.manager_id)}</td>
                <td>${ui.v(invoice.created_at)}</td>
                <td class="actions-cell">
                    <div class="actions-wrapper">
                        <button class="btn btn-icon btn-secondary" onclick="window.showUniversalModal('invoices',${invoice.id})" title="Редактировать">✏️</button>
                    </div>
                </td>
            </tr>
            `;
        }).join("");
    };
};