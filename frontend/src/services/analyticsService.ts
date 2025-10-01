import api from './api';

interface ClickData {
  ip: string;
  userAgent: string;
  referrer: string;
  timestamp: string;
}

interface DeviceBreakdown {
  Desktop?: number;
  Mobile?: number;
  Tablet?: number;
  Other?: number;
}

interface AnalyticsResponse {
  success: boolean;
  data: {
    shortId: string;
    originalUrl: string;
    shortUrl: string;
    createdAt: string;
    analytics: {
      totalClicks: number;
      clicksByDate: Record<string, number>; // { "2025-10-01": 2 }
      deviceBreakdown: DeviceBreakdown;
      recentClicks: ClickData[];
    };
  };
}

export const analyticsService = {
  getAnalytics: async (shortId: string): Promise<AnalyticsResponse> => {
    const response = await api.get(`/analytics/${shortId}`);
    return response.data;
  },
};
