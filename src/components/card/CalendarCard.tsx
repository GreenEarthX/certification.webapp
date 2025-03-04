import React from "react";

function CalendarCard(props: {
  variant?: string;
  extra?: string;
  children?: React.ReactNode;
  [x: string]: unknown;  // More specific than `any`
}) {
  const { extra, children, ...rest } = props;
  return (
    <div
      className={`!z-5 relative flex flex-col rounded-[20px] bg-white bg-clip-border shadow-3xl ${
        props.default
          ? "shadow-shadow-500 dark:shadow-none"
          : "shadow-shadow-100 dark:shadow-none"
      } dark:!bg-navy-800 dark:text-white ${extra}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export default CalendarCard;
