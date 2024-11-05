import prisma from './prisma'

const FREE_MINUTES_PER_MONTH = 120
const PREMIUM_MINUTES_PER_MONTH = 1200
const DAYS_PER_PERIOD = 30

export async function getRemainingMinutes(userId: string): Promise<number> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) return 0

    const usageRecords = await prisma.usageRecord.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - DAYS_PER_PERIOD * 24 * 60 * 60 * 1000)
        }
      },
      select: {
        minutes: true
      }
    })

    // 计算当前周期的总使用量
    const usedMinutes = usageRecords.reduce(
      (acc: number, record: { minutes: number }) => acc + (record.minutes || 0),
      0
    )
    
    // 根据用户类型确定总配额
    const totalMinutes = user.isPremium ? PREMIUM_MINUTES_PER_MONTH : FREE_MINUTES_PER_MONTH

    return Math.max(0, totalMinutes - usedMinutes)
  } catch (error) {
    if (error instanceof Error) {
      console.error('计算剩余使用量失败:', error.message)
    } else {
      console.error('计算剩余使用量失败:', error)
    }
    // 如果发生错误，返回免费用户的默认配额
    return FREE_MINUTES_PER_MONTH
  }
}

export async function canTranscribe(userId: string, duration: number): Promise<boolean> {
  try {
    const remainingMinutes = await getRemainingMinutes(userId)
    return remainingMinutes >= duration
  } catch (error) {
    if (error instanceof Error) {
      console.error('检查转录权限失败:', error.message)
    } else {
      console.error('检查转录权限失败:', error)
    }
    return false
  }
} 