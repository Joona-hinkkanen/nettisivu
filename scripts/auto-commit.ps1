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

while ($true) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

    # 1) Committaa paikalliset muutokset, jos niita on.
    $changes = git status --porcelain
    if ($changes) {
        git add -A | Out-Null
        git commit -m "Auto-commit $timestamp" | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[$timestamp] Commit tehty."
        }
        else {
            Write-Host "[$timestamp] Ei commitoitavaa."
        }
    }

    # 2) Puskaa aina kun pushattavaa on. Tama yrittaa uudelleen myos
    #    edellisella kierroksella epaonnistuneen pushin, vaikka uusia
    #    tiedostomuutoksia ei olisi.
    $aheadRaw = git rev-list --count '@{u}..HEAD' 2>$null
    $ahead = -1
    if ($LASTEXITCODE -eq 0 -and $aheadRaw) {
        $ahead = [int]$aheadRaw
    }

    if ($ahead -lt 0) {
        Write-Host "[$timestamp] VAROITUS: upstream-haaraa ei loytynyt. Ajetaan git push -u origin HEAD."
        git push -u origin HEAD | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[$timestamp] Pushattu GitHubiin (asetti upstreamin)."
        }
        else {
            Write-Host "[$timestamp] VAROITUS: git push epaonnistui. Yritetaan uudelleen seuraavalla kierroksella."
        }
    }
    elseif ($ahead -gt 0) {
        # Hae muiden muutokset ennen pushia
        git pull --rebase --autostash | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[$timestamp] VAROITUS: git pull epaonnistui (mahdollinen konflikti)."
            Write-Host "Ratkaise konflikti kasin ja aja sitten git rebase --continue."
        }
        else {
            git push | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[$timestamp] Pushattu GitHubiin."
            }
            else {
                Write-Host "[$timestamp] VAROITUS: git push epaonnistui. Yritetaan uudelleen seuraavalla kierroksella."
            }
        }
    }

    Start-Sleep -Seconds $IntervalSeconds
}
