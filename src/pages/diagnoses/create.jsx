import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import axios from "@/config/api.js";
import { toast } from "sonner";

export default function DiagnosisForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const { 
        register, 
        handleSubmit, 
        setValue, 
        watch, 
        setError,
        clearErrors,
        formState: { errors },
        reset 
    } = useForm({
        defaultValues: {
            patient_id: "",
            condition: "",
            diagnosis_date: "",
        }
    });

    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(isEditMode);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const patientsRes = await axios.get('/patients');
                setPatients(patientsRes.data);
            } catch (error) {
                console.error("Error fetching patients:", error);
            }
        };

        fetchPatients();
    }, []);

    useEffect(() => {
        if (!isEditMode) return;

        const fetchDiagnosis = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("No authentication token found. Please log in.");
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`/diagnoses/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                const diagnosisDate = typeof response.data.diagnosis_date === 'number'
                    ? new Date(response.data.diagnosis_date * 1000).toISOString().split('T')[0]
                    : new Date(response.data.diagnosis_date).toISOString().split('T')[0];
                
                reset({
                    patient_id: response.data.patient_id.toString(),
                    condition: response.data.condition,
                    diagnosis_date: diagnosisDate,
                });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching diagnosis:", error);
                toast.error("Failed to load diagnosis data.");
                setLoading(false);
            }
        };

        fetchDiagnosis();
    }, [id, isEditMode]);

    const onSubmit = async (data) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("No authentication token found. Please log in.");
            return;
        }
        
        const diagnosisData = {
            patient_id: parseInt(data.patient_id),
            condition: data.condition,
            diagnosis_date: data.diagnosis_date,
        };
        
        console.log('Sending diagnosis data:', diagnosisData);
        
        try {
            const response = isEditMode 
                ? await axios.patch(`/diagnoses/${id}`, diagnosisData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                : await axios.post("/diagnoses", diagnosisData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

            console.log(`Diagnosis ${isEditMode ? 'updated' : 'created'}:`, response.data);
            
            toast.success(`Diagnosis ${isEditMode ? 'updated' : 'created'} successfully!`);
            navigate(`/diagnoses/${response.data.id}`);
            
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} diagnosis:`, error);
            console.error("Full error:", JSON.stringify(error.response?.data, null, 2));
            
            const errorData = error.response?.data;
            
            // Clear any existing errors first
            clearErrors();
            
            if (errorData?.issues) {
                // Parse validation errors and set them on specific fields
                errorData.issues.forEach(issue => {
                    const fieldPath = issue.path && issue.path.length > 0 ? issue.path[0] : null;
                    if (fieldPath) {
                        setError(fieldPath, {
                            type: 'server',
                            message: issue.message
                        });
                    } else {
                        toast.error(issue.message || 'Validation error occurred');
                    }
                });
            } else if (error.response?.status === 401) {
                toast.error("Authentication failed. Please log in again.");
            } else {
                const message = errorData?.message || errorData?.error || `Failed to ${isEditMode ? 'update' : 'create'} diagnosis.`;
                toast.error(message);
            }
        }
    }

    if (loading) {
        return <div>Loading diagnosis data...</div>;
    }

    return (
        <div>
            <h1 className="mb-4">{isEditMode ? 'Edit' : 'Create'} Diagnosis</h1>
            
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-2 max-w-md">
                    <Select 
                        onValueChange={(value) => {
                            setValue('patient_id', value);
                            clearErrors('patient_id');
                        }}
                        value={watch('patient_id')}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Patient" />
                        </SelectTrigger>
                        <SelectContent>
                            {patients.map(patient => (
                                <SelectItem key={patient.id} value={patient.id.toString()}>
                                    {patient.first_name} {patient.last_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <input 
                        type="hidden" 
                        {...register('patient_id', { required: 'Patient is required' })}
                    />
                    {errors.patient_id && <p className="text-red-500 text-sm mt-1">{errors.patient_id.message}</p>}

                    <Textarea
                        {...register('condition', { required: 'Condition is required' })}
                        placeholder="Enter condition details"
                        rows={4}
                    />
                    {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition.message}</p>}

                    <DatePicker
                        value={watch('diagnosis_date')}
                        onChange={(date) => {
                            setValue('diagnosis_date', date, { shouldValidate: true });
                            clearErrors('diagnosis_date');
                        }}
                        placeholder="Select diagnosis date"
                    />
                    <input 
                        type="hidden" 
                        {...register('diagnosis_date', { 
                            required: 'Diagnosis date is required',
                            validate: (value) => {
                                if (!value || value === '' || value === null || value === undefined) {
                                    return 'Diagnosis date is required';
                                }
                                const date = new Date(value);
                                if (isNaN(date.getTime())) {
                                    return 'Please select a valid date';
                                }
                                return true;
                            }
                        })}
                    />
                    {errors.diagnosis_date && <p className="text-red-500 text-sm mt-1">{errors.diagnosis_date.message}</p>}
                    
                    <Button type="submit">{isEditMode ? 'Update' : 'Create'} Diagnosis</Button>
                </div>
            </form>
        </div>
    );
}
