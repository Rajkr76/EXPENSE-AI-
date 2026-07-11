import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// For Android emulator to access localhost backend, use 10.0.2.2.
// For iOS simulator, localhost works.
// For physical devices, you must use your computer's local IP address (e.g. 192.168.x.x).
const BASE_URL = Platform.OS === 'android' ? 'http://192.168.1.8:8000/api' : 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // SecureStore not ready yet, skip token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Services
export const expenseService = {
  getExpenses: async (month?: number, year?: number) => {
    let url = '/expenses/';
    if (month && year) {
      url += `?month=${month}&year=${year}`;
    }
    const response = await api.get(url);
    return response.data;
  },
  addExpense: async (expense: any) => {
    const response = await api.post('/expenses/', expense);
    return response.data;
  },
  deleteExpense: async (id: string) => {
    await api.delete(`/expenses/${id}`);
  },
  deleteAllExpenses: async () => {
    await api.delete('/expenses/all');
  }
};

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  },
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  verifyEmail: async (email: string, code: string) => {
    const response = await api.post('/auth/verify-email', { email, code });
    return response.data;
  },
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (email: string, code: string, new_password: string) => {
    const response = await api.post('/auth/reset-password', { email, code, new_password });
    return response.data;
  }
};

export const aiService = {
  chat: async (query: string) => {
    const response = await api.post('/ai/chat', { query });
    return response.data;
  },
  getInsight: async () => {
    const response = await api.get('/ai/insight');
    return response.data;
  }
};

export const incomeService = {
  getIncomes: async (month?: number, year?: number) => {
    let url = '/income/';
    if (month && year) {
      url += `?month=${month}&year=${year}`;
    }
    const response = await api.get(url);
    return response.data;
  },
  addIncome: async (income: any) => {
    const response = await api.post('/income/', income);
    return response.data;
  },
  deleteIncome: async (id: string) => {
    await api.delete(`/income/${id}`);
  },
  deleteAllIncomes: async () => {
    await api.delete('/income/all');
  }
};

export const budgetService = {
  getBudgets: async (month: number, year: number) => {
    const response = await api.get(`/budget/?month=${month}&year=${year}`);
    return response.data;
  },
  setBudget: async (budget: { category_id: string; amount: number; month: number; year: number }) => {
    const response = await api.post('/budget/', budget);
    return response.data;
  }
};
