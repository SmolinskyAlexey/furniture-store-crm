class SupplierRequestsWizard extends CRMListPage {
    constructor() {
        super({
            rootId: "supplier-requests-page",
            pageKey: "currentSupplierRequestsPage",
            cacheKey: "supplierRequests",
            query: "getSupplierRequests",
            mount: "mountSupplierRequests"
        });
        this.ready = this.init();
    }

    mountSupplierRequests(supplierRequests){
        const html = window.SupplierRequestsTemplates.renderSupplierRequests(supplierRequests.list);
        const table = this.root.querySelector(".default-table tbody");
        const totalLabel = this.root.querySelector(".total-count");

        table.innerHTML = html;

        totalLabel.innerHTML = "Всего "+supplierRequests.total_num+" запросов";
        this.supplierRequestsPagination();
    }

    initializeFilters(){

        let statusFilter = document.querySelector("#select-status");
        statusFilter?.addEventListener('change', () => {
            this.state.status = statusFilter.value;
            this.currentSupplierRequestsPage = 1;
            this.cache.filter.status = statusFilter.value;
            this.preloadData(); 
        }); 
        let onlyDeletedFilter = document.querySelector("#show-only-deleted");
        onlyDeletedFilter?.addEventListener('change', () => {
            this.state.only_deleted = onlyDeletedFilter.checked;
            this.currentSupplierRequestsPage = 1;
            this.cache.filter.only_deleted = onlyDeletedFilter.checked;
            this.preloadData(); 
        });

    }

    supplierRequestsPagination() { this.updatePagination(); }
}

window.SupplierRequestsWizard = SupplierRequestsWizard;
 