// === Функция инициализации автокомплита для одного инпута ===
function initAutocomplete(input) {
    if (input.dataset.autocompleteInitialized === 'true') return;
    input.dataset.autocompleteInitialized = 'true';

    let dropdown = null;
    let selectedIndex = -1;
    let items = [];
    let xhr = null;

    // Создание dropdown
    function createDropdown() {
      if (dropdown) return dropdown;

      dropdown = document.createElement('ul');
      dropdown.className = 'autocomplete-dropdown';
      document.body.appendChild(dropdown);

      positionDropdown();
      return dropdown;
    }

    // Позиционирование
    function positionDropdown() {
      if (!dropdown) return;
      const rect = input.getBoundingClientRect();
      dropdown.style.width = rect.width + 'px';
      dropdown.style.left = rect.left + window.scrollX + 'px';
      dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
    }

    function showDropdown() {
      if (!dropdown) createDropdown();
      dropdown.style.display = 'block';
      positionDropdown();
    }

    function hideDropdown() {
      if (dropdown) dropdown.style.display = 'none';
      selectedIndex = -1;
      items = [];
    }

    function renderItems(data) {
      if (!dropdown) createDropdown();
      dropdown.innerHTML = '';

      if (!data || data.length === 0) {
        const li = document.createElement('li');
        li.className = 'autocomplete-item';
        li.textContent = 'Ничего не найдено';
        li.style.color = '#999';
        li.style.cursor = 'default';
        dropdown.appendChild(li);
        showDropdown();
        return;
      }

      items = data;
      data.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'autocomplete-item';
        li.textContent = typeof item === 'string' ? item : (item.value || item.name || item);
        li.dataset.index = index;

        li.addEventListener('click', () => {
          input.value = li.textContent;
          hideDropdown();
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });

        li.addEventListener('mouseenter', () => {
          selectItem(index);
        });

        dropdown.appendChild(li);
      });

      selectedIndex = -1;
      showDropdown();
    }

    function selectItem(index) {
      const prev = dropdown.querySelector('.selected');
      if (prev) prev.classList.remove('selected');

      selectedIndex = index;
      const current = dropdown.querySelector(`[data-index="${index}"]`);
      if (current) {
        current.classList.add('selected');

        // Прокрутка
        const dropdownRect = dropdown.getBoundingClientRect();
        const itemRect = current.getBoundingClientRect();
        if (itemRect.bottom > dropdownRect.bottom) {
          dropdown.scrollTop += itemRect.bottom - dropdownRect.bottom + 5;
        } else if (itemRect.top < dropdownRect.top) {
          dropdown.scrollTop -= dropdownRect.top - itemRect.top + 5;
        }
      }
    }

    function fetchAttributes(query) {
      if (xhr) xhr.abort();

      const attributeId = input.dataset.attributeId || input.getAttribute('data-index');
      if (!attributeId) return;

      const url = '/ajax/attributes/'; // POST action

      // Формируем данные для POST
      const formData = new FormData();
      formData.append('action', 'autocomplete_attribute');
      formData.append('attribute_id', attributeId);
      formData.append('q', query);

      xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      // Не устанавливаем Content-Type — браузер сам поставит multipart/form-data с границей

      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            renderItems(data);
          } catch (e) {
            console.error('JSON parse error:', e);
            renderItems([]);
          }
        } else {
          console.warn('Server error:', xhr.status, xhr.statusText);
          renderItems([]);
        }
      };

      xhr.onerror = () => {
        console.error('Request failed');
        renderItems([]);
      };

      xhr.send(formData);
    }

    // === Обработчики ===
    let timeout = null;
    input.addEventListener('input', function () {
      const query = input.value.trim();
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (query.length >= 1) {
          fetchAttributes(query);
        } else {
          hideDropdown();
        }
      }, 300);
    });

    input.addEventListener('keydown', function (e) {
      if (!dropdown || dropdown.style.display === 'none') return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectItem((selectedIndex + 1) % items.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectItem(selectedIndex <= 0 ? items.length - 1 : selectedIndex - 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          const selectedItem = dropdown.querySelector(`[data-index="${selectedIndex}"]`);
          input.value = selectedItem.textContent;
          hideDropdown();
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      } else if (e.key === 'Escape') {
        hideDropdown();
      }
    });

    input.addEventListener('focus', function () {
      if (input.value.trim().length >= 1) {
        fetchAttributes(input.value.trim());
      }
    });

    // Скрытие при клике вне
    const clickOutsideHandler = function (e) {
      if (!input.contains(e.target) && dropdown && !dropdown.contains(e.target)) {
        hideDropdown();
      }
    };
    document.addEventListener('click', clickOutsideHandler);

    // Перепозиционирование
    const reposition = () => positionDropdown();
    window.addEventListener('scroll', reposition);
    window.addEventListener('resize', reposition);

    // Очистка при удалении инпута
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          const removed = Array.from(mutation.removedNodes);
          if (removed.some(node => node === input || node.contains(input))) {
            if (dropdown && dropdown.parentNode) {
              dropdown.parentNode.removeChild(dropdown);
            }
            document.removeEventListener('click', clickOutsideHandler);
            window.removeEventListener('scroll', reposition);
            window.removeEventListener('resize', reposition);
            observer.disconnect();
            break;
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

// === Инициализация существующих инпутов ===
function initAllExisting() {
    document.querySelectorAll('.autocomplete-attributes').forEach(input => {
      if (!input.dataset.autocompleteInitialized) {
        initAutocomplete(input);
      }
    });
}

// === Отслеживание новых инпутов ===
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element
            if (node.matches && node.matches('.autocomplete-attributes')) {
              initAutocomplete(node);
            }
            // Проверяем вложенные
            if (node.querySelectorAll) {
              node.querySelectorAll('.autocomplete-attributes').forEach(input => {
                if (!input.dataset.autocompleteInitialized) {
                  initAutocomplete(input);
                }
              });
            }
          }
        });
      }
    }
});

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    initAllExisting();
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
});

// === Глобальная функция для ручного вызова (если нужно) ===
window.initAutocomplete = initAutocomplete;
window.initAllAutocompletes = initAllExisting;
