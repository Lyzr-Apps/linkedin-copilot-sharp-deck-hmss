'use client'

import React, { useState, useEffect } from 'react'
import { FiCopy, FiCheck, FiEdit3, FiHash, FiTrendingUp, FiInfo, FiSend, FiLinkedin, FiAlertCircle } from 'react-icons/fi'
import { callAIAgent } from '@/lib/aiAgent'
import parseLLMJson from '@/lib/jsonParser'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

const AGENT_ID = '69a25d62affa763185fc38d4'

interface PostResult {
  post_content?: string
  hashtags?: string[]
  post_type?: string
  estimated_engagement?: string
  writing_tip?: string
}

const SAMPLE_RESULT: PostResult = {
  post_content: "The best career advice I ever received wasn't about skills or networking.\n\nIt was about consistency.\n\nEvery day, show up. Share what you learn. Help someone else grow.\n\nAfter 6 months of posting on LinkedIn, I've:\n- Connected with 500+ industry professionals\n- Landed 3 speaking opportunities\n- Received 2 job offers I never applied for\n\nThe secret? There is no secret. Just show up consistently.\n\nWhat's the best career advice you've received? Drop it in the comments.",
  hashtags: ['#CareerGrowth', '#LinkedInTips', '#PersonalBranding', '#Networking', '#ProfessionalDevelopment'],
  post_type: 'Personal Story',
  estimated_engagement: 'high',
  writing_tip: 'Opening with a hook that challenges expectations grabs attention. Pair it with specific numbers to build credibility.',
}

interface PostGeneratorProps {
  showSample: boolean
}

export default function PostGenerator({ showSample }: PostGeneratorProps) {
  const [formData, setFormData] = useState({
    topic: '',
    industry: '',
    tone: '',
    postType: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PostResult | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [publishStatus, setPublishStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    if (showSample) {
      setFormData({
        topic: 'The power of consistency in career growth',
        industry: 'Technology',
        tone: 'Inspirational',
        postType: 'Personal Story',
      })
      setResult(SAMPLE_RESULT)
      setError(null)
    } else {
      setFormData({ topic: '', industry: '', tone: '', postType: '' })
      setResult(null)
    }
  }, [showSample])

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleGenerate = async () => {
    if (!formData.topic.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const message = `Generate a LinkedIn post about: ${formData.topic}. Industry: ${formData.industry || 'General'}. Tone: ${formData.tone || 'Professional'}. Post type: ${formData.postType || 'Industry Insight'}.`
      const res = await callAIAgent(message, AGENT_ID)

      if (res.success) {
        let parsed = res.response?.result
        if (!parsed || typeof parsed === 'string') {
          parsed = parseLLMJson(res.raw_response || res.response)
        }
        setResult({
          post_content: parsed?.post_content ?? '',
          hashtags: Array.isArray(parsed?.hashtags) ? parsed.hashtags : [],
          post_type: parsed?.post_type ?? '',
          estimated_engagement: parsed?.estimated_engagement ?? '',
          writing_tip: parsed?.writing_tip ?? '',
        })
      } else {
        setError(res.error || 'Failed to generate post. Please try again.')
      }
    } catch (e) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePostToLinkedIn = async () => {
    if (!result?.post_content) return
    setPublishing(true)
    setPublishStatus(null)

    try {
      const fullPost = result.post_content +
        (Array.isArray(result.hashtags) && result.hashtags.length > 0
          ? '\n\n' + result.hashtags.join(' ')
          : '')

      const message = `Post the following content to LinkedIn using the LINKEDIN_CREATE_LINKED_IN_POST tool. Here is the exact text to post:\n\n${fullPost}`
      const res = await callAIAgent(message, AGENT_ID)

      if (res.success) {
        let parsed = res.response?.result
        if (!parsed || typeof parsed === 'string') {
          parsed = parseLLMJson(res.raw_response || res.response)
        }

        const postedSuccessfully = parsed?.posted_successfully === true
        const postStatusMsg = parsed?.post_status || ''

        // Check for tool_auth errors (LinkedIn not connected)
        const rawStr = JSON.stringify(res)
        const needsAuth = rawStr.includes('tool_auth')

        if (needsAuth) {
          setPublishStatus({
            type: 'error',
            message: 'LinkedIn authentication required. Please connect your LinkedIn account through the platform settings to enable direct posting.',
          })
        } else if (postedSuccessfully) {
          setPublishStatus({
            type: 'success',
            message: postStatusMsg || 'Your post has been published to LinkedIn successfully.',
          })
        } else {
          setPublishStatus({
            type: 'error',
            message: postStatusMsg || 'The agent could not publish to LinkedIn. Please verify your LinkedIn connection and try again.',
          })
        }
      } else {
        // Check if it's a tool auth error
        const errorStr = res.error || ''
        if (errorStr.includes('tool_auth') || errorStr.includes('authentication')) {
          setPublishStatus({
            type: 'error',
            message: 'LinkedIn authentication required. Please connect your LinkedIn account through the platform settings to enable direct posting.',
          })
        } else {
          setPublishStatus({
            type: 'error',
            message: res.error || 'Failed to post to LinkedIn. Please try again.',
          })
        }
      }
    } catch (e) {
      setPublishStatus({
        type: 'error',
        message: 'An unexpected error occurred while posting. Please try again.',
      })
    } finally {
      setPublishing(false)
    }
  }

  const engagementColor = (level: string) => {
    const l = level?.toLowerCase()
    if (l === 'high') return 'bg-green-100 text-green-800 border-green-200'
    if (l === 'medium') return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const displayResult = result
  const charCount = displayResult?.post_content?.length ?? 0

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FiEdit3 className="w-5 h-5 text-[#0077B5]" />
            Create Your Post
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="topic" className="text-sm font-medium">Topic / Subject</Label>
            <Textarea
              id="topic"
              placeholder="What would you like to post about?"
              value={formData.topic}
              onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
              rows={3}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="industry" className="text-sm font-medium">Industry</Label>
              <Input
                id="industry"
                placeholder="e.g. Technology"
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Tone</Label>
              <Select value={formData.tone} onValueChange={(v) => setFormData(prev => ({ ...prev, tone: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Professional">Professional</SelectItem>
                  <SelectItem value="Casual">Casual</SelectItem>
                  <SelectItem value="Inspirational">Inspirational</SelectItem>
                  <SelectItem value="Thought Leadership">Thought Leadership</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Post Type</Label>
              <Select value={formData.postType} onValueChange={(v) => setFormData(prev => ({ ...prev, postType: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Career Transition">Career Transition</SelectItem>
                  <SelectItem value="Industry Insight">Industry Insight</SelectItem>
                  <SelectItem value="Achievement">Achievement</SelectItem>
                  <SelectItem value="Tip/Advice">Tip / Advice</SelectItem>
                  <SelectItem value="Personal Story">Personal Story</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={loading || !formData.topic.trim()}
            className="w-full sm:w-auto bg-[#0077B5] hover:bg-[#005f8d] text-white"
          >
            {loading ? <><Spinner className="mr-2 h-4 w-4" /> Generating...</> : 'Generate Post'}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="py-4">
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {displayResult && (
        <div className="space-y-4">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Generated Post</CardTitle>
                <div className="flex items-center gap-2">
                  {displayResult.post_type && (
                    <Badge variant="outline" className="border-[#0077B5] text-[#0077B5]">{displayResult.post_type}</Badge>
                  )}
                  {displayResult.estimated_engagement && (
                    <Badge className={engagementColor(displayResult.estimated_engagement)}>
                      <FiTrendingUp className="w-3 h-3 mr-1" />
                      {displayResult.estimated_engagement} engagement
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">{displayResult.post_content}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                  <span className="text-xs text-gray-500">{charCount} characters</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(displayResult.post_content ?? '', 'post')}
                      className="text-gray-500 hover:text-[#0077B5]"
                    >
                      {copiedId === 'post' ? <><FiCheck className="w-4 h-4 mr-1 text-green-600" /> Copied</> : <><FiCopy className="w-4 h-4 mr-1" /> Copy</>}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handlePostToLinkedIn}
                      disabled={publishing}
                      className="bg-[#0077B5] hover:bg-[#005f8d] text-white gap-1.5"
                    >
                      {publishing ? (
                        <><Spinner className="h-3.5 w-3.5" /> Posting...</>
                      ) : (
                        <><FiSend className="w-3.5 h-3.5" /> Post to LinkedIn</>
                      )}
                    </Button>
                  </div>
                </div>

                {publishStatus && (
                  <div className={`mt-3 flex items-start gap-2 rounded-lg p-3 border ${
                    publishStatus.type === 'success'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-300'
                  }`}>
                    {publishStatus.type === 'success' ? (
                      <FiLinkedin className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    ) : (
                      <FiAlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    )}
                    <p className={`text-sm ${publishStatus.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                      {publishStatus.message}
                    </p>
                  </div>
                )}
              </div>

              {Array.isArray(displayResult.hashtags) && displayResult.hashtags.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <FiHash className="w-4 h-4 text-[#0077B5]" />
                    <span className="text-sm font-medium text-gray-700">Hashtags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {displayResult.hashtags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="cursor-pointer hover:bg-[#0077B5]/10" onClick={() => copyToClipboard(tag, `tag-${i}`)}>
                        {copiedId === `tag-${i}` ? <FiCheck className="w-3 h-3 mr-1 text-green-600" /> : null}
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {displayResult.writing_tip && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="py-4">
                <div className="flex items-start gap-2">
                  <FiInfo className="w-4 h-4 text-[#0077B5] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[#0077B5] mb-1">Writing Tip</p>
                    <p className="text-sm text-gray-700">{displayResult.writing_tip}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
