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
import { useDataList } from '@/hooks/useDataList';

export default function PrescriptionsIndex() {
  const [response, setResponse] = useState([]);
  const [patients, setPatients] = useState({});
  const [doctors, setDoctors] = useState({});
  const { viewMode, toggleViewMode } = useViewMode('prescriptionsViewMode');
  const { searchTerm, setSearchTerm, sortField, sortOrder, handleSortChange } = useDataList('prescriptions', 'medication', 'asc');

  const sortOptions = [
    { value: 'medication', label: 'Medication' },
    { value: 'patient_name', label: 'Patient Name' },
    { value: 'doctor_name', label: 'Doctor Name' },
    { value: 'start_date', label: 'Start Date' },
    { value: 'id', label: 'ID' }
  ];

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

  const filteredPrescriptions = response.filter(prescription => {
    const searchLower = searchTerm.toLowerCase();
    const patientName = patients[prescription.patient_id]
      ? `${patients[prescription.patient_id].first_name} ${patients[prescription.patient_id].last_name}`.toLowerCase()
      : '';
    const doctorName = doctors[prescription.doctor_id]
      ? `${doctors[prescription.doctor_id].first_name} ${doctors[prescription.doctor_id].last_name}`.toLowerCase()
      : '';
    return (
      prescription.medication.toLowerCase().includes(searchLower) ||
      prescription.dosage.toLowerCase().includes(searchLower) ||
      patientName.includes(searchLower) ||
      doctorName.includes(searchLower) ||
      prescription.id.toString().includes(searchLower)
    );
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch(sortField) {
      case 'medication':
        return sortOrder === 'asc' ? a.medication.localeCompare(b.medication) : b.medication.localeCompare(a.medication);
      case 'patient_name':
        aValue = patients[a.patient_id] ? `${patients[a.patient_id].first_name} ${patients[a.patient_id].last_name}` : '';
        bValue = patients[b.patient_id] ? `${patients[b.patient_id].first_name} ${patients[b.patient_id].last_name}` : '';
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      case 'doctor_name':
        aValue = doctors[a.doctor_id] ? `${doctors[a.doctor_id].first_name} ${doctors[a.doctor_id].last_name}` : '';
        bValue = doctors[b.doctor_id] ? `${doctors[b.doctor_id].first_name} ${doctors[b.doctor_id].last_name}` : '';
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      case 'start_date':
        aValue = new Date(typeof a.start_date === 'number' ? a.start_date * 1000 : a.start_date).getTime();
        bValue = new Date(typeof b.start_date === 'number' ? b.start_date * 1000 : b.start_date).getTime();
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      case 'id':
        return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
      default:
        return 0;
    }
  });

    return (
        <>
            <IndexToolbar
                searchTerm={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
                searchPlaceholder="Search prescriptions..."
                addLink="/prescriptions/create"
                addText="Add Prescription"
                sortField={sortField}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                sortOptions={sortOptions}
                viewMode={viewMode}
                onViewToggle={toggleViewMode}
            />

            {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPrescriptions.map((prescription) => (
                            <Card key={prescription.id}>
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
                        {filteredPrescriptions.map((prescription) => (
                            <TableRow key={prescription.id}>
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
