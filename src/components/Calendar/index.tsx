import { parseJSON, isSameDay, format } from "date-fns";
import React, { useEffect, useState } from "react";
import { Calendar } from "react-date-range";

type DateProps = {
  data: any;
  onHandle: (date: Date) => void;
  isMobile: boolean;
  isDesktop: boolean;
  isTablet: boolean;
};

const DateComponent: React.FC<DateProps> = ({
  data,
  onHandle,
  isDesktop,
  isMobile,
  isTablet,
}) => {
  const [isDays, setIsDays] = useState<any>([]);

  useEffect(() => {
    if (data) {
      setIsDays(data);
    }
  }, [data]);

  const quotaByDay = (dayToFind: any) => {
    const datar = isDays.find((day: any) =>
      isSameDay(parseJSON(day.date), dayToFind)
    );

    return datar?.remaining_quota;
  };

  function customDayContent(day: any) {
    let comp = null;
    if (quotaByDay(day)) {
      comp = (
        <div className="flex flex-col">
          <span>{format(day, "d")}</span>
          <p className="text-green-600 -mt-5">{quotaByDay(day)}</p>
        </div>
      );
    } else {
      comp = <span>{format(day, "d")}</span>;
    }
    return comp;
  }

  return (
    <Calendar
      months={isDesktop ? 3 : isMobile ? 1 : isTablet ? 2 : 1}
      disabledDates={isDays}
      direction="horizontal"
      dayContentRenderer={customDayContent}
      onChange={onHandle}
    />
  );
};
export default DateComponent;
