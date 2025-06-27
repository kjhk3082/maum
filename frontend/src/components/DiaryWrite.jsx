import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ArrowLeft, Sparkles, Image, Loader, Calendar as CalendarIcon, Upload, X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useTheme } from '../App'
import { openaiService } from '../services/openaiService'
import { imageService } from '../services/imageService'
import { notificationService } from '../services/notificationService'
import { createDiary, getDiaryByDate, updateDiary } from '../firebase/diaryService'
import { uploadCompressedImage, deleteImage } from '../firebase/storageService'
// import { diaryAPI } from '../services/api' // 백엔드 연결 시 주석 해제

const emotions = [
  { emoji: '😊', label: '기쁨', value: 'HAPPY' },
  { emoji: '😢', label: '슬픔', value: 'SAD' },
  { emoji: '😠', label: '화남', value: 'ANGRY' },
  { emoji: '😌', label: '평온', value: 'PEACEFUL' },
  { emoji: '😰', label: '불안', value: 'ANXIOUS' }
]

// 더미 데이터 생성 함수 제거 (실제 사용자 데이터만 사용)

// 색상 변환 유틸리티 함수
const hexToRgb = (hex) => {
  // hex 색상을 rgba로 변환하는 함수 (현재 사용하지 않음)
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
};

// 헬퍼 함수들은 컨포넌트 내부로 이동

const DiaryWrite = ({ user }) => {
  const { date } = useParams()
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  
  // 상태 관리
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [emotion, setEmotion] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [uploadedImages, setUploadedImages] = useState([])
  const [imageUploading, setImageUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')
  const [existingDiaryId, setExistingDiaryId] = useState(null)
  
  // 텍스트 하이라이트 + 이미지 연결 기능 상태
  const [highlightedTexts, setHighlightedTexts] = useState([]) // 하이라이트된 텍스트들
  const [selectedTextInfo, setSelectedTextInfo] = useState(null) // 현재 선택된 텍스트 정보
  const [showHighlightModal, setShowHighlightModal] = useState(false) // 하이라이트 모달
  
  // 화면 내 알림 시스템 상태
  const [notification, setNotification] = useState({
    show: false,
    type: 'info', // 'success', 'error', 'info', 'warning'
    title: '',
    message: '',
    details: ''
  })
  
  // 일기 작성 가능 시간은 useEffect에서 후에 체크
  const [isTimeToWrite, setIsTimeToWrite] = useState(true) // 데모 모드로 항상 true

  // 화면 내 알림 표시 함수
  const showNotification = (type, title, message = '', details = '', duration = 5000) => {
    setNotification({
      show: true,
      type,
      title,
      message,
      details
    })
    
    // 자동으로 알림 숨기기
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }))
    }, duration)
  }

  // 연속 작성일 계산 함수 (간단한 로컬 계산)
  const calculateStreakDays = () => {
    // 실제로는 Firebase에서 getStreakDays를 호출해야 하지만
    // 여기서는 간단한 로컬 계산으로 대체
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    // 오늘과 어제 일기가 있으면 최소 2일 연속
    return 2 // 임시 값
  }

  // 더미 데이터 초기화 제거 (실제 사용자 데이터만 사용)

  // Firebase에서 기존 일기 데이터 로드
  useEffect(() => {
    const loadExistingDiary = async () => {
      if (!user || !date) return

      setIsLoading(true)
      try {
        const { success, diary } = await getDiaryByDate(date)
        
        if (success && diary) {
          // 기존 일기가 있는 경우
          setTitle(diary.title || '')
          setContent(diary.content || '')
          setEmotion(diary.emotion || 'HAPPY')
          setUploadedImages(diary.images || [])
          setHighlightedTexts(diary.highlightedTexts || []) // 하이라이트 정보 로드
          setIsEditing(true)
          setExistingDiaryId(diary.id)
        }
      } catch (error) {
        console.error('기존 일기 로드 오류:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadExistingDiary()
  }, [user, date])

  // 텍스트 선택 감지
  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection)
    return () => document.removeEventListener('mouseup', handleTextSelection)
  }, [])

  // 시간 제한 확인 함수는 useEffect에서 직접 구현하여 사용

  useEffect(() => {
    // 백엔드 연결 시 사용할 시간 체크 API (현재 주석 처리)
    /*
    const checkWritableTime = async () => {
      try {
        const isWritable = await diaryAPI.checkWritableTime(date)
        if (!isWritable && !isEditing) {
          showNotification('warning', '시간 제한', '일기 작성이 허용되지 않은 시간입니다.')
          navigate('/')
        }
      } catch (error) {
        console.error('시간 체크 오류:', error)
        showNotification('error', '서버 오류', '서버 연결에 문제가 있습니다.')
        navigate('/')
      }
    }
    checkWritableTime()
    */
    
    // 데모모드에서는 시간 제한 없이 항상 작성 가능
    setIsTimeToWrite(true)
    
    // 미래 날짜만 방지
    const today = new Date()
    const diaryDate = new Date(date)
    
    if (diaryDate > today && !isEditing) {
      showNotification('warning', '날짜 오류', '미래 날짜의 일기는 작성할 수 없습니다.')
      setTimeout(() => navigate('/'), 2000)
    }
  }, [date, isEditing, navigate])

  // 텍스트 선택 감지 함수 (개선된 버전)
  const handleTextSelection = () => {
    const selection = window.getSelection()
    const selectedText = selection.toString().trim()
    
    if (selectedText && selectedText.length > 0) {
      console.log('📝 텍스트 선택됨:', selectedText)
      
      // 선택된 텍스트의 위치 정보 저장
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      
      setSelectedTextInfo({
        text: selectedText,
        startOffset: range.startOffset,
        endOffset: range.endOffset,
        position: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        }
      })
      
      setSelectedText(selectedText)
    } else {
      setSelectedTextInfo(null)
      setSelectedText('')
    }
  }

  // 하이라이트에 이미지 추가
  const addImageToHighlight = (images) => {
    if (!selectedTextInfo || !images || images.length === 0) return

    const newHighlight = {
      id: Date.now(),
      text: selectedTextInfo.text,
      images: images,
      createdAt: new Date().toISOString()
    }

    // 기존 하이라이트 중 같은 텍스트가 있는지 확인
    const existingIndex = highlightedTexts.findIndex(h => h.text === selectedTextInfo.text)
    
    if (existingIndex >= 0) {
      // 기존 하이라이트에 이미지 추가
      const updatedHighlights = [...highlightedTexts]
      updatedHighlights[existingIndex] = {
        ...updatedHighlights[existingIndex],
        images: [...(updatedHighlights[existingIndex].images || []), ...images],
        updatedAt: new Date().toISOString()
      }
      setHighlightedTexts(updatedHighlights)
    } else {
      // 새 하이라이트 추가
      setHighlightedTexts(prev => [...prev, newHighlight])
    }

    // 선택 상태 초기화
    setSelectedTextInfo(null)
    setSelectedText('')
    setShowHighlightModal(false)
    
    // 텍스트 선택 해제
    window.getSelection().removeAllRanges()

    showNotification('success', '하이라이트 생성 완료!', 
      `"${selectedTextInfo.text}"에 이미지 ${images.length}개가 연결되었습니다.`,
      '일기 내용에서 해당 텍스트가 하이라이트로 표시됩니다.')
  }

  // 하이라이트 모달 열기
  const handleOpenHighlightModal = () => {
    if (!selectedTextInfo) {
      showNotification('info', '텍스트 선택 필요', 
        '먼저 이미지를 연결할 텍스트를 드래그해서 선택해주세요.')
      return
    }
    setShowHighlightModal(true)
  }

  // 하이라이트에 연결할 이미지 업로드
  const handleHighlightImageUpload = async (files) => {
    if (!files || files.length === 0) return

    setImageUploading(true)
    const newImages = []

    try {
      for (const file of Array.from(files)) {
        const { success, data, error } = await uploadCompressedImage(file, 'diary-images', 1200, 0.8)
        
        if (success) {
          newImages.push({
            id: data.filename,
            url: data.url,
            filename: data.filename,
            path: data.path,
            size: data.size,
            uploadedAt: new Date().toISOString()
          })
        } else {
          console.error('이미지 업로드 실패:', error)
          showNotification('error', '이미지 업로드 실패', error)
        }
      }
      
      if (newImages.length > 0) {
        addImageToHighlight(newImages)
      }
      
    } catch (error) {
      console.error('이미지 업로드 오류:', error)
      showNotification('error', '이미지 업로드 오류', '이미지 업로드 중 오류가 발생했습니다.')
    } finally {
      setImageUploading(false)
    }
  }

  // 텍스트에서 하이라이트 적용하여 렌더링
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
            style={{
              backgroundColor: isDarkMode ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 215, 0, 0.5)',
              padding: '2px 4px',
              borderRadius: '4px',
              border: '1px solid rgba(255, 215, 0, 0.6)',
              position: 'relative',
              cursor: 'help'
            }}
            title={`이미지 ${highlight.images?.length || 0}개 연결됨`}
          >
            {highlight.text}
            {highlight.images && highlight.images.length > 0 && (
              <span style={{ 
                marginLeft: '4px', 
                fontSize: '12px',
                color: '#FF8C00'
              }}>
                📷{highlight.images.length}
              </span>
            )}
          </span>
        )
      }
      
      return part
    })
  }

  // AI 텍스트 확장 기능 (개선된 버전)
  const handleAIHelp = async () => {
    console.log('🤖 AI 도움받기 시작...')
    console.log('선택된 텍스트:', selectedText)
    console.log('제목:', title)
    console.log('내용:', content)
    console.log('감정:', emotion)
    
    setLoading(true)
    
    try {
      let textToExpand = ''
      
      // 1. 선택된 텍스트가 있으면 우선 사용
      if (selectedText && selectedText.trim() !== '') {
        textToExpand = selectedText.trim()
        console.log('✅ 선택된 텍스트 사용:', textToExpand)
      }
      // 2. 선택된 텍스트가 없으면 제목이나 내용에서 키워드 추출
      else if (title.trim() !== '' || content.trim() !== '') {
        // 제목에서 키워드 추출 시도
        if (title.trim() !== '') {
          textToExpand = title.trim()
          console.log('✅ 제목 사용:', textToExpand)
        }
        // 내용의 마지막 문장이나 키워드 추출
        else {
          const sentences = content.trim().split(/[.!?。！？]/).filter(s => s.trim())
          if (sentences.length > 0) {
            textToExpand = sentences[sentences.length - 1].trim()
            console.log('✅ 마지막 문장 사용:', textToExpand)
          } else {
            textToExpand = content.trim().slice(0, 50) // 처음 50자
            console.log('✅ 내용 일부 사용:', textToExpand)
          }
        }
      }
      // 3. 아무것도 없으면 감정을 기반으로 생성
      else {
        textToExpand = emotion ? `${emotion}_기반_일기` : '오늘_하루'
        console.log('✅ 감정 기반 키워드 생성:', textToExpand)
      }
      
      if (!textToExpand) {
        showNotification('info', 'AI 문장 만들기', 
          '텍스트를 선택하거나 제목/내용을 입력한 후 사용해주세요.', 
          '예: "신라면, 18시, 맛있음"을 드래그하면 자동으로 문장을 만들어줍니다.')
        setLoading(false)
        return
      }
      
      // 선택된 텍스트를 자연스러운 일기 문장으로 확장하는 요청
      const expandContext = {
        selectedText: textToExpand,
        emotion: emotion || 'PEACEFUL',
        title: title,
        content: content,
        expandMode: true
      }
      
      console.log('🚀 OpenAI 서비스 호출...', expandContext)
      const result = await openaiService.expandTextToDiary(expandContext)
      console.log('📨 OpenAI 응답:', result)
      
      if (result.success) {
        const expandedText = result.expandedText
        
        // 확장된 텍스트 적용
        if (selectedText && selectedText.trim() !== '') {
          // 선택된 텍스트를 확장된 텍스트로 교체
          const newContent = content.replace(selectedText, expandedText)
          setContent(newContent)
          console.log('✅ 선택된 텍스트 교체 완료')
        } else {
          // 내용 끝에 확장된 텍스트 추가
          const separator = content.trim() ? '\n\n' : ''
          setContent(prev => prev + separator + expandedText)
          console.log('✅ 내용 끝에 추가 완료')
        }
        
        // 선택 상태 초기화
        setSelectedText('')
        
        // 성공 메시지
        showNotification('success', '✨ AI 문장 생성 완료!', 
          `"${textToExpand}" → "${expandedText}"`,
          result.isDemo ? 'AI API 연동 준비 중이에요. 현재는 데모 모드로 동작합니다.' : 'GPT-4o로 생성되었습니다.')
        
      } else {
        console.error('❌ AI 텍스트 확장 실패')
        showNotification('error', 'AI 오류', 
          'AI 텍스트 확장에 실패했습니다.', 
          '잠시 후 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('❌ AI 텍스트 확장 오류:', error)
      showNotification('error', 'AI 서비스 오류', 
        'AI 서비스에 일시적인 문제가 발생했습니다.',
        '네트워크 연결을 확인하고 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  // 이미지 첨부 모달 열기
  const handleImageAttach = () => {
    setImageModalOpen(true)
  }

  // Firebase Storage에 이미지 업로드
  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return

    setImageUploading(true)
    const newUploadedImages = [...uploadedImages]

    try {
      for (const file of Array.from(files)) {
        const { success, data, error } = await uploadCompressedImage(file, 'diary-images', 1200, 0.8)
        
        if (success) {
          newUploadedImages.push({
            id: data.filename,
            url: data.url,
            filename: data.filename,
            path: data.path,
            size: data.size,
            uploadedAt: new Date().toISOString()
          })
        } else {
          console.error('이미지 업로드 실패:', error)
          showNotification('error', '이미지 업로드 실패', error)
        }
      }
      
      setUploadedImages(newUploadedImages)
      
    } catch (error) {
      console.error('이미지 업로드 오류:', error)
      showNotification('error', '이미지 업로드 오류', '이미지 업로드 중 오류가 발생했습니다.')
    } finally {
      setImageUploading(false)
    }
  }

  // Firebase Storage에서 이미지 삭제
  const handleRemoveImage = async (imageIndex) => {
    const imageToRemove = uploadedImages[imageIndex]
    
    try {
      if (imageToRemove && imageToRemove.path) {
        const { success } = await deleteImage(imageToRemove.path)
        
        if (success) {
          const newUploadedImages = uploadedImages.filter((_, index) => index !== imageIndex)
          setUploadedImages(newUploadedImages)
        } else {
          console.error('이미지 삭제 실패')
          showNotification('error', '이미지 삭제 실패', '이미지 삭제에 실패했습니다.')
        }
      }
    } catch (error) {
      console.error('이미지 삭제 오류:', error)
      showNotification('error', '이미지 삭제 오류', '이미지 삭제 중 오류가 발생했습니다.')
    }
  }

  // 드래그 앤 드롭 처리
  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    handleImageUpload(files)
  }

  // Firebase에 일기 저장 (하이라이트 정보 포함)
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      showNotification('warning', '입력 확인', '제목과 내용을 모두 작성해주세요.')
      return
    }

    setIsSaving(true)
    setSaveStatus('저장 중...')
    
    try {
      const diaryData = {
        date,
        title: title.trim(),
        content: content.trim(),
        emotion,
        images: uploadedImages,
        highlightedTexts: highlightedTexts // 하이라이트 정보 추가
      }

      console.log('💾 일기 저장 데이터:', diaryData)

      if (isEditing && existingDiaryId) {
        // 기존 일기 업데이트
        const { success } = await updateDiary(existingDiaryId, diaryData)
        
        if (success) {
          setSaveStatus('일기가 성공적으로 수정되었습니다!')
          showNotification('success', '수정 완료', '일기가 성공적으로 수정되었습니다!')
          
          // 알림 표시
          notificationService.showNotification('일기 수정 완료', {
            body: `${new Date(date).toLocaleDateString()} 일기가 수정되었습니다.`,
            icon: '/favicon.ico'
          })
        } else {
          throw new Error('일기 수정에 실패했습니다')
        }
      } else {
        // 새 일기 생성
        const { success, id } = await createDiary(diaryData)
        
        if (success) {
          setSaveStatus('일기가 성공적으로 저장되었습니다!')
          setExistingDiaryId(id)
          setIsEditing(true)
          
          // 연속 작성일 확인 및 축하 알림
          const streakDays = calculateStreakDays()
          if (streakDays > 1) {
            notificationService.showStreakCelebration(streakDays)
          }
          
          showNotification('success', '저장 완료', '일기가 성공적으로 저장되었습니다!', 
            '잠시 후 캘린더로 이동합니다.')
          
          // 일기 저장 알림
          notificationService.showNotification('일기 저장 완료', {
            body: `${new Date(date).toLocaleDateString()} 일기가 저장되었습니다.`,
            icon: '/favicon.ico'
          })
        } else {
          throw new Error('일기 저장에 실패했습니다')
        }
      }
      
      // 2초 후 캘린더로 이동
      setTimeout(() => {
        navigate('/')
      }, 2000)
      
    } catch (error) {
      console.error('일기 저장 오류:', error)
      setSaveStatus('저장 중 오류가 발생했습니다. 다시 시도해주세요.')
      showNotification('error', '저장 실패', '저장 중 오류가 발생했습니다.', '다시 시도해주세요.')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveStatus(''), 3000)
    }
  }

  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekDays = ['일', '월', '화', '수', '목', '금', '토']
    const weekDay = weekDays[date.getDay()]
    
    return `${year}년 ${month}월 ${day}일 (${weekDay})`
  }

  const formatDate = (date) => {
    return date.toISOString().split('T')[0]
  }

  return (
    <div className="min-h-screen" style={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)'
          : 'linear-gradient(135deg, #E3F2FD 0%, #F0F8FF 100%)',
        overflowX: 'hidden',
        position: 'relative',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        color: isDarkMode ? '#FFFFFF' : '#1D1D1F',
        transition: 'all 0.3s ease'
      }}>
      {/* 장식용 배경 요소 */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '300px',
        height: '300px',
        background: isDarkMode 
          ? 'linear-gradient(45deg, rgba(23, 162, 184, 0.2), rgba(19, 132, 150, 0.1))'
          : 'linear-gradient(45deg, rgba(23, 162, 184, 0.3), rgba(19, 132, 150, 0.2))',
        borderRadius: '50%',
        filter: 'blur(80px)',
        zIndex: 0
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '5%',
        width: '250px',
        height: '250px',
        background: isDarkMode
          ? 'linear-gradient(45deg, rgba(255, 149, 0, 0.1), rgba(255, 193, 7, 0.1))'
          : 'linear-gradient(45deg, rgba(255, 149, 0, 0.2), rgba(255, 193, 7, 0.2))',
        borderRadius: '50%',
        filter: 'blur(60px)',
        zIndex: 0
      }}></div>
      {/* 헤더 */}
      <div style={{
        background: isDarkMode 
          ? 'rgba(28, 28, 30, 0.85)' 
          : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        boxShadow: isDarkMode 
          ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
          : '0 4px 20px rgba(0, 0, 0, 0.08)',
        borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.6)'}`,
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center', 
            justifyContent: 'space-between',
            height: '80px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '16px',
                  background: isDarkMode 
                    ? 'rgba(58, 58, 60, 0.7)' 
                    : 'rgba(255, 255, 255, 0.7)',
                  border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)'}`,
                  boxShadow: isDarkMode 
                    ? '0 4px 12px rgba(0, 0, 0, 0.2)' 
                    : '0 4px 12px rgba(0, 0, 0, 0.06)',
                  color: isDarkMode ? '#FFFFFF' : '#454545',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = isDarkMode 
                    ? '0 6px 16px rgba(0, 0, 0, 0.3)' 
                    : '0 6px 16px rgba(0, 0, 0, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isDarkMode 
                    ? '0 4px 12px rgba(0, 0, 0, 0.2)' 
                    : '0 4px 12px rgba(0, 0, 0, 0.06)';
                }}
              >
                <ArrowLeft style={{ width: '20px', height: '20px' }} />
              </button>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #17A2B8 0%, #138496 100%)',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(23, 162, 184, 0.3)',
                transform: 'rotate(3deg)',
                margin: '0 5px'
              }}>
                <CalendarIcon style={{ width: '26px', height: '26px', color: 'white' }} />
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '28px', 
                  fontWeight: '700', 
                  margin: 0,
                  color: isDarkMode ? '#FFFFFF' : '#17A2B8'
                }}>
                  마음일기 작성
                </h1>
                <p style={{ 
                  fontSize: '15px', 
                  color: isDarkMode ? '#8E8E93' : '#666',
                  margin: '4px 0 0 0'
                }}>{formatDisplayDate(date)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '30px auto 0',
        padding: '0 24px',
        position: 'relative',
        zIndex: 5
      }}>
        <div style={{ 
          background: isDarkMode 
            ? 'rgba(44, 44, 46, 0.85)' 
            : 'rgba(255, 255, 255, 0.85)', 
          backdropFilter: 'blur(15px)',
          borderRadius: '24px',
          boxShadow: isDarkMode 
            ? '0 10px 40px rgba(0, 0, 0, 0.3)' 
            : '0 10px 40px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)'}`,
          overflow: 'hidden'
        }}>
          <div style={{ padding: '32px' }}>
            {/* 제목 입력 */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '18px', 
                fontWeight: '600', 
                color: isDarkMode ? '#FFFFFF' : '#333',
                marginBottom: '12px'
              }}>
                📝 제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="오늘의 일기 제목을 입력해주세요"
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  fontSize: '17px',
                  border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(233, 236, 239, 0.8)'}`,
                  borderRadius: '16px',
                  background: isDarkMode ? 'rgba(58, 58, 60, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: isDarkMode ? '0 4px 16px rgba(0, 0, 0, 0.2)' : '0 4px 16px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.3s',
                  outline: 'none',
                  color: isDarkMode ? '#FFFFFF' : '#333'
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow = '0 0 0 4px rgba(23, 162, 184, 0.2)';
                  e.target.style.borderColor = '#17A2B8';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = isDarkMode ? '0 4px 16px rgba(0, 0, 0, 0.2)' : '0 4px 16px rgba(0, 0, 0, 0.04)';
                  e.target.style.borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(233, 236, 239, 0.8)';
                }}
                maxLength={100}
              />
            </div>

            {/* 감정 선택 */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '18px', 
                fontWeight: '600', 
                color: isDarkMode ? '#FFFFFF' : '#333',
                marginBottom: '14px'
              }}>
                😊 오늘의 감정
              </label>
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '16px'
              }}>
                {emotions.map((emo) => {
                  const isSelected = emotion === emo.value;
                  const emotionColors = {
                    'HAPPY': { gradientFrom: '#ffd93d', gradientTo: '#ffb700', textColor: '#F9A825' },
                    'SAD': { gradientFrom: '#4fc3f7', gradientTo: '#2196f3', textColor: '#0288D1' },
                    'ANGRY': { gradientFrom: '#ff5252', gradientTo: '#f44336', textColor: '#D32F2F' },
                    'PEACEFUL': { gradientFrom: '#66bb6a', gradientTo: '#43a047', textColor: '#388E3C' },
                    'ANXIOUS': { gradientFrom: '#ffa726', gradientTo: '#ff9800', textColor: '#F57C00' }
                  }
                  const colorConfig = emotionColors[emo.value] || { gradientFrom: '#9e9e9e', gradientTo: '#757575', textColor: '#616161' };
                  
                  return (
                    <button
                      key={emo.value}
                      onClick={() => setEmotion(emo.value)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '16px',
                        border: isSelected ? `2px solid ${colorConfig.gradientTo}` : `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(233, 236, 239, 0.8)'}`,
                        borderRadius: '18px',
                        background: isSelected 
                          ? `linear-gradient(135deg, ${colorConfig.gradientFrom}25, ${colorConfig.gradientTo}19)` 
                          : isDarkMode ? 'rgba(58, 58, 60, 0.65)' : 'rgba(255, 255, 255, 0.65)',
                        boxShadow: isSelected 
                          ? `0 8px 20px ${colorConfig.gradientTo}25` 
                          : '0 4px 12px rgba(0, 0, 0, 0.03)',
                        transition: 'all 0.3s',
                        cursor: 'pointer',
                        transform: isSelected ? 'translateY(-3px)' : 'translateY(0)'
                      }}
                      onMouseOver={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.08)';
                          e.currentTarget.style.borderColor = '#ddd';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.03)';
                          e.currentTarget.style.borderColor = 'rgba(233, 236, 239, 0.8)';
                        }
                      }}
                    >
                      <span style={{ fontSize: '42px', marginBottom: '8px' }}>{emo.emoji}</span>
                      <span style={{ 
                        fontSize: '15px', 
                        fontWeight: '600', 
                        color: isSelected ? colorConfig.textColor : (isDarkMode ? '#FFFFFF' : '#666'),
                      }}>
                        {emo.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 내용 입력 */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <label style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: isDarkMode ? '#FFFFFF' : '#333'
                }}>
                  💬 내용
                </label>
                <div style={{ fontSize: '14px', color: isDarkMode ? '#8E8E93' : '#667' }}>
                  {selectedText && `선택된 텍스트: "${selectedText}" (${selectedText.length} 글자)`}
                </div>
              </div>
              
              {/* 하이라이트 기능 안내 */}
              {selectedTextInfo && (
                <div style={{
                  background: isDarkMode ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 215, 0, 0.15)',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: isDarkMode ? '#FFD60A' : '#B8860B',
                      marginBottom: '4px'
                    }}>
                      ✨ 텍스트가 선택되었습니다!
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: isDarkMode ? '#CCCCCC' : '#666'
                    }}>
                      "{selectedTextInfo.text}"에 이미지를 연결하여 하이라이트를 만들 수 있어요.
                    </div>
                  </div>
                  <button
                    onClick={handleOpenHighlightModal}
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #FFD60A 0%, #FF9500 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    이미지 연결
                  </button>
                </div>
              )}
              
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onMouseUp={handleTextSelection}
                onKeyUp={handleTextSelection}
                placeholder="오늘 하루에 있었던 일들을 적어보세요. 특정 텍스트를 드래그한 후 '이미지 연결' 버튼을 누르면 해당 텍스트에 이미지를 연결할 수 있어요."
                style={{
                  width: '100%',
                  height: '280px',
                  padding: '16px 20px',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(233, 236, 239, 0.8)'}`,
                  borderRadius: '16px',
                  background: isDarkMode ? 'rgba(58, 58, 60, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: isDarkMode ? '0 4px 16px rgba(0, 0, 0, 0.2)' : '0 4px 16px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.3s',
                  resize: 'none',
                  outline: 'none',
                  color: isDarkMode ? '#FFFFFF' : '#333'
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow = '0 0 0 4px rgba(23, 162, 184, 0.2)';
                  e.target.style.borderColor = '#17A2B8';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = isDarkMode ? '0 4px 16px rgba(0, 0, 0, 0.2)' : '0 4px 16px rgba(0, 0, 0, 0.04)';
                  e.target.style.borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(233, 236, 239, 0.8)';
                }}
                maxLength={10000}
              ></textarea>
              
              {/* 내용 미리보기 (하이라이트 적용) */}
              {content && highlightedTexts.length > 0 && (
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  background: isDarkMode ? 'rgba(28, 28, 30, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                  borderRadius: '12px',
                  border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: isDarkMode ? '#FFFFFF' : '#333',
                    marginBottom: '12px'
                  }}>
                    📝 미리보기 (하이라이트 적용)
                  </div>
                  <div style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: isDarkMode ? '#CCCCCC' : '#666',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {renderContentWithHighlights(content)}
                  </div>
                </div>
              )}
            </div>

            {/* 하이라이트 관리 */}
            {highlightedTexts.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: isDarkMode ? '#FFFFFF' : '#333',
                  marginBottom: '12px'
                }}>
                  ✨ 하이라이트된 텍스트 ({highlightedTexts.length}개)
                </label>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '16px',
                  background: isDarkMode 
                    ? 'rgba(58, 58, 60, 0.7)' 
                    : 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '16px',
                  border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(233, 236, 239, 0.8)'}`
                }}>
                  {highlightedTexts.map((highlight, index) => (
                    <div 
                      key={highlight.id || index} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: isDarkMode ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 215, 0, 0.15)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 215, 0, 0.3)'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: isDarkMode ? '#FFD60A' : '#B8860B',
                          marginBottom: '4px'
                        }}>
                          "{highlight.text}"
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: isDarkMode ? '#CCCCCC' : '#666'
                        }}>
                          이미지 {highlight.images?.length || 0}개 연결됨
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {highlight.images && highlight.images.slice(0, 3).map((image, imgIndex) => (
                          <div
                            key={imgIndex}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              border: '1px solid rgba(255, 215, 0, 0.5)'
                            }}
                          >
                            <img
                              src={image.url}
                              alt={`연결된 이미지 ${imgIndex + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          </div>
                        ))}
                        {highlight.images && highlight.images.length > 3 && (
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            background: 'rgba(255, 215, 0, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: '600',
                            color: '#B8860B'
                          }}>
                            +{highlight.images.length - 3}
                          </div>
                        )}
                        <button
                          onClick={() => {
                            const newHighlights = highlightedTexts.filter((_, i) => i !== index)
                            setHighlightedTexts(newHighlights)
                          }}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'rgba(244, 67, 54, 0.2)',
                            color: '#F44336',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(244, 67, 54, 0.3)'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(244, 67, 54, 0.2)'
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 업로드된 이미지 표시 */}
            {uploadedImages.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: isDarkMode ? '#FFFFFF' : '#333',
                  marginBottom: '12px'
                }}>
                  🖼️ 첨부된 이미지 ({uploadedImages.length}개)
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '12px',
                  padding: '16px',
                  background: isDarkMode 
                    ? 'rgba(58, 58, 60, 0.7)' 
                    : 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '16px',
                  border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(233, 236, 239, 0.8)'}`
                }}>
                  {uploadedImages.map((image) => (
                    <div key={image.id} style={{
                      position: 'relative',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: isDarkMode ? '#2C2C2E' : 'white',
                      boxShadow: isDarkMode 
                        ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                        : '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}>
                      <img
                        src={image.url}
                        alt={image.filename}
                        style={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px'
                      }}>
                        <button
                          onClick={() => handleRemoveImage(uploadedImages.indexOf(image))}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'rgba(0, 0, 0, 0.7)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px'
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div style={{
                        padding: '8px',
                        fontSize: '12px',
                        color: isDarkMode ? '#8E8E93' : '#666',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                          {image.filename.length > 15 
                            ? image.filename.substring(0, 15) + '...' 
                            : image.filename}
                        </div>
                        <div style={{ fontSize: '11px' }}>
                          {imageService.formatFileSize(image.size)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI 도움 및 이미지 첨부 버튼 */}
            <div style={{ marginBottom: '32px', display: 'flex', gap: '16px' }}>
              <button
                onClick={handleAIHelp}
                disabled={loading}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '14px 24px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #17A2B8 0%, #138496 100%)',
                  color: 'white',
                  fontWeight: '600',
                  boxShadow: '0 8px 16px rgba(23, 162, 184, 0.25)',
                  border: 'none',
                  transition: 'all 0.3s',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 12px 20px rgba(23, 162, 184, 0.3)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(23, 162, 184, 0.25)';
                  }
                }}
              >
                {loading ? (
                  <>
                    <Loader style={{ width: '20px', height: '20px' }} />
                    <span>AI 생각 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles style={{ width: '20px', height: '20px' }} />
                    <span>AI 문장 만들기</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleImageAttach}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '14px 24px',
                  borderRadius: '16px',
                  background: isDarkMode 
                    ? 'rgba(58, 58, 60, 0.8)' 
                    : 'rgba(255, 255, 255, 0.8)',
                  color: isDarkMode ? '#FFFFFF' : '#333',
                  fontWeight: '600',
                  boxShadow: isDarkMode 
                    ? '0 8px 16px rgba(0, 0, 0, 0.2)' 
                    : '0 8px 16px rgba(0, 0, 0, 0.06)',
                  border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(233, 236, 239, 0.8)'}`,
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = isDarkMode 
                    ? '0 12px 20px rgba(0, 0, 0, 0.3)' 
                    : '0 12px 20px rgba(0, 0, 0, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isDarkMode 
                    ? '0 8px 16px rgba(0, 0, 0, 0.2)' 
                    : '0 8px 16px rgba(0, 0, 0, 0.06)';
                }}
              >
                <Image style={{ width: '20px', height: '20px' }} />
                <span>이미지 첨부</span>
              </button>
            </div>

            {/* 저장 버튼 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleSubmit}
                disabled={loading || !title || !content || !emotion}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px 32px',
                  borderRadius: '16px',
                  background: isTimeToWrite 
                    ? 'linear-gradient(135deg, #17A2B8 0%, #138496 100%)'
                    : '#9CA3AF',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '16px',
                  boxShadow: isTimeToWrite 
                    ? '0 10px 20px rgba(23, 162, 184, 0.25)'
                    : '0 10px 20px rgba(156, 163, 175, 0.25)',
                  border: 'none',
                  transition: 'all 0.3s',
                  cursor: (loading || !title || !content || !emotion) 
                    ? 'not-allowed' 
                    : 'pointer',
                  opacity: (loading || !title || !content || !emotion) ? 0.7 : 1
                }}
                onMouseOver={(e) => {
                  if (!(loading || !title || !content || !emotion) && isTimeToWrite) {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 14px 24px rgba(23, 162, 184, 0.3)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!(loading || !title || !content || !emotion) && isTimeToWrite) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(23, 162, 184, 0.25)';
                  }
                }}
              >
                <Save style={{ width: '20px', height: '20px' }} />
                <span>{isEditing ? '수정 완료' : '일기 저장하기'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 화면 내 알림 */}
      {notification.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1100,
          maxWidth: '400px',
          background: isDarkMode 
            ? 'rgba(28, 28, 30, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: isDarkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
            : '0 8px 32px rgba(0, 0, 0, 0.15)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          transform: notification.show ? 'translateX(0)' : 'translateX(100%)',
          opacity: notification.show ? 1 : 0,
          transition: 'all 0.3s ease-out'
        }}>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            {/* 아이콘 */}
            <div style={{
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: notification.type === 'success' ? '#34C759' :
                         notification.type === 'error' ? '#FF3B30' :
                         notification.type === 'warning' ? '#FF9500' : '#17A2B8',
              marginTop: '2px'
            }}>
              {notification.type === 'success' && <CheckCircle size={16} color="white" />}
              {notification.type === 'error' && <AlertCircle size={16} color="white" />}
              {notification.type === 'warning' && <AlertCircle size={16} color="white" />}
              {notification.type === 'info' && <Info size={16} color="white" />}
            </div>
            
            {/* 내용 */}
            <div style={{ flex: 1 }}>
              <h4 style={{
                margin: '0 0 4px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: isDarkMode ? '#FFFFFF' : '#1D1D1F'
              }}>
                {notification.title}
              </h4>
              
              {notification.message && (
                <p style={{
                  margin: '0 0 8px 0',
                  fontSize: '14px',
                  color: isDarkMode ? '#E5E5E7' : '#424245',
                  lineHeight: '1.4'
                }}>
                  {notification.message}
                </p>
              )}
              
              {notification.details && (
                <p style={{
                  margin: '0',
                  fontSize: '12px',
                  color: isDarkMode ? '#8E8E93' : '#6D6D70',
                  lineHeight: '1.3'
                }}>
                  {notification.details}
                </p>
              )}
            </div>
            
            {/* 닫기 버튼 */}
            <button
              onClick={() => setNotification(prev => ({ ...prev, show: false }))}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDarkMode ? '#8E8E93' : '#6D6D70',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 이미지 첨부 모달 */}
      {imageModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: isDarkMode 
              ? 'rgba(44, 44, 46, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: isDarkMode 
              ? '0 20px 40px rgba(0, 0, 0, 0.4)' 
              : '0 20px 40px rgba(0, 0, 0, 0.2)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '24px',
                fontWeight: '700',
                color: isDarkMode ? '#FFFFFF' : '#1D1D1F'
              }}>
                📷 이미지 첨부
              </h3>
              <p style={{
                margin: '0',
                fontSize: '16px',
                color: isDarkMode ? '#8E8E93' : '#6D6D70'
              }}>
                일기에 첨부할 이미지를 선택해주세요
              </p>
            </div>

            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'}`,
                borderRadius: '16px',
                padding: '40px 20px',
                textAlign: 'center',
                background: isDarkMode ? 'rgba(58, 58, 60, 0.3)' : 'rgba(248, 250, 252, 0.5)',
                marginBottom: '20px',
                transition: 'all 0.2s'
              }}
            >
              <Upload style={{ 
                width: '48px', 
                height: '48px', 
                color: isDarkMode ? '#8E8E93' : '#9CA3AF',
                margin: '0 auto 16px'
              }} />
              <p style={{
                margin: '0 0 12px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: isDarkMode ? '#FFFFFF' : '#374151'
              }}>
                이미지를 드래그하거나 클릭해서 업로드
              </p>
              <p style={{
                margin: '0',
                fontSize: '14px',
                color: isDarkMode ? '#8E8E93' : '#6B7280'
              }}>
                JPG, PNG, GIF 파일 지원 (최대 5MB)
              </p>
              
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files)}
                style={{ display: 'none' }}
                id="imageUpload"
              />
              <label 
                htmlFor="imageUpload"
                style={{
                  display: 'inline-block',
                  marginTop: '16px',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #17A2B8 0%, #138496 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(23, 162, 184, 0.3)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                파일 선택
              </label>
            </div>

            {imageUploading && (
              <div style={{
                textAlign: 'center',
                padding: '20px',
                background: isDarkMode ? 'rgba(58, 58, 60, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <Loader style={{ 
                  width: '24px', 
                  height: '24px', 
                  color: '#17A2B8',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '8px'
                }} />
                <p style={{
                  margin: '0',
                  fontSize: '14px',
                  color: isDarkMode ? '#CCCCCC' : '#666'
                }}>
                  이미지를 업로드하고 하이라이트를 생성하는 중...
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setImageModalOpen(false)}
                style={{
                  padding: '12px 24px',
                  background: isDarkMode ? 'rgba(58, 58, 60, 0.8)' : 'rgba(156, 163, 175, 0.2)',
                  color: isDarkMode ? '#FFFFFF' : '#374151',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(72, 72, 74, 0.9)' : 'rgba(156, 163, 175, 0.3)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(58, 58, 60, 0.8)' : 'rgba(156, 163, 175, 0.2)'
                }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 하이라이트 이미지 연결 모달 */}
      {showHighlightModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div style={{
            background: isDarkMode 
              ? 'rgba(44, 44, 46, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
            boxShadow: isDarkMode 
              ? '0 20px 40px rgba(0, 0, 0, 0.5)' 
              : '0 20px 40px rgba(0, 0, 0, 0.2)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '24px',
                fontWeight: '700',
                color: isDarkMode ? '#FFFFFF' : '#1D1D1F'
              }}>
                ✨ 텍스트에 이미지 연결하기
              </h3>
              <p style={{
                margin: '0 0 12px 0',
                fontSize: '16px',
                color: isDarkMode ? '#8E8E93' : '#6D6D70'
              }}>
                선택한 텍스트에 관련 이미지를 연결해보세요
              </p>
              
              {/* 선택된 텍스트 표시 */}
              {selectedTextInfo && (
                <div style={{
                  background: isDarkMode ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 215, 0, 0.15)',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'inline-block',
                  marginTop: '8px'
                }}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: isDarkMode ? '#FFD60A' : '#B8860B'
                  }}>
                    "{selectedTextInfo.text}"
                  </span>
                </div>
              )}
            </div>

            <div 
              onDragOver={handleDragOver}
              onDrop={handleHighlightImageUpload}
              style={{
                border: `2px dashed ${isDarkMode ? 'rgba(255, 215, 0, 0.5)' : 'rgba(255, 215, 0, 0.4)'}`,
                borderRadius: '16px',
                padding: '40px 20px',
                textAlign: 'center',
                background: isDarkMode ? 'rgba(255, 215, 0, 0.05)' : 'rgba(255, 215, 0, 0.1)',
                marginBottom: '20px',
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #FFD60A 0%, #FF9500 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <Upload style={{ width: '32px', height: '32px', color: 'white' }} />
              </div>
              
              <p style={{
                margin: '0 0 12px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: isDarkMode ? '#FFFFFF' : '#374151'
              }}>
                하이라이트에 연결할 이미지 업로드
              </p>
              <p style={{
                margin: '0',
                fontSize: '14px',
                color: isDarkMode ? '#8E8E93' : '#6B7280'
              }}>
                이미지를 드래그하거나 클릭해서 업로드하세요
              </p>
              
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleHighlightImageUpload(e.target.files)}
                style={{ display: 'none' }}
                id="highlightImageUpload"
              />
              <label 
                htmlFor="highlightImageUpload"
                style={{
                  display: 'inline-block',
                  marginTop: '16px',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #FFD60A 0%, #FF9500 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(255, 149, 0, 0.3)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                이미지 선택
              </label>
            </div>

            {imageUploading && (
              <div style={{
                textAlign: 'center',
                padding: '20px',
                background: isDarkMode ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 215, 0, 0.15)',
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <Loader style={{ 
                  width: '24px', 
                  height: '24px', 
                  color: '#FF9500',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '8px'
                }} />
                <p style={{
                  margin: '0',
                  fontSize: '14px',
                  color: isDarkMode ? '#CCCCCC' : '#666'
                }}>
                  이미지를 업로드하고 하이라이트를 생성하는 중...
                </p>
              </div>
            )}

            <div style={{ 
              padding: '16px',
              background: isDarkMode ? 'rgba(58, 58, 60, 0.3)' : 'rgba(248, 250, 252, 0.8)',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <h4 style={{
                margin: '0 0 8px 0',
                fontSize: '14px',
                fontWeight: '600',
                color: isDarkMode ? '#FFFFFF' : '#333'
              }}>
                💡 하이라이트 기능 안내
              </h4>
              <ul style={{
                margin: '0',
                padding: '0 0 0 16px',
                fontSize: '13px',
                color: isDarkMode ? '#CCCCCC' : '#666',
                lineHeight: '1.4'
              }}>
                <li>선택한 텍스트에 관련된 이미지를 업로드하세요</li>
                <li>하이라이트된 텍스트를 클릭하면 연결된 이미지를 볼 수 있어요</li>
                <li>여러 개의 이미지를 한 번에 연결할 수 있습니다</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowHighlightModal(false)
                  setSelectedTextInfo(null)
                  setSelectedText('')
                  // 텍스트 선택 해제
                  window.getSelection().removeAllRanges()
                }}
                style={{
                  padding: '12px 24px',
                  background: isDarkMode ? 'rgba(58, 58, 60, 0.8)' : 'rgba(156, 163, 175, 0.2)',
                  color: isDarkMode ? '#FFFFFF' : '#374151',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(72, 72, 74, 0.9)' : 'rgba(156, 163, 175, 0.3)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(58, 58, 60, 0.8)' : 'rgba(156, 163, 175, 0.2)'
                }}
              >
                취소
              </button>
              
              <button
                onClick={() => {
                  setShowHighlightModal(false)
                  setSelectedTextInfo(null)
                  setSelectedText('')
                  // 텍스트 선택 해제
                  window.getSelection().removeAllRanges()
                }}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #FFD60A 0%, #FF9500 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(255, 149, 0, 0.3)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                나중에 연결하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DiaryWrite
