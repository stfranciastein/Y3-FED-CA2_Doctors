import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "@/config/api.js";
import { toast } from "sonner";

export default function DoctorForm() {
    const navigate = useNavigate();
    const { id } = useParams(); // If id exists, we're editing; otherwise, creating
    const isEditMode = !!id;

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        specialisation: "",
    });

    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(isEditMode);

    // Fetch existing doctor data if in edit mode
    useEffect(() => {
        if (!isEditMode) return;

        const fetchDoctor = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("No authentication token found. Please log in.");
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`/doctors/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                setForm({
                    first_name: response.data.first_name || "",
                    last_name: response.data.last_name || "",
                    email: response.data.email || "",
                    phone: response.data.phone || "",
                    specialisation: response.data.specialisation || "",
                });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching doctor:", error);
                setError("Failed to load doctor data.");
                setLoading(false);
            }
        };

        fetchDoctor();
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setForm({
            ...form,
            [name]: value,
        });

        // Clear field error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors({
                ...fieldErrors,
                [name]: ""
            });
        }

        // Validate phone number length
        if (name === "phone" && value.length > 0) {
            if (value.length > 10) {
                setFieldErrors({
                    ...fieldErrors,
                    phone: "Phone number must be 10 digits or less"
                });
            } else if (!/^\d*$/.test(value)) {
                setFieldErrors({
                    ...fieldErrors,
                    phone: "Phone number must contain only digits"
                });
            }
        }
    }

    const handleSelectChange = (value) => {
        setForm({
            ...form,
            specialisation: value,
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setFieldErrors({});
        
        const token = localStorage.getItem('token');
        if (!token) {
            setError("No authentication token found. Please log in.");
            return;
        }
        
        // Validate required fields
        if (!form.first_name || !form.last_name || !form.email || !form.phone || !form.specialisation) {
            setError("Please fill in all required fields");
            return;
        }

        // Validate phone number
        if (form.phone.length > 10) {
            setFieldErrors({ phone: "Phone number must be 10 digits or less" });
            setError("Please fix the validation errors below");
            return;
        }

        if (!/^\d+$/.test(form.phone)) {
            setFieldErrors({ phone: "Phone number must contain only digits" });
            setError("Please fix the validation errors below");
            return;
        }

        const doctorData = {
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            phone: form.phone,
            specialisation: form.specialisation,
        };
        
        try {
            const response = isEditMode 
                ? await axios.patch(`/doctors/${id}`, doctorData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                : await axios.post("/doctors", doctorData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

            console.log(`Doctor ${isEditMode ? 'updated' : 'created'}:`, response.data);
            
            toast.success(`Doctor ${isEditMode ? 'updated' : 'created'} successfully!`);
            navigate(`/doctors/${isEditMode ? id : response.data.id}`);
            
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} doctor:`, error);
            console.error("Error response:", error.response?.data);
            
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else if (error.response?.status === 401) {
                setError("Authentication failed. Please log in again.");
            } else if (error.response?.status === 422) {
                setError("Validation error. Please check your input.");
            } else {
                setError(`Failed to ${isEditMode ? 'update' : 'create'} doctor. Please try again.`);
            }
        }
    }

    if (loading) {
        return <div>Loading doctor data...</div>;
    }

    return (
        <div>
            <h1 className="mb-4">{isEditMode ? 'Edit' : 'Create'} Doctor</h1>
            
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
                    <div>
                        <Input 
                            type="tel" 
                            placeholder="Phone (max 10 digits)" 
                            name="phone" 
                            value={form.phone} 
                            onChange={handleChange} 
                            maxLength={10}
                            className={fieldErrors.phone ? "border-red-500" : ""}
                            required 
                        />
                        {fieldErrors.phone && (
                            <p className="text-red-500 text-sm mt-1">{fieldErrors.phone}</p>
                        )}
                    </div>
                    <Select onValueChange={handleSelectChange} value={form.specialisation}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Specialisation" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="General Practitioner">General Practitioner</SelectItem>
                            <SelectItem value="Pediatrician">Pediatrician</SelectItem>
                            <SelectItem value="Psychiatrist">Psychiatrist</SelectItem>
                            <SelectItem value="Dermatologist">Dermatologist</SelectItem>
                            <SelectItem value="Podiatrist">Podiatrist</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                        <Button type="submit">{isEditMode ? 'Update' : 'Create'} Doctor</Button>
                        <Button type="button" variant="outline" onClick={() => navigate('/doctors')}>Cancel</Button>
                    </div>
                </div>
            </form>
        </div>
    );
}