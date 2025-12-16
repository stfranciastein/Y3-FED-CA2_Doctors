import { useEffect, useState } from 'react';
import axios from '@/config/api.js';
import { Link } from 'react-router';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import DeleteBtn from '@/components/DeleteBtn';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from '@/components/ui/button';
import { Eye, Pencil, Grid, List } from 'lucide-react';
import { useViewMode } from '@/hooks/useViewMode';

export default function AppointmentsIndex() {
  const [response, setResponse] = useState([]);
  const [doctors, setDoctors] = useState({});
  const [patients, setPatients] = useState({});
  const { viewMode, toggleViewMode } = useViewMode('appointmentsViewMode');

  const fetchAppointments = async () => {
      const token = localStorage.getItem('token');
      const options = {
          method: 'GET',
          url: '/appointments',
          headers: {
              'Authorization': `Bearer ${token}`
          }
      };

      try {
          let response = await axios.request(options);
          console.log(response.data);
          setResponse(response.data);

          // Fetch all doctors and patients
          const [doctorsRes, patientsRes] = await Promise.all([
              axios.get('/doctors'),
              axios.get('/patients')
          ]);

          const doctorsMap = {};
          doctorsRes.data.forEach(doc => {
              doctorsMap[doc.id] = doc;
          });
          setDoctors(doctorsMap);

          const patientsMap = {};
          patientsRes.data.forEach(pat => {
              patientsMap[pat.id] = pat;
          });
          setPatients(patientsMap);
      } catch (err) {
          console.log(err);
      }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const formatDate = (dateValue) => {
    if (typeof dateValue === 'number') {
        return new Date(dateValue * 1000).toLocaleString();
    }
    return new Date(dateValue).toLocaleString();
  };

    return (
        <>
            <div className="flex gap-2 mb-4">
                <Button
                    asChild
                    variant='outline'
                >
                    <Link to="/appointments/create">Add Appointment</Link>
                </Button>
                
                <Button
                    variant='outline'
                    onClick={toggleViewMode}
                >
                    {viewMode === 'table' ? (
                        <>
                            <Grid size={18} className="mr-2" />
                            Cards
                        </>
                    ) : (
                        <>
                            <List size={18} className="mr-2" />
                            Table
                        </>
                    )}
                </Button>
            </div>

            {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {response.map((appointment) => (
                        <Card key={appointment.id}>
                            <CardHeader>
                                <CardTitle>Appointment #{appointment.id}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1 text-sm">
                                    <p>
                                        <span className="font-semibold">Doctor:</span>{' '}
                                        {doctors[appointment.doctor_id] ? 
                                            <Link to={`/doctors/${appointment.doctor_id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                                                {`Dr. ${doctors[appointment.doctor_id].first_name} ${doctors[appointment.doctor_id].last_name}`}
                                            </Link> : 
                                            `ID: ${appointment.doctor_id}`}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Patient:</span>{' '}
                                        {patients[appointment.patient_id] ? 
                                            <Link to={`/patients/${appointment.patient_id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                                                {`${patients[appointment.patient_id].first_name} ${patients[appointment.patient_id].last_name}`}
                                            </Link> : 
                                            `ID: ${appointment.patient_id}`}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Date & Time:</span>{' '}
                                        {formatDate(appointment.appointment_date)}
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex gap-2">
                                <Button asChild variant='outline' size="sm">
                                    <Link to={`/appointments/${appointment.id}`}><Eye size={18} className="mr-1" /> View</Link>
                                </Button>
                                <Button asChild variant='outline' size="sm">
                                    <Link to={`/appointments/${appointment.id}/edit`}><Pencil size={18} className="mr-1" /> Edit</Link>
                                </Button>
                                <DeleteBtn resource="appointments" id={appointment.id} itemName={`#${appointment.id}`} onDeleteSuccess={fetchAppointments} />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {response.map((appointment) => (
                            <TableRow key={appointment.id}>
                                <TableCell className="font-medium">{appointment.id}</TableCell>
                                <TableCell>
                                    {doctors[appointment.doctor_id] ? 
                                        <Link to={`/doctors/${appointment.doctor_id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                                            {`Dr. ${doctors[appointment.doctor_id].first_name} ${doctors[appointment.doctor_id].last_name}`}
                                        </Link> : 
                                        `ID: ${appointment.doctor_id}`}
                                </TableCell>
                                <TableCell>
                                    {patients[appointment.patient_id] ? 
                                        <Link to={`/patients/${appointment.patient_id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                                            {`${patients[appointment.patient_id].first_name} ${patients[appointment.patient_id].last_name}`}
                                        </Link> : 
                                        `ID: ${appointment.patient_id}`}
                                </TableCell>
                                <TableCell>{formatDate(appointment.appointment_date)}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex gap-2 justify-end">
                                    <Button asChild variant="outline" size="sm">
                                        <Link to={`/appointments/${appointment.id}`}><Eye size={18} /></Link>
                                    </Button>
                                    <Button asChild variant="outline" size="sm">
                                        <Link to={`/appointments/${appointment.id}/edit`}><Pencil size={18} /></Link>
                                    </Button>
                                    <DeleteBtn resource="appointments" id={appointment.id} itemName={`#${appointment.id}`} onDeleteSuccess={fetchAppointments} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </>
    );
}
