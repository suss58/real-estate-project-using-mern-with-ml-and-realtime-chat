import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { loddingStart, signinSuccess, signinFailed } from '../redux/user/userSlice';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';

const SingIn = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.user)
    
    const [showPassword, setShowPassword] = useState(false);

    //======handling form submting function =====//
    const onSubmit = async (formData) => {
        dispatch(loddingStart())
        try {
            const res = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const userData = await res.json();

            //===checking request success or not ===//
            if (userData.success === false) {
                dispatch(signinFailed(userData.message))

                //===showing error in toastify====//
                toast.error(userData.message, {
                    autoClose: 2000,
                    position: toast.POSITION.TOP_CENTER,
                })
            }
            else {
                dispatch(signinSuccess(userData))
                toast.success('Login successful!', {
                    autoClose: 2000,
                    position: toast.POSITION.TOP_CENTER,
                });
                navigate('/home')
            }
        }
        catch (error) {
            dispatch(signinFailed(error.message))
            toast.error('An unexpected error occurred. Please try again.', {
                autoClose: 2000,
                position: toast.POSITION.TOP_CENTER,
            })
        }
    };

    return (
        <>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
            >
                <div className="relative">
                    <input 
                        {...register("email", { required: true })} 
                        type="email" 
                        placeholder="Email" 
                        className="form_input bg-white pl-10" 
                    />
                </div>
                {errors.email && <span className='text-red-700 font-semibold text-sm'>This field is required</span>}

                <div className="relative">
                    <svg
                        onClick={() => setShowPassword(!showPassword)} 
                        xmlns="http://www.w3.org/2000/svg"
                        fill="#bbb"
                        stroke="#bbb"
                        className="w-[18px] h-[18px] absolute right-2 cursor-pointer"
                        viewBox="0 0 128 128"
                    >
                        <path d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z"></path>
                    </svg>
                    <input 
                        {...register("userPassword", { required: true })} 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="Password" 
                        className="form_input bg-white pl-10" 
                    />
                </div>
                {errors.userPassword && <span className='text-red-700 font-semibold text-sm'>This field is required</span>}

                <button
                    type='submit'
                    disabled={loading}
                    className="btn bg-brand-blue text-white rounded-md w-full py-2 hover:bg-brand-blue/[.90]"
                >
                    {loading ? 'Loading...' : 'Login'}
                </button>
            </form>
            <ToastContainer limit={1} />
        </>
    )
}

export default SingIn;
