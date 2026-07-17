import { Fragment } from "react"
import type { getTranslations } from "next-intl/server"
import { Link } from "@/shared/i18n"
import { REQUEST_STATUS_OPTIONS } from "../config"
import type {
  AdminRequestContact,
  AdminRequestDetail,
  RequestStatus,
  UpdateRequestStatusResult,
} from "../types"
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

/**
 * A directly actionable link for the methods that have one. Instagram/Telegram deep links are
 * deliberately omitted: the stored value is a handle, and guessing a profile URL from it would
 * be a fabricated destination — the artist copies it into the app they already use.
 */
function contactActionHref(contact: AdminRequestContact): string | null {
  switch (contact.method) {
    case "email":
      return `mailto:${contact.value}`
    case "phone":
      return `tel:${contact.value}`
    case "whatsapp":
      // wa.me wants the E.164 digits without the leading "+".
      return `https://wa.me/${contact.value.replace(/^\+/, "")}`
    default:
      return null
  }
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

  const imageGroups = [
    { title: t("artistWorkImagesTitle"), files: request.files.filter((f) => f.type === "artist_work") },
    { title: t("inspirationImagesTitle"), files: request.files.filter((f) => f.type === "inspiration") },
    {
      title: t("placementPhotoImagesTitle"),
      files: request.files.filter((f) => f.type === "placement_photo"),
    },
  ]

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
        {/* Quick actions for the methods that can be acted on directly. Rendered from the
            provided contacts only — an absent method takes no space. */}
        <div className="mt-2 flex flex-wrap gap-3">
          {request.contacts.map((contact) => {
            const href = contactActionHref(contact)
            if (!href) return null
            return (
              <a
                key={contact.method}
                href={href}
                className="inline-flex min-h-11 items-center rounded-md border border-border px-3 text-sm font-medium text-foreground hover:bg-muted"
              >
                {t.has(`contactAction.${contact.method}`)
                  ? t(`contactAction.${contact.method}`)
                  : contact.method}
              </a>
            )
          })}
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

      {/* Only the provided method(s) are listed — method-agnostic by construction, so a future
          method needs no change here (PROJECT_DECISIONS.md — "Stage 6 Contact Model"). */}
      {request.contacts.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-foreground">{t("contactDetailsTitle")}</h2>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {request.contacts.map((contact) => (
              <Fragment key={contact.method}>
                <dt className="text-muted-foreground">
                  {t.has(`contactMethodLabel.${contact.method}`)
                    ? t(`contactMethodLabel.${contact.method}`)
                    : contact.method}
                </dt>
                <dd className="text-foreground">{contact.value}</dd>
              </Fragment>
            ))}
          </dl>
        </section>
      )}

      <div className="mt-6">
        <RequestImageViewer
          groups={imageGroups}
          unavailableLabel={t("imageUnavailable")}
          closeLabel={t("imageViewerClose")}
        />
      </div>

      <footer className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground">
        <p>
          {t("createdAtLabel")}: {formatCreatedAt(request.createdAt, locale)}
        </p>
        <p className="mt-1">
          {/* The visitor now affirms ELIGIBILITY (18+/for-self), not policy consent — the value
              still persists in the legacy `consent` column, only the wording changes. */}
          {request.consent ? t("eligibilityConfirmedLabel") : t("eligibilityNotConfirmedLabel")}
        </p>
      </footer>
    </main>
  )
}
