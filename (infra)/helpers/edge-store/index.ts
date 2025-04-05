import httpClient from '@/(infra)/config/httpClient';

export const edgeConfig = {
  async get<T>(restUrl: string): Promise<T> {
    const response = await httpClient.get({ url: `/api/edgeStore/${restUrl}` });

    return response as T;
  },

  async set(key: string, value: unknown) {
    const response = await httpClient.post({
      url: '/api/edgeStore',
      body: JSON.stringify({ key, value }),
    });

    return response;
  },
};
