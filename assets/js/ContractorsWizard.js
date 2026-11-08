class ContractorsWizard extends CRMListPage {
    constructor() {
        super({
            rootId: "contractors-page",
            pageKey: "currentContractorsPage",
            cacheKey: "contractors",
            query: "getContractors",
            mount: "mountContractors"
        });
        this.ready = this.init();
    }

    mountContractors(contractors) {
        const html = window.ContractorsTemplates.renderContractors(contractors.list);
        const table = this.root.querySelector(".default-table tbody");
        const totalLabel = this.root.querySelector(".total-count");
        table.innerHTML = html;
        totalLabel.innerHTML = "Всего " + contractors.total_num + " подрядчиков";
        this.contractorsPagination();
    }

    contractorsPagination() { this.updatePagination(); }
}

window.ContractorsWizard = ContractorsWizard;