class CategoriesWizard extends CRMListPage {
    constructor() {
        super({
            rootId: "categories-page",
            pageKey: "currentCategoriesPage",
            cacheKey: "categories",
            query: "getCategories",
            mount: "mountCategories"
        });
        this.ready = this.init();
    }

    mountCategories(categories) {
        const html = window.CategoriesTemplates.renderCategories(categories.list);
        const table = this.root.querySelector(".default-table tbody");
        const totalLabel = this.root.querySelector(".total-count");
        table.innerHTML = html;
        totalLabel.innerHTML = "Всего " + categories.total_num + " категорий";
        this.categoriesPagination();
    }

    categoriesPagination() { this.updatePagination(); }
}

window.CategoriesWizard = CategoriesWizard;