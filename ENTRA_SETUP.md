# Microsoft Entra ID (Azure AD) Authentication Setup

This guide will walk you through setting up Microsoft Entra ID authentication for InaLogystics.

## Prerequisites

- An Azure account with permissions to create app registrations
- Access to your organization's Azure AD tenant

## Step 1: Create an App Registration in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** (or **Microsoft Entra ID**)
3. Click on **App registrations** in the left sidebar
4. Click **+ New registration**

## Step 2: Configure the App Registration

### Basic Information
- **Name**: `InaLogystics Office Management`
- **Supported account types**: Select one of:
  - `Accounts in this organizational directory only` (Single tenant) - Recommended for internal use
  - `Accounts in any organizational directory` (Multi-tenant) - If you need to support multiple organizations
- **Redirect URI**:
  - Platform: `Web`
  - URI: `http://localhost:3002/api/auth/callback/azure-ad` (for development)
  - For production, add: `https://your-domain.com/api/auth/callback/azure-ad`

Click **Register**

## Step 3: Get Application (Client) ID

After registration:
1. You'll be redirected to the app's overview page
2. Copy the **Application (client) ID** - this is your `AZURE_AD_CLIENT_ID`
3. Copy the **Directory (tenant) ID** - this is your `AZURE_AD_TENANT_ID`

## Step 4: Create a Client Secret

1. In the left sidebar, click **Certificates & secrets**
2. Click **+ New client secret**
3. Add a description: `InaLogystics Auth Secret`
4. Select expiration: `24 months` (or as per your organization's policy)
5. Click **Add**
6. **IMPORTANT**: Copy the secret **Value** immediately (it won't be shown again) - this is your `AZURE_AD_CLIENT_SECRET`

## Step 5: Configure API Permissions

1. In the left sidebar, click **API permissions**
2. Click **+ Add a permission**
3. Select **Microsoft Graph**
4. Select **Delegated permissions**
5. Add the following permissions:
   - `openid`
   - `profile`
   - `email`
   - `User.Read`
6. Click **Add permissions**
7. (Optional) Click **Grant admin consent** if you have admin rights

## Step 6: Update Application Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the following variables in `.env`:
   ```env
   NEXTAUTH_URL="http://localhost:3002"
   NEXTAUTH_SECRET="<generate-using-openssl-rand-base64-32>"
   AUTH_SECRET="<same-as-NEXTAUTH_SECRET>"

   AZURE_AD_CLIENT_ID="<your-application-client-id>"
   AZURE_AD_CLIENT_SECRET="<your-client-secret-value>"
   AZURE_AD_TENANT_ID="<your-directory-tenant-id>"
   ```

3. Generate a secure secret for NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

## Step 7: Production Configuration

For production deployment, you need to:

1. **Add Production Redirect URI**:
   - Go back to **App registrations** in Azure Portal
   - Select your app
   - Go to **Authentication**
   - Under **Web** redirect URIs, add: `https://your-production-domain.com/api/auth/callback/azure-ad`
   - Click **Save**

2. **Update Environment Variables** for production:
   ```env
   NEXTAUTH_URL="https://your-production-domain.com"
   ```

## Step 8: Test Authentication

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3002`

3. You should be redirected to the sign-in page

4. Click **Sign in with Microsoft Entra**

5. You'll be redirected to Microsoft's login page

6. After successful authentication, you'll be redirected back to the application

## Troubleshooting

### "AADSTS700016: Application not found in the directory"
- Check that your `AZURE_AD_CLIENT_ID` and `AZURE_AD_TENANT_ID` are correct
- Verify the app registration exists in your Azure AD tenant

### "AADSTS50011: The redirect URI specified in the request does not match"
- Verify the redirect URI in Azure Portal matches exactly: `http://localhost:3002/api/auth/callback/azure-ad`
- Check for trailing slashes or protocol mismatches (http vs https)

### "Invalid client secret"
- The client secret may have expired
- Generate a new client secret in Azure Portal
- Update `AZURE_AD_CLIENT_SECRET` in your `.env` file

### Users can't sign in
- Check API permissions are granted
- Verify the app registration allows the correct account types
- Ensure users exist in your Azure AD tenant

## Security Best Practices

1. **Never commit secrets to version control**
   - `.env` is in `.gitignore` - keep it there
   - Use environment variables in production

2. **Rotate client secrets regularly**
   - Set up reminders to rotate secrets before they expire
   - Azure will warn you when secrets are about to expire

3. **Use HTTPS in production**
   - Never use HTTP for authentication in production
   - Ensure your redirect URIs use HTTPS

4. **Limit API permissions**
   - Only request the minimum permissions needed
   - Review permissions regularly

5. **Monitor sign-in logs**
   - Use Azure AD sign-in logs to monitor authentication activity
   - Set up alerts for suspicious activity

## Additional Resources

- [Microsoft Entra ID Documentation](https://learn.microsoft.com/en-us/entra/identity/)
- [NextAuth.js Azure AD Provider](https://next-auth.js.org/providers/azure-ad)
- [App Registration Best Practices](https://learn.microsoft.com/en-us/entra/identity-platform/security-best-practices-for-app-registration)
