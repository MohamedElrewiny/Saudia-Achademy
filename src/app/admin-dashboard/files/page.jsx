"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaEye } from "react-icons/fa";
import {
  FiTrash2,
  // FiDownload,
  FiFolder,
  FiPlus,
  FiUpload,
  FiX,
} from "react-icons/fi";
import Swal from "sweetalert2";
import AdminLayout from "../components/AdminLayout";
import axios from "axios";

export default function FilesManagementPage() {
  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isAddSubfolderModalOpen, setIsAddSubfolderModalOpen] = useState(false);
  const [isUploadFileModalOpen, setIsUploadFileModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newSubfolderName, setNewSubfolderName] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [selectedSubfolderName, setSelectedSubfolderName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch folders from API
  const fetchFolders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://file-system-black.vercel.app/file/getAllFolders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFolders(response.data.folders);
    } catch (error) {
      console.error("Error fetching folders:", error);
      Swal.fire("Error!", "Failed to load folders.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  // Helper function to count total files in a folder and its subfolders
  const countFiles = (folder) => {
    let count = 0;
    folder.subfolders.forEach((subfolder) => {
      count += subfolder.files.length;
    });
    return count;
  };

  // Download file
  const downloadFile = (fileUrl, fileName) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create new folder
  const createFolder = async () => {
    if (!newFolderName) {
      Swal.fire("Error!", "Please enter a folder name.", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "https://file-system-black.vercel.app/file/create-folder",
        { name: newFolderName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      await fetchFolders();
      setIsCreateFolderModalOpen(false);
      setNewFolderName("");
      Swal.fire("Success!", "Folder created successfully.", "success");
    } catch (error) {
      console.error("Error creating folder:", error);
      Swal.fire("Error!", "Failed to create folder.", "error");
    }
  };

  // Add subfolder
  const addSubfolder = async () => {
    if (!selectedFolderId || !newSubfolderName) {
      Swal.fire(
        "Error!",
        "Please select a folder and enter subfolder name.",
        "error"
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `https://file-system-black.vercel.app/file/${selectedFolderId}/add-subfolder`,
        { subfolders: [{ name: newSubfolderName }] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      await fetchFolders();
      setIsAddSubfolderModalOpen(false);
      setNewSubfolderName("");
      setSelectedFolderId("");
      Swal.fire("Success!", "Subfolder added successfully.", "success");
    } catch (error) {
      console.error("Error adding subfolder:", error);
      Swal.fire("Error!", "Failed to add subfolder.", "error");
    }
  };

  // Upload file
  const uploadFile = async () => {
    if (!selectedFolderId || !selectedSubfolderName || !selectedFile) {
      Swal.fire(
        "Error!",
        "Please select folder, subfolder and a file.",
        "error"
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("files[]", selectedFile);

      const response = await axios.post(
        `https://file-system-black.vercel.app/file/${selectedFolderId}/${selectedSubfolderName}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("File upload response:", response.data);
      if (response.data.message === "Error") {
        Swal.fire({
          icon: "error",
          title: response.data.message,
          text: response.data.err,
        });
        return;
      }
      await fetchFolders();
      // setIsUploadFileModalOpen(false);
      setSelectedFile(null);
      setSelectedFolderId("");
      setSelectedSubfolderName("");
      Swal.fire("Success!", "File uploaded successfully.", "success");
    } catch (error) {
      console.error("Error uploading file:", error);
      Swal.fire("Error!", "Failed to upload file.", "error");
    }
  };

  // Delete folder
  const deleteFolder = async (folderId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will delete the folder and all its contents!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(
            `https://file-system-black.vercel.app/file/deleteFolder/${folderId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          await fetchFolders();
          Swal.fire("Deleted!", "Folder has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting folder:", error);
          Swal.fire("Error!", "Failed to delete folder.", "error");
        }
      }
    });
  };

  // Delete subfolder
  const deleteSubfolder = async (folderId, subfolderName) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will delete the subfolder and all its files!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(
            `https://file-system-black.vercel.app/file/deleteSubfolder/${folderId}/${subfolderName}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          await fetchFolders();
          Swal.fire("Deleted!", "Subfolder has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting subfolder:", error);
          Swal.fire("Error!", "Failed to delete subfolder.", "error");
        }
      }
    });
  };

  // Delete file
  const deleteFile = async (folderId, subfolderName, fileId) => {
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
          await axios.delete(
            `https://file-system-black.vercel.app/file/deleteFile/${folderId}/${subfolderName}/${fileId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          await fetchFolders();
          Swal.fire("Deleted!", "File has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting file:", error);
          Swal.fire("Error!", "Failed to delete file.", "error");
        }
      }
    });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  return (
    <AdminLayout>
      <div className=" p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col space-y-4 mb-8 md:space-y-0 md:flex-row md:justify-between md:items-center">
  {/* Left side - Title & Description */}
  <div className="flex flex-col md:block">
    <div className="flex flex-col md:block md:mb-0">
      <h1 className="text-2xl font-bold text-gray-900">Files Management</h1>
      <p className="mt-1 text-sm text-gray-600">
        View and manage all files in the system
      </p>
    </div>
    
    {/* Search input - on small screens beside title */}
    <div className="mt-2 md:hidden">
      <input
        type="text"
        placeholder="Search folders..."
        className="w-full px-3 py-2 border border-gray-500 rounded-md text-sm mt-2"
        value={newFolderName}
        onChange={e => {
          setNewFolderName(e.target.value);
          setFolders(
            e.target.value
              ? folders.filter(folder =>
                  folder.name.toLowerCase().includes(e.target.value.toLowerCase())
                )
              : (() => {
                  fetchFolders();
                  return folders;
                })()
          );
        }}
      />
    </div>
  </div>

  {/* Right side */}
  <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:space-x-2">
    {/* Search input for medium+ screens */}
    <div className="hidden md:block">
      <input
        type="text"
        placeholder="Search folders..."
        className="px-3 py-2 border border-gray-500 rounded-md text-sm"
        value={newFolderName}
        onChange={e => {
          setNewFolderName(e.target.value);
          setFolders(
            e.target.value
              ? folders.filter(folder =>
                  folder.name.toLowerCase().includes(e.target.value.toLowerCase())
                )
              : (() => {
                  fetchFolders();
                  return folders;
                })()
          );
        }}
      />
    </div>

    {/* Buttons - stacked on small screens, inline on md+ */}
    <button
      onClick={() => setIsCreateFolderModalOpen(true)}
      className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
    >
      <FiPlus className="mr-2 h-4 w-4" />
      New Folder
    </button>
    <button
      onClick={() => setIsAddSubfolderModalOpen(true)}
      className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
    >
      <FiPlus className="mr-2 h-4 w-4" />
      Add Subfolder
    </button>
    <button
      onClick={() => setIsUploadFileModalOpen(true)}
      className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-Royal-Blue hover:bg-Royal-Blue-700"
    >
      <FiUpload className="mr-2 h-4 w-4" />
      Upload File
    </button>
  </div>
</div>


          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-y-auto" style={{ maxHeight: "500px" }}>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Folder/File Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {folders.map((folder) => (
                      <>
                        {/* Folder row */}
                        <motion.tr
                          key={folder._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-gray-50 bg-gray-100"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="flex items-center">
                              <FiFolder className="mr-2 text-blue-500" />
                              {folder.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Folder ({countFiles(folder)} files)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button
                                className="text-red-600 hover:text-red-800 cursor-pointer"
                                onClick={() => deleteFolder(folder._id)}
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>

                        {/* Subfolders and files */}
                        {folder.subfolders.map((subfolder) => (
                          <>
                            {/* Subfolder row */}
                            <motion.tr
                              key={`${folder._id}-${subfolder._id}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="hover:bg-gray-50 bg-gray-50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 pl-10">
                                <div className="flex items-center">
                                  <FiFolder className="mr-2 text-blue-400" />
                                  {subfolder.name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                Subfolder ({subfolder.files.length} files)
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex space-x-2">
                                  <button
                                    className="text-red-600 hover:text-red-800 cursor-pointer"
                                    onClick={() =>
                                      deleteSubfolder(
                                        folder._id,
                                        subfolder.name
                                      )
                                    }
                                  >
                                    <FiTrash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>

                            {/* Files in subfolder */}
                            {subfolder.files.map((file) => (
                              <motion.tr
                                key={file._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 pl-16">
                                  {file.originalName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {file.mimetype.split("/")[1] || "File"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex space-x-2">
                                    
                                    <button
                                      onClick={() =>
                                        deleteFile(
                                          folder._id,
                                          subfolder.name,
                                          file._id
                                        )
                                      }
                                      className="text-red-600 hover:text-red-800 cursor-pointer"
                                    >
                                      <FiTrash2 className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        downloadFile(
                                          file.secure_url,
                                          file.originalName
                                        )
                                      }
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      <FaEye  className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </>
                        ))}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Folder Modal */}
      {isCreateFolderModalOpen && (
        <div className="fixed inset-0 bg-Wadi bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Create New Folder
              </h3>
              <button
                onClick={() => {
                  setIsCreateFolderModalOpen(false);
                  setNewFolderName("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter folder name"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 px-6 py-4 ">
              <button
                onClick={() => {
                  setIsCreateFolderModalOpen(false);
                  setNewFolderName("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createFolder}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subfolder Modal */}
      {isAddSubfolderModalOpen && (
        <div className="fixed inset-0 bg-Wadi bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Add Subfolder
              </h3>
              <button
                onClick={() => {
                  setIsAddSubfolderModalOpen(false);
                  setNewSubfolderName("");
                  setSelectedFolderId("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Folder
                </label>
                <select
                  value={selectedFolderId}
                  onChange={(e) => setSelectedFolderId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select a folder</option>
                  {folders.map((folder) => (
                    <option key={folder._id} value={folder._id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subfolder Name
                </label>
                <input
                  type="text"
                  value={newSubfolderName}
                  onChange={(e) => setNewSubfolderName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter subfolder name"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 px-6 py-4 ">
              <button
                onClick={() => {
                  setIsAddSubfolderModalOpen(false);
                  setNewSubfolderName("");
                  setSelectedFolderId("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addSubfolder}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload File Modal */}
      {isUploadFileModalOpen && (
        <div className="fixed inset-0 bg-Wadi bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">Upload File</h3>
              <button
                onClick={() => {
                  setIsUploadFileModalOpen(false);
                  setSelectedFile(null);
                  setSelectedFolderId("");
                  setSelectedSubfolderName("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Folder
                </label>
                <select
                  value={selectedFolderId}
                  onChange={(e) => setSelectedFolderId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select a folder</option>
                  {folders.map((folder) => (
                    <option key={folder._id} value={folder._id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Subfolder
                </label>
                <select
                  value={selectedSubfolderName}
                  onChange={(e) => setSelectedSubfolderName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  disabled={!selectedFolderId}
                >
                  <option value="">Select a subfolder</option>
                  {selectedFolderId &&
                    folders
                      .find((f) => f._id === selectedFolderId)
                      ?.subfolders.map((subfolder) => (
                        <option key={subfolder._id} value={subfolder.name}>
                          {subfolder.name}
                        </option>
                      ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select File
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 px-6 py-4 ">
              <button
                onClick={() => {
                  setIsUploadFileModalOpen(false);
                  setSelectedFile(null);
                  setSelectedFolderId("");
                  setSelectedSubfolderName("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={uploadFile}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-Royal-Blue hover:bg-Royal-Blue-700"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
