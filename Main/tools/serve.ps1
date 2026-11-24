# Minimal static file server for previewing the site locally (Windows PowerShell 5.1+).
#   powershell -ExecutionPolicy Bypass -File tools/serve.ps1 -Port 8080
# The repo folder also holds .env.local (secret key), .git and private notes, and the pages run
# third-party script on this origin, so only the files listed below are served, and only to this PC.
param([int]$Port = 8080)

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$rootPrefix = $root.TrimEnd('\') + '\'
$publicFiles = @('index.html', 'board.html')
$publicDirs = @('assets', 'dashboard', 'data')
# Also the list of file types that may be served.
$mime = @{
  '.html' = 'text/html; charset=utf-8'; '.css' = 'text/css; charset=utf-8'
  '.js' = 'text/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'; '.svg' = 'image/svg+xml'
  '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'; '.webp' = 'image/webp'
  '.ico' = 'image/x-icon'
}

# Returns the file to serve for an undecoded URL path, or nothing for a 404.
function Resolve-PublicFile([string]$urlPath) {
  # Plain names only, never decoded: no dot-names, '..', '\', '%', ':', '~', or trailing dots and spaces.
  # Keep -cnotmatch and \z: ignoring case lets some non-ASCII letters in, and $ allows a final newline.
  if ($urlPath -cnotmatch '^/([A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*(/|\z))*\z') { return }

  $rel = $urlPath.Substring(1)
  if ($rel -eq '' -or $rel.EndsWith('/')) { $rel += 'index.html' }
  $names = $rel.Split('/')
  if ($names.Count -eq 1) {
    if ($publicFiles -cnotcontains $rel) { return }
  } elseif ($publicDirs -cnotcontains $names[0]) { return }
  if (-not $mime.ContainsKey([IO.Path]::GetExtension($rel))) { return }

  # Match names against the directory listing rather than opening the requested path: Windows would
  # also accept other casings, 8.3 short names and device names. Links could point outside the root.
  $item = New-Object IO.DirectoryInfo $root
  foreach ($name in $names) {
    if ($item -isnot [IO.DirectoryInfo]) { return }
    $item = $item.GetFileSystemInfos() | Where-Object { $_.Name.Equals($name) }
    if (-not $item -or ($item.Attributes -band [IO.FileAttributes]::ReparsePoint)) { return }
  }
  if ($item -is [IO.FileInfo] -and $item.FullName.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase)) {
    return $item.FullName
  }
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $root at http://localhost:$Port/"

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $res = $ctx.Response
    try {
      $urlPath = $ctx.Request.RawUrl.Split('?')[0]
      $path = $null
      # A localhost prefix only checks the Host header; HTTP.sys still accepts connections on every interface.
      if ([Net.IPAddress]::IsLoopback($ctx.Request.RemoteEndPoint.Address)) { $path = Resolve-PublicFile $urlPath }
      if (-not $path) {
        $res.StatusCode = 404
        $bytes = [Text.Encoding]::UTF8.GetBytes('Not found')
      } else {
        $res.ContentType = $mime[[IO.Path]::GetExtension($path)]
        $res.Headers.Add('Cache-Control', 'no-store')
        $bytes = [IO.File]::ReadAllBytes($path)
      }
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
      Write-Host "$($res.StatusCode) $urlPath"
    } catch {
      Write-Host "ERR $($_.Exception.Message)"
    } finally {
      $res.OutputStream.Close()
    }
  }
} finally {
  $listener.Stop()
}
