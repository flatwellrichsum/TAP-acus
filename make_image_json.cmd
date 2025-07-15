@echo off
setlocal enabledelayedexpansion

REM 出力ファイル
set "outfile=images.json"

REM ヘッダー
echo [ > %outfile%

REM カレントディレクトリの絶対パス取得
for /f %%i in ('cd') do set "base=%%i"

REM 一時ファイルとしてパスを保存
set "tmpfile=_imglist.tmp"
if exist %tmpfile% del %tmpfile%

REM 画像パスを収集（相対＆スラッシュ変換）
for /R .\img %%f in (*.png *.gif) do (
    set "full=%%~f"
    set "relative=!full:%base%\=!"
    set "relative=!relative:\=/!"
    echo !relative! >> %tmpfile%
)

REM パス数を取得
set /a total=0
for /f %%a in ('find /c /v "" ^< %tmpfile%') do set total=%%a
set /a count=0

REM パスを書き出し（最後の行のみカンマなし）
for /f "usebackq delims=" %%p in (%tmpfile%) do (
    set /a count+=1
    if !count! lss %total% (
        echo     "%%p", >> %outfile%
    ) else (
        echo     "%%p" >> %outfile%
    )
)

REM フッター
echo ] >> %outfile%

REM 後始末
del %tmpfile%

echo Done: %outfile% created with %total% entries.
