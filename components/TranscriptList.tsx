'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Download, Copy, Play, Square } from 'lucide-react'
import toast from 'react-hot-toast'

interface Transcript {
  id: string
  text: string
  audioUrl: string
  audioBlobUrl: string
  createdAt: string
  audioDuration: number
}

export default function TranscriptList() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    async function fetchTranscripts() {
      try {
        const response = await fetch('/api/transcripts')
        if (!response.ok) throw new Error('获取历史记录失败')
        const data = await response.json()
        setTranscripts(data.transcripts)
      } catch {
        console.error('获取历史记录失败')
        toast.error('获取历史记录失败')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTranscripts()
  }, [])

  // 处理音频播放
  const handlePlayAudio = (transcript: Transcript) => {
    if (playingId === transcript.id) {
      // 如果正在播放，则停止
      audioRef.current?.pause()
      audioRef.current!.currentTime = 0  // 重置播放进度
      setPlayingId(null)
      // 如果是因为点击播放按钮而展开的，则收起
      if (expandedId === transcript.id) {
        setExpandedId(null)
      }
    } else {
      // 如果没有播放，则开始播放并展开
      if (audioRef.current) {
        audioRef.current.src = transcript.audioBlobUrl
        audioRef.current.play()
        setPlayingId(transcript.id)
        setExpandedId(transcript.id)  // 自动展开
      }
    }
  }

  // 处理音频下载
  const handleDownloadAudio = async (transcript: Transcript) => {
    try {
      const response = await fetch(transcript.audioBlobUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = transcript.audioUrl
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      toast.error('下载音频失败')
    }
  }

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
      <audio 
        ref={audioRef} 
        onEnded={() => {
          setPlayingId(null)
          // 播放结束时如果是自动展开的，则自动收起
          if (expandedId === playingId) {
            setExpandedId(null)
          }
        }} 
        className="hidden" 
      />
      
      {transcripts.map((transcript) => (
        <div
          key={transcript.id}
          className="border rounded-lg p-4 bg-white shadow-sm"
        >
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePlayAudio(transcript)
                    }}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    {playingId === transcript.id ? (
                      <Square className="h-4 w-4" />  // 使用停止图标
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownloadAudio(transcript)
                    }}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
                <p className="font-medium">{transcript.audioUrl}</p>
              </div>
              <p className="text-sm text-gray-500">
                {new Date(transcript.createdAt).toLocaleString()} · {transcript.audioDuration.toFixed(1)} 分钟
              </p>
            </div>
            <button
              onClick={() => setExpandedId(expandedId === transcript.id ? null : transcript.id)}
              className="ml-4"
            >
              <ChevronDown
                className={`h-5 w-5 text-gray-400 transition-transform ${
                  expandedId === transcript.id ? 'rotate-180' : ''
                }`}
              />
            </button>
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