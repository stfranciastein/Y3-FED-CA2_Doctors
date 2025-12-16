import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import axios from '@/config/api.js';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import DeleteBtn from '@/components/DeleteBtn';

export default function AppointmentPage() {
  const [response, setResponse] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [patient, setPatient] = useState(null);
  const { id } = useParams();

  let token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        let response = await axios.get(`/appointments/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log(response.data);
        setResponse(response.data);

        // Fetch doctor and patient details
        const [doctorRes, patientRes] = await Promise.all([
          axios.get(`/doctors/${response.data.doctor_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`/patients/${response.data.patient_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setDoctor(doctorRes.data);
        setPatient(patientRes.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchAppointment();
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
            <h1 className="text-3xl font-bold">Appointment #{response.id}</h1>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to={`/appointments/${id}/edit`}>
                  <Pencil size={18} className="mr-2" />
                  Edit
                </Link>
              </Button>
              <DeleteBtn resource="appointments" id={id} itemName={`#${response.id}`} />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">ID</h3>
                <p className="mt-1 text-lg">{response.id}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Date & Time</h3>
                <p className="mt-1 text-lg">{formatDate(response.appointment_date)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Doctor</h3>
                {doctor ? (
                  <Link to={`/doctors/${doctor.id}`} className="mt-1 text-lg text-blue-600 hover:underline block">
                    Dr. {doctor.first_name} {doctor.last_name}
                    {doctor.specialisation && <span className="text-sm text-gray-500 block">{doctor.specialisation}</span>}
                  </Link>
                ) : (
                  <p className="mt-1 text-lg">Loading...</p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Patient</h3>
                {patient ? (
                  <Link to={`/patients/${patient.id}`} className="mt-1 text-lg text-blue-600 hover:underline block">
                    {patient.first_name} {patient.last_name}
                    {patient.email && <span className="text-sm text-gray-500 block">{patient.email}</span>}
                  </Link>
                ) : (
                  <p className="mt-1 text-lg">Loading...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
