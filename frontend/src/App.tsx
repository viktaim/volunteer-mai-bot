import ProfileNode from "./components/ProfileNode";

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
        <h1 className="mb-4 text-xl text-white">Ваш профиль</h1>
        <ProfileNode user={user} />
      </div>
    </main>
  );
}
