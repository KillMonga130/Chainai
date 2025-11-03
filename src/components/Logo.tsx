interface LogoProps {
  variant?: 'default' | 'white' | 'mono';
  size?: number;
  animated?: boolean;
  className?: string;
}

export function LogoIcon({ variant = 'default', size = 40, animated = false, className = '' }: LogoProps) {
  const fill = variant === 'white' ? '#ffffff' : variant === 'mono' ? 'currentColor' : 'url(#logo-gradient)';
  
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 40 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animated ? 'animate-pulse-glow' : ''}`}
    >
      {/* Top Diamond */}
      <path
        d="M20 0 L30 8 L20 16 L10 8 Z"
        fill={fill}
        opacity={variant === 'default' ? 0.9 : 1}
      />
      
      {/* Middle Diamond (Larger - Emphasis) */}
      <path
        d="M20 16 L32 24 L20 32 L8 24 Z"
        fill={fill}
      />
      
      {/* Bottom Diamond */}
      <path
        d="M20 32 L30 40 L20 48 L10 40 Z"
        fill={fill}
        opacity={variant === 'default' ? 0.9 : 1}
      />

      {/* Gradient Definition */}
      {variant === 'default' && (
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#9333EA" />
          </linearGradient>
        </defs>
      )}
    </svg>
  );
}

export function Logo({ variant = 'default', size = 48, animated = false, className = '' }: LogoProps) {
  const fill = variant === 'white' ? '#ffffff' : variant === 'mono' ? 'currentColor' : 'url(#logo-gradient-full)';
  
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 40 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animated ? 'animate-pulse-glow' : ''}`}
    >
      {/* Top Diamond */}
      <path
        d="M20 0 L30 8 L20 16 L10 8 Z"
        fill={fill}
        opacity={0.85}
      />
      
      {/* Middle Diamond (Larger - Emphasis) */}
      <path
        d="M20 16 L32 24 L20 32 L8 24 Z"
        fill={fill}
      />
      
      {/* Bottom Diamond */}
      <path
        d="M20 32 L30 40 L20 48 L10 40 Z"
        fill={fill}
        opacity={0.85}
      />
      
      {/* Connection Lines (Subtle) */}
      <line x1="20" y1="8" x2="20" y2="16" stroke={fill} strokeWidth="1" opacity="0.3" />
      <line x1="20" y1="32" x2="20" y2="40" stroke={fill} strokeWidth="1" opacity="0.3" />

      {/* Gradient Definition */}
      {variant === 'default' && (
        <defs>
          <linearGradient id="logo-gradient-full" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5">
              {animated && (
                <animate
                  attributeName="stopColor"
                  values="#4F46E5;#9333EA;#4F46E5"
                  dur="3s"
                  repeatCount="indefinite"
                />
              )}
            </stop>
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#9333EA">
              {animated && (
                <animate
                  attributeName="stopColor"
                  values="#9333EA;#4F46E5;#9333EA"
                  dur="3s"
                  repeatCount="indefinite"
                />
              )}
            </stop>
          </linearGradient>
        </defs>
      )}
    </svg>
  );
}

// Horizontal Logo with Text
interface FullLogoProps extends LogoProps {
  layout?: 'horizontal' | 'vertical';
}

export function ChainAILogo({ layout = 'horizontal', variant = 'default', size = 'md', animated = false, className = '' }: Omit<FullLogoProps, 'size'> & { size?: 'sm' | 'md' | 'lg' }) {
  const iconSize = size === 'sm' ? 24 : size === 'md' ? 32 : 48;
  const textSize = size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl';
  const textColor = variant === 'white' ? 'text-white' : variant === 'mono' ? '' : 'gradient-text';
  
  return (
    <div className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-row'} items-center gap-3 ${className}`}>
      <LogoIcon variant={variant} size={iconSize} animated={animated} />
      <span className={`font-bold ${textSize} ${textColor}`}>
        Chain AI
      </span>
    </div>
  );
}

// Wordmark (Text Only)
export function ChainAIWordmark({ variant = 'default', size = 'md', className = '' }: Omit<LogoProps, 'size' | 'animated'> & { size?: 'sm' | 'md' | 'lg' }) {
  const textSize = size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl';
  const textColor = variant === 'white' ? 'text-white' : variant === 'mono' ? '' : 'gradient-text';
  
  return (
    <span className={`font-bold ${textSize} ${textColor} ${className}`}>
      Chain AI
    </span>
  );
}
