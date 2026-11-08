class RefundsWizard extends CRMListPage {
    constructor() {
        super({
            rootId: "refunds-page",
            pageKey: "currentRefundsPage",
            cacheKey: "refunds",
            query: "searchRefundsQuery",
            mount: "mountRefunds"
        });
        this.ready = this.init();
    }

    mountRefunds(refunds){
        const html = window.RefundsTemplates.renderRefunds(refunds.list);
        const table = this.root.querySelector(".default-table tbody");
        const totalLabel = this.root.querySelector(".total-count");

        table.innerHTML = html;

        totalLabel.innerHTML = "Всего "+refunds.total_num+" заказов";
        this.refundsPagination();
    }

    initializeFilters(){

        let whFilter = document.querySelector("#select-warehouse");
        whFilter?.addEventListener('change', () => {
            this.state.warehouse = whFilter.value;
            this.currentRefundsPage = 1;
            this.cache.filter.warehouse_id = whFilter.value;
            this.preloadData(); 
        });

        const dateSelector = document.querySelector("#date");
        if(dateSelector){
            dateSelector?.addEventListener('change', () => {
                this.cache.filter.date = dateSelector.value;
                this.currentRefundsPage = 1;
                this.preloadData();
            });
        }
    }

    refundsPagination() { this.updatePagination(); }
}

window.RefundsWizard = RefundsWizard;
