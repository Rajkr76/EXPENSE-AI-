import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Determine the API base URL based on environment
function getBaseUrl(): string {
  let url = process.env.EXPO_PUBLIC_API_URL;
  
  if (!url) {
    const isDev = __DEV__;
    if (isDev) {
      const debuggerHost = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost;
      const localIp = debuggerHost?.split(':')[0];
      
      if (localIp) {
        url = `http://${localIp}:8000`;
      } else if (Platform.OS === 'android') {
        url = 'http://10.0.2.2:8000';
      } else {
        url = 'http://localhost:8000';
      }
    } else {
      url = 'https://expense-ai-3mmo.onrender.com';
    }
  }

  // Sanitize the URL: remove trailing slashes and any trailing /api (we will append it cleanly)
  return url.replace(/\/+$/, '').replace(/\/api$/, '');
}

const BASE_URL = getBaseUrl();
console.log('[API] Using base URL:', BASE_URL);

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Global reference to Clerk's getToken function
let getTokenFn: (() => Promise<string | null>) | null = null;

export const registerGetToken = (fn: () => Promise<string | null>) => {
  getTokenFn = fn;
};

// Add a request interceptor to dynamically inject the token
api.interceptors.request.use(async (config) => {
  if (getTokenFn) {
    try {
      const token = await getTokenFn();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('[API] Failed to get auth token', e);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add a response interceptor to catch timeouts and network errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.message = 'The server is waking up. Please try again in a few seconds.';
    } else if (error.message === 'Network Error') {
      error.message = 'Cannot connect to server. Please check your internet connection and try again.';
    }
    return Promise.reject(error);
  }
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

// Auth service is now handled directly by Clerk components
// The backend will verify Clerk JWT tokens using the JWKS endpoint

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
