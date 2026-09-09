import { apiSlice } from './apiSlice';
import type { Transaction } from '../../types/Transaction';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

const mapTransaction = (t: any): Transaction => ({
  ...t,
  id: t._id || t.id,
});

export const transactionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query<Transaction[], void>({
      query: () => '/transactions',
      transformResponse: (response: ApiResponse<any[]> | any[]) => {
        const list = Array.isArray(response) ? response : response.data || [];
        return list.map(mapTransaction);
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Transaction' as const, id })),
              { type: 'Transaction', id: 'LIST' },
            ]
          : [{ type: 'Transaction', id: 'LIST' }],
    }),
    getTransactionById: builder.query<Transaction, string>({
      query: (id) => `/transactions/${id}`,
      transformResponse: (response: ApiResponse<any> | any) => {
        const item = response.data || response;
        return mapTransaction(item);
      },
      providesTags: (_result, _error, id) => [{ type: 'Transaction', id }],
    }),
    addTransaction: builder.mutation<Transaction, Transaction>({
      query: (body) => ({
        url: '/transactions',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<any> | any) => {
        const item = response.data || response;
        return mapTransaction(item);
      },
      invalidatesTags: [{ type: 'Transaction', id: 'LIST' }],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data: newTxn } = await queryFulfilled;
          dispatch(
            transactionApi.util.updateQueryData('getTransactions', undefined, (draft) => {
              const exists = draft.some((t) => t.id === newTxn.id);
              if (!exists) {
                draft.unshift(newTxn);
              }
            })
          );
        } catch (err) {
          console.error('Optimistic transaction add failed:', err);
        }
      },
    }),
    createCustomOrder: builder.mutation<Transaction, Transaction>({
      query: (body) => ({
        url: '/orders/custom',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<any> | any) => {
        const item = response.data || response;
        return mapTransaction(item);
      },
      invalidatesTags: [
        { type: 'Transaction', id: 'LIST' },
        { type: 'Product', id: 'LIST' },
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data: newOrder } = await queryFulfilled;
          dispatch(
            transactionApi.util.updateQueryData('getTransactions', undefined, (draft) => {
              const exists = draft.some((t) => t.id === newOrder.id);
              if (!exists) {
                draft.unshift(newOrder);
              }
            })
          );
        } catch (err) {
          console.error('Optimistic custom order add failed:', err);
        }
      },
    }),
    createInvoice: builder.mutation<any, any>({
      query: (body) => ({
        url: '/billing/invoice',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Transaction', id: 'LIST' },
        { type: 'Product', id: 'LIST' },
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const savedTxn = res.data?.data || res.data;
          if (savedTxn) {
            const mapped = mapTransaction(savedTxn);
            dispatch(
              transactionApi.util.updateQueryData('getTransactions', undefined, (draft) => {
                const exists = draft.some((t) => t.id === mapped.id);
                if (!exists) {
                  draft.unshift(mapped);
                }
              })
            );
          }
        } catch (err) {
          console.error('Optimistic invoice add failed:', err);
        }
      },
    }),
    updateTransaction: builder.mutation<Transaction, Transaction>({
      query: (updated) => ({
        url: `/transactions/${updated.id || updated._id}`,
        method: 'PUT',
        body: updated,
      }),
      transformResponse: (response: ApiResponse<any> | any) => {
        const item = response.data || response;
        return mapTransaction(item);
      },
      invalidatesTags: (_result, _error, { id, _id }) => [
        { type: 'Transaction', id: id || _id },
        { type: 'Transaction', id: 'LIST' },
      ],
      async onQueryStarted({ id, _id }, { dispatch, queryFulfilled }) {
        try {
          const { data: updated } = await queryFulfilled;
          const targetId = id || _id;
          dispatch(
            transactionApi.util.updateQueryData('getTransactions', undefined, (draft) => {
              const idx = draft.findIndex((t) => t.id === targetId || t._id === targetId);
              if (idx !== -1) {
                draft[idx] = { ...draft[idx], ...updated };
              }
            })
          );
        } catch (err) {
          console.error('Optimistic transaction update failed:', err);
        }
      },
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useGetTransactionByIdQuery,
  useAddTransactionMutation,
  useCreateCustomOrderMutation,
  useCreateInvoiceMutation,
  useUpdateTransactionMutation,
} = transactionApi;
