/**
 * Main RTK Query API slice definition.
 */

import { createApi } from "@reduxjs/toolkit/query/react";

import { axiosBaseQuery } from "./baseQuery";

/**
 * Tag types for cache invalidation.
 */
export const TAG_TYPES = [
    "Missions",
    "Applications",
    "Assignments",
    "Workers",
    "Institutions",
    "Reviews",
    "Payments",
    "Notifications",
    "Domains",
    "Specialities",
    "Admin",
    "Auth",
    "Conversations",
    "Messages",
] as const;

export type TagType = (typeof TAG_TYPES)[number];

/**
 * Uses a custom Axios base query to leverage global interceptors.
 * Endpoints are injected by domain modules.
 */
export const api = createApi({
    reducerPath: "api",
    baseQuery: axiosBaseQuery,
    tagTypes: TAG_TYPES,
    endpoints: () => ({}),
});

