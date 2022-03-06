export type AttendancesProps = {
  id: string;
  office_id: string;
  office: string;
  employee: string;
  notes: string;
  admin: string;
  status: string;
  day: string;
  user_avatar: string;
  user_email: string;
  nik: string;
};

export type CalendarTypeProps = {
  id: string;
  office: string;
  date: string;
  quota: number;
};

export type CertificateVaccine = {
  admin: string;
  id: string;
  dosage: number;
  image: string;
  user: string;
  status: string;
};

export type AttendancesDay = {
  id?: string;
  office?: string;
  quota?: number;
  date?: string | Date;
  token?: string | null;
};
