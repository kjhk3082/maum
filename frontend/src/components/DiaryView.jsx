import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Edit3, Trash2, Calendar, Loader } from 'lucide-react'
import { diaryAPI } from '../services/api'

const emotions = {
  HAPPY: { emoji: '😊', label: '기쁨' },
  SAD: { emoji: '😢', label: '슬픔' },
  ANGRY: { emoji: '😠', label: '화남' },
  PEACEFUL: { emoji: '😴', label: '평온' },
  ANXIOUS: { emoji: '😰', label: '불안' }
}

function DiaryView() {
  const { date } = useParams()
  const navigate = useNavigate()
  const [entry, setEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const loadDiary = async () => {
      try {
        setLoading(true)
        const diary = await diaryAPI.getDiary(date)
        setEntry(diary)
      } catch (error) {
        console.error('일기 로드 오류:', error)
        setEntry(null)
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

  const handleEdit = async () => {
    try {
      const isWritable = await diaryAPI.checkWritableTime()
      const today = new Date().toISOString().split('T')[0]
      
      // 오늘 일기이고 작성 가능 시간이면 수정 가능
      if (date === today && isWritable) {
        navigate(`/write/${date}`)
      } else {
        alert('일기는 작성 당일 18:00~24:00 사이에만 수정할 수 있습니다.')
      }
    } catch (error) {
      console.error('수정 가능 시간 체크 오류:', error)
      alert('서버 연결에 문제가 있습니다.')
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await diaryAPI.deleteDiary(date)
      
      setShowDeleteModal(false)
      alert('일기가 삭제되었습니다.')
      navigate('/')
    } catch (error) {
      console.error('삭제 오류:', error)
      alert(error.message || '삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12">
            <Loader className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-spin" />
            <p className="text-gray-500">일기를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">일기를 찾을 수 없습니다</h2>
            <p className="text-gray-500 mb-4">선택한 날짜에 작성된 일기가 없습니다.</p>
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              캘린더로 돌아가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]
  const emotionData = emotions[entry.emotion] || { emoji: '😊', label: '기쁨' }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-800">{entry.title}</h1>
                <span className="text-3xl">{emotionData.emoji}</span>
              </div>
              <p className="text-gray-600">{formatDate(date)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEdit}
              className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>수정</span>
            </button>
            
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>삭제</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* 감정 표시 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <span className="text-4xl">{emotionData.emoji}</span>
              <div>
                <h3 className="font-semibold text-gray-700">오늘의 감정</h3>
                <p className="text-gray-600">{emotionData.label}</p>
              </div>
            </div>
          </div>

          {/* 일기 내용 */}
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {entry.content}
            </div>
          </div>

          {/* 메타데이터 */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div>
                작성일: {formatDate(entry.createdAt)} {formatTime(entry.createdAt)}
              </div>
              {entry.updatedAt !== entry.createdAt && (
                <div>
                  최종 수정: {formatDate(entry.updatedAt)} {formatTime(entry.updatedAt)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">일기 삭제</h3>
            <p className="text-gray-600 mb-6">
              정말로 이 일기를 삭제하시겠습니까?<br />
              삭제된 일기는 복구할 수 없습니다.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting && <Loader className="w-4 h-4 animate-spin" />}
                <span>삭제</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DiaryView
