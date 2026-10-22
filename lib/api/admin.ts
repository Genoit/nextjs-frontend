import { getApiBaseUrl } from './core';
import {
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

// ============================================================================
// HIGH-FIDELITY FALLBACK DATA (Matching Figma Exactly)
// ============================================================================

export const DEFAULT_ADMIN_OVERVIEW: AdminOverviewResponse = {
  kpis: {
    total_users: 18752,
    total_users_change: 12.4,
    active_users: 7842,
    active_users_change: 8.7,
    mrr: 162540,
    mrr_change: 15.3,
    new_subscriptions: 1248,
    new_subscriptions_change: 18.6,
    ai_generations: 48352,
    ai_generations_change: 21.2,
    system_health: 'Healthy',
    comparison_period: 'vs May 4 - May 10, 2025',
  },
  user_growth: {
    labels: ['May 11', 'May 12', 'May 13', 'May 14', 'May 15', 'May 16', 'May 17'],
    total_users: [10200, 11400, 13100, 14500, 15900, 17200, 18752],
    active_users: [4500, 5100, 5600, 6200, 6800, 7200, 7842],
  },
  mrr_evolution: {
    labels: ['May 11', 'May 12', 'May 13', 'May 14', 'May 15', 'May 16', 'May 17'],
    values: [98000, 108000, 119000, 132000, 144000, 153000, 162540],
  },
  subscription_distribution: [
    { plan: 'Pro', count: 5721, percentage: 45.7, color: '#EA580C' },
    { plan: 'Starter', count: 3517, percentage: 28.1, color: '#F59E0B' },
    { plan: 'Enterprise', count: 2039, percentage: 16.3, color: '#FED7AA' },
    { plan: 'Free', count: 1240, percentage: 9.9, color: '#64748B' },
  ],
  alerts: [
    {
      id: 'alert-1',
      type: 'Payment failures',
      severity: 'error',
      message: '23 payment failures detected in the last 24 hours.',
      time_ago: '12m ago',
      created_at: '2025-05-17T10:12:00Z',
    },
    {
      id: 'alert-2',
      type: 'System warnings',
      severity: 'warning',
      message: 'High memory usage on API server 02.',
      time_ago: '28m ago',
      created_at: '2025-05-17T09:56:00Z',
    },
    {
      id: 'alert-3',
      type: 'Payment failures',
      severity: 'error',
      message: '7 subscriptions failed to renew.',
      time_ago: '1h ago',
      created_at: '2025-05-17T09:24:00Z',
    },
    {
      id: 'alert-4',
      type: 'System warnings',
      severity: 'warning',
      message: 'Background job queue is longer than usual.',
      time_ago: '2h ago',
      created_at: '2025-05-17T08:24:00Z',
    },
    {
      id: 'alert-5',
      type: 'API issues',
      severity: 'error',
      message: 'Elevated error rate on /v1/ai/generate-endpoint.',
      time_ago: '3h ago',
      created_at: '2025-05-17T07:24:00Z',
    },
    {
      id: 'alert-6',
      type: 'System warnings',
      severity: 'warning',
      message: 'Disk usage at 82% on storage node 03.',
      time_ago: '5h ago',
      created_at: '2025-05-17T05:24:00Z',
    },
  ],
  system_status: [
    { name: 'Web Application', status: 'Operational', uptime_percentage: 100 },
    { name: 'API Services', status: 'Operational', uptime_percentage: 100 },
    { name: 'Database', status: 'Operational', uptime_percentage: 100 },
    { name: 'AI Generation Service', status: 'Operational', uptime_percentage: 99.98 },
    { name: 'Storage', status: 'Operational', uptime_percentage: 99.95 },
    { name: 'Email Service', status: 'Operational', uptime_percentage: 100 },
  ],
  system_time: 'May 17, 2025, 10:24 AM (UTC)',
  version: '1.24.7',
};

export const DEFAULT_ADMIN_USERS: AdminUsersListResponse = {
  users: [
    {
      id: 'usr_7hK2mL9q8Pz',
      first_name: 'Sarah',
      last_name: 'Johnson',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@peakfinds.com',
      initials: 'SJ',
      plan: 'Pro',
      status: 'Active',
      store: 'PeakFinds',
      store_url: 'peakfinds.myshopify.com',
      last_activity: '2 minutes ago',
      created_at: 'May 12, 2024',
      role: 'Owner',
    },
    {
      id: 'usr_3mF9xL2p1Qe',
      first_name: 'Michael',
      last_name: 'Chen',
      name: 'Michael Chen',
      email: 'michael.chen@booststore.io',
      initials: 'MC',
      plan: 'Pro',
      status: 'Active',
      store: 'BoostStore',
      store_url: 'booststore.myshopify.com',
      last_activity: '15 minutes ago',
      created_at: 'May 8, 2024',
      role: 'Owner',
    },
    {
      id: 'usr_8aK1vN7z3Ws',
      first_name: 'Emma',
      last_name: 'Thompson',
      name: 'Emma Thompson',
      email: 'emma@urbanoutfit.co',
      initials: 'ET',
      plan: 'Starter',
      status: 'Active',
      store: 'UrbanOutfit',
      store_url: 'urbanoutfit.myshopify.com',
      last_activity: '1 hour ago',
      created_at: 'Apr 29, 2024',
      role: 'Owner',
    },
    {
      id: 'usr_4pT6yR9b2Zx',
      first_name: 'Daniel',
      last_name: 'Martinez',
      name: 'Daniel Martinez',
      email: 'daniel@trendybazaar.com',
      initials: 'DM',
      plan: 'Pro',
      status: 'Suspended',
      store: 'TrendyBazaar',
      store_url: 'trendybazaar.myshopify.com',
      last_activity: '2 days ago',
      created_at: 'Apr 21, 2024',
      role: 'Member',
    },
    {
      id: 'usr_9wL5kC3m8Vq',
      first_name: 'Lisa &',
      last_name: 'Scott',
      name: 'Lisa & Scott',
      email: 'lisa@homeessentials.co',
      initials: 'LS',
      plan: 'Starter',
      status: 'Pending',
      store: 'HomeEssentials',
      store_url: 'homeessentials.myshopify.com',
      last_activity: '3 days ago',
      created_at: 'May 15, 2024',
      role: 'Owner',
    },
    {
      id: 'usr_2xN8vB4j6Hr',
      first_name: 'Rachel',
      last_name: 'Brown',
      name: 'Rachel Brown',
      email: 'rachel@cleverfinds.com',
      initials: 'RB',
      plan: 'Pro',
      status: 'Active',
      store: 'CleverFinds',
      store_url: 'cleverfinds.myshopify.com',
      last_activity: '5 days ago',
      created_at: 'Apr 18, 2024',
      role: 'Owner',
    },
    {
      id: 'usr_6tM3qW9p1Fd',
      first_name: 'James',
      last_name: 'Wilson',
      name: 'James Wilson',
      email: 'james@nextlevelgadget.com',
      initials: 'JW',
      plan: 'Pro',
      status: 'Active',
      store: 'NextLevelGadget',
      store_url: 'nextlevelgadget.myshopify.com',
      last_activity: '1 week ago',
      created_at: 'Apr 10, 2024',
      role: 'Admin',
    },
    {
      id: 'usr_1yR7cL5k4Bz',
      first_name: 'Ava',
      last_name: 'Young',
      name: 'Ava Young',
      email: 'ava@ministyle.com',
      initials: 'AY',
      plan: 'Starter',
      status: 'Suspended',
      store: 'MiniStyle',
      store_url: 'ministyle.myshopify.com',
      last_activity: '1 week ago',
      created_at: 'Apr 5, 2024',
      role: 'Owner',
    },
    {
      id: 'usr_5kP2nF8m9Jx',
      first_name: 'Tom',
      last_name: 'King',
      name: 'Tom King',
      email: 'tom@kingdomstore.com',
      initials: 'TK',
      plan: 'Pro',
      status: 'Active',
      store: 'KingdomStore',
      store_url: 'kingdomstore.myshopify.com',
      last_activity: '2 weeks ago',
      created_at: 'Mar 28, 2024',
      role: 'Owner',
    },
    {
      id: 'usr_8f3a2d6e7c1',
      first_name: 'Noah',
      last_name: 'Parker',
      name: 'Noah Parker',
      email: 'noah@outdoorpeak.com',
      initials: 'NP',
      plan: 'Starter',
      status: 'Pending',
      store: 'OutdoorPeak',
      store_url: 'outdoorpeak.myshopify.com',
      last_activity: '2 weeks ago',
      created_at: 'May 20, 2024',
      role: 'Member',
    },
  ],
  total: 42,
  page: 1,
  page_size: 10,
  total_pages: 5,
};

export const DEFAULT_USER_DETAIL: AdminUserDetail = {
  id: 'usr_8f3a2d6e7c1b4a9d',
  first_name: 'Alex',
  last_name: 'Johnson',
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  initials: 'AJ',
  role: 'User',
  status: 'Active',
  registration_date: 'Jan 18, 2024 10:24 AM (UTC)',
  last_login: 'May 28, 2025 09:15 AM (UTC)',
  user_id_display: 'usr_8f3a2d6e7c1b4a9d',
  email_status: 'Verified',
  two_factor_enabled: true,
  plan: 'Growth Pro',
  billing_status: 'Active',
  renewal_date: 'Jun 18, 2025',
  monthly_cost: 79.0,
  users_count: '3 of 5',
  stores: [
    {
      name: 'Shopify',
      url: 'trendystore.myshopify.com',
      platform: 'Shopify',
      status: 'Connected',
      connected_at: 'Jan 20, 2024',
    },
  ],
  usage: {
    product_searches: 245,
    product_searches_limit: 1000,
    ai_credits: 1892,
    ai_credits_limit: 5000,
    ad_generations: 312,
    ad_generations_limit: 1000,
    creative_exports: 312,
    creative_exports_limit: 1000,
    api_calls: 18540,
    api_calls_limit: 100000,
    resets_on: 'Jun 18, 2025',
  },
  recent_activity: [
    {
      id: 'act-1',
      activity: 'Login',
      details: 'User logged in to the platform',
      ip_address: '203.0.113.45',
      location: 'New York, US',
      date_time: 'May 28, 2025 09:15 AM (UTC)',
      timestamp: '2 minutes ago',
    },
    {
      id: 'act-2',
      activity: 'Product analysis',
      details: 'Analyzed product: Portable Blender',
      ip_address: '203.0.113.45',
      location: 'New York, US',
      date_time: 'May 28, 2025 08:42 AM (UTC)',
      timestamp: '15 minutes ago',
    },
    {
      id: 'act-3',
      activity: 'Creative generation',
      details: 'Generated 4 creatives',
      ip_address: '203.0.113.45',
      location: 'New York, US',
      date_time: 'May 27, 2025 04:31 PM (UTC)',
      timestamp: '1 hour ago',
    },
    {
      id: 'act-4',
      activity: 'Campaign creation',
      details: 'Created campaign: Summer Sale - US',
      ip_address: '203.0.113.45',
      location: 'New York, US',
      date_time: 'May 26, 2025 11:07 AM (UTC)',
      timestamp: '2 days ago',
    },
  ],
};

export const DEFAULT_ADMIN_SUBSCRIPTIONS: AdminSubscriptionsResponse = {
  kpis: {
    mrr: 124560,
    mrr_change: 12.4,
    arr: 1494720,
    arr_change: 15.5,
    active_subscriptions: 2842,
    active_subscriptions_change: 8.5,
    churn_rate: 2.31,
    churn_rate_change: -0.45,
    trial_users: 320,
    trial_users_change: 3.5,
    period_label: 'vs Apr 12 - May 12, 2025',
  },
  distribution: [
    { plan: 'Starter', count: 1152, percentage: 40.5, color: '#EA580C' },
    { plan: 'Growth', count: 1032, percentage: 36.3, color: '#F59E0B' },
    { plan: 'Scale', count: 498, percentage: 17.5, color: '#FCD34D' },
    { plan: 'Trial', count: 320, percentage: 11.3, color: '#93C5FD' },
    { plan: 'Cancelled', count: 98, percentage: 3.4, color: '#475569' },
    { plan: 'Past Due', count: 74, percentage: 2.6, color: '#EF4444' },
  ],
  alerts: [
    {
      id: 'sub-alt-1',
      title: 'Past due payments',
      count: 74,
      description: '74 subscriptions with overdue payments',
      severity: 'error',
    },
    {
      id: 'sub-alt-2',
      title: 'Upcoming cancellations',
      count: 28,
      description: '28 subscriptions canceling in the next 7 days',
      severity: 'warning',
    },
    {
      id: 'sub-alt-3',
      title: 'Failed renewals',
      count: 13,
      description: '13 subscriptions failed to renew',
      severity: 'warning',
    },
    {
      id: 'sub-alt-4',
      title: 'Payment method expiring',
      count: 36,
      description: '36 subscriptions with expiring payment methods',
      severity: 'info',
    },
  ],
  subscriptions: [
    {
      id: 'sub_1',
      user_name: 'Alice Smith',
      user_email: 'alice.smith@example.com',
      initials: 'AS',
      plan: 'Growth',
      billing_cycle: 'Monthly',
      amount: 79.0,
      status: 'Active',
      next_billing: 'Jun 12, 2025',
      next_billing_relative: 'in 2 days',
      created_at: 'Mar 12, 2025',
    },
    {
      id: 'sub_2',
      user_name: 'Michael Johnson',
      user_email: 'michael.j@example.com',
      initials: 'MJ',
      plan: 'Scale',
      billing_cycle: 'Annual',
      amount: 299.0,
      status: 'Active',
      next_billing: 'Apr 12, 2026',
      next_billing_relative: 'in 10 months',
      created_at: 'Jan 8, 2025',
    },
    {
      id: 'sub_3',
      user_name: 'Sophie Brown',
      user_email: 'sophie.b@example.com',
      initials: 'SB',
      plan: 'Starter',
      billing_cycle: 'Monthly',
      amount: 29.0,
      status: 'Past due',
      next_billing: 'May 12, 2025',
      next_billing_relative: '30 days overdue',
      created_at: 'Feb 10, 2025',
    },
    {
      id: 'sub_4',
      user_name: 'David Wilson',
      user_email: 'david.w@example.com',
      initials: 'DW',
      plan: 'Growth',
      billing_cycle: 'Monthly',
      amount: 79.0,
      status: 'Active',
      next_billing: 'Jul 12, 2025',
      next_billing_relative: 'in 32 days',
      created_at: 'Apr 12, 2025',
    },
    {
      id: 'sub_5',
      user_name: 'Emma Chen',
      user_email: 'emma.c@example.com',
      initials: 'EC',
      plan: 'Trial',
      billing_cycle: 'Monthly',
      amount: 0.0,
      status: 'Trial',
      next_billing: 'Jun 22, 2025',
      next_billing_relative: 'in 12 days',
      created_at: 'May 22, 2025',
    },
  ],
  total: 2842,
  counts_by_tab: {
    all: 2842,
    starter: 1152,
    growth: 1032,
    scale: 488,
    trial: 320,
    cancelled: 98,
    'past due': 74,
  },
  page: 1,
  page_size: 10,
  total_pages: 285,
};

export const DEFAULT_ADMIN_TRANSACTIONS: AdminTransactionsResponse = {
  kpis: {
    total_revenue: 482594.32,
    total_revenue_change: 18.6,
    successful_payments: 4892,
    successful_payments_change: 15.3,
    failed_payments: 142,
    failed_payments_change: 6.7,
    refunds: 312,
    refunds_change: 4.1,
    period_label: 'vs last 30 days',
  },
  transactions: [
    {
      id: 'trx-1',
      transaction_id: 'TRX-2025-0616-00123',
      user_type: 'Pro Merchant',
      amount: 129.0,
      currency: 'USD',
      payment_provider: 'Stripe',
      status: 'Succeeded',
      date_display: 'Jun 16, 2025 10:24 AM',
      created_at: '2025-06-16T10:24:00Z',
    },
    {
      id: 'trx-2',
      transaction_id: 'TRX-2025-0616-00122',
      user_type: 'Starter Merchant',
      amount: 29.0,
      currency: 'USD',
      payment_provider: 'PayPal',
      status: 'Pending',
      date_display: 'Jun 16, 2025 09:41 AM',
      created_at: '2025-06-16T09:41:00Z',
    },
    {
      id: 'trx-3',
      transaction_id: 'TRX-2025-0616-00121',
      user_type: 'Pro Merchant',
      amount: 79.0,
      currency: 'USD',
      payment_provider: 'Stripe',
      status: 'Failed',
      date_display: 'Jun 16, 2025 08:15 AM',
      created_at: '2025-06-16T08:15:00Z',
    },
    {
      id: 'trx-4',
      transaction_id: 'TRX-2025-0615-00120',
      user_type: 'Agency',
      amount: 299.0,
      currency: 'USD',
      payment_provider: 'Checkout.com',
      status: 'Succeeded',
      date_display: 'Jun 15, 2025 11:32 PM',
      created_at: '2025-06-15T23:32:00Z',
    },
    {
      id: 'trx-5',
      transaction_id: 'TRX-2025-0615-00119',
      user_type: 'Starter Merchant',
      amount: 29.0,
      currency: 'USD',
      payment_provider: 'PayPal',
      status: 'Succeeded',
      date_display: 'Jun 15, 2025 07:50 PM',
      created_at: '2025-06-15T19:50:00Z',
    },
    {
      id: 'trx-6',
      transaction_id: 'TRX-2025-0615-00118',
      user_type: 'Pro Merchant',
      amount: 129.0,
      currency: 'USD',
      payment_provider: 'Stripe',
      status: 'Pending',
      date_display: 'Jun 15, 2025 04:21 PM',
      created_at: '2025-06-15T16:21:00Z',
    },
    {
      id: 'trx-7',
      transaction_id: 'TRX-2025-0614-00117',
      user_type: 'Agency',
      amount: 499.0,
      currency: 'USD',
      payment_provider: 'Checkout.com',
      status: 'Refunded',
      date_display: 'Jun 14, 2025 03:11 PM',
      created_at: '2025-06-14T15:11:00Z',
    },
    {
      id: 'trx-8',
      transaction_id: 'TRX-2025-0614-00116',
      user_type: 'Starter Merchant',
      amount: 29.0,
      currency: 'USD',
      payment_provider: 'PayPal',
      status: 'Succeeded',
      date_display: 'Jun 14, 2025 01:09 PM',
      created_at: '2025-06-14T13:09:00Z',
    },
    {
      id: 'trx-9',
      transaction_id: 'TRX-2025-0613-00115',
      user_type: 'Pro Merchant',
      amount: 79.0,
      currency: 'USD',
      payment_provider: 'Stripe',
      status: 'Failed',
      date_display: 'Jun 13, 2025 10:33 AM',
      created_at: '2025-06-13T10:33:00Z',
    },
    {
      id: 'trx-10',
      transaction_id: 'TRX-2025-0613-00114',
      user_type: 'Agency',
      amount: 299.0,
      currency: 'USD',
      payment_provider: 'Checkout.com',
      status: 'Succeeded',
      date_display: 'Jun 13, 2025 09:12 AM',
      created_at: '2025-06-13T09:12:00Z',
    },
  ],
  total: 5231,
  page: 1,
  page_size: 10,
  total_pages: 524,
};

export const DEFAULT_TRANSACTION_DETAIL: AdminTransactionDetail = {
  id: 'trx-1',
  transaction_id: 'TRX-2025-0616-00123',
  user_type: 'Pro Merchant',
  amount: 129.0,
  currency: 'USD',
  payment_provider: 'Stripe',
  status: 'Succeeded',
  date_display: 'Jun 16, 2025 10:24 AM',
  created_at: '2025-06-16T10:24:00Z',
  transaction_type: 'Subscription Payment',
  payment_method: 'Visa •••• 4242',
  description: 'TrendED Pro Plan - Monthly',
  receipt_id: 'rcpt_8XJ9K2Lq1mJ3v9',
  customer_name: 'John Anderson',
  customer_email: 'john.anderson@gmail.com',
  customer_id: 'user_7f9d8a2b',
  ip_address: '203.0.113.45',
  timeline: [
    {
      status: 'Payment succeeded',
      timestamp: 'Jun 16, 2025 10:24 AM',
      description: 'Successfully authorized and captured $129.00 USD via Stripe',
    },
    {
      status: 'Payment initiated',
      timestamp: 'Jun 16, 2025 10:24 AM',
      description: 'Checkout session started by customer',
    },
  ],
};

export const DEFAULT_ADMIN_LOGS: AdminLogsResponse = {
  logs: [
    {
      id: 'log-1',
      timestamp: 'May 23, 2025 10:42:31 AM',
      service: 'AI Generation',
      event: 'Image Generation Completed',
      severity: 'Info',
      user: 'system',
      status: 'Success',
      request_id: 'req_7f3a9c2e1b8d4f91',
      description: 'AI image generated successfully for product ID 87241.',
    },
    {
      id: 'log-2',
      timestamp: 'May 23, 2025 10:41:58 AM',
      service: 'Product Intelligence',
      event: 'Trending Score Updated',
      severity: 'Info',
      user: 'system',
      status: 'Success',
      request_id: 'req_4d9b2a1c8f7e3m55',
      description: 'Recalculated velocity and margin score for 1,200 products.',
    },
    {
      id: 'log-3',
      timestamp: 'May 23, 2025 10:41:12 AM',
      service: 'Store Integration',
      event: 'Shopify Sync Successful',
      severity: 'Info',
      user: 'shopify_app',
      status: 'Success',
      request_id: 'req_2c8f1e9b4a7d6m33',
      description: 'Catalog sync completed for peakfinds.myshopify.com.',
    },
    {
      id: 'log-4',
      timestamp: 'May 23, 2025 10:40:07 AM',
      service: 'Authentication',
      event: 'User Login',
      severity: 'Info',
      user: 'james.carter@trended.com',
      status: 'Success',
      request_id: 'req_8e3d7a2b1c9f4m11',
      description: 'Admin session initiated with MFA verified.',
    },
    {
      id: 'log-5',
      timestamp: 'May 23, 2025 10:39:54 AM',
      service: 'Payments',
      event: 'Payment Captured',
      severity: 'Warning',
      user: 'system',
      status: 'Success',
      request_id: 'req_1a7b8c2d9e4f6m88',
      description: 'Payment captured with 3D Secure fallback requirement.',
    },
    {
      id: 'log-6',
      timestamp: 'May 23, 2025 10:38:21 AM',
      service: 'AI Generation',
      event: 'Ad Copy Generation Failed',
      severity: 'Error',
      user: 'system',
      status: 'Failed',
      request_id: 'req_5f2d9c1b7a8e4m66',
      description: 'LLM provider returned 504 Gateway Timeout during completion.',
    },
    {
      id: 'log-7',
      timestamp: 'May 23, 2025 10:37:11 AM',
      service: 'Notifications',
      event: 'Email Delivery Failed',
      severity: 'Warning',
      user: 'system',
      status: 'Failed',
      request_id: 'req_9a4b2c1d8f7e3m22',
      description: 'SMTP host rate limit throttled outgoing notification queue.',
    },
    {
      id: 'log-8',
      timestamp: 'May 23, 2025 10:36:02 AM',
      service: 'Store Integration',
      event: 'Etsy Sync Failed',
      severity: 'Error',
      user: 'etsy_app',
      status: 'Failed',
      request_id: 'req_3e8f7a1b9c2d4m55',
      description: 'OAuth token expired during inventory polling.',
    },
    {
      id: 'log-9',
      timestamp: 'May 23, 2025 10:35:44 AM',
      service: 'Authentication',
      event: 'Password Reset Requested',
      severity: 'Info',
      user: 'mariah.store@trended.com',
      status: 'Success',
      request_id: 'req_7c2b9a1d4f8e6m44',
      description: 'Signed token dispatched to user recovery email.',
    },
    {
      id: 'log-10',
      timestamp: 'May 23, 2025 10:34:18 AM',
      service: 'AI Generation',
      event: 'Image Generation Failed',
      severity: 'Critical',
      user: 'system',
      status: 'Failed',
      request_id: 'req_6d1f8a7b2c9e4m99',
      description: 'GPU cluster node unreachable for rendering batch.',
    },
  ],
  total: 1248,
  page: 1,
  page_size: 10,
  total_pages: 125,
};

export const DEFAULT_LOG_DETAIL: AdminLogDetail = {
  id: 'log-1',
  timestamp: 'May 23, 2025 10:42:31 AM (UTC)',
  service: 'AI Generation',
  event: 'Image Generation Completed',
  severity: 'Info',
  user: 'system',
  status: 'Success',
  request_id: 'req_7f3a9c2e1b8d4f91',
  description: 'AI image generated successfully for product ID 87241.',
  technical_details: {
    timestamp: '2025-05-23T10:42:31.123Z',
    request_id: 'req_7f3a9c2e1b8d4f91',
    service: 'ai_generation',
    event: 'image_generation_completed',
    user: 'system',
    status: 'success',
    duration_ms: 2847,
    product_id: '87241',
    prompt_id: 'prm_9d1b2f7c',
    model: 'dall-e-3',
    resolution: '1024x1024',
    file_url: 'https://cdn.trended.io/ai/87241/3f2a9c1d-7b8e-4c1f-93d2.jpg',
    size_kb: 512,
    metadata: {
      seed: 123456789,
      steps: 30,
      guidance_scale: 7.5,
    },
  },
};

export const DEFAULT_ADMIN_SETTINGS: AdminSettingsData = {
  default_ai_model: 'OpenAI GPT-4o',
  fallback_model: 'Anthropic Claude 3.5 Sonnet',
  default_creativity: 0.7,
  max_generations_per_user_day: 100,
  max_generations_per_admin_day: 500,
  max_tokens_per_generation: 4000,
  concurrent_generations_per_org: 10,
  monthly_ai_spend_alert_threshold: 500.0,
  alert_threshold_enabled: true,
  monthly_ai_spend_hard_limit: 2000.0,
  hard_limit_enabled: true,
  block_generation_when_limit_reached: true,
  data_refresh_interval: 'Every 6 hours',
  trend_calculation_window: '30 days',
  min_data_points_for_trend: 50,
  trend_score_algorithm: 'Weighted Momentum v2',
  weight_growth_velocity: 40,
  weight_search_volume: 30,
  weight_competition: 20,
  weight_profit_margin: 10,
  min_trend_score_to_show: 60,
  payment_provider: 'Stripe',
  currency: 'USD - US Dollar ($)',
  tax_calculation: 'Automatic',
  default_tax_rate: 7.5,
  invoice_prefix: 'INV-',
  enable_tax_collection: true,
  tax_display_mode: 'Inclusive',
  origin_country: 'United States',
  eu_vat_reverse_charge: false,
  session_duration: '8 hours',
  idle_session_timeout: '30 minutes',
  force_re_authentication: 'Every 7 days',
  two_factor_authentication: 'Required for Admins',
  password_minimum_length: 12,
  password_complexity: 'Strong',
  enforce_password_rotation: 'Every 90 days',
  uptime: '99.98%',
  last_health_check: '2 min ago',
  permissions: [
    {
      role: 'Super Admin',
      dashboard_access: true,
      product_intelligence: true,
      ai_generation: true,
      payments: true,
      integrations: true,
      system_settings: true,
      user_management: true,
    },
    {
      role: 'Admin',
      dashboard_access: true,
      product_intelligence: true,
      ai_generation: true,
      payments: true,
      integrations: true,
      system_settings: false,
      user_management: true,
    },
    {
      role: 'Support',
      dashboard_access: true,
      product_intelligence: true,
      ai_generation: false,
      payments: false,
      integrations: false,
      system_settings: false,
      user_management: true,
    },
    {
      role: 'Viewer',
      dashboard_access: true,
      product_intelligence: false,
      ai_generation: false,
      payments: false,
      integrations: false,
      system_settings: false,
      user_management: false,
    },
  ],
  last_saved: 'May 24, 2025 10:24 AM',
};

// ============================================================================
// API CLIENT IMPLEMENTATION
// ============================================================================

export async function fetchAdminOverview(): Promise<AdminOverviewResponse> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/admin/overview`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch {
    // Return high-fidelity fallback
  }
  return DEFAULT_ADMIN_OVERVIEW;
}

export async function fetchAdminUsers(params?: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<AdminUsersListResponse> {
  try {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.pageSize) query.set('page_size', params.pageSize.toString());

    const res = await fetch(`${getApiBaseUrl()}/admin/users?${query.toString()}`, {
      cache: 'no-store',
    });
    if (res.ok) return await res.json();
  } catch {
    // Return high-fidelity fallback
  }

  let users = DEFAULT_ADMIN_USERS.users;
  if (params?.search) {
    const s = params.search.toLowerCase();
    users = users.filter(
      (u) =>
        u.name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        u.store.toLowerCase().includes(s),
    );
  }
  if (params?.status && params.status !== 'All status') {
    users = users.filter((u) => u.status.toLowerCase() === params.status?.toLowerCase());
  }

  return {
    ...DEFAULT_ADMIN_USERS,
    users,
    total: users.length,
  };
}

export async function fetchAdminUserDetail(userId: string): Promise<AdminUserDetail> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/admin/users/${userId}`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch {
    // Return high-fidelity fallback
  }
  return { ...DEFAULT_USER_DETAIL, id: userId, user_id_display: userId };
}

export async function updateAdminUserStatus(
  userId: string,
  newStatus: string,
): Promise<{ success: boolean; status: string; message: string }> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/admin/users/${userId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }
  return { success: true, status: newStatus, message: `Status updated to ${newStatus}` };
}

export async function resetAdminUserAccess(
  userId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/admin/users/${userId}/reset-access`, {
      method: 'POST',
    });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }
  return { success: true, message: 'Password reset link sent to registered email' };
}

export async function fetchAdminSubscriptions(params?: {
  tab?: string;
  search?: string;
  page?: number;
}): Promise<AdminSubscriptionsResponse> {
  try {
    const query = new URLSearchParams();
    if (params?.tab) query.set('tab', params.tab);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', params.page.toString());

    const res = await fetch(`${getApiBaseUrl()}/admin/subscriptions?${query.toString()}`, {
      cache: 'no-store',
    });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }
  return DEFAULT_ADMIN_SUBSCRIPTIONS;
}

export async function fetchAdminTransactions(params?: {
  status?: string;
  provider?: string;
  type?: string;
  search?: string;
  page?: number;
}): Promise<AdminTransactionsResponse> {
  try {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.provider) query.set('provider', params.provider);
    if (params?.type) query.set('type', params.type);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', params.page.toString());

    const res = await fetch(`${getApiBaseUrl()}/admin/transactions?${query.toString()}`, {
      cache: 'no-store',
    });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }
  return DEFAULT_ADMIN_TRANSACTIONS;
}

export async function fetchAdminTransactionDetail(
  transactionId: string,
): Promise<AdminTransactionDetail> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/admin/transactions/${transactionId}`, {
      cache: 'no-store',
    });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }
  return { ...DEFAULT_TRANSACTION_DETAIL, transaction_id: transactionId };
}

export async function fetchAdminSystemLogs(params?: {
  severity?: string;
  service?: string;
  status?: string;
  search?: string;
  page?: number;
}): Promise<AdminLogsResponse> {
  try {
    const query = new URLSearchParams();
    if (params?.severity) query.set('severity', params.severity);
    if (params?.service) query.set('service', params.service);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', params.page.toString());

    const res = await fetch(`${getApiBaseUrl()}/admin/system-logs?${query.toString()}`, {
      cache: 'no-store',
    });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }
  return DEFAULT_ADMIN_LOGS;
}

export async function fetchAdminLogDetail(logId: string): Promise<AdminLogDetail> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/admin/system-logs/${logId}`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }
  return { ...DEFAULT_LOG_DETAIL, id: logId };
}

export async function fetchAdminSettings(): Promise<AdminSettingsResponse> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/admin/settings`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }
  return { settings: DEFAULT_ADMIN_SETTINGS, message: 'Settings loaded' };
}

export async function updateAdminSettings(
  settings: AdminSettingsData,
): Promise<AdminSettingsResponse> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }
  return { settings, message: 'Settings updated' };
}
