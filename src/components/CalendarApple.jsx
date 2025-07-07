import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, BarChart3, Plus, ChevronLeft, ChevronRight, Home } from 'lucide-react'

const emotions = {
  HAPPY: { emoji: '😊', color: '#FF9500', bgColor: '#FFF4E6' },
  SAD: { emoji: '😢', color: '#007AFF', bgColor: '#E6F3FF' },
  ANGRY: { emoji: '😠', color: '#FF3B30', bgColor: '#FFE6E6' },
  PEACEFUL: { emoji: '😌', color: '#34C759', bgColor: '#E6F7EA' },
  ANXIOUS: { emoji: '😰', color: '#FF9500', bgColor: '#FFF4E6' }
}

export default function CalendarApple() {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [diaryEntries, setDiaryEntries] = useState({})
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [monthlyEntries, setMonthlyEntries] = useState(0)
  const [streakDays, setStreakDays] = useState(0)
  const [mostFrequentEmotion, setMostFrequentEmotion] = useState(null)

  useEffect(() => {
    const storedDiaryEntries = localStorage.getItem('diaryEntries')
    if (storedDiaryEntries) {
      setDiaryEntries(JSON.parse(storedDiaryEntries))
    }
    // 더미 데이터 로드 제거 - 실제 사용자 데이터만 사용
  }, [])

  useEffect(() => {
    if (Object.keys(diaryEntries).length > 0) {
      localStorage.setItem('diaryEntries', JSON.stringify(diaryEntries))
      calculateStats()
    }
  }, [diaryEntries, currentDate])

  // 더미 데이터 함수 제거 - 실제 사용자 데이터만 사용

  const calculateStats = () => {
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()
    
    // 이번 달 일기 수 계산
    const monthlyCount = Object.entries(diaryEntries).filter(([date]) => {
      const entryDate = new Date(date)
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear
    }).length
    setMonthlyEntries(monthlyCount)
    
    // 연속 작성일 계산
    const today = new Date()
    let streak = 0
    let checkDate = new Date(today)
    
    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0]
      if (diaryEntries[dateStr]) {
        streak++
      } else {
        break
      }
      checkDate.setDate(checkDate.getDate() - 1)
    }
    setStreakDays(streak)
    
    // 가장 많은 감정 계산
    const emotionCount = {}
    Object.entries(diaryEntries).forEach(([date, entry]) => {
      const entryDate = new Date(date)
      if (entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear) {
        emotionCount[entry.emotion] = (emotionCount[entry.emotion] || 0) + 1
      }
    })
    
    let maxEmotion = null
    let maxCount = 0
    Object.entries(emotionCount).forEach(([emotion, count]) => {
      if (count > maxCount) {
        maxCount = count
        maxEmotion = emotion
      }
    })
    setMostFrequentEmotion(maxEmotion)
  }

  const today = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // 달력 그리드 생성
  const firstDay = new Date(currentYear, currentMonth, 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const calendarDays = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    calendarDays.push(date)
  }

  const formatDate = (date) => {
    return date.toISOString().split('T')[0]
  }

  const hasEntry = (date) => {
    const dateStr = formatDate(date)
    return diaryEntries[dateStr]
  }

  const isToday = (date) => {
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentMonth
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ]

  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  const handleDateClick = (date) => {
    const dateString = formatDate(date)
    const today = new Date()
    
    if (date > today) {
      setAlertMessage('미래 날짜의 일기는 작성할 수 없습니다.')
      setShowAlert(true)
      setTimeout(() => {
        setShowAlert(false)
        setAlertMessage('')
      }, 3000)
      return
    }
    
    if (diaryEntries[dateString]) {
      navigate(`/diary/${dateString}`)
    } else {
      navigate(`/write/${dateString}`)
    }
  }

  const handleTodayDiaryClick = () => {
    const todayDateString = formatDate(today)
    const currentHour = today.getHours()
    
    // 데모용으로 항상 작성 가능
    navigate(`/write/${todayDateString}`)
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F2F2F7',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif'
    }}>
      <h1>애플 캘린더 스타일 (개발 중)</h1>
    </div>
  )
} 