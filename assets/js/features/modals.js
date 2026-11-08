window.validateOrderPaymentDates = (form, focus = false) => {
    const fields = {prepay:'Предоплата', prepay_2:'Предоплата 2', postpay:'Доплата', postpay2:'Доплата 2', services_pay:'Оплата услуг доставки'};
    let firstInvalid = null;
    for (const [amountName, label] of Object.entries(fields)) {
        const amount = form.querySelector(`[name="${amountName}"]`);
        const date = form.querySelector(`[name="${amountName}_date"]`);
        if (!amount || !date) continue;
        form.querySelectorAll('.payment-date-summary').forEach(message => { message.hidden = true; });
        const invalid = Number(amount.value || 0) !== 0 && (!date.value || !date.validity.valid);
        date.classList.toggle('payment-date-invalid', invalid);
        date.setAttribute('aria-invalid', invalid ? 'true' : 'false');
        let message = date.parentElement.querySelector('.payment-date-error');
        if (invalid && !message) {
            message = document.createElement('div');
            message.className = 'payment-date-error';
            message.setAttribute('role', 'alert');
            date.parentElement.appendChild(message);
        }
        if (message) {
            message.textContent = invalid ? `${label}: укажите дату оплаты` : '';
            message.hidden = !invalid;
        }
        if (invalid && !firstInvalid) firstInvalid = date;
    }
    if (focus && firstInvalid) {
        firstInvalid.scrollIntoView({block:'center'});
        firstInvalid.focus();
        showNotification('Укажите даты оплат в выделенных красным полях. Заказ не сохранён.', 'error');
    }
    return !firstInvalid;
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
    initializeReceivedProductFields();
    if (objectType === 'orders') {
        const paymentForm = document.querySelector('#modalContainer form');
        const validate = () => window.validateOrderPaymentDates(paymentForm);
        paymentForm.addEventListener('input', validate);
        paymentForm.addEventListener('change', validate);
        paymentForm.addEventListener('submit', event => event.preventDefault());
        validate();
    }

    if (objectType === "orders" || objectType === "supplier_requests") {
        attachListenersForOrderModal();

        selectedProducts = [];

        const productsTable = document.querySelector(".products-table");
        const productRows = productsTable.querySelectorAll("tbody tr");

        if (objectType === "orders" && orderId !== null) {
            selectProductFromPopup(orderId.id, orderId.price, orderId.name);
        }
        productRows.forEach(row => {
            // Находим карточку товара
            const productCard = row.querySelector(".product-card");

            if (productCard) {
                // Извлекаем данные
                const id = productCard.dataset.id;
                const name = productCard.querySelector(".product-name").textContent.trim();
                const priceText = productCard.querySelector(".product-price .product-sale-price").value.trim();
                const price = parseFloat(priceText.replace(/[^\d.]/g, ''));
                const quantityInput = productCard.querySelector(".quantity-input");
                const quantity = parseInt(quantityInput.value);

                //const productId = productCard.querySelector("[name=products["+id+"][product_id]]");

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
    document.querySelector('#modalContainer').querySelectorAll('input, textarea').forEach((field) => {
        const toggle = () => {
            field.parentElement.classList.toggle('has-value', field.value.trim() !== '');
        };

        // при наборе
        field.addEventListener('input', toggle);
        // при автозаполнении или начальном value
        toggle();
    });

}

// Bind each freshly loaded card, including reopening a card on the catalog page.
function initializeReceivedProductFields() {
    const root = document.querySelector('#modalContainer');
    const received = root?.querySelector('input[name="received"]');
    const block = root?.querySelector('.recived-supplier-block');
    if (!received || !block) return;
    const toggle = () => { block.style.display = received.checked ? 'block' : 'none'; };
    received.addEventListener('change', toggle);
    toggle();
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
