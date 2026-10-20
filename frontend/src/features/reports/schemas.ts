import { z } from 'zod';

export const CLASSIFICATIONS = ['Safe Observation', 'Unsafe Acts', 'Unsafe Conditions'] as const;
export const STOP_WORK_OPTIONS = ['Yes', 'No'] as const;

export const MAX_FILES = 5;
export const MAX_FILE_SIZE_MB = 10;

const required = (label: string) => z.string().trim().min(1, `${label} is required`);

export const observationSchema = z.object({
  location: required('Location'),
  specific_location: z.string().trim().max(255),
  classification: z.enum(CLASSIFICATIONS, {
    errorMap: () => ({ message: 'Choose an observation classification' }),
  }),
  stop_work: z.enum(STOP_WORK_OPTIONS, {
    errorMap: () => ({ message: 'Choose whether to call for stop work' }),
  }),
  observation: required('Observation').pipe(z.string().max(5000)),
  corrective_action: required('Corrective action').pipe(z.string().max(5000)),
  images: z.array(z.instanceof(File)).max(MAX_FILES, `Attach at most ${MAX_FILES} files`),
});

export const visitorReportSchema = observationSchema.extend({
  name: required('Name'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .regex(/^\+?[\d\s-]{7,20}$/, 'Enter a valid phone number'),
  designation: required('Designation'),
  company: required('Company'),
  other_company: z.string().trim().max(255),
});

export type ObservationValues = z.infer<typeof observationSchema>;
export type VisitorReportValues = z.infer<typeof visitorReportSchema>;

export const emptyObservation = {
  location: '',
  specific_location: '',
  classification: undefined,
  stop_work: undefined,
  observation: '',
  corrective_action: '',
  images: [],
} satisfies Partial<Record<keyof ObservationValues, unknown>>;
