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

export default function PatientsIndex() {
  const [response, setResponse] = useState([]);
  const { viewMode, toggleViewMode } = useViewMode('patientsViewMode');

  const fetchPatients = async () => {
      const options = {
          method: 'GET',
          url: '/patients',
      };

      try {
          let response = await axios.request(options);
          console.log(response.data);
          setResponse(response.data);
      } catch (err) {
          console.log(err);
      }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

    return (
        <>
            <div className="flex gap-2 mb-4">
                <Button
                    asChild
                    variant='outline'
                >
                    <Link to="/patients/create">Add Patient</Link>
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
                    {response.map((patient) => (
                            <Card key={patient.id}>
                                <CardHeader>
                                    <CardTitle>{patient.first_name} {patient.last_name}</CardTitle>
                                    <CardDescription>Patient ID: {patient.id}</CardDescription>
                                </CardHeader>
                            <CardContent>
                                <div className="space-y-1 text-sm">
                                    <p><span className="font-semibold">Email:</span> {patient.email}</p>
                                    <p><span className="font-semibold">Phone:</span> {patient.phone}</p>
                                    {patient.date_of_birth && (
                                        <p><span className="font-semibold">DOB:</span> {
                                          typeof patient.date_of_birth === 'number' 
                                            ? new Date(patient.date_of_birth * 1000).toLocaleDateString()
                                            : new Date(patient.date_of_birth).toLocaleDateString()
                                        }</p>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="flex gap-2">
                                <Button asChild variant='outline' size="sm">
                                    <Link to={`/patients/${patient.id}`}><Eye size={18} className="mr-1" /> View</Link>
                                </Button>
                                <Button asChild variant='outline' size="sm">
                                    <Link to={`/patients/${patient.id}/edit`}><Pencil size={18} className="mr-1" /> Edit</Link>
                                </Button>
                                <DeleteBtn resource="patients" id={patient.id} itemName={`${patient.first_name} ${patient.last_name}`} onDeleteSuccess={fetchPatients} />
                            </CardFooter>
                            </Card>
                    ))}
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>First Name</TableHead>
                        <TableHead>Last Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Date of Birth</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {response.map((patient) => (
                            <TableRow key={patient.id}>
                                <TableCell className="font-medium">{patient.id}</TableCell>
                                <TableCell>{patient.first_name}</TableCell>
                                <TableCell>{patient.last_name}</TableCell>
                                <TableCell>{patient.email}</TableCell>
                                <TableCell>{patient.phone}</TableCell>
                                <TableCell>
                                  {patient.date_of_birth ? (
                                    typeof patient.date_of_birth === 'number'
                                      ? new Date(patient.date_of_birth * 1000).toLocaleDateString()
                                      : new Date(patient.date_of_birth).toLocaleDateString()
                                  ) : 'N/A'}
                                </TableCell>
                                <TableCell>{patient.address || 'N/A'}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex gap-2 justify-end">
                                    <Button asChild variant="outline" size="sm">
                                        <Link to={`/patients/${patient.id}`}><Eye size={18} /></Link>
                                    </Button>
                                    <Button asChild variant="outline" size="sm">
                                        <Link to={`/patients/${patient.id}/edit`}><Pencil size={18} /></Link>
                                    </Button>
                                    <DeleteBtn resource="patients" id={patient.id} itemName={`${patient.first_name} ${patient.last_name}`} onDeleteSuccess={fetchPatients} />
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
