/** Shared list lifecycle. Domain filters and row templates remain in each page. */
class CRMListPage {
    constructor(config) {
        this.listConfig = config;
        this.isLoading = false;
        this.cardsPerPage = 10;
        this[config.pageKey] = 1;
        this.state = {};
        this.cache = { filter: {} };
        this._requestNumber = 0;
    }

    async init() {
        this.root = document.getElementById(this.listConfig.rootId);
        if (!this.root) return;
        try {
            this.initializeFilters();
            this.attachSearchListeners();
            await this.preloadData();
            this.state.initialized = true;
        } catch (error) {
            this.showError(error.message || 'Ошибка загрузки данных');
        }
    }

    get currentPage() {
        return this[this.listConfig.pageKey];
    }

    set currentPage(value) {
        this[this.listConfig.pageKey] = value;
    }

    loadPage() {
        return window.queries[this.listConfig.query](
            (this.currentPage - 1) * this.cardsPerPage,
            this.cardsPerPage,
            this.cache.filter
        );
    }

    async preloadData() {
        const request = ++this._requestNumber;
        this.showLoading(true);
        try {
            const data = await this.loadPage();
            // A slow response must not replace a newer search/filter result.
            if (request !== this._requestNumber) return false;
            if (!data || !Array.isArray(data.list)) {
                throw new Error(data?.error || 'Ошибка загрузки данных');
            }
            this.cache[this.listConfig.cacheKey] = data;
            this[this.listConfig.mount](data);
            return true;
        } catch (error) {
            if (request === this._requestNumber) this.showError(error.message || 'Ошибка загрузки данных');
            return false;
        } finally {
            if (request === this._requestNumber) this.showLoading(false);
        }
    }

    showLoading(show) {
        CRMFrontend.ui.loading(this, show);
    }

    showError(message) {
        CRMFrontend.ui.error(message);
    }

    initializeFilters() {}

    setSearch(value) {
        this.cache.filter.search = value;
    }

    attachSearchListeners() {
        const root = document.querySelector('.search-bar');
        if (!root || this._searchRoot === root) return;
        this._searchEvents?.abort();
        this._searchRoot = root;
        this._searchEvents = new AbortController();
        const options = { signal: this._searchEvents.signal };
        const input = root.querySelector('.search-input');
        const clear = root.querySelector('.clear-btn');
        const button = root.querySelector('.search-btn');
        if (!input || !clear || !button) return;
        const toggleClear = () => { clear.style.display = input.value ? 'block' : 'none'; };
        const search = event => {
            event?.preventDefault();
            this.setSearch(input.value);
            this.currentPage = 1;
            return this.preloadData();
        };
        input.addEventListener('input', () => {
            toggleClear();
            if (!input.value) this.setSearch('');
        }, options);
        input.addEventListener('keydown', event => {
            if (event.key === 'Enter') search(event);
        }, options);
        clear.addEventListener('click', event => {
            input.value = '';
            toggleClear();
            input.focus();
            search(event);
        }, options);
        button.addEventListener('click', search, options);
        toggleClear();
    }

    updatePagination() {
        const container = this.root?.querySelector('.table-pagination');
        if (!container) return;
        const total = Number(this.cache[this.listConfig.cacheKey]?.total_num) || 0;
        this._totalPages = Math.ceil(total / this.cardsPerPage);
        const previous = container.querySelector('.prev-arrow');
        const next = container.querySelector('.next-arrow');
        const indicator = container.querySelector('.page-indicator');
        if (!previous || !next || !indicator) return;
        if (this._paginationRoot !== container) {
            this._paginationEvents?.abort();
            this._paginationEvents = new AbortController();
            this._paginationRoot = container;
            const options = { signal: this._paginationEvents.signal };
            previous.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage -= 1;
                    this.preloadData();
                }
            }, options);
            next.addEventListener('click', () => {
                if (this.currentPage < this._totalPages) {
                    this.currentPage += 1;
                    this.preloadData();
                }
            }, options);
        }
        indicator.innerHTML = `стр ${this.currentPage}&nbsp;из ${this._totalPages}`;
        container.classList.toggle('hidden', this._totalPages === 0);
        previous.setAttribute('aria-disabled', String(this.currentPage <= 1));
        next.setAttribute('aria-disabled', String(this.currentPage >= this._totalPages));
    }

    destroy() {
        this._requestNumber += 1;
        this._searchEvents?.abort();
        this._paginationEvents?.abort();
    }
}

window.CRMListPage = CRMListPage;
