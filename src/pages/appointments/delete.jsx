import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import axios from "@/config/api.js";
import { toast } from "sonner";

export default function Delete() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [appointment, setAppointment] = useState(null);
    const [doctor, setDoctor] = useState(null);
    const [patient, setPatient] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
                setAppointment(response.data);

                // Fetch doctor and patient details
                const [doctorRes, patientRes] = await Promise.all([
                    axios.get(`/doctors/${response.data.doctor_id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    axios.get(`/patients/${response.data.patient_id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                setDoctor(doctorRes.data);
                setPatient(patientRes.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching appointment:", error);
                setError("Failed to load appointment data.");
                setLoading(false);
            }
        };

        fetchAppointment();
    }, [id]);

    const handleDelete = async () => {
        setError("");
        const token = localStorage.getItem('token');
        
        if (!token) {
            setError("No authentication token found. Please log in.");
            return;
        }

        try {
            await axios.delete(`/appointments/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            toast.success("Appointment deleted successfully!");
            navigate("/appointments");
        } catch (error) {
            console.error("Error deleting appointment:", error);
            if (error.response?.status === 401) {
                setError("Authentication failed. Please log in again.");
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("Failed to delete appointment. Please try again.");
            }
        }
    };

    const handleCancel = () => {
        navigate(`/appointments/${id}`);
    };

    const formatDate = (dateValue) => {
        if (typeof dateValue === 'number') {
            return new Date(dateValue * 1000).toLocaleString();
        }
        return new Date(dateValue).toLocaleString();
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-md mx-auto">
            <h1 className="mb-4">Delete Appointment</h1>
            
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}
            
            {appointment && (
                <div className="mb-6 p-4 border rounded">
                    <p className="mb-2">
                        Are you sure you want to delete this appointment?
                    </p>
                    <div className="mt-4 space-y-2">
                        <p><strong>Date:</strong> {formatDate(appointment.appointment_date)}</p>
                        <p><strong>Doctor:</strong> {doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Loading...'}</p>
                        <p><strong>Patient:</strong> {patient ? `${patient.first_name} ${patient.last_name}` : 'Loading...'}</p>
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
