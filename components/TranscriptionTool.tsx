'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2, Copy, Download, X, FileAudio, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { upload } from '@vercel/blob/client'

interface TranscriptionResponse {
  text: string
  duration: number
  language: string
}

interface TranscriptionState {
  text: string
  file: File | null
  blobUrl?: string
}

export default function TranscriptionTool() {
  const [transcriptionState, setTranscriptionState] = useState<TranscriptionState>({
    text: '',
    file: null
  })
  const [isLoading, setIsLoading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const audioFile = acceptedFiles[0]
    if (audioFile) {
      if (audioFile.size > 25 * 1024 * 1024) {
        toast.error('文件大小不能超过 25MB')
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
    try {
      const blob = await upload(transcriptionState.file.name, transcriptionState.file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      })

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blobUrl: blob.url,
          fileName: transcriptionState.file.name,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '转录失败')
      }

      const data: TranscriptionResponse = await response.json()
      
      setTranscriptionState(prev => ({
        ...prev,
        text: data.text,
        blobUrl: blob.url
      }))
      
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
    setTranscriptionState({ text: '', file: null })
  }

  return (
    <div className="space-y-12">
      {!transcriptionState.file ? (
        <>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-gray-900 bg-gray-50' : 'border-gray-300 hover:border-gray-400'}`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2">拖放音频文件到这里，或点击选择文件</p>
            <p className="text-sm text-gray-500 mt-1">支持 MP3, WAV, M4A 格式，最大 25MB</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-50">
                <FileAudio className="h-8 w-8 text-gray-900" />
              </div>
              <div>
                <h3 className="text-lg font-medium">智能识别</h3>
                <p className="text-sm text-gray-600 mt-1">自动检测语言，支持多种音频格式</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-50">
                <Clock className="h-8 w-8 text-gray-900" />
              </div>
              <div>
                <h3 className="text-lg font-medium">高精度转录</h3>
                <p className="text-sm text-gray-600 mt-1">AI 驱动的精准音频识别</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="border rounded-lg p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100">
                  <FileAudio className="h-6 w-6 text-gray-900" />
                </div>
                <div>
                  <p className="font-medium">{transcriptionState.file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(transcriptionState.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <button
              onClick={handleTranscribe}
              disabled={isLoading}
              className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin mr-2" />
                  转录中...
                </span>
              ) : '开始转录'}
            </button>
          </div>

          {!isLoading && !transcriptionState.text && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity duration-300">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-50">
                  <FileAudio className="h-8 w-8 text-gray-900" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">智能识别</h3>
                  <p className="text-sm text-gray-600 mt-1">自动检测语言，支持多种音频格式</p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-50">
                  <Clock className="h-8 w-8 text-gray-900" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">高精度转录</h3>
                  <p className="text-sm text-gray-600 mt-1">AI 驱动的精准音频识别</p>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="border rounded-lg p-4 space-y-4 animate-fade-in transition-all duration-300">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          )}
        </>
      )}

      {transcriptionState.file && transcriptionState.text && (
        <div className="border rounded-lg p-4 space-y-4 animate-fade-in">
          <div className="whitespace-pre-wrap mb-4">{transcriptionState.text}</div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCopy}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 