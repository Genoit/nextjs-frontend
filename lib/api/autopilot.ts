import { fetchWithAuth } from './core';
import { AutopilotFacts, AutopilotRun } from '../types/autopilot';

export const autopilotApi = {
  /** Start (or, same key, get back) a run. First run: 1 ad, later runs: 3. */
  create(productId: string, idempotencyKey: string): Promise<AutopilotRun> {
    return fetchWithAuth<AutopilotRun>('/ads/autopilot', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, idempotency_key: idempotencyKey }),
    });
  },

  get(runId: string): Promise<AutopilotRun> {
    return fetchWithAuth<AutopilotRun>(`/ads/autopilot/${encodeURIComponent(runId)}`);
  },

  /** 409 unless the run waits for the fact check. */
  confirm(runId: string, facts: AutopilotFacts): Promise<AutopilotRun> {
    return fetchWithAuth<AutopilotRun>(`/ads/autopilot/${encodeURIComponent(runId)}/confirm`, {
      method: 'POST',
      body: JSON.stringify(facts),
    });
  },

  cancel(runId: string): Promise<AutopilotRun> {
    return fetchWithAuth<AutopilotRun>(`/ads/autopilot/${encodeURIComponent(runId)}/cancel`, {
      method: 'POST',
    });
  },

  list(): Promise<AutopilotRun[]> {
    return fetchWithAuth<AutopilotRun[]>('/ads');
  },
};
