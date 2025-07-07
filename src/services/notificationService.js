// 푸시 알림 서비스
class NotificationService {
  constructor() {
    this.isSupported = 'Notification' in window
    this.permission = this.isSupported ? Notification.permission : 'denied'
    this.reminderTime = '18:00' // 일기 작성 알림 시간
  }

  // 알림 권한 요청
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('이 브라우저는 알림을 지원하지 않습니다.')
    }

    if (this.permission === 'granted') {
      return true
    }

    const permission = await Notification.requestPermission()
    this.permission = permission
    
    if (permission === 'granted') {
      this.showWelcomeNotification()
      return true
    } else {
      throw new Error('알림 권한이 거부되었습니다.')
    }
  }

  // 환영 알림 표시
  showWelcomeNotification() {
    this.showNotification('일기 알림 설정 완료!', {
      body: '매일 18:00에 일기 작성 알림을 받을 수 있습니다.',
      icon: '/favicon.ico',
      tag: 'welcome'
    })
  }

  // 기본 알림 표시
  showNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      console.warn('알림 권한이 없습니다.')
      return false
    }

    const defaultOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      silent: false
    }

    const notification = new Notification(title, {
      ...defaultOptions,
      ...options
    })

    // 클릭 이벤트 처리
    notification.onclick = () => {
      window.focus()
      notification.close()
      
      // 옵션에 클릭 핸들러가 있으면 실행
      if (options.onClick) {
        options.onClick()
      }
    }

    // 자동 닫기 (5초 후)
    setTimeout(() => {
      notification.close()
    }, 5000)

    return true
  }

  // 일기 작성 알림
  showDiaryReminder() {
    const today = new Date()
    const todayStr = today.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    this.showNotification('🌙 일기 작성 시간이에요!', {
      body: `${todayStr}\n오늘 하루는 어떠셨나요? 일기를 작성해보세요.`,
      icon: '/favicon.ico',
      tag: 'diary-reminder',
      requireInteraction: true,
      onClick: () => {
        // 일기 작성 페이지로 이동
        window.location.href = `/write/${today.toISOString().split('T')[0]}`
      }
    })
  }

  // 연속 작성 축하 알림
  showStreakCelebration(days) {
    let message = ''
    let emoji = ''

    if (days === 1) {
      emoji = '🎉'
      message = '첫 일기를 작성하셨네요!'
    } else if (days === 7) {
      emoji = '🔥'
      message = '일주일 연속 작성! 대단해요!'
    } else if (days === 30) {
      emoji = '🏆'
      message = '한 달 연속 작성! 축하합니다!'
    } else if (days === 100) {
      emoji = '💎'
      message = '100일 연속 작성! 정말 놀라워요!'
    } else if (days % 10 === 0) {
      emoji = '⭐'
      message = `${days}일 연속 작성! 꾸준히 잘하고 계세요!`
    }

    if (message) {
      this.showNotification(`${emoji} 연속 작성 기록`, {
        body: message,
        tag: 'streak-celebration',
        requireInteraction: true
      })
    }
  }

  // 일기 저장 완료 알림
  showSaveSuccess(isEdit = false) {
    this.showNotification('✅ 일기 저장 완료', {
      body: isEdit ? '일기가 성공적으로 수정되었습니다.' : '오늘의 일기가 저장되었습니다.',
      tag: 'save-success'
    })
  }

  // 정기 알림 스케줄링
  scheduleReminders() {
    // 기존 스케줄 정리
    this.clearReminders()

    // 매일 18:00 알림 설정
    this.scheduleDaily18OClock()
    
    console.log('일기 작성 알림이 설정되었습니다. (매일 18:00)')
  }

  // 매일 18:00 알림 설정
  scheduleDaily18OClock() {
    const now = new Date()
    const today18 = new Date()
    today18.setHours(18, 0, 0, 0)

    // 오늘 18:00이 지났으면 내일 18:00으로 설정
    if (now > today18) {
      today18.setDate(today18.getDate() + 1)
    }

    const timeUntilReminder = today18.getTime() - now.getTime()

    // 첫 번째 알림 설정
    this.reminderTimeout = setTimeout(() => {
      this.showDiaryReminder()
      
      // 매일 반복 (24시간마다)
      this.reminderInterval = setInterval(() => {
        this.showDiaryReminder()
      }, 24 * 60 * 60 * 1000)
      
    }, timeUntilReminder)

    // 로컬 스토리지에 설정 상태 저장
    localStorage.setItem('notificationScheduled', 'true')
    localStorage.setItem('notificationTime', this.reminderTime)
  }

  // 알림 스케줄 제거
  clearReminders() {
    if (this.reminderTimeout) {
      clearTimeout(this.reminderTimeout)
      this.reminderTimeout = null
    }

    if (this.reminderInterval) {
      clearInterval(this.reminderInterval)
      this.reminderInterval = null
    }

    localStorage.removeItem('notificationScheduled')
  }

  // 알림 설정 상태 확인
  isScheduled() {
    return localStorage.getItem('notificationScheduled') === 'true'
  }

  // 이메일 알림 (백엔드 API 연동 필요)
  async sendEmailNotification(email, type, data = {}) {
    try {
      // 실제 구현에서는 백엔드 API 호출
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          type,
          data
        })
      })

      if (!response.ok) {
        throw new Error('이메일 전송 실패')
      }

      return { success: true }
    } catch (error) {
      console.error('이메일 알림 오류:', error)
      
      // 데모 모드: 콘솔에 로그만 출력
      console.log(`📧 이메일 알림 (데모): ${email}`)
      console.log(`종류: ${type}`)
      console.log('데이터:', data)
      
      return { success: true, isDemo: true }
    }
  }

  // 주간 리포트 이메일
  async sendWeeklyReport(email) {
    const weeklyData = this.getWeeklyStats()
    
    return await this.sendEmailNotification(email, 'weekly_report', {
      period: weeklyData.period,
      totalEntries: weeklyData.totalEntries,
      streakDays: weeklyData.streakDays,
      topEmotion: weeklyData.topEmotion
    })
  }

  // 주간 통계 계산
  getWeeklyStats() {
    const entries = JSON.parse(localStorage.getItem('diaryEntries') || '{}')
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    let totalEntries = 0
    const emotions = {}
    
    Object.entries(entries).forEach(([date, entry]) => {
      const entryDate = new Date(date)
      if (entryDate >= weekAgo && entryDate <= now) {
        totalEntries++
        emotions[entry.emotion] = (emotions[entry.emotion] || 0) + 1
      }
    })

    const topEmotion = Object.entries(emotions)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || null

    return {
      period: `${weekAgo.toLocaleDateString()} ~ ${now.toLocaleDateString()}`,
      totalEntries,
      streakDays: this.calculateCurrentStreak(entries),
      topEmotion
    }
  }

  // 연속 작성일 계산
  calculateCurrentStreak(entries) {
    const dates = Object.keys(entries).sort().reverse()
    if (dates.length === 0) return 0

    let streak = 0
    const today = new Date()
    let checkDate = new Date(today)

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0]
      if (entries[dateStr]) {
        streak++
      } else {
        break
      }
      checkDate.setDate(checkDate.getDate() - 1)
    }

    return streak
  }

  // 브라우저 지원 여부 확인
  isNotificationSupported() {
    return this.isSupported
  }

  // 권한 상태 확인
  getPermissionStatus() {
    return this.permission
  }
}

export const notificationService = new NotificationService()
export default notificationService 