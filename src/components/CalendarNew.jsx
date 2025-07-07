import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'

const emotions = {
  HAPPY: { emoji: '😊', color: '#FFD93D' },
  SAD: { emoji: '😢', color: '#4FC3F7' },
  ANGRY: { emoji: '😠', color: '#F44336' },
  PEACEFUL: { emoji: '😌', color: '#4CAF50' },
  ANXIOUS: { emoji: '😰', color: '#FF9800' }
}

function CalendarNew() {
  console.log('🚀 CalendarNew component is rendering!')
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // 더미 데이터 제거 - 로컬스토리지에서 실제 사용자 데이터만 사용
  const [diaryEntries, setDiaryEntries] = useState(() => {
    return JSON.parse(localStorage.getItem('diaryEntries') || '{}')
  })
  
  // 로컬스토리지 변경 감지
  useEffect(() => {
    const handleStorageChange = () => {
      setDiaryEntries(JSON.parse(localStorage.getItem('diaryEntries') || '{}'))
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const today = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // 달력 생성 로직
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

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ]

  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 헤더 */}
      <div className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl transform rotate-3">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  마음일기
                </h1>
                <p className="text-sm text-gray-500">오늘의 감정을 기록해보세요</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/search')}
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-200"
              >
                <Search className="w-4 h-4 mr-2" />
                검색
              </button>
              
              <button
                onClick={() => navigate(`/write/${formatDate(today)}`)}
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                오늘 일기 쓰기
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 캘린더 메인 */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {/* 캘린더 헤더 */}
              <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={prevMonth}
                    className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <h2 className="text-xl font-bold text-white">
                    {currentYear}년 {monthNames[currentMonth]}
                  </h2>
                  
                  <button
                    onClick={nextMonth}
                    className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 border-b border-gray-100">
                {weekDays.map((day) => (
                  <div key={day} className="p-4 text-center text-sm font-semibold text-gray-600 bg-gray-50/50">
                    {day}
                  </div>
                ))}
              </div>

              {/* 캘린더 그리드 */}
              <div className="grid grid-cols-7">
                {calendarDays.map((date, index) => {
                  const entry = hasEntry(date)
                  const todayClass = isToday(date)
                  const currentMonthClass = isCurrentMonth(date)
                  
                  return (
                    <div
                      key={index}
                      onClick={() => navigate(`/diary/${formatDate(date)}`)}
                      className={`
                        p-4 h-24 border-r border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:scale-105 relative
                        ${!currentMonthClass ? 'text-gray-300 bg-gray-50/30' : 'text-gray-900'}
                        ${todayClass ? 'bg-gradient-to-br from-blue-100 to-purple-100' : ''}
                      `}
                    >
                      <div className="flex flex-col h-full">
                        <div className={`text-sm font-medium mb-1 ${todayClass ? 'text-purple-600 font-bold' : ''}`}>
                          {date.getDate()}
                        </div>
                        
                        {entry && (
                          <div className="mt-auto">
                            <div
                              className="w-full h-2 rounded-full mb-1"
                              style={{ backgroundColor: emotions[entry.emotion]?.color }}
                            ></div>
                            <div className="text-lg">{emotions[entry.emotion]?.emoji}</div>
                          </div>
                        )}
                        
                        {todayClass && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 통계 카드 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">이달의 기록</h3>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600">작성한 일기</div>
                  <div className="text-2xl font-bold text-gray-800">{Object.keys(diaryEntries).length}개</div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600">연속 작성일</div>
                  <div className="text-2xl font-bold text-gray-800">6일</div>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600">자주 느끼는 감정</div>
                  <div className="text-2xl">😊</div>
                </div>
              </div>
            </div>

            {/* 빠른 액션 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">빠른 액션</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/search')}
                  className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Search className="w-4 h-4 mr-2" />
                  일기 검색
                </button>
                
                <button
                  onClick={() => navigate(`/write/${formatDate(today)}`)}
                  className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  오늘 일기 쓰기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarNew
