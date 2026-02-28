'use client'

import React from 'react'
import { FiLinkedin } from 'react-icons/fi'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface HeaderProps {
  showSample: boolean
  onToggleSample: (val: boolean) => void
}

export default function Header({ showSample, onToggleSample }: HeaderProps) {
  return (
    <header className="border-b border-[#e0e7ee] bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0077B5] text-white">
            <FiLinkedin className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">LinkedIn AI Copilot</h1>
            <p className="text-sm text-gray-500">AI-powered tools to elevate your LinkedIn presence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="sample-toggle" className="text-sm text-gray-500 cursor-pointer">Sample Data</Label>
          <Switch
            id="sample-toggle"
            checked={showSample}
            onCheckedChange={onToggleSample}
          />
        </div>
      </div>
    </header>
  )
}
