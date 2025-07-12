/**
 * CRM StockTransfers Wizard - Модуль создания перемещений v2.1
 *
 * Исправлена архитектура, убраны дубли, улучшен UX
 */

class StockTransfersWizard {
    constructor() { 
        this.isLoading = false;

        // Пагинация
        this.cardsPerPage = 5;
        this.currentStockTransfersPage = 1;

        this.state = {};
        this.cache = {};
        this.cache.filter = {};//для фильтров поиска
        this.init();
    }

    async init() {
        const stockTransfersPage = document.getElementById("stocktransfers-page");

        if (!stockTransfersPage) {
            return;
        }

        try {
            await this.preloadData();
            this.state.initialized = true;

            this.stockTransfersPagination();
            this.initializeFilters();
            this.attachSearchListeners();
        } catch (error) {
            console.error("Ошибка инициализации StockTransfersWizard:", error);
            this.showError("Ошибка загрузки данных");
        }
    }

    async preloadData() {
        this.showLoading(true);
        let stockTransfers;
        try {
            [stockTransfers] = await Promise.all([
                window.queries.getStockTransfers(
                    (this.currentStockTransfersPage - 1) * this.cardsPerPage,
                    this.cardsPerPage,
                    this.cache.filter
                )
            ]);
            
            this.cache.stockTransfers = stockTransfers;
            this.mountStockTransfers(stockTransfers);
        } finally {
            this.showLoading(false);
        }
    }

    mountStockTransfers(stockTransfers) {
        const html = window.StockTransfersTemplates.renderStockTransfers(stockTransfers.list);
        const table = document.querySelector(".default-table tbody");
        const totalLabel = document.querySelector(".total-count");
        table.innerHTML = html;
        totalLabel.innerHTML = "Всего " + stockTransfers.total_num + " перемещений";
        this.stockTransfersPagination();
    }

    initializeFilters() {
        // Placeholder for filter initialization
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

        searchUI.input.addEventListener('input', () => {
            searchUI.clearBtn.style.display = searchUI.input.value ? 'block' : 'none';
            if (!searchUI.input.value) {
                this.cache.searchedStockTransfers = undefined;
                this.state.searchStockTransfer = "";
            }
        });

        searchUI.clearBtn.addEventListener('click', () => {
            searchUI.input.value = '';
            searchUI.clearBtn.style.display = 'none';
            searchUI.input.focus();
            this.cache.filter.search = '';
            this.cache.searchedStockTransfers = undefined;
            this.state.searchStockTransfer = "";
            this.preloadData();
        });

        if (this.cache.searchedStockTransfers || this.state.searchStockTransfer) {
            searchUI.clearBtn.style.display = 'block';
        }

        const handleSearch = async () => {
            this.cache.filter.search = searchUI.input.value;  
            if (!searchUI.input.value) return;

            this.showLoading(true);
            try {
                const [stockTransfers] = await Promise.all([
                    window.queries.getStockTransfers(
                        0 * this.cardsPerPage,
                        this.cardsPerPage,
                        this.cache.filter
                    )
                ]);
                this.cache.stockTransfers = stockTransfers;
                this.currentStockTransfersPage = 1;
                this.mountStockTransfers(this.cache.stockTransfers);
            } finally {
                this.showLoading(false);
            }
        };

        searchUI.searchBtn.addEventListener('click', handleSearch);

        window.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && document.activeElement === searchUI.input) handleSearch();
        });
    }

    stockTransfersPagination() {
        const paginationContainer = document.querySelector(".table-pagination");
        const prevBtn = paginationContainer.querySelector(".prev-arrow");
        const nextBtn = paginationContainer.querySelector(".next-arrow");
        const pageIndicator = paginationContainer.querySelector('.page-indicator');

        const totalStockTransfers = this.cache.stockTransfers?.total_num;
        const totalPages = Math.ceil(totalStockTransfers / this.cardsPerPage);

        const prev = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(prev, prevBtn);

        prev.addEventListener("click", () => {
            if (this.currentStockTransfersPage > 1) {
                this.currentStockTransfersPage = this.currentStockTransfersPage - 1;
                this.preloadData();
            }
        });

        const next = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(next, nextBtn);

        next.addEventListener("click", () => {
            if (this.currentStockTransfersPage < totalPages) {
                this.currentStockTransfersPage = this.currentStockTransfersPage + 1;
                this.preloadData();
            }
        });

        pageIndicator.innerHTML = `стр ${this.currentStockTransfersPage} из ${totalPages}`;

        if (totalPages === 0) {
            paginationContainer.classList.add("hidden");
        } else {
            paginationContainer.classList.remove("hidden");
        }
    }
}

window.StockTransfersWizard = StockTransfersWizard;