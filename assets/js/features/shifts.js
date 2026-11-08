function getShiftControlModal(shift) {
    const isOpen = shift?.status === 'open';
    //<br>Касса: <strong>${shift.cash.toLocaleString()} грн</strong>
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
            ? `Смена открыта в <strong>${shift.openedAt}</strong>`
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




window.showShift = (type = "show") => {

    if(type == "edit"){
        document.getElementById('pageTitle').textContent = 'Управление сменой';
        updateActiveMenuItem('showShift');
    }
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
                if(type == "edit"){
                    document.querySelector('#modalContainer').innerHTML = getShiftControlModal(json.shift);
                    document.querySelector('#modalContainer').style.display = 'block';
                }
                if(type == "show"){
                    window.showUniversalModal('shifts', json.shift.id);
                }
            } else {
                console.warn('Ошибка при загрузки смены');
                this.showNotification('Ошибка при закрузке смены');
            }
        })
        .catch(console.error);

};
// Открытие модального окна истории
function openShiftHistoryModal() {
    const html = getShiftHistoryModal();
    document.querySelector('#modalContainer').innerHTML = html;
    document.querySelector('#modalContainer').style.display = 'block';

    loadTodayCashMovements();//загружаем движения за сегодня

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
                    htmlWarehouses+= '<option value="'+json.list[i].id+'">'+json.list[i].name+'</option>';
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

    // Устанавливаем удобные даты по умолчанию (последние 7 дней)
    const to = new Date().toISOString().split('T')[0];
    const from = new Date();
    from.setDate(from.getDate() - 0);

    document.getElementById('dateFrom').value = from.toISOString().split('T')[0];
    document.getElementById('dateTo').value = to;
}

// Закрытие
function closeShiftHistoryModal() {
    document.querySelector('#modalContainer').style.display = 'none';
}

// Сброс формы (кнопка "Новый запрос")
function resetHistoryForm() {
    document.getElementById('historyForm').style.display = 'block';
    document.getElementById('historyResult').style.display = 'none';
    document.getElementById('historyResult').innerHTML = '';
}

// === 1. Показать конкретную смену ===
function loadSingleShiftFromHistory() {
    const id = document.getElementById('shiftIdInput').value.trim();
    if (!id) {
        showNotification('Введите ID смены', 'warning');
        return;
    }
    closeShiftHistoryModal();
    window.showUniversalModal('shifts', id);
}

// === 2. Движение средств за период ===
async function loadTodayCashMovements() {

    const body = document.getElementById('shiftHistoryBody');
    const resultDiv = document.getElementById('historyResult');
    const formDiv   = document.getElementById('historyForm');

    // Лоадер
    // formDiv.style.display = 'none';
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div style="text-align:center; padding:60px 20px;">
            <div class="loader"></div>
            <p style="margin-top:20px;">Загрузка движения средств...</p>
        </div>
    `;

    const formData = new FormData();
    formData.append('action', 'load_today_cash_movements');   // ← этот action нужно добавить на бэке

    try {
        const response = await fetch('/ajax/shifts/', {
            method: 'POST',
            body: formData
        });

        const html = await response.text();

        resultDiv.innerHTML = html;   // сервер должен вернуть готовый HTML (таблица + итоги)
    } catch (e) {
        resultDiv.innerHTML = `<p class="text-error">Ошибка загрузки отчёта</p>`;
    }
}

async function loadPeriodReport() {
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo   = document.getElementById('dateTo').value;

    if (!dateFrom || !dateTo) {
        showNotification('Укажите обе даты', 'error');
        return;
    }

    const body = document.getElementById('shiftHistoryBody');
    const resultDiv = document.getElementById('historyResult');
    const formDiv   = document.getElementById('historyForm');

    // Лоадер
    // formDiv.style.display = 'none';
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div style="text-align:center; padding:60px 20px;">
            <div class="loader"></div>
            <p style="margin-top:20px;">Загрузка движения средств...</p>
        </div>
    `;

    const formData = new FormData();
    formData.append('action', 'load_today_cash_movements');   //'load_period_report'
    formData.append('date_from', dateFrom);
    formData.append('date_to', dateTo);

    try {
        const response = await fetch('/ajax/shifts/', {
            method: 'POST',
            body: formData
        });

        const html = await response.text();

        resultDiv.innerHTML = html;   // сервер должен вернуть готовый HTML (таблица + итоги)
    } catch (e) {
        resultDiv.innerHTML = `<p class="text-error">Ошибка загрузки отчёта</p>`;
    }
}
function getShiftHistoryModal() {
    return `
        <div class="modal">
            <div class="modal-content shift-modal shift-history-modal">
                <div class="modal-header">
                    <h3 class="modal-title">Движение средств</h3>
                    <button class="modal-close" onclick="closeShiftHistoryModal()">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>

                <div class="modal-body" id="shiftHistoryBody">
                    <!-- Начальное состояние — форма ввода -->
                    <div id="historyForm">
                        <div class="" style="">

                            <!-- === 1. По периоду === -->
                            <!--
                            <div class="row" style="">
                                <h4 style="margin-bottom:15px;">Движение средств за период</h4>
                            </div>
                            -->
                            <div class="four-columns">
                                <div class="form-group">
                                    <label class="form-label">Дата с</label>
                                    <input type="date" id="dateFrom" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Дата по</label>
                                    <input type="date" id="dateTo" class="form-control">
                                </div>
                                <div class="form-group">
                                    <div class="select-warehouse">
                                        <label class="form-label">Склад:</label><br>
                                        <select name='warehouse_id' class="dropdown-filter new-row-whSelect">
                                        <option disabled>Загрузка...</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <br>
                                    <button class="btn btn-primary btn-block" onclick="loadPeriodReport()">
                                        Показать движение средств
                                    </button>
                                </div>
                            </div>


                        </div>
                    </div>
                    <br>
                    <!-- Сюда будет подгружаться результат (таблица / детализация) -->
                    <div id="historyResult" style="display:none;"></div>
                </div>
            </div>
        </div>
    `;
    /**
     *
     *  <!-- === 2. Конкретная смена === -->
                            <div style="flex:1; border-left: 1px solid #e5e5e5; padding-left:30px;">
                                <h4 style="margin-bottom:15px;">Конкретная смена</h4>
                                <div class="form-group">
                                    <label class="form-label">ID смены</label>
                                    <input type="text" id="shiftIdInput" class="form-control" placeholder="Например: 1247">
                                </div>
                                <div class="form-group">
                                    <br>
                                    <button class="btn btn-primary btn-block" onclick="loadSingleShiftFromHistory()">
                                        Показать смену
                                    </button>
                                </div>
                            </div>
                            **/
}
function closeShiftModal() {
    document.querySelector('#modalContainer').innerHTML = '';
    document.querySelector('#modalContainer').style.display = 'none';

}
