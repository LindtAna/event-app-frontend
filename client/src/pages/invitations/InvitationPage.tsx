import { useCallback, useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { useAuth } from "@/hooks/useAuth"

import type { Invitation } from "@/types"
import { createInvitation, getInvitations, revokeInvitation, deleteInvitation } from "@/api/invitations"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import checkIcon from "@/assets/icons/check.svg"
import copyIcon from "@/assets/icons/copy.svg"

// Vorläufige Vorgabe: Einladungen sind 7 Tage gültig
const INVITATION_VALIDITY_DAYS = 7

// Backend-Zeitstempel ohne Zeitzone werden als UTC interpretiert
// Das Backend speichert die Zeitstempel im UTC-Format
const parseBackendDate = (
    value?: string | null,
): Date | null => {
    if (!value) return null

    const trimmed = value.trim()
    const normalized = trimmed.includes(" ") && !trimmed.includes("T")
        ? trimmed.replace(" ", "T")
        : trimmed

    const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized)
    const date = new Date(
        hasTimezone ? normalized : `${normalized}Z`,
    )

    return Number.isNaN(date.getTime()) ? null : date
}

const formatDateTime = (
    value?: string | null,
    locale: string = "de-DE",
): string => {
    const date = parseBackendDate(value);

    if (!date) return "-";

    return new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date)
}

const isExpired = (invitation: Invitation): boolean => {
    const expiresAt = parseBackendDate(invitation.expiresAt)

    return expiresAt !== null && expiresAt.getTime() <= Date.now()
}

const canRevoke = (invitation: Invitation): boolean => {
    return (
        !invitation.usedAt &&
        !invitation.revokedAt &&
        !isExpired(invitation)
    )
}

const InvitationPage = () => {
    const { t, i18n } = useTranslation()
    const {
        user,
        accessToken,
        isSignedIn,
        isLoading: isAuthLoading,
    } = useAuth()

    const ownerId = user?.id

    const [loadedOwnerId, setLoadedOwnerId] = useState<typeof ownerId>()
    const [invitations, setInvitations] = useState<Invitation[]>([])
    const [isLoadingInvitations, setIsLoadingInvitations] = useState(true)

    const [invitationCode, setInvitationCode] = useState("")
    const [hasCopiedCode, setHasCopiedCode] = useState(false)

    const [isCreating, setIsCreating] = useState(false)
    const [revokingId, setRevokingId] = useState<number | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const [listError, setListError] = useState<string | null>(null)
    const [actionError, setActionError] = useState<string | null>(null)
    const [statusMessage, setStatusMessage] = useState<string | null>(null)

    const isOwner = isSignedIn && user?.role === "owner"

    const isMissingAccessToken =
        !isAuthLoading && isOwner && !accessToken

    const dateLocale = i18n.language.startsWith("en")
        ? "en-US"
        : i18n.language.startsWith("ru")
            ? "ru-RU"
            : "de-DE";

    const hasCurrentOwnerData =
        ownerId !== undefined &&
        !!accessToken &&
        loadedOwnerId === ownerId

    const getErrorMessage = useCallback((
        error: unknown,
        fallback: string,
    ): string => {
        if (!(error instanceof Error)) return fallback

        const knownMessages: Record<string, () => string> = {
            "Failed to create invitation": () =>
                t("invitationPage.errors.create"),

            "Failed to fetch invitations": () =>
                t("invitationPage.errors.load"),

            "Failed to revoke invitation": () =>
                t("invitationPage.errors.revoke"),

            "Invitation not found or no longer active": () =>
                t("invitationPage.errors.notActive"),

            "expiresAt must be a valid RFC3339 timestamp": () =>
                t("invitationPage.errors.invalidExpiration"),

            "expiresAt must be in the future": () =>
                t("invitationPage.errors.expirationInPast"),

            "Failed to delete invitation": () =>
                t("invitationPage.errors.delete"),

            "Invitation not found": () =>
                t("invitationPage.errors.notFound"),
        };

        return knownMessages[error.message]?.() ?? fallback;
    }, [t]);


    const visibleInvitations = hasCurrentOwnerData
        ? invitations
        : []

    const displayListError = isMissingAccessToken
        ? t("invitationPage.sessionExpired")
        : hasCurrentOwnerData
            ? listError
            : null

    const shouldShowInvitationLoading =
        isOwner &&
        ownerId !== undefined &&
        !!accessToken &&
        (!hasCurrentOwnerData || isLoadingInvitations)

    // Einladungen des authentifizierten Owner laden
    useEffect(() => {
        if (
            isAuthLoading ||
            !isSignedIn ||
            user?.role !== "owner" ||
            ownerId === undefined ||
            !accessToken
        ) {
            return
        }

        let cancelled = false

        const loadInvitations = async () => {
            setIsLoadingInvitations(true)
            setListError(null)

            try {
                const data = await getInvitations(accessToken)

                if (!cancelled) {
                    setInvitations(data)
                    setLoadedOwnerId(ownerId)
                }
            } catch (error) {
                if (!cancelled) {
                    setInvitations([])
                    setLoadedOwnerId(ownerId)

                    setListError(
                        getErrorMessage(
                            error,
                            t("invitationPage.errors.load"),
                        ),
                    )
                }
            } finally {
                if (!cancelled) {
                    setIsLoadingInvitations(false)
                }
            }
        }

        void loadInvitations()

        return () => {
            cancelled = true
        }
    }, [
        isAuthLoading,
        isSignedIn,
        user?.role,
        ownerId,
        accessToken,
        getErrorMessage,
        t,
    ])

    const handleCreateInvitation = async () => {
        if (!accessToken) {
            setActionError(
                t("invitationPage.sessionExpired")
            )
            return
        }

        // Das rohe Token kann später nicht erneut vom Backend abgerufen werden
        // Vor dem Ersetzen eines noch nicht kopierten Codes warnen
        if (invitationCode && !hasCopiedCode) {
            const confirmed = window.confirm(
                t("invitationPage.confirmReplaceCode")
            )

            if (!confirmed) return
        }

        setIsCreating(true)
        setActionError(null)
        setStatusMessage(null)

        try {
            const expiresAt = new Date(
                Date.now() +
                INVITATION_VALIDITY_DAYS * 24 * 60 * 60 * 1000,
            ).toISOString()

            const result = await createInvitation(
                expiresAt,
                accessToken,
            )
            setInvitationCode(result.invitationCode)
            setHasCopiedCode(false)

            // Neue Einladungen werden oben einsortiert
            setInvitations((current) => [
                result.invitation,
                ...current.filter(
                    (item) => item.id !== result.invitation.id,
                ),
            ])

            setStatusMessage(
                t("invitationPage.invitationCreated", {
                    days: INVITATION_VALIDITY_DAYS,
                }),
            );
        } catch (error) {
            setActionError(
                getErrorMessage(
                    error,
                    t("invitationPage.errors.createFallback"),
                ),
            )
        } finally {
            setIsCreating(false)
        }
    }

    const handleCopyInvitation = async () => {
        if (!invitationCode) return

        setActionError(null)
        setStatusMessage(null)

        try {
            await navigator.clipboard.writeText(invitationCode)
            setHasCopiedCode(true)
            setStatusMessage(t("invitationPage.codeCopied"))
        } catch {
            setActionError(t("invitationPage.copyFailed"))
        }
    }

    const handleRevokeInvitation = async (
        invitation: Invitation,
    ) => {
        if (!accessToken) {
            setActionError(t("invitationPage.sessionExpired"))
            return
        }

        if (!canRevoke(invitation)) return

        setRevokingId(invitation.id)
        setActionError(null)
        setStatusMessage(null)

        try {
            await revokeInvitation(invitation.id, accessToken)

            // DELETE liefert 204 ohne Response-Body
            // Der Zeitstempel wird anschließend lokal aktualisiert
            setInvitations((current) =>
                current.map((item) =>
                    item.id === invitation.id
                        ? {
                            ...item,
                            revokedAt: new Date().toISOString(),
                        }
                        : item,
                ),
            )

            setStatusMessage(t("invitationPage.revoked"))
        } catch (error) {
            setActionError(
                getErrorMessage(
                    error,
                    t("invitationPage.errors.revokeFallback"),
                ),
            )
        } finally {
            setRevokingId(null)
        }
    }

    const handleDeleteInvitation = async (
        invitation: Invitation,
    ) => {
        if (!accessToken) {
            setActionError(t("invitationPage.sessionExpired"));
            return
        }

        const confirmed = window.confirm(t("invitationPage.confirmDelete"))

        if (!confirmed) return

        setDeletingId(invitation.id)
        setActionError(null)
        setStatusMessage(null)

        try {
            await deleteInvitation(invitation.id, accessToken)
            // Die Einladung nach erfolgreicher Löschung aus der Liste entfernen.
            setInvitations((current) =>
                current.filter((item) => item.id !== invitation.id),
            )
            setStatusMessage(t("invitationPage.deleted"))
        } catch (error) {
            setActionError(
                getErrorMessage(
                    error,
                    t("invitationPage.errors.deleteFallback"),
                ),
            )
        } finally {
            setDeletingId(null)
        }
    }

    if (isAuthLoading) {
        return (
            <section className="wrapper my-8">
                <p className="text-grey-500">
                    {t("invitationPage.loading")}
                </p>
            </section>
        )
    }

    // Zusätzliche Navigation-Sperre im Frontend
    // Die eigentliche Berechtigungsprüfung erfolgt im Backend
    if (!isSignedIn || user?.role !== "owner") {
        return <Navigate to="/" replace />
    }

    return (
        <>
            <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-3 md:py-4">
                <h3 className="text-[24px] font-bold leading-tight md:text-[30px] lg:text-[36px] text-center">
                    {t("invitationPage.title")}
                </h3>
            </section>

            <div className="wrapper my-2 flex flex-col gap-12">
                {/* Einladung erstellen */}
                <section>
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-9">
                        <Button
                            type="button"
                            size="lg"
                            className="w-full sm:w-fit shrink-0"
                            onClick={handleCreateInvitation}
                            disabled={isCreating}
                        >
                            {isCreating
                                ? t("invitationPage.generating")
                                : t("invitationPage.generate")}
                        </Button>

                        <div className="flex w-full min-w-0 items-center gap-1">
                            <button
                                type="button"
                                onClick={handleCopyInvitation}
                                disabled={!invitationCode}
                                aria-label={t("invitationPage.copyCode")}
                                title={t("invitationPage.copyCode")}
                                className="flex size-12 shrink-0 items-center justify-center rounded-lg  bg-white transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {hasCopiedCode ? (
                                    <img
                                        src={checkIcon}
                                        alt=""
                                        aria-hidden="true"
                                        className="size-5 object-contain"
                                    />
                                ) : (
                                    <img
                                        src={copyIcon}
                                        alt=""
                                        aria-hidden="true"
                                        className="size-5 object-contain"
                                    />
                                )}
                            </button>

                            <Input
                                value={invitationCode}
                                readOnly
                                placeholder={t("invitationPage.codePlaceholder")}
                                aria-label={t("invitationPage.generatedCode")}
                                className="input-field min-w-0"
                            />
                        </div>
                    </div>

                    <p className="mt-3 text-sm text-grey-500">
                        {t("invitationPage.validityDescription", {
                            days: INVITATION_VALIDITY_DAYS,
                        })}
                    </p>

                    {actionError && (
                        <p role="alert" className="mt-4 text-sm text-red-600">
                            {actionError}
                        </p>
                    )}

                    {statusMessage && (
                        <p role="status" className="mt-4 text-sm text-green-700">
                            {statusMessage}
                        </p>
                    )}
                </section>


                {/* Liste aller Einladungen */}
                <section>
                    <h4 className="mb-5 text-xl font-semibold md:text-2xl">
                        {t("invitationPage.listTitle")}
                    </h4>

                    {displayListError && (
                        <p role="alert" className="mb-4 text-sm text-red-600">
                            {displayListError}
                        </p>
                    )}

                    {shouldShowInvitationLoading ? (
                        <p className="text-grey-500">
                            {t("invitationPage.loadingInvitations")}
                        </p>
                    ) : (
                        <div className="w-full overflow-x-auto rounded-lg border border-primary-500/20">
                            <table className="w-full min-w-[1000px] lg:min-w-0 lg:table-fixed border-collapse text-center text-sm">
                                <colgroup>
                                    <col className="w-[6%]" />
                                    <col className="w-[17%]" />
                                    <col className="w-[17%]" />
                                    <col className="w-[17%]" />
                                    <col className="w-[17%]" />
                                    <col className="w-[13%]" />
                                    <col className="w-[13%]" />
                                </colgroup>
                                <thead className="bg-primary-50">
                                    <tr>
                                        <th className="whitespace-nowrap py-3 font-semibold text-center">
                                            ID
                                        </th>
                                        <th className="whitespace-nowrap py-3 font-semibold text-center">
                                            {t("invitationPage.createdAt")}
                                        </th>
                                        <th className="whitespace-nowrap py-3 font-semibold text-center">
                                            {t("invitationPage.expiresAt")}
                                        </th>
                                        <th className="whitespace-nowrap py-3 font-semibold text-center">
                                            {t("invitationPage.usedAt")}
                                        </th>
                                        <th className="whitespace-nowrap py-3 font-semibold text-center">
                                            {t("invitationPage.revokedAt")}
                                        </th>
                                        <th className="whitespace-nowrap py-3 font-semibold text-center">
                                            {t("invitationPage.action")}
                                        </th>
                                        <th className="whitespace-nowrap py-3 font-semibold text-center">
                                            {t("invitationPage.action")}
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {visibleInvitations.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-4 py-8 text-center text-secondary-dark"
                                            >
                                                {t("invitationPage.noInvitations")}
                                            </td>
                                        </tr>
                                    ) : (
                                        visibleInvitations.map((invitation) => {
                                            const revocable = canRevoke(invitation)
                                            const isRevoking = revokingId === invitation.id
                                            const isDeleting = deletingId === invitation.id
                                            return (
                                                <tr
                                                    key={invitation.id}
                                                    className="transition-colors hover:bg-gray-50"
                                                >
                                                    <td className="whitespace-nowrap py-3 text-center">
                                                        {invitation.id}
                                                    </td>

                                                    <td className="whitespace-nowrap py-3 text-center">
                                                        {formatDateTime(invitation.createdAt, dateLocale)}
                                                    </td>

                                                    <td className="whitespace-nowrap py-3 text-center">
                                                        {formatDateTime(invitation.expiresAt, dateLocale)}
                                                    </td>

                                                    <td className="whitespace-nowrap py-3 text-center">
                                                        {formatDateTime(invitation.usedAt, dateLocale)}
                                                    </td>

                                                    <td className="whitespace-nowrap py-3 text-center">
                                                        {formatDateTime(invitation.revokedAt, dateLocale)}
                                                    </td>

                                                    <td className="whitespace-nowrap py-3 text-center">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            className="rounded-lg border-secondary-dark text-secondary-dark hover:bg-red-700 hover:border-red-700"
                                                            disabled={!revocable || isRevoking || isDeleting}
                                                            onClick={() =>
                                                                handleRevokeInvitation(invitation)
                                                            }
                                                        >{isRevoking
                                                            ? t("invitationPage.revoking")
                                                            : t("invitationPage.revoke")}
                                                        </Button>
                                                    </td>

                                                    <td className="whitespace-nowrap py-3 text-center">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            className="rounded-lg border-secondary-dark text-secondary-dark hover:bg-red-700 hover:border-red-700"
                                                            disabled={isDeleting || isRevoking}
                                                            onClick={() => handleDeleteInvitation(invitation)}
                                                        >
                                                            {isDeleting
                                                                ? t("invitationPage.deleting")
                                                                : t("invitationPage.delete")}
                                                        </Button>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </>
    )
}

export default InvitationPage