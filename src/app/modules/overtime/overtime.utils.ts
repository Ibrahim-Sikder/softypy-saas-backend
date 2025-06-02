// export const calculateOvertimeDetails = (entries: { startTime: string; endTime: string; hours?: number }[]) => {
//     if (!entries || entries.length === 0) {
//       throw new Error('At least one overtime entry is required');
//     }

//     const hourlyRate = 20;
//     let totalHours = 0;
//     let estimatedPay = 0;

//     entries.forEach((entry) => {
//       let hours = entry.hours;

//       // If `hours` is not explicitly provided, calculate it from `startTime` and `endTime`
//       if (hours === undefined) {
//         // Validate if both startTime and endTime exist
//         if (!entry.startTime || !entry.endTime) {
//           throw new Error('Both startTime and endTime are required');
//         }

//         // Ensure valid date formats and parse them
//         const start = new Date(`1970-01-01T${entry.startTime}:00Z`);
//         const end = new Date(`1970-01-01T${entry.endTime}:00Z`);

//         // Check for invalid date conversion
//         if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//           throw new Error('Invalid date format for startTime or endTime');
//         }

//         // Ensure endTime is after startTime
//         if (end <= start) {
//           throw new Error('Invalid time range: endTime must be after startTime');
//         }

//         // Calculate the hours from start and end times
//         hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Convert milliseconds to hours
//       }

//       totalHours += hours;
//       estimatedPay += hours * hourlyRate;
//     });

//     // Round totalHours and estimatedPay to the nearest whole number
//     totalHours = Math.round(totalHours);
//     estimatedPay = Math.round(estimatedPay);

//     return { totalHours, estimatedPay };
//   };
export const calculateOvertimeDetails = (
  entries: {
    startTime: string | null;
    endTime: string | null;
    hours?: number;
  }[],
) => {
  if (!entries || entries.length === 0) {
    throw new Error('At least one overtime entry is required');
  }

  const hourlyRate = 20;
  let totalHours = 0;
  let estimatedPay = 0;

  entries.forEach((entry) => {
    let hours = entry.hours;

    // If `hours` is not explicitly provided, calculate it from `startTime` and `endTime`
    if (hours === undefined) {
      // Validate if both startTime and endTime exist and are not null
      if (!entry.startTime || !entry.endTime) {
        throw new Error('Both startTime and endTime are required');
      }

      // Ensure valid date formats and parse them
      const start = new Date(`1970-01-01T${entry.startTime}:00Z`);
      const end = new Date(`1970-01-01T${entry.endTime}:00Z`);

      // Check for invalid date conversion
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date format for startTime or endTime');
      }

      // Ensure endTime is after startTime
      if (end <= start) {
        throw new Error('Invalid time range: endTime must be after startTime');
      }

      // Calculate the hours from start and end times
      hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Convert milliseconds to hours
    }

    totalHours += hours;
    estimatedPay += hours * hourlyRate;
  });

  // Round totalHours and estimatedPay to the nearest whole number
  totalHours = Math.round(totalHours);
  estimatedPay = Math.round(estimatedPay);

  return { totalHours, estimatedPay };
};
