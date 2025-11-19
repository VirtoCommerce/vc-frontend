$ApiUrl = "http://localhost:8090"
$appAuthUrl = "$ApiUrl/connect/token"
$blobPackagesUrl = "https://vc3prerelease.blob.core.windows.net/packages"
$checkModulesUrl = "$ApiUrl/api/platform/diagnostics/systeminfo"
$envFilePath = '.env'

function Get-AuthToken {
    param (
        $appAuthUrl,
        $username,
        $password
    )
    Write-Output "Get-AuthToken: appAuthUrl $appAuthUrl"
    $grant_type = "password"
    $content_type = "application/x-www-form-urlencoded"

    $body = @{username = $username; password = $password; grant_type = $grant_type }
    $response = Invoke-WebRequest -Uri $appAuthUrl -Method Post -ContentType $content_type -Body $body -SkipCertificateCheck -MaximumRetryCount 3 -RetryIntervalSec 2
    $responseContent = $response.Content | ConvertFrom-Json
    return $responseContent.access_token
}

Write-Host "`e[32mGetting backend URL from ..\..\.env file..."
$backendUrl = (Get-Content -Path $envFilePath | Select-String -Pattern 'APP_BACKEND_URL').ToString().Split('=')[1]
$ApiUrl = $backendUrl.split(' ')[0]
Write-Host "`e[32mBackend URL: $ApiUrl"
# Local or remote backend
if ($ApiUrl.Contains('localhost')) {
    #local backend
    Write-Host "`e[32mLocal backend detected. Please enter backend credentials..."
    $username = Read-Host "Enter a backend username"
    $password = Read-Host "Enter a backend password" -MaskInput
    $authToken = (Get-AuthToken $appAuthUrl $username $password)[1]
    $headers = @{}
    $headers.Add("Authorization", "Bearer $authToken")
    try {
        $systeminfo = Invoke-RestMethod $checkModulesUrl -Method Get -Headers $headers -SkipCertificateCheck -MaximumRetryCount 5 -RetryIntervalSec 5
    }
    catch {
        Write-Error "Failed to get system info: $_"
        exit 1
    }

    $modules = $systeminfo.InstalledModules
    $modulesHash = @{}
    $modules | ForEach-Object {
        $modulesHash += @{ $_.Id = $_.Version }
    }

    # compose a packages.json file
    $updatedReleaseModules = @()
    $updatedBlobModules = @()

    foreach ($m in $modulesHash.Keys) {
        if ($($modulesHash["$m"].split('.')[2]) -match '[A-za-z-]') {
            # blob version
            $entry = [ordered]@{}
            $entry.Add("Id", "$m")
            $entry.Add("BlobName", "$($modulesHash["$m"])")
            $updatedBlobModules += $entry
        }
        elseif ($($modulesHash["$m"].split('.')[2]) -match '\d+') {
            # release version
            $entry = [ordered]@{}
            $entry.Add("Id", "$m")
            $modulesHash["$m"] -match '\d+\.\d+\.\d+' > $null
            $version = $Matches[0]
            $entry.Add("Version", "$version")
            $updatedReleaseModules += $entry
        }
    }

    Write-Host "`e[32mModules processing complete!"
    Write-Host "`e[32mRelease modules count: $($updatedReleaseModules.Count)"
    Write-Host "`e[32mBlob modules count: $($updatedBlobModules.Count)"

    $packagesJson = $(Invoke-WebRequest -Uri https://raw.githubusercontent.com/VirtoCommerce/vc-modules/refs/heads/master/bundles/latest/package.json).Content | ConvertFrom-Json

    # Save the changes back to the JSON file

    $($packagesJson.Sources | Where-Object { $_.Name -eq 'AzureBlob' }).Modules = $updatedBlobModules
    $($packagesJson.Sources | Where-Object { $_.Name -eq 'GithubReleases' }).Modules = $updatedReleaseModules
    if ($systeminfo.platformVersion.split('.')[2] -match '[A-za-z-]') {
        $packagesJson.PlatformAssetUrl = "$blobPackagesUrl/VirtoCommerce.Platform.$platformVersion.zip"
    }
    else {
        $packagesJson.PlatformVersion = $systeminfo.platformVersion
    }
}
else {
    # remote backend
    Write-Host "`e[32mRemote backend detected. Getting packages.json from '$virtoCloudEnvName' branch..."
    $virtoCloudEnvName = $ApiUrl.Split('//')[1].Split('.')[0]
    $packagesJsonUrl = "https://raw.githubusercontent.com/VirtoCommerce/vc-deploy-dev/refs/heads/$virtoCloudEnvName/backend/packages.json"
    try {
        $packagesJson = $(Invoke-WebRequest -Uri $packagesJsonUrl).Content | ConvertFrom-Json
    }
    catch {
        Write-Error "Failed to get packages.json from $packagesJsonUrl : $_"
        exit 1
    }
}

# post processing: check if the platform version is an alpha and if so, modify
$platformVersion = $packagesJson.PlatformVersion
if ($platformVersion.split('.')[2] -match '[A-za-z-]') {
    Write-Host "`e[32mPlatform version is an alpha. Adding PlatformAssetUrl to packages.json"
    $packagesJson | Add-Member -MemberType NoteProperty -Name "PlatformAssetUrl" -Value "$blobPackagesUrl/VirtoCommerce.Platform.$platformVersion.zip" -Force
}
else {
    Write-Host "`e[32mPlatform version is not an alpha. Keeping packages.json as is"
}

Write-Host "`e[32mSaving packages list to backend-packages.json..."
$packagesJson | ConvertTo-Json -Depth 10 | Set-Content -Path ./backend-packages.json
Write-Host "`e[32mPackages list saved to backend-packages.json"