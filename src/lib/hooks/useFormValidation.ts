import { useState, useCallback } from 'react';
import { ObjectSchema, ValidationError } from 'yup';

type ValidationErrors = Record<string, string>;

export function useFormValidation<T extends Record<string, any>>(
    schema: ObjectSchema<any>,
    initialValues: T,
) {
    const [formData, setFormData] = useState<T>(initialValues);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateField = useCallback(
        async (name: string, value: any) => {
            try {
                // Create a partial schema for just this field
                const fieldSchema = schema.pick([name]);

                await fieldSchema.validate({ [name]: value }, { abortEarly: false });
                // Clear error if validation passes
                setErrors((prev) => ({ ...prev, [name]: '' }));
                return true;
            } catch (error) {
                if (error instanceof ValidationError) {
                    // Set the validation error for this field
                    setErrors((prev) => ({ ...prev, [name]: (error as any).message }));
                }
                return false;
            }
        },
        [schema, formData]
    );

    const handleChange = useCallback(
        (field: string, value: any) => {
            setFormData((prev) => {
                const newData = { ...prev, [field]: value };
                // Validate the field after update
                validateField(field, value);
                return newData;
            });
        },
        [validateField]
    );

    const validateForm = useCallback(async () => {
        try {
            await schema.validate(formData, { abortEarly: false });
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof ValidationError) {
                const newErrors: ValidationErrors = {};
                error.inner.forEach((err) => {
                    if (err.path) {
                        newErrors[err.path] = err.message;
                    }
                });
                setErrors(newErrors);
            }
            return false;
        }
    }, [schema, formData]);

    const handleSubmit = useCallback(
        async (onSubmit: (data: T) => Promise<void>) => {
            setIsSubmitting(true);

            try {
                const isValid = await validateForm();
                if (isValid) {
                    await onSubmit(formData);
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Form submission error:', error);
                return false;
            } finally {
                setIsSubmitting(false);
            }
        },
        [formData, validateForm]
    );

    return {
        formData,
        errors,
        isSubmitting,
        handleChange,
        validateField,
        validateForm,
        handleSubmit,
        setFormData,
    };
}