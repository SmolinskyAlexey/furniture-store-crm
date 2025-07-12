document.addEventListener('DOMContentLoaded', () => {
  const productsBlock = document.getElementById('products');
  const paginationBlock = document.getElementById('pagination');
  const searchInput = document.getElementById('search-input');
  const resetBtn = document.getElementById('reset-filters');
  const orderPopup = document.getElementById('order-popup');
  const orderForm = document.getElementById('order-form');

  let currentPage = 1;

  // Функция для получения выбранных фильтров
  function getSelectedFilters() {
    const filters = {
      attributes: {}
    };

    const selectedCategory = document.querySelector('input[name="category_id"]:checked');
    if (selectedCategory) {
      filters.category_id = selectedCategory.value;
      
      // Подсветка выбранного фильтра
      document.querySelectorAll('.filter-item input[name="category_id"]').forEach(input => {
        input.closest('.filter-item').classList.toggle('active', input.checked);
      });
    }

    document.querySelectorAll('#attributes-filter input[type="checkbox"]').forEach(input => {
      const attrId = input.dataset.attr;
      if (input.checked) {
        if (!filters.attributes[attrId]) {
          filters.attributes[attrId] = [];
        }
        filters.attributes[attrId].push(input.value);
        
        // Подсветка выбранного фильтра
        input.closest('.filter-item').classList.add('active');
      } else {
        input.closest('.filter-item').classList.remove('active');
      }
    });

    return filters;
  }

  // Загрузка товаров с сервера
  function loadProducts(page = 1) {
    productsBlock.innerHTML = '<div class="loading">Загрузка товаров...</div>';
    
    const filters = getSelectedFilters();
    const search = searchInput.value;

    fetch('ajax.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_products', page, search, filters })
    })
      .then(res => res.json())
      .then(data => {
        renderProducts(data.items);
        renderPagination(data.page, data.total_pages);
      })
      .catch(err => {
        productsBlock.innerHTML = '<div class="error">Ошибка загрузки товаров</div>';
        console.error(err);
      });
  }

  // Отображение товаров
  function renderProducts(items) {
    productsBlock.innerHTML = '';
    
    if (!items.length) {
      productsBlock.innerHTML = '<div class="no-results">Товары не найдены</div>';
      return;
    }
    
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'product-card';
      
      // Проверяем наличие (пример логики, должно работать с backend)
      const inStock = true; // В реальной ситуации это значение должно приходить с сервера
      
      card.innerHTML = `
        <div class="product-image">
          <img src="${item.image}" alt="${item.name}">
          ${inStock ? '<span class="product-stock">В наличии</span>' : ''}
        </div>
        <div class="product-content">
          <h4 class="product-title">${item.name}</h4>
          <p class="product-description">${item.description || 'Нет описания'}</p>
          <div class="product-footer">
            <button class="btn-order" data-product-id="${item.id}">Заказать</button>
          </div>
        </div>
      `;
      
      productsBlock.appendChild(card);
    });
  }

  // Отображение пагинации
  function renderPagination(current, total) {
    paginationBlock.innerHTML = '';
    
    if (total <= 1) return;
    
    // Кнопка "Назад"
    if (current > 1) {
      createPaginationButton('&laquo;', current - 1);
    }
    
    // Номера страниц
    let startPage = Math.max(1, current - 2);
    let endPage = Math.min(total, startPage + 4);
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      createPaginationButton(i, i, i === current);
    }
    
    // Кнопка "Вперед"
    if (current < total) {
      createPaginationButton('&raquo;', current + 1);
    }
  }
  
  // Создание кнопки пагинации
  function createPaginationButton(text, page, isActive = false) {
    const btn = document.createElement('button');
    btn.className = 'pagination-btn';
    btn.innerHTML = text;
    
    if (isActive) {
      btn.disabled = true;
    } else {
      btn.addEventListener('click', () => {
        currentPage = page;
        loadProducts(page);
        
        // Прокрутка страницы вверх
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
    
    paginationBlock.appendChild(btn);
  }

  // События поиска
  searchInput.addEventListener('input', debounce(() => {
    currentPage = 1;
    loadProducts(1);
  }, 500));
  
  // Сброс фильтров
  resetBtn.addEventListener('click', () => {
    document.querySelectorAll('.catalog__filters input[type="radio"]').forEach(i => i.checked = false);
    document.querySelectorAll('.catalog__filters input[type="checkbox"]').forEach(i => i.checked = false);
    document.querySelectorAll('.filter-item').forEach(i => i.classList.remove('active'));
    searchInput.value = '';
    currentPage = 1;
    loadProducts(1);
  });
  
  // Обработчики для фильтров
  document.body.addEventListener('change', (e) => {
    if (e.target.matches('.catalog__filters input')) {
      currentPage = 1;
      loadProducts(1);
    }
  });
  
  // Функция для задержки отправки запроса при поиске
  function debounce(func, delay) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  }
  
  // Аккордеон для фильтров
  function initFilterAccordions() {
    document.querySelectorAll('.filter-group__header').forEach(header => {
      header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        header.classList.toggle('collapsed');
        content.classList.toggle('collapsed');
      });
    });
  }
  
  // Загрузка фильтров
  function loadFilters() {
    fetch('ajax.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_filters' })
    })
      .then(response => response.json())
      .then(data => {
        renderCategoryFilter(data.categories);
        renderAttributeFilters(data.attributes);
        initFilterAccordions();
      })
      .catch(err => {
        console.error('Ошибка загрузки фильтров:', err);
      });
  }

  // Рендеринг фильтров категорий
  function renderCategoryFilter(categories) {
    const container = document.getElementById('category-filter');
    container.innerHTML = `
      <div class="filter-group__header">
        <span>Категория</span>
        <span class="toggle-icon">&#9662;</span>
      </div>
      <div class="filter-group__content">
      </div>
    `;
    
    const content = container.querySelector('.filter-group__content');
    
    categories.forEach(cat => {
      const item = document.createElement('div');
      item.className = 'filter-item';
      item.innerHTML = `
        <input type="radio" name="category_id" id="cat-${cat.id}" value="${cat.id}">
        <label for="cat-${cat.id}">${cat.title}</label>
      `;
      content.appendChild(item);
    });
  }

  // Рендеринг фильтров атрибутов
  function renderAttributeFilters(attributes) {
    const container = document.getElementById('attributes-filter');
    container.innerHTML = '';

    attributes.forEach(attr => {
      const group = document.createElement('div');
      group.className = 'filter-group';
      
      group.innerHTML = `
        <div class="filter-group__header">
          <span>${attr.title}</span>
          <span class="toggle-icon">&#9662;</span>
        </div>
        <div class="filter-group__content">
        </div>
      `;
      
      const content = group.querySelector('.filter-group__content');

      attr.values.forEach(val => {
        const item = document.createElement('div');
        item.className = 'filter-item';
        item.innerHTML = `
          <input type="checkbox" id="attr-${attr.id}-${val.id}" data-attr="${attr.id}" value="${val.value}">
          <label for="attr-${attr.id}-${val.id}">${val.title}</label>
        `;
        content.appendChild(item);
      });

      container.appendChild(group);
    });
  }

  // Обработка открытия попапа заказа
  document.addEventListener('click', function(e) {
    // Кнопка заказа
    if (e.target.closest('.btn-order')) {
      const card = e.target.closest('.product-card');
      const productName = card.querySelector('.product-title').textContent;
      document.getElementById('order-product-name').value = productName;
      document.getElementById('order-popup').classList.remove('hidden');
      document.getElementById('order-popup').classList.add('visible');
      document.querySelector('.order-form-container').style.display = 'block';
      document.querySelector('.success-container').style.display = 'none';
    }
    
    // Закрытие попапа
    if (e.target.closest('.popup__close') || (e.target.classList.contains('popup') && !e.target.closest('.popup__content'))) {
      closePopup();
    }
  });

  // Функция закрытия попапа
  function closePopup() {
    orderPopup.classList.remove('visible');
    setTimeout(() => {
      orderPopup.classList.add('hidden');
      orderForm.reset();
    }, 300);
  }

  // Отправка формы заказа
  orderForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    
    document.querySelector('.btn-submit').disabled = true;
    document.querySelector('.btn-submit').textContent = 'Отправка...';

    fetch('ajax.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send_order',
        name: formData.get('name'),
        phone: formData.get('phone'),
        product_name: formData.get('product_name')
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Показываем анимацию успешной отправки
          document.querySelector('.order-form-container').style.display = 'none';
          document.querySelector('.success-container').style.display = 'block';
          
          // Закрываем попап через 3 секунды
          setTimeout(() => {
            closePopup();
          }, 3000);
        } else {
          throw new Error(data.error || 'Ошибка при отправке');
        }
      })
      .catch(err => {
        alert('Ошибка при отправке заявки: ' + err.message);
      })
      .finally(() => {
        document.querySelector('.btn-submit').disabled = false;
        document.querySelector('.btn-submit').textContent = 'Отправить';
      });
  });

  // Инициализация
  loadFilters();
  loadProducts();
});



