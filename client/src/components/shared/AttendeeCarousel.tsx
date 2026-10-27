import { useEffect, useState } from "react";

import type { User } from "@/types";

import arrowLeft from "@/assets/icons/arrow-left-circle.svg";
import arrowRight from "@/assets/icons/arrow-right-circle.svg";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type AttendeeCarouselProps = {
    attendees: User[];
    isLoading: boolean;
    error: string | null;
};

const getVisibleCount = (): number => {
    if (typeof window === "undefined") return 8;

    if (window.innerWidth >= 1536) return 10;
    if (window.innerWidth >= 1024) return 8;
    if (window.innerWidth >= 768) return 6;
    if (window.innerWidth >= 640) return 4;

    return 3;
};

const AttendeeCarousel = ({
    attendees,
    isLoading,
    error,
}: AttendeeCarouselProps) => {
    const [visibleCount, setVisibleCount] = useState(getVisibleCount);
    const [startIndex, setStartIndex] = useState(0);

    const [hoveredAttendeeId, setHoveredAttendeeId] = useState<number | null>(
        null,
    );
    const [pinnedAttendeeId, setPinnedAttendeeId] = useState<number | null>(null);

    useEffect(() => {
        const updateVisibleCount = () => {
            setVisibleCount(getVisibleCount());
        };

        window.addEventListener("resize", updateVisibleCount);

        return () => {
            window.removeEventListener("resize", updateVisibleCount);
        };
    }, []);

    const maxStartIndex = Math.max(0, attendees.length - visibleCount);

    useEffect(() => {
        setStartIndex((currentIndex) => Math.min(currentIndex, maxStartIndex));
    }, [maxStartIndex]);

    const visibleAttendees = attendees.slice(
        startIndex,
        startIndex + visibleCount,
    );

    const showPrevious = () => {
        setStartIndex((currentIndex) => Math.max(0, currentIndex - 1));
        setPinnedAttendeeId(null);
    };

    const showNext = () => {
        setStartIndex((currentIndex) => Math.min(maxStartIndex, currentIndex + 1));
        setPinnedAttendeeId(null);
    };

    const getDisplayName = (attendee: User) =>
        attendee.name?.trim() || `Teilnehmer #${attendee.id}`;

    return (
        <div className="flex flex-col gap-2">
            <p className="p-medium-16 w-fit self-start rounded-3xl border border-secondary-dark/50 px-5 py-1.5 text-black">
                Teilnehmer ({attendees.length})
            </p>

            {isLoading ? (
                <p className="text-sm text-gray-500">Teilnehmer werden geladen...</p>
            ) : error ? (
                <p className="text-sm text-red-500">{error}</p>
            ) : attendees.length === 0 ? (
                <p className="text-sm text-gray-500">Noch keine Teilnehmer.</p>
            ) : (
                <TooltipProvider>
                    <div className="flex w-full items-center gap-1 pt-1">
                        <button
                            type="button"
                            onClick={showPrevious}
                            disabled={startIndex === 0}
                            aria-label="Vorherige Teilnehmer anzeigen"
                            className="flex size-7 shrink-0 items-center justify-center disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <img
                                src={arrowLeft}
                                alt=""
                                aria-hidden="true"
                                className="size-6"
                            />
                        </button>

                        <div className="grid min-w-0 flex-1 grid-cols-3 items-center gap-x-1 sm:grid-cols-4 sm:gap-x-2 md:grid-cols-6 lg:grid-cols-8 2xl:grid-cols-10">
                            {visibleAttendees.map((attendee) => {
                                const displayName = getDisplayName(attendee);

                                const isTooltipOpen =
                                    pinnedAttendeeId === attendee.id ||
                                    (pinnedAttendeeId === null &&
                                        hoveredAttendeeId === attendee.id);

                                return (
                                    <Tooltip key={attendee.id} open={isTooltipOpen}>
                                        <TooltipTrigger asChild>
                                            <button
                                                type="button"
                                                aria-label={displayName}
                                                aria-expanded={isTooltipOpen}
                                                onClick={() => {
                                                    if (pinnedAttendeeId === attendee.id) {
                                                        setPinnedAttendeeId(null);
                                                        setHoveredAttendeeId(null);
                                                    } else {
                                                        setPinnedAttendeeId(attendee.id);
                                                    }
                                                }}
                                                onMouseEnter={() => {
                                                    setHoveredAttendeeId(attendee.id);
                                                }}
                                                onMouseLeave={() => {
                                                    setHoveredAttendeeId((currentId) =>
                                                        currentId === attendee.id ? null : currentId,
                                                    );
                                                }}
                                                onFocus={() => {
                                                    setHoveredAttendeeId(attendee.id);
                                                }}
                                                onBlur={() => {
                                                    setHoveredAttendeeId((currentId) =>
                                                        currentId === attendee.id ? null : currentId,
                                                    );
                                                }}
                                                className="relative mx-auto flex size-9 items-center justify-center overflow-hidden rounded-full border border-secondary-dark/30 bg-secondary/60 text-xs font-semibold text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            >
                                                {attendee.avatarUrl && (
                                                    <img
                                                        src={attendee.avatarUrl}
                                                        alt=""
                                                        aria-hidden="true"
                                                        onError={(event) => {
                                                            event.currentTarget.style.display = "none";
                                                        }}
                                                        className="absolute inset-0 size-full rounded-full object-cover"
                                                    />
                                                )}
                                            </button>
                                        </TooltipTrigger>

                                        <TooltipContent side="top" sideOffset={6}>
                                            <p>{displayName}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={showNext}
                            disabled={startIndex >= maxStartIndex}
                            aria-label="Weitere Teilnehmer anzeigen"
                            className="flex size-7 shrink-0 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <img
                                src={arrowRight}
                                alt=""
                                aria-hidden="true"
                                className="size-6"
                            />
                        </button>
                    </div>
                </TooltipProvider>
            )}
        </div>
    );
};

export default AttendeeCarousel;
