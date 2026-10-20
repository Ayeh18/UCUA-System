import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '@/components/layout/PageHeader';
import { getErrorMessage } from '@/lib/errors';

import { reportsApi } from '../api';
import { ObservationFields } from '../components/ObservationFields';
import { SubmitBar } from '../components/SubmitBar';
import { emptyObservation, observationSchema, type ObservationValues } from '../schemas';

export default function StaffReportPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const form = useForm<ObservationValues>({
    resolver: zodResolver(observationSchema),
    defaultValues: emptyObservation,
  });

  const submit = useMutation({
    mutationFn: reportsApi.submitStaffReport,
    onSuccess: () => {
      // Refetch now (not on next mount) so the dashboard is already fresh when opened.
      queryClient.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'all' });
      navigate('/report/submitted', { replace: true });
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not submit your report.')),
  });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="UCUA report"
        title="New observation"
        description="Report an unsafe act, an unsafe condition, or a safe practice you observed on site."
      />
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit((values) => submit.mutate(values))}
          className="space-y-6"
          noValidate
        >
          <ObservationFields />
          <SubmitBar loading={submit.isPending} onReset={() => form.reset(emptyObservation)} />
        </form>
      </FormProvider>
    </div>
  );
}
