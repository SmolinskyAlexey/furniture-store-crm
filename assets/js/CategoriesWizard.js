// CategoriesWizard.js
/**
 * CRM Categories Wizard - Модуль управления категориями v1.0
 */

class CategoriesWizard {
    constructor() { 
        this.isLoading = false;

        // Пагинация
        this.cardsPerPage = 10;
        this.currentCategoriesPage = 1;

        this.state = {};
        this.cache = {};
        this.cache.filter = {};//для фильтров поиска
        this.init();
    }

    async init() {
        const categoriesPage = document.getElementById("categories-page");

        if (!categoriesPage) {
            return;
        }

        try {
            await this.preloadData();
            this.state.initialized = true;

            this.categoriesPagination();
            this.initializeFilters();
            this.attachSearchListeners();
        } catch (error) {
            console.error("Ошибка инициализации CategoriesWizard:", error);
            this.showError("Ошибка загрузки данных");
        }
    }

    async preloadData() {
        this.showLoading(true);
        let categories;
        try {
            [categories] = await Promise.all([
                window.queries.getCategories(
                    (this.currentCategoriesPage - 1) * this.cardsPerPage,
                    this.cardsPerPage,
                    this.cache.filter
                )
            ]);
            
            this.cache.categories = categories;
            this.mountCategories(categories);
        } finally {
            this.showLoading(false);
        }
    }

    mountCategories(categories) {
        const html = window.CategoriesTemplates.renderCategories(categories.list);
        const table = document.querySelector(".default-table tbody");
        const totalLabel = document.querySelector(".total-count");
        table.innerHTML = html;
        totalLabel.innerHTML = "Всего " + categories.total_num + " категорий";
        this.categoriesPagination();
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
                this.cache.searchedCategories = undefined;
                this.state.searchCategory = "";
            }
        });

        searchUI.clearBtn.addEventListener('click', () => {
            searchUI.input.value = '';
            searchUI.clearBtn.style.display = 'none';
            searchUI.input.focus();
            this.cache.filter.search = '';
            this.cache.searchedCategories = undefined;
            this.state.searchCategory = "";
            this.preloadData();
        });

        if (this.cache.searchedCategories || this.state.searchCategory) {
            searchUI.clearBtn.style.display = 'block';
        }

        const handleSearch = async () => {
            this.cache.filter.search = searchUI.input.value;  
            if (!searchUI.input.value) return;

            this.showLoading(true);
            try {
                const [categories] = await Promise.all([
                    window.queries.getCategories(
                        0 * this.cardsPerPage,
                        this.cardsPerPage,
                        this.cache.filter
                    )
                ]);
                this.cache.categories = categories;
                this.currentCategoriesPage = 1;
                this.mountCategories(this.cache.categories);
            } finally {
                this.showLoading(false);
            }
        };

        searchUI.searchBtn.addEventListener('click', handleSearch);

        window.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && document.activeElement === searchUI.input) handleSearch();
        });
    }

    categoriesPagination() {
        const paginationContainer = document.querySelector(".table-pagination");
        const prevBtn = paginationContainer.querySelector(".prev-arrow");
        const nextBtn = paginationContainer.querySelector(".next-arrow");
        const pageIndicator = paginationContainer.querySelector('.page-indicator');

        const totalCategories = this.cache.categories?.total_num;
        const totalPages = Math.ceil(totalCategories / this.cardsPerPage);

        const prev = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(prev, prevBtn);

        prev.addEventListener("click", () => {
            if (this.currentCategoriesPage > 1) {
                this.currentCategoriesPage = this.currentCategoriesPage - 1;
                this.preloadData();
            }
        });

        const next = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(next, nextBtn);

        next.addEventListener("click", () => {
            if (this.currentCategoriesPage < totalPages) {
                this.currentCategoriesPage = this.currentCategoriesPage + 1;
                this.preloadData();
            }
        });

        pageIndicator.innerHTML = `стр ${this.currentCategoriesPage}&nbsp;из ${totalPages}`;

        if (totalPages === 0) {
            paginationContainer.classList.add("hidden");
        } else {
            paginationContainer.classList.remove("hidden");
        }
    }
}

window.CategoriesWizard = CategoriesWizard;