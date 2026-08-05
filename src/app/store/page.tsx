'use client'

import Link from "next/link";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function StorePage() {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
    </div>
  )
}