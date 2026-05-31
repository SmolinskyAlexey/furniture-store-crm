window.WriteOffsTemplates = class {
    static renderWriteOffs(writeOffs = []) {
        return writeOffs.map(writeOff => {
            return `
            <tr>
                <td><strong>#${writeOff.id}</strong></td>
                <td>
                ${writeOff.products?.map(product => {
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
                </td> 
                <td>${writeOff.quantity}</td>
                <td>${writeOff.warehouse_name}</td>
                <td>${writeOff.reason}</td>
                <td>${writeOff.comment}</td>
                <td>${writeOff.manager_name}</td>
                <td>${writeOff.created_at}</td>
                <td class="actions-cell">
                    <div class="actions-wrapper">
                        <button class="btn btn-icon btn-secondary" onclick="window.showUniversalModal('write_offs',${writeOff.id})" title="Редактировать">✏️</button>
                    </div>
                </td>
            </tr>
            `;
        }).join("");
    };
}; 