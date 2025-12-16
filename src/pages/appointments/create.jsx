import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "@/config/api.js";
import { toast } from "sonner";

export default function AppointmentForm() {
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
            doctor_id: "",
            patient_id: "",
            appointment_date: "",
            appointment_time: "",
        }
    });

    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(isEditMode);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [doctorsRes, patientsRes] = await Promise.all([
                    axios.get('/doctors'),
                    axios.get('/patients')
                ]);
                setDoctors(doctorsRes.data);
                setPatients(patientsRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!isEditMode) return;

        const fetchAppointment = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("No authentication token found. Please log in.");
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`/appointments/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                const appointmentDate = typeof response.data.appointment_date === 'number' 
                    ? new Date(response.data.appointment_date * 1000)
                    : new Date(response.data.appointment_date);

                reset({
                    doctor_id: response.data.doctor_id.toString(),
                    patient_id: response.data.patient_id.toString(),
                    appointment_date: appointmentDate.toISOString().split('T')[0],
                    appointment_time: appointmentDate.toTimeString().slice(0, 5),
                });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching appointment:", error);
                toast.error("Failed to load appointment data.");
                setLoading(false);
            }
        };

        fetchAppointment();
    }, [id, isEditMode]);

    const onSubmit = async (data) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("No authentication token found. Please log in.");
            return;
        }

        // Combine date and time into ISO string
        const dateTimeString = `${data.appointment_date}T${data.appointment_time}:00`;
        
        const appointmentData = {
            doctor_id: parseInt(data.doctor_id),
            patient_id: parseInt(data.patient_id),
            appointment_date: dateTimeString,
        };
        
        console.log('Sending appointment data:', appointmentData);
        
        try {
            const response = isEditMode 
                ? await axios.patch(`/appointments/${id}`, appointmentData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                : await axios.post("/appointments", appointmentData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

            console.log(`Appointment ${isEditMode ? 'updated' : 'created'}:`, response.data);
            
            toast.success(`Appointment ${isEditMode ? 'updated' : 'created'} successfully!`);
            navigate(`/appointments/${response.data.id}`);
            
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} appointment:`, error);
            console.error("Full error:", JSON.stringify(error.response?.data, null, 2));
            
            const errorData = error.response?.data;
            
            // Clear any existing errors first
            clearErrors();
            
            if (errorData?.issues) {
                // Parse validation errors and set them on specific fields
                errorData.issues.forEach(issue => {
                    const fieldPath = issue.path && issue.path.length > 0 ? issue.path[0] : null;
                    if (fieldPath) {
                        // Map appointment_date to both date and time fields if needed
                        if (fieldPath === 'appointment_date') {
                            setError('appointment_date', {
                                type: 'server',
                                message: issue.message
                            });
                        } else {
                            setError(fieldPath, {
                                type: 'server',
                                message: issue.message
                            });
                        }
                    } else {
                        toast.error(issue.message || 'Validation error occurred');
                    }
                });
            } else if (error.response?.status === 401) {
                toast.error("Authentication failed. Please log in again.");
            } else {
                const message = errorData?.message || errorData?.error || `Failed to ${isEditMode ? 'update' : 'create'} appointment.`;
                toast.error(message);
            }
        }
    }

    if (loading) {
        return <div>Loading appointment data...</div>;
    }

    return (
        <div>
            <h1 className="mb-4">{isEditMode ? 'Edit' : 'Create'} Appointment</h1>
            
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-2 max-w-md">
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

                    <DatePicker
                        value={watch('appointment_date')}
                        onChange={(date) => {
                            setValue('appointment_date', date, { shouldValidate: true });
                            clearErrors('appointment_date');
                        }}
                        placeholder="Select appointment date"
                    />
                    <input 
                        type="hidden" 
                        {...register('appointment_date', { 
                            required: 'Appointment date is required',
                            validate: (value) => {
                                if (!value || value === '' || value === null || value === undefined) {
                                    return 'Appointment date is required';
                                }
                                const date = new Date(value);
                                if (isNaN(date.getTime())) {
                                    return 'Please select a valid date';
                                }
                                return true;
                            }
                        })}
                    />
                    {errors.appointment_date && <p className="text-red-500 text-sm mt-1">{errors.appointment_date.message}</p>}

                    <Input
                        type="time"
                        {...register('appointment_time', { required: 'Appointment time is required' })}
                        placeholder="Appointment Time"
                    />
                    {errors.appointment_time && <p className="text-red-500 text-sm mt-1">{errors.appointment_time.message}</p>}
                    
                    <Button type="submit">{isEditMode ? 'Update' : 'Create'} Appointment</Button>
                </div>
            </form>
        </div>
    );
}
