import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import CategoryPage from "./pages/CategoryPage";

import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./stores/useUserStore";
import { useEffect, useState } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
import CartPage from "./pages/CartPage";
import { useCartStore } from "./stores/useCartStore";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";
import HowToUseOverlay from "./components/HowToUseOverlay";

function App() {
	const { user, checkAuth, checkingAuth } = useUserStore();
	const { getCartItems } = useCartStore();
	const [showHowToUse, setShowHowToUse] = useState(false);

	useEffect(() => {
		checkAuth();
		
		// Check if user has seen the how-to guide before
		const hasSeenGuide = localStorage.getItem('hasSeenHowToGuide');
		if (!hasSeenGuide) {
			// Use a small delay to ensure the app is fully loaded before showing the popup
			const timer = setTimeout(() => {
				setShowHowToUse(true);
			}, 1000);
			
			return () => clearTimeout(timer);
		}
	}, [checkAuth]);

	useEffect(() => {
		if (!user) return;

		getCartItems();
	}, [getCartItems, user]);

	const handleShowHowToUse = () => {
		setShowHowToUse(true);
	};

	const handleCloseHowToUse = () => {
		setShowHowToUse(false);
		localStorage.setItem('hasSeenHowToGuide', 'true');
	};

	if (checkingAuth) return <LoadingSpinner />;

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden'>
			{/* Background gradient */}
			<div className='absolute inset-0 overflow-hidden'>
				<div className='absolute inset-0'>
					<div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.15)_0%,rgba(5,81,129,0.1)_45%,rgba(0,0,0,0.1)_100%)]' />
				</div>
			</div>

			<div className='relative z-50 pt-20'>
				<Navbar onShowHowToUse={handleShowHowToUse} />
				<Routes>
					<Route path='/' element={<HomePage />} />
					<Route path='/signup' element={!user ? <SignUpPage /> : <Navigate to='/' />} />
					<Route path='/login' element={!user ? <LoginPage /> : <Navigate to='/' />} />
					<Route
						path='/secret-dashboard'
						element={user?.role === "admin" ? <AdminPage /> : <Navigate to='/login' />}
					/>
					<Route path='/category/:category' element={<CategoryPage />} />
					<Route path='/cart' element={user ? <CartPage /> : <Navigate to='/login' />} />
					<Route
						path='/purchase-success'
						element={user ? <PurchaseSuccessPage /> : <Navigate to='/login' />}
					/>
					<Route path='/purchase-cancel' element={user ? <PurchaseCancelPage /> : <Navigate to='/login' />} />
				</Routes>
			</div>
			<Toaster />
			
			{showHowToUse && <HowToUseOverlay onClose={handleCloseHowToUse} />}
		</div>
	);
}

export default App;