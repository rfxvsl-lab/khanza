const API_BASE = '';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('adminToken');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options?.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${res.status}`);
    }

    return res.json();
}

export const api = {
    get: <T>(url: string) => request<T>(url),
    post: <T>(url: string, data?: any) => request<T>(url, { method: 'POST', body: JSON.stringify(data) }),
    put: <T>(url: string, data?: any) => request<T>(url, { method: 'PUT', body: JSON.stringify(data) }),
    delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
    upload: async (url: string, file: File) => {
        const token = localStorage.getItem('adminToken');
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch(url, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
        });
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
    },
};
