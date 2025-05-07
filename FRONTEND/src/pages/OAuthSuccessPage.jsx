import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/auth/useAuth";

const OAuthSuccessPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("OAuthSuccessPage: Attempting to fetch user data from OAuth success endpoint");
        
        // Check if there's a token in the URL (from the redirect)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
          console.log("OAuthSuccessPage: Found token in URL params");
          
          // If we have a token from the redirect, use it directly
          const userData = {
            token,
            // We'll need to fetch the user info from the backend or decode the token
            // For now, just store the token
          };
          
          login(userData);
          navigate("/");
          return;
        }
        
        // If no token in URL, try the backend endpoint
        console.log("OAuthSuccessPage: No token in URL, fetching from backend endpoint");
        const response = await axios.get(
            "/api/auth/oauth2/success",
            {
              withCredentials: true, // Important for OAuth cookie to be sent
            }
        );

        console.log("OAuthSuccessPage: Received response", response);

        if (response.data) {
          //store user data in context and local storage
          login(response.data);
          navigate("/");
        } else {
          setError("No user data received from server");
        }
      } catch (error) {
        console.error("OAuth login error details:", {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
        setError(`Failed to complete authentication: ${error.response?.data || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [login, navigate]);

  if (loading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black to-gray-900">
          <div className="relative">
            {/* Honeycomb background pattern */}
            <div className="absolute -inset-16 bg-repeat opacity-10" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15L30 0z' fill-rule='evenodd' fill='%23ffffff' fill-opacity='0.2'/%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}></div>

            <div className="bg-black bg-opacity-70 backdrop-filter backdrop-blur-lg border border-opacity-20 border-gray-700 p-10 rounded-2xl shadow-2xl text-center relative z-10">
              {/* Logo */}
              <div className="mb-6 flex justify-center">
                <svg
                    width="60"
                    height="60"
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

              {/* Custom hexagon-shaped spinner */}
              <div className="relative h-16 w-16 mx-auto mb-6">
                <div className="absolute inset-0 animate-spin">
                  <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
                    <path
                        d="M40 8L73.3 26V62L40 80L6.7 62V26L40 8Z"
                        fill="none"
                        stroke="#F5D13B"
                        strokeWidth="4"
                        strokeDasharray="120"
                        strokeDashoffset="60"
                        strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 bg-yellow-500 opacity-30 rounded-lg rotate-45"></div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                Connecting to TaskHive
              </h2>
              <p className="text-yellow-100/70 mt-2">
                Please wait while we set up your account...
              </p>
            </div>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black to-gray-900">
          <div className="relative">
            {/* Honeycomb background pattern */}
            <div className="absolute -inset-16 bg-repeat opacity-10" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15L30 0z' fill-rule='evenodd' fill='%23ffffff' fill-opacity='0.2'/%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}></div>

            <div className="bg-black bg-opacity-70 backdrop-filter backdrop-blur-lg border border-opacity-20 border-gray-700 p-10 rounded-2xl shadow-2xl text-center max-w-md relative z-10">
              {/* Error icon */}
              <div className="w-20 h-20 mx-auto mb-6 bg-red-500/10 rounded-2xl flex items-center justify-center rotate-45">
                <div className="w-16 h-16 flex items-center justify-center -rotate-45">
                  <svg
                      className="w-10 h-10 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                Authentication Failed
              </h2>
              <p className="text-yellow-100/70 mt-2">{error}</p>
              <button
                  onClick={() => navigate("/login")}
                  className="mt-8 bg-yellow-500 hover:bg-yellow-600 text-black py-3 px-8 rounded-lg shadow-lg transition-colors font-medium cursor-pointer"
              >
                Return to Login
              </button>
            </div>
          </div>
        </div>
    );
  }

  return null;
};


export default OAuthSuccessPage;