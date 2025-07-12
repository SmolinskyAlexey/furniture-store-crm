/**

 * CRM overhead_expenses Wizard - Модуль создания заказов v2.1

 * Исправлена архитектура, убраны дубли, улучшен UX

 */

class OverheadExpenses {
    constructor() { 
        this.isLoading = false;

        //пагинация (Скопировано из order. Делаю по-примеру)
        this.cardsPerPage = 5;
        this.currentOverheadExpensesPage = 1;

        this.state = {};
        this.cache = {};
        this.cache.filter = {};//для фильтров поиска
        this.init();
    }


    async init() {

        const overhead_expenses = document.getElementById("overhead_expenses-page");

        if(!overhead_expenses){
            return;
        }

        try {
            await this.preloadData();
            this.state.initialized = true;

            //
            this.overhead_expensesPagination();//10.06.25
            this.initializeFilters();
            this.attachSearchListeners();

        } catch (error) {
            console.error("Ошибка инициализации OverheadExpenses:", error);
            this.showError("Ошибка загрузки данных");
        }
    }

    async preloadData() {
        this.showLoading(true);
        let overhead_expenses;
        try {
            [overhead_expenses] = await Promise.all([
                window.queries.getOverheadExpenses(
                    (this.currentOverheadExpensesPage-1) * this.cardsPerPage,
                    this.cardsPerPage,
                    this.cache.filter
                    )
            ]);
            
            this.cache.overhead_expenses = overhead_expenses;
            this.mountOverheadExpenses(overhead_expenses);
        } finally {
            this.showLoading(false);
        }
    }

    mountOverheadExpenses(overhead_expenses){
        const html = window.OverheadExpensesTemplates.renderOverheadExpenses(overhead_expenses.list);
        const table = document.querySelector(".default-table tbody");
        const totalLabel = document.querySelector(".total-count");
        // Монтируем список ордеров
        table.innerHTML = html;
        // Монтируем количество ордеров
        totalLabel.innerHTML = "Всего "+overhead_expenses.total_num+" записей";
        this.overhead_expensesPagination();//обновляем пагинацию
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

        let whFilter = document.querySelector("#select-warehouse");
        whFilter.addEventListener('change', () => {//при выборе select
            this.state.warehouse = whFilter.value;
            this.currentOrdersPage = 1;
            this.cache.filter.warehouse_id = whFilter.value;
            this.preloadData(); 
        });

        let managerFilter = document.querySelector("#select-service");
        managerFilter.addEventListener('change', () => {//при выборе select
            this.state.service = managerFilter.value;
            this.currentOrdersPage = 1; 
            this.cache.filter.service = managerFilter.value;
            this.preloadData();
        });

        const dateSelector = document.querySelector("#date");
        dateSelector.addEventListener('change', () => {
            this.cache.filter.date = dateSelector.value;
            this.currentOrdersPage = 1;
            this.preloadData();
        });

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
                const [overhead_expenses] = await Promise.all([
                    window.queries.getOverheadExpenses(
                    0 * this.cardsPerPage,
                    this.cardsPerPage,
                    this.cache.filter)//пользователь на 1 странице при вводе поиска
                ]);
                this.cache.overhead_expenses = overhead_expenses;

                this.currentOverheadExpenses = 1;
                this.mountOverheadExpenses(this.cache.overhead_expenses);
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

    overhead_expensesPagination(){

        const paginationContainer = document.querySelector(".table-pagination");

        const prevBtn = paginationContainer.querySelector(".prev-arrow");
        const nextBtn = paginationContainer.querySelector(".next-arrow");
        const pageIndicator = paginationContainer.querySelector('.page-indicator');

        const totaloverhead_expenses = this.cache.overhead_expenses?.total_num;

        const totalPages = Math.ceil(totaloverhead_expenses / this.cardsPerPage);

        // Очищение слушателей
        const prev = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(prev, prevBtn);

        prev.addEventListener("click", () => {
                if (this.currentOverheadExpenses > 1) {
                    this.currentOverheadExpenses = this.currentOverheadExpensesPage - 1;
                    this.preloadData();// this.renderStep();                    
                }
            });

        // Очищение слушателей
        const next = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(next, nextBtn);

        next.addEventListener("click", () => {
                if (this.currentOverheadExpensesPage < totalPages) {
                    this.currentOverheadExpensesPage = this.currentOverheadExpensesPage + 1;

                    this.preloadData();// this.renderStep();
                }

            });

        pageIndicator.innerHTML = `стр ${this.currentOverheadExpensesPage}&nbsp;из ${totalPages}`;

        if(totalPages === 0){
            paginationContainer.classList.add("hidden");
        } else{
            paginationContainer.classList.remove("hidden");
        }

    }
}

// Глобальная инициализация

window.OverheadExpenses = OverheadExpenses;
