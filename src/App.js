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
  const [tokens, setTokens] = useState(null);
  const [isProcessingCallback, setIsProcessingCallback] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isCallback = urlParams.get('code') && urlParams.get('state');
    
    if (isCallback) {
      console.log('OAuth callback detected, processing...');
      setIsProcessingCallback(true);
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Retry mechanism for callback processing
      const processCallback = async (retries = 5) => {
        for (let i = 0; i < retries; i++) {
          try {
            console.log(`Callback processing attempt ${i + 1}/${retries}`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Progressive delay
            
            const currentUser = await getCurrentUser();
            if (currentUser) {
              console.log('User authenticated successfully');
              await checkAuthState();
              setIsProcessingCallback(false);
              return;
            }
          } catch (error) {
            console.log(`Attempt ${i + 1} failed:`, error);
          }
        }
        
        console.log('All callback processing attempts failed');
        setIsProcessingCallback(false);
        setLoading(false);
      };
      
      processCallback();
    } else {
      checkAuthState();
    }
  }, []);

  const checkAuthState = async () => {
    try {
      console.log('Checking auth state...');
      const currentUser = await getCurrentUser();
      console.log('Current user:', currentUser);
      setUser(currentUser);

      // Get tokens and user info
      const session = await fetchAuthSession();
      console.log('Session:', session);
      
      if (session.tokens) {
        console.log('Tokens found:', {
          idToken: !!session.tokens.idToken,
          accessToken: !!session.tokens.accessToken
        });
        
        setUserInfo(session.tokens.idToken?.payload);
        setTokens({
          idToken: session.tokens.idToken?.toString(),
          accessToken: session.tokens.accessToken?.toString()
        });
      }
    } catch (error) {
      console.log('User not authenticated:', error);
      setUser(null);
      setUserInfo(null);
      setTokens(null);
    } finally {
      if (!isProcessingCallback) {
        setLoading(false);
      }
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
      setTokens(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading || isProcessingCallback) {
    return (
      <div className="app">
        <div className="loading">
          <h2>{isProcessingCallback ? 'Processing login...' : 'Loading...'}</h2>
          {isProcessingCallback && <p>Please wait while we complete your authentication.</p>}
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
            
            {/* Debug info */}
            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '0.8rem', textAlign: 'left' }}>
              <strong>Debug Info:</strong>
              <br />Current URL: {window.location.href}
              <br />Has code param: {new URLSearchParams(window.location.search).has('code') ? 'Yes' : 'No'}
              <br />Has state param: {new URLSearchParams(window.location.search).has('state') ? 'Yes' : 'No'}
            </div>
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

              {tokens && (
                <div className="tokens-section">
                  <h3>Authentication Tokens:</h3>
                  
                  <div className="token-container">
                    <h4>ID Token:</h4>
                    <textarea 
                      className="token-display" 
                      value={tokens.idToken || 'Not available'} 
                      readOnly 
                      rows={8}
                    />
                  </div>

                  <div className="token-container">
                    <h4>Access Token:</h4>
                    <textarea 
                      className="token-display" 
                      value={tokens.accessToken || 'Not available'} 
                      readOnly 
                      rows={8}
                    />
                  </div>
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