import { useEffect, useState } from 'react';
import axios from '@/config/api.js';
import { Link } from 'react-router';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
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

export default function DoctorsIndex() {
// Originally, this const used doctors, response is used to make it easy to reuse this code later for other API requests.
  const [response, setResponse] = useState([]);
  const { viewMode, toggleViewMode } = useViewMode('doctorsViewMode');

  const fetchDoctors = async () => {
      const options = {
          method: 'GET',
          url: '/doctors',
      };

      try {
          let response = await axios.request(options); //It's more common to use async/await syntax now instead of .then() syntax
          console.log(response.data);
          setResponse(response.data);
      } catch (err) {
          console.log(err);
      }
  };

  useEffect(() => {
    fetchDoctors();
    //.catch(() => console.log("Hello World"));
  }, []);

  // An important thing to note about promise based requests is that they are asynchronous.
  // This means that the request will be made, and while we wait for the response, the rest of the code will continue to run.
  // Therefore, when the component first renders, the doctors state will still be an empty array.
  // Once the data is fetched, the state will be updated, and the component will re-render with the new data. 
  // You can demonstrate this by making the catch console log say "Hello World" and seeing it appear before the data is logged.

//   const doctorCards = response.map((doctor) => {
//     return (
//         <Card key={doctor.id}>
//             <CardHeader>
//                 <CardTitle>{doctor.title}</CardTitle>
//                 <CardDescription>{doctor.description}</CardDescription>
//             </CardHeader>
//             <CardContent>
//                 <div className="space-y-1 text-sm">
//                     {doctor.city && (
//                         <p><span className="font-semibold">City:</span> {doctor.city}</p>
//                     )}
//                     {doctor.start_date && (
//                         <p><span className="font-semibold">Start Date:</span> {new Date(doctor.start_date).toLocaleDateString()}</p>
//                     )}
//                     {doctor.end_date && (
//                         <p><span className="font-semibold">End Date:</span> {new Date(doctor.end_date).toLocaleDateString()}</p>
//                     )}
//                 </div>
//             </CardContent>
//             <CardFooter>
//                 <Button asChild variant='outline'>
//                     <Link to={`/doctors/${doctor.id}`}>View</Link>
//                 </Button>
//             </CardFooter>
//         </Card>
//     )
//   });



    function formatDateForDisplay(dateValue) {
        // If it's a number (timestamp) or numeric string, convert to YYYY-MM-DD
        if (typeof dateValue === 'number' || (/^\d+$/.test(dateValue) && dateValue.length > 6)) {
            const d = new Date(Number(dateValue) * 1000);
            return d.toISOString().slice(0, 10);
        }
        // If it's already YYYY-MM-DD, return as-is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            return dateValue;
        }
        // Otherwise, return empty string
        return '';
    }

    return (
        <>
            <h1>Doctors</h1>

            <div className="flex gap-2 mb-4">
                <Button
                    asChild
                    variant='outline'
                >
                    <Link to="/doctors/create">Add Doctor</Link>
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
                    {response.map((doctor) => (
                        <Card key={doctor.id}>
                            <CardHeader>
                                <CardTitle>{doctor.first_name} {doctor.last_name}</CardTitle>
                                <CardDescription>{doctor.specialisation}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1 text-sm">
                                    <p><span className="font-semibold">Email:</span> {doctor.email}</p>
                                    <p><span className="font-semibold">Phone:</span> {doctor.phone}</p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex gap-2">
                                <Button asChild variant='outline' size="sm">
                                    <Link to={`/doctors/${doctor.id}`}><Eye size={18} className="mr-1" /> View</Link>
                                </Button>
                                <Button asChild variant='outline' size="sm">
                                    <Link to={`/doctors/${doctor.id}/edit`}><Pencil size={18} className="mr-1" /> Edit</Link>
                                </Button>
                                <DeleteBtn resource="doctors" id={doctor.id} itemName={`Dr. ${doctor.first_name} ${doctor.last_name}`} onDeleteSuccess={fetchDoctors} />
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
                        <TableHead>Specialisation</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {response.map((doctor) => (
                            <TableRow key={doctor.id}>
                                <TableCell className="font-medium">{doctor.id}</TableCell>
                                <TableCell>{doctor.first_name}</TableCell>
                                <TableCell>{doctor.last_name}</TableCell>
                                <TableCell>{doctor.email}</TableCell>
                                <TableCell>{doctor.phone}</TableCell>
                                <TableCell>{doctor.specialisation}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex gap-2 justify-end">
                                    <Button asChild variant="outline" size="sm">
                                        <Link to={`/doctors/${doctor.id}`}><Eye size={18} /></Link>
                                    </Button>
                                    <Button asChild variant="outline" size="sm">
                                        <Link to={`/doctors/${doctor.id}/edit`}><Pencil size={18} /></Link>
                                    </Button>
                                    <DeleteBtn resource="doctors" id={doctor.id} itemName={`Dr. ${doctor.first_name} ${doctor.last_name}`} onDeleteSuccess={fetchDoctors} />
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