"use client";

import { FaEnvelope, FaUserCircle, FaPhone, FaSpinner } from "react-icons/fa";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function TeamInfo() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const token = localStorage.getItem("token");

    const fetchTeamMembers = async () => {
      try {
        const response = await fetch(
          "https://file-system-black.vercel.app/user/employees",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch team members");
        }

        const data = await response.json();
        setTeamMembers(data.employees);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  if (loading) {
  return (
    <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200 mb-5">
      <h3 className="text-xl font-semibold text-Royal-Blue mb-6">
        Team Information
      </h3>
      <div className="flex justify-center items-center py-8">
        <FaSpinner className="animate-spin text-3xl text-Royal-Green" />
      </div>
    </div>
  );
}

  if (error) {
    return (
      <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200 mb-5">
        <h3 className="text-xl font-semibold text-Royal-Blue mb-6">
         Instructor information
        </h3>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200 mb-5">
      <h3 className="text-xl font-semibold text-Royal-Blue mb-6">
        Instructor Information
      </h3>
      <div className="grid gap-4">
        {teamMembers.map((member) => (
          <div
            key={member._id}
            className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
              <Image
                src={member.photo}
                alt={`${member.firstName || member.username}'s profile`}
                width={50}
                height={50}
                className="w-full h-full object-cover"
                unoptimized={true}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              {!member.photo && (
                <FaUserCircle className="absolute inset-0 text-3xl text-gray-500 m-auto" />
              )}
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800">
                {member.firstName || member.username}{" "}
                {member.lastName && member.lastName}
              </h4>
              <p className="text-sm text-gray-600 capitalize">{member.role}</p>

              {member.email && (
                <p className="text-sm text-indigo-600 flex items-center gap-1 mt-1">
                  <FaEnvelope /> {member.email}
                </p>
              )}

              {member.phone && (
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <FaPhone /> {member.phone}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
