from pathlib import Path
import subprocess,socket,urllib.request,urllib.error,urllib.parse,http.cookiejar,threading,json,re,os,time,datetime
from http.server import HTTPServer,BaseHTTPRequestHandler
import argparse
parser=argparse.ArgumentParser(description='Real HTTP OAuth/SSE regression with a simulated 64 KiB FastCGI buffer; localhost only.')
parser.add_argument('--output',required=True,help='Fresh output directory outside the application source tree')
parser.add_argument('--php',default='php',help='PHP executable path')
args=parser.parse_args()
ROOT=Path(__file__).resolve().parent.parent
PROJECT_RELEASE=re.search(r"SERVER_RELEASE = '([^']+)'", (ROOT / "CoreExt/AiTools/Project/ProjectAi.php").read_text(encoding="utf-8")).group(1)
OUT=Path(args.output).resolve()
assert not OUT.is_relative_to(ROOT), 'Regression output belongs outside the application source tree'
OUT.mkdir(parents=True,exist_ok=True);(OUT/'sessions').mkdir(exist_ok=True)
assert not (OUT/'state.json').exists(), 'Keep previous fixture evidence; choose a fresh output path'
ORIGIN='https://furniture.http-fixture.example';RESOURCE=ORIGIN+'/api/mcp/'
processes=[];logs=[];ports=[];checks=[];proxy=None
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*args,**kwargs):return None
def request(port,path,body=None,headers=None,method=None,opener=None,raw=False):
    if isinstance(body,dict):body=json.dumps(body).encode()
    req=urllib.request.Request(f'http://127.0.0.1:{port}'+path,data=body,headers=headers or {},method=method)
    try:r=(opener or urllib.request).open(req,timeout=15) if opener else urllib.request.urlopen(req,timeout=15)
    except urllib.error.HTTPError as e:r=e
    data=r.read()
    if raw:return r.code,data,r.headers
    try:data=json.loads(data)
    except ValueError:pass
    return r.code,data,r.headers
def check(ok,name):
    checks.append({'check':name,'ok':bool(ok)})
    if not ok:raise AssertionError(name)
def rpc(method,params=None,id=1):return {'jsonrpc':'2.0','id':id,'method':method,'params':params or {}}
def form(data):return urllib.parse.urlencode(data).encode()
def auth_payload(client='furniture-claude'):
    import hashlib,base64
    verifier='v'*64;challenge=base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).decode().rstrip('=')
    return {'client_id':client,'redirect_uri':'https://claude.ai/api/mcp/auth_callback','response_type':'code','scope':'mcp','state':'fixture-state','resource':RESOURCE,'code_challenge_method':'S256','code_challenge':challenge}
try:
    for i in range(2):
        with socket.socket() as sock:sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
        ports.append(port);log=(OUT/f'worker-{i}.log').open('wb');logs.append(log)
        proc=subprocess.Popen([args.php,'-S',f'127.0.0.1:{port}',str(ROOT/'tests/OAuthHttpFixture.php')],stdout=log,stderr=log,env=dict(os.environ,FURNITURE_TEST_DATA=str(OUT)),creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0));processes.append(proc)
        for attempt in range(40):
            try:request(port,'/health');break
            except OSError:time.sleep(.1)
    a,b=ports
    for path in ['/.well-known/oauth-protected-resource','/.well-known/oauth-protected-resource/api/mcp','/.well-known/oauth-protected-resource/api/mcp/sse']:
        code,data,_=request(b,path);check(code==200 and data['resource']==RESOURCE and data['authorization_servers']==[ORIGIN], 'Protected resource discovery '+path)
    code,data,_=request(b,'/.well-known/oauth-authorization-server')
    check(code==200 and data['code_challenge_methods_supported']==['S256'] and data['token_endpoint_auth_methods_supported']==['none'],'Public OAuth metadata')
    code,_,headers=request(b,'/api/mcp/',rpc('initialize',{'protocolVersion':'2025-11-25'}),{'Content-Type':'application/json'})
    check(code==401 and 'resource_metadata=' in headers.get('WWW-Authenticate',''),'401 points to discovery')
    code,data,_=request(b,'/api/oauth/register',{'redirect_uris':['https://claude.ai/api/mcp/auth_callback'],'token_endpoint_auth_method':'none'},{'Content-Type':'application/json'})
    check(code==201 and data['client_id']=='furniture-claude' and 'client_secret' not in data,'Public registration without secret')
    # Exercise initially anonymous OAuth through the actual login controller/template.
    fresh=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()),NoRedirect())
    login_request=auth_payload();login_start='/mcp/oauth/authorize/?'+urllib.parse.urlencode(login_request)
    code,_,headers=request(b,login_start,opener=fresh,raw=True)
    login_path=headers.get('Location','');check(code==302 and login_path.startswith('/login/?mcp_oauth=olr_'),'Anonymous OAuth redirects to same-tab login')
    ticket=urllib.parse.parse_qs(urllib.parse.urlsplit(login_path).query)['mcp_oauth'][0]
    code,html,_=request(b,login_path,opener=fresh,raw=True)
    check(code==200 and ('name="mcp_oauth" value="'+ticket+'"').encode() in html,'Actual login form carries session-bound OAuth ticket')
    (OUT/'login-rendered.js').write_bytes(re.search(rb'<script>(.*?)</script>',html,re.S)[1])
    credentials={'action':'login','login':'fixture-owner','pass':'wrong-password','mcp_oauth':ticket}
    code,body,_=request(b,'/ajax/auth/',form(credentials),{'Content-Type':'application/x-www-form-urlencoded'},opener=fresh)
    check(body['status']=='error','Wrong password cannot resume OAuth')
    credentials['pass']='fixture-password'
    code,body,_=request(b,'/ajax/auth/',form(credentials),{'Content-Type':'application/x-www-form-urlencoded'},opener=fresh)
    resume_path=body.get('redirect_url','');check(code==200 and body['status']=='ok' and resume_path=='/mcp/oauth/authorize/?mcp_login='+ticket,'Successful real password login returns exact OAuth continuation')
    code,_,headers=request(b,login_path,opener=fresh,raw=True);check(code==302 and headers.get('Location')==resume_path,'Already logged-in login-page request preserves OAuth continuation')
    code,_,headers=request(b,resume_path,opener=fresh,raw=True);consent_path=headers.get('Location','')
    check(code==302 and consent_path.startswith('/mcp/oauth/authorize/?') and urllib.parse.parse_qs(urllib.parse.urlsplit(consent_path).query)['state']==[login_request['state']],'Resume restores validated request and clears ticket URL')
    code,_,_=request(b,resume_path,opener=fresh);check(code==400,'Consumed login ticket cannot replay')
    code,html,_=request(b,consent_path,opener=fresh,raw=True);check(code==200 and 'Разрешить чтение'.encode() in html,'Login returns to explicit consent, not homepage or automatic grant')
    nonce=re.search(rb'name="consent_nonce" value="([^"]+)"',html)[1].decode()
    code,_,headers=request(b,consent_path,form({'consent_nonce':nonce,'decision':'allow'}),{'Content-Type':'application/x-www-form-urlencoded','Origin':ORIGIN},opener=fresh,raw=True)
    callback=urllib.parse.parse_qs(urllib.parse.urlsplit(headers.get('Location','')).query)
    check(code==302 and callback.get('state')==[login_request['state']] and callback.get('iss')==[ORIGIN] and 'code' in callback,'After initially anonymous login consent returns full OAuth callback')
    code,data,_=request(b,'/api/oauth/token/',form({'client_id':'furniture-claude','grant_type':'authorization_code','code':callback['code'][0],'redirect_uri':login_request['redirect_uri'],'resource':RESOURCE,'code_verifier':'v'*64}),{'Content-Type':'application/x-www-form-urlencoded'})
    check(code==200 and data['token_type']=='Bearer','Initially anonymous flow completes PKCE exchange')
    stranger=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()),NoRedirect())
    code,_,_=request(b,login_path,opener=stranger);check(code==400,'Login ticket unavailable to another browser session')
    code,_,headers=request(b,'/login/',opener=fresh,raw=True);check(code==302 and headers.get('Location')=='/','Ordinary authenticated login still returns homepage')
    ordinary=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()),NoRedirect())
    code,_,_=request(b,'/login/',headers={'Referer':'https://evil.example/'},opener=ordinary,raw=True);check(code==200,'Ordinary anonymous login form remains available')
    code,body,_=request(b,'/ajax/auth/',form({'action':'login','login':'fixture-owner','pass':'fixture-password'}),{'Content-Type':'application/x-www-form-urlencoded'},opener=ordinary)
    check(code==200 and body['redirect_url']=='/','Normal password login ignores arbitrary referer')
    expired=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()),NoRedirect())
    code,_,headers=request(b,login_start,opener=expired,raw=True);expired_login=headers['Location']
    request(b,'/fixture/expire-login',opener=expired)
    code,_,_=request(b,expired_login,opener=expired);check(code==400,'Expired login continuation fails explicitly')

    clients=[]
    for user in [1,2]:
        opener=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()),NoRedirect());clients.append(opener)
        request(b,f'/fixture/login?id={user}',opener=opener)
        payload=auth_payload();path='/mcp/oauth/authorize/?'+urllib.parse.urlencode(payload)
        code,html,_=request(b,path,opener=opener,raw=True)
        check(code==200 and 'Разрешить чтение'.encode() in html,'Logged-in consent page '+str(user))
        nonce=re.search(rb'name="consent_nonce" value="([^"]+)"',html)[1].decode()
        code,_,headers=request(b,'/mcp/oauth/authorize/',form({'consent_nonce':nonce,'decision':'allow'}),{'Content-Type':'application/x-www-form-urlencoded','Origin':ORIGIN},opener=opener,raw=True)
        check(code==302 and headers['Location'].startswith('https://claude.ai/api/mcp/auth_callback?'),'Consent redirects only to registered callback')
        returned=urllib.parse.parse_qs(urllib.parse.urlsplit(headers['Location']).query)
        check(returned['state']==['fixture-state'] and returned['iss']==[ORIGIN],'OAuth state and issuer retained')
        code,tokens,_=request(b,'/api/oauth/token/',form({'client_id':'furniture-claude','grant_type':'authorization_code','code':returned['code'][0],'redirect_uri':payload['redirect_uri'],'resource':RESOURCE,'code_verifier':'v'*64}),{'Content-Type':'application/x-www-form-urlencoded'})
        check(code==200 and tokens['token_type']=='Bearer','Code exchange '+str(user))
        if user==1:owner=tokens
        else:seller=tokens
    bearer={'Authorization':'Bearer '+owner['access_token'],'Content-Type':'application/json'}
    code,data,_=request(b,'/api/mcp/',rpc('initialize',{'protocolVersion':'2025-11-25'}),bearer)
    check(code==200 and data['result']['serverInfo']['version']==PROJECT_RELEASE,'Modern initialize release')
    code,data,_=request(b,'/api/mcp/',rpc('tools/list'),bearer)
    names=[t['name'] for t in data['result']['tools']];check(code==200 and names==['getContext','getCapabilities','catalog_search'],'Effective OAuth catalog')
    code,data,_=request(b,'/api/mcp/',rpc('tools/call',{'name':'getContext','arguments':{}}),bearer)
    check(data['result']['structuredContent']['data']['actor']['id']==1,'OAuth actor is real logged-in user')
    code,data,_=request(b,'/api/mcp/',rpc('tools/call',{'name':'getCapabilities','arguments':{'client_tool_names':['getContext','getCapabilities']}}),bearer)
    summary=data['result']['structuredContent']['data'];check(summary['server_release']==PROJECT_RELEASE and summary['tool_catalog_status']['missing_tools']==['catalog_search'] and 'Refresh' in summary['tool_catalog_status']['instruction'],'Same release and stale catalog diagnostics')
    code,data,_=request(b,'/api/mcp/',rpc('tools/call',{'name':'catalog_search','arguments':{'page_size':1}}),bearer)
    check(code==200 and not data['result']['isError'] and data['result']['structuredContent']['data']['list'][0]['sku']=='000123','OAuth tool dispatch preserves SKU and uses read permission')
    code,data,_=request(b,'/api/mcp/',rpc('tools/call',{'name':'furniture_order_brief','arguments':{'order_id':724}}),bearer)
    check(code==200 and data['result']['isError'] and data['result']['structuredContent']['error']['code']=='CAPABILITY_NOT_AVAILABLE','Old catalog token cannot call new business tool')
    code,data,_=request(b,'/api/oauth/token/',form({'client_id':'furniture-claude','grant_type':'refresh_token','refresh_token':owner['refresh_token'],'scope':'mcp furniture.orders.read furniture.cash.read'}),{'Content-Type':'application/x-www-form-urlencoded'})
    check(code==400 and data['error']=='invalid_scope','HTTP refresh cannot escalate old token')
    business_tokens=[]
    for user,opener in zip([1,2],clients):
        payload=auth_payload();business_path='/mcp/oauth/authorize/?'+urllib.parse.urlencode(payload)
        code,html,_=request(b,business_path,opener=opener,raw=True)
        check(code==200 and b'name="business_read" value="1" >' in html,'Optional business consent starts unchecked '+str(user))
        nonce=re.search(rb'name="consent_nonce" value="([^"]+)"',html)[1].decode()
        code,_,headers=request(b,'/mcp/oauth/authorize/',form({'consent_nonce':nonce,'decision':'allow','business_read':'1'}),{'Content-Type':'application/x-www-form-urlencoded','Origin':ORIGIN},opener=opener,raw=True)
        returned=urllib.parse.parse_qs(urllib.parse.urlsplit(headers['Location']).query)
        code,tokens,_=request(b,'/api/oauth/token/',form({'client_id':'furniture-claude','grant_type':'authorization_code','code':returned['code'][0],'redirect_uri':payload['redirect_uri'],'code_verifier':'v'*64}),{'Content-Type':'application/x-www-form-urlencoded'})
        business_tokens.append(tokens)
        new_headers={'Authorization':'Bearer '+tokens['access_token'],'Content-Type':'application/json'}
        code,data,_=request(b,'/api/mcp/',rpc('tools/list'),new_headers)
        names=[t['name'] for t in data['result']['tools']]
        check(len(names)==(6 if user==1 else 5) and ('furniture_cash_report' in names)==(user==1),'Business catalog respects actual role '+str(user))
        code,data,_=request(b,'/api/mcp/',rpc('tools/call',{'name':'furniture_order_brief','arguments':{'order_id':724}}),new_headers)
        result=data['result']['structuredContent']
        check((result['ok'] and result['data']['goods']['debt']=='0.10') if user==1 else (not result['ok'] and result['error']['code']=='RECORD_NOT_FOUND'),'HTTP order read/foreign ID boundary '+str(user))
        check(json.loads(data['result']['content'][0]['text'])==result,'Raw content equals structuredContent '+str(user))
    business_headers={'Authorization':'Bearer '+business_tokens[0]['access_token'],'Content-Type':'application/json'}
    code,data,_=request(b,'/api/mcp/',rpc('tools/call',{'name':'furniture_order_brief','arguments':{'order_id':724,'manager_id':1}}),business_headers)
    check(data['result']['structuredContent']['error']['code']=='INVALID_INPUT','Business tool rejects model-supplied manager_id')
    code,data,_=request(b,'/api/mcp/',rpc('tools/call',{'name':'furniture_cash_report','arguments':{'date_from':'2026-10-17','page_size':2}}),business_headers)
    check(code==200 and data['result']['structuredContent']['data']['income']=='0.00','HTTP exact cash empty-day fixture')
    code,_,_=request(b,'/api/mcp/',rpc('ping'),dict(bearer,Origin='https://evil.example'));check(code==403,'Foreign browser origin denied')
    code,_,_=request(b,'/api/mcp/',None,dict(bearer,Accept='application/json, text/event-stream'),method='GET');check(code==405,'Sessionless combined GET falls back quickly')
    endpoint_ready=threading.Event();stream_done=threading.Event();events=[];holder={}
    # Reproduce the hosting's 64 KiB FastCGI buffering, rather than checking padding text.
    class BufferingProxy(BaseHTTPRequestHandler):
        def log_message(self,*args):pass
        def do_GET(self):
            req=urllib.request.Request(f'http://127.0.0.1:{a}/api/mcp/',headers={'Authorization':self.headers['Authorization'],'Accept':'text/event-stream'})
            with urllib.request.urlopen(req,timeout=15) as upstream:
                self.send_response(upstream.code);self.send_header('Content-Type',upstream.headers['Content-Type']);self.end_headers();pending=b''
                while True:
                    chunk=upstream.read1(4096)
                    if not chunk:break
                    pending+=chunk
                    if len(pending)>=65536:self.wfile.write(pending);self.wfile.flush();pending=b''
                if pending:self.wfile.write(pending);self.wfile.flush()
    proxy=HTTPServer(('127.0.0.1',0),BufferingProxy)
    threading.Thread(target=proxy.serve_forever,daemon=True).start()
    def listen():
        try:
            req=urllib.request.Request(f'http://127.0.0.1:{proxy.server_port}/api/mcp/',headers={'Authorization':bearer['Authorization'],'Accept':'text/event-stream'})
            with urllib.request.urlopen(req,timeout=15) as response:
                holder['content_type']=response.headers.get('Content-Type');event=None
                for line in response:
                    line=line.decode().strip()
                    if line.startswith('event:'):event=line[6:].strip()
                    elif line.startswith('data:'):
                        value=line[5:].strip();events.append((event,value))
                        if event=='endpoint':holder['path']=urllib.parse.urlsplit(value).path+'?'+urllib.parse.urlsplit(value).query;holder['sid']=urllib.parse.parse_qs(urllib.parse.urlsplit(value).query)['sessionId'][0];endpoint_ready.set()
        except Exception as error:holder['error']=str(error)
        finally:stream_done.set()
    started=time.monotonic();thread=threading.Thread(target=listen);thread.start();check(endpoint_ready.wait(5),'Legacy SSE endpoint event')
    sid=holder['sid'];message_path=holder['path']
    check(holder['content_type'].startswith('text/event-stream'),'Real SSE content type')
    code,_,_=request(b,message_path,rpc('initialize',{'protocolVersion':'2024-11-05'},11),dict(bearer,**{'MCP-Protocol-Version':'2024-11-05'}));check(code==202,'Legacy initialize accepted through messages')
    code,body,_=request(b,'/api/mcp/',None,dict(bearer,Accept='application/json, text/event-stream',**{'Mcp-Session-Id':sid}),method='GET',raw=True)
    match=re.search(rb'event: message\ndata: ([^\n]+)',body);catalog=json.loads(match[1]) if match else {}
    check(code==200 and catalog.get('id')==1 and len(catalog['result']['tools'])==3,'Claude hybrid automatic catalog bootstrap')
    code,body,_=request(b,'/api/mcp/',None,dict(bearer,Accept='text/event-stream',**{'Mcp-Session-Id':sid}),method='GET',raw=True)
    check(code==200 and b'stream already connected' in body,'Duplicate listener cannot drain original queue')
    code,_,_=request(b,message_path,rpc('tools/list',id=12),bearer);check(code==202,'Legacy tools/list queued')
    code,_,_=request(b,message_path,rpc('tools/call',{'name':'catalog_search','arguments':{'page_size':1}},13),bearer);check(code==202,'Legacy catalog tool queued')
    code,_,_=request(b,message_path,rpc('tools/call',{'name':'furniture_order_brief','arguments':{'order_id':724}},14),bearer);check(code==202,'Old SSE token business denial queued')
    foreign=dict(bearer,Authorization='Bearer '+seller['access_token'])
    code,_,_=request(b,message_path,rpc('tools/list'),foreign);check(code==404,'Other account cannot use SSE session')
    code,_,_=request(b,'/api/mcp/sse/?sessionId=../bad',None,bearer,method='GET');check(code==404,'Malformed session rejected')
    deadline=time.monotonic()+3
    while time.monotonic()<deadline and not any(e=='message' and json.loads(v).get('id')==14 for e,v in events):time.sleep(.05)
    replies=[json.loads(v) for e,v in events if e=='message']
    check(any(r.get('id')==11 and r.get('result',{}).get('protocolVersion')=='2024-11-05' for r in replies),'Legacy initialize response delivered over original SSE')
    check(any(r.get('id')==12 and len(r['result']['tools'])==3 for r in replies),'Actual tools/list response delivered over SSE')
    check(any(r.get('id')==13 and r['result']['structuredContent']['data']['list'][0]['sku']=='000123' for r in replies),'Actual catalog tool result delivered through 64 KiB FastCGI buffer before stream close')
    check(any(r.get('id')==14 and r['result']['structuredContent']['error']['code']=='CAPABILITY_NOT_AVAILABLE' for r in replies),'Old SSE token cannot read sensitive business data')
    code,_,_=request(b,'/api/oauth/revoke/',form({'client_id':'furniture-claude','token':owner['access_token']}),{'Content-Type':'application/x-www-form-urlencoded'});check(code==200,'OAuth revocation endpoint')
    code,_,_=request(b,'/api/mcp/',rpc('tools/list'),bearer);check(code==401,'Revoked bearer immediately rejected')
    check(stream_done.wait(8) and time.monotonic()-started<8,'Active SSE stops after bearer revocation')
    check('error' not in holder,'SSE stream finished without transport exception')
    code,_,_=request(b,'/api/mcp/',rpc('tools/list'),foreign);check(code==200,'Seller connection remains active')
    # A separately consented business family keeps its scopes through real HTTP refresh and SSE.
    code,new_business,_=request(b,'/api/oauth/token/',form({'client_id':'furniture-claude','grant_type':'refresh_token','refresh_token':business_tokens[0]['refresh_token']}),{'Content-Type':'application/x-www-form-urlencoded'})
    check(code==200 and new_business['scope']=='mcp furniture.orders.read furniture.cash.read','Business refresh preserves explicit scopes')
    bearer={'Authorization':'Bearer '+new_business['access_token'],'Content-Type':'application/json'}
    endpoint_ready=threading.Event();stream_done=threading.Event();events=[];holder={}
    started=time.monotonic();thread=threading.Thread(target=listen);thread.start();check(endpoint_ready.wait(5),'New business SSE endpoint')
    code,_,_=request(b,holder['path'],rpc('tools/call',{'name':'furniture_order_brief','arguments':{'order_id':724}},21),bearer)
    check(code==202,'Business order call queued through legacy transport')
    deadline=time.monotonic()+3
    while time.monotonic()<deadline and not any(e=='message' and json.loads(v).get('id')==21 for e,v in events):time.sleep(.05)
    business_replies=[json.loads(v) for e,v in events if e=='message']
    check(any(r.get('id')==21 and r['result']['structuredContent']['data']['goods']['debt']=='0.10' for r in business_replies),'New business order delivered through 64 KiB FastCGI SSE buffer')
    request(b,'/api/oauth/revoke/',form({'client_id':'furniture-claude','token':new_business['access_token']}),{'Content-Type':'application/x-www-form-urlencoded'})
    check(stream_done.wait(8),'Business SSE closes after its own family is revoked')
    request(b,'/fixture/login?id=1',opener=clients[0]);path='/mcp/oauth/authorize/?'+urllib.parse.urlencode(auth_payload())
    code,html,_=request(b,path,opener=clients[0],raw=True);nonce=re.search(rb'name="consent_nonce" value="([^"]+)"',html)[1].decode()
    code,body,_=request(b,'/mcp/oauth/authorize/',form({'consent_nonce':nonce,'decision':'allow'}),{'Content-Type':'application/x-www-form-urlencoded','Origin':'https://evil.example'},opener=clients[0],raw=True)
    check(code==400 and b'consent_origin' in body,'Consent origin forgery rejected')
    print(json.dumps({'ok':True,'http_checks':len(checks),'sse_messages':[r.get('id') for r in replies]}))
finally:
    for p in processes:p.terminate()
    for p in processes:p.wait(timeout=5)
    for log in logs:log.close()
    if proxy is not None:proxy.shutdown();proxy.server_close()
    (OUT.parent/'oauth-sse-http.json').write_text(json.dumps({'observed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checks':checks},ensure_ascii=False,indent=2),encoding='utf-8')
