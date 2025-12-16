import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import axios from '@/config/api.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil } from 'lucide-react';
import DeleteBtn from '@/components/DeleteBtn';

export default function PrescriptionPage() {
  const [response, setResponse] = useState(null);
  const [patient, setPatient] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const { id } = useParams();

  let token = localStorage.getItem('token');

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        let response = await axios.get(`/prescriptions/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log(response.data);
        setResponse(response.data);

        // Fetch related data
        const promises = [
          axios.get(`/patients/${response.data.patient_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`/doctors/${response.data.doctor_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ];

        if (response.data.diagnosis_id) {
          promises.push(
            axios.get(`/diagnoses/${response.data.diagnosis_id}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          );
        }

        const results = await Promise.all(promises);
        setPatient(results[0].data);
        setDoctor(results[1].data);
        if (results[2]) {
          setDiagnosis(results[2].data);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchPrescription();
  }, [id]);

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    if (typeof dateValue === 'number') {
        return new Date(dateValue * 1000).toLocaleDateString();
    }
    return new Date(dateValue).toLocaleDateString();
  };
  
  return (
    <div>
      {response && (
        <div>
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold">{response.medication}</h1>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to={`/prescriptions/${id}/edit`}>
                  <Pencil size={18} className="mr-2" />
                  Edit
                </Link>
              </Button>
              <DeleteBtn resource="prescriptions" id={id} itemName={response.medication} />
            </div>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Prescription Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase">ID</h3>
                    <p className="mt-1 text-lg">{response.id}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase">Medication</h3>
                    <p className="mt-1 text-lg">{response.medication}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase">Dosage</h3>
                    <p className="mt-1 text-lg">{response.dosage}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase">Start Date</h3>
                    <p className="mt-1 text-lg">{formatDate(response.start_date)}</p>
                  </div>
                </div>

                {response.end_date && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase">End Date</h3>
                    <p className="mt-1 text-lg">{formatDate(response.end_date)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {patient && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Patient Details</CardTitle>
              </CardHeader>
              <CardContent>
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
                </div>
              </CardContent>
            </Card>
          )}

          {doctor && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Prescribed By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase">Doctor</h3>
                    <Link to={`/doctors/${doctor.id}`} className="mt-1 text-lg text-blue-600 hover:underline block">
                      Dr. {doctor.first_name} {doctor.last_name}
                    </Link>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase">Specialisation</h3>
                    <p className="mt-1 text-lg">{doctor.specialisation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {diagnosis && (
            <Card>
              <CardHeader>
                <CardTitle>Related Diagnosis</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase">Condition</h3>
                  <Link to={`/diagnoses/${diagnosis.id}`} className="mt-1 text-lg text-blue-600 hover:underline block">
                    {diagnosis.condition}
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
