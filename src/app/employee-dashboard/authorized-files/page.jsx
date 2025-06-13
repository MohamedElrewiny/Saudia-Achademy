"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import EmployeeLayout from "../components/Layout";
import { FaSpinner, FaFolder, FaFolderOpen, FaFileAlt, FaDownload, FaEye } from "react-icons/fa";

export default function AuthorizedFilesPage() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState({});
const [token, setToken] = useState("");

useEffect(() => {
  const storedToken = localStorage.getItem("token");
  if (storedToken) {
    setToken(storedToken);
  }
}, []);

useEffect(() => {
  if (!token) return;

  const fetchAuthorizedFiles = async () => {
    try {
      const response = await axios.get(
        "https://file-system-black.vercel.app/access/employee-files",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Response data:", response.data);
      setFolders(response.data.folders || []);
    } catch (error) {
      console.error("Error fetching authorized files:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchAuthorizedFiles();
}, [token]);

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const formatFileType = (mimetype) => {
    return mimetype.split("/")[1] || mimetype;
  };

  return (
    <EmployeeLayout>
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-Royal-Blue mb-8">
          Training Material
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <FaSpinner className="animate-spin text-3xl text-Royal-Green" />
          </div>
        ) : folders.length === 0 ? (
          <p className="text-center text-gray-500">
            You currently have no authorized folders.
          </p>
        ) : (
          <div className="space-y-4">
            {folders.map((folder) => (
              <div key={folder.id} className="border rounded-lg overflow-hidden">
                <div 
                  className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
                  onClick={() => toggleFolder(folder.id)}
                >
                  <div className="flex items-center">
                    {expandedFolders[folder.id] ? 
                      <FaFolderOpen className="text-Royal-Green mr-3" /> : 
                      <FaFolder className="text-Royal-Green mr-3" />
                    }
                    <span className="font-semibold text-gray-800">{folder.name}</span>
                  </div>
                  <span className="text-gray-500">
                    {folder.subfolders?.length || 0} subfolders
                  </span>
                </div>

                {expandedFolders[folder.id] && (
                  <div className="p-4 space-y-4">
                    {folder.subfolders?.map((subfolder) => (
                      <div key={subfolder._id} className="ml-6 border-l-2 border-gray-200 pl-4">
                        <div className="font-medium text-gray-700 mb-2">
                          {subfolder.name}
                        </div>
                        
                        {subfolder.files?.length > 0 ? (
                          <div className="space-y-2">
                            {subfolder.files.map((file) => (
                              <div key={file._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                <div className="flex items-center">
                                  <FaFileAlt className="text-gray-500 mr-3" />
                                  <span className="text-gray-700">{file.originalName}</span>
                                  {/* <span className="ml-3 text-xs text-gray-500">
                                    ({formatFileType(file.mimetype)})
                                  </span> */}
                                </div>
                                <div className="space-x-2">
                                  <a
                                    href={file.secure_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-Royal-Green hover:text-green-700"
                                    download
                                  >
                                    <FaDownload className="mr-1" /> Download
                                  </a>
                                  
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm ml-4">No files in this subfolder</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
}