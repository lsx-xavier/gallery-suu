import httpClient from "@/config/httpClient";

export const edgeConfig = {
  async get<T>(restUrl: string): Promise<T> {
    const response = await httpClient.get({ url: `/api/edgeStore/${restUrl}` });

    return response
  },

  async set(key: string, value: any) {
    const response = await httpClient.post({
      url: '/api/edgeStore',
      body: JSON.stringify({ key, value })
    });

    return response;
  }
};