import { useEffect, useState } from "react";

import TopThreeRating from "../components/TopThreeRating";
import RatingNode from "../components/RatingNode";

interface UserData {
    userId: number;
    username: string;
    firstName: string;
    score: number;
    photoUrl: string;
}


export default function RatingPage() {
    const [data, setData] = useState<UserData[]>([]);

    useEffect(() => {
        fetch("http://localhost:8080/volunteer_users.json", {signal: new AbortController().signal})
            .then((response) => response.json())
            .then((data) => setData(data));
    }, []); 

    const sortedData = [...data].sort((a, b) => b.score - a.score);
    return (
        <div className="flex flex-col items-start gap-6">
            <h1 className="text-xl text-white">Таблица рейтинга</h1>
            <TopThreeRating users={sortedData.slice(0, 3)}/>
            <div className="w-full">
                {sortedData.map((user, index) => (
                    <RatingNode
                        key={user.userId}
                        place={index + 1}
                        nickname={user.username}
                        score={user.score}
                    />
                ))}
            </div>
        </div>
    )
}