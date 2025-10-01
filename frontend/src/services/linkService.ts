import api from './api';

interface ShortenData {
  originalUrl: string;
  customAlias?: string;
}

interface Link {
  shortId: string;
  originalUrl: string;
  shortUrl: string;
  totalClicks: number;
  createdAt: string;
}

interface LinksResponse {
  success: boolean;
  data: Link[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalLinks: number;
    hasMore: boolean;
  };
}

interface ShortenResponse {
  success: boolean;
  message: string;
  data: Link;
}

interface DeleteResponse {
  success: boolean;
  message: string;
}

export const linkService = {
  shorten: async (data: ShortenData): Promise<ShortenResponse> => {
    const response = await api.post('/shorten', data);
    return response.data;
  },

  getLinks: async (page = 1, limit = 10): Promise<LinksResponse> => {
    const response = await api.get(`/links?page=${page}&limit=${limit}`);
    return response.data;
  },

  deleteLink: async (shortId: string): Promise<DeleteResponse> => {
    const response = await api.delete(`/links/${shortId}`);
    return response.data;
  },
};
