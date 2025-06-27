// OpenAI API 서비스
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || 'demo-mode'

export const openaiService = {
  async generateDiaryHelp(context) {
    // 실제 API 키가 있으면 실제 API 호출, 아니면 데모 모드
    if (OPENAI_API_KEY && OPENAI_API_KEY !== 'demo-mode') {
      return this.callRealAPI(context)
    } else {
      return this.getDemoResponse(context)
    }
  },

  async callRealAPI(context) {
    try {
      const systemPrompt = `당신은 일기 작성을 도와주는 친근한 AI 도우미입니다. 사용자가 더 풍부하고 의미 있는 일기를 쓸 수 있도록 격려하고 구체적인 질문을 던져주세요. 
      - 감정을 더 자세히 표현하도록 도와주세요
      - 구체적인 상황과 경험을 묘사하도록 격려해주세요  
      - 긍정적이고 따뜻한 톤으로 응답해주세요
      - 한국어로 자연스럽게 응답해주세요
      - 50자 이내로 간단명료하게 답변해주세요`

      let userPrompt = `오늘의 일기 작성을 도와주세요.\n`
      
      if (context.emotion) {
        const emotionMap = {
          'HAPPY': '기쁨',
          'SAD': '슬픔', 
          'ANGRY': '화남',
          'PEACEFUL': '평온',
          'ANXIOUS': '불안'
        }
        userPrompt += `감정: ${emotionMap[context.emotion]}\n`
      }
      
      if (context.title) {
        userPrompt += `제목: ${context.title}\n`
      }
      
      if (context.content) {
        userPrompt += `내용: ${context.content}\n`
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',  // 더 저렴한 모델 사용
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 100,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`)
      }

      const data = await response.json()
      const message = data.choices[0]?.message?.content?.trim()

      return {
        success: true,
        message: message || '일기 작성을 응원합니다! 오늘의 소중한 순간들을 기록해보세요.',
        isDemo: false
      }

    } catch (error) {
      console.error('OpenAI API 오류:', error)
      // API 오류 시 데모 응답으로 폴백
      return this.getDemoResponse(context)
    }
  },

  getDemoResponse(context) {
    // 감정별 맞춤 응답
    const emotionResponses = {
      HAPPY: [
        '이 기쁜 순간을 더 자세히 기록해보면 어떨까요?',
        '오늘 웃게 만든 특별한 일이 있었나요?',
        '행복한 감정을 느낀 순간을 구체적으로 써보세요!',
        '이 행복을 누군가와 나누고 싶었던 순간이 있나요?'
      ],
      SAD: [
        '힘든 마음을 글로 표현하면 조금 나아질 거예요.',
        '오늘 하루 중 작은 위로가 된 순간이 있었나요?',
        '슬픈 마음도 소중한 감정이에요. 천천히 써보세요.',
        '이런 감정을 느낄 때 도움이 되는 것이 있나요?'
      ],
      ANGRY: [
        '화가 난 마음을 글로 풀어보면 어떨까요?',
        '분노의 원인을 차근차근 정리해보세요.',
        '오늘 화가 났지만 배운 점이 있다면 무엇일까요?',
        '이 감정을 어떻게 건설적으로 표현할 수 있을까요?'
      ],
      PEACEFUL: [
        '평온한 순간들을 더 자세히 기록해보세요.',
        '마음이 편안했던 시간은 언제였나요?',
        '오늘의 고요한 순간을 글로 남겨보세요.',
        '이 평화로운 기분을 오래 기억하고 싶어요.'
      ],
      ANXIOUS: [
        '불안한 마음을 글로 표현하면 정리가 될 거예요.',
        '걱정을 구체적으로 써보고 해결책을 찾아보세요.',
        '불안하지만 잘 해낸 일이 있었다면 써보세요.',
        '이런 감정을 느낄 때 도움이 되는 방법이 있나요?'
      ]
    }

    // 상황별 응답
    const contextResponses = {
      hasTitle: [
        '제목과 관련된 이야기를 더 자세히 들려주세요!',
        '그 제목을 정한 이유가 궁금해요.',
        '제목에 담긴 감정을 더 풀어서 써보면 어떨까요?'
      ],
      hasContent: [
        '이 이야기를 더 자세히 들려주세요!',
        '그때의 감정을 더 구체적으로 표현해보면 어떨까요?',
        '그 순간의 상황을 더 생생하게 묘사해보세요.',
        '그 일로 인해 느낀 변화가 있다면 써보세요.'
      ],
      empty: [
        '첫 문장부터 천천히 시작해보세요.',
        '오늘 하루를 한 단어로 표현한다면?',
        '지금 떠오르는 첫 번째 감정을 써보세요.',
        '오늘의 날씨는 기분과 어울렸나요?'
      ]
    }

    // 일반적인 응답
    const generalResponses = [
      '오늘 하루 중 가장 기억에 남는 순간은 무엇인가요?',
      '지금 이 순간의 기분을 더 자세히 표현해보세요.',
      '오늘 만난 사람 중 인상 깊었던 누군가가 있나요?',
      '오늘 감사했던 작은 일들을 떠올려보세요.',
      '내일은 어떤 하루가 되었으면 좋겠나요?',
      '오늘 새롭게 배우거나 깨달은 것이 있나요?',
      '지금 기분을 색깔로 표현한다면 무슨 색일까요?',
      '오늘 자신에게 해주고 싶은 말이 있다면?',
      '오늘의 하이라이트를 한 문장으로 써보세요.',
      '이 순간의 감정을 미래의 자신에게 전하고 싶어요.'
    ]

    let responses = [...generalResponses]

    // 감정이 선택된 경우 감정별 응답 추가
    if (context.emotion && emotionResponses[context.emotion]) {
      responses = [...emotionResponses[context.emotion], ...responses]
    }

    // 제목이나 내용에 따른 응답 추가
    if (context.title && context.title.length > 0) {
      responses = [...contextResponses.hasTitle, ...responses]
    }
    
    if (context.content && context.content.length > 0) {
      responses = [...contextResponses.hasContent, ...responses]
    } else {
      responses = [...contextResponses.empty, ...responses]
    }

    const randomResponse = responses[Math.floor(Math.random() * responses.length)]

    return {
      success: true,
      message: randomResponse,
      isDemo: OPENAI_API_KEY === 'demo-mode'
    }
  },

  // 텍스트 확장 기능 (키워드를 문장으로 확장)
  async expandTextToDiary(context) {
    try {
      const { selectedText, emotion } = context
      
      // OpenAI API가 설정되어 있는 경우 실제 API 호출
      if (OPENAI_API_KEY && OPENAI_API_KEY !== 'demo-mode') {
        const systemPrompt = `당신은 일기 작성 전문가입니다. 사용자가 선택한 키워드나 문장을 자연스럽고 개성 있는 일기 문장으로 변환해주세요.

## 핵심 원칙:
1. **개인적이고 진솔한 톤**: 실제 사람이 쓴 일기처럼 자연스럽게
2. **구체적인 표현**: "좋았다", "기분 좋았다" 같은 뻔한 표현 금지
3. **감각적 묘사**: 시각, 청각, 촉각, 후각, 미각을 활용한 생생한 표현
4. **개인만의 언어**: 개성 있고 진정성 있는 표현 사용
5. **적절한 길이**: 30-80자 사이의 자연스러운 문장

## 감정별 표현 가이드:
- **기쁨**: 설렘, 따뜻함, 환한 느낌, 가벼운 발걸음, 입가의 미소
- **슬픔**: 먹먹함, 텅 빈 느낌, 무거운 마음, 시무룩함, 조용한 한숨
- **화남**: 답답함, 뜨거운 기분, 숨이 막힘, 속이 끓음, 주먹을 쥠
- **평온**: 고요함, 차분함, 깊은 숨, 부드러운 바람, 포근함
- **불안**: 두근거림, 초조함, 바늘방석, 머릿속 복잡함, 손톱 물어뜯기

## 문장 변환 예시:
### 키워드 확장:
- "신라면, 18시, 맛있음" → "저녁 6시, 배고픔을 달래려 끓인 신라면 한 그릇이 이렇게 위로가 될 줄이야."
- "비, 집, 음악" → "창밖으로 떨어지는 빗소리와 함께 틀어놓은 음악이 묘하게 어우러졌다."
- "친구, 카페, 웃음" → "오랜만에 만난 친구와 카페에서 배꼽 잡고 웃었더니 하루 피로가 다 풀렸다."

### 문장 개선:
- "점심이 맛있었다" → "점심 메뉴 하나로도 이렇게 기분이 좋아질 수 있다니, 소소한 행복이란 게 이런 거구나."
- "영화를 봤다" → "스크린 속 이야기에 빠져든 2시간, 현실을 잠시 잊고 몰입할 수 있어서 좋았다."
- "운동했다" → "온몸에서 땀이 흘러내리는 게 오히려 속이 시원했다."

## 특별 지침:
- 시간 표현: "18시"보다는 "저녁 6시", "오후 늦게" 등 자연스럽게
- 감정 표현: 직접적이지 않고 은유적, 감각적으로
- 개인 경험: 마치 일기 주인만의 특별한 순간처럼
- 문체: 반말 일기체, 때로는 의성어나 의태어 활용

현재 감정 상태: ${emotion}
선택된 텍스트: "${selectedText}"

위 텍스트를 바탕으로 개성 있고 진솔한 일기 문장으로 변환해주세요. 단순한 감정 형용사 남발은 피하고, 구체적이고 생생한 표현을 사용해주세요.`

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `키워드: "${selectedText}"` }
            ],
            max_tokens: 150,
            temperature: 0.7
          })
        })

        if (!response.ok) {
          throw new Error(`API 오류: ${response.status}`)
        }

        const data = await response.json()
        const expandedText = data.choices[0].message.content.trim()

        return {
          success: true,
          expandedText: expandedText,
          isDemo: false
        }
      } else {
        // 데모 모드 - API 키가 없는 경우
        const demoExpansion = this.getDemoExpansion(selectedText, emotion)
        return {
          success: true,
          expandedText: demoExpansion,
          isDemo: true
        }
      }
    } catch (error) {
      console.error('텍스트 확장 오류:', error)
      
      // 오류 시 데모 응답 제공
      const demoExpansion = this.getDemoExpansion(context.selectedText, context.emotion)
      return {
        success: true,
        expandedText: demoExpansion,
        isDemo: true
      }
    }
  },

  // 데모 텍스트 확장 함수
  getDemoExpansion(selectedText, emotion) {
    const text = selectedText.trim()
    
    // 이미 완성된 문장인지 키워드인지 판단
    const isCompleteSentence = text.includes('다') || text.includes('요') || text.includes('었') || text.includes('였') || text.includes('했')
    
    if (isCompleteSentence) {
      // 이미 완성된 문장을 더 자연스럽게 개선
      return this.improveSentence(text, emotion)
    } else {
      // 키워드를 문장으로 확장
      return this.expandKeywords(text, emotion)
    }
  },

  // 키워드를 자연스러운 문장으로 확장
  expandKeywords(text, emotion) {
    const keywords = text.split(/[,，\s]+/).filter(word => word.trim())
    
    // 감정별 표현 패턴
    const emotionPatterns = {
      'HAPPY': {
        actions: ['했더니 기분이 환해졌다', '하니까 마음이 따뜻해졌다', '하고 나서 입가에 미소가 떠올랐다', '했는데 정말 신났다'],
        descriptive: ['기분 좋은', '환한', '따뜻한', '설레는', '즐거운'],
        endings: ['덕분에 하루가 밝았다', '로 인해 기분이 좋아졌다', '에서 행복을 느꼈다', '으로 마음이 포근해졌다']
      },
      'SAD': {
        actions: ['했지만 마음이 무거웠다', '하고 나니 허전했다', '해도 기분이 안 좋았다', '했는데 뭔가 아쉬웠다'],
        descriptive: ['씁쓸한', '허전한', '무거운', '먹먹한', '시무룩한'],
        endings: ['로 인해 마음이 복잡했다', '때문에 한숨이 났다', '에서 외로움을 느꼈다', '으로 하루가 무거웠다']
      },
      'ANGRY': {
        actions: ['했는데 화가 났다', '하다가 짜증이 났다', '했지만 답답했다', '하면서 속이 끓었다'],
        descriptive: ['답답한', '화나는', '짜증나는', '속 터지는', '억울한'],
        endings: ['로 인해 화가 치밀었다', '때문에 속이 상했다', '에서 스트레스를 받았다', '으로 하루가 망쳤다']
      },
      'PEACEFUL': {
        actions: ['하며 마음이 차분해졌다', '하니까 평온해졌다', '했더니 여유로워졌다', '하고 나서 힐링됐다'],
        descriptive: ['고요한', '차분한', '여유로운', '평온한', '포근한'],
        endings: ['로 인해 마음이 편안해졌다', '덕분에 힐링됐다', '에서 위로를 받았다', '으로 하루가 평화로웠다']
      },
      'ANXIOUS': {
        actions: ['했는데 긴장됐다', '하면서 떨렸다', '했지만 불안했다', '하다가 초조해졌다'],
        descriptive: ['떨리는', '긴장되는', '불안한', '조마조마한', '두근거리는'],
        endings: ['로 인해 마음이 복잡했다', '때문에 긴장했다', '에서 부담을 느꼈다', '으로 하루가 불안했다']
      }
    }

    const patterns = emotionPatterns[emotion] || emotionPatterns['PEACEFUL']
    
    // 시간, 장소, 활동 키워드 분류
    const timeKeywords = keywords.filter(k => /\d+시|오전|오후|아침|점심|저녁|새벽|밤/.test(k))
    const placeKeywords = keywords.filter(k => /집|카페|학교|회사|공원|도서관|식당|방|화장실/.test(k))
    const foodKeywords = keywords.filter(k => /라면|밥|커피|치킨|피자|햄버거|음식|요리/.test(k))
    const activityKeywords = keywords.filter(k => !/(시|오전|오후|아침|점심|저녁|새벽|밤|집|카페|학교|회사|공원|도서관|식당|방|화장실|라면|밥|커피|치킨|피자|햄버거|음식|요리)/.test(k))

    // 자연스러운 문장 패턴 생성
    const patterns_list = [
      // 시간 + 활동 패턴
      () => {
        if (timeKeywords.length > 0 && activityKeywords.length > 0) {
          const time = this.naturalizeTime(timeKeywords[0])
          const activity = activityKeywords[0]
          const action = patterns.actions[Math.floor(Math.random() * patterns.actions.length)]
          return `${time} ${activity}${action}`
        }
        return null
      },
      
      // 장소 + 활동 패턴
      () => {
        if (placeKeywords.length > 0 && activityKeywords.length > 0) {
          const place = placeKeywords[0]
          const activity = activityKeywords[0]
          const ending = patterns.endings[Math.floor(Math.random() * patterns.endings.length)]
          return `${place}에서 ${activity}${ending}`
        }
        return null
      },
      
      // 음식 특별 패턴
      () => {
        if (foodKeywords.length > 0) {
          const food = foodKeywords[0]
          const foodPatterns = [
            `${food} 한 그릇이 이렇게 든든할 줄이야.`,
            `${food}으로 배를 채우니 마음도 따뜻해졌다.`,
            `${food} 맛이 오늘 하루를 위로해줬다.`,
            `간만에 먹은 ${food}이 특별하게 느껴졌다.`
          ]
          return foodPatterns[Math.floor(Math.random() * foodPatterns.length)]
        }
        return null
      },
      
      // 복합 패턴 (시간 + 장소 + 활동)
      () => {
        if (timeKeywords.length > 0 && placeKeywords.length > 0 && activityKeywords.length > 0) {
          const time = this.naturalizeTime(timeKeywords[0])
          const place = placeKeywords[0]
          const activity = activityKeywords[0]
          const descriptive = patterns.descriptive[Math.floor(Math.random() * patterns.descriptive.length)]
          return `${time} ${place}에서 ${activity}을 하며 ${descriptive} 시간을 보냈다.`
        }
        return null
      }
    ]

    // 패턴 중 하나를 선택해서 실행
    for (const pattern of patterns_list) {
      const result = pattern()
      if (result) return result
    }

    // 기본 패턴
    if (keywords.length === 1) {
      const descriptive = patterns.descriptive[Math.floor(Math.random() * patterns.descriptive.length)]
      return `${keywords[0]}으로 ${descriptive} 하루였다.`
    } else {
      const ending = patterns.endings[Math.floor(Math.random() * patterns.endings.length)]
      return `${keywords.join(', ')}${ending}`
    }
  },

  // 완성된 문장을 더 자연스럽게 개선
  improveSentence(sentence, emotion) {
    // 단순한 표현들을 감지하고 개선
    const improvements = {
      '좋았다': ['기분이 환해졌다', '마음이 따뜻해졌다', '정말 만족스러웠다', '기분이 업됐다'],
      '맛있었다': ['입에서 녹았다', '정말 꿀맛이었다', '이런 맛이었나 싶었다', '먹는 내내 행복했다'],
      '재밌었다': ['시간 가는 줄 몰랐다', '정말 꿀잼이었다', '배꼽 잡고 웃었다', '스트레스가 확 풀렸다'],
      '힘들었다': ['정말 지쳤다', '녹초가 됐다', '기운이 쭉 빠졌다', '한숨이 절로 나왔다'],
      '슬펴다': ['마음이 무거웠다', '눈물이 글썽했다', '가슴이 먹먹했다', '기분이 다운됐다']
    }

    let improved = sentence
    for (const [simple, alternatives] of Object.entries(improvements)) {
      if (sentence.includes(simple)) {
        const alternative = alternatives[Math.floor(Math.random() * alternatives.length)]
        improved = sentence.replace(simple, alternative)
        break
      }
    }

    // 감정에 따른 추가 개선
    if (improved === sentence) {
      const emotionAdditions = {
        'HAPPY': ['덕분에 하루가 밝았다', '로 인해 기분이 좋아졌다', '에서 행복을 느꼈다'],
        'SAD': ['로 인해 마음이 복잡했다', '때문에 한숨이 났다', '에서 외로움을 느꼈다'],
        'ANGRY': ['로 인해 화가 치밀었다', '때문에 속이 상했다', '에서 스트레스를 받았다'],
        'PEACEFUL': ['로 인해 마음이 편안해졌다', '덕분에 힐링됐다', '에서 위로를 받았다'],
        'ANXIOUS': ['로 인해 마음이 복잡했다', '때문에 긴장했다', '에서 부담을 느꼈다']
      }

      const additions = emotionAdditions[emotion] || emotionAdditions['PEACEFUL']
      const addition = additions[Math.floor(Math.random() * additions.length)]
      
      // 문장 끝에 자연스럽게 추가
      if (!sentence.includes('.') && !sentence.includes('다')) {
        improved = sentence + addition
      }
    }

    return improved
  },

  // 시간 표현을 자연스럽게 변환
  naturalizeTime(timeStr) {
    const timeMap = {
      '18시': '저녁 6시',
      '19시': '저녁 7시',
      '20시': '저녁 8시',
      '12시': '점심때',
      '13시': '오후 1시',
      '14시': '오후 2시',
      '9시': '아침 9시',
      '10시': '오전 10시',
      '아침': '아침에',
      '점심': '점심때',
      '저녁': '저녁에',
      '밤': '밤에'
    }
    
    return timeMap[timeStr] || timeStr
  }
} 