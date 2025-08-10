<!--#include virtual="/inc/dbconn.asp" -->
<!--#include virtual="/inc/json.asp" -->
<!--#include virtual="/inc/function.asp" -->
<%
' Allow CORS for same origin
Response.AddHeader "Access-Control-Allow-Origin", "*"
Response.AddHeader "Access-Control-Allow-Methods", "GET"
Response.ContentType = "application/json"

Function ApplyBetweenFilter(columnName, lowerBound, upperBound)
    Dim colAsVarChar, dbLower, dbUpper, fractionCheck
    colAsVarChar = "CAST(" & columnName & " AS VARCHAR(255))"

    dbLower = " (CASE " & _
              " WHEN " & colAsVarChar & " LIKE '%~%' AND CHARINDEX('~', " & colAsVarChar & ") > 0 THEN TRY_CAST(SUBSTRING(" & colAsVarChar & ", 1, CHARINDEX('~', " & colAsVarChar & ") - 1) AS FLOAT) " & _
              " WHEN " & colAsVarChar & " LIKE '%-%' AND CHARINDEX('-', " & colAsVarChar & ") > 0 THEN TRY_CAST(SUBSTRING(" & colAsVarChar & ", 1, CHARINDEX('-', " & colAsVarChar & ") - 1) AS FLOAT) " & _
              " ELSE TRY_CAST(" & columnName & " AS FLOAT) " & _
              " END) "
    
    dbUpper = " (CASE " & _
              " WHEN " & colAsVarChar & " LIKE '%~%' AND CHARINDEX('~', " & colAsVarChar & ") > 0 THEN TRY_CAST(SUBSTRING(" & colAsVarChar & ", CHARINDEX('~', " & colAsVarChar & ") + 1, LEN(" & colAsVarChar & ")) AS FLOAT) " & _
              " WHEN " & colAsVarChar & " LIKE '%-%' AND CHARINDEX('-', " & colAsVarChar & ") > 0 THEN TRY_CAST(SUBSTRING(" & colAsVarChar & ", CHARINDEX('-', " & colAsVarChar & ") + 1, LEN(" & colAsVarChar & ")) AS FLOAT) " & _
              " ELSE TRY_CAST(" & columnName & " AS FLOAT) " & _
              " END) "
    
    fractionCheck = " OR ( " & _
                    "    " & colAsVarChar & " LIKE '%/%' AND CHARINDEX('/', " & colAsVarChar & ") > 0 AND ISNUMERIC(SUBSTRING(" & colAsVarChar & ", CHARINDEX('/', " & colAsVarChar & ") + 1, LEN(" & colAsVarChar & "))) = 1 AND TRY_CAST(SUBSTRING(" & colAsVarChar & ", CHARINDEX('/', " & colAsVarChar & ") + 1, LEN(" & colAsVarChar & ")) AS FLOAT) <> 0 " & _
                    "    AND (TRY_CAST(SUBSTRING(" & colAsVarChar & ", 1, CHARINDEX('/', " & colAsVarChar & ") - 1) AS FLOAT) / " & _
                    "    TRY_CAST(SUBSTRING(" & colAsVarChar & ", CHARINDEX('/', " & colAsVarChar & ") + 1, LEN(" & colAsVarChar & ")) AS FLOAT)) BETWEEN " & lowerBound & " AND " & upperBound & _
                    "  ) "

    ApplyBetweenFilter = " ((" & dbUpper & " >= " & lowerBound & " AND " & dbLower & " <= " & upperBound & ") " & fractionCheck & ") "
End Function

Function ApplyArithmeticOperatorFilter(columnName, operator, value)
    Dim colAsVarChar, dbLower, dbUpper, comparisonLogic, fractionCheck
    colAsVarChar = "CAST(" & columnName & " AS VARCHAR(255))"

    dbLower = " (CASE " & _
              " WHEN " & colAsVarChar & " LIKE '%~%' AND CHARINDEX('~', " & colAsVarChar & ") > 0 THEN TRY_CAST(SUBSTRING(" & colAsVarChar & ", 1, CHARINDEX('~', " & colAsVarChar & ") - 1) AS FLOAT) " & _
              " WHEN " & colAsVarChar & " LIKE '%-%' AND CHARINDEX('-', " & colAsVarChar & ") > 0 THEN TRY_CAST(SUBSTRING(" & colAsVarChar & ", 1, CHARINDEX('-', " & colAsVarChar & ") - 1) AS FLOAT) " & _
              " ELSE TRY_CAST(" & columnName & " AS FLOAT) " & _
              " END) "
    
    dbUpper = " (CASE " & _
              " WHEN " & colAsVarChar & " LIKE '%~%' AND CHARINDEX('~', " & colAsVarChar & ") > 0 THEN TRY_CAST(SUBSTRING(" & colAsVarChar & ", CHARINDEX('~', " & colAsVarChar & ") + 1, LEN(" & colAsVarChar & ")) AS FLOAT) " & _
              " WHEN " & colAsVarChar & " LIKE '%-%' AND CHARINDEX('-', " & colAsVarChar & ") > 0 THEN TRY_CAST(SUBSTRING(" & colAsVarChar & ", CHARINDEX('-', " & colAsVarChar & ") + 1, LEN(" & colAsVarChar & ")) AS FLOAT) " & _
              " ELSE TRY_CAST(" & columnName & " AS FLOAT) " & _
              " END) "

    Select Case operator
        Case ">", ">="
            ' Compare against the upper bound of the DB range
            comparisonLogic = dbUpper & " " & operator & " " & value
        Case "<", "<="
            ' Compare against the lower bound of the DB range
            comparisonLogic = dbLower & " " & operator & " " & value
        Case Else
            ' Fallback for unsupported operators like '=' for ranges, should be handled by ApplyBetweenFilter
            comparisonLogic = " 1=0 "
    End Select
    
    fractionCheck = " OR ( " & _
                    "    " & colAsVarChar & " LIKE '%/%' AND CHARINDEX('/', " & colAsVarChar & ") > 0 AND ISNUMERIC(SUBSTRING(" & colAsVarChar & ", CHARINDEX('/', " & colAsVarChar & ") + 1, LEN(" & colAsVarChar & "))) = 1 AND TRY_CAST(SUBSTRING(" & colAsVarChar & ", CHARINDEX('/', " & colAsVarChar & ") + 1, LEN(" & colAsVarChar & ")) AS FLOAT) <> 0 AND (TRY_CAST(SUBSTRING(" & colAsVarChar & ", 1, CHARINDEX('/', " & colAsVarChar & ") - 1) AS FLOAT) / TRY_CAST(SUBSTRING(" & colAsVarChar & ", CHARINDEX('/', " & colAsVarChar & ") + 1, LEN(" & colAsVarChar & ")) AS FLOAT)) " & operator & " " & value & " " & _
                    "  ) "

    ApplyArithmeticOperatorFilter = " ( " & comparisonLogic & fractionCheck & " ) "
End Function

Function ExtractOperatorAndValue(inputStr)
    Dim operator
    Dim value
    
    ' Check for two-character operators first
    If Left(inputStr, 2) = "<=" Or Left(inputStr, 2) = ">=" Then
        operator = Left(inputStr, 2)
        value = Mid(inputStr, 3)
    ' Check for single-character operators
    ElseIf Left(inputStr, 1) = "<" Or Left(inputStr, 1) = ">" Then
        operator = Left(inputStr, 1)
        value = Mid(inputStr, 2)
    Else
        ' Default case - assume equals or handle differently
        operator = "="
        value = inputStr
    End If
    
    ' Trim any leading spaces from the value
    value = Trim(value)
    
    ' Return as array [operator, value]
    Dim result(2)
    result(0) = operator
    result(1) = value
    
    ExtractOperatorAndValue = result
End Function

Function IsPCIeFilter(fieldName, filterValue)
    ' Check if this is a PCIe filter that needs special handling
    IsPCIeFilter = False
    
    If fieldName = "p_item_text2" Then
        If filterValue = "PCIe2.0" OR filterValue = "PCIe3.0" OR filterValue = "PCI" Then
            IsPCIeFilter = True
        End If
    End If
End Function

Function IsUSBFilter(fieldName, filterValue)
    ' Check if this is a USB filter that needs special handling
    IsUSBFilter = False
    
    If fieldName = "p_item_text5" Then
        If filterValue = "USB3.0" OR filterValue = "USB3.1" OR filterValue = "USB3.2" Then
            IsUSBFilter = True
        End If
    End If
End Function

Function GetPCIePattern(filterValue)
    ' Convert PCIe filter value to SQL pattern for flexible matching
    Dim pattern
    
    Select Case filterValue
        Case "PCIe3.0"
            ' Match PCIe3.0, PCIe3.0 x4, PCIe3.0 x8, etc.
            pattern = "PCIe3.0%"
        Case "PCIe2.0"
            ' Match PCIe2.0, PCIe2.0 x4, etc.
            pattern = "PCIe2.0%"
        Case "PCI"
            ' Match only PCI (not PCIe) - will use exact matching
            pattern = "PCI"
        Case Else
            pattern = filterValue
    End Select
    
    GetPCIePattern = pattern
End Function

Function GetUSBPattern(filterValue)
    ' Convert USB filter value to SQL pattern for flexible matching
    Dim pattern
    
    Select Case filterValue
        Case "USB3.2"
            ' Match USB3.2, USB3.2 Gen2, etc.
            pattern = "USB3.2%"
        Case "USB3.1"
            ' Match USB3.1, USB3.1 Gen1, USB3.1 Gen2, etc.
            pattern = "USB3.1%"
        Case "USB3.0"
            ' Match USB3.0, USB3.0 Gen1, etc.
            pattern = "USB3.0%"
        Case Else
            pattern = filterValue
    End Select
    
    GetUSBPattern = pattern
End Function

Function ShouldUseExactMatching(fieldName, filterValue)
    ' Determines if a field/value combination should use exact matching instead of partial matching
    ' This prevents issues like "Camera Link" matching "Camera Link HS"
    
    Dim shouldUseExact
    shouldUseExact = False
    
    ' Interface fields (p_item_text2, p_item_text5) - these are the main problem areas
    If fieldName = "p_item_text2" OR fieldName = "p_item_text5" Then
        ' Camera Link variants
        If filterValue = "Camera Link" OR filterValue = "Camera Link HS" Then
            shouldUseExact = True
        ' CoaXPress variants  
        ElseIf filterValue = "CoaXPress" OR filterValue = "CoaXPress12" OR filterValue = "CoaXPress10" OR filterValue = "CoaXPress6" Then
            shouldUseExact = True
        ' GigE variants
        ElseIf filterValue = "GigE" OR filterValue = "1GigE" OR filterValue = "2.5GigE" OR filterValue = "5GigE" OR filterValue = "10GigE" OR filterValue = "40GigE" Then
            shouldUseExact = True
        ' USB variants - removed to allow flexible matching
        ' USB values will be handled with special logic in the main filter section
        End If
    End If
    
    ' PCIe fields (p_item_text2 in frame grabber context)
    ' Removed PCIe from exact matching to allow flexible matching
    ' PCIe values will be handled with special logic in the main filter section
    
    ' Chipset and other technical specification fields should also use exact matching
    If fieldName = "p_item_text1" Then
        ' For chipset fields, use exact matching to avoid partial matches
        If InStr(filterValue, "Intel") > 0 OR InStr(filterValue, "Chipset") > 0 Then
            shouldUseExact = True
        End If
    End If
    
    ' Maker fields - some makers have similar names
    If fieldName = "p_item_text4" OR fieldName = "p_item_text6" Then
        ' Companies with similar names should use exact matching
        If filterValue = "Teledyne Dalsa" OR filterValue = "Teledyne FLIR" OR filterValue = "Teledyne Lumenera" OR filterValue = "Teledyne Photometrics" OR filterValue = "Teledyne Princeton Instruments" Then
            shouldUseExact = True
        End If
    End If
    
    ' Mount types - exact matching for precision
    If fieldName = "p_item_text3" OR fieldName = "p_item_text5" Then
        If filterValue = "C mount" OR filterValue = "CS mount" OR filterValue = "F mount" OR filterValue = "M mount" Then
            shouldUseExact = True
        End If
    End If
    
    ShouldUseExactMatching = shouldUseExact
End Function


' Get basic filter parameters
Dim p_cate, searchQuery, p_cate2, page, pageSize
p_cate = Request.QueryString("p_cate")
searchQuery = Request.QueryString("search")
p_cate2 = Request.QueryString("p_cate2")
page = Request.QueryString("page")
If page = "" Then page = 1
pageSize = Request.QueryString("pageSize")
If pageSize = "" Then pageSize = 20

' Debug: Log all request parameters
Dim debugLog
debugLog = "=== API 호출 파라미터 디버그 ===" & vbCrLf
For Each key In Request.QueryString
    debugLog = debugLog & key & " = " & Request.QueryString(key) & vbCrLf
Next

' Get sort parameters
Dim sortBy, sortDir
sortBy = Request.QueryString("sortBy")
sortDir = Request.QueryString("sortDir")
If sortDir <> "ASC" And sortDir <> "DESC" Then sortDir = "ASC"

' Add resolution MP filter handling
Dim p_resolution_mp, resolution_source_params, p_num_pixels
p_resolution_mp = Request.QueryString("p_resolution_mp")
p_num_pixels = Request.QueryString("p_num_pixels")
resolution_source_params = Request.QueryString("resolution_source_params")

' Get slider range parameters
Dim p_num_pixels_min, p_num_pixels_max
p_num_pixels_min = Request.QueryString("p_num_pixels_min")
p_num_pixels_max = Request.QueryString("p_num_pixels_max")

' Build base SQL query
Dim Sql
Sql = "SELECT A.*, B.c_name FROM tbl_prod A LEFT JOIN tbl_cate B ON A.p_cate=B.c_code WHERE 1=1 "

' Add main category filter
If p_cate <> "" Then
    Sql = Sql & " AND A.p_cate = '" & Replace(p_cate, "'", "''") & "' "
End If

Dim rangeValues
Dim specValues

' Add sub-category filter (p_cate2) handling multiple values
If p_cate2 <> "" Then
    Dim cate2Values
    cate2Values = Split(p_cate2, ",")
    If UBound(cate2Values) >= 0 Then
        Sql = Sql & " AND ("
        For i = 0 To UBound(cate2Values)
            If i > 0 Then Sql = Sql & " OR "
            Sql = Sql & "A.p_cate2 = '" & Replace(cate2Values(i), "'", "''") & "'"
        Next
        Sql = Sql & ") "
    End If
End If

' Add search query
If searchQuery <> "" Then
    searchQuery = Replace(searchQuery, "'", "''")
    Sql = Sql & " AND (A.p_name LIKE '%" & searchQuery & "%' " & _
                 " OR A.p_code LIKE '%" & searchQuery & "%' " & _
                 " OR A.p_cate2 LIKE '%" & searchQuery & "%' " & _
                 " OR CAST(A.p_item1 AS VARCHAR(50)) LIKE '%" & searchQuery & "%' " & _
                 " OR CAST(A.p_item2 AS VARCHAR(50)) LIKE '%" & searchQuery & "%' " & _
                 " OR B.c_name LIKE '%" & searchQuery & "%') "
End If

' Handle all product attributes (p_item1 through p_item10) - ONLY FOR NUMERIC p_item fields
For i = 10 To 1 Step -1
    paramName = "p_item" & i
    rangeParamName = paramName & "_range" ' Check for _range parameter

    ' Handle _range parameters
    If Request.QueryString(rangeParamName) <> "" Then
        rangeValues = Split(Request.QueryString(rangeParamName), "-")
        If UBound(rangeValues) = 1 Then
            Sql = Sql & " AND " & ApplyBetweenFilter("A." & paramName, rangeValues(0), rangeValues(1))
        End If

    ' Handle regular parameters
    ElseIf Request.QueryString(paramName) <> "" Then
        Dim itemValues
        itemValues = Split(Request.QueryString(paramName), ",")

        If UBound(itemValues) >= 0 Then
            Sql = Sql & " AND ("
            For j = 0 To UBound(itemValues)
                If j > 0 Then Sql = Sql & " OR "

                Dim currentVal, val, parts, rangeParts, delimiter, lowerBound, upperBound
                currentVal = Trim(itemValues(j))

                ' Handle explicit numeric comparisons like <=100, >50
                If Left(currentVal, 2) = "<=" Or Left(currentVal, 2) = ">=" Or Left(currentVal, 1) = "<" Or Left(currentVal, 1) = ">" Then
                    parts = ExtractOperatorAndValue(currentVal)
                    Sql = Sql & ApplyArithmeticOperatorFilter("A." & paramName, parts(0), parts(1))
                ' Handle 'up to' values like ~16384
                ElseIf Left(currentVal, 1) = "~" Then
                    val = Mid(currentVal, 2)
                    If IsNumeric(val) Then
                        Sql = Sql & ApplyArithmeticOperatorFilter("A." & paramName, "<=", val)
                    End If
                ' Handle 'from' values like 16384~
                ElseIf Right(currentVal, 1) = "~" Then
                    val = Left(currentVal, Len(currentVal) - 1)
                    If IsNumeric(val) Then
                         Sql = Sql & ApplyArithmeticOperatorFilter("A." & paramName, ">=", val)
                    End If
                ' Handle BETWEEN syntax from the frontend
                ElseIf InStr(UCase(currentVal), "BETWEEN") > 0 And InStr(UCase(currentVal), "AND") > 0 Then
                    parts = Split(UCase(currentVal), "AND")
                    If UBound(parts) = 1 Then
                        lowerBound = Trim(Replace(UCase(parts(0)), "BETWEEN", ""))
                        upperBound = Trim(parts(1))

                        If IsNumeric(lowerBound) And IsNumeric(upperBound) Then
                            Sql = Sql & ApplyBetweenFilter("A." & paramName, lowerBound, upperBound)
                        Else
                            Sql = Sql & "CAST(A." & paramName & " AS VARCHAR(255)) LIKE '%" & Replace(currentVal, "'", "''") & "%'"
                        End If
                    Else
                        Sql = Sql & "CAST(A." & paramName & " AS VARCHAR(255)) LIKE '%" & Replace(currentVal, "'", "''") & "%'"
                    End If
                Else
                    delimiter = ""
                    If InStr(currentVal, "-") > 0 Then 
                        delimiter = "-"
                    ElseIf InStr(currentVal, "~") > 0 Then 
                        delimiter = "~"
                    End If

                    If delimiter <> "" Then
                        rangeParts = Split(currentVal, delimiter)
                        If UBound(rangeParts) = 1 And Trim(rangeParts(0)) <> "" And Trim(rangeParts(1)) <> "" And IsNumeric(Trim(rangeParts(0))) And IsNumeric(Trim(rangeParts(1))) Then
                             Sql = Sql & ApplyBetweenFilter("A." & paramName, Trim(rangeParts(0)), Trim(rangeParts(1)))
                        Else
                             ' Fallback for non-numeric range-like text, e.g. "M-mount"
                             Sql = Sql & "CAST(A." & paramName & " AS VARCHAR(255)) LIKE '%" & Replace(currentVal, "'", "''") & "%'"
                        End If
                    ElseIf IsNumeric(currentVal) Then
                        ' Handles single value filters against columns that can be single value or a range
                        Sql = Sql & ApplyBetweenFilter("A." & paramName, currentVal, currentVal)
                    Else
                        ' Fallback for non-numeric filter values on a numeric column (e.g. "C mount")
                        Sql = Sql & "CAST(A." & paramName & " AS VARCHAR(255)) LIKE '%" & Replace(currentVal, "'", "''") & "%'"
                    End If
                End If
            Next
            Sql = Sql & ") "
        End If
    End If
Next

' Process additional text parameters (p_item_text1 through p_item_text10) - ONLY FOR TEXT fields
For i = 10 To 1 Step -1
    paramName = "p_item_text" & i
    
    ' Handle regular parameters for text fields (no range or numeric comparison)
    If Request.QueryString(paramName) <> "" Then
        Dim textValues
        textValues = Split(Request.QueryString(paramName), ",")
        
        If UBound(textValues) >= 0 Then
            Sql = Sql & " AND ("
            For j = 0 To UBound(textValues)
                If j > 0 Then Sql = Sql & " OR "
                
                ' Check if this is a PCIe filter that needs special pattern matching
                If IsPCIeFilter(paramName, textValues(j)) Then
                    ' Use flexible pattern matching for PCIe values
                    Dim pciePattern
                    pciePattern = GetPCIePattern(textValues(j))
                    If textValues(j) = "PCI" Then
                        ' For PCI, use exact match to avoid matching PCIe
                        Sql = Sql & "A." & paramName & " = '" & Replace(textValues(j), "'", "''") & "'"
                    Else
                        ' For PCIe versions, use pattern matching
                        Sql = Sql & "A." & paramName & " LIKE '" & Replace(pciePattern, "'", "''") & "'"
                    End If
                ' Check if this is a USB filter that needs special pattern matching
                ElseIf IsUSBFilter(paramName, textValues(j)) Then
                    ' Use flexible pattern matching for USB values
                    Dim usbPattern
                    usbPattern = GetUSBPattern(textValues(j))
                    Sql = Sql & "A." & paramName & " LIKE '" & Replace(usbPattern, "'", "''") & "'"
                ' Check if this is a field that should use exact matching instead of partial matching
                ElseIf ShouldUseExactMatching(paramName, textValues(j)) Then
                    ' Use exact match for specific interface and technology fields
                    Sql = Sql & "A." & paramName & " = '" & Replace(textValues(j), "'", "''") & "'"
                Else
                    ' Check if this is a numeric comparison for text fields (like F# values)
                    Dim currentTextVal
                    currentTextVal = Trim(textValues(j))
                    
                    ' Handle explicit numeric comparisons like <=100, >50, >=5.6
                    ' But skip if it contains AND (which indicates a range query)
                    If (Left(currentTextVal, 2) = "<=" Or Left(currentTextVal, 2) = ">=" Or Left(currentTextVal, 1) = "<" Or Left(currentTextVal, 1) = ">") And InStr(UCase(currentTextVal), " AND ") = 0 Then
                        ' Extract operator and value
                        Dim textParts
                        textParts = ExtractOperatorAndValue(currentTextVal)
                        
                        ' For F# fields with ranges (e.g., "5.6-22"), we need special handling
                        If paramName = "p_item_text2" Then
                            ' Build comparison logic for F# ranges
                            Dim fNumberLogic
                            fNumberLogic = "(("
                            
                            ' Handle single F# values (e.g., "8.00", "4.5")
                            fNumberLogic = fNumberLogic & "TRY_CAST(A." & paramName & " AS FLOAT) " & textParts(0) & " " & textParts(1)
                            
                            ' Handle F# ranges (e.g., "5.6-22")
                            fNumberLogic = fNumberLogic & " OR ("
                            fNumberLogic = fNumberLogic & "CHARINDEX('-', A." & paramName & ") > 0"
                            
                            ' Check against lower bound of range
                            If textParts(0) = ">" Or textParts(0) = ">=" Then
                                fNumberLogic = fNumberLogic & " AND TRY_CAST(SUBSTRING(A." & paramName & ", 1, CHARINDEX('-', A." & paramName & ") - 1) AS FLOAT) " & textParts(0) & " " & textParts(1)
                            ' Check against upper bound of range
                            ElseIf textParts(0) = "<" Or textParts(0) = "<=" Then
                                fNumberLogic = fNumberLogic & " AND TRY_CAST(SUBSTRING(A." & paramName & ", CHARINDEX('-', A." & paramName & ") + 1, LEN(A." & paramName & ")) AS FLOAT) " & textParts(0) & " " & textParts(1)
                            End If
                            
                            fNumberLogic = fNumberLogic & ")"
                            
                            ' Also check if the filter value falls within the range
                            If textParts(0) = ">=" Or textParts(0) = ">" Then
                                ' For >= or >, check if filter value is less than upper bound
                                fNumberLogic = fNumberLogic & " OR (CHARINDEX('-', A." & paramName & ") > 0"
                                fNumberLogic = fNumberLogic & " AND TRY_CAST(SUBSTRING(A." & paramName & ", CHARINDEX('-', A." & paramName & ") + 1, LEN(A." & paramName & ")) AS FLOAT) >= " & textParts(1) & ")"
                            ElseIf textParts(0) = "<=" Or textParts(0) = "<" Then
                                ' For <= or <, check if filter value is greater than lower bound
                                fNumberLogic = fNumberLogic & " OR (CHARINDEX('-', A." & paramName & ") > 0"
                                fNumberLogic = fNumberLogic & " AND TRY_CAST(SUBSTRING(A." & paramName & ", 1, CHARINDEX('-', A." & paramName & ") - 1) AS FLOAT) <= " & textParts(1) & ")"
                            End If
                            
                            fNumberLogic = fNumberLogic & "))"
                            
                            Sql = Sql & fNumberLogic
                        Else
                            ' For other text fields, use simple comparison
                            Sql = Sql & "TRY_CAST(A." & paramName & " AS FLOAT) " & textParts(0) & " " & textParts(1)
                        End If
                    ' Handle BETWEEN syntax and range syntax for text fields
                    ElseIf (InStr(UCase(currentTextVal), "BETWEEN") > 0 And InStr(UCase(currentTextVal), " AND ") > 0) Or _
                           (InStr(currentTextVal, ">=") > 0 And InStr(UCase(currentTextVal), " AND ") > 0) Then
                        ' Extract the range values
                        Dim betweenParts, lowerVal, upperVal
                        lowerVal = ""
                        upperVal = ""
                        
                        ' Handle ">= X AND p_item_text2 < Y" format
                        If InStr(currentTextVal, ">=") > 0 And InStr(UCase(currentTextVal), " AND ") > 0 Then
                            ' Find AND position (case-insensitive)
                            Dim andPos
                            andPos = InStr(1, currentTextVal, " AND ", vbTextCompare)
                            
                            If andPos > 0 Then
                                ' Split by AND position
                                Dim firstPart, secondPart
                                firstPart = Trim(Left(currentTextVal, andPos - 1))
                                secondPart = Trim(Mid(currentTextVal, andPos + 5))
                                
                                ' Extract lower value from ">= X"
                                If Left(firstPart, 2) = ">=" Then
                                    lowerVal = Trim(Mid(firstPart, 3))
                                End If
                                
                                ' Extract upper value from "p_item_text2 < Y"
                                ' Remove field name (case-insensitive)
                                secondPart = Replace(secondPart, "p_item_text2", "", 1, -1, vbTextCompare)
                                secondPart = Trim(secondPart)
                                
                                ' Extract value from "< Y"
                                If Left(secondPart, 1) = "<" Then
                                    upperVal = Trim(Mid(secondPart, 2))
                                End If
                            End If
                        ' Handle "BETWEEN X AND Y" format
                        Else
                            betweenParts = Split(Replace(UCase(currentTextVal), "BETWEEN", ""), " AND ")
                            If UBound(betweenParts) = 1 Then
                                lowerVal = Trim(Replace(UCase(betweenParts(0)), "P_ITEM_TEXT2", ""))
                                upperVal = Trim(betweenParts(1))
                            End If
                        End If
                        
                        ' Debug - log extracted values
                        'Response.Write "<!-- lowerVal: " & lowerVal & ", upperVal: " & upperVal & " -->"
                        
                        ' Handle F# range queries if we successfully extracted values
                        If paramName = "p_item_text2" And lowerVal <> "" And upperVal <> "" And IsNumeric(lowerVal) And IsNumeric(upperVal) Then
                            Dim betweenLogic
                            betweenLogic = "("
                            
                            ' Single values in range (e.g., "8.00" between 4 and 20)
                            betweenLogic = betweenLogic & "(CHARINDEX('-', A." & paramName & ") = 0 AND TRY_CAST(A." & paramName & " AS FLOAT) >= " & lowerVal & " AND TRY_CAST(A." & paramName & " AS FLOAT) < " & upperVal & ")"
                            
                            ' Range values that overlap (e.g., "5.6-22" overlaps with 4-20)
                            betweenLogic = betweenLogic & " OR (CHARINDEX('-', A." & paramName & ") > 0 AND ("
                            ' Lower bound of DB range is less than upper bound of filter
                            betweenLogic = betweenLogic & "TRY_CAST(SUBSTRING(A." & paramName & ", 1, CHARINDEX('-', A." & paramName & ") - 1) AS FLOAT) < " & upperVal
                            betweenLogic = betweenLogic & " AND "
                            ' Upper bound of DB range is greater than or equal to lower bound of filter
                            betweenLogic = betweenLogic & "TRY_CAST(SUBSTRING(A." & paramName & ", CHARINDEX('-', A." & paramName & ") + 1, LEN(A." & paramName & ")) AS FLOAT) >= " & lowerVal
                            betweenLogic = betweenLogic & "))"
                            
                            betweenLogic = betweenLogic & ")"
                            
                            Sql = Sql & betweenLogic
                        Else
                            ' Fallback to string comparison
                            Sql = Sql & "A." & paramName & " LIKE '%" & Replace(currentTextVal, "'", "''") & "%'"
                        End If
                    Else
                        ' Use partial match for other text fields (legacy behavior)
                        Sql = Sql & "A." & paramName & " LIKE '%" & Replace(textValues(j), "'", "''") & "%'"
                    End If
                End If
            Next
            Sql = Sql & ") "
        End If
    End If
Next


' Process content parameters (p_content1 through p_content6)
For i = 6 To 1 Step -1
    paramName = "p_content" & i
    
    If Request.QueryString(paramName) <> "" Then
        Dim contentValues
        contentValues = Split(Request.QueryString(paramName), ",")
        
        If UBound(contentValues) >= 0 Then
            Sql = Sql & " AND ("
            For j = 0 To UBound(contentValues)
                If j > 0 Then Sql = Sql & " OR "
                
                ' Handle numeric comparisons
                If Left(contentValues(j), 2) = "<=" Or Left(contentValues(j), 2) = ">=" Or Left(contentValues(j), 1) = "<" Or Left(contentValues(j), 1) = ">" Then
                    Dim contentParts
                    contentParts = ExtractOperatorAndValue(contentValues(j))
                    Sql = Sql & ApplyArithmeticOperatorFilter("A." & paramName, contentParts(0), contentParts(1))
                ElseIf InStr(contentValues(j), "BETWEEN") > 0 Then
                    Sql = Sql & "CONVERT(float, A." & paramName & ") " & contentValues(j)
                Else
                    ' Check if this content field should use exact matching
                    If ShouldUseExactMatching(paramName, contentValues(j)) Then
                        Sql = Sql & "A." & paramName & " = '" & Replace(contentValues(j), "'", "''") & "'"
                    Else
                        ' Regular string comparison
                        Sql = Sql & "A." & paramName & " LIKE '%" & Replace(contentValues(j), "'", "''") & "%'"
                    End If
                End If
            Next
            Sql = Sql & ") "
        End If
    End If
Next

' Process specification text parameters (p_spec_text1 through p_spec_text16)
For i = 16 To 1 Step -1
    paramName = "p_spec_text" & i
    rangeParamName = paramName & "_range" ' Check for _range parameter
    
    ' Handle _range parameters
    If Request.QueryString(rangeParamName) <> "" Then
        rangeValues = Split(Request.QueryString(rangeParamName), "-")
        If UBound(rangeValues) = 1 Then
            Sql = Sql & " AND " & ApplyBetweenFilter("A." & paramName, rangeValues(0), rangeValues(1))
        End If

    ' Handle regular parameters
    ElseIf Request.QueryString(paramName) <> "" Then
        specValues = Split(Request.QueryString(paramName), ",")
        
        If UBound(specValues) >= 0 Then
            Sql = Sql & " AND ("
            For j = 0 To UBound(specValues)
                If j > 0 Then Sql = Sql & " OR "
                
                ' Handle numeric comparisons
                If Left(specValues(j), 2) = "<=" Or Left(specValues(j), 2) = ">=" Or Left(specValues(j), 1) = "<" Or Left(specValues(j), 1) = ">" Then
                    Dim specParts
                    specParts = ExtractOperatorAndValue(specValues(j))
                    Sql = Sql & ApplyArithmeticOperatorFilter("A." & paramName, specParts(0), specParts(1))
                ElseIf InStr(specValues(j), "BETWEEN") > 0 Then
                    Sql = Sql & "CONVERT(float, A." & paramName & ") " & specValues(j)
                Else
                    ' Check if this spec field should use exact matching
                    If ShouldUseExactMatching(paramName, specValues(j)) Then
                        Sql = Sql & "A." & paramName & " = '" & Replace(specValues(j), "'", "''") & "'"
                    Else
                        ' Regular string comparison
                        Sql = Sql & "A." & paramName & " LIKE '%" & Replace(specValues(j), "'", "''") & "%'"
                    End If
                End If
            Next
            Sql = Sql & ") "
        End If
    End If
Next

' Add ORDER BY clause with sorting
If sortBy <> "" Then
    ' Check if the sort field is a resolution calculation
    If sortBy = "p_resolution_mp" And (p_cate = "1010" Or p_cate = "1013" Or p_cate = "1014") Then
        ' Sort by the calculated megapixel value with new products first
        Sql = Sql & " ORDER BY A.is_newproduct DESC, (CONVERT(float, A.p_item1) * CONVERT(float, A.p_item2) / 1000000) " & sortDir
    ElseIf sortBy = "p_num_pixels" And p_cate = "1012" Then
        ' Sort by the calculated number of pixels for CIS with new products first
        Sql = Sql & " ORDER BY A.is_newproduct DESC, (CONVERT(float, A.p_item3) * CONVERT(float, A.p_item1) / 25.4) " & sortDir
    ElseIf Left(sortBy, 2) = "p_" Then 
        ' Make sure the field name is safe (starts with p_ and contains only alphanumeric chars)
        Dim safeSortField
        safeSortField = Replace(sortBy, "'", "")
        ' For numeric fields, use numeric conversion with new products first
        If InStr("p_item1,p_item2,p_item3,p_item4,p_item5,p_item6,p_item7,p_item8,p_item9", safeSortField) > 0 Then
            Sql = Sql & " ORDER BY A.is_newproduct DESC, CAST(A." & safeSortField & " AS FLOAT) " & sortDir
        Else
            Sql = Sql & " ORDER BY A.is_newproduct DESC, A." & safeSortField & " " & sortDir
        End If
    Else
        ' Default to sort by new products first, then by name
        Sql = Sql & " ORDER BY A.is_newproduct DESC, A.p_name ASC"
    End If
Else
    ' Default sorting with new products first
    Sql = Sql & " ORDER BY A.is_newproduct DESC, A.p_name ASC"
End If

' Uncomment below for debugging
'Response.Write "Generated SQL: " & Sql
'Response.End
Set Rs = Server.CreateObject("ADODB.Recordset")
Rs.Open Sql, Dbcon, 1

' Pagination setup
Rs.PageSize = CInt(pageSize)
'Dim totalRecords, totalPages, isFirst
'isFirst = True
'totalRecords = 0
'totalPages = 0

' Calculate total records and current page
Dim totalRecords
totalRecords = Rs.RecordCount

' Move to the correct page
If Not Rs.EOF Then
    Rs.AbsolutePage = CInt(page)
End If

' Build JSON response
Dim jsonResponse
jsonResponse = "{"
jsonResponse = jsonResponse & """total"":" & totalRecords & ","
jsonResponse = jsonResponse & """page"":" & page & ","
jsonResponse = jsonResponse & """pageSize"":" & pageSize & ","
jsonResponse = jsonResponse & """category"":" & JSON.stringify(p_cate) & ","

' Fix for sortBy when empty - ensure it's quoted properly
If sortBy = "" Then
    jsonResponse = jsonResponse & """sortBy"":null,"
Else
    jsonResponse = jsonResponse & """sortBy"":" & JSON.stringify(sortBy) & ","
End If

jsonResponse = jsonResponse & """sortDir"":" & JSON.stringify(sortDir) & ","
jsonResponse = jsonResponse & """Sql"":" & JSON.stringify(Sql, null, 2) & ","
jsonResponse = jsonResponse & """debug"":" & JSON.stringify(debugLog) & ","
jsonResponse = jsonResponse & """items"":["

If Not Rs.EOF Then
    Dim counter, isFirst
    counter = 0
    isFirst = True
    
    ' Function to safely encode JSON string values
    Function JSONSafeValue(value)
        If IsNull(value) Then
            JSONSafeValue = ""
        Else
            ' Replace potential problematic characters
            Dim safeValue
            safeValue = CStr(value)
            safeValue = Replace(safeValue, "\", "\\")
            safeValue = Replace(safeValue, """", "\""")
            safeValue = Replace(safeValue, "/", "\/")
            safeValue = Replace(safeValue, Chr(8), "\b")
            safeValue = Replace(safeValue, Chr(12), "\f")
            safeValue = Replace(safeValue, Chr(10), "\n")
            safeValue = Replace(safeValue, Chr(13), "\r")
            safeValue = Replace(safeValue, Chr(9), "\t")
            JSONSafeValue = safeValue
        End If
    End Function
    
    Do Until Rs.EOF Or counter >= CInt(pageSize)
        ' Add comma before item if not the first one
        If Not isFirst Then
            jsonResponse = jsonResponse & ","
        End If
        isFirst = False
        
        ' Start item JSON object
        jsonResponse = jsonResponse & "{"
        
        ' Add fields with properly escaped values
        jsonResponse = jsonResponse & """idx"":""" & JSONSafeValue(Rs("idx")) & ""","
        jsonResponse = jsonResponse & """p_name"":""" & JSONSafeValue(Rs("p_name")) & ""","
        jsonResponse = jsonResponse & """p_code"":""" & JSONSafeValue(Rs("p_code")) & ""","
        jsonResponse = jsonResponse & """p_cate"":""" & JSONSafeValue(Rs("p_cate")) & ""","
        jsonResponse = jsonResponse & """p_cate2"":""" & JSONSafeValue(Rs("p_cate2")) & ""","
        jsonResponse = jsonResponse & """p_item1"":""" & JSONSafeValue(Rs("p_item1")) & ""","
        jsonResponse = jsonResponse & """p_item2"":""" & JSONSafeValue(Rs("p_item2")) & ""","
        jsonResponse = jsonResponse & """p_item3"":""" & JSONSafeValue(Rs("p_item3")) & ""","
        jsonResponse = jsonResponse & """p_item4"":""" & JSONSafeValue(Rs("p_item4")) & ""","
        jsonResponse = jsonResponse & """p_item5"":""" & JSONSafeValue(Rs("p_item5")) & ""","
        jsonResponse = jsonResponse & """p_item6"":""" & JSONSafeValue(Rs("p_item6")) & ""","
        jsonResponse = jsonResponse & """p_item7"":""" & JSONSafeValue(Rs("p_item7")) & ""","
        jsonResponse = jsonResponse & """p_item8"":""" & JSONSafeValue(Rs("p_item8")) & ""","
        jsonResponse = jsonResponse & """p_item9"":""" & JSONSafeValue(Rs("p_item9")) & ""","
        jsonResponse = jsonResponse & """p_item10"":""" & JSONSafeValue(Rs("p_item10")) & ""","
        jsonResponse = jsonResponse & """p_item_text1"":""" & JSONSafeValue(Rs("p_item_text1")) & ""","
        jsonResponse = jsonResponse & """p_item_text2"":""" & JSONSafeValue(Rs("p_item_text2")) & ""","
        jsonResponse = jsonResponse & """p_item_text3"":""" & JSONSafeValue(Rs("p_item_text3")) & ""","
        jsonResponse = jsonResponse & """p_item_text4"":""" & JSONSafeValue(Rs("p_item_text4")) & ""","
        jsonResponse = jsonResponse & """p_item_text5"":""" & JSONSafeValue(Rs("p_item_text5")) & ""","
        jsonResponse = jsonResponse & """p_item_text6"":""" & JSONSafeValue(Rs("p_item_text6")) & ""","
        jsonResponse = jsonResponse & """p_item_text7"":""" & JSONSafeValue(Rs("p_item_text7")) & ""","
        jsonResponse = jsonResponse & """p_item_text8"":""" & JSONSafeValue(Rs("p_item_text8")) & ""","
        jsonResponse = jsonResponse & """p_item_text9"":""" & JSONSafeValue(Rs("p_item_text9")) & ""","
        jsonResponse = jsonResponse & """p_item_text10"":""" & JSONSafeValue(Rs("p_item_text10")) & ""","
        jsonResponse = jsonResponse & """p_addtext1"":""" & JSONSafeValue(Rs("p_addtext1")) & ""","
        jsonResponse = jsonResponse & """p_addtext2"":""" & JSONSafeValue(Rs("p_addtext2")) & ""","
        jsonResponse = jsonResponse & """p_addtext3"":""" & JSONSafeValue(Rs("p_addtext3")) & ""","
        jsonResponse = jsonResponse & """p_addtext4"":""" & JSONSafeValue(Rs("p_addtext4")) & ""","
        jsonResponse = jsonResponse & """p_addtext5"":""" & JSONSafeValue(Rs("p_addtext5")) & ""","
        jsonResponse = jsonResponse & """p_image1"":""" & JSONSafeValue(Rs("p_image1")) & ""","
        jsonResponse = jsonResponse & """p_image2"":""" & JSONSafeValue(Rs("p_image2")) & ""","
        jsonResponse = jsonResponse & """p_image3"":""" & JSONSafeValue(Rs("p_image3")) & ""","
        jsonResponse = jsonResponse & """p_image4"":""" & JSONSafeValue(Rs("p_image4")) & ""","
        jsonResponse = jsonResponse & """p_image5"":""" & JSONSafeValue(Rs("p_image5")) & ""","
        jsonResponse = jsonResponse & """p_image6"":""" & JSONSafeValue(Rs("p_image6")) & ""","
        jsonResponse = jsonResponse & """p_image7"":""" & JSONSafeValue(Rs("p_image7")) & ""","
        jsonResponse = jsonResponse & """p_image8"":""" & JSONSafeValue(Rs("p_image8")) & ""","
        jsonResponse = jsonResponse & """p_image9"":""" & JSONSafeValue(Rs("p_image9")) & ""","
        jsonResponse = jsonResponse & """p_image10"":""" & JSONSafeValue(Rs("p_image10")) & ""","
        jsonResponse = jsonResponse & """p_file1"":""" & JSONSafeValue(Rs("p_file1")) & ""","
        jsonResponse = jsonResponse & """p_file2"":""" & JSONSafeValue(Rs("p_file2")) & ""","
        jsonResponse = jsonResponse & """p_file3"":""" & JSONSafeValue(Rs("p_file3")) & ""","
        jsonResponse = jsonResponse & """p_file4"":""" & JSONSafeValue(Rs("p_file4")) & ""","
        jsonResponse = jsonResponse & """p_file5"":""" & JSONSafeValue(Rs("p_file5")) & ""","
        jsonResponse = jsonResponse & """p_file6"":""" & JSONSafeValue(Rs("p_file6")) & ""","
        jsonResponse = jsonResponse & """p_content1"":""" & JSONSafeValue(Rs("p_content1")) & ""","
        jsonResponse = jsonResponse & """p_content2"":""" & JSONSafeValue(Rs("p_content2")) & ""","
        jsonResponse = jsonResponse & """p_content3"":""" & JSONSafeValue(Rs("p_content3")) & ""","
        jsonResponse = jsonResponse & """p_content4"":""" & JSONSafeValue(Rs("p_content4")) & ""","
        jsonResponse = jsonResponse & """p_content5"":""" & JSONSafeValue(Rs("p_content5")) & ""","
        jsonResponse = jsonResponse & """p_content6"":""" & JSONSafeValue(Rs("p_content6")) & ""","
        jsonResponse = jsonResponse & """p_memo"":""" & JSONSafeValue(Rs("p_memo")) & ""","
        jsonResponse = jsonResponse & """p_o_price"":""" & JSONSafeValue(Rs("p_o_price")) & ""","
        jsonResponse = jsonResponse & """p_spec_text1"":""" & JSONSafeValue(Rs("p_spec_text1")) & ""","
        jsonResponse = jsonResponse & """p_spec_text2"":""" & JSONSafeValue(Rs("p_spec_text2")) & ""","
        jsonResponse = jsonResponse & """p_spec_text3"":""" & JSONSafeValue(Rs("p_spec_text3")) & ""","
        jsonResponse = jsonResponse & """p_spec_text4"":""" & JSONSafeValue(Rs("p_spec_text4")) & ""","
        jsonResponse = jsonResponse & """p_spec_text5"":""" & JSONSafeValue(Rs("p_spec_text5")) & ""","
        jsonResponse = jsonResponse & """p_spec_text6"":""" & JSONSafeValue(Rs("p_spec_text6")) & ""","
        jsonResponse = jsonResponse & """p_spec_text7"":""" & JSONSafeValue(Rs("p_spec_text7")) & ""","
        jsonResponse = jsonResponse & """p_spec_text8"":""" & JSONSafeValue(Rs("p_spec_text8")) & ""","
        jsonResponse = jsonResponse & """p_spec_text9"":""" & JSONSafeValue(Rs("p_spec_text9")) & ""","
        jsonResponse = jsonResponse & """p_spec_text10"":""" & JSONSafeValue(Rs("p_spec_text10")) & ""","
        jsonResponse = jsonResponse & """p_spec_text11"":""" & JSONSafeValue(Rs("p_spec_text11")) & ""","
        jsonResponse = jsonResponse & """p_spec_text12"":""" & JSONSafeValue(Rs("p_spec_text12")) & ""","
        jsonResponse = jsonResponse & """p_spec_text13"":""" & JSONSafeValue(Rs("p_spec_text13")) & ""","
        jsonResponse = jsonResponse & """p_spec_text14"":""" & JSONSafeValue(Rs("p_spec_text14")) & ""","
        jsonResponse = jsonResponse & """p_spec_text15"":""" & JSONSafeValue(Rs("p_spec_text15")) & ""","
        jsonResponse = jsonResponse & """p_spec_text16"":""" & JSONSafeValue(Rs("p_spec_text16")) & ""","
        jsonResponse = jsonResponse & """p_spec1"":""" & JSONSafeValue(Rs("p_spec1")) & ""","
        jsonResponse = jsonResponse & """p_spec2"":""" & JSONSafeValue(Rs("p_spec2")) & ""","
        jsonResponse = jsonResponse & """p_spec3"":""" & JSONSafeValue(Rs("p_spec3")) & ""","
        jsonResponse = jsonResponse & """p_spec4"":""" & JSONSafeValue(Rs("p_spec4")) & ""","
        jsonResponse = jsonResponse & """p_spec5"":""" & JSONSafeValue(Rs("p_spec5")) & ""","
        jsonResponse = jsonResponse & """p_spec6"":""" & JSONSafeValue(Rs("p_spec6")) & ""","
        jsonResponse = jsonResponse & """p_spec7"":""" & JSONSafeValue(Rs("p_spec7")) & ""","
        jsonResponse = jsonResponse & """p_spec8"":""" & JSONSafeValue(Rs("p_spec8")) & ""","
        jsonResponse = jsonResponse & """p_spec9"":""" & JSONSafeValue(Rs("p_spec9")) & ""","
        jsonResponse = jsonResponse & """p_spec10"":""" & JSONSafeValue(Rs("p_spec10")) & ""","
        jsonResponse = jsonResponse & """p_spec11"":""" & JSONSafeValue(Rs("p_spec11")) & ""","
        jsonResponse = jsonResponse & """p_spec12"":""" & JSONSafeValue(Rs("p_spec12")) & ""","
        jsonResponse = jsonResponse & """p_spec13"":""" & JSONSafeValue(Rs("p_spec13")) & ""","
        jsonResponse = jsonResponse & """p_spec14"":""" & JSONSafeValue(Rs("p_spec14")) & ""","
        jsonResponse = jsonResponse & """p_spec15"":""" & JSONSafeValue(Rs("p_spec15")) & ""","
        jsonResponse = jsonResponse & """p_spec16"":""" & JSONSafeValue(Rs("p_spec16")) & ""","
        jsonResponse = jsonResponse & """p_spec_hide1"":""" & JSONSafeValue(Rs("p_spec_hide1")) & ""","
        jsonResponse = jsonResponse & """p_spec_hide2"":""" & JSONSafeValue(Rs("p_spec_hide2")) & ""","
        jsonResponse = jsonResponse & """p_spec_hide3"":""" & JSONSafeValue(Rs("p_spec_hide3")) & ""","
        jsonResponse = jsonResponse & """p_spec_hide4"":""" & JSONSafeValue(Rs("p_spec_hide4")) & ""","
        jsonResponse = jsonResponse & """p_spec_hide5"":""" & JSONSafeValue(Rs("p_spec_hide5")) & ""","
        jsonResponse = jsonResponse & """p_spec_hide6"":""" & JSONSafeValue(Rs("p_spec_hide6")) & ""","
        jsonResponse = jsonResponse & """p_spec_hide7"":""" & JSONSafeValue(Rs("p_spec_hide7")) & ""","
        jsonResponse = jsonResponse & """p_spec_hide8"":""" & JSONSafeValue(Rs("p_spec_hide8")) & ""","
        jsonResponse = jsonResponse & """p_spec_hide9"":""" & JSONSafeValue(Rs("p_spec_hide9")) & ""","
        jsonResponse = jsonResponse & """p_spec_hide10"":""" & JSONSafeValue(Rs("p_spec_hide10")) & ""","
        jsonResponse = jsonResponse & """p_spec_hide11"":""" & JSONSafeValue(Rs("p_spec_hide11")) & ""","
        jsonResponse = jsonResponse & """p_spec_hide12"":""" & JSONSafeValue(Rs("p_spec_hide12")) & ""","
        jsonResponse = jsonResponse & """p_spec_hide13"":""" & JSONSafeValue(Rs("p_spec_hide13")) & ""","
        jsonResponse = jsonResponse & """p_spec_hide14"":""" & JSONSafeValue(Rs("p_spec_hide14")) & ""","
        jsonResponse = jsonResponse & """p_spec_hide15"":""" & JSONSafeValue(Rs("p_spec_hide15")) & ""","
        jsonResponse = jsonResponse & """p_spec_hide16"":""" & JSONSafeValue(Rs("p_spec_hide16")) & ""","
        jsonResponse = jsonResponse & """is_newproduct"":""" & JSONSafeValue(Rs("is_newproduct")) & """"
        
        ' End item JSON object
        jsonResponse = jsonResponse & "}"
        
        counter = counter + 1
        Rs.MoveNext
    Loop
End If

jsonResponse = jsonResponse & "]}"

' Optional: Add simple JSON validation before sending
If Right(jsonResponse, 2) <> "]}" Then
    ' Fix potentially broken JSON by ensuring proper closure
    jsonResponse = Left(jsonResponse, InStrRev(jsonResponse, "}") + 1) & "]}"
End If

Response.Write jsonResponse

Rs.Close
Set Rs = Nothing
%>
