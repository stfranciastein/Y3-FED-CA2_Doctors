import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import axios from '@/config/api.js';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

export default function DiagnosisPage() {
  const [response, setResponse] = useState(null);
  const [patient, setPatient] = useState(null);
  const { id } = useParams();

  let token = localStorage.getItem('token');

  useEffect(() => {
    const fetchDiagnosis = async () => {
      try {
        let response = await axios.get(`/diagnoses/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log(response.data);
        setResponse(response.data);

        // Fetch patient details
        const patientRes = await axios.get(`/patients/${response.data.patient_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPatient(patientRes.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchDiagnosis();
  }, [id]);

  const formatDate = (dateValue) => {
    if (typeof dateValue === 'number') {
        return new Date(dateValue * 1000).toLocaleString();
    }
    return new Date(dateValue).toLocaleString();
  };
  
  return (
    <div>
      {response && (
        <div>
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold">Diagnosis #{response.id}</h1>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to={`/diagnoses/${id}/edit`}>
                  <Pencil size={18} className="mr-2" />
                  Edit
                </Link>
              </Button>
              <Button asChild variant="destructive" size="sm">
                <Link to={`/diagnoses/${id}/delete`}>
                  <Trash2 size={18} className="mr-2" />
                  Delete
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">ID</h3>
                <p className="mt-1 text-lg">{response.id}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Diagnosis Date</h3>
                <p className="mt-1 text-lg">{formatDate(response.diagnosis_date)}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Condition</h3>
              <p className="text-lg p-4 bg-gray-50 rounded border">{response.condition}</p>
            </div>
            
            {patient && (
              <div className="border-t pt-6">
                <h2 className="text-xl font-bold mb-4">Patient Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase">Name</h3>
                    <Link to={`/patients/${patient.id}`} className="mt-1 text-lg text-blue-600 hover:underline block">
                      {patient.first_name} {patient.last_name}
                    </Link>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase">Email</h3>
                    <p className="mt-1 text-lg">{patient.email}</p>
                  </div>
                  
                  {patient.phone && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase">Phone</h3>
                      <p className="mt-1 text-lg">{patient.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
