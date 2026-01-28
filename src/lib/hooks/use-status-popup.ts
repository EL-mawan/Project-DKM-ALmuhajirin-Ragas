'use client'

import { useState, useCallback } from 'react'

export type StatusType = 'success' | 'error' | 'loading'

interface StatusState {
  isOpen: boolean
  type: StatusType
  title: string
  description?: string
}

export function useStatusPopup() {
  const [status, setStatus] = useState<StatusState>({
    isOpen: false,
    type: 'success',
    title: '',
    description: ''
  })

  const showStatus = useCallback((type: StatusType, title: string, description?: string) => {
    setStatus({
      isOpen: true,
      type,
      title,
      description
    })
  }, [])

  const hideStatus = useCallback(() => {
    setStatus(prev => ({ ...prev, isOpen: false }))
  }, [])

  const showSuccess = useCallback((title: string, description?: string) => {
    showStatus('success', title, description)
  }, [showStatus])

  const showError = useCallback((title: string, description?: string) => {
    showStatus('error', title, description)
  }, [showStatus])

  const showLoading = useCallback((title: string, description?: string) => {
    showStatus('loading', title, description)
  }, [showStatus])

  return {
    statusProps: {
      ...status,
      onClose: hideStatus
    },
    showSuccess,
    showError,
    showLoading,
    hideStatus
  }
}
