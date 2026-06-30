import os
from api.index import app, db, bcrypt
from models import User, Challenge

def seed_db():
    with app.app_context():
        # Clean existing data if we are reseeding
        db.drop_all()
        db.create_all()
        
        # Seed Mock Users for Leaderboard
        users = [
            User(username='CyberNinja', email='ninja@seclabs.local', password_hash=bcrypt.generate_password_hash('password123').decode('utf-8'), points=350),
            User(username='Hackerman', email='hacker@seclabs.local', password_hash=bcrypt.generate_password_hash('password123').decode('utf-8'), points=200),
            User(username='AliceSec', email='alice@seclabs.local', password_hash=bcrypt.generate_password_hash('password123').decode('utf-8'), points=150)
        ]
        for u in users:
            db.session.add(u)
            
        # Seed Challenges
        challenges = [
            Challenge(
                title='SQL Injection 101',
                category='Web',
                description='The Staff Search Directory is vulnerable to SQL Injection. Find a way to bypass the search filter and leak the hidden admin flag. Hint: Try using an OR statement.',
                points=100,
                difficulty='Easy',
                flag='CTF{sql_1nj3ct10n_byp4ss}',
                hint='What happens if you enter: admin\' OR \'1\'=\'1 ?',
                vulnerable_code="query = f\"SELECT * FROM users WHERE username = '{search_term}'\"",
                secure_code="query = \"SELECT * FROM users WHERE username = %s\"\ncursor.execute(query, (search_term,))"
            ),
            Challenge(
                title='Cross-Site Scripting (XSS)',
                category='Web',
                description='The guestbook comment section reflects your input back without sanitization. Inject an alert box to get the flag.',
                points=150,
                difficulty='Medium',
                flag='CTF{xss_al3rt_m4st3r}',
                hint='Try injecting a simple script tag: <script>alert(1)</script>',
                vulnerable_code="return f\"<div>User Comment: {user_input}</div>\"",
                secure_code="from markupsafe import escape\nreturn f\"<div>User Comment: {escape(user_input)}</div>\""
            ),
            Challenge(
                title='Command Injection',
                category='System',
                description='The Ping Utility takes an IP address and pings it. However, it does not sanitize the input. Run a system command to read the flag.txt file.',
                points=200,
                difficulty='Hard',
                flag='CTF{cmnd_inj3ct1on_pwn3d}',
                hint='You can chain commands using semicolons. Try: 127.0.0.1; ls -la',
                vulnerable_code="os.system(f'ping -c 4 {ip_address}')",
                secure_code="subprocess.run(['ping', '-c', '4', ip_address]) # Avoid using shell=True"
            ),
            Challenge(
                title='Decode the Secret',
                category='Cryptography',
                description='We intercepted this message: \"ZkxoY2h2aV9iYnZfZ2hyX2piZXhndmF0Ig==\". Decode it to find the flag.',
                points=50,
                difficulty='Easy',
                flag='CTF{base64_is_not_encryption}',
                hint='Looks like Base64 encoding.',
                vulnerable_code="",
                secure_code=""
            )
        ]
        
        for c in challenges:
            db.session.add(c)
            
        db.session.commit()
        print("Database initialized and seeded successfully!")

if __name__ == '__main__':
    seed_db()
