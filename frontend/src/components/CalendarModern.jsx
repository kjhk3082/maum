import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Pen, Search, BarChart3, ChevronLeft, ChevronRight, AlertCircle, Plus, Bell, BellOff, Sun, Moon } from 'lucide-react'
import { useTheme } from '../App'
import { notificationService } from '../services/notificationService'
import { getDiariesByMonth, getStreakDays } from '../firebase/diaryService'
import { signOutUser } from '../firebase/authService'
// import { diaryAPI } from '../services/api' // 백엔드 연결 시 주석 해제

const emotions = {
  HAPPY: { emoji: '😊', color: '#FF9500', bgColor: '#FFF4E6' },
  SAD: { emoji: '😢', color: '#007AFF', bgColor: '#E6F3FF' },
  ANGRY: { emoji: '😠', color: '#FF3B30', bgColor: '#FFE6E6' },
  PEACEFUL: { emoji: '😌', color: '#34C759', bgColor: '#E6F7EA' },
  ANXIOUS: { emoji: '😰', color: '#FF9500', bgColor: '#FFF4E6' }
}

export default function CalendarModern({ onLogout, user }) {
  console.log('🚀 CalendarModern component is rendering!')
  const navigate = useNavigate()
  const { isDarkMode, toggleTheme } = useTheme()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [diaryEntries, setDiaryEntries] = useState({})
  const [emotionStats, setEmotionStats] = useState({})
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [monthlyEntries, setMonthlyEntries] = useState(0)
  const [streakDays, setStreakDays] = useState(0)
  const [mostFrequentEmotion, setMostFrequentEmotion] = useState(null)
  const [notificationEnabled, setNotificationEnabled] = useState(false)
  const [monthlyDiaries, setMonthlyDiaries] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  
  // Firebase에서 월별 일기 데이터 로드
  useEffect(() => {
    const loadMonthlyDiaries = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const { success, diaries } = await getDiariesByMonth(currentDate.getFullYear(), currentDate.getMonth() + 1)
        
        if (success) {
          // 날짜별로 일기 데이터 매핑
          const diaryMap = {}
          diaries.forEach(diary => {
            diaryMap[diary.date] = diary
          })
          setDiaryEntries(diaryMap)
          
          // 통계 계산
          calculateStats(diaries)
        } else {
          console.error('월별 일기 로드 실패')
          // 로드 실패 시 빈 객체로 초기화
          setDiaryEntries({})
        }
      } catch (error) {
        console.error('월별 일기 로드 오류:', error)
        setDiaryEntries({})
      } finally {
        setIsLoading(false)
      }
    }

    loadMonthlyDiaries()
  }, [currentDate, user])

  // 연속 작성일 로드
  useEffect(() => {
    const loadStreakDays = async () => {
      if (!user) return

      try {
        const { success, streakDays: streak } = await getStreakDays()
        if (success) {
          setStreakDays(streak)
        }
      } catch (error) {
        console.error('연속 작성일 로드 오류:', error)
      }
    }

    loadStreakDays()
  }, [user, diaryEntries])

  useEffect(() => {
    // 알림 설정 상태 확인
    const checkNotificationStatus = () => {
      const isSupported = notificationService.isNotificationSupported()
      const permission = notificationService.getPermissionStatus()
      const isScheduled = notificationService.isScheduled()
      
      setNotificationEnabled(isSupported && permission === 'granted' && isScheduled)
    }

    checkNotificationStatus()
  }, [])

  // Firebase 데이터 기반 통계 계산 
  const calculateStats = (diaries = []) => {
    // 이번 달 일기 수 계산
    setMonthlyEntries(diaries.length)
    
    // 이번 달 가장 많은 감정 계산
    const emotionCount = {}
    diaries.forEach(diary => {
      if (diary.emotion) {
        emotionCount[diary.emotion] = (emotionCount[diary.emotion] || 0) + 1
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

  // Firebase 로그아웃 처리
  const handleFirebaseLogout = async () => {
    try {
      const result = await signOutUser()
      if (result.success) {
        onLogout()
        navigate('/login')
      } else {
        setAlertMessage('로그아웃 중 오류가 발생했습니다.')
        setShowAlert(true)
        setTimeout(() => {
          setShowAlert(false)
          setAlertMessage('')
        }, 3000)
      }
    } catch (error) {
      console.error('로그아웃 오류:', error)
      // 오류가 발생해도 로그아웃 처리
      onLogout()
      navigate('/login')
    }
  }

  // 알림 토글 함수
  const handleNotificationToggle = async () => {
    try {
      if (notificationEnabled) {
        // 알림 비활성화
        notificationService.clearReminders()
        setNotificationEnabled(false)
        setAlertMessage('일기 작성 알림이 비활성화되었습니다.')
      } else {
        // 알림 활성화
        await notificationService.requestPermission()
        notificationService.scheduleReminders()
        setNotificationEnabled(true)
        setAlertMessage('일기 작성 알림이 활성화되었습니다. (매일 18:00)')
      }
      
      setShowAlert(true)
      setTimeout(() => {
        setShowAlert(false)
        setAlertMessage('')
      }, 3000)
      
    } catch (error) {
      console.error('알림 설정 오류:', error)
      setAlertMessage(error.message || '알림 설정 중 오류가 발생했습니다.')
      setShowAlert(true)
      setTimeout(() => {
        setShowAlert(false)
        setAlertMessage('')
      }, 3000)
    }
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
    // 로컬 시간대 기준으로 날짜 포맷팅 (UTC 변환 없이)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
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

  // Function to navigate to today's date
  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
  }

  // Function to handle year selection change
  const handleYearChange = (e) => {
    const selectedYear = parseInt(e.target.value)
    setCurrentDate(new Date(selectedYear, currentMonth, 1))
  }

  // Function to handle month selection change
  const handleMonthChange = (e) => {
    const selectedMonth = parseInt(e.target.value)
    setCurrentDate(new Date(currentYear, selectedMonth, 1))
  }

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ]

  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  // 오늘 일기 쓰기 버튼 클릭 핸들러
  const handleTodayDiaryClick = async () => {
    const today = new Date()
    const todayDateString = formatDate(today)
    
    // 클라이언트 사이드 시간 제한 체크 (데모용) - 실제로는 데모 모드이므로 항상 허용
    navigate(`/write/${todayDateString}`)
  }

  // 날짜 클릭 핸들러 (과거 일기 작성/조회)
  const handleDateClick = (date) => {
    const dateString = formatDate(date)
    const today = new Date()
    
    // 미래 날짜는 클릭 불가
    if (date > today) {
      setAlertMessage('미래 날짜의 일기는 작성할 수 없습니다.')
      setShowAlert(true)
      setTimeout(() => {
        setShowAlert(false)
        setAlertMessage('')
      }, 3000)
      return
    }
    
    // 해당 날짜에 일기가 있으면 조회, 없으면 작성
    if (diaryEntries[dateString]) {
      navigate(`/diary/${dateString}`)
    } else {
      navigate(`/write/${dateString}`)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#1C1C1E' : '#F2F2F7',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
      color: isDarkMode ? '#FFFFFF' : '#1D1D1F',
      transition: 'all 0.3s ease'
    }}>
      {/* 네비게이션 바 */}
      <div style={{
        backgroundColor: isDarkMode 
          ? 'rgba(28, 28, 30, 0.8)' 
          : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: `0.5px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }}>
              <img 
                src="/app-icon.png" 
                alt="마음일기" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
            <h1 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '600',
              color: isDarkMode ? '#FFFFFF' : '#1D1D1F'
            }}>
              마음일기
            </h1>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={toggleTheme}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '400',
                color: isDarkMode ? '#FFD60A' : '#17A2B8',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode 
                  ? 'rgba(255, 214, 10, 0.1)' 
                  : 'rgba(23, 162, 184, 0.1)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              {isDarkMode ? '라이트' : '다크'}
            </button>
            
            <button
              onClick={() => navigate('/search')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '400',
                color: '#17A2B8',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(23, 162, 184, 0.1)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <Search size={16} />
              검색
            </button>
            
            <button
              onClick={() => navigate('/stats')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '400',
                color: '#17A2B8',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(23, 162, 184, 0.1)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <BarChart3 size={16} />
              통계
            </button>
            
            <button
              onClick={handleNotificationToggle}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '400',
                color: notificationEnabled ? '#34C759' : '#8E8E93',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = notificationEnabled 
                  ? 'rgba(52, 199, 89, 0.1)' 
                  : 'rgba(142, 142, 147, 0.1)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {notificationEnabled ? <Bell size={16} /> : <BellOff size={16} />}
              알림
            </button>
            
            <button
              onClick={handleTodayDiaryClick}
              style={{
                padding: '8px 16px',
                backgroundColor: '#17A2B8',
                border: 'none',
                borderRadius: '20px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#138496'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#17A2B8'
              }}
            >
              <Pen size={16} />
              오늘 일기
            </button>
            
            <button
              onClick={handleFirebaseLogout}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '400',
                color: '#FF3B30',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 59, 48, 0.1)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* 알림 메시지 */}
      {showAlert && (
        <div style={{
          position: 'fixed',
          top: '90px',
          right: '20px',
          backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
          color: isDarkMode ? '#FFFFFF' : '#1D1D1F',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: isDarkMode 
            ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
            : '0 4px 20px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500',
          maxWidth: '300px'
        }}>
          <AlertCircle size={16} color="#17A2B8" />
          {alertMessage}
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
      }}>
        {/* 통계 카드들 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          marginBottom: '16px'
        }}>
          {/* 월간 일기 수 */}
          <div style={{
            backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: isDarkMode 
              ? '0 2px 8px rgba(0, 0, 0, 0.2)' 
              : '0 2px 8px rgba(0, 0, 0, 0.04)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'rgba(23, 162, 184, 0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calendar size={16} color="#17A2B8" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }}>
                  이번 달 일기
                </h3>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#17A2B8' }}>
                  {monthlyEntries}개
                </p>
              </div>
            </div>
          </div>

          {/* 연속 작성일 */}
          <div style={{
            backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: isDarkMode 
              ? '0 2px 8px rgba(0, 0, 0, 0.2)' 
              : '0 2px 8px rgba(0, 0, 0, 0.04)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'rgba(255, 149, 0, 0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px'
              }}>
                🔥
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }}>
                  연속 작성일
                </h3>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#FF9500' }}>
                  {streakDays}일
                </p>
              </div>
            </div>
          </div>

          {/* 이번 달 주요 감정 */}
          <div style={{
            backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: isDarkMode 
              ? '0 2px 8px rgba(0, 0, 0, 0.2)' 
              : '0 2px 8px rgba(0, 0, 0, 0.04)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: mostFrequentEmotion ? `${emotions[mostFrequentEmotion]?.bgColor}` : 'rgba(142, 142, 147, 0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}>
                {mostFrequentEmotion ? emotions[mostFrequentEmotion]?.emoji : '😊'}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }}>
                  이번 달 주요 감정
                </h3>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: mostFrequentEmotion ? emotions[mostFrequentEmotion]?.color : '#8E8E93' }}>
                  {mostFrequentEmotion ? 
                    (mostFrequentEmotion === 'HAPPY' ? '기쁨' : 
                     mostFrequentEmotion === 'SAD' ? '슬픔' : 
                     mostFrequentEmotion === 'ANGRY' ? '화남' : 
                     mostFrequentEmotion === 'PEACEFUL' ? '평온' : 
                     mostFrequentEmotion === 'ANXIOUS' ? '불안' : '알 수 없음') 
                    : '데이터 없음'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 캘린더 헤더 */}
        <div style={{
          backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '0',
          boxShadow: isDarkMode 
            ? '0 2px 8px rgba(0, 0, 0, 0.2)' 
            : '0 2px 8px rgba(0, 0, 0, 0.04)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <button
              onClick={prevMonth}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(23, 162, 184, 0.15)',
                border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(23, 162, 184, 0.3)'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: isDarkMode 
                  ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                  : '0 4px 12px rgba(23, 162, 184, 0.15)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(23, 162, 184, 0.25)'
                e.currentTarget.style.transform = 'scale(1.1)'
                e.currentTarget.style.boxShadow = isDarkMode 
                  ? '0 6px 16px rgba(0, 0, 0, 0.4)' 
                  : '0 6px 16px rgba(23, 162, 184, 0.25)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(23, 162, 184, 0.15)'
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = isDarkMode 
                  ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                  : '0 4px 12px rgba(23, 162, 184, 0.15)'
              }}
            >
              <ChevronLeft 
                size={36} 
                color={isDarkMode ? '#FFFFFF' : '#17A2B8'} 
                strokeWidth={4}
                style={{ 
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                  fontWeight: 'bold'
                }}
              />
            </button>

            <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* 년도 선택 */}
              <select
                value={currentYear}
                onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), currentMonth, 1))}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                  backgroundColor: isDarkMode ? 'rgba(58, 58, 60, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  color: isDarkMode ? '#FFFFFF' : '#1D1D1F',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {Array.from({ length: 86 }, (_, i) => 1940 + i).map(year => (
                  <option key={year} value={year}>{year}년</option>
                ))}
              </select>

              {/* 월 선택 */}
              <select
                value={currentMonth}
                onChange={(e) => setCurrentDate(new Date(currentYear, parseInt(e.target.value), 1))}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                  backgroundColor: isDarkMode ? 'rgba(58, 58, 60, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  color: isDarkMode ? '#FFFFFF' : '#1D1D1F',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {monthNames.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>

              {/* 오늘로 이동 버튼 */}
              <button
                onClick={() => setCurrentDate(new Date())}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#17A2B8',
                  color: 'white',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#138496'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#17A2B8'
                }}
              >
                오늘
              </button>
            </div>

            <button
              onClick={nextMonth}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(23, 162, 184, 0.15)',
                border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(23, 162, 184, 0.3)'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: isDarkMode 
                  ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                  : '0 4px 12px rgba(23, 162, 184, 0.15)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(23, 162, 184, 0.25)'
                e.currentTarget.style.transform = 'scale(1.1)'
                e.currentTarget.style.boxShadow = isDarkMode 
                  ? '0 6px 16px rgba(0, 0, 0, 0.4)' 
                  : '0 6px 16px rgba(23, 162, 184, 0.25)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(23, 162, 184, 0.15)'
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = isDarkMode 
                  ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                  : '0 4px 12px rgba(23, 162, 184, 0.15)'
              }}
            >
              <ChevronRight 
                size={36} 
                color={isDarkMode ? '#FFFFFF' : '#17A2B8'} 
                strokeWidth={4}
                style={{ 
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                  fontWeight: 'bold'
                }}
              />
            </button>
          </div>

          {/* 요일 헤더 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '6px',
            marginBottom: '12px'
          }}>
            {weekDays.map((day, index) => (
              <div
                key={day}
                style={{
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: index === 0 ? '#FF3B30' : index === 6 ? '#17A2B8' : (isDarkMode ? '#8E8E93' : '#6D6D70'),
                  padding: '6px 0'
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 캘린더 그리드 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '6px'
          }}>
            {calendarDays.map((date, index) => {
              const entry = hasEntry(date)
              const isCurrentMonthDate = isCurrentMonth(date)
              const isTodayDate = isToday(date)

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  style={{
                    aspectRatio: '1',
                    minHeight: '36px',
                    maxHeight: '40px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isTodayDate 
                      ? '#17A2B8' 
                      : entry 
                        ? (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(23, 162, 184, 0.1)')
                        : 'transparent',
                    color: isTodayDate 
                      ? 'white' 
                      : !isCurrentMonthDate 
                        ? (isDarkMode ? '#48484A' : '#C7C7CC')
                        : (isDarkMode ? '#FFFFFF' : '#1D1D1F'),
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: isTodayDate ? '700' : '500',
                    transition: 'all 0.2s',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1px',
                    opacity: !isCurrentMonthDate ? 0.4 : 1
                  }}
                  onMouseOver={(e) => {
                    if (!isTodayDate) {
                      e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(23, 162, 184, 0.1)'
                      e.currentTarget.style.transform = 'scale(1.05)'
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isTodayDate) {
                      e.currentTarget.style.backgroundColor = entry 
                        ? (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(23, 162, 184, 0.1)')
                        : 'transparent'
                      e.currentTarget.style.transform = 'scale(1)'
                    }
                  }}
                >
                  <span style={{ fontSize: '13px' }}>{date.getDate()}</span>
                  {entry && (
                    <div style={{
                      fontSize: '10px',
                      opacity: 0.9,
                      lineHeight: '1'
                    }}>
                      {emotions[entry.emotion]?.emoji}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
