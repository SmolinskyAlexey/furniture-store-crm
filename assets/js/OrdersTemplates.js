window.OrdersTemplates = class {

    static renderOrders(orders = []) {

        return orders.map(order =>{
            
            return `
            <tr>
                <td>
                    <strong>#${order.id}</strong>  |  ${order.created_at}
                    <br>\n
                    <div class="actions-wrapper">
                        <button class="btn btn-icon btn-secondary" onclick="window.showUniversalModal('orders',${order.id})" 
                         ${order.isEditable ? `title="Редактировать">✏️`: `title="Просмотр">👁️`}
                        </button>
                        
                        <button class="btn btn-icon btn-secondary" onclick="window.showUniversalModal('refunds', 0, ${order.id})" title="Возврат">🔄</button>
                        
                        <button class="btn btn-icon btn-secondary" onclick="window.generateUniversalPDF('orders', ${order.id})" title="Печать">📠</button>
                    </div>
                </td>
                <td>${order.client_info}</td>
                <td>
                    ${order.products?.map(product => {
                            let prodHTML = '<div class=\'product-in-order\'>';
                            let attributesHTML = '';
                            if(product.attributes){
                                for (var i = 0; i < product.attributes.length; i++) {
                                    attributesHTML += '<div class="attr_row"><div class="attr_name">'+product.attributes[i].attribute_name+':&nbsp;</div><div class="attr_value">'+product.attributes[i].attribute_value+'</div></div>\n';
                                }
                            }
                            
                            prodHTML+='<span class="prod-name">'+product.name+'</span><div class="product-attributes">'+attributesHTML+'</div>';
                            prodHTML+='</div>';
                            return prodHTML;
                        }).join(" ")}
                <br/>
                <div class="photos-preview">
                    ${order.products?.map(product => {
						
						if (!product.images || product.images.length === 0) {return '';}
						
						return product.images.map(image => {
							// Используем preview если есть, иначе full
							const imageUrl = image.preview || image.full || '';
							return imageUrl ? `<img src="${imageUrl}" />` : '';
						}).join('');
						
					}).join("")}
                </div>
                </td>
                <td>
                        ${order.payments}
                </td>
                
                <td class="total-status-cell">
                    <div class="total-status-wrapper">
                        <strong>${order.total.toLocaleString('ru-RU')}&nbsp;₴</strong>
                        <span class="badge badge-${order.status_tech_name}">${order.status}</span>
                    </div>
                </td>
                 
                <td>${order.warehouse_name}<br>${order.manager_name}</td>

                <td>
                    ${order.services != 0 ? `${order.services}` : '-'}
                </td>

                <td class="comment-cell">${order.comment}</td>
            </tr>
            `

        }).join("");

    };

};