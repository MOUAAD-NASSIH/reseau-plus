import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL!}/api`,
});

// request interceptor to add the token to the request headers
axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// response interceptor to get the token from the response body and store it in localStorage
axiosInstance.interceptors.response.use((response) => {
    if (response.data?.token) {
        localStorage.setItem("auth_token", response.data.token);
    }
    return response;
});

