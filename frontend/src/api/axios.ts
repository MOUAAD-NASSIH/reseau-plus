import axios from "axios";

export const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL!}/api`,
});

// request interceptor to add the token to the request headers
api.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// response interceptor to get the token from the response body and store it in localStorage
api.interceptors.response.use((response) => {
    if (response.data?.token) {
        localStorage.setItem("auth_token", response.data.token);
    }
    return response;
});
