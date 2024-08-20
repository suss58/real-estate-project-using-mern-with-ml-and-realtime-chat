import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [stage, setStage] = useState('request'); // 'request' or 'verify'
  const [timer, setTimer] = useState(90); 
  const navigate = useNavigate();

  useEffect(() => {
    let interval;

    if (stage === 'verify') {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(interval);
            toast.error('OTP expired, redirecting to login page');
            navigate('/login'); 
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000); // Decrease timer every second
    }

    return () => clearInterval(interval);
  }, [stage, navigate]);

  const handleRequestOtp = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:3000/api/auth/forgot-password', { email });
      toast.success(response.data.message || 'OTP sent to your email');
      setStage('verify'); // Change stage to OTP verification
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !newPassword) {
      toast.error('Please enter OTP and new password');
      return;
    }
  
    try {
      console.log('Sending OTP verification request with data:', { email, otp, newPassword });
      const response = await axios.post('http://localhost:3000/api/auth/verify-otp', { email, otp, newPassword });
      toast.success(response.data.message || 'Password updated successfully');
      navigate('/login'); // Redirect to login page after successful password change
    } catch (error) {
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to update password');
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        {stage === 'request' ? (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 mb-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleRequestOtp}
              className="w-full py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Send OTP
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-center">Verify OTP</h2>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full p-3 mb-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full p-3 mb-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleVerifyOtp}
              className="w-full py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Verify OTP
            </button>
            <p className="text-center text-sm text-gray-500 mt-2">Time left: {timer} seconds</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
