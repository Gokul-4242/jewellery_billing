import { apiSlice } from './apiSlice';
import type { Product, StockStatus } from '../../types/Dashboard.types';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

const mapProduct = (p: any): Product => {
  const qty = p.stock ?? p.initialStock ?? p.quantity ?? 0;
  const getStatus = (quantity: number): StockStatus => {
    if (quantity > 10) return 'In Stock';
    if (quantity > 0) return 'Low Stock';
    return 'Out of Stock';
  };

  return {
    id: p._id || p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    material: p.material,
    weight: p.weight,
    makingCharge: p.makingCharge,
    wastagePercent: p.wastagePercent,
    stoneCost: p.stoneCost || 0,
    price: p.makingCharge ?? p.price ?? 0,
    quantity: qty,
    status: getStatus(qty),
    images: Array.isArray(p.images)
      ? p.images.map((img: any) => (typeof img === 'string' ? img : img.url || ''))
      : [],
    lastModified: p.updatedAt || p.createdAt || new Date().toISOString(),
  };
};

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      query: () => '/products?limit=500',
      transformResponse: (response: ApiResponse<any[]> | any[]) => {
        const list = Array.isArray(response) ? response : response.data || [];
        return list.map(mapProduct);
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    getProductById: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      transformResponse: (response: ApiResponse<any> | any) => {
        const item = response.data || response;
        return mapProduct(item);
      },
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),
    addProduct: builder.mutation<Product, any>({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<any> | any) => {
        const item = response.data || response;
        return mapProduct(item);
      },
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data: newProduct } = await queryFulfilled;
          dispatch(
            productApi.util.updateQueryData('getProducts', undefined, (draft) => {
              const exists = draft.some((p) => p.id === newProduct.id);
              if (!exists) {
                draft.unshift(newProduct);
              }
            })
          );
        } catch (err) {
          console.error('Optimistic product add failed:', err);
        }
      },
    }),
    updateProduct: builder.mutation<Product, { id: string; updates: Partial<Product> }>({
      query: ({ id, updates }) => {
        const backendUpdates: any = { ...updates };
        if (updates.price !== undefined) backendUpdates.makingCharge = updates.price;
        if (updates.makingCharge !== undefined) backendUpdates.makingCharge = updates.makingCharge;
        const { quantity, id: _, status, ...fields } = backendUpdates;
        return {
          url: `/products/${id}`,
          method: 'PUT',
          body: fields,
        };
      },
      transformResponse: (response: ApiResponse<any> | any) => {
        const item = response.data || response;
        return mapProduct(item);
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
      async onQueryStarted({ id, updates }, { dispatch, queryFulfilled }) {
        try {
          const { data: updatedProduct } = await queryFulfilled;
          dispatch(
            productApi.util.updateQueryData('getProducts', undefined, (draft) => {
              const index = draft.findIndex((p) => p.id === id);
              if (index !== -1) {
                draft[index] = { ...draft[index], ...updatedProduct, ...updates };
              }
            })
          );
        } catch (err) {
          console.error('Optimistic product update failed:', err);
        }
      },
    }),
    updateStock: builder.mutation<void, { id: string; change: number; reason?: string }>({
      query: ({ id, change, reason = 'Manual Adjustment via Admin Panel' }) => ({
        url: `/products/${id}/stock`,
        method: 'PUT',
        body: { change, reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
      async onQueryStarted({ id, change }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            productApi.util.updateQueryData('getProducts', undefined, (draft) => {
              const product = draft.find((p) => p.id === id);
              if (product) {
                product.quantity = Math.max(0, (product.quantity || 0) + change);
                product.status =
                  product.quantity > 10 ? 'In Stock' : product.quantity > 0 ? 'Low Stock' : 'Out of Stock';
              }
            })
          );
        } catch (err) {
          console.error('Stock update cache sync failed:', err);
        }
      },
    }),
    deleteProduct: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            productApi.util.updateQueryData('getProducts', undefined, (draft) => {
              return draft.filter((p) => p.id !== id);
            })
          );
        } catch (err) {
          console.error('Delete product cache sync failed:', err);
        }
      },
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useUpdateStockMutation,
  useDeleteProductMutation,
} = productApi;
