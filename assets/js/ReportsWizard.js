class ReportsWizard {
    constructor() {
        this.isLoading = false;

        this.state = {};
        this.cache = {};
        this.cache.filter = {}; // для фильтров
        this.init();
    }

    async init() {
        const reportsPage = document.getElementById("reportsPage");

        if (!reportsPage) {
            return;
        }

        try {
            await this.preloadData();
            this.state.initialized = true;

            this.initializeFilters();
        } catch (error) {
            console.error("Ошибка инициализации ReportsWizard:", error);
            this.showError("Ошибка загрузки данных");
        }
    }

    async preloadData() {
        this.showLoading(true);
        let stats;
        try {
            [stats] = await Promise.all([
                window.queries.getReportsStats(this.cache.filter)
            ]);

            this.cache.stats = stats;
            this.mountReports(stats);
        } finally {
            this.showLoading(false);
        }
    }

    mountReports(stats) {
        // Обновляем метрики
        const metricsHtml = window.ReportsTemplates.renderMetrics(stats.metrics);
        const metricsContainer = document.querySelector(".stats-metrics-row");
        if (metricsContainer) {
            metricsContainer.innerHTML = metricsHtml;
        }

        // Обновляем топ менеджеров
        const topManagersHtml = window.ReportsTemplates.renderTopManagers(stats.top_managers);
        const topManagersTable = document.querySelector("#top-managers");
        if (topManagersTable) {
            topManagersTable.innerHTML = topManagersHtml;
        }

        // Обновляем топ складов
        const topWarehousesHtml = window.ReportsTemplates.renderTopWarehouses(stats.top_warehouses);
        const topWarehousesTable = document.querySelector("#top-warehouses");
        if (topWarehousesTable) {
            topWarehousesTable.innerHTML = topWarehousesHtml;
        }

        // Обновляем топ продуктов
        const topProductsHtml = window.ReportsTemplates.renderTopProducts(stats.top_products);
        const topProductsTable = document.querySelector("#top-products");
        if (topProductsTable) {
            topProductsTable.innerHTML = topProductsHtml;
        }

        // Обновляем остатки на складе
        const stockHtml = window.ReportsTemplates.renderStockSummary(stats.stock);
        const stockSummary = document.querySelector(".stock-summary");
        if (stockSummary) {
            stockSummary.innerHTML = stockHtml;
        }
    }

    initializeFilters() {
        // Фильтры в модалке, поэтому предполагаем, что модалка может быть открыта/закрыта
        // Слушатели на изменения фильтров
        const dateFromInput = document.querySelector("#date_from");
        if (dateFromInput) {
            dateFromInput.addEventListener('change', () => {
                this.cache.filter.date_from = dateFromInput.value;
                this.preloadData();
            });
        }

        const dateToInput = document.querySelector("#date_to");
        if (dateToInput) {
            dateToInput.addEventListener('change', () => {
                this.cache.filter.date_to = dateToInput.value;
                this.preloadData();
            });
        }

        const whFilter = document.querySelector("#select-warehouse");
        if (whFilter) {
            whFilter.addEventListener('change', () => {
                this.cache.filter.warehouse_id = whFilter.value === 'all' ? '' : whFilter.value;
                this.preloadData();
            });
        }

        const managerFilter = document.querySelector("#select-manager");
        if (managerFilter) {
            managerFilter.addEventListener('change', () => {
                this.cache.filter.manager_id = managerFilter.value === 'all' ? '' : managerFilter.value;
                this.preloadData();
            });
        }

        // Обработка сброса фильтров (window.resetFilters уже существует, интегрируем)
        window.resetFilters = () => {
            // Сброс значений
            if (dateFromInput) dateFromInput.value = '';
            if (dateToInput) dateToInput.value = '';
            if (whFilter) whFilter.value = 'all';
            if (managerFilter) managerFilter.value = 'all';

            // Сброс кэша
            this.cache.filter = {};

            // Перезагрузка данных
            this.preloadData();
        };
    }

    showLoading(show) {
        this.isLoading = show;

        const spinner = document.getElementById("loadingSpinner"); // Предполагаем, что спиннер существует, как в ShiftsWizard
        const modalBody = document.getElementById("modalBody"); // Или адаптировать под reports

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

    showError(message) {
        // Можно добавить отображение ошибки, аналогично Shifts
        alert(message); // Простой вариант
    }
}