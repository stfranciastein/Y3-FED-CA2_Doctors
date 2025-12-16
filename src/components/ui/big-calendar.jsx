import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { cn } from '@/lib/utils';
import { useState, useCallback } from 'react';

const localizer = momentLocalizer(moment);

// Custom toolbar with today, back, next buttons
const CustomToolbar = ({ label, onNavigate, onView, view }) => {
  const handleToday = useCallback(() => {
    onNavigate('TODAY');
  }, [onNavigate]);

  const handleBack = useCallback(() => {
    onNavigate('PREV');
  }, [onNavigate]);

  const handleNext = useCallback(() => {
    onNavigate('NEXT');
  }, [onNavigate]);

  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button type="button" onClick={handleToday}>
          Today
        </button>
        <button type="button" onClick={handleBack}>
          Back
        </button>
        <button type="button" onClick={handleNext}>
          Next
        </button>
      </span>
      <span className="rbc-toolbar-label">{label}</span>
      <span className="rbc-btn-group">
        <button 
          type="button" 
          onClick={() => onView('month')}
          className={view === 'month' ? 'rbc-active' : ''}
        >
          Month
        </button>
        <button 
          type="button" 
          onClick={() => onView('week')}
          className={view === 'week' ? 'rbc-active' : ''}
        >
          Week
        </button>
        <button 
          type="button" 
          onClick={() => onView('day')}
          className={view === 'day' ? 'rbc-active' : ''}
        >
          Day
        </button>
      </span>
    </div>
  );
};

export function BigCalendar({ events, onSelectEvent, onSelectSlot, className, holidays = [], ...props }) {
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());

  const handleNavigate = useCallback((newDate) => {
    setDate(newDate);
  }, []);

  // Custom day prop getter to style holidays
  const dayPropGetter = useCallback((date) => {
    const isHoliday = holidays.some(holiday => 
      moment(holiday.date).isSame(date, 'day')
    );
    
    if (isHoliday) {
      return {
        className: 'holiday-cell',
        style: {
          backgroundColor: '#0d9488',
        }
      };
    }
    return {};
  }, [holidays]);

  // Custom event style getter for teal color
  const eventStyleGetter = useCallback((event) => {
    return {
      style: {
        backgroundColor: '#0d9488',
        borderColor: '#0d9488',
        color: 'white',
      }
    };
  }, []);

  return (
    <div className={cn("h-[600px] w-full", className)}>
      <style dangerouslySetInnerHTML={{
        __html: `
          .rbc-calendar {
            background-color: hsl(var(--background));
            color: hsl(var(--foreground));
          }
          .rbc-header {
            background-color: hsl(var(--muted));
            color: hsl(var(--foreground));
            border-bottom: 1px solid hsl(var(--border));
            padding: 10px 3px;
          }
          .rbc-off-range {
            color: hsl(var(--muted-foreground));
          }
          .rbc-off-range-bg {
            background-color: hsl(var(--muted) / 0.3);
          }
          .rbc-month-view, .rbc-time-view {
            border: 1px solid hsl(var(--border));
          }
          .rbc-day-bg, .rbc-time-slot {
            border-color: hsl(var(--border));
          }
          .rbc-time-header-content {
            border-left: 1px solid hsl(var(--border));
          }
          .rbc-time-content {
            border-top: 1px solid hsl(var(--border));
          }
          .rbc-event {
            background-color: #0d9488 !important;
            border-color: #0d9488 !important;
          }
          .rbc-event.rbc-selected {
            background-color: #0f766e !important;
          }
          .rbc-today {
            background-color: hsl(var(--accent)) !important;
          }
          .rbc-selected-cell {
            background-color: hsl(var(--accent) / 0.6) !important;
          }
          .rbc-show-more {
            color: #0d9488 !important;
          }
          .rbc-toolbar {
            padding: 10px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
          }
          .rbc-toolbar-label {
            font-weight: bold;
            font-size: 1.1em;
            flex-grow: 1;
            text-align: center;
            color: hsl(var(--foreground));
          }
          .rbc-btn-group button {
            color: hsl(var(--foreground));
            background-color: hsl(var(--background));
            border: 1px solid hsl(var(--border));
            padding: 5px 10px;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .rbc-btn-group button:hover {
            background-color: hsl(var(--muted));
          }
          .rbc-btn-group button.rbc-active {
            background-color: #0d9488;
            color: white;
            border-color: #0d9488;
          }
          .holiday-cell {
            position: relative;
          }
          .holiday-cell::after {
            content: '✕';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 48px;
            color: rgba(255, 255, 255, 0.3);
            font-weight: bold;
            pointer-events: none;
          }
          @media (max-width: 768px) {
            .rbc-toolbar {
              flex-direction: column;
            }
            .rbc-toolbar-label {
              order: -1;
              margin-bottom: 10px;
            }
            .rbc-btn-group {
              width: 100%;
              display: flex;
              justify-content: center;
            }
          }
        `
      }} />
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        selectable
        popup
        view={view}
        onView={setView}
        date={date}
        onNavigate={handleNavigate}
        views={['month', 'week', 'day']}
        dayPropGetter={dayPropGetter}
        eventPropGetter={eventStyleGetter}
        components={{
          toolbar: CustomToolbar
        }}
        {...props}
      />
    </div>
  );
}
