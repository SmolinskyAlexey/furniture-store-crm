window.WriteOffsTemplates = class {
    static renderWriteOffs(writeOffs = []) {
        return writeOffs.map(writeOff => {
            return `
            <tr>
                <td><strong>#${writeOff.id}</strong></td>
                <td>${writeOff.product_id}</td>
                <td>${writeOff.quantity}</td>
                <td>${writeOff.warehouse_id}</td>
                <td>${writeOff.reason}</td>
                <td>${writeOff.comment}</td>
                <td>${writeOff.manager_id}</td>
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