$Target = "C:\SBP_Project\master-app"
Copy-Item -Path ".\*" -Destination $Target -Recurse -Force
Write-Host "Enterprise IAM patch copied. Run sql/PATCH_005_enterprise_iam.sql in Supabase, then restart npm run dev."
