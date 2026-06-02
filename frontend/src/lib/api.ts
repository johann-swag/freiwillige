/**
 * Typed API client
 * Generated from FastAPI OpenAPI spec at http://localhost:8000/openapi.json
 * Regenerate with: npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api.ts
 */

import axios, { AxiosInstance } from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export function createApiClient(token?: string): AxiosInstance {
  return axios.create({
    baseURL: `${BASE_URL}/api/v1`,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}

// ── Volunteers ────────────────────────────────────────────────────────────────

export const volunteersApi = {
  list: (client: AxiosInstance, params?: { status?: string; page?: number; page_size?: number }) =>
    client.get('/volunteers', { params }),

  get: (client: AxiosInstance, id: string) =>
    client.get(`/volunteers/${id}`),

  create: (client: AxiosInstance, data: unknown) =>
    client.post('/volunteers', data),

  update: (client: AxiosInstance, id: string, data: unknown) =>
    client.patch(`/volunteers/${id}`, data),

  qualify: (client: AxiosInstance, id: string) =>
    client.post(`/volunteers/${id}/qualify`),

  getMatchScores: (client: AxiosInstance, id: string) =>
    client.get(`/volunteers/${id}/match-scores`),

  overrideStatus: (client: AxiosInstance, id: string, status: string, reason: string) =>
    client.post(`/volunteers/${id}/status-override`, null, { params: { new_status: status, reason } }),
}

// ── Programs ──────────────────────────────────────────────────────────────────

export const programsApi = {
  list: (client: AxiosInstance) => client.get('/programs'),
  get: (client: AxiosInstance, slug: string) => client.get(`/programs/${slug}`),
  create: (client: AxiosInstance, data: unknown) => client.post('/programs', data),
}

// ── Sites ─────────────────────────────────────────────────────────────────────

export const sitesApi = {
  list: (client: AxiosInstance, params?: { program_slug?: string }) =>
    client.get('/sites', { params }),
  get: (client: AxiosInstance, slug: string) => client.get(`/sites/${slug}`),
  create: (client: AxiosInstance, data: unknown) => client.post('/sites', data),
}

// ── Documents ─────────────────────────────────────────────────────────────────

export const documentsApi = {
  list: (client: AxiosInstance, volunteerId: string) =>
    client.get(`/volunteers/${volunteerId}/documents`),

  uploadUrl: (client: AxiosInstance, data: unknown) =>
    client.post('/documents/upload-url', data),

  approve: (client: AxiosInstance, id: string) =>
    client.post(`/documents/${id}/approve`),

  reject: (client: AxiosInstance, id: string, notes: string) =>
    client.post(`/documents/${id}/reject`, { notes }),

  request: (client: AxiosInstance, data: unknown) =>
    client.post('/documents/request', data),
}

// ── Placements ────────────────────────────────────────────────────────────────

export const placementsApi = {
  create: (client: AxiosInstance, data: unknown) =>
    client.post('/placements', data),

  confirm: (client: AxiosInstance, id: string) =>
    client.post(`/placements/${id}/confirm`),

  list: (client: AxiosInstance, params?: { volunteer_id?: string; site_id?: string }) =>
    client.get('/placements', { params }),
}
