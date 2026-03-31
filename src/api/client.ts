import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const TOKEN_STORAGE_KEY = 'plotto:auth:token';

const devBase =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8000/api'
    : 'http://localhost:8000/api';

export const API_BASE_URL =
  devBase;

type RequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

export type ApiError = Error & {
  status?: number;
  data?: unknown;
};

async function getToken() {
  return AsyncStorage.getItem(TOKEN_STORAGE_KEY);
}

async function setToken(token: string) {
  await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
}

async function removeToken() {
  await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401) {
      await removeToken();
    }
    const detailMessage =
      typeof (payload as {detail?: unknown})?.detail === 'string'
        ? (payload as {detail: string}).detail
        : undefined;
    const message =
      (payload as {message?: string})?.message ||
      detailMessage ||
      `HTTP ${response.status}`;
    const err = new Error(message) as ApiError;
    err.status = response.status;
    err.data = payload;
    throw err;
  }

  return payload as T;
}

function get<T>(endpoint: string) {
  return request<T>(endpoint, { method: 'GET' });
}

function post<T>(endpoint: string, body?: unknown) {
  return request<T>(endpoint, {
    method: 'POST',
    body: body == null ? undefined : JSON.stringify(body),
  });
}

export const tokenStore = {
  get: getToken,
  set: setToken,
  remove: removeToken,
};

export const http = {
  get,
  post,
};
