window.OrdersTemplates = class {

    static renderOrders(orders = []) {

        return orders.map(order =>{
            
            return `
            <tr>
                <td><strong>#${order.id}</strong>  |  ${order.created_at}</td>
                <td>${order.client.name}<br><small>${order.client_info}</small></td>
                <td>
                    ${order.products?.map(product => product.name).join(", ")}
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
                <td>${order.prepay}&nbsp;uah</td>
                <td>${order.postpay}&nbsp;uah</td>
                <td class="comment-cell">${order.comment}</td>
                
                <td class="total-status-cell">
                    <div class="total-status-wrapper">
                        <strong>${order.total}&nbsp;uah</strong>
                        <span class="badge badge-${order.status_tech_name}">${order.status}</span>
                    </div>
                </td>
                 
                <td>${order.manager_name}</td>
                <td>${order.pay_method_name}</td>
                <td class="actions-cell">
                    <div class="actions-wrapper">
                        
						<button class="btn btn-icon btn-secondary" onclick="window.showUniversalModal('orders',${order.id})" 
						 ${order.isEditable ? `title="Редактировать">✏️`: `title="Просмотр">👁️`}
                        </button>
						
<!--						     window.showUniversalModal('refunds', 0, {order.id})           -->
                        <button class="btn btn-icon btn-secondary" onclick="window.showUniversalModal('refunds', 0, ${order.id})" title="Возврат">🔄</button>
                        
						<button class="btn btn-icon btn-secondary" onclick="window.generateUniversalPDF('orders', ${order.id})" title="Печать">📠</button>
						
                    </div>
                </td>
            </tr>
            `

        }).join("");

    };

};