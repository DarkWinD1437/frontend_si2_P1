const PulseLoader = ({ 
    size = "sm", 
    color = "indigo", 
    count = 3, 
    className = "",
    inline = false 
}) => {
    const sizeClasses = {
        xs: "w-1 h-1",
        sm: "w-2 h-2",
        md: "w-3 h-3",
        lg: "w-4 h-4"
    };

    const colorClasses = {
        indigo: "bg-indigo-600",
        blue: "bg-blue-600",
        green: "bg-green-600",
        red: "bg-red-600",
        yellow: "bg-yellow-600",
        gray: "bg-gray-600"
    };

    const containerClasses = inline ? "inline-flex" : "flex justify-center";

    return (
        <div className={`${containerClasses} items-center space-x-1 ${className}`}>
            {[...Array(count)].map((_, index) => (
                <div
                    key={index}
                    className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`}
                    style={{
                        animationDelay: `${index * 0.1}s`,
                        animationDuration: '0.6s'
                    }}
                />
            ))}
        </div>
    );
};

export default PulseLoader;