"use client";
import Image from "next/image";
import { useState } from "react";
import SyncLoader from "react-spinners/SyncLoader";
import AcademyLogo from "../Assets/Outlook-4n2yii3h (1).gif";
import axios from "axios"; 

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (errors[id]) {
      setErrors((prev) => ({
        ...prev,
        [id]: "",
      }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { username: "", password: "" };

    if (!formData.username) {
      newErrors.username = "Username is required";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  if (validateForm()) {
    try {
      const response = await axios.post(
        "https://file-system-black.vercel.app/user/login",
        formData
      );

      const data = response.data;
      console.log("Login successful:", data);
      localStorage.setItem("token", data.token);
      
      // Determine redirect URL based on role
      let redirectUrl;
      if (data.role === "admin") {
        redirectUrl = "/admin-dashboard";
      } else if (data.role === "employee") {
        redirectUrl = "/employee-dashboard";
      } else {
        redirectUrl = "/";
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        username: "Invalid credentials",
        password: "Invalid credentials",
      });
      setIsSubmitting(false);
    }
  } else {
    setIsSubmitting(false);
  }
};


  const isButtonDisabled =
    !formData.username || !formData.password || isSubmitting;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <form
        className="bg-white p-6 shadow-2xl rounded-xl w-96"
        onSubmit={handleSubmit}
      >
        <div className="mb-8 flex flex-col items-center">
          <Image
            width={250}
            height={180}
            src={AcademyLogo}
            alt="Site Logo"
            className="object-contain mb-4"
          />
          <h5 className="text-2xl font-bold text-Royal-Green">Login</h5>
        </div>

        <div className="mb-4">
          <label
            className="block text-Royal-Green text-sm font-bold mb-2"
            htmlFor="username"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.username ? "border-red-500" : ""
            }`}
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
          />
          {errors.username && (
            <p className="text-red-500 text-xs mt-1">{errors.username}</p>
          )}
        </div>

        <div className="mb-4">
          <label
            className="block text-Royal-Green text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.password ? "border-red-500" : ""
            }`}
            placeholder="Enter Your Password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          className={`bg-Royal-Green text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${
            isButtonDisabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-Midnight-Green cursor-pointer"
          }`}
          disabled={isButtonDisabled}
        >
          {isSubmitting ? <SyncLoader color="#fff" size={8} /> : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
