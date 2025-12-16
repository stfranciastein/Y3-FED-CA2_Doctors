import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import axios from "@/config/api.js";
import { toast } from "sonner";

export default function AppointmentForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [form, setForm] = useState({
        doctor_id: "",
        patient_id: "",
        appointment_date: "",
        appointment_time: "",
    });

    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [error, setError] = useState("");
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

                setForm({
                    doctor_id: response.data.doctor_id.toString(),
                    patient_id: response.data.patient_id.toString(),
                    appointment_date: appointmentDate.toISOString().split('T')[0],
                    appointment_time: appointmentDate.toTimeString().slice(0, 5),
                });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching appointment:", error);
                setError("Failed to load appointment data.");
                setLoading(false);
            }
        };

        fetchAppointment();
    }, [id, isEditMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        const token = localStorage.getItem('token');
        if (!token) {
            setError("No authentication token found. Please log in.");
            return;
        }
        
        if (!form.doctor_id || !form.patient_id || !form.appointment_date || !form.appointment_time) {
            setError("Please fill in all required fields");
            return;
        }

        // Combine date and time into ISO string
        const dateTimeString = `${form.appointment_date}T${form.appointment_time}:00`;
        
        const appointmentData = {
            doctor_id: parseInt(form.doctor_id),
            patient_id: parseInt(form.patient_id),
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
            
            let errorMessage = '';
            const errorData = error.response?.data;
            
            if (errorData?.issues) {
                try {
                    const issues = JSON.parse(JSON.stringify(errorData.issues));
                    const messages = issues.map(issue => {
                        const path = issue.path ? issue.path.join('.') : 'field';
                        return `${path}: ${issue.message}`;
                    }).join('; ');
                    errorMessage = messages;
                } catch (e) {
                    errorMessage = "Validation error - check console for details";
                }
            } else if (errorData?.error) {
                errorMessage = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
            } else if (errorData?.message) {
                errorMessage = errorData.message;
            } else if (error.response?.status === 401) {
                errorMessage = "Authentication failed. Please log in again.";
            } else {
                errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} appointment.`;
            }
            
            setError(errorMessage);
        }
    }

    if (loading) {
        return <div>Loading appointment data...</div>;
    }

    return (
        <div>
            <h1 className="mb-4">{isEditMode ? 'Edit' : 'Create'} Appointment</h1>
            
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded max-w-md">
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2 max-w-md">
                    <Select 
                        onValueChange={(value) => setForm({ ...form, doctor_id: value })} 
                        value={form.doctor_id}
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

                    <Select 
                        onValueChange={(value) => setForm({ ...form, patient_id: value })} 
                        value={form.patient_id}
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

                    <DatePicker
                        value={form.appointment_date}
                        onChange={(date) => setForm({ ...form, appointment_date: date })}
                        placeholder="Select appointment date"
                    />

                    <Input
                        type="time"
                        value={form.appointment_time}
                        onChange={(e) => setForm({ ...form, appointment_time: e.target.value })}
                        placeholder="Appointment Time"
                        required
                    />
                    
                    <Button type="submit">{isEditMode ? 'Update' : 'Create'} Appointment</Button>
                </div>
            </form>
        </div>
    );
}
