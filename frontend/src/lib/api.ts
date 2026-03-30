import Cookies from 'js-cookie';

export const apiFetch = async (url: string, options: RequestInit = {}) => {
    const token = Cookies.get('token');
    
    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const config = {
        ...options,
        headers,
    };

    const response = await fetch(url, config);

    if (response.status === 401) {
        // Redirigir al login si el token expira o es inválido
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    }

    return response;
};
