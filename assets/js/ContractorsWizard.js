// ContractorsWizard.js
/**
 * CRM Contractors Wizard - Модуль управления подрядчиками v1.0
 */

class ContractorsWizard {
    constructor() { 
        this.isLoading = false;

        // Пагинация
        this.cardsPerPage = 10;
        this.currentContractorsPage = 1;

        this.state = {};
        this.cache = {};
        this.cache.filter = {};//для фильтров поиска
        this.init();
    }

    async init() {
        const contractorsPage = document.getElementById("contractors-page");

        if (!contractorsPage) {
            return;
        }

        try {
            await this.preloadData();
            this.state.initialized = true;

            this.contractorsPagination();
            this.initializeFilters();
            this.attachSearchListeners();
        } catch (error) {
            console.error("Ошибка инициализации ContractorsWizard:", error);
            this.showError("Ошибка загрузки данных");
        }
    }

    async preloadData() {
        this.showLoading(true);
        let contractors;
        try {
            [contractors] = await Promise.all([
                window.queries.getContractors(
                    (this.currentContractorsPage - 1) * this.cardsPerPage,
                    this.cardsPerPage,
                    this.cache.filter
                )
            ]);
            
            this.cache.contractors = contractors;
            this.mountContractors(contractors);
        } finally {
            this.showLoading(false);
        }
    }

    mountContractors(contractors) {
        const html = window.ContractorsTemplates.renderContractors(contractors.list);
        const table = document.querySelector(".default-table tbody");
        const totalLabel = document.querySelector(".total-count");
        table.innerHTML = html;
        totalLabel.innerHTML = "Всего " + contractors.total_num + " подрядчиков";
        this.contractorsPagination();
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
                this.cache.searchedContractors = undefined;
                this.state.searchContractor = "";
            }
        });

        searchUI.clearBtn.addEventListener('click', () => {
            searchUI.input.value = '';
            searchUI.clearBtn.style.display = 'none';
            searchUI.input.focus();
            this.cache.filter.search = '';
            this.cache.searchedContractors = undefined;
            this.state.searchContractor = "";
            this.preloadData();
        });

        if (this.cache.searchedContractors || this.state.searchContractor) {
            searchUI.clearBtn.style.display = 'block';
        }

        const handleSearch = async () => {
            this.cache.filter.search = searchUI.input.value;  
            if (!searchUI.input.value) return;

            this.showLoading(true);
            try {
                const [contractors] = await Promise.all([
                    window.queries.getContractors(
                        0 * this.cardsPerPage,
                        this.cardsPerPage,
                        this.cache.filter
                    )
                ]);
                this.cache.contractors = contractors;
                this.currentContractorsPage = 1;
                this.mountContractors(this.cache.contractors);
            } finally {
                this.showLoading(false);
            }
        };

        searchUI.searchBtn.addEventListener('click', handleSearch);

        window.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && document.activeElement === searchUI.input) handleSearch();
        });
    }

    contractorsPagination() {
        const paginationContainer = document.querySelector(".table-pagination");
        const prevBtn = paginationContainer.querySelector(".prev-arrow");
        const nextBtn = paginationContainer.querySelector(".next-arrow");
        const pageIndicator = paginationContainer.querySelector('.page-indicator');

        const totalContractors = this.cache.contractors?.total_num;
        const totalPages = Math.ceil(totalContractors / this.cardsPerPage);

        const prev = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(prev, prevBtn);

        prev.addEventListener("click", () => {
            if (this.currentContractorsPage > 1) {
                this.currentContractorsPage = this.currentContractorsPage - 1;
                this.preloadData();
            }
        });

        const next = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(next, nextBtn);

        next.addEventListener("click", () => {
            if (this.currentContractorsPage < totalPages) {
                this.currentContractorsPage = this.currentContractorsPage + 1;
                this.preloadData();
            }
        });

        pageIndicator.innerHTML = `стр ${this.currentContractorsPage}&nbsp;из ${totalPages}`;

        if (totalPages === 0) {
            paginationContainer.classList.add("hidden");
        } else {
            paginationContainer.classList.remove("hidden");
        }
    }
}

window.ContractorsWizard = ContractorsWizard;