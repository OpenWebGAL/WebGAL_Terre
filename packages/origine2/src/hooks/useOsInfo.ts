import useSWR from 'swr';
import { api } from '@/api';

const osInfoFetcher = () => api.appControllerGetOsInfo().then((res) => res.data);

const useOsInfo = () => {
  return useSWR('osinfo', osInfoFetcher);
};

export default useOsInfo;
