// app/employee/components/Layout.jsx
"use client"

import Navigation from './Navigation';

export default function EmployeeLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}