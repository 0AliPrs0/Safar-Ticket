import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import "../styles/Form.css";
import LoadingIndicator from '../components/LoadingIndicator';

function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your account, please wait...');
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current === false) {
      const verifyToken = async () => {
        if (!token) {
          setStatus('error');
          setMessage('No verification token found.');
          return;
        }
        try {
          const res = await api.get(`/api/verify-otp/${token}/`);
          setStatus('success');
          setMessage(res.data.message);
        } catch (err) {
          setStatus('error');
          setMessage(err.response?.data?.error || 'Verification failed. The link might be expired or invalid.');
        }
      };

      verifyToken();
      hasVerified.current = true;
    }
  }, [token]);

  return (
    <div className="form-container" style={{ textAlign: 'center' }}>
      {status === 'verifying' && (
        <>
          <LoadingIndicator />
          <h2>{message}</h2>
        </>
      )}
      {status === 'success' && (
        <>
          <h2 style={{ color: 'green' }}>✓ Account Verified!</h2>
          <p>{message}</p>
          <Link to="/login">
            <button className="form-button" style={{ marginTop: '20px' }}>
              Proceed to Login
            </button>
          </Link>
        </>
      )}
      {status === 'error' && (
        <>
          <h2 style={{ color: 'red' }}>✗ Verification Failed</h2>
          <p>{message}</p>
          <Link to="/register">
            <button className="form-button" style={{ marginTop: '20px' }}>
              Try to Register Again
            </button>
          </Link>
        </>
      )}
    </div>
  );
}

export default VerifyEmail;
