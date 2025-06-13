"use client";
import { useState, useEffect } from "react";
import EmployeeLayout from "../components/Layout";
import Image from "next/image";
import { Upload, Edit, Loader2 } from "lucide-react";
import axios from "axios";

export default function ProfilePage() {
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    age: "",
  });
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Fetch employee profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axios.get(
          "https://file-system-black.vercel.app/user/employee-Profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data?.employee) {
          const { employee } = response.data;
          setEmployeeData(employee);
          setFormData({
            firstName: employee.firstName || "",
            lastName: employee.lastName || "",
            email: employee.email || "",
            phone: employee.phone || "",
            age: employee.age || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    if (!employeeData?.image?.[0]?.secure_url) {
    setImageLoading(false); // إذا لم توجد صورة، تخطي حالة التحميل
  }

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setProfileImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();
    data.append("firstName", formData.firstName);
    data.append("lastName", formData.lastName);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("age", formData.age);
    data.append("prn", formData.prn);
    if (profileImage) {
      data.append("employeeImage", profileImage);
    }

    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        "https://file-system-black.vercel.app/user/completeProfilee",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      data.getAll("prn").forEach(console.log);
      console.log("response", response);

      // Refresh profile data after successful update
      const profileResponse = await axios.get(
        "https://file-system-black.vercel.app/user/employee-Profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEmployeeData(profileResponse.data.employee);
      // setIsEditing(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <EmployeeLayout>
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-2xl p-8 space-y-10 border border-gray-100 min-h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 text-Royal-Blue animate-spin" />
            <p className="text-lg text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </EmployeeLayout>
    );
  }

  // Show profile view when not editing
  if (employeeData && !isEditing) {
    return (
      <EmployeeLayout>
       <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-3xl p-6 md:p-8 space-y-8 border border-gray-100">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <h1 className="text-2xl md:text-3xl font-bold text-Royal-Blue">My Profile</h1>
    <button
      onClick={() => setIsEditing(true)}
      className="flex items-center gap-2 bg-Midnight-Green hover:bg-Midnight-Green-600 text-white px-5 py-2 md:px-6 md:py-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
    >
      <Edit size={18} />
      <span>Edit Profile</span>
    </button>
  </div>

  <div className="flex flex-col-reverse lg:flex-row gap-8 md:gap-12 items-center">
    {/* Employee Data - Shows second on mobile */}
    <div className="w-full space-y-6">
      <div className="bg-gray-50 p-5 md:p-6 rounded-xl">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
          Personal Information
        </h2>
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-start">
            <span className="font-medium text-gray-600">
              Name:
            </span>
            <span className="text-gray-800 ml-2 md:ml-2">
              {employeeData.firstName} {employeeData.lastName}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-gray-600 ">
              Email:
            </span>
            <span className="text-gray-800 ml-2 md:ml-2">
              {employeeData.email}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-gray-600 ">
              Phone:
            </span>
            <span className="text-gray-800 ml-2 md:ml-2">
              {employeeData.phone}
            </span>
          </div>
          
          {employeeData.rating && (
            <div className="flex items-center">
              <span className="font-medium text-gray-600 ">
                Rating:
              </span>
              <div className="flex items-center ml-2 md:ml-2">
                <span className="text-yellow-500 mr-1">★</span>
                <span className="text-gray-800">
                  {employeeData.rating}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Profile Image - Shows first on mobile */}
    <div className="flex flex-col items-center w-full">
      <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-xl">
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        )}
        <Image
  src={employeeData.image?.[0]?.secure_url }
  alt=""
  width={192}
  height={192}
  className={`rounded-full object-cover w-full h-full ${
    imageLoading ? "opacity-0" : "opacity-100"
  }`}
  onLoadingComplete={() => setImageLoading(false)}
  onError={() => setImageLoading(false)} // <-- إصلاح مشكلة التحميل اللانهائي
  unoptimized
/>
      </div>
    </div>
  </div>
</div>
      </EmployeeLayout>
    );
  }

  // Show edit form when isEditing is true
  return (
    <EmployeeLayout>
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-3xl p-8 space-y-8 border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-Royal-Blue mb-2">
            Edit Profile
          </h2>
          <p className="text-gray-600">Update your personal information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-Royal-Blue focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-Royal-Blue focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-Royal-Blue focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-Royal-Blue focus:border-transparent transition-all"
                required
              />
            </div>
            
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Image
            </label>
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
                {imageLoading && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                  </div>
                )}
                <Image
                  src={
                    profileImage
                      ? URL.createObjectURL(profileImage)
                      : employeeData?.image?.[0]?.secure_url || "/profile.jpg"
                  }
                  alt=""
                  width={80}
                  height={80}
                  className={`rounded-full object-cover w-full h-full transition-opacity duration-300 ${
                    imageLoading ? "opacity-0" : "opacity-100"
                  }`}
                  onLoadingComplete={() => setImageLoading(false)}
                  unoptimized
                />
              </div>
              <label className="flex-1">
                <div className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 text-gray-700 px-5 py-3 rounded-xl cursor-pointer transition-all border border-gray-200">
                  <Upload size={18} className="text-Royal-Blue" />
                  <div>
                    <p className="font-medium">Change Image</p>
                    <p className="text-xs text-gray-500">JPG, PNG..</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-xl transition-all border border-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r bg-Midnight-Green  hover:bg-Midnight-Green-600   font-medium py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex items-center justify-center text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </EmployeeLayout>
  );
}
