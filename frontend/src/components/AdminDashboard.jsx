import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Users, BarChart3, TrendingUp, Activity, Eye, Heart, Star, ArrowLeft } from 'lucide-react'
import { useTheme } from '../App'

function AdminDashboard() {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDiaries: 0,
    todayDiaries: 0,
    weeklyDiaries: 0,
    activeUsers: 0,
    averageWritingRate: 0,
    emotionDistribution: {},
    recentDiaries: []
  })

  useEffect(() => {
    // 더미 데이터로 통계 생성 (실제로는 Firebase에서 데이터 가져오기)
    const generateDummyStats = () => {
      const emotionDistribution = {
        HAPPY: Math.floor(Math.random() * 30) + 20,
        SAD: Math.floor(Math.random() * 20) + 10,
        ANGRY: Math.floor(Math.random() * 15) + 5,
        PEACEFUL: Math.floor(Math.random() * 25) + 15,
        ANXIOUS: Math.floor(Math.random() * 20) + 10
      }

      const recentDiaries = [
        { id: 1, title: '오늘의 행복한 하루', emotion: 'HAPPY', createdAt: '2025-06-28T10:30:00Z', author: '사용자1' },
        { id: 2, title: '조금 우울했던 하루', emotion: 'SAD', createdAt: '2025-06-28T09:15:00Z', author: '사용자2' },
        { id: 3, title: '평온한 일상', emotion: 'PEACEFUL', createdAt: '2025-06-28T08:45:00Z', author: '사용자3' },
        { id: 4, title: '화가 났던 일', emotion: 'ANGRY', createdAt: '2025-06-27T22:20:00Z', author: '사용자4' },
        { id: 5, title: '불안했던 마음', emotion: 'ANXIOUS', createdAt: '2025-06-27T21:10:00Z', author: '사용자5' }
      ]

      setStats({
        totalUsers: Math.floor(Math.random() * 1000) + 500,
        totalDiaries: Math.floor(Math.random() * 5000) + 2000,
        todayDiaries: Math.floor(Math.random() * 50) + 20,
        weeklyDiaries: Math.floor(Math.random() * 300) + 150,
        activeUsers: Math.floor(Math.random() * 200) + 100,
        averageWritingRate: (Math.random() * 30 + 60).toFixed(1),
        emotionDistribution,
        recentDiaries
      })
    }

    generateDummyStats()
    
    // 5분마다 통계 업데이트
    const interval = setInterval(generateDummyStats, 300000)
    return () => clearInterval(interval)
  }, [])

  const emotionConfig = {
    HAPPY: { label: '기쁨', color: '#FFD93D', emoji: '😊' },
    SAD: { label: '슬픔', color: '#4FC3F7', emoji: '😢' },
    ANGRY: { label: '화남', color: '#FF5252', emoji: '😠' },
    PEACEFUL: { label: '평온', color: '#66BB6A', emoji: '😌' },
    ANXIOUS: { label: '불안', color: '#FFA726', emoji: '😰' }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: isDarkMode 
        ? 'linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)' 
        : 'linear-gradient(135deg, #E3F2FD 0%, #F0F8FF 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      color: isDarkMode ? '#FFFFFF' : '#1D1D1F'
    }}>
      {/* 헤더 */}
      <div style={{
        background: isDarkMode 
          ? 'rgba(28, 28, 30, 0.95)' 
          : 'rgba(248, 248, 248, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                width: '44px',
                height: '44px',
                background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
              }}
            >
              <ArrowLeft style={{ width: '20px', height: '20px', color: isDarkMode ? '#FFFFFF' : '#374151' }} />
            </button>
            
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BarChart3 style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            
            <div>
              <h1 style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '700',
                color: isDarkMode ? '#FFFFFF' : '#1D1D1F'
              }}>
                관리자 대시보드
              </h1>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: isDarkMode ? '#8E8E93' : '#666'
              }}>
                마음일기 서비스 현황
              </p>
            </div>
          </div>
          
          <div style={{
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #17A2B8 0%, #138496 100%)',
            borderRadius: '12px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            Admin
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px'
      }}>
        {/* 주요 통계 카드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {[
            {
              title: '총 회원 수',
              value: stats.totalUsers.toLocaleString(),
              icon: Users,
              color: '#17A2B8',
              suffix: '명'
            },
            {
              title: '총 일기 수',
              value: stats.totalDiaries.toLocaleString(),
              icon: Calendar,
              color: '#FFD93D',
              suffix: '개'
            },
            {
              title: '오늘 작성된 일기',
              value: stats.todayDiaries,
              icon: TrendingUp,
              color: '#34C759',
              suffix: '개'
            },
            {
              title: '활성 사용자',
              value: stats.activeUsers,
              icon: Activity,
              color: '#FF6B6B',
              suffix: '명'
            },
            {
              title: '주간 일기 수',
              value: stats.weeklyDiaries,
              icon: BarChart3,
              color: '#8B5CF6',
              suffix: '개'
            },
            {
              title: '평균 작성률',
              value: stats.averageWritingRate,
              icon: Star,
              color: '#F59E0B',
              suffix: '%'
            }
          ].map((stat, index) => (
            <div
              key={index}
              style={{
                background: isDarkMode 
                  ? 'rgba(44, 44, 46, 0.9)' 
                  : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: isDarkMode 
                  ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
                  : '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                transition: 'all 0.3s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: `linear-gradient(135deg, ${stat.color}40, ${stat.color})`,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <stat.icon style={{ width: '28px', height: '28px', color: 'white' }} />
                </div>
                <div>
                  <h3 style={{
                    margin: '0 0 4px 0',
                    fontSize: '14px',
                    color: isDarkMode ? '#8E8E93' : '#666',
                    fontWeight: '500'
                  }}>
                    {stat.title}
                  </h3>
                  <p style={{
                    margin: 0,
                    fontSize: '28px',
                    fontWeight: '700',
                    color: stat.color
                  }}>
                    {stat.value}{stat.suffix}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 감정 분포 및 최근 일기 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* 감정 분포 */}
          <div style={{
            background: isDarkMode 
              ? 'rgba(44, 44, 46, 0.9)' 
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: isDarkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: isDarkMode ? '#FFFFFF' : '#1D1D1F'
            }}>
              📊 감정 분포
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(stats.emotionDistribution).map(([emotion, count]) => {
                const config = emotionConfig[emotion]
                const total = Object.values(stats.emotionDistribution).reduce((a, b) => a + b, 0)
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0
                
                return (
                  <div key={emotion} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>{config.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '4px'
                      }}>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: isDarkMode ? '#FFFFFF' : '#333'
                        }}>
                          {config.label}
                        </span>
                        <span style={{
                          fontSize: '12px',
                          color: isDarkMode ? '#8E8E93' : '#666'
                        }}>
                          {count}개 ({percentage}%)
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '6px',
                        background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: config.color,
                          borderRadius: '3px',
                          transition: 'width 0.3s'
                        }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 최근 일기 */}
          <div style={{
            background: isDarkMode 
              ? 'rgba(44, 44, 46, 0.9)' 
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: isDarkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: isDarkMode ? '#FFFFFF' : '#1D1D1F'
            }}>
              📝 최근 일기
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.recentDiaries.map((diary) => {
                const config = emotionConfig[diary.emotion]
                
                return (
                  <div
                    key={diary.id}
                    style={{
                      padding: '12px 16px',
                      background: isDarkMode ? 'rgba(58, 58, 60, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                      borderRadius: '12px',
                      border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = isDarkMode 
                        ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                        : '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '18px' }}>{config.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: isDarkMode ? '#FFFFFF' : '#333',
                          marginBottom: '2px'
                        }}>
                          {diary.title}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: isDarkMode ? '#8E8E93' : '#666'
                        }}>
                          {diary.author} • {formatDate(diary.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* 실시간 활동 */}
        <div style={{
          background: isDarkMode 
            ? 'rgba(44, 44, 46, 0.9)' 
            : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: isDarkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
        }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: isDarkMode ? '#FFFFFF' : '#1D1D1F'
          }}>
            ⚡ 실시간 활동
          </h3>
          
          <div style={{
            padding: '16px',
            background: isDarkMode ? 'rgba(58, 58, 60, 0.3)' : 'rgba(248, 250, 252, 0.8)',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <Eye style={{ 
              width: '48px', 
              height: '48px', 
              color: '#17A2B8',
              margin: '0 auto 12px'
            }} />
            <p style={{
              margin: 0,
              fontSize: '16px',
              color: isDarkMode ? '#CCCCCC' : '#666'
            }}>
              실시간 활동 모니터링이 곧 추가될 예정입니다
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard 