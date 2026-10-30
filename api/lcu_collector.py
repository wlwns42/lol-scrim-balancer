# lcu_collector.py - 롤 클라이언트 로컬 LCU API 사설 내전 10인 스탯 자동 수집기 (완성본)
import os
import sys
import time
import json
import base64
import urllib.request
import ssl
import datetime

SERVER_URL = "https://lol-scrim-balancer.vercel.app/api/sync"

def test_lcu_connection(port, password):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    url = f"https://127.0.0.1:{port}/help"
    auth_header = "Basic " + base64.b64encode(f"riot:{password}".encode()).decode()
    req = urllib.request.Request(url, headers={"Authorization": auth_header})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=1.5) as res:
            return res.status == 200
    except:
        return False

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
                        port = parts[2]
                        password = parts[3]
                        if test_lcu_connection(port, password):
                            return port, password
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

def push_match_to_cloud(match_data):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    try:
        req_get = urllib.request.Request(SERVER_URL, headers={"Accept": "application/json"})
        existing_data = {}
        with urllib.request.urlopen(req_get, context=ctx, timeout=5) as res:
            existing_data = json.loads(res.read().decode())

        match_history = existing_data.get("matchHistory", [])
        match_id = match_data["matchId"]
        if any(m.get("matchId") == match_id for m in match_history):
            print(f"[-] 이미 등록된 경기(ID: {match_id})입니다.")
            return True

        match_history.insert(0, match_data)
        existing_data["matchHistory"] = match_history
        existing_data["updatedAt"] = int(time.time() * 1000)

        json_payload = json.dumps(existing_data).encode("utf-8")
        req_post = urllib.request.Request(
            SERVER_URL,
            data=json_payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req_post, context=ctx, timeout=5) as res:
            resp_json = json.loads(res.read().decode())
            if resp_json.get("success"):
                print(f"[👑 성공] 내전 결과가 웹앱({SERVER_URL})에 완벽히 동기화되었습니다!")
                return True
    except Exception as e:
        print(f"[!] 웹앱 동기화 전송 실패: {e}")
    return False

def main():
    print("=" * 60)
    print(" 🏆 SCRIM-BALANCER LCU 로컬 내전 수집기 (자동 동기화)")
    print("=" * 60)
    print("[*] 리그 오브 레전드 클라이언트 실행을 감지하는 중...")
    
    last_game_id = None
    
    while True:
        port, password = get_lcu_credentials()
        if not port:
            print("[-] 롤 클라이언트가 실행되어 있지 않습니다. 롤을 실행해주세요... (3초 후 재시도)", end="\r")
            time.sleep(3)
            continue
            
        print(f"\n[+] 롤 클라이언트 실제 연결 성공! (Port: {port}) - 내전 경기 결과 대기 중...")
        
        while True:
            if not test_lcu_connection(port, password):
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
                        
                blue_team = []
                red_team = []
                all_players = []

                for p in stats.get("participants", []):
                    k = p.get("stats", {}).get("CHAMPIONS_KILLED", 0)
                    d = p.get("stats", {}).get("NUM_DEATHS", 0)
                    a = p.get("stats", {}).get("ASSISTS", 0)
                    dmg = p.get("stats", {}).get("TOTAL_DAMAGE_DEALT_TO_CHAMPIONS", 0)
                    cs = p.get("stats", {}).get("MINIONS_KILLED", 0) + p.get("stats", {}).get("NEUTRAL_MINIONS_KILLED", 0)
                    ai_score = min(99, max(45, round(60 + (k * 2.5) - (d * 3) + (a * 1.5) + (dmg / 1500))))
                    
                    role_raw = (p.get("teamPosition") or "MID").upper()
                    role = "MID"
                    if "TOP" in role_raw: role = "TOP"
                    elif "JUG" in role_raw or "JUNGLE" in role_raw: role = "JUG"
                    elif "BOT" in role_raw or "ADC" in role_raw: role = "ADC"
                    elif "SUP" in role_raw: role = "SUP"

                    p_data = {
                        "name": f"{p.get('summonerName')}#{p.get('tagLine', 'KR1')}",
                        "tier": "UNRANKED",
                        "role": role,
                        "champion": p.get("championName", "챔피언"),
                        "aiScore": ai_score,
                        "kda": f"{k}/{d}/{a} ({'Perfect' if d == 0 else round((k+a)/d, 2)})",
                        "damage": f"{dmg:,}",
                        "cs": cs,
                        "win": (p.get("teamId") == 100 and blue_win) or (p.get("teamId") == 200 and not blue_win)
                    }

                    all_players.append(p_data)
                    if p.get("teamId") == 100:
                        blue_team.append(p_data)
                    else:
                        red_team.append(p_data)
                
                best_score = max([p["aiScore"] for p in all_players]) if all_players else 80
                mvp = next((p["name"] for p in all_players if p["aiScore"] == best_score), "MVP")

                date_str = datetime.datetime.now().strftime("%b %d일, %H:%M")

                match_record = {
                    "id": f"m-{int(time.time()*1000)}",
                    "date": date_str,
                    "matchId": f"LCU_{game_id}",
                    "winner": "BLUE" if blue_win else "RED",
                    "mvp": mvp,
                    "duration": "30분",
                    "blue": blue_team,
                    "red": red_team
                }

                print(f"[+] 블루팀 {len(blue_team)}명 / 레드팀 {len(red_team)}명 파싱 완료. 승리: {'BLUE' if blue_win else 'RED'}팀")
                push_match_to_cloud(match_record)
                
            time.sleep(3)

if __name__ == "__main__":
    main()
