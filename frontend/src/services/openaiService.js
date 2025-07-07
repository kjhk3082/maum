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
  async expandTextToDiary(textToExpand, emotion, customPrompt = null) {
    try {
      console.log('🤖 expandTextToDiary 호출:', { textToExpand, emotion, customPrompt })
      
      // OpenAI API가 설정되어 있는 경우 실제 API 호출
      if (OPENAI_API_KEY && OPENAI_API_KEY !== 'demo-mode') {
        const systemPrompt = `당신은 일기 작성 전문가입니다. 사용자가 선택한 키워드나 문장을 자연스럽고 개성 있는 일기 문장으로 변환해주세요.

## 작성 규칙
1. **반말 일기체**로 작성하세요. 너무 깔끔하거나 정제된 문장은 피합니다.
2. 감정은 **직접 말하지 말고**, **느껴지도록 표현**하세요.
3. **30~80자** 사이로 작성하되, 리듬감 있는 문장을 우선시합니다.
4. **감각 묘사**(소리, 냄새, 분위기 등)를 적극 활용하세요.
5. **말줄임, 어미 반복, 의태어, 속도감 있는 말투** 자유롭게 써도 됩니다.

## 금지된 표현
- "기뻤다", "좋았다" 같은 평범한 형용사 나열
- "사용자", "AI", "분석", "작성" 같은 기계적 단어
- "나는", "그는" 같은 삼인칭 표현

## 감정 표현 가이드 (느낌을 유도하는 소재 중심으로)
- **기쁨**: 햇살, 입꼬리, 가벼운 발걸음, 따뜻한 바람
- **슬픔**: 텅 빈 거리, 조용한 방, 흐릿한 창밖
- **화남**: 꾹 다문 입, 덜컥 닫힌 문, 답답한 숨
- **평온**: 고요한 오후, 정리된 책상, 느린 호흡
- **불안**: 떨리는 손끝, 초조한 마음, 흐릿한 시야


## 문장 예시
(1) 키워드 확장
- "친구, 노을, 웃음" → 친구랑 웃다 보니 해가 지는 것도 몰랐다  
- "비, 라면, 혼자" → 빗소리 들으면서 라면 끓였는데 이상하게 위로가 됐다

(2) 감정 개선
- "점심이 맛있었다" → 점심 메뉴 하나로도 이렇게 기분이 좋아질 수 있다니, 별거 아닌 게 위로가 되네  
- "운동했다" → 오랜만에 땀 흘리고 나니까 속이 시원해졌다

(3) 스타일 특징
- "오늘은 괜히 입이 무거웠다, 말이 안 나와서"
- "조용한 버스 안에서 혼자만 바쁘게 움직이는 느낌"

## 최종 목표
- 위 스타일을 참고하여 **자연스럽고 감정이 배어 있는 한 문장**으로 변환하세요.
- 단순한 형용사 표현 대신 구체적이고 생생한 장면을 만들어주세요.
- 반드시 한국어로 작성하며, 마치 일기장 한 줄처럼 보여야 합니다.

현재 감정 상태: ${emotion}
선택된 텍스트: "${textToExpand}"

위 텍스트를 바탕으로 개성 있고 진솔한 일기 문장으로 변환해주세요. 단순한 감정 형용사 남발은 피하고, 구체적이고 생생한 표현을 사용해주세요.`

        const userPrompt = customPrompt || `키워드: "${textToExpand}"`

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
              { role: 'user', content: userPrompt }
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
        const demoExpansion = this.getDemoExpansion(textToExpand, emotion)
        return {
          success: true,
          expandedText: demoExpansion,
          isDemo: true
        }
      }
    } catch (error) {
      console.error('텍스트 확장 오류:', error)
      
      // 오류 시 데모 응답 제공
      const demoExpansion = this.getDemoExpansion(textToExpand, emotion)
      return {
        success: true,
        expandedText: demoExpansion,
        isDemo: true
      }
    }
  },

  // 데모 텍스트 확장 함수
  getDemoExpansion(selectedText, emotion) {
    // 입력값 검증
    if (!selectedText) {
      console.error('getDemoExpansion: selectedText가 없음:', selectedText)
      return '키워드를 입력해주세요.'
    }
    
    // selectedText를 문자열로 변환
    const textStr = String(selectedText)
    if (!textStr || textStr.trim().length === 0) {
      console.error('getDemoExpansion: 빈 텍스트:', textStr)
      return '키워드를 입력해주세요.'
    }
    
    const text = textStr.trim()
    
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
        descriptive: ['기분 좋은', '환한', '따뜻한', '설렘한', '즐거운'],
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
  },

  // AI 분석 리포트 생성
  generateAIAnalysis: async (prompt) => {
    // 데모 모드: API 키가 없거나 설정되지 않은 경우
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-api-key-here') {
      console.log('🤖 OpenAI API 키가 설정되지 않음, 데모 분석 반환')
      return `
📊 **감정 패턴 분석**

최근 일기 작성 패턴을 분석한 결과, 감정 표현이 다양하고 자신의 마음을 잘 들여다보고 계시는 것 같아요. 특히 꾸준한 작성 습관이 인상적입니다!

🔄 **작성 습관 분석**

규칙적인 일기 작성은 자기 성찰과 감정 조절에 매우 도움이 됩니다. 현재의 패턴을 보면 안정적인 루틴이 형성되어 있어 앞으로도 지속할 수 있을 것 같아요.

💡 **개선 제안**

더 다양한 감정 표현을 시도해보세요. 미묘한 감정의 변화까지 포착한다면 더욱 풍부한 자기 이해가 가능할 거예요.

✨ **따뜻한 격려**

일기를 통해 자신과 마주하는 용기가 정말 대단합니다. 이런 습관이 더 나은 내일을 만들어갈 거예요! 🌟
      `
    }

    try {
      console.log('🤖 AI 분석 요청 시작')
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `당신은 심리학과 감정 분석에 전문적인 지식을 가진 친근한 AI 상담사입니다. 사용자의 일기 작성 패턴과 감정 데이터를 분석하여 통찰력 있는 조언을 제공해주세요.

분석 원칙:
1. 데이터 기반의 객관적 분석
2. 따뜻하고 격려적인 톤
3. 구체적이고 실용적인 조언
4. 긍정적인 관점 유지
5. 개인의 성장과 발전에 초점

답변 구조:
- 감정 패턴에 대한 분석
- 작성 습관과 루틴 평가  
- 심리적 상태 해석
- 개선 방향 제시
- 격려와 응원 메시지`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`)
      }

      const data = await response.json()
      const analysis = data.choices[0]?.message?.content?.trim()

      if (!analysis) {
        throw new Error('AI 분석 응답이 비어있습니다')
      }

      console.log('✅ AI 분석 성공')
      return analysis

    } catch (error) {
      console.error('❌ AI 분석 오류:', error)
      throw error
    }
  },
} 