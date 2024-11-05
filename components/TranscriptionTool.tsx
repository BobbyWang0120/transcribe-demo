'use client'

import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2, Copy, Download, X, FileAudio } from 'lucide-react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

interface TranscriptionResponse {
  text: string
  duration: number
  language: string
}

interface TranscriptionState {
  text: string
  file: File | null
}

const STORAGE_KEY = 'transcriptionText'

export default function TranscriptionTool() {
  const { data: session } = useSession()
  const [transcriptionState, setTranscriptionState] = useState<TranscriptionState>({
    text: '',
    file: null
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const savedText = sessionStorage.getItem(STORAGE_KEY)
    if (savedText) {
      setTranscriptionState(prev => ({ ...prev, text: savedText }))
    }
  }, [])

  useEffect(() => {
    if (!session) {
      setTranscriptionState({ text: '', file: null })
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }, [session])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const audioFile = acceptedFiles[0]
    if (audioFile) {
      if (audioFile.size > 69 * 1024 * 1024) { // 69MB 限制
        toast.error('文件大小不能超过 69MB')
        return
      }
      setTranscriptionState(prev => ({ ...prev, file: audioFile }))
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a']
    },
    maxFiles: 1
  })

  const handleTranscribe = async () => {
    if (!transcriptionState.file) return

    setIsLoading(true)
    const formData = new FormData()
    formData.append('file', transcriptionState.file)

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '转录失败')
      }

      const data: TranscriptionResponse = await response.json()
      
      sessionStorage.setItem(STORAGE_KEY, data.text)
      setTranscriptionState({ text: data.text, file: null })
      
      toast.success(`转录完成！音频时长: ${data.duration.toFixed(1)}分钟`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '转录失败，请重试')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(transcriptionState.text)
    toast.success('已复制到剪贴板')
  }

  const handleDownload = () => {
    const blob = new Blob([transcriptionState.text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transcription.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleRemoveFile = () => {
    setTranscriptionState(prev => ({ ...prev, file: null }))
  }

  return (
    <div className="space-y-6">
      {!transcriptionState.file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2">拖放音频文件到这里，或点击选择文件</p>
          <p className="text-sm text-gray-500 mt-1">支持 MP3, WAV, M4A 格式，最大 69MB</p>
        </div>
      ) : (
        <div className="border rounded-lg p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FileAudio className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium">{transcriptionState.file.name}</p>
                <p className="text-sm text-gray-500">
                  {(transcriptionState.file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={handleTranscribe}
            disabled={isLoading}
            className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="animate-spin mr-2" />
                转录中...
              </span>
            ) : '开始转录'}
          </button>
        </div>
      )}

      {transcriptionState.text && (
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center px-3 py-1 text-sm border rounded hover:bg-gray-50"
            >
              <Copy className="h-4 w-4 mr-1" />
              复制
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center px-3 py-1 text-sm border rounded hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-1" />
              下载
            </button>
          </div>
          <div className="whitespace-pre-wrap">{transcriptionState.text}</div>
        </div>
      )}
    </div>
  )
} 