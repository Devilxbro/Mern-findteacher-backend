/**
 * routes/index.ts
 * -----------------------------------------------------
 * Central place to define all API route paths & versions.
 * Keeps our routing consistent and future-proof.
 */

export const API_VERSION = "v1";
export const API_BASE = `/api/${API_VERSION}`;

export const ROUTES = {
    AUTH: {
        ROOT: `${API_BASE}/auth`,
        SIGNUP: "/signup",
        LOGIN: "/login",
        LOGOUT: "/logout",
        FORGOT_PASSWORD: "/forgot-password",
        RESET_PASSWORD: "/reset-password",
        REFRESH_TOKEN: "/refresh-token",
        LISTING_PARAMS: "/listing",
        DETAIL_PARAMS: "/detail",
    },

    USER: {
        ROOT: `${API_BASE}/users`,
        PROFILE: "/profile",
        UPDATE: "/update",
        DELETE: "/delete",
        LIST: "/list",
    },

    TEACHERS: {
        ROOT: `${API_BASE}/teachers`,
        FIND: "/find",
        DETAIL: "/:id",
    },

    ADMIN: {
        ROOT: `${API_BASE}/admin`,
        DASHBOARD: "/dashboard",
        USERS: "/users",
    },
  UPLOAD: {
    ROOT: `${API_BASE}/upload`,
    IMAGE: "/image",
    DOCUMENT: "/document",
    VIDEO: "/video",
    AUDIO: "/audio",
    MULTIPLE_IMAGES: "/multiple-images",
  },
};
