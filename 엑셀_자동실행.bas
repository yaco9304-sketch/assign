Attribute VB_Name = "Module1"
' 학년 배정 자동화 - VBA 매크로
' 이 파일의 코드를 엑셀 파일의 VBA 편집기에 추가하세요.

Sub 배정실행()
    ' 현재 엑셀 파일 경로 가져오기
    Dim excelPath As String
    excelPath = ThisWorkbook.FullName
    
    ' Python 스크립트 경로 찾기
    Dim scriptPath As String
    Dim excelDir As String
    Dim fso As Object
    
    Set fso = CreateObject("Scripting.FileSystemObject")
    excelDir = fso.GetParentFolderName(excelPath)
    
    ' Python 스크립트 파일명
    scriptPath = excelDir & "\학년배정_자동화.py"
    
    ' Python 스크립트가 없으면 상위 디렉토리에서 찾기
    If Dir(scriptPath) = "" Then
        scriptPath = fso.GetParentFolderName(excelDir) & "\학년배정_자동화.py"
    End If
    
    ' Python 스크립트가 여전히 없으면 사용자에게 경로 입력 요청
    If Dir(scriptPath) = "" Then
        scriptPath = InputBox("Python 스크립트 경로를 입력하세요:", "스크립트 경로", excelDir & "\학년배정_자동화.py")
        If scriptPath = "" Then
            MsgBox "취소되었습니다.", vbInformation
            Exit Sub
        End If
    End If
    
    ' Python 실행 파일 경로 찾기
    Dim pythonExe As String
    pythonExe = "python"
    
    ' Windows에서 python3 또는 py 명령어 시도
    On Error Resume Next
    Shell pythonExe & " --version", vbHide
    If Err.Number <> 0 Then
        pythonExe = "python3"
        Shell pythonExe & " --version", vbHide
        If Err.Number <> 0 Then
            pythonExe = "py"
        End If
    End If
    On Error GoTo 0
    
    ' 배정 연도 가져오기
    Dim year As Integer
    On Error Resume Next
    year = ThisWorkbook.Sheets("배정실행").Cells(10, 3).Value
    If Err.Number <> 0 Or year = 0 Then
        year = Year(Date) + 1
    End If
    On Error GoTo 0
    
    ' Python 스크립트 실행
    Dim cmd As String
    cmd = pythonExe & " """ & scriptPath & """ """ & excelPath & """ " & year
    
    ' 실행 전 확인
    Dim response As VbMsgBoxResult
    response = MsgBox("배정을 실행하시겠습니까?" & vbCrLf & vbCrLf & _
                     "엑셀 파일: " & excelPath & vbCrLf & _
                     "배정 연도: " & year & vbCrLf & _
                     "Python 스크립트: " & scriptPath, _
                     vbQuestion + vbYesNo, "배정 실행 확인")
    
    If response = vbNo Then
        Exit Sub
    End If
    
    ' Python 스크립트 실행
    Dim wsh As Object
    Set wsh = CreateObject("WScript.Shell")
    
    ' 실행 (명령 프롬프트 창에서 실행하여 결과 확인 가능)
    wsh.Run "cmd /c " & cmd, 1, False
    
    ' 완료 메시지
    MsgBox "배정이 실행되었습니다." & vbCrLf & vbCrLf & _
           "결과는 '배정결과' 시트에서 확인하실 수 있습니다." & vbCrLf & _
           "또한 별도 결과 파일도 생성되었습니다.", vbInformation, "배정 완료"
    
    ' 배정결과 시트로 이동
    On Error Resume Next
    ThisWorkbook.Sheets("배정결과").Activate
    On Error GoTo 0
End Sub

