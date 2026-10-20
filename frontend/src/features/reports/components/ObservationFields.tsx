import {
  CircleCheck,
  Construction,
  Hand,
  MapPin,
  ShieldCheck,
  TriangleAlert,
  Camera,
  ClipboardList,
} from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { ChoiceCards, type ChoiceOption } from '@/components/ui/ChoiceCards';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { FormField } from '@/components/ui/FormField';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { useLocations } from '@/features/lookups/hooks';

import { MAX_FILES, MAX_FILE_SIZE_MB, type ObservationValues } from '../schemas';

const classificationOptions: ChoiceOption<ObservationValues['classification']>[] = [
  {
    value: 'Safe Observation',
    label: 'Safe Observation',
    description: 'Good practice worth recognising',
    icon: <ShieldCheck className="h-5 w-5" />,
    tone: 'emerald',
  },
  {
    value: 'Unsafe Acts',
    label: 'Unsafe Act',
    description: 'Someone working in an unsafe way',
    icon: <TriangleAlert className="h-5 w-5" />,
    tone: 'amber',
  },
  {
    value: 'Unsafe Conditions',
    label: 'Unsafe Condition',
    description: 'A hazard in the workplace or equipment',
    icon: <Construction className="h-5 w-5" />,
    tone: 'red',
  },
];

const stopWorkOptions: ChoiceOption<ObservationValues['stop_work']>[] = [
  {
    value: 'Yes',
    label: 'Yes, stop work',
    description: 'Danger to life or property',
    icon: <Hand className="h-5 w-5" />,
    tone: 'red',
  },
  {
    value: 'No',
    label: 'No',
    description: 'Work can continue safely',
    icon: <CircleCheck className="h-5 w-5" />,
    tone: 'slate',
  },
];

/** Location, observation and evidence sections shared by the staff and visitor report forms. */
export function ObservationFields() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ObservationValues>();
  const locations = useLocations();

  return (
    <>
      <Card>
        <CardHeader
          icon={<MapPin className="h-4 w-4" />}
          title="Location"
          description="Where did you see it?"
        />
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Area"
            htmlFor="location"
            required
            error={
              errors.location?.message ??
              (locations.isError ? 'Could not load locations. Refresh to retry.' : undefined)
            }
          >
            <Select
              id="location"
              options={locations.data ?? []}
              placeholder={locations.isLoading ? 'Loading locations…' : 'Select an area'}
              disabled={locations.isLoading}
              invalid={!!errors.location}
              {...register('location')}
            />
          </FormField>
          <FormField label="Specific location" htmlFor="specific_location" optional>
            <Input
              id="specific_location"
              placeholder="e.g. Berth 3, near crane 2"
              {...register('specific_location')}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          icon={<ClipboardList className="h-4 w-4" />}
          title="Observation"
          description="Tell us what happened and what you did about it."
        />
        <CardContent className="space-y-6">
          <FormField label="Classification" required error={errors.classification?.message}>
            <Controller
              control={control}
              name="classification"
              render={({ field }) => (
                <ChoiceCards
                  name={field.name}
                  options={classificationOptions}
                  value={field.value}
                  onChange={field.onChange}
                  invalid={!!errors.classification}
                />
              )}
            />
          </FormField>

          <FormField label="Call for stop work?" required error={errors.stop_work?.message}>
            <Controller
              control={control}
              name="stop_work"
              render={({ field }) => (
                <ChoiceCards
                  name={field.name}
                  columns={2}
                  options={stopWorkOptions}
                  value={field.value}
                  onChange={field.onChange}
                  invalid={!!errors.stop_work}
                />
              )}
            />
          </FormField>

          <FormField
            label="Describe your observation"
            htmlFor="observation"
            required
            error={errors.observation?.message}
          >
            <Textarea
              id="observation"
              placeholder="What did you see? Who or what was involved?"
              invalid={!!errors.observation}
              {...register('observation')}
            />
          </FormField>

          <FormField
            label="Immediate corrective action"
            htmlFor="corrective_action"
            required
            error={errors.corrective_action?.message}
          >
            <Textarea
              id="corrective_action"
              placeholder="What action did you take on the spot?"
              invalid={!!errors.corrective_action}
              {...register('corrective_action')}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          icon={<Camera className="h-4 w-4" />}
          title="Evidence"
          description="Photos help the QHSE team act faster (optional)."
        />
        <CardContent>
          <Controller
            control={control}
            name="images"
            render={({ field }) => (
              <FileDropzone
                value={field.value}
                onChange={field.onChange}
                maxFiles={MAX_FILES}
                maxSizeMb={MAX_FILE_SIZE_MB}
                error={errors.images?.message}
              />
            )}
          />
        </CardContent>
      </Card>
    </>
  );
}
