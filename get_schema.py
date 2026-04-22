import urllib.request
import json
url = "https://znmbkxmnwuurzhevfxtq.supabase.co/rest/v1/courses?select=*&limit=1"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Nzk1MDQsImV4cCI6MjA4MDE1NTUwNH0.y0m9rnug3WduVyuKZLL25PBA4C2Ys0_WSgMrzokSh5g"
req = urllib.request.Request(url, headers={'apikey': key, 'Authorization': f'Bearer {key}'})
data = urllib.request.urlopen(req).read()
print(json.dumps(json.loads(data), indent=2))
