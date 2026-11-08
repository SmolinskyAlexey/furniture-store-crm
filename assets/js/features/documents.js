let currentModalType;





window.generateUniversalPDF = async (objectType, objectId) => {

    try {
        const formData = new FormData();
        formData.append('action', "generate_pdf");
        formData.append('id', objectId);

        const response = await fetch('/ajax/' + objectType + '/', {
            method: 'POST',
            body: formData
        });

        // Проверяем тип контента
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            // Если JSON - значит ошибка
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ошибка генерации PDF');
        }

        // Получаем PDF как blob
        const pdfBlob = await response.blob();

        // Создаем URL для blob
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // Открываем в новом окне
        const pdfWindow = window.open(pdfUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
        if (!pdfWindow) {
            // Fallback если блокировщик попапов
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `${objectType}_${objectId}.pdf`;
            link.click();
        }

        // Очищаем URL через некоторое время
        setTimeout(() => {
            URL.revokeObjectURL(pdfUrl);
        }, 10000);

    } catch (error) {
        console.error('Ошибка генерации PDF:', error);
        alert('Ошибка при генерации PDF: ' + error.message);
    }

};


// Dates must be chosen by the manager. Never fill an empty payment date.
