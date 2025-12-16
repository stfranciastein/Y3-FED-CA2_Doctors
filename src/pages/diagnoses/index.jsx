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

export default function DiagnosesIndex() {
  const [response, setResponse] = useState([]);
  const [patients, setPatients] = useState({});
  const { viewMode, toggleViewMode } = useViewMode('diagnosesViewMode');

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

    return (
        <>
            <div className="flex gap-2 mb-4">
                <Button
                    asChild
                    variant='outline'
                >
                    <Link to="/diagnoses/create">Add Diagnosis</Link>
                </Button>
                
                <Button
                    variant='outline'
                    onClick={toggleViewModeHandler}
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
                    {response.map((diagnosis) => {
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
                                            `${patients[diagnosis.patient_id].first_name} ${patients[diagnosis.patient_id].last_name}` : 
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
                        {response.map((diagnosis) => {
                            const diagnosisDate = typeof diagnosis.diagnosis_date === 'number'
                                ? new Date(diagnosis.diagnosis_date * 1000).toLocaleDateString()
                                : new Date(diagnosis.diagnosis_date).toLocaleDateString();
                            return (
                            <TableRow key={diagnosis.id}>
                                <TableCell className="font-medium">{diagnosis.id}</TableCell>
                                <TableCell className="max-w-md truncate">{diagnosis.condition}</TableCell>
                                <TableCell>
                                    {patients[diagnosis.patient_id] ? 
                                        `${patients[diagnosis.patient_id].first_name} ${patients[diagnosis.patient_id].last_name}` : 
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
