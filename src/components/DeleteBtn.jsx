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
            await axios.delete(`/${resource}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
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
                        {itemName && ` (${itemName})`}.
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