import { useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../api/authApi";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const validate = () => {
    const newErrors = {};
    const email = emailRef.current?.value?.trim() || "";
    const password = passwordRef.current?.value || "";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    return newErrors;
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const validationErrors = validate();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      setErrors({});
      setLoading(true);
      const formData = {
        email: emailRef.current?.value?.trim(),
        password: passwordRef.current?.value,
      };
      try {
        const { data } = await login(formData);
        setAuth(data.data.user, data.data.accessToken);
        toast.success("Welcome back!");
        const role = data.data.user.role;
        if (role === "patient") navigate("/patient");
        else if (role === "doctor") navigate("/doctor");
        else if (role === "admin") navigate("/admin");
      } catch (err) {
        setErrors({ general: "Invalid email or password. Please try again." });
        // Keep input values so user can correct them; focus password for quick retry
        if (passwordRef.current?.focus) passwordRef.current.focus();
      } finally {
        setLoading(false);
      }
    },
    [navigate, setAuth]
  );
  const handleChange = useCallback((e) => {
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  }, [errors]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🏥</div>
          <h1 className="text-2xl font-bold text-gray-800">Clinic System</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            aria-live="polite"
            className="mb-2 min-h-[40px] flex items-center justify-center"
          >
            <div
              className={`w-full transition-opacity duration-150 ${
                errors.general ? "opacity-100" : "opacity-0"
              }`}
            >
              {errors.general && (
                <div className="bg-red-50 border border-red-300 text-red-600 text-sm px-4 py-3 rounded-lg text-center">
                  {errors.general}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="text"
              name="email"
              ref={emailRef}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              ref={passwordRef}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
