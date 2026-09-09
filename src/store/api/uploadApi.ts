import { apiSlice } from './apiSlice';

export interface UploadedFile {
  url: string;
  fileId?: string;
}

export const uploadApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadImages: builder.mutation<UploadedFile[], FormData>({
      query: (formData) => ({
        url: '/upload',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: { data: UploadedFile[] } | UploadedFile[]) => {
        return Array.isArray(response) ? response : response.data || [];
      },
    }),
  }),
});

export const { useUploadImagesMutation } = uploadApi;
