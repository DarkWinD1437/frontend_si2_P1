import React from 'react';

const CustomSelect = ({ 
    id, 
    name, 
    value, 
    onChange, 
    options = [], 
    required = false,
    disabled = false,
    className = '',
    style = {},
    ...props 
}) => {
    const baseStyle = {
        backgroundColor: 'white',
        color: '#374151',
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: '1px solid #D1D5DB',
        borderRadius: '0.5rem',
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
        transition: 'all 0.2s ease-in-out',
        outline: 'none',
        appearance: 'none',
        backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")",
        backgroundPosition: 'right 0.5rem center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '1.5em 1.5em',
        paddingRight: '2.5rem',
        ...style
    };

    const focusStyle = {
        borderColor: '#3B82F6',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    };

    const hoverStyle = {
        borderColor: '#9CA3AF'
    };

    const handleFocus = (e) => {
        Object.assign(e.target.style, focusStyle);
    };

    const handleBlur = (e) => {
        e.target.style.borderColor = '#D1D5DB';
        e.target.style.boxShadow = 'none';
    };

    const handleMouseEnter = (e) => {
        if (!disabled) {
            e.target.style.borderColor = hoverStyle.borderColor;
        }
    };

    const handleMouseLeave = (e) => {
        if (!disabled) {
            e.target.style.borderColor = '#D1D5DB';
        }
    };

    return (
        <select
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={`w-full ${className}`}
            style={baseStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...props}
        >
            {options.map((option, index) => (
                <option 
                    key={index} 
                    value={option.value}
                    style={{
                        backgroundColor: 'white',
                        color: '#374151',
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem'
                    }}
                >
                    {option.label}
                </option>
            ))}
        </select>
    );
};

export default CustomSelect;