class SuppliersWizard extends CRMListPage {
    constructor() {
        super({
            rootId: "suppliers-page",
            pageKey: "currentSuppliersPage",
            cacheKey: "suppliers",
            query: "getSuppliers",
            mount: "mountSuppliers"
        });
        this.ready = this.init();
    }

    mountSuppliers(suppliers){
        const html = window.SuppliersTemplates.renderSuppliers(suppliers.list);
        const table = this.root.querySelector(".default-table tbody");
        const totalLabel = this.root.querySelector(".total-count");

        table.innerHTML = html;

        totalLabel.innerHTML = "Всего "+suppliers.total_num+" поставщиков";
        this.suppliersPagination();
    }

    suppliersPagination() { this.updatePagination(); }
}

window.SuppliersWizard = SuppliersWizard;
