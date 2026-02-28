'use client'

import React, { useState, useEffect } from 'react'
import { FiCopy, FiCheck, FiUser, FiSearch, FiAward, FiArrowUp, FiGrid, FiAlertCircle } from 'react-icons/fi'
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
import { Separator } from '@/components/ui/separator'

const AGENT_ID = '69a25d63305bea55e2780a99'

interface SectionRec {
  section_name?: string
  recommendation?: string
}

interface ProfileResult {
  optimized_headline?: string
  optimized_about?: string
  keyword_suggestions?: string[]
  section_recommendations?: SectionRec[]
  visibility_score?: number
  improvement_priorities?: string[]
}

const SAMPLE_RESULT: ProfileResult = {
  optimized_headline: 'Senior Marketing Strategist | Driving 3x Revenue Growth Through Data-Driven Campaigns | AI & MarTech Enthusiast | Speaker & Mentor',
  optimized_about: "I help B2B companies transform their marketing from cost center to revenue engine.\n\nOver the past 8 years, I've led marketing teams at both startups and Fortune 500 companies, consistently delivering:\n\n- 300% increase in qualified lead generation\n- 45% improvement in customer acquisition cost\n- $12M+ in attributed pipeline revenue\n\nMy approach combines data-driven strategy with creative storytelling. I believe the best marketing doesn't feel like marketing -- it feels like value.\n\nCurrently, I'm exploring how AI and automation can make marketing teams 10x more effective without losing the human touch.\n\nLet's connect if you're interested in:\n- Marketing strategy and growth\n- AI in marketing\n- Building high-performing teams\n- Speaking opportunities",
  keyword_suggestions: ['Digital Marketing', 'B2B Marketing', 'Marketing Strategy', 'Lead Generation', 'Revenue Growth', 'Data Analytics', 'MarTech', 'AI Marketing', 'Content Strategy', 'Growth Marketing'],
  section_recommendations: [
    { section_name: 'Experience', recommendation: 'Add quantifiable achievements to each role. Use the formula: Action + Metric + Result. For example, "Led email marketing redesign resulting in 45% increase in open rates and $2M additional revenue."' },
    { section_name: 'Skills', recommendation: 'Reorder your skills to prioritize the most relevant ones for your target role. Get endorsements from senior colleagues for your top 3 skills.' },
    { section_name: 'Featured', recommendation: 'Add 3-5 featured posts or articles that showcase your expertise. Include case studies, thought leadership pieces, and any media appearances.' },
    { section_name: 'Recommendations', recommendation: 'Request recommendations from direct reports, peers, and supervisors to show a 360-degree view of your professional impact.' },
  ],
  visibility_score: 78,
  improvement_priorities: [
    'Add a compelling Featured section with your best content and case studies',
    'Increase engagement by posting original content at least twice per week',
    'Request 5 new recommendations from recent collaborators to strengthen social proof',
  ],
}

interface ProfileOptimizerProps {
  showSample: boolean
}

export default function ProfileOptimizer({ showSample }: ProfileOptimizerProps) {
  const [formData, setFormData] = useState({
    headline: '',
    about: '',
    targetRole: '',
    industry: '',
    experience: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ProfileResult | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (showSample) {
      setFormData({
        headline: 'Marketing Manager at TechCorp',
        about: 'Experienced marketing professional with 8 years in B2B marketing.',
        targetRole: 'Senior Marketing Strategist',
        industry: 'Technology',
        experience: '8',
      })
      setResult(SAMPLE_RESULT)
      setError(null)
    } else {
      setFormData({ headline: '', about: '', targetRole: '', industry: '', experience: '' })
      setResult(null)
    }
  }, [showSample])

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleOptimize = async () => {
    if (!formData.headline.trim() && !formData.about.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const message = `Optimize my LinkedIn profile. Current headline: "${formData.headline}". About/Summary: "${formData.about}". Target job title(s): ${formData.targetRole || 'Not specified'}. Industry: ${formData.industry || 'General'}. Years of experience: ${formData.experience || 'Not specified'}.`
      const res = await callAIAgent(message, AGENT_ID)

      if (res.success) {
        let parsed = res.response?.result
        if (!parsed || typeof parsed === 'string') {
          parsed = parseLLMJson(res.raw_response || res.response)
        }
        const secRecs = Array.isArray(parsed?.section_recommendations) ? parsed.section_recommendations : []
        setResult({
          optimized_headline: parsed?.optimized_headline ?? '',
          optimized_about: parsed?.optimized_about ?? '',
          keyword_suggestions: Array.isArray(parsed?.keyword_suggestions) ? parsed.keyword_suggestions : [],
          section_recommendations: secRecs.map((r: any) => ({
            section_name: r?.section_name ?? '',
            recommendation: r?.recommendation ?? '',
          })),
          visibility_score: typeof parsed?.visibility_score === 'number' ? parsed.visibility_score : 0,
          improvement_priorities: Array.isArray(parsed?.improvement_priorities) ? parsed.improvement_priorities : [],
        })
      } else {
        setError(res.error || 'Failed to optimize profile. Please try again.')
      }
    } catch (e) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const visibilityColor = (score: number) => {
    if (score >= 70) return { text: 'text-green-600', bg: 'bg-green-500', label: 'Strong' }
    if (score >= 40) return { text: 'text-yellow-600', bg: 'bg-yellow-500', label: 'Moderate' }
    return { text: 'text-red-500', bg: 'bg-red-500', label: 'Needs Work' }
  }

  const displayResult = result

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FiUser className="w-5 h-5 text-[#0077B5]" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="current-headline" className="text-sm font-medium">Current Headline</Label>
            <Input
              id="current-headline"
              placeholder="e.g. Marketing Manager at TechCorp"
              value={formData.headline}
              onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="current-about" className="text-sm font-medium">About / Summary</Label>
            <Textarea
              id="current-about"
              placeholder="Paste your current LinkedIn About section here..."
              value={formData.about}
              onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
              rows={4}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="target-role" className="text-sm font-medium">Target Job Title(s)</Label>
              <Input
                id="target-role"
                placeholder="e.g. Senior Strategist"
                value={formData.targetRole}
                onChange={(e) => setFormData(prev => ({ ...prev, targetRole: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="opt-industry" className="text-sm font-medium">Industry</Label>
              <Input
                id="opt-industry"
                placeholder="e.g. Technology"
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="experience" className="text-sm font-medium">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                placeholder="e.g. 5"
                min="0"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
          <Button
            onClick={handleOptimize}
            disabled={loading || (!formData.headline.trim() && !formData.about.trim())}
            className="w-full sm:w-auto bg-[#0077B5] hover:bg-[#005f8d] text-white"
          >
            {loading ? <><Spinner className="mr-2 h-4 w-4" /> Optimizing...</> : 'Optimize Profile'}
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
          {/* Visibility Score */}
          {typeof displayResult.visibility_score === 'number' && displayResult.visibility_score > 0 && (
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="py-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FiAward className="w-5 h-5 text-[#0077B5]" />
                    <span className="text-sm font-medium text-gray-700">Profile Visibility Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${visibilityColor(displayResult.visibility_score).text} bg-transparent border`}>
                      {visibilityColor(displayResult.visibility_score).label}
                    </Badge>
                    <span className={`text-2xl font-bold ${visibilityColor(displayResult.visibility_score).text}`}>
                      {displayResult.visibility_score}/100
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${displayResult.visibility_score >= 70 ? 'bg-green-500' : displayResult.visibility_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${displayResult.visibility_score}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Optimized Headline */}
          {displayResult.optimized_headline && (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FiUser className="w-4 h-4 text-[#0077B5]" />
                  Optimized Headline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-sm font-medium text-gray-900 leading-relaxed">{displayResult.optimized_headline}</p>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-blue-200/50">
                    <span className="text-xs text-gray-500">{displayResult.optimized_headline.length} / 220 characters</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(displayResult.optimized_headline ?? '', 'headline')}
                      className="text-gray-500 hover:text-[#0077B5] h-7 px-2"
                    >
                      {copiedId === 'headline' ? <><FiCheck className="w-3.5 h-3.5 mr-1 text-green-600" /> Copied</> : <><FiCopy className="w-3.5 h-3.5 mr-1" /> Copy</>}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Optimized About */}
          {displayResult.optimized_about && (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FiUser className="w-4 h-4 text-[#0077B5]" />
                    Optimized About Section
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(displayResult.optimized_about ?? '', 'about')}
                    className="text-gray-500 hover:text-[#0077B5] h-7 px-2"
                  >
                    {copiedId === 'about' ? <><FiCheck className="w-3.5 h-3.5 mr-1 text-green-600" /> Copied</> : <><FiCopy className="w-3.5 h-3.5 mr-1" /> Copy</>}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">{displayResult.optimized_about}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Keywords */}
          {Array.isArray(displayResult.keyword_suggestions) && displayResult.keyword_suggestions.length > 0 && (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FiSearch className="w-4 h-4 text-[#0077B5]" />
                  SEO Keyword Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {displayResult.keyword_suggestions.map((kw, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="cursor-pointer hover:bg-[#0077B5]/10 transition-colors px-3 py-1"
                      onClick={() => copyToClipboard(kw, `kw-${i}`)}
                    >
                      {copiedId === `kw-${i}` ? <FiCheck className="w-3 h-3 mr-1 text-green-600" /> : null}
                      {kw}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section Recommendations */}
          {Array.isArray(displayResult.section_recommendations) && displayResult.section_recommendations.length > 0 && (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FiGrid className="w-4 h-4 text-[#0077B5]" />
                  Section Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {displayResult.section_recommendations.map((rec, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 mb-1">{rec?.section_name ?? 'Section'}</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{rec?.recommendation ?? ''}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Improvement Priorities */}
          {Array.isArray(displayResult.improvement_priorities) && displayResult.improvement_priorities.length > 0 && (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FiArrowUp className="w-4 h-4 text-[#0077B5]" />
                  Top Improvement Priorities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {displayResult.improvement_priorities.map((priority, i) => (
                  <div key={i} className="flex items-start gap-3 py-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0077B5] text-white text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm text-gray-700 leading-snug">{priority}</p>
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
