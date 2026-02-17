import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client.ts';
import type { components } from '@/api/schema.d.ts';

type Trip = components['schemas']['Trip'];

export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/api/trips');
      if (error) throw new Error(error.error);
      return data.trips;
    },
    enabled: false, // Only fetch when user is logged in (enabled externally)
  });
}

export function useTrip(tripId: string | undefined) {
  return useQuery({
    queryKey: ['trips', tripId],
    queryFn: async () => {
      if (!tripId) throw new Error('No tripId');
      const { data, error } = await apiClient.GET('/api/trips/{tripId}', {
        params: { path: { tripId } },
      });
      if (error) throw new Error(error.error);
      return data.trip;
    },
    enabled: !!tripId,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (trip: Trip) => {
      const { data, error } = await apiClient.POST('/api/trips', {
        body: trip,
      });
      if (error) throw new Error(error.error);
      return data.trip;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useSaveTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tripId, trip }: { tripId: string; trip: Trip }) => {
      const { data, error } = await apiClient.PUT('/api/trips/{tripId}', {
        params: { path: { tripId } },
        body: trip,
      });
      if (error) throw new Error(error.error);
      return data.trip;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trips', variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tripId: string) => {
      const { data, error } = await apiClient.DELETE('/api/trips/{tripId}', {
        params: { path: { tripId } },
      });
      if (error) throw new Error(error.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}
