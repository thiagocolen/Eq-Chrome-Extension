# build.ps1
# Assembles dist/chrome and dist/firefox, each a self-contained folder ready
# to load unpacked (chrome://extensions) or as a temporary add-on
# (about:debugging#/runtime/this-firefox).

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

$shared = @(
    'background.js',
    'audio-graph.js',
    'assets',
    'popup',
    'vendor'
)

function New-Build($browser, $manifestSource, $extraDirs) {
    $target = Join-Path $root "dist/$browser"
    if (Test-Path $target) { Remove-Item -Recurse -Force $target }
    New-Item -ItemType Directory -Force -Path $target | Out-Null

    foreach ($item in $shared + $extraDirs) {
        Copy-Item -Path (Join-Path $root $item) -Destination $target -Recurse -Force
    }
    Copy-Item -Path (Join-Path $root $manifestSource) -Destination (Join-Path $target 'manifest.json') -Force

    Write-Host "Built dist/$browser"
}

New-Build 'chrome' 'manifest.json' @('offscreen')
New-Build 'firefox' 'manifest.firefox.json' @('capture')
