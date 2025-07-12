/**
 * CRM WriteOffs Wizard - Модуль создания списаний v2.1
 *
 * Исправлена архитектура, убраны дубли, улучшен UX
 */

class WriteOffsWizard {
    constructor() { 
        this.isLoading = false;

        // Пагинация
        this.cardsPerPage = 5;
        this.currentWriteOffsPage = 1;

        this.state = {};
        this.cache = {};
        this.cache.filter = {};//для фильтров поиска
        this.init();
    }

    async init() {
        const writeOffsPage = document.getElementById("writeoffs-page");

        if (!writeOffsPage) {
            return;
        }

        try {
            await this.preloadData();
            this.state.initialized = true;

            this.writeOffsPagination();
            this.initializeFilters();
            this.attachSearchListeners();
        } catch (error) {
            console.error("Ошибка инициализации WriteOffsWizard:", error);
            this.showError("Ошибка загрузки данных");
        }
    }

    async preloadData() {
        this.showLoading(true);
        let writeOffs;
        try {
            [writeOffs] = await Promise.all([
                window.queries.getWriteOffs(
                    (this.currentWriteOffsPage - 1) * this.cardsPerPage,
                    this.cardsPerPage,
                    this.cache.filter
                )
            ]);
            
            this.cache.writeOffs = writeOffs;
            this.mountWriteOffs(writeOffs);
        } finally {
            this.showLoading(false);
        }
    }

    mountWriteOffs(writeOffs) {
        const html = window.WriteOffsTemplates.renderWriteOffs(writeOffs.list);
        const table = document.querySelector(".default-table tbody");
        const totalLabel = document.querySelector(".total-count");
        table.innerHTML = html;
        totalLabel.innerHTML = "Всего " + writeOffs.total_num + " списаний";
        this.writeOffsPagination();
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
                this.cache.searchedWriteOffs = undefined;
                this.state.searchWriteOff = "";
            }
        });

        searchUI.clearBtn.addEventListener('click', () => {
            searchUI.input.value = '';
            searchUI.clearBtn.style.display = 'none';
            searchUI.input.focus();
            this.cache.filter.search = '';
            this.cache.searchedWriteOffs = undefined;
            this.state.searchWriteOff = "";
            this.preloadData();
        });

        if (this.cache.searchedWriteOffs || this.state.searchWriteOff) {
            searchUI.clearBtn.style.display = 'block';
        }

        const handleSearch = async () => {
            this.cache.filter.search = searchUI.input.value;  
            if (!searchUI.input.value) return;

            this.showLoading(true);
            try {
                const [writeOffs] = await Promise.all([
                    window.queries.getWriteOffs(
                        0 * this.cardsPerPage,
                        this.cardsPerPage,
                        this.cache.filter
                    )
                ]);
                this.cache.writeOffs = writeOffs;
                this.currentWriteOffsPage = 1;
                this.mountWriteOffs(this.cache.writeOffs);
            } finally {
                this.showLoading(false);
            }
        };

        searchUI.searchBtn.addEventListener('click', handleSearch);

        window.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && document.activeElement === searchUI.input) handleSearch();
        });
    }

    writeOffsPagination() {
        const paginationContainer = document.querySelector(".table-pagination");
        const prevBtn = paginationContainer.querySelector(".prev-arrow");
        const nextBtn = paginationContainer.querySelector(".next-arrow");
        const pageIndicator = paginationContainer.querySelector('.page-indicator');

        const totalWriteOffs = this.cache.writeOffs?.total_num;
        const totalPages = Math.ceil(totalWriteOffs / this.cardsPerPage);

        const prev = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(prev, prevBtn);

        prev.addEventListener("click", () => {
            if (this.currentWriteOffsPage > 1) {
                this.currentWriteOffsPage = this.currentWriteOffsPage - 1;
                this.preloadData();
            }
        });

        const next = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(next, nextBtn);

        next.addEventListener("click", () => {
            if (this.currentWriteOffsPage < totalPages) {
                this.currentWriteOffsPage = this.currentWriteOffsPage + 1;
                this.preloadData();
            }
        });

        pageIndicator.innerHTML = `стр ${this.currentWriteOffsPage}&nbsp;из ${totalPages}`;

        if (totalPages === 0) {
            paginationContainer.classList.add("hidden");
        } else {
            paginationContainer.classList.remove("hidden");
        }
    }
}

window.WriteOffsWizard = WriteOffsWizard;