let currentProductsPage = 1;
const cardsPerPage = 5;
let totalProducts = 0;
let selectedProducts = [];

window.showProductSelectModal = async () => {

    document.getElementById("modalProductSelect").style.display = 'flex';
    document.querySelector("#modalProductSelect .modal").style.display = 'flex';

    updateProductListForSelectModal();
    if(document.getElementById("modalProductSelect").getAttribute("listeners-atached") != 'true'){
        attachProductSelectListeners();
        document.getElementById("modalProductSelect").setAttribute("listeners-atached", 'true');
    }

}



async function updateProductListForSelectModal() {

    // this.showLoading(true);


    // Получаем активный таб и его категорию
    const activeTab = document.querySelector(".category-tab.active");
    const categoryId = activeTab?.dataset.category || null;

    // Получаем значение из поля поиска
    const searchInput = document.querySelector(".product-search-bar input");
    const search = searchInput?.value || "";

    //Получем значение "только в наличии"
    const inStockCheckbox = document.querySelector(".in-stock-checkbox input");
    const inStockVal = inStockCheckbox?.checked || false;

    const warehouseSelect = document.querySelector(".select-warehouse-choose-prod select");
    const wh_idVal = warehouseSelect?.value || "";

    try {
        const response = await window.queries.searchProductsQuery(
            categoryId,
            search,
            (currentProductsPage - 1) * cardsPerPage,
            cardsPerPage,
            { inStock: inStockVal, warehouse_id: wh_idVal}
        );

        totalProducts = response.total_num || 0; ///

        var productCards = response.list.map(product => {

            var selected = null;
            var quantity = 0;

            let imagesHtml = '';
            if (product.images && product.images.length > 0) {
                imagesHtml = product.images.map(image => {
                    // Используем preview если есть, иначе full
                    const imageUrl = image.preview || image.full || '';
                    return imageUrl ? `<img class="img-product-order" src="${imageUrl}" />` : '';
                }).join('');
            }


            const rawImages = product.images;

            // Преобразование объект в массив, если это не массив
            const imagesArray = Array.isArray(rawImages)
                ? rawImages
                : typeof rawImages === 'object' && rawImages !== null
                    ? Object.values(rawImages)
                    : [];

            const imageUrls = imagesArray.map(el => (el.preview || el.full || '')).join(';');

            let attributesHTML = '';

            if(product.attributes){
                for (var i = 0; i < product.attributes.length; i++) {
                    attributesHTML += '<div class="attr_row"><div class="attr_name">'+product.attributes[i].attribute_name+':&nbsp;</div><div class="attr_value">'+product.attributes[i].attribute_value+'</div></div>\n';
                }
            }

            return `
                <div class="product-card ${quantity > 0 ? 'selected' : ''}" data-id="${product.id}" id="product-row-${product.id}">

                    <div class="product-image">
                        ${imagesHtml}
                    </div>

                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-attributes">${attributesHTML}</div>
                    </div>


                    <div class="product-card-right-container">
                        <div class="product-card-right-container-block">
                            <div class="product-price">
                                <span class="product-sale-price">${product.price.toLocaleString()}&nbsp;<small>₴</small></span><br>
                                <span class="product-source-price">${product.source_price.toLocaleString()}&nbsp;<small>₴</small></span>
                            </div>
                            <div class="product-actions">
                        ${quantity > 0 ? `
                            <div class="select-warehouse">
                                Склад списания
                                <select name='products[${product.id}][warehouse_id]' class="dropdown-filter new-row-whSelect">
                                <option disabled>Загрузка...</option>
                                </select>
                            </div>
                            <div class="quantity-control active">
                                <button type="button" class="quantity-btn" onclick="changeQuantity(${product.id}, -1)"
                                        title="Уменьшить количество">−</button>


                                <input type="hidden" name='products[${product.id}][product_id]' value="${product.id}" />
                                <input type="hidden" name='products[${product.id}][price]' value="${product.price}" />

                                <input type="number" class="quantity-input m-t-0" name='products[${product.id}][quantity]' value="${quantity}" min="0" max="${product.stock}"
                                       onchange="setQuantity(${product.id}, this.value)"
                                       onclick="this.select()">
                                <button type="button" class="quantity-btn" onclick="changeQuantity(${product.id}, 1)"
                                        title="Увеличить количество">+</button>
                            </div>

                        ` : `
                            <button class="btn btn-primary add-product-btn"
                                    data-product-id="${product.id}"
                                    title="Добавить в заказ"
                                    onclick="selectProductFromPopup(${product.id}, '${product.price}', '${product.name}', '${imageUrls}')">
                                <span class="btn-icon">+</span>
                                <span class="btn-text">Выбрать</span>
                            </button>
                        `}
                        </div>
                        </div>

                        <div class="product-details">В наличии:<br>${product.stock}</div>

                    </div>

                </div>
            `;


        }).join('');

        document.getElementById('productGrid').innerHTML =
            productCards || '<div class="product-not-found">Товары не найдены</div>';

        renderPagination(); ///

    } finally {
        // this.showLoading(false);
    }



}

function attachProductSelectListeners() {

    // Категории
    document.querySelectorAll('.category-tabs .category-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.category-tabs .category-tab')
                .forEach(t => t.classList.remove('active'));

            tab.classList.add('active');

            updateProductListForSelectModal();
        });
    });

    // Кнопка поиска
    document.querySelector('.product-search-bar .search-btn').addEventListener('click', () => {
        currentProductsPage = 1;
        updateProductListForSelectModal();
    });

    // Кнопка в наличии
    document.querySelector('.in-stock-checkbox input').addEventListener('change', () => {
        currentProductsPage = 1;
        updateProductListForSelectModal();
    });

    document.querySelector(".select-warehouse-choose-prod select").addEventListener('change', () => {
        currentProductsPage = 1;
        updateProductListForSelectModal();
    });



    // строка поиска и кнопка очистки
    const input = document.querySelector('.product-search-bar input');
    const clearBtn = document.querySelector('.product-search-bar .clear-btn');

    if (!input || !clearBtn) return;

    // При вводе — показываем/скрываем кнопку очистки
    input.addEventListener("input", () => {
        clearBtn.style.display = input.value ? "block" : "none";
    });

    // Кнопка стереть
    clearBtn.addEventListener("click", () => {
        input.value = "";
        clearBtn.style.display = "none";
        input.focus();
        currentProductsPage = 1;
        updateProductListForSelectModal();
    });

    // Пагинация
    const paginationContainer = document.getElementById("order-products-pagination");
    if (!paginationContainer) return;

    const prevBtn = paginationContainer.querySelector(".prev-arrow");
    const nextBtn = paginationContainer.querySelector(".next-arrow");

    prevBtn.addEventListener("click", async () => {
        if (currentProductsPage > 1) {
            currentProductsPage--;
            await updateProductListForSelectModal();
        }
    });

    nextBtn.addEventListener("click", async () => {
        const totalPages = Math.ceil(totalProducts / cardsPerPage);
        if (currentProductsPage < totalPages) {
            currentProductsPage++;
            await updateProductListForSelectModal();
        }
    });


}

function renderPagination() {
    const paginationContainer = document.getElementById("order-products-pagination");
    if (!paginationContainer) return;

    const prevBtn = paginationContainer.querySelector(".prev-arrow");
    const nextBtn = paginationContainer.querySelector(".next-arrow");
    const pageIndicator = paginationContainer.querySelector(".page-indicator");

    const totalPages = Math.ceil(totalProducts / cardsPerPage);

    // Обновляем текст
    pageIndicator.innerHTML = `стр ${currentProductsPage}&nbsp;из ${totalPages}`;

    // Обновляем кнопки
    prevBtn.disabled = currentProductsPage <= 1;
    nextBtn.disabled = currentProductsPage >= totalPages;
}

window.closeProductSelectModal = async () => {

    document.getElementById("modalProductSelect").style.display = 'none';
    document.querySelector("#modalProductSelect .modal").style.display = 'none';
}

//

function selectProductFromPopup(id, price, name, imagesStr, supplier_id = null, warehouse_id = null, source_price = null) {
    const images = imagesStr ? imagesStr.split(';') : imagesStr;

    // Добавление товара в DOM основного попапа заказа
    const container = document.querySelector('.products-table tbody'); // контейнер, в который нужно вставить товар

    if (!container) return;


    var quantity = 1;

    // Добавление товара в массив
    selectedProducts.push({
        id,
        name,
        price: parseFloat(price),
        source_price: parseFloat(source_price),
        quantity: quantity // начальное количество,
    });

    // before max="${product.stock}" now max="1"

    let newRow;
    let attributesHTML = '';

    let productInfo = null;/*window.queries.getProduct(id);
    console.log(productInfo);
    productInfo = productInfo && productInfo.list ? productInfo.list[0] : null;
    console.log(productInfo);*/

    window.queries.getProduct(id).then(productResponse => {
        productInfo = productResponse && productResponse.list ? productResponse.list[0] : null;
        console.log(productInfo);
        if(productInfo && productInfo.attributes){
            for (var i = 0; i < productInfo.attributes.length; i++) {
                attributesHTML += '<div class="attr_row"><div class="attr_name">'+productInfo.attributes[i].attribute_name+':&nbsp;</div><div class="attr_value">'+productInfo.attributes[i].attribute_value+'</div></div>\n';
            }
            if(document.querySelector("#product-row-"+id+" .product-attributes-in-card")){
                document.querySelector("#product-row-"+id+" .product-attributes-in-card").innerHTML = attributesHTML;
            }
        }
        if(source_price != null && source_price > 0){
            if(document.querySelector("#product-row-"+id+" .product-source-price")){
                document.querySelector("#product-row-"+id+" .product-source-price").value = source_price+"&nbsp;<small>₴</small>";
            }
        }
        else if(productInfo && productInfo.source_price && productInfo.source_price > 0){
            if(document.querySelector("#product-row-"+id+" .product-source-price")){
                document.querySelector("#product-row-"+id+" .product-source-price").value = productInfo.source_price+"&nbsp;<small>₴</small>";
            }
        }
    }).catch(error => {
        console.error('Ошибка:', error);
    });

    if (currentModalType === "supplier_requests") {

        newRow = `
        <tr id="product-row-${id}">
            <td>

                <div class="product-card" style="margin-bottom: 10px;" data-id="${id}">

                    <input type="hidden" name='products[${id}][product_id]' value="${id}" />

                    <div class="product-image">
                        <img class="img-product-order" src="${images?.[0]}" />
                    </div>

                    <div class="product-info">
                        <div class="product-name">${name}</div>
                        <div class="product-attributes-in-card">${attributesHTML}</div>
                    </div>

                    <div class="product-card-right-container">
                        <div class="product-card-right-container-block">

                            <div style="margin-right: 10px;">
                                <label class="product-label" style="display: block;">Цена закупки:</label>
                                <input type="number" class="js-product-price form-input product-price" name='products[${id}][price]' value="${price}" placeholder="Введите цену"
                                onchange="updatePaymentFields()"/>
                            </div>


                            <div class="product-actions">

                                    <div class="quantity-control active">
                                        <button type="button" class="quantity-btn" onclick="changeQuantity(${id}, -1)"
                                                title="Уменьшить количество">−</button>

                                        <input autocomplete="off" type="number" min="0" max="100" onchange="setQuantity(${id}, this.value)" value="${quantity}" class="form-input quantity-input m-t-0" placeholder="Дополнительная информация о клиенте" name="products[${id}][quantity]">

                                        <button type="button" class="quantity-btn" onclick="changeQuantity(${id}, 1)"
                                                title="Увеличить количество">+</button>
                                    </div>

                            </div>
                        </div>

                        <div class="product-details"></div>


                    </div>

                </div>

            </td>
        </tr>

    `;

    }else if (currentModalType === "write_offs") {//товар в списании
        newRow = `
        <tr id="product-row-${id}">
            <td>

                <div class="product-card" style="margin-bottom: 10px;" data-id="${id}">

                    <input type="hidden" name='products[${id}][product_id]' value="${id}" />

                    <div class="product-image">
                        <img class="img-product-order" src="${images?.[0]}" />
                    </div>

                    <div class="product-info">
                        <div class="product-name">${name}</div>
                        <div class="product-attributes-in-card">${attributesHTML}</div>
                    </div>

                    <div class="product-card-right-container">
                        <div class="product-card-right-container-block">
                            <div class="product-price">
                                <div class="product-sale-price"> ${price} &nbsp;<small>₴</small></div>
                                <div class="product-source-price"></div>
                            </div>
                            <div class="product-actions">
                                    <div class="quantity-control active">

                                        <input autocomplete="off" type="number" min="0" max="100" onchange="setQuantity(${id}, this.value)" value="${quantity}" class="form-input quantity-input m-t-0" placeholder="Кол-во" name="products[${id}][quantity]">
                                    </div>

                            </div>
                        </div>

                        <div class="product-details"></div>

                    </div>

                </div>

            </td>

        </tr>

    `;
    } else {
        // const popup_prod = document.querySelector('.select-product-modal');
        // const isVisible = popup_prod && popup_prod.offsetWidth > 0 && popup_prod.offsetHeight > 0;
        let value_checkbox = supplier_id ? '1' : '0';

        const formData = new FormData();
        formData.append('action', 'list');
        fetch('/ajax/warehouses/', {
            method: 'POST',
            body: formData,
        }).then(response => response.json())
        .then(json => {
            if(json.ok == '1'){
                let htmlWarehouses = '';
                if(json.list){
                    htmlWarehouses += '<option value="all">Выберите склад</option>';
                    for (var i = 0; i < json.list.length; i++) {
                        htmlWarehouses+= '<option value="'+json.list[i].id+'" '+(warehouse_id == json.list[i].id ? "selected" : "")+' >'+json.list[i].name+'</option>';
                    }
                    let needSelectFillWarehouse = document.querySelectorAll(".new-row-whSelect");
                    for (var i = 0; i < needSelectFillWarehouse.length; i++) {
                        if(needSelectFillWarehouse[i].value == "" || needSelectFillWarehouse[i].value == null){
                            needSelectFillWarehouse[i].innerHTML = htmlWarehouses;
                        }
                    }
                }
            }
        }).catch(console.error);
        newRow = `
        <tr id="product-row-${id}">
            <td>

                <div class="product-card" style="margin-bottom: 10px;" data-id="${id}">

                    <input type="hidden" name='products[${id}][product_id]' value="${id}" />

                    <div class="product-image">
                        <img class="img-product-order" src="${images?.[0]}" />
                    </div>

                    <div class="product-info">
                        <div class="product-name">${name}</div>
                        <div class="product-attributes-in-card">${attributesHTML}</div>
                    </div>

                    <div class="product-card-right-container">
                        <div class="product-card-right-container-block">
                            <div class="product-price">
                                <div class="product-sale-price"> ${price} &nbsp;<small>₴</small></div>
                                <div class="product-source-price"></div>
                            </div>
                            <div class="product-actions">
                                    <div class="select-warehouse">
                                        Склад реализации
                                        <select name='products[${id}][warehouse_id]' class="dropdown-filter new-row-whSelect">
                                        <option disabled>Загрузка...</option>
                                        </select>
                                    </div>
                                    <div class="quantity-control active">
                                        <button type="button" class="quantity-btn" onclick="changeQuantity(${id}, -1)"
                                                title="Уменьшить количество">−</button>

                                        <input autocomplete="off" type="number" min="0" max="100" onchange="setQuantity(${id}, this.value)" value="${quantity}" class="form-input quantity-input m-t-0" placeholder="Кол-во" name="products[${id}][quantity]">

                                        <button type="button" class="quantity-btn" onclick="changeQuantity(${id}, 1)"
                                                title="Увеличить количество">+</button>
                                    </div>

                            </div>
                        </div>

                        <div class="product-details"></div>

                    </div>

                </div>

            </td>


            <td>

                <input type="hidden" name='orders_from_supplier[${id}][product_id]' value="${id}" />
                <input type="hidden" name='orders_from_supplier[${id}][supplier_id]' value="${supplier_id}"/>
                <div class="form-group">
                    <label class="checkbox_input has-value" style="">
                        <input class="qqq form-input green" type="checkbox" value="1" name="products[${id}][through_warehouse]">
                        <div class="checkbox__check_mark"></div>
                        <div class="tit " style="flex:1">Провести через гараж</div>
                    </label>
                </div>
                <div class="form-group">
                    <label class="checkbox_input has-value" style="">
                        <input class="qqq form-input green" type="checkbox" value="${value_checkbox}" ${value_checkbox == '1' ? 'checked="checked"' : ''} name="orders_from_supplier[${id}][is_orders_from_supplier]">
                        <div class="checkbox__check_mark"></div>
                        <div class="tit " style="flex:1">Заказать у поставщика</div>
                    </label>
                </div>

                <div class="form-group">
                    <textarea placeholder="Введите комментарий" name="orders_from_supplier[${id}][note]" class="form-input"></textarea>
                </div>
            </td>

        </tr>

    `;

    }

    const row = newRow;



    container.insertAdjacentHTML('beforeend', row);

    if (document.querySelector('.select-product-modal')) {
        window.closeProductSelectModal();
    }

    updatePaymentFields();

}


//// Подсчет оплаты и стоимостей

function calculateFullTotal() {

    const baseTotal = selectedProducts.reduce(
        (sum, p) => {
            const price = parseFloat(p.price) || 0;
            const quantity = parseInt(p.quantity) || 0;
            return sum + price * quantity;
        },
        0
    );
/*
    const serviceFields = [
        'serv_dismantling',
        'serv_assembly',
        'serv_packaging',
        'serv_lifting',
        'serv_delivery'
    ];

    const serviceTotal = serviceFields.reduce((sum, name) => {
        const input = document.querySelector(`input[name="${name}"]`);
        const value = parseFloat(input?.value) || 0;
        return sum + value;
    }, 0);
*/
    return baseTotal;
}


function calculateFullTotalForSupplier() {

    let baseTotal = 0;

    // Находим все элементы с ценой и количеством
    const priceInputs = document.querySelectorAll('input.js-product-price');

    priceInputs.forEach((priceInput) => {
        // Найти соседний или соответствующий input количества
        const rowElement = priceInput.closest('.product-card-right-container-block');
        const quantityInput = rowElement?.querySelector('.quantity-input');

        // Получаем значения цены и количества
        const priceValue = parseFloat(priceInput.value) || 0;
        const quantityValue = parseInt(quantityInput?.value) || 1; // По умолчанию 1, если не найдено

        // Умножаем цену на количество и добавляем к общей сумме
        baseTotal += priceValue * quantityValue;

    });

    // Возвращаем общую сумму
    return baseTotal;
}


function updatePaymentFields() {

    if (currentModalType === "supplier_requests") {

        // Ищем <label> вместо <input> для supplier_requests
        let totalInput = document.querySelector('label[name="total_amount_income"]');

        if (!totalInput) return;

        const total = Number(calculateFullTotalForSupplier()) || 0;
        totalInput.innerHTML = total.toFixed(0) + " <small>₴</small>";

    } else {

        const prepayInput = document.querySelector('input[name="prepay"]');
        const prepay2Input = document.querySelector('input[name="prepay_2"]');
        const postpayInput = document.querySelector('input[name="postpay"]');
        const postpay2Input = document.querySelector('input[name="postpay2"]');
        const discountInput = document.querySelector('input[name="discount"]');
        const totalDebt = document.querySelector('input[name="total_amount_debt"]');

        let totalInput = document.querySelector('input[name="total_amount_income"]');
        let totalInputLabel = document.querySelector('label[name="total_amount_income"]');

        if (!prepayInput || !postpayInput || !totalInput || !totalDebt) return;

        const total = Number(calculateFullTotal()) || 0;
        let prepay = parseFloat(prepayInput.value) || 0;
        let prepay2 = parseFloat(prepay2Input.value) || 0;
        let postpay = parseFloat(postpayInput.value) || 0;//Math.max(0, total - prepay);
        let postpay2 = parseFloat(postpay2Input.value) || 0;
        let discount = parseFloat(discountInput.value) || 0;
        let debt = parseFloat(total - (prepay + prepay2 + postpay + postpay2 + discount)) || 0;//долг клиента

        totalInput.value = total.toFixed(0);
        if(totalInputLabel){
            totalInputLabel.innerHTML = total.toFixed(0)+" <small>₴</small>";
        }
        totalDebt.value = debt.toFixed(0);
    }

}


////


function selectProduct(product) {
    addProductToOrder(product);
    modalManager.switchTo('modal-order');
}


function attachListenersForOrderModal() {
    const prepayInput = document.querySelector('input[name="prepay"]');
    const prepay2Input = document.querySelector('input[name="prepay_2"]');
    const postpayInput = document.querySelector('input[name="postpay"]');
    const postpay2Input = document.querySelector('input[name="postpay2"]');
    const discountInput = document.querySelector('input[name="discount"]');
    const serviceFields = [
        'serv_dismantling',
        'serv_assembly',
        'serv_packaging',
        'serv_lifting',
        'serv_delivery'
    ];

    if (prepayInput) {
        prepayInput.addEventListener('input', updatePaymentFields);
    }
    if (prepay2Input) {
        prepay2Input.addEventListener('input', updatePaymentFields);
    }
    if (postpayInput) {
        postpayInput.addEventListener('input', updatePaymentFields);
    }
    if (postpay2Input) {
        postpay2Input.addEventListener('input', updatePaymentFields);
    }
    if (discountInput) {
        discountInput.addEventListener('input', updatePaymentFields);
    }

    serviceFields.forEach(name => {
        const input = document.querySelector(`input[name="${name}"]`);
        if (input) {
            input.addEventListener('input', updatePaymentFields);
        }
    });

    // Запрет вводить буквы в инпуты с типом number
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('keydown', function (e) {
            // Разрешённые клавиши:
            const allowedKeys = [
                'Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab',
                'Home', 'End'
            ];

            const isNumber = /^[0-9]$/.test(e.key);
            const isAllowed = allowedKeys.includes(e.key);

            if (!isNumber && !isAllowed) {
                e.preventDefault();
            }
        });
    });

    // Выбор типа доставки
    const deliveryOptions = document.querySelectorAll('.delivery-options .delivery-option');

    deliveryOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Убираем active со всех опций внутри delivery-options
            deliveryOptions.forEach(opt => opt.classList.remove('active'));
            // Добавляем active на текущий элемент
            option.classList.add('active');
            if(document.querySelector(".delivery-option-block")){
                if(option.getAttribute('data-value') == 'pickup'){//при самовывозе скрываем блок с доп. информацией про доставку
                    document.querySelector(".delivery-option-block").style.display="none";
                    var celarinputs = document.querySelectorAll(".delivery-option-block input,.delivery-option-block textarea");
                    if(celarinputs){
                        for (var i = 0; i < celarinputs.length; i++) {
                            celarinputs[i].value = '';
                        }
                    }
                }else{
                    document.querySelector(".delivery-option-block").style.display="block";
                }
            }
        });
    });


}

function changeQuantity(id, delta, convertPoidtoPid = 0) {

    let productId = String(id);
    if(convertPoidtoPid == 1){
        var pId = document.querySelector(`input[name="products[${id}][product_id]"]`);
        if(pId){
            productId = pId.value;
        }
    }

    const countInput = document.querySelector(`input[name="products[${id}][quantity]"]`);

    const nextValue = delta + Number(countInput.value || "0");

    if (nextValue <= 0) {
        // document.querySelector(`#product-row-${id}`)?.remove();
         countInput.value = 0;
    } else {
        countInput.value = nextValue;
    }

    selectedProducts = selectedProducts.map(product => {
        if (product.id == productId ){
            return { ...product, quantity: nextValue }
        }
        return product;
    });


    updatePaymentFields();

}

function setQuantity(id, quantity, convertPoidtoPid = 0) {

    if (!Number(quantity) && quantity != "0") {
        return;
    }

    if (quantity <= 0) {
        document.querySelector(`#product-row-${id}`)?.remove();
    }

    let productId = String(id);
    if(convertPoidtoPid == 1){
        var pId = document.querySelector(`input[name="products[${id}][product_id]"]`);
        if(pId){
            productId = pId.value;
        }
    }

    selectedProducts = selectedProducts.map(product => {
        if (product.id === productId) {
            return { ...product, quantity: Number(quantity) }
        }
        return product;
    });

    updatePaymentFields();
}
