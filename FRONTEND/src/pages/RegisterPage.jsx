import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth/useAuth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const password = watch("password", "");

  const onSubmit = async (data) => {
    try {
      const newUser = {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
      };

      try {
        const response = await axios.post(
            `/api/auth/register`,
            newUser
        );
        if (response.data) {
          toast.success("Account created successfully");
          // Auto login after registration
          const loginRes = await axios.post(
              `/api/auth/login`,
              { email: data.email, password: data.password }
          );
          if (loginRes.data) {
            login(loginRes.data);
            navigate("/");
          } else {
            navigate("/login");
          }
        }
      } catch (error) {
        if (error?.response) {
          toast.error(error.response.data);
        } else {
          console.log(error);
          toast.error("Something went wrong");
        }
      }
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const handleGoogleLogin = async () => {
    window.location.href = "/oauth2/authorization/google";
  };

  return (
      <div className="min-h-screen flex flex-col md:flex-row bg-black">
        {/* Left side - Branding */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-[#333] opacity-90"></div>

          <div className="relative z-10 text-center max-w-md">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <svg
                  width="80"
                  height="80"
                  viewBox="0 0 80 80"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
              >
                <path
                    d="M40 12L69.3 28V60L40 76L10.7 60V28L40 12Z"
                    fill="#F5D13B"
                    stroke="#111111"
                    strokeWidth="2"
                />
                <path
                    d="M40 36L54.6 44V60L40 68L25.4 60V44L40 36Z"
                    fill="#111111"
                />
                <path
                    d="M30 30L35 33V39L30 42L25 39V33L30 30Z"
                    fill="#FFFFFF"
                />
                <path
                    d="M50 30L55 33V39L50 42L45 39V33L50 30Z"
                    fill="#FFFFFF"
                />
              </svg>
            </div>

            <h1 className="text-4xl font-extrabold text-white mb-4">
              Join TaskHive Today
            </h1>
            <p className="text-white/70 text-lg mb-8">
              Connect with friends, organize projects, and achieve more together.
            </p>

            {/* Testimonial */}
            <div className="mt-8 bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full bg-yellow-400/30 flex items-center justify-center">
                    <span className="text-2xl text-yellow-400">JD</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
                <p className="text-white/90 italic mb-4">
                  "TaskHive completely transformed how our team collaborates. The interface is intuitive and the features are exactly what we needed!"
                </p>
                <p className="text-yellow-400 font-semibold">Jane Doe</p>
                <p className="text-white/50 text-sm">Product Manager, CreativeTech</p>
              </div>
            </div>
          </div>

          {/* Background pattern */}
          <div className="absolute inset-0 z-0 opacity-10">
            <div className="absolute inset-0 bg-repeat" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15L30 0z' fill-rule='evenodd' fill='%23ffffff' fill-opacity='0.2'/%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}></div>
          </div>
        </div>

        {/* Right side - Registration Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
          <div className="w-full max-w-md py-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-black mb-2">
                Create Your Account
              </h2>

            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700"
                  >
                    First name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20"
                           fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"/>
                      </svg>
                    </div>
                    <input
                        id="firstName"
                        type="text"
                        placeholder="task"
                        className={`w-full pl-10 h-12 px-4 bg-gray-50 border ${
                            errors.firstName ? "border-red-500" : "border-gray-200"
                        } rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors`}
                        {...register("firstName", {
                          required: "First name is required",
                          minLength: {
                            value: 2,
                            message: "First name must be at least 2 characters",
                          },
                        })}
                    />
                  </div>
                  {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.firstName.message}
                      </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700"
                  >
                    Last name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20"
                           fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"/>
                      </svg>
                    </div>
                    <input
                        id="lastName"
                        type="text"
                        placeholder="hive"
                        className={`w-full pl-10 h-12 px-4 bg-gray-50 border ${
                            errors.lastName ? "border-red-500" : "border-gray-200"
                        } rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors`}
                        {...register("lastName", {
                          required: "Last name is required",
                          minLength: {
                            value: 2,
                            message: "Last name must be at least 2 characters",
                          },
                        })}
                    />
                  </div>
                  {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.lastName.message}
                      </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20"
                         fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                  </div>
                  <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className={`w-full pl-10 h-12 px-4 bg-gray-50 border ${
                          errors.email ? "border-red-500" : "border-gray-200"
                      } rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors`}
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                  />
                </div>
                {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20"
                         fill="currentColor">
                      <path fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"/>
                    </svg>
                  </div>
                  <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className={`w-full pl-10 h-12 px-4 bg-gray-50 border ${
                          errors.password ? "border-red-500" : "border-gray-200"
                      } rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors`}
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters",
                        },
                      })}
                  />
                </div>
                {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password.message}
                    </p>
                )}
                <p className="text-xs text-gray-500">
                  Must be at least 8 characters
                </p>
              </div>

              <div className="space-y-2">
                <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20"
                         fill="currentColor">
                      <path fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"/>
                    </svg>
                  </div>
                  <input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className={`w-full pl-10 h-12 px-4 bg-gray-50 border ${
                          errors.confirmPassword ? "border-red-500" : "border-gray-200"
                      } rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors`}
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) =>
                            value === password || "Passwords do not match",
                      })}
                  />
                </div>
                {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.confirmPassword.message}
                    </p>
                )}
              </div>

              <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-3 px-4 rounded-lg h-12 font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                    to="/login"
                    className="text-yellow-500 hover:text-yellow-600 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
                </div>
              </div>

              <div className="mt-6 ">
                <button
                    type="button"
                    className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors w-full cursor-pointer"
                    onClick={handleGoogleLogin}
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                    />
                  </svg>
                  Google
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}