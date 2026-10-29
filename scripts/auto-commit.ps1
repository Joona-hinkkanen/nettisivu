# Automaattinen commit ja push.
# Kaynnista: kaksoisklikkaa repossa olevaa auto-commit.cmd -tiedostoa
# tai aja: powershell -ExecutionPolicy Bypass -File scripts\auto-commit.ps1
#
# Lopeta: Ctrl+C

param(
    [int]$IntervalSeconds = 120
)

$ErrorActionPreference = "Continue"

# Siirry repon juureen (scriptin ylakansio)
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

if (-not (Test-Path (Join-Path $repoRoot ".git"))) {
    Write-Host "VIRHE: .git-kansiota ei loytynyt. Aja tama repon sisalta."
    exit 1
}

Write-Host "Automaattinen commit kaynnissa."
Write-Host "Tarkistus $IntervalSeconds sekunnin valein. Lopeta painamalla Ctrl+C."
Write-Host ""

$lastPushFailed = $false

while ($true) {
    $changes = git status --porcelain

    if ($changes) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        git add -A | Out-Null

        git commit -m "Auto-commit $timestamp" | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[$timestamp] Commit tehty."

            # Hae muiden muutokset ennen pushia
            git pull --rebase --autostash | Out-Null
            if ($LASTEXITCODE -ne 0) {
                Write-Host "[$timestamp] VAROITUS: git pull epaonnistui (mahdollinen konflikti)."
                Write-Host "Ratkaise konflikti kasin ja aja sitten git rebase --continue."
                $lastPushFailed = $true
            }
            else {
                git push | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "[$timestamp] Pushattu GitHubiin."
                    $lastPushFailed = $false
                }
                else {
                    Write-Host "[$timestamp] VAROITUS: git push epaonnistui. Yritetaan uudelleen seuraavalla kierroksella."
                    $lastPushFailed = $true
                }
            }
        }
        else {
            Write-Host "[$timestamp] Ei commitoitavaa."
        }
    }

    Start-Sleep -Seconds $IntervalSeconds
}
