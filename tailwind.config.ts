import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  			mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace']
  		},
  		colors: {
  			brand: {
  				DEFAULT: 'hsl(var(--brand))',
  				'2': 'hsl(var(--brand-2))',
  				'3': 'hsl(var(--brand-3))',
  				foreground: 'hsl(var(--brand-foreground))'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'caret-blink': {
  				'0%,70%,100%': { opacity: '1' },
  				'20%,50%': { opacity: '0' }
  			},
  			'fade-up': {
  				from: { opacity: '0', transform: 'translateY(16px)', filter: 'blur(6px)' },
  				to: { opacity: '1', transform: 'none', filter: 'none' }
  			},
  			rise: {
  				from: { opacity: '0', transform: 'translateY(110%)' },
  				to: { opacity: '1', transform: 'none' }
  			},
  			// Slow drift for the hero's colour glows.
  			aurora: {
  				'0%,100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
  				'33%': { transform: 'translate3d(6%, -4%, 0) scale(1.08)' },
  				'66%': { transform: 'translate3d(-5%, 5%, 0) scale(0.95)' }
  			},
  			'gradient-x': {
  				'0%,100%': { backgroundPosition: '0% 50%' },
  				'50%': { backgroundPosition: '100% 50%' }
  			},
  			shake: {
  				'0%,100%': { transform: 'translateX(0)' },
  				'20%,60%': { transform: 'translateX(-6px)' },
  				'40%,80%': { transform: 'translateX(6px)' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'caret-blink': 'caret-blink 1.25s ease-out infinite',
  			shake: 'shake 0.4s ease-in-out',
  			// CSS (not JS) so above-the-fold content animates on first paint, before hydration.
  			'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
  			rise: 'rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
  			aurora: 'aurora 18s ease-in-out infinite',
  			'gradient-x': 'gradient-x 8s ease infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
export default config;
