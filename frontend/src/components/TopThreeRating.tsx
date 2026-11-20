


export default function TopThreeRating() {


    return (
        <div className="w-full rounded-3xl bg-sec flex flex-row pt-8 text-white px-2 gap-6 justify-center items-end">

        <div className="flex flex-col items-center gap-1"> 
            <h1>Nickname</h1>
            <div className="h-25 w-15 bg-bronze flex items-end justify-center pb-2">
                <h1 className="text-xl">3</h1>
            </div>
        </div>
        <div className="flex flex-col items-center gap-1"> 
            <h1>Nickname</h1>   
            <div className="h-40 w-15 bg-gold flex items-end justify-center pb-2">
                <h1 className="text-xl">1</h1>
            </div>
        </div>
        <div className="flex flex-col items-center gap-1">
            <h1> Nickname</h1> 
            <div className="h-30 w-15 bg-silver flex items-end justify-center pb-2">
                <h1 className="text-xl">2</h1>
            </div>
        </div>
        </div>
    )
}