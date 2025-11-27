import { useState, useEffect } from 'react';
import instance from '@/config/api';

// From shadcn/ui components. Most of this is just from their docs and examples and the festivals example.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Remember to re-import Badge if you're going to use it in other pages.
import { Badge } from '@/components/ui/badge';

// Skeleton is used for loading placeholders.
import { Skeleton } from '@/components/ui/skeleton';

// Icons for contact info. They're literally just icons.
import { Mail, Phone, Calendar } from 'lucide-react';

export default function DoctorsIndex() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        // When you get home, remember to remove this and turn this into a separate config file with environment variables for production use.
        // AKA, do not hardcode the API URL in the component, use environment variables instead and leave the /doctors endpoint here.
        const response = await instance.get('/doctors');
        // Nevermind, I just made a config/api.js file to handle axios instance with baseURL and did it in class.
        // Maybe investigate a way to refactor the api call to just read the endpoint without hardcoding? Maybe not worth it but you're probably bored.
        setDoctors(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch doctors. Please try again later.');
        console.error('Error fetching doctors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Function to get badge color based on specialization
  const getSpecializationColor = (specialization) => {
    const colors = {
      'General Practitioner': 'bg-blue-100 text-blue-800 border-blue-200',
      'Pediatrician': 'bg-green-100 text-green-800 border-green-200',
      'Dermatologist': 'bg-purple-100 text-purple-800 border-purple-200',
      'Psychiatrist': 'bg-pink-100 text-pink-800 border-pink-200',
      'Podiatrist': 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[specialization] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Our Doctors</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Our Doctors</h1>
        <p className="text-muted-foreground">
          Browse our team of {doctors.length} qualified medical professionals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {doctors.map((doctor) => (
          <Card 
            key={doctor.id} 
            className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
          >
            <CardHeader>
              <CardTitle className="text-xl">
                Dr. {doctor.first_name} {doctor.last_name}
              </CardTitle>
              <CardDescription>
                <Badge 
                  variant="outline" 
                  className={getSpecializationColor(doctor.specialisation)}
                >
                  {doctor.specialisation}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="truncate">{doctor.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{doctor.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{doctor.appointments?.length || 0} appointments</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {doctors.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No doctors found.</p>
        </div>
      )}
    </div>
  );
}
