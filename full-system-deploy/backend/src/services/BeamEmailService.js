const nodemailer = require('nodemailer');
const fs = require('fs-extra');
const path = require('path');
const handlebars = require('handlebars');
const beamDatabase = require('../database/BeamDatabase');
const BeamErrorHandler = require('../utils/BeamErrorHandler');

class BeamEmailService {
    constructor() {
        this.transporter = null;
        this.templates = new Map();
        this.emailQueue = [];
        this.isProcessing = false;
        this.EmailTemplate = null;
        this.EmailLog = null;
        
        this.initializeModels();
        this.initializeTransporter();
        this.loadTemplates();
        this.startQueueProcessor();
    }

    /**
     * Initialize database models
     */
    initializeModels() {
        const mongoose = require('mongoose');

        // Email Template Schema
        const emailTemplateSchema = new mongoose.Schema({
            name: {
                type: String,
                required: true,
                unique: true
            },
            subject: {
                type: String,
                required: true
            },
            htmlTemplate: {
                type: String,
                required: true
            },
            textTemplate: String,
            variables: [String],
            category: {
                type: String,
                enum: ['notification', 'marketing', 'system', 'welcome', 'password'],
                default: 'notification'
            },
            isActive: {
                type: Boolean,
                default: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            updatedAt: {
                type: Date,
                default: Date.now
            }
        });

        // Email Log Schema
        const emailLogSchema = new mongoose.Schema({
            to: {
                type: String,
                required: true
            },
            from: {
                type: String,
                required: true
            },
            subject: {
                type: String,
                required: true
            },
            template: {
                type: String,
                required: true
            },
            variables: mongoose.Schema.Types.Mixed,
            status: {
                type: String,
                enum: ['pending', 'sent', 'failed', 'bounced'],
                default: 'pending'
            },
            error: String,
            messageId: String,
            sentAt: Date,
            createdAt: {
                type: Date,
                default: Date.now
            }
        });

        this.EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);
        this.EmailLog = mongoose.model('EmailLog', emailLogSchema);
    }

    /**
     * Initialize email transporter
     */
    initializeTransporter() {
        const config = {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        };

        // Use different providers based on configuration
        if (process.env.EMAIL_PROVIDER === 'sendgrid') {
            config.service = 'SendGrid';
        } else if (process.env.EMAIL_PROVIDER === 'mailgun') {
            config.service = 'Mailgun';
        } else if (process.env.EMAIL_PROVIDER === 'aws') {
            config.service = 'AWS SES';
        }

        this.transporter = nodemailer.createTransporter(config);

        // Verify connection
        this.transporter.verify((error, success) => {
            if (error) {
                console.error(' Email service connection failed:', error);
            } else {
                console.log(' Email service connected successfully');
            }
        });
    }

    /**
     * Load email templates
     */
    async loadTemplates() {
        try {
            // Load default templates
            const defaultTemplates = [
                {
                    name: 'welcome',
                    subject: 'Welcome to BeamFlow!',
                    category: 'welcome',
                    htmlTemplate: this.getDefaultWelcomeTemplate(),
                    textTemplate: this.getDefaultWelcomeTextTemplate(),
                    variables: ['username', 'activationLink']
                },
                {
                    name: 'password-reset',
                    subject: 'Password Reset Request',
                    category: 'password',
                    htmlTemplate: this.getDefaultPasswordResetTemplate(),
                    textTemplate: this.getDefaultPasswordResetTextTemplate(),
                    variables: ['username', 'resetLink', 'expiryTime']
                },
                {
                    name: 'email-verification',
                    subject: 'Verify Your Email Address',
                    category: 'system',
                    htmlTemplate: this.getDefaultEmailVerificationTemplate(),
                    textTemplate: this.getDefaultEmailVerificationTextTemplate(),
                    variables: ['username', 'verificationLink']
                },
                {
                    name: 'notification',
                    subject: 'New Notification',
                    category: 'notification',
                    htmlTemplate: this.getDefaultNotificationTemplate(),
                    textTemplate: this.getDefaultNotificationTextTemplate(),
                    variables: ['username', 'title', 'message', 'actionLink']
                }
            ];

            // Save default templates to database
            for (const template of defaultTemplates) {
                await this.saveTemplate(template);
            }

            // Load templates from database
            const dbTemplates = await this.EmailTemplate.find({ isActive: true });
            for (const template of dbTemplates) {
                this.templates.set(template.name, {
                    subject: template.subject,
                    htmlTemplate: handlebars.compile(template.htmlTemplate),
                    textTemplate: template.textTemplate ? handlebars.compile(template.textTemplate) : null,
                    variables: template.variables
                });
            }

            console.log(` Loaded ${this.templates.size} email templates`);

        } catch (error) {
            BeamErrorHandler.logError('Load Templates Error', error);
        }
    }

    /**
     * Save email template
     */
    async saveTemplate(templateData) {
        try {
            const existingTemplate = await this.EmailTemplate.findOne({ name: templateData.name });
            
            if (existingTemplate) {
                // Update existing template
                Object.assign(existingTemplate, templateData);
                existingTemplate.updatedAt = new Date();
                await existingTemplate.save();
            } else {
                // Create new template
                const template = new this.EmailTemplate(templateData);
                await template.save();
            }

            // Reload templates
            await this.loadTemplates();

            return { success: true, message: 'Template saved successfully' };
        } catch (error) {
            BeamErrorHandler.logError('Save Template Error', error);
            throw error;
        }
    }

    /**
     * Send email
     */
    async sendEmail(emailData) {
        try {
            const {
                to,
                template,
                variables = {},
                subject,
                html,
                text,
                attachments = [],
                from = process.env.FROM_EMAIL || 'noreply@beamflow.com'
            } = emailData;

            // Validate required fields
            if (!to) {
                throw new Error('Recipient email is required');
            }

            // Use template if provided
            let emailSubject = subject;
            let emailHtml = html;
            let emailText = text;

            if (template) {
                const templateData = this.templates.get(template);
                if (!templateData) {
                    throw new Error(`Template '${template}' not found`);
                }

                emailSubject = templateData.subject;
                emailHtml = templateData.htmlTemplate(variables);
                emailText = templateData.textTemplate ? templateData.textTemplate(variables) : null;
            }

            // Create email log
            const emailLog = new this.EmailLog({
                to,
                from,
                subject: emailSubject,
                template: template || 'custom',
                variables
            });

            await emailLog.save();

            // Prepare email options
            const mailOptions = {
                from,
                to,
                subject: emailSubject,
                html: emailHtml,
                text: emailText,
                attachments
            };

            // Send email
            const result = await this.transporter.sendMail(mailOptions);

            // Update email log
            emailLog.status = 'sent';
            emailLog.messageId = result.messageId;
            emailLog.sentAt = new Date();
            await emailLog.save();

            // Log success
            await this.logAction('info', 'Email sent successfully', 'BeamEmailService', null, {
                to,
                template,
                messageId: result.messageId
            });

            return {
                success: true,
                messageId: result.messageId,
                logId: emailLog._id
            };

        } catch (error) {
            // Update email log with error
            if (emailLog) {
                emailLog.status = 'failed';
                emailLog.error = error.message;
                await emailLog.save();
            }

            BeamErrorHandler.logError('Send Email Error', error);
            throw error;
        }
    }

    /**
     * Send email to queue
     */
    async queueEmail(emailData) {
        this.emailQueue.push({
            ...emailData,
            id: Date.now() + Math.random(),
            createdAt: new Date()
        });

        // Process queue if not already processing
        if (!this.isProcessing) {
            this.processQueue();
        }

        return { success: true, message: 'Email queued successfully' };
    }

    /**
     * Process email queue
     */
    async processQueue() {
        if (this.isProcessing || this.emailQueue.length === 0) {
            return;
        }

        this.isProcessing = true;

        while (this.emailQueue.length > 0) {
            const emailData = this.emailQueue.shift();

            try {
                await this.sendEmail(emailData);
                
                // Add delay between emails to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error('Failed to send queued email:', error);
                
                // Re-queue failed emails (with retry limit)
                if (!emailData.retryCount || emailData.retryCount < 3) {
                    emailData.retryCount = (emailData.retryCount || 0) + 1;
                    this.emailQueue.push(emailData);
                }
            }
        }

        this.isProcessing = false;
    }

    /**
     * Start queue processor
     */
    startQueueProcessor() {
        // Process queue every 30 seconds
        setInterval(() => {
            this.processQueue();
        }, 30000);
    }

    /**
     * Send welcome email
     */
    async sendWelcomeEmail(user, activationLink = null) {
        return await this.sendEmail({
            to: user.email,
            template: 'welcome',
            variables: {
                username: user.username,
                activationLink: activationLink || `${process.env.CLIENT_URL}/activate`
            }
        });
    }

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(user, resetLink, expiryTime = '24 hours') {
        return await this.sendEmail({
            to: user.email,
            template: 'password-reset',
            variables: {
                username: user.username,
                resetLink,
                expiryTime
            }
        });
    }

    /**
     * Send email verification
     */
    async sendEmailVerification(user, verificationLink) {
        return await this.sendEmail({
            to: user.email,
            template: 'email-verification',
            variables: {
                username: user.username,
                verificationLink
            }
        });
    }

    /**
     * Send notification email
     */
    async sendNotificationEmail(user, title, message, actionLink = null) {
        return await this.sendEmail({
            to: user.email,
            template: 'notification',
            variables: {
                username: user.username,
                title,
                message,
                actionLink
            }
        });
    }

    /**
     * Get email statistics
     */
    async getEmailStats() {
        try {
            const stats = await this.EmailLog.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const templateStats = await this.EmailLog.aggregate([
                {
                    $group: {
                        _id: '$template',
                        count: { $sum: 1 },
                        sent: {
                            $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
                        },
                        failed: {
                            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
                        }
                    }
                }
            ]);

            return {
                byStatus: stats.reduce((acc, stat) => {
                    acc[stat._id] = stat.count;
                    return acc;
                }, {}),
                byTemplate: templateStats.reduce((acc, stat) => {
                    acc[stat._id] = {
                        total: stat.count,
                        sent: stat.sent,
                        failed: stat.failed
                    };
                    return acc;
                }, {})
            };
        } catch (error) {
            BeamErrorHandler.logError('Get Email Stats Error', error);
            throw error;
        }
    }

    /**
     * Get email logs
     */
    async getEmailLogs(page = 1, limit = 20, filters = {}) {
        try {
            const skip = (page - 1) * limit;
            const query = {};

            if (filters.status) query.status = filters.status;
            if (filters.template) query.template = filters.template;
            if (filters.to) query.to = { $regex: filters.to, $options: 'i' };

            const logs = await this.EmailLog.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await this.EmailLog.countDocuments(query);

            return {
                logs,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            BeamErrorHandler.logError('Get Email Logs Error', error);
            throw error;
        }
    }

    // Default Templates

    getDefaultWelcomeTemplate() {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Welcome to BeamFlow</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to BeamFlow!</h1>
                    <p>Your comprehensive digital workspace</p>
                </div>
                <div class="content">
                    <h2>Hello {{username}}!</h2>
                    <p>Welcome to BeamFlow! We're excited to have you on board.</p>
                    <p>BeamFlow is your all-in-one platform for:</p>
                    <ul>
                        <li> Advanced file management</li>
                        <li> Real-time communication</li>
                        <li> Analytics and monitoring</li>
                        <li> Security and privacy tools</li>
                        <li> Productivity enhancements</li>
                    </ul>
                    {{#if activationLink}}
                    <p>To get started, please activate your account:</p>
                    <a href="{{activationLink}}" class="button">Activate Account</a>
                    {{/if}}
                    <p>If you have any questions, feel free to reach out to our support team.</p>
                    <p>Best regards,<br>The BeamFlow Team</p>
                </div>
                <div class="footer">
                    <p>© 2024 BeamFlow. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    getDefaultWelcomeTextTemplate() {
        return `
Welcome to BeamFlow!

Hello {{username}}!

Welcome to BeamFlow! We're excited to have you on board.

BeamFlow is your all-in-one platform for:
- Advanced file management
- Real-time communication
- Analytics and monitoring
- Security and privacy tools
- Productivity enhancements

{{#if activationLink}}
To get started, please activate your account:
{{activationLink}}
{{/if}}

If you have any questions, feel free to reach out to our support team.

Best regards,
The BeamFlow Team

© 2024 BeamFlow. All rights reserved.
        `;
    }

    getDefaultPasswordResetTemplate() {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Password Reset</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                    <h2>Hello {{username}},</h2>
                    <p>We received a request to reset your password for your BeamFlow account.</p>
                    <p>Click the button below to reset your password:</p>
                    <a href="{{resetLink}}" class="button">Reset Password</a>
                    <div class="warning">
                        <strong>Important:</strong>
                        <ul>
                            <li>This link will expire in {{expiryTime}}</li>
                            <li>If you didn't request this reset, please ignore this email</li>
                            <li>For security, this link can only be used once</li>
                        </ul>
                    </div>
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p>{{resetLink}}</p>
                    <p>Best regards,<br>The BeamFlow Team</p>
                </div>
                <div class="footer">
                    <p>© 2024 BeamFlow. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    getDefaultPasswordResetTextTemplate() {
        return `
Password Reset Request

Hello {{username}},

We received a request to reset your password for your BeamFlow account.

Click the link below to reset your password:
{{resetLink}}

Important:
- This link will expire in {{expiryTime}}
- If you didn't request this reset, please ignore this email
- For security, this link can only be used once

Best regards,
The BeamFlow Team

© 2024 BeamFlow. All rights reserved.
        `;
    }

    getDefaultEmailVerificationTemplate() {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Verify Your Email</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #28a745; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Verify Your Email Address</h1>
                </div>
                <div class="content">
                    <h2>Hello {{username}},</h2>
                    <p>Thank you for signing up for BeamFlow! To complete your registration, please verify your email address.</p>
                    <p>Click the button below to verify your email:</p>
                    <a href="{{verificationLink}}" class="button">Verify Email</a>
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p>{{verificationLink}}</p>
                    <p>Best regards,<br>The BeamFlow Team</p>
                </div>
                <div class="footer">
                    <p>© 2024 BeamFlow. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    getDefaultEmailVerificationTextTemplate() {
        return `
Verify Your Email Address

Hello {{username}},

Thank you for signing up for BeamFlow! To complete your registration, please verify your email address.

Click the link below to verify your email:
{{verificationLink}}

Best regards,
The BeamFlow Team

© 2024 BeamFlow. All rights reserved.
        `;
    }

    getDefaultNotificationTemplate() {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>{{title}}</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #007bff; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>{{title}}</h1>
                </div>
                <div class="content">
                    <h2>Hello {{username}},</h2>
                    <p>{{message}}</p>
                    {{#if actionLink}}
                    <a href="{{actionLink}}" class="button">View Details</a>
                    {{/if}}
                    <p>Best regards,<br>The BeamFlow Team</p>
                </div>
                <div class="footer">
                    <p>© 2024 BeamFlow. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    getDefaultNotificationTextTemplate() {
        return `
{{title}}

Hello {{username}},

{{message}}

{{#if actionLink}}
View details: {{actionLink}}
{{/if}}

Best regards,
The BeamFlow Team

© 2024 BeamFlow. All rights reserved.
        `;
    }

    /**
     * Log action
     */
    async logAction(level, message, source, userId = null, metadata = {}) {
        try {
            const Log = beamDatabase.getModel('Log');
            const log = new Log({
                level,
                message,
                source,
                userId,
                metadata
            });
            await log.save();
        } catch (error) {
            console.error('Logging error:', error);
        }
    }
}

module.exports = new BeamEmailService();
