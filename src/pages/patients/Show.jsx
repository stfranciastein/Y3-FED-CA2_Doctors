import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import axios from '@/config/api.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil } from 'lucide-react';
import DeleteBtn from '@/components/DeleteBtn';

export default function PatientPage() {
  const [response, setResponse] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState({});
  const [prescriptions, setPrescriptions] = useState([]);
  const [diagnoses, setDiagnoses] = useState({});
  const { id } = useParams();

  let token = localStorage.getItem('token');

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        let response = await axios.get(`/patients/${id}`, {
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

    const fetchAppointments = async () => {
      try {
        let response = await axios.get(`/patients/${id}/appointments`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Appointments:', response.data);
        setAppointments(response.data);
        
        // Fetch doctor details for each appointment
        const doctorIds = [...new Set(response.data.map(apt => apt.doctor_id))];
        const doctorPromises = doctorIds.map(doctorId => 
          axios.get(`/doctors/${doctorId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        );
        
        const doctorResponses = await Promise.all(doctorPromises);
        const doctorsMap = {};
        doctorResponses.forEach(res => {
          doctorsMap[res.data.id] = res.data;
        });
        setDoctors(doctorsMap);
      } catch (err) {
        console.log('Error fetching appointments:', err);
      }
    };

    const fetchPrescriptions = async () => {
      try {
        let response = await axios.get(`/patients/${id}/prescriptions`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Prescriptions:', response.data);
        setPrescriptions(response.data);
        
        // Fetch diagnosis details for each prescription
        const diagnosisIds = [...new Set(response.data.map(presc => presc.diagnosis_id).filter(Boolean))];
        const diagnosisPromises = diagnosisIds.map(diagnosisId => 
          axios.get(`/diagnoses/${diagnosisId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        );
        
        const diagnosisResponses = await Promise.all(diagnosisPromises);
        const diagnosesMap = {};
        diagnosisResponses.forEach(res => {
          diagnosesMap[res.data.id] = res.data;
        });
        setDiagnoses(diagnosesMap);
      } catch (err) {
        console.log('Error fetching prescriptions:', err);
      }
    };

    fetchPatient();
    fetchAppointments();
    fetchPrescriptions();
  }, [id]);
  
  return (
    <div>
      {response && (
        <div>
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold">{response.first_name} {response.last_name}</h1>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to={`/patients/${id}/edit`}>
                  <Pencil size={18} className="mr-2" />
                  Edit
                </Link>
              </Button>
              <DeleteBtn resource="patients" id={id} itemName={`${response.first_name} ${response.last_name}`} />
            </div>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase">ID</h3>
                    <p className="mt-1 text-lg">{response.id}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase">Email</h3>
                    <p className="mt-1 text-lg">{response.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase">Phone</h3>
                    <p className="mt-1 text-lg">{response.phone}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase">Date of Birth</h3>
                    <p className="mt-1 text-lg">
                      {response.date_of_birth ? (
                        typeof response.date_of_birth === 'number' 
                          ? new Date(response.date_of_birth * 1000).toLocaleDateString()
                          : new Date(response.date_of_birth).toLocaleDateString()
                      ) : 'N/A'}
                    </p>
                  </div>
                </div>

                {response.address && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase">Address</h3>
                    <p className="mt-1 text-lg">{response.address}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {appointments.length > 0 && (
            <div className="mt-6">
              <h2 className="text-2xl font-bold mb-4">Appointments ({appointments.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointments.map(appointment => (
                  <Card key={appointment.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Appointment #{appointment.id}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-semibold">Date:</span>{' '}
                          {typeof appointment.appointment_date === 'number'
                            ? new Date(appointment.appointment_date * 1000).toLocaleString()
                            : new Date(appointment.appointment_date).toLocaleString()}
                        </p>
                        <p>
                          <span className="font-semibold">Doctor:</span>{' '}
                          {doctors[appointment.doctor_id] ? (
                            <Link 
                              to={`/doctors/${appointment.doctor_id}`}
                              className="text-blue-600 hover:underline"
                            >
                              Dr. {doctors[appointment.doctor_id].first_name} {doctors[appointment.doctor_id].last_name}
                            </Link>
                          ) : (
                            `Doctor ID: ${appointment.doctor_id}`
                          )}
                        </p>
                        {doctors[appointment.doctor_id]?.specialisation && (
                          <p>
                            <span className="font-semibold">Specialisation:</span>{' '}
                            {doctors[appointment.doctor_id].specialisation}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {prescriptions.length > 0 && (
            <div className="mt-6">
              <h2 className="text-2xl font-bold mb-4">Prescriptions ({prescriptions.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prescriptions.map(prescription => (
                  <Card key={prescription.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {prescription.medication}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-semibold">Dosage:</span>{' '}
                          {prescription.dosage}
                        </p>
                        <p>
                          <span className="font-semibold">Start Date:</span>{' '}
                          {typeof prescription.start_date === 'number'
                            ? new Date(prescription.start_date * 1000).toLocaleDateString()
                            : new Date(prescription.start_date).toLocaleDateString()}
                        </p>
                        {prescription.end_date && (
                          <p>
                            <span className="font-semibold">End Date:</span>{' '}
                            {typeof prescription.end_date === 'number'
                              ? new Date(prescription.end_date * 1000).toLocaleDateString()
                              : new Date(prescription.end_date).toLocaleDateString()}
                          </p>
                        )}
                        <p>
                          <span className="font-semibold">Doctor:</span>{' '}
                          {doctors[prescription.doctor_id] ? (
                            <Link 
                              to={`/doctors/${prescription.doctor_id}`}
                              className="text-blue-600 hover:underline"
                            >
                              Dr. {doctors[prescription.doctor_id].first_name} {doctors[prescription.doctor_id].last_name}
                            </Link>
                          ) : (
                            `Doctor ID: ${prescription.doctor_id}`
                          )}
                        </p>
                        {diagnoses[prescription.diagnosis_id] && (
                          <p>
                            <span className="font-semibold">Diagnosis:</span>{' '}
                            <Link 
                              to={`/diagnoses/${prescription.diagnosis_id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {diagnoses[prescription.diagnosis_id].description}
                            </Link>
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
