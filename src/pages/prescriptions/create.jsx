import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import axios from "@/config/api.js";
import { toast } from "sonner";

export default function PrescriptionForm() {
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
            doctor_id: "",
            diagnosis_id: "",
            medication: "",
            dosage: "",
            start_date: "",
            end_date: "",
        }
    });

    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [diagnoses, setDiagnoses] = useState([]);
    const [loading, setLoading] = useState(isEditMode);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            try {
                const [patientsRes, doctorsRes, diagnosesRes] = await Promise.all([
                    axios.get('/patients', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    axios.get('/doctors', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    axios.get('/diagnoses', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);
                setPatients(patientsRes.data);
                setDoctors(doctorsRes.data);
                setDiagnoses(diagnosesRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!isEditMode) return;

        const fetchPrescription = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("No authentication token found. Please log in.");
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`/prescriptions/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                const startDate = typeof response.data.start_date === 'number' 
                    ? new Date(response.data.start_date * 1000).toISOString().split('T')[0]
                    : new Date(response.data.start_date).toISOString().split('T')[0];

                const endDate = response.data.end_date
                    ? (typeof response.data.end_date === 'number' 
                        ? new Date(response.data.end_date * 1000).toISOString().split('T')[0]
                        : new Date(response.data.end_date).toISOString().split('T')[0])
                    : "";

                reset({
                    patient_id: response.data.patient_id.toString(),
                    doctor_id: response.data.doctor_id.toString(),
                    diagnosis_id: response.data.diagnosis_id ? response.data.diagnosis_id.toString() : "",
                    medication: response.data.medication || "",
                    dosage: response.data.dosage || "",
                    start_date: startDate,
                    end_date: endDate,
                });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching prescription:", error);
                toast.error("Failed to load prescription data.");
                setLoading(false);
            }
        };

        fetchPrescription();
    }, [id, isEditMode]);



    const onSubmit = async (data) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("No authentication token found. Please log in.");
            return;
        }

        const prescriptionData = {
            patient_id: parseInt(data.patient_id),
            doctor_id: parseInt(data.doctor_id),
            medication: data.medication,
            dosage: data.dosage,
            start_date: data.start_date,
        };

        if (data.diagnosis_id) {
            prescriptionData.diagnosis_id = parseInt(data.diagnosis_id);
        }

        if (data.end_date) {
            prescriptionData.end_date = data.end_date;
        }
        
        console.log('Sending prescription data:', prescriptionData);
        
        try {
            const response = isEditMode 
                ? await axios.patch(`/prescriptions/${id}`, prescriptionData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                : await axios.post("/prescriptions", prescriptionData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

            console.log(`Prescription ${isEditMode ? 'updated' : 'created'}:`, response.data);
            
            toast.success(`Prescription ${isEditMode ? 'updated' : 'created'} successfully!`);
            navigate(`/prescriptions/${response.data.id}`);
            
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} prescription:`, error);
            
            const errorData = error.response?.data;
            
            // Clear any existing errors first
            clearErrors();
            
            if (errorData?.issues) {
                // Parse validation errors and set them on specific fields
                errorData.issues.forEach(issue => {
                    const fieldPath = issue.path && issue.path.length > 0 ? issue.path[0] : null;
                    if (fieldPath) {
                        // Map common API field names to form field names
                        let mappedField = fieldPath;
                        if (fieldPath === 'start_date' || fieldPath === 'end_date') {
                            mappedField = fieldPath; // Keep the same for date fields
                        }
                        
                        setError(mappedField, {
                            type: 'server',
                            message: issue.message
                        });
                    } else {
                        // For errors without a specific path, show a general toast
                        toast.error(issue.message || 'Validation error occurred');
                    }
                });
            } else if (error.response?.status === 401) {
                toast.error("Authentication failed. Please log in again.");
            } else {
                // For other errors, show a general toast
                const message = errorData?.message || errorData?.error || `Failed to ${isEditMode ? 'update' : 'create'} prescription.`;
                toast.error(message);
            }
        }
    }

    if (loading) {
        return <div>Loading prescription data...</div>;
    }

    return (
        <div>
            <h1 className="mb-4">{isEditMode ? 'Edit' : 'Create'} Prescription</h1>
            
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-2 max-w-md">
                    <Select 
                            onValueChange={(value) => {
                                setValue('patient_id', value);
                                clearErrors('patient_id');
                            }}
                            value={watch('patient_id')}
                            required
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

                    <Select 
                        onValueChange={(value) => {
                            setValue('doctor_id', value);
                            clearErrors('doctor_id');
                        }}
                        value={watch('doctor_id')}
                    >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Doctor" />
                            </SelectTrigger>
                            <SelectContent>
                                {doctors.map(doctor => (
                                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                        Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialisation}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <input 
                            type="hidden" 
                            {...register('doctor_id', { required: 'Doctor is required' })}
                        />
                    {errors.doctor_id && <p className="text-red-500 text-sm mt-1">{errors.doctor_id.message}</p>}

                    <Select 
                            onValueChange={(value) => setValue('diagnosis_id', value)}
                            value={watch('diagnosis_id')}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Diagnosis (Optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                {diagnoses.map(diagnosis => (
                                    <SelectItem key={diagnosis.id} value={diagnosis.id.toString()}>
                                        {diagnosis.condition} (ID: {diagnosis.id})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>                        <input 
                            type="hidden" 
                            {...register('patient_id', { required: 'Patient is required' })}
                        />                    {errors.diagnosis_id && <p className="text-red-500 text-sm mt-1">{errors.diagnosis_id.message}</p>}

                    <Input 
                        {...register('medication', { required: 'Medication name is required' })}
                        placeholder="Medication Name"
                    />
                    {errors.medication && <p className="text-red-500 text-sm mt-1">{errors.medication.message}</p>}

                    <Input 
                        {...register('dosage', { required: 'Dosage is required' })}
                        placeholder="Dosage (e.g., 500mg twice daily)"
                    />
                    {errors.dosage && <p className="text-red-500 text-sm mt-1">{errors.dosage.message}</p>}

                    
                        <DatePicker
                            value={watch('start_date')}
                            onChange={(date) => {
                                setValue('start_date', date, { shouldValidate: true });
                                clearErrors('start_date');
                            }}
                            placeholder="Select start date"
                        />
                        <input 
                            type="hidden" 
                            {...register('start_date', { 
                                required: 'Start date is required',
                                validate: (value) => {
                                    if (!value || value === '' || value === null || value === undefined) {
                                        return 'Start date is required';
                                    }
                                    // Check if date is valid
                                    const date = new Date(value);
                                    if (isNaN(date.getTime())) {
                                        return 'Please select a valid date';
                                    }
                                    return true;
                                }
                            })}
                        />
                    {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date.message}</p>}

                    <DatePicker
                        value={watch('end_date')}
                        onChange={(date) => setValue('end_date', date)}
                        placeholder="Select end date (Optional)"
                    />
                    {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date.message}</p>}
                    
                    <Button type="submit">{isEditMode ? 'Update' : 'Create'} Prescription</Button>
                </div>
            </form>
        </div>
    );
}
