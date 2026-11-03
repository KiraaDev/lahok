import { Suspense } from 'react'
import SignOutButton from '@/components/sign-out-button'

export default function Dashboard() {
  return (
    <div>
      <h1>Staff Dashboard</h1>
      <Suspense fallback={<div>Loading button...</div>}>
        <SignOutButton />
      </Suspense>
    </div>
  )
}