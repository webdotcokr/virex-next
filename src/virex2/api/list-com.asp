<%

' Format regdate to YYYY-MM-DD
Function FormatRegDateYMD(regdate)
    Dim regDay, regMonth, regYear
    regdate = Split(regdate)(0)
    regDay = Day(regdate)
    regMonth = Month(regdate)
    regYear = Year(regdate)
    FormatRegDateYMD = regYear & "-" & Right("0" & regMonth, 2) & "-" & Right("0" & regDay, 2)
End Function

%>