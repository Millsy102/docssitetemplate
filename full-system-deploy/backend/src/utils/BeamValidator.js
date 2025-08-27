class BeamValidator {
    constructor() {
        this.validators = {
            string: this.validateString.bind(this),
            number: this.validateNumber.bind(this),
            boolean: this.validateBoolean.bind(this),
            email: this.validateEmail.bind(this),
            url: this.validateUrl.bind(this),
            date: this.validateDate.bind(this),
            array: this.validateArray.bind(this),
            object: this.validateObject.bind(this)
        };

        this.sanitizers = {
            trim: this.trim.bind(this),
            toLowerCase: this.toLowerCase.bind(this),
            toUpperCase: this.toUpperCase.bind(this),
            removeHtml: this.removeHtml.bind(this),
            escapeHtml: this.escapeHtml.bind(this),
            normalizeWhitespace: this.normalizeWhitespace.bind(this)
        };
    }

    // Validate string
    validateString(value, rules = {}) {
        if (typeof value !== 'string') {
            return { valid: false, error: 'Value must be a string' };
        }

        const { minLength, maxLength, pattern, required = true } = rules;

        if (required && (!value || value.trim() === '')) {
            return { valid: false, error: 'Value is required' };
        }

        if (minLength && value.length < minLength) {
            return { valid: false, error: `Value must be at least ${minLength} characters long` };
        }

        if (maxLength && value.length > maxLength) {
            return { valid: false, error: `Value must be no more than ${maxLength} characters long` };
        }

        if (pattern && !pattern.test(value)) {
            return { valid: false, error: 'Value does not match required pattern' };
        }

        return { valid: true };
    }

    // Validate number
    validateNumber(value, rules = {}) {
        const num = Number(value);
        if (isNaN(num)) {
            return { valid: false, error: 'Value must be a valid number' };
        }

        const { min, max, required = true } = rules;

        if (required && value === null && value === undefined) {
            return { valid: false, error: 'Value is required' };
        }

        if (min !== undefined && num < min) {
            return { valid: false, error: `Value must be at least ${min}` };
        }

        if (max !== undefined && num > max) {
            return { valid: false, error: `Value must be no more than ${max}` };
        }

        return { valid: true };
    }

    // Validate boolean
    validateBoolean(value, rules = {}) {
        if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
            return { valid: false, error: 'Value must be a boolean' };
        }

        const { required = true } = rules;

        if (required && value === null && value === undefined) {
            return { valid: false, error: 'Value is required' };
        }

        return { valid: true };
    }

    // Validate email
    validateEmail(value, rules = {}) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const result = this.validateString(value, { ...rules, pattern: emailPattern });
        
        if (!result.valid) {
            return result;
        }

        if (!emailPattern.test(value)) {
            return { valid: false, error: 'Value must be a valid email address' };
        }

        return { valid: true };
    }

    // Validate URL
    validateUrl(value, rules = {}) {
        try {
            new URL(value);
            return this.validateString(value, rules);
        } catch {
            return { valid: false, error: 'Value must be a valid URL' };
        }
    }

    // Validate date
    validateDate(value, rules = {}) {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return { valid: false, error: 'Value must be a valid date' };
        }

        const { min, max, required = true } = rules;

        if (required && !value) {
            return { valid: false, error: 'Value is required' };
        }

        if (min && date < new Date(min)) {
            return { valid: false, error: `Date must be after ${min}` };
        }

        if (max && date > new Date(max)) {
            return { valid: false, error: `Date must be before ${max}` };
        }

        return { valid: true };
    }

    // Validate array
    validateArray(value, rules = {}) {
        if (!Array.isArray(value)) {
            return { valid: false, error: 'Value must be an array' };
        }

        const { minLength, maxLength, itemSchema, required = true } = rules;

        if (required && value.length === 0) {
            return { valid: false, error: 'Array cannot be empty' };
        }

        if (minLength && value.length < minLength) {
            return { valid: false, error: `Array must have at least ${minLength} items` };
        }

        if (maxLength && value.length > maxLength) {
            return { valid: false, error: `Array must have no more than ${maxLength} items` };
        }

        if (itemSchema) {
            for (let i = 0; i < value.length; i++) {
                const itemResult = this.validateValue(value[i], itemSchema);
                if (!itemResult.valid) {
                    return { valid: false, error: `Item ${i}: ${itemResult.error}` };
                }
            }
        }

        return { valid: true };
    }

    // Validate object
    validateObject(value, rules = {}) {
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            return { valid: false, error: 'Value must be an object' };
        }

        const { required = true } = rules;

        if (required && Object.keys(value).length === 0) {
            return { valid: false, error: 'Object cannot be empty' };
        }

        return { valid: true };
    }

    // Validate value with schema
    validateValue(value, schema) {
        const { type, custom, ...rules } = schema;

        // Custom validation
        if (custom && typeof custom === 'function') {
            const customResult = custom(value);
            if (customResult && !customResult.valid) {
                return customResult;
            }
        }

        // Type validation
        if (type && this.validators[type]) {
            return this.validators[type](value, rules);
        }

        return { valid: true };
    }

    // Create validation middleware
    createValidationMiddleware(schema) {
        return (req, res, next) => {
            const errors = [];
            const sanitizedData = {};

            // Validate and sanitize request body
            for (const [field, fieldSchema] of Object.entries(schema)) {
                const value = req.body[field];
                const validationResult = this.validateValue(value, fieldSchema);

                if (!validationResult.valid) {
                    errors.push({
                        field,
                        error: validationResult.error
                    });
                } else {
                    // Sanitize value
                    let sanitizedValue = value;
                    if (fieldSchema.sanitize) {
                        sanitizedValue = this.sanitizeValue(value, fieldSchema.sanitize);
                    }
                    sanitizedData[field] = sanitizedValue;
                }
            }

            if (errors.length > 0) {
                return res.status(400).json({
                    error: true,
                    message: 'Validation failed',
                    type: 'VALIDATION_ERROR',
                    details: errors
                });
            }

            // Replace request body with sanitized data
            req.body = { ...req.body, ...sanitizedData };
            next();
        };
    }

    // Sanitize value
    sanitizeValue(value, sanitizeRules) {
        if (value === null || value === undefined) {
            return value;
        }

        let sanitized = value;

        for (const [rule, options] of Object.entries(sanitizeRules)) {
            if (this.sanitizers[rule]) {
                sanitized = this.sanitizers[rule](sanitized, options);
            }
        }

        return sanitized;
    }

    // Sanitizers
    trim(value) {
        return typeof value === 'string' ? value.trim() : value;
    }

    toLowerCase(value) {
        return typeof value === 'string' ? value.toLowerCase() : value;
    }

    toUpperCase(value) {
        return typeof value === 'string' ? value.toUpperCase() : value;
    }

    removeHtml(value) {
        if (typeof value !== 'string') return value;
        return value.replace(/<[^>]*>/g, '');
    }

    escapeHtml(value) {
        if (typeof value !== 'string') return value;
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    }

    normalizeWhitespace(value) {
        if (typeof value !== 'string') return value;
        return value.replace(/\s+/g, ' ').trim();
    }

    // Validate entire object against schema
    validateObject(schema, data) {
        const errors = [];
        const sanitizedData = {};

        for (const [field, fieldSchema] of Object.entries(schema)) {
            const value = data[field];
            const validationResult = this.validateValue(value, fieldSchema);

            if (!validationResult.valid) {
                errors.push({
                    field,
                    error: validationResult.error
                });
            } else {
                let sanitizedValue = value;
                if (fieldSchema.sanitize) {
                    sanitizedValue = this.sanitizeValue(value, fieldSchema.sanitize);
                }
                sanitizedData[field] = sanitizedValue;
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            data: sanitizedData
        };
    }

    // Common validation schemas
    getCommonSchemas() {
        return {
            user: {
                email: {
                    type: 'email',
                    required: true,
                    sanitize: { trim: true, toLowerCase: true }
                },
                password: {
                    type: 'string',
                    required: true,
                    minLength: 8,
                    custom: (value) => {
                        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                            return { valid: false, error: 'Password must contain uppercase, lowercase, and number' };
                        }
                        return { valid: true };
                    }
                },
                username: {
                    type: 'string',
                    required: true,
                    minLength: 3,
                    maxLength: 30,
                    pattern: /^[a-zA-Z0-9_]+$/,
                    sanitize: { trim: true, toLowerCase: true }
                }
            },
            pagination: {
                page: {
                    type: 'number',
                    min: 1,
                    default: 1
                },
                limit: {
                    type: 'number',
                    min: 1,
                    max: 100,
                    default: 10
                }
            }
        };
    }
}

module.exports = new BeamValidator();
