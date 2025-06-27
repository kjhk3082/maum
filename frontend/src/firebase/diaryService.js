/**
 * Firebase Firestore 일기 서비스
 * 일기 CRUD 및 데이터 관리
 */

import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from './config'
import { getCurrentUser } from './authService'

// 컬렉션 이름
const DIARIES_COLLECTION = 'diaries'

/**
 * 일기 생성
 */
export const createDiary = async (diaryData) => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('로그인이 필요합니다')
    }

    const diary = {
      ...diaryData,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, DIARIES_COLLECTION), diary)
    
    return {
      success: true,
      id: docRef.id,
      diary
    }
  } catch (error) {
    console.error('일기 생성 오류:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 특정 날짜의 일기 조회
 */
export const getDiaryByDate = async (date) => {
  try {
    const user = getCurrentUser()
    if (!user || !user.uid) {
      console.warn('사용자 정보가 없습니다:', user)
      throw new Error('로그인이 필요합니다')
    }

    const q = query(
      collection(db, DIARIES_COLLECTION),
      where('userId', '==', user.uid),
      where('date', '==', date)
    )

    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return { success: true, diary: null }
    }

    const doc = querySnapshot.docs[0]
    const diary = {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString()
    }

    return {
      success: true,
      diary
    }
  } catch (error) {
    console.error('일기 조회 오류:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 일기 ID로 조회
 */
export const getDiaryById = async (diaryId) => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('로그인이 필요합니다')
    }

    const docRef = doc(db, DIARIES_COLLECTION, diaryId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return { success: true, diary: null }
    }

    const diary = {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString(),
      updatedAt: docSnap.data().updatedAt?.toDate?.()?.toISOString()
    }

    // 소유자 확인
    if (diary.userId !== user.uid) {
      throw new Error('접근 권한이 없습니다')
    }

    return {
      success: true,
      diary
    }
  } catch (error) {
    console.error('일기 조회 오류:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 사용자의 모든 일기 조회 (최신순)
 */
export const getAllDiaries = async (limitCount = 50) => {
  try {
    const user = getCurrentUser()
    if (!user || !user.uid) {
      console.warn('사용자 정보가 없습니다, 로컬스토리지 모드로 전환:', user)
      // Firebase 연결 실패 시 로컬스토리지에서 일기 조회
      const localDiaries = JSON.parse(localStorage.getItem('local_diaries') || '[]')
      return {
        success: true,
        diaries: localDiaries.slice(0, limitCount)
      }
    }

    const q = query(
      collection(db, DIARIES_COLLECTION),
      where('userId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(limitCount)
    )

    const querySnapshot = await getDocs(q)
    const diaries = []

    querySnapshot.forEach((doc) => {
      diaries.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString()
      })
    })

    return {
      success: true,
      diaries
    }
  } catch (error) {
    console.error('일기 목록 조회 오류:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 일기 검색
 */
export const searchDiaries = async (keyword) => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('로그인이 필요합니다')
    }

    // Firestore에서는 전문 검색이 제한적이므로 모든 일기를 가져와서 필터링
    const { success, diaries } = await getAllDiaries(100)
    
    if (!success) {
      throw new Error('일기 검색 중 오류가 발생했습니다')
    }

    const filteredDiaries = diaries.filter(diary => 
      diary.title?.toLowerCase().includes(keyword.toLowerCase()) ||
      diary.content?.toLowerCase().includes(keyword.toLowerCase())
    )

    return {
      success: true,
      diaries: filteredDiaries
    }
  } catch (error) {
    console.error('일기 검색 오류:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 일기 업데이트
 */
export const updateDiary = async (diaryId, updateData) => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('로그인이 필요합니다')
    }

    // 먼저 소유자 확인
    const { success, diary } = await getDiaryById(diaryId)
    if (!success || !diary) {
      throw new Error('일기를 찾을 수 없습니다')
    }

    const docRef = doc(db, DIARIES_COLLECTION, diaryId)
    const updatedData = {
      ...updateData,
      updatedAt: serverTimestamp()
    }

    await updateDoc(docRef, updatedData)

    return {
      success: true,
      diary: {
        ...diary,
        ...updatedData,
        updatedAt: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('일기 업데이트 오류:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 일기 삭제
 */
export const deleteDiary = async (diaryId) => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('로그인이 필요합니다')
    }

    // 먼저 소유자 확인
    const { success, diary } = await getDiaryById(diaryId)
    if (!success || !diary) {
      throw new Error('일기를 찾을 수 없습니다')
    }

    await deleteDoc(doc(db, DIARIES_COLLECTION, diaryId))

    return { success: true }
  } catch (error) {
    console.error('일기 삭제 오류:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 월별 일기 조회
 */
export const getDiariesByMonth = async (year, month) => {
  try {
    const user = getCurrentUser()
    if (!user || !user.uid) {
      console.warn('월별 일기 조회 - 로컬스토리지 모드로 전환:', user)
      // 로컬스토리지에서 해당 월의 일기 필터링
      const localDiaries = JSON.parse(localStorage.getItem('local_diaries') || '[]')
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
      const nextMonth = month === 12 ? 1 : month + 1
      const nextYear = month === 12 ? year + 1 : year
      const endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`
      
      const monthlyDiaries = localDiaries.filter(diary => 
        diary.date >= startDate && diary.date < endDate
      )
      
      return {
        success: true,
        diaries: monthlyDiaries
      }
    }

    // 날짜 범위 계산
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
    const nextMonth = month === 12 ? 1 : month + 1
    const nextYear = month === 12 ? year + 1 : year
    const endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`

    const q = query(
      collection(db, DIARIES_COLLECTION),
      where('userId', '==', user.uid),
      where('date', '>=', startDate),
      where('date', '<', endDate),
      orderBy('date', 'asc')
    )

    const querySnapshot = await getDocs(q)
    const diaries = []

    querySnapshot.forEach((doc) => {
      diaries.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString()
      })
    })

    return {
      success: true,
      diaries
    }
  } catch (error) {
    console.error('월별 일기 조회 오류:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 감정 통계 조회
 */
export const getEmotionStats = async () => {
  try {
    const { success, diaries } = await getAllDiaries(365) // 최근 1년
    
    if (!success) {
      throw new Error('감정 통계 조회 중 오류가 발생했습니다')
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

    // 퍼센티지 계산
    const emotionStats = Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion,
      count,
      percentage: totalDiaries > 0 ? Math.round((count / totalDiaries) * 100) : 0
    }))

    return {
      success: true,
      stats: {
        totalDiaries,
        emotionStats,
        emotionCounts
      }
    }
  } catch (error) {
    console.error('감정 통계 조회 오류:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 연속 작성일 계산
 */
export const getStreakDays = async () => {
  try {
    const { success, diaries } = await getAllDiaries(365)
    
    if (!success) {
      console.warn('연속 작성일 계산 - 로컬스토리지 모드로 전환')
      // 로컬스토리지 기반 연속 작성일 계산
      const localDiaries = JSON.parse(localStorage.getItem('local_diaries') || '[]')
      return calculateStreakFromLocalDiaries(localDiaries)
    }

    if (diaries.length === 0) {
      return { success: true, streakDays: 0 }
    }

    // 날짜별로 정렬 (최신순)
    const sortedDiaries = diaries.sort((a, b) => new Date(b.date) - new Date(a.date))
    
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
        // 어제 작성한 경우도 연속으로 인정
        streakDays++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return {
      success: true,
      streakDays
    }
  } catch (error) {
    console.error('연속 작성일 계산 오류:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 로컬스토리지 기반 연속 작성일 계산
 */
const calculateStreakFromLocalDiaries = (diaries) => {
  try {
    if (diaries.length === 0) {
      return { success: true, streakDays: 0 }
    }

    // 날짜별로 정렬 (최신순)
    const sortedDiaries = diaries.sort((a, b) => new Date(b.date) - new Date(a.date))
    
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
        // 어제 작성한 경우도 연속으로 인정
        streakDays++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return {
      success: true,
      streakDays
    }
  } catch (error) {
    console.error('로컬 연속 작성일 계산 오류:', error)
    return {
      success: true,
      streakDays: 0
    }
  }
} 