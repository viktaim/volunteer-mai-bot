import TopThreeRating from "../components/TopThreeRating";
import RatingNode from "../components/RatingNode";

export default function RatingPage() {

    return (
        <div className="flex flex-col items-start gap-6">
            <h1 className="text-xl text-white">Таблица рейтинга</h1>
            <TopThreeRating />
        <div className="w-full">
            <RatingNode place={1} nickname="Nickname" score={67} />
            <RatingNode place={2} nickname="покемон" score={15} />
        </div>
        </div>
    )
}