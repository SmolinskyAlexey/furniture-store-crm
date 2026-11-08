class OrdersWizard extends CRMListPage {
    constructor() {
        super({
            rootId: "ordersPage",
            pageKey: "currentOrdersPage",
            cacheKey: "orders",
            mount: "mountOrders"
        });
        this.ready = this.init();
    }

    loadPage() {
        return window.queries.searchOrdersQuery(this.cache.search, this.cache.filter,
            (this.currentOrdersPage - 1) * this.cardsPerPage, this.cardsPerPage);
    }

    setSearch(value) { this.cache.search = value; }

    mountOrders(orders){
        const html = window.OrdersTemplates.renderOrders(orders.list);
        const table = this.root.querySelector(".orders-table tbody");
        const totalLabel = this.root.querySelector(".total-count");

        table.innerHTML = html;

        totalLabel.innerHTML = "Всего "+orders.total_num+" заказов";
        this.ordersPagination();
    }

    initializeFilters(){

        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const category = tab.getAttribute('data-category');

                this.cache.filter.status_id = category;
                this.currentOrdersPage = 1;
                this.preloadData();

            });
        });
        
        let statusesFilter = document.querySelector("#statuses");
        statusesFilter?.addEventListener('change', () => {
            this.cache.filter.status_id = statusesFilter.value;
            this.currentOrdersPage = 1;
            this.preloadData(); 
        });

        let pmFilter = document.querySelector("#select-pay_method");
        pmFilter?.addEventListener('change', () => {
            this.state.pay_method = pmFilter.value;
            this.currentOrdersPage = 1;
            this.cache.filter.pay_method = pmFilter.value;
            this.preloadData(); 
        });

        let pmPostpayFilter = document.querySelector("#select-pay_method_postpay");
        pmPostpayFilter?.addEventListener('change', () => {
            this.state.pay_method_postpay = pmPostpayFilter.value;
            this.currentOrdersPage = 1;
            this.cache.filter.pay_method_postpay = pmPostpayFilter.value;
            this.preloadData(); 
        });

        let whFilter = document.querySelector("#select-warehouse");
        whFilter?.addEventListener('change', () => {
            this.state.warehouse = whFilter.value;
            this.currentOrdersPage = 1;
            this.cache.filter.warehouse_id = whFilter.value;
            this.preloadData(); 
        });

        let managerFilter = document.querySelector("#select-manager");
        managerFilter?.addEventListener('change', () => {
            this.state.manager_id = managerFilter.value;
            this.currentOrdersPage = 1; 
            this.cache.filter.manager_id = managerFilter.value;
            this.preloadData();
        });

        const dateSelector = document.querySelector("#date");
        dateSelector?.addEventListener('change', () => {
            this.cache.filter.date = dateSelector.value;
            this.currentOrdersPage = 1;
            this.preloadData();
        });
        let onlyDeletedFilter = document.querySelector("#show-only-deleted");
        onlyDeletedFilter?.addEventListener('change', () => {
            this.cache.filter.only_deleted = onlyDeletedFilter.checked;
            this.currentOrdersPage = 1;
            this.preloadData(); 
        });

    }

    ordersPagination() { this.updatePagination(); }
}

window.OrdersWizard = OrdersWizard;
