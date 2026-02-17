import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client.ts';
import { TRIPS_QUERY_KEY } from '@/hooks/useTripQuery.ts';

export function useMyInvitations() {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      const { data } = await apiClient.GET('/api/invitations');
      if (!data) throw new Error('Failed to fetch invitations');
      return data.invitations;
    },
    refetchInterval: 60_000, // Poll every minute
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { data, error } = await apiClient.POST('/api/invitations/{invitationId}/accept', {
        params: { path: { invitationId } },
      });
      if (error) throw new Error(error.error);
      return data.member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: TRIPS_QUERY_KEY });
    },
  });
}

export function useDeclineInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await apiClient.POST('/api/invitations/{invitationId}/decline', {
        params: { path: { invitationId } },
      });
      if (error) throw new Error(error.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
}
