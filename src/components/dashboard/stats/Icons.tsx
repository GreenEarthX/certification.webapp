import React from "react";
import { FaCheckCircle, FaExclamationCircle, FaClock, FaTimesCircle } from "react-icons/fa";

export const Icons = {
  Active: <FaCheckCircle className="h-6 w-6 text-green-600" />,
  Pending: <FaClock className="h-6 w-6 text-yellow-600" />,
  Expired: <FaExclamationCircle className="h-6 w-6 text-orange-600" />,
  Rejected: <FaTimesCircle className="h-6 w-6 text-red-600" />,
};
