import {z} from 'zod';

/**
 * Validation schemas for forms across the application
 * Using Zod for runtime type checking and validation
 */

// ============================================================================
// CONTACT FORM
// ============================================================================

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z
    .string()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject must be less than 200 characters'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
  // Honeypot field for spam protection (should be empty)
  honeypot: z.string().max(0).optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// ============================================================================
// NEWSLETTER SIGNUP
// ============================================================================

export const newsletterSignupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  consent: z
    .boolean()
    .refine((val) => val === true, 'You must consent to receive emails'),
  honeypot: z.string().max(0).optional(),
});

export type NewsletterSignupData = z.infer<typeof newsletterSignupSchema>;

// ============================================================================
// AUTHENTICATION
// ============================================================================

export const loginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),
  confirmPassword: z.string(),
  acceptsMarketing: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerFormSchema>;

export const passwordResetRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type PasswordResetRequestData = z.infer<
  typeof passwordResetRequestSchema
>;

export const passwordResetSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type PasswordResetData = z.infer<typeof passwordResetSchema>;

// ============================================================================
// ACCOUNT MANAGEMENT
// ============================================================================

export const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
});

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ['confirmNewPassword'],
});

export type ChangePasswordData = z.infer<typeof changePasswordSchema>;

export const addressFormSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  company: z.string().max(100, 'Company name must be less than 100 characters').optional().or(z.literal('')),
  address1: z
    .string()
    .min(3, 'Address must be at least 3 characters')
    .max(100, 'Address must be less than 100 characters'),
  address2: z.string().max(100, 'Address line 2 must be less than 100 characters').optional().or(z.literal('')),
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be less than 50 characters'),
  country: z.string().min(2, 'Please select a country'),
  province: z.string().min(2, 'Please select a state/province'),
  zip: z
    .string()
    .min(3, 'ZIP/Postal code must be at least 3 characters')
    .max(10, 'ZIP/Postal code must be less than 10 characters'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  isDefault: z.boolean().optional(),
});

export type AddressFormData = z.infer<typeof addressFormSchema>;

// ============================================================================
// ENGRAVING (PRODUCT PERSONALIZATION)
// ============================================================================

export const engravingFormSchema = z.object({
  engravingText: z
    .string()
    .max(50, 'Engraving text must be 50 characters or less')
    .regex(
      /^[a-zA-Z0-9\s\-.'&,]*$/,
      'Engraving can only contain letters, numbers, spaces, and basic punctuation (- . \' & ,)',
    )
    .optional()
    .or(z.literal('')),
  engravingNote: z
    .string()
    .max(200, 'Private note must be 200 characters or less')
    .optional()
    .or(z.literal('')),
  engravingConfirmed: z
    .boolean()
    .refine((val) => val === true, 'You must confirm the engraving is correct'),
});

export type EngravingFormData = z.infer<typeof engravingFormSchema>;

// ============================================================================
// CART ATTRIBUTES
// ============================================================================

export const giftMessageSchema = z.object({
  isGift: z.boolean(),
  giftMessage: z
    .string()
    .max(500, 'Gift message must be 500 characters or less')
    .optional()
    .or(z.literal('')),
  giftRecipientName: z
    .string()
    .max(100, 'Recipient name must be 100 characters or less')
    .optional()
    .or(z.literal('')),
});

export type GiftMessageData = z.infer<typeof giftMessageSchema>;

// ============================================================================
// PRODUCT REVIEWS
// ============================================================================

export const QUALITY_OPTIONS = [
  'Exceptional',
  'As Expected',
  'Below Average',
] as const;

export const reviewFormSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  productHandle: z.string().min(1, 'Product handle is required'),
  rating: z
    .number()
    .int()
    .min(1, 'Please select a rating')
    .max(5, 'Rating must be 5 or less'),
  title: z
    .string()
    .min(2, 'Headline must be at least 2 characters')
    .max(150, 'Headline must be less than 150 characters'),
  body: z
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(5000, 'Review must be less than 5000 characters'),
  quality: z.enum(QUALITY_OPTIONS).optional().or(z.literal('')),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  honeypot: z.string().max(0).optional(),
});

export type ReviewFormData = z.infer<typeof reviewFormSchema>;

// Review photo upload constraints
export const REVIEW_PHOTO_MAX_COUNT = 3;
export const REVIEW_PHOTO_MAX_SIZE = 5 * 1024 * 1024; // 5MB
export const REVIEW_PHOTO_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

/**
 * Validate review photo files (server-side).
 * Returns an error message string, or null if valid.
 */
export function validateReviewPhotos(files: File[]): string | null {
  if (files.length > REVIEW_PHOTO_MAX_COUNT) {
    return `You can upload a maximum of ${REVIEW_PHOTO_MAX_COUNT} photos`;
  }

  for (const file of files) {
    if (!REVIEW_PHOTO_ACCEPTED_TYPES.includes(file.type)) {
      return `"${file.name}" is not a supported image type. Use JPEG, PNG, or WebP.`;
    }
    if (file.size > REVIEW_PHOTO_MAX_SIZE) {
      return `"${file.name}" exceeds the 5 MB size limit`;
    }
  }

  return null;
}

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Validates a field and returns an error message if invalid
 * Useful for inline validation
 */
export function validateField<T>(
  schema: z.ZodSchema<T>,
  value: unknown,
): string | null {
  const result = schema.safeParse(value);
  if (!result.success) {
    return result.error.issues[0]?.message || 'Invalid input';
  }
  return null;
}

/**
 * Format Zod validation errors for form display
 */
export function formatZodErrors(
  error: z.ZodError,
): Record<string, string | undefined> {
  const fieldErrors: Record<string, string | undefined> = {};
  error.issues.forEach((err) => {
    const path = err.path.join('.');
    if (path) {
      fieldErrors[path] = err.message;
    }
  });
  return fieldErrors;
}
