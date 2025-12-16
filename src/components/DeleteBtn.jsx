import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import axios from "@/config/api.js";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DeleteBtn({ resource, id, itemName, onDeleteSuccess }) {
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
            toast.error("No authentication token found. Please log in.");
            setIsDeleting(false);
            return;
        }

        try {
            // Special handling for doctors and patients - cascade delete related records
            if (resource === 'doctors') {
                await handleDoctorDelete(token);
            } else if (resource === 'patients') {
                await handlePatientDelete(token);
            } else {
                // Standard delete for other resources
                await axios.delete(`/${resource}/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
            
            toast.success(`${resource.slice(0, -1).charAt(0).toUpperCase() + resource.slice(1, -1)} deleted successfully!`);
            
            // If onDeleteSuccess callback is provided, call it; otherwise navigate
            if (onDeleteSuccess) {
                onDeleteSuccess();
            } else {
                navigate(`/${resource}`);
            }
        } catch (error) {
            console.error(`Error deleting ${resource}:`, error);
            if (error.response?.status === 401) {
                toast.error("Authentication failed. Please log in again.");
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error(`Failed to delete ${resource.slice(0, -1)}. Please try again.`);
            }
            setIsDeleting(false);
        }
    };

    // This was added in to fullfill the requirement for cascade deleting a doctor
    // In a nutshell what this does is if you need to delete a doctor with prescriptions and appointments
    // it first fetches all related appointments and prescriptions, deletes them, and then deletes the doctor.
    // Cascade delete for doctors: delete appointments and prescriptions first
    const handleDoctorDelete = async (token) => {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        try {
            // Fetch all appointments for this doctor
            const appointmentsResponse = await axios.get('/appointments', { headers });
            const doctorAppointments = appointmentsResponse.data.filter(
                apt => apt.doctor_id == id || apt.doctor_id === parseInt(id)
            );

            // Fetch all prescriptions for this doctor
            const prescriptionsResponse = await axios.get('/prescriptions', { headers });
            const doctorPrescriptions = prescriptionsResponse.data.filter(
                presc => presc.doctor_id == id || presc.doctor_id === parseInt(id)
            );

            // Delete all appointments
            if (doctorAppointments.length > 0) {
                await Promise.all(
                    doctorAppointments.map(apt => 
                        axios.delete(`/appointments/${apt.id}`, { headers })
                    )
                );
                console.log(`Deleted ${doctorAppointments.length} appointments`);
            }

            // Delete all prescriptions
            if (doctorPrescriptions.length > 0) {
                await Promise.all(
                    doctorPrescriptions.map(presc => 
                        axios.delete(`/prescriptions/${presc.id}`, { headers })
                    )
                );
                console.log(`Deleted ${doctorPrescriptions.length} prescriptions`);
            }

            // Finally, delete the doctor
            await axios.delete(`/doctors/${id}`, { headers });
            
            // Show detailed success message
            const deletedItems = [];
            if (doctorAppointments.length > 0) deletedItems.push(`${doctorAppointments.length} appointment(s)`);
            if (doctorPrescriptions.length > 0) deletedItems.push(`${doctorPrescriptions.length} prescription(s)`);
            
            if (deletedItems.length > 0) {
                toast.success(`Doctor and related records deleted: ${deletedItems.join(', ')}`);
            }
        } catch (error) {
            console.error('Error in cascade delete:', error);
            throw error; // Re-throw to be caught by main handler
        }
    };

    // Cascade delete for patients: delete appointments, prescriptions, and diagnoses first
    const handlePatientDelete = async (token) => {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        try {
            // Fetch all appointments for this patient
            const appointmentsResponse = await axios.get('/appointments', { headers });
            const patientAppointments = appointmentsResponse.data.filter(
                apt => apt.patient_id == id || apt.patient_id === parseInt(id)
            );

            // Fetch all prescriptions for this patient
            const prescriptionsResponse = await axios.get('/prescriptions', { headers });
            const patientPrescriptions = prescriptionsResponse.data.filter(
                presc => presc.patient_id == id || presc.patient_id === parseInt(id)
            );

            // Fetch all diagnoses for this patient
            const diagnosesResponse = await axios.get('/diagnoses', { headers });
            const patientDiagnoses = diagnosesResponse.data.filter(
                diag => diag.patient_id == id || diag.patient_id === parseInt(id)
            );

            // Delete all appointments
            if (patientAppointments.length > 0) {
                await Promise.all(
                    patientAppointments.map(apt => 
                        axios.delete(`/appointments/${apt.id}`, { headers })
                    )
                );
                console.log(`Deleted ${patientAppointments.length} appointments`);
            }

            // Delete all prescriptions
            if (patientPrescriptions.length > 0) {
                await Promise.all(
                    patientPrescriptions.map(presc => 
                        axios.delete(`/prescriptions/${presc.id}`, { headers })
                    )
                );
                console.log(`Deleted ${patientPrescriptions.length} prescriptions`);
            }

            // Delete all diagnoses
            if (patientDiagnoses.length > 0) {
                await Promise.all(
                    patientDiagnoses.map(diag => 
                        axios.delete(`/diagnoses/${diag.id}`, { headers })
                    )
                );
                console.log(`Deleted ${patientDiagnoses.length} diagnoses`);
            }

            // Finally, delete the patient
            await axios.delete(`/patients/${id}`, { headers });
            
            // Show detailed success message
            const deletedItems = [];
            if (patientAppointments.length > 0) deletedItems.push(`${patientAppointments.length} appointment(s)`);
            if (patientPrescriptions.length > 0) deletedItems.push(`${patientPrescriptions.length} prescription(s)`);
            if (patientDiagnoses.length > 0) deletedItems.push(`${patientDiagnoses.length} diagnos(es)`);
            
            if (deletedItems.length > 0) {
                toast.success(`Patient and related records deleted: ${deletedItems.join(', ')}`);
            }
        } catch (error) {
            console.error('Error in cascade delete:', error);
            throw error; // Re-throw to be caught by main handler
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={isDeleting}>
                    <Trash2 size={18} />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this {resource.slice(0, -1)}
                        {itemName && ` (${itemName})`}
                        {resource === 'doctors' && '. All associated appointments and prescriptions will also be deleted.'}.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleDelete} 
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}