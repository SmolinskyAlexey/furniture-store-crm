// ServicesTemplates.js
window.ServicesTemplates = class {
    static renderServices(services = []) {
        return services.map(service => {
            return `
            <tr>
                <td><strong>#${service.id}</strong></td>
                <td>${service.service_type || '-'}</td>
                <td>${service.name}</td>
                <td>${service.created_at}</td>
                <td>${service.updated_at || '-'}</td>
                <td class="actions-cell">
                    <div class="actions-wrapper">
                        <button class="btn btn-icon btn-secondary" onclick="window.showUniversalModal('services',${service.id})" title="Редактировать">✏️</button>
                    </div>
                </td>
            </tr>
            `;
        }).join("");
    };
};