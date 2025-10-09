import { useEffect } from "react";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const categories = [
	{ href: "/jeans", name: "Jeans", imageUrl: "/jeans.jpg" },
	{ href: "/t-shirts", name: "T-shirts", imageUrl: "/tshirts.jpg" },
	{ href: "/shoes", name: "Shoes", imageUrl: "/shoes.jpg" },
	{ href: "/glasses", name: "Glasses", imageUrl: "/glasse.jpg" },
	{ href: "/jackets", name: "Jackets", imageUrl: "/jackets.jpg" },
	{ href: "/suits", name: "Suits", imageUrl: "/suits.jpg" },
	{ href: "/bags", name: "Bags", imageUrl: "/bags.jpg" },
];

const HomePage = () => {
	const { fetchFeaturedProducts, products, isLoading } = useProductStore();

	useEffect(() => {
		fetchFeaturedProducts();
	}, [fetchFeaturedProducts]);

	return (
		<div className='relative min-h-screen text-white overflow-hidden'>
			{/* Hero Section with Background Image */}
			<div className='relative h-[70vh] flex items-center justify-center'>
				<div className='absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/70 z-10'></div>
				<div className='absolute inset-0 bg-[url("/cartimg.jpg")] bg-cover bg-center bg-no-repeat opacity-30'></div>
				
				<div className='relative z-20 text-center px-4 max-w-4xl'>
					<motion.h1 
						className='text-4xl md:text-7xl font-bold text-emerald-400 mb-6'
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
					>
						በሱቃቸን ዞር ዞር ይበሉ
					</motion.h1>
					<motion.p 
						className='text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto'
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
					>
						Discover the latest trends in eco-friendly fashion with premium quality and sustainable materials
					</motion.p>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.4 }}
					>
						<Link to="/collections" className='bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 animate-pulse-slow inline-block'>
							Explore Collection
						</Link>
					</motion.div>
				</div>
				
				{/* Floating elements for visual interest */}
				<div className='absolute top-10 left-10 w-20 h-20 rounded-full bg-emerald-500/20 blur-xl animate-float'></div>
				<div className='absolute bottom-20 right-10 w-32 h-32 rounded-full bg-emerald-400/10 blur-xl animate-float' style={{ animationDelay: '1s' }}></div>
			</div>
			
			<div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.6 }}
				>
					<h2 className='text-3xl md:text-5xl font-bold text-center text-emerald-400 mb-16'>
						Shop by Category
					</h2>
					
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16'>
						{categories.map((category, index) => (
							<motion.div
								key={category.name}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
							>
								<CategoryItem category={category} />
							</motion.div>
						))}
					</div>
				</motion.div>

				{!isLoading && products.length > 0 && <FeaturedProducts featuredProducts={products} />}
			</div>
		</div>
	);
};
export default HomePage;