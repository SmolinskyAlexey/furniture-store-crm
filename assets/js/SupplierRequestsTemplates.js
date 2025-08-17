window.SupplierRequestsTemplates = class {



    static renderSupplierRequests (supplierRequests = []) {



        return supplierRequests.map(sRequest =>{



            return `

            <tr>

                <td><strong>#${sRequest.id}</strong></td>

                <td>${sRequest.order_id}</td>

                <td>${sRequest.manager_id}</td>

                <td>
                    ${sRequest.products?.map(product => product.name+" ("+product.quantity+")").join(", ")}
                <br/>
                <div class="photos-preview">
                    ${sRequest.products?.map(product => {
                        
                        if (!product.images || product.images.length === 0) {return '';}
                        
                        return product.images.map(image => {
                            // Используем preview если есть, иначе full
                            const imageUrl = image.preview || image.full || '';
                            return imageUrl ? `<img src="${imageUrl}" />` : '';
                        }).join('');
                        
                    }).join("")}
                </div>
                </td>

                <td>${sRequest.warehouse_dest_id}</td>

                <td>${sRequest.supplier_id}</td>

                <td>${sRequest.received_date}</td>

                <td>${sRequest.delivered_date}</td>

                <td><span class="badge badge-${sRequest.status}">${sRequest.status}</span></td>

                <td>${sRequest.comment}</td>

                <td>${sRequest.created_at}</td>

                <td class="actions-cell">
                    
                    <div class="actions-wrapper">
                   
                        <button class="btn btn-icon btn-secondary" onclick="window.showUniversalModal('supplier_requests',${sRequest.id})" title="Редактировать">✏️</button>
                    
                    </div>
                    
                </td>

            </tr>

            `



        }).join("");



    };



};