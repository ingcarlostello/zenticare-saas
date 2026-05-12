/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as appointmentReminders from "../appointmentReminders.js";
import type * as appointments from "../appointments.js";
import type * as chat from "../chat.js";
import type * as constants from "../constants.js";
import type * as googleCalendarActions from "../googleCalendarActions.js";
import type * as googleCalendarEvents from "../googleCalendarEvents.js";
import type * as googleCalendarTokens from "../googleCalendarTokens.js";
import type * as http from "../http.js";
import type * as i18n from "../i18n.js";
import type * as lib_encryption from "../lib/encryption.js";
import type * as lib_featureAccess from "../lib/featureAccess.js";
import type * as lib_googleApiParser from "../lib/googleApiParser.js";
import type * as paddle from "../paddle.js";
import type * as paddle_routes from "../paddle_routes.js";
import type * as patients from "../patients.js";
import type * as plans from "../plans.js";
import type * as schedules from "../schedules.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  appointmentReminders: typeof appointmentReminders;
  appointments: typeof appointments;
  chat: typeof chat;
  constants: typeof constants;
  googleCalendarActions: typeof googleCalendarActions;
  googleCalendarEvents: typeof googleCalendarEvents;
  googleCalendarTokens: typeof googleCalendarTokens;
  http: typeof http;
  i18n: typeof i18n;
  "lib/encryption": typeof lib_encryption;
  "lib/featureAccess": typeof lib_featureAccess;
  "lib/googleApiParser": typeof lib_googleApiParser;
  paddle: typeof paddle;
  paddle_routes: typeof paddle_routes;
  patients: typeof patients;
  plans: typeof plans;
  schedules: typeof schedules;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
