import { useEffect } from "react";
import { useProductStore } from "../stores/useProductStore";
import ProductCard from "../components/ProductCard";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const CollectionsPage = () => {
	const { fetchRandomProducts, products, loading } = useProductStore();

	useEffect(() => {
		fetchRandomProducts();
	}, [fetchRandomProducts]);

	const handleRefresh = () => {
		fetchRandomProducts();
	};

	return (
		<div className="min-h-screen py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<motion.div
					className="text-center mb-12"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<h1 className="text-4xl font-bold text-emerald-400 mb-4">Our Collections</h1>
					<p className="text-xl text-gray-300 max-w-3xl mx-auto">
						Discover our curated selection of premium products. Each item is carefully chosen for quality and style.
					</p>
				</motion.div>

				<div className="flex justify-between items-center mb-8">
					<motion.button
						onClick={handleRefresh}
						className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						Refresh Collection
					</motion.button>
					
					<Link 
						to="/"
						className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center transition-colors duration-300"
					>
						Back to Home
					</Link>
				</div>

				{loading ? (
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
					</div>
				) : (
					<motion.div
						className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5 }}
					>
						{products && products.length > 0 ? (
							products.map((product, index) => (
								<motion.div
									key={product._id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: index * 0.1 }}
								>
									<ProductCard product={product} />
								</motion.div>
							))
						) : (
							<div className="col-span-full text-center py-12">
								<h3 className="text-2xl font-semibold text-gray-300 mb-4">No products found</h3>
								<p className="text-gray-400">Please try again later or explore our categories.</p>
							</div>
						)}
					</motion.div>
				)}
			</div>
		</div>
	);
};

export default CollectionsPage;