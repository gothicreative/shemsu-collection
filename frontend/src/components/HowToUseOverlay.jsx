import { X } from "lucide-react";

const HowToUseOverlay = ({ onClose }) => {
  const steps = [
    {
      title: "Browse Products",
      description: "Explore our collection of products organized by categories. Click on any product to see more details."
    },
    {
      title: "Add to Cart",
      description: "Click the 'Add to Cart' button on any product page to add items to your shopping cart."
    },
    {
      title: "Manage Your Cart",
      description: "Access your cart from the navigation bar. Adjust quantities or remove items before checkout."
    },
    {
      title: "Checkout Process",
      description: "Proceed to checkout when you're ready. Enter your shipping details and payment information."
    },
    {
      title: "Track Orders",
      description: "After purchase, you can track your order status in your account dashboard."
    },
    {
      title: "Admin Features",
      description: "Administrators can access the secret dashboard to manage products, view analytics, and handle orders."
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-primary-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary-400">How to Use This Shop</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={30} />
            </button>
          </div>
          
          <div className="space-y-6">
            <p className="text-gray-300">
              Welcome to our mini e-commerce shop! Follow these simple steps to get started:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {steps.map((step, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                      <p className="text-gray-300 text-sm">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-900 p-4 rounded-lg border border-primary-800">
              <h3 className="font-bold text-primary-400 mb-2">Quick Tips</h3>
              <ul className="text-gray-300 space-y-1 text-sm list-disc pl-5">
                <li>Create an account to save your information for faster checkout</li>
                <li>Check your email for order confirmations and updates</li>
                <li>Use the search function to quickly find specific products</li>
                <li>Contact support if you need help with your order</li>
                <li>explore the admin page by logging in with email: abula@gmail.com, password: 123456</li>
              </ul>
            </div>
                <div className="bg-gray-900 p-4 rounded-lg border border-primary-800">
              <h3 className="font-bold text-primary-400 mb-2">About the Creator</h3>
              <ul className="text-gray-300 space-y-1 text-sm list-disc pl-5">
                <li><strong>NAME:</strong> Hafiz Adem</li>
                <li><strong>EMAIL:</strong> <a href="mailto:hafizadem71@gmail.com">hafizadem71@gmail.com</a></li>
                <li><strong>PORTFOLIO:</strong> https://hafizcreative.netlify.app</li>
                <li><strong>GITHUB:</strong> https://github.com/gothicreative</li>
                <li><strong>LINKEDIN:</strong> linkedin.com/in/hafiz-adem-054561237</li>
              </ul>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToUseOverlay;