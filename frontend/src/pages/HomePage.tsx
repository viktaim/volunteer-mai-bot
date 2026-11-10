import EventNode from "../components/EventNode";
import ProfileNode from "../components/ProfileNode";
import events from "../assets/volunteer_events.json";

export default function HomePage({ user }: { user?: any }) {
    return (
        <div className="flex flex-col items-start gap-6">
            <h1 className="text-xl text-white">Ваш профиль</h1>

            <ProfileNode user={user} />

            <div className="w-full">
                <h1 className="mb-2 text-xl text-white">
                    Ближайшие мероприятия
                </h1>

                {events.map((event, index) => (
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