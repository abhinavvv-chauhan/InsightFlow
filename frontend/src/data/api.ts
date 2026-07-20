import { kpiData, funnelData, funnelDropoffs, customerData, productData } from './mock'
import type { KpiData, FunnelStep, FunnelDropoffDetail, CustomerData, ProductData } from './types'

/**
 * Data layer mirroring the InsightFlow FastAPI endpoints
 * (/api/kpi, /api/funnel, /api/customer, /api/product).
 * Swap the mock resolvers for axios calls to VITE_API_URL to go live.
 */

const LATENCY = 700

function withLatency<T>(data: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms + Math.random() * 400))
}

export const api = {
  kpi: (): Promise<KpiData> => withLatency(kpiData),
  funnel: (): Promise<FunnelStep[]> => withLatency(funnelData),
  funnelDropoffs: (): Promise<FunnelDropoffDetail[]> => withLatency(funnelDropoffs, 200),
  customer: (): Promise<CustomerData> => withLatency(customerData),
  product: (): Promise<ProductData> => withLatency(productData),
}
