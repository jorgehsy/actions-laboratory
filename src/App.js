import React, { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import { signInWithRedirect, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { amplifyConfig } from './amplifyConfig';
import './App.css';

// Configure Amplify
Amplify.configure(amplifyConfig);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      // Get additional user info from tokens
      const session = await fetchAuthSession();
      if (session.tokens?.idToken) {
        setUserInfo(session.tokens.idToken.payload);
      }
    } catch (error) {
      console.log('User not authenticated:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      // Debug: Log the configuration
      console.log('Environment variables:', {
        userPoolId: process.env.REACT_APP_USER_POOL_ID,
        clientId: process.env.REACT_APP_USER_POOL_CLIENT_ID,
        domain: process.env.REACT_APP_COGNITO_DOMAIN,
        redirectUrl: process.env.REACT_APP_REDIRECT_URL
      });

      // This will redirect to Cognito Hosted UI with Microsoft Entra ID provider
      await signInWithRedirect({
        provider: {
          custom: process.env.REACT_APP_PROVIDER_NAME
        }
      });
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setUserInfo(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>AWS Cognito + Microsoft Entra ID Login Test</h1>

        {!user ? (
          <div className="login-section">
            <h2>Please sign in</h2>
            <p>Click the button below to sign in with Microsoft Entra ID through AWS Cognito</p>
            <button
              className="sign-in-button"
              onClick={handleSignIn}
            >
              Sign In with Microsoft
            </button>
          </div>
        ) : (
          <div className="user-section">
            <h2>Welcome!</h2>
            <div className="user-info">
              <h3>User Information:</h3>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>User ID:</strong> {user.userId}</p>

              {userInfo && (
                <div className="token-info">
                  <h3>Token Information:</h3>
                  <p><strong>Email:</strong> {userInfo.email}</p>
                  <p><strong>Name:</strong> {userInfo.name || 'N/A'}</p>
                  <p><strong>Token Use:</strong> {userInfo.token_use}</p>
                  <p><strong>Auth Time:</strong> {new Date(userInfo.auth_time * 1000).toLocaleString()}</p>
                  <p><strong>Issuer:</strong> {userInfo.iss}</p>
                </div>
              )}
            </div>

            <button
              className="sign-out-button"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;