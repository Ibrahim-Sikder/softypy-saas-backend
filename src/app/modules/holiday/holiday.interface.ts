export interface IHoliday extends Document {
  holidayName: string;
  fromDate: Date;
  toDate: Date;
  totalDays: number;
  status: 'active' | 'inactive' | 'pending';
  description: string;
  applicableEmployees: string[];
  attachments: string;
  createdDate:Date;
}
