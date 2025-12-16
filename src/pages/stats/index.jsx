import { useEffect, useState } from 'react';
import axios from '@/config/api.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export default function StatsIndex() {
  const [stats, setStats] = useState({
    patients: [],
    doctors: [],
    appointments: [],
    diagnoses: [],
    prescriptions: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [doctors, setDoctors] = useState({});
  const [patients, setPatients] = useState({});

  useEffect(() => {
    const fetchAllData = async () => {
      const token = localStorage.getItem('token');
      try {
        const [patientsRes, doctorsRes, appointmentsRes, diagnosesRes, prescriptionsRes] = await Promise.all([
          axios.get('/patients', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/doctors', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/appointments', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/diagnoses', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/prescriptions', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setStats({
          patients: patientsRes.data,
          doctors: doctorsRes.data,
          appointments: appointmentsRes.data,
          diagnoses: diagnosesRes.data,
          prescriptions: prescriptionsRes.data
        });

        // Create lookup maps for doctors and patients
        const doctorsMap = {};
        doctorsRes.data.forEach(doctor => {
          doctorsMap[doctor.id] = doctor;
        });
        setDoctors(doctorsMap);

        const patientsMap = {};
        patientsRes.data.forEach(patient => {
          patientsMap[patient.id] = patient;
        });
        setPatients(patientsMap);

      } catch (error) {
        console.error('Error fetching stats data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Process data for charts
  const getDoctorSpecialisations = () => {
    const specialisations = {};
    stats.doctors.forEach(doctor => {
      const spec = doctor.specialisation || 'General';
      specialisations[spec] = (specialisations[spec] || 0) + 1;
    });
    return Object.entries(specialisations).map(([name, value]) => ({ name, value }));
  };

  const getAppointmentsByMonth = () => {
    const months = {};
    stats.appointments.forEach(apt => {
      const date = new Date(typeof apt.appointment_date === 'number' ? apt.appointment_date * 1000 : apt.appointment_date);
      const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      months[month] = (months[month] || 0) + 1;
    });
    return Object.entries(months).slice(-6).map(([month, appointments]) => ({ month, appointments }));
  };

  const getTopDiagnoses = () => {
    const conditions = {};
    stats.diagnoses.forEach(diagnosis => {
      const condition = diagnosis.condition || 'Other';
      conditions[condition] = (conditions[condition] || 0) + 1;
    });
    return Object.entries(conditions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([condition, count]) => ({ condition, count }));
  };

  const getOverviewStats = () => ({
    totalPatients: stats.patients.length,
    totalDoctors: stats.doctors.length,
    totalAppointments: stats.appointments.length,
    totalPrescriptions: stats.prescriptions.length
  });

  // Get appointments for a specific date
  const getAppointmentsForDate = (date) => {
    return stats.appointments.filter(apt => {
      const aptDate = new Date(typeof apt.appointment_date === 'number' ? apt.appointment_date * 1000 : apt.appointment_date);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  // Get dates that have appointments
  const getAppointmentDates = () => {
    return stats.appointments.map(apt => {
      const date = new Date(typeof apt.appointment_date === 'number' ? apt.appointment_date * 1000 : apt.appointment_date);
      return date;
    });
  };

  const appointmentsForSelectedDate = getAppointmentsForDate(selectedDate);
  const appointmentDates = getAppointmentDates();

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading statistics...</div>;
  }

  const overviewStats = getOverviewStats();
  const doctorSpecs = getDoctorSpecialisations();
  const appointmentTrend = getAppointmentsByMonth();
  const topDiagnoses = getTopDiagnoses();

  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Appointments Calendar */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Appointments Calendar</CardTitle>
          <CardDescription>View appointments by date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                modifiers={{
                  hasAppointments: appointmentDates
                }}
                modifiersStyles={{
                  hasAppointments: { 
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                    fontWeight: 'bold'
                  }
                }}
                className="rounded-md border"
                numberOfMonths={1}
              />
            </div>

            {/* Appointments for selected date */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Appointments for {selectedDate.toLocaleDateString()}
              </h3>
              {appointmentsForSelectedDate.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {appointmentsForSelectedDate.map(appointment => (
                    <div key={appointment.id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">Appointment #{appointment.id}</h4>
                        <span className="text-sm text-gray-500">
                          {new Date(typeof appointment.appointment_date === 'number' 
                            ? appointment.appointment_date * 1000 
                            : appointment.appointment_date
                          ).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>
                          <strong>Patient:</strong> {patients[appointment.patient_id] 
                            ? `${patients[appointment.patient_id].first_name} ${patients[appointment.patient_id].last_name}`
                            : `Patient ID: ${appointment.patient_id}`}
                        </p>
                        <p>
                          <strong>Doctor:</strong> {doctors[appointment.doctor_id] 
                            ? `Dr. ${doctors[appointment.doctor_id].first_name} ${doctors[appointment.doctor_id].last_name}`
                            : `Doctor ID: ${appointment.doctor_id}`}
                        </p>
                        {doctors[appointment.doctor_id]?.specialisation && (
                          <p><strong>Specialisation:</strong> {doctors[appointment.doctor_id].specialisation}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No appointments on this date</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doctor Specialisations Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Doctor Specialisations</CardTitle>
            <CardDescription>Distribution of doctors by specialisation</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Doctors",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={doctorSpecs}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {doctorSpecs.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Appointments Trend Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment Trends</CardTitle>
            <CardDescription>Appointments over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                appointments: {
                  label: "Appointments",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={appointmentTrend}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="appointments" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ fill: '#8884d8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Diagnoses Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top 5 Diagnoses</CardTitle>
            <CardDescription>Most common conditions diagnosed</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Count",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDiagnoses}>
                  <XAxis dataKey="condition" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}