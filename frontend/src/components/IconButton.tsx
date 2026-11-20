type IconButtonProps = {
  icon: string;
  onClick?: () => void;
};

export default function IconButton({ icon, onClick }: IconButtonProps) {
  return (
    <button className="cursor-default" onClick={onClick}>
      <img src={icon} alt="" className="h-7 w-7" />
    </button>
  );
}
