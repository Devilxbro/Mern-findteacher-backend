interface SessionFilters {
  teacherId?: string;
  studentId?: string;
  date?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

interface HistoryFilters {
  teacherId?: string;
  studentId?: string;
  limit?: number;
}

interface UpcomingFilters {
  teacherId?: string;
  studentId?: string;
  limit?: number;
}

interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
}
