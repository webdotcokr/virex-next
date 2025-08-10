<%
' --------------------------------------------------------
' Function Name : PageList(주소, 현재페이지, 한페이지최대게시물, 최대페이징수, 총레코드수)
' Description : 페이징 처리
' --------------------------------------------------------
Function PageList(url, page, pagesize, cutpage, totalrecord)
	Dim maxpage, startpage, countpage, endpage
	If totalrecord Mod pagesize > 0 Then
		maxpage = Int(totalrecord/pagesize)+1
	Else
		maxpage = Int(totalrecord/pagesize)
	End If

	If page =< cutpage Then
		startpage = 1
		Response.Write "<li><a href='#;'>&lt;</a></li> "
	Else
		If page Mod cutpage = 0 Then
			startpage = Int((page-1)/cutpage)*cutpage+1
		Else
			startpage =Int(page/cutpage)*cutpage+1
		End If
		Response.Write "<li><a href='" & url & "&amp;page=1' title='첫 페이지'>&lt;&lt;</a></li> <li><a href='" & url & "&amp;page=" & startpage-cutpage & "' title='이전 페이지'>&lt;</a></li> "
	End If

	countpage = startpage - 1
	endpage = startpage + cutpage - 1

	Do While endpage <> countpage And countpage < maxpage
		countpage = countpage + 1
		If countpage=page Then
			Response.Write "<li class='on'><a href='#;'>" & countpage & "</a></li> "
		Else
			Response.Write "<li><a href='" & url & "&amp;page=" & countpage & "'>" & countpage & "</a></li> "
		End If
	Loop

	If countpage < maxpage Then
		Response.Write "<li><a href='" & url & "&amp;page=" & startpage+cutpage & "' title='다음 페이지'>&gt;</a></li> <li><a href='" & url & "&amp;page=" & maxpage & "' title='마지막 페이지'>&gt;&gt;</a></li> "
	Else
		Response.Write "<li><a href='#;'>&gt;</a></li>"
	End If
End Function


' --------------------------------------------------------
' Function Name : InsertText
' Description : db삽입 문자열 치환 (인젝션대응)
' --------------------------------------------------------
Function InsertText(get_String)

	get_String = Replace(get_String, "'", "''")
'	get_String = Replace(get_String, "&", "&amp;" 

	get_String = ReplaceUL(get_String, "--, #" , " " )
	get_String = ReplaceUL(get_String, "' or 1=1--" , " " )
	get_String = ReplaceUL(get_String, "on error resume" , " " )
	get_String = ReplaceUL(get_String, "-1 or" , " " )
	get_String = ReplaceUL(get_String, "-1' or" , " " )
	get_String = ReplaceUL(get_String, "unexisting" , " " )
	get_String = ReplaceUL(get_String, "win.ini" , " " )	
'	get_String = ReplaceUL(get_String, "select", "x-select")
'	get_String = ReplaceUL(get_String, "and", "x-and")
'	get_String = ReplaceUL(get_String, "or", "x-or")
'	get_String = ReplaceUL(get_String, "union", "x-union")
'	get_String = ReplaceUL(get_String, "declare", "x-declare")
'	get_String = ReplaceUL(get_String, "cast", "x-cast")
	get_String = ReplaceUL(get_String, "to_char", "x-to_char")
'	get_String = ReplaceUL(get_String, "having", "x-having")
'	get_String = ReplaceUL(get_String, "group by", "x-group by")
'	get_String = ReplaceUL(get_String, "from", "x-from")
'	get_String = ReplaceUL(get_String, "where", "x-where")
	get_String = ReplaceUL(get_String, "xp_cmdshell", "x-xp_cmdshell")
'	get_String = ReplaceUL(get_String, "update", "x-update")
'	get_String = ReplaceUL(get_String, "into", "x-into")
'	get_String = ReplaceUL(get_String, "insert", "x-insert")

'	If Not get_HTML then
'	  get_String = Replace(get_String, "<", "&lt;" )
'	  get_String = Replace(get_String, ">", "&gt;" )
'	End If

	get_String = Trim(get_String)

	InsertText = get_String

End Function


' --------------------------------------------------------
' Function Name : XssFilter
' Description : XSS 필터링
' --------------------------------------------------------
Function XssFilter(get_String)

	get_String = ReplaceUL(get_String, "<xmp", "<x-xmp")
	get_String = ReplaceUL(get_String, "javascript", "x-javascript")
	'get_String = ReplaceUL(get_String, "script", "x-script")
	'get_String = ReplaceUL(get_String, "iframe", "x-iframe")	'유튜브 영상을 위해 제외
	'get_String = ReplaceUL(get_String, "document", "x-document")
	get_String = ReplaceUL(get_String, "vbscript", "x-vbscript")
	get_String = ReplaceUL(get_String, "applet", "x-applet")
	'get_String = ReplaceUL(get_String, "embed", "x-embed")
	'get_String = ReplaceUL(get_String, "object", "x-object")
	'get_String = ReplaceUL(get_String, "frame", "x-frame")
	'get_String = ReplaceUL(get_String, "frameset", "x-frameset")
	'get_String = ReplaceUL(get_String, "layer", "x-layer")
	get_String = ReplaceUL(get_String, "bgsound", "x-bgsound")
	'get_String = ReplaceUL(get_String, "alert", "x-alert")

	get_String = ReplaceUL(get_String, "onblur", "x-onblur")
	get_String = ReplaceUL(get_String, "onchange", "x-onchange")
	get_String = ReplaceUL(get_String, "onclick", "x-onclick")
	get_String = ReplaceUL(get_String, "ondblclick", "x-ondblclick")
	get_String = ReplaceUL(get_String, "onerror", "x-onerror")
	get_String = ReplaceUL(get_String, "onfocus", "x-onfocus")
	get_String = ReplaceUL(get_String, "onload", "x-onload")
	get_String = ReplaceUL(get_String, "onmouse", "x-onmouse")
	get_String = ReplaceUL(get_String, "onscroll", "x-onscroll")
	get_String = ReplaceUL(get_String, "onsubmit", "x-onsubmit")
	get_String = ReplaceUL(get_String, "onunload", "x-onunload")

	get_String = Replace(get_String, "<", "&lt;" )
	get_String = Replace(get_String, ">", "&gt;" )
	get_String = Replace(get_String, """", "&#34;" )
	get_String = Replace(get_String, "'", "&#39;" )
	get_String = Replace(get_String, "%", "&#37;" )
	get_String = Replace(get_String, ";", "&#59;" )
	get_String = Replace(get_String, "(", "&#40;" )
	get_String = Replace(get_String, ")", "&#41;" )
	get_String = Replace(get_String, "&", "&#38;" )
	get_String = Replace(get_String, "+", "&#43;" )

	XssFilter = get_String

End Function


' --------------------------------------------------------
' Function Name : ReplaceUL
' Description : 대소문자 구분없이 문자 치환
' --------------------------------------------------------
Function ReplaceUL(ByRef allText, ByVal findText, ByVal replaceText)
     Dim regObj
     Set regObj = New RegExp
     regObj.Pattern = findText        '패턴 설정
     regObj.IgnoreCase = True      '대소문자 구분 여부
     regObj.Global = True              '전체 문서에서 검색
     ReplaceUL = regObj.Replace(allText, replaceText)
End Function


' --------------------------------------------------------
' Function Name : URLDecode
' Description : URLDecode
' --------------------------------------------------------
Function URLDecode(sConvert)
	Dim aSplit
	Dim sOutput
	Dim I
	If IsNull(sConvert) Then
		URLDecode = ""
		Exit Function
	End If

	' convert all pluses to spaces
	sOutput = REPLACE(sConvert, "+", " ")

	' next convert %hexdigits to the character
	aSplit = Split(sOutput, "%")

	If IsArray(aSplit) Then
		sOutput = aSplit(0)
		For I = 0 to UBound(aSplit) - 1
			sOutput = sOutput & _
			Chr("&H" & Left(aSplit(i + 1), 2)) &_
			Right(aSplit(i + 1), Len(aSplit(i + 1)) - 2)
		Next
	End If

	URLDecode = sOutput
End Function


' --------------------------------------------------------
' Function Name : UploadFileChk
' Description : 업로드 가능한 파일 확장자 체크 (블랙리스트)
' --------------------------------------------------------
Function UploadFileChk(filename)
	If filename<>"" Then
		'확장자 블랙리스트
		If Right(LCase(filename),3)="exe" Or _
		Right(LCase(filename),3)="bin" Or _
		Right(LCase(filename),5)="class" Or _
		Right(LCase(filename),5)="class" Or _
		Right(LCase(filename),3)="bat" Or _
		Right(LCase(filename),3)="com" Or _
		Right(LCase(filename),3)="asp" Or _
		Right(LCase(filename),3)="asa" Or _
		Right(LCase(filename),4)="aspx" Or _
		Right(LCase(filename),4)="html" Or _
		Right(LCase(filename),3)="htm" Or _
		Right(LCase(filename),3)="php" Or _
		Right(LCase(filename),3)="war" Or _
		Right(LCase(filename),3)="cdx" Or _
		Right(LCase(filename),3)="cer" Or _
		Right(LCase(filename),3)="der" Or _
		InStr(filename, ";")>0  Then
			UploadFileChk=False
		Else
			UploadFileChk=True
		End If
	Else
		UploadFileChk=True
	End If
End Function


' --------------------------------------------------------
' Function Name : TagText
' Description : 출력 문자열 치환
' --------------------------------------------------------
Function TagText(str)
	dim text
	If IsNull(str) Or str = "" Then
		TagText = ""
		Exit Function
	End If
	text = Replace(str, "&", "&amp;")
	text = Replace(text, "<", "&lt;")
	text = Replace(text, ">", "&gt;")
	text = Replace(text, Chr(13), "<br>")
	text = Replace(text, """", "&#34;")
	TagText = text
End Function


' --------------------------------------------------------
' Function Name : ImgResize(이미지경로, 파일이름, 고정사이즈)
' Description : 이미지 리사이징 (라이트박스)
' --------------------------------------------------------
Function ImgResize(Path, FileName, Width)

	Set imgFSO = Server.CreateObject("Scripting.FileSystemObject")
	If (FileName<>"" And (LCase(Right(FileName,3))="jpg" Or LCase(Right(FileName,3))="gif")) And imgFSO.FileExists(Server.mappath(Path) & "\" & FileName)=true Then
		Set p = LoadPicture(Server.mappath(Path) & "\" & FileName)
		If CLng(CDbl(p.width)*24/635)>Width then
			Response.Write "<a href='" & Path & FileName & "' data-lightbox='ntb-lb-set'><img src='" & Path & FileName & "' style='width:" & Width& "px; border:0' /></a><br />"
		Else
			Response.Write "<a href='" & Path & FileName & "' data-lightbox='ntb-lb-set'><img src='" & Path & FileName & "' style='border:0' /></a><br />"
		End If
	ElseIf FileName<>"" And LCase(Right(FileName,3))="png" Then
		Response.Write "<a href='" & Path & FileName & "' data-lightbox='ntb-lb-set'><img src='" & Path & FileName & "' style='border:0' /></a><br />"
	End If
	Set imgFSO = nothing

End Function

' --------------------------------------------------------
' Function Name : ImgCheck(파일이름)
' Description : 이미지 체크
' --------------------------------------------------------
Function ImgCheck(FileName)

	If FileName<>"" And _
	LCase(Right(FileName,3))="jpg" Or _
	LCase(Right(FileName,4))="jpeg" Or _
	LCase(Right(FileName,3))="gif" Or _
	LCase(Right(FileName,3))="png" Or _
	LCase(Right(FileName,3))="bmp" Or _
	LCase(Right(FileName,3))="jpeg"	Then
		ImgCheck = True
	Else
		ImgCheck = False
	End If

End Function


' --------------------------------------------------------
' Function Name : setPriceComma
' Description : 3자리마다 콤마
' --------------------------------------------------------
Function setPriceComma(price)
	If price<>"" Then
		price=FormatNumber(price,0)
	End If
	setPriceComma=price
End Function


' --------------------------------------------------------
' Function Name : fillChar(원본값,채울값,방향,자릿수)
' Description : 필요한 자리수만큼 특정문자로 채우기
' --------------------------------------------------------
Function fillChar(strValue, FChar, Direction, strLength)
	Dim tmpStr, i
		For i=1 to strLength
			tmpStr = tmpStr & FChar
		Next
		If Direction="L" or Direction="" Then ' 왼쪽편
			fillChar = Right(tmpStr & strValue, strLength)
		Else
			fillChar = Left(strValue & tmpStr, strLength)
		End If
End Function



' --------------------------------------------------------
' Function Name : disableChar(값)
' Description : 사용불가 문자 체크 (ID, PW등)
' --------------------------------------------------------
Function disableChar(strText)
	If InStr(strText, "'")>0 Or InStr(strText, "/")>0 Or InStr(strText, ";")>0 Or InStr(strText, "?")>0 Or InStr(strText, "*")>0 Then
		disableChar=False
	Else
		disableChar=True
	End If
End Function



' --------------------------------------------------------
' Function Name : strCount(대상문자열,찾고자하는문자)
' Description : 특정문자열 갯수
' --------------------------------------------------------
Function strCount(strText, strText2)
	strCount = UBound(Split(strText,strText2))+1
End Function


' --------------------------------------------------------
' Function Name : strTagDel(대상문자열)
' Description : HTML 태그 삭제
' --------------------------------------------------------
Function strTagDel(Str)
	If Not Isnull(Str) Then
		Set Regex = New Regexp
		Regex.Pattern = "<[\/\!]*?[^<>]*?>"
		Regex.Ignorecase = True 'false(대소문자구분), True(구분안함, 기본)
		Regex.Global = True 'true(전체문자열), False(처음것만, 기본)
		strTagDel = Regex.Replace(Str, "")
		Set Regex = Nothing
		strTagDel = Replace(strTagDel, "&nbsp;", " ")
	Else
		strTagDel = Str
	End If
End Function


' --------------------------------------------------------
' Function Name : strWeekday(날짜)
' Description : 요일문자열반환
' --------------------------------------------------------
Function strWeekday(n_date)
	Select Case Weekday(n_date)
		Case 1
			strWeekday = "일"
		Case 2
			strWeekday = "월"
		Case 3
			strWeekday = "화"
		Case 4
			strWeekday = "수"
		Case 5
			strWeekday = "목"
		Case 6
			strWeekday = "금"
		Case 7
			strWeekday = "토"
	End Select
End Function



' --------------------------------------------------------
' Function Name : strDescription(대상문자열)
' Description : 메타태그 Description 사용 치환
' --------------------------------------------------------
Function strDescription(Str)
	If Not Isnull(Str) Then
		tmpStr = Replace(Str, Chr(13) & Chr(10), "")
		tmpStr = Replace(tmpStr, "&nbsp;", "")
		tmpStr = Replace(tmpStr, "&quot;", "")
		Set Regex = New Regexp
		Regex.Pattern = "<[\/\!]*?[^<>]*?>"
		Regex.Ignorecase = True 'false(대소문자구분), True(구분안함, 기본)
		Regex.Global = True 'true(전체문자열), False(처음것만, 기본)
		tmpStr = Left(Regex.Replace(tmpStr, ""), 150)
		tmpStr = Trim(tmpStr)
		strDescription = tmpStr
		Set Regex = Nothing
	Else
		strDescription = Str
	End If
End Function


' --------------------------------------------------------
' Function Name : eMailCDOSend(내용, 제목, 보내는사람, 받는사람, 첨부경로, 첨부파일명)
' Description : 메일전송
' --------------------------------------------------------
Function eMailCDOSend(MailTag, MailTitle, Sender, Receiver, FilePath, FileName)

	Set RsA = Server.Createobject("ADODB.Recordset")
	Sql = "SELECT * FROM tbl_site_config "
	RsA.Open Sql, Dbcon, 1
	If RsA.EOF=False Then
		smtpserver = RsA("smtpserver")
		smtpserverport = RsA("smtpserverport")
		smtpauthenticate = RsA("smtpauthenticate")
		smtpusessl = RsA("smtpusessl")
		sendusername = RsA("sendusername")
		sendpassword = RsA("sendpassword")
	End If
	RsA.Close
	Set RsA = Nothing

	Dim eMailObject, eMailConfig
	Set eMailObject = Server.CreateObject("CDO.Message")
	Set eMailConfig	=	Server.CreateObject("CDO.Configuration")
	Dim SchemaPath : SchemaPath = "http://schemas.microsoft.com/cdo/configuration/"
	eMailConfig.Fields.Item(SchemaPath & "sendusing") = 2
	If smtpserver<>"" Then eMailConfig.Fields.Item(SchemaPath & "smtpserver") = smtpserver
	If smtpserverport<>"" Then eMailConfig.Fields.Item(SchemaPath & "smtpserverport") = smtpserverport
	If smtpauthenticate="1" Then eMailConfig.Fields.Item(SchemaPath & "smtpauthenticate") = True
	If smtpusessl="1" Then eMailConfig.Fields.Item(SchemaPath & "smtpusessl") = 1
	If sendusername<>"" Then eMailConfig.Fields.Item(SchemaPath & "sendusername") = sendusername
	If sendpassword<>"" Then eMailConfig.Fields.Item(SchemaPath & "sendpassword") = sendpassword
'			.Item (SchemaPath & "sendusing") = 2
'           .Item (SchemaPath & "smtpserver") = "localhost"
'			.Item (SchemaPath & "smtpserverport") = "25"
'			.Item(SchemaPath & "smtpauthenticate") = 1
	eMailConfig.Fields.Update
	eMailObject.Configuration = eMailConfig
	Set eMailConfig = Nothing

		With eMailObject
			.From = Sender
			.To = Receiver
			If FileName<>"" Then .AddAttachment(Server.MapPath(FilePath) &"\"& FileName)
			.Subject = MailTitle
			.HTMLBody = MailTag
			'.HTMLBodyPart.Charset = "ks_c_5601-1987"
			.BodyPart.Charset = "utf-8"
			.HTMLBodyPart.Charset = "utf-8"
			.HTMLBodyPart.ContentTransferEncoding = "quoted-printable"
			.Send
		End With
	Set eMailObject = Nothing

End Function



' --------------------------------------------------------
' Function Name : SpamChk(문자열)
' Description : 자동등록방지 체크
' --------------------------------------------------------
Function SpamChk(strVal)
	if IsEmpty(Session("ASPCAPTCHA")) or Trim(Session("ASPCAPTCHA")) = "" then
		lblResult = "This test has expired."
		lblColor = "red"
		rtn = False
	else
		TestValue = strVal
		'//Uppercase fix for turkish charset//
		TestValue = Replace(TestValue, "i", "I")
		TestValue = Replace(TestValue, "İ", "I")
		TestValue = Replace(TestValue, "ı", "I")
		'////////////////////
		TestValue = UCase(TestValue)

		if StrComp(TestValue, Trim(Session("ASPCAPTCHA")), 1) = 0 then
			lblResult = "CAPTCHA PASSED"
			lblColor = "green"
			rtn = True
		else
			lblResult = "CAPTCHA FAILED"
			lblColor = "red"
			rtn = False
		End If
		'//IMPORTANT: You must remove session value for security after the CAPTCHA test//
		Session("ASPCAPTCHA") = vbNullString
		Session.Contents.Remove("ASPCAPTCHA")
		'////////////////////
	End If
	SpamChk=rtn
End Function


' --------------------------------------------------------
' Function Name : BbsSkinSelect(스킨명)
' Description : 게시판 스킨 선택
' --------------------------------------------------------
Function BbsSkinSelect(p_mode)
	Dim strRtn
	strRtn=""
	If p_mode="" Then p_mode="normal"
	Set FSO = CreateObject("Scripting.FileSystemObject")
	Set FolderList = FSO.GetFolder(Server.Mappath("/site/bbs/skin/"))

	strRtn = strRtn & "<select name='k_mode' class='AXSelect'>" & Chr(13) & Chr(10)

	For Each FolderItem in FolderList.SubFolders
		strRtn = strRtn & "<option value='" & FolderItem.Name & "' "
		If FolderItem.Name=p_mode Then strRtn = strRtn & "selected"
		strRtn = strRtn & ">" & FolderItem.Name & "</option>" & Chr(13) & Chr(10)
	Next

	strRtn = strRtn & "</select>" & Chr(13) & Chr(10)

	Set FolderList = Nothing
	Set FSO = Nothing
	bbsSkinSelect = strRtn
End Function


' --------------------------------------------------------
' Function Name : BbsSkinMobSelect(스킨명)
' Description : 게시판 모바일 스킨 선택
' --------------------------------------------------------
Function BbsSkinMobSelect(p_mode)
	Dim strRtn
	strRtn=""
	If p_mode="" Then p_mode="normal"
	Set FSO = CreateObject("Scripting.FileSystemObject")
	Set FolderList = FSO.GetFolder(Server.Mappath("/site/bbs/skin_m/"))

	strRtn = strRtn & "<select name='k_mode_mobile' class='AXSelect'>" & Chr(13) & Chr(10)

	For Each FolderItem in FolderList.SubFolders
		strRtn = strRtn & "<option value='" & FolderItem.Name & "' "
		If FolderItem.Name=p_mode Then strRtn = strRtn & "selected"
		strRtn = strRtn & ">" & FolderItem.Name & "</option>" & Chr(13) & Chr(10)
	Next

	strRtn = strRtn & "</select>" & Chr(13) & Chr(10)

	Set FolderList = Nothing
	Set FSO = Nothing
	BbsSkinMobSelect = strRtn
End Function


' --------------------------------------------------------
' Function Name : BbsSkinAdminSelect(스킨명)
' Description : 게시판 관리자 스킨 선택
' --------------------------------------------------------
Function BbsSkinAdminSelect(p_mode)
	Dim strRtn
	strRtn=""
	If p_mode="" Then p_mode="normal"
	Set FSO = CreateObject("Scripting.FileSystemObject")
	Set FolderList = FSO.GetFolder(Server.Mappath("/site/manage/sub-bbs/skin/"))

	strRtn = strRtn & "<select name='k_mode_admin' class='AXSelect'>" & Chr(13) & Chr(10)
	strRtn = strRtn & "<option value=''>[미설정]</option>" & Chr(13) & Chr(10)

	For Each FolderItem in FolderList.SubFolders
		strRtn = strRtn & "<option value='" & FolderItem.Name & "' "
		If FolderItem.Name=p_mode Then strRtn = strRtn & "selected"
		strRtn = strRtn & ">" & FolderItem.Name & "</option>" & Chr(13) & Chr(10)
	Next

	strRtn = strRtn & "</select>" & Chr(13) & Chr(10)

	Set FolderList = Nothing
	Set FSO = Nothing
	BbsSkinAdminSelect = strRtn
End Function


' --------------------------------------------------------
' Function Name : IdDuplChk(아이디)
' Description : 아이디 중복체크 함수
' --------------------------------------------------------
Function IdDuplChk(c_id)

	Set RsIdc = Server.Createobject("ADODB.Recordset")
	Sql = "SELECT COUNT(*) FROM tbl_member WHERE m_id='" & c_id & "'"
	RsIdc.Open Sql, DbCon, 1

	If RsIdc(0)>0 Then
		IdDuplChk=False
	Else
		IdDuplChk=True
	End If

	RsIdc.Close
	Set RsIdc = Nothing

End Function


' --------------------------------------------------------
' Sub Name : GetFolderList(경로)
' Description : 디렉토리명 출력
' --------------------------------------------------------
Sub GetFolderList(strPath)
	Dim FSO, Folder, Sub_folder
	Set FSO = Server.CreateObject("Scripting.FileSystemObject")
	Set Folder = FSO.GetFolder(strPath)
	Set Sub_folder = Folder.Subfolders
	For Each folder In Sub_folder
		if folder.Name <> "" then
			GetFolderList(strPath&"/"&folder.Name)
			Response.Write "<hr><font color=blue>"
			Response.Write "/" & folder.name & "/<br>"
			Response.Write "</font>"
			Call GetFileList(strPath & "/" & folder.name)
		End If
	Next
	Set Sub_folder = Nothing
	Set Folder = Nothing
	Set FSO = Nothing
End Sub


' --------------------------------------------------------
' Sub Name : GetFileList(경로)
' Description : 파일명 출력
' --------------------------------------------------------
Sub GetFileList(strPath)
	Dim FSO, Folder, Files, FilePath
	Set FSO = Server.CreateObject("Scripting.FileSystemObject")
	Set Folder = FSO.GetFolder(strPath)
	'하위 폴더명을 붙이면서 Folder개채를 생성한다.
	Set Files = Folder.Files
	'Folder개채로 File개채를 생성한다.
	For Each file In Files
		FilePath = "/" & File.Name
		Response.write FilePath & "<br>"
	Next
	Set Files = Nothing
	Set Folder = Nothing
	Set FSO = Nothing
End Sub


' --------------------------------------------------------
' Function Name : BbsLatest(게시판bid, 최대게시물수, 경로)
' Description : 최근 게시물 표시
' --------------------------------------------------------
Function BbsLatest(bid, mr, linkurl)

	Set RsBl = Server.Createobject("ADODB.Recordset")
	Sql = "SELECT TOP " & mr & " * FROM tbl_board_data "
	Sql = Sql & " WHERE board_idx='" & bid & "' AND lock='0' "
	Sql = Sql & " ORDER BY idx DESC"
	RsBl.Open Sql, Dbcon, 1
	num = 1
	strrtn = ""
	Do Until RsBl.EOF
		i_idx = RsBl("idx")
		i_title = RsBl("title")
		i_content = Left(strTagDel(RsBl("content")), 200)
		i_file1 = RsBl("file1")
		i_regdate = Left(RsBl("regdate"), 10)
		strrtn = strrtn & "<li><a href='" & linkurl & "?mode=view&bid=" & bid & "&idx=" & i_idx & "'>" & i_title & "</a><span>" & i_regdate & "</span></li>" & Chr(13) & Chr(10)
		num=num+1
		RsBl.Movenext
	Loop
	RsBl.Close
	Set RsBl = Nothing

	BbsLatest = strrtn

End Function


' --------------------------------------------------------
' Sub Name : MovePost(게시판bid, 게시물idx, 정렬num)
' Description : 게시물 순서 변경
' --------------------------------------------------------
Sub MovePost(bid, b_idx, b_num)

	If b_notice=False And W_LEVEL<10 Then		'최상단(공지)글 제외, 관리자만 변경가능
		Response.write "<div style=""width:70px; float:left; text-align:center"">"
		If b_num>c_rmin Then Response.Write "<button type=""button"" class=""AXButtonSmall"" onclick='location.href=""/site/manage/sub-bbs/lev2-ok.asp?mode=down&bid=" & bid & "&idx=" & b_idx & "&num=" & b_num & """'>▼</button> "
		If b_num<c_rmax Then Response.Write "<button type=""button"" class=""AXButtonSmall"" onclick='location.href=""/site/manage/sub-bbs/lev2-ok.asp?mode=up&bid=" & bid & "&idx=" & b_idx & "&num=" & b_num & """'>▲</button> "
		Response.write "</div>"
	End If

End Sub


' --------------------------------------------------------
' Function Name : CateSelect(네임명, 설정값)
' Description : 카테고리셀렉트
' --------------------------------------------------------
Function CateSelect(param_name, param_setvalue)

	strSelect = "<select name=""" & param_name & """ class=""AXSelect"">"
	strSelect = strSelect & "<option value="""">---분류---</option>"

	'대분류
	Set RsCS1 = Server.Createobject("ADODB.Recordset")
	Sql = "SELECT * FROM tbl_cate WHERE c_depth='1' AND c_hide='0' ORDER BY c_lev ASC"
	RsCS1.Open Sql, Dbcon, 1
	num1=1

	c1_rmax = RsCS1.RecordCount
	Do Until RsCS1.EOF
		c1_lang = RsCS1("c_lang")
		c1_code = RsCS1("c_code")
		c1_name = RsCS1("c_name")
		c1_lev = RsCS1("c_lev")

		strSelect = strSelect & "<option value=""" & c1_code & """ "
		If c1_code=param_setvalue Then strSelect = strSelect & "selected"
		strSelect = strSelect & " style=""background-color:#eef3fe"">"
		If InStr(sc_lang, "|")>0 Then strSelect = strSelect & "[" & c1_lang & "] "
		strSelect = strSelect & c1_name & "</option>"

		'중분류
		Set RsCS2 = Server.Createobject("ADODB.Recordset")
		Sql = "SELECT * FROM tbl_cate WHERE c_depth='2' AND c_hide='0' AND c_code LIKE '" & c1_code & "%' ORDER BY c_lev ASC"
		RsCS2.Open Sql, Dbcon, 1
		If RsCS2.EOf=False Then c2_rmax = RsCS2.RecordCount
		num2=1
		Do Until RsCS2.EOF
			c2_code = RsCS2("c_code")
			c2_name = RsCS2("c_name")
			c2_lev = RsCS2("c_lev")

			strSelect = strSelect & "<option value=""" & c2_code & """ "
			If c2_code=param_setvalue Then strSelect = strSelect & "selected"
			strSelect = strSelect & " style=""background-color:#fdfdee"">&nbsp;&nbsp;&nbsp;&nbsp;" & c2_name & "</option>"

			'소분류
			Set RsCS3 = Server.Createobject("ADODB.Recordset")
			Sql = "SELECT * FROM tbl_cate WHERE c_depth='3' AND c_hide='0' AND c_code LIKE '" & c2_code & "%' ORDER BY c_lev ASC"
			RsCS3.Open Sql, Dbcon, 1
			If RsCS3.EOf=False Then c3_rmax = RsCS3.RecordCount
			num3=1
			Do Until RsCS3.EOF
				c3_code = RsCS3("c_code")
				c3_name = RsCS3("c_name")
				c3_lev = RsCS3("c_lev")

				strSelect = strSelect & "<option value=""" & c3_code & """ "
				If c3_code=param_setvalue Then strSelect = strSelect & "selected"
				strSelect = strSelect & ">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" & c3_name & "</option>"

				num3=num3+1
				RsCS3.Movenext
			Loop
			Set RsCS3 = Nothing
			num2=num2+1
			RsCS2.Movenext
		Loop
		Set RsCS2 = Nothing
		num1=num1+1
		RsCS1.Movenext
	Loop
	Set RsCS1 = Nothing

	strSelect = strSelect & "</select>"

	CateSelect = strSelect


End Function

' --------------------------------------------------------
' Function Name : PageCateSelect(네임명, 설정값)
' Description : 카테고리셀렉트
' --------------------------------------------------------
Function PageCateSelect(param_name, param_setvalue)

	strSelect = "<select name=""" & param_name & """ class=""AXSelect"">"
	strSelect = strSelect & "<option value="""">---분류---</option>"

	'대분류
	Set RsCS1 = Server.Createobject("ADODB.Recordset")
	Sql = "SELECT * FROM tbl_page_cate WHERE c_depth='1' AND c_hide='0' ORDER BY c_lev ASC"
	RsCS1.Open Sql, Dbcon, 1
	num1=1

	c1_rmax = RsCS1.RecordCount
	Do Until RsCS1.EOF
		c1_lang = RsCS1("c_lang")
		c1_code = RsCS1("c_code")
		c1_name = RsCS1("c_name")
		c1_lev = RsCS1("c_lev")

		strSelect = strSelect & "<option value=""" & c1_code & """ "
		If c1_code=param_setvalue Then strSelect = strSelect & "selected"
		strSelect = strSelect & " style=""background-color:#eef3fe"">"
		If InStr(sc_lang, "|")>0 Then strSelect = strSelect & "[" & c1_lang & "] "
		strSelect = strSelect & c1_name & "</option>"

		'중분류
		Set RsCS2 = Server.Createobject("ADODB.Recordset")
		Sql = "SELECT * FROM tbl_page_cate WHERE c_depth='2' AND c_hide='0' AND c_code LIKE '" & c1_code & "%' ORDER BY c_lev ASC"
		RsCS2.Open Sql, Dbcon, 1
		If RsCS2.EOf=False Then c2_rmax = RsCS2.RecordCount
		num2=1
		Do Until RsCS2.EOF
			c2_code = RsCS2("c_code")
			c2_name = RsCS2("c_name")
			c2_lev = RsCS2("c_lev")

			strSelect = strSelect & "<option value=""" & c2_code & """ "
			If c2_code=param_setvalue Then strSelect = strSelect & "selected"
			strSelect = strSelect & " style=""background-color:#fdfdee"">&nbsp;&nbsp;&nbsp;&nbsp;" & c2_name & "</option>"

			'소분류
			Set RsCS3 = Server.Createobject("ADODB.Recordset")
			Sql = "SELECT * FROM tbl_page_cate WHERE c_depth='3' AND c_hide='0' AND c_code LIKE '" & c2_code & "%' ORDER BY c_lev ASC"
			RsCS3.Open Sql, Dbcon, 1
			If RsCS3.EOf=False Then c3_rmax = RsCS3.RecordCount
			num3=1
			Do Until RsCS3.EOF
				c3_code = RsCS3("c_code")
				c3_name = RsCS3("c_name")
				c3_lev = RsCS3("c_lev")

				strSelect = strSelect & "<option value=""" & c3_code & """ "
				If c3_code=param_setvalue Then strSelect = strSelect & "selected"
				strSelect = strSelect & ">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" & c3_name & "</option>"

				num3=num3+1
				RsCS3.Movenext
			Loop
			Set RsCS3 = Nothing
			num2=num2+1
			RsCS2.Movenext
		Loop
		Set RsCS2 = Nothing
		num1=num1+1
		RsCS1.Movenext
	Loop
	Set RsCS1 = Nothing

	strSelect = strSelect & "</select>"

	PageCateSelect = strSelect

End Function


' --------------------------------------------------------
' Function Name : MailSkin(메일내용)
' Description : 메일폼 컨텐츠 스킨
' --------------------------------------------------------
Function MailSkin(strContent)

	strRtn = "<table width=""600"">"
	strRtn = strRtn & "<tr>"
	strRtn = strRtn & "<td><img src=""http://" & Request.ServerVariables("SERVER_NAME") & "/site/mail/images/title.jpg""></td>"
	strRtn = strRtn & "</tr>"
	strRtn = strRtn & "<tr>"
	strRtn = strRtn & "<td style=""font-size:13px;font-family:NanumGothic;color:#666;padding:15px 10px;min-height:550px"">"
	strRtn = strRtn & strContent
	strRtn = strRtn & "<br /><br /></td>"
	strRtn = strRtn & "</tr>"
	strRtn = strRtn & "<tr>"
	strRtn = strRtn & "<td style=""font-size:11px;color:#555;line-height:20px;text-align:center;background:#e4e4e4;padding:10px 0;"">"
	strRtn = strRtn & "본 메일은 발신 전용으로 회신되지 않습니다. 이메일 수신을 원하지 않을 경우 수신거부 하시기 바랍니다."
	strRtn = strRtn & "<br/>Copyright " & sc_name & ". All rights reserved."
	strRtn = strRtn & "</td>"
	strRtn = strRtn & "</tr>"
	strRtn = strRtn & "</table>"

	MailSkin = strRtn

End Function


' --------------------------------------------------------
' Function Name : BannerSingle(배너)
' Description : 단일배너
' --------------------------------------------------------
Function BannerSingle(strSort)

	Set RsSb = Server.CreateObject("ADODB.Recordset")
	Sql = "SELECT * FROM tbl_banner WHERE b_sort='" & strSort & "' "
	RsSb.Open Sql, Dbcon, 1
	If RsSb.EOF=False Then
		b_url = RsSb("b_url")
		b_url_target = RsSb("b_url_target")
		b_file = RsSb("b_file")
		b_addtext1 = RsSb("b_addtext1")
		b_addtext2 = RsSb("b_addtext2")
		b_addtext3 = RsSb("b_addtext3")
		b_addtext4 = RsSb("b_addtext4")
		b_addtext5 = RsSb("b_addtext5")
		strRtn = "<a href=""" & b_url & """"
		If b_url_target<>"unusable" And b_url_target<>"" Then strRtn = strRtn & " target='" & b_url_target & "'"
		strRtn = strRtn & "><img src=""/upload/banner/" & b_file & """ alt=""" & b_file & """ /></a>"
	End If
	RsSb.Close
	Set RsSb = Nothing

	BannerSingle = strRtn

End Function


' --------------------------------------------------------
' Function Name : BannerList(배너, 시작태그, 끝태그)
' Description : 리스트배너
' --------------------------------------------------------
Function BannerList(strSort, sTag, eTag)

	Set RsLi = Server.CreateObject("ADODB.Recordset")
	Sql = "SELECT * FROM tbl_banner WHERE b_sort='" & strSort & "' ORDER BY p_lev DESC"
	RsLi.Open Sql, Dbcon, 1
	Do Until RsLi.EOF
		b_url = RsLi("b_url")
		b_url_target = RsLi("b_url_target")
		b_file = RsLi("b_file")
		b_addtext1 = RsLi("b_addtext1")
		b_addtext2 = RsLi("b_addtext2")
		b_addtext3 = RsLi("b_addtext3")
		b_addtext4 = RsLi("b_addtext4")
		b_addtext5 = RsLi("b_addtext5")
		strRtn = strRtn & sTag & "<a href=""" & b_url & """"
		If b_url_target<>"unusable" And b_url_target<>"" Then strRtn = strRtn & " target='" & b_url_target & "'"
		strRtn = strRtn & "><img src=""/upload/banner/" & b_file & """ alt=""" & b_file & """ /></a>" & eTag & Chr(13) & Chr(10)
		RsLi.Movenext
	Loop
	RsLi.Close
	Set RsLi = Nothing

	BannerList = strRtn

End Function


' --------------------------------------------------------
' Sub Name : SetJoinCouponDownload(m_id)
' Description : 회원가입시 자동 쿠폰 다운로드
' --------------------------------------------------------
Sub SetJoinCouponDownload(m_id)

	Set Rs = Server.Createobject("ADODB.Recordset")
	Sql = "SELECT *, newid() cd_code FROM tbl_coupon WHERE c_dl_type='join' AND c_enddate>getdate()"
	Rs.Open Sql, Dbcon, 1
	If Rs.EOF=False Then
		Do Until Rs.EOF
			c_idx=Rs("idx")
			c_name=Rs("c_name")
			c_enddate=Rs("c_enddate")
			c_dc_type=Rs("c_dc_type")
			c_dc_amount=Rs("c_dc_amount")

			'쿠폰 고유번호
			cd_code=Rs("cd_code")
			cd_code=Replace(cd_code, "{", "")
			cd_code=Replace(cd_code, "}", "")
			cd_code=Replace(cd_code, "-", "")
			cd_code=Left(cd_code, 20)

			Sql1 = "INSERT INTO tbl_coupon_dl("
			Sql1 = Sql1 & "c_idx, "
			Sql1 = Sql1 & "m_id, "
			Sql1 = Sql1 & "cd_code, "
			Sql1 = Sql1 & "cd_name, "
			Sql1 = Sql1 & "cd_enddate, "
			Sql1 = Sql1 & "cd_dc_type, "
			Sql1 = Sql1 & "cd_dc_amount) VALUES("
			Sql1 = Sql1 & "N'" & c_idx & "', "
			Sql1 = Sql1 & "N'" & m_id & "', "
			Sql1 = Sql1 & "N'" & cd_code & "', "
			Sql1 = Sql1 & "N'" & c_name & "', "
			Sql1 = Sql1 & "N'" & c_enddate & "', "
			Sql1 = Sql1 & "N'" & c_dc_type & "', "
			Sql1 = Sql1 & "N'" & c_dc_amount & "')"
			Dbcon.Execute Sql1

			Rs.Movenext
		Loop
	End If
	Rs.Close
	Set Rs = Nothing

End Sub


' --------------------------------------------------------
' Sub Name : SetDirCouponDownload(회원아이디, 쿠폰idx)
' Description : 직접 쿠폰 다운로드
' --------------------------------------------------------
Sub SetDirCouponDownload(m_id, idx)

	'중복 발급 체크
	Set Rs = Server.Createobject("ADODB.Recordset")
	Sql = "SELECT * FROM tbl_coupon_dl WHERE c_idx='" & idx & "' AND m_id='" & m_id & "' "
	Rs.Open Sql, Dbcon, 1
	If Rs.EOF=False Then
		Response.Write "<script>alert('이미 발급받은 쿠폰입니다.'); history.back();</script>"
		Response.End
	End If
	Rs.Close

	'쿠폰 정보 취득
	Sql = "SELECT *, newid() cd_code FROM tbl_coupon WHERE c_dl_type='dir' AND idx='" & idx & "' "
	Rs.Open Sql, Dbcon, 1
	If Rs.EOF=False Then
		c_name=Rs("c_name")
		c_enddate=Rs("c_enddate")
		c_dc_type=Rs("c_dc_type")
		c_dc_amount=Rs("c_dc_amount")

		'쿠폰 고유번호
		cd_code=Rs("cd_code")
		cd_code=Replace(cd_code, "{", "")
		cd_code=Replace(cd_code, "}", "")
		cd_code=Replace(cd_code, "-", "")
		cd_code=Left(cd_code, 20)

		Sql1 = "INSERT INTO tbl_coupon_dl("
		Sql1 = Sql1 & "c_idx, "
		Sql1 = Sql1 & "m_id, "
		Sql1 = Sql1 & "cd_code, "
		Sql1 = Sql1 & "cd_name, "
		Sql1 = Sql1 & "cd_enddate, "
		Sql1 = Sql1 & "cd_dc_type, "
		Sql1 = Sql1 & "cd_dc_amount) VALUES("
		Sql1 = Sql1 & "N'" & idx & "', "
		Sql1 = Sql1 & "N'" & m_id & "', "
		Sql1 = Sql1 & "N'" & cd_code & "', "
		Sql1 = Sql1 & "N'" & c_name & "', "
		Sql1 = Sql1 & "N'" & c_enddate & "', "
		Sql1 = Sql1 & "N'" & c_dc_type & "', "
		Sql1 = Sql1 & "N'" & c_dc_amount & "')"
		Dbcon.Execute Sql1

	End If
	Rs.Close
	Set Rs = Nothing

End Sub


' --------------------------------------------------------
' Sub Name : SetPoint(아이디, 부호, 금액, 비고)
' Description : 회원 포인트 적립/차감
' --------------------------------------------------------
Sub SetPoint(sp_m_id, sp_pm, sp_point, sp_bigo)

	Sql = "INSERT INTO tbl_member_point("
	Sql = Sql & "m_id, "
	Sql = Sql & "mp_point, "
	Sql = Sql & "mp_pm, "
	Sql = Sql & "mp_bigo) VALUES('"
	Sql = Sql & sp_m_id & "', '"
	Sql = Sql & sp_point & "', '"
	Sql = Sql & sp_pm & "', '"
	Sql = Sql & sp_bigo & "')"
	Dbcon.Execute Sql

	Call SetPointSync(sp_m_id)

End Sub


' --------------------------------------------------------
' Sub Name : SetPointSync(아이디)
' Description : 회원 포인트 동기화
' --------------------------------------------------------
Sub SetPointSync(sp_m_id)

	Set RsPoint = Server.CreateObject("ADODB.Recordset")
	Sql = "SELECT "
	Sql = Sql & " (SELECT ISNULL(SUM(mp_point), 0) FROM tbl_member_point WHERE m_id='" & sp_m_id & "' AND mp_pm='+')-"
	Sql = Sql & " (SELECT ISNULL(SUM(mp_point), 0) FROM tbl_member_point WHERE m_id='" & sp_m_id & "' AND mp_pm='-') AS m_point"
	RsPoint.Open Sql, Dbcon, 1
	If RsPoint.EOF=False Then
		m_point = RsPoint("m_point")
	End If
	RsPoint.Close
	Set RsPoint = Nothing

	Sql = "UPDATE tbl_member SET m_point='" & m_point & "' WHERE m_id='" & sp_m_id & "' "
	Dbcon.Execute Sql

End Sub


' --------------------------------------------------------
' Sub Name : SetPointProv(주문코드)
' Description : 주문포인트 지급
' --------------------------------------------------------
Sub SetPointProv(sp_o_code)

	Set RsPoint = Server.CreateObject("ADODB.Recordset")
	Sql = "SELECT m_id, ISNULL(SUM(p_point_a*p_qty), 0) m_point FROM tbl_mall_cart WHERE o_code='" & sp_o_code & "' GROUP BY m_id "
	RsPoint.Open Sql, Dbcon, 1
	If RsPoint.EOF=False Then
		m_id = RsPoint("m_id")
		m_point = RsPoint("m_point")
	End If
	RsPoint.Close
	Set RsPoint = Nothing

	'지급할 포인트가 존재하는 경우
	If m_point>0 Then
		Call SetPoint(m_id, "+", m_point, "구매에 의한 포인트 적립 (주문코드 : " & sp_o_code & ")")
		Sql = "UPDATE tbl_mall_cart SET p_point_a='0' WHERE o_code='" & sp_o_code & "' "
		Dbcon.Execute Sql
	End If

End Sub



' --------------------------------------------------------
' Function Name : SnsMemberIcon(m_id)
' Description : SNS가입회원 아이콘 표시
' --------------------------------------------------------
Function SnsMemberIcon(m_id)
	If InStr(m_id, "_nv_") Then
		SnsMemberIcon = "<img src='/site/member/snsicon/naver.png' style='width:20px'> "
	ElseIf InStr(m_id, "_kk_") Then
		SnsMemberIcon = "<img src='/site/member/snsicon/kakaotalk.png' style='width:20px'> "
	ElseIf InStr(m_id, "_fb_") Then
		SnsMemberIcon = "<img src='/site/member/snsicon/facebook.png' style='width:20px'> "
	ElseIf InStr(m_id, "_gg_") Then
		SnsMemberIcon = "<img src='/site/member/snsicon/googleplus.png' style='width:20px'> "
	Else
		SnsMemberIcon = ""
	End If
End Function


' --------------------------------------------------------
' Function Name : Addr2Coord(addr)
' Description : 주소->좌표변환
' --------------------------------------------------------
Function Addr2Coord(addr)

	targetURL = "https://dapi.kakao.com/v2/local/search/address.xml?query=" & Server.URLEncode(addr)
	Set objXmlHttp = server.CreateObject("Msxml2.ServerXMLHTTP.3.0")
	objXmlHttp.open "get", targetURL, false
	objXmlHttp.setRequestHeader "Authorization", "KakaoAK e8e759ce49d8c7dc75a473e7258c7ef2"
	objXmlHttp.setRequestHeader "Content-Type", "application/x-www-form-urlencoded"
	objXmlHttp.send
	strResponseText = objXmlHttp.responseText
	Set objXmlHttp = Nothing

	Set objMsXmlDom = Server.CreateObject("microsoft.XMLDOM")
	objMsXmlDom.async = false
	objMsXmlDom.loadXML(strResponseText)

	'추출 (getElementsByTagName("xml엘리먼트명"))
	If Trim(objMsXmlDom.getElementsByTagName("total_count").Item(0).Text)<>"0" Then
		referResult1 = "" & Trim(objMsXmlDom.getElementsByTagName("x").Item(0).Text)
		referResult2 = "" & Trim(objMsXmlDom.getElementsByTagName("y").Item(0).Text)
	End If

	Set objMsXmlDom = Nothing

	Addr2Coord = referResult1 & "," & referResult2

End Function


' --------------------------------------------------------
' Sub Name : CopyFile(원본, 대상)
' Description : 파일복사
' --------------------------------------------------------
Sub CopyFile(source, destination)
	Dim fso, f
	Set fso = CreateObject("Scripting.FileSystemObject")
	Set f = fso.GetFile(source)
	f.Copy destination
End Sub


' --------------------------------------------------------
' Function Name : NameAste(문자열)
' Description : 이름 2번째 문자 비공개 처리
' --------------------------------------------------------
Function NameAste(strName)

	NameAste = Left(strName, 1) & "*" & Mid(strName, 3)

End Function


' --------------------------------------------------------
' Function Name : FormatDateCustom(날짜)
' Description : 날짜형식커스텀
' --------------------------------------------------------
Function FormatDateCustom(strdate)
	strdate = Left(strdate, 10)
	strdate_yyyy = Year(strdate)
	strdate_mm = Month(strdate)
	strdate_dd = Day(strdate)
	Select Case strdate_mm
		Case 1
			strdate_mm_eng = "Jan"
		Case 2
			strdate_mm_eng = "Feb"
		Case 3
			strdate_mm_eng = "Mar"
		Case 4
			strdate_mm_eng = "Apr"
		Case 5
			strdate_mm_eng = "May"
		Case 6
			strdate_mm_eng = "Jun"
		Case 7
			strdate_mm_eng = "Jul"
		Case 8
			strdate_mm_eng = "Aug"
		Case 9
			strdate_mm_eng = "Sep"
		Case 10
			strdate_mm_eng = "Oct"
		Case 11
			strdate_mm_eng = "Nov"
		Case 12
			strdate_mm_eng = "Dec"
	End Select
	FormatDateCustom = strdate_mm_eng & "-" & strdate_dd & "-" & strdate_yyyy
End Function


' --------------------------------------------------------
' Function Name : SetDday(날짜)
' Description : 디데이
' --------------------------------------------------------
Function SetDday(sdate)
	If Datediff("d", sdate, Date())<0 Then
		SetDday="D" & Datediff("d", b_addtext3, Date())
	Else
		SetDday="D-Day"
	End If
End Function


' --------------------------------------------------------
' Function Name : StrRand(길이)
' Description : 랜덤 문자열 생성
' --------------------------------------------------------
Function StrRand(strlen)
'	str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
'	Randomize
'	For i = 1 To strlen
'		num = CInt((36 - 1 + 1) * Rnd + 1)
'		serialCode = serialCode + Mid(str, num, 1)
'	Next	

	Set RsA = Server.Createobject("ADODB.Recordset")
	Sql = "SELECT newid() "
	RsA.Open Sql, Dbcon, 1
		serialCode = RsA(0)
		serialCode = Replace(serialCode, "-", "")
		serialCode = Replace(serialCode, "{", "")
		serialCode = Replace(serialCode, "}", "")
		serialCode = Left(serialCode, strlen)
	RsA.Close
	Set RsA = Nothing

	StrRand = serialCode
End Function


' --------------------------------------------------------
' Function Name : EmailCheck(문자열)
' Description : 이메일 유효성 체크
' --------------------------------------------------------
Function EmailCheck(stremail)
	emailpattern = "^[\w-\.]{1,}\@([\da-zA-Z-]{1,}\.){1,}[\da-zA-Z-]{2,3}$"
	if stremail = "" then
		EmailCheck = false
	else
		dim regEx, Matches
		Set regEx = New RegExp
		regEx.Pattern = emailpattern
		regEx.IgnoreCase = True
		regEx.Global = True
		Set Matches = regEx.Execute(stremail)

		if 0 < Matches.count then
			EmailCheck = true
		Else
			EmailCheck = false
		end if
	end if
End Function


' --------------------------------------------------------
' Sub Name : MessageSend(auth_key, mem_id, mem_name, mem_phone, M1, M2, M3, M4, M5, M6, M7, M8, M9, M10, alert_message, move_url)
' Description : TAS 자동메시징 연동
' --------------------------------------------------------
Sub MessageSend(mail_code, auth_key, mem_id, mem_name, mem_phone, M1, M2, M3, M4, M5, M6, M7, M8, M9, M10, alert_message, move_url)

	Const USER_ID = "wcp2cgca21jle65szeuj"		'필수입력
'	Const USER_ID = "vctzwyheeb2itfum9urt"		'필수입력

	If mem_id="" Then mem_id="[받는사람ID]"
	If mem_name="" Then mem_name="[받는사람이름]"
	If M1="" Then M1="[고객정보]"
	If M2="" Then M2="[고객정보]"
	If M3="" Then M3="[고객정보]"
	If M4="" Then M4="[고객정보]"
	If M5="" Then M5="[고객정보]"
	If M6="" Then M6="[고객정보]"
	If M7="" Then M7="[고객정보]"
	If M8="" Then M8="[고객정보]"
	If M9="" Then M9="[고객정보]"
	If M10="" Then M10="[고객정보]"

	Response.Write "<form name=""postmanForm"" method=""post"" action=""https://mkt.tason.com/open/auto_message_sender_utf8.jsp"" target=""POSTMAN"">" & Chr(13) & Chr(10)
	Response.Write "<input type=""hidden"" name=""enc_type"" value=""UTF-8"" /> <!-- 사용하는 인코딩 타입(UTF-8 or EUC-KR) -->" & Chr(13) & Chr(10)
	Response.Write "<input type=""hidden"" name=""mail_code"" value=""" & mail_code & """ />" & Chr(13) & Chr(10)
	Response.Write "<input type=""hidden"" name=""user_id"" value=""" & USER_ID & """ />" & Chr(13) & Chr(10)
	Response.Write "<input type=""hidden"" name=""auth_key"" value=""" & auth_key & """ /> <!-- 인증키: 자동부여 -->" & Chr(13) & Chr(10)
	Response.Write "<input type=""hidden"" name=""mem_id"" value=""" & mem_id & """/> <!-- 받는 사람 ID: 유니크한 유일 값 -->" & Chr(13) & Chr(10)
	Response.Write "<input type=""hidden"" name=""mem_name"" value=""" & mem_name & """/> <!-- 받는 사람 이름: 실제 받는 사람 이름 -->" & Chr(13) & Chr(10)
	Response.Write "<input type=""hidden"" name=""mem_phone"" value=""" & mem_phone & """/> <!-- 받을 사람 전화번호( ""-"" 제외) -->" & Chr(13) & Chr(10)
	Response.Write "<input type=""hidden"" name=""M1"" value=""" & M1 & """> <!-- 매핑값 : #{고객정보1} -->" & Chr(13) & Chr(10)
	Response.Write "<input type=""hidden"" name=""M2"" value=""" & M2 & """> <!-- 매핑값 : #{고객정보2} -->" & Chr(13) & Chr(10)
	Response.Write "<input type=""hidden"" name=""M3"" value=""" & M3 & """> <!-- 매핑값 : #{고객정보3} -->" & Chr(13) & Chr(10)
	Response.Write "<input type=""hidden"" name=""M4"" value=""" & M4 & """> <!-- 매핑값 : #{고객정보4} -->" & Chr(13) & Chr(10)
	Response.Write "<input type=""hidden"" name=""M5"" value=""" & M5 & """> <!-- 매핑값 : #{고객정보5} -->" & Chr(13) & Chr(10)
	Response.Write "<input type=""hidden"" name=""M6"" value=""" & M6 & """> <!-- 매핑값 : #{고객정보6} -->" & Chr(13) & Chr(10)
	Response.Write "<input type=""hidden"" name=""M7"" value=""" & M7 & """> <!-- 매핑값 : #{고객정보7} -->" & Chr(13) & Chr(10)
	Response.Write "<input type=""hidden"" name=""M8"" value=""" & M8 & """> <!-- 매핑값 : #{고객정보8} -->" & Chr(13) & Chr(10)
	Response.Write "<input type=""hidden"" name=""M9"" value=""" & M9 & """> <!-- 매핑값 : #{고객정보9} -->" & Chr(13) & Chr(10)
	Response.Write "<input type=""hidden"" name=""M10"" value=""" & M10 & """> <!-- 매핑값 : #{고객정보10} -->" & Chr(13) & Chr(10)
	Response.Write "</form>" & Chr(13) & Chr(10)
	Response.Write "<iframe name=""POSTMAN"" width=""0"" height=""0"" frameborder=""0""></iframe>" & Chr(13) & Chr(10)
	Response.Write "<script type=""text/javascript"">" & Chr(13) & Chr(10)
	Response.Write "document.postmanForm.submit();" & Chr(13) & Chr(10)
	Response.Write "setTimeout(function() { " & Chr(13) & Chr(10)
	If alert_message<>"" Then Response.Write "alert(""" & alert_message & """);" & Chr(13) & Chr(10)
	Response.Write "location.href=""" & move_url & """;" & Chr(13) & Chr(10)
	Response.Write "}, 500);" & Chr(13) & Chr(10)
	Response.Write "</script>" & Chr(13) & Chr(10)

End Sub


' --------------------------------------------------------
' Function Name : DeliveryTrace(택배사, 송장번호)
' Description : 배송추적
' --------------------------------------------------------
Function DeliveryTrace(o_deli, o_deli_code)

	If o_deli="CJ대한통운" Then
		strRtn = "https://www.cjlogistics.com/ko/tool/parcel/tracking?gnbInvcNo=" & o_deli_code
	ElseIf o_deli="로젠택배" Then
		strRtn = "https://www.ilogen.com/web/personal/trace/" & o_deli_code
	ElseIf o_deli="대신택배" Then
		strRtn = "http://home.daesinlogistics.co.kr/daesin/jsp/d_freight_chase/d_general_process2.jsp?" & o_deli_code
	ElseIf o_deli="우체국" Then
		strRtn = "https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?sid1=" & o_deli_code
	ElseIf o_deli="한진택배" Then
		strRtn = "http://www.hanjin.co.kr/Delivery_html/inquiry/result_waybill.jsp?wbl_num=" & o_deli_code
	ElseIf o_deli="경동택배" Then
		strRtn = "https://kdexp.com/basicNewDelivery.kd?barcode=" & o_deli_code
	ElseIf o_deli="이노지스택배" Then
		strRtn = "http://www.innogis.net/trace02.asp?invoice=" & o_deli_code
	ElseIf o_deli="KGB택배" Then
		strRtn = "http://www.kgbls.co.kr//sub5/trace.asp?f_slipno=" & o_deli_code
	ElseIf o_deli="KG로지스" Then
		strRtn = " http://www.kglogis.co.kr/delivery/delivery_result.jsp?item_no=" & o_deli_code
	ElseIf o_deli="롯데택배" Then
		strRtn = " https://www.lotteglogis.com/open/tracking?invno=" & o_deli_code
	Else
		strRtn = ""
	End If

	DeliveryTrace = strRtn

End Function


' --------------------------------------------------------
' Function Name : ProdListType1()
' Description : 리스트 제품 표시 (메인)
' --------------------------------------------------------
Function ProdListType1(p_idx, p_image1, p_cate, p_name, p_memo, p_price, p_o_price)

	r = "<div class=""swiper-slide"">"
	r = r & "<a href=""?mode=view&idx=" & p_idx & """>"
	r = r & "<div class=""img_box"">"
	If p_image1<>"" Then
		r = r & "<img src=""/upload/prod/thumb_l/" & p_image1 & """ />"
	Else
		r = r & "<img src=""//placehold.it/270X270/?text=No image"" />"
	End If
	If p_o_price<>"0" Then
		p_dc = Fix(100-((CDbl(p_price)/CDbl(p_o_price))*100))
		r = r & "<p class=""sale"">" & p_dc & "%<br />OFF</p>"
	End If
	r = r & "</div>"
	r = r & "<div class=""txt_box"">"
	r = r & "<p><font>[" & p_cate & "]</font> " & p_name & "</p>"
	r = r & "<span>" & p_memo & "</span>"
	r = r & "<div class=""price"">"
	If p_o_price<>"0" Then r = r & "<span>" & FormatNumber(p_o_price, 0) & " 원</span>"
	If p_price="0" Then
		r = r & "<p>문의<font></font></p>"
	Else
		r = r & "<p>" & FormatNumber(p_price, 0) & "<font>원</font></p>"
	End If
	r = r & "</div>"
	r = r & "</div>"
	r = r & "</a>"
	r = r & "</div>"

	ProdListType1 = r

End Function


' --------------------------------------------------------
' Function Name : ProdListType2()
' Description : 리스트 제품 표시 (서브)
' --------------------------------------------------------
Function ProdListType2(p_idx, p_image1, p_cate, p_name, p_memo, p_price, p_o_price)

	r = "<li>"
	r = r & "<a href=""?mode=view&idx=" & p_idx & "&" & pLink & """>"
	r = r & "<div class=""img_box"">"
	If p_image1<>"" Then
		r = r & "<img src=""/upload/prod/thumb_l/" & p_image1 & """ />"
	Else
		r = r & "<img src=""//placehold.it/270X270/?text=No image"" />"
	End If
	If p_o_price<>"0" Then
		p_dc = Fix(100-((CDbl(p_price)/CDbl(p_o_price))*100))
		r = r & "<p class=""sale"">" & p_dc & "%<br />OFF</p>"
	End If
	r = r & "</div>"
	r = r & "<div class=""txt_box"">"
	r = r & "<h5><font>[" & p_cate & "]</font> " & p_name & "</h5>"
	r = r & "<p>" & p_memo & "</p>"
	r = r & "<div class=""price"">"
	If p_o_price<>"0" Then r = r & "<span>" & FormatNumber(p_o_price, 0) & " <font>원</font></span>"
	If p_price="0" Then
		r = r & "<p>문의<font></font></p>"
	Else
		r = r & "<p>" & FormatNumber(p_price, 0) & "<font>원</font></p>"
	End If
	r = r & "</div>"
	r = r & "</div>"
	r = r & "</a>"
	r = r & "</li>"

	ProdListType2 = r

End Function
%>