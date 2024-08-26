import { useEffect, useState } from 'react';
import Singup from '../components/Singup';
import SingIn from '../components/SingIn';
import OAuth from '../components/OAuth';

import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
    const { currentUser } = useSelector(state => state.user);
    const [isNewUser, setIsNewUser] = useState(true);
    const [isFormSubmit, setIsformSubmit] = useState(false);
    const [responseData, setResponseData] = useState();
    const navigate = useNavigate();

    // Handling Notification for User
    const handleTostify = async () => {
        if (responseData.success) {
            setIsNewUser(!isNewUser);
            toast(responseData.message, {
                autoClose: 2000,
            });
        }
    };

    useEffect(() => {
        if (isFormSubmit) {
            handleTostify();
            setIsformSubmit(false);
        }
    }, [responseData]);

    useEffect(() => {
        if (currentUser && currentUser.email) {
            navigate("/profile");
        }
    }, [currentUser, navigate]);

    const handleForgotPasswordClick = (e) => {
        e.preventDefault();
        navigate('/forget');
    };

    const handleToggleUserType = (e) => {
        e.preventDefault();
        setIsNewUser(!isNewUser);
    };

    return (
        <div className="font-sans bg-gray-50 flex items-center justify-center min-h-screen p-6">
            <div className="max-w-4xl w-full lg:flex rounded-lg shadow-lg overflow-hidden">
                {/* Image Section */}
                <div className="hidden lg:block lg:w-1/2 bg-cover bg-center" 
                    style={{ backgroundImage: "url('https://readymadeui.com/signin-image.webp')" }}>
                </div>

                {/* Form Section */}
                <div className="w-full lg:w-1/2 p-6 lg:p-12 bg-white">
                    {currentUser && currentUser.email ? (
                        <div className='form-section text-center'>
                            <p className='text-xl font-semibold text-blue-600'>
                                User exists! Redirecting to profile page...
                            </p>
                        </div>
                    ) : (
                        <div className='form-section'>
                            <h1 className='text-2xl font-bold text-blue-600 mb-6'>
                                {isNewUser ? "Login" : 'Create an Account'}
                            </h1>
                            {isNewUser ? (
                                <SingIn />
                            ) : (
                                <Singup userState={{ setResponseData, setIsformSubmit }} />
                            )}

                            <p className="text-center text-gray-700 mt-4">
                                {isNewUser ? "Don’t have an account?" : 'Already have an account?'}
                                <a href="/" onClick={handleToggleUserType} className='ml-2 text-blue-600 font-semibold'>
                                    {isNewUser ? 'Create one' : 'Login'}
                                </a>
                            </p>

                            {isNewUser && (
                                <p className="text-center text-gray-700 mt-4">
                                    <a href="/" onClick={handleForgotPasswordClick} className='text-blue-600 font-semibold'>
                                        Forgot Password?
                                    </a>
                                </p>
                            )}

                            <OAuth />
                        </div>
                    )}
                    <ToastContainer limit={1} />
                </div>
            </div>
        </div>
    );
};

export default Login;
