/**

 * CRM Suppliers Wizard - Модуль создания заказов v2.1

 * Исправлена архитектура, убраны дубли, улучшен UX

 */

class SuppliersWizard {
    constructor() { 
        this.isLoading = false;

        //пагинация (Скопировано из order. Делаю по-примеру)
        this.cardsPerPage = 5;
        this.currentSuppliersPage = 1;

        this.state = {};
        this.cache = {};
        this.cache.filter = {};//для фильтров поиска
        this.init();
    }


    async init() {

        const suppliersPage = document.getElementById("suppliers-page");

        if(!suppliersPage){
            return;
        }

        try {
            await this.preloadData();
            this.state.initialized = true;

            //
            this.suppliersPagination();//10.06.25
            this.initializeFilters();
            this.attachSearchListeners();

        } catch (error) {
            console.error("Ошибка инициализации SuppliersWizard:", error);
            this.showError("Ошибка загрузки данных");
        }
    }

    async preloadData() {
        this.showLoading(true);
        let suppliers;
        try {
            [suppliers] = await Promise.all([
                window.queries.getSuppliers(
                    (this.currentSuppliersPage-1) * this.cardsPerPage,
                    this.cardsPerPage,
                    this.cache.filter
                    )
            ]);
            
            this.cache.suppliers = suppliers;
            this.mountSuppliers(suppliers);
        } finally {
            this.showLoading(false);
        }
    }

    mountSuppliers(suppliers){
        const html = window.SuppliersTemplates.renderSuppliers(suppliers.list);
        const table = document.querySelector(".default-table tbody");
        const totalLabel = document.querySelector(".total-count");
        // Монтируем список ордеров
        table.innerHTML = html;
        // Монтируем количество ордеров
        totalLabel.innerHTML = "Всего "+suppliers.total_num+" поставщиков";
        this.suppliersPagination();//обновляем пагинацию
    }

    initializeFilters(){

        // let whFilter = document.querySelector("#select-warehouse");
        // whFilter.addEventListener('change', () => {//при выборе select
        //     this.state.warehouse = whFilter.value;
        //     this.currentClientsPage = 1;
        //     this.cache.filter.warehouse_id = whFilter.value;
        //     this.preloadData(); 
        // });

        // const dateSelector = document.querySelector("#date");
        // dateSelector.addEventListener('change', () => {
        //     this.cache.filter.date = dateSelector.value;
        //     this.currentClientsPage = 1;
        //     this.preloadData();
        // });

    }

    showLoading(show) {
        this.isLoading = show;

        const spinner = document.getElementById("loadingSpinner");

        const modalBody = document.getElementById("modalBody");

        if (spinner && modalBody) {
            if (show) {
                spinner.style.display = "flex";

                modalBody.style.opacity = "1";
            } else {
                spinner.style.display = "none";

                modalBody.style.opacity = "1";
            }
        }
    }

    attachSearchListeners() {

        const root = document.querySelector('.search-bar');

        const searchUI = {
            root,
            input: root.querySelector('.search-input'),
            clearBtn: root.querySelector('.clear-btn'),
            searchBtn: root.querySelector('.search-btn'),
        };

        // Слушатель поля ввода
        searchUI.input.addEventListener('input', () => {
            searchUI.clearBtn.style.display = searchUI.input.value ? 'block' : 'none';
            if(!searchUI.input.value) {
                this.cache.searchedProducts = undefined;
                this.state.searchProduct = "";
                // this.renderStep();
            }
        });

        // Cлушатель на кнопку очистки
        searchUI.clearBtn.addEventListener('click', () => {

            searchUI.input.value = '';
            searchUI.clearBtn.style.display = 'none';
            searchUI.input.focus();
            this.cache.filter.search = '';
            this.cache.searchedProducts = undefined;
            this.state.searchProduct = "";

            this.preloadData();
            //this.renderStep();
        });

        if(this.cache.searchedProducts || this.state.searchProduct){
            searchUI.clearBtn.style.display = 'block';
        }

        const handleSearch = async () => {
            this.cache.filter.search = searchUI.input.value;  
            if(!searchUI.input.value) return;

            this.showLoading(true);
            try {
                const [suppliers] = await Promise.all([
                    window.queries.getSuppliers(
                    0 * this.cardsPerPage,
                    this.cardsPerPage,
                    this.cache.filter)//пользователь на 1 странице при вводе поиска
                ]);
                this.cache.suppliers = suppliers;

                this.currentSuppliersPage = 1;
                this.mountSuppliers(this.cache.suppliers);
            } finally {
                this.showLoading(false);
            }
            
        };

        // Cлушатель на кнопку поиска
        searchUI.searchBtn.addEventListener('click', handleSearch);

        // Cлушатель на Enter
        window.addEventListener("keydown", (e)=> {
             if(e.key === "Enter" && document.activeElement === searchUI.input) handleSearch();
        });
    }

    suppliersPagination(){

        const paginationContainer = document.querySelector(".table-pagination");

        const prevBtn = paginationContainer.querySelector(".prev-arrow");
        const nextBtn = paginationContainer.querySelector(".next-arrow");
        const pageIndicator = paginationContainer.querySelector('.page-indicator');

        const totalSuppliers = this.cache.suppliers?.total_num;

        const totalPages = Math.ceil(totalSuppliers / this.cardsPerPage);

        // Очищение слушателей
        const prev = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(prev, prevBtn);

        prev.addEventListener("click", () => {
                if (this.currentSuppliersPage > 1) {
                    this.currentSuppliersPage = this.currentSuppliersPage - 1;
                    this.preloadData();// this.renderStep();                    
                }
            });

        // Очищение слушателей
        const next = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(next, nextBtn);

        next.addEventListener("click", () => {
                if (this.currentSuppliersPage < totalPages) {
                    this.currentSuppliersPage = this.currentSuppliersPage + 1;

                    this.preloadData();// this.renderStep();
                }

            });

        pageIndicator.innerHTML = `стр ${this.currentSuppliersPage}&nbsp;из ${totalPages}`;

        if(totalPages === 0){
            paginationContainer.classList.add("hidden");
        } else{
            paginationContainer.classList.remove("hidden");
        }

    }
}

// Глобальная инициализация

window.SuppliersWizard = SuppliersWizard;
