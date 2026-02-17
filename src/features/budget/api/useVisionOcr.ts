import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/api/client.ts';

export function useVisionOcr() {
  return useMutation({
    mutationFn: async (imageBase64: string): Promise<string> => {
      const { data, error } = await apiClient.POST('/api/vision', {
        body: { image: imageBase64 },
      });
      if (error) throw new Error(error.error);
      return data.text;
    },
  });
}
