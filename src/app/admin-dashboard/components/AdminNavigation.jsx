// app/admin-dashboard/components/AdminNavigation.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import AdminLogo from "../../../Assets/Outlook-4n2yii3h (1).gif";
import axios from "axios";
import Swal from "sweetalert2";
import { FaSignOutAlt } from "react-icons/fa";

const AdminNavigation = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { path: "/admin-dashboard", label: "Dashboard" },
    { path: "/admin-dashboard/users", label: "Users " },
    { path: "/admin-dashboard/files", label: "Training Material " },
    { path: "/admin-dashboard/requests", label: "Requests" },
  ];
  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        "https://file-system-black.vercel.app/user/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.message === "Logged out successfully") {
        localStorage.removeItem("token");
        Swal.fire("Success!", "Logged out successfully!");

        window.location.href = "/";
      }

      console.log("Logout response:", response.data);
    } catch (error) {
      console.error("Logout failed:", error);
      Swal.fire("Error!", "Failed to log out.", "error");
    }
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex justify-between w-full">
            <div className="flex items-center">
              <Link href="/admin-dashboard">
                <Image
                  width={170}
                  height={64}
                  src={AdminLogo}
                  alt="Admin Logo"
                  className="h-full object-contain"
                />
              </Link>
            </div>
            <div className="hidden sm:ml-6  sm:flex sm:space-x-8">
              {tabs.map((tab) => (
                <Link
                  key={tab.path}
                  href={tab.path}
                  className={` ${
                    pathname === tab.path
                      ? "border-Royal-Green  text-Royal-Green"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {tab.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 text-gray-500 hover:text-Royal-Green transition-colors"
                title="Logout"
              >
                <FaSignOutAlt className="text-lg" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {mobileMenuOpen ? (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden bg-white shadow-lg">
          <div className="pt-2 pb-3 space-y-1">
            {tabs.map((tab) => (
              <Link
                key={tab.path}
                href={tab.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`${
                  pathname === tab.path
                    ? "bg-indigo-50 border-Royal-Green text-Royal-Green"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              >
                {tab.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-2 w-full pl-3 pr-4 py-2 text-left text-gray-500 hover:text-Royal-Green"
            >
              <FaSignOutAlt className="text-lg" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AdminNavigation;
