import IconButton from "./IconButton";
import settingsIcon from "../assets/settings.svg";


type ProfileNodeProps = {
  user?: {
    first_name?: string;
    username?: string;
    photo_url?: string;
  };
};

export default function ProfileNode({ user }: ProfileNodeProps) {
  return (
    <div className="flex w-full items-center gap-3 rounded-4xl bg-sec p-4 text-white">
      <div className="flex w-full items-center gap-3">
      {user?.photo_url ? (
        <img
          src={user.photo_url}
          alt="Аватар"
          className="h-12 w-12 rounded-full object-cover"
        />
      ) : (
        <div className="h-12 w-12 rounded-full bg-gray-600" />
      )}

      <span>
        {user?.username
          ? `@${user.username}`
          : user?.first_name ?? "Никнейм"}
      </span>
      </div>
      <IconButton icon={settingsIcon} onClick={() => {console.log("Кликнуто");}} />
    </div>
  );
}
