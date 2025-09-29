const LoadingSpinner = ({ size = "md", message = "Cargando...", fullScreen = false, overlay = false }) => {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-8 w-8", 
        lg: "h-12 w-12",
        xl: "h-16 w-16"
    };

    if (fullScreen) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="relative">
                        <div className={`inline-block animate-spin rounded-full ${sizeClasses[size]} border-4 border-indigo-200 border-t-indigo-600`}></div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 to-blue-500 opacity-20 animate-pulse"></div>
                    </div>
                    <p className="mt-4 text-gray-600 font-medium">{message}</p>
                    <div className="mt-2 flex justify-center space-x-1">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (overlay) {
        return (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50 rounded-lg">
                <div className="text-center">
                    <div className={`inline-block animate-spin rounded-full ${sizeClasses[size]} border-4 border-indigo-200 border-t-indigo-600`}></div>
                    <p className="mt-2 text-gray-600 text-sm">{message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-4">
            <div className="text-center">
                <div className={`inline-block animate-spin rounded-full ${sizeClasses[size]} border-4 border-indigo-200 border-t-indigo-600`}></div>
                <p className="mt-2 text-gray-600 text-sm">{message}</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;