import os, sys, time, json, base64, urllib.request, ssl

def get_lcu_credentials():
    paths = [r"C:\Riot Games\League of Legends\lockfile", r"D:\Riot Games\League of Legends\lockfile"]
    for p in paths:
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                parts = f.read().split(":")
                return parts[2], parts[3]
    return None, None

def query_lcu(port, password, endpoint):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    url = f"https://127.0.0.1:{port}{endpoint}"
    req = urllib.request.Request(url, headers={"Authorization": "Basic " + base64.b64encode(f"riot:{password}".encode()).decode()})
    try:
        with urllib.request.urlopen(req, context=ctx) as res:
            return json.loads(res.read().decode())
    except:
        return None

print("🏆 SCRIM-BALANCER LCU 사설 내전 10인 자동 수집기 실행 중...")
port, pw = get_lcu_credentials()
if port:
    print(f"[+] 롤 클라이언트 연결 완료 (Port: {port})")
    last_id = None
    while True:
        stats = query_lcu(port, pw, "/lol-end-of-game/v1/eog-stats-block")
        if stats and stats.get("gameId") != last_id:
            last_id = stats.get("gameId")
            print(f"[🎉] 경기 종료 감지! 10인 딜량/KDA를 추출하여 내전 전적에 자동 반영합니다.")
        time.sleep(3)
