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
                    <div class="form-group width-100">
                        <div class="form-label">Касса</div>
                        <select placeholder="..." class="form-input select-payment-method" name="payment_method" id="cash_op_payment_method"></select>
                    </div>
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
    fillSelectPaymentMethod();
}

function removeCash() {

    document.querySelector('#modalContainer').innerHTML = getCashOperationModal('remove');
    document.querySelector('#modalContainer').style.display = 'block';
    fillSelectPaymentMethod();
}

function fillSelectPaymentMethod(){
    const formData = new FormData();
    formData.append('action', 'get-payment-methods-list');
    fetch('/ajax/shifts/', {
        method: 'POST',
        body: formData,
    }).then(response => response.json())
    .then(json => {
        if(json.ok == '1'){
            let htmlWarehouses = '';
            if(json.list){
                htmlWarehouses += '<option value="all">Выберите кассу</option>';
                for (var i = 0; i < json.list.length; i++) {
                    htmlWarehouses+= '<option value="'+json.list[i].id+'">'+json.list[i].name+'</option>';
                }
                let needSelectFillWarehouse = document.querySelectorAll(".select-payment-method");
                for (var i = 0; i < needSelectFillWarehouse.length; i++) {
                    if(needSelectFillWarehouse[i].value == "" || needSelectFillWarehouse[i].value == null){
                        needSelectFillWarehouse[i].innerHTML = htmlWarehouses;
                    }
                }
            }
        }
    }).catch(console.error);
}


function submitCashOperation(type) {

    const amount = parseFloat(document.getElementById('cashAmount').value || 0);
    const comment = document.getElementById('cashComment').value.trim();
    const payment_method = document.getElementById('cash_op_payment_method').value || 0;

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
            payment_method: payment_method
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
