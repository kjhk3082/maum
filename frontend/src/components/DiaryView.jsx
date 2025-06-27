import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Edit3, Trash2, Calendar, Loader, Clock, Heart, Image as ImageIcon, X, ZoomIn } from 'lucide-react'
import { getDiaryByDate, deleteDiary } from '../firebase/diaryService'
import { useTheme } from '../App'

const emotions = {
  HAPPY: { emoji: '😊', label: '기쁨', color: '#FFD93D', bgColor: 'rgba(255, 217, 61, 0.15)' },
  SAD: { emoji: '😢', label: '슬픔', color: '#4FC3F7', bgColor: 'rgba(79, 195, 247, 0.15)' },
  ANGRY: { emoji: '😠', label: '화남', color: '#F44336', bgColor: 'rgba(244, 67, 54, 0.15)' },
  PEACEFUL: { emoji: '😌', label: '평온', color: '#4CAF50', bgColor: 'rgba(76, 175, 80, 0.15)' },
  ANXIOUS: { emoji: '😰', label: '불안', color: '#FF9800', bgColor: 'rgba(255, 152, 0, 0.15)' }
}

function DiaryView() {
  const { date } = useParams()
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const [entry, setEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(null)
  const [highlightedTexts, setHighlightedTexts] = useState([])

  useEffect(() => {
    const loadDiary = async () => {
      try {
        setLoading(true)
        
        // Firebase에서 일기 조회 시도
        const { success, diary } = await getDiaryByDate(date)
        if (success && diary) {
          console.log('📖 Firebase 일기 데이터:', diary)
          setEntry(diary)
          
          // 하이라이트된 텍스트 정보가 있으면 로드
          if (diary.highlightedTexts) {
            setHighlightedTexts(diary.highlightedTexts)
          }
        } else {
          // Firebase 실패 시 로컬스토리지에서 조회
          const localDiaries = JSON.parse(localStorage.getItem('diaryEntries') || '{}')
          const localDiary = localDiaries[date]
          
          if (localDiary) {
            console.log('📱 로컬 일기 데이터:', localDiary)
            setEntry({
              ...localDiary,
              id: date,
              date: date,
              createdAt: localDiary.createdAt || new Date().toISOString(),
              updatedAt: localDiary.updatedAt || localDiary.createdAt || new Date().toISOString()
            })
            
            if (localDiary.highlightedTexts) {
              setHighlightedTexts(localDiary.highlightedTexts)
            }
          } else {
            setEntry(null)
          }
        }
      } catch (error) {
        console.error('일기 로드 오류:', error)
        
        // 오류 시에도 로컬스토리지 시도
        const localDiaries = JSON.parse(localStorage.getItem('diaryEntries') || '{}')
        const localDiary = localDiaries[date]
        
        if (localDiary) {
          setEntry({
            ...localDiary,
            id: date,
            date: date,
            createdAt: localDiary.createdAt || new Date().toISOString(),
            updatedAt: localDiary.updatedAt || localDiary.createdAt || new Date().toISOString()
          })
          
          if (localDiary.highlightedTexts) {
            setHighlightedTexts(localDiary.highlightedTexts)
          }
        } else {
          setEntry(null)
        }
      } finally {
        setLoading(false)
      }
    }

    loadDiary()
  }, [date])

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleEdit = () => {
    navigate(`/write/${date}`)
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      
      // Firebase와 로컬스토리지 모두에서 삭제
      if (entry.id) {
        const { success } = await deleteDiary(entry.id)
        if (!success) {
          console.warn('Firebase 삭제 실패, 로컬 삭제만 진행')
        }
      }
      
      // 로컬스토리지에서도 삭제
      const localDiaries = JSON.parse(localStorage.getItem('diaryEntries') || '{}')
      delete localDiaries[date]
      localStorage.setItem('diaryEntries', JSON.stringify(localDiaries))
      
      setShowDeleteModal(false)
      alert('일기가 삭제되었습니다.')
      navigate('/')
      
    } catch (error) {
      console.error('삭제 오류:', error)
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  // 텍스트에서 하이라이트 적용
  const renderContentWithHighlights = (content) => {
    if (!highlightedTexts || highlightedTexts.length === 0) {
      return content
    }

    let processedContent = content
    const highlights = []

    // 하이라이트된 텍스트들을 마커로 감싸기
    highlightedTexts.forEach((highlight, index) => {
      const marker = `__HIGHLIGHT_${index}__`
      processedContent = processedContent.replace(
        new RegExp(highlight.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        marker
      )
      highlights.push({ marker, highlight, index })
    })

    // 마커를 실제 하이라이트 요소로 변환
    const parts = processedContent.split(/(__HIGHLIGHT_\d+__)/g)
    
    return parts.map((part, partIndex) => {
      const highlightMatch = highlights.find(h => h.marker === part)
      
      if (highlightMatch) {
        const { highlight, index } = highlightMatch
        return (
          <span
            key={partIndex}
            onClick={() => handleHighlightClick(highlight)}
            style={{
              backgroundColor: isDarkMode ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 215, 0, 0.5)',
              padding: '2px 4px',
              borderRadius: '4px',
              cursor: 'pointer',
              border: '1px solid rgba(255, 215, 0, 0.6)',
              transition: 'all 0.2s',
              position: 'relative'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255, 215, 0, 0.5)' : 'rgba(255, 215, 0, 0.7)'
              e.currentTarget.style.transform = 'scale(1.02)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 215, 0, 0.5)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
            title={`클릭하여 관련 이미지 ${highlight.images?.length || 0}개 보기`}
          >
            {highlight.text}
            {highlight.images && highlight.images.length > 0 && (
              <ImageIcon 
                size={12} 
                style={{ 
                  marginLeft: '4px', 
                  color: '#FF8C00',
                  display: 'inline-block'
                }} 
              />
            )}
          </span>
        )
      }
      
      return part
    })
  }

  // 하이라이트 클릭 시 이미지 보기
  const handleHighlightClick = (highlight) => {
    if (highlight.images && highlight.images.length > 0) {
      setSelectedImageIndex(0) // 첫 번째 이미지부터 보기
      // 실제로는 해당 하이라이트의 이미지들만 보여줘야 함
      setSelectedImages(highlight.images)
    }
  }

  const [selectedImages, setSelectedImages] = useState([])

  // 이미지 클릭 핸들러
  const handleImageClick = (imageIndex) => {
    setSelectedImageIndex(imageIndex)
    setSelectedImages(entry.images || [])
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: isDarkMode 
          ? 'linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)' 
          : 'linear-gradient(135deg, #E3F2FD 0%, #F0F8FF 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
      }}>
        <div style={{
          background: isDarkMode 
            ? 'rgba(44, 44, 46, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: isDarkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(23, 162, 184, 0.2)',
            borderTop: '4px solid #17A2B8',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }}></div>
          <p style={{ color: isDarkMode ? '#8E8E93' : '#666', fontSize: '16px', margin: 0 }}>
            일기를 불러오는 중...
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  if (!entry) {
    return (
      <div style={{
        minHeight: '100vh',
        background: isDarkMode 
          ? 'linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)' 
          : 'linear-gradient(135deg, #E3F2FD 0%, #F0F8FF 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
      }}>
        <div style={{
          background: isDarkMode 
            ? 'rgba(44, 44, 46, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '400px',
          boxShadow: isDarkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
        }}>
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>📝</div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: isDarkMode ? '#FFFFFF' : '#333', 
            marginBottom: '12px',
            margin: 0
          }}>
            일기를 찾을 수 없습니다
          </h2>
          <p style={{ 
            color: isDarkMode ? '#8E8E93' : '#666', 
            fontSize: '16px', 
            marginBottom: '24px',
            margin: '12px 0 24px 0',
            lineHeight: '1.5'
          }}>
            선택한 날짜에 작성된 일기가 없습니다.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'linear-gradient(135deg, #17A2B8 0%, #138496 100%)',
              color: 'white',
              fontWeight: '600',
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(23, 162, 184, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(23, 162, 184, 0.4)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(23, 162, 184, 0.3)'
            }}
          >
            캘린더로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  const emotionData = emotions[entry.emotion] || { emoji: '😊', label: '기쁨', color: '#FFD93D', bgColor: 'rgba(255, 217, 61, 0.15)' }

  return (
    <div style={{
      minHeight: '100vh',
      background: isDarkMode 
        ? 'linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)' 
        : 'linear-gradient(135deg, #E3F2FD 0%, #F0F8FF 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
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
              fontSize: '20px',
              fontWeight: 'bold',
              color: isDarkMode ? '#FFFFFF' : '#333'
            }}>
              {entry.title}
            </h1>
            <p style={{ margin: '4px 0 0 0', color: isDarkMode ? '#8E8E93' : '#666', fontSize: '14px' }}>
              {formatDate(date)}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleEdit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#17A2B8',
                background: 'rgba(23, 162, 184, 0.1)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '8px 12px',
                borderRadius: '10px',
                transition: 'all 0.2s',
                fontWeight: '500'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(23, 162, 184, 0.2)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(23, 162, 184, 0.1)'
              }}
            >
              <Edit3 style={{ width: '16px', height: '16px' }} />
              <span>수정</span>
            </button>
            
            <button
              onClick={() => setShowDeleteModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#F44336',
                background: 'rgba(244, 67, 54, 0.1)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '8px 12px',
                borderRadius: '10px',
                transition: 'all 0.2s',
                fontWeight: '500'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(244, 67, 54, 0.2)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(244, 67, 54, 0.1)'
              }}
            >
              <Trash2 style={{ width: '16px', height: '16px' }} />
              <span>삭제</span>
            </button>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          background: isDarkMode 
            ? 'rgba(44, 44, 46, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: isDarkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
        }}>
          {/* 감정 섹션 */}
          <div style={{
            background: emotionData.bgColor,
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
            border: `1px solid ${emotionData.color}30`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: `${emotionData.color}20`,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                border: `2px solid ${emotionData.color}40`
              }}>
                {emotionData.emoji}
              </div>
              <div>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '18px', 
                  fontWeight: '700',
                  color: isDarkMode ? '#FFFFFF' : '#333',
                  marginBottom: '4px'
                }}>
                  오늘의 감정
                </h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: '16px',
                  color: emotionData.color,
                  fontWeight: '600'
                }}>
                  {emotionData.label}
                </p>
              </div>
            </div>
          </div>

          {/* 일기 내용 */}
          <div style={{
            background: isDarkMode ? 'rgba(58, 58, 60, 0.3)' : 'rgba(248, 250, 252, 0.5)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'}`
          }}>
            <div style={{
              fontSize: '16px',
              lineHeight: '1.7',
              color: isDarkMode ? '#FFFFFF' : '#333',
              whiteSpace: 'pre-wrap',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
            }}>
              {renderContentWithHighlights(entry.content)}
            </div>
          </div>

          {/* 첨부 이미지 섹션 */}
          {entry.images && entry.images.length > 0 && (
            <div style={{
              background: isDarkMode ? 'rgba(58, 58, 60, 0.3)' : 'rgba(248, 250, 252, 0.5)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #17A2B8 0%, #138496 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ImageIcon size={20} color="white" />
                </div>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '18px', 
                  fontWeight: '700',
                  color: isDarkMode ? '#FFFFFF' : '#333'
                }}>
                  첨부 이미지 ({entry.images.length}개)
                </h3>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '12px'
              }}>
                {entry.images.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => handleImageClick(index)}
                    style={{
                      position: 'relative',
                      paddingBottom: '100%', // 1:1 비율 유지
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                      transition: 'all 0.3s',
                      boxShadow: isDarkMode 
                        ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                        : '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)'
                      e.currentTarget.style.boxShadow = isDarkMode 
                        ? '0 8px 24px rgba(0, 0, 0, 0.4)' 
                        : '0 8px 24px rgba(0, 0, 0, 0.15)'
                      e.currentTarget.style.borderColor = '#17A2B8'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.boxShadow = isDarkMode 
                        ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                        : '0 4px 12px rgba(0, 0, 0, 0.1)'
                      e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <img
                      src={image.url}
                      alt={`첨부 이미지 ${index + 1}`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling.style.display = 'flex'
                      }}
                    />
                    {/* 이미지 로드 실패 시 표시 */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: isDarkMode ? 'rgba(58, 58, 60, 0.8)' : 'rgba(248, 250, 252, 0.8)',
                      display: 'none',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      color: isDarkMode ? '#8E8E93' : '#666'
                    }}>
                      <ImageIcon size={24} />
                      <span style={{ fontSize: '12px', marginTop: '4px' }}>이미지 로드 실패</span>
                    </div>
                    {/* 확대 아이콘 */}
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(0, 0, 0, 0.6)',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.8
                    }}>
                      <ZoomIn size={14} color="white" />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 하이라이트된 텍스트와 연결된 이미지가 있는 경우 안내 */}
              {highlightedTexts && highlightedTexts.some(h => h.images && h.images.length > 0) && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  background: isDarkMode ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 215, 0, 0.15)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  fontSize: '14px',
                  color: isDarkMode ? '#CCCCCC' : '#666'
                }}>
                  💡 <strong>팁:</strong> 일기 내용에서 <span style={{backgroundColor: 'rgba(255, 215, 0, 0.3)', padding: '2px 4px', borderRadius: '4px'}}>하이라이트된 텍스트</span>를 클릭하면 관련 이미지만 볼 수 있어요!
                </div>
              )}
            </div>
          )}

          {/* 메타 정보 */}
          <div style={{
            borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            paddingTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '14px',
            color: isDarkMode ? '#8E8E93' : '#666'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock style={{ width: '16px', height: '16px' }} />
              <span>작성일: {formatDate(entry.createdAt)} {formatTime(entry.createdAt)}</span>
            </div>
            {entry.updatedAt !== entry.createdAt && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Edit3 style={{ width: '16px', height: '16px' }} />
                <span>최종 수정: {formatDate(entry.updatedAt)} {formatTime(entry.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: isDarkMode 
              ? 'rgba(44, 44, 46, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: isDarkMode 
              ? '0 20px 60px rgba(0, 0, 0, 0.5)' 
              : '0 20px 60px rgba(0, 0, 0, 0.2)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              marginBottom: '16px',
              color: isDarkMode ? '#FFFFFF' : '#333',
              margin: '0 0 16px 0'
            }}>
              일기 삭제
            </h3>
            <p style={{ 
              color: isDarkMode ? '#CCCCCC' : '#666',
              marginBottom: '24px',
              lineHeight: '1.6',
              margin: '0 0 24px 0'
            }}>
              정말로 이 일기를 삭제하시겠습니까?<br />
              삭제된 일기는 복구할 수 없습니다.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                style={{
                  padding: '10px 20px',
                  backgroundColor: isDarkMode 
                    ? 'rgba(58, 58, 60, 0.8)' 
                    : 'rgba(248, 249, 250, 0.8)',
                  color: isDarkMode ? '#FFFFFF' : '#666',
                  border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  borderRadius: '10px',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  opacity: isDeleting ? 0.5 : 1
                }}
                onMouseOver={(e) => {
                  if (!isDeleting) {
                    e.currentTarget.style.backgroundColor = isDarkMode 
                      ? 'rgba(72, 72, 74, 0.8)' 
                      : 'rgba(233, 236, 239, 0.8)'
                  }
                }}
                onMouseOut={(e) => {
                  if (!isDeleting) {
                    e.currentTarget.style.backgroundColor = isDarkMode 
                      ? 'rgba(58, 58, 60, 0.8)' 
                      : 'rgba(248, 249, 250, 0.8)'
                  }
                }}
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  opacity: isDeleting ? 0.7 : 1,
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
                }}
                onMouseOver={(e) => {
                  if (!isDeleting) {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(244, 67, 54, 0.4)'
                  }
                }}
                onMouseOut={(e) => {
                  if (!isDeleting) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(244, 67, 54, 0.3)'
                  }
                }}
              >
                {isDeleting && (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                )}
                <span>삭제</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 이미지 풀스크린 모달 */}
      {selectedImageIndex !== null && selectedImages && selectedImages.length > 0 && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          backdropFilter: 'blur(10px)'
        }}>
          {/* 닫기 버튼 */}
          <button
            onClick={() => setSelectedImageIndex(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              fontSize: '24px',
              transition: 'all 0.2s',
              zIndex: 101
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
              e.currentTarget.style.transform = 'scale(1.1)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <X size={24} />
          </button>

          {/* 이미지 내비게이션 (이전) */}
          {selectedImages.length > 1 && selectedImageIndex > 0 && (
            <button
              onClick={() => setSelectedImageIndex(selectedImageIndex - 1)}
              style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                fontSize: '24px',
                transition: 'all 0.2s',
                zIndex: 101
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
              }}
            >
              ‹
            </button>
          )}

          {/* 이미지 내비게이션 (다음) */}
          {selectedImages.length > 1 && selectedImageIndex < selectedImages.length - 1 && (
            <button
              onClick={() => setSelectedImageIndex(selectedImageIndex + 1)}
              style={{
                position: 'absolute',
                right: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                fontSize: '24px',
                transition: 'all 0.2s',
                zIndex: 101
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
              }}
            >
              ›
            </button>
          )}

          {/* 현재 이미지 */}
          <div style={{
            maxWidth: '90%',
            maxHeight: '90%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img
              src={selectedImages[selectedImageIndex]?.url}
              alt={`이미지 ${selectedImageIndex + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
              }}
            />
          </div>

          {/* 이미지 카운터 */}
          {selectedImages.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0, 0, 0, 0.6)',
              padding: '8px 16px',
              borderRadius: '20px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {selectedImageIndex + 1} / {selectedImages.length}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DiaryView
