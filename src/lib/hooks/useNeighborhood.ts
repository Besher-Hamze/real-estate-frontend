import { useQuery } from "@tanstack/react-query";
import { neighborhoodApi } from "@/api/NeighborhoodApi";
import { NeighborhoodType } from "@/lib/types/create";
import { neighborhoodsQuery } from "../constants/queryNames";

export const useNeighborhood = () => {
  const {
    data: neighborhoodData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<NeighborhoodType[]>({
    queryKey: [neighborhoodsQuery],
    queryFn: () => neighborhoodApi.fetchNeighborhood(),
    staleTime: 60000,
    refetchInterval: 60000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });

  return {
    neighborhoods: neighborhoodData,
    isLoading,
    isError,
    error,
    refetch,
  };
};
