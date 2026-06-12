'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

type UserRole = 'admin' | 'operator' | 'viewer' | null

interface ProtectedButtonProps {
  roles: ('admin' | 'operator' | 'viewer')[]
  children: React.ReactNode
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}

export default function ProtectedButton({ 
  roles, 
  children, 
  onClick, 
  className = '',
  type = 'button',
  disabled = false,
}: ProtectedButtonProps) {
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadRole() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setUserRole(null)
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      setUserRole(data?.role || 'viewer')
      setLoading(false)
    }

    loadRole()
  }, [])

  if (loading) {
    return null
  }

  if (!userRole || !roles.includes(userRole)) {
    return null
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={className}
      disabled={disabled}
    >
      {children}
    </button>
  )
}