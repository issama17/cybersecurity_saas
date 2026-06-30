import os
from flask import Flask, request, jsonify
from functools import wraps
from itsdangerous import URLSafeTimedSerializer
from flask import g
from flask_bcrypt import Bcrypt
from flask_cors import CORS

# To allow importing from parent directory in Vercel
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import Config
from models import db, User, Challenge, Submission, StudyNote

app = Flask(__name__)
app.config.from_object(Config)
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = False

# Enable CORS for Next.js frontend (running on port 3000 locally)
CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

# Ensure database directory exists if using local SQLite
if app.config['SQLALCHEMY_DATABASE_URI'].startswith('sqlite'):
    db_path = app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', '')
    os.makedirs(os.path.dirname(db_path), exist_ok=True)

db.init_app(app)
bcrypt = Bcrypt(app)
def get_serializer():
    return URLSafeTimedSerializer(app.config['SECRET_KEY'])

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Unauthorized"}), 401
        token = auth_header.split(' ')[1]
        try:
            s = get_serializer()
            user_id = s.loads(token, max_age=86400)
            current_user = db.session.get(User, user_id)
            if not current_user:
                raise Exception("User not found")
            g.user = current_user
        except Exception as e:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated

# Initialize database tables on startup
with app.app_context():
    db.create_all()
    
    # Auto-seed challenges if database is empty
    if Challenge.query.count() == 0:
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
        print("Database auto-seeded successfully!")

@app.route('/api/health')
def health_check():
    return jsonify({"status": "ok"})

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user():
    return jsonify({
        "id": g.user.id,
        "username": g.user.username,
        "email": g.user.email,
        "points": g.user.points,
        "is_admin": g.user.is_admin,
        "created_at": g.user.created_at.isoformat()
    }), 200

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400
        
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409
        
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, email=email, password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    
    s = get_serializer()
    token = s.dumps(new_user.id)
    return jsonify({"message": "Registered successfully", "token": token, "user": {"id": new_user.id, "username": new_user.username}}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password_hash, password):
        s = get_serializer()
        token = s.dumps(user.id)
        return jsonify({"message": "Logged in successfully", "token": token, "user": {"id": user.id, "username": user.username}}), 200
        
    return jsonify({"error": "Invalid email or password"}), 401

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/api/dashboard', methods=['GET'])
@token_required
def dashboard():
    recent_subs = g.user.submissions.order_by(Submission.submitted_at.desc()).limit(5).all()
    activity = [{
        "challenge_title": sub.challenge.title,
        "is_correct": sub.is_correct,
        "submitted_at": sub.submitted_at.isoformat()
    } for sub in recent_subs]
    
    total_completed = g.user.submissions.filter_by(is_correct=True).count()
    
    return jsonify({
        "points": g.user.points,
        "total_completed": total_completed,
        "recent_activity": activity
    }), 200

@app.route('/api/labs', methods=['GET'])
@token_required
def labs():
    challenges = Challenge.query.all()
    result = []
    for c in challenges:
        result.append({
            "id": c.id,
            "title": c.title,
            "category": c.category,
            "difficulty": c.difficulty,
            "points": c.points,
            "description": c.description[:100] + "..." # Short description
        })
    return jsonify(result), 200

@app.route('/api/labs/<int:challenge_id>', methods=['GET'])
@token_required
def lab_detail(challenge_id):
    c = Challenge.query.get_or_404(challenge_id)
    already_solved = Submission.query.filter_by(
        user_id=g.user.id, 
        challenge_id=c.id, 
        is_correct=True
    ).first() is not None
    
    data = {
        "id": c.id,
        "title": c.title,
        "category": c.category,
        "difficulty": c.difficulty,
        "points": c.points,
        "description": c.description,
        "hint": c.hint,
        "already_solved": already_solved
    }
    
    if already_solved:
        data["vulnerable_code"] = c.vulnerable_code
        data["secure_code"] = c.secure_code
        
    return jsonify(data), 200

@app.route('/api/labs/<int:challenge_id>/submit', methods=['POST'])
@token_required
def submit_flag(challenge_id):
    c = Challenge.query.get_or_404(challenge_id)
    
    already_solved = Submission.query.filter_by(
        user_id=g.user.id, 
        challenge_id=c.id, 
        is_correct=True
    ).first() is not None
    
    if already_solved:
        return jsonify({"error": "Challenge already solved"}), 400
        
    data = request.get_json()
    submitted_flag = data.get('flag', '')
    is_correct = submitted_flag == c.flag
    
    submission = Submission(
        user_id=g.user.id,
        challenge_id=c.id,
        submitted_flag=submitted_flag,
        is_correct=is_correct
    )
    db.session.add(submission)
    
    if is_correct:
        g.user.points += c.points
        db.session.commit()
        return jsonify({"message": "Correct! Points awarded.", "is_correct": True}), 200
    else:
        db.session.commit()
        return jsonify({"message": "Incorrect flag.", "is_correct": False}), 400

@app.route('/api/leaderboard', methods=['GET'])
def leaderboard():
    users = User.query.order_by(User.points.desc()).limit(50).all()
    result = [{
        "rank": idx + 1,
        "id": u.id,
        "username": u.username,
        "points": u.points,
        "is_admin": u.is_admin,
        "created_at": u.created_at.strftime('%Y-%m-%d')
    } for idx, u in enumerate(users)]
    return jsonify(result), 200

@app.route('/api/study_hub', methods=['GET'])
@token_required
def study_hub():
    notes = StudyNote.query.order_by(StudyNote.created_at.desc()).all()
    result = [{
        "id": n.id,
        "title": n.title,
        "content": n.content,
        "author": n.author.username,
        "created_at": n.created_at.strftime('%Y-%m-%d %H:%M')
    } for n in notes]
    return jsonify(result), 200

# Vercel needs the app to be available in this module
# For local testing
if __name__ == '__main__':
    app.run(debug=True, port=5000)
