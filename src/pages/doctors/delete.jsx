import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import axios from "@/config/api.js";
import { toast } from "sonner";

export default function Delete() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [doctor, setDoctor] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoctor = async () => {
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError("No authentication token found. Please log in.");
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(
                    `/doctors/${id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                setDoctor(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching doctor:", error);
                setError("Failed to load doctor data.");
                setLoading(false);
            }
        };

        fetchDoctor();
    }, [id]);

    const handleDelete = async () => {
        setError("");
        const token = localStorage.getItem('token');
        
        if (!token) {
            setError("No authentication token found. Please log in.");
            return;
        }

        try {
            await axios.delete(
                `https://ca2-med-api.vercel.app/doctors/${id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            // Show success toast
            toast.success("Doctor deleted successfully!");
            
            // Redirect to doctors list after successful deletion
            navigate('/doctors');
            
        } catch (error) {
            console.error("Error deleting doctor:", error);
            
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else if (error.response?.status === 401) {
                setError("Authentication failed. Please log in again.");
            } else if (error.response?.status === 404) {
                setError("Doctor not found.");
            } else {
                setError("Failed to delete doctor. Please try again.");
            }
        }
    };

    if (loading) {
        return <div>Loading doctor data...</div>;
    }

    return (
        <div className="max-w-md">
            <h1 className="mb-4 text-2xl font-bold">Delete Doctor</h1>
            
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}
            
            {doctor && (
                <div className="mb-6 p-4 bg-gray-100 rounded">
                    <h2 className="text-xl font-semibold mb-2">{doctor.title}</h2>
                    <p className="text-gray-600 mb-2">{doctor.city}</p>
                    <p className="text-sm text-gray-500">{doctor.description}</p>
                </div>
            )}
            
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded">
                <p className="text-yellow-800 font-semibold">⚠️ Warning</p>
                <p className="text-yellow-700 text-sm mt-1">
                    This action cannot be undone. This will permanently delete the doctor.
                </p>
            </div>
            
            <div className="flex gap-2">
                <Button 
                    variant="destructive" 
                    onClick={handleDelete}
                >
                    Delete Doctor
                </Button>
                <Button 
                    variant="outline" 
                    onClick={() => navigate('/doctors')}
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
}