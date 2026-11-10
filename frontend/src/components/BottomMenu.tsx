import { NavLink } from "react-router-dom";
import Icon from "./Icon";
import userIcon from "../assets/user.svg";
import mediaIcon from "../assets/media.svg";
import trophyIcon from "../assets/trophy.svg";

const menuItems = [
    { title: "Рейтинг", icon: trophyIcon, path: "/rating" },
    { title: "Игра", icon: mediaIcon, path: "/game" },
    { title: "Профиль", icon: userIcon, path: "/" },
];

export function BottomMenu() {
    return (
        <nav
            className="
                w-full grid grid-cols-3 items-stretch gap-1
                rounded-full border border-white/25
                bg-white/10 p-1
                shadow-[0_8px_32px_rgba(0,0,0,0.25)]
                backdrop-blur-2xl backdrop-saturate-150
            "
        >
            {menuItems.map(({ title, icon, path }) => (
                <NavLink
                    key={path}
                    to={path}
                    end={path === "/"}
                    className={({ isActive }) => `
                        flex flex-col items-center justify-center
                        gap-1 rounded-full py-2
                        border transition-all duration-200
                        ${
                            isActive
                                ? "bg-white/25 border-white/30 text-white shadow-[0_0_15px_rgba(255,255,255,0.12)]"
                                : "border-transparent text-white hover:bg-white/10"
                        }
                    `}
                >
                    <Icon size={24} icon={icon} />
                    <span className="text-xs  leading-none">{title}</span>
                </NavLink>
            ))}
        </nav>
    );
}