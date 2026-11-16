class ShiftsWizard extends CRMListPage {
    constructor() {
        super({
            rootId: "shifts-page",
            pageKey: "currentShiftsPage",
            cacheKey: "shifts",
            query: "searchShiftsQuery",
            mount: "mountShifts"
        });
        this.ready = this.init();
    }

    mountShifts(shifts){
        const html = window.ShiftsTemplates.renderShifts(shifts.list);
        const table = this.root.querySelector(".default-table tbody");
        const totalLabel = this.root.querySelector(".total-count");

        table.innerHTML = html;

        totalLabel.innerHTML = ui.count(shifts.total_num,'смена','смены','смен');
        this.shiftsPagination();
    }

    initializeFilters(){

        let whFilter = document.querySelector("#select-warehouse");
        whFilter?.addEventListener('change', () => {
            this.state.warehouse = whFilter.value;
            this.currentShiftsPage = 1;
            this.cache.filter.warehouse_id = whFilter.value;
            this.preloadData(); 
        });

        const dateSelector = document.querySelector("#created_at");
        dateSelector?.addEventListener('change', () => {
            this.cache.filter.date = dateSelector.value;
            this.currentShiftsPage = 1;
            this.preloadData();
        });

    }

    shiftsPagination() { this.updatePagination(); }
}

window.ShiftsWizard = ShiftsWizard;
