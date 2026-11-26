import { useState } from "react";
import IconButton from "./IconButton";
import infoIcon from "../assets/info.svg";

function formatDate(date: string) {
    const parsed = new Date(date);

    return {
        date: parsed.toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }),
        time: parsed.toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
        }),
    };
}

export default function EventNode({
    date,
    title,
    description,
}: {
    date: string;
    title: string;
    description: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const formatted = formatDate(date);

    return (
        <>
            <div className="flex w-full items-center justify-between gap-3 border-y border-sec p-3 text-white">

                <div className="flex min-w-0 items-center gap-3">

                    <div className="flex min-w-[76px] shrink-0 flex-col items-center justify-center text-center text-sm">
                        <span>{formatted.date}</span>
                        <span>{formatted.time}</span>
                    </div>

                    <h3 className="min-w-0">{title}</h3>

                </div>

                <div className="flex size-6 shrink-0 items-center justify-center">
                    <IconButton
                        icon={infoIcon}
                        onClick={() => setIsOpen(true)}
                    />
                </div>

            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-3xl bg-sec p-5 text-white shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <h2 className="text-xl font-bold">{title}</h2>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-2xl leading-none text-gray-400"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mb-4 text-sm text-gray-400">
                            {formatted.date} · {formatted.time}
                        </div>

                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                            {description}
                        </p>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="mt-6 w-full rounded-xl bg-white/10 p-3 transition hover:bg-white/20"
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}