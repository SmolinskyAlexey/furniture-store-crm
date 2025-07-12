window.StockTransfersTemplates = class {

    static renderStockTransfers(stockTransfers = []) {

        return stockTransfers.map(stockTransfer => {
            let statusText;
            switch (stockTransfer.status) {
                case 'draft': statusText = 'Черновик'; break;
                case 'sent': statusText = 'Перемещено'; break;
                case 'received': statusText = 'Принято'; break;
                case 'cancelled': statusText = 'Отменено'; break;
                default: statusText = stockTransfer.status;
            }
            return `
            <tr>
                <td><strong>#${stockTransfer.id}</strong></td>
                <td>${stockTransfer.from_warehouse_id}</td>
                <td>${stockTransfer.to_warehouse_id}</td>
                <td>${stockTransfer.manager_id}</td>
                <td>${stockTransfer.carrier_id}</td>
                <td>${statusText}</td>
                <td>${stockTransfer.comment}</td>
                <td>${stockTransfer.created_at}</td>
                <td class="actions-cell">
                    <div class="actions-wrapper">
                        <button class="btn btn-icon btn-secondary" onclick="window.showUniversalModal('stock_transfers',${stockTransfer.id})" title="Редактировать">✏️</button>
                    </div>
                </td>
            </tr>
            `;
        }).join("");
    };
};