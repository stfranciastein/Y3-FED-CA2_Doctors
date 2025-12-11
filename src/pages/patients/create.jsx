import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import axios from "@/config/api.js";
import { toast } from "sonner";

export default function PatientForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        date_of_birth: "",
        address: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(isEditMode);

    useEffect(() => {
        if (!isEditMode) return;

        const fetchPatient = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("No authentication token found. Please log in.");
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`/patients/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                const dobValue = response.data.date_of_birth;
                let formattedDob = "";
                
                if (dobValue) {
                    // Check if it's a Unix timestamp (number) or string
                    if (typeof dobValue === 'number') {
                        // Convert Unix timestamp to YYYY-MM-DD
                        formattedDob = new Date(dobValue * 1000).toISOString().split('T')[0];
                    } else if (typeof dobValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dobValue)) {
                        // Already in YYYY-MM-DD format
                        formattedDob = dobValue;
                    }
                }
                
                setForm({
                    first_name: response.data.first_name || "",
                    last_name: response.data.last_name || "",
                    email: response.data.email || "",
                    phone: response.data.phone || "",
                    date_of_birth: formattedDob,
                    address: response.data.address || "",
                });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching patient:", error);
                setError("Failed to load patient data.");
                setLoading(false);
            }
        };

        fetchPatient();
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
        
        if (!form.first_name || !form.last_name || !form.email || !form.phone) {
            setError("Please fill in all required fields");
            return;
        }

        // Validate phone number length
        if (form.phone.length > 10) {
            setError("Phone number must be at most 10 characters");
            return;
        }

        const patientData = {
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            phone: form.phone,
        };

        // Only add date_of_birth if it has a value (send as string YYYY-MM-DD)
        if (form.date_of_birth) {
            patientData.date_of_birth = form.date_of_birth;
        }

        // Only add address if it has a value  
        if (form.address) {
            patientData.address = form.address;
        }
        
        console.log('Sending patient data:', patientData);
        
        try {
            const response = isEditMode 
                ? await axios.patch(`/patients/${id}`, patientData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                : await axios.post("/patients", patientData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

            console.log(`Patient ${isEditMode ? 'updated' : 'created'}:`, response.data);
            
            toast.success(`Patient ${isEditMode ? 'updated' : 'created'} successfully!`);
            navigate(`/patients/${response.data.id}`);
            
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} patient:`, error);
            console.error("Full error:", JSON.stringify(error.response?.data, null, 2));
            
            // Extract detailed error messages
            let errorMessage = '';
            
            const errorData = error.response?.data;
            
            // Try to parse Zod errors
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
                errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} patient.`;
            }
            
            setError(errorMessage);
        }
    }

    if (loading) {
        return <div>Loading patient data...</div>;
    }

    return (
        <div>
            <h1 className="mb-4">{isEditMode ? 'Edit' : 'Create'} Patient</h1>
            
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded max-w-md">
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2 max-w-md">
                    <Input 
                        type="text" 
                        placeholder="First Name" 
                        name="first_name" 
                        value={form.first_name} 
                        onChange={handleChange}
                        required
                    />
                    
                    <Input 
                        type="text" 
                        placeholder="Last Name" 
                        name="last_name" 
                        value={form.last_name} 
                        onChange={handleChange}
                        required
                    />
                    
                    <Input 
                        type="email" 
                        placeholder="Email" 
                        name="email" 
                        value={form.email} 
                        onChange={handleChange}
                        required
                    />
                    
                    <Input 
                        type="tel" 
                        placeholder="Phone (max 10 digits)" 
                        name="phone" 
                        value={form.phone} 
                        onChange={handleChange}
                        maxLength={10}
                        required
                    />
                    
                    <DatePicker
                        value={form.date_of_birth}
                        onChange={(date) => setForm({ ...form, date_of_birth: date })}
                        placeholder="Date of Birth"
                    />
                    
                    <Input 
                        type="text" 
                        placeholder="Address" 
                        name="address" 
                        value={form.address} 
                        onChange={handleChange}
                    />
                    
                    <Button type="submit">{isEditMode ? 'Update' : 'Create'} Patient</Button>
                </div>
            </form>
        </div>
    );
}
