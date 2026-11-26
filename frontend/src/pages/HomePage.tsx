import { useEffect, useState } from "react";

import EventNode from "../components/EventNode";
import ProfileNode from "../components/ProfileNode";


interface EventData {
    eventId: number;
    date: string;
    title: string;
    description: string;
}

interface TelegramUser {
    id: number;
    username?: string;
    first_name: string;
    last_name?: string;
    photo_url?: string;
}

export default function HomePage({ user }: { user?: TelegramUser }) {
    const [data, setData] = useState<EventData[]>([]);
    useEffect(() => {
        fetch("http://localhost:8080/volunteer_events.json", {signal: new AbortController().signal})
            .then((response) => response.json())
            .then((data) => setData(data))
            .catch((error) => console.error(error));
    }, []);

    return (
        <div className="flex flex-col items-start gap-6">
            <h1 className="text-xl text-white">Ваш профиль</h1>

            <ProfileNode user={user} />

            <div className="w-full">
                <h1 className="mb-2 text-xl text-white">
                    Ближайшие мероприятия
                </h1>

                {data.map((event, index) => (
                    <EventNode
                        key={index}
                        date={event.date}
                        title={event.title}
                        description={event.description}
                    />
                ))}
            </div>
        </div>
    );
}