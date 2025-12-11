import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import axios from "@/config/api.js";
import { toast } from "sonner";

export default function Delete() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [patient, setPatient] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatient = async () => {
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError("No authentication token found. Please log in.");
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(
                    `/patients/${id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                setPatient(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching patient:", error);
                setError("Failed to load patient data.");
                setLoading(false);
            }
        };

        fetchPatient();
    }, [id]);

    const handleDelete = async () => {
        setError("");
        const token = localStorage.getItem('token');
        
        if (!token) {
            setError("No authentication token found. Please log in.");
            return;
        }

        try {
            await axios.delete(`/patients/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            toast.success("Patient deleted successfully!");
            navigate("/patients");
        } catch (error) {
            console.error("Error deleting patient:", error);
            if (error.response?.status === 401) {
                setError("Authentication failed. Please log in again.");
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("Failed to delete patient. Please try again.");
            }
        }
    };

    const handleCancel = () => {
        navigate(`/patients/${id}`);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-md mx-auto">
            <h1 className="mb-4">Delete Patient</h1>
            
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}
            
            {patient && (
                <div className="mb-6 p-4 border rounded">
                    <p className="mb-2">
                        Are you sure you want to delete this patient?
                    </p>
                    <div className="mt-4 space-y-2">
                        <p><strong>Name:</strong> {patient.first_name} {patient.last_name}</p>
                        <p><strong>Email:</strong> {patient.email}</p>
                        <p><strong>Phone:</strong> {patient.phone}</p>
                    </div>
                </div>
            )}
            
            <div className="flex gap-2">
                <Button 
                    variant="destructive" 
                    onClick={handleDelete}
                >
                    Confirm Delete
                </Button>
                <Button 
                    variant="outline" 
                    onClick={handleCancel}
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
}
