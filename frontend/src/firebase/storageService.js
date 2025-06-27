/**
 * Firebase Storage 서비스
 * 이미지 업로드 및 관리
 */

import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable,
  getDownloadURL, 
  deleteObject,
  listAll
} from 'firebase/storage'
import { storage } from './config'
import { getCurrentUser } from './authService'

/**
 * 이미지 업로드 (단일 파일)
 */
export const uploadImage = async (file, path = 'diary-images') => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('로그인이 필요합니다')
    }

    // 파일 유효성 검사
    if (!file) {
      throw new Error('파일이 선택되지 않았습니다')
    }

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      throw new Error('이미지 파일만 업로드 가능합니다')
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('파일 크기는 5MB 이하여야 합니다')
    }

    // 고유한 파일명 생성
    const timestamp = Date.now()
    const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
    const filePath = `${path}/${user.uid}/${filename}`

    // Storage 참조 생성
    const storageRef = ref(storage, filePath)

    // 파일 업로드
    const snapshot = await uploadBytes(storageRef, file)
    
    // 다운로드 URL 가져오기
    const downloadURL = await getDownloadURL(snapshot.ref)

    return {
      success: true,
      data: {
        url: downloadURL,
        path: filePath,
        filename,
        size: file.size,
        type: file.type
      }
    }
  } catch (error) {
    console.error('이미지 업로드 오류:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 이미지 업로드 (진행률 포함)
 */
export const uploadImageWithProgress = (file, path = 'diary-images', onProgress) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = getCurrentUser()
      if (!user) {
        throw new Error('로그인이 필요합니다')
      }

      // 파일 유효성 검사
      if (!file) {
        throw new Error('파일이 선택되지 않았습니다')
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('이미지 파일만 업로드 가능합니다')
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('파일 크기는 5MB 이하여야 합니다')
      }

      // 고유한 파일명 생성
      const timestamp = Date.now()
      const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      const filePath = `${path}/${user.uid}/${filename}`

      // Storage 참조 생성
      const storageRef = ref(storage, filePath)

      // 업로드 태스크 생성
      const uploadTask = uploadBytesResumable(storageRef, file)

      // 진행률 리스너
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          if (onProgress) {
            onProgress(progress)
          }
        },
        (error) => {
          console.error('업로드 오류:', error)
          reject({
            success: false,
            error: error.message
          })
        },
        async () => {
          try {
            // 업로드 완료
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            resolve({
              success: true,
              data: {
                url: downloadURL,
                path: filePath,
                filename,
                size: file.size,
                type: file.type
              }
            })
          } catch (error) {
            reject({
              success: false,
              error: error.message
            })
          }
        }
      )
    } catch (error) {
      reject({
        success: false,
        error: error.message
      })
    }
  })
}

/**
 * 여러 이미지 업로드
 */
export const uploadMultipleImages = async (files, path = 'diary-images', onProgress) => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('로그인이 필요합니다')
    }

    if (!files || files.length === 0) {
      throw new Error('업로드할 파일이 없습니다')
    }

    const uploadPromises = Array.from(files).map((file, index) => {
      return uploadImageWithProgress(file, path, (progress) => {
        if (onProgress) {
          onProgress(index, progress)
        }
      })
    })

    const results = await Promise.all(uploadPromises)
    const successResults = results.filter(result => result.success)
    const failureResults = results.filter(result => !result.success)

    return {
      success: failureResults.length === 0,
      data: successResults.map(result => result.data),
      errors: failureResults.map(result => result.error),
      totalFiles: files.length,
      successCount: successResults.length,
      failureCount: failureResults.length
    }
  } catch (error) {
    console.error('다중 이미지 업로드 오류:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 이미지 삭제
 */
export const deleteImage = async (imagePath) => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('로그인이 필요합니다')
    }

    // 사용자 소유 파일인지 확인
    if (!imagePath.includes(user.uid)) {
      throw new Error('삭제 권한이 없습니다')
    }

    const imageRef = ref(storage, imagePath)
    await deleteObject(imageRef)

    return {
      success: true
    }
  } catch (error) {
    console.error('이미지 삭제 오류:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 사용자의 모든 이미지 목록 조회
 */
export const getUserImages = async (path = 'diary-images') => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('로그인이 필요합니다')
    }

    const userPath = `${path}/${user.uid}`
    const listRef = ref(storage, userPath)
    
    const result = await listAll(listRef)
    const imagePromises = result.items.map(async (itemRef) => {
      const url = await getDownloadURL(itemRef)
      return {
        name: itemRef.name,
        path: itemRef.fullPath,
        url
      }
    })

    const images = await Promise.all(imagePromises)

    return {
      success: true,
      images
    }
  } catch (error) {
    console.error('이미지 목록 조회 오류:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 이미지 압축
 */
export const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // 비율 계산
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio

      // 이미지 그리기
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Blob으로 변환
      canvas.toBlob((blob) => {
        resolve(new File([blob], file.name, {
          type: file.type,
          lastModified: Date.now()
        }))
      }, file.type, quality)
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * 이미지 리사이즈 및 업로드
 */
export const uploadCompressedImage = async (file, path = 'diary-images', maxWidth = 1200, quality = 0.8) => {
  try {
    // 이미지 압축
    const compressedFile = await compressImage(file, maxWidth, quality)
    
    // 압축된 이미지 업로드
    return await uploadImage(compressedFile, path)
  } catch (error) {
    console.error('압축 이미지 업로드 오류:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Base64를 File 객체로 변환
 */
export const base64ToFile = (base64, filename = 'image.jpg') => {
  const arr = base64.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  
  return new File([u8arr], filename, { type: mime })
}

/**
 * URL에서 이미지 다운로드하여 File 객체로 변환
 */
export const urlToFile = async (url, filename = 'image.jpg') => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return new File([blob], filename, { type: blob.type })
  } catch (error) {
    console.error('URL to File 변환 오류:', error)
    throw error
  }
} 