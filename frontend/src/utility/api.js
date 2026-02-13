import axios from "axios";
import { BASE_URL } from "./constants";
import { getToken } from "./auth";

// API gateway | axios wrapper

const api = axios.create({
    baseURL: BASE_URL,
});

// request interceptor (pre-request)
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// auth APIs
export const loginApi = (username, password) => api.post(`/login`, { username, password });
export const registerApi = (username, password) => api.post(`/register`, { username, password });
export const createAdminApi = (username, password) => api.post(`/admin/create-admin`, { username, password });

// ticket APIs
export const getTicketsApi = (params = {}) => api.get(`/tickets`, { params });
export const getTicketsByIdApi = (id) => api.get(`/tickets/${id}`);

export const createTicket = (formData) =>
    api.post(`/tickets`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

export const completeTicketApi = (id) => api.patch(`/tickets/${id}/complete`);
export const updateticketApi = (id, payload) => api.patch(`/tickets/${id}`, payload);
export const deleteTicketApi = (id) => api.delete(`/tickets/${id}`);
export const redactTicketApi = (id) => api.patch(`/tickets/${id}`, { redact: true });
