window.ProductSelectModal = class {


    static renderProductsStep(products = [], categories = [], selectedProducts = []) {
        const categoryTabs = categories.map(cat =>
            `<button class="category-tab" data-category="${cat.id}">${cat.name}</button>`
        ).join('');

        const productCards = products.map(product => {
            const selected = selectedProducts.find(p => p.id === product.id);
            const quantity = selected ? selected.quantity : 0;

            return `
                <div class="product-card ${quantity > 0 ? 'selected' : ''}" data-id="${product.id}">
                    <div class="product-image"> 
                        <img class="img-product-order" src="${product.image}">
                    </div> 
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>      
                    </div>
                    <!-- -->
                    <div class="product-card-right-container">
                        <div class="product-card-right-container-block">
                            <div class="product-price">${product.price.toLocaleString()}&nbsp;грн</div>                  
                            <div class="product-actions">
                        ${quantity > 0 ? `

                            <div class="quantity-control active">

                                <button class="quantity-btn" onclick="orderWizard.changeQuantity(${product.id}, -1)" 

                                        title="Уменьшить количество">−</button>

                                <input type="number" class="quantity-input" value="${quantity}" min="0" max="${product.stock}"

                                       onchange="orderWizard.setQuantity(${product.id}, this.value)"

                                       onclick="this.select()">

                                <button class="quantity-btn" onclick="orderWizard.changeQuantity(${product.id}, 1)" 

                                        title="Увеличить количество">+</button>

                            </div>

                        ` : `
                            <button class="btn btn-primary add-product-btn"               
                                    data-product-id="${product.id}" 
                                    title="Добавить в заказ">
                                <span class="btn-icon">+</span>
                                <span class="btn-text">Добавить</span>
                            </button>
                        `}
                        </div>     
                        </div>
                        <div class="product-details">В наличии: ${product.stock}&nbsp;шт</div> 
                    </div>
                    <!-- -->
                </div>
            `;

        }).join('');

        const stepLabel = document.querySelector('.step-label');
        if (selectedProducts.length > 0) {
            stepLabel.innerHTML = `Товары&nbsp;(${selectedProducts.length}&nbsp;выбрано)`;
        }
        else {
            stepLabel.innerHTML = `Товары`;
        }

        return `
            <div class="products-step">
                <div class="category-bar">
                    <div class="category-tabs">
                        <button class="category-tab active" data-category="all">
                            <span class="tab-icon">📦</span>
                            <span class="tab-text">Все товары</span>
                        </button>       
                            
                        ${categoryTabs}
                    
                    </div>     
                    <div class="search-container">
                        <div class="product-search-bar">
                            <input type="text" class="search-input-with-clear search-input" placeholder="Поиск...">
                            <button class="clear-btn" type="button">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
                                </svg>
                            </button>
                            <button class="search-btn" type="submit">🔍</button>
                        </div>
                    </div>       
                </div>
            <div class="product-not-found">
                ${!products?.length ? "Товары не найдены" : ""}
            </div>
            
            <div class="product-grid animate-slide-up" id="productGrid">
            <!-- Карточки товаров -->
                ${productCards}
            </div>
                
            <!-- Пагинация карточек товаров -->  
           
            <div class="table-pagination ${!products?.length ? 'hidden': ''} " id="order-products-pagination">
                <svg class="prev-arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="black" viewBox="0 0 24 24" style="cursor: pointer;">
                    <path d="M11.41 7.41 10 6l-6 6 6 6 1.41-1.41L7.83 12l3.58-4.59z"></path>
                    <path d="M17.41 7.41 16 6l-6 6 6 6 1.41-1.41L13.83 12l3.58-4.59z"></path>
                </svg>
                <span class="page-indicator">стр 1 из 1</span>
                <svg class="next-arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="black" viewBox="0 0 24 24" style="cursor: pointer;">
                    <path d="M12.59 16.59 14 18l6-6-6-6-1.41 1.41L16.17 12l-3.58 4.59z"></path>
                    <path d="M6.59 16.59 8 18l6-6-6-6-1.41 1.41L10.17 12l-3.58 4.59z"></path>
                </svg>
            </div>

                ${selectedProducts.length > 0 ? this.renderOrderSummary(selectedProducts) : ''}

            </div>
        `;
    }





}