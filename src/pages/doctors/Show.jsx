import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import axios from '@/config/api.js';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

export default function DoctorPage() {
  const [response, setResponse] = useState(null);
  const { id } = useParams();

  let token = localStorage.getItem('token'); // Retrieve the token from local storage to use for authorised requests.

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        let response = await axios.get(`/doctors/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log(response.data);
        setResponse(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchDoctor();
  }, [id]);

  const formatDateForDisplay = (dateValue) => {
    // If it's a number (timestamp) or numeric string, convert to YYYY-MM-DD
    if (typeof dateValue === 'number' || (/^\d+$/.test(dateValue) && dateValue.length > 6)) {
        const d = new Date(Number(dateValue) * 1000);
        return d.toISOString().slice(0, 10);
    }
    // If it's already YYYY-MM-DD, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return dateValue;
    }
    // Otherwise, return empty string
    return '';
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      {response && (
        <div>
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold">{response.first_name} {response.last_name}</h1>
            <Button asChild variant="outline" size="sm">
              <Link to={`/doctors/${id}/edit`}>
                <Pencil size={18} className="mr-2" />
                Edit
              </Link>
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">ID</h3>
                <p className="mt-1 text-lg">{response.id}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Specialisation</h3>
                <p className="mt-1 text-lg">{response.specialisation}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Email</h3>
                <p className="mt-1 text-lg">{response.email}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Phone</h3>
                <p className="mt-1 text-lg">{response.phone}</p>
              </div>
            </div>

            {response.appointments && response.appointments.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Appointments</h3>
                <p className="mt-1 text-lg">{response.appointments.length} appointment(s)</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
