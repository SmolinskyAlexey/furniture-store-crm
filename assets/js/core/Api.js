CRMFrontend.api = {
    listBody(offset, limit) {
        const body = new FormData();
        body.append('action', 'get_list');
        body.append('offset', offset);
        body.append('limit', limit);
        return body;
    },

    // Keep payloads and response shapes intact; HTML/PDF use their own readers.
    async json(url, options, errorMessage = 'Ошибка загрузки данных') {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(errorMessage);
        return response.json();
    }
};
