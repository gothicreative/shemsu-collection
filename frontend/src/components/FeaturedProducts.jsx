import { useEffect, useState } from "react";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { motion } from "framer-motion";

const FeaturedProducts = ({ featuredProducts }) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [itemsPerPage, setItemsPerPage] = useState(4);

	const { addToCart } = useCartStore();

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 640) setItemsPerPage(1);
			else if (window.innerWidth < 1024) setItemsPerPage(2);
			else if (window.innerWidth < 1280) setItemsPerPage(3);
			else setItemsPerPage(4);
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const nextSlide = () => {
		setCurrentIndex((prevIndex) => prevIndex + itemsPerPage);
	};

	const prevSlide = () => {
		setCurrentIndex((prevIndex) => prevIndex - itemsPerPage);
	};

	const isStartDisabled = currentIndex === 0;
	const isEndDisabled = currentIndex >= featuredProducts.length - itemsPerPage;

	return (
		<div className='py-16'>
			<div className='container mx-auto px-4'>
				<motion.h2 
					className='text-center text-4xl md:text-6xl font-bold text-emerald-400 mb-12'
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					Featured Products
				</motion.h2>
				<div className='relative'>
					<div className='overflow-hidden'>
						<div
							className='flex transition-transform duration-500 ease-in-out'
							style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
						>
							{featuredProducts?.map((product, index) => (
								<motion.div 
									key={product._id} 
									className='w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 flex-shrink-0 px-4'
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: index * 0.1 }}
								>
									<motion.div 
										className='bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden h-full transition-all duration-300 hover:shadow-emerald-500/20 border border-emerald-500/30'
										whileHover={{ y: -10, boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.25)" }}
										transition={{ duration: 0.3 }}
									>
										<div className='overflow-hidden'>
											<motion.img
												src={product.image}
												alt={product.name}
												className='w-full h-64 object-cover transition-transform duration-500 ease-in-out'
												whileHover={{ scale: 1.05 }}
											/>
										</div>
										<div className='p-6'>
											<motion.h3 
												className='text-xl font-bold mb-3 text-white'
												whileHover={{ color: "#10B981" }}
												transition={{ duration: 0.2 }}
											>
												{product.name}
											</motion.h3>
											<motion.p 
												className='text-emerald-300 font-semibold text-xl mb-6'
												whileHover={{ scale: 1.05 }}
												transition={{ duration: 0.2 }}
											>
												${product.price.toFixed(2)}
											</motion.p>
											<motion.button
												onClick={() => addToCart(product)}
												className='w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 
												flex items-center justify-center shadow-lg hover:shadow-emerald-500/30'
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
											>
												<ShoppingCart className='w-5 h-5 mr-2' />
												Add to Cart
											</motion.button>
										</div>
									</motion.div>
								</motion.div>
							))}
						</div>
					</div>
					{featuredProducts.length > itemsPerPage && (
						<>
							<motion.button
								onClick={prevSlide}
								disabled={isStartDisabled}
								className={`absolute top-1/2 -left-6 transform -translate-y-1/2 p-3 rounded-full transition-all duration-300 shadow-lg ${
									isStartDisabled 
										? "bg-gray-600 cursor-not-allowed" 
										: "bg-emerald-600 hover:bg-emerald-500 hover:scale-110"
								}`}
								whileHover={!isStartDisabled ? { scale: 1.1 } : {}}
								whileTap={!isStartDisabled ? { scale: 0.9 } : {}}
							>
								<ChevronLeft className='w-6 h-6 text-white' />
							</motion.button>

							<motion.button
								onClick={nextSlide}
								disabled={isEndDisabled}
								className={`absolute top-1/2 -right-6 transform -translate-y-1/2 p-3 rounded-full transition-all duration-300 shadow-lg ${
									isEndDisabled 
										? "bg-gray-600 cursor-not-allowed" 
										: "bg-emerald-600 hover:bg-emerald-500 hover:scale-110"
								}`}
								whileHover={!isEndDisabled ? { scale: 1.1 } : {}}
								whileTap={!isEndDisabled ? { scale: 0.9 } : {}}
							>
								<ChevronRight className='w-6 h-6 text-white' />
							</motion.button>
						</>
					)}
				</div>
			</div>
		</div>
	);
};
export default FeaturedProducts;