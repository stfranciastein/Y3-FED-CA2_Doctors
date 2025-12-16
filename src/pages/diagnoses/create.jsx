import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import axios from "@/config/api.js";
import { toast } from "sonner";

export default function DiagnosisForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [form, setForm] = useState({
        patient_id: "",
        condition: "",
        diagnosis_date: "",
    });

    const [patients, setPatients] = useState([]);
    const [error, setError] = useState("");
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
                setError("No authentication token found. Please log in.");
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
                
                setForm({
                    patient_id: response.data.patient_id.toString(),
                    condition: response.data.condition,
                    diagnosis_date: diagnosisDate,
                });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching diagnosis:", error);
                setError("Failed to load diagnosis data.");
                setLoading(false);
            }
        };

        fetchDiagnosis();
    }, [id, isEditMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        const token = localStorage.getItem('token');
        if (!token) {
            setError("No authentication token found. Please log in.");
            return;
        }
        
        if (!form.patient_id || !form.condition || !form.diagnosis_date) {
            setError("Please fill in all required fields");
            return;
        }
        
        const diagnosisData = {
            patient_id: parseInt(form.patient_id),
            condition: form.condition,
            diagnosis_date: form.diagnosis_date,
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
                errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} diagnosis.`;
            }
            
            setError(errorMessage);
        }
    }

    if (loading) {
        return <div>Loading diagnosis data...</div>;
    }

    return (
        <div>
            <h1 className="mb-4">{isEditMode ? 'Edit' : 'Create'} Diagnosis</h1>
            
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

                    <Textarea
                        value={form.condition}
                        onChange={(e) => setForm({ ...form, condition: e.target.value })}
                        placeholder="Enter condition details"
                        rows={4}
                        required
                    />

                    <DatePicker
                        value={form.diagnosis_date}
                        onChange={(date) => setForm({ ...form, diagnosis_date: date })}
                        placeholder="Select diagnosis date"
                    />
                    
                    <Button type="submit">{isEditMode ? 'Update' : 'Create'} Diagnosis</Button>
                </div>
            </form>
        </div>
    );
}
