window.SupplierRequestsTemplates = class {



    static renderSupplierRequests (supplierRequests = []) {



        return supplierRequests.map(sRequest =>{

            const escapeHtml = value => String(value ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
            const orderInfoLines = String(sRequest.order_html_info || '').replace(/<br\s*\/?>/gi, '\n').split('\n');
            const orderInfoMatch = (orderInfoLines.shift() || '').match(/^(№\s*\d+)(.*)$/);
            const orderLabel = orderInfoMatch ? orderInfoMatch[1] : '';
            const orderMeta = orderInfoMatch ? orderInfoMatch[2].trim() : '';


            return `

            <tr>

                <td>
                    <strong>#${sRequest.id}</strong>
                    <div class="actions-wrapper">
                        <button class="btn btn-icon btn-secondary" onclick="window.showUniversalModal('supplier_requests',${sRequest.id})" title="Редактировать">✏️</button>
                    </div>
                    ${sRequest.created_at ? `<div>${escapeHtml(sRequest.created_at)}</div>` : ''}
                </td>

                <td>${Number(sRequest.order_id) > 0 ? `<a href="#" class="row-link" style="color:#2563eb;font-weight:700" title="Просмотр заказа" onclick="event.preventDefault();event.stopPropagation();window.showUniversalModal('orders',${Number(sRequest.order_id)})">${escapeHtml(orderLabel || `№ ${Number(sRequest.order_id)}`)}</a>${orderMeta ? `<div>${escapeHtml(orderMeta)}</div>` : ''}${orderInfoLines.filter(line => line.trim()).map(line => `<div>${escapeHtml(line.trim())}</div>`).join('')}` : '—'}</td>

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

                <td>${ui.money(sRequest.total_amount)}</td>

                <td>${sRequest.supplier_id}</td>

                <td><span class="badge badge-${sRequest.status}">${ui.name(sRequest.status)}</span><br>\n${ui.v(sRequest.received_date)}</td>

                <td>${ui.v(sRequest.comment)}</td>

            </tr>

            `



        }).join("");



    };



};
