export default function Icon( {icon, size = 24}: {icon: string, size?: number}) {
    return (
        <img src={icon} alt="" className={`h-${size} w-${size}`} />
    )
}