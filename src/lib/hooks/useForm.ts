import { useState } from 'react';

export function useForm<T>(initialValues: T) {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setValues(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (onSubmit: (values: T) => Promise<void>) => {
        try {
            setIsSubmitting(true);
            await onSubmit(values);
            setValues(initialValues);
            setErrors({});
        } catch (error) {
            if (error instanceof Error) {
                // setErrors({ _form: error.message });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        values,
        errors,
        isSubmitting,
        handleChange,
        handleSubmit,
        setValues,
        setErrors
    };
}
