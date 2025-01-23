import { RealEstateApi } from "@/api/realEstateApi";
import { useQuery } from "@tanstack/react-query";
import { estateQuery } from "../constants/queryNames";

export const useRealEstate = () => {
    const {
        data: realEstateData,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: [estateQuery],
        queryFn: () => RealEstateApi.fetchRealEstate(),
        staleTime: 60000,
        refetchInterval: 60000,
        retry: 3,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    });

    return {
        realEstateData,
        isLoading,
        isError,
        error,
        refetch,
    }
}