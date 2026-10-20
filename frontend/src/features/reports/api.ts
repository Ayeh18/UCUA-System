import { apiClient } from '@/lib/api-client';
import type { ReportCreatedResponse } from '@/types/api';

import type { ObservationValues, VisitorReportValues } from './schemas';

function toFormData({ images, ...fields }: ObservationValues | VisitorReportValues): FormData {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => form.append(key, String(value ?? '')));
  images.forEach((file) => form.append('images', file));
  return form;
}

export const reportsApi = {
  submitStaffReport: (values: ObservationValues) =>
    apiClient.post<ReportCreatedResponse>('/reports/staff', toFormData(values)).then((r) => r.data),

  submitVisitorReport: (values: VisitorReportValues) =>
    apiClient
      .post<ReportCreatedResponse>('/reports/visitor', toFormData(values))
      .then((r) => r.data),
};
