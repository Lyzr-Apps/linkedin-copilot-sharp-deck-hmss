'use client'

import React, { useState, useEffect } from 'react'
import { FiCopy, FiCheck, FiTarget, FiMessageCircle, FiUsers, FiStar, FiCheckCircle, FiList } from 'react-icons/fi'
import { callAIAgent } from '@/lib/aiAgent'
import parseLLMJson from '@/lib/jsonParser'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

const AGENT_ID = '69a25d620a6394e18d88a081'

interface EngagementResult {
  engagement_strategy?: {
    daily_actions?: string[]
    weekly_goals?: string[]
  }
  comment_suggestions?: string[]
  connection_templates?: string[]
  profile_tips?: string[]
  networking_score?: number
}

const SAMPLE_RESULT: EngagementResult = {
  engagement_strategy: {
    daily_actions: [
      'Comment on 5 posts from connections in your target industry',
      'Share one piece of valuable content with your own insight added',
      'Send 2 personalized connection requests to people in your field',
      'React to and engage with at least 10 posts in your feed',
      'Spend 15 minutes reading and learning from industry leaders',
    ],
    weekly_goals: [
      'Publish one original LinkedIn post or article',
      'Attend or engage with one LinkedIn Live or Event',
      'Review and update one section of your profile',
      'Reach out to 3 existing connections for a virtual coffee chat',
    ],
  },
  comment_suggestions: [
    'Great perspective on the evolving role of AI in marketing. I\'ve seen similar trends in my own work where AI tools have cut our content research time by 40%. What specific tools are you finding most impactful?',
    'This resonates deeply. The shift from output-focused to outcome-focused leadership is something I\'m actively working on. Have you found any frameworks particularly useful for measuring team outcomes?',
    'Thank you for sharing this data. The correlation between employee autonomy and retention rates is compelling. We implemented a similar flexible policy last quarter and saw a 25% improvement in team satisfaction scores.',
  ],
  connection_templates: [
    'Hi [Name], I noticed your recent post about [topic] and found your insights on [specific point] particularly valuable. I\'m also working in [industry] and would love to connect and exchange ideas. Looking forward to learning from your perspective!',
    'Hello [Name], I came across your profile through [mutual connection/group] and was impressed by your work in [area]. I\'m currently exploring [relevant topic] and believe we could have some great conversations. Would love to connect!',
  ],
  profile_tips: [
    'Add a custom LinkedIn banner that showcases your professional brand and includes a clear value proposition',
    'Include at least 3 featured posts or articles that demonstrate your expertise in your target area',
    'Request recommendations from colleagues who can speak to specific skills mentioned in your target roles',
  ],
  networking_score: 7,
}

interface EngagementCoachProps {
  showSample: boolean
}

export default function EngagementCoach({ showSample }: EngagementCoachProps) {
  const [formData, setFormData] = useState({
    situation: '',
    industry: '',
    postToEngage: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<EngagementResult | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (showSample) {
      setFormData({
        situation: 'Thought Leadership',
        industry: 'Marketing & Advertising',
        postToEngage: '',
      })
      setResult(SAMPLE_RESULT)
      setError(null)
    } else {
      setFormData({ situation: '', industry: '', postToEngage: '' })
      setResult(null)
    }
  }, [showSample])

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSubmit = async () => {
    if (!formData.situation) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      let message = `I need an engagement strategy for LinkedIn. My current situation: ${formData.situation}. Industry: ${formData.industry || 'General'}.`
      if (formData.postToEngage.trim()) {
        message += ` Here is a post I'd like to engage with: "${formData.postToEngage}"`
      }
      const res = await callAIAgent(message, AGENT_ID)

      if (res.success) {
        let parsed = res.response?.result
        if (!parsed || typeof parsed === 'string') {
          parsed = parseLLMJson(res.raw_response || res.response)
        }
        const strategy = parsed?.engagement_strategy
        setResult({
          engagement_strategy: {
            daily_actions: Array.isArray(strategy?.daily_actions) ? strategy.daily_actions : [],
            weekly_goals: Array.isArray(strategy?.weekly_goals) ? strategy.weekly_goals : [],
          },
          comment_suggestions: Array.isArray(parsed?.comment_suggestions) ? parsed.comment_suggestions : [],
          connection_templates: Array.isArray(parsed?.connection_templates) ? parsed.connection_templates : [],
          profile_tips: Array.isArray(parsed?.profile_tips) ? parsed.profile_tips : [],
          networking_score: typeof parsed?.networking_score === 'number' ? parsed.networking_score : 0,
        })
      } else {
        setError(res.error || 'Failed to get engagement strategy. Please try again.')
      }
    } catch (e) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 5) return 'text-yellow-600'
    return 'text-red-500'
  }

  const displayResult = result

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FiTarget className="w-5 h-5 text-[#0077B5]" />
            Engagement Strategy Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Current Situation</Label>
              <Select value={formData.situation} onValueChange={(v) => setFormData(prev => ({ ...prev, situation: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your situation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Job Seeking">Job Seeking</SelectItem>
                  <SelectItem value="Networking">Networking</SelectItem>
                  <SelectItem value="Thought Leadership">Thought Leadership</SelectItem>
                  <SelectItem value="Career Change">Career Change</SelectItem>
                  <SelectItem value="Building Brand">Building Brand</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="eng-industry" className="text-sm font-medium">Industry</Label>
              <Input
                id="eng-industry"
                placeholder="e.g. Marketing"
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="post-engage" className="text-sm font-medium">Post to Engage With (Optional)</Label>
            <Textarea
              id="post-engage"
              placeholder="Paste a LinkedIn post you'd like to engage with (optional)"
              value={formData.postToEngage}
              onChange={(e) => setFormData(prev => ({ ...prev, postToEngage: e.target.value }))}
              rows={3}
              className="mt-1"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.situation}
            className="w-full sm:w-auto bg-[#0077B5] hover:bg-[#005f8d] text-white"
          >
            {loading ? <><Spinner className="mr-2 h-4 w-4" /> Analyzing...</> : 'Get Engagement Strategy'}
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
          {/* Networking Score */}
          {typeof displayResult.networking_score === 'number' && displayResult.networking_score > 0 && (
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="py-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FiStar className="w-5 h-5 text-[#0077B5]" />
                    <span className="text-sm font-medium text-gray-700">Networking Score</span>
                  </div>
                  <span className={`text-2xl font-bold ${scoreColor(displayResult.networking_score)}`}>
                    {displayResult.networking_score}/10
                  </span>
                </div>
                <Progress value={displayResult.networking_score * 10} className="h-2" />
              </CardContent>
            </Card>
          )}

          {/* Daily Actions & Weekly Goals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.isArray(displayResult.engagement_strategy?.daily_actions) && displayResult.engagement_strategy.daily_actions.length > 0 && (
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FiCheckCircle className="w-4 h-4 text-green-600" />
                    Daily Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {displayResult.engagement_strategy.daily_actions.map((action, i) => (
                    <div key={i} className="flex items-start gap-2.5 py-1.5">
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-medium text-gray-500">{i + 1}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-snug">{action}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {Array.isArray(displayResult.engagement_strategy?.weekly_goals) && displayResult.engagement_strategy.weekly_goals.length > 0 && (
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FiList className="w-4 h-4 text-[#0077B5]" />
                    Weekly Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {displayResult.engagement_strategy.weekly_goals.map((goal, i) => (
                    <div key={i} className="flex items-start gap-2.5 py-1.5">
                      <Badge variant="outline" className="shrink-0 text-xs w-6 h-6 rounded-full flex items-center justify-center p-0 border-[#0077B5] text-[#0077B5]">
                        {i + 1}
                      </Badge>
                      <p className="text-sm text-gray-700 leading-snug">{goal}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Comment Suggestions */}
          {Array.isArray(displayResult.comment_suggestions) && displayResult.comment_suggestions.length > 0 && (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FiMessageCircle className="w-4 h-4 text-[#0077B5]" />
                  Comment Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {displayResult.comment_suggestions.map((comment, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-sm text-gray-700 leading-relaxed mb-2">{comment}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(comment, `comment-${i}`)}
                      className="text-gray-500 hover:text-[#0077B5] h-7 px-2"
                    >
                      {copiedId === `comment-${i}` ? <><FiCheck className="w-3.5 h-3.5 mr-1 text-green-600" /> Copied</> : <><FiCopy className="w-3.5 h-3.5 mr-1" /> Copy</>}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Connection Templates */}
          {Array.isArray(displayResult.connection_templates) && displayResult.connection_templates.length > 0 && (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FiUsers className="w-4 h-4 text-[#0077B5]" />
                  Connection Request Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {displayResult.connection_templates.map((template, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-sm text-gray-700 leading-relaxed mb-2">{template}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(template, `template-${i}`)}
                      className="text-gray-500 hover:text-[#0077B5] h-7 px-2"
                    >
                      {copiedId === `template-${i}` ? <><FiCheck className="w-3.5 h-3.5 mr-1 text-green-600" /> Copied</> : <><FiCopy className="w-3.5 h-3.5 mr-1" /> Copy</>}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Profile Tips */}
          {Array.isArray(displayResult.profile_tips) && displayResult.profile_tips.length > 0 && (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FiStar className="w-4 h-4 text-yellow-500" />
                  Profile Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {displayResult.profile_tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5 py-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0077B5] shrink-0 mt-1.5" />
                    <p className="text-sm text-gray-700">{tip}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
