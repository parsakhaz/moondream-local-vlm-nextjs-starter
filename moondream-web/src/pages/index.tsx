import Head from 'next/head';
import ImageUploader from '../components/ImageUploader';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { Button } from '../components/ui/button';

export default function Home() {
	const { ref: headerRef, inView: headerInView } = useInView({ triggerOnce: true });
	const { ref: mainContentRef, inView: mainContentInView } = useInView({ triggerOnce: true });
	const { ref: featuresRef, inView: featuresInView } = useInView({ triggerOnce: true });
	const { ref: footerRef, inView: footerInView } = useInView({ triggerOnce: true });

	const fadeInVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
	};

	const scaleUpVariants = {
		hidden: { scale: 0.95, opacity: 0 },
		visible: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
	};

	return (
		<>
			<Head>
				<title>Moondream - Local Vision Language Model</title>
				<meta name="description" content="Run Moondream locally - A lightweight vision language model for accurate image understanding" />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<link rel='icon' href='/favicon.ico' />
				<link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
				<link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
				<link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
				<link rel='manifest' href='/site.webmanifest' />
				<meta property='og:title' content='Moondream - Local Vision Language Model' />
				<meta property='og:description' content='Run Moondream locally - A lightweight vision language model for accurate image understanding' />
				<meta property='og:type' content='website' />
			</Head>

			<div className='min-h-screen flex flex-col bg-[#0A0A0B]'>
				{/* Header */}
				<motion.header
					ref={headerRef}
					initial='hidden'
					animate={headerInView ? 'visible' : 'hidden'}
					variants={fadeInVariants}
					className='fixed top-0 w-full backdrop-blur-md bg-black/50 z-50 border-b border-[#2E2E2E]'
				>
					<nav className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
						<div className='flex justify-between h-16 items-center'>
							<Link href='/' className='flex items-center space-x-3 group' aria-label='Moondream Home'>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									width='32'
									height='32'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
									className='text-blue-400 group-hover:text-blue-300 transition-colors'
									aria-hidden='true'
								>
									<circle cx='12' cy='12' r='3'></circle>
									<path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z'></path>
								</svg>
								<span className='font-medium text-lg text-white group-hover:text-blue-100 transition-colors'>Moondream</span>
							</Link>

							<div className='flex items-center space-x-6'>
								<a href="https://github.com/vikhyat/moondream" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
									GitHub
								</a>
								<Button className='bg-blue-500 hover:bg-blue-400 text-white font-medium rounded-lg px-4 py-2 transition-all hover:scale-105'>
									Get Started
								</Button>
							</div>
						</div>
					</nav>
				</motion.header>

				{/* Hero Section */}
				<motion.main
					ref={mainContentRef}
					initial='hidden'
					animate={mainContentInView ? 'visible' : 'hidden'}
					variants={fadeInVariants}
					className='flex flex-col items-center justify-center pt-32 px-4 sm:px-6 lg:px-8'
				>
					<div className='max-w-4xl mx-auto text-center'>
						<motion.div variants={scaleUpVariants}>
							<span className='inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30 mb-8'>
								Run 100% Locally
							</span>
							<h1 className='text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight'>
								Local Vision Language Model
								<span className='block mt-2 bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 bg-clip-text text-transparent'>For Everyone</span>
							</h1>
						</motion.div>
						<p className='mt-8 text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed'>
							Experience Moondream - a lightweight yet powerful vision language model that runs entirely on your machine. Built with Next.js frontend and FastAPI backend for seamless local deployment.
						</p>
					</div>

					<motion.div 
						variants={scaleUpVariants}
						className='w-full max-w-3xl mx-auto mt-16 bg-[#121214] backdrop-blur-xl rounded-2xl border border-gray-700 p-8 shadow-2xl hover:border-blue-600/50 transition-colors [&_*]:text-gray-200'
					>
						<ImageUploader />
					</motion.div>
				</motion.main>

				{/* Features */}
				<motion.section
					ref={featuresRef}
					initial='hidden'
					animate={featuresInView ? 'visible' : 'hidden'}
					variants={fadeInVariants}
					className='py-32 px-4 sm:px-6 lg:px-8'
				>
					<div className='max-w-7xl mx-auto'>
						<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
							{[
								{
									title: 'Local Processing',
									description: 'Run the entire vision language model locally with CUDA acceleration support'
								},
								{
									title: 'Privacy First',
									description: 'Your images never leave your machine - perfect for sensitive data analysis'
								},
								{
									title: 'Developer Friendly',
									description: 'Built on Next.js and FastAPI with hot reloading and TypeScript support'
								}
							].map((feature, index) => (
								<motion.div
									key={index}
									variants={scaleUpVariants}
									whileHover={{ scale: 1.02 }}
									className='group bg-[#121214] backdrop-blur-xl p-8 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-colors'
								>
									<h3 className='text-xl font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors'>{feature.title}</h3>
									<p className='text-gray-300 leading-relaxed'>{feature.description}</p>
								</motion.div>
							))}
						</div>
					</div>
				</motion.section>

				{/* Footer */}
				<motion.footer
					ref={footerRef}
					initial='hidden'
					animate={footerInView ? 'visible' : 'hidden'}
					variants={fadeInVariants}
					className='mt-auto border-t border-[#2E2E2E] bg-black/50 backdrop-blur-sm'
				>
					<div className='max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
						<div className='flex flex-col md:flex-row justify-between items-center'>
							<div className='flex items-center space-x-2'>
								<span className='text-gray-400 text-sm'>© {new Date().getFullYear()} Moondream</span>
							</div>
							<div className='flex space-x-8 mt-4 md:mt-0'>
								<a href="#" className='text-gray-400 hover:text-blue-300 transition-colors'>Documentation</a>
								<a href="#" className='text-gray-400 hover:text-blue-300 transition-colors'>GitHub</a>
								<a href="#" className='text-gray-400 hover:text-blue-300 transition-colors'>Contact</a>
							</div>
						</div>
					</div>
				</motion.footer>
			</div>
		</>
	);
}
