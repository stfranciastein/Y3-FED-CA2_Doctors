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

export default function PrescriptionsIndex() {
  const [response, setResponse] = useState([]);
  const [patients, setPatients] = useState({});
  const [doctors, setDoctors] = useState({});
  const { viewMode, toggleViewMode } = useViewMode('prescriptionsViewMode');

  const fetchPrescriptions = async () => {
      const token = localStorage.getItem('token');
      const options = {
          method: 'GET',
          url: '/prescriptions',
          headers: {
              'Authorization': `Bearer ${token}`
          }
      };

      try {
          let response = await axios.request(options);
          console.log(response.data);
          setResponse(response.data);

          // Fetch all patients and doctors
          const [patientsRes, doctorsRes] = await Promise.all([
              axios.get('/patients'),
              axios.get('/doctors')
          ]);

          const patientsMap = {};
          patientsRes.data.forEach(pat => {
              patientsMap[pat.id] = pat;
          });
          setPatients(patientsMap);

          const doctorsMap = {};
          doctorsRes.data.forEach(doc => {
              doctorsMap[doc.id] = doc;
          });
          setDoctors(doctorsMap);
      } catch (err) {
          console.log(err);
      }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    if (typeof dateValue === 'number') {
        return new Date(dateValue * 1000).toLocaleDateString();
    }
    return new Date(dateValue).toLocaleDateString();
  };

    return (
        <>
            <div className="flex gap-2 mb-4">
                <Button
                    asChild
                    variant='outline'
                >
                    <Link to="/prescriptions/create">Add Prescription</Link>
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
                    {response.map((prescription) => (
                        <Link key={prescription.id} to={`/prescriptions/${prescription.id}`} className="block">
                            <Card className="cursor-pointer hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <CardTitle>{prescription.medication}</CardTitle>
                                    <CardDescription>Prescription ID: {prescription.id}</CardDescription>
                                </CardHeader>
                            <CardContent>
                                <div className="space-y-1 text-sm">
                                    <p><span className="font-semibold">Dosage:</span> {prescription.dosage}</p>
                                    <p>
                                        <span className="font-semibold">Patient:</span>{' '}
                                        {patients[prescription.patient_id] ? (
                                            <Link to={`/patients/${prescription.patient_id}`} className="text-teal-600 hover:text-teal-800 hover:underline transition-colors">
                                                {patients[prescription.patient_id].first_name} {patients[prescription.patient_id].last_name}
                                            </Link>
                                        ) : (
                                            `Patient ID: ${prescription.patient_id}`
                                        )}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Doctor:</span>{' '}
                                        {doctors[prescription.doctor_id] ? (
                                            <Link to={`/doctors/${prescription.doctor_id}`} className="text-teal-600 hover:text-teal-800 hover:underline transition-colors">
                                                Dr. {doctors[prescription.doctor_id].first_name} {doctors[prescription.doctor_id].last_name}
                                            </Link>
                                        ) : (
                                            `Doctor ID: ${prescription.doctor_id}`
                                        )}
                                    </p>
                                    <p><span className="font-semibold">Start:</span> {formatDate(prescription.start_date)}</p>
                                    {prescription.end_date && (
                                        <p><span className="font-semibold">End:</span> {formatDate(prescription.end_date)}</p>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="flex gap-2">
                                <Button asChild variant='outline' size="sm">
                                    <Link to={`/prescriptions/${prescription.id}`}><Eye size={18} className="mr-1" /> View</Link>
                                </Button>
                                <Button asChild variant='outline' size="sm">
                                    <Link to={`/prescriptions/${prescription.id}/edit`}><Pencil size={18} className="mr-1" /> Edit</Link>
                                </Button>
                                <DeleteBtn resource="prescriptions" id={prescription.id} itemName={prescription.medication} onDeleteSuccess={fetchPrescriptions} />
                            </CardFooter>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Medication</TableHead>
                        <TableHead>Dosage</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {response.map((prescription) => (
                            <TableRow key={prescription.id} className="cursor-pointer hover:bg-muted/50" onClick={() => window.location.href = `/prescriptions/${prescription.id}`}>
                                <TableCell className="font-medium">{prescription.id}</TableCell>
                                <TableCell>{prescription.medication}</TableCell>
                                <TableCell>{prescription.dosage}</TableCell>
                                <TableCell>
                                    {patients[prescription.patient_id] ? (
                                        <Link to={`/patients/${prescription.patient_id}`} className="text-teal-600 hover:text-teal-800 hover:underline transition-colors">
                                            {patients[prescription.patient_id].first_name} {patients[prescription.patient_id].last_name}
                                        </Link>
                                    ) : (
                                        `Patient ID: ${prescription.patient_id}`
                                    )}
                                </TableCell>
                                <TableCell>
                                    {doctors[prescription.doctor_id] ? (
                                        <Link to={`/doctors/${prescription.doctor_id}`} className="text-teal-600 hover:text-teal-800 hover:underline transition-colors">
                                            Dr. {doctors[prescription.doctor_id].first_name} {doctors[prescription.doctor_id].last_name}
                                        </Link>
                                    ) : (
                                        `Doctor ID: ${prescription.doctor_id}`
                                    )}
                                </TableCell>
                                <TableCell>{formatDate(prescription.start_date)}</TableCell>
                                <TableCell>{formatDate(prescription.end_date)}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex gap-2 justify-end">
                                    <Button asChild variant="outline" size="sm">
                                        <Link to={`/prescriptions/${prescription.id}`}><Eye size={18} /></Link>
                                    </Button>
                                    <Button asChild variant="outline" size="sm">
                                        <Link to={`/prescriptions/${prescription.id}/edit`}><Pencil size={18} /></Link>
                                    </Button>
                                    <DeleteBtn resource="prescriptions" id={prescription.id} itemName={prescription.medication} onDeleteSuccess={fetchPrescriptions} />
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
