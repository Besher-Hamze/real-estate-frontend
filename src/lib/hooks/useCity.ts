import { useQuery } from "@tanstack/react-query";
import { cityApi } from "@/api/cityApi";
import { CityType } from "@/lib/types/create";
import { cityQuery } from "../constants/queryNames";

export const useCity = () => {
  const {
    data: cityData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<CityType[]>({
    queryKey: [cityQuery],
    queryFn: () => cityApi.fetchCity(),
    staleTime: 60000,
    refetchInterval: 60000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });

  return {
    cities: cityData,
    isLoading,
    isError,
    error,
    refetch,
  };
};
