// import React, { useState } from "react";
// import { useForm } from "react-hook-form";

// const Signup = ({ userState }) => {
//   const { setResponseData, setIsformSubmit } = userState;

//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm();

//   // Handling form submitting function
//   const onSubmit = async (formData) => {
//     setLoading(true);
//     const res = await fetch("/api/auth/signup", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(formData),
//     });
//     const data = await res.json();

//     setIsformSubmit(true);
//     setResponseData(data);
//     setLoading(false);
//   };

//   return (
//     <>
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <input
//           {...register("username", { required: true })}
//           type="text"
//           placeholder="Username"
//           className="form_input"
//         />
//         {errors.username && (
//           <span className="text-red-700 font-semibold text-sm mb-2 mt-1">
//             This field is required
//           </span>
//         )}

//         <input
//           {...register("email", { required: true })}
//           type="email"
//           placeholder="Email"
//           className="form_input mt-5"
//         />

//         {errors.email && (
//           <span className="text-red-700 font-semibold text-sm mb-2 mt-1">
//             This field is required
//           </span>
//         )}

//         <div className="relative mt-5">
//           <input
//             {...register(
//               "password",
//               {
//                 required:true,
//                 pattern: {
//                   value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, 
//                   message:
//                     "Password must be at least 8 characters long, include letters and numbers",
//                 },
//               }
//             )}
//             type={showPassword ? "text" : "password"}
//             placeholder="Password"
//             className="form_input"
//           />
//           <svg
//             onClick={() => setShowPassword(!showPassword)}
//             xmlns="http://www.w3.org/2000/svg"
//             fill="#bbb"
//             stroke="#bbb"
//             className="w-[18px] h-[18px] absolute right-2 top-2 cursor-pointer"
//             viewBox="0 0 128 128"
//           >
//             <path d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z"></path>
//           </svg>
//         </div>
//         {errors.password && (
//           <span className="text-red-700 font-semibold text-sm mb-2 mt-1">
//             Password must be at least 8 characters long, include letters and numbers
//           </span>
//         )}

//         <button
//           type="submit"
//           disabled={loading}
//           className="btn bg-brand-blue text-white mt-5 rounded-md w-full hover:bg-brand-blue/[.90]"
//         >
//           {loading ? "Loading..." : "Create an account"}
//         </button>
//       </form>
//     </>
//   );
// };

// export default Signup;


import React, { useState } from "react";
import { useForm } from "react-hook-form";

const Signup = ({ userState }) => {
  const { setResponseData, setIsformSubmit } = userState;

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [apiError, setApiError] = useState(""); // State to handle API errors

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Handling form submitting function
  const onSubmit = async (formData) => {
    setLoading(true);
    setApiError(""); // Reset API error message

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        // Handle HTTP errors
        const errorData = await res.json();
        setApiError(errorData.message || "Something went wrong, please try again.");
      } else {
        const data = await res.json();
        setIsformSubmit(true);
        setResponseData(data);
      }
    } catch (error) {
      // Handle network or other errors
      setApiError("user already exists please use different email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register("username", { required: "Username is required" })}
          type="text"
          placeholder="Username"
          className="form_input"
        />
        {errors.username && (
          <span className="text-red-700 font-semibold text-sm mb-2 mt-1">
            {errors.username.message}
          </span>
        )}

        <input
          {...register("email", { required: "Email is required" })}
          type="email"
          placeholder="Email"
          className="form_input mt-5"
        />
        {errors.email && (
          <span className="text-red-700 font-semibold text-sm mb-2 mt-1">
            {errors.email.message}
          </span>
        )}

        <div className="relative mt-5">
          <input
            {...register(
              "password",
              {
                required: "Password is required",
                pattern: {
                  value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, 
                  message: "Password must be at least 8 characters long, include letters and numbers",
                },
              }
            )}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="form_input"
          />
          <svg
            onClick={() => setShowPassword(!showPassword)}
            xmlns="http://www.w3.org/2000/svg"
            fill="#bbb"
            stroke="#bbb"
            className="w-[18px] h-[18px] absolute right-2 top-2 cursor-pointer"
            viewBox="0 0 128 128"
          >
            <path d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z"></path>
          </svg>
        </div>
        {errors.password && (
          <span className="text-red-700 font-semibold text-sm mb-2 mt-1">
            {errors.password.message}
          </span>
        )}

        {apiError && (
          <span className="text-red-700 font-semibold text-sm mb-2 mt-1">
            {apiError}
          </span>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn bg-brand-blue text-white mt-5 rounded-md w-full hover:bg-brand-blue/[.90]"
        >
          {loading ? "Loading..." : "Create an account"}
        </button>
      </form>
    </>
  );
};

export default Signup;
