import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Bug, Lightbulb, MessageSquareText, Send } from 'lucide-react';
import { Controller, useForm, type DefaultValues } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ChoiceCards, type ChoiceOption } from '@/components/ui/ChoiceCards';
import { FormField } from '@/components/ui/FormField';
import { Textarea } from '@/components/ui/Input';
import { apiClient } from '@/lib/api-client';
import { getErrorMessage } from '@/lib/errors';
import type { MessageResponse } from '@/types/api';

const FEEDBACK_TYPES = ['Suggestion', 'Issue', 'Comment'] as const;

const feedbackSchema = z.object({
  feedback_type: z.enum(FEEDBACK_TYPES, {
    errorMap: () => ({ message: 'Choose a feedback type' }),
  }),
  message: z.string().trim().min(1, 'Please write your feedback').max(5000),
});

type FeedbackValues = z.infer<typeof feedbackSchema>;

const typeOptions: ChoiceOption<FeedbackValues['feedback_type']>[] = [
  {
    value: 'Suggestion',
    label: 'Suggestion',
    description: 'An idea to improve',
    icon: <Lightbulb className="h-5 w-5" />,
    tone: 'amber',
  },
  {
    value: 'Issue',
    label: 'Issue',
    description: 'Something is broken',
    icon: <Bug className="h-5 w-5" />,
    tone: 'red',
  },
  {
    value: 'Comment',
    label: 'Comment',
    description: 'Anything else',
    icon: <MessageSquareText className="h-5 w-5" />,
    tone: 'brand',
  },
];

const emptyFeedback: DefaultValues<FeedbackValues> = { feedback_type: undefined, message: '' };

export default function FeedbackPage() {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeedbackValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: emptyFeedback,
  });

  const submit = useMutation({
    mutationFn: (values: FeedbackValues) =>
      apiClient.post<MessageResponse>('/feedback', values).then((r) => r.data),
    onSuccess: () => {
      toast.success('Thanks! Your feedback has been received.');
      reset(emptyFeedback);
    },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Send feedback"
        description="Help us make e-UCUA better. Your feedback goes directly to the system administrators."
      />
      <Card>
        <CardContent>
          <form
            onSubmit={handleSubmit((values) => submit.mutate(values))}
            className="space-y-6"
            noValidate
          >
            {submit.isError && <Alert tone="error">{getErrorMessage(submit.error)}</Alert>}

            <FormField label="Type" required error={errors.feedback_type?.message}>
              <Controller
                control={control}
                name="feedback_type"
                render={({ field }) => (
                  <ChoiceCards
                    name={field.name}
                    options={typeOptions}
                    value={field.value}
                    onChange={field.onChange}
                    invalid={!!errors.feedback_type}
                  />
                )}
              />
            </FormField>

            <FormField
              label="Your feedback"
              htmlFor="message"
              required
              error={errors.message?.message}
            >
              <Textarea
                id="message"
                rows={6}
                placeholder="Tell us what's on your mind…"
                invalid={!!errors.message}
                {...register('message')}
              />
            </FormField>

            <div className="flex justify-end">
              <Button type="submit" loading={submit.isPending}>
                {!submit.isPending && <Send className="h-4 w-4" />}
                Send feedback
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
