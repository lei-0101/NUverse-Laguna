import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Modal, Textarea } from '@/shared/components/ui'
import { reportSchema, type ReportFormValues } from '../schemas'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: ReportFormValues) => void
  isSubmitting: boolean
  serverError?: string
}

/** Modal capturing a report reason for a listing. */
export function ReportModal({ isOpen, onClose, onSubmit, isSubmitting, serverError }: ReportModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportFormValues>({ resolver: zodResolver(reportSchema), defaultValues: { reason: '' } })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report this listing"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="report-form" variant="danger" isLoading={isSubmitting}>
            Submit report
          </Button>
        </div>
      }
    >
      <form id="report-form" onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        {serverError && <Alert variant="error">{serverError}</Alert>}
        <Textarea
          label="Reason"
          placeholder="Tell us what's wrong with this listing"
          rows={4}
          error={errors.reason?.message}
          {...register('reason')}
        />
      </form>
    </Modal>
  )
}
