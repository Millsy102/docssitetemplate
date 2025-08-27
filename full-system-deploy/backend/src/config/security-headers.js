/**
 * Security Headers Configuration
 * Centralized configuration for all security headers used in the application
 */

const securityHeadersConfig = {
    // Content Security Policy Configuration
    csp: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: [
                "'self'", 
                "'unsafe-inline'", // Consider removing if possible
                "https://fonts.googleapis.com", 
                "https://cdn.jsdelivr.net",
                "https://unpkg.com"
            ],
            scriptSrc: [
                "'self'", 
                "https://cdn.jsdelivr.net", 
                "https://www.googletagmanager.com",
                "https://www.google-analytics.com",
                "'unsafe-inline'" // Consider removing if possible
            ],
            fontSrc: [
                "'self'", 
                "https://fonts.gstatic.com",
                "https://cdn.jsdelivr.net"
            ],
            imgSrc: [
                "'self'", 
                "data:", 
                "https:",
                "https://www.google-analytics.com"
            ],
            connectSrc: [
                "'self'",
                "https://www.google-analytics.com",
                "https://analytics.google.com"
            ],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            manifestSrc: ["'self'"],
            workerSrc: ["'self'"],
            formAction: ["'self'"],
            baseUri: ["'self'"],
            upgradeInsecureRequests: [],
            reportUri: process.env.CSP_REPORT_URI || undefined,
        },
        reportOnly: false
    },

    // HTTP Strict Transport Security
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
        force: true
    },

    // Frame Guard (X-Frame-Options)
    frameguard: {
        action: 'deny'
    },

    // Content Type Options
    noSniff: true,

    // XSS Protection
    xssFilter: true,

    // Referrer Policy
    referrerPolicy: {
        policy: 'strict-origin-when-cross-origin'
    },

    // Permissions Policy
    permittedCrossDomainPolicies: {
        permittedPolicies: 'none'
    },

    // Cross-Origin Resource Policy
    crossOriginResourcePolicy: {
        policy: 'same-site'
    },

    // Cross-Origin Embedder Policy
    crossOriginEmbedderPolicy: false, // Set to true if you don't need external resources

    // Cross-Origin Opener Policy
    crossOriginOpenerPolicy: {
        policy: 'same-origin'
    },

    // Origin Agent Cluster
    originAgentCluster: true,

    // DNS Prefetch Control
    dnsPrefetchControl: {
        allow: false
    },

    // IE No Open
    ieNoOpen: true,

    // Hide Powered By
    hidePoweredBy: true,

    // Expect CT
    expectCt: {
        enforce: true,
        maxAge: 30,
        reportUri: process.env.EXPECT_CT_REPORT_URI || undefined
    }
};

// Additional custom headers configuration
const customHeaders = {
    // Remove server information
    removeHeaders: ['Server', 'X-Powered-By'],
    
    // Additional security headers
    additionalHeaders: {
        'X-Download-Options': 'noopen',
        'X-Permitted-Cross-Domain-Policies': 'none',
        'X-DNS-Prefetch-Control': 'off',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
    },
    
    // Feature Policy (for older browsers)
    featurePolicy: [
        'camera \'none\'',
        'microphone \'none\'',
        'geolocation \'none\'',
        'payment \'none\'',
        'usb \'none\'',
        'magnetometer \'none\'',
        'gyroscope \'none\'',
        'accelerometer \'none\''
    ].join('; '),
    
    // Cache control for sensitive pages
    sensitivePageCache: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0'
    }
};

// CORS configuration
const corsConfig = {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-API-Key',
        'X-Requested-With',
        'Accept',
        'Origin'
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204
};

// Rate limiting configuration
const rateLimitConfig = {
    api: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // limit each IP to 1000 requests per windowMs
        message: 'Too many API requests, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
    },
    general: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: 'Too many requests, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
    }
};

// Vercel headers configuration
const vercelHeaders = [
    {
        source: "/(.*)",
        headers: [
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "X-Frame-Options", value: "DENY" },
            { key: "X-XSS-Protection", value: "1; mode=block" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()" },
            { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
            { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
            { key: "Cross-Origin-Resource-Policy", value: "same-site" },
            { key: "Origin-Agent-Cluster", value: "?1" },
            { key: "X-Download-Options", value: "noopen" },
            { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
            { key: "X-DNS-Prefetch-Control", value: "off" },
            { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" }
        ]
    },
    {
        source: "/api/(.*)",
        headers: [
            { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, private" },
            { key: "Pragma", value: "no-cache" },
            { key: "Expires", value: "0" }
        ]
    },
    {
        source: "/admin/(.*)",
        headers: [
            { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, private" },
            { key: "Pragma", value: "no-cache" },
            { key: "Expires", value: "0" }
        ]
    },
    {
        source: "/(.*\\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot))",
        headers: [
            { key: "Cache-Control", value: "public, max-age=31536000, immutable" }
        ]
    },
    {
        source: "/(.*\\.html)",
        headers: [
            { key: "Cache-Control", value: "public, max-age=0, must-revalidate" }
        ]
    }
];

module.exports = {
    securityHeadersConfig,
    customHeaders,
    corsConfig,
    rateLimitConfig,
    vercelHeaders
};
