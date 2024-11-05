'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Download, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

interface Transcript {
  id: string
  text: string
  audioUrl: string
  createdAt: string
  audioDuration: number
}

export default function TranscriptList() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTranscripts() {
      try {
        const response = await fetch('/api/transcripts')
        if (!response.ok) throw new Error('获取历史记录失败')
        const data = await response.json()
        setTranscripts(data.transcripts)
      } catch (err) {
        console.error('获取历史记录失败:', err)
        toast.error('获取历史记录失败')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTranscripts()
  }, [])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('已复制到剪贴板')
  }

  const handleDownload = (text: string, fileName: string) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return <div className="text-center">加载中...</div>
  }

  if (transcripts.length === 0) {
    return <div className="text-center text-gray-500">暂无转录记录</div>
  }

  return (
    <div className="space-y-4">
      {transcripts.map((transcript) => (
        <div
          key={transcript.id}
          className="border rounded-lg p-4 bg-white shadow-sm"
        >
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setExpandedId(expandedId === transcript.id ? null : transcript.id)}
          >
            <div className="flex-1">
              <p className="font-medium">{transcript.audioUrl}</p>
              <p className="text-sm text-gray-500">
                {new Date(transcript.createdAt).toLocaleString()} · {transcript.audioDuration.toFixed(1)} 分钟
              </p>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-gray-400 transition-transform ${
                expandedId === transcript.id ? 'rotate-180' : ''
              }`}
            />
          </div>

          {expandedId === transcript.id && (
            <div className="mt-4">
              <p className="whitespace-pre-wrap mb-4">{transcript.text}</p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleCopy(transcript.text)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDownload(transcript.text, transcript.audioUrl)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 