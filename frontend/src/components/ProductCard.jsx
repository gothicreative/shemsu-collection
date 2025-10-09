import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { motion } from "framer-motion";

const ProductCard = ({ product }) => {
	const { user } = useUserStore();
	const { addToCart } = useCartStore();
	
	const handleAddToCart = () => {
		if (!user) {
			toast.error("Please login to add products to cart", { id: "login" });
			return;
		} else {
			// add to cart
			addToCart(product);
		}
	};

	return (
		<motion.div 
			className='flex w-full relative flex-col overflow-hidden rounded-xl border border-gray-700 shadow-2xl transition-all duration-300 hover:shadow-emerald-500/20'
			whileHover={{ y: -5 }}
			transition={{ duration: 0.3 }}
		>
			<div className='relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl'>
				<motion.img 
					className='object-cover w-full img-glow' 
					src={product.image} 
					alt='product image' 
					whileHover={{ scale: 1.05 }}
					transition={{ duration: 0.3 }}
				/>
				<div className='absolute inset-0 bg-black bg-opacity-20' />
			</div>

			<div className='mt-4 px-5 pb-5'>
				<motion.h5 
					className='text-xl font-semibold tracking-tight text-white mb-2'
					whileHover={{ color: "#10B981" }}
					transition={{ duration: 0.2 }}
				>
					{product.name}
				</motion.h5>
				<div className='mt-2 mb-5 flex items-center justify-between'>
					<p>
						<motion.span 
							className='text-3xl font-bold text-emerald-400'
							whileHover={{ scale: 1.1 }}
							transition={{ duration: 0.2 }}
						>
							${product.price}
						</motion.span>
					</p>
				</div>
				<motion.button
					className='flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-center text-sm font-medium
					 text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 w-full transition-all duration-300'
					onClick={handleAddToCart}
					whileHover={{ scale: 1.03 }}
					whileTap={{ scale: 0.98 }}
				>
					<ShoppingCart size={22} className='mr-2' />
					Add to cart
				</motion.button>
			</div>
		</motion.div>
	);
};
export default ProductCard;