import { z } from 'zod';

const MIN_PASSWORD = 6;

const required = (label: string) => z.string().trim().min(1, `${label} is required`);
const newPassword = z
  .string()
  .min(MIN_PASSWORD, `Password must be at least ${MIN_PASSWORD} characters`);
const phone = z
  .string()
  .trim()
  .min(1, 'Phone number is required')
  .regex(/^\+?[\d\s-]{7,20}$/, 'Enter a valid phone number');

export const loginSchema = z.object({
  staff_id: required('Staff ID'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    staff_id: required('Staff ID'),
    name: required('Full name'),
    designation: required('Designation'),
    department: required('Department'),
    dept_qhse: required('QHSE department'),
    phone,
    email: z.union([z.literal(''), z.string().trim().email('Enter a valid email address')]),
    password: newPassword,
    confirm_password: z.string(),
  })
  .refine((v) => v.password === v.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords do not match',
  });

export const resetPasswordSchema = z
  .object({
    staff_id: required('Staff ID'),
    new_password: newPassword,
    confirm_password: z.string(),
  })
  .refine((v) => v.new_password === v.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords do not match',
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
