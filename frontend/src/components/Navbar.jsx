import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Calendar, User, LogOut, Search, Home, BarChart3 } from 'lucide-react'
import { useContext } from 'react'
import { ThemeContext } from '../App'
import { kakaoLogout, removeKakaoUser } from '../services/kakaoService'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDarkMode } = useContext(ThemeContext)
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isLoggedIn = localStorage.getItem('user') // 로그인 체크

  const handleLogout = async () => {
    try {
      // 카카오 로그아웃 처리
      const accessToken = localStorage.getItem('kakao_token')
      if (accessToken && user.loginType === 'kakao') {
        await kakaoLogout(accessToken)
      }
      
      // 로컬스토리지 정리
      removeKakaoUser()
      
      // 로그인 페이지로 이동
      navigate('/login')
    } catch (error) {
      console.error('로그아웃 오류:', error)
      // 오류가 발생해도 로컬 로그아웃은 진행
      removeKakaoUser()
      navigate('/login')
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className={`${
      isDarkMode 
        ? 'bg-gray-900/90 border-gray-700' 
        : 'bg-white/80 border-gray-200'
    } backdrop-blur-md shadow-lg border-b`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg group-hover:from-teal-600 group-hover:to-cyan-700 transition-all overflow-hidden">
              <img 
                src="/app-icon.png" 
                alt="마음일기 로고" 
                className="w-6 h-6 object-cover rounded-sm"
              />
            </div>
            <div>
              <span className={`text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent`}>
                마음일기
              </span>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                내 마음을 기록하는 공간
              </div>
            </div>
          </Link>
          
          <div className="flex items-center space-x-6">
            {/* 네비게이션 메뉴 */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  isActive('/') 
                    ? isDarkMode
                      ? 'bg-teal-900 text-teal-300 font-semibold'
                      : 'bg-teal-100 text-teal-700 font-semibold'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>홈</span>
              </Link>
              
              <Link
                to="/search"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  isActive('/search') 
                    ? isDarkMode
                      ? 'bg-cyan-900 text-cyan-300 font-semibold'
                      : 'bg-cyan-100 text-cyan-700 font-semibold'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>검색</span>
              </Link>

              <Link
                to="/stats"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  isActive('/stats') 
                    ? isDarkMode
                      ? 'bg-purple-900 text-purple-300 font-semibold'
                      : 'bg-purple-100 text-purple-700 font-semibold'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>통계</span>
              </Link>
            </div>

            {/* 사용자 메뉴 */}
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 px-3 py-2 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                } rounded-lg`}>
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt="프로필" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className={`font-medium ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {user.name || '사용자'}님
                  </span>
                  {user.loginType === 'kakao' && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      카카오
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                    isDarkMode
                      ? 'text-gray-300 hover:text-red-400 hover:bg-red-900/20'
                      : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span>로그아웃</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-2 rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all font-medium shadow-lg"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
