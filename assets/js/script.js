
// Глобальные переменные

let ordersWizard, catalogWizard, shiftsWizard, refundsWizard, clientsWizard, suppliersWizard, supplierRequestsWizard, writeOffsWizard, invoicesWizard, stockTransfersWizard, overheadExpenses;

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



function getShiftControlModal(shift) {
    const isOpen = shift?.status === 'open';
    return `
        <div class="modal">
            <div class="modal-content shift-modal">
                <div class="modal-header">
                    <h3 class="modal-title">${isOpen ? 'Закрыть смену' : 'Открыть смену'}</h3>
                    <button class="modal-close" onclick="closeShiftModal()">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <p>
                        ${isOpen
            ? `Смена открыта в <strong>${shift.openedAt}</strong><br>Касса: <strong>${shift.cash.toLocaleString()} грн</strong>`
            : 'Укажите начальный остаток в кассе:'}
                    </p>
                    ${!isOpen
            ? `
                            <div class="form-group">
                                <label class="form-label">Сумма на начало смены</label>
                                <input type="number" id="shiftCashInput" class="form-control" placeholder="Например, 5000">
                            </div>
                        `
            : `
                            <p>Укажите финальный остаток в кассе и комментарий:</p>
                            <div class="form-group">
                                <label class="form-label">Остаток в кассе</label>
                                <input type="number" class="form-control" id="shiftFinalCash" placeholder="Введите итоговую сумму">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Комментарий</label>
                                <textarea class="form-control" id="shiftEndComment" rows="3" placeholder="Причина закрытия, примечание..."></textarea>
                            </div>
                        `
        }
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeShiftModal()">Отмена</button>
                    <button class="btn btn-primary" onclick="${isOpen ? 'closeShift()' : 'openShift()'}">
                        ${isOpen ? 'Закрыть смену' : 'Открыть смену'}
                    </button>
                </div>
            </div>
        </div>
    `;
}


function openShift() {
    const cash = parseFloat(document.getElementById('shiftCashInput').value || 0);
    if (isNaN(cash) || cash < 0) {
        alert('Введите корректную сумму');
        return;
    }
    const comment = '';//комментарий взять из поля, сейчас поля нет, поэтому не проставил
    // const warehouse_id = 1;//торговая точка,  возможно будет браться вообще из бэка, точка куда привязан юзер

    fetch('/ajax/shifts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            action: 'add',
            start_cash: cash,
            start_comment: comment,
        })
    })
        .then(r => r.json())
        .then(json => {
            if (json.ok) {
                // console.log('Открытие смены с кассой: ' + cash);
                // this.showSuccess("Смена успешно открыта!");
                // window.location.reload();//перезагрузка страницы или действия после открытия смены
                this.showNotification('Открытие смены с кассой: ' + cash, 'success');
                setTimeout(function () { window.location.reload(); }, 500);
            } else {
                console.warn('Ошибка при открытии смены');
                this.showNotification('Ошибка при открытии смены');
            }
        })
        .catch(console.error);

    closeShiftModal();

}



function closeShift() {

    const finalCash = parseFloat(document.getElementById('shiftFinalCash') !== null ? document.getElementById('shiftFinalCash').value : 0 || 0);
    const comment = document.getElementById('shiftEndComment') !== null ? document.getElementById('shiftEndComment').value.trim() : "";

    if (isNaN(finalCash) || finalCash < 0) {
        alert('Введите корректную сумму остатка');
        return;
    }

    fetch('/ajax/shifts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            action: 'close',
            end_cash: finalCash,
            end_comment: comment,
        })
    })
        .then(r => r.json())
        .then(json => {
            if (json.ok) {
                // console.log(`Смена закрыта. Остаток: ${finalCash} грн. Комментарий: ${comment}`);
                // console.log('Смена успешно закрыта');
                this.showNotification(`Смена закрыта. Остаток: ${finalCash} грн. Комментарий: ${comment}`);
                setTimeout(function () { window.location.reload(); }, 500);
            } else {
                console.warn('Ошибка при закрытии смены');
                this.showNotification('Ошибка при закрытии смены');
            }
        })
        .catch(console.error);

    closeShiftModal();

}




window.showShift = () => {

    document.getElementById('pageTitle').textContent = 'Управление сменой';
    updateActiveMenuItem('showShift');

    fetch('/ajax/shifts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            action: 'get'
        })
    })
        .then(r => r.json())
        .then(json => {
            if (json.ok) {
                // console.log('Кассовая операция зарегистрирована');
                document.querySelector('#modalContainer').innerHTML = getShiftControlModal(json.shift);
                document.querySelector('#modalContainer').style.display = 'block';
            } else {
                console.warn('Ошибка при загрузки смены');
                this.showNotification('Ошибка при закрузке смены');
            }
        })
        .catch(console.error);

};



function closeShiftModal() {
    document.querySelector('#modalContainer').innerHTML = '';
    document.querySelector('#modalContainer').style.display = 'none';

}



function getCashOperationModal(type) {

    const isAdd = type === 'add';
    const title = isAdd ? 'Поступление в кассу' : 'Выдача из кассы';

    return `
        <div class="modal">
            <div class="modal-content shift-modal">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="closeShiftModal()">  
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    </button>
                </div>

                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">Сумма</label>
                        <input type="number" class="form-control" id="cashAmount" placeholder="Введите сумму">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Комментарий</label>
                        <textarea class="form-control" id="cashComment" rows="3" placeholder="Причина внесения или выдачи..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeShiftModal()">Отмена</button>
                    <button class="btn btn-primary" onclick="submitCashOperation('${type}')">Сохранить</button>
                </div>
            </div>
        </div>
    `;

}



function addCash() {

    document.querySelector('#modalContainer').innerHTML = getCashOperationModal('add');
    document.querySelector('#modalContainer').style.display = 'block';

}

function removeCash() {

    document.querySelector('#modalContainer').innerHTML = getCashOperationModal('remove');
    document.querySelector('#modalContainer').style.display = 'block';

}



function submitCashOperation(type) {

    const amount = parseFloat(document.getElementById('cashAmount').value || 0);
    const comment = document.getElementById('cashComment').value.trim();

    if (isNaN(amount) || amount <= 0) {
        alert('Введите корректную сумму');
        return;

    }

    fetch('/ajax/shifts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            action: 'add_cash_movement',//добавить движение средств
            amount: amount,
            direction: type === 'add' ? "cash_in" : "cash_out",
            comment: comment,
        })
    })
        .then(r => r.json())
        .then(json => {
            if (json.ok) {
                console.log(`Операция ${type === 'add' ? 'внесения' : 'выдачи'}: ${amount} грн, комментарий: ${comment}`);
                // window.location.reload();//перезагрузка страницы или действия после открытия смены
                // this.showSuccess("Операция успешно занесена в базу");
                this.showNotification("Success", 'success');
                setTimeout(function () { window.location.reload(); }, 500);
            } else {
                console.warn('Ошибка выполнения кассовой операции');
            }
        })
        .catch(console.error);

    closeShiftModal();

}



// Universal Modal

let currentModalType;





window.generateUniversalPDF = async (objectType, objectId) => {

    try {
        const formData = new FormData();
        formData.append('action', "generate_pdf");
        formData.append('id', objectId);

        const response = await fetch('/ajax/' + objectType + '/', {
            method: 'POST',
            body: formData
        });

        // Проверяем тип контента
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            // Если JSON - значит ошибка
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ошибка генерации PDF');
        }

        // Получаем PDF как blob
        const pdfBlob = await response.blob();

        // Создаем URL для blob
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // Открываем в новом окне
        const pdfWindow = window.open(pdfUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
        if (!pdfWindow) {
            // Fallback если блокировщик попапов
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `${objectType}_${objectId}.pdf`;
            link.click();
        }

        // Очищаем URL через некоторое время
        setTimeout(() => {
            URL.revokeObjectURL(pdfUrl);
        }, 10000);

    } catch (error) {
        console.error('Ошибка генерации PDF:', error);
        alert('Ошибка при генерации PDF: ' + error.message);
    }

};


window.showUniversalModal = async (objectType, objectId, orderId = null) => {

    // jQuery('#modalEditTop .modal-content').addClass('loader'); // TODO прикрепить лоадер

    console.log(objectType, objectId, "!!!!!! SHOW", orderId);

    currentModalType = objectType;

    const formData = new FormData();
    formData.append('action', "load_card");
    formData.append('id', objectId);

    // id заказа для возврата
    if (orderId !== null) {
        formData.append('order_id', orderId);
    }

    const response = await fetch('/ajax/' + objectType + '/', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error('Ошибка при загрузке модального окна');
    }

    // if (res == 'error') {
    //     showNotification('Ошибка! Попробуйте обновить страницу', 'error');
    // }
    // else if (res == 'empty') {
    //     showNotification('Запись не найдена', 'warning')
    // }

    const popupHtml = await response.text();

    document.querySelector('#modalContainer').innerHTML = popupHtml;
    document.querySelector('#modalContainer').style.display = 'block';

    if (objectType === "orders" || objectType === "supplier_requests") {
        attachListenersForOrderModal();

        selectedProducts = [];

        const productsTable = document.querySelector(".products-table");
        const productRows = productsTable.querySelectorAll("tbody tr");

        productRows.forEach(row => {
            // Находим карточку товара
            const productCard = row.querySelector(".product-card");

            if (productCard) {
                // Извлекаем данные
                const id = productCard.dataset.id;
                const name = productCard.querySelector(".product-name").textContent.trim();
                const priceText = productCard.querySelector(".product-price").textContent.trim();
                const price = parseFloat(priceText.replace(/[^\d.]/g, ''));
                const quantityInput = productCard.querySelector(".quantity-input");
                const quantity = parseInt(quantityInput.value);

                // Добавляем товар в массив
                selectedProducts.push({
                    id,
                    name,
                    price,
                    quantity
                });
            }
        });

    }

    if (objectType === "supplier_requests") {
        updatePaymentFields();
    }
    if (objectType === "refunds") {

        //initializeRefundTypeSelector();
    }

    // Для того чтоб placeholder-ы оставались приподнятыми если в input, textarea введен текст
    document.querySelectorAll('input, textarea').forEach((field) => {
        const toggle = () => {
            field.parentElement.classList.toggle('has-value', field.value.trim() !== '');
        };

        // при наборе
        field.addEventListener('input', toggle);
        // при автозаполнении или начальном value
        toggle();
    });

}


function initializeRefundTypeSelector() {

    const refundOptions = document.querySelectorAll('.refund-options .refund-option');
    let selectedValue = ''; // Для хранения выбранного значения

    refundOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Убираем класс active и атрибут name у всех опций
            refundOptions.forEach(opt => {
                opt.classList.remove('active');
                opt.removeAttribute('name');
            });

            // Добавляем класс active и атрибут name текущей опции
            option.classList.add('active');
            option.setAttribute('name', 'refund_type');

            // Обновляем выбранное значение
            selectedValue = option.getAttribute('data-value');
            console.log('Selected refund type:', selectedValue); // Для проверки
        });
    });

    // Если нужно, передать значение в форму:
    // Например, можно создать скрытое поле input и обновлять его значение:
    // const hiddenInput = document.createElement('input');
    // hiddenInput.type = 'hidden';
    // hiddenInput.name = 'refund_type';
    // document.querySelector('.form-group').appendChild(hiddenInput);
    //
    // refundOptions.forEach(option => {
    //     option.addEventListener('click', () => {
    //         hiddenInput.value = option.getAttribute('data-value');
    //     });
    // });

}

let currentProductsPage = 1;
const cardsPerPage = 5;
let totalProducts = 0;
let selectedProducts = [];

window.showProductSelectModal = async () => {

    document.getElementById("modalProductSelect").style.display = 'flex';
    document.querySelector("#modalProductSelect .modal").style.display = 'flex';

    updateProductListForSelectModal();
    attachProductSelectListeners();

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
    const inStockCheckbox = document.querySelector(".in-stock-checkbox input")
    const inStockVal = inStockCheckbox?.checked || false;
    try {
        const response = await window.queries.searchProductsQuery(
            categoryId,
            search,
            (currentProductsPage - 1) * cardsPerPage,
            cardsPerPage,
            { inStock: inStockVal }
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

            return `
                <div class="product-card ${quantity > 0 ? 'selected' : ''}" data-id="${product.id}" id="product-row-${product.id}">
                    
					<div class="product-image"> 
                        ${imagesHtml}
                    </div> 
					
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>      
                    </div>
                    
					
                    <div class="product-card-right-container">
                        <div class="product-card-right-container-block">
                            <div class="product-price">${product.price.toLocaleString()}&nbsp;грн</div>                  
                            <div class="product-actions">
                        ${quantity > 0 ? `
                            
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
                                <span class="btn-text">Добавить</span>
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
        updateProductListForSelectModal();
    });

    // Кнопка в наличии
    document.querySelector('.in-stock-checkbox input').addEventListener('click', () => {
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

function selectProductFromPopup(id, price, name, imagesStr) {
    const images = imagesStr.split(';');
    console.log(images);

    // Добавление товара в DOM основного попапа заказа
    const container = document.querySelector('.products-table tbody'); // контейнер, в который нужно вставить товар
    console.log(container);

    if (!container) return;


    var products_rows_num = 1 + document.querySelectorAll('.products-table tbody tr').length;

    var quantity = 1;

    // Добавление товара в массив
    selectedProducts.push({
        id,
        name,
        price: parseFloat(price),
        quantity: quantity // начальное количество
    });

    // before max="${product.stock}" now max="1"

    let newRow;
    if (currentModalType === "supplier_requests") {

        newRow = `
		<tr id="product-row-${id}">
			<td>
			
				<div class="product-card" style="margin-bottom: 10px;" data-id="${id}">
					
					<input type="hidden" name='products[${products_rows_num}][product_id]' value="${id}" />  
					
					<div class="product-image">
						<img class="img-product-order" src="${images?.[0]}" />
					</div>
					
					<div class="product-info">
						<div class="product-name">${name}</div>
					</div>
					
					<div class="product-card-right-container">
						<div class="product-card-right-container-block">
						
							<div style="margin-right: 10px;">
                                <label class="product-label" style="display: block;">Цена закупки:</label>
                                <input type="number" class="js-product-price form-input product-price" name='products[${products_rows_num}][price]' value="${price}" placeholder="Введите цену"
                                onchange="updatePaymentFields()"/>
                            </div>
                                                    
						
							<div class="product-actions">
									
									<div class="quantity-control active">
										<button type="button" class="quantity-btn" onclick="changeQuantity(${id}, -1)"
												title="Уменьшить количество">−</button>
										
										<input type="number" name='products[${products_rows_num}][quantity]' class="quantity-input m-t-0" value="${quantity}" min="0" max="100"
											   onchange="setQuantity(${id}, this.value)">
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

    } else {
        const popup_prod = document.querySelector('.select-product-modal');
        const isVisible = popup_prod && popup_prod.offsetWidth > 0 && popup_prod.offsetHeight > 0;
        let value_checkbox = isVisible ? '0' : '1';

        newRow = `
		<tr id="product-row-${id}">
			<td>
			
				<div class="product-card" style="margin-bottom: 10px;" data-id="${id}">
					
					<input type="hidden" name='products[${products_rows_num}][product_id]' value="${id}" />  
					<input type="hidden" name='products[${products_rows_num}][price]' value="${price}" />  
					
					<div class="product-image">
						<img class="img-product-order" src="${images?.[0]}" />
					</div>
					
					<div class="product-info">
						<div class="product-name">${name}</div>
					</div>
					
					<div class="product-card-right-container">
						<div class="product-card-right-container-block">
							<div class="product-price"> ${price} &nbsp;uah</div>
							<div class="product-actions">
									
									<div class="quantity-control active">
										<button type="button" class="quantity-btn" onclick="changeQuantity(${id}, -1)"
												title="Уменьшить количество">−</button>
										
										<input type="number" name='products[${products_rows_num}][quantity]' class="quantity-input m-t-0" value="${quantity}" min="0" max="100"
											   onchange="setQuantity(${id}, this.value)">
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
				<div class="checkbox-group">

                    <input name="orders_from_supplier[${products_rows_num}][product_id]" id="order_from_supplier" type="checkbox" value="${value_checkbox}" ${value_checkbox === '1' ? 'checked' : ''}  class="checkbox-new" />
                    <label for="order_from_supplier" style="font-size: 12px; color: #059669;"> Заказать у поставщика</label> 
                    
				</div>

				<input name="orders_from_supplier[${products_rows_num}][note]" type="text" class="form-input" value="" placeholder="Введите комментарий" style="width: 175px;" />
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
        (sum, p) => sum + p.price * p.quantity,
        0
    );

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

    return baseTotal + serviceTotal;
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
        totalInput.textContent = total.toFixed(2) + " uah";

    } else {

        const prepayInput = document.querySelector('input[name="prepay"]');
        const postpayInput = document.querySelector('input[name="postpay"]');
        const discountInput = document.querySelector('input[name="discount"]');
        const totalDebt = document.querySelector('input[name="total_amount_debt"]');

        let totalInput = document.querySelector('input[name="total_amount_income"]');

        if (!prepayInput || !postpayInput || !totalInput || !totalDebt) return;

        const total = Number(calculateFullTotal()) || 0;
        let prepay = parseFloat(prepayInput.value) || 0;
        let postpay = parseFloat(postpayInput.value) || 0;//Math.max(0, total - prepay);
        let discount = parseFloat(discountInput.value) || 0;
        let debt = parseFloat(total - (prepay + postpay + discount)) || 0;//долг клиента

        totalInput.value = total.toFixed(2);
        totalDebt.value = debt.toFixed(2);
    }

}


////


function selectProduct(product) {
    addProductToOrder(product);
    modalManager.switchTo('modal-order');
}


function attachListenersForOrderModal() {
    const prepayInput = document.querySelector('input[name="prepay"]');
    const postpayInput = document.querySelector('input[name="postpay"]');
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
    if (postpayInput) {
        postpayInput.addEventListener('input', updatePaymentFields);
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
        });
    });


}

function changeQuantity(id, delta) {

    const productId = String(id);

    const countInput = document.querySelector(`input[name="products[${id}][quantity]"]`);

    const nextValue = delta + Number(countInput.value || "0");

    if (nextValue <= 0) {
        // document.querySelector(`#product-row-${id}`)?.remove();
         countInput.value = 0;
    } else {
        countInput.value = nextValue;
    }

    selectedProducts = selectedProducts.map(product => {
        if (product.id === id) {
            return { ...product, quantity: nextValue }
        }
        return product;
    });


    updatePaymentFields();

}

function setQuantity(id, quantity) {

    if (!Number(quantity) && quantity != "0") {
        return;
    }

    if (quantity <= 0) {
        document.querySelector(`#product-row-${id}`)?.remove();;
    }

    selectedProducts = selectedProducts.map(product => {
        if (product.id === id) {
            return { ...product, quantity: Number(quantity) }
        }
        return product;
    });

    updatePaymentFields();
}

function closeUniversalModal() {
    document.querySelector('#modalContainer').innerHTML = '';
    document.querySelector('#modalContainer').style.display = 'none';
}

window.universalHandleObjectDelete = async (objectType, objectId) => {
    if (!confirm('Вы действительно желаете удалить запись ?')) {
        return;
    }

    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('item_id', objectId);

    const response = await fetch('/ajax/' + objectType + '/', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Ошибка при загрузке клиента');
    }

    window.closeUniversalModal();
    this.showNotification("success delete", 'success');
    setTimeout(function () { window.location.reload(); }, 500);
}

// window.universalHandleObjectCreateOrUpdate = async (objectType, objectId) => {
//
//     const is_new = (objectId == 0 || objectId == null);
//
//     const modal = document.getElementById(is_new ? "modalAddTop" : "modalEditTop");
//
//     // Отправка запроса на изменение
//
//     const formData = new FormData();
//
//     formData.append('action', (is_new ? 'add' : 'edit'));
//
//     if(!is_new){
//         formData.append('item_id', objectId);
//     }
//
//     if(objectType === "clients") {
//         formData.append('name', modal.querySelector('[name="client_name"]').value);
//         formData.append('phone', modal.querySelector('[name="phone_number"]').value);
//         formData.append('email', modal.querySelector('[name="email"]').value);
//         formData.append('comment', modal.querySelector('[name="comment"]').value);
//     }
//     else if(objectType === "warehouses"){
//         formData.append('name', modal.querySelector('[name="warehouse_name"]').value);
//         formData.append('phone', modal.querySelector('[name="phone_number"]').value);
//         formData.append('addressFull', modal.querySelector('[name="addressFull"]').value);
//         formData.append('team_users_ids', modal.querySelector('[name="team_users_ids"]').value);
//     }
//     else if(objectType === "categories"){
//         formData.append('parent_id', modal.querySelector('[name="parent_id"]').value);
//         formData.append('name', modal.querySelector('[name="name"]').value);
//         formData.append('attributes_ids', modal.querySelector('[name="attributes_ids"]').value);
//         formData.append('in_export', modal.querySelector('[name="in_export"]').value);
//     }
//
//     const response = await fetch('/ajax/' + objectType + '/', {
//         method: 'POST',
//         body: formData,
//     });
//
//     if (!response.ok) {
//         throw new Error('Ошибка при загрузке клиента');
//     }
//
//     const data = await response.json(); // предполагается, что сервер возвращает JSON
//
//     console.log(response);
//     window.closeUniversalModal();
//
// }

window.universalHandleObjectCreateOrUpdate = async (objectType, objectId, event) => {
    const is_new = (objectId == 0 || objectId == null);
    const modal = document.getElementById(is_new ? "modalAddTop" : "modalEditTop");
    const form = modal.querySelector('form');
    const modalBody = modal.querySelector('.modal-body');
    const submitButton = event ? event.target.closest('button') : modal.querySelector('button[type="submit"]');

    // Блокируем кнопку и показываем прелоадер
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.classList.add('button-loading');
    }
    modalBody.classList.add('modal-loading');

    // Создаём FormData из всей формы
    const formData = new FormData(form);
    formData.set('action', is_new ? 'add' : 'edit');

    if (!is_new) {
        formData.set('item_id', objectId);
    }

    try {
        const response = await fetch('/ajax/' + objectType + '/', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (!response.ok || result.status === 'error') {
            throw new Error(result.error);
        }

        window.closeUniversalModal();
        this.showNotification("Success", 'success');
        setTimeout(function () { window.location.reload(); }, 500);

    } catch (error) {
        console.error("Ошибка:", error);
        this.showNotification(error.message || "Произошла неизвестная ошибка");
    } finally {
        // Разблокируем кнопку и убираем прелоадер
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.classList.remove('button-loading');
        }
        modalBody.classList.remove('modal-loading');
    }
};



// быстрое добавление товара из заказа
window.createCatalogProductFast = async (event) => {

    const container = event.target.closest('fieldset');
    const modalBody = container.querySelector('.modal-body');
    const submitButton = container.querySelector('button[type="submit"]');

    // Блокируем кнопку и показываем прелоадер
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.classList.add('button-loading');
    }
    modalBody.classList.add('modal-loading');

    // Создаём FormData из всей формы
    const formData = new FormData();

    container.querySelectorAll('input, textarea, select').forEach(el => {
        if (el.name) { // важно, чтобы было имя, иначе в FormData не добавится
            if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) {
                // не добавляем неотмеченные чекбоксы/радио
                return;
            }
            formData.append(el.name, el.value);
        }
    });

    formData.set('action', 'add');



    try {
        const response = await fetch('/ajax/catalog/', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (!response.ok || result.status === 'error') {
            throw new Error(result.error);
        }

        let url_img = '';
        if (result.images && result.images.length > 0) {
            url_img = result.images.map(image => {
                // Используем preview если есть, иначе full
                return imageUrl = image.preview || image.full || '';
            }).join('');
        }

        selectProductFromPopup(result.id, result.price, result.name, url_img);

        container.querySelectorAll('input, textarea, select').forEach(el => {
            if (el.type === 'checkbox' || el.type === 'radio') {
                el.checked = false; // снимаем выбор
            } else {
                el.value = ''; // очищаем значение
            }
        });

    } catch (error) {
        console.error("Ошибка:", error);
        this.showNotification(error.message || "Произошла неизвестная ошибка");
    } finally {
        // Разблокируем кнопку и убираем прелоадер
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.classList.remove('button-loading');
        }
        modalBody.classList.remove('modal-loading');
    }
};


// для создания копии товара

window.assignModalIdAndCopy = async (button) => {
    const modal = button.closest('.modal');
    if (!modal) return;

    const originalId = modal.id;

    // Временно присваиваем id, который ожидает universalHandleObjectCreateOrUpdate
    modal.id = "modalAddTop";

    // Вызываем метод
    window.universalHandleObjectCreateOrUpdate('catalog', 0);

    // Через короткое время возвращаем исходный id
    setTimeout(() => {
        modal.id = originalId;
    }, 1000); // достаточно 1 секунды, можно меньше
}
//


function viewOrder(orderId) {

    fetch('/ajax/orders/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=get_order&id=' + encodeURIComponent(orderId)
    })

        .then(response => response.text())
        .then(html => {
            document.getElementById('modalContainer').innerHTML = html;
            document.getElementById('currentOrderModal').style.display = 'block';
        })

        .catch(console.error);

}



function getShiftsOrders() {

}



function registerOrderPaymentInShift(orderId, amount, comment = '') {
    fetch('/ajax/shifts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            action: 'add_cash_from_order',
            order_id: orderId,
            amount: amount,
            comment: comment
        })
    })
        .then(r => r.json())
        .then(json => {
            if (json.saved) {
                console.log('Кассовая операция зарегистрирована');
            } else {
                console.warn('Ошибка при сохранении движения по смене');
            }
        })
        .catch(console.error);
}




function saveOrder(orderData) {

    fetch('/ajax/shifts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=get_current_shift_id'
    })

        .then(r => r.json())
        .then(json => {
            if (!json.shift_id) {
                alert("Нет активной смены!");
                return;
            }

            orderData.shift_id = json.shift_id;

            fetch('/ajax/orders/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create_order',
                    data: orderData
                })
            })

                .then(r => r.json())
                .then(response => {
                    if (response.success) {
                        registerOrderPaymentInShift(response.order_id, orderData.total_sum);
                        closeNewOrderModal();
                    } else {
                        alert('Ошибка при создании заказа');
                    }
                });
        });
}



function loadCurrentShiftOrders() {
    let warehouse_select = document.querySelector("#select-warehouse");
    let warehouse_id = 'all';
    if (warehouse_select) {
        //Обновление листа при выборе салона
        warehouse_select.addEventListener('change', function (e) {
            loadCurrentShiftOrders();
        });
        warehouse_id = warehouse_select.value;
    }
    fetch('/ajax/shifts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=get_orders_for_current_shift&warehouse_id=' + warehouse_id
    })

        .then(r => r.json())
        .then(data => {
            const tbody = document.querySelector('#current_shift_orders_table tbody');
            tbody.innerHTML = ''; // очистка

            if (!data.list || !data.list.length) {
                tbody.innerHTML = '<tr><td colspan="5">Нет заказов</td></tr>';
                return;
            }

            const title = document.querySelector('#current_shift_orders_count');

            title.innerHTML = `Текущие заказы смены (` + data.total_num + `)`;

            data.list.forEach(order => {

                const row = document.createElement('tr');

                row.innerHTML = `
            <tr>
                <td><strong>#${order.id}</strong>  |  ${order.created_at}</td>
                <td>${order.client.name}<br><small>${order.client_info}</small></td>
                <td>
                    ${order.products?.map(product => product.name).join(", ")}
					<br/>
					<div class="photos-preview">
						${order.products?.map(product => {

                    if (!product.images || product.images.length === 0) { return ''; }

                    return product.images.map(image => {
                        // Используем preview если есть, иначе full
                        const imageUrl = image.preview || image.full || '';
                        return imageUrl ? `<img src="${imageUrl}" />` : '';
                    }).join('');

                }).join("")}
					</div>
                </td>

                <td>${order.prepay}&nbsp;uah</td>
                <td>${order.postpay}&nbsp;uah</td>
                <td class="comment-cell">${order.comment}</td>

                <td class="total-status-cell">
                    <div class="total-status-wrapper">
                        <strong>${order.total}&nbsp;uah</strong>
                        <span class="badge badge-success">${order.status}</span>
                    </div>
                </td>
                `+ (order.shift ? ("<td>" + order.shift.warehouse_name + "</td>") : "") + `
                <td class="actions-cell">
                    <div class="actions-wrapper">
                    
						<button class="btn btn-icon btn-secondary" onclick="window.showUniversalModal('orders',${order.id})" 
						 ${order.isEditable ? `title="Редактировать">✏️` : `title="Просмотр">👁️`}
                        </button>
						
                        <button class="btn btn-icon btn-secondary" onclick="window.generateUniversalPDF('orders', ${order.id})" title="Печать">📠</button>
						
                    </div>
                </td>
            </tr>`;

                tbody.appendChild(row);

            });
        });

}

window.loadCurrentShiftOrders = loadCurrentShiftOrders;


document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/' || window.location.pathname === '/index.php') {

        loadCurrentShiftOrders();

    }
});


// Закрытие окон по Escape

function closeCashInModal() {
    const modal = document.querySelector('#cash-in-modal');
    if (modal) {
        modal.classList.remove('modal--visible');
    }
}

function closeCashOutModal() {
    const modal = document.querySelector('#cash-out-modal');
    if (modal) {
        modal.classList.remove('modal--visible');
    }
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeShiftModal();
    }
});


function showNotification(message, type = 'error') {

    // Удаляем существующие уведомления

    document.querySelectorAll('.notification').forEach(n => n.remove());

    const notification = document.createElement('div');

    notification.className = `notification notification-${type}`;

    const icons = {
        success: '✓',
        error: '⚠',
        info: 'ℹ',
        warning: '⚡'
    };

    notification.innerHTML = `
            <div class="notification-content notification-card-${type}">
                <span class="notification-icon">${icons[type] || icons.info}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

    document.body.appendChild(notification);

    // Анимация появления

    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    // Автоудаление

    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}





