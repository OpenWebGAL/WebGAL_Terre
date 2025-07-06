import useSWR from 'swr';
import { api } from '@/api';

export const osInfoFetcher = () => api.appControllerGetOsInfo().then((res) => res.data.platform);

export const useOsInfo = () => {
  return useSWR('osinfo', osInfoFetcher);
};