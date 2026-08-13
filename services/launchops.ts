"use client";

import { api } from "@/services/api";

export type Customer = {
  id: number;
  name: string;
};

export type TenantUser = {
  id: number;
  email: string;
  enabled: boolean;
  role: "TENANT_ADMIN" | "TENANT_USER";
  createdAt: string;
  updatedAt: string;
};

export type BillingInterval = "MONTHLY" | "YEARLY";

export type BillingPlan = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
  billingInterval: BillingInterval;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Subscription = {
  id: number;
  customerId: number;
  planId: number;
  planCode: string;
  planName: string;
  planAmount: number;
  currency: string;
  billingInterval: BillingInterval;
  status: "ACTIVE" | "CANCELLED";
  startedAt: string;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Pricing = {
  subscriptionId: number;
  customerId: number;
  planId: number;
  planName: string;
  currency: string;
  billingInterval: BillingInterval;
  subtotal: number;
  discount: number;
  tax: number;
  finalAmount: number;
  subscriptionStatus: "ACTIVE" | "CANCELLED";
};

export type LoginResponse = {
  tokenType?: string;
  accessToken: string;
  expiresAt?: string;
  tenantId: string;
  email?: string;
  role: "TENANT_ADMIN" | "TENANT_USER";
};

export type CreateTenantUserPayload = {
  email: string;
  password: string;
  role: "TENANT_ADMIN" | "TENANT_USER";
};

export type CreateBillingPlanPayload = {
  code: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  billingInterval: BillingInterval;
};

export type CreateSubscriptionPayload = {
  customerId: number;
  planId: number;
};

export function login(payload: {
  tenantId: string;
  email: string;
  password: string;
}) {
  return api.post<LoginResponse>("/api/auth/login", payload);
}

export function listCustomers() {
  return api.get<Customer[]>("/customers");
}

export function listTenantUsers() {
  return api.get<TenantUser[]>("/api/tenant/users");
}

export function createTenantUser(payload: CreateTenantUserPayload) {
  return api.post<TenantUser>("/api/tenant/users", payload);
}

export function updateTenantUserEnabled(userId: number, enabled: boolean) {
  return api.patch<TenantUser>(`/api/tenant/users/${userId}/enabled`, {
    enabled,
  });
}

export function listPlans() {
  return api.get<BillingPlan[]>("/api/plans");
}

export function createPlan(payload: CreateBillingPlanPayload) {
  return api.post<BillingPlan>("/api/plans", payload);
}

export function updatePlanEnabled(planId: number, enabled: boolean) {
  return api.patch<BillingPlan>(`/api/plans/${planId}/enabled`, { enabled });
}

export function listSubscriptions() {
  return api.get<Subscription[]>("/api/subscriptions");
}

export function createSubscription(payload: CreateSubscriptionPayload) {
  return api.post<Subscription>("/api/subscriptions", payload);
}

export function cancelSubscription(subscriptionId: number) {
  return api.patch<Subscription>(`/api/subscriptions/${subscriptionId}/cancel`);
}

export function getPricing(subscriptionId: number) {
  return api.get<Pricing>(`/api/pricing/${subscriptionId}`);
}
