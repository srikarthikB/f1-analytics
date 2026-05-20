from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
from typing import Optional
import requests
import math
import time
import threading
import time
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENF1 = "https://api.openf1.org/v1"

# ── Global Cache System ──────────────────────────────────────────────────────
_cache = {}
CACHE_TTL = 60

def fetch_openf1(url: str):
    now = time.time()

    if url in _cache:
        data, timestamp = _cache[url]
        if now - timestamp < CACHE_TTL:
            return data

    response = requests.get(url, timeout=5)
    data = response.json()

    _cache[url] = (data, now)
    return data

def cache_get(key):
    entry = _cache.get(key)
    if not entry:
        return None
    return entry[0]

def cache_set(key, value):
    _cache[key] = (value, time.time())


def self_ping():
    while True:
        try:
            requests.get("https://pitwall-gul0.onrender.com/ping")
            print("Ping sent")
        except Exception as e:
            print("Ping failed:", e)

        time.sleep(600)


# ── Helper: get the latest completed race session_key ─────────────────────────
def get_latest_race_session_key(year: int = None):
    cache_key = f"latest_session_{year}"
    cached = cache_get(cache_key)
    if cached:
        return cached
    url = f"{OPENF1}/sessions?session_name=Race"
    if year:
        url += f"&year={year}"
    
    sessions = fetch_openf1(url)
    if not isinstance(sessions, list) or len(sessions) == 0:
        return None
    
    now = datetime.now(timezone.utc)
    past_sessions = [
        s for s in sessions
        if s.get("date_start") and
        datetime.fromisoformat(s["date_start"].replace("Z", "+00:00")) <= now
    ]
    if not past_sessions:
        return None
    
    latest = sorted(past_sessions, key=lambda x: x["date_start"], reverse=True)[0]
    cache_set(cache_key, latest["session_key"])
    return latest["session_key"]


@app.get("/ping")
def ping():
    return {"message": "awake"}


# ── /drivers ──────────────────────────────────────────────────────────────────
@app.get("/drivers")
def get_drivers():
    session_key = get_latest_race_session_key()
    if not session_key:
        return []
    
    data = fetch_openf1(f"{OPENF1}/drivers?session_key={session_key}")
    if not isinstance(data, list):
        return []
    
    seen = set()
    result = []
    for d in data:
        num = d.get("driver_number")
        if not num or num in seen:
            continue
        seen.add(num)
        result.append({
            "driver_number": num,
            "first_name":    d.get("first_name", ""),
            "last_name":     d.get("last_name", ""),
            "full_name":     d.get("full_name", ""),
            "name_acronym":  d.get("name_acronym", ""),
            "team_name":     d.get("team_name", ""),
            "team_colour":   d.get("team_colour", ""),
            "headshot_url":  d.get("headshot_url", ""),
        })
    return sorted(result, key=lambda x: x["full_name"])

# ── /drivers/{driver_number} ──────────────────────────────────────────────────
@app.get("/drivers/{driver_number}")
def get_driver(driver_number: int):
    session_key = get_latest_race_session_key()
    if not session_key:
        return {"error": "No session found"}

    drivers = fetch_openf1(f"{OPENF1}/drivers?session_key={session_key}&driver_number={driver_number}")
    if not isinstance(drivers, list) or len(drivers) == 0:
        return {"error": "Driver not found"}
    d = drivers[0]

    pts_data = fetch_openf1(f"{OPENF1}/championship_drivers?session_key={session_key}")
    points = None
    if isinstance(pts_data, list):
        for driver in pts_data:
            if driver.get("driver_number") == driver_number:
                points = driver.get("points_current")
                break

    return {
        "driver_number": d.get("driver_number"),
        "first_name":    d.get("first_name", ""),
        "last_name":     d.get("last_name", ""),
        "full_name":     d.get("full_name", ""),
        "name_acronym":  d.get("name_acronym", ""),
        "team_name":     d.get("team_name", ""),
        "team_colour":   d.get("team_colour", ""),
        "headshot_url":  d.get("headshot_url", ""),
        "points":        points,
        "session_key":   session_key,
    }

# ── /drivers/{driver_number}/performance ─────────────────────────────────────
@app.get("/drivers/{driver_number}/performance")
def get_driver_performance(driver_number: int):
    sessions = fetch_openf1(f"{OPENF1}/sessions?session_name=Race")
    if not isinstance(sessions, list):
        return []

    year_sessions = {}
    for s in sessions:
        year = s.get("year")
        date = s.get("date_start", "")
        if not year or not date:
            continue
        if year not in year_sessions or date > year_sessions[year]["date_start"]:
            year_sessions[year] = s

    result = []
    for year, session in sorted(year_sessions.items()):
        sk = session.get("session_key")
        pts_data = fetch_openf1(f"{OPENF1}/championship_drivers?session_key={sk}&driver_number={driver_number}")
        if isinstance(pts_data, list) and len(pts_data) > 0:
            pts = pts_data[0].get("points_current")
            if pts is not None:
                result.append({"year": year, "points": pts})
    return result

# ── /standings ────────────────────────────────────────────────────────────────
@app.get("/standings")
def get_standings(year: int = None):
    session_key = get_latest_race_session_key(year)
    if not session_key:
        return {}

    drivers_data = fetch_openf1(f"{OPENF1}/championship_drivers?session_key={session_key}")
    teams_data = fetch_openf1(f"{OPENF1}/championship_teams?session_key={session_key}")
    drv_data = fetch_openf1(f"{OPENF1}/drivers?session_key={session_key}")

    driver_map = {}

    for d in drv_data:
        if isinstance(d, dict) and d.get("driver_number"):
            driver_map[d.get("driver_number")] = d

    drivers_result = []
    if isinstance(drivers_data, list):
        for d in drivers_data:
            num = d.get("driver_number")
            info = driver_map.get(num, {})
            drivers_result.append({
                "driver_number": num,
                "full_name":     info.get("full_name", "—"),
                "team_name":     info.get("team_name", "—"),
                "points":        d.get("points_current"),
                "position": d.get("position") or d.get("position_current"),
            })

    teams_result = []
    if isinstance(teams_data, list):
        for t in teams_data:
            teams_result.append({
                "team_name": t.get("team_name"),
                "points":    t.get("points_current"),
                "position":  t.get("position"),
            })

    return {"drivers": drivers_result, "teams": teams_result}

# ── /teams ────────────────────────────────────────────────────────────────────
@app.get("/teams")
def get_teams():
    session_key = get_latest_race_session_key()
    if not session_key:
        return []

    sr_data = fetch_openf1(f"{OPENF1}/session_result?session_key={session_key}")
    drv_data = fetch_openf1(f"{OPENF1}/drivers?session_key={session_key}")

    if not isinstance(sr_data, list) or not isinstance(drv_data, list):
        return []

    driver_map = {d.get("driver_number"): d for d in drv_data if d.get("driver_number")}
    team_map = {}

    for s in sr_data:
        if not isinstance(s, dict): continue
        num = s.get("driver_number")
        pts = float(s.get("points") or 0)
        d = driver_map.get(num, {})
        team_name = d.get("team_name")
        if not team_name or team_name == "Unknown": continue

        raw_color = d.get("team_colour") or "ef4444"
        color = raw_color if raw_color.startswith("#") else f"#{raw_color}"

        if team_name not in team_map:
            team_map[team_name] = {"id": team_name, "name": team_name, "color": color, "points": 0, "drivers": []}

        team_map[team_name]["points"] += pts
        team_map[team_name]["drivers"].append({"driver_number": num, "name": d.get("full_name")})

    sorted_teams = sorted(team_map.values(), key=lambda x: x["points"], reverse=True)
    for idx, t in enumerate(sorted_teams):
        t["position"] = idx + 1
    return sorted_teams

# ── /team/{id} ────────────────────────────────────────────────────────────────
@app.get("/team/{team_id}")
def get_team(team_id: str):
    teams = get_teams()
    for t in teams:
        if t["id"] == team_id: return t
    return {"error": "Team not found"}

@app.get("/team/{team_id}/history")
def get_team_history(team_id: str):
    sessions = fetch_openf1(f"{OPENF1}/sessions?session_name=Race")
    if not isinstance(sessions, list): return []

    year_sessions = {}
    for s in sessions:
        year, date = s.get("year"), s.get("date_start")
        if year and date and (year not in year_sessions or date > year_sessions[year]["date_start"]):
            year_sessions[year] = s

    result = []
    for year, session in sorted(year_sessions.items()):
        data = fetch_openf1(f"{OPENF1}/championship_teams?session_key={session.get('session_key')}")
        if not isinstance(data, list): continue
        for t in data:
            if t.get("team_name") == team_id:
                result.append({"year": year, "points": t.get("points_current"), "position": t.get("position")})
    return result

# ── /races/{year} ─────────────────────────────────────────────────────────────
@app.get("/races/{year}")
def get_races(year: int):
    cache_key = f"races_endpoint_{year}"
    cached = cache_get(cache_key)
    if cached: return cached

    sessions = fetch_openf1(f"{OPENF1}/sessions?session_name=Race&year={year}")
    if not isinstance(sessions, list): return []

    now = datetime.now(timezone.utc)
    valid_sessions = [
        s for s in sessions 
        if s.get("date_start") and datetime.fromisoformat(s["date_start"].replace("Z", "+00:00")) <= now
    ]

    result = []
    for idx, s in enumerate(sorted(valid_sessions, key=lambda x: x["date_start"])):
        result.append({
            "round":       idx + 1,
            "name":        s.get("meeting_name") or s.get("circuit_short_name", f"Round {idx+1}"),
            "circuit":     s.get("circuit_short_name", ""),
            "location":    s.get("country_name", ""),
            "date":        s.get("date_start", ""),
            "session_key": s.get("session_key"),
        })
    cache_set(cache_key, result)
    return result

# ── /race-results ─────────────────────────────────────────────────────────────
@app.get("/race-results")
def get_race_results(session_key: int):
    return fetch_openf1(f"{OPENF1}/session_result?session_key={session_key}")

# ── /compare (lap-level) ──────────────────────────────────────────────────────
def get_common_session(driver1, driver2):
    sessions = sorted(fetch_openf1(f"{OPENF1}/sessions?session_name=Race"), key=lambda x: x["date_start"], reverse=True)
    for s in sessions:
        sk = s["session_key"]
        l1 = fetch_openf1(f"{OPENF1}/laps?session_key={sk}&driver_number={driver1}")
        l2 = fetch_openf1(f"{OPENF1}/laps?session_key={sk}&driver_number={driver2}")
        if isinstance(l1, list) and l1 and isinstance(l2, list) and l2:
            return sk
    return None

@app.get("/compare")
def compare_drivers(driver1: Optional[int] = None, driver2: Optional[int] = None):
    if driver1 is None or driver2 is None: return {"error": "Missing driver parameters"}
    session_key = get_common_session(driver1, driver2) or get_latest_race_session_key()
    return {
        "session_key": session_key,
        "laps1": get_laps(session_key, driver1),
        "laps2": get_laps(session_key, driver2),
        "cons1": get_consistency(session_key, driver1),
        "cons2": get_consistency(session_key, driver2),
    }

# ── /compare-fast ─────────────────────────────────────────────────────────────
@app.get("/compare-fast")
def compare_fast(driver1: int, driver2: int, year: int):
    EMPTY_DRIVER = {"points": None, "position": None, "team": None, "last_finish": None, "consistency": None}
    session_key = get_latest_race_session_key(year)
    if not session_key: return {"driver1": EMPTY_DRIVER, "driver2": EMPTY_DRIVER}

    champ_data = fetch_openf1(f"{OPENF1}/championship_drivers?session_key={session_key}")
    champ_map = {int(e["driver_number"]): e for e in champ_data if isinstance(e, dict) and e.get("driver_number")} if isinstance(champ_data, list) else {}

    drv_data = fetch_openf1(f"{OPENF1}/drivers?session_key={session_key}")
    drv_map = {int(d["driver_number"]): d.get("team_name") for d in drv_data if isinstance(d, dict) and d.get("driver_number")} if isinstance(drv_data, list) else {}

    result_data = fetch_openf1(f"{OPENF1}/session_result?session_key={session_key}")
    result_map = {int(r["driver_number"]): r for r in result_data if isinstance(r, dict) and r.get("driver_number")} if isinstance(result_data, list) else {}

    def build(num):
        num = int(num)
        c, r = champ_map.get(num, {}), result_map.get(num, {})
        cons = get_consistency(session_key, num)
        
        last_f = "DNF" if r.get("dnf") else ("DNS" if r.get("dns") else ("DSQ" if r.get("dsq") else r.get("position")))
        if last_f is not None and not isinstance(last_f, str): last_f = int(last_f)

        return {
            "points": c.get("points_current"), "position": c.get("position_current"),
            "team": drv_map.get(num), "last_finish": last_f,
            "consistency": cons.get("consistency_score") if isinstance(cons, dict) else None
        }

    return {"driver1": build(driver1), "driver2": build(driver2)}

# ── /driver-season-stats ──────────────────────────────────────────────────────
@app.get("/driver-season-stats")
def driver_season_stats(driver_number: int, year: int):
    cache_key = f"season_stats_endpoint_{driver_number}_{year}"
    cached = cache_get(cache_key)
    if cached: return cached

    EMPTY = {"total_points": 0, "best_finish": None, "best_quali": None, "dnf_count": 0, "consistency": None}
    try:
        sessions_res = fetch_openf1(f"{OPENF1}/sessions?session_name=Race&year={year}")
        if not isinstance(sessions_res, list) or not sessions_res: return EMPTY

        now = datetime.now(timezone.utc)
        race_sessions = [s for s in sessions_res if s.get("date_start") and datetime.fromisoformat(s["date_start"].replace("Z", "+00:00")) <= now]
        if not race_sessions: return EMPTY

        # Optimized Quali session fetching
        quali_res = fetch_openf1(f"{OPENF1}/sessions?session_type=Qualifying&year={year}")
        if not quali_res: quali_res = fetch_openf1(f"{OPENF1}/sessions?session_name=Qualifying&year={year}")
        quali_sessions = [s for s in quali_res if s.get("date_start") and datetime.fromisoformat(s["date_start"].replace("Z", "+00:00")) <= now] if isinstance(quali_res, list) else []

        race_data, quali_positions, consistency_list = [], [], []

        for s in race_sessions:
            sk = s.get("session_key")
            res = fetch_openf1(f"{OPENF1}/session_result?session_key={sk}")
            if isinstance(res, list):
                for r in res:
                    if int(r.get("driver_number") or 0) == int(driver_number):
                        race_data.append({"points": float(r.get("points") or 0), "position": r.get("position"), "dnf": r.get("dnf"), "dns": r.get("dns"), "dsq": r.get("dsq")})
            cons = get_consistency(sk, driver_number)
            if isinstance(cons, dict) and cons.get("consistency_score") is not None: consistency_list.append(cons["consistency_score"])

        for s in quali_sessions:
            grid = fetch_openf1(f"{OPENF1}/starting_grid?session_key={s.get('session_key')}")
            if isinstance(grid, list):
                for g in grid:
                    if int(g.get("driver_number") or 0) == int(driver_number) and g.get("position"):
                        quali_positions.append(int(g["position"]))

        if not race_data: return EMPTY
        pos_list = [int(d["position"]) for d in race_data if d["position"] is not None]
        avg_cons = sum(consistency_list) / len(consistency_list) if consistency_list else None
        
        result = {
            "total_points": sum(d["points"] for d in race_data),
            "best_finish": min(pos_list) if pos_list else None,
            "best_quali": min(quali_positions) if quali_positions else None,
            "dnf_count": sum(1 for d in race_data if d.get("dnf") or d.get("dns") or d.get("dsq")),
            "consistency": round(avg_cons, 3) if avg_cons is not None else None,
        }
        cache_set(cache_key, result)
        return result
    except: return EMPTY

# ── /simulate-strategy ────────────────────────────────────────────────────────
TYRE_MODEL = {"soft": -2.0, "medium": 0.0, "hard": 2.0}
DEGRADATION = {"soft": 0.08, "medium": 0.04, "hard": 0.02}
TYRE_STINT_RANGE = {"soft": (8, 20), "medium": (18, 35), "hard": (25, 50)}

def distribute_stints(tyre_list: list, total_laps: int) -> list:
    mids = [(TYRE_STINT_RANGE[t][0] + TYRE_STINT_RANGE[t][1]) / 2 for t in tyre_list]
    tw = sum(mids)
    stints = [max(TYRE_STINT_RANGE[t][0], min(TYRE_STINT_RANGE[t][1], round(total_laps * (mids[i]/tw)))) for i, t in enumerate(tyre_list)]
    stints[-1] = max(1, stints[-1] + (total_laps - sum(stints)))
    return stints

@app.get("/simulate-strategy")
def simulate_strategy(session_key: int, tyres: str):
    tyre_list = [t.strip().lower() for t in tyres.split(",") if t.strip()]
    if any(t not in TYRE_MODEL for t in tyre_list): return {"error": "Invalid tyre compound"}

    def get_clean_laps(sk, drv):
        raw = fetch_openf1(f"{OPENF1}/laps?session_key={sk}&driver_number={drv}")
        return [l["lap_duration"] for l in raw if isinstance(l, dict) and l.get("lap_duration") and not l.get("is_pit_out_lap") and l["lap_duration"] < 500] if isinstance(raw, list) else []

    def get_ref(sk):
        res = fetch_openf1(f"{OPENF1}/session_result?session_key={sk}&position=1")
        if isinstance(res, list) and res: return res[0].get("driver_number")
        drv = fetch_openf1(f"{OPENF1}/drivers?session_key={sk}")
        return drv[0].get("driver_number") if isinstance(drv, list) and drv else None

    ref_drv = get_ref(session_key)
    lap_times = get_clean_laps(session_key, ref_drv) if ref_drv else []

    if not lap_times: # Fallback logic
        past = sorted([s for s in fetch_openf1(f"{OPENF1}/sessions?session_name=Race") if s.get("date_start") and datetime.fromisoformat(s["date_start"].replace("Z", "+00:00")) <= datetime.now(timezone.utc)], key=lambda x: x["date_start"], reverse=True)
        for s in past:
            sk = s["session_key"]
            if sk == session_key: continue
            fb_d = get_ref(sk)
            lap_times = get_clean_laps(sk, fb_d)
            if lap_times: break

    if not lap_times: return {"error": "No lap data available"}
    
    avg_t, total_l = sum(lap_times)/len(lap_times), len(lap_times)
    stint_l = distribute_stints(tyre_list, total_l)
    
    total_time, lap_times_list, stints_info = 0.0, [], []
    for i, tyre in enumerate(tyre_list):
        for l_idx in range(1, stint_l[i] + 1):
            lt = avg_t + TYRE_MODEL[tyre] + DEGRADATION[tyre] * l_idx
            total_time += lt
            lap_times_list.append(round(lt, 3))
        stints_info.append({"tyre": tyre, "laps": stint_l[i]})
    
    total_time += (len(tyre_list) - 1) * 20
    return {"total_time": round(total_time, 3), "avg_lap_time": round(avg_t, 3), "total_laps": total_l, "pit_stops": len(tyre_list)-1, "stints": stints_info, "lap_times": lap_times_list}

# ── /laps ─────────────────────────────────────────────────────────────────────
@app.get("/laps")
def get_laps(session_key: int, driver_number: int):
    cache_key = f"laps_{session_key}_{driver_number}"
    cached = cache_get(cache_key)
    if cached:
        return cached
    data = fetch_openf1(f"{OPENF1}/laps?session_key={session_key}&driver_number={driver_number}")
    if not isinstance(data, list): return []
    result = [
        {
            "lap": l.get("lap_number"),
            "time": l.get("lap_duration"),
            "is_pit_out": l.get("is_pit_out_lap", False),
            "sector_1": l.get("duration_sector_1"),
            "sector_2": l.get("duration_sector_2"),
            "sector_3": l.get("duration_sector_3"),
        }
        for l in data if l.get("lap_duration") is not None
    ]
    cache_set(cache_key, result)

    return result
# ── /consistency ──────────────────────────────────────────────────────────────
@app.get("/consistency")
def get_consistency(session_key: int, driver_number: int):
    laps = get_laps(session_key, driver_number)
    times = [l["time"] for l in laps if 60 < l["time"] < 200]
    if len(times) < 5: return {"driver_number": driver_number, "consistency_score": None, "laps_count": len(times)}
    
    clean_times = sorted(times)[:int(len(times) * 0.9)]
    mean = sum(clean_times) / len(clean_times)
    std_dev = math.sqrt(sum((t - mean) ** 2 for t in clean_times) / len(clean_times))
    return {"driver_number": driver_number, "consistency_score": round(std_dev, 3), "laps_count": len(clean_times), "avg_lap_time": round(mean, 3)}

# ── /fantasy_score ─────────────────────────────────────────────────────────────
FINISH_POINTS = {1:25, 2:18, 3:15, 4:12, 5:10, 6:8, 7:6, 8:4, 9:2, 10:1}

@app.get("/fantasy_score")
def fantasy_score(session_key: int, driver_numbers: str, team_name: str):
    try: drv_nums = [int(x.strip()) for x in driver_numbers.split(",") if x.strip()]
    except: return {"error": "Invalid driver numbers"}
    if len(drv_nums) != 3: return {"error": "Exactly 3 drivers required"}

    # Pass 1: Global data fetch
    res_data = fetch_openf1(f"{OPENF1}/session_result?session_key={session_key}")
    res_map = {int(r["driver_number"]): r for r in res_data if isinstance(r, dict) and r.get("driver_number")} if isinstance(res_data, list) else {}
    
    grid_data = fetch_openf1(f"{OPENF1}/starting_grid?session_key={session_key}")
    grid_map = {int(g["driver_number"]): g.get("position") for g in grid_data if isinstance(g, dict) and g.get("driver_number")} if isinstance(grid_data, list) else {}
    
    ot_data = fetch_openf1(f"{OPENF1}/overtakes?session_key={session_key}")
    ot_counts = {}
    if isinstance(ot_data, list):
        for o in ot_data:
            n = o.get("overtaking_driver_number")
            if n: ot_counts[int(n)] = ot_counts.get(int(n), 0) + 1

    drv_info = fetch_openf1(f"{OPENF1}/drivers?session_key={session_key}")
    info_map = {int(d["driver_number"]): d for d in drv_info if isinstance(d, dict) and d.get("driver_number")} if isinstance(drv_info, list) else {}

    def score_driver(num):
        r, g_pos = res_map.get(num, {}), grid_map.get(num)
        pos, dnf, dsq = r.get("position"), r.get("dnf"), r.get("dsq")
        
        f_pts = FINISH_POINTS.get(int(pos), 0) if not dnf and not dsq and pos else 0
        p_pts = (int(g_pos) - int(pos)) * 2 if g_pos and pos and not dnf and not dsq else 0
        o_pts = int(ot_counts.get(num, 0) * 0.5)
        penalty = -20 if dsq else (-10 if dnf else 0)
        
        s_pts = 0
        try:
            opt = get_optimal_strategy(session_key, num)
            if "real_time" in opt and opt["real_time"] > 0:
                pct = (opt["time_gain"] / opt["real_time"]) * 100
                s_pts = 10 if pct < 2 else (5 if pct < 5 else 0)
        except: pass
        
        c_pts = 0
        try:
            cons = get_consistency(session_key, num)
            std = cons.get("consistency_score")
            if std: c_pts = 10 if std < 1.0 else (5 if std < 2.5 else 0)
        except: pass
        
        return f_pts + p_pts + o_pts + penalty + s_pts + c_pts, {"finish": f_pts, "positions": p_pts, "overtakes": o_pts, "penalty": penalty, "strategy": s_pts, "consistency": c_pts}

    driver_results = []
    for n in drv_nums:
        tot, brk = score_driver(n)
        driver_results.append({"driver_number": n, "full_name": info_map.get(n, {}).get("full_name", f"Driver {n}"), "total": tot, "breakdown": brk})

    team_drivers = [n for n, i in info_map.items() if i.get("team_name") == team_name]
    team_score = sum(score_driver(n)[0] for n in team_drivers)
    
    return {"drivers": driver_results, "team_score": team_score, "total_score": sum(d["total"] for d in driver_results) + team_score}

# ── /sessions ─────────────────────────────────────────────────────────────────
@app.get("/sessions")
def get_sessions():
    data = fetch_openf1(f"{OPENF1}/sessions?session_name=Race")
    if not isinstance(data, list): return []
    res = [{"session_key": s.get("session_key"), "session_name": s.get("session_name"), "circuit_short_name": s.get("circuit_short_name"), "country_name": s.get("country_name"), "location": s.get("location"), "date_start": s.get("date_start"), "year": s.get("year"), "round_number": s.get("round_number")} for s in data]
    return sorted(res, key=lambda x: x.get("date_start") or "", reverse=True)

# ── /stint analysis ───────────────────────────────────────────────────────────
@app.get("/stint-analysis")
def stint_analysis(session_key: int, driver_number: int = None):
    data = fetch_openf1(f"{OPENF1}/stints?session_key={session_key}")
    if not isinstance(data, list): return {"stints": [], "summary": {}, "pits": []}
    if driver_number: data = [s for s in data if s.get("driver_number") == driver_number]

    stints = sorted([{"stint": s.get("stint_number"), "compound": s.get("compound"), "lap_start": s.get("lap_start"), "lap_end": s.get("lap_end"), "laps": s.get("lap_end") - s.get("lap_start") + 1} for s in data if s.get("lap_start") is not None and s.get("lap_end") is not None], key=lambda x: x["stint"] or 999)
    if not stints: return {"stints": [], "summary": {}, "pits": []}

    usage = {}
    for s in stints: usage[s["compound"]] = usage.get(s["compound"], 0) + s["laps"]
    
    pit_data = fetch_openf1(f"{OPENF1}/pit?session_key={session_key}")
    pits = [{"lap": p.get("lap_number"), "duration": p.get("stop_duration")} for p in pit_data if (not driver_number or p.get("driver_number") == driver_number) and p.get("lap_number") is not None] if isinstance(pit_data, list) else []

    return {"stints": stints, "summary": {"total_laps": sum(s["laps"] for s in stints), "stint_count": len(stints), "pit_stops": max(len(stints)-1, 0), "strategy": " → ".join(s["compound"][0] for s in stints), "tyre_usage": usage, "longest_stint": max(stints, key=lambda x: x["laps"]), "shortest_stint": min(stints, key=lambda x: x["laps"])}, "pits": pits}

# ── /optimal_strategy ────────────────────────────────────────────────────────
@app.get("/optimal_strategy")
def get_optimal_strategy(session_key: int, driver_number: int):
    cache_key = f"optimal_{session_key}_{driver_number}"
    cached = cache_get(cache_key)
    if cached:
        return cached
    laps = fetch_openf1(f"{OPENF1}/laps?session_key={session_key}&driver_number={driver_number}")
    stints = fetch_openf1(f"{OPENF1}/stints?session_key={session_key}&driver_number={driver_number}")
    if not isinstance(laps, list) or not isinstance(stints, list) or not laps: return {"error": "No data"}

    valid_times = [l["lap_duration"] for l in laps if l.get("lap_duration") and l["lap_duration"] < 200]
    if not valid_times: return {"error": "No valid lap times"}

    # Grouping stints logic optimized
    groups = {}
    for s in stints:
        if s.get("stint_number") not in groups: groups[s["stint_number"]] = []
        groups[s["stint_number"]].append(s)
    
    merged = sorted([{"stint_number": n, "lap_start": min(x.get("lap_start", 9999) for x in g), "lap_end": max(x.get("lap_end", 0) for x in g)} for n, g in groups.items()], key=lambda x: x["stint_number"])

    stint_avgs = []
    for m in merged:
        s_laps = [l["lap_duration"] for l in laps if l.get("lap_number") and m["lap_start"] <= l["lap_number"] <= m["lap_end"] and l.get("lap_duration") and l["lap_duration"] < 200]
        if s_laps:
            best = min(s_laps)
            stint_avgs.append({"stint": m["stint_number"], "avg": sum(s_laps)/len(s_laps), "laps": len(s_laps), "total_time": sum(s_laps), "best_lap": best, "degradation_laps": sum(1 for t in s_laps if t > best + 1.5)})
    
    if not stint_avgs: return {"error": "No averages"}
    filtered = sorted([s for s in stint_avgs if s["laps"] >= len(valid_times) * 0.15], key=lambda x: x["stint"])
    for i, s in enumerate(filtered): s["stint"] = i + 1
    
    best_avg = min(s["avg"] for s in filtered)
    for s in filtered: s["time_loss"] = max(0, s["total_time"] - (s["laps"] * best_avg))
    
    real_total = sum(valid_times)
    opt_total = best_avg * len(valid_times)
    
    result = {"real_time": real_total, "optimal_time": opt_total, "time_gain": real_total - opt_total, "total_laps": len(valid_times), "best_stint_avg": best_avg, "stints": filtered, "problem_stint": max(filtered, key=lambda x: x["time_loss"]), "best_stint": min(filtered, key=lambda x: x["time_loss"])}
    cache_set(cache_key, result)
    return result

threading.Thread(target=self_ping, daemon=True).start()