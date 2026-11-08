function showNotification(message, type = 'error') {

    // Удаляем существующие уведомления

    document.querySelectorAll('.notification').forEach(n => n.remove());

    const notification = document.createElement('div');

    notification.className = `notification notification-${type}`;

    const icons = {
        success: '✓',
        error: '⚠',
        info: 'ℹ',
        warning: '⚡'
    };

    notification.innerHTML = `
            <div class="notification-content notification-card-${type}">
                <span class="notification-icon">${icons[type] || icons.info}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

    document.body.appendChild(notification);

    // Анимация появления

    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    // Автоудаление

    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}
