# lcu_collector.py - 롤 클라이언트 로컬 LCU API 사설 내전 10인 스탯 자동 수집기
import os
import sys
import time
import json
import base64
import urllib.request
import ssl

SERVER_URL = "https://your-scrim-balancer.vercel.app/api/sync"

def get_lcu_credentials():
    possible_paths = [
        r"C:\Riot Games\League of Legends\lockfile",
        r"D:\Riot Games\League of Legends\lockfile",
        r"C:\Program Files\Riot Games\League of Legends\lockfile",
        r"D:\Program Files\Riot Games\League of Legends\lockfile"
    ]
    for p in possible_paths:
        if os.path.exists(p):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    parts = f.read().split(":")
                    if len(parts) >= 4:
                        return parts[2], parts[3]
            except:
                pass
    return None, None

def query_lcu(port, password, endpoint):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    url = f"https://127.0.0.1:{port}{endpoint}"
    auth_header = "Basic " + base64.b64encode(f"riot:{password}".encode()).decode()
    req = urllib.request.Request(url, headers={"Authorization": auth_header})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=3) as response:
            return json.loads(response.read().decode())
    except:
        return None

def main():
    print("=" * 60)
    print(" 🏆 SCRIM-BALANCER LCU 로컬 내전 수집기 (방법 A)")
    print("=" * 60)
    print("[*] 리그 오브 레전드 클라이언트 실행을 감지하는 중...")
    
    last_game_id = None
    
    while True:
        port, password = get_lcu_credentials()
        if not port:
            print("[-] 롤 클라이언트가 켜져 있지 않거나 lockfile을 찾을 수 없습니다. 롤을 실행해주세요... (5초 후 재시도)", end="\r")
            time.sleep(5)
            continue
            
        print(f"\n[+] 롤 클라이언트 연결 성공! (Port: {port}) - 내전 경기 결과 대기 중...")
        
        while True:
            port_check, _ = get_lcu_credentials()
            if not port_check:
                print("\n[!] 롤 클라이언트가 종료되었습니다. 다시 켜질 때까지 대기합니다...")
                break
                
            stats = query_lcu(port, password, "/lol-end-of-game/v1/eog-stats-block")
            if stats and stats.get("gameId") and stats.get("gameId") != last_game_id:
                game_id = stats.get("gameId")
                last_game_id = game_id
                print(f"\n[🎉] 내전 경기 종료 감지! (Game ID: {game_id})")
                
                teams = stats.get("teams", [])
                blue_win = False
                for t in teams:
                    if t.get("teamId") == 100 and t.get("isPlayerTeam") and t.get("won"):
                        blue_win = True
                        
                players = []
                for p in stats.get("participants", []):
                    k = p.get("stats", {}).get("CHAMPIONS_KILLED", 0)
                    d = p.get("stats", {}).get("NUM_DEATHS", 0)
                    a = p.get("stats", {}).get("ASSISTS", 0)
                    dmg = p.get("stats", {}).get("TOTAL_DAMAGE_DEALT_TO_CHAMPIONS", 0)
                    cs = p.get("stats", {}).get("MINIONS_KILLED", 0) + p.get("stats", {}).get("NEUTRAL_MINIONS_KILLED", 0)
                    ai_score = min(99, max(45, round(60 + (k * 2.5) - (d * 3) + (a * 1.5) + (dmg / 1500))))
                    
                    players.append({
                        "name": f"{p.get('summonerName')}#{p.get('tagLine', 'KR1')}",
                        "teamId": p.get("teamId"),
                        "champion": p.get("championName"),
                        "aiScore": ai_score,
                        "kda": f"{k}/{d}/{a} ({'Perfect' if d == 0 else round((k+a)/d, 2)})",
                        "damage": f"{dmg:,}",
                        "cs": cs,
                        "win": (p.get("teamId") == 100 and blue_win) or (p.get("teamId") == 200 and not blue_win)
                    })
                print(f"[+] 총 {len(players)}명의 스탯 추출 완료! 웹사이트 히스토리에 반영할 준비가 되었습니다.")
                
            time.sleep(3)

if __name__ == "__main__":
    main()
