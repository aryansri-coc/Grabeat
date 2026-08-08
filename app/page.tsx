'use client'

import { useState } from 'react'
import StudentPortal from '@/components/dashboard/student-portal'
import DashboardApp from '@/components/dashboard/dashboard-app'

export default function Page() {
  const [viewMode, setViewMode] = useState<'student' | 'admin'>('student')

  if (viewMode === 'admin') {
    return <DashboardApp onSwitchToStudent={() => setViewMode('student')} />
  }

  return <StudentPortal onSwitchToAdmin={() => setViewMode('admin')} />
}
