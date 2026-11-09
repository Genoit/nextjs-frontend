import { fetchWithAuth } from './core';
import {
  AdminAlertsResponse,
  AdminAnalyticsResponse,
  AdminCreativesResponse,
  AdminGenerationsResponse,
  AdminIntegrationItem,
  AdminProductsResponse,
  AdminLogDetail,
  AdminLogsResponse,
  AdminOverviewResponse,
  AdminSettingsData,
  AdminSettingsResponse,
  AdminSubscriptionsResponse,
  AdminTransactionDetail,
  AdminTransactionsResponse,
  AdminUserDetail,
  AdminUsersListResponse,
} from '../types/admin';

// Admin API: authenticated calls only. Errors are thrown so pages show them instead of fake data.

function withQuery(path: string, params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') query.set(key, String(value));
  }
  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

const get = <T>(path: string) => fetchWithAuth<T>(path, { method: 'GET', cache: 'no-store' });

export function fetchAdminOverview(): Promise<AdminOverviewResponse> {
  return get('/admin/overview');
}

export function fetchAdminUsers(params?: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<AdminUsersListResponse> {
  return get(
    withQuery('/admin/users', {
      search: params?.search,
      status: params?.status,
      page: params?.page,
      page_size: params?.pageSize,
    }),
  );
}

export function fetchAdminUserDetail(userId: string): Promise<AdminUserDetail> {
  return get(`/admin/users/${encodeURIComponent(userId)}`);
}

export function updateAdminUserStatus(
  userId: string,
  newStatus: string,
): Promise<{ success: boolean; status: string; message: string }> {
  return fetchWithAuth(`/admin/users/${encodeURIComponent(userId)}/status`, {
    method: 'POST',
    body: JSON.stringify({ status: newStatus }),
  });
}

export function banAdminUser(userId: string, reason: string): Promise<{ success: boolean }> {
  return fetchWithAuth(`/admin/users/${encodeURIComponent(userId)}/ban`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export function unbanAdminUser(userId: string): Promise<{ success: boolean }> {
  return fetchWithAuth(`/admin/users/${encodeURIComponent(userId)}/unban`, { method: 'POST' });
}

export function fetchAdminAnalytics(days: number): Promise<AdminAnalyticsResponse> {
  return get(withQuery('/admin/analytics', { days }));
}

export function resetAdminUserAccess(
  userId: string,
): Promise<{ success: boolean; message: string }> {
  return fetchWithAuth(`/admin/users/${encodeURIComponent(userId)}/reset-access`, {
    method: 'POST',
  });
}

export function fetchAdminSubscriptions(params?: {
  tab?: string;
  search?: string;
  page?: number;
}): Promise<AdminSubscriptionsResponse> {
  return get(withQuery('/admin/subscriptions', { ...params }));
}

export function fetchAdminTransactions(params?: {
  status?: string;
  provider?: string;
  type?: string;
  search?: string;
  page?: number;
}): Promise<AdminTransactionsResponse> {
  return get(withQuery('/admin/transactions', { ...params }));
}

export function fetchAdminTransactionDetail(
  transactionId: string,
): Promise<AdminTransactionDetail> {
  return get(`/admin/transactions/${encodeURIComponent(transactionId)}`);
}

export function fetchAdminSystemLogs(params?: {
  severity?: string;
  service?: string;
  status?: string;
  search?: string;
  page?: number;
}): Promise<AdminLogsResponse> {
  return get(withQuery('/admin/system-logs', { ...params }));
}

export function fetchAdminLogDetail(logId: string): Promise<AdminLogDetail> {
  return get(`/admin/system-logs/${encodeURIComponent(logId)}`);
}

export function fetchAdminSettings(): Promise<AdminSettingsResponse> {
  return get('/admin/settings');
}

export function updateAdminSettings(settings: AdminSettingsData): Promise<AdminSettingsResponse> {
  return fetchWithAuth('/admin/settings', { method: 'PUT', body: JSON.stringify(settings) });
}

export function fetchAdminAlerts(): Promise<AdminAlertsResponse> {
  return get('/admin/alerts');
}

export function fetchAdminProducts(params?: {
  search?: string;
  status?: string;
  page?: number;
}): Promise<AdminProductsResponse> {
  return get(withQuery('/admin/products', { ...params }));
}

export function fetchAdminCreatives(params?: {
  search?: string;
  provider?: string;
  page?: number;
}): Promise<AdminCreativesResponse> {
  return get(withQuery('/admin/creatives', { ...params }));
}

export function fetchAdminGenerations(params?: {
  provider?: string;
  status?: string;
  page?: number;
}): Promise<AdminGenerationsResponse> {
  return get(withQuery('/admin/ai-generations', { ...params }));
}

export async function fetchAdminIntegrations(): Promise<AdminIntegrationItem[]> {
  const res = await get<{ integrations: AdminIntegrationItem[] }>('/admin/integrations');
  return res.integrations;
}
