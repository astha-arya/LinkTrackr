import api from './api';

interface ClickData {
  ip: string;
  userAgent: string;
  referrer: string;
  timestamp: string;
}

interface DeviceBreakdown {
  Desktop: number;
  Mobile: number;
  Tablet: number;
  Other: number;
}

interface AnalyticsCore {
  totalClicks: number;
  clicksByDate: Record<string, number>; // ✅ backend sends object, not array
  deviceBreakdown: Partial<DeviceBreakdown>; // ✅ may be missing keys
  recentClicks: ClickData[];
}

interface AnalyticsResponse {
  success: boolean;
  data: {
    shortId: string;
    originalUrl: string;
    shortUrl: string;
    createdAt: string;
    analytics: AnalyticsCore;
  };
}

export const analyticsService = {
  getAnalytics: async (shortId: string): Promise<AnalyticsResponse> => {
    const response = await api.get(`/analytics/${shortId}`);
    return response.data as AnalyticsResponse;
  },
};
