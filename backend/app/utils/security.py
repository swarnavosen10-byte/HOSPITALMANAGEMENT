import hashlib
import os

def hash_password(password: str) -> str:
    """Hash password using PBKDF2-HMAC (SHA-256) with a secure 16-byte random salt"""
    salt = os.urandom(16)
    db_value = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000)
    return salt.hex() + "$" + db_value.hex()

def verify_password(password: str, hashed: str) -> bool:
    """Verify password by parsing the salt and checking the PBKDF2-HMAC hash"""
    try:
        if not hashed or "$" not in hashed:
            return False
        salt_hex, hash_hex = hashed.split("$")
        salt = bytes.fromhex(salt_hex)
        db_value = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000)
        return db_value.hex() == hash_hex
    except Exception:
        return False
