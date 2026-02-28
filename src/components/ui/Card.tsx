import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
}

export default function Card({ children, className, hover = true }: CardProps) {
    return (
        <div
            className={clsx(
                'rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm overflow-hidden',
                hover && 'hover:bg-white/[0.06] hover:border-white/[0.1] hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(220,38,38,0.08)] transition-all duration-500',
                className
            )}
        >
            {children}
        </div>
    );
}
