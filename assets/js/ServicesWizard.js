class ServicesWizard extends CRMListPage {
    constructor() {
        super({
            rootId: "services-page",
            pageKey: "currentServicesPage",
            cacheKey: "services",
            query: "getServices",
            mount: "mountServices"
        });
        this.ready = this.init();
    }

    mountServices(services) {
        const html = window.ServicesTemplates.renderServices(services.list);
        const table = this.root.querySelector(".default-table tbody");
        const totalLabel = this.root.querySelector(".total-count");
        table.innerHTML = html;
        totalLabel.innerHTML = "Всего " + services.total_num + " услуг";
        this.servicesPagination();
    }

    servicesPagination() { this.updatePagination(); }
}

window.ServicesWizard = ServicesWizard;