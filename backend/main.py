from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/drivers")
def get_drivers():
    return [
        {"id": 1, "name": "Lewis Hamilton"},
        {"id": 2, "name": "Max Verstappen"},
        {"id": 3, "name": "Sebastian Vettel"},
    ]

@app.get("/drivers/{id}")
def get_driver(id: int):
    drivers = [
        {"id": 1, "name": "Lewis Hamilton", "team": "Mercedes", "points": 100},
        {"id": 2, "name": "Max Verstappen", "team": "Red Bull", "points": 90},
        {"id": 3, "name": "Sebastian Vettel", "team": "Aston Martin", "points": 80}
    ]
    
    for driver in drivers:
        if driver["id"] == id:
            return driver
    
    return {"error": "Driver not found"}

@app.get("/drivers/{id}/performance")
def get_driver_performance(id: int):
    performance_data = [
        [{"year": 2020, "points": 200},
        {"year": 2021, "points": 180},
        {"year": 2022, "points": 220},
        {"year": 2023, "points": 210}],
        [{"year": 2020, "points": 150},
        {"year": 2021, "points": 170},
        {"year": 2022, "points": 190},
        {"year": 2023, "points": 200}],
        [{"year": 2020, "points": 150},
        {"year": 2021, "points": 140},
        {"year": 2022, "points": 120},
        {"year": 2023, "points": 130}]
    ]
    
    for i in range(len(performance_data)):
        if i + 1 == id:
            return performance_data[i]
        
@app.get("/teams")
def get_teams():
    return [
        {"id": 1, "name": "Mercedes"},
        {"id": 2, "name": "Red Bull"},
        {"id": 3, "name": "Aston Martin"}
    ]

@app.get("/team/{id}")
def get_team(id: int):
    teams = [
        {"id": 1, "name": "Mercedes", "points": 100},
        {"id": 2, "name": "Red Bull", "points": 90},
        {"id": 3, "name": "Aston Martin", "points": 80}
    ]
    
    for team in teams:
        if team["id"] == id:
            return team
    
    return {"error": "Team not found"}

@app.get("/standings/drivers")
def get_driver_standings():
    return [
        {"position": 1, "name": "Lewis Hamilton", "team": "Mercedes", "points": 100},
        {"position": 2, "name": "Max Verstappen", "team": "Red Bull", "points": 90},
        {"position": 3, "name": "Sebastian Vettel", "team": "Aston Martin", "points": 80}
    ]

@app.get("/standings/constructors")
def get_team_standings():
    return [
        {"position": 1, "name": "Mercedes", "points": 100},
        {"position": 2, "name": "Red Bull", "points": 90},
        {"position": 3, "name": "Aston Martin", "points": 80}
    ]