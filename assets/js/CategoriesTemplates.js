// CategoriesTemplates.js
window.CategoriesTemplates = class {
    static renderCategories(categories = []) {
        return categories.map(category => {
            return `
            <tr>
                <td><strong>#${category.id}</strong></td>
                <td>${category.name}</td>
                <td>${category.parent_id || '-'}</td>
                <td>${category.prefix || '-'}</td>
                <td>${category.attributes_ids || '-'}</td>
                <td class="actions-cell">
                    <div class="actions-wrapper">
                        <button class="btn btn-icon btn-secondary" onclick="window.showUniversalModal('categories',${category.id})" title="Редактировать">✏️</button>
                    </div>
                </td>
            </tr>
            `;
        }).join("");
    };
};