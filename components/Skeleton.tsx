export default function Skeleton({
    className = "",
    variant = "rect" // rect, circle, text
}: {
    className?: string,
    variant?: "rect" | "circle" | "text"
}) {
    const baseClasses = "bg-gray-200 animate-pulse";
    const variantClasses = {
        rect: "rounded-md",
        circle: "rounded-full",
        text: "rounded h-4 w-full"
    };

    return (
        <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}></div>
    );
}
