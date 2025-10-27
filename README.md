# AWS Cognito + Microsoft Entra ID Login Test

A simple React application to test AWS Cognito authentication with Microsoft Entra ID as an external OIDC identity provider.

## Prerequisites

1. **AWS Cognito User Pool** configured with:
   - An OIDC identity provider for Microsoft Entra ID
   - App client with OAuth flows enabled
   - Hosted UI domain configured

2. **Microsoft Entra ID Application** registered with:
   - Application (client) ID
   - Client secret
   - Redirect URIs configured for your Cognito domain

## Setup Instructions

### 1. Configure Environment Variables

Update the `.env` file with your actual values:

```env
REACT_APP_AWS_REGION=us-east-1
REACT_APP_USER_POOL_ID=us-east-1_XXXXXXXXX
REACT_APP_USER_POOL_CLIENT_ID=your-client-id
REACT_APP_COGNITO_DOMAIN=your-domain.auth.us-east-1.amazoncognito.com
REACT_APP_REDIRECT_URL=https://panteon.dev:3000/
```

### 2. AWS Cognito Configuration

In your AWS Cognito User Pool:

1. **Create OIDC Identity Provider:**
   - Provider name: `MicrosoftEntraID`
   - Client ID: Your Entra ID Application (client) ID
   - Client secret: Your Entra ID Client secret
   - Authorize scope: `openid profile email`
   - Attribute request method: `POST`
   - Issuer URL: `https://login.microsoftonline.com/{tenant-id}/v2.0`

2. **Configure App Client:**
   - Enable OAuth flows: Authorization code grant
   - OAuth scopes: `openid`, `email`, `profile`
   - Callback URLs: `https://panteon.dev:3000/`
   - Sign out URLs: `https://panteon.dev:3000/`

3. **Configure Hosted UI:**
   - Enable Hosted UI
   - Add your identity provider to the app client

### 3. Microsoft Entra ID Configuration

In your Microsoft Entra ID application:

1. **Authentication:**
   - Add redirect URI: `https://your-cognito-domain.auth.region.amazoncognito.com/oauth2/idpresponse`
   - Enable ID tokens

2. **API Permissions:**
   - Add Microsoft Graph permissions: `openid`, `profile`, `email`

## Installation and Running

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [https://panteon.dev:3000](https://panteon.dev:3000) to view it in the browser.

**Note:** The app is configured to run with HTTPS on your custom domain. If you want to use localhost instead, run `npm run start:localhost`.

## How It Works

1. **Sign In Flow:**
   - User clicks "Sign In with Microsoft"
   - App calls `signInWithRedirect()` which redirects to Cognito Hosted UI
   - Cognito Hosted UI shows Microsoft as an option
   - User authenticates with Microsoft Entra ID
   - Microsoft redirects back to Cognito with authorization code
   - Cognito exchanges code for tokens and redirects back to your app
   - App receives and stores the tokens

2. **User Information:**
   - App displays user information from Cognito tokens
   - Shows both basic user info and token payload details

## Key Features

- ✅ Simple, minimal implementation
- ✅ Environment variable configuration
- ✅ Modern AWS Amplify v6 SDK
- ✅ Responsive design
- ✅ Error handling
- ✅ Token information display
- ✅ Clean sign out flow

## Troubleshooting

1. **Redirect URI Mismatch:** Ensure all redirect URIs match exactly in both Cognito and Entra ID
2. **CORS Issues:** Make sure your Cognito domain is properly configured
3. **Token Issues:** Check that scopes are properly configured in both systems
4. **Environment Variables:** Ensure all required environment variables are set

## Security Notes

- Never commit real credentials to version control
- Use environment variables for all sensitive configuration
- Ensure HTTPS in production
- Regularly rotate client secrets