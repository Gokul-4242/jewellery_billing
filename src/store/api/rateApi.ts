import { apiSlice } from './apiSlice';

export interface MetalRates {
  gold24k: number;
  gold22k: number;
  silver: number;
  previous?: {
    gold24k: number;
    gold22k: number;
    silver: number;
    lastUpdated: string;
  };
}

export const DEFAULT_RATES: MetalRates = {
  gold24k: 6850,
  gold22k: 6650,
  silver: 92,
};

interface ApiResponse<T> {
  data: T;
  success?: boolean;
}

export const rateApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRates: builder.query<MetalRates, void>({
      query: () => '/rates',
      transformResponse: (response: ApiResponse<MetalRates> | MetalRates) => {
        return (response as ApiResponse<MetalRates>).data || response || DEFAULT_RATES;
      },
      providesTags: ['Rate'],
    }),
    updateRates: builder.mutation<MetalRates, Partial<MetalRates>>({
      query: (body) => ({
        url: '/rates',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<MetalRates> | MetalRates) => {
        return (response as ApiResponse<MetalRates>).data || response || DEFAULT_RATES;
      },
      invalidatesTags: ['Rate'],
    }),
  }),
});

export const { useGetRatesQuery, useUpdateRatesMutation } = rateApi;
