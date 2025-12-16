import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import axios from "@/config/api.js";
import { toast } from "sonner";

export default function PrescriptionForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [form, setForm] = useState({
        patient_id: "",
        doctor_id: "",
        diagnosis_id: "",
        medication: "",
        dosage: "",
        start_date: "",
        end_date: "",
    });

    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [diagnoses, setDiagnoses] = useState([]);
    const [error, setError] = useState("");
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
                setError("No authentication token found. Please log in.");
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

                setForm({
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
                setError("Failed to load prescription data.");
                setLoading(false);
            }
        };

        fetchPrescription();
    }, [id, isEditMode]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        const token = localStorage.getItem('token');
        if (!token) {
            setError("No authentication token found. Please log in.");
            return;
        }
        
        if (!form.patient_id || !form.doctor_id || !form.medication || !form.dosage || !form.start_date) {
            setError("Please fill in all required fields");
            return;
        }

        const prescriptionData = {
            patient_id: parseInt(form.patient_id),
            doctor_id: parseInt(form.doctor_id),
            medication: form.medication,
            dosage: form.dosage,
            start_date: form.start_date,
        };

        if (form.diagnosis_id) {
            prescriptionData.diagnosis_id = parseInt(form.diagnosis_id);
        }

        if (form.end_date) {
            prescriptionData.end_date = form.end_date;
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
                errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} prescription.`;
            }
            
            setError(errorMessage);
        }
    }

    if (loading) {
        return <div>Loading prescription data...</div>;
    }

    return (
        <div>
            <h1 className="mb-4">{isEditMode ? 'Edit' : 'Create'} Prescription</h1>
            
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded max-w-md">
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2 max-w-md">
                    <Select 
                        onValueChange={(value) => setForm({ ...form, patient_id: value })} 
                        value={form.patient_id}
                    >
                        <SelectTrigger>
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

                    <Select 
                        onValueChange={(value) => setForm({ ...form, doctor_id: value })} 
                        value={form.doctor_id}
                    >
                        <SelectTrigger>
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
                        onValueChange={(value) => setForm({ ...form, diagnosis_id: value })} 
                        value={form.diagnosis_id}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Diagnosis (Optional)" />
                        </SelectTrigger>
                        <SelectContent>
                            {diagnoses.map(diagnosis => (
                                <SelectItem key={diagnosis.id} value={diagnosis.id.toString()}>
                                    {diagnosis.condition} (ID: {diagnosis.id})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Input 
                        name="medication"
                        placeholder="Medication Name"
                        value={form.medication}
                        onChange={handleChange}
                        required
                    />

                    <Input 
                        name="dosage"
                        placeholder="Dosage (e.g., 500mg twice daily)"
                        value={form.dosage}
                        onChange={handleChange}
                        required
                    />

                    <DatePicker
                        value={form.start_date}
                        onChange={(date) => setForm({ ...form, start_date: date })}
                        placeholder="Select start date"
                    />

                    <DatePicker
                        value={form.end_date}
                        onChange={(date) => setForm({ ...form, end_date: date })}
                        placeholder="Select end date (Optional)"
                    />
                    
                    <Button type="submit">{isEditMode ? 'Update' : 'Create'} Prescription</Button>
                </div>
            </form>
        </div>
    );
}
