"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiEdit,
  FiTrash2,
  FiSave,
  FiX,
  FiPlus,
  FiFileText,
} from "react-icons/fi";
import Swal from "sweetalert2";
import { FiEdit2, FiTrash } from "react-icons/fi";
import AdminLayout from "../components/AdminLayout";
import { IoAddCircleSharp } from "react-icons/io5";
import axios from "axios";

const EmployeeDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isNotesListOpen, setIsNotesListOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState({
    id: "",
    title: "",
    content: "",
    employeeId: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const [editedUser, setEditedUser] = useState({
    fistName: "",
    lastName: "",
    email: "",
    phone: "",
    prn: "",
    rating: "",
    note: "",
  });

  const [newUser, setNewUser] = useState({
    userName: "",
    password: "",
    prn: "",
  });

  // Fetch all employees
  const getUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "https://file-system-black.vercel.app/user/employees",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
      setUsers(response.data.employees);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users");
      setLoading(false);
      Swal.fire("Error!", "Failed to load users.", "error");
    }
  };

  // Fetch single employee
  const getUserById = async (userId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `https://file-system-black.vercel.app/user/employee/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const userData = response.data.employee;
      return {
        ...userData,
        fistName: userData.fistName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        prn: userData.prn || "",
        rating: userData.rating || "",
        note: userData.note || "",
      };
    } catch (error) {
      console.error("Error fetching user:", error);
      Swal.fire("Error!", "Failed to load user data.", "error");
      return null;
    }
  };

  // Fetch notes for an employee
  const getEmployeeNotes = async (employeeId) => {
    const token = localStorage.getItem("token");
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

  // Create or update note
  const saveNote = async () => {
    const token = localStorage.getItem("token");
    try {
      if (currentNote.id) {
        await axios.put(
          `https://file-system-black.vercel.app/notes/public-notes/${currentNote.id}`,
          {
            title: currentNote.title,
            content: currentNote.content,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        Swal.fire("Success!", "Note updated successfully.", "success");
      } else {
        const response = await axios.post(
          "https://file-system-black.vercel.app/notes/public-notes",
          {
            title: currentNote.title,
            content: currentNote.content,
            employeeId: currentNote.employeeId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        Swal.fire({
          title: "Note Created!",
          icon: "success",
        });
      }
      closeNoteModal();
      await getEmployeeNotes(currentNote.employeeId);
    } catch (error) {
      console.error("Error saving note:", error);
      Swal.fire("Error!", "Failed to save note.", "error");
    }
  };

  // Delete note
  const deleteNote = async (noteId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        try {
          await axios.delete(
            `https://file-system-black.vercel.app/notes/public-notes/${noteId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          Swal.fire("Deleted!", "Note has been deleted.", "success");
          getEmployeeNotes(currentNote.employeeId);
        } catch (error) {
          console.error("Error deleting note:", error);
          Swal.fire("Error!", "Failed to delete note.", "error");
        }
      }
    });
  };

  // Open note modal
  const openNoteModal = (employeeId, note = null) => {
    if (note) {
      setCurrentNote({
        id: note._id,
        title: note.title,
        content: note.content,
        employeeId: employeeId,
      });
    } else {
      setCurrentNote({
        id: "",
        title: "",
        content: "",
        employeeId: employeeId,
      });
    }
    setIsNoteModalOpen(true);
  };

  // Close note modal
  const closeNoteModal = () => {
    setIsNoteModalOpen(false);
    setCurrentNote({
      id: "",
      title: "",
      content: "",
      employeeId: "",
    });
  };

  // Open notes list for an employee
  const openNotesList = async (employeeId) => {
    setCurrentUserId(employeeId);
    await getEmployeeNotes(employeeId);
    setIsNotesListOpen(true);
  };

  // Close notes list
  const closeNotesList = () => {
    setIsNotesListOpen(false);
    setCurrentUserId(null);
    setNotes([]);
  };

  // Open edit user modal
  const openEditModal = async (userId) => {
    setCurrentUserId(userId);
    const user = await getUserById(userId);
    if (user) {
      setEditedUser({
        fistName: user.fistName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        prn: user.prn || "",
        rating: user.rating || "",
        note: user.note || "",
      });
      setIsEditModalOpen(true);
    }
  };

  // Open add user modal
  const openAddModal = () => {
    setNewUser({ userName: "", password: "", prn: "" });
    setIsAddModalOpen(true);
  };

  // Close all modals
  const closeModals = () => {
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
    setCurrentUserId(null);
  };

  // Handle user edit form changes
  const handleEditUserChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle add user form changes
  const handleAddUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  // Save edited user
  const saveEditedUser = async () => {
    if (!editedUser.fistName.trim()) {
      Swal.fire("Error!", "First name is required.", "error");
      return;
    }

    if (!editedUser.email.trim()) {
      Swal.fire("Error!", "Email is required.", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedUser.email)) {
      Swal.fire("Error!", "Please enter a valid email address.", "error");
      return;
    }

    setIsUpdating(true);
    const token = localStorage.getItem("token");
    try {
     let res= await axios.put(
        `https://file-system-black.vercel.app/user/employee/${currentUserId}`,
        {
          fistName: editedUser.fistName,
          lastName: editedUser.lastName,
          email: editedUser.email,
          phone: editedUser.phone,
          prn: editedUser.prn,
          rating: editedUser.rating,

        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            
          },
        }
      );
      await getUsers();
      closeModals();
      Swal.fire("Updated!", "User has been updated successfully.", "success");
      getUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      let errorMessage = "Failed to update user.";
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      Swal.fire("Error!", errorMessage, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // Add new user
  const addNewUser = async () => {
    if (!newUser.userName || !newUser.password || !newUser.prn) {
      Swal.fire("Error!", "Please fill in all required fields.", "error");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        "https://file-system-black.vercel.app/user/AddEmployee",
        {
          username: newUser.userName,
          password: newUser.password,
          prn: newUser.prn,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Response from add user:", response.data);
      if (response.data.err === "Username already exists") {
        Swal.fire("Error!", "Username already exists.", "error");
      } else {
        await getUsers();
        closeModals();
        Swal.fire("Success!", "New user has been added successfully.", "success");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      Swal.fire("Error!", "Failed to add user. Please check the data or token.", "error");
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        try {
          await axios.delete(
            `https://file-system-black.vercel.app/user/employee/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          await getUsers();
          Swal.fire("Deleted!", "User has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting user:", error);
          Swal.fire("Error!", "Failed to delete user.", "error");
        }
      }
    });
  };

  return (
    <AdminLayout>
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 space-y-4 sm:space-y-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center sm:text-left">
              Instructors Management
            </h1>
            <button
              onClick={openAddModal}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              Add New instructor
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden overflow-y-auto">
            <div className="overflow-y-auto" style={{ maxHeight: "500px" }}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      prn
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Note
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.firstName
                          ? `${user.firstName} ${user.lastName || ""}`
                          : user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email || "No email"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.phone || "No phone"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.prn || "No Prn"}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === "Admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.rated || "No rated"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.note || "No note"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(user._id)}
                            className="text-blue-600 hover:text-blue-800 cursor-pointer"
                          >
                            <FiEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteUser(user._id)}
                            className="text-red-600 hover:text-red-800 cursor-pointer"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit User Modal */}
          {isEditModalOpen && (
            <div className="fixed inset-0 bg-Wadi bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md min-h-full mt-20">
                <div className="flex justify-between items-center border-b px-6 py-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Edit User
                  </h3>
                  <button
                    onClick={closeModals}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name*
                    </label>
                    <input
                      type="text"
                      name="fistName"
                      value={editedUser.fistName}
                      onChange={handleEditUserChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={editedUser.lastName}
                      onChange={handleEditUserChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email*
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editedUser.email}
                      onChange={handleEditUserChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={editedUser.phone}
                      onChange={handleEditUserChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      PRN
                    </label>
                    <input
                      type="text"
                      name="prn"
                      value={editedUser.prn}
                      onChange={handleEditUserChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Rating
                    </label>
                    <input
                      type="text"
                      name="rating"
                      value={editedUser.rating}
                      onChange={handleEditUserChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                </div>
                <div className="flex justify-end space-x-3 px-6 py-4 border-t">
                  <button
                    onClick={closeModals}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEditedUser}
                    disabled={isUpdating}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      isUpdating ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isUpdating ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      <>
                        <FiSave className="inline mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add User Modal */}
          {isAddModalOpen && (
            <div className="fixed inset-0 bg-Wadi bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center border-b px-6 py-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Add New User
                  </h3>
                  <button
                    onClick={closeModals}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Username*
                    </label>
                    <input
                      type="text"
                      name="userName"
                      value={newUser.userName}
                      onChange={handleAddUserChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Password*
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={newUser.password}
                      onChange={handleAddUserChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                
                </div>
                <div className="flex justify-end space-x-3 px-6 py-4 border-t">
                  <button
                    onClick={closeModals}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addNewUser}
                    className="px-4 py-2 border border-transparent cursor-pointer rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <FiPlus className="inline mr-2 h-4 w-4" />
                    Add User
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notes List Modal */}
          {isNotesListOpen && (
            <div className="fixed inset-0 bg-Wadi bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
                  <h3 className="text-lg font-medium text-gray-900">
                    Notes for {users.find(u => u._id === currentUserId)?.fistName || "User"}
                  </h3>
                  <div className="flex space-x-2">
                    {notes.length === 0 && (
                      <button
                        onClick={() => openNoteModal(currentUserId)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm flex items-center"
                      >
                        <FiPlus className="mr-1" /> Add Note
                      </button>
                    )}
                    <button
                      onClick={closeNotesList}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FiX className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {notes.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-500 mb-4">
                        No notes available for this user
                      </div>
                      <button
                        onClick={() => openNoteModal(currentUserId)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center mx-auto"
                      >
                        <FiPlus className="mr-2" />
                        Add First Note
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notes.map((note) => (
                        <motion.div
                          key={note._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border rounded-lg p-4 hover:bg-gray-50 shadow-sm"
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-gray-900 text-lg">{note.title}</h4>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openNoteModal(currentUserId, note)}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                                title="Edit"
                              >
                                <FiEdit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteNote(note._id)}
                                className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                                title="Delete"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <p className="mt-2 text-gray-600 whitespace-pre-line">{note.content}</p>
                          <div className="mt-3 flex justify-between items-center text-sm text-gray-500">
                            <span>Created by: {note.createdBy?.username || 'Unknown'}</span>
                            <span>{new Date(note.createdAt).toLocaleString()}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Note Form Modal */}
          {isNoteModalOpen && (
            <div className="fixed inset-0 bg-Wadi bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center border-b px-6 py-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {currentNote.id ? "Edit Note" : "Add New Note"}
                  </h3>
                  <button
                    onClick={closeNoteModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Title*
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={currentNote.title}
                      onChange={(e) =>
                        setCurrentNote({
                          ...currentNote,
                          title: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Content*
                    </label>
                    <textarea
                      name="content"
                      value={currentNote.content}
                      onChange={(e) =>
                        setCurrentNote({
                          ...currentNote,
                          content: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows="4"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 px-6 py-4 border-t">
                  {currentNote.id && (
                    <button
                      onClick={() => deleteNote(currentNote.id)}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                      <FiTrash2 className="inline mr-2 h-4 w-4" />
                      Delete
                    </button>
                  )}
                  <button
                    onClick={closeNoteModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveNote}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FiSave className="inline mr-2 h-4 w-4" />
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default EmployeeDashboard;