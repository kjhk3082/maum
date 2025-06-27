import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Calendar as CalendarIcon, Heart, Frown, Angry, Moon, Zap, X, Home, ArrowLeft } from 'lucide-react'
import { useTheme } from '../App'
import { getAllDiaries } from '../firebase/diaryService'

const emotionConfig = {
  HAPPY: { emoji: '😊', label: '기쁨', icon: Heart, color: 'text-yellow-500 bg-yellow-50' },
  SAD: { emoji: '😢', label: '슬픔', icon: Frown, color: 'text-blue-500 bg-blue-50' },
  ANGRY: { emoji: '😠', label: '화남', icon: Angry, color: 'text-red-500 bg-red-50' },
  PEACEFUL: { emoji: '😌', label: '평온', icon: Moon, color: 'text-green-500 bg-green-50' },
  ANXIOUS: { emoji: '😰', label: '불안', icon: Zap, color: 'text-orange-500 bg-orange-50' }
}

function DiarySearch({ user }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEmotion, setSelectedEmotion] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const navigate = useNavigate()
  const [allDiaries, setAllDiaries] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const { isDarkMode } = useTheme()

  // Firebase에서 일기 데이터 로드
  useEffect(() => {
    const loadDiaries = async () => {
      setDataLoading(true)
      try {
        console.log('🔍 검색: Firebase 데이터 로드 시작')
        
        // Firebase에서 데이터 가져오기 시도
        if (user) {
          const result = await getAllDiaries(365) // 최근 1년 데이터
          
          if (result.success && result.diaries && result.diaries.length > 0) {
            console.log('🔥 Firebase 일기 데이터 로드 성공:', result.diaries.length, '개')
            setAllDiaries(result.diaries)
          } else {
            console.log('📱 Firebase 데이터 없음, 로컬 데이터 사용')
            // Firebase 데이터가 없으면 로컬 데이터 사용
            const localDiaries = JSON.parse(localStorage.getItem('diaryEntries') || '{}')
            const localDiariesArray = Object.entries(localDiaries).map(([date, diary]) => ({
              ...diary,
              date: date,
              id: date,
              diaryDate: date
            }))
            setAllDiaries(localDiariesArray)
          }
        } else {
          // 로그인하지 않은 경우 로컬 데이터만 사용
          console.log('👤 로그인 안함, 로컬 데이터만 사용')
          const localDiaries = JSON.parse(localStorage.getItem('diaryEntries') || '{}')
          const localDiariesArray = Object.entries(localDiaries).map(([date, diary]) => ({
            ...diary,
            date: date,
            id: date,
            diaryDate: date
          }))
          setAllDiaries(localDiariesArray)
        }
      } catch (error) {
        console.error('검색 데이터 로드 오류:', error)
        // 오류 시 로컬 데이터 사용
        const localDiaries = JSON.parse(localStorage.getItem('diaryEntries') || '{}')
        const localDiariesArray = Object.entries(localDiaries).map(([date, diary]) => ({
          ...diary,
          date: date,
          id: date,
          diaryDate: date
        }))
        setAllDiaries(localDiariesArray)
      } finally {
        setDataLoading(false)
      }
    }

    loadDiaries()
  }, [user])

  const handleSearch = async () => {
    if (!searchQuery.trim() && !selectedEmotion) {
      alert('검색어를 입력하거나 감정을 선택해주세요.')
      return
    }

    setLoading(true)
    setHasSearched(true)
    
    console.log('🔍 검색 시작:', { searchQuery, selectedEmotion, allDiaries: allDiaries.length })
    
    // 검색 수행
    setTimeout(() => {
      const results = allDiaries
        .filter((diary) => {
          const matchesKeyword = !searchQuery || 
            (diary.title && diary.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (diary.content && diary.content.toLowerCase().includes(searchQuery.toLowerCase()))
          
          const matchesEmotion = !selectedEmotion || diary.emotion === selectedEmotion
          
          return matchesKeyword && matchesEmotion
        })
        .sort((a, b) => new Date(b.date || b.diaryDate) - new Date(a.date || a.diaryDate))
      
      console.log('🔍 검색 결과:', results.length, '개')
      setSearchResults(results)
      setLoading(false)
    }, 300)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSelectedEmotion('')
    setSearchResults([])
    setHasSearched(false)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    })
  }

  const truncateContent = (content, maxLength = 100) => {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + '...'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: isDarkMode 
        ? 'linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)' 
        : 'linear-gradient(135deg, #E3F2FD 0%, #F0F8FF 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      transition: 'all 0.3s ease'
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
              color: isDarkMode ? '#17A2B8' : '#17A2B8',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '8px 16px',
              borderRadius: '12px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(23, 162, 184, 0.1)' : 'rgba(23, 162, 184, 0.1)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Home style={{ width: '20px', height: '20px' }} />
            <span>홈으로</span>
          </button>
          
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 'bold',
              color: isDarkMode ? '#FFFFFF' : '#17A2B8'
            }}>
              일기 검색
            </h1>
            <p style={{ margin: 0, color: isDarkMode ? '#8E8E93' : '#666', fontSize: '14px' }}>
              작성한 일기를 검색해보세요
            </p>
          </div>
          
          <div style={{ width: '76px' }}></div>
        </div>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 20px' }}>
        {/* 검색 섹션 */}
        <div style={{
          background: isDarkMode 
            ? 'rgba(44, 44, 46, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '25px',
          marginBottom: '25px',
          boxShadow: isDarkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
        }}>
          {/* 키워드 검색 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '16px', 
              fontWeight: '600', 
              color: isDarkMode ? '#FFFFFF' : '#333', 
              marginBottom: '10px' 
            }}>
              키워드 검색
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search style={{ 
                position: 'absolute', 
                left: '16px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                width: '20px', 
                height: '20px', 
                color: isDarkMode ? '#8E8E93' : '#aaa'
              }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="제목이나 내용을 검색해보세요..."
                style={{
                  width: '100%',
                  paddingLeft: '45px',
                  paddingRight: '15px',
                  paddingTop: '15px',
                  paddingBottom: '15px',
                  backgroundColor: isDarkMode 
                    ? 'rgba(58, 58, 60, 0.7)' 
                    : 'rgba(248, 249, 250, 0.7)',
                  border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(233, 236, 239, 0.8)'}`,
                  borderRadius: '12px',
                  fontSize: '16px',
                  color: isDarkMode ? '#FFFFFF' : '#333',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* 감정 선택 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '16px', 
              fontWeight: '600', 
              color: isDarkMode ? '#FFFFFF' : '#333', 
              marginBottom: '10px' 
            }}>
              감정별 검색
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
              {Object.entries(emotionConfig).map(([emotion, config]) => (
                <button
                  key={emotion}
                  onClick={() => setSelectedEmotion(selectedEmotion === emotion ? '' : emotion)}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '12px',
                    border: selectedEmotion === emotion 
                      ? `2px solid #17A2B8` 
                      : `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e9ecef'}`,
                    backgroundColor: selectedEmotion === emotion 
                      ? 'rgba(23, 162, 184, 0.1)'
                      : isDarkMode ? 'rgba(58, 58, 60, 0.5)' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    transform: selectedEmotion === emotion ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '24px', marginBottom: '8px' }}>{config.emoji}</span>
                    <span style={{ 
                      fontSize: '14px', 
                      fontWeight: '500',
                      color: selectedEmotion === emotion 
                        ? '#17A2B8'
                        : isDarkMode ? '#FFFFFF' : '#666'
                    }}>
                      {config.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 검색 버튼 */}
          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={handleSearch}
              style={{
                flex: '1',
                background: 'linear-gradient(135deg, #17A2B8 0%, #138496 100%)',
                color: 'white',
                fontWeight: 'bold',
                padding: '15px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(23, 162, 184, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Search style={{ width: '20px', height: '20px' }} />
              검색
            </button>
            
            <button
              onClick={clearSearch}
              style={{
                padding: '10px 20px',
                backgroundColor: isDarkMode 
                  ? 'rgba(58, 58, 60, 0.9)' 
                  : 'rgba(255, 255, 255, 0.9)',
                color: isDarkMode ? '#FFFFFF' : '#666',
                border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(233, 236, 239, 0.9)'}`,
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: isDarkMode 
                  ? '0 2px 10px rgba(0, 0, 0, 0.2)' 
                  : '0 2px 10px rgba(0, 0, 0, 0.05)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode 
                  ? 'rgba(72, 72, 74, 0.95)' 
                  : 'rgba(248, 249, 250, 0.95)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = isDarkMode 
                  ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.08)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode 
                  ? 'rgba(58, 58, 60, 0.9)' 
                  : 'rgba(255, 255, 255, 0.9)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = isDarkMode 
                  ? '0 2px 10px rgba(0, 0, 0, 0.2)' 
                  : '0 2px 10px rgba(0, 0, 0, 0.05)'
              }}
            >
              <X style={{ width: '20px', height: '20px' }} />
              초기화
            </button>
          </div>
        </div>

        {/* 검색 결과 */}
        {hasSearched && (
          <div style={{
            background: isDarkMode 
              ? 'rgba(44, 44, 46, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '25px',
            boxShadow: isDarkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
              : '0 8px 32px rgba(0, 0, 0, 0.15)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{
                margin: 0,
                fontSize: '22px',
                fontWeight: 'bold',
                color: isDarkMode ? '#FFFFFF' : '#333'
              }}>
                검색 결과
              </h2>
              <span style={{
                padding: '8px 16px',
                background: 'rgba(23, 162, 184, 0.1)', 
                color: '#17A2B8',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {searchResults.length}개 발견
              </span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  border: '4px solid rgba(23, 162, 184, 0.2)',
                  borderTop: '4px solid #17A2B8',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px auto'
                }}></div>
                <p style={{ color: isDarkMode ? '#8E8E93' : '#666', fontSize: '16px' }}>검색 중...</p>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            ) : searchResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: '60px', marginBottom: '16px' }}>📝</div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: isDarkMode ? '#FFFFFF' : '#333', marginBottom: '8px' }}>검색 결과가 없습니다</h3>
                <p style={{ color: isDarkMode ? '#8E8E93' : '#666', fontSize: '16px' }}>다른 키워드나 감정으로 검색해보세요</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {searchResults.map((diary, index) => {
                  const emotionInfo = emotionConfig[diary.emotion]
                  const emotionColors = {
                    'HAPPY': { bg: 'rgba(255, 217, 61, 0.1)', border: 'rgba(255, 217, 61, 0.3)', text: '#F9A825' },
                    'SAD': { bg: 'rgba(79, 195, 247, 0.1)', border: 'rgba(79, 195, 247, 0.3)', text: '#0288D1' },
                    'ANGRY': { bg: 'rgba(244, 67, 54, 0.1)', border: 'rgba(244, 67, 54, 0.3)', text: '#D32F2F' },
                    'PEACEFUL': { bg: 'rgba(76, 175, 80, 0.1)', border: 'rgba(76, 175, 80, 0.3)', text: '#388E3C' },
                    'ANXIOUS': { bg: 'rgba(255, 152, 0, 0.1)', border: 'rgba(255, 152, 0, 0.3)', text: '#F57C00' }
                  }
                  const emotionColor = emotionColors[diary.emotion] || { bg: 'rgba(158, 158, 158, 0.1)', border: 'rgba(158, 158, 158, 0.3)', text: '#757575' }
                  const diaryDate = diary.date || diary.diaryDate || diary.id
                  
                  return (
                    <div
                      key={diary.id || diary.date || index}
                      onClick={() => navigate(`/diary/${diaryDate}`)}
                      style={{
                        background: isDarkMode 
                          ? 'rgba(58, 58, 60, 0.7)' 
                          : 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        padding: '20px',
                        border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(233, 236, 239, 0.8)'}`,
                        boxShadow: isDarkMode 
                          ? '0 4px 16px rgba(0, 0, 0, 0.2)' 
                          : '0 4px 16px rgba(0, 0, 0, 0.05)',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)'
                        e.currentTarget.style.boxShadow = isDarkMode 
                          ? '0 8px 24px rgba(23, 162, 184, 0.2)' 
                          : '0 8px 24px rgba(23, 162, 184, 0.15)'
                        e.currentTarget.style.borderColor = 'rgba(23, 162, 184, 0.3)'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = isDarkMode 
                          ? '0 4px 16px rgba(0, 0, 0, 0.2)' 
                          : '0 4px 16px rgba(0, 0, 0, 0.05)'
                        e.currentTarget.style.borderColor = isDarkMode 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(233, 236, 239, 0.8)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <CalendarIcon style={{ width: '20px', height: '20px', color: '#17A2B8' }} />
                          <h3 style={{ 
                            fontSize: '18px', 
                            fontWeight: 'bold', 
                            color: isDarkMode ? '#FFFFFF' : '#333',
                            margin: 0
                          }}>
                            {diary.title}
                          </h3>
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          padding: '6px 12px',
                          backgroundColor: emotionColor.bg,
                          border: `1px solid ${emotionColor.border}`,
                          borderRadius: '20px'
                        }}>
                          <span style={{ fontSize: '18px' }}>{emotionInfo?.emoji}</span>
                          <span style={{ fontSize: '14px', fontWeight: '500', color: emotionColor.text }}>{emotionInfo?.label}</span>
                        </div>
                      </div>
                      
                      <p style={{
                        color: isDarkMode ? '#CCCCCC' : '#555', 
                        lineHeight: '1.6',
                        margin: '0 0 16px 0'
                      }}>
                        {truncateContent(diary.content)}
                      </p>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
                        <span style={{ color: isDarkMode ? '#8E8E93' : '#777' }}>{formatDate(diaryDate)}</span>
                        <span style={{ 
                          color: '#17A2B8', 
                          fontWeight: '600'
                        }}>
                          자세히 보기 →
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* 초기 상태 */}
        {!hasSearched && (
          <div style={{
            background: isDarkMode 
              ? 'rgba(44, 44, 46, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '60px 20px',
            textAlign: 'center',
            boxShadow: isDarkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
              : '0 8px 32px rgba(0, 0, 0, 0.15)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🔍</div>
            <h3 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: isDarkMode ? '#FFFFFF' : '#333', 
              marginBottom: '12px'
            }}>일기를 검색해보세요</h3>
            <p style={{ color: isDarkMode ? '#8E8E93' : '#666', fontSize: '16px' }}>키워드나 감정을 선택하고 검색 버튼을 클릭하세요</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DiarySearch
