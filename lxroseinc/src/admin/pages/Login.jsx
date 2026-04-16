import React, { useState } from "react";

const getDefaultApiBaseUrl = () => {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:5001";
  }

  return "";
};

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = configuredApiBaseUrl !== undefined ? configuredApiBaseUrl : getDefaultApiBaseUrl();

const Login = (props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = "Username is required";
    if (!password.trim()) newErrors.password = "Password is required";
    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error("Invalid username or password");
      }

      const { token, userId } = await response.json();
      const storage = rememberMe ? localStorage : sessionStorage;

      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("userId");
      storage.setItem("authToken", token);
      storage.setItem("userId", userId);

      props.onLoginStatusChange(true, userId); // Notify App.js that the user has logged in, also pass userId

      setUsername("");
      setPassword("");
      setRememberMe(false);
      setValidationErrors({});
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="loginPage">
      <div className="loginPanel">
        <section className="loginIntro" aria-labelledby="admin-access-title">
          <p className="loginKicker">LxRose Admin</p>
          <h1 id="admin-access-title">Admin Access</h1>
          <p>
            Sign in to review messages, service bookings, and dashboard activity.
          </p>
          <div className="loginAssurance">
            <span>Protected workspace</span>
            <span>Staff use only</span>
          </div>
        </section>

        <div className="loginForm" aria-label="Admin login form">
          <form className="form" onSubmit={handleLogin} noValidate>
            <div className="loginFormHeader">
              <p className="loginKicker">Welcome Back</p>
              <h2>Sign in securely</h2>
            </div>

            <div className="txtb">
              <label htmlFor="username">Email or Username</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="admin@lxrose.org"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username email"
                aria-invalid={Boolean(validationErrors.username)}
                required
              />
              {validationErrors.username && <div className="error">{validationErrors.username}</div>}
            </div>

            <div className="txtb">
              <label htmlFor="password">Password</label>
              <div className="passwordField">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  aria-invalid={Boolean(validationErrors.password)}
                  required
                />
                <button
                  type="button"
                  className="passwordToggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {validationErrors.password && <div className="error">{validationErrors.password}</div>}
            </div>

            <div className="loginOptions">
              <label className="rememberControl" htmlFor="remember-me">
                <input
                  type="checkbox"
                  id="remember-me"
                  name="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <a href="/forgot-password">Forgot password?</a>
            </div>

            <button className="loginSubmit" type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </button>

            {error && <div className="error loginError">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
