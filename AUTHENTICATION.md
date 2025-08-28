# BS-Bazaar Authentication System

## Overview

BS-Bazaar now supports a comprehensive dual authentication system that allows users to:

1. **Sign up and log in with Email & Password**
2. **Sign up and log in with Discord**
3. **Link email accounts to Discord accounts and vice versa**
4. **Change passwords for email accounts**
5. **Reset forgotten passwords via email**

## Features

### 🔐 Email/Password Authentication
- **Registration**: Create accounts with username, email, and password
- **Email Verification**: Automatic email verification for new accounts
- **Login**: Secure login with email and password
- **Password Reset**: Forgot password functionality with email reset links
- **Password Change**: Users can change their passwords from their profile

### 🎮 Discord Authentication  
- **OAuth Integration**: Seamless Discord OAuth login
- **Profile Sync**: Automatic username and avatar synchronization
- **Quick Registration**: One-click account creation via Discord

### 🔗 Account Linking
- **Link Email to Discord**: Add email/password login to existing Discord accounts
- **Link Discord to Email**: Connect Discord to existing email accounts
- **Unified Experience**: Access the same account via either authentication method

### 🛡️ Security Features
- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: Secure JSON Web Tokens for session management
- **Email Verification**: Required email verification for new accounts
- **Rate Limiting**: Built-in protection against brute force attacks
- **Input Validation**: Comprehensive server-side validation

## API Endpoints

### Authentication Routes

#### Email/Password Authentication
- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/change-password` - Change password (authenticated)

#### Discord Authentication
- `GET /api/auth/discord` - Initiate Discord OAuth
- `GET /api/auth/discord/callback` - Discord OAuth callback
- `GET /api/auth/discord/failure` - Discord auth failure handler

#### Account Linking
- `POST /api/auth/link-email` - Link email to Discord account
- `POST /api/auth/link-discord` - Link Discord to email account

#### User Management
- `GET /api/auth/me` - Get current user information

## Frontend Components

### LoginPopup Component
- **Dual Login Modes**: Toggle between Discord and Email login
- **Forgot Password**: Built-in password reset functionality
- **Error Handling**: User-friendly error messages
- **Loading States**: Visual feedback during authentication

### Register Page
- **Registration Methods**: Choose between email or Discord registration
- **Form Validation**: Real-time validation with helpful error messages
- **Success Feedback**: Clear confirmation messages

### Profile Settings
- **Change Password**: Secure password change interface
- **Account Linking**: Visual interface for linking accounts
- **Account Status**: Display current authentication methods

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE,
  password_hash TEXT,
  discord_id TEXT UNIQUE,
  discord_username TEXT,
  avatar TEXT,
  email_verified INTEGER DEFAULT 0,
  email_verification_token TEXT,
  password_reset_token TEXT,
  password_reset_expires INTEGER,
  auth_type TEXT DEFAULT 'local',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

## Environment Configuration

### Required Environment Variables
```env
# JWT and Session Security
JWT_SECRET=your_jwt_secret_here_make_it_long_and_random
SESSION_SECRET=your_session_secret_here_make_it_long_and_random

# Discord OAuth
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_CALLBACK_URL=http://localhost:3001/api/auth/discord/callback

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=BS-Bazaar <noreply@bs-bazaar.com>
```

### Email Setup (Optional)
If email environment variables are not configured, the system will:
- Disable email verification (accounts created as verified)
- Disable password reset functionality
- Log warnings but continue operating

For Gmail setup:
1. Enable 2-factor authentication
2. Generate an app-specific password
3. Use the app password in `EMAIL_PASS`

## Usage Examples

### Frontend Authentication
```javascript
// Email Registration
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'player123',
    email: 'player@example.com',
    password: 'securepassword'
  })
});

// Email Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'player@example.com',
    password: 'securepassword'
  })
});

// Discord Login
window.location.href = '/api/auth/discord';

// Change Password
const response = await fetch('/api/auth/change-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    currentPassword: 'oldpassword',
    newPassword: 'newpassword'
  })
});
```

## Migration from Discord-Only

The system is backward compatible with existing Discord-only accounts:
1. Existing users continue to work seamlessly
2. Existing Discord accounts can add email/password login
3. No data migration required
4. All existing functionality preserved

## Security Considerations

### Password Requirements
- Minimum 8 characters
- Mix of letters, numbers, and symbols recommended
- Stored as bcrypt hashes (never plain text)

### Token Management
- JWT tokens expire after 7 days
- Tokens include user identification and auth type
- Automatic refresh on successful API calls

### Email Security
- Verification tokens are cryptographically secure
- Reset tokens expire after 1 hour
- Email verification required for new accounts

## Troubleshooting

### Common Issues

**Email not sending**
- Check EMAIL_* environment variables
- Verify SMTP credentials
- Check spam folder for test emails

**Discord OAuth not working**
- Verify DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET
- Ensure callback URL matches Discord app settings
- Check that Discord app has correct permissions

**Password change failing**
- Verify user is authenticated (valid JWT token)
- Check current password is correct
- Ensure new password meets requirements

### Debugging
- Check server logs for detailed error messages
- Use browser developer tools to inspect network requests
- Verify environment variables are loaded correctly

## Future Enhancements

Potential future additions:
- Two-factor authentication (2FA)
- OAuth integration with other platforms (Google, GitHub)
- Advanced password policies
- Account recovery via security questions
- Admin user management interface
- Audit logging for security events
