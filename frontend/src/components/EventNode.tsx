
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
    const formatted = formatDate(date);

    return (
        <div className="flex w-full items-center justify-between gap-3 border-y border-sec p-3 text-white">
            <div className="flex items-center gap-3">
                <div className="flex min-w-[76px] flex-col items-center justify-center text-center text-sm">
                    <span>{formatted.date}</span>
                    <span className="">{formatted.time}</span>
                </div>

                <h3>{title}</h3>
            </div>

            <div className="shrink-0">
                <IconButton
                    icon={infoIcon}
                    onClick={() => alert(description)}
                />
            </div>
        </div>
    );
}
