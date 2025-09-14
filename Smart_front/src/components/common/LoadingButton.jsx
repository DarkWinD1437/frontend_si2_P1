import LoadingSpinner from './LoadingSpinner';
import PulseLoader from './PulseLoader';

const LoadingButton = ({ 
    children, 
    loading = false, 
    disabled = false,
    variant = "primary",
    size = "md",
    loadingText = "Cargando...",
    loadingType = "spinner",
    className = "",
    ...props 
}) => {
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variantClasses = {
        primary: "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500",
        secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-indigo-500",
        success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
        danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
        warning: "bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-indigo-500"
    };
    
    const sizeClasses = {
        xs: "px-2.5 py-1.5 text-xs",
        sm: "px-3 py-2 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-4 py-2 text-base",
        xl: "px-6 py-3 text-base"
    };

    const isDisabled = disabled || loading;
    const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    const renderLoadingContent = () => {
        if (loadingType === "pulse") {
            return (
                <>
                    <PulseLoader size="xs" count={3} inline className="mr-2" />
                    {loadingText}
                </>
            );
        }
        
        // Default spinner
        return (
            <>
                <LoadingSpinner size="sm" className="mr-2" />
                {loadingText}
            </>
        );
    };

    return (
        <button
            className={buttonClasses}
            disabled={isDisabled}
            {...props}
        >
            {loading ? renderLoadingContent() : children}
        </button>
    );
};

export default LoadingButton;