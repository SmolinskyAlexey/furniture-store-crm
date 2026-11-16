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
        totalLabel.innerHTML = ui.count(contractors.total_num,'контрагент','контрагента','контрагентов');
        this.contractorsPagination();
    }

    contractorsPagination() { this.updatePagination(); }
}

window.ContractorsWizard = ContractorsWizard;