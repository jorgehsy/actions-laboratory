# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React application that implements AWS Cognito authentication with Microsoft Entra ID (Azure AD) as an external OIDC identity provider. The app serves as a test/demo for federated authentication flow between AWS Cognito and Microsoft's identity platform.

## Development Commands

### Running the Application
- **Development with custom domain (HTTPS):** `npm start`
  - Runs on https://panteon.dev:3000
  - Requires custom domain configuration in /etc/hosts
- **Development on localhost:** `npm run start:localhost`
  - Standard localhost:3000 development
- **Build for production:** `npm run build`
- **Run tests:** `npm test`

## Architecture

### Authentication Flow
The application uses AWS Amplify v6 SDK to implement OAuth 2.0 authorization code flow:

1. User clicks "Sign In with Microsoft" (App.js:48-52)
2. `signInWithRedirect()` redirects to Cognito Hosted UI
3. Cognito redirects to Microsoft Entra ID for authentication
4. Microsoft returns authorization code to Cognito
5. Cognito exchanges code for tokens and redirects back to app
6. App receives tokens and retrieves user information

### Key Files
- **src/amplifyConfig.js** - Amplify configuration using environment variables
  - Configures Cognito User Pool connection
  - Sets up OAuth parameters (scopes, redirect URIs, response type)
- **src/App.js** - Main application component
  - Handles authentication state management
  - Implements sign-in/sign-out functionality
  - Displays user information from ID token payload
- **src/index.js** - React application entry point

### Configuration
The app is entirely configured through environment variables in `.env`:
- `REACT_APP_AWS_REGION` - AWS region for Cognito User Pool
- `REACT_APP_USER_POOL_ID` - Cognito User Pool ID
- `REACT_APP_USER_POOL_CLIENT_ID` - App client ID in Cognito
- `REACT_APP_COGNITO_DOMAIN` - Cognito hosted UI domain
- `REACT_APP_REDIRECT_URL` - OAuth callback URL
- `REACT_APP_PROVIDER_NAME` - Custom identity provider name

### Authentication State Management
Authentication state is managed in App.js using React hooks:
- `user` - Current user object from Cognito
- `userInfo` - ID token payload with user claims
- `loading` - Loading state during auth check

Authentication functions:
- `checkAuthState()` (App.js:19-35) - Checks if user is authenticated on mount
- `handleSignIn()` (App.js:37-56) - Initiates OAuth flow with redirect
- `handleSignOut()` (App.js:58-66) - Signs user out and clears state

### AWS Amplify Integration
Uses AWS Amplify v6 Auth category with the following APIs:
- `Amplify.configure()` - Initialize Amplify with config
- `signInWithRedirect()` - OAuth redirect flow
- `getCurrentUser()` - Get authenticated user
- `fetchAuthSession()` - Get tokens and session info
- `signOut()` - End user session

## Important Notes

### Environment Configuration
- Never commit the `.env` file (already in .gitignore)
- All environment variables must start with `REACT_APP_` to be accessible in React
- Redirect URLs must match exactly in Cognito, Entra ID, and environment variables

### OAuth Configuration Requirements
For the authentication to work, the following must be configured:
1. **Cognito User Pool:** OIDC provider for Microsoft Entra ID with correct issuer URL
2. **Cognito App Client:** OAuth flows enabled with proper callback/signout URLs
3. **Microsoft Entra ID App:** Redirect URI for Cognito's /oauth2/idpresponse endpoint
4. **Scopes:** openid, email, profile must be configured in both systems

### HTTPS Requirement
The application runs on HTTPS in development (https://panteon.dev:3000) because:
- OAuth redirect flows require HTTPS for security
- Microsoft Entra ID may reject non-HTTPS redirect URIs
- Simulates production environment more accurately
