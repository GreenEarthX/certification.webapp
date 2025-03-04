import { useState } from "react";
import Calendar, { CalendarProps } from "react-calendar";
import  Card from "../card/CalendarCard";
import "react-calendar/dist/Calendar.css";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import "../../app/styles/MiniCalendar.css";

interface Certification {
  id: number;
  name: string;
  expiryDate: string; // Date in "YYYY-MM-DD" format
}

interface MiniCalendarProps {
  certifications?: Certification[]; // Array of certifications
}

const MiniCalendar = ({ certifications }: MiniCalendarProps) => {
  const [value, setValue] = useState<Date | [Date, Date] | null>(new Date());

  const handleChange: CalendarProps["onChange"] = (newValue) => {
    if (newValue instanceof Date || Array.isArray(newValue)) {
      setValue(newValue as Date | [Date, Date]);
    }
  };

  // Function to check if a date is an expiry date
  const isExpiryDate = (date: Date) => {
    if (!certifications) return false;

    // Convert the date to a timezone-independent "YYYY-MM-DD" string
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    // Debug: Log the date being checked
    console.log("Checking date:", dateString);

    // Check if this date exists in the expiry dates
    return certifications.some((cert) => {
      console.log("Certification expiry date:", cert.expiryDate);
      return cert.expiryDate === dateString;
    });
  };

  return (
    <div>
      <Card extra="flex w-full h-full flex-col px-3 py-3">
        <Calendar
          onChange={handleChange}
          value={value}
          prevLabel={<MdChevronLeft className="ml-1 h-6 w-6" />}
          nextLabel={<MdChevronRight className="ml-1 h-6 w-6" />}
          view="month"
          tileClassName={({ date }) =>
            isExpiryDate(date) ? "react-calendar__tile--expiry-date" : null
          } 
        />
      </Card>
    </div>
  );
};

export default MiniCalendar;