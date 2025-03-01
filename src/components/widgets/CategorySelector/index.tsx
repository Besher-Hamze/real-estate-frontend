import CategoryButton from "./CategoryButton";
import { MainType } from "@/lib/types";
import { CategorySkeleton } from "@/components/home/home";

interface CategorySelectorProps {
    mainTypes: MainType[];
    selectedMainTypeId: number | null;
    setSelectedMainTypeId: (id: number) => void;
    setSelectedSubTypeId: (id: number | null) => void;
    isLoading: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
    mainTypes,
    selectedMainTypeId,
    setSelectedMainTypeId,
    setSelectedSubTypeId,
    isLoading
}) => {

    const handleCategorySelect = (mainType: MainType): void => {
        setSelectedMainTypeId(mainType.id);

        // Auto select first subtype if available
        if (mainType.subtypes && mainType.subtypes.length > 0) {
            setSelectedSubTypeId(mainType.subtypes[0].id);
        } else {
            setSelectedSubTypeId(null);
        }
    };

    return (
        <div className="flex justify-center gap-4 mb-8 overflow-x-auto pb-4">
            {isLoading ? (
                Array(3).fill(0).map((_, index) => (
                    <CategorySkeleton key={index} />
                ))
            ) : (
                mainTypes?.map((mainType) => (
                    <CategoryButton
                        key={mainType.id}
                        mainType={mainType}
                        isSelected={selectedMainTypeId === mainType.id}
                        onClick={() => handleCategorySelect(mainType)}
                    />
                ))
            )}
        </div>
    );
};

export default CategorySelector;
