import { clsx } from 'clsx';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function Spinner({ size = 'md', className }: SpinnerProps) {
    return (
        <div className={clsx('flex items-center justify-center', className)}>
            <div
                className={clsx(
                    'rounded-full border-2 border-white/10 border-t-red-500 animate-spin',
                    {
                        'w-5 h-5': size === 'sm',
                        'w-10 h-10': size === 'md',
                        'w-16 h-16': size === 'lg',
                    }
                )}
            />
        </div>
    );
}
