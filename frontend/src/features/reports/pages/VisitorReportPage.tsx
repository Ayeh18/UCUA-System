import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { UserRound } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Input, Select } from '@/components/ui/Input';
import { useCompanies } from '@/features/lookups/hooks';
import { getErrorMessage } from '@/lib/errors';

import { reportsApi } from '../api';
import { ObservationFields } from '../components/ObservationFields';
import { SubmitBar } from '../components/SubmitBar';
import { emptyObservation, visitorReportSchema, type VisitorReportValues } from '../schemas';

const emptyVisitorReport = {
  ...emptyObservation,
  name: '',
  phone: '',
  designation: '',
  company: '',
  other_company: '',
};

export default function VisitorReportPage() {
  const navigate = useNavigate();
  const companies = useCompanies();
  const form = useForm<VisitorReportValues>({
    resolver: zodResolver(visitorReportSchema),
    defaultValues: emptyVisitorReport,
  });
  const {
    register,
    formState: { errors },
  } = form;

  const submit = useMutation({
    mutationFn: reportsApi.submitVisitorReport,
    onSuccess: () => navigate('/visitor/report/submitted', { replace: true }),
    onError: (error) => toast.error(getErrorMessage(error, 'Could not submit your report.')),
  });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Visitor report"
        title="Report an observation"
        description="No account needed. Your report goes straight to the TBSB QHSE team."
      />
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit((values) => submit.mutate(values))}
          className="space-y-6"
          noValidate
        >
          <Card>
            <CardHeader
              icon={<UserRound className="h-4 w-4" />}
              title="Your details"
              description="So we can follow up with you if needed."
            />
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <FormField label="Full name" htmlFor="name" required error={errors.name?.message}>
                <Input
                  id="name"
                  autoComplete="name"
                  invalid={!!errors.name}
                  {...register('name')}
                />
              </FormField>
              <FormField
                label="Phone number"
                htmlFor="phone"
                required
                error={errors.phone?.message}
              >
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="012-345 6789"
                  invalid={!!errors.phone}
                  {...register('phone')}
                />
              </FormField>
              <FormField
                label="Designation"
                htmlFor="designation"
                required
                error={errors.designation?.message}
              >
                <Input
                  id="designation"
                  placeholder="e.g. Lorry driver"
                  invalid={!!errors.designation}
                  {...register('designation')}
                />
              </FormField>
              <FormField
                label="Company"
                htmlFor="company"
                required
                error={
                  errors.company?.message ??
                  (companies.isError ? 'Could not load companies. Refresh to retry.' : undefined)
                }
              >
                <Select
                  id="company"
                  options={companies.data ?? []}
                  placeholder={companies.isLoading ? 'Loading companies…' : 'Select your company'}
                  disabled={companies.isLoading}
                  invalid={!!errors.company}
                  {...register('company')}
                />
              </FormField>
              <FormField
                label="Other company"
                htmlFor="other_company"
                optional
                hint="If your company isn't listed, select the closest option and type the name here."
                className="sm:col-span-2"
              >
                <Input id="other_company" {...register('other_company')} />
              </FormField>
            </CardContent>
          </Card>

          <ObservationFields />
          <SubmitBar loading={submit.isPending} onReset={() => form.reset(emptyVisitorReport)} />
        </form>
      </FormProvider>
    </div>
  );
}
