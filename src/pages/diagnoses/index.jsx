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

export default function DiagnosesIndex() {
  const [response, setResponse] = useState([]);
  const [patients, setPatients] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('condition');
  const [sortOrder, setSortOrder] = useState('asc');
  const { viewMode, toggleViewMode } = useViewMode('diagnosesViewMode');

  const sortOptions = [
    { value: 'condition', label: 'Condition' },
    { value: 'patient_name', label: 'Patient Name' },
    { value: 'date', label: 'Date' },
    { value: 'id', label: 'ID' }
  ];

  const fetchDiagnoses = async () => {
      const token = localStorage.getItem('token');
      const options = {
          method: 'GET',
          url: '/diagnoses',
          headers: {
              'Authorization': `Bearer ${token}`
          }
      };

      try {
          let response = await axios.request(options);
          console.log(response.data);
          setResponse(response.data);

          // Fetch all patients to show patient details
          const patientsRes = await axios.get('/patients');
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
    fetchDiagnoses();
  }, []);

  const toggleViewModeHandler = () => {
    toggleViewMode();
  };

  const filteredDiagnoses = response.filter(diagnosis => {
    const searchLower = searchTerm.toLowerCase();
    const patientName = patients[diagnosis.patient_id]
      ? `${patients[diagnosis.patient_id].first_name} ${patients[diagnosis.patient_id].last_name}`.toLowerCase()
      : '';
    return (
      diagnosis.condition.toLowerCase().includes(searchLower) ||
      patientName.includes(searchLower) ||
      diagnosis.id.toString().includes(searchLower)
    );
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch(sortField) {
      case 'condition':
        return sortOrder === 'asc' ? a.condition.localeCompare(b.condition) : b.condition.localeCompare(a.condition);
      case 'patient_name':
        aValue = patients[a.patient_id] ? `${patients[a.patient_id].first_name} ${patients[a.patient_id].last_name}` : '';
        bValue = patients[b.patient_id] ? `${patients[b.patient_id].first_name} ${patients[b.patient_id].last_name}` : '';
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      case 'date':
        aValue = new Date(a.diagnosis_date).getTime();
        bValue = new Date(b.diagnosis_date).getTime();
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
                searchPlaceholder="Search diagnoses..."
                addLink="/diagnoses/create"
                addText="Add Diagnosis"
                sortField={sortField}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                sortOptions={sortOptions}
                viewMode={viewMode}
                onViewToggle={toggleViewModeHandler}
            />

            {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDiagnoses.map((diagnosis) => {
                        const diagnosisDate = typeof diagnosis.diagnosis_date === 'number'
                            ? new Date(diagnosis.diagnosis_date * 1000).toLocaleDateString()
                            : new Date(diagnosis.diagnosis_date).toLocaleDateString();
                        return (
                            <Card key={diagnosis.id}>
                                <CardHeader>
                                    <CardTitle>Diagnosis #{diagnosis.id}</CardTitle>
                                    <CardDescription className="line-clamp-2">{diagnosis.condition}</CardDescription>
                                </CardHeader>
                            <CardContent>
                                <div className="space-y-1 text-sm">
                                    <p>
                                        <span className="font-semibold">Patient:</span>{' '}
                                        {patients[diagnosis.patient_id] ? 
                                            <Link to={`/patients/${diagnosis.patient_id}`} className="text-teal-600 hover:text-teal-800 hover:underline transition-colors">
                                                {`${patients[diagnosis.patient_id].first_name} ${patients[diagnosis.patient_id].last_name}`}
                                            </Link> : 
                                            `ID: ${diagnosis.patient_id}`}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Date:</span>{' '}
                                        {diagnosisDate}
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex gap-2">
                                <Button asChild variant='outline' size="sm">
                                    <Link to={`/diagnoses/${diagnosis.id}`}><Eye size={18} className="mr-1" /> View</Link>
                                </Button>
                                <Button asChild variant='outline' size="sm">
                                    <Link to={`/diagnoses/${diagnosis.id}/edit`}><Pencil size={18} className="mr-1" /> Edit</Link>
                                </Button>
                                <DeleteBtn resource="diagnoses" id={diagnosis.id} itemName={`#${diagnosis.id}`} onDeleteSuccess={fetchDiagnoses} />
                            </CardFooter>
                            </Card>
                    )})}
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredDiagnoses.map((diagnosis) => {
                            const diagnosisDate = typeof diagnosis.diagnosis_date === 'number'
                                ? new Date(diagnosis.diagnosis_date * 1000).toLocaleDateString()
                                : new Date(diagnosis.diagnosis_date).toLocaleDateString();
                            return (
                            <TableRow key={diagnosis.id}>
                                <TableCell className="font-medium">{diagnosis.id}</TableCell>
                                <TableCell className="max-w-md truncate">{diagnosis.condition}</TableCell>
                                <TableCell>
                                    {patients[diagnosis.patient_id] ? 
                                        <Link to={`/patients/${diagnosis.patient_id}`} className="text-teal-600 hover:text-teal-800 hover:underline transition-colors">
                                            {`${patients[diagnosis.patient_id].first_name} ${patients[diagnosis.patient_id].last_name}`}
                                        </Link> : 
                                        `ID: ${diagnosis.patient_id}`}
                                </TableCell>
                                <TableCell>{diagnosisDate}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex gap-2 justify-end">
                                    <Button asChild variant="outline" size="sm">
                                        <Link to={`/diagnoses/${diagnosis.id}`}><Eye size={18} /></Link>
                                    </Button>
                                    <Button asChild variant="outline" size="sm">
                                        <Link to={`/diagnoses/${diagnosis.id}/edit`}><Pencil size={18} /></Link>
                                    </Button>
                                    <DeleteBtn resource="diagnoses" id={diagnosis.id} itemName={`#${diagnosis.id}`} onDeleteSuccess={fetchDiagnoses} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        )})}
                    </TableBody>
                </Table>
            )}
        </>
    );
}
