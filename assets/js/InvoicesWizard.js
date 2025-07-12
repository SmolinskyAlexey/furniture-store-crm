/**
 * CRM Invoices Wizard - Модуль создания счетов v2.1
 *
 * Исправлена архитектура, убраны дубли, улучшен UX
 */

class InvoicesWizard {
    constructor() { 
        this.isLoading = false;

        // Пагинация
        this.cardsPerPage = 5;
        this.currentInvoicesPage = 1;

        this.state = {};
        this.cache = {};
        this.cache.filter = {};//для фильтров поиска
        this.init();
    }

    async init() {
        const invoicesPage = document.getElementById("invoices-page");

        if (!invoicesPage) {
            return;
        }

        try {
            await this.preloadData();
            this.state.initialized = true;

            this.invoicesPagination();
            this.initializeFilters();
            this.attachSearchListeners();
        } catch (error) {
            console.error("Ошибка инициализации InvoicesWizard:", error);
            this.showError("Ошибка загрузки данных");
        }
    }

    async preloadData() {
        this.showLoading(true);
        let invoices;
        try {
            [invoices] = await Promise.all([
                window.queries.getInvoices(
                    (this.currentInvoicesPage - 1) * this.cardsPerPage,
                    this.cardsPerPage,
                    this.cache.filter
                )
            ]);
            
            this.cache.invoices = invoices;
            this.mountInvoices(invoices);
        } finally {
            this.showLoading(false);
        }
    }

    mountInvoices(invoices) {
        const html = window.InvoicesTemplates.renderInvoices(invoices.list);
        const table = document.querySelector(".default-table tbody");
        const totalLabel = document.querySelector(".total-count");
        table.innerHTML = html;
        totalLabel.innerHTML = "Всего " + invoices.total_num + " счетов";
        this.invoicesPagination();
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
                this.cache.searchedInvoices = undefined;
                this.state.searchInvoice = "";
            }
        });

        searchUI.clearBtn.addEventListener('click', () => {
            searchUI.input.value = '';
            searchUI.clearBtn.style.display = 'none';
            searchUI.input.focus();
            this.cache.filter.search = '';
            this.cache.searchedInvoices = undefined;
            this.state.searchInvoice = "";
            this.preloadData();
        });

        if (this.cache.searchedInvoices || this.state.searchInvoice) {
            searchUI.clearBtn.style.display = 'block';
        }

        const handleSearch = async () => {
            this.cache.filter.search = searchUI.input.value;  
            if (!searchUI.input.value) return;

            this.showLoading(true);
            try {
                const [invoices] = await Promise.all([
                    window.queries.getInvoices(
                        0 * this.cardsPerPage,
                        this.cardsPerPage,
                        this.cache.filter
                    )
                ]);
                this.cache.invoices = invoices;
                this.currentInvoicesPage = 1;
                this.mountInvoices(this.cache.invoices);
            } finally {
                this.showLoading(false);
            }
        };

        searchUI.searchBtn.addEventListener('click', handleSearch);

        window.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && document.activeElement === searchUI.input) handleSearch();
        });
    }

    invoicesPagination() {
        const paginationContainer = document.querySelector(".table-pagination");
        const prevBtn = paginationContainer.querySelector(".prev-arrow");
        const nextBtn = paginationContainer.querySelector(".next-arrow");
        const pageIndicator = paginationContainer.querySelector('.page-indicator');

        const totalInvoices = this.cache.invoices?.total_num;
        const totalPages = Math.ceil(totalInvoices / this.cardsPerPage);

        const prev = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(prev, prevBtn);

        prev.addEventListener("click", () => {
            if (this.currentInvoicesPage > 1) {
                this.currentInvoicesPage = this.currentInvoicesPage - 1;
                this.preloadData();
            }
        });

        const next = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(next, nextBtn);

        next.addEventListener("click", () => {
            if (this.currentInvoicesPage < totalPages) {
                this.currentInvoicesPage = this.currentInvoicesPage + 1;
                this.preloadData();
            }
        });

        pageIndicator.innerHTML = `стр ${this.currentInvoicesPage} из ${totalPages}`;

        if (totalPages === 0) {
            paginationContainer.classList.add("hidden");
        } else {
            paginationContainer.classList.remove("hidden");
        }
    }
}

window.InvoicesWizard = InvoicesWizard;