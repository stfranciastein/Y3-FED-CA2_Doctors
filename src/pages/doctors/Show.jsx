import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import axios from '@/config/api.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil } from 'lucide-react';
import DeleteBtn from '@/components/DeleteBtn';

export default function DoctorPage() {
  const [response, setResponse] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState({});
  const { id } = useParams();

  let token = localStorage.getItem('token');

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

    const fetchPrescriptions = async () => {
      try {
        let response = await axios.get(`/prescriptions`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('All Prescriptions:', response.data);
        
        // Filter prescriptions for this doctor
        const doctorPrescriptions = response.data.filter(presc => presc.doctor_id === parseInt(id));
        setPrescriptions(doctorPrescriptions);
        
        // Fetch patient details for each prescription
        const patientIds = [...new Set(doctorPrescriptions.map(presc => presc.patient_id))];
        const patientPromises = patientIds.map(patientId => 
          axios.get(`/patients/${patientId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        );
        
        const patientResponses = await Promise.all(patientPromises);
        const patientsMap = {};
        patientResponses.forEach(res => {
          patientsMap[res.data.id] = res.data;
        });
        setPatients(patientsMap);
      } catch (err) {
        console.log('Error fetching prescriptions:', err);
      }
    };

    fetchDoctor();
    fetchPrescriptions();
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
    <div>
      {response && (
        <div>
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold">{response.first_name} {response.last_name}</h1>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to={`/doctors/${id}/edit`}>
                  <Pencil size={18} className="mr-2" />
                  Edit
                </Link>
              </Button>
              <DeleteBtn resource="doctors" id={id} itemName={`Dr. ${response.first_name} ${response.last_name}`} />
            </div>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Doctor Information</CardTitle>
            </CardHeader>
            <CardContent>
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
              </div>
            </CardContent>
          </Card>

          {prescriptions.length > 0 && (
            <div className="mt-6">
              <h2 className="text-2xl font-bold mb-4">Prescriptions Issued ({prescriptions.length})</h2>
              <div className="space-y-3">
                {prescriptions.map(prescription => (
                  <Link key={prescription.id} to={`/prescriptions/${prescription.id}`} className="block">
                    <div className="border rounded-lg p-4 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{prescription.medication}</h3>
                      <span className="text-sm text-gray-500">
                        {typeof prescription.start_date === 'number'
                          ? new Date(prescription.start_date * 1000).toLocaleDateString()
                          : new Date(prescription.start_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <span><strong>Dosage:</strong> {prescription.dosage}</span>
                        <span>
                          <strong>Patient:</strong>{' '}
                          {patients[prescription.patient_id] ? (
                            <Link 
                              to={`/patients/${prescription.patient_id}`}
                              className="text-teal-600 hover:text-teal-800 hover:underline transition-colors"
                            >
                              {patients[prescription.patient_id].first_name} {patients[prescription.patient_id].last_name}
                            </Link>
                          ) : (
                            `Patient ID: ${prescription.patient_id}`
                          )}
                        </span>
                      </div>
                      {prescription.end_date && (
                        <span className="text-gray-500">
                          Ends: {typeof prescription.end_date === 'number'
                            ? new Date(prescription.end_date * 1000).toLocaleDateString()
                            : new Date(prescription.end_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
