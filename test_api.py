import requests

BASE_URL = "http://localhost:8000/meetings"

def test_api():
    print("Testing Instant Meeting...")
    res = requests.post(f"{BASE_URL}/instant")
    assert res.status_code == 201
    instant_meeting = res.json()
    code = instant_meeting["meeting_code"]
    print(f"Created instant meeting: {code}")

    print("Testing Get by Code...")
    res = requests.get(f"{BASE_URL}/{code}")
    assert res.status_code == 200
    assert res.json()["meeting_code"] == code

    print("Testing Schedule Meeting...")
    res = requests.post(f"{BASE_URL}/schedule", json={
        "title": "Future Test Meeting",
        "description": "Test Desc",
        "scheduled_at": "2030-01-01T10:00:00Z",
        "duration_minutes": 60
    })
    assert res.status_code == 201
    sched_code = res.json()["meeting_code"]
    print(f"Created scheduled meeting: {sched_code}")

    print("Testing Get Upcoming...")
    res = requests.get(f"{BASE_URL}/upcoming")
    assert res.status_code == 200
    upcoming = res.json()
    assert any(m["meeting_code"] == sched_code for m in upcoming)

    print("Testing Get Recent...")
    res = requests.get(f"{BASE_URL}/recent")
    assert res.status_code == 200
    print(f"Recent meetings count: {len(res.json())}")

    print("Testing Join Meeting...")
    res = requests.post(f"{BASE_URL}/{code}/join", json={"display_name": "Test User"})
    assert res.status_code == 200
    participant = res.json()["participant"]
    assert participant["display_name"] == "Test User"
    print(f"Joined meeting, participant ID: {participant['id']}")

    print("Testing Get Participants...")
    res = requests.get(f"{BASE_URL}/{code}/participants")
    assert res.status_code == 200
    assert len(res.json()) > 0
    
    print("Testing Join Non-existent Meeting...")
    res = requests.post(f"{BASE_URL}/invalid-code/join", json={"display_name": "Ghost"})
    assert res.status_code == 404

    print("All tests passed!")

if __name__ == "__main__":
    test_api()
