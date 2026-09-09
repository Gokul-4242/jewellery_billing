import { apiSlice } from './apiSlice';
import type { Customer } from '../../types/Customer';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const customerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<Customer[], void>({
      query: () => '/customers',
      transformResponse: (response: ApiResponse<any[]> | any[]) => {
        const list = Array.isArray(response) ? response : response.data || [];
        return list.map((c: any) => ({
          ...c,
          id: c._id || c.id,
        }));
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Customer' as const, id })),
              { type: 'Customer', id: 'LIST' },
            ]
          : [{ type: 'Customer', id: 'LIST' }],
    }),
    getCustomerById: builder.query<Customer, string>({
      query: (id) => `/customers/${id}`,
      transformResponse: (response: ApiResponse<any> | any) => {
        const item = response.data || response;
        return {
          ...item,
          id: item._id || item.id,
        };
      },
      providesTags: (_result, _error, id) => [{ type: 'Customer', id }],
    }),
    addCustomer: builder.mutation<Customer, Partial<Customer>>({
      query: (body) => ({
        url: '/customers',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<any> | any) => {
        const item = response.data || response;
        return {
          ...item,
          id: item._id || item.id,
        };
      },
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data: newCustomer } = await queryFulfilled;
          dispatch(
            customerApi.util.updateQueryData('getCustomers', undefined, (draft) => {
              const exists = draft.some((c) => c.id === newCustomer.id);
              if (!exists) {
                draft.unshift(newCustomer);
              }
            })
          );
        } catch (err) {
          console.error('Optimistic customer add failed:', err);
        }
      },
    }),
    updateCustomer: builder.mutation<Customer, Customer>({
      query: ({ id, ...body }) => ({
        url: `/customers/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiResponse<any> | any) => {
        const item = response.data || response;
        return {
          ...item,
          id: item._id || item.id,
        };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Customer', id },
        { type: 'Customer', id: 'LIST' },
      ],
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data: updated } = await queryFulfilled;
          dispatch(
            customerApi.util.updateQueryData('getCustomers', undefined, (draft) => {
              const idx = draft.findIndex((c) => c.id === id);
              if (idx !== -1) {
                draft[idx] = { ...draft[idx], ...updated };
              }
            })
          );
        } catch (err) {
          console.error('Optimistic customer update failed:', err);
        }
      },
    }),
    deleteCustomer: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Customer', id },
        { type: 'Customer', id: 'LIST' },
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            customerApi.util.updateQueryData('getCustomers', undefined, (draft) => {
              return draft.filter((c) => c.id !== id);
            })
          );
        } catch (err) {
          console.error('Delete customer cache sync failed:', err);
        }
      },
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useAddCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customerApi;
