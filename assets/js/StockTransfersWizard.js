class StockTransfersWizard extends CRMListPage {
    constructor() {
        super({
            rootId: "stocktransfers-page",
            pageKey: "currentStockTransfersPage",
            cacheKey: "stockTransfers",
            query: "getStockTransfers",
            mount: "mountStockTransfers"
        });
        this.ready = this.init();
    }

    mountStockTransfers(stockTransfers) {
        const html = window.StockTransfersTemplates.renderStockTransfers(stockTransfers.list);
        const table = this.root.querySelector(".default-table tbody");
        const totalLabel = this.root.querySelector(".total-count");
        table.innerHTML = html;
        totalLabel.innerHTML = "Всего " + stockTransfers.total_num + " перемещений";
        this.stockTransfersPagination();
    }

    stockTransfersPagination() { this.updatePagination(); }
}

window.StockTransfersWizard = StockTransfersWizard;