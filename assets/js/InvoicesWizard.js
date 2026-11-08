class InvoicesWizard extends CRMListPage {
    constructor() {
        super({
            rootId: "invoices-page",
            pageKey: "currentInvoicesPage",
            cacheKey: "invoices",
            query: "getInvoices",
            mount: "mountInvoices"
        });
        this.ready = this.init();
    }

    mountInvoices(invoices) {
        const html = window.InvoicesTemplates.renderInvoices(invoices.list);
        const table = this.root.querySelector(".default-table tbody");
        const totalLabel = this.root.querySelector(".total-count");
        table.innerHTML = html;
        totalLabel.innerHTML = "Всего " + invoices.total_num + " счетов";
        this.invoicesPagination();
    }

    invoicesPagination() { this.updatePagination(); }
}

window.InvoicesWizard = InvoicesWizard;