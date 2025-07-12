window.InvoicesTemplates = class {
    static renderInvoices(invoices = []) {
        return invoices.map(invoice => {
            return `
            <tr>
                <td><strong>#${invoice.id}</strong></td>
                <td>${invoice.supplier_id}</td>
                <td>${invoice.warehouse_id}</td>
                <td>${invoice.date_received}</td>
                <td>${invoice.total_sum}</td>
                <td>${invoice.is_paid ? 'Оплачен' : 'Не оплачен'}</td>
                <td>${invoice.comment}</td>
                <td>${invoice.manager_id}</td>
                <td>${invoice.created_at}</td>
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