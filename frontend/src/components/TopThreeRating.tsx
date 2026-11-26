interface UserData {
    userId: number;
    username: string;
    firstName: string;
    score: number;
    photoUrl: string;
}

interface Props {
    users: UserData[];
}

export default function TopThreeRating({ users }: Props) {
    return (
        <div className="w-full rounded-3xl bg-sec flex flex-row pt-8 text-white px-2 gap-2 justify-center items-end">

            <div className="flex flex-1 min-w-0 flex-col items-center gap-1">
                <h1 className="w-full truncate text-center">
                    {users[2]?.username ?? "Nickname"}
                </h1>
                <div className="h-25 w-full max-w-15 bg-bronze flex items-end justify-center pb-2">
                    <h1 className="text-xl">3</h1>
                </div>
            </div>

            <div className="flex flex-1 min-w-0 flex-col items-center gap-1">
                <h1 className="w-full truncate text-center">
                    {users[0]?.username ?? "Nickname"}
                </h1>
                <div className="h-40 w-full max-w-15 bg-gold flex items-end justify-center pb-2">
                    <h1 className="text-xl">1</h1>
                </div>
            </div>

            <div className="flex flex-1 min-w-0 flex-col items-center gap-1">
                <h1 className="w-full truncate text-center">
                    {users[1]?.username ?? "Nickname"}
                </h1>
                <div className="h-30 w-full max-w-15 bg-silver flex items-end justify-center pb-2">
                    <h1 className="text-xl">2</h1>
                </div>
            </div>

        </div>
    );
}