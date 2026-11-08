class OverheadExpenses extends CRMListPage {
    constructor() {
        super({
            rootId: "overhead_expenses-page",
            pageKey: "currentOverheadExpensesPage",
            cacheKey: "overhead_expenses",
            query: "getOverheadExpenses",
            mount: "mountOverheadExpenses"
        });
        this.ready = this.init();
    }

    mountOverheadExpenses(overhead_expenses){
        const html = window.OverheadExpensesTemplates.renderOverheadExpenses(overhead_expenses.list);
        const table = this.root.querySelector(".default-table tbody");
        const totalLabel = this.root.querySelector(".total-count");

        table.innerHTML = html;

        totalLabel.innerHTML = "Всего "+overhead_expenses.total_num+" записей";
        this.overhead_expensesPagination();
    }

    initializeFilters(){

        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const category = tab.getAttribute('data-category');

                this.cache.filter.status_id = category;
                this.currentOverheadExpensesPage = 1;
                this.preloadData();

            });
        });

        let whFilter = document.querySelector("#select-warehouse");
        whFilter?.addEventListener('change', () => {
            this.state.warehouse = whFilter.value;
            this.currentOverheadExpensesPage = 1;
            this.cache.filter.warehouse_id = whFilter.value;
            this.preloadData(); 
        });

        let managerFilter = document.querySelector("#select-service");
        managerFilter?.addEventListener('change', () => {
            this.state.service = managerFilter.value;
            this.currentOverheadExpensesPage = 1;
            this.cache.filter.service = managerFilter.value;
            this.preloadData();
        });

        const dateSelector = document.querySelector("#date");
        dateSelector?.addEventListener('change', () => {
            this.cache.filter.date = dateSelector.value;
            this.currentOverheadExpensesPage = 1;
            this.preloadData();
        });

    }

    overhead_expensesPagination() { this.updatePagination(); }
}

window.OverheadExpenses = OverheadExpenses;
