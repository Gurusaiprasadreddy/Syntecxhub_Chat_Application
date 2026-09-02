import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center p-8 bg-white shadow-lg rounded-xl max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Chat Application</h1>
        <p className="text-gray-600 mb-8">
          Welcome to the real-time chat application!
        </p>
        
        <div className="flex flex-col gap-4">
          <Link 
            to="/login" 
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
          <Link 
            to="/register" 
            className="w-full py-3 bg-gray-100 text-gray-800 border border-gray-300 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
