import EventNode from "./components/EventNode";
import ProfileNode from "./components/ProfileNode";
import events from "./assets/volunteer_events.json";

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        initData: string;
        initDataUnsafe: {
          user?: {
            first_name?: string;
            username?: string;
            photo_url?: string;
          };
        };
      };
    };
  }
}

export default function App() {
  const tg = window.Telegram?.WebApp;
  const user = tg?.initDataUnsafe.user;

  tg?.ready();
  tg?.expand();

  return (
    <main className="min-h-svh w-full bg-prim font-rubik">
      <div className="mx-auto w-full max-w-md p-8">
        <div className="flex flex-col items-start gap-6">
        <h1 className="text-xl text-white">Ваш профиль</h1>
        <ProfileNode user={user} />

      <div className="w-full ">
        <h1 className="mb-2 text-xl text-white">Ближайшие мероприятия</h1>
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
      </div>
    </main>
  );
}
