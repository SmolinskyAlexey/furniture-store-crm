// Shared services for classic scripts and PHP-generated event handlers.
window.CRMFrontend = window.CRMFrontend || {};

window.LANGS = window.LANGS || {};
window.LANGS.lang_texts = window.LANGS.lang_texts || {};
window.LANGS.get = window.LANGS.get || function (key) {
    return this.lang_texts[key] ?? key;
};

CRMFrontend.ui = {
    loading(controller, show) {
        controller.isLoading = show;
        const spinner = document.getElementById('loadingSpinner');
        const body = document.getElementById('modalBody');
        if (spinner && body) {
            spinner.style.display = show ? 'flex' : 'none';
            body.style.opacity = '1';
        }
    },

    error(message) {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, 'error');
        } else {
            console.error(message);
        }
    }
};
