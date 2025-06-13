"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import EmployeeLayout from "../components/Layout";
import Swal from "sweetalert2";
import { FaSpinner, FaCheck, FaClock } from "react-icons/fa";

export default function PublicFilesPage() {
  // const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const response = await axios.get(
        "https://file-system-black.vercel.app/file/getAllFolders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Response data:", response.data);

      const savedRequests = JSON.parse(localStorage.getItem("folderRequests") || "{}");

      const foldersData = response.data.folders.map(folder => ({
        id: folder._id,
        name: folder.name,
        subfolders: folder.subfolders || [],
        status: 
          folder.accessRequests && folder.accessRequests.length > 0
            ? folder.accessRequests[0].status
            : savedRequests[folder._id]?.status || null,
        requested: !!savedRequests[folder._id]
      }));

      setFolders(foldersData);
    } catch (error) {
      console.error("Error fetching folders:", error);
      Swal.fire("Error!", "Failed to load folders.", "error");
    } finally {
      setLoading(false);
    }
  };

  const openRequestModal = (folder) => {
    if (folder.requested) {
      Swal.fire(
        "Request Already Sent",
        "You have already requested access to this folder.",
        "info"
      );
      return;
    }
    setSelectedFolder(folder);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFolder(null);
    setReason("");
  };

  const requestEditPermission = async () => {
    if (!selectedFolder || !reason.trim()) {
      Swal.fire("Error!", "Please enter a valid reason", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "https://file-system-black.vercel.app/access/request-access",
        {
          folderId: selectedFolder.id,
          reason: reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
        console.log("Request submitted successfully:", response.data);


      if (response.data.msg === "Folder access request submitted") {
        const newStatus = response.data.request.status;

        setFolders(prevFolders =>
          prevFolders.map(folder =>
            folder.id === selectedFolder.id
              ? {
                  ...folder,
                  status: newStatus,
                  requested: true,
                }
              : folder
          )
        );

        const savedRequests = JSON.parse(localStorage.getItem("folderRequests") || "{}");
        savedRequests[selectedFolder.id] = { status: newStatus };
        localStorage.setItem("folderRequests", JSON.stringify(savedRequests));

        Swal.fire("Success!", "Access request sent successfully.", "success");
        closeModal();
      } else {
        Swal.fire("Error!", response.data.msg, "error");
        closeModal();
      }
    } catch (error) {
      console.error("Error:", "You have already requested access to this folder." || error.message);
      Swal.fire(
        "Error!",
        "You have already requested access to this folder." || "Failed to submit request",
        "error"
      );
      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <EmployeeLayout>
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-2xl p-8 mt-5">
        <h1 className="text-3xl font-bold text-Royal-Blue mb-8">
          Folder Access Requests
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <FaSpinner className="animate-spin text-3xl text-Royal-Green" />
          </div>
        ) : folders.length === 0 ? (
          <p className="text-center text-gray-500">No folders available.</p>
        ) : (
          <div className="space-y-4">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-lg text-gray-800">
                      {folder.name}
                    </h3>
                    {folder.subfolders.length > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        {folder.subfolders.length} subfolder{folder.subfolders.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  <div className="min-w-[180px]">
                    {folder.status === "pending" || folder.status === "approved" ? (
                      <button
                        disabled
                        className={`flex items-center justify-center gap-2 py-1.5 px-4 rounded-full text-sm font-semibold w-full cursor-not-allowed ${
                          folder.status === "pending"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {folder.status === "pending" ? (
                          <>
                            <FaClock className="text-yellow-500" />
                            Pending Approval
                          </>
                        ) : (
                          <>
                            <FaCheck className="text-green-500" />
                            Access Approved
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => openRequestModal(folder)}
                        disabled={folder.requested}
                        className={`py-1.5 px-4 rounded-full text-sm font-semibold transition w-full ${
                          folder.requested
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-Royal-Green text-white hover:bg-green-700"
                        }`}
                      >
                        Request Access
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Request Access Modal */}
        {showModal && selectedFolder && (
          <div className="fixed inset-0 bg-Wadi bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Request Folder Access</h2>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Folder Name:</label>
                <input
                  type="text"
                  value={selectedFolder.name}
                  className="w-full p-2 border rounded bg-gray-100"
                  readOnly
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Reason for Access:
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Please explain why you need access..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={requestEditPermission}
                  className="flex items-center justify-center px-4 py-2 bg-Royal-Green text-white rounded hover:bg-green-700 transition min-w-[120px]"
                  disabled={!reason.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
}