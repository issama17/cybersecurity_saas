import re

with open('api/index.py', 'r') as f:
    content = f.read()

# Replace imports
content = content.replace("from flask_login import LoginManager, login_user, logout_user, login_required, current_user", 
"""from functools import wraps
from itsdangerous import URLSafeTimedSerializer
from flask import g""")

# Remove LoginManager setup
content = re.sub(r'login_manager = LoginManager\(app\).*?def unauthorized\(\):\n    return jsonify\(\{"error": "Unauthorized"\}\), 401',
"""def get_serializer():
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
    return decorated""", content, flags=re.DOTALL)

# Update /api/auth/me
content = re.sub(r"@app\.route\('/api/auth/me', methods=\['GET'\]\)\ndef get_current_user\(\):\n    if current_user\.is_authenticated:\n        return jsonify\(\{(.*?)\}\)\n    return jsonify\(\{\"user\": None\}\), 200",
"""@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user():
    return jsonify({
        "id": g.user.id,
        "username": g.user.username,
        "email": g.user.email,
        "points": g.user.points,
        "is_admin": g.user.is_admin,
        "created_at": g.user.created_at.isoformat()
    }), 200""", content, flags=re.DOTALL)

# Update Register
content = content.replace("""    login_user(new_user)
    return jsonify({"message": "Registered successfully", "user": {"id": new_user.id, "username": new_user.username}}), 201""",
"""    s = get_serializer()
    token = s.dumps(new_user.id)
    return jsonify({"message": "Registered successfully", "token": token, "user": {"id": new_user.id, "username": new_user.username}}), 201""")

# Update Login
content = content.replace("""        login_user(user)
        return jsonify({"message": "Logged in successfully", "user": {"id": user.id, "username": user.username}}), 200""",
"""        s = get_serializer()
        token = s.dumps(user.id)
        return jsonify({"message": "Logged in successfully", "token": token, "user": {"id": user.id, "username": user.username}}), 200""")

# Update Logout
content = content.replace("""@app.route('/api/auth/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200""",
"""@app.route('/api/auth/logout', methods=['POST'])
def logout():
    return jsonify({"message": "Logged out successfully"}), 200""")

# Replace @login_required with @token_required
content = content.replace('@login_required', '@token_required')

# Replace current_user with g.user
content = content.replace('current_user.', 'g.user.')

with open('api/index.py', 'w') as f:
    f.write(content)

print("Backend patched successfully.")
