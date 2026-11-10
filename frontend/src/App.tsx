import { useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import { BottomMenu } from "./components/BottomMenu";

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
    const user = tg?.initDataUnsafe?.user;

    useEffect(() => {
        tg?.ready();
        tg?.expand();
    }, [tg]);

    return (
        <HashRouter>
            <main className="min-h-svh w-full bg-prim font-rubik">
                <div className="mx-auto flex min-h-svh w-full max-w-md flex-col px-8 pt-8">
                    <div className="flex-1">
                        <Routes>
                            <Route path="/" element={<HomePage user={user} />} />
                            <Route path="/game" />
                            <Route path="/rating" />
                        </Routes>
                    </div>

                    <div
                        className="
                            sticky bottom-0 z-50
                            pt-6
                            pb-[max(1.5rem,env(safe-area-inset-bottom))]
                        "
                    >
                        <BottomMenu />
                    </div>
                </div>
            </main>
        </HashRouter>
    );
}