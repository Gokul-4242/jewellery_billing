import { apiSlice } from './apiSlice';
import { setCredentials, type User } from '../slices/authSlice';

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LoginResponse {
  token?: string;
  user?: User;
  data?: {
    token: string;
    user?: User;
  };
  message?: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const token = data.token || data.data?.token;
          if (token) {
            const user: User = data.user || data.data?.user || {
              id: 'admin',
              username: arg.email,
              role: 'admin',
            };
            dispatch(setCredentials({ user, token }));
          }
        } catch (error) {
          console.error('Login query failed:', error);
        }
      },
    }),
    updatePassword: builder.mutation<{ success: boolean; message?: string }, UpdatePasswordRequest>({
      query: (body) => ({
        url: '/auth/updatepassword',
        method: 'PUT',
        body,
      }),
    }),
  }),
});

export const { useLoginMutation, useUpdatePasswordMutation } = authApi;
