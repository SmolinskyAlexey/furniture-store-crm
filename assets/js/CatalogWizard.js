class CatalogWizard extends CRMListPage {

    constructor() {
        super({
            rootId: "catalogPage",
            pageKey: "currentProductsPage",
            cacheKey: "products",
            mount: "mountCatalog"
        });
        this.state.inStock = true;
        this.state.warehouse = null;
        this.ready = this.init();
    }

    async init() {

        const ordersPage = document.getElementById("catalogPage");
        this.root = ordersPage;

        if (!ordersPage) {return;}

        try {
            let whFilter = document.querySelector("#select-warehouse");
            this.state.warehouse = whFilter?.value ?? null;

            await this.preloadData();
            this.state.initialized = true;

            this.initializeFilters();
            this.attachSearchListeners();
            this.productsPagination();

        } catch (error) {
            console.error("Ошибка инициализации CatalogWizard:", error);
            this.showError("Ошибка загрузки данных");
        }
    }

    loadPage() {
        const offset = (this.currentProductsPage - 1) * this.cardsPerPage;
        if (!this.state.searchProduct && (!this.state.currentCategory || this.state.currentCategory == 'all') && !this.state.warehouse && !this.state.inStock) {
            return window.queries.getProducts(offset, this.cardsPerPage, 'all_products');
        }
        return window.queries.searchProductsQuery(this.state.currentCategory, this.state.searchProduct, offset, this.cardsPerPage, {
            warehouse_id: this.state.warehouse, inStock: this.state.inStock,
            only_deleted: this.state.only_deleted, only_negative: this.state.only_negative
        });
    }

    setSearch(value) { this.state.searchProduct = value; }

    mountCatalog(products) {

        const html       = window.CatalogTemplates.renderCatalog(products.list, products.allow_edit);
        const table      = this.root.querySelector(".default-table tbody");
        const totalLabel = this.root.querySelector(".total-count");

        table.innerHTML = html;

        totalLabel.innerHTML = `Всего ${products.total_num}&nbsp;товаров`;

		this.productsPagination();

    }

    initializeFilters() {

        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const category = tab.getAttribute('data-category');

                this.state.currentCategory = category;
                this.currentProductsPage = 1;
                this.preloadData();

            });

        });

        let whFilter = document.querySelector("#select-warehouse");
        this.state.warehouse = whFilter.value;

        whFilter?.addEventListener('change', () => {
            this.state.warehouse = whFilter.value;
            this.currentProductsPage = 1;
            this.preloadData();
        });

        let categoryFilter = document.querySelector("#select-category");
        categoryFilter?.addEventListener('change', () => {
            this.state.currentCategory = categoryFilter.value;
            this.currentProductsPage = 1;
            this.preloadData();
        });

        let inStockFilter = document.querySelector("#in-stock");
        inStockFilter?.addEventListener('change', () => {
            this.state.inStock = inStockFilter.checked;
            this.currentProductsPage = 1;
            this.preloadData();
        });

        let onlyDeletedFilter = document.querySelector("#show-only-deleted");
        onlyDeletedFilter?.addEventListener('change', () => {
            this.state.only_deleted = onlyDeletedFilter.checked;
            this.currentProductsPage = 1;
            this.preloadData();
        });

        let onlyNegativeFilter = document.querySelector("#show-only-negative");
        onlyNegativeFilter?.addEventListener('change', () => {
            this.state.only_negative = onlyNegativeFilter.checked;
            this.currentProductsPage = 1;
            this.preloadData();
        });

    }

    productsPagination() { this.updatePagination(); }

}

window.CatalogWizard = CatalogWizard;
