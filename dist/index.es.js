import { jsxs as Oe, jsx as F, Fragment as jn } from "react/jsx-runtime";
import * as Ht from "react";
import { useState as Le, useEffect as ht, useRef as Wo, useCallback as qo } from "react";
import { Box as ve, Typography as tt, Button as gt, CircularProgress as Hn, SvgIcon as zo, Alert as Vn, Stack as Wn, TextField as Ko } from "@mui/material";
import { Fingerprint as Yo, Google as Go, MailOutline as Jo } from "@mui/icons-material";
import { ThemeContext as Xo } from "@emotion/react";
import { appendErrors as Qo, useForm as Zo } from "react-hook-form";
import { validateFieldsNatively as es, toNestErrors as ts } from "@hookform/resolvers";
import * as Wr from "yup";
function Ae(e) {
  const t = new Uint8Array(e);
  let r = "";
  for (const o of t)
    r += String.fromCharCode(o);
  return btoa(r).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function Bt(e) {
  const t = e.replace(/-/g, "+").replace(/_/g, "/"), r = (4 - t.length % 4) % 4, n = t.padEnd(t.length + r, "="), o = atob(n), s = new ArrayBuffer(o.length), i = new Uint8Array(s);
  for (let a = 0; a < o.length; a++)
    i[a] = o.charCodeAt(a);
  return s;
}
function St() {
  return rs.stubThis(globalThis?.PublicKeyCredential !== void 0 && typeof globalThis.PublicKeyCredential == "function");
}
const rs = {
  stubThis: (e) => e
};
function qn(e) {
  const { id: t } = e;
  return {
    ...e,
    id: Bt(t),
    transports: e.transports,
    type: e.type
  };
}
function zn(e) {
  return (
    // Consider localhost valid as well since it's okay wrt Secure Contexts
    e === "localhost" || // Support punycode (ACE) or ascii labels and domains
    /^((xn--[a-z0-9-]+|[a-z0-9]+(-[a-z0-9]+)*)\.)+([a-z]{2,}|xn--[a-z0-9-]+)$/i.test(e)
  );
}
class fe extends Error {
  constructor({ message: t, code: r, cause: n, name: o }) {
    super(t, { cause: n }), Object.defineProperty(this, "code", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: void 0
    }), this.name = o ?? n.name, this.code = r;
  }
}
function ns({ error: e, options: t }) {
  const { publicKey: r } = t;
  if (!r)
    throw Error("options was missing required publicKey property");
  if (e.name === "AbortError") {
    if (t.signal instanceof AbortSignal)
      return new fe({
        message: "Registration ceremony was sent an abort signal",
        code: "ERROR_CEREMONY_ABORTED",
        cause: e
      });
  } else if (e.name === "ConstraintError") {
    if (r.authenticatorSelection?.requireResidentKey === !0)
      return new fe({
        message: "Discoverable credentials were required but no available authenticator supported it",
        code: "ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT",
        cause: e
      });
    if (
      // @ts-ignore: `mediation` doesn't yet exist on CredentialCreationOptions but it's possible as of Sept 2024
      t.mediation === "conditional" && r.authenticatorSelection?.userVerification === "required"
    )
      return new fe({
        message: "User verification was required during automatic registration but it could not be performed",
        code: "ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE",
        cause: e
      });
    if (r.authenticatorSelection?.userVerification === "required")
      return new fe({
        message: "User verification was required but no available authenticator supported it",
        code: "ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT",
        cause: e
      });
  } else {
    if (e.name === "InvalidStateError")
      return new fe({
        message: "The authenticator was previously registered",
        code: "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED",
        cause: e
      });
    if (e.name === "NotAllowedError")
      return new fe({
        message: e.message,
        code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
        cause: e
      });
    if (e.name === "NotSupportedError")
      return r.pubKeyCredParams.filter((o) => o.type === "public-key").length === 0 ? new fe({
        message: 'No entry in pubKeyCredParams was of type "public-key"',
        code: "ERROR_MALFORMED_PUBKEYCREDPARAMS",
        cause: e
      }) : new fe({
        message: "No available authenticator supported any of the specified pubKeyCredParams algorithms",
        code: "ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG",
        cause: e
      });
    if (e.name === "SecurityError") {
      const n = globalThis.location.hostname;
      if (zn(n)) {
        if (r.rp.id !== n)
          return new fe({
            message: `The RP ID "${r.rp.id}" is invalid for this domain`,
            code: "ERROR_INVALID_RP_ID",
            cause: e
          });
      } else return new fe({
        message: `${globalThis.location.hostname} is an invalid domain`,
        code: "ERROR_INVALID_DOMAIN",
        cause: e
      });
    } else if (e.name === "TypeError") {
      if (r.user.id.byteLength < 1 || r.user.id.byteLength > 64)
        return new fe({
          message: "User ID was not between 1 and 64 characters",
          code: "ERROR_INVALID_USER_ID_LENGTH",
          cause: e
        });
    } else if (e.name === "UnknownError")
      return new fe({
        message: "The authenticator was unable to process the specified options, or could not create a new credential",
        code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
        cause: e
      });
  }
  return e;
}
class os {
  constructor() {
    Object.defineProperty(this, "controller", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: void 0
    });
  }
  createNewAbortSignal() {
    if (this.controller) {
      const r = new Error("Cancelling existing WebAuthn API call for new one");
      r.name = "AbortError", this.controller.abort(r);
    }
    const t = new AbortController();
    return this.controller = t, t.signal;
  }
  cancelCeremony() {
    if (this.controller) {
      const t = new Error("Manually cancelling existing WebAuthn API call");
      t.name = "AbortError", this.controller.abort(t), this.controller = void 0;
    }
  }
}
const Kn = new os(), ss = ["cross-platform", "platform"];
function Yn(e) {
  if (e && !(ss.indexOf(e) < 0))
    return e;
}
async function is(e) {
  !e.optionsJSON && e.challenge && (console.warn("startRegistration() was not called correctly. It will try to continue with the provided options, but this call should be refactored to use the expected call structure instead. See https://simplewebauthn.dev/docs/packages/browser#typeerror-cannot-read-properties-of-undefined-reading-challenge for more information."), e = { optionsJSON: e });
  const { optionsJSON: t, useAutoRegister: r = !1 } = e;
  if (!St())
    throw new Error("WebAuthn is not supported in this browser");
  const n = {
    ...t,
    challenge: Bt(t.challenge),
    user: {
      ...t.user,
      id: Bt(t.user.id)
    },
    excludeCredentials: t.excludeCredentials?.map(qn)
  }, o = {};
  r && (o.mediation = "conditional"), o.publicKey = n, o.signal = Kn.createNewAbortSignal();
  let s;
  try {
    s = await navigator.credentials.create(
      // TODO: Newer versions of Deno require this casting, revisit once we're using Deno 2.6+
      o
    );
  } catch (y) {
    throw ns({ error: y, options: o });
  }
  if (!s)
    throw new Error("Registration was not completed");
  const { id: i, rawId: a, response: c, type: f } = s;
  let u;
  typeof c.getTransports == "function" && (u = c.getTransports());
  let p;
  if (typeof c.getPublicKeyAlgorithm == "function")
    try {
      p = c.getPublicKeyAlgorithm();
    } catch (y) {
      ar("getPublicKeyAlgorithm()", y);
    }
  let m;
  if (typeof c.getPublicKey == "function")
    try {
      const y = c.getPublicKey();
      y !== null && (m = Ae(y));
    } catch (y) {
      ar("getPublicKey()", y);
    }
  let E;
  if (typeof c.getAuthenticatorData == "function")
    try {
      E = Ae(c.getAuthenticatorData());
    } catch (y) {
      ar("getAuthenticatorData()", y);
    }
  return {
    id: i,
    rawId: Ae(a),
    response: {
      attestationObject: Ae(c.attestationObject),
      clientDataJSON: Ae(c.clientDataJSON),
      transports: u,
      publicKeyAlgorithm: p,
      publicKey: m,
      authenticatorData: E
    },
    type: f,
    clientExtensionResults: s.getClientExtensionResults(),
    authenticatorAttachment: Yn(s.authenticatorAttachment)
  };
}
function ar(e, t) {
  console.warn(`The browser extension that intercepted this WebAuthn API call incorrectly implemented ${e}. You should report this error to them.
`, t);
}
function as() {
  if (!St())
    return cr.stubThis(new Promise((t) => t(!1)));
  const e = globalThis.PublicKeyCredential;
  return e?.isConditionalMediationAvailable === void 0 ? cr.stubThis(new Promise((t) => t(!1))) : cr.stubThis(e.isConditionalMediationAvailable());
}
const cr = {
  stubThis: (e) => e
};
function cs({ error: e, options: t }) {
  const { publicKey: r } = t;
  if (!r)
    throw Error("options was missing required publicKey property");
  if (e.name === "AbortError") {
    if (t.signal instanceof AbortSignal)
      return new fe({
        message: "Authentication ceremony was sent an abort signal",
        code: "ERROR_CEREMONY_ABORTED",
        cause: e
      });
  } else {
    if (e.name === "NotAllowedError")
      return new fe({
        message: e.message,
        code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
        cause: e
      });
    if (e.name === "SecurityError") {
      const n = globalThis.location.hostname;
      if (zn(n)) {
        if (r.rpId !== n)
          return new fe({
            message: `The RP ID "${r.rpId}" is invalid for this domain`,
            code: "ERROR_INVALID_RP_ID",
            cause: e
          });
      } else return new fe({
        message: `${globalThis.location.hostname} is an invalid domain`,
        code: "ERROR_INVALID_DOMAIN",
        cause: e
      });
    } else if (e.name === "UnknownError")
      return new fe({
        message: "The authenticator was unable to process the specified options, or could not create a new assertion signature",
        code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
        cause: e
      });
  }
  return e;
}
async function ls(e) {
  !e.optionsJSON && e.challenge && (console.warn("startAuthentication() was not called correctly. It will try to continue with the provided options, but this call should be refactored to use the expected call structure instead. See https://simplewebauthn.dev/docs/packages/browser#typeerror-cannot-read-properties-of-undefined-reading-challenge for more information."), e = { optionsJSON: e });
  const { optionsJSON: t, useBrowserAutofill: r = !1, verifyBrowserAutofillInput: n = !0 } = e;
  if (!St())
    throw new Error("WebAuthn is not supported in this browser");
  let o;
  t.allowCredentials?.length !== 0 && (o = t.allowCredentials?.map(qn));
  const s = {
    ...t,
    challenge: Bt(t.challenge),
    allowCredentials: o
  }, i = {};
  if (r) {
    if (!await as())
      throw Error("Browser does not support WebAuthn autofill");
    if (document.querySelectorAll("input[autocomplete$='webauthn']").length < 1 && n)
      throw Error('No <input> with "webauthn" as the only or last value in its `autocomplete` attribute was detected');
    i.mediation = "conditional", s.allowCredentials = [];
  }
  i.publicKey = s, i.signal = Kn.createNewAbortSignal();
  let a;
  try {
    a = await navigator.credentials.get(
      // TODO: Newer versions of Deno require this casting, revisit once we're using Deno 2.6+
      i
    );
  } catch (E) {
    throw cs({ error: E, options: i });
  }
  if (!a)
    throw new Error("Authentication was not completed");
  const { id: c, rawId: f, response: u, type: p } = a;
  let m;
  return u.userHandle && (m = Ae(u.userHandle)), {
    id: c,
    rawId: Ae(f),
    response: {
      authenticatorData: Ae(u.authenticatorData),
      clientDataJSON: Ae(u.clientDataJSON),
      signature: Ae(u.signature),
      userHandle: m
    },
    type: p,
    clientExtensionResults: a.getClientExtensionResults(),
    authenticatorAttachment: Yn(a.authenticatorAttachment)
  };
}
const us = () => ({
  // Company branding
  companyName: "Lumora",
  tagline: "Secure authentication made simple",
  // Visual styling
  primaryColor: "#1976d2",
  secondaryColor: "#42a5f5",
  backgroundColor: "#ffffff",
  textColor: "#333333",
  // Text on filled buttons, which are drawn in primaryColor. Set, not left to the host theme's
  // contrastText, which could be dark text on a dark brand colour.
  buttonTextColor: "#ffffff",
  // Logo configuration
  logoHeight: 48,
  logo: "https://via.placeholder.com/200x80/1976d2/ffffff?text=Lumora",
  // Magic link messaging
  magicLinkTitle: "Sign In with Email",
  magicLinkDescription: "Enter your email address and we will send you a secure, one-time link to sign in. No password needed.",
  magicLinkSuccessTitle: "Check Your Inbox",
  // Sent only to an active account, and the API answers the same either way so the form cannot
  // reveal who has one: say so, rather than promising an email that may never come.
  magicLinkSuccessDescription: "If this email address belongs to an active account, we have sent it a sign-in link. The link works once and expires shortly. Nothing arrived? Check your spam folder, or contact your administrator."
}), fs = (e) => ({
  ...us(),
  ...e
}), ds = ["google-loading", "microsoft-loading", "passkey-loading"], ps = (e) => ds.includes(e), xe = {
  /**
   * Get the access token from localStorage
   * @returns The access token or null if not found
   */
  getAccessToken: () => localStorage.getItem("lumora_access_token"),
  /**
   * Get the refresh token from localStorage
   * @returns The refresh token or null if not found
   */
  getRefreshToken: () => localStorage.getItem("lumora_refresh_token"),
  /**
   * Store both access and refresh tokens in localStorage
   * @param accessToken - The access token to store
   * @param refreshToken - The refresh token to store
   */
  setTokens: (e, t) => {
    localStorage.setItem("lumora_access_token", e), localStorage.setItem("lumora_refresh_token", t);
  },
  /**
   * Clear all authentication tokens from localStorage
   */
  clearTokens: () => {
    localStorage.removeItem("lumora_access_token"), localStorage.removeItem("lumora_refresh_token");
  },
  /**
   * Check if both tokens are present in localStorage
   * @returns True if both tokens exist, false otherwise
   */
  hasTokens: () => !!(xe.getAccessToken() && xe.getRefreshToken())
}, le = {
  // Default API endpoints
  ENDPOINTS: {
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    GOOGLE_AUTH: "/auth/google",
    GOOGLE_CALLBACK: "/auth/google/callback",
    MICROSOFT_AUTH: "/auth/microsoft",
    MAGIC_LINK_REQUEST: "/auth/magic-link",
    MAGIC_LINK_VERIFY: "/auth/magic-link/verify",
    PASSKEY_LOGIN_OPTIONS: "/auth/passkey/login/options",
    PASSKEY_LOGIN_VERIFY: "/auth/passkey/login/verify",
    PASSKEY_REGISTER_OPTIONS: "/auth/passkey/register/options",
    PASSKEY_REGISTER_VERIFY: "/auth/passkey/register/verify",
    // The Lumora API has no /users/me: /users/:id would read "me" as an id and answer 404
    USER_ME: "/auth/me"
  },
  // Token storage keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: "lumora_access_token",
    REFRESH_TOKEN: "lumora_refresh_token"
  },
  // Default API configuration
  DEFAULT_CONFIG: {
    API_BASE_URL: "https://dev.api.lumora.capital",
    TIMEOUT: 1e4,
    // 10 seconds
    RETRY_ATTEMPTS: 1
  },
  // HTTP status codes
  STATUS_CODES: {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
  }
}, hs = {
  NO_ACCESS_TOKEN: "No access token available",
  NO_REFRESH_TOKEN: "No refresh token available",
  TOKEN_REFRESH_FAILED: "Token refresh failed",
  API_REQUEST_FAILED: "API request failed",
  NETWORK_ERROR: "Network error occurred",
  INVALID_CREDENTIALS: "Invalid credentials",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access forbidden",
  NOT_FOUND: "Resource not found",
  INTERNAL_ERROR: "Internal server error"
};
function Gn(e, t) {
  return function() {
    return e.apply(t, arguments);
  };
}
const { toString: ms } = Object.prototype, { getPrototypeOf: Ue } = Object, { iterator: wt, toStringTag: Jn } = Symbol, yt = (({ hasOwnProperty: e }) => (t, r) => e.call(t, r))(Object.prototype), Xn = (e) => typeof e == "string" && (e === "__proto__" || e === "constructor" || e === "prototype"), Qn = (e, t, r) => e === Object.prototype || !r && t === null, gs = (e) => {
  if (!Object.isExtensible(e))
    return !1;
  const t = Object.getOwnPropertyNames(e);
  return Object.getOwnPropertySymbols && t.push(...Object.getOwnPropertySymbols(e)), t.every((r) => {
    if (Xn(r))
      return !1;
    const n = Object.getOwnPropertyDescriptor(e, r);
    return !!n && n.configurable && n.writable === !0;
  });
}, bt = (e, t) => {
  let r = e;
  const n = [];
  for (; r != null; ) {
    if (n.indexOf(r) !== -1)
      return !1;
    n.push(r);
    const o = Ue(r);
    if (Qn(r, o, r === e))
      return !1;
    if (yt(r, t))
      return !0;
    r = o;
  }
  return !1;
}, ys = (e, t) => e != null && bt(e, t) ? e[t] : void 0, bs = (e) => {
  if (e == null || typeof e != "object" && typeof e != "function")
    return e;
  const t = Ue(e);
  if (t === null && gs(e))
    return e;
  const r = /* @__PURE__ */ Object.create(null), n = /* @__PURE__ */ Object.create(null), o = [];
  let s = e;
  for (; s != null && o.indexOf(s) === -1; ) {
    o.push(s);
    const i = s === e ? t : Ue(s);
    if (Qn(s, i, s === e))
      break;
    const a = Object.getOwnPropertyNames(s);
    Object.getOwnPropertySymbols && a.push(...Object.getOwnPropertySymbols(s));
    for (const c of a)
      Xn(c) || yt(n, c) || (r[c] = e[c], n[c] = !0);
    s = i;
  }
  return r;
}, kr = /* @__PURE__ */ ((e) => (t) => {
  const r = ms.call(t);
  return e[r] || (e[r] = r.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), Te = (e) => (e = e.toLowerCase(), (t) => kr(t) === e), Vt = (e) => (t) => typeof t === e, { isArray: qe } = Array, ze = Vt("undefined");
function rt(e) {
  return e !== null && !ze(e) && e.constructor !== null && !ze(e.constructor) && be(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}
const Zn = Te("ArrayBuffer");
function Es(e) {
  let t;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? t = ArrayBuffer.isView(e) : t = e && e.buffer && Zn(e.buffer), t;
}
const Ss = Vt("string"), be = Vt("function"), eo = Vt("number"), nt = (e) => e !== null && typeof e == "object", ws = (e) => e === !0 || e === !1, $t = (e) => {
  if (!nt(e))
    return !1;
  const t = Ue(e);
  return (t === null || t === Object.prototype || Ue(t) === null) && // Treat safe own/inherited Symbol.toStringTag or Symbol.iterator members as
  // evidence the value is tagged/iterable, while ignoring members reachable
  // only through shared or terminal prototype boundaries.
  !bt(e, Jn) && !bt(e, wt);
}, Ts = (e) => {
  if (!nt(e) || rt(e))
    return !1;
  try {
    return Object.keys(e).length === 0 && Object.getPrototypeOf(e) === Object.prototype;
  } catch {
    return !1;
  }
}, Rs = Te("Date"), Os = Te("File"), Cs = (e) => !!(e && typeof e.uri < "u"), _s = (e) => e && typeof e.getParts < "u", As = Te("Blob"), xs = Te("FileList"), vs = Te("Set"), Ps = (e) => nt(e) && be(e.pipe);
function ks() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
}
const qr = ks(), zr = typeof qr.FormData < "u" ? qr.FormData : void 0, Ns = (e) => {
  if (!e) return !1;
  if (zr && e instanceof zr) return !0;
  const t = Ue(e);
  if (!t || t === Object.prototype || !be(e.append)) return !1;
  const r = kr(e);
  return r === "formdata" || // detect form-data instance
  r === "object" && be(e.toString) && e.toString() === "[object FormData]";
}, Is = Te("URLSearchParams"), [$s, Ds, Ls, Us] = [
  "ReadableStream",
  "Request",
  "Response",
  "Headers"
].map(Te), Bs = (e) => e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function Tt(e, t, { allOwnKeys: r = !1 } = {}) {
  if (e === null || typeof e > "u")
    return;
  let n, o;
  if (typeof e != "object" && (e = [e]), qe(e))
    for (n = 0, o = e.length; n < o; n++)
      t.call(null, e[n], n, e);
  else {
    if (rt(e))
      return;
    const s = r ? Object.getOwnPropertyNames(e) : Object.keys(e), i = s.length;
    let a;
    for (n = 0; n < i; n++)
      a = s[n], t.call(null, e[a], a, e);
  }
}
function to(e, t) {
  if (rt(e))
    return null;
  t = t.toLowerCase();
  const r = Object.keys(e);
  let n = r.length, o;
  for (; n-- > 0; )
    if (o = r[n], t === o.toLowerCase())
      return o;
  return null;
}
const Ve = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, ro = (e) => !ze(e) && e !== Ve;
function Cr(...e) {
  const { caseless: t, skipUndefined: r } = ro(this) && this || {}, n = {}, o = (s, i) => {
    if (i === "__proto__" || i === "constructor" || i === "prototype")
      return;
    const a = t && typeof i == "string" && to(n, i) || i, c = yt(n, a) ? n[a] : void 0;
    $t(c) && $t(s) ? n[a] = Cr(c, s) : $t(s) ? n[a] = Cr({}, s) : qe(s) ? n[a] = s.slice() : (!r || !ze(s)) && (n[a] = s);
  };
  for (let s = 0, i = e.length; s < i; s++) {
    const a = e[s];
    if (!a || rt(a) || (Tt(a, o), typeof a != "object" || qe(a)))
      continue;
    const c = Object.getOwnPropertySymbols(a);
    for (let f = 0; f < c.length; f++) {
      const u = c[f];
      Js.call(a, u) && o(a[u], u);
    }
  }
  return n;
}
const Fs = (e, t, r, { allOwnKeys: n } = {}) => (Tt(
  t,
  (o, s) => {
    r && be(o) ? Object.defineProperty(e, s, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot
      // hijack defineProperty's accessor-vs-data resolution.
      __proto__: null,
      value: Gn(o, r),
      writable: !0,
      enumerable: !0,
      configurable: !0
    }) : Object.defineProperty(e, s, {
      __proto__: null,
      value: o,
      writable: !0,
      enumerable: !0,
      configurable: !0
    });
  },
  { allOwnKeys: n }
), e), Ms = (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e), js = (e, t, r, n) => {
  e.prototype = Object.create(t.prototype, n), Object.defineProperty(e.prototype, "constructor", {
    __proto__: null,
    value: e,
    writable: !0,
    enumerable: !1,
    configurable: !0
  }), Object.defineProperty(e, "super", {
    __proto__: null,
    value: t.prototype
  }), r && Object.assign(e.prototype, r);
}, Hs = (e, t, r, n) => {
  let o, s, i;
  const a = {};
  if (t = t || {}, e == null) return t;
  do {
    for (o = Object.getOwnPropertyNames(e), s = o.length; s-- > 0; )
      i = o[s], (!n || n(i, e, t)) && !a[i] && (t[i] = e[i], a[i] = !0);
    e = r !== !1 && Ue(e);
  } while (e && (!r || r(e, t)) && e !== Object.prototype);
  return t;
}, Vs = (e, t, r) => {
  e = String(e), (r === void 0 || r > e.length) && (r = e.length), r -= t.length;
  const n = e.indexOf(t, r);
  return n !== -1 && n === r;
}, Ws = (e) => {
  if (!e) return null;
  if (qe(e)) return e;
  let t = e.length;
  if (!eo(t)) return null;
  const r = new Array(t);
  for (; t-- > 0; )
    r[t] = e[t];
  return r;
}, qs = /* @__PURE__ */ ((e) => (t) => e && t instanceof e)(typeof Uint8Array < "u" && Ue(Uint8Array)), zs = (e, t) => {
  const n = (e && e[wt]).call(e);
  let o;
  for (; (o = n.next()) && !o.done; ) {
    const s = o.value;
    t.call(e, s[0], s[1]);
  }
}, Ks = (e, t) => {
  let r;
  const n = [];
  for (; (r = e.exec(t)) !== null; )
    n.push(r);
  return n;
}, Ys = Te("HTMLFormElement"), Gs = (e) => e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function(r, n, o) {
  return n.toUpperCase() + o;
}), { propertyIsEnumerable: Js } = Object.prototype, Xs = Te("RegExp"), no = (e, t) => {
  const r = Object.getOwnPropertyDescriptors(e), n = {};
  Tt(r, (o, s) => {
    let i;
    (i = t(o, s, e)) !== !1 && (n[s] = i || o);
  }), Object.defineProperties(e, n);
}, Qs = (e) => {
  no(e, (t, r) => {
    if (be(e) && ["arguments", "caller", "callee"].includes(r))
      return !1;
    const n = e[r];
    if (be(n)) {
      if (t.enumerable = !1, "writable" in t) {
        t.writable = !1;
        return;
      }
      t.set || (t.set = () => {
        throw Error("Can not rewrite read-only method '" + r + "'");
      });
    }
  });
}, Zs = (e, t) => {
  const r = {}, n = (o) => {
    o.forEach((s) => {
      r[s] = !0;
    });
  };
  return qe(e) ? n(e) : n(String(e).split(t)), r;
}, ei = () => {
}, ti = (e, t) => e != null && Number.isFinite(e = +e) ? e : t;
function ri(e) {
  return !!(e && be(e.append) && e[Jn] === "FormData" && e[wt]);
}
const ni = (e) => {
  const t = /* @__PURE__ */ new WeakSet(), r = (n) => {
    if (nt(n)) {
      if (t.has(n))
        return;
      if (rt(n))
        return n;
      if (!("toJSON" in n)) {
        t.add(n);
        let o;
        if (vs(n)) {
          o = [];
          for (const s of n) {
            const i = r(s);
            !ze(i) && o.push(i);
          }
        } else
          o = qe(n) ? [] : {}, Tt(n, (s, i) => {
            const a = r(s);
            !ze(a) && (o[i] = a);
          });
        return t.delete(n), o;
      }
    }
    return n;
  };
  return r(e);
}, oi = Te("AsyncFunction"), si = (e) => e && (nt(e) || be(e)) && be(e.then) && be(e.catch), oo = ((e, t) => e ? setImmediate : t ? ((r, n) => (Ve.addEventListener(
  "message",
  ({ source: o, data: s }) => {
    o === Ve && s === r && n.length && n.shift()();
  },
  !1
), (o) => {
  n.push(o), Ve.postMessage(r, "*");
}))(`axios@${Math.random()}`, []) : (r) => setTimeout(r))(typeof setImmediate == "function", be(Ve.postMessage)), ii = typeof queueMicrotask < "u" ? queueMicrotask.bind(Ve) : typeof process < "u" && process.nextTick || oo, so = (e) => e != null && be(e[wt]), ai = (e) => e != null && bt(e, wt) && so(e), d = {
  isArray: qe,
  isArrayBuffer: Zn,
  isBuffer: rt,
  isFormData: Ns,
  isArrayBufferView: Es,
  isString: Ss,
  isNumber: eo,
  isBoolean: ws,
  isObject: nt,
  isPlainObject: $t,
  isEmptyObject: Ts,
  isReadableStream: $s,
  isRequest: Ds,
  isResponse: Ls,
  isHeaders: Us,
  isUndefined: ze,
  isDate: Rs,
  isFile: Os,
  isReactNativeBlob: Cs,
  isReactNative: _s,
  isBlob: As,
  isRegExp: Xs,
  isFunction: be,
  isStream: Ps,
  isURLSearchParams: Is,
  isTypedArray: qs,
  isFileList: xs,
  forEach: Tt,
  merge: Cr,
  extend: Fs,
  trim: Bs,
  stripBOM: Ms,
  inherits: js,
  toFlatObject: Hs,
  kindOf: kr,
  kindOfTest: Te,
  endsWith: Vs,
  toArray: Ws,
  forEachEntry: zs,
  matchAll: Ks,
  isHTMLForm: Ys,
  hasOwnProperty: yt,
  hasOwnProp: yt,
  // an alias to avoid ESLint no-prototype-builtins detection
  hasOwnInPrototypeChain: bt,
  getSafeProp: ys,
  toSafeFlatObject: bs,
  reduceDescriptors: no,
  freezeMethods: Qs,
  toObjectSet: Zs,
  toCamelCase: Gs,
  noop: ei,
  toFiniteNumber: ti,
  findKey: to,
  global: Ve,
  isContextDefined: ro,
  isSpecCompliantForm: ri,
  toJSONObject: ni,
  isAsyncFn: oi,
  isThenable: si,
  setImmediate: oo,
  asap: ii,
  isIterable: so,
  isSafeIterable: ai
}, ci = d.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]), li = (e) => {
  const t = {};
  let r, n, o;
  return e && e.split(`
`).forEach(function(i) {
    o = i.indexOf(":"), r = i.substring(0, o).trim().toLowerCase(), n = i.substring(o + 1).trim();
    const a = d.hasOwnProp(t, r);
    !r || a && d.hasOwnProp(ci, r) || (r === "set-cookie" ? a ? t[r].push(n) : t[r] = [n] : t[r] = a ? t[r] + ", " + n : n);
  }), t;
};
function ui(e) {
  let t = 0, r = e.length;
  for (; t < r; ) {
    const n = e.charCodeAt(t);
    if (n !== 9 && n !== 32)
      break;
    t += 1;
  }
  for (; r > t; ) {
    const n = e.charCodeAt(r - 1);
    if (n !== 9 && n !== 32)
      break;
    r -= 1;
  }
  return t === 0 && r === e.length ? e : e.slice(t, r);
}
const fi = new RegExp("[\\u0000-\\u0008\\u000a-\\u001f\\u007f]+", "g"), di = new RegExp("[^\\u0009\\u0020-\\u007e\\u0080-\\u00ff]+", "g");
function Nr(e, t) {
  return d.isArray(e) ? e.map((r) => Nr(r, t)) : ui(String(e).replace(t, ""));
}
const pi = (e) => Nr(e, fi), hi = (e) => Nr(e, di);
function io(e) {
  const t = /* @__PURE__ */ Object.create(null);
  return d.forEach(e.toJSON(), (r, n) => {
    t[n] = hi(r);
  }), t;
}
const Kr = /* @__PURE__ */ Symbol("internals");
function at(e) {
  return e && String(e).trim().toLowerCase();
}
function Dt(e) {
  return e === !1 || e == null ? e : d.isArray(e) ? e.map(Dt) : pi(String(e));
}
function mi(e) {
  const t = /* @__PURE__ */ Object.create(null), r = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let n;
  for (; n = r.exec(e); )
    t[n[1]] = n[2];
  return t;
}
const gi = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
function lr(e) {
  let t = 0, r = e.length;
  for (; t < r; ) {
    const n = e.charCodeAt(t);
    if (n !== 9 && n !== 32)
      break;
    t += 1;
  }
  for (; r > t; ) {
    const n = e.charCodeAt(r - 1);
    if (n !== 9 && n !== 32)
      break;
    r -= 1;
  }
  return t === 0 && r === e.length ? e : e.slice(t, r);
}
function yi(e) {
  const t = e.length - 1;
  if (t < 1 || e.charCodeAt(0) !== 34 || e.charCodeAt(t) !== 34)
    return e;
  let r = "";
  for (let n = 1; n < t; n++) {
    const o = e.charCodeAt(n);
    if (o === 34 || o === 92 && (n += 1, n >= t))
      return e;
    r += e[n];
  }
  return r;
}
function bi(e) {
  const t = /* @__PURE__ */ Object.create(null), r = String(e);
  let n = 0, o = !1, s = !1;
  function i(a) {
    const c = lr(r.slice(n, a)), f = c.indexOf("=");
    if (f < 1)
      return;
    const u = lr(c.slice(0, f));
    if (!gi.test(u))
      return;
    const p = u.toLowerCase();
    if (p === "__proto__" || p === "constructor" || p === "prototype")
      return;
    const m = lr(c.slice(f + 1));
    t[p] = yi(m);
  }
  for (let a = 0; a < r.length; a++) {
    const c = r.charCodeAt(a);
    o ? s ? s = !1 : c === 92 ? s = !0 : c === 34 && (o = !1) : c === 34 ? o = !0 : (c === 44 || c === 59) && (i(a), n = a + 1);
  }
  return i(r.length), t;
}
const Ei = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
function ur(e, t, r, n, o) {
  if (d.isFunction(n))
    return n.call(this, t, r);
  if (o && (t = r), !!d.isString(t)) {
    if (d.isString(n))
      return t.indexOf(n) !== -1;
    if (d.isRegExp(n))
      return n.test(t);
  }
}
function Si(e) {
  return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (t, r, n) => r.toUpperCase() + n);
}
function wi(e, t) {
  const r = d.toCamelCase(" " + t);
  ["get", "set", "has"].forEach((n) => {
    Object.defineProperty(e, n + r, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot turn
      // this data descriptor into an accessor descriptor on the way in.
      __proto__: null,
      value: function(o, s, i) {
        return this[n].call(this, t, o, s, i);
      },
      configurable: !0
    });
  });
}
let me = class {
  constructor(t) {
    t && this.set(t);
  }
  set(t, r, n) {
    const o = this;
    function s(a, c, f) {
      const u = at(c);
      if (!u)
        return;
      const p = d.findKey(o, u);
      (!p || o[p] === void 0 || f === !0 || f === void 0 && o[p] !== !1) && (o[p || c] = Dt(a));
    }
    const i = (a, c) => d.forEach(a, (f, u) => s(f, u, c));
    if (d.isPlainObject(t) || t instanceof this.constructor)
      i(t, r);
    else if (d.isString(t) && (t = t.trim()) && !Ei(t))
      i(li(t), r);
    else if (d.isObject(t) && d.isSafeIterable(t)) {
      let a = /* @__PURE__ */ Object.create(null), c, f;
      for (const u of t) {
        if (!d.isArray(u))
          throw new TypeError("Object iterator must return a key-value pair");
        f = u[0], d.hasOwnProp(a, f) ? (c = a[f], a[f] = d.isArray(c) ? [...c, u[1]] : [c, u[1]]) : a[f] = u[1];
      }
      i(a, r);
    } else
      t != null && s(r, t, n);
    return this;
  }
  get(t, r) {
    if (t = at(t), t) {
      const n = d.findKey(this, t);
      if (n) {
        const o = this[n];
        if (!r)
          return o;
        if (r === !0)
          return mi(o);
        if (d.isFunction(r))
          return r.call(this, o, n);
        if (d.isRegExp(r))
          return r.exec(o);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(t, r) {
    if (t = at(t), t) {
      const n = d.findKey(this, t);
      return !!(n && this[n] !== void 0 && (!r || ur(this, this[n], n, r)));
    }
    return !1;
  }
  delete(t, r) {
    const n = this;
    let o = !1;
    function s(i) {
      if (i = at(i), i) {
        const a = d.findKey(n, i);
        a && (!r || ur(n, n[a], a, r)) && (delete n[a], o = !0);
      }
    }
    return d.isArray(t) ? t.forEach(s) : s(t), o;
  }
  clear(t) {
    const r = Object.keys(this);
    let n = r.length, o = !1;
    for (; n--; ) {
      const s = r[n];
      (!t || ur(this, this[s], s, t, !0)) && (delete this[s], o = !0);
    }
    return o;
  }
  normalize(t) {
    const r = this, n = {};
    return d.forEach(this, (o, s) => {
      const i = d.findKey(n, s);
      if (i) {
        r[i] = Dt(o), delete r[s];
        return;
      }
      const a = t ? Si(s) : String(s).trim();
      a !== s && delete r[s], r[a] = Dt(o), n[a] = !0;
    }), this;
  }
  concat(...t) {
    return this.constructor.concat(this, ...t);
  }
  toJSON(t) {
    const r = /* @__PURE__ */ Object.create(null);
    return d.forEach(this, (n, o) => {
      n != null && n !== !1 && (r[o] = t && d.isArray(n) ? n.join(", ") : n);
    }), r;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([t, r]) => t + ": " + r).join(`
`);
  }
  getSetCookie() {
    const t = this.get("set-cookie");
    return d.isArray(t) ? t : t == null || t === !1 ? [] : [t];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(t) {
    return t instanceof this ? t : new this(t);
  }
  static parseParameters(t) {
    return bi(t);
  }
  static concat(t, ...r) {
    const n = new this(t);
    return r.forEach((o) => n.set(o)), n;
  }
  static accessor(t) {
    const n = (this[Kr] = this[Kr] = {
      accessors: {}
    }).accessors, o = this.prototype;
    function s(i) {
      const a = at(i);
      n[a] || (wi(o, i), n[a] = !0);
    }
    return d.isArray(t) ? t.forEach(s) : s(t), this;
  }
};
me.accessor([
  "Content-Type",
  "Content-Length",
  "Accept",
  "Accept-Encoding",
  "User-Agent",
  "Authorization"
]);
d.reduceDescriptors(me.prototype, ({ value: e }, t) => {
  let r = t[0].toUpperCase() + t.slice(1);
  return {
    get: () => e,
    set(n) {
      this[r] = n;
    }
  };
});
d.freezeMethods(me);
const Ft = "[REDACTED ****]";
function Ti(e) {
  if (d.hasOwnProp(e, "toJSON"))
    return !0;
  let t = Object.getPrototypeOf(e);
  for (; t && t !== Object.prototype; ) {
    if (d.hasOwnProp(t, "toJSON"))
      return !0;
    t = Object.getPrototypeOf(t);
  }
  return !1;
}
function Ri(e, t) {
  const r = new Set(t.map((s) => String(s).toLowerCase())), n = [], o = (s) => {
    if (s === null || typeof s != "object" || d.isBuffer(s)) return s;
    if (n.indexOf(s) !== -1) return;
    s instanceof me && (s = s.toJSON()), n.push(s);
    let i;
    if (d.isArray(s))
      i = [], s.forEach((a, c) => {
        const f = o(a);
        d.isUndefined(f) || (i[c] = f);
      });
    else {
      if (!d.isPlainObject(s) && Ti(s))
        return n.pop(), s;
      i = /* @__PURE__ */ Object.create(null);
      for (const [a, c] of Object.entries(s)) {
        const f = r.has(a.toLowerCase()) ? Ft : o(c);
        d.isUndefined(f) || (i[a] = f);
      }
    }
    return n.pop(), i;
  };
  return o(e);
}
function Yr(e) {
  try {
    return String(e);
  } catch {
    return "";
  }
}
function Oi(e) {
  return e.errors.map((r) => {
    try {
      return r && r.message ? Yr(r.message) : Yr(r);
    } catch {
      return "";
    }
  }).filter(Boolean).join("; ") || e.name || "AggregateError";
}
let A = class ao extends Error {
  static from(t, r, n, o, s, i) {
    let a = t.message;
    !a && d.isArray(t.errors) && t.errors.length && (a = Oi(t));
    const c = new ao(a, r || t.code, n, o, s);
    return Object.defineProperty(c, "cause", {
      __proto__: null,
      value: t,
      writable: !0,
      enumerable: !1,
      configurable: !0
    }), c.name = t.name, t.status != null && c.status == null && (c.status = t.status), i && Object.assign(c, i), c;
  }
  /**
   * Create an Error with the specified message, config, error code, request and response.
   *
   * @param {string} message The error message.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [config] The config.
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   *
   * @returns {Error} The created error.
   */
  constructor(t, r, n, o, s) {
    super(t), Object.defineProperty(this, "message", {
      // Null-proto descriptor so a polluted Object.prototype.get cannot turn
      // this data descriptor into an accessor descriptor on the way in.
      __proto__: null,
      value: t,
      enumerable: !0,
      writable: !0,
      configurable: !0
    }), this.name = "AxiosError", this.isAxiosError = !0, r && (this.code = r), n && (this.config = n), o && (this.request = o), s && (this.response = s, this.status = s.status);
  }
  toJSON() {
    const t = this.config, r = t && d.hasOwnProp(t, "redact") ? t.redact : void 0, n = d.isArray(r) && r.length > 0 ? Ri(t, r) : d.toJSONObject(t);
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: n,
      code: this.code,
      status: this.status
    };
  }
};
A.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE";
A.ERR_BAD_OPTION = "ERR_BAD_OPTION";
A.ECONNABORTED = "ECONNABORTED";
A.ETIMEDOUT = "ETIMEDOUT";
A.ECONNREFUSED = "ECONNREFUSED";
A.ERR_NETWORK = "ERR_NETWORK";
A.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS";
A.ERR_DEPRECATED = "ERR_DEPRECATED";
A.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE";
A.ERR_BAD_REQUEST = "ERR_BAD_REQUEST";
A.ERR_CANCELED = "ERR_CANCELED";
A.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT";
A.ERR_INVALID_URL = "ERR_INVALID_URL";
A.ERR_FORM_DATA_DEPTH_EXCEEDED = "ERR_FORM_DATA_DEPTH_EXCEEDED";
const Ci = null, co = 100;
function _r(e) {
  return d.isPlainObject(e) || d.isArray(e);
}
function lo(e) {
  return d.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function fr(e, t, r) {
  return e ? e.concat(t).map(function(o, s) {
    return o = lo(o), !r && s ? "[" + o + "]" : o;
  }).join(r ? "." : "") : t;
}
function _i(e) {
  return d.isArray(e) && !e.some(_r);
}
const Ai = d.toFlatObject(d, {}, null, function(t) {
  return /^is[A-Z]/.test(t);
});
function Wt(e, t, r) {
  if (!d.isObject(e))
    throw new TypeError("target must be an object");
  t = t || new FormData();
  const n = (R, x) => {
    const S = d.getSafeProp(r, R);
    return d.isUndefined(S) ? x : S;
  }, o = n("metaTokens", !0), s = n("visitor") || h, i = n("dots", !1), a = n("indexes", !1), c = n("Blob") || typeof Blob < "u" && Blob, f = n("maxDepth", co), u = c && d.isSpecCompliantForm(t), p = [];
  if (!d.isFunction(s))
    throw new TypeError("visitor must be a function");
  function m(R) {
    if (R === null) return "";
    if (d.isDate(R))
      return R.toISOString();
    if (d.isBoolean(R))
      return R.toString();
    if (!u && d.isBlob(R))
      throw new A("Blob is not supported. Use a Buffer instead.");
    if (d.isArrayBuffer(R) || d.isTypedArray(R)) {
      if (u && typeof c == "function")
        return new c([R]);
      throw new A(
        "Blob is not supported. Use a Buffer instead.",
        A.ERR_NOT_SUPPORT
      );
    }
    return R;
  }
  function E(R) {
    if (R > f)
      throw new A(
        "Object is too deeply nested (" + R + " levels). Max depth: " + f,
        A.ERR_FORM_DATA_DEPTH_EXCEEDED
      );
  }
  function y(R, x) {
    if (f === 1 / 0)
      return JSON.stringify(R);
    const S = [];
    return JSON.stringify(R, function(k, H) {
      if (!d.isObject(H))
        return H;
      for (; S.length && S[S.length - 1] !== this; )
        S.pop();
      return S.push(H), E(x + S.length - 1), H;
    });
  }
  function h(R, x, S) {
    let w = R;
    if (d.isReactNative(t) && d.isReactNativeBlob(R))
      return t.append(fr(S, x, i), m(R)), !1;
    if (R && !S && typeof R == "object") {
      if (d.endsWith(x, "{}"))
        x = o ? x : x.slice(0, -2), R = y(R, 1);
      else if (d.isArray(R) && _i(R) || (d.isFileList(R) || d.endsWith(x, "[]")) && (w = d.toArray(R)))
        return x = lo(x), w.forEach(function(H, re) {
          !(d.isUndefined(H) || H === null) && t.append(
            // eslint-disable-next-line no-nested-ternary
            a === !0 ? fr([x], re, i) : a === null ? x : x + "[]",
            m(H)
          );
        }), !1;
    }
    return _r(R) ? !0 : (t.append(fr(S, x, i), m(R)), !1);
  }
  const T = Object.assign(Ai, {
    defaultVisitor: h,
    convertValue: m,
    isVisitable: _r
  });
  function g(R, x, S = 0) {
    if (!d.isUndefined(R)) {
      if (E(S), p.indexOf(R) !== -1)
        throw new Error("Circular reference detected in " + x.join("."));
      p.push(R), d.forEach(R, function(k, H) {
        (!(d.isUndefined(k) || k === null) && s.call(t, k, d.isString(H) ? H.trim() : H, x, T)) === !0 && g(k, x ? x.concat(H) : [H], S + 1);
      }), p.pop();
    }
  }
  if (!d.isObject(e))
    throw new TypeError("data must be an object");
  return g(e), t;
}
function Gr(e) {
  const t = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+"
  };
  return encodeURIComponent(e).replace(/[!'()~]|%20/g, function(n) {
    return t[n];
  });
}
function Ir(e, t) {
  this._pairs = [], e && Wt(e, this, t);
}
const uo = Ir.prototype;
uo.append = function(t, r) {
  this._pairs.push([t, r]);
};
uo.toString = function(t) {
  const r = t ? (n) => t.call(this, n, Gr) : Gr;
  return this._pairs.map(function(o) {
    return r(o[0]) + "=" + r(o[1]);
  }, "").join("&");
};
function xi(e) {
  return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function fo(e, t, r) {
  if (!t)
    return e;
  e = e || "";
  const n = d.isFunction(r) ? {
    serialize: r
  } : r, o = d.getSafeProp(n, "encode") || xi, s = d.getSafeProp(n, "serialize");
  let i;
  if (s ? i = s(t, n) : i = d.isURLSearchParams(t) ? t.toString() : new Ir(t, n).toString(o), i) {
    const a = e.indexOf("#");
    a !== -1 && (e = e.slice(0, a)), e += (e.indexOf("?") === -1 ? "?" : "&") + i;
  }
  return e;
}
const ct = /* @__PURE__ */ Symbol("internals");
function po(e) {
  return e ? e.length : 0;
}
function Jr(e) {
  if (e)
    for (; e.length && e[e.length - 1] === null; )
      e.pop();
}
function lt(e, t) {
  const r = e.handlers, n = po(r);
  r !== t.handlersRef ? (t.handlersRef = r, t.handlerEntries.clear()) : n !== t.handlersLength && (n ? t.handlerEntries.forEach(function(s, i) {
    r[s.index] !== s.handler && t.handlerEntries.delete(i);
  }) : t.handlerEntries.clear()), t.handlersLength = n;
}
class Xr {
  constructor() {
    this.handlers = [], this[ct] = {
      handlersRef: this.handlers,
      handlersLength: this.handlers.length,
      handlerEntries: /* @__PURE__ */ new Map(),
      iterationDepth: 0,
      nextId: 0
    };
  }
  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   * @param {Object} options The options for the interceptor, synchronous and runWhen
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(t, r, n) {
    const o = {
      fulfilled: t,
      rejected: r,
      synchronous: n ? n.synchronous : !1,
      runWhen: n ? n.runWhen : null
    }, s = this[ct];
    this.handlers == null && (this.handlers = []), lt(this, s);
    const i = s.nextId++;
    return this.handlers.push(o), s.handlerEntries.set(i, {
      handler: o,
      index: this.handlers.length - 1
    }), s.handlersLength = this.handlers.length, i;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {void}
   */
  eject(t) {
    const r = this[ct];
    lt(this, r);
    const n = r.handlerEntries.get(t);
    if (n) {
      if (r.handlerEntries.delete(t), this.handlers[n.index] !== n.handler)
        return;
      this.handlers[n.index] = null, r.iterationDepth || (Jr(this.handlers), r.handlersLength = this.handlers.length);
    }
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    this.handlers && (this.handlers = [], lt(this, this[ct]));
  }
  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(t) {
    const r = this[ct];
    lt(this, r), r.iterationDepth++;
    try {
      d.forEach(this.handlers, function(o) {
        o !== null && t(o);
      });
    } finally {
      --r.iterationDepth || (lt(this, r), Jr(this.handlers), r.handlersLength = po(this.handlers));
    }
  }
}
const $r = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1,
  legacyInterceptorReqResOrdering: !0,
  advertiseZstdAcceptEncoding: !1,
  validateStatusUndefinedResolves: !0
}, vi = typeof URLSearchParams < "u" ? URLSearchParams : Ir, Pi = typeof FormData < "u" ? FormData : null, ki = typeof Blob < "u" ? Blob : null, Ni = {
  isBrowser: !0,
  classes: {
    URLSearchParams: vi,
    FormData: Pi,
    Blob: ki
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
}, Dr = typeof window < "u" && typeof document < "u", Ar = typeof navigator == "object" && navigator || void 0, Ii = Dr && (!Ar || ["ReactNative", "NativeScript", "NS"].indexOf(Ar.product) < 0), $i = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", Di = Dr && window.location.href || "http://localhost", Li = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: Dr,
  hasStandardBrowserEnv: Ii,
  hasStandardBrowserWebWorkerEnv: $i,
  navigator: Ar,
  origin: Di
}, Symbol.toStringTag, { value: "Module" })), ue = {
  ...Li,
  ...Ni
};
function Ui(e, t) {
  return Wt(e, new ue.classes.URLSearchParams(), {
    visitor: function(r, n, o, s) {
      return ue.isNode && d.isBuffer(r) ? (this.append(n, r.toString("base64")), !1) : s.defaultVisitor.apply(this, arguments);
    },
    ...t
  });
}
const Qr = co;
function ho(e) {
  if (e > Qr)
    throw new A(
      "FormData field is too deeply nested (" + e + " levels). Max depth: " + Qr,
      A.ERR_FORM_DATA_DEPTH_EXCEEDED
    );
}
function Bi(e) {
  const t = [], r = /[^.[\]]+|\[([^.[\]]*)]/g;
  let n;
  for (; (n = r.exec(e)) !== null; )
    ho(t.length), t.push(n[0] === "[]" ? "" : n[1] || n[0]);
  return t;
}
function Fi(e) {
  const t = {}, r = Object.keys(e);
  let n;
  const o = r.length;
  let s;
  for (n = 0; n < o; n++)
    s = r[n], t[s] = e[s];
  return t;
}
function mo(e) {
  function t(r, n, o, s) {
    ho(s);
    let i = r[s++];
    if (i === "__proto__") return !0;
    const a = Number.isFinite(+i), c = s >= r.length;
    return i = !i && d.isArray(o) ? o.length : i, c ? (d.hasOwnProp(o, i) ? o[i] = d.isArray(o[i]) ? o[i].concat(n) : [o[i], n] : o[i] = n, !a) : ((!d.hasOwnProp(o, i) || !d.isObject(o[i])) && (o[i] = []), t(r, n, o[i], s) && d.isArray(o[i]) && (o[i] = Fi(o[i])), !a);
  }
  if (d.isFormData(e) && d.isFunction(e.entries)) {
    const r = {};
    return d.forEachEntry(e, (n, o) => {
      t(Bi(n), o, r, 0);
    }), r;
  }
  return null;
}
const go = Object.freeze([
  "get",
  "delete",
  "head",
  "options",
  "post",
  "put",
  "patch",
  "purge",
  "link",
  "unlink",
  "query"
]), Ye = (e, t) => e != null && d.hasOwnProp(e, t) ? e[t] : void 0;
function Mi(e, t, r) {
  if (d.isString(e))
    try {
      return (t || JSON.parse)(e), d.trim(e);
    } catch (n) {
      if (n.name !== "SyntaxError")
        throw n;
    }
  return (r || JSON.stringify)(e);
}
const Rt = {
  transitional: $r,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [
    function(t, r) {
      const n = r.getContentType() || "", o = n.indexOf("application/json") > -1, s = d.isObject(t);
      if (s && d.isHTMLForm(t) && (t = new FormData(t)), d.isFormData(t))
        return o ? JSON.stringify(mo(t)) : t;
      if (d.isArrayBuffer(t) || d.isBuffer(t) || d.isStream(t) || d.isFile(t) || d.isBlob(t) || d.isReadableStream(t))
        return t;
      if (d.isArrayBufferView(t))
        return t.buffer;
      if (d.isURLSearchParams(t))
        return r.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), t.toString();
      let a;
      if (s) {
        const c = Ye(this, "formSerializer");
        if (n.indexOf("application/x-www-form-urlencoded") > -1)
          return Ui(t, c).toString();
        if ((a = d.isFileList(t)) || n.indexOf("multipart/form-data") > -1) {
          const f = Ye(this, "env"), u = f && f.FormData;
          return Wt(
            a ? { "files[]": t } : t,
            u && new u(),
            c
          );
        }
      }
      return s || o ? (r.setContentType("application/json", !1), Mi(t)) : t;
    }
  ],
  transformResponse: [
    function(t) {
      const r = Ye(this, "transitional") || Rt.transitional, n = r && r.forcedJSONParsing, o = Ye(this, "responseType"), s = o === "json";
      if (d.isResponse(t) || d.isReadableStream(t))
        return t;
      if (t && d.isString(t) && (n && !o || s)) {
        const a = !(r && r.silentJSONParsing) && s;
        try {
          return JSON.parse(t, Ye(this, "parseReviver"));
        } catch (c) {
          if (a)
            throw c.name === "SyntaxError" ? A.from(c, A.ERR_BAD_RESPONSE, this, null, Ye(this, "response")) : c;
        }
      }
      return t;
    }
  ],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: ue.classes.FormData,
    Blob: ue.classes.Blob
  },
  validateStatus: function(t) {
    return t >= 200 && t < 300;
  },
  headers: {
    common: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
d.forEach(go, (e) => {
  Rt.headers[e] = {};
});
function dr(e, t) {
  const r = this || Rt, n = t || r, o = me.from(n.headers);
  let s = n.data;
  return d.forEach(e, function(a) {
    s = a.call(r, s, o.normalize(), t ? t.status : void 0);
  }), o.normalize(), s;
}
function yo(e) {
  return !!(e && e.__CANCEL__);
}
let Ot = class extends A {
  /**
   * A `CanceledError` is an object that is thrown when an operation is canceled.
   *
   * @param {string=} message The message.
   * @param {Object=} config The config.
   * @param {Object=} request The request.
   *
   * @returns {CanceledError} The created error.
   */
  constructor(t, r, n) {
    super(t ?? "canceled", A.ERR_CANCELED, r, n), this.name = "CanceledError", this.__CANCEL__ = !0;
  }
};
function bo(e, t, r) {
  const n = r.config.validateStatus;
  !r.status || !n || n(r.status) ? e(r) : t(new A(
    "Request failed with status code " + r.status,
    r.status >= 400 && r.status < 500 ? A.ERR_BAD_REQUEST : A.ERR_BAD_RESPONSE,
    r.config,
    r.request,
    r
  ));
}
const ji = /[\t\n\r]/g;
function Eo(e) {
  if (typeof e != "string")
    return e;
  let t = 0;
  for (; t < e.length && e.charCodeAt(t) <= 32; )
    t++;
  return e.slice(t).replace(ji, "");
}
function pr(e) {
  const t = /^([-+\w]{1,25}):(?:\/\/)?/.exec(e);
  return t && t[1] || "";
}
function Hi(e, t) {
  e = e || 10;
  const r = new Array(e), n = new Array(e);
  let o = 0, s = 0, i;
  return t = t !== void 0 ? t : 1e3, function(c) {
    const f = Date.now(), u = n[s];
    i || (i = f), r[o] = c, n[o] = f;
    let p = s, m = 0;
    for (; p !== o; )
      m += r[p++], p = p % e;
    if (o = (o + 1) % e, o === s && (s = (s + 1) % e), f - i < t)
      return;
    const E = u && f - u;
    return E ? Math.round(m * 1e3 / E) : void 0;
  };
}
function Vi(e, t) {
  let r = 0, n = 1e3 / t, o, s;
  const i = (u, p = Date.now()) => {
    r = p, o = null, s && (clearTimeout(s), s = null), e(...u);
  };
  return [(...u) => {
    const p = Date.now(), m = p - r;
    m >= n ? i(u, p) : (o = u, s || (s = setTimeout(() => {
      s = null, i(o);
    }, n - m)));
  }, () => o && i(o), (...u) => i(u)];
}
const Mt = (e, t, r = 3) => {
  let n = 0;
  const o = Hi(50, 250);
  return Vi((s) => {
    if (!s || !d.isNumber(s.loaded))
      return;
    const i = s.loaded, a = s.lengthComputable ? s.total : void 0, c = Math.max(0, a != null ? Math.min(i, a) : i), f = Math.max(0, c - n), u = o(f);
    n = Math.max(n, c);
    const p = {
      loaded: c,
      total: a,
      progress: a ? c / a : void 0,
      bytes: f,
      rate: u || void 0,
      estimated: u && a ? (a - c) / u : void 0,
      event: s,
      lengthComputable: a != null,
      [t ? "download" : "upload"]: !0
    };
    e(p);
  }, r);
}, Zr = (e, t) => {
  const r = e != null;
  return [
    (n) => t[0]({
      lengthComputable: r,
      total: e,
      loaded: n
    }),
    t[1]
  ];
}, en = (e, t = d.asap) => (...r) => t(() => e(...r)), Wi = ue.hasStandardBrowserEnv ? /* @__PURE__ */ ((e, t) => (r) => (r = new URL(r, ue.origin), e.protocol === r.protocol && e.host === r.host && (t || e.port === r.port)))(
  new URL(ue.origin),
  ue.navigator && /(msie|trident)/i.test(ue.navigator.userAgent)
) : () => !0, qi = ue.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(e, t, r, n, o, s, i) {
      if (typeof document > "u") return;
      const a = [`${e}=${encodeURIComponent(t)}`];
      d.isNumber(r) && a.push(`expires=${new Date(r).toUTCString()}`), d.isString(n) && a.push(`path=${n}`), d.isString(o) && a.push(`domain=${o}`), s === !0 && a.push("secure"), d.isString(i) && a.push(`SameSite=${i}`), document.cookie = a.join("; ");
    },
    read(e) {
      if (typeof document > "u") return null;
      const t = document.cookie.split(";");
      for (let r = 0; r < t.length; r++) {
        const n = t[r].replace(/^\s+/, ""), o = n.indexOf("=");
        if (o !== -1 && n.slice(0, o) === e)
          try {
            return decodeURIComponent(n.slice(o + 1));
          } catch {
            return n.slice(o + 1);
          }
      }
      return null;
    },
    remove(e) {
      this.write(e, "", Date.now() - 864e5, "/");
    }
  }
) : (
  // Non-standard browser env (web workers, react-native) lack needed support.
  {
    write() {
    },
    read() {
      return null;
    },
    remove() {
    }
  }
);
function zi(e) {
  return typeof e != "string" ? !1 : /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
function Ki(e, t) {
  if (!t)
    return e;
  let r = e.length;
  for (; r > 0 && e.charCodeAt(r - 1) === 47; )
    r--;
  return e.slice(0, r) + "/" + t.replace(/^\/+/, "");
}
const Yi = /^https?:(?!\/\/)/i;
function Gi(e) {
  return e && e.replace(/(^|&)([^=&]*=)?[^&]+/g, (t, r, n = "") => `${r}${n}${Ft}`);
}
function Ji(e) {
  const t = e.replace(/^(https?:\/{0,2})[^/?#]*@/i, `$1${Ft}@`), r = t.indexOf("#"), o = (r === -1 ? t : t.slice(0, r)).replace(
    /([?&][^=&#]*=)[^&#]*/g,
    `$1${Ft}`
  );
  return r === -1 ? o : `${o}#${Gi(t.slice(r + 1))}`;
}
function tn(e, t) {
  if (typeof e == "string") {
    const r = Eo(e);
    if (Yi.test(r))
      throw new A(
        `Invalid URL ${JSON.stringify(Ji(r))}: missing "//" after protocol`,
        A.ERR_INVALID_URL,
        t
      );
  }
}
function So(e, t, r, n) {
  tn(t, n);
  let o = !zi(t);
  return e && (o || r === !1) ? (tn(e, n), Ki(e, t)) : t;
}
const rn = (e) => e instanceof me ? { ...e } : e, Xi = (e) => Object.getOwnPropertySymbols && Object.getOwnPropertyDescriptor ? Object.keys(e).concat(
  Object.getOwnPropertySymbols(e).filter(
    (t) => Object.getOwnPropertyDescriptor(e, t).enumerable
  )
) : Object.keys(e);
function Ke(e, t) {
  e = e || {}, t = t || {};
  const r = /* @__PURE__ */ Object.create(null);
  Object.defineProperty(r, "hasOwnProperty", {
    // Null-proto descriptor so a polluted Object.prototype.get cannot turn
    // this data descriptor into an accessor descriptor on the way in.
    __proto__: null,
    value: Object.prototype.hasOwnProperty,
    enumerable: !1,
    writable: !0,
    configurable: !0
  });
  function n(u, p, m, E) {
    return d.isPlainObject(u) && d.isPlainObject(p) ? d.merge.call({ caseless: E }, u, p) : d.isPlainObject(p) ? d.merge({}, p) : d.isArray(p) ? p.slice() : p;
  }
  function o(u, p, m, E) {
    if (d.isUndefined(p)) {
      if (!d.isUndefined(u))
        return n(void 0, u, m, E);
    } else return n(u, p, m, E);
  }
  function s(u, p) {
    if (!d.isUndefined(p))
      return n(void 0, p);
  }
  function i(u, p) {
    if (d.isUndefined(p)) {
      if (!d.isUndefined(u))
        return n(void 0, u);
    } else return n(void 0, p);
  }
  function a(u) {
    const p = d.hasOwnProp(t, "transitional") ? t.transitional : void 0;
    if (!d.isUndefined(p))
      if (d.isPlainObject(p)) {
        if (d.hasOwnProp(p, u))
          return p[u];
      } else
        return;
    const m = d.hasOwnProp(e, "transitional") ? e.transitional : void 0;
    if (d.isPlainObject(m) && d.hasOwnProp(m, u))
      return m[u];
  }
  function c(u, p, m) {
    if (d.hasOwnProp(t, m))
      return n(u, p);
    if (d.hasOwnProp(e, m))
      return n(void 0, u);
  }
  const f = {
    url: s,
    method: s,
    data: s,
    baseURL: i,
    transformRequest: i,
    transformResponse: i,
    paramsSerializer: i,
    timeout: i,
    timeoutErrorMessage: i,
    withCredentials: i,
    withXSRFToken: i,
    adapter: i,
    responseType: i,
    xsrfCookieName: i,
    xsrfHeaderName: i,
    onUploadProgress: i,
    onDownloadProgress: i,
    decompress: i,
    maxContentLength: i,
    maxBodyLength: i,
    beforeRedirect: i,
    transport: i,
    httpAgent: i,
    httpsAgent: i,
    cancelToken: i,
    socketPath: i,
    allowedSocketPaths: i,
    responseEncoding: i,
    validateStatus: c,
    headers: (u, p, m) => o(rn(u), rn(p), m, !0)
  };
  return d.forEach(Xi({ ...e, ...t }), function(p) {
    if (p === "__proto__" || p === "constructor" || p === "prototype") return;
    const m = d.hasOwnProp(f, p) ? f[p] : o, E = d.hasOwnProp(e, p) ? e[p] : void 0, y = d.hasOwnProp(t, p) ? t[p] : void 0, h = m(E, y, p);
    d.isUndefined(h) && m !== c || (r[p] = h);
  }), d.hasOwnProp(t, "validateStatus") && d.isUndefined(t.validateStatus) && a("validateStatusUndefinedResolves") === !1 && (d.hasOwnProp(e, "validateStatus") ? r.validateStatus = n(void 0, e.validateStatus) : delete r.validateStatus), r;
}
const Qi = ["content-type", "content-length"];
function Zi(e, t, r) {
  if (r !== "content-only") {
    e.set(t);
    return;
  }
  Object.entries(t || {}).forEach(([n, o]) => {
    Qi.includes(n.toLowerCase()) && e.set(n, o);
  });
}
const ea = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, r) => String.fromCharCode(parseInt(r, 16))
);
function wo(e) {
  const t = Ke({}, e), r = (m) => d.hasOwnProp(t, m) ? t[m] : void 0, n = r("data");
  let o = r("withXSRFToken");
  const s = r("xsrfHeaderName"), i = r("xsrfCookieName");
  let a = r("headers");
  const c = r("auth"), f = r("baseURL"), u = r("allowAbsoluteUrls"), p = r("url");
  if (t.headers = a = me.from(a), t.url = fo(
    So(f, p, u, t),
    r("params"),
    r("paramsSerializer")
  ), c) {
    const m = d.getSafeProp(c, "username") || "", E = d.getSafeProp(c, "password") || "";
    try {
      a.set(
        "Authorization",
        "Basic " + btoa(m + ":" + (E ? ea(E) : ""))
      );
    } catch (y) {
      throw A.from(y, A.ERR_BAD_OPTION_VALUE, e);
    }
  }
  if (d.isFormData(n)) {
    const m = d.getSafeProp(n, "getHeaders");
    ue.hasStandardBrowserEnv || ue.hasStandardBrowserWebWorkerEnv || d.isReactNative(n) ? a.setContentType(void 0) : d.isFunction(m) && Zi(a, m.call(n), r("formDataHeaderPolicy"));
  }
  if (ue.hasStandardBrowserEnv && (d.isFunction(o) && (o = o(t)), o === !0 || o == null && Wi(t.url))) {
    const E = s && i && qi.read(i);
    E && a.set(s, E);
  }
  return t;
}
const ta = typeof XMLHttpRequest < "u", ra = ta && function(e) {
  return new Promise(function(r, n) {
    const o = wo(e);
    let s = o.data;
    const i = me.from(o.headers).normalize();
    let { responseType: a, onUploadProgress: c, onDownloadProgress: f } = o, u, p, m, E, y, h;
    function T() {
      E && E(), y && y(), o.cancelToken && o.cancelToken.unsubscribe(u), o.signal && o.signal.removeEventListener("abort", u);
    }
    let g = new XMLHttpRequest();
    g.open(o.method.toUpperCase(), o.url, !0), g.timeout = o.timeout;
    function R(S) {
      if (!g)
        return;
      if (g.status === 0 && (pr(Eo(o.url)) || pr(ue.origin)) !== "file" && !(g.responseURL && g.responseURL.startsWith("file:"))) {
        n(new A("Request aborted", A.ECONNABORTED, e, g)), T(), g = null;
        return;
      }
      try {
        S ? h && h(S) : y && y();
      } catch (re) {
        setTimeout(() => {
          throw re;
        });
      }
      if (!g)
        return;
      const w = me.from(
        "getAllResponseHeaders" in g && g.getAllResponseHeaders()
      ), H = {
        data: !a || a === "text" || a === "json" ? g.responseText : g.response,
        status: g.status,
        statusText: g.statusText,
        headers: w,
        config: e,
        request: g
      };
      bo(
        function(ee) {
          r(ee), T();
        },
        function(ee) {
          n(ee), T();
        },
        H
      ), g = null;
    }
    "onloadend" in g ? g.onloadend = R : g.onreadystatechange = function() {
      !g || g.readyState !== 4 || g.status === 0 && !(g.responseURL && g.responseURL.startsWith("file:")) || setTimeout(R);
    }, g.onabort = function() {
      g && (n(new A("Request aborted", A.ECONNABORTED, e, g)), T(), g = null);
    }, g.onerror = function(w) {
      const k = w && w.message ? w.message : "Network Error", H = new A(k, A.ERR_NETWORK, e, g);
      H.event = w || null, n(H), T(), g = null;
    }, g.ontimeout = function() {
      let w = o.timeout ? "timeout of " + o.timeout + "ms exceeded" : "timeout exceeded";
      const k = o.transitional || $r;
      o.timeoutErrorMessage && (w = o.timeoutErrorMessage), n(
        new A(
          w,
          k.clarifyTimeoutError ? A.ETIMEDOUT : A.ECONNABORTED,
          e,
          g
        )
      ), T(), g = null;
    }, s === void 0 && i.setContentType(null), "setRequestHeader" in g && d.forEach(io(i), function(w, k) {
      g.setRequestHeader(k, w);
    }), d.isUndefined(o.withCredentials) || (g.withCredentials = !!o.withCredentials), a && a !== "json" && (g.responseType = o.responseType), f && ([m, y, h] = Mt(
      f,
      !0
    ), g.addEventListener("progress", m)), c && g.upload && ([p, E] = Mt(c), g.upload.addEventListener("progress", p), g.upload.addEventListener("loadend", E)), (o.cancelToken || o.signal) && (u = (S) => {
      g && (n(!S || S.type ? new Ot(null, e, g) : S), g.abort(), T(), g = null);
    }, o.cancelToken && o.cancelToken.subscribe(u), o.signal && (o.signal.aborted ? u() : o.signal.addEventListener("abort", u)));
    const x = pr(o.url);
    if (x && !ue.protocols.includes(x)) {
      n(
        new A(
          "Unsupported protocol " + x + ":",
          A.ERR_BAD_REQUEST,
          e
        )
      ), T();
      return;
    }
    g.send(s || null);
  });
}, na = (e, t) => {
  if (e = e ? e.filter(Boolean) : [], !t && !e.length)
    return;
  const r = new AbortController();
  let n = !1;
  const o = function(c) {
    if (!n) {
      n = !0, i();
      const f = c instanceof Error ? c : this.reason;
      r.abort(
        f instanceof A ? f : new Ot(f instanceof Error ? f.message : f)
      );
    }
  };
  let s = t && setTimeout(() => {
    s = null, o(new A(`timeout of ${t}ms exceeded`, A.ETIMEDOUT));
  }, t);
  const i = () => {
    e && (s && clearTimeout(s), s = null, e.forEach((c) => {
      c.unsubscribe ? c.unsubscribe(o) : c.removeEventListener("abort", o);
    }), e = null);
  };
  e.forEach((c) => {
    if (!n) {
      if (c.aborted) {
        o.call(c);
        return;
      }
      c.addEventListener("abort", o, { once: !0 });
    }
  });
  const { signal: a } = r;
  return a.unsubscribe = () => d.asap(i), a;
}, oa = function* (e, t) {
  let r = e.byteLength;
  if (r < t) {
    yield e;
    return;
  }
  let n = 0, o;
  for (; n < r; )
    o = n + t, yield e.slice(n, o), n = o;
}, sa = async function* (e, t) {
  for await (const r of ia(e))
    yield* oa(r, t);
}, ia = async function* (e) {
  if (e[Symbol.asyncIterator]) {
    yield* e;
    return;
  }
  const t = e.getReader();
  try {
    for (; ; ) {
      const { done: r, value: n } = await t.read();
      if (r)
        break;
      yield n;
    }
  } finally {
    await t.cancel();
  }
}, nn = (e, t, r, n) => {
  const o = sa(e, t);
  let s = 0, i, a = (c) => {
    i || (i = !0, n && n(c));
  };
  return new ReadableStream(
    {
      async pull(c) {
        try {
          const { done: f, value: u } = await o.next();
          if (f) {
            a(), c.close();
            return;
          }
          let p = u.byteLength;
          if (r) {
            let m = s += p;
            r(m);
          }
          c.enqueue(new Uint8Array(u));
        } catch (f) {
          throw a(f), f;
        }
      },
      cancel(c) {
        return a(c), o.return();
      }
    },
    {
      highWaterMark: 2
    }
  );
}, on = (e) => e >= 48 && e <= 57 || e >= 65 && e <= 70 || e >= 97 && e <= 102, To = (e, t, r) => t + 2 < r && on(e.charCodeAt(t + 1)) && on(e.charCodeAt(t + 2)), sn = (e) => e <= 57 ? e - 48 : (e & 223) - 55, aa = (e) => e >= 65 && e <= 90 || // A-Z
e >= 97 && e <= 122 || // a-z
e >= 48 && e <= 57 || // 0-9
e === 43 || // +
e === 47 || // /
e === 45 || // - (base64url)
e === 95, ca = (e) => e === 9 || e === 10 || e === 12 || e === 13 || e === 32, la = (e) => {
  const t = Math.floor(e / 4), r = e % 4;
  return t * 3 + (r === 2 ? 1 : r === 3 ? 2 : 0);
}, ua = (e) => {
  const t = e.length;
  let r = 0;
  return t > 0 && e.charCodeAt(t - 1) === 61 && (r++, t > 1 && e.charCodeAt(t - 2) === 61 && r++), Math.floor((t - r) * 3 / 4);
}, fa = (e) => {
  const t = e.length;
  let r = 0, n = 0, o = !1;
  for (let s = 0; s < t; s++) {
    let i = e.charCodeAt(s);
    if (i === 37 && To(e, s, t) && (i = sn(e.charCodeAt(s + 1)) * 16 + sn(e.charCodeAt(s + 2)), s += 2), !ca(i)) {
      if (i === 61) {
        n++;
        continue;
      }
      if (!aa(i) || n > 0) {
        o = !0;
        continue;
      }
      r++;
    }
  }
  return o || n > 2 || n > 0 && (r + n) % 4 !== 0 || r % 4 === 1 ? ua(e) : la(r);
}, da = (e, t) => {
  if (!e || typeof e != "string" || !e.startsWith("data:")) return 0;
  const r = e.indexOf(",");
  if (r < 0) return 0;
  const n = e.slice(5, r), o = e.slice(r + 1);
  if (/;base64/i.test(n))
    return t(o);
  let i = 0;
  for (let a = 0, c = o.length; a < c; a++) {
    const f = o.charCodeAt(a);
    if (f === 37 && To(o, a, c))
      i += 1, a += 2;
    else if (f < 128)
      i += 1;
    else if (f < 2048)
      i += 2;
    else if (f >= 55296 && f <= 56319 && a + 1 < c) {
      const u = o.charCodeAt(a + 1);
      u >= 56320 && u <= 57343 ? (i += 4, a++) : i += 3;
    } else
      i += 3;
  }
  return i;
};
function pa(e) {
  const t = typeof e == "string" ? e.indexOf("#") : -1;
  return da(
    t === -1 ? e : e.slice(0, t),
    fa
  );
}
const Lr = "1.20.0", an = 64 * 1024, ha = {
  cache: "default",
  redirect: "follow",
  referrer: "about:client",
  referrerPolicy: "",
  mode: "cors",
  integrity: "",
  keepalive: !1,
  priority: "auto",
  window: null
}, { isFunction: At } = d, ma = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, r) => String.fromCharCode(parseInt(r, 16))
), cn = (e) => {
  if (!d.isString(e))
    return e;
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}, ln = (e, ...t) => {
  try {
    return !!e(...t);
  } catch {
    return !1;
  }
}, ga = (e) => {
  const t = e.indexOf("://");
  let r = e;
  return t !== -1 && (r = r.slice(t + 3)), r.includes("@") || r.includes(":");
}, ya = (e) => {
  const t = d.global !== void 0 && d.global !== null ? d.global : globalThis, { ReadableStream: r, TextEncoder: n } = t;
  e = d.merge.call(
    {
      skipUndefined: !0
    },
    {
      Request: t.Request,
      Response: t.Response
    },
    e
  );
  const { fetch: o, Request: s, Response: i } = e, a = o ? At(o) : typeof fetch == "function", c = At(s), f = At(i);
  if (!a)
    return !1;
  const u = a && At(r), p = a && (typeof n == "function" ? /* @__PURE__ */ ((g) => (R) => g.encode(R))(new n()) : async (g) => new Uint8Array(await new s(g).arrayBuffer())), m = c && u && ln(() => {
    let g = !1;
    const R = new s(ue.origin, {
      body: new r(),
      method: "POST",
      get duplex() {
        return g = !0, "half";
      }
    }), x = R.headers.has("Content-Type");
    return R.body != null && R.body.cancel(), g && !x;
  }), E = f && u && ln(() => d.isReadableStream(new i("").body)), y = {
    stream: E && ((g) => g.body)
  };
  a && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((g) => {
    !y[g] && (y[g] = (R, x) => {
      let S = R && R[g];
      if (S)
        return S.call(R);
      throw new A(
        `Response type '${g}' is not supported`,
        A.ERR_NOT_SUPPORT,
        x
      );
    });
  });
  const h = async (g) => {
    if (g == null)
      return 0;
    if (d.isBlob(g))
      return g.size;
    if (d.isSpecCompliantForm(g))
      return (await new s(ue.origin, {
        method: "POST",
        body: g
      }).arrayBuffer()).byteLength;
    if (d.isArrayBufferView(g) || d.isArrayBuffer(g))
      return g.byteLength;
    if (d.isURLSearchParams(g) && (g = g + ""), d.isString(g))
      return (await p(g)).byteLength;
  }, T = async (g, R) => {
    const x = d.toFiniteNumber(g.getContentLength());
    return x ?? h(R);
  };
  return async (g) => {
    let {
      url: R,
      method: x,
      data: S,
      signal: w,
      cancelToken: k,
      timeout: H,
      onDownloadProgress: re,
      onUploadProgress: ee,
      responseType: Z,
      headers: Y,
      withCredentials: l = "same-origin",
      fetchOptions: v,
      maxContentLength: O,
      maxBodyLength: D,
      maxRedirects: q
    } = wo(g);
    const ae = d.isNumber(O) && O > -1, ge = d.isNumber(D) && D > -1, ot = (N) => d.hasOwnProp(g, N) ? g[N] : void 0;
    let C = o || fetch;
    Z = Z ? (Z + "").toLowerCase() : "text";
    let P = na(
      [w, k && k.toAbortSignal()],
      H
    ), I = null;
    const U = P && P.unsubscribe && (() => {
      P.unsubscribe();
    });
    let $, j = null;
    const M = () => new A(
      "Request body larger than maxBodyLength limit",
      A.ERR_BAD_REQUEST,
      g,
      I
    );
    try {
      let N;
      const L = ot("auth");
      if (L) {
        const B = d.getSafeProp(L, "username") || "", pe = d.getSafeProp(L, "password") || "";
        N = {
          username: B,
          password: pe
        };
      }
      if (ga(R)) {
        const B = new URL(R, ue.origin);
        if (!N && (B.username || B.password)) {
          const pe = cn(B.username), $e = cn(B.password);
          N = {
            username: pe,
            password: $e
          };
        }
        (B.username || B.password) && (B.username = "", B.password = "", R = B.href);
      }
      if (N && (Y.delete("authorization"), Y.set(
        "Authorization",
        "Basic " + btoa(ma((N.username || "") + ":" + (N.password || "")))
      )), ae && typeof R == "string" && R.startsWith("data:") && pa(R) > O)
        throw new A(
          "maxContentLength size of " + O + " exceeded",
          A.ERR_BAD_RESPONSE,
          g,
          I
        );
      if (ge && x !== "get" && x !== "head") {
        const B = await h(S);
        if (typeof B == "number" && isFinite(B) && ($ = B, B > D))
          throw M();
      }
      const W = ge && (d.isReadableStream(S) || d.isStream(S)), V = (B, pe, $e) => nn(
        B,
        an,
        (je) => {
          if (ge && je > D)
            throw j = M();
          pe && pe(je);
        },
        $e
      );
      if (m && x !== "get" && x !== "head" && (ee || W)) {
        if ($ = $ ?? await T(Y, S), $ !== 0 || W) {
          let B = new s(R, {
            method: "POST",
            body: S,
            duplex: "half"
          }), pe;
          if (d.isFormData(S) && (pe = B.headers.get("content-type")) && Y.setContentType(pe), B.body) {
            const [$e, je] = ee && Zr(
              $,
              Mt(en(ee))
            ) || [];
            S = V(B.body, $e, je);
          }
        }
      } else if (W && !c && u && x !== "get" && x !== "head")
        S = V(S);
      else if (W && c && !m && x !== "get" && x !== "head")
        throw new A(
          "Stream request bodies are not supported by the current fetch implementation",
          A.ERR_NOT_SUPPORT,
          g,
          I
        );
      d.isString(l) || (l = l ? "include" : "omit");
      const de = c && "credentials" in s.prototype;
      if (d.isFormData(S)) {
        const B = Y.getContentType();
        B && /^multipart\/form-data/i.test(B) && !/boundary=/i.test(B) && Y.delete("content-type");
      }
      Y.set("User-Agent", "axios/" + Lr, !1);
      const _ = v == null ? v : Object.assign(/* @__PURE__ */ Object.create(null), v);
      _ && (delete _.body, delete _.headers, delete _.method, delete _.signal, delete _.duplex, delete _.credentials);
      const ce = Object.assign(/* @__PURE__ */ Object.create(null), _, {
        signal: P,
        method: x.toUpperCase(),
        headers: io(Y.normalize()),
        body: S,
        duplex: "half",
        credentials: de ? l : void 0
      });
      c && (d.forEach(ha, (B, pe) => {
        ce[pe] === void 0 && (ce[pe] = B);
      }), ce.signal === void 0 && (ce.signal = null), ce.body === void 0 && (ce.body = null)), q === 0 && (ce.redirect = "manual", _ && (_.redirect = "manual")), I = c && new s(R, ce);
      let ye = await (c ? C(I, _) : C(R, ce));
      const st = me.from(ye.headers);
      if (ae) {
        const B = d.toFiniteNumber(st.getContentLength());
        if (B != null && B > O)
          throw new A(
            "maxContentLength size of " + O + " exceeded",
            A.ERR_BAD_RESPONSE,
            g,
            I
          );
      }
      const ir = E && (Z === "stream" || Z === "response");
      if (E && ye.body && (re || ae || ir && U)) {
        const B = {};
        ["status", "statusText", "headers"].forEach((it) => {
          B[it] = ye[it];
        });
        const pe = d.toFiniteNumber(st.getContentLength()), [$e, je] = re && Zr(
          pe,
          Mt(en(re), !0)
        ) || [];
        let Vr = 0;
        const Vo = (it) => {
          if (ae && (Vr = it, Vr > O))
            throw new A(
              "maxContentLength size of " + O + " exceeded",
              A.ERR_BAD_RESPONSE,
              g,
              I
            );
          $e && $e(it);
        };
        ye = new i(
          nn(ye.body, an, Vo, () => {
            je && je(), U && U();
          }),
          B
        );
      }
      Z = Z || "text";
      let Pe = await y[d.findKey(y, Z) || "text"](
        ye,
        g
      );
      if (ae && !E && !ir) {
        let B;
        if (Pe != null && (typeof Pe.byteLength == "number" ? B = Pe.byteLength : typeof Pe.size == "number" ? B = Pe.size : typeof Pe == "string" && (B = typeof n == "function" ? new n().encode(Pe).byteLength : Pe.length)), typeof B == "number" && B > O)
          throw new A(
            "maxContentLength size of " + O + " exceeded",
            A.ERR_BAD_RESPONSE,
            g,
            I
          );
      }
      return !ir && U && U(), await new Promise((B, pe) => {
        bo(B, pe, {
          data: Pe,
          headers: me.from(ye.headers),
          status: ye.status,
          statusText: ye.statusText,
          config: g,
          request: I
        });
      });
    } catch (N) {
      if (U && U(), P && P.aborted && P.reason instanceof A) {
        const L = P.reason;
        throw L.config = g, I && (L.request = I), N !== L && Object.defineProperty(L, "cause", {
          __proto__: null,
          value: N,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), L;
      }
      if (j)
        throw I && !j.request && (j.request = I), j;
      if (N instanceof A)
        throw I && !N.request && (N.request = I), N;
      if (N && N.name === "TypeError" && /Load failed|fetch/i.test(N.message)) {
        const L = new A(
          "Network Error",
          A.ERR_NETWORK,
          g,
          I,
          N && N.response
        );
        throw Object.defineProperty(L, "cause", {
          __proto__: null,
          value: N.cause || N,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), L;
      }
      throw A.from(N, N && N.code, g, I, N && N.response);
    }
  };
}, ba = /* @__PURE__ */ new Map(), Ro = (e) => {
  let t = e && e.env || {};
  const { fetch: r, Request: n, Response: o } = t, s = [n, o, r];
  let i = s.length, a = i, c, f, u = ba;
  for (; a--; )
    c = s[a], f = u.get(c), f === void 0 && u.set(c, f = a ? /* @__PURE__ */ new Map() : ya(t)), u = f;
  return f;
};
Ro();
const Ur = {
  http: Ci,
  xhr: ra,
  fetch: {
    get: Ro
  }
};
d.forEach(Ur, (e, t) => {
  if (e) {
    try {
      Object.defineProperty(e, "name", { __proto__: null, value: t });
    } catch {
    }
    Object.defineProperty(e, "adapterName", { __proto__: null, value: t });
  }
});
const un = (e) => `- ${e}`, Ea = (e) => d.isFunction(e) || e === null || e === !1;
function Sa(e, t) {
  e = d.isArray(e) ? e : [e];
  const { length: r } = e;
  let n, o;
  const s = {};
  for (let i = 0; i < r; i++) {
    n = e[i];
    let a;
    if (o = n, !Ea(n) && (o = Ur[(a = String(n)).toLowerCase()], o === void 0))
      throw new A(`Unknown adapter '${a}'`);
    if (o && (d.isFunction(o) || (o = o.get(t))))
      break;
    s[a || "#" + i] = o;
  }
  if (!o) {
    const i = Object.entries(s).map(
      ([c, f]) => `adapter ${c} ` + (f === !1 ? "is not supported by the environment" : "is not available in the build")
    );
    let a = r ? i.length > 1 ? `since :
` + i.map(un).join(`
`) : " " + un(i[0]) : "as no adapter specified";
    throw new A(
      "There is no suitable adapter to dispatch the request " + a,
      A.ERR_NOT_SUPPORT
    );
  }
  return o;
}
const Oo = {
  /**
   * Resolve an adapter from a list of adapter names or functions.
   * @type {Function}
   */
  getAdapter: Sa,
  /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */
  adapters: Ur
};
function hr(e) {
  if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted)
    throw new Ot(null, e);
}
function mr(e) {
  const t = d.toSafeFlatObject(e);
  return hr(t), t.headers = me.from(d.getSafeProp(t, "headers")), t.data = dr.call(t, t.transformRequest), ["post", "put", "patch"].indexOf(t.method) !== -1 && t.headers.setContentType("application/x-www-form-urlencoded", !1), Oo.getAdapter(t.adapter || Rt.adapter, t)(t).then(
    function(o) {
      hr(t), t.response = o;
      try {
        o.data = dr.call(t, t.transformResponse, o);
      } finally {
        delete t.response;
      }
      return o.headers = me.from(o.headers), o;
    },
    function(o) {
      if (!yo(o) && (hr(t), o && o.response)) {
        t.response = o.response;
        try {
          o.response.data = dr.call(
            t,
            t.transformResponse,
            o.response
          );
        } finally {
          delete t.response;
        }
        o.response.headers = me.from(o.response.headers);
      }
      return Promise.reject(o);
    }
  );
}
const qt = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((e, t) => {
  qt[e] = function(n) {
    return typeof n === e || "a" + (t < 1 ? "n " : " ") + e;
  };
});
const fn = {};
qt.transitional = function(t, r, n) {
  function o(s, i) {
    return "[Axios v" + Lr + "] Transitional option '" + s + "'" + i + (n ? ". " + n : "");
  }
  return (s, i, a) => {
    if (t === !1)
      throw new A(
        o(i, " has been removed" + (r ? " in " + r : "")),
        A.ERR_DEPRECATED
      );
    return r && !fn[i] && (fn[i] = !0, console.warn(
      o(
        i,
        " has been deprecated since v" + r + " and will be removed in the near future"
      )
    )), t ? t(s, i, a) : !0;
  };
};
qt.spelling = function(t) {
  return (r, n) => (console.warn(`${n} is likely a misspelling of ${t}`), !0);
};
function wa(e, t, r) {
  if (typeof e != "object" || e === null)
    throw new A("options must be an object", A.ERR_BAD_OPTION_VALUE);
  const n = Object.keys(e);
  let o = n.length;
  for (; o-- > 0; ) {
    const s = n[o], i = Object.prototype.hasOwnProperty.call(t, s) ? t[s] : void 0;
    if (i) {
      const a = e[s], c = a === void 0 || i(a, s, e);
      if (c !== !0)
        throw new A(
          "option " + s + " must be " + c,
          A.ERR_BAD_OPTION_VALUE
        );
      continue;
    }
    if (r !== !0)
      throw new A("Unknown option " + s, A.ERR_BAD_OPTION);
  }
}
const Lt = {
  assertOptions: wa,
  validators: qt
}, he = Lt.validators;
let We = class {
  constructor(t) {
    this.defaults = t || {}, this.interceptors = {
      request: new Xr(),
      response: new Xr()
    };
  }
  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  async request(t, r) {
    try {
      return await this._request(t, r);
    } catch (n) {
      if (n instanceof Error)
        try {
          let o = {};
          Error.captureStackTrace ? Error.captureStackTrace(o) : o = new Error();
          const s = o.stack;
          let i = "";
          if (typeof s == "string") {
            const a = s.indexOf(`
`);
            i = a === -1 ? "" : s.slice(a + 1);
          }
          if (!n.stack)
            n.stack = i;
          else if (i) {
            const a = i.indexOf(`
`), c = a === -1 ? -1 : i.indexOf(`
`, a + 1), f = c === -1 ? "" : i.slice(c + 1);
            String(n.stack).endsWith(f) || (n.stack += `
` + i);
          }
        } catch {
        }
      throw n;
    }
  }
  _request(t, r) {
    typeof t == "string" ? (r = r || {}, r.url = t) : r = t || {}, r = Ke(this.defaults, r);
    const { transitional: n, paramsSerializer: o, headers: s } = r;
    n !== void 0 && Lt.assertOptions(
      n,
      {
        silentJSONParsing: he.transitional(he.boolean),
        forcedJSONParsing: he.transitional(he.boolean),
        clarifyTimeoutError: he.transitional(he.boolean),
        legacyInterceptorReqResOrdering: he.transitional(he.boolean),
        advertiseZstdAcceptEncoding: he.transitional(he.boolean),
        validateStatusUndefinedResolves: he.transitional(he.boolean)
      },
      !1
    ), o != null && (d.isFunction(o) ? r.paramsSerializer = {
      serialize: o
    } : Lt.assertOptions(
      o,
      {
        encode: he.function,
        serialize: he.function
      },
      !0
    )), r.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? r.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : r.allowAbsoluteUrls = !0), Lt.assertOptions(
      r,
      {
        baseUrl: he.spelling("baseURL"),
        withXsrfToken: he.spelling("withXSRFToken")
      },
      !0
    ), r.method = (d.getSafeProp(r, "method") || d.getSafeProp(this.defaults, "method") || "get").toLowerCase();
    let i = s && d.merge(s.common, s[r.method]);
    s && d.forEach(go.concat("common"), (y) => {
      delete s[y];
    }), r.headers = me.concat(i, s);
    const a = [];
    let c = !0;
    this.interceptors.request.forEach(function(h) {
      if (typeof h.runWhen == "function" && h.runWhen(r) === !1)
        return;
      c = c && h.synchronous;
      const T = r.transitional || $r;
      T && T.legacyInterceptorReqResOrdering ? a.unshift(h.fulfilled, h.rejected) : a.push(h.fulfilled, h.rejected);
    });
    const f = [];
    this.interceptors.response.forEach(function(h) {
      f.push(h.fulfilled, h.rejected);
    });
    let u, p = 0, m;
    if (!c) {
      const y = [mr.bind(this), void 0];
      for (y.unshift(...a), y.push(...f), m = y.length, u = Promise.resolve(r); p < m; )
        u = u.then(y[p++], y[p++]);
      return u;
    }
    m = a.length;
    let E = r;
    for (; p < m; ) {
      const y = a[p++], h = a[p++];
      try {
        E = y ? y(E) : E;
      } catch (T) {
        if (!h) {
          u = Promise.reject(T);
          break;
        }
        try {
          const g = h.call(this, T);
          d.isThenable(g) && (u = Promise.resolve(g).then(
            () => mr.call(this, E)
          ));
        } catch (g) {
          u = Promise.reject(g);
        }
        break;
      }
    }
    if (!u)
      try {
        u = mr.call(this, E);
      } catch (y) {
        u = Promise.reject(y);
      }
    for (p = 0, m = f.length; p < m; )
      u = u.then(f[p++], f[p++]);
    return u;
  }
  getUri(t) {
    t = Ke(this.defaults, t);
    const r = So(t.baseURL, t.url, t.allowAbsoluteUrls, t);
    return fo(r, t.params, t.paramsSerializer);
  }
};
d.forEach(["delete", "get", "head", "options"], function(t) {
  We.prototype[t] = function(r, n) {
    return this.request(
      Ke(n || {}, {
        method: t,
        url: r,
        data: n && d.hasOwnProp(n, "data") ? n.data : void 0
      })
    );
  };
});
d.forEach(["post", "put", "patch", "query"], function(t) {
  function r(n) {
    return function(s, i, a) {
      return this.request(
        Ke(a || {}, {
          method: t,
          headers: n ? {
            "Content-Type": "multipart/form-data"
          } : {},
          url: s,
          data: i
        })
      );
    };
  }
  We.prototype[t] = r(), t !== "query" && (We.prototype[t + "Form"] = r(!0));
});
let Ta = class Co {
  constructor(t) {
    if (typeof t != "function")
      throw new TypeError("executor must be a function.");
    let r;
    this.promise = new Promise(function(s) {
      r = s;
    });
    const n = this;
    this.promise.then((o) => {
      if (!n._listeners) return;
      let s = n._listeners.length;
      for (; s-- > 0; )
        n._listeners[s](o);
      n._listeners = null;
    }), this.promise.then = (o) => {
      let s;
      const i = new Promise((a) => {
        n.subscribe(a), s = a;
      }).then(o);
      return i.cancel = function() {
        n.unsubscribe(s);
      }, i;
    }, t(function(s, i, a) {
      n.reason || (n.reason = new Ot(s, i, a), r(n.reason));
    });
  }
  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason)
      throw this.reason;
  }
  /**
   * Subscribe to the cancel signal
   */
  subscribe(t) {
    if (this.reason) {
      t(this.reason);
      return;
    }
    this._listeners ? this._listeners.push(t) : this._listeners = [t];
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(t) {
    if (!this._listeners)
      return;
    const r = this._listeners.indexOf(t);
    r !== -1 && this._listeners.splice(r, 1);
  }
  toAbortSignal() {
    const t = new AbortController(), r = (n) => {
      t.abort(n);
    };
    return this.subscribe(r), t.signal.unsubscribe = () => this.unsubscribe(r), t.signal;
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let t;
    return {
      token: new Co(function(o) {
        t = o;
      }),
      cancel: t
    };
  }
};
function Ra(e) {
  return function(r) {
    return e.apply(null, r);
  };
}
function Oa(e) {
  return d.isObject(e) && e.isAxiosError === !0;
}
const Ut = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  /**
   * @deprecated Use `ContentTooLarge` instead.
   */
  PayloadTooLarge: 413,
  ContentTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  /**
   * @deprecated Use `UnprocessableContent` instead.
   */
  UnprocessableEntity: 422,
  UnprocessableContent: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511,
  WebServerReturnsAnUnknownError: 520,
  WebServerIsDown: 521,
  ConnectionTimedOut: 522,
  OriginIsUnreachable: 523,
  TimeoutOccurred: 524,
  SslHandshakeFailed: 525,
  InvalidSslCertificate: 526
};
Object.entries(Ut).forEach(([e, t]) => {
  Ut[t] === void 0 && (Ut[t] = e);
});
function _o(e) {
  const t = new We(e), r = Gn(We.prototype.request, t);
  return d.extend(r, We.prototype, t, { allOwnKeys: !0 }), d.extend(r, t, null, { allOwnKeys: !0 }), r.create = function(o) {
    return _o(Ke(e, o));
  }, r;
}
const se = _o(Rt);
se.Axios = We;
se.CanceledError = Ot;
se.CancelToken = Ta;
se.isCancel = yo;
se.VERSION = Lr;
se.toFormData = Wt;
se.AxiosError = A;
se.Cancel = se.CanceledError;
se.all = function(t) {
  return Promise.all(t);
};
se.spread = Ra;
se.isAxiosError = Oa;
se.mergeConfig = Ke;
se.AxiosHeaders = me;
se.formToJSON = (e) => mo(d.isHTMLForm(e) ? new FormData(e) : e);
se.getAdapter = Oo.getAdapter;
se.HttpStatusCode = Ut;
se.default = se;
const {
  Axios: Xl,
  AxiosError: Ql,
  CanceledError: Zl,
  isCancel: eu,
  CancelToken: tu,
  VERSION: ru,
  all: nu,
  Cancel: ou,
  isAxiosError: su,
  spread: iu,
  toFormData: au,
  AxiosHeaders: cu,
  HttpStatusCode: lu,
  formToJSON: uu,
  getAdapter: fu,
  mergeConfig: du,
  create: pu
} = se, Ca = [
  le.ENDPOINTS.REFRESH,
  le.ENDPOINTS.MAGIC_LINK_REQUEST,
  le.ENDPOINTS.MAGIC_LINK_VERIFY,
  le.ENDPOINTS.PASSKEY_LOGIN_OPTIONS,
  le.ENDPOINTS.PASSKEY_LOGIN_VERIFY
], _a = (e) => !!e && Ca.some((t) => e.split("?")[0].endsWith(t)), Aa = (e, t) => {
  const r = se.create({
    baseURL: e,
    timeout: le.DEFAULT_CONFIG.TIMEOUT,
    headers: {
      "Content-Type": "application/json",
      ...t && { "X-API-Key": t }
    }
  });
  return r.interceptors.request.use(
    (n) => {
      const o = xe.getAccessToken();
      return o && n.headers && (n.headers.Authorization = `Bearer ${o}`), n;
    },
    (n) => Promise.reject(n)
  ), r.interceptors.response.use(
    (n) => n,
    async (n) => {
      const o = n.config;
      if (n.response?.status === le.STATUS_CODES.UNAUTHORIZED && !o._retry && !_a(o.url)) {
        o._retry = !0;
        try {
          const s = xe.getRefreshToken();
          if (!s)
            throw new Error(hs.NO_REFRESH_TOKEN);
          const i = await r.post(le.ENDPOINTS.REFRESH, {
            refreshToken: s
          }), a = {
            accessToken: i.data.accessToken,
            refreshToken: i.data.refreshToken
          };
          return xe.setTokens(a.accessToken, a.refreshToken), o.headers && (o.headers.Authorization = `Bearer ${a.accessToken}`), r(o);
        } catch (s) {
          return xe.clearTokens(), window.location.href = "/login", Promise.reject(s);
        }
      }
      return Promise.reject(n);
    }
  ), r;
};
let xt = null;
const _e = (e, t) => {
  if (!xt && e && (xt = Aa(e, t)), !xt)
    throw new Error("API client not initialized. Please provide baseURL.");
  return xt;
}, dn = (e, t) => e?.name === "NotAllowedError" ? "Passkey request was cancelled or timed out" : e?.name === "InvalidStateError" ? "A passkey for this account is already registered on this device" : e?.response?.data?.message || e?.message || t, Ne = {
  /**
   * Logout user and invalidate refresh token
   * @param refreshToken - The refresh token to invalidate
   * @returns Promise resolving when logout is complete
   */
  logout: async (e) => {
    try {
      await _e().post(le.ENDPOINTS.LOGOUT, {
        refreshToken: e
      });
    } catch (t) {
      console.error("Logout API call failed:", t);
    }
  },
  /**
   * Refresh access token using refresh token
   * @param refreshToken - The refresh token
   * @returns Promise resolving to new authentication tokens
   */
  refresh: async (e) => {
    try {
      const r = await _e().post(le.ENDPOINTS.REFRESH, {
        refreshToken: e
      });
      return {
        accessToken: r.data.accessToken,
        refreshToken: r.data.refreshToken
      };
    } catch (t) {
      throw new Error(
        t.response?.data?.message || t.message || "Token refresh failed"
      );
    }
  },
  /**
   * Get current user profile
   * @returns Promise resolving to user profile
   */
  getCurrentUser: async () => {
    try {
      const t = await _e().get(le.ENDPOINTS.USER_ME), r = t.data?.data ?? t.data;
      return {
        id: r.id,
        email: r.email,
        name: r.name,
        profilePicture: r.profilePicture,
        role: r.role
      };
    } catch (e) {
      throw new Error(
        e.response?.data?.message || e.message || "Failed to fetch user profile"
      );
    }
  },
  /**
   * Initiate an OAuth flow (Google, Microsoft) by redirecting to Lumora API
   * @param endpoint - The provider's OAuth start endpoint on the Lumora API
   * @param redirectUri - The URI to redirect to after OAuth completion
   * @param apiBaseUrl - The base URL of the Lumora API
   */
  initiateOAuth: (e, t, r) => {
    const n = `${r}${e}?redirect_uri=${encodeURIComponent(t)}&prompt=select_account`;
    window.location.href = n;
  },
  /**
   * Request a one-time sign-in link to be emailed to the user
   * @param email - User's email address
   * @param redirectUri - Frontend URI the emailed link should point to
   * @returns Promise resolving when the request has been accepted
   */
  requestMagicLink: async (e, t) => {
    try {
      await _e().post(le.ENDPOINTS.MAGIC_LINK_REQUEST, {
        email: e,
        redirectUri: t
      });
    } catch (r) {
      throw new Error(
        r.response?.data?.message || r.message || "Failed to send sign-in link"
      );
    }
  },
  /**
   * Exchange a magic link token for authentication tokens
   * @param token - The one-time token from the emailed link
   * @returns Promise resolving to authentication tokens
   */
  verifyMagicLink: async (e) => {
    try {
      const r = await _e().post(le.ENDPOINTS.MAGIC_LINK_VERIFY, {
        token: e
      });
      return {
        accessToken: r.data.accessToken,
        refreshToken: r.data.refreshToken
      };
    } catch (t) {
      throw new Error(
        t.response?.data?.message || t.message || "Sign-in link is invalid or has expired"
      );
    }
  },
  /**
   * Sign in with a passkey (discoverable credential, no email required)
   * @returns Promise resolving to authentication tokens
   */
  loginWithPasskey: async () => {
    try {
      const e = _e(), t = await e.post(le.ENDPOINTS.PASSKEY_LOGIN_OPTIONS), { challengeId: r, options: n } = t.data, o = await ls({ optionsJSON: n }), s = await e.post(
        le.ENDPOINTS.PASSKEY_LOGIN_VERIFY,
        { challengeId: r, response: o },
        { withCredentials: !0 }
      );
      return {
        tokens: {
          accessToken: s.data.accessToken,
          refreshToken: s.data.refreshToken
        },
        user: s.data.user
      };
    } catch (e) {
      throw new Error(dn(e, "Passkey sign-in failed"));
    }
  },
  /**
   * Register a new passkey for the currently signed-in user
   * @param name - Optional friendly name for the passkey (e.g. "MacBook Pro")
   * @returns Promise resolving to the stored passkey info
   */
  registerPasskey: async (e) => {
    try {
      const t = _e(), r = await t.post(le.ENDPOINTS.PASSKEY_REGISTER_OPTIONS), { challengeId: n, options: o } = r.data, s = await is({ optionsJSON: o });
      return (await t.post(le.ENDPOINTS.PASSKEY_REGISTER_VERIFY, {
        challengeId: n,
        response: s,
        name: e
      })).data;
    } catch (t) {
      throw new Error(dn(t, "Passkey registration failed"));
    }
  }
};
function Be(e, ...t) {
  const r = new URL(`https://mui.com/production-error/?code=${e}`);
  return t.forEach((n) => r.searchParams.append("args[]", n)), `Minified MUI error #${e}; visit ${r} for the full message.`;
}
const xa = "$$material";
function va(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var vt = { exports: {} }, Pt = { exports: {} }, z = {};
var pn;
function Pa() {
  if (pn) return z;
  pn = 1;
  var e = typeof Symbol == "function" && Symbol.for, t = e ? /* @__PURE__ */ Symbol.for("react.element") : 60103, r = e ? /* @__PURE__ */ Symbol.for("react.portal") : 60106, n = e ? /* @__PURE__ */ Symbol.for("react.fragment") : 60107, o = e ? /* @__PURE__ */ Symbol.for("react.strict_mode") : 60108, s = e ? /* @__PURE__ */ Symbol.for("react.profiler") : 60114, i = e ? /* @__PURE__ */ Symbol.for("react.provider") : 60109, a = e ? /* @__PURE__ */ Symbol.for("react.context") : 60110, c = e ? /* @__PURE__ */ Symbol.for("react.async_mode") : 60111, f = e ? /* @__PURE__ */ Symbol.for("react.concurrent_mode") : 60111, u = e ? /* @__PURE__ */ Symbol.for("react.forward_ref") : 60112, p = e ? /* @__PURE__ */ Symbol.for("react.suspense") : 60113, m = e ? /* @__PURE__ */ Symbol.for("react.suspense_list") : 60120, E = e ? /* @__PURE__ */ Symbol.for("react.memo") : 60115, y = e ? /* @__PURE__ */ Symbol.for("react.lazy") : 60116, h = e ? /* @__PURE__ */ Symbol.for("react.block") : 60121, T = e ? /* @__PURE__ */ Symbol.for("react.fundamental") : 60117, g = e ? /* @__PURE__ */ Symbol.for("react.responder") : 60118, R = e ? /* @__PURE__ */ Symbol.for("react.scope") : 60119;
  function x(w) {
    if (typeof w == "object" && w !== null) {
      var k = w.$$typeof;
      switch (k) {
        case t:
          switch (w = w.type, w) {
            case c:
            case f:
            case n:
            case s:
            case o:
            case p:
              return w;
            default:
              switch (w = w && w.$$typeof, w) {
                case a:
                case u:
                case y:
                case E:
                case i:
                  return w;
                default:
                  return k;
              }
          }
        case r:
          return k;
      }
    }
  }
  function S(w) {
    return x(w) === f;
  }
  return z.AsyncMode = c, z.ConcurrentMode = f, z.ContextConsumer = a, z.ContextProvider = i, z.Element = t, z.ForwardRef = u, z.Fragment = n, z.Lazy = y, z.Memo = E, z.Portal = r, z.Profiler = s, z.StrictMode = o, z.Suspense = p, z.isAsyncMode = function(w) {
    return S(w) || x(w) === c;
  }, z.isConcurrentMode = S, z.isContextConsumer = function(w) {
    return x(w) === a;
  }, z.isContextProvider = function(w) {
    return x(w) === i;
  }, z.isElement = function(w) {
    return typeof w == "object" && w !== null && w.$$typeof === t;
  }, z.isForwardRef = function(w) {
    return x(w) === u;
  }, z.isFragment = function(w) {
    return x(w) === n;
  }, z.isLazy = function(w) {
    return x(w) === y;
  }, z.isMemo = function(w) {
    return x(w) === E;
  }, z.isPortal = function(w) {
    return x(w) === r;
  }, z.isProfiler = function(w) {
    return x(w) === s;
  }, z.isStrictMode = function(w) {
    return x(w) === o;
  }, z.isSuspense = function(w) {
    return x(w) === p;
  }, z.isValidElementType = function(w) {
    return typeof w == "string" || typeof w == "function" || w === n || w === f || w === s || w === o || w === p || w === m || typeof w == "object" && w !== null && (w.$$typeof === y || w.$$typeof === E || w.$$typeof === i || w.$$typeof === a || w.$$typeof === u || w.$$typeof === T || w.$$typeof === g || w.$$typeof === R || w.$$typeof === h);
  }, z.typeOf = x, z;
}
var K = {};
var hn;
function ka() {
  return hn || (hn = 1, process.env.NODE_ENV !== "production" && (function() {
    var e = typeof Symbol == "function" && Symbol.for, t = e ? /* @__PURE__ */ Symbol.for("react.element") : 60103, r = e ? /* @__PURE__ */ Symbol.for("react.portal") : 60106, n = e ? /* @__PURE__ */ Symbol.for("react.fragment") : 60107, o = e ? /* @__PURE__ */ Symbol.for("react.strict_mode") : 60108, s = e ? /* @__PURE__ */ Symbol.for("react.profiler") : 60114, i = e ? /* @__PURE__ */ Symbol.for("react.provider") : 60109, a = e ? /* @__PURE__ */ Symbol.for("react.context") : 60110, c = e ? /* @__PURE__ */ Symbol.for("react.async_mode") : 60111, f = e ? /* @__PURE__ */ Symbol.for("react.concurrent_mode") : 60111, u = e ? /* @__PURE__ */ Symbol.for("react.forward_ref") : 60112, p = e ? /* @__PURE__ */ Symbol.for("react.suspense") : 60113, m = e ? /* @__PURE__ */ Symbol.for("react.suspense_list") : 60120, E = e ? /* @__PURE__ */ Symbol.for("react.memo") : 60115, y = e ? /* @__PURE__ */ Symbol.for("react.lazy") : 60116, h = e ? /* @__PURE__ */ Symbol.for("react.block") : 60121, T = e ? /* @__PURE__ */ Symbol.for("react.fundamental") : 60117, g = e ? /* @__PURE__ */ Symbol.for("react.responder") : 60118, R = e ? /* @__PURE__ */ Symbol.for("react.scope") : 60119;
    function x(_) {
      return typeof _ == "string" || typeof _ == "function" || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
      _ === n || _ === f || _ === s || _ === o || _ === p || _ === m || typeof _ == "object" && _ !== null && (_.$$typeof === y || _.$$typeof === E || _.$$typeof === i || _.$$typeof === a || _.$$typeof === u || _.$$typeof === T || _.$$typeof === g || _.$$typeof === R || _.$$typeof === h);
    }
    function S(_) {
      if (typeof _ == "object" && _ !== null) {
        var ce = _.$$typeof;
        switch (ce) {
          case t:
            var ye = _.type;
            switch (ye) {
              case c:
              case f:
              case n:
              case s:
              case o:
              case p:
                return ye;
              default:
                var st = ye && ye.$$typeof;
                switch (st) {
                  case a:
                  case u:
                  case y:
                  case E:
                  case i:
                    return st;
                  default:
                    return ce;
                }
            }
          case r:
            return ce;
        }
      }
    }
    var w = c, k = f, H = a, re = i, ee = t, Z = u, Y = n, l = y, v = E, O = r, D = s, q = o, ae = p, ge = !1;
    function ot(_) {
      return ge || (ge = !0, console.warn("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 17+. Update your code to use ReactIs.isConcurrentMode() instead. It has the exact same API.")), C(_) || S(_) === c;
    }
    function C(_) {
      return S(_) === f;
    }
    function P(_) {
      return S(_) === a;
    }
    function I(_) {
      return S(_) === i;
    }
    function U(_) {
      return typeof _ == "object" && _ !== null && _.$$typeof === t;
    }
    function $(_) {
      return S(_) === u;
    }
    function j(_) {
      return S(_) === n;
    }
    function M(_) {
      return S(_) === y;
    }
    function N(_) {
      return S(_) === E;
    }
    function L(_) {
      return S(_) === r;
    }
    function W(_) {
      return S(_) === s;
    }
    function V(_) {
      return S(_) === o;
    }
    function de(_) {
      return S(_) === p;
    }
    K.AsyncMode = w, K.ConcurrentMode = k, K.ContextConsumer = H, K.ContextProvider = re, K.Element = ee, K.ForwardRef = Z, K.Fragment = Y, K.Lazy = l, K.Memo = v, K.Portal = O, K.Profiler = D, K.StrictMode = q, K.Suspense = ae, K.isAsyncMode = ot, K.isConcurrentMode = C, K.isContextConsumer = P, K.isContextProvider = I, K.isElement = U, K.isForwardRef = $, K.isFragment = j, K.isLazy = M, K.isMemo = N, K.isPortal = L, K.isProfiler = W, K.isStrictMode = V, K.isSuspense = de, K.isValidElementType = x, K.typeOf = S;
  })()), K;
}
var mn;
function Ao() {
  return mn || (mn = 1, process.env.NODE_ENV === "production" ? Pt.exports = Pa() : Pt.exports = ka()), Pt.exports;
}
var gr, gn;
function Na() {
  if (gn) return gr;
  gn = 1;
  var e = Object.getOwnPropertySymbols, t = Object.prototype.hasOwnProperty, r = Object.prototype.propertyIsEnumerable;
  function n(s) {
    if (s == null)
      throw new TypeError("Object.assign cannot be called with null or undefined");
    return Object(s);
  }
  function o() {
    try {
      if (!Object.assign)
        return !1;
      var s = new String("abc");
      if (s[5] = "de", Object.getOwnPropertyNames(s)[0] === "5")
        return !1;
      for (var i = {}, a = 0; a < 10; a++)
        i["_" + String.fromCharCode(a)] = a;
      var c = Object.getOwnPropertyNames(i).map(function(u) {
        return i[u];
      });
      if (c.join("") !== "0123456789")
        return !1;
      var f = {};
      return "abcdefghijklmnopqrst".split("").forEach(function(u) {
        f[u] = u;
      }), Object.keys(Object.assign({}, f)).join("") === "abcdefghijklmnopqrst";
    } catch {
      return !1;
    }
  }
  return gr = o() ? Object.assign : function(s, i) {
    for (var a, c = n(s), f, u = 1; u < arguments.length; u++) {
      a = Object(arguments[u]);
      for (var p in a)
        t.call(a, p) && (c[p] = a[p]);
      if (e) {
        f = e(a);
        for (var m = 0; m < f.length; m++)
          r.call(a, f[m]) && (c[f[m]] = a[f[m]]);
      }
    }
    return c;
  }, gr;
}
var yr, yn;
function Br() {
  if (yn) return yr;
  yn = 1;
  var e = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
  return yr = e, yr;
}
var br, bn;
function xo() {
  return bn || (bn = 1, br = Function.call.bind(Object.prototype.hasOwnProperty)), br;
}
var Er, En;
function Ia() {
  if (En) return Er;
  En = 1;
  var e = function() {
  };
  if (process.env.NODE_ENV !== "production") {
    var t = /* @__PURE__ */ Br(), r = {}, n = /* @__PURE__ */ xo();
    e = function(s) {
      var i = "Warning: " + s;
      typeof console < "u" && console.error(i);
      try {
        throw new Error(i);
      } catch {
      }
    };
  }
  function o(s, i, a, c, f) {
    if (process.env.NODE_ENV !== "production") {
      for (var u in s)
        if (n(s, u)) {
          var p;
          try {
            if (typeof s[u] != "function") {
              var m = Error(
                (c || "React class") + ": " + a + " type `" + u + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof s[u] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`."
              );
              throw m.name = "Invariant Violation", m;
            }
            p = s[u](i, u, c, a, null, t);
          } catch (y) {
            p = y;
          }
          if (p && !(p instanceof Error) && e(
            (c || "React class") + ": type specification of " + a + " `" + u + "` is invalid; the type checker function must return `null` or an `Error` but returned a " + typeof p + ". You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument)."
          ), p instanceof Error && !(p.message in r)) {
            r[p.message] = !0;
            var E = f ? f() : "";
            e(
              "Failed " + a + " type: " + p.message + (E ?? "")
            );
          }
        }
    }
  }
  return o.resetWarningCache = function() {
    process.env.NODE_ENV !== "production" && (r = {});
  }, Er = o, Er;
}
var Sr, Sn;
function $a() {
  if (Sn) return Sr;
  Sn = 1;
  var e = Ao(), t = Na(), r = /* @__PURE__ */ Br(), n = /* @__PURE__ */ xo(), o = /* @__PURE__ */ Ia(), s = function() {
  };
  process.env.NODE_ENV !== "production" && (s = function(a) {
    var c = "Warning: " + a;
    typeof console < "u" && console.error(c);
    try {
      throw new Error(c);
    } catch {
    }
  });
  function i() {
    return null;
  }
  return Sr = function(a, c) {
    var f = typeof Symbol == "function" && Symbol.iterator, u = "@@iterator";
    function p(C) {
      var P = C && (f && C[f] || C[u]);
      if (typeof P == "function")
        return P;
    }
    var m = "<<anonymous>>", E = {
      array: g("array"),
      bigint: g("bigint"),
      bool: g("boolean"),
      func: g("function"),
      number: g("number"),
      object: g("object"),
      string: g("string"),
      symbol: g("symbol"),
      any: R(),
      arrayOf: x,
      element: S(),
      elementType: w(),
      instanceOf: k,
      node: Z(),
      objectOf: re,
      oneOf: H,
      oneOfType: ee,
      shape: l,
      exact: v
    };
    function y(C, P) {
      return C === P ? C !== 0 || 1 / C === 1 / P : C !== C && P !== P;
    }
    function h(C, P) {
      this.message = C, this.data = P && typeof P == "object" ? P : {}, this.stack = "";
    }
    h.prototype = Error.prototype;
    function T(C) {
      if (process.env.NODE_ENV !== "production")
        var P = {}, I = 0;
      function U(j, M, N, L, W, V, de) {
        if (L = L || m, V = V || N, de !== r) {
          if (c) {
            var _ = new Error(
              "Calling PropTypes validators directly is not supported by the `prop-types` package. Use `PropTypes.checkPropTypes()` to call them. Read more at http://fb.me/use-check-prop-types"
            );
            throw _.name = "Invariant Violation", _;
          } else if (process.env.NODE_ENV !== "production" && typeof console < "u") {
            var ce = L + ":" + N;
            !P[ce] && // Avoid spamming the console because they are often not actionable except for lib authors
            I < 3 && (s(
              "You are manually calling a React.PropTypes validation function for the `" + V + "` prop on `" + L + "`. This is deprecated and will throw in the standalone `prop-types` package. You may be seeing this warning due to a third-party PropTypes library. See https://fb.me/react-warning-dont-call-proptypes for details."
            ), P[ce] = !0, I++);
          }
        }
        return M[N] == null ? j ? M[N] === null ? new h("The " + W + " `" + V + "` is marked as required " + ("in `" + L + "`, but its value is `null`.")) : new h("The " + W + " `" + V + "` is marked as required in " + ("`" + L + "`, but its value is `undefined`.")) : null : C(M, N, L, W, V);
      }
      var $ = U.bind(null, !1);
      return $.isRequired = U.bind(null, !0), $;
    }
    function g(C) {
      function P(I, U, $, j, M, N) {
        var L = I[U], W = q(L);
        if (W !== C) {
          var V = ae(L);
          return new h(
            "Invalid " + j + " `" + M + "` of type " + ("`" + V + "` supplied to `" + $ + "`, expected ") + ("`" + C + "`."),
            { expectedType: C }
          );
        }
        return null;
      }
      return T(P);
    }
    function R() {
      return T(i);
    }
    function x(C) {
      function P(I, U, $, j, M) {
        if (typeof C != "function")
          return new h("Property `" + M + "` of component `" + $ + "` has invalid PropType notation inside arrayOf.");
        var N = I[U];
        if (!Array.isArray(N)) {
          var L = q(N);
          return new h("Invalid " + j + " `" + M + "` of type " + ("`" + L + "` supplied to `" + $ + "`, expected an array."));
        }
        for (var W = 0; W < N.length; W++) {
          var V = C(N, W, $, j, M + "[" + W + "]", r);
          if (V instanceof Error)
            return V;
        }
        return null;
      }
      return T(P);
    }
    function S() {
      function C(P, I, U, $, j) {
        var M = P[I];
        if (!a(M)) {
          var N = q(M);
          return new h("Invalid " + $ + " `" + j + "` of type " + ("`" + N + "` supplied to `" + U + "`, expected a single ReactElement."));
        }
        return null;
      }
      return T(C);
    }
    function w() {
      function C(P, I, U, $, j) {
        var M = P[I];
        if (!e.isValidElementType(M)) {
          var N = q(M);
          return new h("Invalid " + $ + " `" + j + "` of type " + ("`" + N + "` supplied to `" + U + "`, expected a single ReactElement type."));
        }
        return null;
      }
      return T(C);
    }
    function k(C) {
      function P(I, U, $, j, M) {
        if (!(I[U] instanceof C)) {
          var N = C.name || m, L = ot(I[U]);
          return new h("Invalid " + j + " `" + M + "` of type " + ("`" + L + "` supplied to `" + $ + "`, expected ") + ("instance of `" + N + "`."));
        }
        return null;
      }
      return T(P);
    }
    function H(C) {
      if (!Array.isArray(C))
        return process.env.NODE_ENV !== "production" && (arguments.length > 1 ? s(
          "Invalid arguments supplied to oneOf, expected an array, got " + arguments.length + " arguments. A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z])."
        ) : s("Invalid argument supplied to oneOf, expected an array.")), i;
      function P(I, U, $, j, M) {
        for (var N = I[U], L = 0; L < C.length; L++)
          if (y(N, C[L]))
            return null;
        var W = JSON.stringify(C, function(de, _) {
          var ce = ae(_);
          return ce === "symbol" ? String(_) : _;
        });
        return new h("Invalid " + j + " `" + M + "` of value `" + String(N) + "` " + ("supplied to `" + $ + "`, expected one of " + W + "."));
      }
      return T(P);
    }
    function re(C) {
      function P(I, U, $, j, M) {
        if (typeof C != "function")
          return new h("Property `" + M + "` of component `" + $ + "` has invalid PropType notation inside objectOf.");
        var N = I[U], L = q(N);
        if (L !== "object")
          return new h("Invalid " + j + " `" + M + "` of type " + ("`" + L + "` supplied to `" + $ + "`, expected an object."));
        for (var W in N)
          if (n(N, W)) {
            var V = C(N, W, $, j, M + "." + W, r);
            if (V instanceof Error)
              return V;
          }
        return null;
      }
      return T(P);
    }
    function ee(C) {
      if (!Array.isArray(C))
        return process.env.NODE_ENV !== "production" && s("Invalid argument supplied to oneOfType, expected an instance of array."), i;
      for (var P = 0; P < C.length; P++) {
        var I = C[P];
        if (typeof I != "function")
          return s(
            "Invalid argument supplied to oneOfType. Expected an array of check functions, but received " + ge(I) + " at index " + P + "."
          ), i;
      }
      function U($, j, M, N, L) {
        for (var W = [], V = 0; V < C.length; V++) {
          var de = C[V], _ = de($, j, M, N, L, r);
          if (_ == null)
            return null;
          _.data && n(_.data, "expectedType") && W.push(_.data.expectedType);
        }
        var ce = W.length > 0 ? ", expected one of type [" + W.join(", ") + "]" : "";
        return new h("Invalid " + N + " `" + L + "` supplied to " + ("`" + M + "`" + ce + "."));
      }
      return T(U);
    }
    function Z() {
      function C(P, I, U, $, j) {
        return O(P[I]) ? null : new h("Invalid " + $ + " `" + j + "` supplied to " + ("`" + U + "`, expected a ReactNode."));
      }
      return T(C);
    }
    function Y(C, P, I, U, $) {
      return new h(
        (C || "React class") + ": " + P + " type `" + I + "." + U + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + $ + "`."
      );
    }
    function l(C) {
      function P(I, U, $, j, M) {
        var N = I[U], L = q(N);
        if (L !== "object")
          return new h("Invalid " + j + " `" + M + "` of type `" + L + "` " + ("supplied to `" + $ + "`, expected `object`."));
        for (var W in C) {
          var V = C[W];
          if (typeof V != "function")
            return Y($, j, M, W, ae(V));
          var de = V(N, W, $, j, M + "." + W, r);
          if (de)
            return de;
        }
        return null;
      }
      return T(P);
    }
    function v(C) {
      function P(I, U, $, j, M) {
        var N = I[U], L = q(N);
        if (L !== "object")
          return new h("Invalid " + j + " `" + M + "` of type `" + L + "` " + ("supplied to `" + $ + "`, expected `object`."));
        var W = t({}, I[U], C);
        for (var V in W) {
          var de = C[V];
          if (n(C, V) && typeof de != "function")
            return Y($, j, M, V, ae(de));
          if (!de)
            return new h(
              "Invalid " + j + " `" + M + "` key `" + V + "` supplied to `" + $ + "`.\nBad object: " + JSON.stringify(I[U], null, "  ") + `
Valid keys: ` + JSON.stringify(Object.keys(C), null, "  ")
            );
          var _ = de(N, V, $, j, M + "." + V, r);
          if (_)
            return _;
        }
        return null;
      }
      return T(P);
    }
    function O(C) {
      switch (typeof C) {
        case "number":
        case "string":
        case "undefined":
          return !0;
        case "boolean":
          return !C;
        case "object":
          if (Array.isArray(C))
            return C.every(O);
          if (C === null || a(C))
            return !0;
          var P = p(C);
          if (P) {
            var I = P.call(C), U;
            if (P !== C.entries) {
              for (; !(U = I.next()).done; )
                if (!O(U.value))
                  return !1;
            } else
              for (; !(U = I.next()).done; ) {
                var $ = U.value;
                if ($ && !O($[1]))
                  return !1;
              }
          } else
            return !1;
          return !0;
        default:
          return !1;
      }
    }
    function D(C, P) {
      return C === "symbol" ? !0 : P ? P["@@toStringTag"] === "Symbol" || typeof Symbol == "function" && P instanceof Symbol : !1;
    }
    function q(C) {
      var P = typeof C;
      return Array.isArray(C) ? "array" : C instanceof RegExp ? "object" : D(P, C) ? "symbol" : P;
    }
    function ae(C) {
      if (typeof C > "u" || C === null)
        return "" + C;
      var P = q(C);
      if (P === "object") {
        if (C instanceof Date)
          return "date";
        if (C instanceof RegExp)
          return "regexp";
      }
      return P;
    }
    function ge(C) {
      var P = ae(C);
      switch (P) {
        case "array":
        case "object":
          return "an " + P;
        case "boolean":
        case "date":
        case "regexp":
          return "a " + P;
        default:
          return P;
      }
    }
    function ot(C) {
      return !C.constructor || !C.constructor.name ? m : C.constructor.name;
    }
    return E.checkPropTypes = o, E.resetWarningCache = o.resetWarningCache, E.PropTypes = E, E;
  }, Sr;
}
var wr, wn;
function Da() {
  if (wn) return wr;
  wn = 1;
  var e = /* @__PURE__ */ Br();
  function t() {
  }
  function r() {
  }
  return r.resetWarningCache = t, wr = function() {
    function n(i, a, c, f, u, p) {
      if (p !== e) {
        var m = new Error(
          "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types"
        );
        throw m.name = "Invariant Violation", m;
      }
    }
    n.isRequired = n;
    function o() {
      return n;
    }
    var s = {
      array: n,
      bigint: n,
      bool: n,
      func: n,
      number: n,
      object: n,
      string: n,
      symbol: n,
      any: n,
      arrayOf: o,
      element: n,
      elementType: n,
      instanceOf: o,
      node: n,
      objectOf: o,
      oneOf: o,
      oneOfType: o,
      shape: o,
      exact: o,
      checkPropTypes: r,
      resetWarningCache: t
    };
    return s.PropTypes = s, s;
  }, wr;
}
var Tn;
function La() {
  if (Tn) return vt.exports;
  if (Tn = 1, process.env.NODE_ENV !== "production") {
    var e = Ao(), t = !0;
    vt.exports = /* @__PURE__ */ $a()(e.isElement, t);
  } else
    vt.exports = /* @__PURE__ */ Da()();
  return vt.exports;
}
var Ua = /* @__PURE__ */ La();
const ut = /* @__PURE__ */ va(Ua);
var kt = { exports: {} }, X = {};
var Rn;
function Ba() {
  if (Rn) return X;
  Rn = 1;
  var e = /* @__PURE__ */ Symbol.for("react.transitional.element"), t = /* @__PURE__ */ Symbol.for("react.portal"), r = /* @__PURE__ */ Symbol.for("react.fragment"), n = /* @__PURE__ */ Symbol.for("react.strict_mode"), o = /* @__PURE__ */ Symbol.for("react.profiler"), s = /* @__PURE__ */ Symbol.for("react.consumer"), i = /* @__PURE__ */ Symbol.for("react.context"), a = /* @__PURE__ */ Symbol.for("react.forward_ref"), c = /* @__PURE__ */ Symbol.for("react.suspense"), f = /* @__PURE__ */ Symbol.for("react.suspense_list"), u = /* @__PURE__ */ Symbol.for("react.memo"), p = /* @__PURE__ */ Symbol.for("react.lazy"), m = /* @__PURE__ */ Symbol.for("react.view_transition"), E = /* @__PURE__ */ Symbol.for("react.client.reference");
  function y(h) {
    if (typeof h == "object" && h !== null) {
      var T = h.$$typeof;
      switch (T) {
        case e:
          switch (h = h.type, h) {
            case r:
            case o:
            case n:
            case c:
            case f:
            case m:
              return h;
            default:
              switch (h = h && h.$$typeof, h) {
                case i:
                case a:
                case p:
                case u:
                  return h;
                case s:
                  return h;
                default:
                  return T;
              }
          }
        case t:
          return T;
      }
    }
  }
  return X.ContextConsumer = s, X.ContextProvider = i, X.Element = e, X.ForwardRef = a, X.Fragment = r, X.Lazy = p, X.Memo = u, X.Portal = t, X.Profiler = o, X.StrictMode = n, X.Suspense = c, X.SuspenseList = f, X.isContextConsumer = function(h) {
    return y(h) === s;
  }, X.isContextProvider = function(h) {
    return y(h) === i;
  }, X.isElement = function(h) {
    return typeof h == "object" && h !== null && h.$$typeof === e;
  }, X.isForwardRef = function(h) {
    return y(h) === a;
  }, X.isFragment = function(h) {
    return y(h) === r;
  }, X.isLazy = function(h) {
    return y(h) === p;
  }, X.isMemo = function(h) {
    return y(h) === u;
  }, X.isPortal = function(h) {
    return y(h) === t;
  }, X.isProfiler = function(h) {
    return y(h) === o;
  }, X.isStrictMode = function(h) {
    return y(h) === n;
  }, X.isSuspense = function(h) {
    return y(h) === c;
  }, X.isSuspenseList = function(h) {
    return y(h) === f;
  }, X.isValidElementType = function(h) {
    return typeof h == "string" || typeof h == "function" || h === r || h === o || h === n || h === c || h === f || typeof h == "object" && h !== null && (h.$$typeof === p || h.$$typeof === u || h.$$typeof === i || h.$$typeof === s || h.$$typeof === a || h.$$typeof === E || h.getModuleId !== void 0);
  }, X.typeOf = y, X;
}
var Q = {};
var On;
function Fa() {
  return On || (On = 1, process.env.NODE_ENV !== "production" && (function() {
    function e(h) {
      if (typeof h == "object" && h !== null) {
        var T = h.$$typeof;
        switch (T) {
          case t:
            switch (h = h.type, h) {
              case n:
              case s:
              case o:
              case f:
              case u:
              case E:
                return h;
              default:
                switch (h = h && h.$$typeof, h) {
                  case a:
                  case c:
                  case m:
                  case p:
                    return h;
                  case i:
                    return h;
                  default:
                    return T;
                }
            }
          case r:
            return T;
        }
      }
    }
    var t = /* @__PURE__ */ Symbol.for("react.transitional.element"), r = /* @__PURE__ */ Symbol.for("react.portal"), n = /* @__PURE__ */ Symbol.for("react.fragment"), o = /* @__PURE__ */ Symbol.for("react.strict_mode"), s = /* @__PURE__ */ Symbol.for("react.profiler"), i = /* @__PURE__ */ Symbol.for("react.consumer"), a = /* @__PURE__ */ Symbol.for("react.context"), c = /* @__PURE__ */ Symbol.for("react.forward_ref"), f = /* @__PURE__ */ Symbol.for("react.suspense"), u = /* @__PURE__ */ Symbol.for("react.suspense_list"), p = /* @__PURE__ */ Symbol.for("react.memo"), m = /* @__PURE__ */ Symbol.for("react.lazy"), E = /* @__PURE__ */ Symbol.for("react.view_transition"), y = /* @__PURE__ */ Symbol.for("react.client.reference");
    Q.ContextConsumer = i, Q.ContextProvider = a, Q.Element = t, Q.ForwardRef = c, Q.Fragment = n, Q.Lazy = m, Q.Memo = p, Q.Portal = r, Q.Profiler = s, Q.StrictMode = o, Q.Suspense = f, Q.SuspenseList = u, Q.isContextConsumer = function(h) {
      return e(h) === i;
    }, Q.isContextProvider = function(h) {
      return e(h) === a;
    }, Q.isElement = function(h) {
      return typeof h == "object" && h !== null && h.$$typeof === t;
    }, Q.isForwardRef = function(h) {
      return e(h) === c;
    }, Q.isFragment = function(h) {
      return e(h) === n;
    }, Q.isLazy = function(h) {
      return e(h) === m;
    }, Q.isMemo = function(h) {
      return e(h) === p;
    }, Q.isPortal = function(h) {
      return e(h) === r;
    }, Q.isProfiler = function(h) {
      return e(h) === s;
    }, Q.isStrictMode = function(h) {
      return e(h) === o;
    }, Q.isSuspense = function(h) {
      return e(h) === f;
    }, Q.isSuspenseList = function(h) {
      return e(h) === u;
    }, Q.isValidElementType = function(h) {
      return typeof h == "string" || typeof h == "function" || h === n || h === s || h === o || h === f || h === u || typeof h == "object" && h !== null && (h.$$typeof === m || h.$$typeof === p || h.$$typeof === a || h.$$typeof === i || h.$$typeof === c || h.$$typeof === y || h.getModuleId !== void 0);
    }, Q.typeOf = e;
  })()), Q;
}
var Cn;
function Ma() {
  return Cn || (Cn = 1, process.env.NODE_ENV === "production" ? kt.exports = /* @__PURE__ */ Ba() : kt.exports = /* @__PURE__ */ Fa()), kt.exports;
}
var vo = /* @__PURE__ */ Ma();
function De(e) {
  if (typeof e != "object" || e === null)
    return !1;
  const t = Object.getPrototypeOf(e);
  return (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) && !(Symbol.toStringTag in e) && !(Symbol.iterator in e);
}
function Po(e) {
  if (/* @__PURE__ */ Ht.isValidElement(e) || vo.isValidElementType(e) || !De(e))
    return e;
  const t = {};
  return Object.keys(e).forEach((r) => {
    t[r] = Po(e[r]);
  }), t;
}
function Se(e, t, r = {
  clone: !0
}) {
  const n = r.clone ? {
    ...e
  } : e;
  return De(e) && De(t) && Object.keys(t).forEach((o) => {
    /* @__PURE__ */ Ht.isValidElement(t[o]) || vo.isValidElementType(t[o]) ? n[o] = t[o] : De(t[o]) && // Avoid prototype pollution
    Object.prototype.hasOwnProperty.call(e, o) && De(e[o]) ? n[o] = Se(e[o], t[o], r) : r.clone ? n[o] = De(t[o]) ? Po(t[o]) : t[o] : n[o] = t[o];
  }), n;
}
const ja = (e) => {
  const t = Object.keys(e).map((r) => ({
    key: r,
    val: e[r]
  })) || [];
  return t.sort((r, n) => r.val - n.val), t.reduce((r, n) => ({
    ...r,
    [n.key]: n.val
  }), {});
};
function Ha(e) {
  const {
    // The breakpoint **start** at this value.
    // For instance with the first breakpoint xs: [xs, sm).
    values: t = {
      xs: 0,
      // phone
      sm: 600,
      // tablet
      md: 900,
      // small laptop
      lg: 1200,
      // desktop
      xl: 1536
      // large screen
    },
    unit: r = "px",
    step: n = 5,
    ...o
  } = e, s = ja(t), i = Object.keys(s);
  function a(m) {
    return `@media (min-width:${typeof t[m] == "number" ? t[m] : m}${r})`;
  }
  function c(m) {
    return `@media (max-width:${(typeof t[m] == "number" ? t[m] : m) - n / 100}${r})`;
  }
  function f(m, E) {
    const y = i.indexOf(E);
    return `@media (min-width:${typeof t[m] == "number" ? t[m] : m}${r}) and (max-width:${(y !== -1 && typeof t[i[y]] == "number" ? t[i[y]] : E) - n / 100}${r})`;
  }
  function u(m) {
    return i.indexOf(m) + 1 < i.length ? f(m, i[i.indexOf(m) + 1]) : a(m);
  }
  function p(m) {
    const E = i.indexOf(m);
    return E === 0 ? a(i[1]) : E === i.length - 1 ? c(i[E]) : f(m, i[i.indexOf(m) + 1]).replace("@media", "@media not all and");
  }
  return {
    keys: i,
    values: s,
    up: a,
    down: c,
    between: f,
    only: u,
    not: p,
    unit: r,
    ...o
  };
}
function _n(e, t) {
  if (!e.containerQueries)
    return t;
  const r = Object.keys(t).filter((n) => n.startsWith("@container")).sort((n, o) => {
    const s = /min-width:\s*([0-9.]+)/;
    return +(n.match(s)?.[1] || 0) - +(o.match(s)?.[1] || 0);
  });
  return r.length ? r.reduce((n, o) => {
    const s = t[o];
    return delete n[o], n[o] = s, n;
  }, {
    ...t
  }) : t;
}
function Va(e, t) {
  return t === "@" || t.startsWith("@") && (e.some((r) => t.startsWith(`@${r}`)) || !!t.match(/^@\d/));
}
function Wa(e, t) {
  const r = t.match(/^@([^/]+)?\/?(.+)?$/);
  if (!r) {
    if (process.env.NODE_ENV !== "production")
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The provided shorthand ${`(${t})`} is invalid. The format should be \`@<breakpoint | number>\` or \`@<breakpoint | number>/<container>\`.
For example, \`@sm\` or \`@600\` or \`@40rem/sidebar\`.` : Be(18, `(${t})`));
    return null;
  }
  const [, n, o] = r, s = Number.isNaN(+n) ? n || 0 : +n;
  return e.containerQueries(o).up(s);
}
function qa(e) {
  const t = (s, i) => s.replace("@media", i ? `@container ${i}` : "@container");
  function r(s, i) {
    s.up = (...a) => t(e.breakpoints.up(...a), i), s.down = (...a) => t(e.breakpoints.down(...a), i), s.between = (...a) => t(e.breakpoints.between(...a), i), s.only = (...a) => t(e.breakpoints.only(...a), i), s.not = (...a) => {
      const c = t(e.breakpoints.not(...a), i);
      return c.includes("not all and") ? c.replace("not all and ", "").replace("min-width:", "width<").replace("max-width:", "width>").replace("and", "or") : c;
    };
  }
  const n = {}, o = (s) => (r(n, s), n);
  return r(o), {
    ...e,
    containerQueries: o
  };
}
const za = {
  borderRadius: 4
}, Me = process.env.NODE_ENV !== "production" ? ut.oneOfType([ut.number, ut.string, ut.object, ut.array]) : {};
function mt(e, t) {
  return t ? Se(e, t, {
    clone: !1
    // No need to clone deep, it's way faster.
  }) : e;
}
const zt = {
  xs: 0,
  // phone
  sm: 600,
  // tablet
  md: 900,
  // small laptop
  lg: 1200,
  // desktop
  xl: 1536
  // large screen
}, An = {
  // Sorted ASC by size. That's important.
  // It can't be configured as it's used statically for propTypes.
  keys: ["xs", "sm", "md", "lg", "xl"],
  up: (e) => `@media (min-width:${zt[e]}px)`
}, Ka = {
  containerQueries: (e) => ({
    up: (t) => {
      let r = typeof t == "number" ? t : zt[t] || t;
      return typeof r == "number" && (r = `${r}px`), e ? `@container ${e} (min-width:${r})` : `@container (min-width:${r})`;
    }
  })
};
function Ie(e, t, r) {
  const n = e.theme || {};
  if (Array.isArray(t)) {
    const s = n.breakpoints || An;
    return t.reduce((i, a, c) => (i[s.up(s.keys[c])] = r(t[c]), i), {});
  }
  if (typeof t == "object") {
    const s = n.breakpoints || An;
    return Object.keys(t).reduce((i, a) => {
      if (Va(s.keys, a)) {
        const c = Wa(n.containerQueries ? n : Ka, a);
        c && (i[c] = r(t[a], a));
      } else if (Object.keys(s.values || zt).includes(a)) {
        const c = s.up(a);
        i[c] = r(t[a], a);
      } else {
        const c = a;
        i[c] = t[c];
      }
      return i;
    }, {});
  }
  return r(t);
}
function Ya(e = {}) {
  return e.keys?.reduce((r, n) => {
    const o = e.up(n);
    return r[o] = {}, r;
  }, {}) || {};
}
function xn(e, t) {
  return e.reduce((r, n) => {
    const o = r[n];
    return (!o || Object.keys(o).length === 0) && delete r[n], r;
  }, t);
}
function ko(e) {
  if (typeof e != "string")
    throw new Error(process.env.NODE_ENV !== "production" ? "MUI: `capitalize(string)` expects a string argument." : Be(7));
  return e.charAt(0).toUpperCase() + e.slice(1);
}
function Kt(e, t, r = !0) {
  if (!t || typeof t != "string")
    return null;
  if (e && e.vars && r) {
    const n = `vars.${t}`.split(".").reduce((o, s) => o && o[s] ? o[s] : null, e);
    if (n != null)
      return n;
  }
  return t.split(".").reduce((n, o) => n && n[o] != null ? n[o] : null, e);
}
function jt(e, t, r, n = r) {
  let o;
  return typeof e == "function" ? o = e(r) : Array.isArray(e) ? o = e[r] || n : o = Kt(e, r) || n, t && (o = t(o, n, e)), o;
}
function ie(e) {
  const {
    prop: t,
    cssProperty: r = e.prop,
    themeKey: n,
    transform: o
  } = e, s = (i) => {
    if (i[t] == null)
      return null;
    const a = i[t], c = i.theme, f = Kt(c, n) || {};
    return Ie(i, a, (p) => {
      let m = jt(f, o, p);
      return p === m && typeof p == "string" && (m = jt(f, o, `${t}${p === "default" ? "" : ko(p)}`, p)), r === !1 ? m : {
        [r]: m
      };
    });
  };
  return s.propTypes = process.env.NODE_ENV !== "production" ? {
    [t]: Me
  } : {}, s.filterProps = [t], s;
}
function Ga(e) {
  const t = {};
  return (r) => (t[r] === void 0 && (t[r] = e(r)), t[r]);
}
const Ja = {
  m: "margin",
  p: "padding"
}, Xa = {
  t: "Top",
  r: "Right",
  b: "Bottom",
  l: "Left",
  x: ["Left", "Right"],
  y: ["Top", "Bottom"]
}, vn = {
  marginX: "mx",
  marginY: "my",
  paddingX: "px",
  paddingY: "py"
}, Qa = Ga((e) => {
  if (e.length > 2)
    if (vn[e])
      e = vn[e];
    else
      return [e];
  const [t, r] = e.split(""), n = Ja[t], o = Xa[r] || "";
  return Array.isArray(o) ? o.map((s) => n + s) : [n + o];
}), Yt = ["m", "mt", "mr", "mb", "ml", "mx", "my", "margin", "marginTop", "marginRight", "marginBottom", "marginLeft", "marginX", "marginY", "marginInline", "marginInlineStart", "marginInlineEnd", "marginBlock", "marginBlockStart", "marginBlockEnd"], Gt = ["p", "pt", "pr", "pb", "pl", "px", "py", "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "paddingX", "paddingY", "paddingInline", "paddingInlineStart", "paddingInlineEnd", "paddingBlock", "paddingBlockStart", "paddingBlockEnd"], Za = [...Yt, ...Gt];
function Ct(e, t, r, n) {
  const o = Kt(e, t, !0) ?? r;
  return typeof o == "number" || typeof o == "string" ? (s) => typeof s == "string" ? s : (process.env.NODE_ENV !== "production" && typeof s != "number" && console.error(`MUI: Expected ${n} argument to be a number or a string, got ${s}.`), typeof o == "string" ? o.startsWith("var(") && s === 0 ? 0 : o.startsWith("var(") && s === 1 ? o : `calc(${s} * ${o})` : o * s) : Array.isArray(o) ? (s) => {
    if (typeof s == "string")
      return s;
    const i = Math.abs(s);
    process.env.NODE_ENV !== "production" && (Number.isInteger(i) ? i > o.length - 1 && console.error([`MUI: The value provided (${i}) overflows.`, `The supported values are: ${JSON.stringify(o)}.`, `${i} > ${o.length - 1}, you need to add the missing values.`].join(`
`)) : console.error([`MUI: The \`theme.${t}\` array type cannot be combined with non integer values.You should either use an integer value that can be used as index, or define the \`theme.${t}\` as a number.`].join(`
`)));
    const a = o[i];
    return s >= 0 ? a : typeof a == "number" ? -a : typeof a == "string" && a.startsWith("var(") ? `calc(-1 * ${a})` : `-${a}`;
  } : typeof o == "function" ? o : (process.env.NODE_ENV !== "production" && console.error([`MUI: The \`theme.${t}\` value (${o}) is invalid.`, "It should be a number, an array or a function."].join(`
`)), () => {
  });
}
function Fr(e) {
  return Ct(e, "spacing", 8, "spacing");
}
function _t(e, t) {
  return typeof t == "string" || t == null ? t : e(t);
}
function ec(e, t) {
  return (r) => e.reduce((n, o) => (n[o] = _t(t, r), n), {});
}
function tc(e, t, r, n) {
  if (!t.includes(r))
    return null;
  const o = Qa(r), s = ec(o, n), i = e[r];
  return Ie(e, i, s);
}
function No(e, t) {
  const r = Fr(e.theme);
  return Object.keys(e).map((n) => tc(e, t, n, r)).reduce(mt, {});
}
function ne(e) {
  return No(e, Yt);
}
ne.propTypes = process.env.NODE_ENV !== "production" ? Yt.reduce((e, t) => (e[t] = Me, e), {}) : {};
ne.filterProps = Yt;
function oe(e) {
  return No(e, Gt);
}
oe.propTypes = process.env.NODE_ENV !== "production" ? Gt.reduce((e, t) => (e[t] = Me, e), {}) : {};
oe.filterProps = Gt;
process.env.NODE_ENV !== "production" && Za.reduce((e, t) => (e[t] = Me, e), {});
function Io(e = 8, t = Fr({
  spacing: e
})) {
  if (e.mui)
    return e;
  const r = (...n) => (process.env.NODE_ENV !== "production" && (n.length <= 4 || console.error(`MUI: Too many arguments provided, expected between 0 and 4, got ${n.length}`)), (n.length === 0 ? [1] : n).map((s) => {
    const i = t(s);
    return typeof i == "number" ? `${i}px` : i;
  }).join(" "));
  return r.mui = !0, r;
}
function Jt(...e) {
  const t = e.reduce((n, o) => (o.filterProps.forEach((s) => {
    n[s] = o;
  }), n), {}), r = (n) => Object.keys(n).reduce((o, s) => t[s] ? mt(o, t[s](n)) : o, {});
  return r.propTypes = process.env.NODE_ENV !== "production" ? e.reduce((n, o) => Object.assign(n, o.propTypes), {}) : {}, r.filterProps = e.reduce((n, o) => n.concat(o.filterProps), []), r;
}
function we(e) {
  return typeof e != "number" ? e : `${e}px solid`;
}
function Re(e, t) {
  return ie({
    prop: e,
    themeKey: "borders",
    transform: t
  });
}
const rc = Re("border", we), nc = Re("borderTop", we), oc = Re("borderRight", we), sc = Re("borderBottom", we), ic = Re("borderLeft", we), ac = Re("borderColor"), cc = Re("borderTopColor"), lc = Re("borderRightColor"), uc = Re("borderBottomColor"), fc = Re("borderLeftColor"), dc = Re("outline", we), pc = Re("outlineColor"), Xt = (e) => {
  if (e.borderRadius !== void 0 && e.borderRadius !== null) {
    const t = Ct(e.theme, "shape.borderRadius", 4, "borderRadius"), r = (n) => ({
      borderRadius: _t(t, n)
    });
    return Ie(e, e.borderRadius, r);
  }
  return null;
};
Xt.propTypes = process.env.NODE_ENV !== "production" ? {
  borderRadius: Me
} : {};
Xt.filterProps = ["borderRadius"];
Jt(rc, nc, oc, sc, ic, ac, cc, lc, uc, fc, Xt, dc, pc);
const Qt = (e) => {
  if (e.gap !== void 0 && e.gap !== null) {
    const t = Ct(e.theme, "spacing", 8, "gap"), r = (n) => ({
      gap: _t(t, n)
    });
    return Ie(e, e.gap, r);
  }
  return null;
};
Qt.propTypes = process.env.NODE_ENV !== "production" ? {
  gap: Me
} : {};
Qt.filterProps = ["gap"];
const Zt = (e) => {
  if (e.columnGap !== void 0 && e.columnGap !== null) {
    const t = Ct(e.theme, "spacing", 8, "columnGap"), r = (n) => ({
      columnGap: _t(t, n)
    });
    return Ie(e, e.columnGap, r);
  }
  return null;
};
Zt.propTypes = process.env.NODE_ENV !== "production" ? {
  columnGap: Me
} : {};
Zt.filterProps = ["columnGap"];
const er = (e) => {
  if (e.rowGap !== void 0 && e.rowGap !== null) {
    const t = Ct(e.theme, "spacing", 8, "rowGap"), r = (n) => ({
      rowGap: _t(t, n)
    });
    return Ie(e, e.rowGap, r);
  }
  return null;
};
er.propTypes = process.env.NODE_ENV !== "production" ? {
  rowGap: Me
} : {};
er.filterProps = ["rowGap"];
const hc = ie({
  prop: "gridColumn"
}), mc = ie({
  prop: "gridRow"
}), gc = ie({
  prop: "gridAutoFlow"
}), yc = ie({
  prop: "gridAutoColumns"
}), bc = ie({
  prop: "gridAutoRows"
}), Ec = ie({
  prop: "gridTemplateColumns"
}), Sc = ie({
  prop: "gridTemplateRows"
}), wc = ie({
  prop: "gridTemplateAreas"
}), Tc = ie({
  prop: "gridArea"
});
Jt(Qt, Zt, er, hc, mc, gc, yc, bc, Ec, Sc, wc, Tc);
function et(e, t) {
  return t === "grey" ? t : e;
}
const Rc = ie({
  prop: "color",
  themeKey: "palette",
  transform: et
}), Oc = ie({
  prop: "bgcolor",
  cssProperty: "backgroundColor",
  themeKey: "palette",
  transform: et
}), Cc = ie({
  prop: "backgroundColor",
  themeKey: "palette",
  transform: et
});
Jt(Rc, Oc, Cc);
function Ee(e) {
  return e <= 1 && e !== 0 ? `${e * 100}%` : e;
}
const _c = ie({
  prop: "width",
  transform: Ee
}), Mr = (e) => {
  if (e.maxWidth !== void 0 && e.maxWidth !== null) {
    const t = (r) => {
      const n = e.theme?.breakpoints?.values?.[r] || zt[r];
      return n ? e.theme?.breakpoints?.unit !== "px" ? {
        maxWidth: `${n}${e.theme.breakpoints.unit}`
      } : {
        maxWidth: n
      } : {
        maxWidth: Ee(r)
      };
    };
    return Ie(e, e.maxWidth, t);
  }
  return null;
};
Mr.filterProps = ["maxWidth"];
const Ac = ie({
  prop: "minWidth",
  transform: Ee
}), xc = ie({
  prop: "height",
  transform: Ee
}), vc = ie({
  prop: "maxHeight",
  transform: Ee
}), Pc = ie({
  prop: "minHeight",
  transform: Ee
});
ie({
  prop: "size",
  cssProperty: "width",
  transform: Ee
});
ie({
  prop: "size",
  cssProperty: "height",
  transform: Ee
});
const kc = ie({
  prop: "boxSizing"
});
Jt(_c, Mr, Ac, xc, vc, Pc, kc);
const tr = {
  // borders
  border: {
    themeKey: "borders",
    transform: we
  },
  borderTop: {
    themeKey: "borders",
    transform: we
  },
  borderRight: {
    themeKey: "borders",
    transform: we
  },
  borderBottom: {
    themeKey: "borders",
    transform: we
  },
  borderLeft: {
    themeKey: "borders",
    transform: we
  },
  borderColor: {
    themeKey: "palette"
  },
  borderTopColor: {
    themeKey: "palette"
  },
  borderRightColor: {
    themeKey: "palette"
  },
  borderBottomColor: {
    themeKey: "palette"
  },
  borderLeftColor: {
    themeKey: "palette"
  },
  outline: {
    themeKey: "borders",
    transform: we
  },
  outlineColor: {
    themeKey: "palette"
  },
  borderRadius: {
    themeKey: "shape.borderRadius",
    style: Xt
  },
  // palette
  color: {
    themeKey: "palette",
    transform: et
  },
  bgcolor: {
    themeKey: "palette",
    cssProperty: "backgroundColor",
    transform: et
  },
  backgroundColor: {
    themeKey: "palette",
    transform: et
  },
  // spacing
  p: {
    style: oe
  },
  pt: {
    style: oe
  },
  pr: {
    style: oe
  },
  pb: {
    style: oe
  },
  pl: {
    style: oe
  },
  px: {
    style: oe
  },
  py: {
    style: oe
  },
  padding: {
    style: oe
  },
  paddingTop: {
    style: oe
  },
  paddingRight: {
    style: oe
  },
  paddingBottom: {
    style: oe
  },
  paddingLeft: {
    style: oe
  },
  paddingX: {
    style: oe
  },
  paddingY: {
    style: oe
  },
  paddingInline: {
    style: oe
  },
  paddingInlineStart: {
    style: oe
  },
  paddingInlineEnd: {
    style: oe
  },
  paddingBlock: {
    style: oe
  },
  paddingBlockStart: {
    style: oe
  },
  paddingBlockEnd: {
    style: oe
  },
  m: {
    style: ne
  },
  mt: {
    style: ne
  },
  mr: {
    style: ne
  },
  mb: {
    style: ne
  },
  ml: {
    style: ne
  },
  mx: {
    style: ne
  },
  my: {
    style: ne
  },
  margin: {
    style: ne
  },
  marginTop: {
    style: ne
  },
  marginRight: {
    style: ne
  },
  marginBottom: {
    style: ne
  },
  marginLeft: {
    style: ne
  },
  marginX: {
    style: ne
  },
  marginY: {
    style: ne
  },
  marginInline: {
    style: ne
  },
  marginInlineStart: {
    style: ne
  },
  marginInlineEnd: {
    style: ne
  },
  marginBlock: {
    style: ne
  },
  marginBlockStart: {
    style: ne
  },
  marginBlockEnd: {
    style: ne
  },
  // display
  displayPrint: {
    cssProperty: !1,
    transform: (e) => ({
      "@media print": {
        display: e
      }
    })
  },
  display: {},
  overflow: {},
  textOverflow: {},
  visibility: {},
  whiteSpace: {},
  // flexbox
  flexBasis: {},
  flexDirection: {},
  flexWrap: {},
  justifyContent: {},
  alignItems: {},
  alignContent: {},
  order: {},
  flex: {},
  flexGrow: {},
  flexShrink: {},
  alignSelf: {},
  justifyItems: {},
  justifySelf: {},
  // grid
  gap: {
    style: Qt
  },
  rowGap: {
    style: er
  },
  columnGap: {
    style: Zt
  },
  gridColumn: {},
  gridRow: {},
  gridAutoFlow: {},
  gridAutoColumns: {},
  gridAutoRows: {},
  gridTemplateColumns: {},
  gridTemplateRows: {},
  gridTemplateAreas: {},
  gridArea: {},
  // positions
  position: {},
  zIndex: {
    themeKey: "zIndex"
  },
  top: {},
  right: {},
  bottom: {},
  left: {},
  // shadows
  boxShadow: {
    themeKey: "shadows"
  },
  // sizing
  width: {
    transform: Ee
  },
  maxWidth: {
    style: Mr
  },
  minWidth: {
    transform: Ee
  },
  height: {
    transform: Ee
  },
  maxHeight: {
    transform: Ee
  },
  minHeight: {
    transform: Ee
  },
  boxSizing: {},
  // typography
  font: {
    themeKey: "font"
  },
  fontFamily: {
    themeKey: "typography"
  },
  fontSize: {
    themeKey: "typography"
  },
  fontStyle: {
    themeKey: "typography"
  },
  fontWeight: {
    themeKey: "typography"
  },
  letterSpacing: {},
  textTransform: {},
  lineHeight: {},
  textAlign: {},
  typography: {
    cssProperty: !1,
    themeKey: "typography"
  }
};
function Nc(...e) {
  const t = e.reduce((n, o) => n.concat(Object.keys(o)), []), r = new Set(t);
  return e.every((n) => r.size === Object.keys(n).length);
}
function Ic(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function $c() {
  function e(r, n, o, s) {
    const i = {
      [r]: n,
      theme: o
    }, a = s[r];
    if (!a)
      return {
        [r]: n
      };
    const {
      cssProperty: c = r,
      themeKey: f,
      transform: u,
      style: p
    } = a;
    if (n == null)
      return null;
    if (f === "typography" && n === "inherit")
      return {
        [r]: n
      };
    const m = Kt(o, f) || {};
    return p ? p(i) : Ie(i, n, (y) => {
      let h = jt(m, u, y);
      return y === h && typeof y == "string" && (h = jt(m, u, `${r}${y === "default" ? "" : ko(y)}`, y)), c === !1 ? h : {
        [c]: h
      };
    });
  }
  function t(r) {
    const {
      sx: n,
      theme: o = {},
      nested: s
    } = r || {};
    if (!n)
      return null;
    const i = o.unstable_sxConfig ?? tr;
    function a(c) {
      let f = c;
      if (typeof c == "function")
        f = c(o);
      else if (typeof c != "object")
        return c;
      if (!f)
        return null;
      const u = Ya(o.breakpoints), p = Object.keys(u);
      let m = u;
      return Object.keys(f).forEach((E) => {
        const y = Ic(f[E], o);
        if (y != null)
          if (typeof y == "object")
            if (i[E])
              m = mt(m, e(E, y, o, i));
            else {
              const h = Ie({
                theme: o
              }, y, (T) => ({
                [E]: T
              }));
              Nc(h, y) ? m[E] = t({
                sx: y,
                theme: o,
                nested: !0
              }) : m = mt(m, h);
            }
          else
            m = mt(m, e(E, y, o, i));
      }), !s && o.modularCssLayers ? {
        "@layer sx": _n(o, xn(p, m))
      } : _n(o, xn(p, m));
    }
    return Array.isArray(n) ? n.map(a) : a(n);
  }
  return t;
}
const rr = $c();
rr.filterProps = ["sx"];
function Dc(e, t) {
  const r = this;
  if (r.vars) {
    if (!r.colorSchemes?.[e] || typeof r.getColorSchemeSelector != "function")
      return {};
    let n = r.getColorSchemeSelector(e);
    return n === "&" ? t : ((n.includes("data-") || n.includes(".")) && (n = `*:where(${n.replace(/\s*&$/, "")}) &`), {
      [n]: t
    });
  }
  return r.palette.mode === e ? t : {};
}
function $o(e = {}, ...t) {
  const {
    breakpoints: r = {},
    palette: n = {},
    spacing: o,
    shape: s = {},
    ...i
  } = e, a = Ha(r), c = Io(o);
  let f = Se({
    breakpoints: a,
    direction: "ltr",
    components: {},
    // Inject component definitions.
    palette: {
      mode: "light",
      ...n
    },
    spacing: c,
    shape: {
      ...za,
      ...s
    }
  }, i);
  return f = qa(f), f.applyStyles = Dc, f = t.reduce((u, p) => Se(u, p), f), f.unstable_sxConfig = {
    ...tr,
    ...i?.unstable_sxConfig
  }, f.unstable_sx = function(p) {
    return rr({
      sx: p,
      theme: this
    });
  }, f;
}
function Lc(e) {
  return Object.keys(e).length === 0;
}
function Uc(e = null) {
  const t = Ht.useContext(Xo);
  return !t || Lc(t) ? e : t;
}
const Bc = $o();
function Fc(e = Bc) {
  return Uc(e);
}
const Pn = (e) => e, Mc = () => {
  let e = Pn;
  return {
    configure(t) {
      e = t;
    },
    generate(t) {
      return e(t);
    },
    reset() {
      e = Pn;
    }
  };
}, jc = Mc(), Hc = {
  active: "active",
  checked: "checked",
  completed: "completed",
  disabled: "disabled",
  error: "error",
  expanded: "expanded",
  focused: "focused",
  focusVisible: "focusVisible",
  open: "open",
  readOnly: "readOnly",
  required: "required",
  selected: "selected"
};
function Vc(e, t, r = "Mui") {
  const n = Hc[t];
  return n ? `${r}-${n}` : `${jc.generate(e)}-${t}`;
}
function Wc(e, t = Number.MIN_SAFE_INTEGER, r = Number.MAX_SAFE_INTEGER) {
  return Math.max(t, Math.min(e, r));
}
function jr(e, t = 0, r = 1) {
  return process.env.NODE_ENV !== "production" && (e < t || e > r) && console.error(`MUI: The value provided ${e} is out of range [${t}, ${r}].`), Wc(e, t, r);
}
function qc(e) {
  e = e.slice(1);
  const t = new RegExp(`.{1,${e.length >= 6 ? 2 : 1}}`, "g");
  let r = e.match(t);
  return r && r[0].length === 1 && (r = r.map((n) => n + n)), process.env.NODE_ENV !== "production" && e.length !== e.trim().length && console.error(`MUI: The color: "${e}" is invalid. Make sure the color input doesn't contain leading/trailing space.`), r ? `rgb${r.length === 4 ? "a" : ""}(${r.map((n, o) => o < 3 ? parseInt(n, 16) : Math.round(parseInt(n, 16) / 255 * 1e3) / 1e3).join(", ")})` : "";
}
function Fe(e) {
  if (e.type)
    return e;
  if (e.charAt(0) === "#")
    return Fe(qc(e));
  const t = e.indexOf("("), r = e.substring(0, t);
  if (!["rgb", "rgba", "hsl", "hsla", "color"].includes(r))
    throw new Error(process.env.NODE_ENV !== "production" ? `MUI: Unsupported \`${e}\` color.
The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().` : Be(9, e));
  let n = e.substring(t + 1, e.length - 1), o;
  if (r === "color") {
    if (n = n.split(" "), o = n.shift(), n.length === 4 && n[3].charAt(0) === "/" && (n[3] = n[3].slice(1)), !["srgb", "display-p3", "a98-rgb", "prophoto-rgb", "rec-2020"].includes(o))
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: unsupported \`${o}\` color space.
The following color spaces are supported: srgb, display-p3, a98-rgb, prophoto-rgb, rec-2020.` : Be(10, o));
  } else
    n = n.split(",");
  return n = n.map((s) => parseFloat(s)), {
    type: r,
    values: n,
    colorSpace: o
  };
}
const zc = (e) => {
  const t = Fe(e);
  return t.values.slice(0, 3).map((r, n) => t.type.includes("hsl") && n !== 0 ? `${r}%` : r).join(" ");
}, dt = (e, t) => {
  try {
    return zc(e);
  } catch {
    return t && process.env.NODE_ENV !== "production" && console.warn(t), e;
  }
};
function nr(e) {
  const {
    type: t,
    colorSpace: r
  } = e;
  let {
    values: n
  } = e;
  return t.includes("rgb") ? n = n.map((o, s) => s < 3 ? parseInt(o, 10) : o) : t.includes("hsl") && (n[1] = `${n[1]}%`, n[2] = `${n[2]}%`), t.includes("color") ? n = `${r} ${n.join(" ")}` : n = `${n.join(", ")}`, `${t}(${n})`;
}
function Do(e) {
  e = Fe(e);
  const {
    values: t
  } = e, r = t[0], n = t[1] / 100, o = t[2] / 100, s = n * Math.min(o, 1 - o), i = (f, u = (f + r / 30) % 12) => o - s * Math.max(Math.min(u - 3, 9 - u, 1), -1);
  let a = "rgb";
  const c = [Math.round(i(0) * 255), Math.round(i(8) * 255), Math.round(i(4) * 255)];
  return e.type === "hsla" && (a += "a", c.push(t[3])), nr({
    type: a,
    values: c
  });
}
function xr(e) {
  e = Fe(e);
  let t = e.type === "hsl" || e.type === "hsla" ? Fe(Do(e)).values : e.values;
  return t = t.map((r) => (e.type !== "color" && (r /= 255), r <= 0.03928 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4)), Number((0.2126 * t[0] + 0.7152 * t[1] + 0.0722 * t[2]).toFixed(3));
}
function kn(e, t) {
  const r = xr(e), n = xr(t);
  return (Math.max(r, n) + 0.05) / (Math.min(r, n) + 0.05);
}
function Lo(e, t) {
  return e = Fe(e), t = jr(t), (e.type === "rgb" || e.type === "hsl") && (e.type += "a"), e.type === "color" ? e.values[3] = `/${t}` : e.values[3] = t, nr(e);
}
function He(e, t, r) {
  try {
    return Lo(e, t);
  } catch {
    return r && process.env.NODE_ENV !== "production" && console.warn(r), e;
  }
}
function or(e, t) {
  if (e = Fe(e), t = jr(t), e.type.includes("hsl"))
    e.values[2] *= 1 - t;
  else if (e.type.includes("rgb") || e.type.includes("color"))
    for (let r = 0; r < 3; r += 1)
      e.values[r] *= 1 - t;
  return nr(e);
}
function G(e, t, r) {
  try {
    return or(e, t);
  } catch {
    return r && process.env.NODE_ENV !== "production" && console.warn(r), e;
  }
}
function sr(e, t) {
  if (e = Fe(e), t = jr(t), e.type.includes("hsl"))
    e.values[2] += (100 - e.values[2]) * t;
  else if (e.type.includes("rgb"))
    for (let r = 0; r < 3; r += 1)
      e.values[r] += (255 - e.values[r]) * t;
  else if (e.type.includes("color"))
    for (let r = 0; r < 3; r += 1)
      e.values[r] += (1 - e.values[r]) * t;
  return nr(e);
}
function J(e, t, r) {
  try {
    return sr(e, t);
  } catch {
    return r && process.env.NODE_ENV !== "production" && console.warn(r), e;
  }
}
function Kc(e, t = 0.15) {
  return xr(e) > 0.5 ? or(e, t) : sr(e, t);
}
function Nt(e, t, r) {
  try {
    return Kc(e, t);
  } catch {
    return e;
  }
}
function Yc(e = "") {
  function t(...n) {
    if (!n.length)
      return "";
    const o = n[0];
    return typeof o == "string" && !o.match(/(#|\(|\)|(-?(\d*\.)?\d+)(px|em|%|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc))|^(-?(\d*\.)?\d+)$|(\d+ \d+ \d+)/) ? `, var(--${e ? `${e}-` : ""}${o}${t(...n.slice(1))})` : `, ${o}`;
  }
  return (n, ...o) => `var(--${e ? `${e}-` : ""}${n}${t(...o)})`;
}
const Nn = (e, t, r, n = []) => {
  let o = e;
  t.forEach((s, i) => {
    i === t.length - 1 ? Array.isArray(o) ? o[Number(s)] = r : o && typeof o == "object" && (o[s] = r) : o && typeof o == "object" && (o[s] || (o[s] = n.includes(s) ? [] : {}), o = o[s]);
  });
}, Gc = (e, t, r) => {
  function n(o, s = [], i = []) {
    Object.entries(o).forEach(([a, c]) => {
      (!r || r && !r([...s, a])) && c != null && (typeof c == "object" && Object.keys(c).length > 0 ? n(c, [...s, a], Array.isArray(c) ? [...i, a] : i) : t([...s, a], c, i));
    });
  }
  n(e);
}, Jc = (e, t) => typeof t == "number" ? ["lineHeight", "fontWeight", "opacity", "zIndex"].some((n) => e.includes(n)) || e[e.length - 1].toLowerCase().includes("opacity") ? t : `${t}px` : t;
function Tr(e, t) {
  const {
    prefix: r,
    shouldSkipGeneratingVar: n
  } = t || {}, o = {}, s = {}, i = {};
  return Gc(
    e,
    (a, c, f) => {
      if ((typeof c == "string" || typeof c == "number") && (!n || !n(a, c))) {
        const u = `--${r ? `${r}-` : ""}${a.join("-")}`, p = Jc(a, c);
        Object.assign(o, {
          [u]: p
        }), Nn(s, a, `var(${u})`, f), Nn(i, a, `var(${u}, ${p})`, f);
      }
    },
    (a) => a[0] === "vars"
    // skip 'vars/*' paths
  ), {
    css: o,
    vars: s,
    varsWithDefaults: i
  };
}
function Xc(e, t = {}) {
  const {
    getSelector: r = g,
    disableCssColorScheme: n,
    colorSchemeSelector: o,
    enableContrastVars: s
  } = t, {
    colorSchemes: i = {},
    components: a,
    defaultColorScheme: c = "light",
    ...f
  } = e, {
    vars: u,
    css: p,
    varsWithDefaults: m
  } = Tr(f, t);
  let E = m;
  const y = {}, {
    [c]: h,
    ...T
  } = i;
  if (Object.entries(T || {}).forEach(([S, w]) => {
    const {
      vars: k,
      css: H,
      varsWithDefaults: re
    } = Tr(w, t);
    E = Se(E, re), y[S] = {
      css: H,
      vars: k
    };
  }), h) {
    const {
      css: S,
      vars: w,
      varsWithDefaults: k
    } = Tr(h, t);
    E = Se(E, k), y[c] = {
      css: S,
      vars: w
    };
  }
  function g(S, w) {
    let k = o;
    if (o === "class" && (k = ".%s"), o === "data" && (k = "[data-%s]"), o?.startsWith("data-") && !o.includes("%s") && (k = `[${o}="%s"]`), S) {
      if (k === "media")
        return e.defaultColorScheme === S ? ":root" : {
          [`@media (prefers-color-scheme: ${i[S]?.palette?.mode || S})`]: {
            ":root": w
          }
        };
      if (k)
        return e.defaultColorScheme === S ? `:root, ${k.replace("%s", String(S))}` : k.replace("%s", String(S));
    }
    return ":root";
  }
  return {
    vars: E,
    generateThemeVars: () => {
      let S = {
        ...u
      };
      return Object.entries(y).forEach(([, {
        vars: w
      }]) => {
        S = Se(S, w);
      }), S;
    },
    generateStyleSheets: () => {
      const S = [], w = e.defaultColorScheme || "light";
      function k(ee, Z) {
        Object.keys(Z).length && S.push(typeof ee == "string" ? {
          [ee]: {
            ...Z
          }
        } : ee);
      }
      k(r(void 0, {
        ...p
      }), p);
      const {
        [w]: H,
        ...re
      } = y;
      if (H) {
        const {
          css: ee
        } = H, Z = i[w]?.palette?.mode, Y = !n && Z ? {
          colorScheme: Z,
          ...ee
        } : {
          ...ee
        };
        k(r(w, {
          ...Y
        }), Y);
      }
      return Object.entries(re).forEach(([ee, {
        css: Z
      }]) => {
        const Y = i[ee]?.palette?.mode, l = !n && Y ? {
          colorScheme: Y,
          ...Z
        } : {
          ...Z
        };
        k(r(ee, {
          ...l
        }), l);
      }), s && S.push({
        ":root": {
          // use double underscore to indicate that these are private variables
          "--__l-threshold": "0.7",
          "--__l": "clamp(0, (l / var(--__l-threshold) - 1) * -infinity, 1)",
          "--__a": "clamp(0.87, (l / var(--__l-threshold) - 1) * -infinity, 1)"
          // 0.87 is the default alpha value for black text.
        }
      }), S;
    }
  };
}
function Qc(e) {
  return function(r) {
    return e === "media" ? (process.env.NODE_ENV !== "production" && r !== "light" && r !== "dark" && console.error(`MUI: @media (prefers-color-scheme) supports only 'light' or 'dark', but receive '${r}'.`), `@media (prefers-color-scheme: ${r})`) : e ? e.startsWith("data-") && !e.includes("%s") ? `[${e}="${r}"] &` : e === "class" ? `.${r} &` : e === "data" ? `[data-${r}] &` : `${e.replace("%s", r)} &` : "&";
  };
}
const Et = {
  black: "#000",
  white: "#fff"
}, Zc = {
  50: "#fafafa",
  100: "#f5f5f5",
  200: "#eeeeee",
  300: "#e0e0e0",
  400: "#bdbdbd",
  500: "#9e9e9e",
  600: "#757575",
  700: "#616161",
  800: "#424242",
  900: "#212121",
  A100: "#f5f5f5",
  A200: "#eeeeee",
  A400: "#bdbdbd",
  A700: "#616161"
}, Ge = {
  50: "#f3e5f5",
  200: "#ce93d8",
  300: "#ba68c8",
  400: "#ab47bc",
  500: "#9c27b0",
  700: "#7b1fa2"
}, Je = {
  300: "#e57373",
  400: "#ef5350",
  500: "#f44336",
  700: "#d32f2f",
  800: "#c62828"
}, ft = {
  300: "#ffb74d",
  400: "#ffa726",
  500: "#ff9800",
  700: "#f57c00",
  900: "#e65100"
}, Xe = {
  50: "#e3f2fd",
  200: "#90caf9",
  400: "#42a5f5",
  700: "#1976d2",
  800: "#1565c0"
}, Qe = {
  300: "#4fc3f7",
  400: "#29b6f6",
  500: "#03a9f4",
  700: "#0288d1",
  900: "#01579b"
}, Ze = {
  300: "#81c784",
  400: "#66bb6a",
  500: "#4caf50",
  700: "#388e3c",
  800: "#2e7d32",
  900: "#1b5e20"
};
function Uo() {
  return {
    // The colors used to style the text.
    text: {
      // The most important text.
      primary: "rgba(0, 0, 0, 0.87)",
      // Secondary text.
      secondary: "rgba(0, 0, 0, 0.6)",
      // Disabled text have even lower visual prominence.
      disabled: "rgba(0, 0, 0, 0.38)"
    },
    // The color used to divide different elements.
    divider: "rgba(0, 0, 0, 0.12)",
    // The background colors used to style the surfaces.
    // Consistency between these values is important.
    background: {
      paper: Et.white,
      default: Et.white
    },
    // The colors used to style the action elements.
    action: {
      // The color of an active action like an icon button.
      active: "rgba(0, 0, 0, 0.54)",
      // The color of an hovered action.
      hover: "rgba(0, 0, 0, 0.04)",
      hoverOpacity: 0.04,
      // The color of a selected action.
      selected: "rgba(0, 0, 0, 0.08)",
      selectedOpacity: 0.08,
      // The color of a disabled action.
      disabled: "rgba(0, 0, 0, 0.26)",
      // The background color of a disabled action.
      disabledBackground: "rgba(0, 0, 0, 0.12)",
      disabledOpacity: 0.38,
      focus: "rgba(0, 0, 0, 0.12)",
      focusOpacity: 0.12,
      activatedOpacity: 0.12
    }
  };
}
const Bo = Uo();
function Fo() {
  return {
    text: {
      primary: Et.white,
      secondary: "rgba(255, 255, 255, 0.7)",
      disabled: "rgba(255, 255, 255, 0.5)",
      icon: "rgba(255, 255, 255, 0.5)"
    },
    divider: "rgba(255, 255, 255, 0.12)",
    background: {
      paper: "#121212",
      default: "#121212"
    },
    action: {
      active: Et.white,
      hover: "rgba(255, 255, 255, 0.08)",
      hoverOpacity: 0.08,
      selected: "rgba(255, 255, 255, 0.16)",
      selectedOpacity: 0.16,
      disabled: "rgba(255, 255, 255, 0.3)",
      disabledBackground: "rgba(255, 255, 255, 0.12)",
      disabledOpacity: 0.38,
      focus: "rgba(255, 255, 255, 0.12)",
      focusOpacity: 0.12,
      activatedOpacity: 0.24
    }
  };
}
const vr = Fo();
function In(e, t, r, n) {
  const o = n.light || n, s = n.dark || n * 1.5;
  e[t] || (e.hasOwnProperty(r) ? e[t] = e[r] : t === "light" ? e.light = sr(e.main, o) : t === "dark" && (e.dark = or(e.main, s)));
}
function $n(e, t, r, n, o) {
  const s = o.light || o, i = o.dark || o * 1.5;
  t[r] || (t.hasOwnProperty(n) ? t[r] = t[n] : r === "light" ? t.light = `color-mix(in ${e}, ${t.main}, #fff ${(s * 100).toFixed(0)}%)` : r === "dark" && (t.dark = `color-mix(in ${e}, ${t.main}, #000 ${(i * 100).toFixed(0)}%)`));
}
function el(e = "light") {
  return e === "dark" ? {
    main: Xe[200],
    light: Xe[50],
    dark: Xe[400]
  } : {
    main: Xe[700],
    light: Xe[400],
    dark: Xe[800]
  };
}
function tl(e = "light") {
  return e === "dark" ? {
    main: Ge[200],
    light: Ge[50],
    dark: Ge[400]
  } : {
    main: Ge[500],
    light: Ge[300],
    dark: Ge[700]
  };
}
function rl(e = "light") {
  return e === "dark" ? {
    main: Je[500],
    light: Je[300],
    dark: Je[700]
  } : {
    main: Je[700],
    light: Je[400],
    dark: Je[800]
  };
}
function nl(e = "light") {
  return e === "dark" ? {
    main: Qe[400],
    light: Qe[300],
    dark: Qe[700]
  } : {
    main: Qe[700],
    light: Qe[500],
    dark: Qe[900]
  };
}
function ol(e = "light") {
  return e === "dark" ? {
    main: Ze[400],
    light: Ze[300],
    dark: Ze[700]
  } : {
    main: Ze[800],
    light: Ze[500],
    dark: Ze[900]
  };
}
function sl(e = "light") {
  return e === "dark" ? {
    main: ft[400],
    light: ft[300],
    dark: ft[700]
  } : {
    main: "#ed6c02",
    // closest to orange[800] that pass 3:1.
    light: ft[500],
    dark: ft[900]
  };
}
function il(e) {
  return `oklch(from ${e} var(--__l) 0 h / var(--__a))`;
}
function Hr(e) {
  const {
    mode: t = "light",
    contrastThreshold: r = 3,
    tonalOffset: n = 0.2,
    colorSpace: o,
    ...s
  } = e, i = e.primary || el(t), a = e.secondary || tl(t), c = e.error || rl(t), f = e.info || nl(t), u = e.success || ol(t), p = e.warning || sl(t);
  function m(T) {
    if (o)
      return il(T);
    const g = kn(T, vr.text.primary) >= r ? vr.text.primary : Bo.text.primary;
    if (process.env.NODE_ENV !== "production") {
      const R = kn(T, g);
      R < 3 && console.error([`MUI: The contrast ratio of ${R}:1 for ${g} on ${T}`, "falls below the WCAG recommended absolute minimum contrast ratio of 3:1.", "https://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-contrast"].join(`
`));
    }
    return g;
  }
  const E = ({
    color: T,
    name: g,
    mainShade: R = 500,
    lightShade: x = 300,
    darkShade: S = 700
  }) => {
    if (T = {
      ...T
    }, !T.main && T[R] && (T.main = T[R]), !T.hasOwnProperty("main"))
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The color${g ? ` (${g})` : ""} provided to augmentColor(color) is invalid.
The color object needs to have a \`main\` property or a \`${R}\` property.` : Be(11, g ? ` (${g})` : "", R));
    if (typeof T.main != "string")
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The color${g ? ` (${g})` : ""} provided to augmentColor(color) is invalid.
\`color.main\` should be a string, but \`${JSON.stringify(T.main)}\` was provided instead.

Did you intend to use one of the following approaches?

import { green } from "@mui/material/colors";

const theme1 = createTheme({ palette: {
  primary: green,
} });

const theme2 = createTheme({ palette: {
  primary: { main: green[500] },
} });` : Be(12, g ? ` (${g})` : "", JSON.stringify(T.main)));
    return o ? ($n(o, T, "light", x, n), $n(o, T, "dark", S, n)) : (In(T, "light", x, n), In(T, "dark", S, n)), T.contrastText || (T.contrastText = m(T.main)), T;
  };
  let y;
  return t === "light" ? y = Uo() : t === "dark" && (y = Fo()), process.env.NODE_ENV !== "production" && (y || console.error(`MUI: The palette mode \`${t}\` is not supported.`)), Se({
    // A collection of common colors.
    common: {
      ...Et
    },
    // prevent mutable object.
    // The palette mode, can be light or dark.
    mode: t,
    // The colors used to represent primary interface elements for a user.
    primary: E({
      color: i,
      name: "primary"
    }),
    // The colors used to represent secondary interface elements for a user.
    secondary: E({
      color: a,
      name: "secondary",
      mainShade: "A400",
      lightShade: "A200",
      darkShade: "A700"
    }),
    // The colors used to represent interface elements that the user should be made aware of.
    error: E({
      color: c,
      name: "error"
    }),
    // The colors used to represent potentially dangerous actions or important messages.
    warning: E({
      color: p,
      name: "warning"
    }),
    // The colors used to present information to the user that is neutral and not necessarily important.
    info: E({
      color: f,
      name: "info"
    }),
    // The colors used to indicate the successful completion of an action that user triggered.
    success: E({
      color: u,
      name: "success"
    }),
    // The grey colors.
    grey: Zc,
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    contrastThreshold: r,
    // Takes a background color and returns the text color that maximizes the contrast.
    getContrastText: m,
    // Generate a rich color object.
    augmentColor: E,
    // Used by the functions below to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    tonalOffset: n,
    // The light and dark mode object.
    ...y
  }, s);
}
function al(e) {
  const t = {};
  return Object.entries(e).forEach((n) => {
    const [o, s] = n;
    typeof s == "object" && (t[o] = `${s.fontStyle ? `${s.fontStyle} ` : ""}${s.fontVariant ? `${s.fontVariant} ` : ""}${s.fontWeight ? `${s.fontWeight} ` : ""}${s.fontStretch ? `${s.fontStretch} ` : ""}${s.fontSize || ""}${s.lineHeight ? `/${s.lineHeight} ` : ""}${s.fontFamily || ""}`);
  }), t;
}
function cl(e, t) {
  return {
    toolbar: {
      minHeight: 56,
      [e.up("xs")]: {
        "@media (orientation: landscape)": {
          minHeight: 48
        }
      },
      [e.up("sm")]: {
        minHeight: 64
      }
    },
    ...t
  };
}
function ll(e) {
  return Math.round(e * 1e5) / 1e5;
}
const Dn = {
  textTransform: "uppercase"
}, Ln = '"Roboto", "Helvetica", "Arial", sans-serif';
function ul(e, t) {
  const {
    fontFamily: r = Ln,
    // The default font size of the Material Specification.
    fontSize: n = 14,
    // px
    fontWeightLight: o = 300,
    fontWeightRegular: s = 400,
    fontWeightMedium: i = 500,
    fontWeightBold: a = 700,
    // Tell MUI what's the font-size on the html element.
    // 16px is the default font-size used by browsers.
    htmlFontSize: c = 16,
    // Apply the CSS properties to all the variants.
    allVariants: f,
    pxToRem: u,
    ...p
  } = typeof t == "function" ? t(e) : t;
  process.env.NODE_ENV !== "production" && (typeof n != "number" && console.error("MUI: `fontSize` is required to be a number."), typeof c != "number" && console.error("MUI: `htmlFontSize` is required to be a number."));
  const m = n / 14, E = u || ((T) => `${T / c * m}rem`), y = (T, g, R, x, S) => ({
    fontFamily: r,
    fontWeight: T,
    fontSize: E(g),
    // Unitless following https://meyerweb.com/eric/thoughts/2006/02/08/unitless-line-heights/
    lineHeight: R,
    // The letter spacing was designed for the Roboto font-family. Using the same letter-spacing
    // across font-families can cause issues with the kerning.
    ...r === Ln ? {
      letterSpacing: `${ll(x / g)}em`
    } : {},
    ...S,
    ...f
  }), h = {
    h1: y(o, 96, 1.167, -1.5),
    h2: y(o, 60, 1.2, -0.5),
    h3: y(s, 48, 1.167, 0),
    h4: y(s, 34, 1.235, 0.25),
    h5: y(s, 24, 1.334, 0),
    h6: y(i, 20, 1.6, 0.15),
    subtitle1: y(s, 16, 1.75, 0.15),
    subtitle2: y(i, 14, 1.57, 0.1),
    body1: y(s, 16, 1.5, 0.15),
    body2: y(s, 14, 1.43, 0.15),
    button: y(i, 14, 1.75, 0.4, Dn),
    caption: y(s, 12, 1.66, 0.4),
    overline: y(s, 12, 2.66, 1, Dn),
    // TODO v6: Remove handling of 'inherit' variant from the theme as it is already handled in Material UI's Typography component. Also, remember to remove the associated types.
    inherit: {
      fontFamily: "inherit",
      fontWeight: "inherit",
      fontSize: "inherit",
      lineHeight: "inherit",
      letterSpacing: "inherit"
    }
  };
  return Se({
    htmlFontSize: c,
    pxToRem: E,
    fontFamily: r,
    fontSize: n,
    fontWeightLight: o,
    fontWeightRegular: s,
    fontWeightMedium: i,
    fontWeightBold: a,
    ...h
  }, p, {
    clone: !1
    // No need to clone deep
  });
}
const fl = 0.2, dl = 0.14, pl = 0.12;
function te(...e) {
  return [`${e[0]}px ${e[1]}px ${e[2]}px ${e[3]}px rgba(0,0,0,${fl})`, `${e[4]}px ${e[5]}px ${e[6]}px ${e[7]}px rgba(0,0,0,${dl})`, `${e[8]}px ${e[9]}px ${e[10]}px ${e[11]}px rgba(0,0,0,${pl})`].join(",");
}
const hl = ["none", te(0, 2, 1, -1, 0, 1, 1, 0, 0, 1, 3, 0), te(0, 3, 1, -2, 0, 2, 2, 0, 0, 1, 5, 0), te(0, 3, 3, -2, 0, 3, 4, 0, 0, 1, 8, 0), te(0, 2, 4, -1, 0, 4, 5, 0, 0, 1, 10, 0), te(0, 3, 5, -1, 0, 5, 8, 0, 0, 1, 14, 0), te(0, 3, 5, -1, 0, 6, 10, 0, 0, 1, 18, 0), te(0, 4, 5, -2, 0, 7, 10, 1, 0, 2, 16, 1), te(0, 5, 5, -3, 0, 8, 10, 1, 0, 3, 14, 2), te(0, 5, 6, -3, 0, 9, 12, 1, 0, 3, 16, 2), te(0, 6, 6, -3, 0, 10, 14, 1, 0, 4, 18, 3), te(0, 6, 7, -4, 0, 11, 15, 1, 0, 4, 20, 3), te(0, 7, 8, -4, 0, 12, 17, 2, 0, 5, 22, 4), te(0, 7, 8, -4, 0, 13, 19, 2, 0, 5, 24, 4), te(0, 7, 9, -4, 0, 14, 21, 2, 0, 5, 26, 4), te(0, 8, 9, -5, 0, 15, 22, 2, 0, 6, 28, 5), te(0, 8, 10, -5, 0, 16, 24, 2, 0, 6, 30, 5), te(0, 8, 11, -5, 0, 17, 26, 2, 0, 6, 32, 5), te(0, 9, 11, -5, 0, 18, 28, 2, 0, 7, 34, 6), te(0, 9, 12, -6, 0, 19, 29, 2, 0, 7, 36, 6), te(0, 10, 13, -6, 0, 20, 31, 3, 0, 8, 38, 7), te(0, 10, 13, -6, 0, 21, 33, 3, 0, 8, 40, 7), te(0, 10, 14, -6, 0, 22, 35, 3, 0, 8, 42, 7), te(0, 11, 14, -7, 0, 23, 36, 3, 0, 9, 44, 8), te(0, 11, 15, -7, 0, 24, 38, 3, 0, 9, 46, 8)], ml = {
  // This is the most common easing curve.
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  // Objects enter the screen at full velocity from off-screen and
  // slowly decelerate to a resting point.
  easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
  // Objects leave the screen at full velocity. They do not decelerate when off-screen.
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  // The sharp curve is used by objects that may return to the screen at any time.
  sharp: "cubic-bezier(0.4, 0, 0.6, 1)"
}, gl = {
  shortest: 150,
  shorter: 200,
  short: 250,
  // most basic recommended timing
  standard: 300,
  // this is to be used in complex animations
  complex: 375,
  // recommended when something is entering screen
  enteringScreen: 225,
  // recommended when something is leaving screen
  leavingScreen: 195
};
function Un(e) {
  return `${Math.round(e)}ms`;
}
function yl(e) {
  if (!e)
    return 0;
  const t = e / 36;
  return Math.min(Math.round((4 + 15 * t ** 0.25 + t / 5) * 10), 3e3);
}
function bl(e) {
  const t = {
    ...ml,
    ...e.easing
  }, r = {
    ...gl,
    ...e.duration
  };
  return {
    getAutoHeightDuration: yl,
    create: (o = ["all"], s = {}) => {
      const {
        duration: i = r.standard,
        easing: a = t.easeInOut,
        delay: c = 0,
        ...f
      } = s;
      if (process.env.NODE_ENV !== "production") {
        const u = (m) => typeof m == "string", p = (m) => !Number.isNaN(parseFloat(m));
        !u(o) && !Array.isArray(o) && console.error('MUI: Argument "props" must be a string or Array.'), !p(i) && !u(i) && console.error(`MUI: Argument "duration" must be a number or a string but found ${i}.`), u(a) || console.error('MUI: Argument "easing" must be a string.'), !p(c) && !u(c) && console.error('MUI: Argument "delay" must be a number or a string.'), typeof s != "object" && console.error(["MUI: Secong argument of transition.create must be an object.", "Arguments should be either `create('prop1', options)` or `create(['prop1', 'prop2'], options)`"].join(`
`)), Object.keys(f).length !== 0 && console.error(`MUI: Unrecognized argument(s) [${Object.keys(f).join(",")}].`);
      }
      return (Array.isArray(o) ? o : [o]).map((u) => `${u} ${typeof i == "string" ? i : Un(i)} ${a} ${typeof c == "string" ? c : Un(c)}`).join(",");
    },
    ...e,
    easing: t,
    duration: r
  };
}
const El = {
  mobileStepper: 1e3,
  fab: 1050,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500
};
function Sl(e) {
  return De(e) || typeof e > "u" || typeof e == "string" || typeof e == "boolean" || typeof e == "number" || Array.isArray(e);
}
function Mo(e = {}) {
  const t = {
    ...e
  };
  function r(n) {
    const o = Object.entries(n);
    for (let s = 0; s < o.length; s++) {
      const [i, a] = o[s];
      !Sl(a) || i.startsWith("unstable_") ? delete n[i] : De(a) && (n[i] = {
        ...a
      }, r(n[i]));
    }
  }
  return r(t), `import { unstable_createBreakpoints as createBreakpoints, createTransitions } from '@mui/material/styles';

const theme = ${JSON.stringify(t, null, 2)};

theme.breakpoints = createBreakpoints(theme.breakpoints || {});
theme.transitions = createTransitions(theme.transitions || {});

export default theme;`;
}
function Bn(e) {
  return typeof e == "number" ? `${(e * 100).toFixed(0)}%` : `calc((${e}) * 100%)`;
}
const wl = (e) => {
  if (!Number.isNaN(+e))
    return +e;
  const t = e.match(/\d*\.?\d+/g);
  if (!t)
    return 0;
  let r = 0;
  for (let n = 0; n < t.length; n += 1)
    r += +t[n];
  return r;
};
function Tl(e) {
  Object.assign(e, {
    alpha(t, r) {
      const n = this || e;
      return n.colorSpace ? `oklch(from ${t} l c h / ${typeof r == "string" ? `calc(${r})` : r})` : n.vars ? `rgba(${t.replace(/var\(--([^,\s)]+)(?:,[^)]+)?\)+/g, "var(--$1Channel)")} / ${typeof r == "string" ? `calc(${r})` : r})` : Lo(t, wl(r));
    },
    lighten(t, r) {
      const n = this || e;
      return n.colorSpace ? `color-mix(in ${n.colorSpace}, ${t}, #fff ${Bn(r)})` : sr(t, r);
    },
    darken(t, r) {
      const n = this || e;
      return n.colorSpace ? `color-mix(in ${n.colorSpace}, ${t}, #000 ${Bn(r)})` : or(t, r);
    }
  });
}
function Pr(e = {}, ...t) {
  const {
    breakpoints: r,
    mixins: n = {},
    spacing: o,
    palette: s = {},
    transitions: i = {},
    typography: a = {},
    shape: c,
    colorSpace: f,
    ...u
  } = e;
  if (e.vars && // The error should throw only for the root theme creation because user is not allowed to use a custom node `vars`.
  // `generateThemeVars` is the closest identifier for checking that the `options` is a result of `createTheme` with CSS variables so that user can create new theme for nested ThemeProvider.
  e.generateThemeVars === void 0)
    throw new Error(process.env.NODE_ENV !== "production" ? "MUI: `vars` is a private field used for CSS variables support.\nPlease use another name or follow the [docs](https://mui.com/material-ui/customization/css-theme-variables/usage/) to enable the feature." : Be(20));
  const p = Hr({
    ...s,
    colorSpace: f
  }), m = $o(e);
  let E = Se(m, {
    mixins: cl(m.breakpoints, n),
    palette: p,
    // Don't use [...shadows] until you've verified its transpiled code is not invoking the iterator protocol.
    shadows: hl.slice(),
    typography: ul(p, a),
    transitions: bl(i),
    zIndex: {
      ...El
    }
  });
  if (E = Se(E, u), E = t.reduce((y, h) => Se(y, h), E), process.env.NODE_ENV !== "production") {
    const y = ["active", "checked", "completed", "disabled", "error", "expanded", "focused", "focusVisible", "required", "selected"], h = (T, g) => {
      let R;
      for (R in T) {
        const x = T[R];
        if (y.includes(R) && Object.keys(x).length > 0) {
          if (process.env.NODE_ENV !== "production") {
            const S = Vc("", R);
            console.error([`MUI: The \`${g}\` component increases the CSS specificity of the \`${R}\` internal state.`, "You can not override it like this: ", JSON.stringify(T, null, 2), "", `Instead, you need to use the '&.${S}' syntax:`, JSON.stringify({
              root: {
                [`&.${S}`]: x
              }
            }, null, 2), "", "https://mui.com/r/state-classes-guide"].join(`
`));
          }
          T[R] = {};
        }
      }
    };
    Object.keys(E.components).forEach((T) => {
      const g = E.components[T].styleOverrides;
      g && T.startsWith("Mui") && h(g, T);
    });
  }
  return E.unstable_sxConfig = {
    ...tr,
    ...u?.unstable_sxConfig
  }, E.unstable_sx = function(h) {
    return rr({
      sx: h,
      theme: this
    });
  }, E.toRuntimeSource = Mo, Tl(E), E;
}
function Rl(e) {
  let t;
  return e < 1 ? t = 5.11916 * e ** 2 : t = 4.5 * Math.log(e + 1) + 2, Math.round(t * 10) / 1e3;
}
const Ol = [...Array(25)].map((e, t) => {
  if (t === 0)
    return "none";
  const r = Rl(t);
  return `linear-gradient(rgba(255 255 255 / ${r}), rgba(255 255 255 / ${r}))`;
});
function jo(e) {
  return {
    inputPlaceholder: e === "dark" ? 0.5 : 0.42,
    inputUnderline: e === "dark" ? 0.7 : 0.42,
    switchTrackDisabled: e === "dark" ? 0.2 : 0.12,
    switchTrack: e === "dark" ? 0.3 : 0.38
  };
}
function Ho(e) {
  return e === "dark" ? Ol : [];
}
function Cl(e) {
  const {
    palette: t = {
      mode: "light"
    },
    // need to cast to avoid module augmentation test
    opacity: r,
    overlays: n,
    colorSpace: o,
    ...s
  } = e, i = Hr({
    ...t,
    colorSpace: o
  });
  return {
    palette: i,
    opacity: {
      ...jo(i.mode),
      ...r
    },
    overlays: n || Ho(i.mode),
    ...s
  };
}
function _l(e) {
  return !!e[0].match(/(cssVarPrefix|colorSchemeSelector|modularCssLayers|rootSelector|typography|mixins|breakpoints|direction|transitions)/) || !!e[0].match(/sxConfig$/) || // ends with sxConfig
  e[0] === "palette" && !!e[1]?.match(/(mode|contrastThreshold|tonalOffset)/);
}
const Al = (e) => [...[...Array(25)].map((t, r) => `--${e ? `${e}-` : ""}overlays-${r}`), `--${e ? `${e}-` : ""}palette-AppBar-darkBg`, `--${e ? `${e}-` : ""}palette-AppBar-darkColor`], xl = (e) => (t, r) => {
  const n = e.rootSelector || ":root", o = e.colorSchemeSelector;
  let s = o;
  if (o === "class" && (s = ".%s"), o === "data" && (s = "[data-%s]"), o?.startsWith("data-") && !o.includes("%s") && (s = `[${o}="%s"]`), e.defaultColorScheme === t) {
    if (t === "dark") {
      const i = {};
      return Al(e.cssVarPrefix).forEach((a) => {
        i[a] = r[a], delete r[a];
      }), s === "media" ? {
        [n]: r,
        "@media (prefers-color-scheme: dark)": {
          [n]: i
        }
      } : s ? {
        [s.replace("%s", t)]: i,
        [`${n}, ${s.replace("%s", t)}`]: r
      } : {
        [n]: {
          ...r,
          ...i
        }
      };
    }
    if (s && s !== "media")
      return `${n}, ${s.replace("%s", String(t))}`;
  } else if (t) {
    if (s === "media")
      return {
        [`@media (prefers-color-scheme: ${String(t)})`]: {
          [n]: r
        }
      };
    if (s)
      return s.replace("%s", String(t));
  }
  return n;
};
function vl(e, t) {
  t.forEach((r) => {
    e[r] || (e[r] = {});
  });
}
function b(e, t, r) {
  !e[t] && r && (e[t] = r);
}
function pt(e) {
  return typeof e != "string" || !e.startsWith("hsl") ? e : Do(e);
}
function ke(e, t) {
  `${t}Channel` in e || (e[`${t}Channel`] = dt(pt(e[t]), `MUI: Can't create \`palette.${t}Channel\` because \`palette.${t}\` is not one of these formats: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().
To suppress this warning, you need to explicitly provide the \`palette.${t}Channel\` as a string (in rgb format, for example "12 12 12") or undefined if you want to remove the channel token.`));
}
function Pl(e) {
  return typeof e == "number" ? `${e}px` : typeof e == "string" || typeof e == "function" || Array.isArray(e) ? e : "8px";
}
const Ce = (e) => {
  try {
    return e();
  } catch {
  }
}, kl = (e = "mui") => Yc(e);
function Rr(e, t, r, n, o) {
  if (!r)
    return;
  r = r === !0 ? {} : r;
  const s = o === "dark" ? "dark" : "light";
  if (!n) {
    t[o] = Cl({
      ...r,
      palette: {
        mode: s,
        ...r?.palette
      },
      colorSpace: e
    });
    return;
  }
  const {
    palette: i,
    ...a
  } = Pr({
    ...n,
    palette: {
      mode: s,
      ...r?.palette
    },
    colorSpace: e
  });
  return t[o] = {
    ...r,
    palette: i,
    opacity: {
      ...jo(s),
      ...r?.opacity
    },
    overlays: r?.overlays || Ho(s)
  }, a;
}
function Nl(e = {}, ...t) {
  const {
    colorSchemes: r = {
      light: !0
    },
    defaultColorScheme: n,
    disableCssColorScheme: o = !1,
    cssVarPrefix: s = "mui",
    nativeColor: i = !1,
    shouldSkipGeneratingVar: a = _l,
    colorSchemeSelector: c = r.light && r.dark ? "media" : void 0,
    rootSelector: f = ":root",
    ...u
  } = e, p = Object.keys(r)[0], m = n || (r.light && p !== "light" ? "light" : p), E = kl(s), {
    [m]: y,
    light: h,
    dark: T,
    ...g
  } = r, R = {
    ...g
  };
  let x = y;
  if ((m === "dark" && !("dark" in r) || m === "light" && !("light" in r)) && (x = !0), !x)
    throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The \`colorSchemes.${m}\` option is either missing or invalid.` : Be(21, m));
  let S;
  i && (S = "oklch");
  const w = Rr(S, R, x, u, m);
  h && !R.light && Rr(S, R, h, void 0, "light"), T && !R.dark && Rr(S, R, T, void 0, "dark");
  let k = {
    defaultColorScheme: m,
    ...w,
    cssVarPrefix: s,
    colorSchemeSelector: c,
    rootSelector: f,
    getCssVar: E,
    colorSchemes: R,
    font: {
      ...al(w.typography),
      ...w.font
    },
    spacing: Pl(u.spacing)
  };
  Object.keys(k.colorSchemes).forEach((Y) => {
    const l = k.colorSchemes[Y].palette, v = (D) => {
      const q = D.split("-"), ae = q[1], ge = q[2];
      return E(D, l[ae][ge]);
    };
    l.mode === "light" && (b(l.common, "background", "#fff"), b(l.common, "onBackground", "#000")), l.mode === "dark" && (b(l.common, "background", "#000"), b(l.common, "onBackground", "#fff"));
    function O(D, q, ae) {
      if (S) {
        let ge;
        return D === He && (ge = `transparent ${((1 - ae) * 100).toFixed(0)}%`), D === G && (ge = `#000 ${(ae * 100).toFixed(0)}%`), D === J && (ge = `#fff ${(ae * 100).toFixed(0)}%`), `color-mix(in ${S}, ${q}, ${ge})`;
      }
      return D(q, ae);
    }
    if (vl(l, ["Alert", "AppBar", "Avatar", "Button", "Chip", "FilledInput", "LinearProgress", "Skeleton", "Slider", "SnackbarContent", "SpeedDialAction", "StepConnector", "StepContent", "Switch", "TableCell", "Tooltip"]), l.mode === "light") {
      b(l.Alert, "errorColor", O(G, l.error.light, 0.6)), b(l.Alert, "infoColor", O(G, l.info.light, 0.6)), b(l.Alert, "successColor", O(G, l.success.light, 0.6)), b(l.Alert, "warningColor", O(G, l.warning.light, 0.6)), b(l.Alert, "errorFilledBg", v("palette-error-main")), b(l.Alert, "infoFilledBg", v("palette-info-main")), b(l.Alert, "successFilledBg", v("palette-success-main")), b(l.Alert, "warningFilledBg", v("palette-warning-main")), b(l.Alert, "errorFilledColor", Ce(() => l.getContrastText(l.error.main))), b(l.Alert, "infoFilledColor", Ce(() => l.getContrastText(l.info.main))), b(l.Alert, "successFilledColor", Ce(() => l.getContrastText(l.success.main))), b(l.Alert, "warningFilledColor", Ce(() => l.getContrastText(l.warning.main))), b(l.Alert, "errorStandardBg", O(J, l.error.light, 0.9)), b(l.Alert, "infoStandardBg", O(J, l.info.light, 0.9)), b(l.Alert, "successStandardBg", O(J, l.success.light, 0.9)), b(l.Alert, "warningStandardBg", O(J, l.warning.light, 0.9)), b(l.Alert, "errorIconColor", v("palette-error-main")), b(l.Alert, "infoIconColor", v("palette-info-main")), b(l.Alert, "successIconColor", v("palette-success-main")), b(l.Alert, "warningIconColor", v("palette-warning-main")), b(l.AppBar, "defaultBg", v("palette-grey-100")), b(l.Avatar, "defaultBg", v("palette-grey-400")), b(l.Button, "inheritContainedBg", v("palette-grey-300")), b(l.Button, "inheritContainedHoverBg", v("palette-grey-A100")), b(l.Chip, "defaultBorder", v("palette-grey-400")), b(l.Chip, "defaultAvatarColor", v("palette-grey-700")), b(l.Chip, "defaultIconColor", v("palette-grey-700")), b(l.FilledInput, "bg", "rgba(0, 0, 0, 0.06)"), b(l.FilledInput, "hoverBg", "rgba(0, 0, 0, 0.09)"), b(l.FilledInput, "disabledBg", "rgba(0, 0, 0, 0.12)"), b(l.LinearProgress, "primaryBg", O(J, l.primary.main, 0.62)), b(l.LinearProgress, "secondaryBg", O(J, l.secondary.main, 0.62)), b(l.LinearProgress, "errorBg", O(J, l.error.main, 0.62)), b(l.LinearProgress, "infoBg", O(J, l.info.main, 0.62)), b(l.LinearProgress, "successBg", O(J, l.success.main, 0.62)), b(l.LinearProgress, "warningBg", O(J, l.warning.main, 0.62)), b(l.Skeleton, "bg", S ? O(He, l.text.primary, 0.11) : `rgba(${v("palette-text-primaryChannel")} / 0.11)`), b(l.Slider, "primaryTrack", O(J, l.primary.main, 0.62)), b(l.Slider, "secondaryTrack", O(J, l.secondary.main, 0.62)), b(l.Slider, "errorTrack", O(J, l.error.main, 0.62)), b(l.Slider, "infoTrack", O(J, l.info.main, 0.62)), b(l.Slider, "successTrack", O(J, l.success.main, 0.62)), b(l.Slider, "warningTrack", O(J, l.warning.main, 0.62));
      const D = S ? O(G, l.background.default, 0.6825) : Nt(l.background.default, 0.8);
      b(l.SnackbarContent, "bg", D), b(l.SnackbarContent, "color", Ce(() => S ? vr.text.primary : l.getContrastText(D))), b(l.SpeedDialAction, "fabHoverBg", Nt(l.background.paper, 0.15)), b(l.StepConnector, "border", v("palette-grey-400")), b(l.StepContent, "border", v("palette-grey-400")), b(l.Switch, "defaultColor", v("palette-common-white")), b(l.Switch, "defaultDisabledColor", v("palette-grey-100")), b(l.Switch, "primaryDisabledColor", O(J, l.primary.main, 0.62)), b(l.Switch, "secondaryDisabledColor", O(J, l.secondary.main, 0.62)), b(l.Switch, "errorDisabledColor", O(J, l.error.main, 0.62)), b(l.Switch, "infoDisabledColor", O(J, l.info.main, 0.62)), b(l.Switch, "successDisabledColor", O(J, l.success.main, 0.62)), b(l.Switch, "warningDisabledColor", O(J, l.warning.main, 0.62)), b(l.TableCell, "border", O(J, O(He, l.divider, 1), 0.88)), b(l.Tooltip, "bg", O(He, l.grey[700], 0.92));
    }
    if (l.mode === "dark") {
      b(l.Alert, "errorColor", O(J, l.error.light, 0.6)), b(l.Alert, "infoColor", O(J, l.info.light, 0.6)), b(l.Alert, "successColor", O(J, l.success.light, 0.6)), b(l.Alert, "warningColor", O(J, l.warning.light, 0.6)), b(l.Alert, "errorFilledBg", v("palette-error-dark")), b(l.Alert, "infoFilledBg", v("palette-info-dark")), b(l.Alert, "successFilledBg", v("palette-success-dark")), b(l.Alert, "warningFilledBg", v("palette-warning-dark")), b(l.Alert, "errorFilledColor", Ce(() => l.getContrastText(l.error.dark))), b(l.Alert, "infoFilledColor", Ce(() => l.getContrastText(l.info.dark))), b(l.Alert, "successFilledColor", Ce(() => l.getContrastText(l.success.dark))), b(l.Alert, "warningFilledColor", Ce(() => l.getContrastText(l.warning.dark))), b(l.Alert, "errorStandardBg", O(G, l.error.light, 0.9)), b(l.Alert, "infoStandardBg", O(G, l.info.light, 0.9)), b(l.Alert, "successStandardBg", O(G, l.success.light, 0.9)), b(l.Alert, "warningStandardBg", O(G, l.warning.light, 0.9)), b(l.Alert, "errorIconColor", v("palette-error-main")), b(l.Alert, "infoIconColor", v("palette-info-main")), b(l.Alert, "successIconColor", v("palette-success-main")), b(l.Alert, "warningIconColor", v("palette-warning-main")), b(l.AppBar, "defaultBg", v("palette-grey-900")), b(l.AppBar, "darkBg", v("palette-background-paper")), b(l.AppBar, "darkColor", v("palette-text-primary")), b(l.Avatar, "defaultBg", v("palette-grey-600")), b(l.Button, "inheritContainedBg", v("palette-grey-800")), b(l.Button, "inheritContainedHoverBg", v("palette-grey-700")), b(l.Chip, "defaultBorder", v("palette-grey-700")), b(l.Chip, "defaultAvatarColor", v("palette-grey-300")), b(l.Chip, "defaultIconColor", v("palette-grey-300")), b(l.FilledInput, "bg", "rgba(255, 255, 255, 0.09)"), b(l.FilledInput, "hoverBg", "rgba(255, 255, 255, 0.13)"), b(l.FilledInput, "disabledBg", "rgba(255, 255, 255, 0.12)"), b(l.LinearProgress, "primaryBg", O(G, l.primary.main, 0.5)), b(l.LinearProgress, "secondaryBg", O(G, l.secondary.main, 0.5)), b(l.LinearProgress, "errorBg", O(G, l.error.main, 0.5)), b(l.LinearProgress, "infoBg", O(G, l.info.main, 0.5)), b(l.LinearProgress, "successBg", O(G, l.success.main, 0.5)), b(l.LinearProgress, "warningBg", O(G, l.warning.main, 0.5)), b(l.Skeleton, "bg", S ? O(He, l.text.primary, 0.13) : `rgba(${v("palette-text-primaryChannel")} / 0.13)`), b(l.Slider, "primaryTrack", O(G, l.primary.main, 0.5)), b(l.Slider, "secondaryTrack", O(G, l.secondary.main, 0.5)), b(l.Slider, "errorTrack", O(G, l.error.main, 0.5)), b(l.Slider, "infoTrack", O(G, l.info.main, 0.5)), b(l.Slider, "successTrack", O(G, l.success.main, 0.5)), b(l.Slider, "warningTrack", O(G, l.warning.main, 0.5));
      const D = S ? O(J, l.background.default, 0.985) : Nt(l.background.default, 0.98);
      b(l.SnackbarContent, "bg", D), b(l.SnackbarContent, "color", Ce(() => S ? Bo.text.primary : l.getContrastText(D))), b(l.SpeedDialAction, "fabHoverBg", Nt(l.background.paper, 0.15)), b(l.StepConnector, "border", v("palette-grey-600")), b(l.StepContent, "border", v("palette-grey-600")), b(l.Switch, "defaultColor", v("palette-grey-300")), b(l.Switch, "defaultDisabledColor", v("palette-grey-600")), b(l.Switch, "primaryDisabledColor", O(G, l.primary.main, 0.55)), b(l.Switch, "secondaryDisabledColor", O(G, l.secondary.main, 0.55)), b(l.Switch, "errorDisabledColor", O(G, l.error.main, 0.55)), b(l.Switch, "infoDisabledColor", O(G, l.info.main, 0.55)), b(l.Switch, "successDisabledColor", O(G, l.success.main, 0.55)), b(l.Switch, "warningDisabledColor", O(G, l.warning.main, 0.55)), b(l.TableCell, "border", O(G, O(He, l.divider, 1), 0.68)), b(l.Tooltip, "bg", O(He, l.grey[700], 0.92));
    }
    ke(l.background, "default"), ke(l.background, "paper"), ke(l.common, "background"), ke(l.common, "onBackground"), ke(l, "divider"), Object.keys(l).forEach((D) => {
      const q = l[D];
      D !== "tonalOffset" && q && typeof q == "object" && (q.main && b(l[D], "mainChannel", dt(pt(q.main))), q.light && b(l[D], "lightChannel", dt(pt(q.light))), q.dark && b(l[D], "darkChannel", dt(pt(q.dark))), q.contrastText && b(l[D], "contrastTextChannel", dt(pt(q.contrastText))), D === "text" && (ke(l[D], "primary"), ke(l[D], "secondary")), D === "action" && (q.active && ke(l[D], "active"), q.selected && ke(l[D], "selected")));
    });
  }), k = t.reduce((Y, l) => Se(Y, l), k);
  const H = {
    prefix: s,
    disableCssColorScheme: o,
    shouldSkipGeneratingVar: a,
    getSelector: xl(k),
    enableContrastVars: i
  }, {
    vars: re,
    generateThemeVars: ee,
    generateStyleSheets: Z
  } = Xc(k, H);
  return k.vars = re, Object.entries(k.colorSchemes[k.defaultColorScheme]).forEach(([Y, l]) => {
    k[Y] = l;
  }), k.generateThemeVars = ee, k.generateStyleSheets = Z, k.generateSpacing = function() {
    return Io(u.spacing, Fr(this));
  }, k.getColorSchemeSelector = Qc(c), k.spacing = k.generateSpacing(), k.shouldSkipGeneratingVar = a, k.unstable_sxConfig = {
    ...tr,
    ...u?.unstable_sxConfig
  }, k.unstable_sx = function(l) {
    return rr({
      sx: l,
      theme: this
    });
  }, k.toRuntimeSource = Mo, k;
}
function Fn(e, t, r) {
  e.colorSchemes && r && (e.colorSchemes[t] = {
    ...r !== !0 && r,
    palette: Hr({
      ...r === !0 ? {} : r.palette,
      mode: t
    })
    // cast type to skip module augmentation test
  });
}
function Il(e = {}, ...t) {
  const {
    palette: r,
    cssVariables: n = !1,
    colorSchemes: o = r ? void 0 : {
      light: !0
    },
    defaultColorScheme: s = r?.mode,
    ...i
  } = e, a = s || "light", c = o?.[a], f = {
    ...o,
    ...r ? {
      [a]: {
        ...typeof c != "boolean" && c,
        palette: r
      }
    } : void 0
  };
  if (n === !1) {
    if (!("colorSchemes" in e))
      return Pr(e, ...t);
    let u = r;
    "palette" in e || f[a] && (f[a] !== !0 ? u = f[a].palette : a === "dark" && (u = {
      mode: "dark"
    }));
    const p = Pr({
      ...e,
      palette: u
    }, ...t);
    return p.defaultColorScheme = a, p.colorSchemes = f, p.palette.mode === "light" && (p.colorSchemes.light = {
      ...f.light !== !0 && f.light,
      palette: p.palette
    }, Fn(p, "dark", f.dark)), p.palette.mode === "dark" && (p.colorSchemes.dark = {
      ...f.dark !== !0 && f.dark,
      palette: p.palette
    }, Fn(p, "light", f.light)), p;
  }
  return !r && !("light" in f) && a === "light" && (f.light = !0), Nl({
    ...i,
    colorSchemes: f,
    defaultColorScheme: a,
    ...typeof n != "boolean" && n
  }, ...t);
}
const $l = Il();
function Dl() {
  const e = Fc($l);
  return process.env.NODE_ENV !== "production" && Ht.useDebugValue(e), e[xa] || e;
}
const Mn = ({
  brandConfig: e,
  title: t,
  subtitle: r
}) => {
  const n = Dl();
  return /* @__PURE__ */ Oe(ve, { sx: { textAlign: "center", mb: 4 }, children: [
    e.logo && /* @__PURE__ */ F(ve, { sx: { mb: 2 }, children: typeof e.logo == "string" ? /* @__PURE__ */ F(
      "img",
      {
        src: e.logo,
        alt: e.companyName || "Company Logo",
        style: {
          height: e.logoHeight,
          maxWidth: "100%",
          objectFit: "contain"
        }
      }
    ) : e.logo }),
    t && /* @__PURE__ */ F(
      tt,
      {
        variant: "h4",
        component: "h1",
        sx: {
          mb: 1,
          color: e.textColor,
          fontSize: {
            xs: n.typography.pxToRem(42),
            sm: n.typography.pxToRem(54)
          }
        },
        children: t
      }
    ),
    r && /* @__PURE__ */ F(
      tt,
      {
        variant: "body1",
        sx: {
          color: e.textColor,
          opacity: 0.7,
          fontSize: "0.95rem"
        },
        children: r
      }
    )
  ] });
}, It = ({
  brandConfig: e,
  icon: t,
  label: r,
  loadingLabel: n = "Signing in...",
  isLoading: o = !1,
  disabled: s = !1,
  onClick: i
}) => /* @__PURE__ */ F(
  gt,
  {
    fullWidth: !0,
    variant: "outlined",
    size: "large",
    startIcon: o ? /* @__PURE__ */ F(Hn, { size: 20, color: "inherit" }) : t,
    onClick: i,
    disabled: s,
    sx: {
      py: 1.5,
      borderRadius: 1.4,
      textTransform: "none",
      fontWeight: 500,
      fontSize: "1rem",
      borderColor: e.textColor + "30",
      color: e.textColor,
      "&:hover": {
        borderColor: e.primaryColor,
        backgroundColor: `${e.primaryColor}08`,
        color: e.textColor
      },
      "&:active": {
        borderColor: e.primaryColor,
        backgroundColor: `${e.primaryColor}12`,
        color: e.textColor
      },
      "&:disabled": {
        borderColor: e.textColor + "20",
        color: e.textColor + "60"
      },
      "&:focus": {
        borderColor: e.textColor + "30",
        color: e.textColor
      },
      "&.MuiButton-root": {
        borderColor: e.textColor + "30",
        color: e.textColor
      }
    },
    children: o ? n : r
  }
), Ll = (e) => /* @__PURE__ */ Oe(zo, { ...e, viewBox: "0 0 23 23", children: [
  /* @__PURE__ */ F("path", { fill: "#f35325", d: "M1 1h10v10H1z" }),
  /* @__PURE__ */ F("path", { fill: "#81bc06", d: "M12 1h10v10H12z" }),
  /* @__PURE__ */ F("path", { fill: "#05a6f0", d: "M1 12h10v10H1z" }),
  /* @__PURE__ */ F("path", { fill: "#ffba08", d: "M12 12h10v10H12z" })
] });
function Ul(e, t, r) {
  return r === void 0 && (r = {}), function(n, o, s) {
    try {
      return Promise.resolve((function(i, a) {
        try {
          var c = (t != null && t.context && process.env.NODE_ENV === "development" && console.warn("You should not used the yup options context. Please, use the 'useForm' context object instead"), Promise.resolve(e[r.mode === "sync" ? "validateSync" : "validate"](n, Object.assign({ abortEarly: !1 }, t, { context: o }))).then(function(f) {
            return s.shouldUseNativeValidation && es({}, s), { values: r.raw ? Object.assign({}, n) : f, errors: {} };
          }));
        } catch (f) {
          return a(f);
        }
        return c && c.then ? c.then(void 0, a) : c;
      })(0, function(i) {
        if (!i.inner) throw i;
        return { values: {}, errors: ts((a = i, c = !s.shouldUseNativeValidation && s.criteriaMode === "all", (a.inner || []).reduce(function(f, u) {
          if (f[u.path] || (f[u.path] = { message: u.message, type: u.type }), c) {
            var p = f[u.path].types, m = p && p[u.type];
            f[u.path] = Qo(u.path, c, f, u.type, m ? [].concat(m, u.message) : u.message);
          }
          return f;
        }, {})), s) };
        var a, c;
      }));
    } catch (i) {
      return Promise.reject(i);
    }
  };
}
const Bl = Wr.object({
  email: Wr.string().email("Please enter a valid email address").required("Email is required")
}), Fl = ({
  brandConfig: e,
  title: t,
  description: r,
  submitLabel: n,
  isSubmitting: o,
  error: s,
  onSubmit: i,
  onBackToLogin: a,
  onCloseError: c
}) => {
  const {
    register: f,
    handleSubmit: u,
    formState: { errors: p }
  } = Zo({
    resolver: Ul(Bl)
  }), m = o;
  return /* @__PURE__ */ Oe(jn, { children: [
    s && /* @__PURE__ */ F(Vn, { severity: "error", sx: { mb: 3 }, onClose: c, children: s.message }),
    /* @__PURE__ */ Oe(ve, { sx: { textAlign: "center", mb: 3 }, children: [
      /* @__PURE__ */ F(
        tt,
        {
          variant: "h5",
          component: "h1",
          sx: {
            color: e.textColor,
            fontWeight: 600,
            fontSize: { xs: "1.5rem", sm: "1.75rem" },
            mb: 2
          },
          children: t
        }
      ),
      /* @__PURE__ */ F(
        tt,
        {
          variant: "body1",
          sx: {
            color: e.textColor,
            opacity: 0.8,
            mb: 3,
            lineHeight: 1.6
          },
          children: r
        }
      )
    ] }),
    /* @__PURE__ */ F(ve, { component: "form", onSubmit: u(i), children: /* @__PURE__ */ Oe(Wn, { spacing: 3, children: [
      /* @__PURE__ */ F(
        Ko,
        {
          ...f("email"),
          fullWidth: !0,
          label: "Email Address",
          type: "email",
          placeholder: "Enter your email",
          error: !!p.email,
          helperText: p.email?.message,
          disabled: m,
          sx: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 1.4,
              "&:hover fieldset": {
                borderColor: e.primaryColor
              },
              "&.Mui-focused fieldset": {
                borderColor: e.primaryColor
              }
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: e.primaryColor
            }
          }
        }
      ),
      /* @__PURE__ */ F(
        gt,
        {
          type: "submit",
          fullWidth: !0,
          variant: "contained",
          size: "large",
          disabled: m,
          sx: {
            py: 1.5,
            backgroundColor: e.primaryColor,
            color: e.buttonTextColor,
            borderRadius: 1.4,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "1rem",
            boxShadow: `0 4px 12px ${e.primaryColor}30`,
            "&:hover": {
              backgroundColor: e.secondaryColor,
              boxShadow: `0 6px 16px ${e.primaryColor}40`
            },
            "&:disabled": {
              backgroundColor: `${e.primaryColor}60`,
              color: e.buttonTextColor
            }
          },
          children: m ? /* @__PURE__ */ F(Hn, { size: 24, color: "inherit" }) : n
        }
      ),
      /* @__PURE__ */ F(
        gt,
        {
          fullWidth: !0,
          variant: "text",
          onClick: a,
          disabled: m,
          sx: {
            textTransform: "none",
            color: e.primaryColor,
            fontWeight: 500,
            "&:hover": {
              backgroundColor: `${e.primaryColor}08`
            }
          },
          children: "Back to Sign In"
        }
      )
    ] }) })
  ] });
}, Ml = ({
  brandConfig: e,
  title: t,
  description: r,
  onBackToLogin: n
}) => /* @__PURE__ */ Oe(jn, { children: [
  /* @__PURE__ */ Oe(ve, { sx: { textAlign: "center", mb: 3 }, children: [
    e.logo && /* @__PURE__ */ F(ve, { sx: { mb: 2 }, children: typeof e.logo == "string" ? /* @__PURE__ */ F(
      "img",
      {
        src: e.logo,
        alt: e.companyName || "Company Logo",
        style: {
          height: e.logoHeight,
          maxWidth: "100%",
          objectFit: "contain"
        }
      }
    ) : e.logo }),
    /* @__PURE__ */ F(
      tt,
      {
        variant: "h5",
        component: "h1",
        sx: {
          color: e.textColor,
          fontWeight: 600,
          fontSize: { xs: "1.5rem", sm: "1.75rem" },
          mb: 2
        },
        children: t
      }
    ),
    /* @__PURE__ */ F(
      tt,
      {
        variant: "body1",
        sx: {
          color: e.textColor,
          opacity: 0.8,
          mb: 3,
          lineHeight: 1.6,
          // A blank line in the description is a paragraph break
          whiteSpace: "pre-line"
        },
        children: r
      }
    )
  ] }),
  /* @__PURE__ */ F(ve, { textAlign: "center", sx: { mt: 3 }, children: /* @__PURE__ */ F(
    gt,
    {
      variant: "contained",
      onClick: n,
      sx: {
        py: 1.5,
        px: 4,
        backgroundColor: e.primaryColor,
        color: e.buttonTextColor,
        borderRadius: 1.4,
        textTransform: "none",
        fontWeight: 600,
        fontSize: "1rem",
        boxShadow: `0 4px 12px ${e.primaryColor}30`,
        "&:hover": {
          backgroundColor: e.secondaryColor,
          boxShadow: `0 6px 16px ${e.primaryColor}40`
        }
      },
      children: "Back to Sign In"
    }
  ) })
] }), Or = ({
  children: e,
  brandConfig: t
}) => /* @__PURE__ */ F(
  ve,
  {
    sx: {
      // Mobile: full screen with proper centering
      width: { xs: "100%", sm: "auto" },
      height: { xs: "100vh", sm: "auto" },
      minHeight: { xs: "100vh", sm: "auto" },
      margin: { xs: 0, sm: "auto" },
      maxWidth: { xs: "100%", sm: "600px" },
      // Desktop: container with card styling
      mt: { xs: 0, sm: 4 },
      boxShadow: {
        xs: "none",
        sm: "0 8px 32px rgba(0, 0, 0, 0.12)"
      },
      borderRadius: { xs: 0, sm: 2.5 },
      border: { xs: "none", sm: "1px solid rgba(0, 0, 0, 0.08)" },
      background: t.backgroundColor,
      display: "flex",
      flexDirection: "column",
      // Prevent horizontal overflow
      overflowX: "hidden",
      boxSizing: "border-box"
    },
    children: /* @__PURE__ */ F(
      ve,
      {
        sx: {
          p: { xs: 3, sm: 4 },
          flex: 1,
          display: "flex",
          flexDirection: "column",
          // Ensure proper mobile centering and prevent overflow
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        },
        children: e
      }
    )
  }
), hu = ({
  authConfig: e,
  onLoginSuccess: t,
  onLoginError: r,
  enableRecaptcha: n = !1,
  recaptchaSiteKey: o,
  enableGoogleSignIn: s = !0,
  enableMicrosoftSignIn: i = !1,
  enableMagicLinkSignIn: a = !1,
  enablePasskeySignIn: c = !1,
  showErrors: f = !0,
  branding: u
}) => {
  const [p, m] = Le("idle"), [E, y] = Le(null), [h, T] = Le(!1), g = fs(u), R = () => `${window.location.origin}/callback`;
  if (ht(() => {
    T(St());
  }, []), ht(() => {
    try {
      _e(e.apiBaseUrl, e.apiKey);
    } catch (v) {
      console.error("Failed to initialize API client:", v);
    }
  }, [e.apiBaseUrl, e.apiKey]), !s && !i && !a && !c)
    throw new Error(
      "At least one sign-in method must be enabled (enableGoogleSignIn, enableMicrosoftSignIn, enableMagicLinkSignIn or enablePasskeySignIn)"
    );
  if (n && !o)
    throw new Error(
      "recaptchaSiteKey is required when enableRecaptcha is true"
    );
  const x = () => window.grecaptcha.execute(o, { action: "login" }).catch(() => {
    throw new Error("reCAPTCHA verification failed");
  }), S = async () => {
    if (!n || !o)
      return "";
    if (typeof window > "u" || !window.grecaptcha)
      throw new Error("reCAPTCHA is not loaded");
    return new Promise((v, O) => {
      const D = () => {
        x().then(v).catch(O);
      };
      window.grecaptcha.ready(D);
    });
  }, w = async (v, O) => {
    xe.setTokens(v.accessToken, v.refreshToken);
    const D = O ?? await Ne.getCurrentUser();
    m("success"), t({ user: D, tokens: v });
  }, k = (v) => {
    try {
      m(`${v}-loading`), y(null);
      const O = v === "google" ? le.ENDPOINTS.GOOGLE_AUTH : le.ENDPOINTS.MICROSOFT_AUTH;
      setTimeout(() => {
        Ne.initiateOAuth(
          O,
          R(),
          e.apiBaseUrl
        );
      }, 300);
    } catch (O) {
      const D = O;
      y({ message: D.message, type: v }), m("error"), r(D);
    }
  }, H = async () => {
    m("passkey-loading"), y(null);
    try {
      const { tokens: v, user: O } = await Ne.loginWithPasskey();
      await w(v, O);
    } catch (v) {
      const O = v;
      y({ message: O.message, type: "passkey" }), m("error"), r(O);
    }
  }, re = () => {
    y(null), m("magic-link");
  }, ee = async (v) => {
    m("magic-link-loading"), y(null);
    try {
      n && await S(), await Ne.requestMagicLink(v.email, R()), m("magic-link-success");
    } catch (O) {
      const D = O;
      y({ message: D.message, type: "magic-link" }), m("magic-link"), r(D);
    }
  }, Z = () => {
    y(null), m("idle");
  };
  if (ht(() => {
    if (n && o && typeof window < "u") {
      const v = document.createElement("script");
      v.src = `https://www.google.com/recaptcha/enterprise.js?render=${o}`, v.async = !0, v.defer = !0, document.head.appendChild(v);
    }
  }, [n, o]), p === "magic-link-success")
    return /* @__PURE__ */ F(Or, { brandConfig: g, children: /* @__PURE__ */ F(
      Ml,
      {
        brandConfig: g,
        title: g.magicLinkSuccessTitle || "Check Your Email",
        description: g.magicLinkSuccessDescription || "If this email address belongs to an active account, we have sent it a sign-in link.",
        onBackToLogin: Z
      }
    ) });
  if (p === "magic-link" || p === "magic-link-loading")
    return /* @__PURE__ */ Oe(Or, { brandConfig: g, children: [
      /* @__PURE__ */ F(Mn, { brandConfig: g }),
      /* @__PURE__ */ F(
        Fl,
        {
          brandConfig: g,
          title: g.magicLinkTitle || "Sign In with Email",
          description: g.magicLinkDescription || "Enter your email address and we will send you a one-time link to sign in.",
          submitLabel: "Send Sign-In Link",
          isSubmitting: p === "magic-link-loading",
          error: f ? E : null,
          onSubmit: ee,
          onBackToLogin: Z,
          onCloseError: () => y(null)
        }
      )
    ] });
  const Y = c && h, l = ps(p);
  return /* @__PURE__ */ Oe(ve, { children: [
    /* @__PURE__ */ F(
      Mn,
      {
        brandConfig: g,
        title: g.companyName ? g.companyName : "Sign In",
        subtitle: g.tagline
      }
    ),
    /* @__PURE__ */ Oe(Or, { brandConfig: g, children: [
      f && E && /* @__PURE__ */ F(
        Vn,
        {
          severity: "error",
          sx: { mb: 3 },
          onClose: () => y(null),
          children: E.message
        }
      ),
      /* @__PURE__ */ Oe(Wn, { spacing: 3, children: [
        Y && /* @__PURE__ */ F(
          It,
          {
            brandConfig: g,
            icon: /* @__PURE__ */ F(Yo, {}),
            label: "Sign in with a passkey",
            loadingLabel: "Waiting for passkey...",
            isLoading: p === "passkey-loading",
            disabled: l,
            onClick: H
          }
        ),
        s && /* @__PURE__ */ F(
          It,
          {
            brandConfig: g,
            icon: /* @__PURE__ */ F(Go, {}),
            label: "Continue with Google",
            isLoading: p === "google-loading",
            disabled: l,
            onClick: () => k("google")
          }
        ),
        i && /* @__PURE__ */ F(
          It,
          {
            brandConfig: g,
            icon: /* @__PURE__ */ F(Ll, {}),
            label: "Continue with Microsoft",
            isLoading: p === "microsoft-loading",
            disabled: l,
            onClick: () => k("microsoft")
          }
        ),
        a && /* @__PURE__ */ F(
          It,
          {
            brandConfig: g,
            icon: /* @__PURE__ */ F(Jo, {}),
            label: "Email me a sign-in link",
            disabled: l,
            onClick: re
          }
        ),
        f && p === "error" && /* @__PURE__ */ F(
          gt,
          {
            fullWidth: !0,
            variant: "text",
            onClick: Z,
            sx: {
              mt: 1,
              color: g.primaryColor,
              textTransform: "none",
              fontWeight: 500,
              "&:hover": {
                backgroundColor: `${g.primaryColor}08`
              }
            },
            children: "Try Again"
          }
        )
      ] })
    ] })
  ] });
}, mu = (e) => {
  const [t, r] = Le(!0), [n, o] = Le(null), s = Wo(!1);
  return ht(() => {
    if (s.current)
      return;
    s.current = !0, (async () => {
      try {
        e?.apiBaseUrl && _e(e.apiBaseUrl, e.apiKey);
        const a = new URLSearchParams(window.location.search);
        let c = a.get("access_token") || a.get("accessToken"), f = a.get("refresh_token") || a.get("refreshToken");
        const u = a.get("magic_token"), p = a.get("user"), m = a.get("error"), E = a.get("message");
        if (m) {
          const T = decodeURIComponent(E || m);
          throw new Error(T);
        }
        if (u) {
          const T = await Ne.verifyMagicLink(u);
          c = T.accessToken, f = T.refreshToken;
        }
        if (!c || !f)
          throw new Error("Missing authentication tokens in callback URL");
        xe.setTokens(c, f);
        let y;
        if (p)
          try {
            const T = decodeURIComponent(p);
            y = JSON.parse(T);
          } catch (T) {
            console.warn("Failed to parse user from URL, fetching from API:", T), y = await Ne.getCurrentUser();
          }
        else
          y = await Ne.getCurrentUser();
        e?.onSuccess?.({ accessToken: c, refreshToken: f }, y);
        const h = e?.redirectPath || "/dashboard";
        window.history.replaceState({}, document.title, h), r(!1);
      } catch (a) {
        const c = a;
        o(c), e?.onError?.(c), r(!1);
      }
    })();
  }, [e?.redirectPath]), { loading: t, error: n };
}, gu = (e) => ({ logout: qo(async () => {
  const r = xe.getRefreshToken();
  if (e?.apiBaseUrl && r)
    try {
      await Ne.logout(r);
    } catch (n) {
      console.error("Logout API call failed:", n);
    }
  xe.clearTokens(), window.location.href = "/login";
}, [e?.apiBaseUrl]) }), yu = (e) => {
  const [t, r] = Le(!1), [n, o] = Le(null), [s, i] = Le(!1);
  return ht(() => {
    i(St());
  }, []), { registerPasskey: async (c) => {
    r(!0), o(null);
    try {
      return e?.apiBaseUrl && _e(e.apiBaseUrl, e.apiKey), await Ne.registerPasskey(c);
    } catch (f) {
      return o(f), null;
    } finally {
      r(!1);
    }
  }, loading: t, error: n, isSupported: s };
};
export {
  hu as LumoraLogin,
  xe as TokenStorage,
  fs as getBrandingConfig,
  us as getDefaultBranding,
  mu as useAuthCallback,
  gu as useLogout,
  yu as usePasskeyRegistration
};
