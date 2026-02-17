import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client.ts';

export function useMembers(tripId: string | undefined) {
  return useQuery({
    queryKey: ['trip-members', tripId],
    queryFn: async () => {
      if (!tripId) throw new Error('No tripId');
      const { data, error } = await apiClient.GET('/api/trips/{tripId}/members', {
        params: { path: { tripId } },
      });
      if (error) throw new Error(error.error);
      return data.members;
    },
    enabled: !!tripId,
  });
}

export function useInviteMember(tripId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: 'editor' | 'viewer' }) => {
      if (!tripId) throw new Error('No tripId');
      const { data, error } = await apiClient.POST('/api/trips/{tripId}/invite', {
        params: { path: { tripId } },
        body: { email, role },
      });
      if (error) throw new Error(error.error);
      return data.invitation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-members', tripId] });
    },
  });
}

export function useRemoveMember(tripId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      if (!tripId) throw new Error('No tripId');
      const { data, error } = await apiClient.DELETE('/api/trips/{tripId}/members/{userId}', {
        params: { path: { tripId, userId } },
      });
      if (error) throw new Error(error.error);
      return data.member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-members', tripId] });
    },
  });
}

export function useUpdateMemberRole(tripId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'editor' | 'viewer' }) => {
      if (!tripId) throw new Error('No tripId');
      const { data, error } = await apiClient.PATCH('/api/trips/{tripId}/members/{userId}', {
        params: { path: { tripId, userId } },
        body: { role },
      });
      if (error) throw new Error(error.error);
      return data.member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-members', tripId] });
    },
  });
}
