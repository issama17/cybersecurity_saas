import requests

print("--- Testing Direct Backend ---")
session1 = requests.Session()
r1 = session1.post("http://127.0.0.1:5000/api/auth/register", json={"username": "testuser", "email": "test@seclabs.io", "password": "password123"})
print("Backend Register:", r1.status_code, r1.json())
r2 = session1.post("http://127.0.0.1:5000/api/auth/login", json={"email": "test@seclabs.io", "password": "password123"})
print("Backend Login:", r2.status_code, r2.cookies.get_dict())
r3 = session1.get("http://127.0.0.1:5000/api/auth/me")
print("Backend Auth Me:", r3.status_code, r3.json())

print("\n--- Testing Next.js Proxy ---")
session2 = requests.Session()
r4 = session2.post("http://127.0.0.1:3000/api/auth/login", json={"email": "test@seclabs.io", "password": "password123"})
print("Proxy Login:", r4.status_code, r4.cookies.get_dict())
r5 = session2.get("http://127.0.0.1:3000/api/auth/me")
print("Proxy Auth Me:", r5.status_code, r5.json())
