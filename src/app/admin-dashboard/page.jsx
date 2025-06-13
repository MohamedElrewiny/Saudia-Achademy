"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiEdit, FiTrash2, FiSave, FiX, FiPlus } from "react-icons/fi";
import Swal from "sweetalert2";
import AdminLayout from "./components/AdminLayout";
import axios from "axios";

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linksLoading, setLinksLoading] = useState(true);
  const [error, setError] = useState(null);
  const [links, setLinks] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentLink, setCurrentLink] = useState(null);
  const [editedLink, setEditedLink] = useState({
    title: "",
    url: "",
    description: "",
    image: null,
    oldImage: null,
  });
  const [newItem, setNewItem] = useState({
    image: null,
    title: "",
    url: "",
    description: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchEmployeeFolderAccess = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://file-system-black.vercel.app/access/get-file-access",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const employeeMap = new Map();

      response.data.foldersWithAccess.forEach((entry) => {
        const folderName = entry.folder.name;
        if (entry.allowedEmployees && Array.isArray(entry.allowedEmployees)) {
          entry.allowedEmployees.forEach((emp) => {
            if (!employeeMap.has(emp.id)) {
              employeeMap.set(emp.id, {
                id: emp.id,
                name: emp.username,
                email: emp.email || "----",
                folders: [folderName],
              });
            } else {
              const existing = employeeMap.get(emp.id);
              employeeMap.set(emp.id, {
                ...existing,
                folders: [...existing.folders, folderName],
              });
            }
          });
        }
      });

      setEmployees(Array.from(employeeMap.values()));
      console.log("Employees with file access:", employees);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
      Swal.fire("Error!", "Failed to fetch instructor data", "error");
    }
  };

  const fetchLinks = async () => {
    try {
      setLinksLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://file-system-black.vercel.app/links/get-employee-links",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
      setLinks(response.data.links);
      setLinksLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLinksLoading(false);
      Swal.fire("Error!", "Failed to fetch links data", "error");
    }
  };

  useEffect(() => {
    fetchEmployeeFolderAccess();
    fetchLinks();
  }, []);

  const openEditModal = (link) => {
    setCurrentLink(link);
    setEditedLink({
      title: link.title,
      url: link.url,
      description: link.description || "",
      image: link.image?.secure_url || null,
      oldImage: link.image?.secure_url || null,
    });
    setIsEditModalOpen(true);
  };

  const openAddModal = () => {
    setNewItem({ image: null, title: "", url: "", description: "" });
    setIsAddModalOpen(true);
  };

  const closeModals = () => {
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
    setCurrentLink(null);
    setEditedLink({
      title: "",
      url: "",
      description: "",
      image: null,
      oldImage: null,
    });
    setNewItem({ image: null, title: "", url: "", description: "" });
  };

  const handleEditLinkChange = (e) => {
    const { name, value } = e.target;
    setEditedLink((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setNewItem((prev) => ({ ...prev, image: file }));
  };

  const saveEditedLink = async () => {
    if (!editedLink.title || !editedLink.url) {
      Swal.fire("Error!", "Please fill in all required fields.", "error");
      return;
    }

    try {
      setIsUpdating(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("title", editedLink.title);
      formData.append("url", editedLink.url);
      formData.append("description", editedLink.description || "");

      if (editedLink.image instanceof File) {
        formData.append("linkImage", editedLink.image);
      }

      const response = await axios.put(
        `https://file-system-black.vercel.app/links/update-link/${currentLink._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.msg === "Link updated successfully") {
        await fetchLinks();
        closeModals();
        Swal.fire("Updated!", "Link has been updated successfully.", "success");
      } else {
        throw new Error(response.data.message || "Failed to update link");
      }
    } catch (err) {
      Swal.fire("Error!", err.message || "Failed to update link", "error");
      console.error("Error updating link:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const addNewItem = async () => {
    if (!newItem.title || !newItem.url || !newItem.description) {
      Swal.fire("Error!", "Please fill in all required fields.", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("title", newItem.title);
      formData.append("url", newItem.url);
      formData.append("description", newItem.description);
      if (newItem.image) {
        formData.append("linkImage", newItem.image);
      }

      const response = await axios.post(
        "https://file-system-black.vercel.app/links/add-link",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response);
      if (response.data.msg === "Global link added successfully") {
        await fetchLinks();
        closeModals();
        Swal.fire(
          "Success!",
          "New course has been added successfully.",
          "success"
        );
      } else {
        throw new Error(response.data.message || "Failed to add course");
      }
    } catch (err) {
      Swal.fire("Error!", err.message || "Failed to add course", "error");
      console.error("Error adding course:", err);
    }
  };

  const deleteLink = async (linkId) => {
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
        try {
          const token = localStorage.getItem("token");
          const response = await axios.delete(
            `https://file-system-black.vercel.app/links/delete-link/${linkId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.data.msg === "Link deleted successfully") {
            setLinks(links.filter((link) => link._id !== linkId));
            Swal.fire("Deleted!", "Link has been deleted.", "success");
          } else {
            throw new Error(response.data.message || "Failed to delete link");
          }
        } catch (err) {
          Swal.fire("Error!", err.message || "Failed to delete link", "error");
        }
      }
    });
  };

  return (
    <AdminLayout>
      <div className="p-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Employees Table */}
<div>
  <h2 className="text-2xl font-bold text-gray-900 mb-4">
    Instructors Folder Access
  </h2>

  {loading ? (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ) : error ? (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {error}
    </div>
  ) : employees.length === 0 ? (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
      No instructors found with folder access.
    </div>
  ) : (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                UserName
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Accessible Folders
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee) => (
              <motion.tr
                key={employee.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {employee.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.email}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {employee.folders?.join(", ") || "No access"}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )}
</div>


          {/* Links Table */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Apps</h2>
              <button
                onClick={openAddModal}
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FiPlus className="mr-2 h-4 w-4" />
                Add New Course
              </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {linksLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Image
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          URL
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {links.map((link) => (
                        <motion.tr
                          key={link._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            {link.image?.secure_url ? (
                              <img
                                src={link.image?.secure_url}
                                alt="Link Image"
                                width={50}
                                height={50}
                                className="rounded-md"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-500"></div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {link.title}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {link.description || "No description"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {link.url}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openEditModal(link)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <FiEdit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteLink(link._id)}
                                className="text-red-600 hover:text-red-800"
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
              )}
            </div>
          </div>

          {/* Edit Link Modal */}
          {isEditModalOpen && (
            <div className="fixed inset-0 bg-Wadi bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center border-b px-6 py-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Edit App
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
                      Course Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={editedLink.title}
                      onChange={handleEditLinkChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      URL
                    </label>
                    <input
                      type="url"
                      name="url"
                      value={editedLink.url}
                      onChange={handleEditLinkChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={editedLink.description}
                      onChange={handleEditLinkChange}
                      rows={3}
                      className="mt-1 block w-full resize-none border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Course Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setEditedLink((prev) => ({
                            ...prev,
                            image: e.target.files[0],
                            oldImage: prev.image,
                          }));
                        }
                      }}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {editedLink.image && (
                      <img
                        src={
                          editedLink.image instanceof File
                            ? URL.createObjectURL(editedLink.image)
                            : editedLink.image
                        }
                        alt="Current"
                        className="mt-2 h-20 w-20 object-cover rounded"
                      />
                    )}
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
                    onClick={saveEditedLink}
                    disabled={isUpdating}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isUpdating ? (
                      "Updating..."
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

          {/* Add Course Modal */}
          {isAddModalOpen && (
            <div className="fixed inset-0 bg-Wadi bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center border-b px-6 py-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Add New Course
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
                      Course Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Course Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={newItem.title}
                      onChange={handleAddItemChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      URL
                    </label>
                    <input
                      type="url"
                      name="url"
                      value={newItem.url}
                      onChange={handleAddItemChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={newItem.description}
                      onChange={handleAddItemChange}
                      rows={3}
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
                    onClick={addNewItem}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <FiPlus className="inline mr-2 h-4 w-4" />
                    Add Course
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

export default AdminDashboard;
