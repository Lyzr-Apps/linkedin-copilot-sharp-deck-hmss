'use client'

import React, { useState, useEffect } from 'react'
import { FiEdit3, FiTarget, FiUser, FiLinkedin, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import Header from './sections/Header'
import PostGenerator from './sections/PostGenerator'
import EngagementCoach from './sections/EngagementCoach'
import ProfileOptimizer from './sections/ProfileOptimizer'

// Agent metadata for status display
const AGENTS = [
  { id: '69a25d62affa763185fc38d4', name: 'Post Generator', purpose: 'Creates engaging LinkedIn posts' },
  { id: '69a25d620a6394e18d88a081', name: 'Engagement Coach', purpose: 'Provides engagement strategies and comment templates' },
  { id: '69a25d63305bea55e2780a99', name: 'Profile Optimizer', purpose: 'Optimizes headline, about section, and keywords' },
]

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const THEME_VARS = {
  '--background': '0 0% 100%',
  '--foreground': '222 47% 11%',
  '--card': '0 0% 100%',
  '--card-foreground': '222 47% 11%',
  '--primary': '201 100% 36%',
  '--primary-foreground': '0 0% 100%',
  '--secondary': '210 40% 96%',
  '--secondary-foreground': '222 47% 11%',
  '--muted': '210 40% 96%',
  '--muted-foreground': '215 16% 47%',
  '--accent': '210 40% 96%',
  '--accent-foreground': '222 47% 11%',
  '--border': '214 32% 91%',
  '--input': '214 32% 91%',
  '--ring': '201 100% 36%',
  '--destructive': '0 84% 60%',
  '--destructive-foreground': '0 0% 98%',
  '--radius': '0.5rem',
} as React.CSSProperties

export default function Page() {
  const [showSample, setShowSample] = useState(false)
  const [activeTab, setActiveTab] = useState('post-generator')
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking')

  useEffect(() => {
    let retries = 0
    const checkBackend = async () => {
      try {
        const res = await fetch('/api/agent', { method: 'GET' })
        if (res.ok) {
          setBackendStatus('connected')
        } else if (retries < 3) {
          retries++
          setTimeout(checkBackend, 2000)
        } else {
          setBackendStatus('error')
        }
      } catch {
        if (retries < 3) {
          retries++
          setTimeout(checkBackend, 2000)
        } else {
          setBackendStatus('error')
        }
      }
    }
    checkBackend()
  }, [])

  const retryConnection = () => {
    setBackendStatus('checking')
    fetch('/api/agent', { method: 'GET' })
      .then(res => {
        setBackendStatus(res.ok ? 'connected' : 'error')
      })
      .catch(() => setBackendStatus('error'))
  }

  return (
    <ErrorBoundary>
      <div style={THEME_VARS} className="min-h-screen bg-[#f8f9fb]">
        <Header showSample={showSample} onToggleSample={setShowSample} />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {backendStatus === 'error' && (
            <Card className="mb-6 border-amber-300 bg-amber-50">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiAlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-800">
                      Unable to connect to the backend. The server may still be starting up. You can use Sample Data mode while waiting.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={retryConnection}
                    className="shrink-0 ml-3 border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    <FiRefreshCw className="w-3.5 h-3.5 mr-1" /> Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-white border border-gray-200 h-12">
              <TabsTrigger value="post-generator" className="flex items-center gap-2 data-[state=active]:bg-[#0077B5] data-[state=active]:text-white transition-all">
                <FiEdit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Post Generator</span>
                <span className="sm:hidden text-xs">Posts</span>
              </TabsTrigger>
              <TabsTrigger value="engagement-coach" className="flex items-center gap-2 data-[state=active]:bg-[#0077B5] data-[state=active]:text-white transition-all">
                <FiTarget className="w-4 h-4" />
                <span className="hidden sm:inline">Engagement Coach</span>
                <span className="sm:hidden text-xs">Engage</span>
              </TabsTrigger>
              <TabsTrigger value="profile-optimizer" className="flex items-center gap-2 data-[state=active]:bg-[#0077B5] data-[state=active]:text-white transition-all">
                <FiUser className="w-4 h-4" />
                <span className="hidden sm:inline">Profile Optimizer</span>
                <span className="sm:hidden text-xs">Profile</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="post-generator">
              <PostGenerator showSample={showSample} />
            </TabsContent>

            <TabsContent value="engagement-coach">
              <EngagementCoach showSample={showSample} />
            </TabsContent>

            <TabsContent value="profile-optimizer">
              <ProfileOptimizer showSample={showSample} />
            </TabsContent>
          </Tabs>

          {/* Agent Status Section */}
          <Card className="mt-8 border-gray-200 shadow-sm bg-white">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-3">
                <FiLinkedin className="w-4 h-4 text-[#0077B5]" />
                <span className="text-sm font-medium text-gray-700">Powered by AI Agents</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {AGENTS.map((agent) => {
                  const isActive = (
                    (activeTab === 'post-generator' && agent.id === '69a25d62affa763185fc38d4') ||
                    (activeTab === 'engagement-coach' && agent.id === '69a25d620a6394e18d88a081') ||
                    (activeTab === 'profile-optimizer' && agent.id === '69a25d63305bea55e2780a99')
                  )
                  return (
                    <div
                      key={agent.id}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 border transition-all ${isActive ? 'border-[#0077B5] bg-blue-50/50' : 'border-gray-100 bg-gray-50'}`}
                    >
                      <div className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-[#0077B5] animate-pulse' : 'bg-gray-300'}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{agent.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{agent.purpose}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ErrorBoundary>
  )
}
