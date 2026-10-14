// ============================================================================
// ADMIN TYPES (TrendED Admin Platform)
// ============================================================================

export interface AdminOverviewKPIs {
  total_users: number;
  total_users_change: number;
  active_users: number;
  active_users_change: number;
  mrr: number;
  mrr_change: number;
  new_subscriptions: number;
  new_subscriptions_change: number;
  ai_generations: number;
  ai_generations_change: number;
  system_health: string;
  comparison_period: string;
}

export interface AdminChartSeries {
  labels: string[];
  total_users: number[];
  active_users: number[];
}

export interface AdminMRRSeries {
  labels: string[];
  values: number[];
}

export interface AdminSubscriptionDistributionItem {
  plan: string;
  count: number;
  percentage: number;
  color: string;
}

export interface AdminAlertItem {
  id: string;
  type: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  time_ago: string;
  created_at: string;
}

export interface AdminSystemStatusItem {
  name: string;
  status: 'Operational' | 'Degraded' | 'Outage';
  uptime_percentage: number;
}

export interface AdminOverviewResponse {
  kpis: AdminOverviewKPIs;
  user_growth: AdminChartSeries;
  mrr_evolution: AdminMRRSeries;
  subscription_distribution: AdminSubscriptionDistributionItem[];
  alerts: AdminAlertItem[];
  system_status: AdminSystemStatusItem[];
  system_time: string;
  version: string;
}

// ----------------------------------------------------------------------------
// USERS
// ----------------------------------------------------------------------------
export interface AdminUserItem {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  initials: string;
  plan: string;
  status: 'Active' | 'Suspended' | 'Pending';
  store: string;
  store_url: string;
  last_activity: string;
  created_at: string;
  role: string;
}

export interface AdminUsersListResponse {
  users: AdminUserItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AdminUserStoreInfo {
  name: string;
  url: string;
  platform: string;
  status: string;
  connected_at: string;
}

export interface AdminUserUsageStats {
  product_searches: number;
  product_searches_limit: number;
  ai_credits: number;
  ai_credits_limit: number;
  ad_generations: number;
  ad_generations_limit: number;
  creative_exports: number;
  creative_exports_limit: number;
  api_calls: number;
  api_calls_limit: number;
  resets_on: string;
}

export interface AdminUserActivityItem {
  id: string;
  activity: string;
  details: string;
  ip_address: string;
  location: string;
  date_time: string;
  timestamp: string;
}

export interface AdminUserDetail {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  initials: string;
  role: string;
  status: string;
  registration_date: string;
  last_login: string;
  user_id_display: string;
  email_status: string;
  two_factor_enabled: boolean;
  plan: string;
  billing_status: string;
  renewal_date: string;
  monthly_cost: number;
  users_count: string;
  stores: AdminUserStoreInfo[];
  usage: AdminUserUsageStats;
  recent_activity: AdminUserActivityItem[];
}

// ----------------------------------------------------------------------------
// SUBSCRIPTIONS
// ----------------------------------------------------------------------------
export interface AdminSubscriptionKPIs {
  mrr: number;
  mrr_change: number;
  arr: number;
  arr_change: number;
  active_subscriptions: number;
  active_subscriptions_change: number;
  churn_rate: number;
  churn_rate_change: number;
  trial_users: number;
  trial_users_change: number;
  period_label: string;
}

export interface AdminSubscriptionAlertItem {
  id: string;
  title: string;
  count: number;
  description: string;
  severity: string;
}

export interface AdminSubscriptionItem {
  id: string;
  user_name: string;
  user_email: string;
  initials: string;
  plan: string;
  billing_cycle: string;
  amount: number;
  status: 'Active' | 'Past due' | 'Trial' | 'Cancelled';
  next_billing: string;
  next_billing_relative: string;
  created_at: string;
}

export interface AdminSubscriptionsResponse {
  kpis: AdminSubscriptionKPIs;
  distribution: AdminSubscriptionDistributionItem[];
  alerts: AdminSubscriptionAlertItem[];
  subscriptions: AdminSubscriptionItem[];
  total: number;
  counts_by_tab: Record<string, number>;
  page: number;
  page_size: number;
  total_pages: number;
}

// ----------------------------------------------------------------------------
// TRANSACTIONS
// ----------------------------------------------------------------------------
export interface AdminTransactionKPIs {
  total_revenue: number;
  total_revenue_change: number;
  successful_payments: number;
  successful_payments_change: number;
  failed_payments: number;
  failed_payments_change: number;
  refunds: number;
  refunds_change: number;
  period_label: string;
}

export interface AdminTransactionTimelineEvent {
  status: string;
  timestamp: string;
  description: string;
}

export interface AdminTransactionItem {
  id: string;
  transaction_id: string;
  user_type: string;
  amount: number;
  currency: string;
  payment_provider: string;
  status: 'Succeeded' | 'Pending' | 'Failed' | 'Refunded';
  date_display: string;
  created_at: string;
}

export interface AdminTransactionDetail extends AdminTransactionItem {
  transaction_type: string;
  payment_method: string;
  description: string;
  receipt_id: string;
  customer_name: string;
  customer_email: string;
  customer_id: string;
  ip_address: string;
  timeline: AdminTransactionTimelineEvent[];
}

export interface AdminTransactionsResponse {
  kpis: AdminTransactionKPIs;
  transactions: AdminTransactionItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ----------------------------------------------------------------------------
// SYSTEM LOGS
// ----------------------------------------------------------------------------
export interface AdminLogItem {
  id: string;
  timestamp: string;
  service: string;
  event: string;
  severity: 'Info' | 'Warning' | 'Error' | 'Critical';
  user: string;
  status: 'Success' | 'Failed';
  request_id: string;
  description: string;
}

export interface AdminLogDetail extends AdminLogItem {
  technical_details: Record<string, unknown>;
}

export interface AdminLogsResponse {
  logs: AdminLogItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ----------------------------------------------------------------------------
// SETTINGS
// ----------------------------------------------------------------------------
export interface AdminRolePermissionRow {
  role: string;
  dashboard_access: boolean;
  product_intelligence: boolean;
  ai_generation: boolean;
  payments: boolean;
  integrations: boolean;
  system_settings: boolean;
  user_management: boolean;
}

export interface AdminSettingsData {
  default_ai_model: string;
  fallback_model: string;
  default_creativity: number;

  max_generations_per_user_day: number;
  max_generations_per_admin_day: number;
  max_tokens_per_generation: number;
  concurrent_generations_per_org: number;

  monthly_ai_spend_alert_threshold: number;
  alert_threshold_enabled: boolean;
  monthly_ai_spend_hard_limit: number;
  hard_limit_enabled: boolean;
  block_generation_when_limit_reached: boolean;

  data_refresh_interval: string;
  trend_calculation_window: string;
  min_data_points_for_trend: number;
  trend_score_algorithm: string;

  weight_growth_velocity: number;
  weight_search_volume: number;
  weight_competition: number;
  weight_profit_margin: number;
  min_trend_score_to_show: number;

  payment_provider: string;
  currency: string;
  tax_calculation: string;
  default_tax_rate: number;
  invoice_prefix: string;
  enable_tax_collection: boolean;
  tax_display_mode: string;
  origin_country: string;
  eu_vat_reverse_charge: boolean;

  session_duration: string;
  idle_session_timeout: string;
  force_re_authentication: string;
  two_factor_authentication: string;
  password_minimum_length: number;
  password_complexity: string;
  enforce_password_rotation: string;

  uptime: string;
  last_health_check: string;
  permissions: AdminRolePermissionRow[];
  last_saved: string;
}

export interface AdminSettingsResponse {
  settings: AdminSettingsData;
  message: string;
}
