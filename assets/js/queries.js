window.queries = {

    searchProductsQuery: async (category_id, search, offset = 0, limit = 5, filters = {}) => {   

        const formData = new FormData();

        formData.append('action', "get_list");
        formData.append('offset', offset);
        formData.append('limit', limit);

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

        const response = await fetch('/ajax/catalog/', {
            method: 'POST',
            body: formData
        })

        const data = await response.json();

        return data;
    },

    searchShiftsQuery: async (offset = 0, limit = 5, filters = {}) => { 

        const formData = new FormData();

        formData.append('action', "get_list");
        formData.append('offset', offset);
        formData.append('limit', limit);

        if(filters.warehouse_id && filters.warehouse_id != 'all'){
            formData.append('warehouse_id', filters.warehouse_id);
        }
        if(filters.date){
            formData.append("created_at", filters.date);
        }
        if(filters.search){
            formData.append("search", filters.search);
        }

        const response = await fetch('/ajax/shifts/', {
            method: 'POST',
            body: formData
        })

        const data = await response.json();

        return data;
    },

    searchRefundsQuery: async (offset = 0, limit = 5, filters = {}) => { 

        const formData = new FormData();

        formData.append('action', "get_list");
        formData.append('offset', offset);
        formData.append('limit', limit);

        if(filters.warehouse_id && filters.warehouse_id != 'all'){
            formData.append('warehouse_id', filters.warehouse_id);
        }
        if(filters.date){
            formData.append("created_at", filters.date);
        }
        if(filters.search){
            formData.append("search", filters.search);
        }

        const response = await fetch('/ajax/refunds/', {
            method: 'POST',
            body: formData
        })

        const data = await response.json();

        return data;
    },

    getCategories: async () => {
        const response = await fetch('/ajax/categories/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'get_list'
            })
        });

        if (!response.ok) {
            throw new Error('Ошибка при загрузке категорий');
        }

        const data = await response.json(); // предполагается, что сервер возвращает JSON
        let list = data.list;
        console.log(list);
        return list;
    },

    createCategory: async (category_data) => {
        const formData = new FormData();

        formData.append('action', 'add');
        formData.append('item_id', 0);
        formData.append('parent_id', category_data?.parent_id);
        formData.append('source_cat_name', category_data?.source_cat_name);
        formData.append('attributes_ids', category_data?.attributes_ids);
        formData.append('in_export', category_data?.in_export);

        const response = await fetch('/ajax/categories/', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Ошибка при загрузке клиента');
        }

        const data = await response.json(); // предполагается, что сервер возвращает JSON

        return data;
    },

    getProducts: async (offset = 0, limit = 5, type_show = 'for_order') => {

        const response = await fetch('/ajax/catalog/', {
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
        });

        if (!response.ok) {
            throw new Error('Ошибка при загрузке продуктов');
        }

        const data = await response.json(); // предполагается, что сервер возвращает JSON
        let list = data;
        console.log(list);
        return list;
    },

    /*Добавил Егор 08.06.2025, пагинацию добавил 09.06*/

    getOrders: async (offset = 0, limit = 5) => {

        const response = await fetch('/ajax/orders/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'get_list',
                offset,
                limit
            })
        });

        if (!response.ok) {
            throw new Error('Ошибка при загрузке заказов');
        }

        const data = await response.json(); // предполагается, что сервер возвращает JSON
        let list = data;
        console.log(list);
        return list;
    },

    //Добавил Егор 10.06.2025

    searchOrdersQuery: async (search, filters, offset = 0, limit = 5) => {

        const formData = new FormData();

        formData.append('action', "get_list");
        formData.append('offset', offset);
        formData.append('limit', limit);

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
        }

        const response = await fetch('/ajax/orders/', {
            method: 'POST',
            body: formData
        })
        const data = await response.json();
        return data;
    },

    getOrder: async (order_id) => {

        const response = await fetch('/ajax/orders/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'get',
                id : order_id,
            })
        });

        if (!response.ok) {
            throw new Error('Ошибка при загрузке заказа');
        }

        const data = await response.json(); // предполагается, что сервер возвращает JSON
        let list = data;
        console.log(list);
        return list;
    },

    getClients: async (offset = 0, limit = 5, filters = {}) => {
        const formData = new FormData();

        formData.append('action', "get_list");
        formData.append('offset', offset);
        formData.append('limit', limit);

        if(filters.search){
            formData.append("search", filters.search);
        }

        const response = await fetch('/ajax/clients/', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Ошибка при загрузке клиентов');
        }

        const data = await response.json(); // предполагается, что сервер возвращает JSON
        let list = data;
        return list;
    },

    getOverheadExpenses: async (offset = 0, limit = 5, filters = {}) => {
        const formData = new FormData();

        formData.append('action', "get_list");
        formData.append('offset', offset);
        formData.append('limit', limit);

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

        const response = await fetch('/ajax/overhead_expenses/', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Ошибка при загрузке клиентов');
        }

        const data = await response.json(); // предполагается, что сервер возвращает JSON
        let list = data;
        return list;
    },

    // 22.06.2025

    getStockTransfers: async (offset = 0, limit = 5, filters = {}) => {
        const formData = new FormData();

        formData.append('action', "get_list");
        formData.append('offset', offset);
        formData.append('limit', limit);

        if(filters.search){
            formData.append("search", filters.search);
        }

        const response = await fetch('/ajax/stock_transfers/', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Ошибка при загрузке stock_transfers');
        }

        const data = await response.json(); // предполагается, что сервер возвращает JSON
        let list = data;
        return list;
    },

    getWriteOffs: async (offset = 0, limit = 5, filters = {}) => {
        const formData = new FormData();

        formData.append('action', "get_list");
        formData.append('offset', offset);
        formData.append('limit', limit);

        if(filters.search){
            formData.append("search", filters.search);
        }

        const response = await fetch('/ajax/write_offs/', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Ошибка при загрузке write_offs');
        }

        const data = await response.json(); // предполагается, что сервер возвращает JSON
        let list = data;
        return list;
    },

    getInvoices: async (offset = 0, limit = 5, filters = {}) => {
        const formData = new FormData();

        formData.append('action', "get_list");
        formData.append('offset', offset);
        formData.append('limit', limit);

        if(filters.search){
            formData.append("search", filters.search);
        }

        const response = await fetch('/ajax/invoices/', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Ошибка при загрузке invoices');
        }

        const data = await response.json(); // предполагается, что сервер возвращает JSON
        let list = data;
        return list;
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    getSuppliers: async (offset = 0, limit = 5, filters = {}) => {
        const formData = new FormData();

        formData.append('action', "get_list");
        formData.append('offset', offset);
        formData.append('limit', limit);

        if(filters.search){
            formData.append("search", filters.search);
        }

        const response = await fetch('/ajax/suppliers/', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Ошибка при загрузке производителей');
        }

        const data = await response.json(); // предполагается, что сервер возвращает JSON
        let list = data;
        return list;
    },

    getSupplierRequests: async (offset = 0, limit = 5, filters = {}) => {
        const formData = new FormData();

        formData.append('action', "get_list");
        formData.append('offset', offset);
        formData.append('limit', limit);

        if(filters.search){
            formData.append("search", filters.search);
        }

        const response = await fetch('/ajax/supplier_requests/', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Ошибка при загрузке производителей');
        }

        const data = await response.json(); // предполагается, что сервер возвращает JSON
        let list = data;
        console.log(list);
        return list;
    },


}