function closeFiltersModal(){
    document.querySelector("#modal-filters").style.display = 'none';
}

function showFiltersModal(){
    document.querySelector("#modal-filters").style.display = 'block';
}
// Обработчик клика для фильтр-чипов
document.addEventListener('click', function(event) {
    // Ищем ближайший элемент .filter-chip от кликнутого элемента
    const filterChip = event.target.closest('.filter-chip');

    // Если клик был по .filter-chip или его span
    if (filterChip) {
        // Проверяем, не был ли клик по кнопке внутри чипа
        const isButtonClick = event.target.closest('button') !== null;

        // Если клик не по кнопке, выполняем функцию
        if (!isButtonClick) {
            showFiltersModal();
        }
    }
});

function resetFilters() {
   // Сброс всех select
    document.querySelectorAll('.filter-item select').forEach(select => {
        select.selectedIndex = 0;
        // вручную генерируем событие 'change'
        select.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Сброс текстовых полей
    document.querySelectorAll('.filter-item input[type="text"]').forEach(input => {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Сброс чекбоксов
    document.querySelectorAll('.filter-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Сброс date-полей
    document.querySelectorAll('.filter-item input[type="date"]').forEach(dateInput => {
        dateInput.value = '';
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    updateProductListForSelectModal();
}
updateActiveFilters();

function updateActiveFilters() {
    const container = document.querySelector('.active-filters .active-filters-value');
    if (!container) return;

    container.innerHTML = ''; // очищаем старые фильтры

    // Обрабатываем SELECT
    document.querySelectorAll('.filter-item select').forEach(select => {
        if (select.closest('.select-warehouse-choose-prod')) {
            return; // пропускаем этот элемент
        }
        const selectedOption = select.options[select.selectedIndex];
        if (selectedOption && selectedOption.value !== 'all' && selectedOption.value !== '') {
            const label = document.querySelector(`label[for="${select.id}"]`);
            const title = label ? label.textContent.trim() : select.id;

            const chip = createFilterChip(title, selectedOption.text, () => {
                select.selectedIndex = 0;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                updateActiveFilters();
            });
            container.appendChild(chip);
        }
    });

    // Обрабатываем CHECKBOX
    document.querySelectorAll('.filter-item input[type="checkbox"]').forEach(checkbox => {
        if (checkbox.checked) {
            const label = document.querySelector(`label[for="${checkbox.id}"]`);
            const title = label ? label.textContent.trim() : checkbox.id;

            const chip = createFilterChip(title, 'Включено', () => {
                checkbox.checked = false;
                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                updateActiveFilters();
            });
            container.appendChild(chip);
        }
    });

    // Обрабатываем DATE
    document.querySelectorAll('.filter-item input[type="date"]').forEach(dateInput => {
        if (dateInput.value) {
            const label = document.querySelector(`label[for="${dateInput.id}"]`);
            const title = label ? label.textContent.trim() : dateInput.id;

            const chip = createFilterChip(title, dateInput.value, () => {
                dateInput.value = '';
                dateInput.dispatchEvent(new Event('change', { bubbles: true }));
                updateActiveFilters();
            });
            container.appendChild(chip);
        }
    });

    // Обрабатываем TEXT INPUT
    document.querySelectorAll('.filter-item input[type="text"]').forEach(textInput => {
        if (textInput.value.trim() !== '') {
            const label = document.querySelector(`label[for="${textInput.id}"]`);
            const title = label ? label.textContent.trim() : textInput.id;

            const chip = createFilterChip(title, textInput.value.trim(), () => {
                textInput.value = '';
                textInput.dispatchEvent(new Event('input', { bubbles: true }));
                updateActiveFilters();
            });
            container.appendChild(chip);
        }
    });

    // Если фильтров нет — можно скрыть блок
    const activeFilters = document.querySelector('.active-filters');
    if (container.children.length === 0) {
        activeFilters.style.display = 'none';
    } else {
        activeFilters.style.display = 'flex';
    }
}

// Вспомогательная функция для создания "чипа"
function formatDate(dateString) {
    // Разделяем строку на части
    const [year, month, day] = dateString.split('-');
    // Возвращаем в формате ДД.ММ.ГГГГ
    return `${day}.${month}.${year}`;
}

function createFilterChip(label, value, onRemove) {
    const chip = document.createElement('div');
    chip.className = 'filter-chip';

    const span = document.createElement('span');

    // Проверяем, является ли значение датой (формат YYYY-MM-DD)
    if ((label === 'Created_at' || label === 'Date') && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        span.textContent = `${label}: ${formatDate(value)}`;
    } else {
        span.textContent = `${label}: ${value}`;
    }

    const btn = document.createElement('button');
    btn.className = 'filter-chip-close';
    btn.textContent = '×';
    btn.addEventListener('click', onRemove);

    chip.appendChild(span);
    chip.appendChild(btn);
    return chip;
}

document.querySelectorAll('.filter-item select, .filter-item input').forEach(el => {
    el.addEventListener('change', updateActiveFilters);
    el.addEventListener('input', updateActiveFilters);
});
