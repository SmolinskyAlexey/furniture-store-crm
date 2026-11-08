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
    if (objectType === 'orders' && !window.validateOrderPaymentDates(form, true)) return;
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
    console.log(formData);
    try {
        const response = await fetch('/ajax/' + objectType + '/', {
            method: 'POST',
            body: formData,
        });

        // Проверяем, действительно ли ответ JSON
        const contentType = response.headers.get('content-type');
        let result;
        let text;

        try {
            text = await response.text();
            result = JSON.parse(text);
        } catch (error) {
            alert('Ответ сервера не в формате JSON:\n\n' + text ?? '');
            throw new Error('Ответ сервера не JSON');
        }

        if (!response.ok || result.status === 'error') {
            if (objectType === 'orders') window.validateOrderPaymentDates(form, true);
            throw new Error(result.error || 'Ошибка при сохранении данных');
        }

        window.closeUniversalModal();
        this.showNotification("Success", 'success');
        // if(objectType != "catalog"){
            // setTimeout(() => window.location.reload(), 500);
        // }

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
window.createCatalogProductFast = async (event, add_act = 'add') => {

    const container = event.target.closest('fieldset');
    const modalBody = container.querySelector('.modal-body');
    const submitButton = container.querySelector('button[type="submit"]');

    const nameInput = container.querySelector('input[name="name"]');
    const categoryInput = container.querySelector('select[name="category_id"]');

    if(nameInput){
        // Сбрасываем стили ошибки
        nameInput.style.borderColor = '';

        // Проверяем поле name
        if (!nameInput.value.trim()) {
            nameInput.style.borderColor = 'red';
            nameInput.placeholder = 'Это поле обязательно для заполнения!';
            nameInput.focus();

            // Восстанавливаем стиль при любом вводе (однократно)
            nameInput.addEventListener('input', function restore() {
                nameInput.style.borderColor = '';
                nameInput.placeholder = '...';
                nameInput.removeEventListener('input', restore);
            }, { once: true }); // Обработчик сработает только один раз

            return;
        }
    }

    if(categoryInput){
        // Сбрасываем стили ошибки
        categoryInput.style.borderColor = '';

        // Проверяем поле category
        if ( !categoryInput.value.trim() || categoryInput.value === "0" ) {
            categoryInput.style.borderColor = 'red';
            categoryInput.placeholder = 'Это поле обязательно для заполнения!';
            categoryInput.focus();

            // Восстанавливаем стиль при любом вводе (однократно)
            categoryInput.addEventListener('input', function restore() {
                categoryInput.style.borderColor = '';
                categoryInput.placeholder = '...';
                categoryInput.removeEventListener('input', restore);
            }, { once: true }); // Обработчик сработает только один раз

            return;
        }
    }

    // Блокируем кнопку и показываем прелоадер
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.classList.add('button-loading');
    }
    modalBody.classList.add('modal-loading');

    // Создаём FormData из всей формы
    const formData = new FormData();

    let is_price = !modalBody.classList.contains('modal-body--supplier');

    container.querySelectorAll('input, textarea, select').forEach(el => {
        if (el.name) { // важно, чтобы было имя, иначе в FormData не добавится
            if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) {
                // не добавляем неотмеченные чекбоксы/радио
                return;
            }
            formData.append(el.name, el.value);
        }
    });

    formData.set('action', add_act);



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

        selectProductFromPopup(result.id, (is_price ? result.price_last : result.source_price_last), result.name, url_img, formData.get('supplier_id'), formData.get('new_prod_warehouse_id'), (result.source_price_last ? result.source_price_last : null) );

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
