import { describe, expect, it } from 'vitest';

import { registerSchema } from '../auth/schemas';
import { observationSchema, visitorReportSchema } from './schemas';

const validObservation = {
  location: 'Jetty 1',
  specific_location: '',
  classification: 'Unsafe Acts',
  stop_work: 'Yes',
  observation: 'Worker without helmet',
  corrective_action: 'Stopped work and briefed the worker',
  images: [],
};

describe('observationSchema', () => {
  it('accepts a complete observation', () => {
    expect(observationSchema.safeParse(validObservation).success).toBe(true);
  });

  it('requires a classification and trims whitespace-only text', () => {
    const result = observationSchema.safeParse({
      ...validObservation,
      classification: undefined,
      observation: '   ',
    });
    expect(result.success).toBe(false);
    const fields = result.error?.issues.map((issue) => issue.path[0]);
    expect(fields).toEqual(expect.arrayContaining(['classification', 'observation']));
  });
});

describe('visitorReportSchema', () => {
  it('validates phone numbers', () => {
    const base = {
      ...validObservation,
      name: 'Ali',
      designation: 'Driver',
      company: 'TBSB',
      other_company: '',
    };
    expect(visitorReportSchema.safeParse({ ...base, phone: '012-345 6789' }).success).toBe(true);
    expect(visitorReportSchema.safeParse({ ...base, phone: 'call me' }).success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('requires matching passwords', () => {
    const result = registerSchema.safeParse({
      staff_id: 'X1',
      name: 'Name',
      designation: 'D',
      department: 'AFE',
      dept_qhse: 'AFE',
      phone: '0123456789',
      email: '',
      password: 'secret1',
      confirm_password: 'secret2',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['confirm_password']);
  });
});
