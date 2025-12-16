import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import axios from '@/config/api.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
        let response = await axios.get(`/prescriptions`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('All Prescriptions:', response.data);
        
        // Filter prescriptions for this patient
        const patientPrescriptions = response.data.filter(presc => presc.patient_id === parseInt(id));
        setPrescriptions(patientPrescriptions);
        
        // Fetch diagnosis details for each prescription
        const diagnosisIds = [...new Set(patientPrescriptions.map(presc => presc.diagnosis_id).filter(Boolean))];
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

          {(appointments.length > 0 || prescriptions.length > 0) && (
            <div className="mt-6">
              <Tabs defaultValue="appointments" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="appointments">Appointments ({appointments.length})</TabsTrigger>
                  <TabsTrigger value="prescriptions">Prescriptions ({prescriptions.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="appointments" className="mt-6">
                  {appointments.length > 0 ? (
                    <div className="space-y-3">
                      {appointments.map(appointment => (
                        <Link key={appointment.id} to={`/appointments/${appointment.id}`} className="block">
                          <div className="border rounded-lg p-4 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-lg">Appointment #{appointment.id}</h3>
                            <span className="text-sm text-gray-500">
                              {typeof appointment.appointment_date === 'number'
                                ? new Date(appointment.appointment_date * 1000).toLocaleString()
                                : new Date(appointment.appointment_date).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center gap-4">
                              <span>
                                <strong>Doctor:</strong>{' '}
                                {doctors[appointment.doctor_id] ? (
                                  <Link 
                                    to={`/doctors/${appointment.doctor_id}`}
                                    className="text-teal-600 hover:text-teal-800 hover:underline transition-colors"
                                  >
                                    Dr. {doctors[appointment.doctor_id].first_name} {doctors[appointment.doctor_id].last_name}
                                  </Link>
                                ) : (
                                  `Doctor ID: ${appointment.doctor_id}`
                                )}
                              </span>
                              {doctors[appointment.doctor_id]?.specialisation && (
                                <span><strong>Specialisation:</strong> {doctors[appointment.doctor_id].specialisation}</span>
                              )}
                            </div>
                          </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No appointments found</p>
                  )}
                </TabsContent>

                <TabsContent value="prescriptions" className="mt-6">
                  {prescriptions.length > 0 ? (
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
                                <strong>Doctor:</strong>{' '}
                                {doctors[prescription.doctor_id] ? (
                                  <Link 
                                    to={`/doctors/${prescription.doctor_id}`}
                                    className="text-teal-600 hover:text-teal-800 hover:underline transition-colors"
                                  >
                                    Dr. {doctors[prescription.doctor_id].first_name} {doctors[prescription.doctor_id].last_name}
                                  </Link>
                                ) : (
                                  `Doctor ID: ${prescription.doctor_id}`
                                )}
                              </span>
                              {diagnoses[prescription.diagnosis_id] && (
                                <span>
                                  <strong>Diagnosis:</strong>{' '}
                                  <Link 
                                    to={`/diagnoses/${prescription.diagnosis_id}`}
                                    className="text-teal-600 hover:text-teal-800 hover:underline transition-colors"
                                  >
                                    {diagnoses[prescription.diagnosis_id].description}
                                  </Link>
                                </span>
                              )}
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
                  ) : (
                    <p className="text-gray-500 text-center py-8">No prescriptions found</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
