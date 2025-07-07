// 이미지 업로드 서비스
const AWS_ENABLED = false // 실제 AWS S3 사용 여부

class ImageService {
  constructor() {
    this.maxFileSize = 5 * 1024 * 1024 // 5MB
    this.allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  }

  // 파일 유효성 검사
  validateFile(file) {
    const errors = []

    if (!file) {
      errors.push('파일을 선택해주세요.')
      return { isValid: false, errors }
    }

    // 파일 크기 검사
    if (file.size > this.maxFileSize) {
      errors.push(`파일 크기는 ${this.maxFileSize / (1024 * 1024)}MB 이하여야 합니다.`)
    }

    // 파일 타입 검사
    if (!this.allowedTypes.includes(file.type)) {
      errors.push('JPG, PNG, GIF, WebP 파일만 업로드 가능합니다.')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // 이미지 미리보기 생성
  createPreview(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        resolve({
          dataUrl: e.target.result,
          file: file,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        })
      }
      
      reader.onerror = () => {
        reject(new Error('파일을 읽을 수 없습니다.'))
      }
      
      reader.readAsDataURL(file)
    })
  }

  // 이미지 압축 (선택사항)
  async compressImage(file, maxWidth = 1200, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // 비율 유지하면서 크기 조정
        let { width, height } = img
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        // 이미지 그리기
        ctx.drawImage(img, 0, 0, width, height)

        // 압축된 이미지를 Blob으로 변환
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          },
          file.type,
          quality
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }

  // AWS S3 업로드 (실제 구현)
  async uploadToS3(file, diaryId) {
    if (!AWS_ENABLED) {
      // 데모 모드: 로컬 미리보기만 제공
      const preview = await this.createPreview(file)
      return {
        success: true,
        url: preview.dataUrl, // 실제로는 S3 URL이 될 것
        key: `diary-images/${diaryId}/${Date.now()}-${file.name}`,
        isDemo: true
      }
    }

    try {
      // 실제 AWS S3 업로드 로직
      const formData = new FormData()
      formData.append('file', file)
      formData.append('diaryId', diaryId)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('업로드 실패')
      }

      const result = await response.json()
      
      return {
        success: true,
        url: result.url,
        key: result.key,
        isDemo: false
      }
    } catch (error) {
      console.error('S3 업로드 오류:', error)
      throw new Error('이미지 업로드에 실패했습니다.')
    }
  }

  // 여러 이미지 업로드
  async uploadMultiple(files, diaryId) {
    const results = []
    const errors = []

    for (const file of files) {
      try {
        const validation = this.validateFile(file)
        if (!validation.isValid) {
          errors.push({
            file: file.name,
            errors: validation.errors
          })
          continue
        }

        // 필요시 이미지 압축
        const processedFile = file.size > 2 * 1024 * 1024 
          ? await this.compressImage(file)
          : file

        const uploadResult = await this.uploadToS3(processedFile, diaryId)
        results.push({
          originalFile: file,
          uploadResult
        })
      } catch (error) {
        errors.push({
          file: file.name,
          errors: [error.message]
        })
      }
    }

    return {
      success: results.length > 0,
      results,
      errors
    }
  }

  // S3에서 이미지 삭제
  async deleteFromS3(imageKey) {
    if (!AWS_ENABLED) {
      return { success: true, isDemo: true }
    }

    try {
      const response = await fetch(`/api/upload/image/${encodeURIComponent(imageKey)}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('삭제 실패')
      }

      return { success: true, isDemo: false }
    } catch (error) {
      console.error('S3 삭제 오류:', error)
      throw new Error('이미지 삭제에 실패했습니다.')
    }
  }

  // 파일 크기를 사람이 읽기 쉬운 형태로 변환
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // 이미지 타입에 따른 아이콘 반환
  getFileIcon(fileType) {
    switch (fileType) {
      case 'image/jpeg':
      case 'image/jpg':
        return '🖼️'
      case 'image/png':
        return '🎨'
      case 'image/gif':
        return '🎞️'
      case 'image/webp':
        return '🌐'
      default:
        return '📁'
    }
  }
}

export const imageService = new ImageService()
export default imageService 