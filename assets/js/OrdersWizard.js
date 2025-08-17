/**

 * CRM Order Wizard - Модуль создания заказов v2.1

 * Исправлена архитектура, убраны дубли, улучшен UX

 */

class OrdersWizard {
    constructor() {
        this.isLoading = false;

        //пагинация (Скопировано из order. Делаю по-примеру)
        this.cardsPerPage = 5;
        this.currentOrdersPage = 1;

        this.state = {};
        this.cache = {};
        this.cache.filter = {};//для фильтров поиска
        this.init();
    }


    async init() {

        const ordersPage = document.getElementById("ordersPage");

        if(!ordersPage){
            return;
        }

        try {
            await this.preloadData();
            this.state.initialized = true;

            //
            this.ordersPagination();//10.06.25
            this.initializeFilters();
            this.attachSearchListeners();

        } catch (error) {
            console.error("Ошибка инициализации OrdersWizard:", error);
            this.showError("Ошибка загрузки данных");
        }
    }

    async preloadData() {
        this.showLoading(true);
        let orders;
        try {
            if(!this.cache.search && !this.cache.filter ){//если нет ничего в поле для поиска и в фильтрах
                [orders] = await Promise.all([
                    window.queries.getOrders((this.currentOrdersPage-1) * this.cardsPerPage, this.cardsPerPage)
                ]);
            }else{//если что-то введено в поиск или есть фильтр
                [orders] = await Promise.all([
                    window.queries.searchOrdersQuery(
                        this.cache.search,
                        this.cache.filter,
                        (this.currentOrdersPage-1) * this.cardsPerPage,
                        this.cardsPerPage)
                ]);
            }
            
            this.cache.orders = orders;
            this.mountOrders(orders);
        } finally {
            this.showLoading(false);
        }
    }

    mountOrders(orders){
        const html = window.OrdersTemplates.renderOrders(orders.list);
        const table = document.querySelector(".orders-table tbody");
        const totalLabel = document.querySelector(".total-count");
        // Монтируем список ордеров
        table.innerHTML = html;
        // Монтируем количество ордеров
        totalLabel.innerHTML = "Всего "+orders.total_num+" заказов";
        this.ordersPagination();//обновляем пагинацию
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

        let pmFilter = document.querySelector("#select-pay_method");
        pmFilter.addEventListener('change', () => {//при выборе select
            this.state.pay_method = pmFilter.value;
            this.currentOrdersPage = 1;
            this.cache.filter.pay_method = pmFilter.value;
            this.preloadData(); 
        });

        let whFilter = document.querySelector("#select-warehouse");
        whFilter.addEventListener('change', () => {//при выборе select
            this.state.warehouse = whFilter.value;
            this.currentOrdersPage = 1;
            this.cache.filter.warehouse_id = whFilter.value;
            this.preloadData(); 
        });

        let managerFilter = document.querySelector("#select-manager");
        managerFilter.addEventListener('change', () => {//при выборе select
            this.state.manager_id = managerFilter.value;
            this.currentOrdersPage = 1; 
            this.cache.filter.manager_id = managerFilter.value;
            this.preloadData();
        });

        const dateSelector = document.querySelector("#date");
        dateSelector.addEventListener('change', () => {
            this.cache.filter.date = dateSelector.value;
            this.currentOrdersPage = 1;
            this.preloadData();
        });

        // -- Свайп по элементам если крыт скрол-бар

        const tabGroup = document.querySelector('.filter-tabs-group');

        let isDown = false;
        let startX;
        let scrollLeft;

        tabGroup.addEventListener('mousedown', (e) => {
            isDown = true;
            tabGroup.classList.add('dragging');
            startX = e.pageX - tabGroup.offsetLeft;
            scrollLeft = tabGroup.scrollLeft;
        });

        tabGroup.addEventListener('mouseleave', () => {
            isDown = false;
            tabGroup.classList.remove('dragging');
        });

        tabGroup.addEventListener('mouseup', () => {
            isDown = false;
            tabGroup.classList.remove('dragging');
        });

        tabGroup.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - tabGroup.offsetLeft;
            const walk = (x - startX) * 1.5; // чувствительность
            tabGroup.scrollLeft = scrollLeft - walk;
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
            this.cache.search = '';
            this.cache.searchedProducts = undefined;
            this.state.searchProduct = "";

            this.preloadData();
            //this.renderStep();
        });

        if(this.cache.searchedProducts || this.state.searchProduct){
            searchUI.clearBtn.style.display = 'block';
        }

        const handleSearch = async () => {
            this.cache.search = searchUI.input.value;  
            if(!searchUI.input.value) return;

            this.showLoading(true);
            try {
                const [orders] = await Promise.all([
                    window.queries.searchOrdersQuery(searchUI.input.value, this.cache.filter, 0, this.cardsPerPage)//пользователь на 1 странице при вводе поиска
                ]);
                this.cache.orders = orders;

                this.currentOrdersPage = 1;
                this.mountOrders(this.cache.orders);
                //this.ordersPagination();//перезагружаем пагинацию (без инициализации слушателей)
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

    ordersPagination(){

        const paginationContainer = document.querySelector(".table-pagination");

        const prevBtn = paginationContainer.querySelector(".prev-arrow");
        const nextBtn = paginationContainer.querySelector(".next-arrow");
        const pageIndicator = paginationContainer.querySelector('.page-indicator');

        const totalOrders = this.cache.orders?.total_num;

        const totalPages = Math.ceil(totalOrders / this.cardsPerPage);

        // Очищение слушателей
        const prev = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(prev, prevBtn);

        prev.addEventListener("click", () => {
                if (this.currentOrdersPage > 1) {
                    this.currentOrdersPage = this.currentOrdersPage - 1;
                    this.preloadData();// this.renderStep();                    
                }
            });

        // Очищение слушателей
        const next = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(next, nextBtn);

        next.addEventListener("click", () => {
                if (this.currentOrdersPage < totalPages) {
                    this.currentOrdersPage = this.currentOrdersPage + 1;

                    this.preloadData();// this.renderStep();
                }

            });

        pageIndicator.innerHTML = `стр ${this.currentOrdersPage}&nbsp;из ${totalPages}`;

        if(totalPages === 0){
            paginationContainer.classList.add("hidden");
        } else{
            paginationContainer.classList.remove("hidden");
        }

    }
}

// Глобальная инициализация

window.OrdersWizard = OrdersWizard;
