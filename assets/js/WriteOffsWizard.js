class WriteOffsWizard extends CRMListPage {
    constructor() {
        super({
            rootId: "writeoffs-page",
            pageKey: "currentWriteOffsPage",
            cacheKey: "writeOffs",
            query: "getWriteOffs",
            mount: "mountWriteOffs"
        });
        this.ready = this.init();
    }

    mountWriteOffs(writeOffs) {
        const html = window.WriteOffsTemplates.renderWriteOffs(writeOffs.list);
        const table = this.root.querySelector(".default-table tbody");
        const totalLabel = this.root.querySelector(".total-count");
        table.innerHTML = html;
        totalLabel.innerHTML = "Всего " + writeOffs.total_num + " списаний";
        this.writeOffsPagination();
    }

    writeOffsPagination() { this.updatePagination(); }
}

window.WriteOffsWizard = WriteOffsWizard;