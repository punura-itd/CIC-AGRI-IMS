import React, { type InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  id,
  error,
  ...props
}) => {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm text-slate-700 
          focus:outline-none focus:ring-2 focus:border-teal-500 focus:ring-teal-500
          transition-all duration-200
          ${error ? 'border-red-300' : 'border-slate-300'}
          ${props.disabled ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}
        `}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default InputField;