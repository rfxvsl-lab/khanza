import { InputHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: ReactNode;
    error?: string;
}

export default function Input({ label, icon, error, className, ...props }: InputProps) {
    return (
        <div className="space-y-1.5">
            {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
            <div className="relative">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        {icon}
                    </div>
                )}
                <input
                    className={clsx(
                        'w-full px-4 py-3 rounded-xl bg-black/50 border text-white placeholder-gray-500 transition-all duration-300',
                        'focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none',
                        icon ? 'pl-12' : '',
                        error ? 'border-red-500/50' : 'border-white/10 hover:border-white/20',
                        className
                    )}
                    {...props}
                />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
    );
}
