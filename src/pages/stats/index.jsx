import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axios, { fetchHolidays } from '@/config/api.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export default function StatsIndex() {
  const navigate = useNavigate();
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
  const [holidays, setHolidays] = useState([]);

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

    const loadHolidays = async () => {
      const currentYear = new Date().getFullYear();
      const holidaysData = await fetchHolidays('IE', currentYear);
      const holidayDates = holidaysData.map(holiday => ({
        date: new Date(holiday.date),
        name: holiday.name
      }));
      setHolidays(holidayDates);
    };

    fetchAllData();
    loadHolidays();
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

  // Get holiday for a specific date
  const getHolidayForDate = (date) => {
    return holidays.find(holiday => {
      return holiday.date.toDateString() === date.toDateString();
    });
  };

  // Get just the holiday dates for modifiers
  const getHolidayDates = () => {
    return holidays.map(holiday => holiday.date);
  };

  const appointmentsForSelectedDate = getAppointmentsForDate(selectedDate);
  const appointmentDates = getAppointmentDates();
  const holidayDates = getHolidayDates();
  const holidayForSelectedDate = getHolidayForDate(selectedDate);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading statistics...</div>;
  }

  const overviewStats = getOverviewStats();
  const doctorSpecs = getDoctorSpecialisations();
  const appointmentTrend = getAppointmentsByMonth();

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
            <div className="calendar-container w-fit mb-25">
              <style dangerouslySetInnerHTML={{
                __html: `
                  .calendar-container .has-appointments {
                    position: relative;
                  }
                  .calendar-container .has-appointments::after {
                    content: '●';
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    font-size: 12px;
                    color: #3b82f6;
                    font-weight: bold;
                    z-index: 3;
                    text-shadow: 0 0 2px white;
                  }
                  .calendar-container .is-holiday {
                    position: relative;
                  }
                  .calendar-container .is-holiday::before {
                    content: '🎉';
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    font-size: 10px;
                    z-index: 3;
                  }
                  .calendar-container .rdp-day_selected.has-appointments::after {
                    color: white;
                    text-shadow: 0 0 2px rgba(0,0,0,0.5);
                  }
                  .calendar-container .rdp-day_selected.is-holiday::before {
                    filter: brightness(1.2);
                  }
                `
              }} />
              <div onClick={(e) => e.preventDefault()} className="inline-block">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                    }
                  }}
                  modifiers={{
                    hasAppointments: appointmentDates,
                    isHoliday: holidayDates
                  }}
                  modifiersStyles={{
                    hasAppointments: { 
                      backgroundColor: 'hsl(var(--primary))',
                      color: 'hsl(var(--primary-foreground))',
                      fontWeight: 'bold'
                    },
                    isHoliday: {
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      fontWeight: 'bold'
                    }
                  }}
                  modifiersClassNames={{
                    hasAppointments: 'has-appointments',
                    isHoliday: 'is-holiday'
                  }}
                  className="rounded-md border scale-[1.35] origin-top-left"
                  style={{ transformOrigin: 'top left' }}
                  numberOfMonths={1}
                />
              </div>
            </div>

            {/* Appointments for selected date */}
            <div>
              {/* Holiday information */}
              {holidayForSelectedDate && (
                <Card className="mb-4 bg-amber-50 border-amber-200">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎉</span>
                      <div>
                        <p className="font-medium text-amber-800">Holiday</p>
                        <p className="text-sm text-amber-700">{holidayForSelectedDate.name}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {appointmentsForSelectedDate.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {appointmentsForSelectedDate.map(appointment => (
                    <Card 
                      key={appointment.id} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/appointments/${appointment.id}`)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">Appointment #{appointment.id}</CardTitle>
                          <span className="text-sm text-muted-foreground">
                            {new Date(typeof appointment.appointment_date === 'number' 
                              ? appointment.appointment_date * 1000 
                              : appointment.appointment_date
                            ).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-sm text-muted-foreground space-y-1">
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No appointments on this date</p>
                  </CardContent>
                </Card>
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


      </div>
    </div>
  );
}