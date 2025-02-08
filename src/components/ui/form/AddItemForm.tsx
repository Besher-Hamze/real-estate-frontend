import { Plus } from "lucide-react";
import { ChangeEvent, useState } from "react";

interface FileField {
    type: 'file';
    name: string;
    label: string;
    accept?: string;
    preview?: boolean;
    required?: boolean;
}

interface TextField {
    type: 'text';
    name: string;
    label: string;
    placeholder?: string;
    required?: boolean;
}

interface SelectField {
    type: 'select';
    name: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    options: Array<{ value: string | number; label: string }>;
}

type Field = FileField | TextField | SelectField;

interface FormState {
    [key: string]: string | File | number | null;
}

interface AddItemFormProps {
    title: string;
    buttonText: string;
    fields: Field[];
    onSubmit: (formData: any) => Promise<void>;
}

export function AddItemForm({
    title,
    buttonText,
    fields,
    onSubmit,
}: AddItemFormProps) {
    const initialState: FormState = Object.fromEntries(
        fields.map(field => [field.name, null])
    );
    const [formData, setFormData] = useState<FormState>(initialState);
    const [previews, setPreviews] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formDataToSubmit = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null) {
                if (value instanceof File) {
                    // Explicitly handle File objects
                    formDataToSubmit.append(key, value, value.name);
                } else {
                    formDataToSubmit.append(key, value.toString());
                }
            }
        });

        console.log("Submitted FormData:");
        for (let [key, value] of formDataToSubmit.entries()) {
            console.log(`${key}:`, value);
        }

        try {
            setIsLoading(true);
            await onSubmit(formDataToSubmit);

            setFormData(initialState);
            setPreviews({});
        } catch (error) {
            console.error('Submission error:', error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleChange = (
        name: string,
        value: string | File | number | null,
        type: 'text' | 'file' | 'select'
    ) => {
        if (type === 'file' && value instanceof File) {
            const url = URL.createObjectURL(value as File);
            setPreviews(prev => ({ ...prev, [name]: url }));
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>, name: string) => {
        const file = e.target.files?.[0] || null;
        handleChange(name, file, 'file');
    };



    const renderField = (field: Field) => {
        switch (field.type) {
            case 'file':
                return (
                    <div>
                        <input
                            type="file"
                            accept={field.accept}
                            onChange={(e) => handleFileChange(e, field.name)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required={field.required}
                        />
                        {field.preview && previews[field.name] && (
                            <div className="mt-2">
                                <img
                                    src={previews[field.name]}
                                    alt="Preview"
                                    className="w-16 h-16 object-cover rounded"
                                />
                            </div>
                        )}
                    </div>
                );
            case 'select':
                return (
                    <select
                        value={formData[field.name]?.toString() || ''}
                        onChange={(e) => handleChange(
                            field.name,
                            e.target.value ? Number(e.target.value) : null,
                            'select'
                        )}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required={field.required}
                    >
                        <option value="">{field.placeholder || 'اختر...'}</option>
                        {field.options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
            default:
                return (
                    <input
                        type="text"
                        value={formData[field.name]?.toString() || ''}
                        onChange={(e) => handleChange(field.name, e.target.value, 'text')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={field.placeholder}
                        required={field.required}
                    />
                );
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-semibold mb-6">{title}</h2>
            <div className="space-y-4">
                {fields.map((field) => (
                    <div key={field.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                        </label>
                        {renderField(field)}
                    </div>
                ))}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 
                        ${isLoading
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        } text-white`}
                >
                    {isLoading ? (
                        <div className="flex items-center">
                            <svg
                                className="animate-spin h-5 w-5 mr-2"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            جاري الإرسال...
                        </div>
                    ) : (
                        <>
                            <Plus className="w-5 h-5" />
                            {buttonText}
                        </>
                    )}
                </button>
            </div>
        </form>
    );

}