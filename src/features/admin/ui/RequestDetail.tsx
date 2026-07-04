import type { getTranslations } from "next-intl/server"
import { Link } from "@/shared/i18n"
import { REQUEST_STATUS_OPTIONS } from "../config"
import type { AdminRequestDetail, RequestStatus, UpdateRequestStatusResult } from "../types"
import { RequestImageViewer } from "./RequestImageViewer"
import { RequestStatusForm } from "./RequestStatusForm"

type RequestDetailProps = {
  request: AdminRequestDetail
  locale: string
  t: Awaited<ReturnType<typeof getTranslations>>
  updateStatusAction: (
    prev: UpdateRequestStatusResult | null,
    formData: FormData,
  ) => Promise<UpdateRequestStatusResult>
}

function formatCreatedAt(isoDate: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoDate))
}

export function RequestDetail({ request, locale, t, updateStatusAction }: RequestDetailProps) {
  const statusLabel = t.has(`statuses.${request.status}`)
    ? t(`statuses.${request.status}`)
    : request.status
  const statusOptionLabels = REQUEST_STATUS_OPTIONS.reduce(
    (acc, option) => {
      acc[option] = t.has(`statuses.${option}`) ? t(`statuses.${option}`) : option
      return acc
    },
    {} as Record<RequestStatus, string>,
  )
  const placementLabel = t.has(`placementLabels.${request.placement}`)
    ? t(`placementLabels.${request.placement}`)
    : request.placement
  const sizeLabel = t.has(`sizeLabels.${request.size}`)
    ? t(`sizeLabels.${request.size}`)
    : request.size
  const colorLabel = t.has(`colorLabels.${request.color}`)
    ? t(`colorLabels.${request.color}`)
    : request.color

  const referenceFiles = request.files.filter((file) => file.type === "reference")
  const placementFiles = request.files.filter((file) => file.type === "placement")

  return (
    <main>
      <Link
        href="/admin/requests"
        className="inline-flex min-h-11 items-center text-sm font-medium text-foreground hover:underline"
      >
        &larr; {t("backToRequests")}
      </Link>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-semibold text-foreground">{request.referenceCode}</h1>
          <span className="rounded-full border border-border px-2 py-0.5 text-xs font-medium">
            {statusLabel}
          </span>
        </div>
        <RequestStatusForm
          currentStatus={request.status}
          action={updateStatusAction}
          statusLabel={t("requestStatusLabel")}
          statusOptionLabels={statusOptionLabels}
          submitLabel={t("requestStatusUpdateButton")}
          submitLabelPending={t("requestStatusUpdateButtonLoading")}
          successMessage={t("requestStatusUpdateSuccess")}
        />
      </div>

      <section className="mt-4">
        <p className="text-base font-semibold text-foreground">{request.clientName}</p>
        <div className="mt-2 flex flex-wrap gap-3">
          {request.email && (
            <a
              href={`mailto:${request.email}`}
              className="inline-flex min-h-11 items-center rounded-md border border-border px-3 text-sm font-medium text-foreground hover:bg-muted"
            >
              {t("emailAction")}
            </a>
          )}
          {request.phone && (
            <a
              href={`tel:${request.phone}`}
              className="inline-flex min-h-11 items-center rounded-md border border-border px-3 text-sm font-medium text-foreground hover:bg-muted"
            >
              {t("phoneAction")}
            </a>
          )}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-foreground">{t("descriptionLabel")}</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{request.description}</p>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">{t("placementLabel")}</dt>
          <dd className="text-foreground">{placementLabel}</dd>
          <dt className="text-muted-foreground">{t("sizeLabel")}</dt>
          <dd className="text-foreground">{sizeLabel}</dd>
          <dt className="text-muted-foreground">{t("colorLabel")}</dt>
          <dd className="text-foreground">{colorLabel}</dd>
          {request.budget && (
            <>
              <dt className="text-muted-foreground">{t("budgetLabel")}</dt>
              <dd className="text-foreground">{request.budget}</dd>
            </>
          )}
        </dl>
      </section>

      {(request.email || request.phone || request.contactOther) && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-foreground">{t("contactDetailsTitle")}</h2>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {request.email && (
              <>
                <dt className="text-muted-foreground">{t("contactEmailLabel")}</dt>
                <dd className="text-foreground">{request.email}</dd>
              </>
            )}
            {request.phone && (
              <>
                <dt className="text-muted-foreground">{t("contactPhoneLabel")}</dt>
                <dd className="text-foreground">{request.phone}</dd>
              </>
            )}
            {request.contactOther && (
              <>
                <dt className="text-muted-foreground">{t("contactOtherLabel")}</dt>
                <dd className="text-foreground">{request.contactOther}</dd>
              </>
            )}
          </dl>
        </section>
      )}

      <div className="mt-6">
        <RequestImageViewer
          referenceFiles={referenceFiles}
          placementFiles={placementFiles}
          referenceImagesTitle={t("referenceImagesTitle")}
          placementImagesTitle={t("placementImagesTitle")}
          unavailableLabel={t("imageUnavailable")}
          closeLabel={t("imageViewerClose")}
        />
      </div>

      <footer className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground">
        <p>
          {t("createdAtLabel")}: {formatCreatedAt(request.createdAt, locale)}
        </p>
        <p className="mt-1">
          {request.consent ? t("consentGivenLabel") : t("consentNotGivenLabel")}
        </p>
      </footer>
    </main>
  )
}
