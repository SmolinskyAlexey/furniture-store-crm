// ContractorsTemplates.js
window.ContractorsTemplates = class {
    static renderContractors(contractors = []) {
        return contractors.map(contractor => {
            return `
            <tr>
                <td><strong>#${contractor.id}</strong></td>
                <td>${contractor.name}</td>
                <td>${contractor.phone || '-'}</td>
                <td>${contractor.email || '-'}</td>
                <td>${contractor.comment || '-'}</td>
                <td>${contractor.group_id || '-'}</td>
                <td>${contractor.total_debt || '-'}</td>
                <td>${contractor.created_at}</td>
                <td class="actions-cell">
                    <div class="actions-wrapper">
                        <button class="btn btn-icon btn-secondary" onclick="window.showUniversalModal('contractors',${contractor.id})" title="Редактировать">✏️</button>
                    </div>
                </td>
            </tr>
            `;
        }).join("");
    };
};