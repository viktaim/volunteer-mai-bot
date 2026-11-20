type RatingNodeProps = {
  place?: number;
  nickname?: string;
  avatar?: string;
  score?: number;
};

const APPLE_TROPHY =
  "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f3c6.png";

export default function RatingNode({
  place = 1,
  nickname = "Nickname",
  avatar,
  score = 0,
}: RatingNodeProps) {
  return (
    <div className="flex w-full items-center gap-3 border-y border-sec p-3 text-white">
      {/* Место */}
      <span className="w-8 shrink-0 text-xl font-medium text-pink-100">
        {place}.
      </span>

      {/* Аватар */}
      {avatar ? (
        <img
          src={avatar}
          alt={nickname}
          className="size-9 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="size-9 shrink-0 rounded-full bg-white/30" />
      )}

      {/* Никнейм */}
      <span className="min-w-0 flex-1 truncate text-lg text-pink-100">
        {nickname}
      </span>

      {/* Очки с кубком */}
      <div className="flex shrink-0 items-center gap-1.5 text-xl text-amber-500">
        <img
          src={APPLE_TROPHY}
          alt="🏆"
          className="size-5 select-none"
          draggable={false}
        />
        <span>{score}</span>
      </div>
    </div>
  );
}