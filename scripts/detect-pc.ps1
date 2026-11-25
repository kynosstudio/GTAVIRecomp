param(
  [string]$OutputPath = (Join-Path -Path (Get-Location).Path -ChildPath 'kynos-hardware-report.json')
)

$ErrorActionPreference = 'Stop'

function Get-MemoryGeneration {
  param([int]$SmbiosMemoryType)

  switch ($SmbiosMemoryType) {
    26 { 'ddr4'; break }
    34 { 'ddr5'; break }
    default { $null }
  }
}

$processor = Get-CimInstance -ClassName Win32_Processor | Select-Object -First 1
$videoControllers = @(Get-CimInstance -ClassName Win32_VideoController | ForEach-Object {
  if ($_.Name) {
    [ordered]@{
      name = [string]$_.Name
      driverVersion = [string]$_.DriverVersion
    }
  }
})
$memoryModules = @(Get-CimInstance -ClassName Win32_PhysicalMemory)
$memoryCapacityBytes = ($memoryModules | Measure-Object -Property Capacity -Sum).Sum
$memoryTotalGb = [math]::Round(([double]$memoryCapacityBytes / 1GB), 0)
$memoryTypes = @($memoryModules | ForEach-Object {
  Get-MemoryGeneration -SmbiosMemoryType ([int]$_.SMBIOSMemoryType)
} | Where-Object { $_ } | Select-Object -Unique)
$generation = if ($memoryTypes.Count -eq 1) { $memoryTypes[0] } else { 'unknown' }
$moduleCount = $memoryModules.Count
$channelEstimate = if ($moduleCount -ge 2) { 'dual' } else { 'single' }
$moduleDetails = @($memoryModules | ForEach-Object {
  [ordered]@{
    capacityGb = [math]::Round(([double]$_.Capacity / 1GB), 1)
    speedMhz = if ($_.ConfiguredClockSpeed) { [int]$_.ConfiguredClockSpeed } elseif ($_.Speed) { [int]$_.Speed } else { $null }
    generation = Get-MemoryGeneration -SmbiosMemoryType ([int]$_.SMBIOSMemoryType)
  }
})

$report = [ordered]@{
  schemaVersion = 1
  source = 'kynos-windows-hardware-helper'
  capturedAt = (Get-Date).ToString('o')
  cpu = [ordered]@{
    name = [string]$processor.Name
    logicalProcessors = [int]$processor.NumberOfLogicalProcessors
    cores = [int]$processor.NumberOfCores
  }
  gpu = $videoControllers
  memory = [ordered]@{
    totalGb = $memoryTotalGb
    generation = $generation
    moduleCount = $moduleCount
    channelEstimate = $channelEstimate
    speedMhz = if ($moduleDetails.Count -gt 0) { $moduleDetails[0].speedMhz } else { $null }
    modules = $moduleDetails
  }
  limitations = @(
    'A contagem de módulos sugere, mas não confirma, o modo de canais ativo; confira BIOS/Windows e a placa-mãe.',
    'A classe de memória depende dos dados SMBIOS fornecidos pelo firmware e pode não estar disponível.'
  )
}

$json = $report | ConvertTo-Json -Depth 6
$resolvedPath = [System.IO.Path]::GetFullPath($OutputPath)
$stream = $null
try {
  $stream = [System.IO.File]::Open($resolvedPath, [System.IO.FileMode]::CreateNew, [System.IO.FileAccess]::Write, [System.IO.FileShare]::None)
  $encoding = New-Object System.Text.UTF8Encoding($false)
  $bytes = $encoding.GetBytes($json)
  $stream.Write($bytes, 0, $bytes.Length)
}
catch {
  throw "Não foi possível criar o relatório em '$resolvedPath'. Escolha outro caminho ou renomeie um relatório existente. $($_.Exception.Message)"
}
finally {
  if ($stream) { $stream.Dispose() }
}

Write-Output "Relatório salvo em: $resolvedPath"
Write-Output "CPU: $($processor.Name)"
Write-Output "RAM: $memoryTotalGb GB ($generation), $moduleCount módulo(s); canal $channelEstimate é apenas uma estimativa."
Write-Output 'GPU(s):'
$videoControllers | ForEach-Object { Write-Output " - $($_.name)" }
