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

        totalLabel.innerHTML = ui.count(suppliers.total_num,'поставщик','поставщика','поставщиков');
        this.suppliersPagination();
    }

    suppliersPagination() { this.updatePagination(); }
}

window.SuppliersWizard = SuppliersWizard;
