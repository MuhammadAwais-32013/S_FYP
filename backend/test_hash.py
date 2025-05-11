import bcrypt

# Test password hashing and verification
def test_password_hash():
    # Plain text password
    password = "test123"
    
    print(f"Original password: {password}")
    
    # Hash the password
    password_bytes = password.encode('utf-8')
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    hashed_str = hashed.decode('utf-8')
    
    print(f"Hashed password: {hashed_str}")
    
    # Verify the password
    is_valid = bcrypt.checkpw(password_bytes, hashed)
    print(f"Password valid? {is_valid}")
    
    # Test incorrect password
    wrong_password = "test456"
    is_invalid = bcrypt.checkpw(wrong_password.encode('utf-8'), hashed)
    print(f"Wrong password valid? {is_invalid}")
    
    # Test re-encoding the hash from string
    rehashed = hashed_str.encode('utf-8')
    is_still_valid = bcrypt.checkpw(password_bytes, rehashed)
    print(f"Password still valid after re-encoding? {is_still_valid}")

if __name__ == "__main__":
    test_password_hash() 