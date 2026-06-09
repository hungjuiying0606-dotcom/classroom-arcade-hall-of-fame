# run_opencode_games.ps1
# Run OpenCode to generate all 5 game files

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

$gamesDir = 'C:\Users\user\Desktop\antigravity20260602\games'
$rootDir = 'C:\Users\user\Desktop\antigravity20260602'

Write-Host "=== Starting OpenCode Game Generation ===" -ForegroundColor Cyan

# Game 1: buzzer.js
Write-Host "`n[1/3] Generating buzzer.js..." -ForegroundColor Yellow
$prompt1 = Get-Content "$rootDir\opencode_prompt_buzzer.txt" -Raw -Encoding UTF8
Set-Location $gamesDir
$proc1 = Start-Process powershell -ArgumentList @(
    '-NoProfile',
    '-Command',
    "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; chcp 65001 | Out-Null; Set-Location '$gamesDir'; opencode run --model 'opencode/deepseek-v4-flash-free' --dangerously-skip-permissions `$(Get-Content '$rootDir\opencode_prompt_buzzer.txt' -Raw -Encoding UTF8) *> '$rootDir\oc_buzzer.txt'"
) -PassThru
Write-Host "Buzzer PID: $($proc1.Id)"

Start-Sleep -Seconds 5

# Game 2: fisher.js
Write-Host "`n[2/3] Generating fisher.js..." -ForegroundColor Yellow
$proc2 = Start-Process powershell -ArgumentList @(
    '-NoProfile',
    '-Command',
    "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; chcp 65001 | Out-Null; Set-Location '$gamesDir'; opencode run --model 'opencode/deepseek-v4-flash-free' --dangerously-skip-permissions `$(Get-Content '$rootDir\opencode_prompt_fisher.txt' -Raw -Encoding UTF8) *> '$rootDir\oc_fisher.txt'"
) -PassThru
Write-Host "Fisher PID: $($proc2.Id)"

Start-Sleep -Seconds 5

# Games 3+4+5: slots, lava, pancake
Write-Host "`n[3/3] Generating slots.js + lava.js + pancake.js..." -ForegroundColor Yellow
$proc3 = Start-Process powershell -ArgumentList @(
    '-NoProfile',
    '-Command',
    "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; chcp 65001 | Out-Null; Set-Location '$gamesDir'; opencode run --model 'opencode/deepseek-v4-flash-free' --dangerously-skip-permissions `$(Get-Content '$rootDir\opencode_prompt_3games.txt' -Raw -Encoding UTF8) *> '$rootDir\oc_3games.txt'"
) -PassThru
Write-Host "3-Games PID: $($proc3.Id)"

Write-Host "`nAll 3 OpenCode jobs dispatched. Waiting for completion..." -ForegroundColor Cyan

# Wait for all processes
$proc1.WaitForExit()
Write-Host "buzzer.js job DONE (exit: $($proc1.ExitCode))" -ForegroundColor Green

$proc2.WaitForExit()
Write-Host "fisher.js job DONE (exit: $($proc2.ExitCode))" -ForegroundColor Green

$proc3.WaitForExit()
Write-Host "slots+lava+pancake jobs DONE (exit: $($proc3.ExitCode))" -ForegroundColor Green

Write-Host "`n=== Checking generated files ===" -ForegroundColor Cyan
$files = @('buzzer.js', 'fisher.js', 'slots.js', 'lava.js', 'pancake.js')
foreach ($f in $files) {
    $path = "$gamesDir\$f"
    if (Test-Path $path) {
        $size = (Get-Item $path).Length
        Write-Host "  [OK] $f ($size bytes)" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $f" -ForegroundColor Red
    }
}
Write-Host "`nDone!" -ForegroundColor Cyan
