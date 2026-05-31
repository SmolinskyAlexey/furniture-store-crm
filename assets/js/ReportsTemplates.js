window.ReportsTemplates = class {

    static renderMetrics(metrics = {}) {
        return `
            <div class="metric-box">
                <div class="metric-title">Заказов</div>
                <div class="metric-value" id="metric-orders">${metrics.orders_count || 0}</div>
            </div>
            <div class="metric-box">
                <div class="metric-title">Оборот</div>
                <div class="metric-value" id="metric-turnover">${metrics.stock_value || 0}</div>
            </div>
            <div class="metric-box">
                <div class="metric-title">Накл. расходы</div>
                <div class="metric-value" id="metric-overheads">${metrics.overheads_value || 0}</div>
            </div>
            <div class="metric-box">
                <div class="metric-title">Прибыль</div>
                <div class="metric-value" id="metric-profit">${metrics.profit || 0}</div>
            </div>
            <div class="metric-box">
                <div class="metric-title">Возвраты</div>
                <div class="metric-value" id="metric-returns">${metrics.returns_percent || 0}%</div>
            </div>
        `;
    }

    static renderTopManagers(managers = []) {
        if (!managers.length) {
            return `<tr><td><p>Нет данных</p></td></tr>`;
        }
        return managers.map(m => `
            <tr>
                <td>${m.name || ''}</td>
                <td>${m.orders_count || 0}</td>
                <td>${m.orders_sum || 0}</td>
            </tr>
        `).join("");
    }

    static renderTopWarehouses(warehouses = []) {
        if (!warehouses.length) {
            return `<tr><td><p>Нет данных</p></td></tr>`;
        }
        return warehouses.map(w => `
            <tr>
                <td>${w.name || ''}</td>
                <td>${w['Оборот'] || 0}</td>
            </tr>
        `).join("");
    }

    static renderTopProducts(products = []) {
        if (!products.length) {
            return `<tr><td><p>Нет данных</p></td></tr>`;
        }
        return products.map(p => `
            <tr>
                <td>${p.name || ''}</td>
                <td>${p.profit || 0}</td>
            </tr>
        `).join("");
    }

    static renderStockSummary(stock = {}) {
        return `
            <div>Закупочная стоимость: <strong id="stock-cost">${stock.cost || 0}</strong></div>
            <div>Потенциальная выручка: <strong id="stock-revenue">${stock.revenue || 0}</strong></div>
            <div>Потенциальная прибыль: <strong id="stock-profit">${stock.profit || 0}</strong></div>
        `;
    }

};