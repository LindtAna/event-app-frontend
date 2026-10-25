import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"

import { useAuth } from "@/hooks/useAuth"

import type { Invitation } from "@/types"
import { createInvitation, getInvitations, revokeInvitation } from "@/api/invitations"

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
): string => {
    const date = parseBackendDate(value)

    if (!date) return "-"

    return new Intl.DateTimeFormat("de-DE", {
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

const getErrorMessage = (
    error: unknown,
    fallback: string,
): string => {
    if (!(error instanceof Error)) return fallback

    const knownMessages: Record<string, string> = {
        "Failed to create invitation":
            "Die Einladung konnte nicht erstellt werden.",
        "Failed to fetch invitations":
            "Die Einladungen konnten nicht geladen werden.",
        "Failed to revoke invitation":
            "Die Einladung konnte nicht widerrufen werden.",
        "Invitation not found or no longer active":
            "Die Einladung ist nicht mehr aktiv oder kann nicht mehr widerrufen werden.",
        "expiresAt must be a valid RFC3339 timestamp":
            "Der Ablaufzeitpunkt der Einladung ist ungültig.",
        "expiresAt must be in the future":
            "Der Ablaufzeitpunkt muss in der Zukunft liegen.",
    }

    return knownMessages[error.message] ?? fallback
}

const InvitationPage = () => {
    const {
        user,
        accessToken,
        isSignedIn,
        isLoading: isAuthLoading,
    } = useAuth()

    const [invitations, setInvitations] = useState<Invitation[]>([])
    const [isLoadingInvitations, setIsLoadingInvitations] = useState(true)

    const [invitationCode, setInvitationCode] = useState("")
    const [hasCopiedCode, setHasCopiedCode] = useState(false)

    const [isCreating, setIsCreating] = useState(false)
    const [revokingId, setRevokingId] = useState<number | null>(null)

    const [listError, setListError] = useState<string | null>(null)
    const [actionError, setActionError] = useState<string | null>(null)
    const [statusMessage, setStatusMessage] = useState<string | null>(null)

    // Einladungen des authentifizierten Owner laden
    useEffect(() => {
        if (isAuthLoading) return

        if (!isSignedIn || user?.role !== "owner") {
            setIsLoadingInvitations(false)
            return
        }

        if (!accessToken) {
            setListError(
                "Deine Sitzung ist nicht mehr gültig. Bitte melde dich erneut an.",
            )
            setIsLoadingInvitations(false)
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
                }
            } catch (error) {
                if (!cancelled) {
                    setListError(
                        getErrorMessage(
                            error,
                            "Die Einladungen konnten nicht geladen werden.",
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
        accessToken,
    ])

    const handleCreateInvitation = async () => {
        if (!accessToken) {
            setActionError(
                "Deine Sitzung ist nicht mehr gültig. Bitte melde dich erneut an.",
            )
            return
        }

        // Das rohe Token kann später nicht erneut vom Backend abgerufen werden
        // Vor dem Ersetzen eines noch nicht kopierten Codes warnen
        if (invitationCode && !hasCopiedCode) {
            const confirmed = window.confirm(
                "Der aktuell angezeigte Einladungscode wurde noch nicht kopiert. " +
                "Beim Fortfahren wird er ersetzt und kann nicht erneut abgerufen werden. " +
                "Hast du den Code bereits gesichert?",
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
                `Die Einladung wurde erstellt. Sie ist ${INVITATION_VALIDITY_DAYS} Tage gültig.`,
            )
        } catch (error) {
            setActionError(
                getErrorMessage(
                    error,
                    "Beim Erstellen der Einladung ist ein Fehler aufgetreten.",
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
            setStatusMessage(
                "Der Einladungscode wurde in die Zwischenablage kopiert.",
            )
        } catch {
            setActionError(
                "Das automatische Kopieren ist fehlgeschlagen. Bitte versuche es erneut. Falls das Problem weiterhin besteht, kannst du den Einladungscode manuell kopieren.",
            )
        }
    }

    const handleRevokeInvitation = async (
        invitation: Invitation,
    ) => {
        if (!accessToken) {
            setActionError(
                "Deine Sitzung ist nicht mehr gültig. Bitte melde dich erneut an.",
            )
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

            setStatusMessage("Die Einladung wurde widerrufen.")
        } catch (error) {
            setActionError(
                getErrorMessage(
                    error,
                    "Beim Widerrufen der Einladung ist ein Fehler aufgetreten.",
                ),
            )
        } finally {
            setRevokingId(null)
        }
    }

    if (isAuthLoading) {
        return (
            <section className="wrapper my-8">
                <p className="text-grey-500">Wird geladen...</p>
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
            <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
                <h3 className="text-[28px] font-bold leading-tight md:text-[34px] lg:text-[48px] text-center">
                    Einladung erstellen
                </h3>
            </section>

            <div className="wrapper my-8 flex flex-col gap-12">
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
                                ? "Wird erstellt..."
                                : "Einladung erstellen"}
                        </Button>

                        <div className="flex w-full min-w-0 items-center gap-1">
                            <button
                                type="button"
                                onClick={handleCopyInvitation}
                                disabled={!invitationCode}
                                aria-label="Einladungscode kopieren"
                                title="Einladungscode kopieren"
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
                                placeholder="Einladungscode"
                                aria-label="Generierter Einladungscode"
                                className="input-field min-w-0"
                            />
                        </div>
                    </div>

                    <p className="mt-3 text-sm text-grey-500">
                        Einladungen sind {INVITATION_VALIDITY_DAYS} Tage gültig.
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
                        Meine Einladungen
                    </h4>

                    {listError && (
                        <p role="alert" className="mb-4 text-sm text-red-600">
                            {listError}
                        </p>
                    )}

                    {isLoadingInvitations ? (
                        <p className="text-grey-500">
                            Einladungen werden geladen...
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
                                            Erstellt am
                                        </th>
                                        <th className="whitespace-nowrap py-3 font-semibold text-center">
                                            Läuft ab am
                                        </th>
                                        <th className="whitespace-nowrap py-3 font-semibold text-center">
                                            Verwendet am
                                        </th>
                                        <th className="whitespace-nowrap py-3 font-semibold text-center">
                                            Widerrufen am
                                        </th>
                                        <th className="whitespace-nowrap py-3 font-semibold text-center">
                                            Aktion
                                        </th>
                                        <th className="whitespace-nowrap py-3 font-semibold text-center">
                                            Aktion
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {invitations.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-4 py-8 text-center text-secondary-dark"
                                            >
                                                Es wurden noch keine Einladungen erstellt.
                                            </td>
                                        </tr>
                                    ) : (
                                        invitations.map((invitation) => {
                                            const revocable = canRevoke(invitation)
                                            const isRevoking =
                                                revokingId === invitation.id

                                            return (
                                                <tr
                                                    key={invitation.id}
                                                    className="transition-colors hover:bg-gray-50"
                                                >
                                                    <td className="whitespace-nowrap py-3 text-center">
                                                        {invitation.id}
                                                    </td>

                                                    <td className="whitespace-nowrap py-3 text-center">
                                                        {formatDateTime(invitation.createdAt)}
                                                    </td>

                                                    <td className="whitespace-nowrap py-3 text-center">
                                                        {formatDateTime(invitation.expiresAt)}
                                                    </td>

                                                    <td className="whitespace-nowrap py-3 text-center">
                                                        {formatDateTime(invitation.usedAt)}
                                                    </td>

                                                    <td className="whitespace-nowrap py-3 text-center">
                                                        {formatDateTime(invitation.revokedAt)}
                                                    </td>

                                                    <td className="whitespace-nowrap py-3 text-center">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            className="rounded-lg border-secondary-dark text-secondary-dark hover:bg-red-700 hover:border-red-700"
                                                            disabled={!revocable || isRevoking}
                                                            onClick={() =>
                                                                handleRevokeInvitation(invitation)
                                                            }
                                                        >
                                                            {isRevoking
                                                                ? "Wird widerrufen..."
                                                                : "Widerrufen"}
                                                        </Button>
                                                    </td>
                                                    <td className="whitespace-nowrap py-3 text-center">
                                                       //Platzhalter
                                                       //das Löschen aus der DB muss zunächst im Backend implementiert werden
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            className="rounded-lg border-secondary-dark text-secondary-dark hover:bg-red-700 hover:border-red-700"
                                                            disabled={!revocable || isRevoking}
                                                            onClick={() =>
                                                                handleRevokeInvitation(invitation)
                                                            }
                                                        >
                                                            {isRevoking
                                                                ? "Wird gelöscht..."
                                                                : "Löschen"}
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