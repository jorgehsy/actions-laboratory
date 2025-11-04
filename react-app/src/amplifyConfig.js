// Dynamic configuration that uses environment variables
export const amplifyConfig = {
  Auth: {
    Cognito: {
      region: process.env.REACT_APP_AWS_REGION,
      userPoolId: process.env.REACT_APP_USER_POOL_ID,
      userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID,
      loginWith: {
        oauth: {
          domain: process.env.REACT_APP_COGNITO_DOMAIN,
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: [process.env.REACT_APP_REDIRECT_URL],
          redirectSignOut: [process.env.REACT_APP_REDIRECT_URL],
          responseType: 'code'
        }
      }
    }
  }
};