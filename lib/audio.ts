import { getAudioDurationInSeconds } from 'get-audio-duration'

export async function getAudioDuration(buffer: Buffer): Promise<number> {
  try {
    // 创建临时 Blob URL
    const blob = new Blob([buffer], { type: 'audio/mpeg' })
    const url = URL.createObjectURL(blob)
    
    try {
      const seconds = await getAudioDurationInSeconds(url)
      return seconds / 60 // 转换为分钟
    } finally {
      URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error('获取音频时长失败:', error)
    // 如果获取时长失败，返回一个估算值（每MB约1分钟）
    return buffer.length / (1024 * 1024)
  }
} 