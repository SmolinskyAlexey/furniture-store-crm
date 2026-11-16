class ClientsWizard extends CRMListPage {
    constructor() {
        super({
            rootId: "clients-page",
            pageKey: "currentClientsPage",
            cacheKey: "clients",
            query: "getClients",
            mount: "mountClients"
        });
        this.ready = this.init();
    }

    mountClients(clients){
        const html = window.ClientsTemplates.renderClients(clients.list);
        const table = this.root.querySelector(".default-table tbody");
        const totalLabel = this.root.querySelector(".total-count");

        table.innerHTML = html;

        totalLabel.innerHTML = ui.count(clients.total_num,'клиент','клиента','клиентов');
        this.clientsPagination();
    }

    clientsPagination() { this.updatePagination(); }
}

window.ClientsWizard = ClientsWizard;
