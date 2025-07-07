function CalendarTest() {
  console.log('🚀 CalendarTest component is rendering!')
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '2rem',
      fontWeight: 'bold',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div>
        <h1 style={{ marginBottom: '20px' }}>🎉 새로운 CalendarTest 컴포넌트!</h1>
        <p style={{ fontSize: '1.2rem' }}>모던 UI가 성공적으로 로딩되었습니다!</p>
        <p style={{ fontSize: '1rem', marginTop: '20px' }}>
          이 메시지가 보인다면 새 컴포넌트가 정상 작동 중입니다.
        </p>
      </div>
    </div>
  )
}

export default CalendarTest
