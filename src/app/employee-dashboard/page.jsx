"use client";

import EmployeeLayout from "./components/Layout";
import TeamInfo from "./components/TeamInfo";
import { LuNotebookPen } from "react-icons/lu";
import { FaLink, FaUserTie, FaSpinner } from "react-icons/fa";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";

export default function EmployeeHome() {
  const [courses, setCourses] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch courses
        const coursesResponse = await fetch("https://file-system-black.vercel.app/links/get-employee-links", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!coursesResponse.ok) {
          throw new Error("Failed to fetch courses");
        }

        const coursesData = await coursesResponse.json();
        setCourses(coursesData.links);

        // Fetch employee profile to get employee ID
        const profileResponse = await axios.get(
          "https://file-system-black.vercel.app/user/employee-Profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const employeeId = profileResponse.data.employee._id;
        
        // Fetch notes using employee ID
        await getEmployeeNotes(employeeId);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setNotesLoading(false);
      }
    };

    fetchData();
  }, []);

  const getEmployeeNotes = async (employeeId) => {
    try {
      const response = await axios.get(
        `https://file-system-black.vercel.app/notes/employee-notes/${employeeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes(response.data.notes || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      setNotes([]);
    }
  };

  return (
    <EmployeeLayout>
      <div className="space-y-10 max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-2xl p-8 text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <FaUserTie className="text-4xl text-Royal-Green" />
            <h1 className="text-3xl font-bold text-Royal-Blue">
              Instructor Dashboard
            </h1>
          </div>
          <p className="text-Midnight-Green text-lg">
            Welcome to your Instructor portal – stay connected and informed.
          </p>
        </div>

        {/* Notes Section */}
        <div className="bg-white shadow-lg rounded-2xl p-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <LuNotebookPen className="text-4xl text-Royal-Green" />
            <h1 className="text-3xl font-bold text-Royal-Blue">
              Notes
            </h1>
          </div>
          
          {notesLoading ? (
            <div className="flex justify-center items-center py-4">
              <FaSpinner className="animate-spin text-2xl text-Royal-Green" />
            </div>
          ) : notes.length === 0 ? (
            <p className="text-Midnight-Green text-lg text-center">
              No notes available
            </p>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note._id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-xl font-semibold text-Royal-Blue mb-2">
                    {note.title}
                  </h3>
                  <p className="text-Midnight-Green">
                    {note.content}
                  </p>
                  <div className="text-sm text-gray-500 mt-2">
                    Created at: {new Date(note.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <TeamInfo />

        {/* Courses Section */}
        <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-Royal-Blue mb-6">
            Apps
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <FaSpinner className="animate-spin text-3xl text-Royal-Green" />
            </div>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : courses.length === 0 ? (
            <p>No training courses available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <a
                  key={course._id}
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:shadow-lg transition-shadow duration-300 rounded-xl overflow-hidden border border-gray-200"
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={
                        course.image?.secure_url ||
                        "/default-course-image.jpg"
                      }
                      alt={course.title}
                      fill
                      style={{ objectFit: "cover" }}
                      className="w-full h-full"
                      unoptimized
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-Royal-Blue mb-2">
                      {course.title}
                    </h3>
                    <p className="text-Midnight-Green text-sm">
                      {course.description || "No description provided."}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </EmployeeLayout>
  );
}