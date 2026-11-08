window.queries = {

    searchProductsQuery: async (category_id, search, offset = 0, limit = 10, filters = {}) => {   

        const formData = CRMFrontend.api.listBody(offset, limit);

        if(category_id){
            formData.append('category_id', category_id);
        }
        if(search) formData.append('search', search);
        if(filters.warehouse_id && filters.warehouse_id != 'all'){
            formData.append('warehouse_id', filters.warehouse_id);
        }
        if(filters.type_show){
            formData.append('type_show', filters.type_show);
        } 
        if(filters.inStock){
            formData.append('in_stock', filters.inStock);
        }
        if(filters.only_deleted){
            formData.append("only_deleted", filters.only_deleted);
        }
        if(filters.only_negative){
            formData.append("only_negative", filters.only_negative);
        }

        return CRMFrontend.api.json('/ajax/catalog/', {
            method: 'POST',
            body: formData
        }, "Ошибка загрузки данных");
    },

    searchShiftsQuery: async (offset = 0, limit = 10, filters = {}) => { 

        const formData = CRMFrontend.api.listBody(offset, limit);

        if(filters.warehouse_id && filters.warehouse_id != 'all'){
            formData.append('warehouse_id', filters.warehouse_id);
        }
        if(filters.date){
            formData.append("created_at", filters.date);
        }
        if(filters.search){
            formData.append("search", filters.search);
        }

        return CRMFrontend.api.json('/ajax/shifts/', {
            method: 'POST',
            body: formData
        }, "Ошибка загрузки данных");
    },

    searchRefundsQuery: async (offset = 0, limit = 10, filters = {}) => { 

        const formData = CRMFrontend.api.listBody(offset, limit);

        if(filters.warehouse_id && filters.warehouse_id != 'all'){
            formData.append('warehouse_id', filters.warehouse_id);
        }
        if(filters.date){
            formData.append("created_at", filters.date);
        }
        if(filters.search){
            formData.append("search", filters.search);
        }

        return CRMFrontend.api.json('/ajax/refunds/', {
            method: 'POST',
            body: formData
        }, "Ошибка загрузки данных");
    },

    getCategories: async (offset = 0, limit = 10, filters = {}) => {
        const formData = CRMFrontend.api.listBody(offset, limit);

        if(filters.search){
            formData.append("search", filters.search);
        }

        return CRMFrontend.api.json('/ajax/categories/', {
            method: 'POST',
            body: formData
        }, "Ошибка при загрузке категорий");
    },

    createCategory: async (category_data) => {
        const formData = new FormData();

        formData.append('action', 'add');
        formData.append('item_id', 0);
        formData.append('parent_id', category_data?.parent_id);
        formData.append('source_cat_name', category_data?.source_cat_name);
        formData.append('attributes_ids', category_data?.attributes_ids);
        formData.append('in_export', category_data?.in_export);

        return CRMFrontend.api.json('/ajax/categories/', {
            method: 'POST',
            body: formData,
        }, "Ошибка при загрузке клиента");
    },

    getProducts: async (offset = 0, limit = 10, type_show = 'for_order') => {

        return CRMFrontend.api.json('/ajax/catalog/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'get_list',
                type_show: type_show,
                offset,
                limit
            })
        }, "Ошибка при загрузке продуктов");
    },

    getProduct: async (id = 1) => {

        return CRMFrontend.api.json('/ajax/catalog/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'get_list',
                id: id
            })
        }, "Ошибка при загрузке продуктов");
    },

    getOrders: async (offset = 0, limit = 10) => {

        return CRMFrontend.api.json('/ajax/orders/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'get_list',
                offset,
                limit
            })
        }, "Ошибка при загрузке заказов");
    },

    searchOrdersQuery: async (search, filters, offset = 0, limit = 10) => {

        const formData = CRMFrontend.api.listBody(offset, limit);

        if(search) formData.append('search', search);
        if(filters){
            if(filters.status_id && filters.status_id != "all"){
                formData.append("status_id", filters.status_id);
            }
            if(filters.date){
                formData.append("created_at", filters.date);
            }
            if(filters.warehouse_id && filters.warehouse_id != 'all'){
                formData.append('warehouse_id', filters.warehouse_id);
            }
            if(filters.manager_id && filters.manager_id != 'all'){
                formData.append('manager_id', filters.manager_id);
            }
            if(filters.pay_method && filters.pay_method != 'all'){
                formData.append('payment_method_id', filters.pay_method);
            }
            if(filters.pay_method_postpay && filters.pay_method_postpay != 'all'){
                formData.append('payment_method_postpay_id', filters.pay_method_postpay);  
            }
            if(filters.only_deleted){
                formData.append("only_deleted", filters.only_deleted);
            }
        }

        return CRMFrontend.api.json('/ajax/orders/', {
            method: 'POST',
            body: formData
        }, "Ошибка загрузки данных");
    },

    getOrder: async (order_id) => {

        return CRMFrontend.api.json('/ajax/orders/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'get',
                id : order_id,
            })
        }, "Ошибка при загрузке заказа");
    },

    getClients: async (offset = 0, limit = 10, filters = {}) => {
        const formData = CRMFrontend.api.listBody(offset, limit);

        if(filters.search){
            formData.append("search", filters.search);
        }

        return CRMFrontend.api.json('/ajax/clients/', {
            method: 'POST',
            body: formData
        }, "Ошибка при загрузке клиентов");
    },

    getOverheadExpenses: async (offset = 0, limit = 10, filters = {}) => {
        const formData = CRMFrontend.api.listBody(offset, limit);

        if(filters.search){
            formData.append("search", filters.search);
        }
        if(filters.date){
            formData.append("date", filters.date);
        }
        if(filters.warehouse_id && filters.warehouse_id != 'all'){
            formData.append("warehouse_id", filters.warehouse_id);
        }
        if(filters.service && filters.service != 'all'){
            formData.append("service_id", filters.service);
        }

        return CRMFrontend.api.json('/ajax/overhead_expenses/', {
            method: 'POST',
            body: formData
        }, "Ошибка при загрузке клиентов");
    },

    getStockTransfers: async (offset = 0, limit = 10, filters = {}) => {
        const formData = CRMFrontend.api.listBody(offset, limit);

        if(filters.search){
            formData.append("search", filters.search);
        }

        return CRMFrontend.api.json('/ajax/stock_transfers/', {
            method: 'POST',
            body: formData
        }, "Ошибка при загрузке stock_transfers");
    },

    getWriteOffs: async (offset = 0, limit = 10, filters = {}) => {
        const formData = CRMFrontend.api.listBody(offset, limit);

        if(filters.search){
            formData.append("search", filters.search);
        }

        return CRMFrontend.api.json('/ajax/write_offs/', {
            method: 'POST',
            body: formData
        }, "Ошибка при загрузке write_offs");
    },

    getInvoices: async (offset = 0, limit = 10, filters = {}) => {
        const formData = CRMFrontend.api.listBody(offset, limit);

        if(filters.search){
            formData.append("search", filters.search);
        }

        return CRMFrontend.api.json('/ajax/invoices/', {
            method: 'POST',
            body: formData
        }, "Ошибка при загрузке invoices");
    },

    getSuppliers: async (offset = 0, limit = 10, filters = {}) => {
        const formData = CRMFrontend.api.listBody(offset, limit);

        if(filters.search){
            formData.append("search", filters.search);
        }

        return CRMFrontend.api.json('/ajax/suppliers/', {
            method: 'POST',
            body: formData
        }, "Ошибка при загрузке производителей");
    },

    getSupplierRequests: async (offset = 0, limit = 10, filters = {}) => {
        const formData = CRMFrontend.api.listBody(offset, limit);

        if(filters.search){
            formData.append("search", filters.search);
        }
        if(filters.status && filters.status != 'all'){
            formData.append("status", filters.status);
        }
        if(filters.only_deleted){
            formData.append("only_deleted", filters.only_deleted);
        }

        return CRMFrontend.api.json('/ajax/supplier_requests/', {
            method: 'POST',
            body: formData
        }, "Ошибка при загрузке производителей");
    },



    getServices: async (offset = 0, limit = 10, filters = {}) => {
        const formData = CRMFrontend.api.listBody(offset, limit);

        if(filters.search){
            formData.append("search", filters.search);
        }
        if(filters.date){
            formData.append("date", filters.date);
        }
        if(filters.warehouse_id && filters.warehouse_id != 'all'){
            formData.append("warehouse_id", filters.warehouse_id);
        }

        return CRMFrontend.api.json('/ajax/services/', {
            method: 'POST',
            body: formData
        }, "Ошибка при загрузке услуг");
    },

    getContractors: async (offset = 0, limit = 10, filters = {}) => {
        const formData = CRMFrontend.api.listBody(offset, limit);

        if(filters.search){
            formData.append("search", filters.search);
        }

        return CRMFrontend.api.json('/ajax/contractors/', {
            method: 'POST',
            body: formData
        }, "Ошибка при загрузке подрядчиков");
    },

    getReportsStats: async (filters = {}) => {
        const formData = new FormData();
        formData.append('action', 'get_reports_stats');

        if (filters.date_from) {
            formData.append('date_from', filters.date_from);
        }
        if (filters.date_to) {
            formData.append('date_to', filters.date_to);
        }
        if (filters.warehouse_id && filters.warehouse_id !== 'all') {
            formData.append('warehouse_id', filters.warehouse_id);
        }
        if (filters.manager_id && filters.manager_id !== 'all') {
            formData.append('manager_id', filters.manager_id);
        }

        return CRMFrontend.api.json('/ajax/reports/', {
            method: 'POST',
            body: formData
        }, "Ошибка сети при загрузке статистики");
    },
}