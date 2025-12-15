import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import axios from "@/config/api.js";
import { toast } from "sonner";

export default function Delete() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [diagnosis, setDiagnosis] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
                setDiagnosis(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching diagnosis:", error);
                setError("Failed to load diagnosis data.");
                setLoading(false);
            }
        };

        fetchDiagnosis();
    }, [id]);

    const handleDelete = async () => {
        setError("");
        const token = localStorage.getItem('token');
        
        if (!token) {
            setError("No authentication token found. Please log in.");
            return;
        }

        try {
            await axios.delete(`/diagnoses/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            toast.success("Diagnosis deleted successfully!");
            navigate("/diagnoses");
        } catch (error) {
            console.error("Error deleting diagnosis:", error);
            if (error.response?.status === 401) {
                setError("Authentication failed. Please log in again.");
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("Failed to delete diagnosis. Please try again.");
            }
        }
    };

    const handleCancel = () => {
        navigate(`/diagnoses/${id}`);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="mb-4">Delete Diagnosis</h1>
            
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}
            
            {diagnosis && (
                <div className="mb-6 p-4 border rounded">
                    <p className="mb-2">
                        Are you sure you want to delete this diagnosis?
                    </p>
                    <div className="mt-4 space-y-2">
                        <p><strong>Diagnosis ID:</strong> {diagnosis.id}</p>
                        <p><strong>Patient ID:</strong> {diagnosis.patient_id}</p>
                        <p><strong>Date:</strong> {typeof diagnosis.diagnosis_date === 'number' 
                            ? new Date(diagnosis.diagnosis_date * 1000).toLocaleDateString() 
                            : new Date(diagnosis.diagnosis_date).toLocaleDateString()}</p>
                        <p className="mt-2"><strong>Condition:</strong></p>
                        <p className="p-3 bg-gray-50 rounded">{diagnosis.condition}</p>
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
