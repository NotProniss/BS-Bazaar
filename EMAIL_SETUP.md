# Email Service Setup Guide

This guide helps you set up email delivery for the BS-Bazaar application. You have several options depending on your needs and preferences.

## Option 1: Gmail SMTP (Easiest & Most Reliable)

Gmail is the easiest to set up and very reliable for small to medium volume email sending.

### Steps:
1. **Enable 2-Factor Authentication** on your Gmail account (required for app passwords)
2. **Generate App Password**:
   - Go to [Google Account settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and generate password
   - Copy the 16-character password (no spaces)

### Environment Configuration:
Update your `.env.dev` file:
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM=your-email@gmail.com
```

### Gmail Limits:
- 500 emails per day for regular Gmail accounts
- 2000 emails per day for Google Workspace accounts

## Option 2: Mailgun (Recommended for Production)

Mailgun is a reliable email service with a generous free tier (10,000 emails/month for 3 months).

### Steps:
1. Go to [mailgun.com](https://mailgun.com) and create an account
2. Verify your account and add your domain (or use their sandbox domain for testing)
3. Go to "Sending" → "Domain settings" → "SMTP credentials"
4. Click "Add new SMTP user" or use the default one
5. Copy your SMTP credentials

### Environment Configuration:
Update your `.env.dev` file:
```bash
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_mailgun_smtp_username
EMAIL_PASS=your_mailgun_smtp_password
EMAIL_FROM=no-reply@bs-bazaar.com
```

## Option 2: Brevo (formerly Sendinblue)

Brevo offers 300 free emails per day, which is perfect for small applications.

### Steps:
1. Go to [brevo.com](https://brevo.com) and create an account
2. Go to "SMTP & API" → "SMTP"
3. Copy your SMTP credentials

### Environment Configuration:
```bash
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_brevo_email@domain.com
EMAIL_PASS=your_brevo_smtp_key
EMAIL_FROM=no-reply@bs-bazaar.com
```

## Option 3: Self-Hosted SMTP Server

Set up your own SMTP server using Postfix. This gives you complete control but requires more technical setup.

### Prerequisites:
- Linux server with root access
- Domain name with MX records configured
- Basic understanding of Linux system administration

### Installation Steps:
```bash
# Install Postfix and mail utilities
sudo apt update
sudo apt install postfix mailutils

# Configure Postfix (choose "Internet Site" during setup)
sudo dpkg-reconfigure postfix
```

### Environment Configuration:
```bash
EMAIL_HOST=localhost
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_local_user
EMAIL_PASS=your_local_password
EMAIL_FROM=no-reply@yourdomain.com
```

## Option 4: Amazon SES

Very cost-effective for high volume ($0.10 per 1,000 emails) but requires AWS account.

### Steps:
1. Create AWS account and go to SES console
2. Verify your email address or domain
3. Create SMTP credentials in "Account dashboard" → "SMTP settings"

### Environment Configuration:
```bash
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_ses_smtp_username
EMAIL_PASS=your_ses_smtp_password
EMAIL_FROM=no-reply@yourdomain.com
```

## Testing Your Email Setup

After configuring your environment variables:

1. **Restart your server:**
   ```bash
   cd /home/proniss/bazaar-dev/server
   npm start
   ```

2. **Check console output** for: `Email transporter configured and verified successfully`
3. **Test password recovery** from the login page
4. **Check your email** for the reset link

## Troubleshooting

### Common Issues:
- **"Authentication failed"**: Check username and password
- **"Connection timeout"**: Check EMAIL_HOST and EMAIL_PORT
- **"Emails not received"**: Check spam folder

Which option would you like to try first? I recommend **Mailgun** as it's the most reliable and has a generous free tier.
