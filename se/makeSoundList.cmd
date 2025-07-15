@echo off
setlocal enabledelayedexpansion

set "outfile=soundList.json"

set count=0
for %%f in (*.mp3) do (
    set /a count+=1
    set "name[!count!]=%%~nf"
)

echo [> %outfile%

for /l %%i in (1,1,%count%) do (
    set "entry=!name[%%i]!"
    if %%i lss %count% (
        echo     "!entry!",>> %outfile%
    ) else (
        echo     "!entry!" >> %outfile%
    )
)

echo ]>> %outfile%