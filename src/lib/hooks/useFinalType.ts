import { useQuery } from "@tanstack/react-query";
import { FinalType, SubType } from "@/lib/types/types";
import { finalTypeTypeApi } from "@/api/finalTypeApi";
import { finalTypeQuery } from "../constants/queryNames";

export const useFinalType = () => {
  const {
    data: finalTypeData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<FinalType[]>({
    queryKey: [finalTypeQuery],
    queryFn: () => finalTypeTypeApi.fetchFinalTypeType(),
    staleTime: 60000,
    refetchInterval: 60000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });

  return {
    finalTypes: finalTypeData,
    isLoading,
    isError,
    error,
    refetch,
  };
};
