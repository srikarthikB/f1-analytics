from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
from typing import Optional
import requests
import math

# Simple in-memory cache
_cache = {}

def cache_get(key):
    return _cache.get(key)

def cache_set(key, value):
    _cache[key] = value

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENF1 = "https://api.openf1.org/v1"


# ── Helper: get the latest completed race session_key ─────────────────────────
def get_latest_race_session_key(year: int = None):
    url = f"{OPENF1}/sessions?session_name=Race"
    if year:
        url += f"&year={year}"
    res = requests.get(url)
    sessions = res.json()
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
    return latest["session_key"]


# ── /drivers ──────────────────────────────────────────────────────────────────
@app.get("/drivers")
def get_drivers():
    session_key = get_latest_race_session_key()
    if not session_key:
        return []
    res = requests.get(f"{OPENF1}/drivers?session_key={session_key}")
    data = res.json()
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

    res = requests.get(f"{OPENF1}/drivers?session_key={session_key}&driver_number={driver_number}")
    drivers = res.json()
    if not isinstance(drivers, list) or len(drivers) == 0:
        return {"error": "Driver not found"}
    d = drivers[0]

    pts_res = requests.get(f"{OPENF1}/championship_drivers?session_key={session_key}")
    pts_data = pts_res.json()
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
    res = requests.get(f"{OPENF1}/sessions?session_name=Race")
    sessions = res.json()
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
        pts_res = requests.get(f"{OPENF1}/championship_drivers?session_key={sk}&driver_number={driver_number}")
        pts_data = pts_res.json()
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

    drivers_res = requests.get(f"{OPENF1}/championship_drivers?session_key={session_key}")
    drivers_data = drivers_res.json()

    teams_res = requests.get(f"{OPENF1}/championship_teams?session_key={session_key}")
    teams_data = teams_res.json()

    drv_res = requests.get(f"{OPENF1}/drivers?session_key={session_key}")
    drv_data = drv_res.json()

    driver_map = {
        d.get("driver_number"): d
        for d in drv_data if d.get("driver_number")
    }

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
                "position":      d.get("position"),
            })

    teams_result = []
    if isinstance(teams_data, list):
        for t in teams_data:
            teams_result.append({
                "team_name": t.get("team_name"),
                "points":    t.get("points_current"),
                "position":  t.get("position"),
            })

    return {
        "drivers": drivers_result,
        "teams":   teams_result,
    }


# ── /teams ────────────────────────────────────────────────────────────────────
@app.get("/teams")
def get_teams():
    session_key = get_latest_race_session_key()
    if not session_key:
        return []

    sr_res  = requests.get(f"{OPENF1}/session_result?session_key={session_key}")
    sr_data = sr_res.json()

    drv_res  = requests.get(f"{OPENF1}/drivers?session_key={session_key}")
    drv_data = drv_res.json()

    if not isinstance(sr_data, list) or not isinstance(drv_data, list):
        return []

    driver_map = {
        d.get("driver_number"): d
        for d in drv_data if d.get("driver_number")
    }

    team_map = {}

    for s in sr_data:
        if not isinstance(s, dict):
            continue
        num  = s.get("driver_number")
        pts  = float(s.get("points") or 0)
        d    = driver_map.get(num, {})

        team_name = d.get("team_name")
        if not team_name or team_name == "Unknown":
            continue

        raw_color = d.get("team_colour") or "ef4444"
        color = raw_color if raw_color.startswith("#") else f"#{raw_color}"

        if team_name not in team_map:
            team_map[team_name] = {
                "id":      team_name,
                "name":    team_name,
                "color":   color,
                "points":  0,
                "drivers": [],
            }

        team_map[team_name]["points"] += pts
        team_map[team_name]["drivers"].append({
            "driver_number": num,
            "name": d.get("full_name"),
        })

    sorted_teams = sorted(team_map.values(), key=lambda x: x["points"], reverse=True)

    for idx, t in enumerate(sorted_teams):
        t["position"] = idx + 1

    return sorted_teams


# ── /team/{id} ────────────────────────────────────────────────────────────────
@app.get("/team/{team_id}")
def get_team(team_id: str):
    teams = get_teams()
    for t in teams:
        if t["id"] == team_id:
            return t
    return {"error": "Team not found"}


@app.get("/team/{team_id}/history")
def get_team_history(team_id: str):
    sessions_res = requests.get(f"{OPENF1}/sessions?session_name=Race")
    sessions = sessions_res.json()

    if not isinstance(sessions, list):
        return []

    year_sessions = {}
    for s in sessions:
        year = s.get("year")
        date = s.get("date_start")
        if not year or not date:
            continue
        if year not in year_sessions or date > year_sessions[year]["date_start"]:
            year_sessions[year] = s

    result = []
    for year, session in sorted(year_sessions.items()):
        sk  = session.get("session_key")
        res = requests.get(f"{OPENF1}/championship_teams?session_key={sk}")
        data = res.json()
        if not isinstance(data, list):
            continue
        for t in data:
            if t.get("team_name") == team_id:
                result.append({
                    "year":     year,
                    "points":   t.get("points_current"),
                    "position": t.get("position"),
                })

    return result


# ── /races/{year} ─────────────────────────────────────────────────────────────
@app.get("/races/{year}")
def get_races(year: int):
    res = requests.get(f"{OPENF1}/sessions?session_name=Race&year={year}")
    sessions = res.json()

    if not isinstance(sessions, list):
        return []

    now = datetime.now(timezone.utc)
    sessions = [
        s for s in sessions
        if s.get("date_start") and
        datetime.fromisoformat(s["date_start"].replace("Z", "+00:00")) <= now
    ]

    result = []
    for idx, s in enumerate(sorted(sessions, key=lambda x: x["date_start"])):
        result.append({
            "round":       idx + 1,
            "name":        s.get("meeting_name") or s.get("circuit_short_name", f"Round {idx+1}"),
            "circuit":     s.get("circuit_short_name", ""),
            "location":    s.get("country_name", ""),
            "date":        s.get("date_start", ""),
            "session_key": s.get("session_key"),
        })

    return result


# ── /race-results ─────────────────────────────────────────────────────────────
@app.get("/race-results")
def get_race_results(session_key: int):
    url = f"{OPENF1}/session_result?session_key={session_key}"
    response = requests.get(url)
    return response.json()


# ── /compare (lap-level) ──────────────────────────────────────────────────────
def get_common_session(driver1, driver2):
    res = requests.get(f"{OPENF1}/sessions?session_name=Race")
    sessions = sorted(res.json(), key=lambda x: x["date_start"], reverse=True)
    for s in sessions:
        sk = s["session_key"]
        laps1 = requests.get(f"{OPENF1}/laps?session_key={sk}&driver_number={driver1}").json()
        laps2 = requests.get(f"{OPENF1}/laps?session_key={sk}&driver_number={driver2}").json()
        if isinstance(laps1, list) and len(laps1) > 0 and isinstance(laps2, list) and len(laps2) > 0:
            return sk
    return None


@app.get("/compare")
def compare_drivers(driver1: Optional[int] = None, driver2: Optional[int] = None):
    if driver1 is None or driver2 is None:
        return {"error": "Missing driver parameters"}
    session_key = get_common_session(driver1, driver2)
    if not session_key:
        session_key = get_latest_race_session_key()
    laps1 = get_laps(session_key, driver1)
    laps2 = get_laps(session_key, driver2)
    cons1 = get_consistency(session_key, driver1)
    cons2 = get_consistency(session_key, driver2)
    return {
        "session_key": session_key,
        "laps1": laps1,
        "laps2": laps2,
        "cons1": cons1,
        "cons2": cons2,
    }


# ── /compare-fast ─────────────────────────────────────────────────────────────
@app.get("/compare-fast")
def compare_fast(driver1: int, driver2: int, year: int):
    EMPTY_DRIVER = {
        "points":      None,
        "position":    None,
        "team":        None,
        "last_finish": None,
        "consistency": None,
    }

    session_key = get_latest_race_session_key(year)
    if not session_key:
        return {"driver1": EMPTY_DRIVER, "driver2": EMPTY_DRIVER}

    print(f"[compare-fast] session_key={session_key} year={year} driver1={driver1} driver2={driver2}")

    champ_data = requests.get(f"{OPENF1}/championship_drivers?session_key={session_key}").json()
    champ_map  = {}
    if isinstance(champ_data, list):
        for entry in champ_data:
            num = entry.get("driver_number")
            if num is not None:
                champ_map[int(num)] = {
                    "points":   entry.get("points_current"),
                    "position": entry.get("position_current"),
                }

    drv_data = requests.get(f"{OPENF1}/drivers?session_key={session_key}").json()
    drv_map  = {}
    if isinstance(drv_data, list):
        for d in drv_data:
            num = d.get("driver_number")
            if num is not None:
                drv_map[int(num)] = d.get("team_name", "")

    result_data = requests.get(f"{OPENF1}/session_result?session_key={session_key}").json()
    result_map  = {}
    if isinstance(result_data, list):
        for r in result_data:
            num = r.get("driver_number")
            if num is not None:
                result_map[int(num)] = {
                    "position": r.get("position"),
                    "dnf":      r.get("dnf", False),
                    "dns":      r.get("dns", False),
                    "dsq":      r.get("dsq", False),
                }

    cons1 = get_consistency(session_key, driver1)
    cons2 = get_consistency(session_key, driver2)

    def build(driver_number):
        num    = int(driver_number)
        champ  = champ_map.get(num, {})
        result = result_map.get(num, {})
        cons   = cons1 if num == int(driver1) else cons2
        pos    = result.get("position")

        if result.get("dnf"):
            last_finish = "DNF"
        elif result.get("dns"):
            last_finish = "DNS"
        elif result.get("dsq"):
            last_finish = "DSQ"
        elif pos is not None:
            last_finish = int(pos)
        else:
            last_finish = None

        return {
            "points":      champ.get("points"),
            "position":    champ.get("position"),
            "team":        drv_map.get(num),
            "last_finish": last_finish,
            "consistency": cons.get("consistency_score") if isinstance(cons, dict) else None,
        }

    return {
        "driver1": build(driver1),
        "driver2": build(driver2),
    }


# ── /driver-season-stats ──────────────────────────────────────────────────────
@app.get("/driver-season-stats")
def driver_season_stats(driver_number: int, year: int):
    cache_key = f"season_stats_{driver_number}_{year}"
    cached = cache_get(cache_key)
    if cached:
        print(f"[stats] cache hit for driver={driver_number} year={year}")
        return cached

    EMPTY = {
        "total_points": 0,
        "best_finish":  None,
        "best_quali":   None,
        "dnf_count":    0,
        "consistency":  None,
    }
    try:
        sessions_res = requests.get(f"{OPENF1}/sessions?session_name=Race&year={year}").json()
        if not isinstance(sessions_res, list) or len(sessions_res) == 0:
            print(f"[stats] No sessions list for year={year}")
            return EMPTY

        now = datetime.now(timezone.utc)
        race_sessions = [
            s for s in sessions_res
            if s.get("date_start") and
            datetime.fromisoformat(s["date_start"].replace("Z", "+00:00")) <= now
        ]
        print(f"[stats] driver={driver_number} year={year} → {len(race_sessions)} completed race sessions")

        if not race_sessions:
            return EMPTY

        quali_res = requests.get(f"{OPENF1}/sessions?session_type=Qualifying&year={year}").json()
        if not isinstance(quali_res, list) or len(quali_res) == 0:
            quali_res = requests.get(f"{OPENF1}/sessions?session_name=Qualifying&year={year}").json()

        quali_sessions = []
        if isinstance(quali_res, list):
            quali_sessions = [
                s for s in quali_res
                if s.get("date_start") and
                datetime.fromisoformat(s["date_start"].replace("Z", "+00:00")) <= now
            ]
        print(f"[stats] driver={driver_number} year={year} → {len(quali_sessions)} qualifying sessions")

        race_data        = []
        quali_positions  = []
        consistency_list = []

        for s in race_sessions:
            sk = s.get("session_key")
            if not sk:
                continue
            res = requests.get(f"{OPENF1}/session_result?session_key={sk}").json()
            if isinstance(res, list):
                for r in res:
                    if int(r.get("driver_number") or 0) == int(driver_number):
                        pos = r.get("position")
                        race_data.append({
                            "points":   float(r.get("points") or 0),
                            "position": int(pos) if pos is not None else None,
                            "dnf":      r.get("dnf"),
                            "dns":      r.get("dns"),
                            "dsq":      r.get("dsq"),
                        })
            cons  = get_consistency(sk, driver_number)
            score = cons.get("consistency_score") if isinstance(cons, dict) else None
            if score is not None:
                consistency_list.append(score)

        for s in quali_sessions:
            sk = s.get("session_key")
            if not sk:
                continue
            grid = requests.get(f"{OPENF1}/starting_grid?session_key={sk}").json()
            if isinstance(grid, list):
                for g in grid:
                    if int(g.get("driver_number") or 0) == int(driver_number):
                        pos = g.get("position")
                        if pos is not None:
                            quali_positions.append(int(pos))

        print(f"[stats] driver={driver_number} → {len(race_data)} race entries, {len(quali_positions)} quali entries")

        if not race_data:
            return EMPTY

        positions    = [d["position"] for d in race_data if d["position"] is not None]
        total_points = sum(d["points"] for d in race_data)
        best_finish  = min(positions)       if positions       else None
        best_quali   = min(quali_positions) if quali_positions else None
        dnf_count    = sum(1 for d in race_data if d.get("dnf") or d.get("dns") or d.get("dsq"))
        avg_cons     = (
            sum(consistency_list) / len(consistency_list)
            if consistency_list else None
        )

        result = {
            "total_points": total_points,
            "best_finish":  best_finish,
            "best_quali":   best_quali,
            "dnf_count":    dnf_count,
            "consistency":  round(avg_cons, 3) if avg_cons is not None else None,
        }
        print(f"[stats] result for driver={driver_number}: {result}")
        cache_set(cache_key, result)
        return result

    except Exception as e:
        import traceback
        print(f"[stats] ERROR driver={driver_number} year={year}: {e}")
        traceback.print_exc()
        return EMPTY


# ── /simulate-strategy ────────────────────────────────────────────────────────
TYRE_MODEL = {
    "soft":   -2.0,
    "medium":  0.0,
    "hard":   +2.0,
}
DEGRADATION = {
    "soft":   0.08,
    "medium": 0.04,
    "hard":   0.02,
}

# ── Tyre stint ranges (min, max laps per compound) ───────────────────────────
TYRE_STINT_RANGE = {
    "soft":   (8,  20),
    "medium": (18, 35),
    "hard":   (25, 50),
}

def distribute_stints(tyre_list: list, total_laps: int) -> list:
    """
    Distribute total_laps across stints using the midpoint of each tyre's
    realistic range as a weight. Each stint is then clamped to its [min, max],
    and any lap remainder is added to the last stint so the sum always equals
    total_laps exactly.
    """
    midpoints    = [(TYRE_STINT_RANGE[t][0] + TYRE_STINT_RANGE[t][1]) / 2 for t in tyre_list]
    total_weight = sum(midpoints)
    stints       = []

    for i, tyre in enumerate(tyre_list):
        lo, hi     = TYRE_STINT_RANGE[tyre]
        raw        = total_laps * (midpoints[i] / total_weight)
        clamped    = max(lo, min(hi, round(raw)))
        stints.append(clamped)

    # Fix rounding drift: add/subtract difference from last stint
    diff = total_laps - sum(stints)
    stints[-1] = max(1, stints[-1] + diff)

    return stints


@app.get("/simulate-strategy")
def simulate_strategy(session_key: int, tyres: str):
    tyre_list = [t.strip().lower() for t in tyres.split(",") if t.strip()]

    if not tyre_list:
        return {"error": "No tyres provided"}

    for t in tyre_list:
        if t not in TYRE_MODEL:
            return {"error": f"Unknown tyre compound: {t}. Valid: soft, medium, hard"}

    # ── Fetch session result to find the race winner's driver_number ─────────
    # We use the race winner (position=1) as the reference driver for:
    #   - total_laps  (how many laps they completed = race distance)
    #   - avg_lap_time (their lap times, excluding pit-out and SC laps)
    def get_clean_laps_for_driver(sk, driver_num):
        raw = requests.get(f"{OPENF1}/laps?session_key={sk}&driver_number={driver_num}").json()
        if not isinstance(raw, list):
            return []
        return [
            lap["lap_duration"]
            for lap in raw
            if lap.get("lap_duration") is not None
            and lap.get("is_pit_out_lap") is False
            and lap["lap_duration"] < 500
        ]

    def get_reference_driver(sk):
        """Return driver_number of the race winner for this session."""
        result = requests.get(f"{OPENF1}/session_result?session_key={sk}&position=1").json()
        if isinstance(result, list) and len(result) > 0:
            return result[0].get("driver_number")
        # Fallback: first driver in the session
        drivers = requests.get(f"{OPENF1}/drivers?session_key={sk}").json()
        if isinstance(drivers, list) and len(drivers) > 0:
            return drivers[0].get("driver_number")
        return None

    # ── Get reference driver and their lap times ───────────────────────────────
    ref_driver = get_reference_driver(session_key)
    lap_times  = get_clean_laps_for_driver(session_key, ref_driver) if ref_driver else []

    print(f"[simulate] session={session_key} ref_driver={ref_driver} laps={len(lap_times)}")

    # ── Fallback: most recent past session that has clean lap data ─────────────
    if not lap_times:
        print(f"[simulate] No lap data for session_key={session_key}, trying fallback")
        all_sessions = requests.get(f"{OPENF1}/sessions?session_name=Race").json()

        if not isinstance(all_sessions, list):
            return {"error": "No lap data available and no fallback sessions found"}

        now = datetime.now(timezone.utc)
        past = sorted(
            [s for s in all_sessions if s.get("date_start") and
             datetime.fromisoformat(s["date_start"].replace("Z", "+00:00")) <= now],
            key=lambda x: x["date_start"],
            reverse=True
        )

        for s in past:
            sk = s.get("session_key")
            if sk == session_key:
                continue
            fb_driver = get_reference_driver(sk)
            if not fb_driver:
                continue
            fb_times = get_clean_laps_for_driver(sk, fb_driver)
            if fb_times:
                lap_times = fb_times
                print(f"[simulate] Fallback: session={sk} driver={fb_driver} laps={len(lap_times)}")
                break

    if not lap_times:
        return {"error": "No lap data available for this session or any recent session"}

    avg_lap_time = sum(lap_times) / len(lap_times)
    total_laps   = len(lap_times)   # one driver's laps = the race distance

    # ── Weighted stint distribution ───────────────────────────────────────────
    stint_laps = distribute_stints(tyre_list, total_laps)
    print(f"[simulate] total_laps={total_laps} stint_laps={stint_laps}")

    total_time     = 0.0
    lap_times_list = []
    stints_info    = []

    for i, tyre in enumerate(tyre_list):
        delta         = TYRE_MODEL[tyre]
        laps_in_stint = stint_laps[i]

        for lap_in_stint in range(1, laps_in_stint + 1):
            lap_time = avg_lap_time + delta + DEGRADATION[tyre] * lap_in_stint
            total_time += lap_time
            lap_times_list.append(round(lap_time, 3))

        stints_info.append({"tyre": tyre, "laps": laps_in_stint})

    pit_stops   = len(tyre_list) - 1
    total_time += pit_stops * 20

    return {
        "total_time":   round(total_time, 3),
        "avg_lap_time": round(avg_lap_time, 3),
        "total_laps":   total_laps,
        "pit_stops":    pit_stops,
        "stints":       stints_info,
        "lap_times":    lap_times_list,
    }


# ── /laps ─────────────────────────────────────────────────────────────────────
@app.get("/laps")
def get_laps(session_key: int, driver_number: int):
    res  = requests.get(f"{OPENF1}/laps?session_key={session_key}&driver_number={driver_number}")
    data = res.json()
    if not isinstance(data, list):
        return []
    result = []
    for lap in data:
        duration = lap.get("lap_duration")
        if duration is not None:
            result.append({
                "lap":        lap.get("lap_number"),
                "time":       duration,
                "is_pit_out": lap.get("is_pit_out_lap", False),
                "sector_1":   lap.get("duration_sector_1"),
                "sector_2":   lap.get("duration_sector_2"),
                "sector_3":   lap.get("duration_sector_3"),
            })
    return result


# ── /consistency ──────────────────────────────────────────────────────────────
@app.get("/consistency")
def get_consistency(session_key: int, driver_number: int):
    laps = get_laps(session_key, driver_number)

    # Step 1: Filter valid racing laps
    times = [
        l["time"]
        for l in laps
        if l["time"] is not None
        and 60 < l["time"] < 200   # 🚨 key fix
    ]

    if len(times) < 5:
        return {
            "driver_number": driver_number,
            "consistency_score": None,
            "laps_count": len(times)
        }

    # Step 2: Remove outliers (top 10% slow laps)
    sorted_times = sorted(times)
    cutoff_index = int(len(sorted_times) * 0.9)
    clean_times = sorted_times[:cutoff_index]

    # Step 3: Compute stats
    mean = sum(clean_times) / len(clean_times)
    variance = sum((t - mean) ** 2 for t in clean_times) / len(clean_times)
    std_dev = math.sqrt(variance)

    return {
        "driver_number": driver_number,
        "consistency_score": round(std_dev, 3),
        "laps_count": len(clean_times),
        "avg_lap_time": round(mean, 3),
    }



# ── /fantasy_score ─────────────────────────────────────────────────────────────
# Scoring system:
#   Finish position  → F1 points table
#   Positions gained → +2/-2 per position vs starting grid
#   Overtakes        → +1 each, capped at 10
#   DNF / DSQ        → -10 / -20
#   Strategy score   → reuses optimal_strategy: time_gain% → +10/+5/0
#   Consistency      → reuses get_consistency: std_dev → +10/+5/0
#   Team score       → sum of the two team drivers that appear in driver_numbers

FINISH_POINTS = {1:25, 2:18, 3:15, 4:12, 5:10, 6:8, 7:6, 8:4, 9:2, 10:1}

@app.get("/fantasy_score")
def fantasy_score(session_key: int, driver_numbers: str, team_name: str):
    """
    driver_numbers: comma-separated list of exactly 3 driver numbers e.g. "1,4,16"
    team_name:      exact team name string e.g. "McLaren"
    """
    try:
        drv_nums = [int(x.strip()) for x in driver_numbers.split(",") if x.strip()]
    except ValueError:
        return {"error": "driver_numbers must be comma-separated integers"}

    if len(drv_nums) != 3:
        return {"error": "Exactly 3 driver_numbers required"}

    # ── 1. Fetch shared data in one pass each ─────────────────────────────────
    result_data = requests.get(f"{OPENF1}/session_result?session_key={session_key}").json()
    result_map  = {}
    if isinstance(result_data, list):
        for r in result_data:
            num = r.get("driver_number")
            if num is not None:
                result_map[int(num)] = r

    grid_data = requests.get(f"{OPENF1}/starting_grid?session_key={session_key}").json()
    grid_map  = {}
    if isinstance(grid_data, list):
        for g in grid_data:
            num = g.get("driver_number")
            if num is not None:
                grid_map[int(num)] = g.get("position")

    overtake_data = requests.get(f"{OPENF1}/overtakes?session_key={session_key}").json()
    overtake_counts = {}
    if isinstance(overtake_data, list):
        for o in overtake_data:
            num = o.get("overtaking_driver_number")
            if num is not None:
                overtake_counts[int(num)] = overtake_counts.get(int(num), 0) + 1

    # driver info for team mapping
    drv_info_data = requests.get(f"{OPENF1}/drivers?session_key={session_key}").json()
    drv_info_map  = {}
    if isinstance(drv_info_data, list):
        for d in drv_info_data:
            num = d.get("driver_number")
            if num is not None:
                drv_info_map[int(num)] = d

    # ── 2. Score each driver ──────────────────────────────────────────────────
    driver_scores = []

    for num in drv_nums:
        result   = result_map.get(num, {})
        pos      = result.get("position")
        dnf      = result.get("dnf", False)
        dsq      = result.get("dsq", False)
        grid_pos = grid_map.get(num)

        # Finish position points
        finish_pts = 0
        if not dnf and not dsq and pos is not None:
            finish_pts = FINISH_POINTS.get(int(pos), 0)

        # Positions gained/lost vs starting grid
        positions_pts = 0
        if grid_pos is not None and pos is not None and not dnf and not dsq:
            gained = int(grid_pos) - int(pos)   # positive = moved forward
            positions_pts = gained * 2

        # Overtakes (capped at 10)
        raw_overtakes = overtake_counts.get(num, 0)
        overtake_pts = int(raw_overtakes * 0.5)

        # DNF / DSQ penalty
        penalty = 0
        if dsq:
            penalty = -20
        elif dnf:
            penalty = -10

        # Strategy score — reuse get_optimal_strategy
        strategy_pts = 0
        try:
            opt = get_optimal_strategy(session_key, num)
            if isinstance(opt, dict) and "time_gain" in opt and "real_time" in opt:
                real_t = opt["real_time"]
                gain   = opt["time_gain"]
                if real_t > 0:
                    pct = (gain / real_t) * 100
                    if pct < 2:
                        strategy_pts = 10
                    elif pct < 5:
                        strategy_pts = 5
        except Exception:
            pass

        # Consistency score — reuse get_consistency
        consistency_pts = 0
        try:
            cons = get_consistency(session_key, num)
            if isinstance(cons, dict) and cons.get("consistency_score") is not None:
                std = cons["consistency_score"]
                if std < 1.0:
                    consistency_pts = 10
                elif std < 2.5:
                    consistency_pts = 5
        except Exception:
            pass

        total = finish_pts + positions_pts + overtake_pts + penalty + strategy_pts + consistency_pts

        driver_scores.append({
            "driver_number": num,
            "full_name":     drv_info_map.get(num, {}).get("full_name", f"Driver {num}"),
            "total":         total,
            "breakdown": {
                "finish":      finish_pts,
                "positions":   positions_pts,
                "overtakes":   overtake_pts,
                "penalty":     penalty,
                "strategy":    strategy_pts,
                "consistency": consistency_pts,
            }
        })

    # ── 3. Team score — calculate for BOTH team drivers ─────────────

    team_drivers = [
        num for num, info in drv_info_map.items()
        if info.get("team_name") == team_name
    ]

    team_score = 0

    for num in team_drivers:
        result   = result_map.get(num, {})
        pos      = result.get("position")
        dnf      = result.get("dnf", False)
        dsq      = result.get("dsq", False)
        grid_pos = grid_map.get(num)

        # Finish
        finish_pts = 0
        if not dnf and not dsq and pos is not None:
            finish_pts = FINISH_POINTS.get(int(pos), 0)

        # Positions
        positions_pts = 0
        if grid_pos is not None and pos is not None and not dnf and not dsq:
            gained = int(grid_pos) - int(pos)
            positions_pts = gained * 2

        # Overtakes
        overtake_pts = int(overtake_counts.get(num, 0) * 0.5)

        # Penalty
        penalty = -20 if dsq else (-10 if dnf else 0)

        # Strategy
        strategy_pts = 0
        try:
            opt = get_optimal_strategy(session_key, num)
            if isinstance(opt, dict) and "real_time" in opt:
                pct = (opt["time_gain"] / opt["real_time"]) * 100
                if pct < 2:
                    strategy_pts = 10
                elif pct < 5:
                    strategy_pts = 5
        except:
            pass

        # Consistency
        consistency_pts = 0
        try:
            cons = get_consistency(session_key, num)
            std = cons.get("consistency_score")
            if std is not None:
                if std < 1.0:
                    consistency_pts = 10
                elif std < 2.5:
                    consistency_pts = 5
        except:
            pass

        team_score += (
            finish_pts + positions_pts + overtake_pts +
            penalty + strategy_pts + consistency_pts
        )

    total_score = sum(d["total"] for d in driver_scores) + team_score

    return {
        "drivers":     driver_scores,
        "team_score":  team_score,
        "total_score": total_score,
    }

# ── /sessions ─────────────────────────────────────────────────────────────────
@app.get("/sessions")
def get_sessions():
    res  = requests.get(f"{OPENF1}/sessions?session_name=Race")
    data = res.json()
    if not isinstance(data, list):
        return []
    result = []
    for s in data:
        result.append({
            "session_key":        s.get("session_key"),
            "session_name":       s.get("session_name"),
            "circuit_short_name": s.get("circuit_short_name"),
            "country_name":       s.get("country_name"),
            "location":           s.get("location"),
            "date_start":         s.get("date_start"),
            "year":               s.get("year"),
            "round_number":       s.get("round_number"),
        })
    return sorted(result, key=lambda x: x.get("date_start") or "", reverse=True)


# ── /stint analysis ─────────────────────────────────────────────────────────────────
@app.get("/stint-analysis")
def stint_analysis(session_key: int, driver_number: int = None):
    res = requests.get(f"{OPENF1}/stints?session_key={session_key}")
    data = res.json()

    if not isinstance(data, list):
        return {"stints": [], "summary": {}, "pits": []}

    if driver_number:
        data = [s for s in data if s.get("driver_number") == driver_number]

    result = []

    for s in data:
        lap_start = s.get("lap_start")
        lap_end = s.get("lap_end")
        compound = s.get("compound")

        if lap_start is None or lap_end is None or not compound:
            continue

        laps = lap_end - lap_start + 1

        result.append({
            "stint": s.get("stint_number"),
            "compound": compound,
            "lap_start": lap_start,
            "lap_end": lap_end,
            "laps": laps
        })

    result = sorted(result, key=lambda x: x["stint"] if x["stint"] else 999)

    if not result:
        return {"stints": [], "summary": {}, "pits": []}

    total_laps = sum(s["laps"] for s in result)
    stint_count = len(result)
    pit_stops = max(stint_count - 1, 0)

    strategy = " → ".join(s["compound"][0] for s in result)

    tyre_usage = {}
    for s in result:
        tyre = s["compound"]
        tyre_usage[tyre] = tyre_usage.get(tyre, 0) + s["laps"]

    longest = max(result, key=lambda x: x["laps"])
    shortest = min(result, key=lambda x: x["laps"])

    pit_res = requests.get(f"{OPENF1}/pit?session_key={session_key}")
    pit_data = pit_res.json()

    if isinstance(pit_data, list) and driver_number:
        pit_data = [p for p in pit_data if p.get("driver_number") == driver_number]

    pit_events = []

    if isinstance(pit_data, list):
        for p in pit_data:
            lap = p.get("lap_number")
            duration = p.get("stop_duration")

            if lap is not None:
                pit_events.append({
                    "lap": lap,
                    "duration": duration
                })

    return {
        "stints": result,
        "summary": {
            "total_laps": total_laps,
            "stint_count": stint_count,
            "pit_stops": pit_stops,
            "strategy": strategy,
            "tyre_usage": tyre_usage,
            "longest_stint": longest,
            "shortest_stint": shortest
        },
        "pits": pit_events
    }


@app.get("/optimal_strategy")
def get_optimal_strategy(session_key: int, driver_number: int):
    # Fetch laps
    res1 = requests.get(
        f"{OPENF1}/laps?session_key={session_key}&driver_number={driver_number}"
    )
    laps = res1.json()

    if not isinstance(laps, list) or len(laps) == 0:
        return {"error": "No lap data"}

    # Fetch stints
    res2 = requests.get(
        f"{OPENF1}/stints?session_key={session_key}&driver_number={driver_number}"
    )
    stints = res2.json()

    if not isinstance(stints, list) or len(stints) == 0:
        return {"error": "No stint data"}

    # --- REAL TOTAL TIME ---
    lap_times = []
    for lap in laps:
        lap_time = lap.get("lap_duration")
        if lap_time is not None and lap_time < 200:
            lap_times.append(lap_time)

    if len(lap_times) == 0:
        return {"error": "No valid lap times"}

    real_total = sum(lap_times)
    total_laps = len(lap_times)

    # --- GROUP STINTS (FIX DUPLICATES) ---
    stint_groups = {}

    for stint in stints:
        num = stint.get("stint_number")
        if num is None:
            continue

        if num not in stint_groups:
            stint_groups[num] = []

        stint_groups[num].append(stint)

    merged_stints = []

    for num in sorted(stint_groups.keys()):
        group = stint_groups[num]

        lap_start = min(s.get("lap_start", 9999) for s in group)
        lap_end = max(s.get("lap_end", 0) for s in group)

        merged_stints.append({
            "stint_number": num,
            "lap_start": lap_start,
            "lap_end": lap_end
        })

    # --- STINT ANALYSIS ---
    stint_avgs = []

    for stint in merged_stints:
        start = stint.get("lap_start")
        end = stint.get("lap_end")

        if start is None or end is None:
            continue

        stint_laps = [
            lap.get("lap_duration")
            for lap in laps
            if lap.get("lap_number") is not None
            and start <= lap.get("lap_number") <= end
            and lap.get("lap_duration") is not None
            and lap.get("lap_duration") < 200
        ]

        if len(stint_laps) == 0:
            continue

        avg_time = sum(stint_laps) / len(stint_laps)
        best_lap = min(stint_laps)

        degradation_laps = sum(
            1 for lap_time in stint_laps if lap_time > best_lap + 1.5
        )

        stint_data = {
            "stint": stint.get("stint_number"),
            "avg": avg_time,
            "laps": len(stint_laps),
            "total_time": sum(stint_laps),
            "best_lap": best_lap,
            "degradation_laps": degradation_laps,
            "overstayed": degradation_laps > 3
        }

        stint_avgs.append(stint_data)

    if len(stint_avgs) == 0:
        return {"error": "No valid stint averages"}

    # --- CLEAN STINTS ---
    filtered_stints = [
        s for s in stint_avgs
        if s["laps"] >= total_laps * 0.15
    ]

    filtered_stints.sort(key=lambda x: x["stint"])

    # renumber cleanly
    for i, stint in enumerate(filtered_stints):
        stint["stint"] = i + 1

    stint_avgs = filtered_stints

    # --- OPTIMAL STRATEGY ---
    best_avg = min(s["avg"] for s in stint_avgs)

    problem_stint = None
    best_stint = None
    max_loss = -1
    min_loss = float("inf")

    for stint in stint_avgs:
        expected_time = stint["laps"] * best_avg
        actual_time = stint["total_time"]

        loss = max(0, actual_time - expected_time)
        stint["time_loss"] = loss

        if loss > max_loss:
            max_loss = loss
            problem_stint = stint

        if loss < min_loss:
            min_loss = loss
            best_stint = stint

    optimal_total = best_avg * total_laps
    time_gain = real_total - optimal_total

    return {
        "real_time": real_total,
        "optimal_time": optimal_total,
        "time_gain": time_gain,
        "total_laps": total_laps,
        "best_stint_avg": best_avg,
        "stints": stint_avgs,
        "problem_stint": problem_stint,
        "best_stint": best_stint
    }