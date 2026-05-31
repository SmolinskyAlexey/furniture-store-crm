window.SupplierRequestsTemplates = class {



    static renderSupplierRequests (supplierRequests = []) {



        return supplierRequests.map(sRequest =>{


            return `

            <tr>

                <td>
                    <strong>#${sRequest.id}</strong> | ${sRequest.created_at}<br>\n
                    <div class="actions-wrapper">
                        <button class="btn btn-icon btn-secondary" onclick="window.showUniversalModal('supplier_requests',${sRequest.id})" title="Редактировать">✏️</button>
                    </div>
                </td>

                <td title="Просмотр заказа" onclick="window.showUniversalModal('orders',${sRequest.order_id})">${sRequest.order_html_info}</td>

                <td>${sRequest.manager_id}<br>\n${sRequest.warehouse_dest_id}</td>

                <td>
                    ${sRequest.products?.slice(0, 3).map(product => { 
                        // Формируем строку характеристик
                        const attributesText = product.attributes
                        ?.map(attr => 
                            `<span class="attr_name">${attr.attribute_name}</span>: <span class="attr_value">${attr.attribute_value}</span>`
                        )
                        ?.join(" | ") || "";
                        // Собираем полную информацию о продукте
                        let productInfo = `<span class="prod-name">${product.name} (${product.quantity})</span>`;
                      
                        // Добавляем характеристики, если они есть
                        if (attributesText) {
                            productInfo += `<br>${attributesText}`;
                        }
                      
                        return '<div class="product-in-order">'+productInfo+'</div>'; 
                    }).join("\n ")}
                    ${sRequest.products?.length > 3 ? `... и еще ${sRequest.products.length - 3}&nbsp;товаров` : ''}
                <br/>
                <div class="photos-preview">
                    ${sRequest.products?.slice(0, 3).map(product => {
                        
                        if (!product.images || product.images.length === 0) {return '';}
                        
                        return product.images.map(image => {
                            // Используем preview если есть, иначе full
                            const imageUrl = image.preview || image.full || '';
                            return imageUrl ? `<img src="${imageUrl}" />` : '';
                        }).join('');
                        
                    }).join("")}
                </div>
                </td>

                <td>${sRequest.supplier_id}</td>

                <td><span class="badge badge-${sRequest.status}">${sRequest.status}</span><br>\n${sRequest.received_date}</td>

                <td>${sRequest.comment}</td>

            </tr>

            `



        }).join("");



    };



};