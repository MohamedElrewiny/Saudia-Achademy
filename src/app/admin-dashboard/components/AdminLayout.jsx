// app/admin-dashboard/components/AdminLayout.jsx
"use client"

import AdminNavigation from './AdminNavigation';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
