import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, TrendingUp, Heart, BarChart3, PieChart, Activity, ArrowLeft, Brain, Sparkles } from 'lucide-react'
import { useTheme, ThemeContext } from '../App'
import { getEmotionStats, getStreakDays, getAllDiaries } from '../firebase/diaryService'
import { openaiService } from '../services/openaiService'

const emotions = {
  HAPPY: { emoji: '😊', label: '기쁨', color: '#FFD93D', bgColor: '#FFF4E6' },
  SAD: { emoji: '😢', label: '슬픔', color: '#4FC3F7', bgColor: '#E6F3FF' },
  ANGRY: { emoji: '😠', label: '화남', color: '#F44336', bgColor: '#FFE6E6' },
  PEACEFUL: { emoji: '😌', label: '평온', color: '#4CAF50', bgColor: '#E6F7EA' },
  ANXIOUS: { emoji: '😰', label: '불안', color: '#FF9800', bgColor: '#FFF4E6' }
}

const PatternAnalysis = ({ diaries, isDarkMode }) => {
  const [viewType, setViewType] = useState('week') // week, month, year
  
  // 현재 날짜 기준으로 기간 텍스트 생성
  const getCurrentPeriodText = () => {
    const now = new Date()
    
    if (viewType === 'week') {
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      
      return `${startOfWeek.getMonth() + 1}월 ${startOfWeek.getDate()}일 - ${endOfWeek.getMonth() + 1}월 ${endOfWeek.getDate()}일 주간`
    } else if (viewType === 'month') {
      return `${now.getFullYear()}년 ${now.getMonth() + 1}월`
    } else {
      return `${now.getFullYear()}년`
    }
  }
  
  // 주간 패턴 계산
  const getWeeklyPattern = () => {
    const weekDays = ['일', '월', '화', '수', '목', '금', '토']
    const weekPattern = Array(7).fill(0)
    
    // 실제 일기 데이터를 기반으로 계산
    if (Array.isArray(diaries)) {
      diaries.forEach(diary => {
        const dayOfWeek = new Date(diary.date).getDay()
        weekPattern[dayOfWeek]++
      })
    } else if (typeof diaries === 'object') {
      Object.entries(diaries).forEach(([date, diary]) => {
        const dayOfWeek = new Date(date).getDay()
        weekPattern[dayOfWeek]++
      })
    }
    
    return { labels: weekDays, data: weekPattern }
  }
  
  // 월간 패턴 계산
  const getMonthlyPattern = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    
    const monthPattern = Array(daysInMonth).fill(0)
    const labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}일`)
    
    if (Array.isArray(diaries)) {
      diaries.forEach(diary => {
        const diaryDate = new Date(diary.date)
        if (diaryDate.getMonth() === currentMonth && diaryDate.getFullYear() === currentYear) {
          const dayOfMonth = diaryDate.getDate() - 1
          monthPattern[dayOfMonth]++
        }
      })
    } else if (typeof diaries === 'object') {
      Object.entries(diaries).forEach(([date, diary]) => {
        const diaryDate = new Date(date)
        if (diaryDate.getMonth() === currentMonth && diaryDate.getFullYear() === currentYear) {
          const dayOfMonth = diaryDate.getDate() - 1
          monthPattern[dayOfMonth]++
        }
      })
    }
    
    return { labels, data: monthPattern }
  }
  
  // 연간 패턴 계산
  const getYearlyPattern = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
    
    const yearPattern = Array(12).fill(0)
    
    if (Array.isArray(diaries)) {
      diaries.forEach(diary => {
        const diaryDate = new Date(diary.date)
        if (diaryDate.getFullYear() === currentYear) {
          const monthOfYear = diaryDate.getMonth()
          yearPattern[monthOfYear]++
        }
      })
    } else if (typeof diaries === 'object') {
      Object.entries(diaries).forEach(([date, diary]) => {
        const diaryDate = new Date(date)
        if (diaryDate.getFullYear() === currentYear) {
          const monthOfYear = diaryDate.getMonth()
          yearPattern[monthOfYear]++
        }
      })
    }
    
    return { labels: monthNames, data: yearPattern }
  }
  
  const getCurrentPattern = () => {
    switch (viewType) {
      case 'week': return getWeeklyPattern()
      case 'month': return getMonthlyPattern()
      case 'year': return getYearlyPattern()
      default: return getWeeklyPattern()
    }
  }
  
  const { labels, data } = getCurrentPattern()
  const maxCount = Math.max(...data) || 1
  
  return (
    <div style={{
      background: isDarkMode ? 'rgba(44, 44, 46, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      borderRadius: '20px',
      padding: '24px',
      boxShadow: isDarkMode 
        ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
        : '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
      backdropFilter: 'blur(10px)'
    }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #17A2B8 0%, #138496 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Activity size={20} color="white" />
          </div>
          <div>
            <h3 style={{ 
              margin: 0, 
              fontSize: '18px', 
              fontWeight: '700',
              color: isDarkMode ? '#FFFFFF' : '#333'
            }}>
              작성 패턴
            </h3>
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: isDarkMode ? '#8E8E93' : '#666'
            }}>
              {getCurrentPeriodText()}
            </p>
          </div>
        </div>
        
        {/* 뷰 타입 선택 버튼 */}
        <div style={{
          display: 'flex',
          background: isDarkMode ? 'rgba(58, 58, 60, 0.5)' : 'rgba(248, 250, 252, 0.8)',
          borderRadius: '12px',
          padding: '4px',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
        }}>
          {[
            { key: 'week', label: '주간' },
            { key: 'month', label: '월간' },
            { key: 'year', label: '연간' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setViewType(key)}
              style={{
                padding: '6px 12px',
                background: viewType === key 
                  ? 'linear-gradient(135deg, #17A2B8 0%, #138496 100%)' 
                  : 'transparent',
                color: viewType === key 
                  ? 'white' 
                  : (isDarkMode ? '#FFFFFF' : '#333'),
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      
      {/* 그래프 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(${labels.length}, 1fr)`, 
        gap: viewType === 'month' ? '4px' : '12px',
        overflowX: viewType === 'month' ? 'auto' : 'visible'
      }}>
        {labels.map((label, index) => (
          <div key={label} style={{ textAlign: 'center', minWidth: viewType === 'month' ? '20px' : 'auto' }}>
            <div style={{
              width: '100%',
              height: '80px',
              background: isDarkMode ? 'rgba(58, 58, 60, 0.5)' : 'rgba(248, 250, 252, 0.8)',
              borderRadius: viewType === 'month' ? '6px' : '12px',
              marginBottom: '8px',
              position: 'relative',
              overflow: 'hidden',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
            }}>
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: `${data[index] > 0 ? Math.max((data[index] / maxCount) * 100, 10) : 0}%`,
                background: 'linear-gradient(135deg, #17A2B8 0%, #138496 100%)',
                borderRadius: viewType === 'month' ? '0 0 5px 5px' : '0 0 11px 11px',
                transition: 'all 0.3s ease'
              }}></div>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: viewType === 'month' ? '10px' : '14px',
                fontWeight: '600',
                color: data[index] > 0 ? 'white' : (isDarkMode ? '#8E8E93' : '#666'),
                zIndex: 1
              }}>
                {data[index]}
              </div>
            </div>
            <span style={{ 
              fontSize: viewType === 'month' ? '8px' : '13px',
              fontWeight: '500',
              color: (viewType === 'week' && (index === 0 || index === 6)) 
                ? '#17A2B8' 
                : (isDarkMode ? '#8E8E93' : '#666'),
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {viewType === 'month' ? label.replace('일', '') : label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmotionStats({ user }) {
  const { isDarkMode } = useContext(ThemeContext)
  const [isLoading, setIsLoading] = useState(true)
  const [statsData, setStatsData] = useState({
    totalDiaries: 0,
    streakDays: 0,
    emotionStats: [],
    emotionCounts: {},
    monthlyData: [],
    weeklyPattern: [0, 0, 0, 0, 0, 0, 0],
    diaries: []
  })
  const navigate = useNavigate()
  
  // AI 분석 리포트 상태
  const [showAIReport, setShowAIReport] = useState(false)
  const [aiReport, setAiReport] = useState('')
  const [isAILoading, setIsAILoading] = useState(false)

  // Firebase에서 감정 통계 데이터 로드
  useEffect(() => {
    const loadStatsData = async () => {
      setIsLoading(true)
      try {
        console.log('📊 통계: 데이터 로드 시작')
        console.log('👤 사용자 정보:', user ? '로그인됨' : '로그인 안됨', user?.email || user?.uid || 'no user info')
        
        // Firebase 데이터 우선 로드 시도 (사용자가 있을 때)
        if (user && (user.uid || user.email)) {
          try {
            console.log('🔥 Firebase 데이터 로드 시도 중...')
            const [emotionResult, streakResult, diariesResult] = await Promise.all([
              getEmotionStats(),
              getStreakDays(),
              getAllDiaries(365)
            ])

            console.log('📈 Firebase 응답:', {
              emotion: emotionResult.success,
              streak: streakResult.success,
              diaries: diariesResult.success,
              totalDiaries: emotionResult.stats?.totalDiaries || 0
            })

            // Firebase 데이터가 있으면 우선 사용
            if (emotionResult.success && emotionResult.stats.totalDiaries > 0) {
              console.log('🔥 Firebase 통계 데이터 로드 성공:', emotionResult.stats.totalDiaries, '개')
              
              let firebaseStatsData = {
                totalDiaries: emotionResult.stats.totalDiaries,
                streakDays: streakResult.success ? streakResult.streakDays : 0,
                emotionStats: emotionResult.stats.emotionStats,
                emotionCounts: emotionResult.stats.emotionCounts,
                monthlyData: [],
                weeklyPattern: [0, 0, 0, 0, 0, 0, 0],
                diaries: []
              }

              if (diariesResult.success && diariesResult.diaries) {
                firebaseStatsData.monthlyData = calculateMonthlyData(diariesResult.diaries)
                firebaseStatsData.weeklyPattern = calculateWeeklyPattern(diariesResult.diaries)
                firebaseStatsData.diaries = diariesResult.diaries
              }

              setStatsData(firebaseStatsData)
              console.log('✅ Firebase 통계 설정 완료')
            } else {
              console.log('📱 Firebase 데이터 없음, 로컬 데이터 사용')
              // Firebase 데이터가 없으면 로컬 데이터 사용
              const localDiaries = JSON.parse(localStorage.getItem('diaryEntries') || '{}')
              const localDiariesArray = Object.entries(localDiaries).map(([date, diary]) => ({
                ...diary,
                date: date,
                id: date
              }))
              
              console.log('📊 로컬 일기 데이터:', localDiariesArray.length, '개')
              let localStatsData = calculateLocalStats(localDiariesArray)
              setStatsData(localStatsData)
            }
          } catch (firebaseError) {
            console.warn('⚠️ Firebase 로드 실패, 로컬 데이터 사용:', firebaseError)
            // Firebase 오류 시 로컬 데이터 사용
            const localDiaries = JSON.parse(localStorage.getItem('diaryEntries') || '{}')
            const localDiariesArray = Object.entries(localDiaries).map(([date, diary]) => ({
              ...diary,
              date: date,
              id: date
            }))
            
            console.log('📊 로컬 일기 데이터:', localDiariesArray.length, '개')
            let localStatsData = calculateLocalStats(localDiariesArray)
            setStatsData(localStatsData)
          }
        } else {
          console.log('👤 로그인 안함, 로컬 데이터만 사용')
          // 로그인하지 않은 경우 로컬 데이터만 사용
          const localDiaries = JSON.parse(localStorage.getItem('diaryEntries') || '{}')
          const localDiariesArray = Object.entries(localDiaries).map(([date, diary]) => ({
            ...diary,
            date: date,
            id: date
          }))
          
          console.log('📊 로컬 일기 데이터:', localDiariesArray.length, '개')
          let localStatsData = calculateLocalStats(localDiariesArray)
          setStatsData(localStatsData)
        }

      } catch (error) {
        console.error('❌ 감정 통계 로드 오류:', error)
        
        // 오류 시에도 기본값 설정
        setStatsData({
          totalDiaries: 0,
          streakDays: 0,
          emotionStats: [],
          emotionCounts: {},
          monthlyData: [],
          weeklyPattern: [0, 0, 0, 0, 0, 0, 0],
          diaries: []
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadStatsData()
  }, [user])

  // 로컬 데이터로 통계 계산
  const calculateLocalStats = (diaries) => {
    console.log('📈 로컬 통계 계산 시작:', diaries)
    
    if (diaries.length === 0) {
      return {
        totalDiaries: 0,
        streakDays: 0,
        emotionStats: [],
        emotionCounts: {},
        monthlyData: [],
        weeklyPattern: [0, 0, 0, 0, 0, 0, 0],
        diaries: []
      }
    }

    // 감정별 카운트
    const emotionCounts = {}
    let totalDiaries = 0

    diaries.forEach(diary => {
      if (diary.emotion) {
        emotionCounts[diary.emotion] = (emotionCounts[diary.emotion] || 0) + 1
        totalDiaries++
      }
    })

    // 감정 통계 생성
    const emotionStats = Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion,
      count,
      percentage: totalDiaries > 0 ? Math.round((count / totalDiaries) * 100) : 0
    })).sort((a, b) => b.count - a.count)

    // 연속 작성일 계산
    const streakDays = calculateLocalStreak(diaries)

    // 월별 및 주간 패턴 계산
    const monthlyData = calculateMonthlyData(diaries)
    const weeklyPattern = calculateWeeklyPattern(diaries)

    console.log('📊 로컬 통계 결과:', {
      totalDiaries,
      streakDays,
      emotionStats: emotionStats.length,
      monthlyData: monthlyData.length
    })

    return {
      totalDiaries,
      streakDays,
      emotionStats,
      emotionCounts,
      monthlyData,
      weeklyPattern,
      diaries
    }
  }

  // 로컬 데이터로 연속 작성일 계산
  const calculateLocalStreak = (diaries) => {
    if (diaries.length === 0) return 0

    // 18시-23시59분 사이에 작성된 일기만 필터링
    const validTimeDiaries = diaries.filter(diary => {
      if (!diary.createdAt) return false // 작성 시간이 없으면 제외
      
      const createdDate = new Date(diary.createdAt)
      const hour = createdDate.getHours()
      
      // 18시-23시59분 사이에 작성된 일기만 포함
      return hour >= 18 && hour <= 23
    })

    if (validTimeDiaries.length === 0) return 0

    const sortedDiaries = validTimeDiaries.sort((a, b) => new Date(b.date) - new Date(a.date))
    
    let streakDays = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const diary of sortedDiaries) {
      const diaryDate = new Date(diary.date + 'T00:00:00')
      const diffTime = currentDate - diaryDate
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === streakDays) {
        streakDays++
        currentDate.setDate(currentDate.getDate() - 1)
      } else if (diffDays === streakDays + 1 && streakDays === 0) {
        streakDays++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streakDays
  }

  // 월별 데이터 계산
  const calculateMonthlyData = (diaries) => {
    const monthlyStats = {}
    
    diaries.forEach(diary => {
      const date = new Date(diary.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          month: monthKey,
          count: 0,
          emotions: {}
        }
      }
      
      monthlyStats[monthKey].count++
      
      if (diary.emotion) {
        monthlyStats[monthKey].emotions[diary.emotion] = 
          (monthlyStats[monthKey].emotions[diary.emotion] || 0) + 1
      }
    })

    return Object.values(monthlyStats)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6) // 최근 6개월
  }

  // 주간 패턴 계산 (요일별 작성 빈도)
  const calculateWeeklyPattern = (diaries) => {
    const weekDayCounts = [0, 0, 0, 0, 0, 0, 0] // 일~토
    
    diaries.forEach(diary => {
      const date = new Date(diary.date)
      const dayOfWeek = date.getDay()
      weekDayCounts[dayOfWeek]++
    })

    return weekDayCounts
  }

  // AI 분석 리포트 생성
  const generateAIReport = async () => {
    if (statsData.totalDiaries === 0) {
      setAiReport('아직 분석할 일기가 충분하지 않습니다. 더 많은 일기를 작성해주세요!')
      return
    }

    setIsAILoading(true)
    setShowAIReport(true)

    try {
      // 분석용 데이터 준비
      const analysisData = {
        totalDiaries: statsData.totalDiaries,
        streakDays: statsData.streakDays,
        emotionStats: statsData.emotionStats,
        emotionCounts: statsData.emotionCounts,
        dominantEmotion: statsData.emotionStats[0]?.emotion || 'PEACEFUL',
        secondaryEmotion: statsData.emotionStats[1]?.emotion || 'HAPPY',
        weeklyPattern: statsData.weeklyPattern,
        recentDiaries: statsData.diaries.slice(-5) // 최근 5개 일기
      }

      // AI 분석 요청
      const prompt = `
다음은 사용자의 일기 작성 패턴과 감정 데이터입니다. 이를 기반으로 사용자의 심리 상태와 감정 패턴을 분석해주세요.

**데이터:**
- 총 일기 수: ${analysisData.totalDiaries}개
- 연속 작성일: ${analysisData.streakDays}일
- 주요 감정: ${emotions[analysisData.dominantEmotion]?.label} (${analysisData.emotionCounts[analysisData.dominantEmotion] || 0}회)
- 보조 감정: ${emotions[analysisData.secondaryEmotion]?.label} (${analysisData.emotionCounts[analysisData.secondaryEmotion] || 0}회)
- 주간 작성 패턴: 일(${analysisData.weeklyPattern[0]}), 월(${analysisData.weeklyPattern[1]}), 화(${analysisData.weeklyPattern[2]}), 수(${analysisData.weeklyPattern[3]}), 목(${analysisData.weeklyPattern[4]}), 금(${analysisData.weeklyPattern[5]}), 토(${analysisData.weeklyPattern[6]})

**분석 요청사항:**
1. 감정 패턴 분석 (주요 감정과 보조 감정의 의미)
2. 작성 습관 분석 (연속 작성일과 주간 패턴)
3. 심리 상태 추론
4. 개선 제안 및 조언

**답변 형식:**
- 친근하고 따뜻한 톤으로 작성
- 3-4문단으로 구성
- 구체적이고 실용적인 조언 포함
- 격려와 긍정적인 메시지 포함
`

      const response = await openaiService.generateAIAnalysis(prompt)
      setAiReport(response)

    } catch (error) {
      console.error('AI 분석 오류:', error)
      setAiReport(`
📊 **현재 감정 상태 분석**

총 ${statsData.totalDiaries}개의 일기를 통해 분석한 결과, 주요 감정은 **${emotions[statsData.emotionStats[0]?.emotion]?.label || '평온'}**이며, ${statsData.streakDays}일 연속으로 꾸준히 기록하고 계시네요!

🔄 **작성 패턴 분석**

주간 작성 패턴을 보면, 특정 요일에 더 활발하게 일기를 작성하는 경향이 있습니다. 이는 일정한 루틴이 형성되어 있음을 의미합니다.

💡 **개선 제안**

감정의 다양성을 늘리고 더 풍부한 표현을 시도해보세요. 매일 다른 관점에서 하루를 돌아보면 새로운 감정을 발견할 수 있을 거예요.

✨ **격려 메시지**

꾸준한 일기 작성 습관이 정말 훌륭합니다! 자신의 감정을 기록하고 돌아보는 것은 심리적 안정과 자기 이해에 큰 도움이 됩니다.
      `)
    } finally {
      setIsAILoading(false)
    }
  }

  // 로딩 중 화면
  if (isLoading) {
    return (
      <div className={`min-h-screen ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      } flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            감정 통계를 불러오는 중...
          </p>
        </div>
      </div>
    )
  }

  // Firebase 데이터가 없는 경우
  if (statsData.totalDiaries === 0) {
    return (
      <div className={`min-h-screen ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      } flex items-center justify-center`}>
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <BarChart3 className={`w-16 h-16 mx-auto ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
          </div>
          <h2 className={`text-2xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            아직 통계 데이터가 없어요
          </h2>
          <p className={`text-lg mb-6 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            일기를 작성하면 감정 통계를 확인할 수 있습니다
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            일기 작성하러 가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: isDarkMode 
        ? 'linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)' 
        : 'linear-gradient(135deg, #E3F2FD 0%, #F0F8FF 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      color: isDarkMode ? '#FFFFFF' : '#1D1D1F'
    }}>
      {/* 헤더 */}
      <div style={{
        background: isDarkMode 
          ? 'rgba(44, 44, 46, 0.95)' 
          : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: isDarkMode 
          ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
          : '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#17A2B8',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '8px 16px',
              borderRadius: '12px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(23, 162, 184, 0.1)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <ArrowLeft style={{ width: '20px', height: '20px' }} />
            <span>뒤로가기</span>
          </button>
          
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 'bold',
              color: isDarkMode ? '#FFFFFF' : '#17A2B8'
            }}>
              감정 통계
            </h1>
            <p style={{ margin: 0, color: isDarkMode ? '#8E8E93' : '#666', fontSize: '14px' }}>
              일기 작성 감정 분석해보세요
            </p>
          </div>
          
          <div style={{ width: '100px' }}></div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* 메인 통계 카드들 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* 총 일기 수 */}
          <div style={{
            background: isDarkMode ? 'rgba(44, 44, 46, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: isDarkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)'
            e.currentTarget.style.boxShadow = isDarkMode 
              ? '0 12px 40px rgba(0, 0, 0, 0.4)' 
              : '0 12px 40px rgba(0, 0, 0, 0.15)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = isDarkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
              : '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #FFD93D 0%, #FF9800 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                📖
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: isDarkMode ? '#8E8E93' : '#666' }}>총 일기 수</h3>
                <p style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#FFD93D' }}>{statsData.totalDiaries}개</p>
              </div>
            </div>
          </div>

          {/* 연속 작성일 */}
          <div style={{
            background: isDarkMode ? 'rgba(44, 44, 46, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: isDarkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)'
            e.currentTarget.style.boxShadow = isDarkMode 
              ? '0 12px 40px rgba(0, 0, 0, 0.4)' 
              : '0 12px 40px rgba(0, 0, 0, 0.15)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = isDarkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
              : '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🔥
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: isDarkMode ? '#8E8E93' : '#666' }}>연속 작성일</h3>
                <p style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#FF6B35' }}>{statsData.streakDays}일</p>
              </div>
            </div>
          </div>

          {/* 이번 달 주요 감정 */}
          <div style={{
            background: isDarkMode ? 'rgba(44, 44, 46, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: isDarkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)'
            e.currentTarget.style.boxShadow = isDarkMode 
              ? '0 12px 40px rgba(0, 0, 0, 0.4)' 
              : '0 12px 40px rgba(0, 0, 0, 0.15)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = isDarkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
              : '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: statsData.emotionStats.length > 0 ? `linear-gradient(135deg, ${emotions[statsData.emotionStats[0].emotion]?.color}80, ${emotions[statsData.emotionStats[0].emotion]?.color})` : 'linear-gradient(135deg, #17A2B8 0%, #138496 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                {statsData.emotionStats.length > 0 ? emotions[statsData.emotionStats[0].emotion]?.emoji : '📊'}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: isDarkMode ? '#8E8E93' : '#666' }}>이번 달 주요 감정</h3>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: statsData.emotionStats.length > 0 ? emotions[statsData.emotionStats[0].emotion]?.color : '#17A2B8' }}>
                  {statsData.emotionStats.length > 0 ? emotions[statsData.emotionStats[0].emotion]?.label : '데이터 없음'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 이번 달 감정 분포 */}
        <div style={{
          background: isDarkMode ? 'rgba(44, 44, 46, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: isDarkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #17A2B8 0%, #138496 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PieChart size={20} color="white" />
            </div>
            <h3 style={{ 
              margin: 0, 
              fontSize: '20px', 
              fontWeight: '700',
              color: isDarkMode ? '#FFFFFF' : '#333'
            }}>
              {statsData.monthlyData.length > 0 
                ? `${statsData.monthlyData[0].month.split('-')[0]}년 ${statsData.monthlyData[0].month.split('-')[1]}월 감정 분포`
                : '감정 분포'
              }
            </h3>
          </div>

          {statsData.emotionCounts && Object.keys(statsData.emotionCounts).length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {Object.entries(emotions).map(([emotionKey, emotionData]) => {
                const count = statsData.emotionCounts[emotionKey] || 0
                const percentage = Object.keys(statsData.emotionCounts).length > 0 ? (count / Object.keys(statsData.emotionCounts).length * 100) : 0
                
                return (
                  <div key={emotionKey} style={{
                    background: isDarkMode ? 'rgba(58, 58, 60, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)'
                    e.currentTarget.style.backgroundColor = count > 0 ? `${emotionData.color}20` : (isDarkMode ? 'rgba(58, 58, 60, 0.7)' : 'rgba(248, 250, 252, 1)')
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(58, 58, 60, 0.5)' : 'rgba(248, 250, 252, 0.8)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '28px' }}>{emotionData.emoji}</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: isDarkMode ? '#FFFFFF' : '#333' }}>
                          {emotionData.label}
                        </h4>
                        <p style={{ margin: 0, fontSize: '14px', color: isDarkMode ? '#8E8E93' : '#666' }}>
                          {count}회 ({percentage.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        backgroundColor: emotionData.color,
                        borderRadius: '4px',
                        transition: 'all 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: isDarkMode ? '#8E8E93' : '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <p style={{ fontSize: '18px', margin: 0 }}>이번 달 작성된 일기가 없습니다</p>
            </div>
          )}
        </div>

        {/* 주간 작성 패턴 */}
        <PatternAnalysis diaries={statsData.diaries || []} isDarkMode={isDarkMode} />
        
        {/* AI 분석 리포트 */}
        <div style={{
          background: isDarkMode ? 'rgba(44, 44, 46, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: isDarkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
          backdropFilter: 'blur(10px)',
          marginTop: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Brain size={20} color="white" />
              </div>
              <div>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '18px', 
                  fontWeight: '700',
                  color: isDarkMode ? '#FFFFFF' : '#333'
                }}>
                  AI 분석 리포트
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '12px',
                  color: isDarkMode ? '#8E8E93' : '#666'
                }}>
                  감정 패턴과 작성 습관을 AI가 분석해드려요
                </p>
              </div>
            </div>
            
            <button
              onClick={generateAIReport}
              disabled={isAILoading || statsData.totalDiaries === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: statsData.totalDiaries === 0 
                  ? (isDarkMode ? 'rgba(58, 58, 60, 0.5)' : 'rgba(156, 163, 175, 0.5)')
                  : (isAILoading 
                    ? 'rgba(255, 107, 53, 0.7)'
                    : 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)'),
                color: statsData.totalDiaries === 0 
                  ? (isDarkMode ? '#8E8E93' : '#9CA3AF')
                  : 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: statsData.totalDiaries === 0 ? 'not-allowed' : (isAILoading ? 'wait' : 'pointer'),
                transition: 'all 0.2s',
                opacity: statsData.totalDiaries === 0 ? 0.5 : 1
              }}
              onMouseOver={(e) => {
                if (statsData.totalDiaries > 0 && !isAILoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(255, 107, 53, 0.4)'
                }
              }}
              onMouseOut={(e) => {
                if (statsData.totalDiaries > 0 && !isAILoading) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            >
              {isAILoading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <span>분석 중...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>AI 분석 시작</span>
                </>
              )}
            </button>
          </div>
          
          {/* AI 분석 결과 */}
          {showAIReport && (
            <div style={{
              background: isDarkMode ? 'rgba(58, 58, 60, 0.5)' : 'rgba(248, 250, 252, 0.8)',
              borderRadius: '16px',
              padding: '24px',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
              marginTop: '16px'
            }}>
              {isAILoading ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '40px',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid rgba(255, 107, 53, 0.3)',
                    borderTop: '4px solid #FF6B35',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <div style={{
                    textAlign: 'center',
                    color: isDarkMode ? '#CCCCCC' : '#666'
                  }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
                      AI가 분석하고 있어요...
                    </p>
                    <p style={{ margin: 0, fontSize: '14px' }}>
                      감정 패턴과 작성 습관을 꼼꼼히 살펴보는 중입니다 🤖
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{
                  color: isDarkMode ? '#FFFFFF' : '#333',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-line'
                }}>
                  {aiReport}
                </div>
              )}
            </div>
          )}
          
          {!showAIReport && !isAILoading && statsData.totalDiaries > 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: isDarkMode ? '#8E8E93' : '#666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
              <p style={{
                fontSize: '16px',
                margin: '0 0 8px 0',
                color: isDarkMode ? '#CCCCCC' : '#666'
              }}>
                AI가 당신의 감정 패턴을 분석해드릴까요?
              </p>
              <p style={{
                fontSize: '14px',
                margin: 0,
                color: isDarkMode ? '#8E8E93' : '#999'
              }}>
                작성한 일기를 바탕으로 개인화된 분석 리포트를 제공합니다
              </p>
            </div>
          )}
          
          {statsData.totalDiaries === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: isDarkMode ? '#8E8E93' : '#666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <p style={{
                fontSize: '16px',
                margin: '0 0 8px 0',
                color: isDarkMode ? '#CCCCCC' : '#666'
              }}>
                일기를 작성하면 AI 분석을 받을 수 있어요
              </p>
              <p style={{
                fontSize: '14px',
                margin: 0,
                color: isDarkMode ? '#8E8E93' : '#999'
              }}>
                감정과 작성 패턴을 분석하여 개인화된 인사이트를 제공합니다
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* 스피너 애니메이션 스타일 */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default EmotionStats 