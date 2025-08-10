
<%
' =================================================================
' 데이터베이스 연결 설정 파일
' 보안: 웹에서 직접 접근 불가 (web.config로 차단됨)
' =================================================================

Response.CharSet = "utf-8"

' 웹에서 직접 접근 시 차단
If InStr(Request.ServerVariables("SCRIPT_NAME"), "/inc/") > 0 Then
    Response.Status = "403 Forbidden"
    Response.Write "Access Denied"
    Response.End
End If

' 데이터베이스 연결 설정
Dim DB_CONFIG
Set DB_CONFIG = Server.CreateObject("Scripting.Dictionary")

' AWS RDS 연결 정보 (암호화 활성화)
DB_CONFIG.Add "SERVER", "211.47.74.236"
DB_CONFIG.Add "PORT", "1433"
DB_CONFIG.Add "DATABASE", "dbvirex2"
DB_CONFIG.Add "USERNAME", "virex2"
DB_CONFIG.Add "PASSWORD", "wnsgk6928@"  ' TODO: 환경변수로 이동 권장
DB_CONFIG.Add "ENCRYPT", "yes"
DB_CONFIG.Add "TRUST_CERT", "true"

' 연결 문자열 생성 함수
Function GetConnectionString()
    Dim connStr
    connStr = "Provider=SQLOLEDB;" & _
              "Data Source=" & DB_CONFIG("SERVER") & "," & DB_CONFIG("PORT") & ";" & _
              "Initial Catalog=" & DB_CONFIG("DATABASE") & ";" & _
              "User ID=" & DB_CONFIG("USERNAME") & ";" & _
              "Password=" & DB_CONFIG("PASSWORD") & ";" & _
              "Trusted_Connection=No;" & _
              "Encrypt=" & DB_CONFIG("ENCRYPT") & ";" & _
              "TrustServerCertificate=" & DB_CONFIG("TRUST_CERT") & ";"
    GetConnectionString = connStr
End Function

' 안전한 데이터베이스 연결 함수
Function GetSecureConnection()
    Dim conn
    Set conn = Server.CreateObject("ADODB.Connection")
    
    On Error Resume Next
    conn.Open GetConnectionString()
    
    If Err.Number <> 0 Then
        ' 에러 로깅 (상세 정보는 로그에만 기록)
        Call LogError("DB Connection Failed: " & Err.Description)
        Set GetSecureConnection = Nothing
        Err.Clear
    Else
        Set GetSecureConnection = conn
    End If
    On Error Goto 0
End Function

' 에러 로깅 함수 (실제 구현 시 파일 또는 이벤트 로그 사용)
Sub LogError(errorMsg)
    ' TODO: 실제 로그 시스템 구현
    ' 예: 파일 로그, Windows 이벤트 로그, 또는 별도 로그 테이블
End Sub

' 연결 정리 함수
Sub CloseConnection(conn)
    If IsObject(conn) Then
        If conn.State = 1 Then
            conn.Close
        End If
        Set conn = Nothing
    End If
End Sub

%> 