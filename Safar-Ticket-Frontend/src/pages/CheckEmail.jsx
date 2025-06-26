import React from 'react';
import { useLocation, Link } from 'react-router-dom';

function CheckEmail() {
  const location = useLocation();
  const email = location.state?.email || 'your email';

  return (
    <div className="form-container" style={{ textAlign: 'center' }}>
      <h2>Check Your Inbox</h2>
      <p>A verification link has been sent to <strong>{email}</strong>.</p>
      <p>Click the link to activate your account. The link will expire in 15 minutes.</p>
      <p style={{ color: '#888', marginTop: '20px' }}>
        Didn't receive the email? Check your spam folder or try to register again.
      </p>
      <Link to="/login">
        <button className="form-button" style={{ marginTop: '20px', backgroundColor: '#6c757d' }}>
          Back to Login
        </button>
      </Link>
    </div>
  );
}

export default CheckEmail;
