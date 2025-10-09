import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

const CategoryItem = ({ category }) => {
	const [imageError, setImageError] = useState(false);

	// Fallback to Old images if the main image fails to load
	const getImageSrc = () => {
		if (imageError) {
			const oldImageMap = {
				'/jeans.jpg': '/jeansOld.jpg',
				'/tshirts.jpg': '/tshirtsOld.jpg',
				'/shoes.jpg': '/shoesOld.jpg',
				'/glasse.jpg': '/glassesOld.png',
				'/jackets.jpg': '/jacketsOld.jpg',
				'/suits.jpg': '/suitsOld.jpg',
				'/bags.jpg': '/bagsOld.jpg'
			};
			return oldImageMap[category.imageUrl] || category.imageUrl;
		}
		return category.imageUrl;
	};

	return (
		<motion.div 
			className='relative overflow-hidden h-96 w-full rounded-xl group shadow-2xl'
			whileHover={{ y: -10 }}
			transition={{ duration: 0.3 }}
		>
			<Link to={"/category" + category.href}>
				<div className='w-full h-full cursor-pointer relative'>
					<motion.div 
						className='absolute inset-0 bg-gradient-to-b from-black/30 to-black/70 z-10'
						whileHover={{ opacity: 0.4 }}
						transition={{ duration: 0.3 }}
					/>
					<img
						src={getImageSrc()}
						alt={category.name}
						className='w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110'
						loading='lazy'
						onError={() => setImageError(true)}
					/>
					<div className='absolute bottom-0 left-0 right-0 p-6 z-20'>
						<motion.h3 
							className='text-white text-3xl font-bold mb-2 drop-shadow-lg'
							whileHover={{ scale: 1.05 }}
							transition={{ duration: 0.2 }}
						>
							{category.name}
						</motion.h3>
						<motion.p 
							className='text-gray-200 text-lg drop-shadow'
							initial={{ opacity: 0 }}
							whileHover={{ opacity: 1 }}
							transition={{ duration: 0.3 }}
						>
							Explore {category.name}
						</motion.p>
					</div>
					{/* Decorative corner elements */}
					<div className='absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-emerald-400 opacity-70'></div>
					<div className='absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-emerald-400 opacity-70'></div>
				</div>
			</Link>
		</motion.div>
	);
};

export default CategoryItem;