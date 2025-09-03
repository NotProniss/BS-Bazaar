require('dotenv').config();
const express = require('express');
const app = express();
// Health check endpoint for Nginx and debugging
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const validator = require('validator');
const nodemailer = require('nodemailer');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

app.set('trust proxy', 1);

// Debug: Log client IP and X-Forwarded-For for every request
app.use((req, res, next) => {
  console.log('Client IP:', req.ip, 'X-Forwarded-For:', req.headers['x-forwarded-for']);
  next();
});
const PORT = process.env.PORT || 3001;

let db;

// CORS Configuration
const corsOrigins = [
  process.env.FRONTEND_URL || 'http://localhost',
  'http://localhost',
  'http://localhost:80',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1',
  'http://127.0.0.1:80',
  'https://bs-bazaar.com'
];

// Middleware
app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session Configuration
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.db',
    table: 'sessions',
    dir: './data',
    concurrentDB: true
  }),
  secret: process.env.SESSION_SECRET || 'changeme',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// Email Configuration (for password reset and account verification)
let emailTransporter = null;
if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  emailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  
  // Verify the email configuration
  emailTransporter.verify((error, success) => {
    if (error) {
      console.log('Email configuration error:', error);
      emailTransporter = null;
    } else {
      console.log('Email transporter configured and verified successfully');
      console.log(`Emails will be sent from: ${process.env.EMAIL_FROM || process.env.EMAIL_USER}`);
      console.log(`SMTP Host: ${process.env.EMAIL_HOST}`);
      console.log(`SMTP User: ${process.env.EMAIL_USER}`);
    }
  });
} else {
  console.log('Email configuration not found - email features will be disabled');
  console.log('To enable emails, set EMAIL_HOST, EMAIL_USER, and EMAIL_PASS in your .env file');
}

// Rate Limiting
const localIPs = ['127.0.0.1', '::1', '10.0.0.134'];
const allowedIpPrefixes = ['127.0.0.1', '::1', '10.0.0.134', '172.18.0'];
const rateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 500, // limit each IP to 30 requests per windowMs
    skip: (req, res) => {
        const ip = req.ip || req.connection.remoteAddress;
        const xff = req.headers['x-forwarded-for'];
        // Allow if IP ends with any allowed suffix (handles IPv6-mapped IPv4)
        const allowed = allowedIpPrefixes.some(prefix => ip.startsWith(prefix));
        if (allowed) {
            console.log(`[RateLimit] SKIP: Matched allowed IP: ${ip} (XFF: ${xff})`);
            return true;
        }
        // Extra: log all requests for debugging
        console.log(`[RateLimit] CHECK: IP: ${ip} (XFF: ${xff}) - Not allowed, will be rate limited if over limit.`);
        return false;
    },
    handler: (req, res) => {
        const ip = req.ip || req.connection.remoteAddress;
        const xff = req.headers['x-forwarded-for'];
        console.warn(`[RateLimit] BLOCKED: IP: ${ip} (XFF: ${xff})`);
        res.status(429).json({ error: 'Too many requests, please try again later.' });
    }
});
app.use(rateLimiter);

// Utility Functions
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log('[AUTH] No authorization header provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log('[AUTH] Token received, length:', token?.length);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('[AUTH] Token verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }
    console.log('[AUTH] Token verified successfully. User ID:', user.id, 'Type:', typeof user.id);
    req.user = user;
    next();
  });
}

async function ensureAdmin(req, res, next) {
  try {
    const row = await db.get('SELECT 1 FROM admins WHERE id = ?', req.user?.id);
    if (row) {
      return next();
    }
    return res.status(403).json({ error: 'Admin access required' });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return res.status(500).json({ error: 'Failed to check admin status' });
  }
}

// Passport Configuration
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Local Strategy (Email/Password)
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    console.log(`[LOGIN DEBUG] Attempting login for email: ${email}`);
    const user = await db.get(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase()]
    );
    
    if (!user) {
      console.log(`[LOGIN DEBUG] No user found for email: ${email}`);
      return done(null, false, { message: 'Invalid email or password' });
    }
    
    console.log(`[LOGIN DEBUG] User found: id=${user.id}, email_verified=${user.email_verified}, has_password=${!!user.password_hash}`);
    
    if (!user.email_verified) {
      console.log(`[LOGIN DEBUG] Email not verified for user: ${email}`);
      return done(null, false, { 
        message: 'Please verify your email before logging in',
        code: 'EMAIL_NOT_VERIFIED',
        email: email
      });
    }
    
    if (!user.password_hash) {
      console.log(`[LOGIN DEBUG] No password hash found for user: ${email}`);
      return done(null, false, { message: 'Invalid email or password' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log(`[LOGIN DEBUG] Password validation result: ${isValidPassword}`);
    
    if (!isValidPassword) {
      return done(null, false, { message: 'Invalid email or password' });
    }
    
    // Create JWT token
    const token = jwt.sign({
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      auth_type: 'local'
    }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    user.token = token;
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Discord Strategy
passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK_URL,
  scope: ['identify'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Discord ID
    let user = await db.get('SELECT * FROM users WHERE discord_id = ?', [profile.id]);
    
    if (!user) {
      // Check if this is a linking request (user is logged in)
      // This would be handled in the auth flow
      
      // Create new user with Discord account
      const result = await db.run(`
        INSERT INTO users (
          username, discord_id, discord_username, avatar, 
          email_verified, created_at, updated_at, auth_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        profile.username,
        profile.id,
        profile.username,
        profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null,
        1, // Discord accounts are considered verified
        Date.now(),
        Date.now(),
        'discord'
      ]);
      
      user = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
    } else {
      // Update existing user's Discord info
      await db.run(`
        UPDATE users SET 
          discord_username = ?, 
          avatar = ?, 
          updated_at = ?
        WHERE discord_id = ?
      `, [
        profile.username,
        profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : user.avatar,
        Date.now(),
        profile.id
      ]);
    }
    
    const token = jwt.sign({
      id: user.id,  // Use the primary key ID
      discord_id: user.discord_id,
      username: user.username,
      avatar: user.avatar,
      email: user.email,
      auth_type: 'discord'
    }, process.env.JWT_SECRET, { expiresIn: '7d' });

    user.token = token;
    return done(null, user);
  } catch (error) {
    console.error('Discord authentication error:', error);
    return done(error);
  }
}));

// Health Check and Info Routes
// Health check endpoint for Docker
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/api/info', (req, res) => {
  res.json({
    name: 'BS-Bazaar API',
    version: require('./package.json').version,
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: '/auth/discord',
      listings: '/listings',
      items: '/api/items',
      health: '/health'
    }
  });
});

// Authentication Routes
app.get('/api/auth/discord', passport.authenticate('discord'));

app.get('/api/auth/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/api/auth/discord/failure' }),
  (req, res) => {
    const token = req.user.token;
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost'}/auth-success?token=${token}`;
    res.redirect(redirectUrl);
  }
);

app.get('/api/auth/discord/failure', (req, res) => {
  res.status(401).json({ error: 'Authentication failed' });
});

app.get('/api/auth/discord/me', authenticateJWT, (req, res) => {
  res.json(req.user);
});

// Email/Password Authentication Routes

// Register with email/password
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('[REGISTER] Registration attempt received:', req.body);
    const { email, password, username } = req.body;
    
    // Validation
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, password, and username are required' });
    }
    
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
    
    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
    }
    
    // Check if user already exists
    const existingUser = await db.get(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email.toLowerCase(), username]
    );
    
    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(409).json({ error: 'Email already registered' });
      } else {
        return res.status(409).json({ error: 'Username already taken' });
      }
    }
    
    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    
    // Create user
    const result = await db.run(`
      INSERT INTO users (
        username, email, password_hash, email_verification_token,
        email_verified, created_at, updated_at, auth_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      username,
      email.toLowerCase(),
      passwordHash,
      emailVerificationToken,
      0, // Not verified yet
      Date.now(),
      Date.now(),
      'local'
    ]);
    
    // Send verification email if transporter is configured
    if (emailTransporter) {
      try {
        console.log(`[EMAIL] Attempting to send verification email to: ${email}`);
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost'}/api/auth/verify-email?token=${emailVerificationToken}`;
        
        const result = await emailTransporter.sendMail({
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: email,
          subject: 'Verify your BS-Bazaar account',
          html: `
            <h2>Welcome to BS-Bazaar!</h2>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verificationUrl}" style="background: #D4AF37; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
            <p>If you didn't create this account, you can safely ignore this email.</p>
          `
        });
        console.log(`[EMAIL] Verification email sent successfully to: ${email}`);
        console.log(`[EMAIL] Message ID: ${result.messageId}`);
      } catch (emailError) {
        console.error('[EMAIL] Failed to send verification email:', emailError);
        // Don't fail the registration if email fails
      }
    }
    
    res.status(201).json({
      message: 'Account created successfully. Please check your email to verify your account.',
      userId: result.lastID,
      emailVerificationRequired: true
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Login with email/password
app.post('/api/auth/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Authentication error' });
    }
    
    if (!user) {
      // Check if it's an email verification issue
      if (info.code === 'EMAIL_NOT_VERIFIED') {
        console.log('[LOGIN DEBUG] Sending EMAIL_NOT_VERIFIED response:', {
          error: info.message,
          code: 'EMAIL_NOT_VERIFIED',
          email: info.email
        });
        return res.status(401).json({ 
          error: info.message,
          code: 'EMAIL_NOT_VERIFIED',
          email: info.email
        });
      }
      return res.status(401).json({ error: info.message || 'Invalid credentials' });
    }
    
    res.json({
      message: 'Login successful',
      token: user.token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        auth_type: 'local'
      }
    });
  })(req, res, next);
});

// Verify email (GET endpoint for email links)
app.get('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost'}/verify-email?error=missing-token`);
    }
    
    const user = await db.get(
      'SELECT * FROM users WHERE email_verification_token = ?',
      [token]
    );
    
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost'}/verify-email?error=invalid-token`);
    }
    
    if (user.email_verified) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost'}/verify-email?status=already-verified`);
    }
    
    await db.run(`
      UPDATE users SET 
        email_verified = 1, 
        email_verification_token = NULL,
        updated_at = ?
      WHERE id = ?
    `, [Date.now(), user.id]);
    
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost'}/verify-email?status=success`);
    
  } catch (error) {
    console.error('Email verification error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost'}/verify-email?error=server-error`);
  }
});

// Verify email (POST endpoint for API calls)
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Verification token required' });
    }
    
    const user = await db.get(
      'SELECT * FROM users WHERE email_verification_token = ?',
      [token]
    );
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }
    
    if (user.email_verified) {
      return res.status(400).json({ error: 'Email already verified' });
    }
    
    await db.run(`
      UPDATE users SET 
        email_verified = 1, 
        email_verification_token = NULL,
        updated_at = ?
      WHERE id = ?
    `, [Date.now(), user.id]);
    
    res.json({ message: 'Email verified successfully' });
    
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

// Resend email verification
app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = await db.get(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase()]
    );
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'If an account with that email exists and is unverified, a verification email has been sent.' });
    }
    
    if (user.email_verified) {
      return res.json({ message: 'Email is already verified' });
    }
    
    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    
    await db.run(
      'UPDATE users SET email_verification_token = ? WHERE id = ?',
      [emailVerificationToken, user.id]
    );
    
    if (emailTransporter) {
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost'}/api/auth/verify-email?token=${emailVerificationToken}`;
      
      await emailTransporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'Verify your email - BS-Bazaar',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #D4AF37, #F4E4BC); padding: 20px; text-align: center;">
              <h1 style="color: #2C1810; margin: 0;">BS-Bazaar</h1>
              <p style="color: #2C1810; margin: 5px 0 0 0;">Brighter Shores Marketplace</p>
            </div>
            <div style="padding: 30px 20px; background: #f9f9f9;">
              <h2 style="color: #2C1810;">Verify Your Email Address</h2>
              <p>Thank you for registering with BS-Bazaar! Please verify your email address by clicking the button below:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="background: #D4AF37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
              </div>
              <p>If you didn't create an account with BS-Bazaar, you can safely ignore this email.</p>
            </div>
            <div style="background: #2C1810; color: #D4AF37; padding: 20px; text-align: center;">
              <p style="margin: 0;">Happy trading!</p>
              <p style="margin: 5px 0 0 0; font-size: 12px;">BS-Bazaar Team</p>
            </div>
          </div>
        `,
      });
      
      console.log(`[EMAIL] Verification email resent to: ${email}`);
    } else {
      console.log(`[EMAIL] Verification URL (email not configured): ${verificationUrl}`);
    }
    
    res.json({ message: 'Verification email sent successfully' });
    
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

// Request password reset
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ error: 'Valid email address required' });
    }
    
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    
    // Don't reveal if email exists or not for security
    if (!user) {
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = Date.now() + (60 * 60 * 1000); // 1 hour
    
    await db.run(`
      UPDATE users SET 
        password_reset_token = ?, 
        password_reset_expires = ?,
        updated_at = ?
      WHERE id = ?
    `, [resetToken, resetExpiry, Date.now(), user.id]);
    
    // Send reset email if transporter is configured
    if (emailTransporter) {
      try {
        console.log(`[EMAIL] Attempting to send password reset email to: ${email}`);
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost'}/reset-password?token=${resetToken}`;
        
        const result = await emailTransporter.sendMail({
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: email,
          subject: 'Reset your BS-Bazaar password',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #D4AF37; margin: 0;">BS-Bazaar</h1>
                <p style="color: #666; margin: 5px 0;">Brightsands Bazaar Marketplace</p>
              </div>
              
              <h2 style="color: #333;">Password Reset Request</h2>
              <p style="color: #555; line-height: 1.6;">
                We received a request to reset your password for your BS-Bazaar account.
                Click the button below to reset your password:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="
                  background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
                  color: white;
                  padding: 12px 30px;
                  text-decoration: none;
                  border-radius: 5px;
                  font-weight: bold;
                  display: inline-block;
                ">Reset Password</a>
              </div>
              
              <p style="color: #777; font-size: 14px; line-height: 1.5;">
                <strong>This link will expire in 1 hour.</strong><br>
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #D4AF37;">${resetUrl}</a>
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center;">
                If you didn't request this password reset, you can safely ignore this email.<br>
                Your password will not be changed until you access the link above and create a new one.<br><br>
                This email was sent from BS-Bazaar (Brightsands Bazaar Marketplace)
              </p>
            </div>
          `
        });
        console.log(`[EMAIL] Password reset email sent successfully to: ${email}`);
        console.log(`[EMAIL] Message ID: ${result.messageId}`);
      } catch (emailError) {
        console.error('[EMAIL] Failed to send reset email:', emailError);
      }
    } else {
      // For development: Log the reset URL to console since email is not configured
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost'}/reset-password?token=${resetToken}`;
      console.log('=== PASSWORD RESET LINK (EMAIL NOT CONFIGURED) ===');
      console.log(`Reset URL: ${resetUrl}`);
      console.log('================================================');
    }
    
    res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Reset password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Reset token and new password required' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
    
    const user = await db.get(`
      SELECT * FROM users 
      WHERE password_reset_token = ? AND password_reset_expires > ?
    `, [token, Date.now()]);
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    await db.run(`
      UPDATE users SET 
        password_hash = ?, 
        password_reset_token = NULL,
        password_reset_expires = NULL,
        updated_at = ?
      WHERE id = ?
    `, [passwordHash, Date.now(), user.id]);
    
    res.json({ message: 'Password reset successfully' });
    
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Change password (for logged-in users)
app.post('/api/auth/change-password', authenticateJWT, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password required' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }
    
    // Get user by JWT payload
    const user = await db.get('SELECT * FROM users WHERE id = ? OR discord_id = ?', [req.user.id, req.user.id]);
    
    if (!user || !user.password_hash) {
      return res.status(400).json({ error: 'Cannot change password for this account type' });
    }
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    await db.run(`
      UPDATE users SET 
        password_hash = ?, 
        updated_at = ?
      WHERE id = ?
    `, [passwordHash, Date.now(), user.id]);
    
    res.json({ message: 'Password changed successfully' });
    
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Update username (for logged-in users)
app.post('/api/auth/update-username', authenticateJWT, async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user.id;

    if (!username || username.trim().length === 0) {
      return res.status(400).json({ error: 'Username is required' });
    }

    if (username.trim().length < 2) {
      return res.status(400).json({ error: 'Username must be at least 2 characters long' });
    }

    if (username.trim().length > 50) {
      return res.status(400).json({ error: 'Username must be less than 50 characters long' });
    }

    // Check if username is already taken by another user
    const existingUser = await db.get(
      'SELECT id FROM users WHERE username = ? AND id != ?',
      [username.trim(), userId]
    );

    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Update username
    const oldUsername = await db.get('SELECT username FROM users WHERE id = ?', [userId]);
    await db.run(
      'UPDATE users SET username = ?, updated_at = ? WHERE id = ?',
      [username.trim(), Date.now(), userId]
    );

    // Update all listings by this user to use the new username
    // Method 1: Update listings that have the correct userId (reliable)
    const updateResult = await db.run(
      'UPDATE listings SET seller = ?, IGN = ? WHERE userId = ?',
      [username.trim(), username.trim(), userId]
    );
    
    // Method 2: Update listings that might have Discord ID instead of database ID (edge case)
    const discordUpdateResult = await db.run(
      'UPDATE listings SET seller = ?, IGN = ?, userId = ? WHERE userId = ?',
      [username.trim(), username.trim(), userId, req.user.discord_id]
    );
    
    // Method 3: Update legacy listings without userId by matching old username (fallback)
    const legacyUpdateResult = await db.run(
      'UPDATE listings SET seller = ?, IGN = ?, userId = ? WHERE (userId IS NULL OR userId = "") AND seller = ?',
      [username.trim(), username.trim(), userId, oldUsername.username]
    );
    
    const totalUpdated = updateResult.changes + discordUpdateResult.changes + legacyUpdateResult.changes;
    console.log(`[UPDATE] Updated ${updateResult.changes} listings with userId + ${discordUpdateResult.changes} discord ID listings + ${legacyUpdateResult.changes} legacy listings = ${totalUpdated} total for user ID ${userId} to username "${username.trim()}"`);

    // Get updated user data
    const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    
    // Generate new JWT token with updated username
    const newToken = jwt.sign({
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      auth_type: updatedUser.auth_type,
      discord_id: updatedUser.discord_id
    }, process.env.JWT_SECRET, { expiresIn: '7d' });

    console.log(`[UPDATE] Username updated for user ID ${userId}: ${username.trim()}`);
    res.json({ 
      message: 'Username updated successfully', 
      username: username.trim(),
      newToken: newToken
    });
    
  } catch (error) {
    console.error('Username update error:', error);
    res.status(500).json({ error: 'Failed to update username' });
  }
});

// Account linking routes

// Link Discord to existing email account
app.post('/api/auth/link-discord', authenticateJWT, async (req, res) => {
  try {
    // This would be called from Discord OAuth callback with special linking flow
    // For now, we'll provide instructions
    res.json({
      message: 'To link your Discord account, log out and sign in with Discord, then contact support to merge accounts.',
      linkUrl: '/api/auth/discord?link=true'
    });
  } catch (error) {
    console.error('Discord linking error:', error);
    res.status(500).json({ error: 'Failed to link Discord account' });
  }
});

// Link email to Discord account
app.post('/api/auth/link-email', authenticateJWT, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('[LINK-EMAIL] Starting email link process');
    console.log('[LINK-EMAIL] User ID from token:', req.user.id, 'Type:', typeof req.user.id);
    console.log('[LINK-EMAIL] Email:', email);
    
    if (!email || !password) {
      console.log('[LINK-EMAIL] Missing email or password');
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    if (!validator.isEmail(email)) {
      console.log('[LINK-EMAIL] Invalid email format');
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    if (password.length < 8) {
      console.log('[LINK-EMAIL] Password too short');
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
    
    // Check if email is already in use
    const existingEmail = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existingEmail) {
      console.log('[LINK-EMAIL] Email already in use by user ID:', existingEmail.id);
      return res.status(409).json({ error: 'Email already in use by another account' });
    }
    
    // Get current user
    let user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    
    // If not found by primary key, try to find by discord_id (for backwards compatibility with old tokens)
    if (!user && req.user.id) {
      user = await db.get('SELECT * FROM users WHERE discord_id = ?', [req.user.id]);
      console.log('[LINK-EMAIL] Fallback lookup by discord_id result:', user ? { id: user.id, discord_id: user.discord_id, email: user.email } : 'null');
    } else {
      console.log('[LINK-EMAIL] User lookup result:', user ? { id: user.id, discord_id: user.discord_id, email: user.email } : 'null');
    }
    
    if (!user) {
      console.log('[LINK-EMAIL] User not found for ID:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.email) {
      console.log('[LINK-EMAIL] User already has email linked');
      return res.status(400).json({ error: 'Account already has an email linked' });
    }
    
    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    
    // Update user with email and password
    await db.run(`
      UPDATE users SET 
        email = ?, 
        password_hash = ?,
        email_verification_token = ?,
        email_verified = 0,
        auth_type = 'both',
        updated_at = ?
      WHERE id = ?
    `, [email.toLowerCase(), passwordHash, emailVerificationToken, Date.now(), user.id]);
    
    console.log('[LINK-EMAIL] Successfully linked email to user ID:', user.id);
    
    // Send verification email
    if (emailTransporter) {
      try {
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost'}/api/auth/verify-email?token=${emailVerificationToken}`;
        
        await emailTransporter.sendMail({
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: email,
          subject: 'Verify your linked email - BS-Bazaar',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #D4AF37; margin: 0;">BS-Bazaar</h1>
                <p style="color: #666; margin: 5px 0;">Brightsands Bazaar Marketplace</p>
              </div>
              
              <h2 style="color: #333;">Email Verification Required</h2>
              <p style="color: #555; line-height: 1.6;">
                You've successfully linked an email address to your Discord account. To complete the setup, 
                please verify this email address by clicking the button below:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="
                  background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
                  color: white;
                  padding: 12px 30px;
                  text-decoration: none;
                  border-radius: 5px;
                  font-weight: bold;
                  display: inline-block;
                ">Verify Email Address</a>
              </div>
              
              <p style="color: #777; font-size: 14px; line-height: 1.5;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #D4AF37;">${verificationUrl}</a>
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center;">
                If you didn't link this email address, please contact support immediately.<br>
                This email was sent from BS-Bazaar (BS-Bazaar Marketplace)
              </p>
            </div>
          `
        });
        
        console.log('[LINK-EMAIL] Verification email sent to:', email);
      } catch (emailError) {
        console.error('[LINK-EMAIL] Failed to send verification email:', emailError);
        // Don't fail the request if email sending fails
      }
    }
    
    
    res.json({
      message: emailTransporter 
        ? 'Email linked successfully! Please check your email to verify the address.'
        : 'Email linked successfully! Email verification is disabled in development.',
      emailVerificationRequired: !!emailTransporter
    });
    
  } catch (error) {
    console.error('Email linking error:', error);
    res.status(500).json({ error: 'Failed to link email account' });
  }
});

// Get current user info
app.get('/api/auth/me', authenticateJWT, async (req, res) => {
  try {
    const user = await db.get('SELECT * FROM users WHERE id = ? OR discord_id = ?', [req.user.id, req.user.id]);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      emailVerified: user.email_verified,
      authType: user.auth_type,
      hasPassword: !!user.password_hash,
      hasDiscord: !!user.discord_id,
      discord_id: user.discord_id,
      discord_username: user.discord_username,
      createdAt: user.created_at
    });
    
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
});

app.post('/logout', (req, res) => {
  req.logout(() => {
    res.json({ success: true });
  });
});

// Check if user is admin
app.get('/api/is-admin', authenticateJWT, async (req, res) => {
  try {
    const row = await db.get('SELECT 1 FROM admins WHERE id = ?', req.user?.id);
    res.json({ isAdmin: !!row });
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({ error: 'Failed to check admin status' });
  }
});

// Listing Routes
app.get('/listings', async (req, res) => {
  try {
    const listings = await db.all('SELECT * FROM listings WHERE item IS NOT NULL AND item != "" ORDER BY timestamp DESC');
    // DEBUG: Log all listings before sending to frontend
    console.log('[API DEBUG] Listings returned:', listings);
    res.json(listings);
  } catch (err) {
    console.error('Error reading listings from DB:', err);
    res.status(500).json({ error: 'Failed to read listings from database' });
  }
});
app.post('/api/listings-old', authenticateJWT, async (req, res) => {
  const { item, price, quantity, type, category, IGN, priceMode, notes,
    combatCategory, combatLevel, combatStrength, combatDmgType, combatDmgPercent,
    combatImpact, combatCryonae, combatArborae, combatTempestae, combatInfernae, combatNecromae,
    rarity // <-- added
  } = req.body;
  const totalPrice = price * quantity;
  try {
    const stmt = await db.run(`
      INSERT INTO listings (item, price, quantity, totalPrice, type, category, seller, userId, sellerAvatar, timestamp, IGN, priceMode, notes,
        combatCategory, combatLevel, combatStrength, combatDmgType, combatDmgPercent, combatImpact, combatCryonae, combatArborae, combatTempestae, combatInfernae, combatNecromae, rarity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      item,
      price,
      quantity,
      totalPrice,
      type,
      category,
      req.user.username, // seller - current username
      req.user.id, // userId - permanent ID
      req.user.avatar,
      Date.now(),
      req.user.username, // IGN - current username (for Discord bot compatibility)
      priceMode || 'Each',
      notes || '',
      combatCategory || '',
      combatLevel || '',
      combatStrength || '',
      combatDmgType || '',
      combatDmgPercent || '',
      combatImpact || '',
      combatCryonae || '',
      combatArborae || '',
      combatTempestae || '',
      combatInfernae || '',
      combatNecromae || '',
      rarity || '' // <-- added
    );
    let listing = await db.get('SELECT * FROM listings WHERE id = ?', stmt.lastID);
    listing.totalPrice = totalPrice;
    io.emit('listingCreated', listing); // Emit event
    res.json({ success: true, listing });
  } catch (err) {
    console.error('Error inserting listing into DB:', err);
    res.status(500).json({ error: 'Failed to save listing' });
  }
});

app.put('/api/listings/:id', authenticateJWT, async (req, res) => {
  const { item, price, quantity, type, category, IGN, priceMode, notes,
    combatCategory, combatLevel, combatStrength, combatDmgType, combatDmgPercent,
    combatImpact, combatCryonae, combatArborae, combatTempestae, combatInfernae, combatNecromae,
    rarity // <-- added
  } = req.body;
  try {
    const listing = await db.get('SELECT * FROM listings WHERE id = ?', req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    
    // Check authorization: either sellerId matches or (sellerId is empty and seller username matches)
    const isOwner = listing.sellerId === req.user.id || 
                   (!listing.sellerId && listing.seller === req.user.username);
    if (!isOwner) return res.status(403).json({ error: 'Forbidden' });

    const totalPrice = price * quantity;
    await db.run(`
      UPDATE listings
      SET item = ?, price = ?, quantity = ?, totalPrice = ?, type = ?, category = ?, IGN = ?, priceMode = ?, notes = ?,
        combatCategory = ?, combatLevel = ?, combatStrength = ?, combatDmgType = ?, combatDmgPercent = ?,
        combatImpact = ?, combatCryonae = ?, combatArborae = ?, combatTempestae = ?, combatInfernae = ?, combatNecromae = ?, rarity = ?,
        timestamp = ?
      WHERE id = ?`,
      item, price, quantity, totalPrice, type, category, IGN || '', priceMode || 'Each', notes || '',
      combatCategory || '', combatLevel || '', combatStrength || '', combatDmgType || '', combatDmgPercent || '',
      combatImpact || '', combatCryonae || '', combatArborae || '', combatTempestae || '', combatInfernae || '', combatNecromae || '', rarity || '',
      Date.now(),
      req.params.id
    );
    const updated = await db.get('SELECT * FROM listings WHERE id = ?', req.params.id);
    io.emit('listingUpdated', updated); // Emit event
    res.json({ success: true, listing: updated });
  } catch (err) {
    console.error('Error updating listing:', err);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

app.delete('/api/listings/:id', authenticateJWT, async (req, res) => {
  try {
    const listing = await db.get('SELECT * FROM listings WHERE id = ?', req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    
    // Check authorization: either sellerId matches or (sellerId is empty and seller username matches)
    const isOwner = listing.sellerId === req.user.id || 
                   (!listing.sellerId && listing.seller === req.user.username);
    if (!isOwner) return res.status(403).json({ error: 'Forbidden' });

    await db.run('DELETE FROM listings WHERE id = ?', req.params.id);
    io.emit('listingDeleted', Number(req.params.id)); // Emit event
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting listing from DB:', err);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

app.delete('/admin/listings/:id', authenticateJWT, ensureAdmin, async (req, res) => {
  try {
    const listing = await db.get('SELECT * FROM listings WHERE id = ?', req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    await db.run('DELETE FROM listings WHERE id = ?', req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Admin delete failed:', err);
    res.status(500).json({ error: 'Failed to delete listing as admin' });
  }
});

app.get('/admin/users', authenticateJWT, ensureAdmin, async (req, res) => {
  const admins = await db.all('SELECT * FROM admins');
  res.json({ admins });
});

app.post('/admin/users/add', authenticateJWT, ensureAdmin, async (req, res) => {
  const { id } = req.body;
  await db.run('INSERT OR IGNORE INTO admins (id) VALUES (?)', id);
  res.json({ success: true });
});

app.post('/admin/users/remove', authenticateJWT, ensureAdmin, async (req, res) => {
  const { id } = req.body;
  await db.run('DELETE FROM admins WHERE id = ?', id);
  res.json({ success: true });
});

// ==== ITEMS API ENDPOINTS ====
// Utility to normalize item name to asset filename
function getImageFilename(itemName) {
  if (!itemName) return null;
  let name = itemName;
  // If the name starts with '+', always prefix with underscore after normalization
  let startsWithPlus = name.startsWith('+');
  if (startsWithPlus) {
    name = name.slice(1);
  }
  // Normalize: replace all non-alphanumeric (including '%') with '_', do not collapse or trim
  name = name.replace(/[^a-zA-Z0-9]/g, '_');
  if (startsWithPlus) {
    name = '_' + name;
  }
  return name + '.png';
}

// Get only item names and images for dropdown
app.get('/api/items/meta/names', async (req, res) => {
  try {
    const db = await open({
      filename: path.join(__dirname, 'data', 'items.db'),
      driver: sqlite3.Database
    });
    let rows = await db.all('SELECT Items, Image FROM items');
    await db.close();
    // Always use normalized filename for Image field, with correct path
    rows = rows.map(row => {
      const image = getImageFilename(row.Items);
      return { ...row, Image: "/assets/items/" + image };
    });
    res.json(rows);
  } catch (err) {
    console.error('Error reading item names/images from db:', err);
    res.status(500).json({ error: 'Failed to read item names/images from db' });
  }
});
// Get all item names from items.db
app.get('/api/items/names', async (req, res) => {
  try {
    const db = await open({
      filename: path.join(__dirname, 'data', 'items.db'),
      driver: sqlite3.Database
    });
    const rows = await db.all('SELECT Items FROM items');
    await db.close();
    const names = rows.map(row => row.Items).filter(Boolean);
    res.json(names);
  } catch (err) {
    console.error('Error reading item names from db:', err);
    res.status(500).json({ error: 'Failed to read item names from db' });
  }
});

// Get all items from items.json
app.get('/api/items', async (req, res) => {
  try {
    const db = await open({
      filename: path.join(__dirname, 'data', 'items.db'),
      driver: sqlite3.Database
    });
    let items = await db.all('SELECT * FROM items');
    await db.close();
    // Always use normalized filename for Image field, with correct path
    items = items.map(item => {
      const image = getImageFilename(item.Items);
      return { ...item, Image: "/assets/items/" + image };
    });
    res.json(items);
  } catch (err) {
    console.error('Error reading items from db:', err);
    res.status(500).json({ error: 'Failed to read items from db' });
  }
});

// Search items by name, profession, episode, etc.
app.get('/api/items/search', async (req, res) => {
  try {
    const { 
      q: searchQuery, 
      profession, 
      episode, 
      tradeable, 
      limit = 50,
      offset = 0 
    } = req.query;
    const db = await open({
      filename: path.join(__dirname, 'data', 'items.db'),
      driver: sqlite3.Database
    });
    let query = 'SELECT * FROM items WHERE 1=1';
    let params = [];
    if (searchQuery) {
      query += ' AND Items LIKE ?';
      params.push(`%${searchQuery}%`);
    }
    if (profession) {
      query += ' AND ([Profession A] = ? OR [Profession B] = ?)';
      params.push(profession, profession);
    }
    if (episode) {
      query += ' AND Episode = ?';
      params.push(episode);
    }
    if (tradeable !== undefined) {
      query += ' AND Tradeable = ?';
      params.push(tradeable);
    }
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    const items = await db.all(query, params);
    const total = await db.get('SELECT COUNT(*) as count FROM items');
    await db.close();
    res.json({
      items,
      total: total.count,
      offset: parseInt(offset),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('Error searching items in db:', err);
    res.status(500).json({ error: 'Failed to search items in db' });
  }
});

// Get a specific item by name
app.get('/api/items/:itemName', async (req, res) => {
  try {
    const { itemName } = req.params;
    
    // Handle empty or undefined item names
    if (!itemName || itemName.trim() === '') {
      return res.status(404).json({ error: 'Item name is required' });
    }
    
    const itemsPath = path.join(__dirname, 'data', 'items.json');
    
    if (!fs.existsSync(itemsPath)) {
      return res.status(404).json({ error: 'Items data not found' });
    }
    
    const itemsData = fs.readFileSync(itemsPath, 'utf8');
    const items = JSON.parse(itemsData);
    
    let item = items.find(i => i.Items === itemName);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    // Always use normalized filename for Image field, with correct path
    const image = "/assets/items/" + getImageFilename(item.Items);
    item = { ...item, Image: image };
    res.json(item);
  } catch (err) {
    console.error('Error getting item:', err);
    res.status(500).json({ error: 'Failed to get item data' });
  }
});

// Get unique professions from items data
app.get('/api/items/meta/professions', async (req, res) => {
  try {
    const itemsPath = path.join(__dirname, 'data', 'items.json');
    
    if (!fs.existsSync(itemsPath)) {
      return res.status(404).json({ error: 'Items data not found' });
    }
    
    const itemsData = fs.readFileSync(itemsPath, 'utf8');
    const items = JSON.parse(itemsData);
    
    const professions = new Set();
    items.forEach(item => {
      if (item['Profession A'] && item['Profession A'] !== 'None') {
        professions.add(item['Profession A']);
      }
      if (item['Profession B'] && item['Profession B'] !== 'None') {
        professions.add(item['Profession B']);
      }
    });
    
    res.json(Array.from(professions).sort());
  } catch (err) {
    console.error('Error getting professions:', err);
    res.status(500).json({ error: 'Failed to get professions data' });
  }
});

// Get unique episodes from items data
app.get('/api/items/meta/episodes', async (req, res) => {
  try {
    const itemsPath = path.join(__dirname, 'data', 'items.json');
    
    if (!fs.existsSync(itemsPath)) {
      return res.status(404).json({ error: 'Items data not found' });
    }
    
    const itemsData = fs.readFileSync(itemsPath, 'utf8');
    const items = JSON.parse(itemsData);
    
    const episodes = new Set();
    items.forEach(item => {
      if (item.Episode && item.Episode !== 'None') {
        episodes.add(item.Episode);
      }
    });
    
    res.json(Array.from(episodes).sort());
  } catch (err) {
    console.error('Error getting episodes:', err);
    res.status(500).json({ error: 'Failed to get episodes data' });
  }
});

// ==== COMBINED API ENDPOINTS ====

// Get listings with item details
app.get('/api/listings-with-items', async (req, res) => {
  try {
    const { 
      item_name, 
      profession, 
      episode, 
      type, 
      seller,
      limit = 50,
      offset = 0 
    } = req.query;
    
    // Get listings from database
    let query = 'SELECT * FROM listings';
    let params = [];
    let conditions = [];
    
    if (item_name) {
      conditions.push('item LIKE ?');
      params.push(`%${item_name}%`);
    }
    
    if (type) {
      conditions.push('type = ?');
      params.push(type);
    }
    
    if (seller) {
      conditions.push('seller LIKE ?');
      params.push(`%${seller}%`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const listings = await db.all(query, params);
    
    // Get items data
    const itemsPath = path.join(__dirname, 'data', 'items.json');
    let itemsMap = {};
    
    if (fs.existsSync(itemsPath)) {
      const itemsData = fs.readFileSync(itemsPath, 'utf8');
      const items = JSON.parse(itemsData);
      
      // Create a map for quick lookup
      items.forEach(item => {
        if (item.Items) {
          itemsMap[item.Items] = item;
        }
      });
    }
    
    // Combine listings with item details
    let enrichedListings = listings.map(listing => ({
      ...listing,
      itemDetails: itemsMap[listing.item] || null
    }));
    
    // Apply additional filters based on item details
    if (profession) {
      enrichedListings = enrichedListings.filter(listing => {
        const itemDetails = listing.itemDetails;
        return itemDetails && (
          itemDetails['Profession A'] === profession || 
          itemDetails['Profession B'] === profession
        );
      });
    }
    
    if (episode) {
      enrichedListings = enrichedListings.filter(listing => {
        const itemDetails = listing.itemDetails;
        return itemDetails && itemDetails.Episode === episode;
      });
    }
    
    // Get total count for pagination
    const totalCountQuery = 'SELECT COUNT(*) as count FROM listings' + 
      (conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '');
    const totalResult = await db.get(totalCountQuery, params.slice(0, -2)); // Remove limit and offset params
    
    res.json({
      listings: enrichedListings,
      total: totalResult.count,
      offset: parseInt(offset),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('Error getting enriched listings:', err);
    res.status(500).json({ error: 'Failed to get listings with item details' });
  }
});

// Get market statistics for an item
app.get('/api/market-stats/:itemName', async (req, res) => {
  try {
    const { itemName } = req.params;
    
    // Get all listings for this item
    const listings = await db.all(
      'SELECT * FROM listings WHERE item = ? ORDER BY timestamp DESC',
      [itemName]
    );
    
    if (listings.length === 0) {
      return res.json({
        item: itemName,
        totalListings: 0,
        buyListings: 0,
        sellListings: 0,
        averagePrice: null,
        lowestSellPrice: null,
        highestBuyPrice: null,
        totalQuantity: 0
      });
    }
    
    const buyListings = listings.filter(l => l.type === 'buy');
    const sellListings = listings.filter(l => l.type === 'sell');
    
    const allPrices = listings.map(l => l.price);
    const sellPrices = sellListings.map(l => l.price);
    const buyPrices = buyListings.map(l => l.price);
    
    const totalQuantity = listings.reduce((sum, l) => sum + l.quantity, 0);
    const averagePrice = allPrices.length > 0 
      ? allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length 
      : null;
    
    res.json({
      item: itemName,
      totalListings: listings.length,
      buyListings: buyListings.length,
      sellListings: sellListings.length,
      averagePrice: averagePrice ? Math.round(averagePrice) : null,
      lowestSellPrice: sellPrices.length > 0 ? Math.min(...sellPrices) : null,
      highestBuyPrice: buyPrices.length > 0 ? Math.max(...buyPrices) : null,
      totalQuantity: totalQuantity,
      recentListings: listings.slice(0, 10) // Last 10 listings
    });
  } catch (err) {
    console.error('Error getting market stats:', err);
    res.status(500).json({ error: 'Failed to get market statistics' });
  }
});

// ==== CONSOLIDATED API ENDPOINTS ====

// Get all listings (API endpoint for consistency)
app.get('/api/listings', async (req, res) => {
  try {
    const listings = await db.all(`
      SELECT * FROM listings 
      WHERE item IS NOT NULL AND item != ''
      ORDER BY timestamp DESC
    `);
    console.log(`Returned ${listings.length} listings from /api/listings`);
    res.json(listings);
  } catch (err) {
    console.error('Error fetching listings from /api/listings:', err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Create a new listing (API endpoint with validation)
app.post('/api/listings', authenticateJWT, async (req, res) => {
  // DEBUG: Log incoming POST data for troubleshooting
  console.log('DEBUG /api/listings POST body:', req.body);
  const { 
    item, 
    price, 
    quantity, 
    type, 
    category, 
    priceMode,
    contactInfo, // <-- added
    notes, // <-- added
    combatCategory, 
    combatLevel, 
    combatStrength, 
    combatDmgType, 
    combatDmgPercent,
    combatImpact, 
    combatCryonae, 
    combatArborae, 
    combatTempestae, 
    combatInfernae, 
    combatNecromae,
    rarity // <-- ensure rarity is included
  } = req.body;

  // Validation
  if (!item || !price || !quantity || !type) {
    return res.status(400).json({ 
      error: 'Missing required fields: item, price, quantity, type' 
    });
  }

  if (!['buy', 'sell'].includes(type.toLowerCase())) {
    return res.status(400).json({ 
      error: 'Type must be either "buy" or "sell"' 
    });
  }

  if (price <= 0 || quantity <= 0) {
    return res.status(400).json({ 
      error: 'Price and quantity must be positive numbers' 
    });
  }

  try {
    const totalPrice = price * quantity;
    const stmt = await db.run(`
      INSERT INTO listings (item, price, quantity, totalPrice, type, category, seller, userId, sellerAvatar, timestamp, IGN, contactInfo, priceMode, notes,
        combatCategory, combatLevel, combatStrength, combatDmgType, combatDmgPercent, combatImpact, combatCryonae, combatArborae, combatTempestae, combatInfernae, combatNecromae, rarity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      item,
      price,
      quantity,
      totalPrice,
      type.toLowerCase(),
      category || '',
      req.user.username, // seller - use current username
      req.user.id, // userId - use authenticated user's permanent ID  
      req.user.avatar || '', // sellerAvatar - use authenticated user's avatar
      Date.now(),
      req.user.username, // IGN field - use current username (for Discord bot compatibility)
      contactInfo || '',
      priceMode || 'Each',
      notes || '',
      combatCategory || '',
      combatLevel || '',
      combatStrength || '',
      combatDmgType || '',
      combatDmgPercent || '',
      combatImpact || '',
      combatCryonae || '',
      combatArborae || '',
      combatTempestae || '',
      combatInfernae || '',
      combatNecromae || '',
      rarity || ''
    );
    const listing = await db.get('SELECT * FROM listings WHERE id = ?', stmt.lastID);
    io.emit('listingCreated', listing);
    res.status(201).json({ 
      success: true, 
      message: 'Listing created successfully',
      listing: listing 
    });
  } catch (err) {
    console.error('Error inserting listing into DB:', err);
    res.status(500).json({ error: 'Failed to save listing' });
  }
});

// Socket.IO Setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
  
  // Optional: Add room-based subscriptions for different item categories
  socket.on('subscribe-to-item', (itemName) => {
    socket.join(`item-${itemName}`);
  });
  
  socket.on('unsubscribe-from-item', (itemName) => {
    socket.leave(`item-${itemName}`);
  });
});

// Database Initialization and Server Startup
(async () => {
  try {
    console.log('Initializing database...');
    
    // Open database connection
    db = await open({
      filename: path.join(__dirname, 'data', 'marketplace.db'),
      driver: sqlite3.Database,
    });
    
    console.log('Database connected successfully');

    // Create tables if they don't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS listings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item TEXT NOT NULL,
        price INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        type TEXT NOT NULL,
        category TEXT,
        seller TEXT NOT NULL,
        userId TEXT,
        sellerAvatar TEXT,
        timestamp INTEGER NOT NULL,
        IGN TEXT,
        priceMode TEXT DEFAULT 'Each',
        combatCategory TEXT,
        combatLevel TEXT,
        combatStrength TEXT,
        combatDmgType TEXT,
        combatDmgPercent TEXT,
        combatImpact TEXT,
        combatCryonae TEXT,
        combatArborae TEXT,
        combatTempestae TEXT,
        combatInfernae TEXT,
        combatNecromae TEXT
      );
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY
      );
    `);

    // Create users table for email/password and Discord authentication
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
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
    `);

    // Create indexes for better performance
    try {
      await db.exec('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
      await db.exec('CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id)');
      await db.exec('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
      console.log('Created user indexes');
    } catch (e) {
      console.log('User indexes may already exist:', e.message);
    }

    // Add migration logic for users table columns (for production database compatibility)
    const userColumns = [
      'email TEXT UNIQUE',
      'password_hash TEXT',
      'discord_username TEXT',
      'avatar TEXT',
      'email_verified INTEGER DEFAULT 0',
      'email_verification_token TEXT',
      'password_reset_token TEXT',
      'password_reset_expires INTEGER',
      'auth_type TEXT DEFAULT \'local\'',
      'created_at INTEGER',
      'updated_at INTEGER'
    ];
    
    for (const col of userColumns) {
      try {
        await db.exec(`ALTER TABLE users ADD COLUMN ${col}`);
        console.log(`Added user column: ${col}`);
      } catch (e) {
        // Column already exists, ignore error
      }
    }

    try {
      await db.exec('ALTER TABLE listings ADD COLUMN rarity TEXT');
      console.log('Added column: rarity TEXT');
    } catch (e) {
      // Column already exists, ignore error
    }
    try {
      await db.exec('ALTER TABLE listings ADD COLUMN IGN TEXT');
      console.log('Added column: IGN TEXT');
    } catch (e) {
      // Column already exists, ignore error
    }
    try {
      await db.exec('ALTER TABLE listings ADD COLUMN userId TEXT');
      console.log('Added column: userId TEXT');
    } catch (e) {
      // Column already exists, ignore error
    }

    // MIGRATION: Fix listings that have Discord IDs in userId field instead of database IDs
    console.log('Starting userId migration...');
    const listingsWithDiscordIds = await db.all(`
      SELECT l.id as listing_id, l.userId as discord_id, u.id as correct_user_id 
      FROM listings l 
      JOIN users u ON l.userId = u.discord_id 
      WHERE LENGTH(l.userId) > 10 AND l.userId NOT LIKE '%@%'
    `);
    
    if (listingsWithDiscordIds.length > 0) {
      console.log(`Found ${listingsWithDiscordIds.length} listings with Discord IDs in userId field. Fixing...`);
      
      for (const listing of listingsWithDiscordIds) {
        await db.run(
          'UPDATE listings SET userId = ? WHERE id = ?',
          [listing.correct_user_id, listing.listing_id]
        );
      }
      
      console.log(`Fixed ${listingsWithDiscordIds.length} listings to use proper database IDs`);
    } else {
      console.log('No listings found with Discord IDs in userId field');
    }

    // MIGRATION: Fix listings that have no userId but can be matched by seller name
    console.log('Starting legacy userId population...');
    const legacyListings = await db.all(`
      SELECT l.id as listing_id, l.seller, u.id as user_id
      FROM listings l
      JOIN users u ON LOWER(l.seller) = LOWER(u.username)
      WHERE l.userId IS NULL OR l.userId = ''
    `);
    
    if (legacyListings.length > 0) {
      console.log(`Found ${legacyListings.length} legacy listings without userId. Populating...`);
      
      for (const listing of legacyListings) {
        await db.run(
          'UPDATE listings SET userId = ? WHERE id = ?',
          [listing.user_id, listing.listing_id]
        );
      }
      
      console.log(`Populated userId for ${legacyListings.length} legacy listings`);
    } else {
      console.log('No legacy listings found without userId');
    }
    
    console.log('userId migration completed');
    
    // Add new columns for combat fields if they do not exist
    const columns = [
      'totalPrice INTEGER',
      'combatCategory TEXT',
      'combatLevel TEXT',
      'combatStrength TEXT',
      'combatDmgType TEXT',
      'combatDmgPercent TEXT',
      'combatImpact TEXT',
      'combatCryonae TEXT',
      'combatArborae TEXT',
      'combatTempestae TEXT',
      'combatInfernae TEXT',
      'combatNecromae TEXT',
      'contactInfo TEXT',
      'notes TEXT',
    ];
    
    for (const col of columns) {
      try {
        await db.exec(`ALTER TABLE listings ADD COLUMN ${col}`);
        console.log(`Added column: ${col}`);
      } catch (e) {
        // Column already exists, ignore error
      }
    }

    // Insert default admin if not present
    const defaultAdminId = '249099315056738304';
    const existingAdmin = await db.get('SELECT 1 FROM admins WHERE id = ?', defaultAdminId);
    if (!existingAdmin) {
      await db.run('INSERT INTO admins (id) VALUES (?)', defaultAdminId);
      console.log('Default admin created');
    }

    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('Data directory created');
    }

    console.log('Database initialization completed');

    // Start server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 BS-Bazaar Server running on http://0.0.0.0:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost'}`);
      console.log(`📋 Health check: http://0.0.0.0:${PORT}/health`);
    });

  } catch (error) {
    console.error('Failed to initialize database or start server:', error);
    process.exit(1);
  }
})();
