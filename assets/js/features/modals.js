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
        initPaymentSlots(paymentForm);
    }
    addQuantitySteppers(document.querySelector('#modalContainer'));

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
                // В заказе цена — .product-price .product-sale-price (input или span в просмотре), в заявке — input.js-product-price
                const priceEl = productCard.querySelector(".product-price .product-sale-price") || productCard.querySelector("input.js-product-price");
                const priceText = priceEl ? String(priceEl.value ?? priceEl.textContent).trim() : '';
                const price = parseFloat(priceText.replace(/[^\d.]/g, ''));
                const quantityInput = productCard.querySelector(".quantity-input");
                const quantity = parseInt(quantityInput?.value);

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

// Карточки (U3): «Очистить» стирает всю форму — спрашиваем подтверждение; выбранное фото сразу видно в плитке.
if (typeof document.addEventListener === 'function') {
    document.addEventListener('reset', (event) => {
        if (!event.target.closest('#modalContainer')) return;
        if (!window.confirm('Очистить все поля формы?')) event.preventDefault();
    }, true);

    document.addEventListener('change', (event) => {
        const input = event.target;
        if (!input.matches?.('.photo-tile input[type="file"]')) return;
        const tile = input.closest('.photo-tile');
        const file = input.files && input.files[0];
        let picked = tile.querySelector('.photo-tile__picked');
        if (!file) {
            picked?.remove();
            tile.classList.remove('is-picked');
            tile.querySelector('.photo-tile__pick span').textContent = tile.classList.contains('has-img') ? 'Заменить' : 'Добавить фото';
            return;
        }
        if (!picked) {
            picked = document.createElement('div');
            picked.className = 'photo-tile__img photo-tile__picked';
            picked.innerHTML = '<img alt="">';
            tile.insertBefore(picked, tile.querySelector('.photo-tile__pick'));
        }
        const img = picked.querySelector('img');
        if (img.src) URL.revokeObjectURL(img.src);
        img.src = URL.createObjectURL(file);
        img.alt = file.name;
        tile.classList.add('is-picked');
        tile.querySelector('.photo-tile__pick span').textContent = 'Заменить';
    });
}

// Оплата в заказе (U7): пустые слоты (сумма 0 и нет даты) прячутся, вместо них — кнопки «+ Предоплата 2» и т. д.
// Поля остаются в форме с прежними именами и значениями: на сохранение и проверки это не влияет.
function initPaymentSlots(form) {
    const summary = form?.querySelector('.payment-summary');
    if (!summary || summary.querySelector('.pay-add')) return;
    const slots = [
        ['prepay_2', 'payment_method_2_id', 'Предоплата 2'],
        ['postpay', 'payment_method_postpay_id', 'Доплата'],
        ['postpay2', 'payment_method_postpay2_id', 'Доплата 2'],
        ['services_pay', 'payment_method_services_id', 'Оплата доставки'],
    ];
    const bar = document.createElement('div');
    bar.className = 'pay-add';
    bar.innerHTML = '<span>Добавить платёж:</span>';
    slots.forEach(([amountName, methodName, label]) => {
        const amount = summary.querySelector(`input[name="${amountName}"]`);
        const date = summary.querySelector(`input[name="${amountName}_date"]`);
        const method = summary.querySelector(`select[name="${methodName}"]`);
        if (!amount || amount.disabled || amount.readOnly) return;
        if ((Number(amount.value) || 0) !== 0 || (date && date.value)) return;
        const items = [amount.closest('.payment-item'), method?.closest('.payment-item')].filter(Boolean);
        items.forEach(item => item.classList.add('pay-slot-empty'));
        const button = document.createElement('button');
        button.type = 'button';
        button.innerHTML = `<i class="fas fa-plus"></i> ${label}`;
        button.addEventListener('click', () => {
            items.forEach(item => item.classList.remove('pay-slot-empty'));
            button.remove();
            if (!bar.querySelector('button')) bar.remove();
            amount.focus();
            amount.select?.();
        });
        bar.appendChild(button);
    });
    if (bar.querySelector('button')) summary.appendChild(bar);
}

// Количество в строках заказа (U7): кнопки − / + рядом с полем; меняют значение и вызывают обычный change
function addQuantitySteppers(root) {
    root?.querySelectorAll('.quantity-control').forEach((box) => {
        const input = box.querySelector('input.quantity-input');
        if (!input || input.disabled || input.readOnly || box.querySelector('.quantity-btn')) return;
        const make = (delta, text, title) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'quantity-btn qty-step';
            button.textContent = text;
            button.title = title;
            button.addEventListener('click', () => {
                const min = Math.max(1, Number(input.min) || 0);
                const max = input.max !== '' && Number.isFinite(Number(input.max)) ? Number(input.max) : Infinity;
                const next = Math.min(max, Math.max(min, (parseInt(input.value, 10) || 0) + delta));
                if (String(next) === input.value) return;
                input.value = next;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
            });
            return button;
        };
        box.insertBefore(make(-1, '−', 'Уменьшить количество'), input);
        input.after(make(1, '+', 'Увеличить количество'));
    });
}

// «/» — переход в поиск раздела (если не печатаем в поле и не открыта карточка)
if (typeof document.addEventListener === 'function') {
    document.addEventListener('keydown', (event) => {
        if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
        const active = document.activeElement;
        if (active && (active.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName))) return;
        const modal = document.querySelector('#modalContainer');
        if (modal && modal.style.display === 'block' && modal.innerHTML.trim() !== '') return;
        const search = document.querySelector('.top-bar .search-input');
        if (!search) return;
        event.preventDefault();
        search.focus();
    });
    document.addEventListener('DOMContentLoaded', () => {
        const search = document.querySelector('.top-bar .search-input');
        if (search && window.matchMedia?.('(hover: hover) and (min-width: 1025px)').matches) {
            search.placeholder = 'Поиск… (нажмите /)';
        }
    });
}
