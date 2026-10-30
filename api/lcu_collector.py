# lcu_collector.py - 롤 클라이언트 로컬 LCU API 사설 내전 10인 스탯 자동 수집기 (칼바람 제외 + DeepLoL 실측 역공학 점수 모델)
import os
import sys
import time
import json
import base64
import urllib.request
import ssl
import datetime

# 🌟 사용자 본인의 Vercel 앱 주소
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
    except Exception:
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
            except Exception:
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
    except Exception:
        return None

def determine_winning_team(stats):
    teams = stats.get("teams", [])
    participants = stats.get("participants", [])

    for t in teams:
        tid = t.get("teamId")
        if t.get("isWinningTeam") is True or t.get("won") is True or t.get("win") is True:
            return tid
        t_stats = t.get("stats", {}) or {}
        if str(t_stats.get("WIN", "")).lower() in ["win", "true", "1", "victory"]:
            return tid

    for p in participants:
        tid = p.get("teamId")
        if p.get("isWinningTeam") is True or p.get("win") is True:
            return tid
        p_stats = p.get("stats", {}) or {}
        if str(p_stats.get("WIN", "")).lower() in ["win", "true", "1", "victory"]:
            return tid

    return None

def calculate_deeplol_score(p, team_players, game_minutes, won):
    k = p.get("stats", {}).get("CHAMPIONS_KILLED", 0)
    d = p.get("stats", {}).get("NUM_DEATHS", 0)
    a = p.get("stats", {}).get("ASSISTS", 0)
    dmg = p.get("stats", {}).get("TOTAL_DAMAGE_DEALT_TO_CHAMPIONS", 0)
    cs = p.get("stats", {}).get("MINIONS_KILLED", 0) + p.get("stats", {}).get("NEUTRAL_MINIONS_KILLED", 0)

    team_kills = max(1, sum(x.get("stats", {}).get("CHAMPIONS_KILLED", 0) for x in team_players))
    team_dmg = max(1, sum(x.get("stats", {}).get("TOTAL_DAMAGE_DEALT_TO_CHAMPIONS", 0) for x in team_players))

    kda_ratio = (k + a) / max(1, d)
    kp = (k + a) / team_kills
    dmg_share = dmg / team_dmg
    cspm = cs / max(1, game_minutes)

    role_raw = (p.get("teamPosition") or "").upper()
    is_sup = ("SUP" in role_raw) or ("UTILITY" in role_raw)

    base = 47.0
    if kda_ratio >= 1.0:
        kda_comp = min(20.0, (kda_ratio - 1.0) * 1.9)
    else:
        kda_comp = (kda_ratio - 1.0) * 12.0

    dmg_comp = (dmg_share - 0.20) * 45.0
    kp_comp = (kp - 0.45) * 14.0

    if is_sup:
        farm_comp = min(8.0, (a / max(1, game_minutes) - 0.2) * 10.0)
    else:
        farm_comp = min(6.0, (cspm - 6.0) * 1.2)

    death_penalty = max(0, d - 4) * 1.8
    win_comp = 3.0 if won else -1.0

    raw = base + kda_comp + dmg_comp + kp_comp + farm_comp - death_penalty + win_comp
    return max(20, min(95, round(raw)))

def push_match_to_cloud(match_data):
    ctx = ssl.create_default_context()
    try:
        req_get = urllib.request.Request(SERVER_URL, headers={"Accept": "application/json"})
        existing_data = {}
        with urllib.request.urlopen(req_get, context=ctx, timeout=5) as res:
            existing_data = json.loads(res.read().decode())

        match_history = existing_data.get("matchHistory", [])
        if not isinstance(existing_data, dict) or not isinstance(match_history, list):
            raise ValueError("서버 데이터 형식이 올바르지 않습니다.")
        match_id = match_data["matchId"]
        if any(isinstance(m, dict) and m.get("matchId") == match_id for m in match_history):
            print(f"[-] 이미 등록된 경기(ID: {match_id})입니다.")
            return True

        match_history.insert(0, match_data)
        existing_data["matchHistory"] = match_history
        existing_data["updatedAt"] = int(time.time() * 1000)

        if "communityPosts" not in existing_data or not existing_data["communityPosts"]:
            existing_data.pop("communityPosts", None)

        json_payload = json.dumps(existing_data, ensure_ascii=False).encode("utf-8")
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
    print(" 🏆 SCRIM-BALANCER LCU 로컬 내전 수집기 (소환사의 협곡 전용)")
    print("=" * 60)
    print("[*] 리그 오브 레전드 클라이언트 실행을 감지하는 중...")

    last_processed_game_id = None
    retry_count = 0

    while True:
        port, password = get_lcu_credentials()
        if not port:
            print("[-] 롤 클라이언트가 켜져 있지 않습니다. (3초 후 재시도)", end="\r")
            time.sleep(3)
            continue

        print(f"\n[+] 롤 클라이언트 연결 성공! (Port: {port}) - 내전 경기 결과 대기 중...")

        while True:
            if not test_lcu_connection(port, password):
                print("\n[!] 롤 클라이언트가 종료되었습니다. 다시 켜질 때까지 대기합니다...")
                break

            stats = query_lcu(port, password, "/lol-end-of-game/v1/eog-stats-block")
            if stats and stats.get("gameId"):
                game_id = stats.get("gameId")

                if game_id == last_processed_game_id:
                    time.sleep(3)
                    continue

                game_mode = str(stats.get("gameMode") or "").upper()
                map_id = stats.get("mapId")
                game_mutator = str(stats.get("gameMutator") or "").upper()

                if game_mode == "ARAM" or map_id == 12 or "ARAM" in game_mutator:
                    print(f"\n[-] 칼바람 나락(ARAM) 경기는 내전 전적에서 자동 제외됩니다. (Game ID: {game_id})")
                    last_processed_game_id = game_id
                    time.sleep(3)
                    continue

                winning_team_id = determine_winning_team(stats)

                if winning_team_id is None:
                    retry_count += 1
                    if retry_count <= 5:
                        print(f"[*] 통계 데이터 동기화 중... 잠시 대기 ({retry_count}/5)", end="\r")
                        time.sleep(2)
                        continue
                    else:
                        print("\n[!] 승패 플래그 지연 감지: 킬 수 기준으로 승리팀 판정")
                        k100 = sum(p.get("stats", {}).get("CHAMPIONS_KILLED", 0) for p in stats.get("participants", []) if p.get("teamId") == 100)
                        k200 = sum(p.get("stats", {}).get("CHAMPIONS_KILLED", 0) for p in stats.get("participants", []) if p.get("teamId") == 200)
                        winning_team_id = 100 if k100 >= k200 else 200

                blue_win = (winning_team_id == 100)
                last_processed_game_id = game_id
                retry_count = 0

                raw_parts = stats.get("participants", [])
                blue_raw = [p for p in raw_parts if p.get("teamId") == 100]
                red_raw = [p for p in raw_parts if p.get("teamId") == 200]

                if len(blue_raw) != 5 or len(red_raw) != 5:
                    print(f"[!] 5:5 인원이 갖춰지지 않은 경기입니다 ({len(blue_raw)} vs {len(red_raw)}). 건너뜁니다.")
                    time.sleep(3)
                    continue

                print(f"\n[🎉] 내전 경기 종료 감지! (Game ID: {game_id})")
                print(f"[+] 승리 팀: {'블루팀 (BLUE)' if blue_win else '레드팀 (RED)'}")

                game_seconds = stats.get("gameLength") or (25 * 60)
                game_minutes = max(10, int(game_seconds) // 60)

                blue_team = []
                red_team = []
                all_players = []

                for team_raw, is_team_blue, container in [(blue_raw, True, blue_team), (red_raw, False, red_team)]:
                    team_won = blue_win if is_team_blue else not blue_win
                    for p in team_raw:
                        k = p.get("stats", {}).get("CHAMPIONS_KILLED", 0)
                        d = p.get("stats", {}).get("NUM_DEATHS", 0)
                        a = p.get("stats", {}).get("ASSISTS", 0)
                        dmg = p.get("stats", {}).get("TOTAL_DAMAGE_DEALT_TO_CHAMPIONS", 0)
                        cs = p.get("stats", {}).get("MINIONS_KILLED", 0) + p.get("stats", {}).get("NEUTRAL_MINIONS_KILLED", 0)

                        ai_score = calculate_deeplol_score(p, team_raw, game_minutes, team_won)

                        role_raw = (p.get("teamPosition") or "").upper()
                        role = "MID"
                        if "TOP" in role_raw: role = "TOP"
                        elif "JUG" in role_raw or "JUNGLE" in role_raw: role = "JUG"
                        elif "BOT" in role_raw or "ADC" in role_raw: role = "ADC"
                        elif "SUP" in role_raw or "UTILITY" in role_raw: role = "SUP"

                        p_name = p.get("summonerName") or p.get("gameName") or "소환사"
                        p_tag = p.get("tagLine") or "KR1"

                        p_data = {
                            "name": f"{p_name}#{p_tag}",
                            "tier": "UNRANKED",
                            "role": role,
                            "champion": p.get("championName", "챔피언"),
                            "aiScore": ai_score,
                            "kda": f"{k}/{d}/{a} ({'Perfect' if d == 0 else round((k+a)/d, 2)})",
                            "damage": f"{dmg:,}",
                            "cs": cs,
                            "win": team_won
                        }

                        all_players.append(p_data)
                        container.append(p_data)

                best_score = max([p["aiScore"] for p in all_players]) if all_players else 80
                mvp = next((p["name"] for p in all_players if p["aiScore"] == best_score), "MVP")

                duration_str = f"{int(game_seconds)//60}분 {int(game_seconds)%60:02d}초"
                date_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")

                match_record = {
                    "id": f"m-{int(time.time()*1000)}",
                    "date": date_str,
                    "matchId": f"LCU_{game_id}",
                    "winner": "BLUE" if blue_win else "RED",
                    "mvp": mvp,
                    "duration": duration_str,
                    "blue": blue_team,
                    "red": red_team
                }

                print(f"[+] 블루팀 {len(blue_team)}명 / 레드팀 {len(red_team)}명 점수 산정 완료. MVP: {mvp} ({best_score}점)")
                push_match_to_cloud(match_record)

            time.sleep(3)

if __name__ == "__main__":
    main()
