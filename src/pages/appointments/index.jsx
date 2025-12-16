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
import IndexToolbar from '@/components/IndexToolbar';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from '@/components/ui/button';
import { Eye, Pencil } from 'lucide-react';
import { useViewMode } from '@/hooks/useViewMode';

export default function AppointmentsIndex() {
  const [response, setResponse] = useState([]);
  const [doctors, setDoctors] = useState({});
  const [patients, setPatients] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('patient_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const { viewMode, toggleViewMode } = useViewMode('appointmentsViewMode');

  const sortOptions = [
    { value: 'patient_name', label: 'Patient Name' },
    { value: 'doctor_name', label: 'Doctor Name' },
    { value: 'date', label: 'Date' },
    { value: 'id', label: 'ID' }
  ];

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

  const filteredAppointments = response.filter(appointment => {
    const searchLower = searchTerm.toLowerCase();
    const doctorName = doctors[appointment.doctor_id] 
      ? `${doctors[appointment.doctor_id].first_name} ${doctors[appointment.doctor_id].last_name}`.toLowerCase()
      : '';
    const patientName = patients[appointment.patient_id]
      ? `${patients[appointment.patient_id].first_name} ${patients[appointment.patient_id].last_name}`.toLowerCase()
      : '';
    const appointmentId = appointment.id.toString();
    return doctorName.includes(searchLower) || patientName.includes(searchLower) || appointmentId.includes(searchLower);
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch(sortField) {
      case 'patient_name':
        aValue = patients[a.patient_id] ? `${patients[a.patient_id].first_name} ${patients[a.patient_id].last_name}` : '';
        bValue = patients[b.patient_id] ? `${patients[b.patient_id].first_name} ${patients[b.patient_id].last_name}` : '';
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      case 'doctor_name':
        aValue = doctors[a.doctor_id] ? `${doctors[a.doctor_id].first_name} ${doctors[a.doctor_id].last_name}` : '';
        bValue = doctors[b.doctor_id] ? `${doctors[b.doctor_id].first_name} ${doctors[b.doctor_id].last_name}` : '';
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      case 'date':
        aValue = new Date(typeof a.appointment_date === 'number' ? a.appointment_date * 1000 : a.appointment_date).getTime();
        bValue = new Date(typeof b.appointment_date === 'number' ? b.appointment_date * 1000 : b.appointment_date).getTime();
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      case 'id':
        return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
      default:
        return 0;
    }
  });

  const handleSortChange = (field, order) => {
    setSortField(field);
    setSortOrder(order);
  };

    return (
        <>
            <IndexToolbar
                searchTerm={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
                searchPlaceholder="Search appointments..."
                addLink="/appointments/create"
                addText="Add Appointment"
                sortField={sortField}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                sortOptions={sortOptions}
                viewMode={viewMode}
                onViewToggle={toggleViewMode}
            />

            {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAppointments.map((appointment) => (
                            <Card key={appointment.id}>
                                <CardHeader>
                                    <CardTitle>Appointment #{appointment.id}</CardTitle>
                                </CardHeader>
                            <CardContent>
                                <div className="space-y-1 text-sm">
                                    <p>
                                        <span className="font-semibold">Doctor:</span>{' '}
                                        {doctors[appointment.doctor_id] ? 
                                            <Link to={`/doctors/${appointment.doctor_id}`} className="text-teal-600 hover:text-teal-800 hover:underline transition-colors">
                                                {`Dr. ${doctors[appointment.doctor_id].first_name} ${doctors[appointment.doctor_id].last_name}`}
                                            </Link> : 
                                            `ID: ${appointment.doctor_id}`}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Patient:</span>{' '}
                                        {patients[appointment.patient_id] ? 
                                            <Link to={`/patients/${appointment.patient_id}`} className="text-teal-600 hover:text-teal-800 hover:underline transition-colors">
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
                        {filteredAppointments.map((appointment) => (
                            <TableRow key={appointment.id}>
                                <TableCell className="font-medium">{appointment.id}</TableCell>
                                <TableCell>
                                    {doctors[appointment.doctor_id] ? 
                                        <Link to={`/doctors/${appointment.doctor_id}`} className="text-teal-600 hover:text-teal-800 hover:underline transition-colors">
                                            {`Dr. ${doctors[appointment.doctor_id].first_name} ${doctors[appointment.doctor_id].last_name}`}
                                        </Link> : 
                                        `ID: ${appointment.doctor_id}`}
                                </TableCell>
                                <TableCell>
                                    {patients[appointment.patient_id] ? 
                                        <Link to={`/patients/${appointment.patient_id}`} className="text-teal-600 hover:text-teal-800 hover:underline transition-colors">
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
