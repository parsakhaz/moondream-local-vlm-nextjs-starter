import { useTheme } from 'next-themes';
import { Button } from './ui/button';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Avoid hydration mismatch
	useEffect(() => setMounted(true), []);
	if (!mounted) return null;

	return (
		<Button variant='ghost' size='icon' onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className='rounded-full'>
			<Sun className='h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0' />
			<Moon className='absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100' />
			<span className='sr-only'>Toggle theme</span>
		</Button>
	);
}
