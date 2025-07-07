import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronUp, Mail, User, Heart, Shield, Clock, Sparkles, HelpCircle } from 'lucide-react'
import { useTheme } from '../App'

const FAQ = () => {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const [openFAQ, setOpenFAQ] = useState(null)

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  const faqs = [
    {
      category: "기본 사용법",
      icon: <HelpCircle size={20} />,
      items: [
        {
          question: "마음일기는 어떤 앱인가요?",
          answer: "마음일기는 감정 기반 일기 작성 앱입니다. 매일의 감정을 기록하고, 시간이 지나면서 감정의 변화와 패턴을 확인할 수 있어요. 캘린더 형태로 일기를 관리하고, AI의 도움을 받아 더 풍부한 표현으로 일기를 작성할 수 있습니다."
        },
        {
          question: "일기는 언제 작성할 수 있나요?",
          answer: "당일 일기는 18시부터 23시 59분까지 작성할 수 있어요! 과거 날짜의 일기는 언제든지 작성 가능하지만, 미래 날짜는 작성할 수 없습니다. 18시 이전에 일기를 작성하려고 하면 카운트다운 모달이 나타나서 남은 시간을 알려드려요."
        },
        {
          question: "연속 작성일은 어떻게 계산되나요?",
          answer: "연속 작성일은 당일 18시부터 23시 59분 사이에 작성한 일기만 카운트됩니다. 과거 날짜의 일기를 작성해도 연속 작성일에는 포함되지 않아요. 매일 정해진 시간에 꾸준히 작성해야 연속 기록을 유지할 수 있습니다."
        },
        {
          question: "감정은 어떻게 선택하나요?",
          answer: "일기 작성 시 5가지 기본 감정(기쁨😊, 슬픔😢, 화남😠, 평온😌, 불안😰) 중에서 선택할 수 있어요. 선택한 감정은 캘린더에서 색상과 이모지로 표시되어 한눈에 확인할 수 있습니다."
        }
      ]
    },
    {
      category: "AI 기능",
      icon: <Sparkles size={20} />,
      items: [
        {
          question: "AI 문장 만들기는 어떻게 사용하나요?",
          answer: "키워드나 짧은 메모를 자연스러운 일기 문장으로 확장해주는 기능이에요. 예를 들어 '신라면, 18시, 맛있음'을 입력하면 '오늘 저녁 18시에 신라면을 끓여 먹었는데 정말 맛있었다'와 같은 자연스러운 문장으로 만들어줍니다."
        },
        {
          question: "AI가 정확한 답변을 하지 않아요.",
          answer: "현재 GPT-4o API를 사용하고 있지만, 가끔 예상과 다른 결과가 나올 수 있어요. 생성된 문장은 참고용으로 사용하시고, 필요에 따라 수정해서 사용하시면 됩니다. 더 구체적인 키워드를 입력하면 더 정확한 결과를 얻을 수 있어요."
        }
      ]
    },
    {
      category: "데이터 & 보안",
      icon: <Shield size={20} />,
      items: [
        {
          question: "내 일기는 안전하게 보관되나요?",
          answer: "네! 마음일기는 Firebase의 보안 시스템을 사용합니다. 모든 일기는 사용자별로 분리되어 저장되고, 본인만 접근할 수 있어요. 또한 로컬스토리지에도 백업되어 오프라인에서도 일기를 확인할 수 있습니다."
        },
        {
          question: "카카오 로그인이 필요한 이유는 무엇인가요?",
          answer: "개인의 일기를 안전하게 보호하고, 여러 기기에서 동일한 일기에 접근하기 위해 로그인이 필요해요. 카카오 로그인을 통해 복잡한 회원가입 없이 간편하게 시작할 수 있습니다."
        },
        {
          question: "일기를 삭제하면 복구할 수 있나요?",
          answer: "아니요, 삭제된 일기는 복구할 수 없어요. 삭제하기 전에 한 번 더 확인 메시지가 나타나니 신중하게 결정해주세요. 중요한 일기는 미리 백업해두시는 것을 권장합니다."
        }
      ]
    },
    {
      category: "기능",
      icon: <Heart size={20} />,
      items: [
        {
          question: "감정 통계는 어떻게 확인하나요?",
          answer: "상단 메뉴의 '통계' 버튼을 클릭하면 감정 통계 페이지로 이동할 수 있어요. 총 일기 수, 연속 작성일, 월별 감정 분포, 주간 작성 패턴 등을 확인할 수 있습니다."
        },
        {
          question: "일기 검색은 어떻게 하나요?",
          answer: "상단의 '검색' 버튼을 클릭하면 키워드나 감정별로 일기를 검색할 수 있어요. 제목이나 내용에 포함된 단어로 검색하거나, 특정 감정의 일기만 찾아볼 수 있습니다."
        },
        {
          question: "알림 기능이 있나요?",
          answer: "네! 매일 저녁 6시에 일기 작성 알림을 받을 수 있어요. 브라우저 알림 권한을 허용하신 후 상단의 '알림' 버튼을 통해 설정할 수 있습니다. 연속 작성일 달성 시에도 축하 알림을 받을 수 있어요."
        },
        {
          question: "다크모드를 사용할 수 있나요?",
          answer: "네! 상단의 해/달 아이콘을 클릭해서 라이트모드와 다크모드를 전환할 수 있어요. 시스템 설정에 따라 자동으로 적용되며, 설정은 자동으로 저장됩니다."
        }
      ]
    },
    {
      category: "문제 해결",
      icon: <Clock size={20} />,
      items: [
        {
          question: "일기가 저장되지 않아요.",
          answer: "네트워크 연결을 확인하신 후 다시 시도해보세요. 제목과 내용을 모두 입력했는지, 감정을 선택했는지 확인해주세요. 문제가 계속되면 페이지를 새로고침하거나 다른 브라우저를 사용해보세요."
        },
        {
          question: "로그인이 되지 않아요.",
          answer: "카카오 로그인에 문제가 있을 경우, 브라우저의 쿠키와 캐시를 삭제한 후 다시 시도해보세요. 팝업 차단이 설정되어 있다면 해제해주세요. 여전히 문제가 있으면 개발자에게 문의해주세요."
        },
        {
          question: "감정 통계가 표시되지 않아요.",
          answer: "감정 통계는 일기를 작성한 후에 표시됩니다. 아직 일기를 작성하지 않으셨다면 먼저 일기를 작성해보세요. 일기를 작성했는데도 통계가 나타나지 않는다면 페이지를 새로고침해주세요."
        }
      ]
    }
  ]

  const categoryColors = {
    "기본 사용법": { bg: 'rgba(52, 199, 89, 0.1)', border: 'rgba(52, 199, 89, 0.3)', text: '#34C759' },
    "AI 기능": { bg: 'rgba(255, 149, 0, 0.1)', border: 'rgba(255, 149, 0, 0.3)', text: '#FF9500' },
    "데이터 & 보안": { bg: 'rgba(0, 122, 255, 0.1)', border: 'rgba(0, 122, 255, 0.3)', text: '#007AFF' },
    "기능": { bg: 'rgba(255, 59, 48, 0.1)', border: 'rgba(255, 59, 48, 0.3)', text: '#FF3B30' },
    "문제 해결": { bg: 'rgba(175, 82, 222, 0.1)', border: 'rgba(175, 82, 222, 0.3)', text: '#AF52DE' }
  }

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
            <span>홈으로</span>
          </button>
          
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 'bold',
              color: isDarkMode ? '#FFFFFF' : '#17A2B8'
            }}>
              자주 묻는 질문
            </h1>
            <p style={{ margin: 0, color: isDarkMode ? '#8E8E93' : '#666', fontSize: '14px' }}>
              마음일기 사용법과 문의사항
            </p>
          </div>
          
          <div style={{ width: '76px' }}></div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* 개발자 정보 */}
        <div style={{
          background: isDarkMode 
            ? 'rgba(44, 44, 46, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: isDarkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
        }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #17A2B8 0%, #138496 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 8px 24px rgba(23, 162, 184, 0.3)'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
              }}>
                <img 
                  src="/app-icon.png" 
                  alt="마음일기" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
            </div>
            <h2 style={{
              margin: '0 0 8px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: isDarkMode ? '#FFFFFF' : '#333'
            }}>
              마음일기
            </h2>
            <p style={{
              margin: '0 0 20px 0',
              fontSize: '16px',
              color: isDarkMode ? '#CCCCCC' : '#666',
              lineHeight: '1.6'
            }}>
              감정을 기록하고 마음을 돌아보는 일기 서비스
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            <div style={{
              background: isDarkMode ? 'rgba(58, 58, 60, 0.5)' : 'rgba(248, 250, 252, 0.8)',
              borderRadius: '16px',
              padding: '20px',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #34C759 0%, #30A14E 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={20} color="white" />
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: isDarkMode ? '#FFFFFF' : '#333' }}>
                  개발자
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: '16px', color: isDarkMode ? '#CCCCCC' : '#666', lineHeight: '1.5' }}>
                <strong>김재형</strong><br />
                한림대학교 정보과학대학
              </p>
            </div>

            <div style={{
              background: isDarkMode ? 'rgba(58, 58, 60, 0.5)' : 'rgba(248, 250, 252, 0.8)',
              borderRadius: '16px',
              padding: '20px',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #007AFF 0%, #0056CC 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Mail size={20} color="white" />
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: isDarkMode ? '#FFFFFF' : '#333' }}>
                  문의
                </h3>
              </div>
              <a 
                href="mailto:kjhk3082@naver.com"
                style={{ 
                  fontSize: '16px', 
                  color: '#17A2B8', 
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.textDecoration = 'underline'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.textDecoration = 'none'
                }}
              >
                kjhk3082@naver.com
              </a>
            </div>
          </div>
        </div>

        {/* FAQ 섹션들 */}
        {faqs.map((category, categoryIndex) => (
          <div key={categoryIndex} style={{
            background: isDarkMode 
              ? 'rgba(44, 44, 46, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '25px',
            marginBottom: '20px',
            boxShadow: isDarkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
          }}>
            {/* 카테고리 헤더 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
              padding: '16px 20px',
              background: categoryColors[category.category].bg,
              border: `1px solid ${categoryColors[category.category].border}`,
              borderRadius: '16px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: `${categoryColors[category.category].text}20`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: categoryColors[category.category].text
              }}>
                {category.icon}
              </div>
              <h2 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '700',
                color: categoryColors[category.category].text
              }}>
                {category.category}
              </h2>
            </div>

            {/* FAQ 아이템들 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {category.items.map((faq, faqIndex) => {
                const globalIndex = categoryIndex * 100 + faqIndex
                const isOpen = openFAQ === globalIndex
                
                return (
                  <div key={faqIndex} style={{
                    background: isDarkMode ? 'rgba(58, 58, 60, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                    borderRadius: '16px',
                    border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}>
                    <button
                      onClick={() => toggleFAQ(globalIndex)}
                      style={{
                        width: '100%',
                        padding: '20px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: isDarkMode ? '#FFFFFF' : '#333',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = isDarkMode 
                          ? 'rgba(72, 72, 74, 0.3)' 
                          : 'rgba(233, 236, 239, 0.5)'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <span style={{ flex: 1, lineHeight: '1.5' }}>{faq.question}</span>
                      <div style={{
                        color: '#17A2B8',
                        transition: 'transform 0.3s ease',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}>
                        <ChevronDown size={20} />
                      </div>
                    </button>
                    
                    {isOpen && (
                      <div style={{
                        padding: '0 20px 20px 20px',
                        borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                      }}>
                        <p style={{
                          margin: '16px 0 0 0',
                          fontSize: '15px',
                          lineHeight: '1.6',
                          color: isDarkMode ? '#CCCCCC' : '#666'
                        }}>
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* 추가 문의 안내 */}
        <div style={{
          background: isDarkMode 
            ? 'rgba(44, 44, 46, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '30px',
          textAlign: 'center',
          boxShadow: isDarkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '20px',
            fontWeight: '700',
            color: isDarkMode ? '#FFFFFF' : '#333'
          }}>
            궁금한 점이 더 있으신가요?
          </h3>
          <p style={{
            margin: '0 0 20px 0',
            fontSize: '16px',
            color: isDarkMode ? '#CCCCCC' : '#666',
            lineHeight: '1.6'
          }}>
            FAQ에서 답을 찾지 못하셨다면 언제든 문의해주세요.<br />
            더 나은 서비스를 만들기 위해 소중한 의견을 기다리고 있습니다.
          </p>
          <a 
            href="mailto:kjhk3082@naver.com"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #17A2B8 0%, #138496 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
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
            <Mail size={20} />
            개발자에게 문의하기
          </a>
        </div>
      </div>
    </div>
  )
}

export default FAQ 