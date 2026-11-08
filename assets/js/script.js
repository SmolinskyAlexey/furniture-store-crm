
// Глобальные переменные

let ordersWizard, catalogWizard, shiftsWizard, refundsWizard, clientsWizard, suppliersWizard, supplierRequestsWizard, writeOffsWizard, invoicesWizard, stockTransfersWizard, overheadExpenses, categoriesWizard, servicesWizard, contractorsWizard, reportsWizard;

// Инициализация приложения

window.addEventListener('DOMContentLoaded', () => {

    // Создаем экземпляр мастера заказов
    ordersWizard = new OrdersWizard();
    catalogWizard = new CatalogWizard();
    shiftsWizard = new ShiftsWizard();
    refundsWizard = new RefundsWizard();
    clientsWizard = new ClientsWizard();
    suppliersWizard = new SuppliersWizard();
    supplierRequestsWizard = new SupplierRequestsWizard();
    writeOffsWizard = new WriteOffsWizard();
    invoicesWizard = new InvoicesWizard();
    stockTransfersWizard = new StockTransfersWizard();
    overheadExpenses = new OverheadExpenses();
    categoriesWizard     = new CategoriesWizard();
    servicesWizard        = new ServicesWizard();
    contractorsWizard     = new ContractorsWizard(); 
    reportsWizard         = new ReportsWizard(); 

    // Инициализация навигации
    initializeNavigation();

});



// Навигация по страницам

function initializeNavigation() {

    // Обработчики для активных пунктов меню
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {

            // Убираем активный класс со всех пунктов
            document.querySelectorAll('.menu-item').forEach(mi => mi.classList.remove('active'));

            // Добавляем активный класс к текущему
            e.currentTarget.classList.add('active');
        });
    });

}



// Вспомогательная функция для обновления активного пункта меню

function updateActiveMenuItem(functionName) {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick')?.includes(functionName)) {
            item.classList.add('active');
        }
    });
}



// Навигационные функции

window.showHome = () => {
    document.getElementById('pageTitle').textContent = 'Главная страница';
    updateActiveMenuItem('showHome');
};

window.showOrders = () => {
    document.getElementById('pageTitle').textContent = 'Мои заказы';
    updateActiveMenuItem('showOrders');
};

window.showCatalog = () => {
    document.getElementById('pageTitle').textContent = 'Catalog';
    updateActiveMenuItem('showCatalog');
};
