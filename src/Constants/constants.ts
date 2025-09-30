/**
 * routes/index.ts
 * -----------------------------------------------------
 * Central place to define all API route paths & versions.
 * Keeps our routing consistent and future-proof.
 */

export const API_VERSION = 'v1';
export const API_BASE = `/api/${API_VERSION}`;

export const ROUTES = {
  AUTH: {
    ROOT: `${API_BASE}/auth`,
    SIGNUP: '/signup',
    LOGIN: '/login',
    LOGOUT: '/logout',
    EDITOR: '/edit',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    REFRESH_TOKEN: '/refresh-token',
    LISTING_PARAMS: '/listing',
    DETAIL_PARAMS: '/detail',
    GOOGLE_PARAMS: '/google',
    DELETE_PARAMS: '/delete',
  },

  USER: {
    ROOT: `${API_BASE}/users`,
    PROFILE: '/profile',
    UPDATE: '/update',
    DELETE: '/delete',
    LIST: '/list',
  },
  //
  // TEACHERS: {
  //   ROOT: `${API_BASE}/teachers`,
  //   FIND: '/find',
  //   DETAIL: '/:id',
  // },

  UPLOAD: {
    ROOT: `${API_BASE}/upload`,
    IMAGE: '/image',
    DOCUMENT: '/document',
    VIDEO: '/video',
    AUDIO: '/audio',
    MULTIPLE_IMAGES: '/multiple-images',
  },
  SLOTS: {
    ROOT: `${API_BASE}/slots`,
    CREATE: '/create',
    DELETE: '/delete',
    UPDATE: '/update',
    LIST: '/list',
  },
  ADMIN: {
    ROOT: `${API_BASE}/admin`,
    DASHBOARD: '/dashboard',
    USERS: '/users',
  },
  ADMIN_USER_MANAGEMENT: {
    ROOT: `${API_BASE}/admin/users`,
    LIST: "/list", // GET all users
    DETAIL: "/:id", // GET one user
    STATUS: "/:id/status", // PUT block/unblock
    DELETE: "/:id", // DELETE user
    BOOKINGS: "/:id/bookings", // GET bookings by user
    PAYMENTS: "/:id/payments", // GET payments by user
    ACTIVE: "/active", // GET currently active users
    FEEDBACK: "/feedback", // GET feedback from users
    EXPORT: "/export", // GET export CSV/Excel
  },
  TEACHERS: {
    ROOT: `${API_BASE}/teachers`,
    LIST: '/',
    DETAIL: '/:id',
    REVIEWS: '/:id/reviews',
    ADD_REVIEW: '/:id/review',
  },
  EVENTS: {
    ROOT: `${API_BASE}/admin/events`,
    CREATE: '/create',
    UPDATE: '/update',
    DELETE: '/delete',
    LIST: '/list',
    DETAIL: '/detail',
  },
  ADMIN_SESSIONS: {
    ROOT: `${API_BASE}/admin/sessions`,
    LIST: '/',
    DETAIL: '/:id',
    CANCEL: '/:id/cancel',
    ANALYTICS: '/analytics',
  },

  ANALYTICS: {
    ROOT: `${API_BASE}/admin/analytics`,
    OVERVIEW: '/overview',
    USER_GROWTH: '/user-growth',
    TEACHER_PERFORMANCE: '/teacher-performance',
    SUBSCRIPTION_STATS: '/subscription-stats',
    BOOKINGS: '/bookings',
  },
  BOOKINGS: {
    ROOT: `${API_BASE}/bookings`,
    AVAILABLE: '/available',
    CREATE: '/book',
    CANCEL: '/cancel',
    HISTORY:'/history',
  },
};
