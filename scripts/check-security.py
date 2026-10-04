import subprocess, time, urllib.request, urllib.error, json, tempfile
from pathlib import Path

project=str(Path(__file__).resolve().parents[1])
base='http://127.0.0.1:3015'
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl): return None
opener=urllib.request.build_opener(NoRedirect)
def request(path, data=None, extra=None):
    headers={'Content-Type':'application/json','Origin':base}
    headers.update(extra or {})
    req=urllib.request.Request(base+path,data=data,headers=headers)
    try: response=opener.open(req,timeout=25)
    except urllib.error.HTTPError as e: response=e
    return response.status, response.headers, response.read().decode()

with tempfile.TemporaryFile(mode='w+') as log:
    server=subprocess.Popen(['node','node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3015'],cwd=project,stdout=log,stderr=log)
    try:
        for _ in range(80):
            try:
                request('/login'); break
            except (urllib.error.URLError,ConnectionError): time.sleep(.1)
        results=[]
        def check(label,condition):
            assert condition,label
            results.append(label)
        s,h,b=request('/casamento')
        check('casamento public 200',s==200)
        check('public page has no login link','href="/login"' not in b)
        check('public logo points to top','aria-label="Voltar ao início"' in b)
        check('anti-framing and nosniff headers',h.get('X-Frame-Options')=='SAMEORIGIN' and h.get('X-Content-Type-Options')=='nosniff')
        s,h,b=request('/')
        check('root redirects to casamento',s in (307,308) and h.get('Location')=='/casamento')
        for path in ['/login','/recuperar-senha']:
            s,h,b=request(path)
            check(path+' noindex',s==200 and 'noindex' in h.get('X-Robots-Tag',''))
        for path in ['/admin','/admin/convidados','/mfa']:
            s,h,b=request(path)
            check(path+' blocks anonymous user',s==307 and h.get('Location','').endswith('/login'))
        for path in ['/api/rsvp/search','/api/rsvp/suggest','/api/rsvp/confirm']:
            s,h,b=request(path,b'null')
            check(path+' rejects null JSON '+str((s,b)),s==400)
            s,h,b=request(path,b'{}',{'Origin':'https://foreign.example'})
            check(path+' rejects foreign origin',s==403)
            s,h,b=request(path,b'{}',{'Content-Type':'text/plain'})
            check(path+' rejects non-JSON content type',s==415)
            s,h,b=request(path,json.dumps({'query':'x'*70000}).encode())
            check(path+' limits body size',s==413)
            check(path+' private no-store','no-store' in h.get('Cache-Control',''))
        s,h,b=request('/api/rsvp/confirm',b'{}',{'Cookie':'jjrsvp=%ZZ'})
        check('malformed cookie is 401, not 500',s==401)
        fake='00000000-0000-4000-8000-000000000001'
        s,h,b=request('/api/rsvp/confirm',json.dumps({'attending':True,'companions':[],'children':[None]}).encode(),{'Cookie':f'jjrsvp={fake}.{fake}'})
        check('malformed child rejected before database',s==400)
        s,h,b=request('/auth/logout',b'',{'Origin':'https://foreign.example','Content-Type':'application/x-www-form-urlencoded'})
        check('logout rejects cross-origin',s==403)
        s,h,b=request('/api/rsvp/suggest',b'{"query":"zzAuditNoMatchingGuestzz"}')
        check('valid search reaches Supabase successfully',s==200 and json.loads(b)=={'results':[]})
        print(json.dumps({'passed':len(results),'checks':results},ensure_ascii=False))
    finally:
        server.terminate()
        server.wait(timeout=10)
