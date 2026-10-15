import { jsxs as R, jsx as d, Fragment as jt } from "react/jsx-runtime";
import Be, { useState as Y, useEffect as me, useId as fr, useRef as Tn, useCallback as hr } from "react";
import { SvgIcon as Oe, Box as g, Tooltip as pr, IconButton as mr, Button as He, CircularProgress as Ct, InputBase as gr, ToggleButtonGroup as yr, ToggleButton as br, Link as $t, Alert as wr, Divider as Er } from "@mui/material";
import { MarkEmailReadOutlined as Sr, LockOutlined as Rr, Google as xr } from "@mui/icons-material";
import { keyframes as kt } from "@emotion/react";
import { appendErrors as Or, useForm as Tr } from "react-hook-form";
import { validateFieldsNatively as Ar, toNestErrors as _r } from "@hookform/resolvers";
import * as zt from "yup";
function ee(e) {
  const t = new Uint8Array(e);
  let n = "";
  for (const o of t)
    n += String.fromCharCode(o);
  return btoa(n).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function et(e) {
  const t = e.replace(/-/g, "+").replace(/_/g, "/"), n = (4 - t.length % 4) % 4, r = t.padEnd(t.length + n, "="), o = atob(r), s = new ArrayBuffer(o.length), i = new Uint8Array(s);
  for (let a = 0; a < o.length; a++)
    i[a] = o.charCodeAt(a);
  return s;
}
function $e() {
  return Cr.stubThis(globalThis?.PublicKeyCredential !== void 0 && typeof globalThis.PublicKeyCredential == "function");
}
const Cr = {
  stubThis: (e) => e
};
function An(e) {
  const { id: t } = e;
  return {
    ...e,
    id: et(t),
    transports: e.transports,
    type: e.type
  };
}
function _n(e) {
  return (
    // Consider localhost valid as well since it's okay wrt Secure Contexts
    e === "localhost" || // Support punycode (ACE) or ascii labels and domains
    /^((xn--[a-z0-9-]+|[a-z0-9]+(-[a-z0-9]+)*)\.)+([a-z]{2,}|xn--[a-z0-9-]+)$/i.test(e)
  );
}
class H extends Error {
  constructor({ message: t, code: n, cause: r, name: o }) {
    super(t, { cause: r }), Object.defineProperty(this, "code", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: void 0
    }), this.name = o ?? r.name, this.code = n;
  }
}
function kr({ error: e, options: t }) {
  const { publicKey: n } = t;
  if (!n)
    throw Error("options was missing required publicKey property");
  if (e.name === "AbortError") {
    if (t.signal instanceof AbortSignal)
      return new H({
        message: "Registration ceremony was sent an abort signal",
        code: "ERROR_CEREMONY_ABORTED",
        cause: e
      });
  } else if (e.name === "ConstraintError") {
    if (n.authenticatorSelection?.requireResidentKey === !0)
      return new H({
        message: "Discoverable credentials were required but no available authenticator supported it",
        code: "ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT",
        cause: e
      });
    if (
      // @ts-ignore: `mediation` doesn't yet exist on CredentialCreationOptions but it's possible as of Sept 2024
      t.mediation === "conditional" && n.authenticatorSelection?.userVerification === "required"
    )
      return new H({
        message: "User verification was required during automatic registration but it could not be performed",
        code: "ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE",
        cause: e
      });
    if (n.authenticatorSelection?.userVerification === "required")
      return new H({
        message: "User verification was required but no available authenticator supported it",
        code: "ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT",
        cause: e
      });
  } else {
    if (e.name === "InvalidStateError")
      return new H({
        message: "The authenticator was previously registered",
        code: "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED",
        cause: e
      });
    if (e.name === "NotAllowedError")
      return new H({
        message: e.message,
        code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
        cause: e
      });
    if (e.name === "NotSupportedError")
      return n.pubKeyCredParams.filter((o) => o.type === "public-key").length === 0 ? new H({
        message: 'No entry in pubKeyCredParams was of type "public-key"',
        code: "ERROR_MALFORMED_PUBKEYCREDPARAMS",
        cause: e
      }) : new H({
        message: "No available authenticator supported any of the specified pubKeyCredParams algorithms",
        code: "ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG",
        cause: e
      });
    if (e.name === "SecurityError") {
      const r = globalThis.location.hostname;
      if (_n(r)) {
        if (n.rp.id !== r)
          return new H({
            message: `The RP ID "${n.rp.id}" is invalid for this domain`,
            code: "ERROR_INVALID_RP_ID",
            cause: e
          });
      } else return new H({
        message: `${globalThis.location.hostname} is an invalid domain`,
        code: "ERROR_INVALID_DOMAIN",
        cause: e
      });
    } else if (e.name === "TypeError") {
      if (n.user.id.byteLength < 1 || n.user.id.byteLength > 64)
        return new H({
          message: "User ID was not between 1 and 64 characters",
          code: "ERROR_INVALID_USER_ID_LENGTH",
          cause: e
        });
    } else if (e.name === "UnknownError")
      return new H({
        message: "The authenticator was unable to process the specified options, or could not create a new credential",
        code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
        cause: e
      });
  }
  return e;
}
class Pr {
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
      const n = new Error("Cancelling existing WebAuthn API call for new one");
      n.name = "AbortError", this.controller.abort(n);
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
const Cn = new Pr(), Nr = ["cross-platform", "platform"];
function kn(e) {
  if (e && !(Nr.indexOf(e) < 0))
    return e;
}
async function Lr(e) {
  !e.optionsJSON && e.challenge && (console.warn("startRegistration() was not called correctly. It will try to continue with the provided options, but this call should be refactored to use the expected call structure instead. See https://simplewebauthn.dev/docs/packages/browser#typeerror-cannot-read-properties-of-undefined-reading-challenge for more information."), e = { optionsJSON: e });
  const { optionsJSON: t, useAutoRegister: n = !1 } = e;
  if (!$e())
    throw new Error("WebAuthn is not supported in this browser");
  const r = {
    ...t,
    challenge: et(t.challenge),
    user: {
      ...t.user,
      id: et(t.user.id)
    },
    excludeCredentials: t.excludeCredentials?.map(An)
  }, o = {};
  n && (o.mediation = "conditional"), o.publicKey = r, o.signal = Cn.createNewAbortSignal();
  let s;
  try {
    s = await navigator.credentials.create(
      // TODO: Newer versions of Deno require this casting, revisit once we're using Deno 2.6+
      o
    );
  } catch (S) {
    throw kr({ error: S, options: o });
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
    } catch (S) {
      dt("getPublicKeyAlgorithm()", S);
    }
  let y;
  if (typeof c.getPublicKey == "function")
    try {
      const S = c.getPublicKey();
      S !== null && (y = ee(S));
    } catch (S) {
      dt("getPublicKey()", S);
    }
  let x;
  if (typeof c.getAuthenticatorData == "function")
    try {
      x = ee(c.getAuthenticatorData());
    } catch (S) {
      dt("getAuthenticatorData()", S);
    }
  return {
    id: i,
    rawId: ee(a),
    response: {
      attestationObject: ee(c.attestationObject),
      clientDataJSON: ee(c.clientDataJSON),
      transports: u,
      publicKeyAlgorithm: p,
      publicKey: y,
      authenticatorData: x
    },
    type: f,
    clientExtensionResults: s.getClientExtensionResults(),
    authenticatorAttachment: kn(s.authenticatorAttachment)
  };
}
function dt(e, t) {
  console.warn(`The browser extension that intercepted this WebAuthn API call incorrectly implemented ${e}. You should report this error to them.
`, t);
}
function Ir() {
  if (!$e())
    return ft.stubThis(new Promise((t) => t(!1)));
  const e = globalThis.PublicKeyCredential;
  return e?.isConditionalMediationAvailable === void 0 ? ft.stubThis(new Promise((t) => t(!1))) : ft.stubThis(e.isConditionalMediationAvailable());
}
const ft = {
  stubThis: (e) => e
};
function Dr({ error: e, options: t }) {
  const { publicKey: n } = t;
  if (!n)
    throw Error("options was missing required publicKey property");
  if (e.name === "AbortError") {
    if (t.signal instanceof AbortSignal)
      return new H({
        message: "Authentication ceremony was sent an abort signal",
        code: "ERROR_CEREMONY_ABORTED",
        cause: e
      });
  } else {
    if (e.name === "NotAllowedError")
      return new H({
        message: e.message,
        code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
        cause: e
      });
    if (e.name === "SecurityError") {
      const r = globalThis.location.hostname;
      if (_n(r)) {
        if (n.rpId !== r)
          return new H({
            message: `The RP ID "${n.rpId}" is invalid for this domain`,
            code: "ERROR_INVALID_RP_ID",
            cause: e
          });
      } else return new H({
        message: `${globalThis.location.hostname} is an invalid domain`,
        code: "ERROR_INVALID_DOMAIN",
        cause: e
      });
    } else if (e.name === "UnknownError")
      return new H({
        message: "The authenticator was unable to process the specified options, or could not create a new assertion signature",
        code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
        cause: e
      });
  }
  return e;
}
async function Fr(e) {
  !e.optionsJSON && e.challenge && (console.warn("startAuthentication() was not called correctly. It will try to continue with the provided options, but this call should be refactored to use the expected call structure instead. See https://simplewebauthn.dev/docs/packages/browser#typeerror-cannot-read-properties-of-undefined-reading-challenge for more information."), e = { optionsJSON: e });
  const { optionsJSON: t, useBrowserAutofill: n = !1, verifyBrowserAutofillInput: r = !0 } = e;
  if (!$e())
    throw new Error("WebAuthn is not supported in this browser");
  let o;
  t.allowCredentials?.length !== 0 && (o = t.allowCredentials?.map(An));
  const s = {
    ...t,
    challenge: et(t.challenge),
    allowCredentials: o
  }, i = {};
  if (n) {
    if (!await Ir())
      throw Error("Browser does not support WebAuthn autofill");
    if (document.querySelectorAll("input[autocomplete$='webauthn']").length < 1 && r)
      throw Error('No <input> with "webauthn" as the only or last value in its `autocomplete` attribute was detected');
    i.mediation = "conditional", s.allowCredentials = [];
  }
  i.publicKey = s, i.signal = Cn.createNewAbortSignal();
  let a;
  try {
    a = await navigator.credentials.get(
      // TODO: Newer versions of Deno require this casting, revisit once we're using Deno 2.6+
      i
    );
  } catch (x) {
    throw Dr({ error: x, options: i });
  }
  if (!a)
    throw new Error("Authentication was not completed");
  const { id: c, rawId: f, response: u, type: p } = a;
  let y;
  return u.userHandle && (y = ee(u.userHandle)), {
    id: c,
    rawId: ee(f),
    response: {
      authenticatorData: ee(u.authenticatorData),
      clientDataJSON: ee(u.clientDataJSON),
      signature: ee(u.signature),
      userHandle: y
    },
    type: p,
    clientExtensionResults: a.getClientExtensionResults(),
    authenticatorAttachment: kn(a.authenticatorAttachment)
  };
}
const Ur = () => ({
  // Company branding
  companyName: "Lumora Capital",
  // Title reads "<welcomeTitle> <welcomeTitleAccent>", each part in its own colour (light mode)
  welcomeTitle: "Welcome to",
  welcomeTitleAccent: "Lumora.",
  welcomeTitleColor: "#072d29",
  welcomeTitleAccentColor: "#049586",
  tagline: "One Lumora account for Centra, Xpdite and Polymer.",
  // Visual styling (light mode; dark mode keeps primaryColor and draws its own neutrals)
  primaryColor: "#4a9d8a",
  secondaryColor: "#3d8676",
  backgroundColor: "#edf3f5",
  textColor: "#12332d",
  // Text on filled buttons, which are drawn in primaryColor. Set, not left to the host theme's
  // contrastText, which could be dark text on a dark brand colour.
  buttonTextColor: "#ffffff",
  // Fonts are not loaded by the component: the host page loads them, and these fall back
  headingFontFamily: "'Montserrat', 'Helvetica Neue', Arial, sans-serif",
  bodyFontFamily: "'Source Sans 3', 'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif",
  // Logo configuration: with no custom logo the built-in Lumora Capital logo is drawn
  logoHeight: 32,
  // "First time here?" card
  firstTimeTitle: "First time here?",
  firstTimeSteps: [
    "Sign in with your work account.",
    "See every platform you can open.",
    "Switch any time, without signing in again."
  ],
  // Footer
  securityNote: "Authorised users only. Sign-ins are logged.",
  // The address itself is shown, so people can copy it without opening a mail app
  supportLabel: "contact@lumora.capital",
  supportUrl: "mailto:contact@lumora.capital",
  // Footer reads "© <year> <holder>", with only the holder linked
  copyright: `© ${(/* @__PURE__ */ new Date()).getFullYear()}`,
  copyrightHolder: "Lumora Capital Solutions",
  copyrightUrl: "https://lumora.capital/",
  // Magic link messaging
  magicLinkSuccessTitle: "Check your inbox",
  // Sent only to an active account, and the API answers the same either way so the form cannot
  // reveal who has one: say so, rather than promising an email that may never come.
  magicLinkSuccessDescription: "If this email address belongs to an active account, we have sent it a sign-in link. The link works once and expires shortly. Nothing arrived? Check your spam folder, or contact your administrator."
}), vr = (e) => ({
  ...Ur(),
  ...e
}), Br = {
  pageBg: "#0e1d1a",
  surface: "#152824",
  border: "#28403a",
  heading: "#e9f1ef",
  text: "#c2d0cc",
  muted: "#8ea29d",
  heroBg: "#12231f"
}, de = [
  {
    id: "centra",
    name: "Centra",
    area: "Deals management",
    headline: "Every deal.",
    headlineAccent: "One Clear Record",
    description: "Origination, compliance and monitoring for Lumora Capital, all in one workspace.",
    color: "#049586",
    // #049586 is 3.7:1 with white text; this shade is 5.3:1 (4.7:1 as text on the page)
    uiColor: "#02796d",
    colorOnDark: "#0aa898",
    frameColor: "#037569",
    accent: "#e7b96c",
    // Deep teal
    dark: {
      pageBg: "#06201d",
      surface: "#0c2f2b",
      border: "#1a4a44",
      heading: "#e7f4f1",
      text: "#bdd6cf",
      muted: "#85a79f",
      heroBg: "#0f2a24"
    }
  },
  {
    id: "xpdite",
    name: "Xpdite",
    area: "Data training",
    headline: "Creating value",
    headlineAccent: "through insight",
    description: "Agent training and context gathering, from the people who know our deals best.",
    color: "#0f62b0",
    uiColor: "#0f62b0",
    // Lightened so it reads (5:1+) as tab text on every platform's dark surface
    colorOnDark: "#529de3",
    frameColor: "#0b4f8f",
    accent: "#a9cdf0",
    // Navy
    dark: {
      pageBg: "#0a1626",
      surface: "#0f2138",
      border: "#1d3758",
      heading: "#e8eefa",
      text: "#bfcbe3",
      muted: "#8899bb",
      heroBg: "#111d33"
    }
  },
  {
    id: "polymer",
    name: "Polymer",
    area: "AI agent configuration",
    headline: "Build agents.",
    headlineAccent: "Govern every version.",
    description: "Create, configure and manage the Nexa agents that work inside Centra.",
    color: "#03463f",
    uiColor: "#03463f",
    // Lightened so it reads (5:1+) as tab text on every platform's dark surface
    colorOnDark: "#2aac98",
    frameColor: "#023530",
    accent: "#05a393",
    // Near-black forest green
    dark: {
      pageBg: "#051411",
      surface: "#0a211d",
      border: "#17372f",
      heading: "#e5eeeb",
      text: "#b9c9c4",
      muted: "#83958f",
      heroBg: "#0d1b17"
    }
  }
], Hr = "centra", Je = (e) => de.find((t) => t.id === e), ht = "lumora_platform", Ot = {
  /**
   * Get the stored platform
   * @returns The platform id or null when none was chosen
   */
  get: () => {
    try {
      const e = localStorage.getItem(ht);
      return de.some((t) => t.id === e) ? e : null;
    } catch {
      return null;
    }
  },
  /**
   * Store the chosen platform, or clear it when null
   * @param platform - The platform id or null
   */
  set: (e) => {
    try {
      e ? localStorage.setItem(ht, e) : localStorage.removeItem(ht);
    } catch {
    }
  }
}, be = "@media (max-height: 920px)", Mr = "0 1px 2px rgba(18, 51, 45, 0.06), 0 8px 24px rgba(18, 51, 45, 0.06)", jr = (e, t, n) => {
  const r = t === "dark", o = n ? Je(n) : null, s = o ? r ? o.colorOnDark : o.uiColor : e.primaryColor, i = o ? o.dark : Br;
  return {
    mode: t,
    pageBg: r ? i.pageBg : e.backgroundColor,
    surface: r ? i.surface : "#ffffff",
    border: r ? i.border : "#d8e1e2",
    heading: r ? i.heading : e.textColor,
    // The branding colours are near-black greens, so dark mode uses the light heading and a mint
    welcomeTitle: r ? i.heading : e.welcomeTitleColor,
    // Dark mode matches the logo's brighter teal
    welcomeAccent: r ? "#0aa898" : e.welcomeTitleAccentColor,
    text: r ? i.text : "#3b4d49",
    tagline: r ? i.text : "#555555",
    label: r ? i.text : "#555555",
    placeholder: r ? i.muted : "#767676",
    divider: r ? i.border : "#c8cccf",
    // Lumora green; its mint version in dark mode, where #03463f would not show
    brandText: r ? "#45b39d" : "#03463f",
    // #41746e is too dim on the dark hero (3:1), so dark mode lifts it to a lighter teal
    eyebrow: r ? "#6fa59c" : "#41746e",
    // Brand teal; a brighter teal in dark mode so the small "CAPITAL" line stays legible
    logo: r ? "#0aa898" : "#049586",
    // MUI's default alert is a light pink block, which clashes with the dark page
    errorBg: r ? "rgba(209, 67, 67, 0.14)" : "#fdeeee",
    errorBorder: r ? "rgba(239, 107, 107, 0.35)" : "#f3c4c4",
    errorText: r ? "#f3b9b9" : "#8a1f1f",
    errorIcon: r ? "#ef6b6b" : "#d14343",
    heroText: r ? i.text : "#464646",
    // #02453e would vanish on the dark hero; #05a393 reads on both
    heroHeadline: r ? i.heading : "#02453e",
    heroHeadlineAccent: "#05a393",
    muted: r ? i.muted : "#5d6e6a",
    heroBg: r ? i.heroBg : "#f6f7f4",
    heroGrid: r ? "rgba(255, 255, 255, 0.05)" : "rgba(18, 51, 45, 0.06)",
    accent: s,
    // Hover darkens the accent slightly
    accentHover: o ? `color-mix(in srgb, ${s} 85%, #000)` : e.secondaryColor,
    // Dark mode's bright accents fail with white text (about 3:1); dark text passes (5:1+)
    buttonText: r ? "#04201c" : e.buttonTextColor,
    headingFont: e.headingFontFamily,
    bodyFont: e.bodyFontFamily
  };
}, tt = (e) => ({
  "&.Mui-focusVisible": {
    outline: `2px solid ${e.accent}`,
    outlineOffset: 2
  }
}), $r = (e) => `linear-gradient(${e} 1px, transparent 1px), linear-gradient(90deg, ${e} 1px, transparent 1px)`, Te = "cubic-bezier(0.2, 0.7, 0.2, 1)", Pt = 350, zr = "cubic-bezier(0.4, 0, 0.2, 1)", ot = (...e) => e.map((t) => `${t} ${Pt}ms ${zr}`).join(", "), I = ot(
  "background-color",
  "border-color",
  "color",
  "box-shadow"
), Pn = ot("fill", "stroke"), Wr = kt`
	from {
		opacity: 0;
		transform: translateY(12px);
	}
	to {
		opacity: 1;
		transform: none;
	}
`, Vr = kt`
	from {
		opacity: 0;
		transform: translate(16px, 16px);
	}
	to {
		opacity: 1;
		transform: none;
	}
`, Wt = kt`
	from {
		opacity: 0;
		transform: translateY(24px);
	}
	to {
		opacity: 1;
		transform: none;
	}
`, se = (e = 0, t = 500) => `${Wr} ${t}ms ${Te} ${e}ms both`, qr = {
  "@media (prefers-reduced-motion: reduce)": {
    "& *, & *::before, & *::after": {
      animationDuration: "1ms !important",
      animationDelay: "0ms !important",
      transitionDuration: "1ms !important"
    }
  }
}, pt = "lumora_color_mode", Nn = "(prefers-color-scheme: dark)", Kr = () => typeof window > "u" || !window.matchMedia ? "light" : window.matchMedia(Nn).matches ? "dark" : "light", mt = {
  /**
   * Get the stored colour mode
   * @returns The user's choice, or null when they never toggled
   */
  get: () => {
    try {
      const e = localStorage.getItem(pt);
      return e === "light" || e === "dark" ? e : null;
    } catch {
      return null;
    }
  },
  /**
   * Store the user's colour mode
   * @param mode - Light or dark
   */
  set: (e) => {
    try {
      localStorage.setItem(pt, e);
    } catch {
    }
  },
  /**
   * Forget the user's choice, so the page follows the system again
   */
  clear: () => {
    try {
      localStorage.removeItem(pt);
    } catch {
    }
  }
}, Gr = (e, t) => {
  const [n, r] = Y(
    () => mt.get() !== null
  ), [o, s] = Y(
    () => mt.get() ?? e ?? Kr()
  ), i = !n && !e;
  return me(() => {
    if (!i || typeof window > "u" || !window.matchMedia)
      return;
    const c = window.matchMedia(Nn), f = (u) => s(u.matches ? "dark" : "light");
    return c.addEventListener("change", f), () => c.removeEventListener("change", f);
  }, [i]), { colorMode: o, toggleColorMode: () => {
    const c = o === "dark" ? "light" : "dark";
    s(c), r(!0), mt.set(c), t?.(c);
  } };
}, Jr = [
  "google-loading",
  "microsoft-loading",
  "passkey-loading",
  "magic-link-loading"
], Yr = (e) => Jr.includes(e), te = {
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
  hasTokens: () => !!(te.getAccessToken() && te.getRefreshToken())
}, v = {
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
}, Zr = {
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
function Ln(e, t) {
  return function() {
    return e.apply(t, arguments);
  };
}
const { toString: Xr } = Object.prototype, { getPrototypeOf: fe } = Object, { iterator: ze, toStringTag: In } = Symbol, Me = (({ hasOwnProperty: e }) => (t, n) => e.call(t, n))(Object.prototype), Dn = (e) => typeof e == "string" && (e === "__proto__" || e === "constructor" || e === "prototype"), Fn = (e, t, n) => e === Object.prototype || !n && t === null, Qr = (e) => {
  if (!Object.isExtensible(e))
    return !1;
  const t = Object.getOwnPropertyNames(e);
  return Object.getOwnPropertySymbols && t.push(...Object.getOwnPropertySymbols(e)), t.every((n) => {
    if (Dn(n))
      return !1;
    const r = Object.getOwnPropertyDescriptor(e, n);
    return !!r && r.configurable && r.writable === !0;
  });
}, je = (e, t) => {
  let n = e;
  const r = [];
  for (; n != null; ) {
    if (r.indexOf(n) !== -1)
      return !1;
    r.push(n);
    const o = fe(n);
    if (Fn(n, o, n === e))
      return !1;
    if (Me(n, t))
      return !0;
    n = o;
  }
  return !1;
}, eo = (e, t) => e != null && je(e, t) ? e[t] : void 0, to = (e) => {
  if (e == null || typeof e != "object" && typeof e != "function")
    return e;
  const t = fe(e);
  if (t === null && Qr(e))
    return e;
  const n = /* @__PURE__ */ Object.create(null), r = /* @__PURE__ */ Object.create(null), o = [];
  let s = e;
  for (; s != null && o.indexOf(s) === -1; ) {
    o.push(s);
    const i = s === e ? t : fe(s);
    if (Fn(s, i, s === e))
      break;
    const a = Object.getOwnPropertyNames(s);
    Object.getOwnPropertySymbols && a.push(...Object.getOwnPropertySymbols(s));
    for (const c of a)
      Dn(c) || Me(r, c) || (n[c] = e[c], r[c] = !0);
    s = i;
  }
  return n;
}, Nt = /* @__PURE__ */ ((e) => (t) => {
  const n = Xr.call(t);
  return e[n] || (e[n] = n.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), K = (e) => (e = e.toLowerCase(), (t) => Nt(t) === e), st = (e) => (t) => typeof t === e, { isArray: we } = Array, Ee = st("undefined");
function Ae(e) {
  return e !== null && !Ee(e) && e.constructor !== null && !Ee(e.constructor) && W(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}
const Un = K("ArrayBuffer");
function no(e) {
  let t;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? t = ArrayBuffer.isView(e) : t = e && e.buffer && Un(e.buffer), t;
}
const ro = st("string"), W = st("function"), vn = st("number"), _e = (e) => e !== null && typeof e == "object", oo = (e) => e === !0 || e === !1, Ye = (e) => {
  if (!_e(e))
    return !1;
  const t = fe(e);
  return (t === null || t === Object.prototype || fe(t) === null) && // Treat safe own/inherited Symbol.toStringTag or Symbol.iterator members as
  // evidence the value is tagged/iterable, while ignoring members reachable
  // only through shared or terminal prototype boundaries.
  !je(e, In) && !je(e, ze);
}, so = (e) => {
  if (!_e(e) || Ae(e))
    return !1;
  try {
    return Object.keys(e).length === 0 && Object.getPrototypeOf(e) === Object.prototype;
  } catch {
    return !1;
  }
}, io = K("Date"), ao = K("File"), lo = (e) => !!(e && typeof e.uri < "u"), co = (e) => e && typeof e.getParts < "u", uo = K("Blob"), fo = K("FileList"), ho = K("Set"), po = (e) => _e(e) && W(e.pipe);
function mo() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
}
const Vt = mo(), qt = typeof Vt.FormData < "u" ? Vt.FormData : void 0, go = (e) => {
  if (!e) return !1;
  if (qt && e instanceof qt) return !0;
  const t = fe(e);
  if (!t || t === Object.prototype || !W(e.append)) return !1;
  const n = Nt(e);
  return n === "formdata" || // detect form-data instance
  n === "object" && W(e.toString) && e.toString() === "[object FormData]";
}, yo = K("URLSearchParams"), [bo, wo, Eo, So] = [
  "ReadableStream",
  "Request",
  "Response",
  "Headers"
].map(K), Ro = (e) => e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function We(e, t, { allOwnKeys: n = !1 } = {}) {
  if (e === null || typeof e > "u")
    return;
  let r, o;
  if (typeof e != "object" && (e = [e]), we(e))
    for (r = 0, o = e.length; r < o; r++)
      t.call(null, e[r], r, e);
  else {
    if (Ae(e))
      return;
    const s = n ? Object.getOwnPropertyNames(e) : Object.keys(e), i = s.length;
    let a;
    for (r = 0; r < i; r++)
      a = s[r], t.call(null, e[a], a, e);
  }
}
function Bn(e, t) {
  if (Ae(e))
    return null;
  t = t.toLowerCase();
  const n = Object.keys(e);
  let r = n.length, o;
  for (; r-- > 0; )
    if (o = n[r], t === o.toLowerCase())
      return o;
  return null;
}
const ge = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, Hn = (e) => !Ee(e) && e !== ge;
function Tt(...e) {
  const { caseless: t, skipUndefined: n } = Hn(this) && this || {}, r = {}, o = (s, i) => {
    if (i === "__proto__" || i === "constructor" || i === "prototype")
      return;
    const a = t && typeof i == "string" && Bn(r, i) || i, c = Me(r, a) ? r[a] : void 0;
    Ye(c) && Ye(s) ? r[a] = Tt(c, s) : Ye(s) ? r[a] = Tt({}, s) : we(s) ? r[a] = s.slice() : (!n || !Ee(s)) && (r[a] = s);
  };
  for (let s = 0, i = e.length; s < i; s++) {
    const a = e[s];
    if (!a || Ae(a) || (We(a, o), typeof a != "object" || we(a)))
      continue;
    const c = Object.getOwnPropertySymbols(a);
    for (let f = 0; f < c.length; f++) {
      const u = c[f];
      Do.call(a, u) && o(a[u], u);
    }
  }
  return r;
}
const xo = (e, t, n, { allOwnKeys: r } = {}) => (We(
  t,
  (o, s) => {
    n && W(o) ? Object.defineProperty(e, s, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot
      // hijack defineProperty's accessor-vs-data resolution.
      __proto__: null,
      value: Ln(o, n),
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
  { allOwnKeys: r }
), e), Oo = (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e), To = (e, t, n, r) => {
  e.prototype = Object.create(t.prototype, r), Object.defineProperty(e.prototype, "constructor", {
    __proto__: null,
    value: e,
    writable: !0,
    enumerable: !1,
    configurable: !0
  }), Object.defineProperty(e, "super", {
    __proto__: null,
    value: t.prototype
  }), n && Object.assign(e.prototype, n);
}, Ao = (e, t, n, r) => {
  let o, s, i;
  const a = {};
  if (t = t || {}, e == null) return t;
  do {
    for (o = Object.getOwnPropertyNames(e), s = o.length; s-- > 0; )
      i = o[s], (!r || r(i, e, t)) && !a[i] && (t[i] = e[i], a[i] = !0);
    e = n !== !1 && fe(e);
  } while (e && (!n || n(e, t)) && e !== Object.prototype);
  return t;
}, _o = (e, t, n) => {
  e = String(e), (n === void 0 || n > e.length) && (n = e.length), n -= t.length;
  const r = e.indexOf(t, n);
  return r !== -1 && r === n;
}, Co = (e) => {
  if (!e) return null;
  if (we(e)) return e;
  let t = e.length;
  if (!vn(t)) return null;
  const n = new Array(t);
  for (; t-- > 0; )
    n[t] = e[t];
  return n;
}, ko = /* @__PURE__ */ ((e) => (t) => e && t instanceof e)(typeof Uint8Array < "u" && fe(Uint8Array)), Po = (e, t) => {
  const r = (e && e[ze]).call(e);
  let o;
  for (; (o = r.next()) && !o.done; ) {
    const s = o.value;
    t.call(e, s[0], s[1]);
  }
}, No = (e, t) => {
  let n;
  const r = [];
  for (; (n = e.exec(t)) !== null; )
    r.push(n);
  return r;
}, Lo = K("HTMLFormElement"), Io = (e) => e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function(n, r, o) {
  return r.toUpperCase() + o;
}), { propertyIsEnumerable: Do } = Object.prototype, Fo = K("RegExp"), Mn = (e, t) => {
  const n = Object.getOwnPropertyDescriptors(e), r = {};
  We(n, (o, s) => {
    let i;
    (i = t(o, s, e)) !== !1 && (r[s] = i || o);
  }), Object.defineProperties(e, r);
}, Uo = (e) => {
  Mn(e, (t, n) => {
    if (W(e) && ["arguments", "caller", "callee"].includes(n))
      return !1;
    const r = e[n];
    if (W(r)) {
      if (t.enumerable = !1, "writable" in t) {
        t.writable = !1;
        return;
      }
      t.set || (t.set = () => {
        throw Error("Can not rewrite read-only method '" + n + "'");
      });
    }
  });
}, vo = (e, t) => {
  const n = {}, r = (o) => {
    o.forEach((s) => {
      n[s] = !0;
    });
  };
  return we(e) ? r(e) : r(String(e).split(t)), n;
}, Bo = () => {
}, Ho = (e, t) => e != null && Number.isFinite(e = +e) ? e : t;
function Mo(e) {
  return !!(e && W(e.append) && e[In] === "FormData" && e[ze]);
}
const jo = (e) => {
  const t = /* @__PURE__ */ new WeakSet(), n = (r) => {
    if (_e(r)) {
      if (t.has(r))
        return;
      if (Ae(r))
        return r;
      if (!("toJSON" in r)) {
        t.add(r);
        let o;
        if (ho(r)) {
          o = [];
          for (const s of r) {
            const i = n(s);
            !Ee(i) && o.push(i);
          }
        } else
          o = we(r) ? [] : {}, We(r, (s, i) => {
            const a = n(s);
            !Ee(a) && (o[i] = a);
          });
        return t.delete(r), o;
      }
    }
    return r;
  };
  return n(e);
}, $o = K("AsyncFunction"), zo = (e) => e && (_e(e) || W(e)) && W(e.then) && W(e.catch), jn = ((e, t) => e ? setImmediate : t ? ((n, r) => (ge.addEventListener(
  "message",
  ({ source: o, data: s }) => {
    o === ge && s === n && r.length && r.shift()();
  },
  !1
), (o) => {
  r.push(o), ge.postMessage(n, "*");
}))(`axios@${Math.random()}`, []) : (n) => setTimeout(n))(typeof setImmediate == "function", W(ge.postMessage)), Wo = typeof queueMicrotask < "u" ? queueMicrotask.bind(ge) : typeof process < "u" && process.nextTick || jn, $n = (e) => e != null && W(e[ze]), Vo = (e) => e != null && je(e, ze) && $n(e), l = {
  isArray: we,
  isArrayBuffer: Un,
  isBuffer: Ae,
  isFormData: go,
  isArrayBufferView: no,
  isString: ro,
  isNumber: vn,
  isBoolean: oo,
  isObject: _e,
  isPlainObject: Ye,
  isEmptyObject: so,
  isReadableStream: bo,
  isRequest: wo,
  isResponse: Eo,
  isHeaders: So,
  isUndefined: Ee,
  isDate: io,
  isFile: ao,
  isReactNativeBlob: lo,
  isReactNative: co,
  isBlob: uo,
  isRegExp: Fo,
  isFunction: W,
  isStream: po,
  isURLSearchParams: yo,
  isTypedArray: ko,
  isFileList: fo,
  forEach: We,
  merge: Tt,
  extend: xo,
  trim: Ro,
  stripBOM: Oo,
  inherits: To,
  toFlatObject: Ao,
  kindOf: Nt,
  kindOfTest: K,
  endsWith: _o,
  toArray: Co,
  forEachEntry: Po,
  matchAll: No,
  isHTMLForm: Lo,
  hasOwnProperty: Me,
  hasOwnProp: Me,
  // an alias to avoid ESLint no-prototype-builtins detection
  hasOwnInPrototypeChain: je,
  getSafeProp: eo,
  toSafeFlatObject: to,
  reduceDescriptors: Mn,
  freezeMethods: Uo,
  toObjectSet: vo,
  toCamelCase: Io,
  noop: Bo,
  toFiniteNumber: Ho,
  findKey: Bn,
  global: ge,
  isContextDefined: Hn,
  isSpecCompliantForm: Mo,
  toJSONObject: jo,
  isAsyncFn: $o,
  isThenable: zo,
  setImmediate: jn,
  asap: Wo,
  isIterable: $n,
  isSafeIterable: Vo
}, qo = l.toObjectSet([
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
]), Ko = (e) => {
  const t = {};
  let n, r, o;
  return e && e.split(`
`).forEach(function(i) {
    o = i.indexOf(":"), n = i.substring(0, o).trim().toLowerCase(), r = i.substring(o + 1).trim();
    const a = l.hasOwnProp(t, n);
    !n || a && l.hasOwnProp(qo, n) || (n === "set-cookie" ? a ? t[n].push(r) : t[n] = [r] : t[n] = a ? t[n] + ", " + r : r);
  }), t;
};
function Go(e) {
  let t = 0, n = e.length;
  for (; t < n; ) {
    const r = e.charCodeAt(t);
    if (r !== 9 && r !== 32)
      break;
    t += 1;
  }
  for (; n > t; ) {
    const r = e.charCodeAt(n - 1);
    if (r !== 9 && r !== 32)
      break;
    n -= 1;
  }
  return t === 0 && n === e.length ? e : e.slice(t, n);
}
const Jo = new RegExp("[\\u0000-\\u0008\\u000a-\\u001f\\u007f]+", "g"), Yo = new RegExp("[^\\u0009\\u0020-\\u007e\\u0080-\\u00ff]+", "g");
function Lt(e, t) {
  return l.isArray(e) ? e.map((n) => Lt(n, t)) : Go(String(e).replace(t, ""));
}
const Zo = (e) => Lt(e, Jo), Xo = (e) => Lt(e, Yo);
function zn(e) {
  const t = /* @__PURE__ */ Object.create(null);
  return l.forEach(e.toJSON(), (n, r) => {
    t[r] = Xo(n);
  }), t;
}
const Kt = /* @__PURE__ */ Symbol("internals");
function Ie(e) {
  return e && String(e).trim().toLowerCase();
}
function Ze(e) {
  return e === !1 || e == null ? e : l.isArray(e) ? e.map(Ze) : Zo(String(e));
}
function Qo(e) {
  const t = /* @__PURE__ */ Object.create(null), n = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let r;
  for (; r = n.exec(e); )
    t[r[1]] = r[2];
  return t;
}
const es = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
function gt(e) {
  let t = 0, n = e.length;
  for (; t < n; ) {
    const r = e.charCodeAt(t);
    if (r !== 9 && r !== 32)
      break;
    t += 1;
  }
  for (; n > t; ) {
    const r = e.charCodeAt(n - 1);
    if (r !== 9 && r !== 32)
      break;
    n -= 1;
  }
  return t === 0 && n === e.length ? e : e.slice(t, n);
}
function ts(e) {
  const t = e.length - 1;
  if (t < 1 || e.charCodeAt(0) !== 34 || e.charCodeAt(t) !== 34)
    return e;
  let n = "";
  for (let r = 1; r < t; r++) {
    const o = e.charCodeAt(r);
    if (o === 34 || o === 92 && (r += 1, r >= t))
      return e;
    n += e[r];
  }
  return n;
}
function ns(e) {
  const t = /* @__PURE__ */ Object.create(null), n = String(e);
  let r = 0, o = !1, s = !1;
  function i(a) {
    const c = gt(n.slice(r, a)), f = c.indexOf("=");
    if (f < 1)
      return;
    const u = gt(c.slice(0, f));
    if (!es.test(u))
      return;
    const p = u.toLowerCase();
    if (p === "__proto__" || p === "constructor" || p === "prototype")
      return;
    const y = gt(c.slice(f + 1));
    t[p] = ts(y);
  }
  for (let a = 0; a < n.length; a++) {
    const c = n.charCodeAt(a);
    o ? s ? s = !1 : c === 92 ? s = !0 : c === 34 && (o = !1) : c === 34 ? o = !0 : (c === 44 || c === 59) && (i(a), r = a + 1);
  }
  return i(n.length), t;
}
const rs = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
function yt(e, t, n, r, o) {
  if (l.isFunction(r))
    return r.call(this, t, n);
  if (o && (t = n), !!l.isString(t)) {
    if (l.isString(r))
      return t.indexOf(r) !== -1;
    if (l.isRegExp(r))
      return r.test(t);
  }
}
function os(e) {
  return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (t, n, r) => n.toUpperCase() + r);
}
function ss(e, t) {
  const n = l.toCamelCase(" " + t);
  ["get", "set", "has"].forEach((r) => {
    Object.defineProperty(e, r + n, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot turn
      // this data descriptor into an accessor descriptor on the way in.
      __proto__: null,
      value: function(o, s, i) {
        return this[r].call(this, t, o, s, i);
      },
      configurable: !0
    });
  });
}
let $ = class {
  constructor(t) {
    t && this.set(t);
  }
  set(t, n, r) {
    const o = this;
    function s(a, c, f) {
      const u = Ie(c);
      if (!u)
        return;
      const p = l.findKey(o, u);
      (!p || o[p] === void 0 || f === !0 || f === void 0 && o[p] !== !1) && (o[p || c] = Ze(a));
    }
    const i = (a, c) => l.forEach(a, (f, u) => s(f, u, c));
    if (l.isPlainObject(t) || t instanceof this.constructor)
      i(t, n);
    else if (l.isString(t) && (t = t.trim()) && !rs(t))
      i(Ko(t), n);
    else if (l.isObject(t) && l.isSafeIterable(t)) {
      let a = /* @__PURE__ */ Object.create(null), c, f;
      for (const u of t) {
        if (!l.isArray(u))
          throw new TypeError("Object iterator must return a key-value pair");
        f = u[0], l.hasOwnProp(a, f) ? (c = a[f], a[f] = l.isArray(c) ? [...c, u[1]] : [c, u[1]]) : a[f] = u[1];
      }
      i(a, n);
    } else
      t != null && s(n, t, r);
    return this;
  }
  get(t, n) {
    if (t = Ie(t), t) {
      const r = l.findKey(this, t);
      if (r) {
        const o = this[r];
        if (!n)
          return o;
        if (n === !0)
          return Qo(o);
        if (l.isFunction(n))
          return n.call(this, o, r);
        if (l.isRegExp(n))
          return n.exec(o);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(t, n) {
    if (t = Ie(t), t) {
      const r = l.findKey(this, t);
      return !!(r && this[r] !== void 0 && (!n || yt(this, this[r], r, n)));
    }
    return !1;
  }
  delete(t, n) {
    const r = this;
    let o = !1;
    function s(i) {
      if (i = Ie(i), i) {
        const a = l.findKey(r, i);
        a && (!n || yt(r, r[a], a, n)) && (delete r[a], o = !0);
      }
    }
    return l.isArray(t) ? t.forEach(s) : s(t), o;
  }
  clear(t) {
    const n = Object.keys(this);
    let r = n.length, o = !1;
    for (; r--; ) {
      const s = n[r];
      (!t || yt(this, this[s], s, t, !0)) && (delete this[s], o = !0);
    }
    return o;
  }
  normalize(t) {
    const n = this, r = {};
    return l.forEach(this, (o, s) => {
      const i = l.findKey(r, s);
      if (i) {
        n[i] = Ze(o), delete n[s];
        return;
      }
      const a = t ? os(s) : String(s).trim();
      a !== s && delete n[s], n[a] = Ze(o), r[a] = !0;
    }), this;
  }
  concat(...t) {
    return this.constructor.concat(this, ...t);
  }
  toJSON(t) {
    const n = /* @__PURE__ */ Object.create(null);
    return l.forEach(this, (r, o) => {
      r != null && r !== !1 && (n[o] = t && l.isArray(r) ? r.join(", ") : r);
    }), n;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([t, n]) => t + ": " + n).join(`
`);
  }
  getSetCookie() {
    const t = this.get("set-cookie");
    return l.isArray(t) ? t : t == null || t === !1 ? [] : [t];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(t) {
    return t instanceof this ? t : new this(t);
  }
  static parseParameters(t) {
    return ns(t);
  }
  static concat(t, ...n) {
    const r = new this(t);
    return n.forEach((o) => r.set(o)), r;
  }
  static accessor(t) {
    const r = (this[Kt] = this[Kt] = {
      accessors: {}
    }).accessors, o = this.prototype;
    function s(i) {
      const a = Ie(i);
      r[a] || (ss(o, i), r[a] = !0);
    }
    return l.isArray(t) ? t.forEach(s) : s(t), this;
  }
};
$.accessor([
  "Content-Type",
  "Content-Length",
  "Accept",
  "Accept-Encoding",
  "User-Agent",
  "Authorization"
]);
l.reduceDescriptors($.prototype, ({ value: e }, t) => {
  let n = t[0].toUpperCase() + t.slice(1);
  return {
    get: () => e,
    set(r) {
      this[n] = r;
    }
  };
});
l.freezeMethods($);
const nt = "[REDACTED ****]";
function is(e) {
  if (l.hasOwnProp(e, "toJSON"))
    return !0;
  let t = Object.getPrototypeOf(e);
  for (; t && t !== Object.prototype; ) {
    if (l.hasOwnProp(t, "toJSON"))
      return !0;
    t = Object.getPrototypeOf(t);
  }
  return !1;
}
function as(e, t) {
  const n = new Set(t.map((s) => String(s).toLowerCase())), r = [], o = (s) => {
    if (s === null || typeof s != "object" || l.isBuffer(s)) return s;
    if (r.indexOf(s) !== -1) return;
    s instanceof $ && (s = s.toJSON()), r.push(s);
    let i;
    if (l.isArray(s))
      i = [], s.forEach((a, c) => {
        const f = o(a);
        l.isUndefined(f) || (i[c] = f);
      });
    else {
      if (!l.isPlainObject(s) && is(s))
        return r.pop(), s;
      i = /* @__PURE__ */ Object.create(null);
      for (const [a, c] of Object.entries(s)) {
        const f = n.has(a.toLowerCase()) ? nt : o(c);
        l.isUndefined(f) || (i[a] = f);
      }
    }
    return r.pop(), i;
  };
  return o(e);
}
function Gt(e) {
  try {
    return String(e);
  } catch {
    return "";
  }
}
function ls(e) {
  return e.errors.map((n) => {
    try {
      return n && n.message ? Gt(n.message) : Gt(n);
    } catch {
      return "";
    }
  }).filter(Boolean).join("; ") || e.name || "AggregateError";
}
let m = class Wn extends Error {
  static from(t, n, r, o, s, i) {
    let a = t.message;
    !a && l.isArray(t.errors) && t.errors.length && (a = ls(t));
    const c = new Wn(a, n || t.code, r, o, s);
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
  constructor(t, n, r, o, s) {
    super(t), Object.defineProperty(this, "message", {
      // Null-proto descriptor so a polluted Object.prototype.get cannot turn
      // this data descriptor into an accessor descriptor on the way in.
      __proto__: null,
      value: t,
      enumerable: !0,
      writable: !0,
      configurable: !0
    }), this.name = "AxiosError", this.isAxiosError = !0, n && (this.code = n), r && (this.config = r), o && (this.request = o), s && (this.response = s, this.status = s.status);
  }
  toJSON() {
    const t = this.config, n = t && l.hasOwnProp(t, "redact") ? t.redact : void 0, r = l.isArray(n) && n.length > 0 ? as(t, n) : l.toJSONObject(t);
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
      config: r,
      code: this.code,
      status: this.status
    };
  }
};
m.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE";
m.ERR_BAD_OPTION = "ERR_BAD_OPTION";
m.ECONNABORTED = "ECONNABORTED";
m.ETIMEDOUT = "ETIMEDOUT";
m.ECONNREFUSED = "ECONNREFUSED";
m.ERR_NETWORK = "ERR_NETWORK";
m.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS";
m.ERR_DEPRECATED = "ERR_DEPRECATED";
m.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE";
m.ERR_BAD_REQUEST = "ERR_BAD_REQUEST";
m.ERR_CANCELED = "ERR_CANCELED";
m.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT";
m.ERR_INVALID_URL = "ERR_INVALID_URL";
m.ERR_FORM_DATA_DEPTH_EXCEEDED = "ERR_FORM_DATA_DEPTH_EXCEEDED";
const cs = null, Vn = 100;
function At(e) {
  return l.isPlainObject(e) || l.isArray(e);
}
function qn(e) {
  return l.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function bt(e, t, n) {
  return e ? e.concat(t).map(function(o, s) {
    return o = qn(o), !n && s ? "[" + o + "]" : o;
  }).join(n ? "." : "") : t;
}
function us(e) {
  return l.isArray(e) && !e.some(At);
}
const ds = l.toFlatObject(l, {}, null, function(t) {
  return /^is[A-Z]/.test(t);
});
function it(e, t, n) {
  if (!l.isObject(e))
    throw new TypeError("target must be an object");
  t = t || new FormData();
  const r = (b, E) => {
    const O = l.getSafeProp(n, b);
    return l.isUndefined(O) ? E : O;
  }, o = r("metaTokens", !0), s = r("visitor") || C, i = r("dots", !1), a = r("indexes", !1), c = r("Blob") || typeof Blob < "u" && Blob, f = r("maxDepth", Vn), u = c && l.isSpecCompliantForm(t), p = [];
  if (!l.isFunction(s))
    throw new TypeError("visitor must be a function");
  function y(b) {
    if (b === null) return "";
    if (l.isDate(b))
      return b.toISOString();
    if (l.isBoolean(b))
      return b.toString();
    if (!u && l.isBlob(b))
      throw new m("Blob is not supported. Use a Buffer instead.");
    if (l.isArrayBuffer(b) || l.isTypedArray(b)) {
      if (u && typeof c == "function")
        return new c([b]);
      throw new m(
        "Blob is not supported. Use a Buffer instead.",
        m.ERR_NOT_SUPPORT
      );
    }
    return b;
  }
  function x(b) {
    if (b > f)
      throw new m(
        "Object is too deeply nested (" + b + " levels). Max depth: " + f,
        m.ERR_FORM_DATA_DEPTH_EXCEEDED
      );
  }
  function S(b, E) {
    if (f === 1 / 0)
      return JSON.stringify(b);
    const O = [];
    return JSON.stringify(b, function(P, N) {
      if (!l.isObject(N))
        return N;
      for (; O.length && O[O.length - 1] !== this; )
        O.pop();
      return O.push(N), x(E + O.length - 1), N;
    });
  }
  function C(b, E, O) {
    let F = b;
    if (l.isReactNative(t) && l.isReactNativeBlob(b))
      return t.append(bt(O, E, i), y(b)), !1;
    if (b && !O && typeof b == "object") {
      if (l.endsWith(E, "{}"))
        E = o ? E : E.slice(0, -2), b = S(b, 1);
      else if (l.isArray(b) && us(b) || (l.isFileList(b) || l.endsWith(E, "[]")) && (F = l.toArray(b)))
        return E = qn(E), F.forEach(function(N, V) {
          !(l.isUndefined(N) || N === null) && t.append(
            // eslint-disable-next-line no-nested-ternary
            a === !0 ? bt([E], V, i) : a === null ? E : E + "[]",
            y(N)
          );
        }), !1;
    }
    return At(b) ? !0 : (t.append(bt(O, E, i), y(b)), !1);
  }
  const _ = Object.assign(ds, {
    defaultVisitor: C,
    convertValue: y,
    isVisitable: At
  });
  function h(b, E, O = 0) {
    if (!l.isUndefined(b)) {
      if (x(O), p.indexOf(b) !== -1)
        throw new Error("Circular reference detected in " + E.join("."));
      p.push(b), l.forEach(b, function(P, N) {
        (!(l.isUndefined(P) || P === null) && s.call(t, P, l.isString(N) ? N.trim() : N, E, _)) === !0 && h(P, E ? E.concat(N) : [N], O + 1);
      }), p.pop();
    }
  }
  if (!l.isObject(e))
    throw new TypeError("data must be an object");
  return h(e), t;
}
function Jt(e) {
  const t = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+"
  };
  return encodeURIComponent(e).replace(/[!'()~]|%20/g, function(r) {
    return t[r];
  });
}
function It(e, t) {
  this._pairs = [], e && it(e, this, t);
}
const Kn = It.prototype;
Kn.append = function(t, n) {
  this._pairs.push([t, n]);
};
Kn.toString = function(t) {
  const n = t ? (r) => t.call(this, r, Jt) : Jt;
  return this._pairs.map(function(o) {
    return n(o[0]) + "=" + n(o[1]);
  }, "").join("&");
};
function fs(e) {
  return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function Gn(e, t, n) {
  if (!t)
    return e;
  e = e || "";
  const r = l.isFunction(n) ? {
    serialize: n
  } : n, o = l.getSafeProp(r, "encode") || fs, s = l.getSafeProp(r, "serialize");
  let i;
  if (s ? i = s(t, r) : i = l.isURLSearchParams(t) ? t.toString() : new It(t, r).toString(o), i) {
    const a = e.indexOf("#");
    a !== -1 && (e = e.slice(0, a)), e += (e.indexOf("?") === -1 ? "?" : "&") + i;
  }
  return e;
}
const De = /* @__PURE__ */ Symbol("internals");
function Jn(e) {
  return e ? e.length : 0;
}
function Yt(e) {
  if (e)
    for (; e.length && e[e.length - 1] === null; )
      e.pop();
}
function Fe(e, t) {
  const n = e.handlers, r = Jn(n);
  n !== t.handlersRef ? (t.handlersRef = n, t.handlerEntries.clear()) : r !== t.handlersLength && (r ? t.handlerEntries.forEach(function(s, i) {
    n[s.index] !== s.handler && t.handlerEntries.delete(i);
  }) : t.handlerEntries.clear()), t.handlersLength = r;
}
class Zt {
  constructor() {
    this.handlers = [], this[De] = {
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
  use(t, n, r) {
    const o = {
      fulfilled: t,
      rejected: n,
      synchronous: r ? r.synchronous : !1,
      runWhen: r ? r.runWhen : null
    }, s = this[De];
    this.handlers == null && (this.handlers = []), Fe(this, s);
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
    const n = this[De];
    Fe(this, n);
    const r = n.handlerEntries.get(t);
    if (r) {
      if (n.handlerEntries.delete(t), this.handlers[r.index] !== r.handler)
        return;
      this.handlers[r.index] = null, n.iterationDepth || (Yt(this.handlers), n.handlersLength = this.handlers.length);
    }
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    this.handlers && (this.handlers = [], Fe(this, this[De]));
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
    const n = this[De];
    Fe(this, n), n.iterationDepth++;
    try {
      l.forEach(this.handlers, function(o) {
        o !== null && t(o);
      });
    } finally {
      --n.iterationDepth || (Fe(this, n), Yt(this.handlers), n.handlersLength = Jn(this.handlers));
    }
  }
}
const Dt = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1,
  legacyInterceptorReqResOrdering: !0,
  advertiseZstdAcceptEncoding: !1,
  validateStatusUndefinedResolves: !0
}, hs = typeof URLSearchParams < "u" ? URLSearchParams : It, ps = typeof FormData < "u" ? FormData : null, ms = typeof Blob < "u" ? Blob : null, gs = {
  isBrowser: !0,
  classes: {
    URLSearchParams: hs,
    FormData: ps,
    Blob: ms
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
}, Ft = typeof window < "u" && typeof document < "u", _t = typeof navigator == "object" && navigator || void 0, ys = Ft && (!_t || ["ReactNative", "NativeScript", "NS"].indexOf(_t.product) < 0), bs = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", ws = Ft && window.location.href || "http://localhost", Es = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: Ft,
  hasStandardBrowserEnv: ys,
  hasStandardBrowserWebWorkerEnv: bs,
  navigator: _t,
  origin: ws
}, Symbol.toStringTag, { value: "Module" })), B = {
  ...Es,
  ...gs
};
function Ss(e, t) {
  return it(e, new B.classes.URLSearchParams(), {
    visitor: function(n, r, o, s) {
      return B.isNode && l.isBuffer(n) ? (this.append(r, n.toString("base64")), !1) : s.defaultVisitor.apply(this, arguments);
    },
    ...t
  });
}
const Xt = Vn;
function Yn(e) {
  if (e > Xt)
    throw new m(
      "FormData field is too deeply nested (" + e + " levels). Max depth: " + Xt,
      m.ERR_FORM_DATA_DEPTH_EXCEEDED
    );
}
function Rs(e) {
  const t = [], n = /[^.[\]]+|\[([^.[\]]*)]/g;
  let r;
  for (; (r = n.exec(e)) !== null; )
    Yn(t.length), t.push(r[0] === "[]" ? "" : r[1] || r[0]);
  return t;
}
function xs(e) {
  const t = {}, n = Object.keys(e);
  let r;
  const o = n.length;
  let s;
  for (r = 0; r < o; r++)
    s = n[r], t[s] = e[s];
  return t;
}
function Zn(e) {
  function t(n, r, o, s) {
    Yn(s);
    let i = n[s++];
    if (i === "__proto__") return !0;
    const a = Number.isFinite(+i), c = s >= n.length;
    return i = !i && l.isArray(o) ? o.length : i, c ? (l.hasOwnProp(o, i) ? o[i] = l.isArray(o[i]) ? o[i].concat(r) : [o[i], r] : o[i] = r, !a) : ((!l.hasOwnProp(o, i) || !l.isObject(o[i])) && (o[i] = []), t(n, r, o[i], s) && l.isArray(o[i]) && (o[i] = xs(o[i])), !a);
  }
  if (l.isFormData(e) && l.isFunction(e.entries)) {
    const n = {};
    return l.forEachEntry(e, (r, o) => {
      t(Rs(r), o, n, 0);
    }), n;
  }
  return null;
}
const Xn = Object.freeze([
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
]), xe = (e, t) => e != null && l.hasOwnProp(e, t) ? e[t] : void 0;
function Os(e, t, n) {
  if (l.isString(e))
    try {
      return (t || JSON.parse)(e), l.trim(e);
    } catch (r) {
      if (r.name !== "SyntaxError")
        throw r;
    }
  return (n || JSON.stringify)(e);
}
const Ve = {
  transitional: Dt,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [
    function(t, n) {
      const r = n.getContentType() || "", o = r.indexOf("application/json") > -1, s = l.isObject(t);
      if (s && l.isHTMLForm(t) && (t = new FormData(t)), l.isFormData(t))
        return o ? JSON.stringify(Zn(t)) : t;
      if (l.isArrayBuffer(t) || l.isBuffer(t) || l.isStream(t) || l.isFile(t) || l.isBlob(t) || l.isReadableStream(t))
        return t;
      if (l.isArrayBufferView(t))
        return t.buffer;
      if (l.isURLSearchParams(t))
        return n.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), t.toString();
      let a;
      if (s) {
        const c = xe(this, "formSerializer");
        if (r.indexOf("application/x-www-form-urlencoded") > -1)
          return Ss(t, c).toString();
        if ((a = l.isFileList(t)) || r.indexOf("multipart/form-data") > -1) {
          const f = xe(this, "env"), u = f && f.FormData;
          return it(
            a ? { "files[]": t } : t,
            u && new u(),
            c
          );
        }
      }
      return s || o ? (n.setContentType("application/json", !1), Os(t)) : t;
    }
  ],
  transformResponse: [
    function(t) {
      const n = xe(this, "transitional") || Ve.transitional, r = n && n.forcedJSONParsing, o = xe(this, "responseType"), s = o === "json";
      if (l.isResponse(t) || l.isReadableStream(t))
        return t;
      if (t && l.isString(t) && (r && !o || s)) {
        const a = !(n && n.silentJSONParsing) && s;
        try {
          return JSON.parse(t, xe(this, "parseReviver"));
        } catch (c) {
          if (a)
            throw c.name === "SyntaxError" ? m.from(c, m.ERR_BAD_RESPONSE, this, null, xe(this, "response")) : c;
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
    FormData: B.classes.FormData,
    Blob: B.classes.Blob
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
l.forEach(Xn, (e) => {
  Ve.headers[e] = {};
});
function wt(e, t) {
  const n = this || Ve, r = t || n, o = $.from(r.headers);
  let s = r.data;
  return l.forEach(e, function(a) {
    s = a.call(n, s, o.normalize(), t ? t.status : void 0);
  }), o.normalize(), s;
}
function Qn(e) {
  return !!(e && e.__CANCEL__);
}
let qe = class extends m {
  /**
   * A `CanceledError` is an object that is thrown when an operation is canceled.
   *
   * @param {string=} message The message.
   * @param {Object=} config The config.
   * @param {Object=} request The request.
   *
   * @returns {CanceledError} The created error.
   */
  constructor(t, n, r) {
    super(t ?? "canceled", m.ERR_CANCELED, n, r), this.name = "CanceledError", this.__CANCEL__ = !0;
  }
};
function er(e, t, n) {
  const r = n.config.validateStatus;
  !n.status || !r || r(n.status) ? e(n) : t(new m(
    "Request failed with status code " + n.status,
    n.status >= 400 && n.status < 500 ? m.ERR_BAD_REQUEST : m.ERR_BAD_RESPONSE,
    n.config,
    n.request,
    n
  ));
}
const Ts = /[\t\n\r]/g;
function tr(e) {
  if (typeof e != "string")
    return e;
  let t = 0;
  for (; t < e.length && e.charCodeAt(t) <= 32; )
    t++;
  return e.slice(t).replace(Ts, "");
}
function Et(e) {
  const t = /^([-+\w]{1,25}):(?:\/\/)?/.exec(e);
  return t && t[1] || "";
}
function As(e, t) {
  e = e || 10;
  const n = new Array(e), r = new Array(e);
  let o = 0, s = 0, i;
  return t = t !== void 0 ? t : 1e3, function(c) {
    const f = Date.now(), u = r[s];
    i || (i = f), n[o] = c, r[o] = f;
    let p = s, y = 0;
    for (; p !== o; )
      y += n[p++], p = p % e;
    if (o = (o + 1) % e, o === s && (s = (s + 1) % e), f - i < t)
      return;
    const x = u && f - u;
    return x ? Math.round(y * 1e3 / x) : void 0;
  };
}
function _s(e, t) {
  let n = 0, r = 1e3 / t, o, s;
  const i = (u, p = Date.now()) => {
    n = p, o = null, s && (clearTimeout(s), s = null), e(...u);
  };
  return [(...u) => {
    const p = Date.now(), y = p - n;
    y >= r ? i(u, p) : (o = u, s || (s = setTimeout(() => {
      s = null, i(o);
    }, r - y)));
  }, () => o && i(o), (...u) => i(u)];
}
const rt = (e, t, n = 3) => {
  let r = 0;
  const o = As(50, 250);
  return _s((s) => {
    if (!s || !l.isNumber(s.loaded))
      return;
    const i = s.loaded, a = s.lengthComputable ? s.total : void 0, c = Math.max(0, a != null ? Math.min(i, a) : i), f = Math.max(0, c - r), u = o(f);
    r = Math.max(r, c);
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
  }, n);
}, Qt = (e, t) => {
  const n = e != null;
  return [
    (r) => t[0]({
      lengthComputable: n,
      total: e,
      loaded: r
    }),
    t[1]
  ];
}, en = (e, t = l.asap) => (...n) => t(() => e(...n)), Cs = B.hasStandardBrowserEnv ? /* @__PURE__ */ ((e, t) => (n) => (n = new URL(n, B.origin), e.protocol === n.protocol && e.host === n.host && (t || e.port === n.port)))(
  new URL(B.origin),
  B.navigator && /(msie|trident)/i.test(B.navigator.userAgent)
) : () => !0, ks = B.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(e, t, n, r, o, s, i) {
      if (typeof document > "u") return;
      const a = [`${e}=${encodeURIComponent(t)}`];
      l.isNumber(n) && a.push(`expires=${new Date(n).toUTCString()}`), l.isString(r) && a.push(`path=${r}`), l.isString(o) && a.push(`domain=${o}`), s === !0 && a.push("secure"), l.isString(i) && a.push(`SameSite=${i}`), document.cookie = a.join("; ");
    },
    read(e) {
      if (typeof document > "u") return null;
      const t = document.cookie.split(";");
      for (let n = 0; n < t.length; n++) {
        const r = t[n].replace(/^\s+/, ""), o = r.indexOf("=");
        if (o !== -1 && r.slice(0, o) === e)
          try {
            return decodeURIComponent(r.slice(o + 1));
          } catch {
            return r.slice(o + 1);
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
function Ps(e) {
  return typeof e != "string" ? !1 : /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
function Ns(e, t) {
  if (!t)
    return e;
  let n = e.length;
  for (; n > 0 && e.charCodeAt(n - 1) === 47; )
    n--;
  return e.slice(0, n) + "/" + t.replace(/^\/+/, "");
}
const Ls = /^https?:(?!\/\/)/i;
function Is(e) {
  return e && e.replace(/(^|&)([^=&]*=)?[^&]+/g, (t, n, r = "") => `${n}${r}${nt}`);
}
function Ds(e) {
  const t = e.replace(/^(https?:\/{0,2})[^/?#]*@/i, `$1${nt}@`), n = t.indexOf("#"), o = (n === -1 ? t : t.slice(0, n)).replace(
    /([?&][^=&#]*=)[^&#]*/g,
    `$1${nt}`
  );
  return n === -1 ? o : `${o}#${Is(t.slice(n + 1))}`;
}
function tn(e, t) {
  if (typeof e == "string") {
    const n = tr(e);
    if (Ls.test(n))
      throw new m(
        `Invalid URL ${JSON.stringify(Ds(n))}: missing "//" after protocol`,
        m.ERR_INVALID_URL,
        t
      );
  }
}
function nr(e, t, n, r) {
  tn(t, r);
  let o = !Ps(t);
  return e && (o || n === !1) ? (tn(e, r), Ns(e, t)) : t;
}
const nn = (e) => e instanceof $ ? { ...e } : e, Fs = (e) => Object.getOwnPropertySymbols && Object.getOwnPropertyDescriptor ? Object.keys(e).concat(
  Object.getOwnPropertySymbols(e).filter(
    (t) => Object.getOwnPropertyDescriptor(e, t).enumerable
  )
) : Object.keys(e);
function Se(e, t) {
  e = e || {}, t = t || {};
  const n = /* @__PURE__ */ Object.create(null);
  Object.defineProperty(n, "hasOwnProperty", {
    // Null-proto descriptor so a polluted Object.prototype.get cannot turn
    // this data descriptor into an accessor descriptor on the way in.
    __proto__: null,
    value: Object.prototype.hasOwnProperty,
    enumerable: !1,
    writable: !0,
    configurable: !0
  });
  function r(u, p, y, x) {
    return l.isPlainObject(u) && l.isPlainObject(p) ? l.merge.call({ caseless: x }, u, p) : l.isPlainObject(p) ? l.merge({}, p) : l.isArray(p) ? p.slice() : p;
  }
  function o(u, p, y, x) {
    if (l.isUndefined(p)) {
      if (!l.isUndefined(u))
        return r(void 0, u, y, x);
    } else return r(u, p, y, x);
  }
  function s(u, p) {
    if (!l.isUndefined(p))
      return r(void 0, p);
  }
  function i(u, p) {
    if (l.isUndefined(p)) {
      if (!l.isUndefined(u))
        return r(void 0, u);
    } else return r(void 0, p);
  }
  function a(u) {
    const p = l.hasOwnProp(t, "transitional") ? t.transitional : void 0;
    if (!l.isUndefined(p))
      if (l.isPlainObject(p)) {
        if (l.hasOwnProp(p, u))
          return p[u];
      } else
        return;
    const y = l.hasOwnProp(e, "transitional") ? e.transitional : void 0;
    if (l.isPlainObject(y) && l.hasOwnProp(y, u))
      return y[u];
  }
  function c(u, p, y) {
    if (l.hasOwnProp(t, y))
      return r(u, p);
    if (l.hasOwnProp(e, y))
      return r(void 0, u);
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
    headers: (u, p, y) => o(nn(u), nn(p), y, !0)
  };
  return l.forEach(Fs({ ...e, ...t }), function(p) {
    if (p === "__proto__" || p === "constructor" || p === "prototype") return;
    const y = l.hasOwnProp(f, p) ? f[p] : o, x = l.hasOwnProp(e, p) ? e[p] : void 0, S = l.hasOwnProp(t, p) ? t[p] : void 0, C = y(x, S, p);
    l.isUndefined(C) && y !== c || (n[p] = C);
  }), l.hasOwnProp(t, "validateStatus") && l.isUndefined(t.validateStatus) && a("validateStatusUndefinedResolves") === !1 && (l.hasOwnProp(e, "validateStatus") ? n.validateStatus = r(void 0, e.validateStatus) : delete n.validateStatus), n;
}
const Us = ["content-type", "content-length"];
function vs(e, t, n) {
  if (n !== "content-only") {
    e.set(t);
    return;
  }
  Object.entries(t || {}).forEach(([r, o]) => {
    Us.includes(r.toLowerCase()) && e.set(r, o);
  });
}
const Bs = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, n) => String.fromCharCode(parseInt(n, 16))
);
function rr(e) {
  const t = Se({}, e), n = (y) => l.hasOwnProp(t, y) ? t[y] : void 0, r = n("data");
  let o = n("withXSRFToken");
  const s = n("xsrfHeaderName"), i = n("xsrfCookieName");
  let a = n("headers");
  const c = n("auth"), f = n("baseURL"), u = n("allowAbsoluteUrls"), p = n("url");
  if (t.headers = a = $.from(a), t.url = Gn(
    nr(f, p, u, t),
    n("params"),
    n("paramsSerializer")
  ), c) {
    const y = l.getSafeProp(c, "username") || "", x = l.getSafeProp(c, "password") || "";
    try {
      a.set(
        "Authorization",
        "Basic " + btoa(y + ":" + (x ? Bs(x) : ""))
      );
    } catch (S) {
      throw m.from(S, m.ERR_BAD_OPTION_VALUE, e);
    }
  }
  if (l.isFormData(r)) {
    const y = l.getSafeProp(r, "getHeaders");
    B.hasStandardBrowserEnv || B.hasStandardBrowserWebWorkerEnv || l.isReactNative(r) ? a.setContentType(void 0) : l.isFunction(y) && vs(a, y.call(r), n("formDataHeaderPolicy"));
  }
  if (B.hasStandardBrowserEnv && (l.isFunction(o) && (o = o(t)), o === !0 || o == null && Cs(t.url))) {
    const x = s && i && ks.read(i);
    x && a.set(s, x);
  }
  return t;
}
const Hs = typeof XMLHttpRequest < "u", Ms = Hs && function(e) {
  return new Promise(function(n, r) {
    const o = rr(e);
    let s = o.data;
    const i = $.from(o.headers).normalize();
    let { responseType: a, onUploadProgress: c, onDownloadProgress: f } = o, u, p, y, x, S, C;
    function _() {
      x && x(), S && S(), o.cancelToken && o.cancelToken.unsubscribe(u), o.signal && o.signal.removeEventListener("abort", u);
    }
    let h = new XMLHttpRequest();
    h.open(o.method.toUpperCase(), o.url, !0), h.timeout = o.timeout;
    function b(O) {
      if (!h)
        return;
      if (h.status === 0 && (Et(tr(o.url)) || Et(B.origin)) !== "file" && !(h.responseURL && h.responseURL.startsWith("file:"))) {
        r(new m("Request aborted", m.ECONNABORTED, e, h)), _(), h = null;
        return;
      }
      try {
        O ? C && C(O) : S && S();
      } catch (V) {
        setTimeout(() => {
          throw V;
        });
      }
      if (!h)
        return;
      const F = $.from(
        "getAllResponseHeaders" in h && h.getAllResponseHeaders()
      ), N = {
        data: !a || a === "text" || a === "json" ? h.responseText : h.response,
        status: h.status,
        statusText: h.statusText,
        headers: F,
        config: e,
        request: h
      };
      er(
        function(Z) {
          n(Z), _();
        },
        function(Z) {
          r(Z), _();
        },
        N
      ), h = null;
    }
    "onloadend" in h ? h.onloadend = b : h.onreadystatechange = function() {
      !h || h.readyState !== 4 || h.status === 0 && !(h.responseURL && h.responseURL.startsWith("file:")) || setTimeout(b);
    }, h.onabort = function() {
      h && (r(new m("Request aborted", m.ECONNABORTED, e, h)), _(), h = null);
    }, h.onerror = function(F) {
      const P = F && F.message ? F.message : "Network Error", N = new m(P, m.ERR_NETWORK, e, h);
      N.event = F || null, r(N), _(), h = null;
    }, h.ontimeout = function() {
      let F = o.timeout ? "timeout of " + o.timeout + "ms exceeded" : "timeout exceeded";
      const P = o.transitional || Dt;
      o.timeoutErrorMessage && (F = o.timeoutErrorMessage), r(
        new m(
          F,
          P.clarifyTimeoutError ? m.ETIMEDOUT : m.ECONNABORTED,
          e,
          h
        )
      ), _(), h = null;
    }, s === void 0 && i.setContentType(null), "setRequestHeader" in h && l.forEach(zn(i), function(F, P) {
      h.setRequestHeader(P, F);
    }), l.isUndefined(o.withCredentials) || (h.withCredentials = !!o.withCredentials), a && a !== "json" && (h.responseType = o.responseType), f && ([y, S, C] = rt(
      f,
      !0
    ), h.addEventListener("progress", y)), c && h.upload && ([p, x] = rt(c), h.upload.addEventListener("progress", p), h.upload.addEventListener("loadend", x)), (o.cancelToken || o.signal) && (u = (O) => {
      h && (r(!O || O.type ? new qe(null, e, h) : O), h.abort(), _(), h = null);
    }, o.cancelToken && o.cancelToken.subscribe(u), o.signal && (o.signal.aborted ? u() : o.signal.addEventListener("abort", u)));
    const E = Et(o.url);
    if (E && !B.protocols.includes(E)) {
      r(
        new m(
          "Unsupported protocol " + E + ":",
          m.ERR_BAD_REQUEST,
          e
        )
      ), _();
      return;
    }
    h.send(s || null);
  });
}, js = (e, t) => {
  if (e = e ? e.filter(Boolean) : [], !t && !e.length)
    return;
  const n = new AbortController();
  let r = !1;
  const o = function(c) {
    if (!r) {
      r = !0, i();
      const f = c instanceof Error ? c : this.reason;
      n.abort(
        f instanceof m ? f : new qe(f instanceof Error ? f.message : f)
      );
    }
  };
  let s = t && setTimeout(() => {
    s = null, o(new m(`timeout of ${t}ms exceeded`, m.ETIMEDOUT));
  }, t);
  const i = () => {
    e && (s && clearTimeout(s), s = null, e.forEach((c) => {
      c.unsubscribe ? c.unsubscribe(o) : c.removeEventListener("abort", o);
    }), e = null);
  };
  e.forEach((c) => {
    if (!r) {
      if (c.aborted) {
        o.call(c);
        return;
      }
      c.addEventListener("abort", o, { once: !0 });
    }
  });
  const { signal: a } = n;
  return a.unsubscribe = () => l.asap(i), a;
}, $s = function* (e, t) {
  let n = e.byteLength;
  if (n < t) {
    yield e;
    return;
  }
  let r = 0, o;
  for (; r < n; )
    o = r + t, yield e.slice(r, o), r = o;
}, zs = async function* (e, t) {
  for await (const n of Ws(e))
    yield* $s(n, t);
}, Ws = async function* (e) {
  if (e[Symbol.asyncIterator]) {
    yield* e;
    return;
  }
  const t = e.getReader();
  try {
    for (; ; ) {
      const { done: n, value: r } = await t.read();
      if (n)
        break;
      yield r;
    }
  } finally {
    await t.cancel();
  }
}, rn = (e, t, n, r) => {
  const o = zs(e, t);
  let s = 0, i, a = (c) => {
    i || (i = !0, r && r(c));
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
          if (n) {
            let y = s += p;
            n(y);
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
}, on = (e) => e >= 48 && e <= 57 || e >= 65 && e <= 70 || e >= 97 && e <= 102, or = (e, t, n) => t + 2 < n && on(e.charCodeAt(t + 1)) && on(e.charCodeAt(t + 2)), sn = (e) => e <= 57 ? e - 48 : (e & 223) - 55, Vs = (e) => e >= 65 && e <= 90 || // A-Z
e >= 97 && e <= 122 || // a-z
e >= 48 && e <= 57 || // 0-9
e === 43 || // +
e === 47 || // /
e === 45 || // - (base64url)
e === 95, qs = (e) => e === 9 || e === 10 || e === 12 || e === 13 || e === 32, Ks = (e) => {
  const t = Math.floor(e / 4), n = e % 4;
  return t * 3 + (n === 2 ? 1 : n === 3 ? 2 : 0);
}, Gs = (e) => {
  const t = e.length;
  let n = 0;
  return t > 0 && e.charCodeAt(t - 1) === 61 && (n++, t > 1 && e.charCodeAt(t - 2) === 61 && n++), Math.floor((t - n) * 3 / 4);
}, Js = (e) => {
  const t = e.length;
  let n = 0, r = 0, o = !1;
  for (let s = 0; s < t; s++) {
    let i = e.charCodeAt(s);
    if (i === 37 && or(e, s, t) && (i = sn(e.charCodeAt(s + 1)) * 16 + sn(e.charCodeAt(s + 2)), s += 2), !qs(i)) {
      if (i === 61) {
        r++;
        continue;
      }
      if (!Vs(i) || r > 0) {
        o = !0;
        continue;
      }
      n++;
    }
  }
  return o || r > 2 || r > 0 && (n + r) % 4 !== 0 || n % 4 === 1 ? Gs(e) : Ks(n);
}, Ys = (e, t) => {
  if (!e || typeof e != "string" || !e.startsWith("data:")) return 0;
  const n = e.indexOf(",");
  if (n < 0) return 0;
  const r = e.slice(5, n), o = e.slice(n + 1);
  if (/;base64/i.test(r))
    return t(o);
  let i = 0;
  for (let a = 0, c = o.length; a < c; a++) {
    const f = o.charCodeAt(a);
    if (f === 37 && or(o, a, c))
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
function Zs(e) {
  const t = typeof e == "string" ? e.indexOf("#") : -1;
  return Ys(
    t === -1 ? e : e.slice(0, t),
    Js
  );
}
const Ut = "1.20.0", an = 64 * 1024, Xs = {
  cache: "default",
  redirect: "follow",
  referrer: "about:client",
  referrerPolicy: "",
  mode: "cors",
  integrity: "",
  keepalive: !1,
  priority: "auto",
  window: null
}, { isFunction: Ke } = l, Qs = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, n) => String.fromCharCode(parseInt(n, 16))
), ln = (e) => {
  if (!l.isString(e))
    return e;
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}, cn = (e, ...t) => {
  try {
    return !!e(...t);
  } catch {
    return !1;
  }
}, ei = (e) => {
  const t = e.indexOf("://");
  let n = e;
  return t !== -1 && (n = n.slice(t + 3)), n.includes("@") || n.includes(":");
}, ti = (e) => {
  const t = l.global !== void 0 && l.global !== null ? l.global : globalThis, { ReadableStream: n, TextEncoder: r } = t;
  e = l.merge.call(
    {
      skipUndefined: !0
    },
    {
      Request: t.Request,
      Response: t.Response
    },
    e
  );
  const { fetch: o, Request: s, Response: i } = e, a = o ? Ke(o) : typeof fetch == "function", c = Ke(s), f = Ke(i);
  if (!a)
    return !1;
  const u = a && Ke(n), p = a && (typeof r == "function" ? /* @__PURE__ */ ((h) => (b) => h.encode(b))(new r()) : async (h) => new Uint8Array(await new s(h).arrayBuffer())), y = c && u && cn(() => {
    let h = !1;
    const b = new s(B.origin, {
      body: new n(),
      method: "POST",
      get duplex() {
        return h = !0, "half";
      }
    }), E = b.headers.has("Content-Type");
    return b.body != null && b.body.cancel(), h && !E;
  }), x = f && u && cn(() => l.isReadableStream(new i("").body)), S = {
    stream: x && ((h) => h.body)
  };
  a && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((h) => {
    !S[h] && (S[h] = (b, E) => {
      let O = b && b[h];
      if (O)
        return O.call(b);
      throw new m(
        `Response type '${h}' is not supported`,
        m.ERR_NOT_SUPPORT,
        E
      );
    });
  });
  const C = async (h) => {
    if (h == null)
      return 0;
    if (l.isBlob(h))
      return h.size;
    if (l.isSpecCompliantForm(h))
      return (await new s(B.origin, {
        method: "POST",
        body: h
      }).arrayBuffer()).byteLength;
    if (l.isArrayBufferView(h) || l.isArrayBuffer(h))
      return h.byteLength;
    if (l.isURLSearchParams(h) && (h = h + ""), l.isString(h))
      return (await p(h)).byteLength;
  }, _ = async (h, b) => {
    const E = l.toFiniteNumber(h.getContentLength());
    return E ?? C(b);
  };
  return async (h) => {
    let {
      url: b,
      method: E,
      data: O,
      signal: F,
      cancelToken: P,
      timeout: N,
      onDownloadProgress: V,
      onUploadProgress: Z,
      responseType: U,
      headers: T,
      withCredentials: he = "same-origin",
      fetchOptions: Ce,
      maxContentLength: q,
      maxBodyLength: Re,
      maxRedirects: lt
    } = rr(h);
    const ae = l.isNumber(q) && q > -1, ke = l.isNumber(Re) && Re > -1, ct = (w) => l.hasOwnProp(h, w) ? h[w] : void 0;
    let Pe = o || fetch;
    U = U ? (U + "").toLowerCase() : "text";
    let G = js(
      [F, P && P.toAbortSignal()],
      N
    ), L = null;
    const X = G && G.unsubscribe && (() => {
      G.unsubscribe();
    });
    let le, ce = null;
    const Ne = () => new m(
      "Request body larger than maxBodyLength limit",
      m.ERR_BAD_REQUEST,
      h,
      L
    );
    try {
      let w;
      const k = ct("auth");
      if (k) {
        const A = l.getSafeProp(k, "username") || "", M = l.getSafeProp(k, "password") || "";
        w = {
          username: A,
          password: M
        };
      }
      if (ei(b)) {
        const A = new URL(b, B.origin);
        if (!w && (A.username || A.password)) {
          const M = ln(A.username), ue = ln(A.password);
          w = {
            username: M,
            password: ue
          };
        }
        (A.username || A.password) && (A.username = "", A.password = "", b = A.href);
      }
      if (w && (T.delete("authorization"), T.set(
        "Authorization",
        "Basic " + btoa(Qs((w.username || "") + ":" + (w.password || "")))
      )), ae && typeof b == "string" && b.startsWith("data:") && Zs(b) > q)
        throw new m(
          "maxContentLength size of " + q + " exceeded",
          m.ERR_BAD_RESPONSE,
          h,
          L
        );
      if (ke && E !== "get" && E !== "head") {
        const A = await C(O);
        if (typeof A == "number" && isFinite(A) && (le = A, A > Re))
          throw Ne();
      }
      const z = ke && (l.isReadableStream(O) || l.isStream(O)), Bt = (A, M, ue) => rn(
        A,
        an,
        (pe) => {
          if (ke && pe > Re)
            throw ce = Ne();
          M && M(pe);
        },
        ue
      );
      if (y && E !== "get" && E !== "head" && (Z || z)) {
        if (le = le ?? await _(T, O), le !== 0 || z) {
          let A = new s(b, {
            method: "POST",
            body: O,
            duplex: "half"
          }), M;
          if (l.isFormData(O) && (M = A.headers.get("content-type")) && T.setContentType(M), A.body) {
            const [ue, pe] = Z && Qt(
              le,
              rt(en(Z))
            ) || [];
            O = Bt(A.body, ue, pe);
          }
        }
      } else if (z && !c && u && E !== "get" && E !== "head")
        O = Bt(O);
      else if (z && c && !y && E !== "get" && E !== "head")
        throw new m(
          "Stream request bodies are not supported by the current fetch implementation",
          m.ERR_NOT_SUPPORT,
          h,
          L
        );
      l.isString(he) || (he = he ? "include" : "omit");
      const ur = c && "credentials" in s.prototype;
      if (l.isFormData(O)) {
        const A = T.getContentType();
        A && /^multipart\/form-data/i.test(A) && !/boundary=/i.test(A) && T.delete("content-type");
      }
      T.set("User-Agent", "axios/" + Ut, !1);
      const J = Ce == null ? Ce : Object.assign(/* @__PURE__ */ Object.create(null), Ce);
      J && (delete J.body, delete J.headers, delete J.method, delete J.signal, delete J.duplex, delete J.credentials);
      const ne = Object.assign(/* @__PURE__ */ Object.create(null), J, {
        signal: G,
        method: E.toUpperCase(),
        headers: zn(T.normalize()),
        body: O,
        duplex: "half",
        credentials: ur ? he : void 0
      });
      c && (l.forEach(Xs, (A, M) => {
        ne[M] === void 0 && (ne[M] = A);
      }), ne.signal === void 0 && (ne.signal = null), ne.body === void 0 && (ne.body = null)), lt === 0 && (ne.redirect = "manual", J && (J.redirect = "manual")), L = c && new s(b, ne);
      let re = await (c ? Pe(L, J) : Pe(b, ne));
      const Ht = $.from(re.headers);
      if (ae) {
        const A = l.toFiniteNumber(Ht.getContentLength());
        if (A != null && A > q)
          throw new m(
            "maxContentLength size of " + q + " exceeded",
            m.ERR_BAD_RESPONSE,
            h,
            L
          );
      }
      const ut = x && (U === "stream" || U === "response");
      if (x && re.body && (V || ae || ut && X)) {
        const A = {};
        ["status", "statusText", "headers"].forEach((Le) => {
          A[Le] = re[Le];
        });
        const M = l.toFiniteNumber(Ht.getContentLength()), [ue, pe] = V && Qt(
          M,
          rt(en(V), !0)
        ) || [];
        let Mt = 0;
        const dr = (Le) => {
          if (ae && (Mt = Le, Mt > q))
            throw new m(
              "maxContentLength size of " + q + " exceeded",
              m.ERR_BAD_RESPONSE,
              h,
              L
            );
          ue && ue(Le);
        };
        re = new i(
          rn(re.body, an, dr, () => {
            pe && pe(), X && X();
          }),
          A
        );
      }
      U = U || "text";
      let oe = await S[l.findKey(S, U) || "text"](
        re,
        h
      );
      if (ae && !x && !ut) {
        let A;
        if (oe != null && (typeof oe.byteLength == "number" ? A = oe.byteLength : typeof oe.size == "number" ? A = oe.size : typeof oe == "string" && (A = typeof r == "function" ? new r().encode(oe).byteLength : oe.length)), typeof A == "number" && A > q)
          throw new m(
            "maxContentLength size of " + q + " exceeded",
            m.ERR_BAD_RESPONSE,
            h,
            L
          );
      }
      return !ut && X && X(), await new Promise((A, M) => {
        er(A, M, {
          data: oe,
          headers: $.from(re.headers),
          status: re.status,
          statusText: re.statusText,
          config: h,
          request: L
        });
      });
    } catch (w) {
      if (X && X(), G && G.aborted && G.reason instanceof m) {
        const k = G.reason;
        throw k.config = h, L && (k.request = L), w !== k && Object.defineProperty(k, "cause", {
          __proto__: null,
          value: w,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), k;
      }
      if (ce)
        throw L && !ce.request && (ce.request = L), ce;
      if (w instanceof m)
        throw L && !w.request && (w.request = L), w;
      if (w && w.name === "TypeError" && /Load failed|fetch/i.test(w.message)) {
        const k = new m(
          "Network Error",
          m.ERR_NETWORK,
          h,
          L,
          w && w.response
        );
        throw Object.defineProperty(k, "cause", {
          __proto__: null,
          value: w.cause || w,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), k;
      }
      throw m.from(w, w && w.code, h, L, w && w.response);
    }
  };
}, ni = /* @__PURE__ */ new Map(), sr = (e) => {
  let t = e && e.env || {};
  const { fetch: n, Request: r, Response: o } = t, s = [r, o, n];
  let i = s.length, a = i, c, f, u = ni;
  for (; a--; )
    c = s[a], f = u.get(c), f === void 0 && u.set(c, f = a ? /* @__PURE__ */ new Map() : ti(t)), u = f;
  return f;
};
sr();
const vt = {
  http: cs,
  xhr: Ms,
  fetch: {
    get: sr
  }
};
l.forEach(vt, (e, t) => {
  if (e) {
    try {
      Object.defineProperty(e, "name", { __proto__: null, value: t });
    } catch {
    }
    Object.defineProperty(e, "adapterName", { __proto__: null, value: t });
  }
});
const un = (e) => `- ${e}`, ri = (e) => l.isFunction(e) || e === null || e === !1;
function oi(e, t) {
  e = l.isArray(e) ? e : [e];
  const { length: n } = e;
  let r, o;
  const s = {};
  for (let i = 0; i < n; i++) {
    r = e[i];
    let a;
    if (o = r, !ri(r) && (o = vt[(a = String(r)).toLowerCase()], o === void 0))
      throw new m(`Unknown adapter '${a}'`);
    if (o && (l.isFunction(o) || (o = o.get(t))))
      break;
    s[a || "#" + i] = o;
  }
  if (!o) {
    const i = Object.entries(s).map(
      ([c, f]) => `adapter ${c} ` + (f === !1 ? "is not supported by the environment" : "is not available in the build")
    );
    let a = n ? i.length > 1 ? `since :
` + i.map(un).join(`
`) : " " + un(i[0]) : "as no adapter specified";
    throw new m(
      "There is no suitable adapter to dispatch the request " + a,
      m.ERR_NOT_SUPPORT
    );
  }
  return o;
}
const ir = {
  /**
   * Resolve an adapter from a list of adapter names or functions.
   * @type {Function}
   */
  getAdapter: oi,
  /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */
  adapters: vt
};
function St(e) {
  if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted)
    throw new qe(null, e);
}
function Rt(e) {
  const t = l.toSafeFlatObject(e);
  return St(t), t.headers = $.from(l.getSafeProp(t, "headers")), t.data = wt.call(t, t.transformRequest), ["post", "put", "patch"].indexOf(t.method) !== -1 && t.headers.setContentType("application/x-www-form-urlencoded", !1), ir.getAdapter(t.adapter || Ve.adapter, t)(t).then(
    function(o) {
      St(t), t.response = o;
      try {
        o.data = wt.call(t, t.transformResponse, o);
      } finally {
        delete t.response;
      }
      return o.headers = $.from(o.headers), o;
    },
    function(o) {
      if (!Qn(o) && (St(t), o && o.response)) {
        t.response = o.response;
        try {
          o.response.data = wt.call(
            t,
            t.transformResponse,
            o.response
          );
        } finally {
          delete t.response;
        }
        o.response.headers = $.from(o.response.headers);
      }
      return Promise.reject(o);
    }
  );
}
const at = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((e, t) => {
  at[e] = function(r) {
    return typeof r === e || "a" + (t < 1 ? "n " : " ") + e;
  };
});
const dn = {};
at.transitional = function(t, n, r) {
  function o(s, i) {
    return "[Axios v" + Ut + "] Transitional option '" + s + "'" + i + (r ? ". " + r : "");
  }
  return (s, i, a) => {
    if (t === !1)
      throw new m(
        o(i, " has been removed" + (n ? " in " + n : "")),
        m.ERR_DEPRECATED
      );
    return n && !dn[i] && (dn[i] = !0, console.warn(
      o(
        i,
        " has been deprecated since v" + n + " and will be removed in the near future"
      )
    )), t ? t(s, i, a) : !0;
  };
};
at.spelling = function(t) {
  return (n, r) => (console.warn(`${r} is likely a misspelling of ${t}`), !0);
};
function si(e, t, n) {
  if (typeof e != "object" || e === null)
    throw new m("options must be an object", m.ERR_BAD_OPTION_VALUE);
  const r = Object.keys(e);
  let o = r.length;
  for (; o-- > 0; ) {
    const s = r[o], i = Object.prototype.hasOwnProperty.call(t, s) ? t[s] : void 0;
    if (i) {
      const a = e[s], c = a === void 0 || i(a, s, e);
      if (c !== !0)
        throw new m(
          "option " + s + " must be " + c,
          m.ERR_BAD_OPTION_VALUE
        );
      continue;
    }
    if (n !== !0)
      throw new m("Unknown option " + s, m.ERR_BAD_OPTION);
  }
}
const Xe = {
  assertOptions: si,
  validators: at
}, j = Xe.validators;
let ye = class {
  constructor(t) {
    this.defaults = t || {}, this.interceptors = {
      request: new Zt(),
      response: new Zt()
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
  async request(t, n) {
    try {
      return await this._request(t, n);
    } catch (r) {
      if (r instanceof Error)
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
          if (!r.stack)
            r.stack = i;
          else if (i) {
            const a = i.indexOf(`
`), c = a === -1 ? -1 : i.indexOf(`
`, a + 1), f = c === -1 ? "" : i.slice(c + 1);
            String(r.stack).endsWith(f) || (r.stack += `
` + i);
          }
        } catch {
        }
      throw r;
    }
  }
  _request(t, n) {
    typeof t == "string" ? (n = n || {}, n.url = t) : n = t || {}, n = Se(this.defaults, n);
    const { transitional: r, paramsSerializer: o, headers: s } = n;
    r !== void 0 && Xe.assertOptions(
      r,
      {
        silentJSONParsing: j.transitional(j.boolean),
        forcedJSONParsing: j.transitional(j.boolean),
        clarifyTimeoutError: j.transitional(j.boolean),
        legacyInterceptorReqResOrdering: j.transitional(j.boolean),
        advertiseZstdAcceptEncoding: j.transitional(j.boolean),
        validateStatusUndefinedResolves: j.transitional(j.boolean)
      },
      !1
    ), o != null && (l.isFunction(o) ? n.paramsSerializer = {
      serialize: o
    } : Xe.assertOptions(
      o,
      {
        encode: j.function,
        serialize: j.function
      },
      !0
    )), n.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? n.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : n.allowAbsoluteUrls = !0), Xe.assertOptions(
      n,
      {
        baseUrl: j.spelling("baseURL"),
        withXsrfToken: j.spelling("withXSRFToken")
      },
      !0
    ), n.method = (l.getSafeProp(n, "method") || l.getSafeProp(this.defaults, "method") || "get").toLowerCase();
    let i = s && l.merge(s.common, s[n.method]);
    s && l.forEach(Xn.concat("common"), (S) => {
      delete s[S];
    }), n.headers = $.concat(i, s);
    const a = [];
    let c = !0;
    this.interceptors.request.forEach(function(C) {
      if (typeof C.runWhen == "function" && C.runWhen(n) === !1)
        return;
      c = c && C.synchronous;
      const _ = n.transitional || Dt;
      _ && _.legacyInterceptorReqResOrdering ? a.unshift(C.fulfilled, C.rejected) : a.push(C.fulfilled, C.rejected);
    });
    const f = [];
    this.interceptors.response.forEach(function(C) {
      f.push(C.fulfilled, C.rejected);
    });
    let u, p = 0, y;
    if (!c) {
      const S = [Rt.bind(this), void 0];
      for (S.unshift(...a), S.push(...f), y = S.length, u = Promise.resolve(n); p < y; )
        u = u.then(S[p++], S[p++]);
      return u;
    }
    y = a.length;
    let x = n;
    for (; p < y; ) {
      const S = a[p++], C = a[p++];
      try {
        x = S ? S(x) : x;
      } catch (_) {
        if (!C) {
          u = Promise.reject(_);
          break;
        }
        try {
          const h = C.call(this, _);
          l.isThenable(h) && (u = Promise.resolve(h).then(
            () => Rt.call(this, x)
          ));
        } catch (h) {
          u = Promise.reject(h);
        }
        break;
      }
    }
    if (!u)
      try {
        u = Rt.call(this, x);
      } catch (S) {
        u = Promise.reject(S);
      }
    for (p = 0, y = f.length; p < y; )
      u = u.then(f[p++], f[p++]);
    return u;
  }
  getUri(t) {
    t = Se(this.defaults, t);
    const n = nr(t.baseURL, t.url, t.allowAbsoluteUrls, t);
    return Gn(n, t.params, t.paramsSerializer);
  }
};
l.forEach(["delete", "get", "head", "options"], function(t) {
  ye.prototype[t] = function(n, r) {
    return this.request(
      Se(r || {}, {
        method: t,
        url: n,
        data: r && l.hasOwnProp(r, "data") ? r.data : void 0
      })
    );
  };
});
l.forEach(["post", "put", "patch", "query"], function(t) {
  function n(r) {
    return function(s, i, a) {
      return this.request(
        Se(a || {}, {
          method: t,
          headers: r ? {
            "Content-Type": "multipart/form-data"
          } : {},
          url: s,
          data: i
        })
      );
    };
  }
  ye.prototype[t] = n(), t !== "query" && (ye.prototype[t + "Form"] = n(!0));
});
let ii = class ar {
  constructor(t) {
    if (typeof t != "function")
      throw new TypeError("executor must be a function.");
    let n;
    this.promise = new Promise(function(s) {
      n = s;
    });
    const r = this;
    this.promise.then((o) => {
      if (!r._listeners) return;
      let s = r._listeners.length;
      for (; s-- > 0; )
        r._listeners[s](o);
      r._listeners = null;
    }), this.promise.then = (o) => {
      let s;
      const i = new Promise((a) => {
        r.subscribe(a), s = a;
      }).then(o);
      return i.cancel = function() {
        r.unsubscribe(s);
      }, i;
    }, t(function(s, i, a) {
      r.reason || (r.reason = new qe(s, i, a), n(r.reason));
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
    const n = this._listeners.indexOf(t);
    n !== -1 && this._listeners.splice(n, 1);
  }
  toAbortSignal() {
    const t = new AbortController(), n = (r) => {
      t.abort(r);
    };
    return this.subscribe(n), t.signal.unsubscribe = () => this.unsubscribe(n), t.signal;
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let t;
    return {
      token: new ar(function(o) {
        t = o;
      }),
      cancel: t
    };
  }
};
function ai(e) {
  return function(n) {
    return e.apply(null, n);
  };
}
function li(e) {
  return l.isObject(e) && e.isAxiosError === !0;
}
const Qe = {
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
Object.entries(Qe).forEach(([e, t]) => {
  Qe[t] === void 0 && (Qe[t] = e);
});
function lr(e) {
  const t = new ye(e), n = Ln(ye.prototype.request, t);
  return l.extend(n, ye.prototype, t, { allOwnKeys: !0 }), l.extend(n, t, null, { allOwnKeys: !0 }), n.create = function(o) {
    return lr(Se(e, o));
  }, n;
}
const D = lr(Ve);
D.Axios = ye;
D.CanceledError = qe;
D.CancelToken = ii;
D.isCancel = Qn;
D.VERSION = Ut;
D.toFormData = it;
D.AxiosError = m;
D.Cancel = D.CanceledError;
D.all = function(t) {
  return Promise.all(t);
};
D.spread = ai;
D.isAxiosError = li;
D.mergeConfig = Se;
D.AxiosHeaders = $;
D.formToJSON = (e) => Zn(l.isHTMLForm(e) ? new FormData(e) : e);
D.getAdapter = ir.getAdapter;
D.HttpStatusCode = Qe;
D.default = D;
const {
  Axios: ji,
  AxiosError: $i,
  CanceledError: zi,
  isCancel: Wi,
  CancelToken: Vi,
  VERSION: qi,
  all: Ki,
  Cancel: Gi,
  isAxiosError: Ji,
  spread: Yi,
  toFormData: Zi,
  AxiosHeaders: Xi,
  HttpStatusCode: Qi,
  formToJSON: ea,
  getAdapter: ta,
  mergeConfig: na,
  create: ra
} = D, ci = [
  v.ENDPOINTS.REFRESH,
  v.ENDPOINTS.MAGIC_LINK_REQUEST,
  v.ENDPOINTS.MAGIC_LINK_VERIFY,
  v.ENDPOINTS.PASSKEY_LOGIN_OPTIONS,
  v.ENDPOINTS.PASSKEY_LOGIN_VERIFY
], ui = (e) => !!e && ci.some((t) => e.split("?")[0].endsWith(t)), di = (e, t) => {
  const n = D.create({
    baseURL: e,
    timeout: v.DEFAULT_CONFIG.TIMEOUT,
    headers: {
      "Content-Type": "application/json",
      ...t && { "X-API-Key": t }
    }
  });
  return n.interceptors.request.use(
    (r) => {
      const o = te.getAccessToken();
      return o && r.headers && (r.headers.Authorization = `Bearer ${o}`), r;
    },
    (r) => Promise.reject(r)
  ), n.interceptors.response.use(
    (r) => r,
    async (r) => {
      const o = r.config;
      if (r.response?.status === v.STATUS_CODES.UNAUTHORIZED && !o._retry && !ui(o.url)) {
        o._retry = !0;
        try {
          const s = te.getRefreshToken();
          if (!s)
            throw new Error(Zr.NO_REFRESH_TOKEN);
          const i = await n.post(v.ENDPOINTS.REFRESH, {
            refreshToken: s
          }), a = {
            accessToken: i.data.accessToken,
            refreshToken: i.data.refreshToken
          };
          return te.setTokens(a.accessToken, a.refreshToken), o.headers && (o.headers.Authorization = `Bearer ${a.accessToken}`), n(o);
        } catch (s) {
          return te.clearTokens(), window.location.href = "/login", Promise.reject(s);
        }
      }
      return Promise.reject(r);
    }
  ), n;
};
let Ge = null;
const Q = (e, t) => {
  if (!Ge && e && (Ge = di(e, t)), !Ge)
    throw new Error("API client not initialized. Please provide baseURL.");
  return Ge;
}, fn = (e, t) => e?.name === "NotAllowedError" ? "Passkey request was cancelled or timed out" : e?.name === "InvalidStateError" ? "A passkey for this account is already registered on this device" : e?.response?.data?.message || e?.message || t, ie = {
  /**
   * Logout user and invalidate refresh token
   * @param refreshToken - The refresh token to invalidate
   * @returns Promise resolving when logout is complete
   */
  logout: async (e) => {
    try {
      await Q().post(v.ENDPOINTS.LOGOUT, {
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
      const n = await Q().post(v.ENDPOINTS.REFRESH, {
        refreshToken: e
      });
      return {
        accessToken: n.data.accessToken,
        refreshToken: n.data.refreshToken
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
      const t = await Q().get(v.ENDPOINTS.USER_ME), n = t.data?.data ?? t.data;
      return {
        id: n.id,
        email: n.email,
        name: n.name,
        profilePicture: n.profilePicture,
        role: n.role
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
  initiateOAuth: (e, t, n) => {
    const r = `${n}${e}?redirect_uri=${encodeURIComponent(t)}&prompt=select_account`;
    window.location.href = r;
  },
  /**
   * Request a one-time sign-in link to be emailed to the user
   * @param email - User's email address
   * @param redirectUri - Frontend URI the emailed link should point to
   * @returns Promise resolving when the request has been accepted
   */
  requestMagicLink: async (e, t) => {
    try {
      await Q().post(v.ENDPOINTS.MAGIC_LINK_REQUEST, {
        email: e,
        redirectUri: t
      });
    } catch (n) {
      throw new Error(
        n.response?.data?.message || n.message || "Failed to send sign-in link"
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
      const n = await Q().post(v.ENDPOINTS.MAGIC_LINK_VERIFY, {
        token: e
      });
      return {
        accessToken: n.data.accessToken,
        refreshToken: n.data.refreshToken
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
      const e = Q(), t = await e.post(v.ENDPOINTS.PASSKEY_LOGIN_OPTIONS), { challengeId: n, options: r } = t.data, o = await Fr({ optionsJSON: r }), s = await e.post(
        v.ENDPOINTS.PASSKEY_LOGIN_VERIFY,
        { challengeId: n, response: o },
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
      throw new Error(fn(e, "Passkey sign-in failed"));
    }
  },
  /**
   * Register a new passkey for the currently signed-in user
   * @param name - Optional friendly name for the passkey (e.g. "MacBook Pro")
   * @returns Promise resolving to the stored passkey info
   */
  registerPasskey: async (e) => {
    try {
      const t = Q(), n = await t.post(v.ENDPOINTS.PASSKEY_REGISTER_OPTIONS), { challengeId: r, options: o } = n.data, s = await Lr({ optionsJSON: o });
      return (await t.post(v.ENDPOINTS.PASSKEY_REGISTER_VERIFY, {
        challengeId: r,
        response: s,
        name: e
      })).data;
    } catch (t) {
      throw new Error(fn(t, "Passkey registration failed"));
    }
  }
}, fi = [0, 45, 90, 135, 180, 225, 270, 315], hi = (e) => /* @__PURE__ */ R(Oe, { ...e, viewBox: "0 0 24 24", children: [
  /* @__PURE__ */ d("circle", { cx: "12", cy: "12", r: "4.6", fill: "currentColor" }),
  fi.map((t) => /* @__PURE__ */ d(
    "line",
    {
      x1: "12",
      y1: "2.6",
      x2: "12",
      y2: "4.6",
      stroke: "currentColor",
      strokeWidth: "1.9",
      strokeLinecap: "round",
      transform: `rotate(${t} 12 12)`
    },
    t
  ))
] }), pi = (e) => {
  const t = `lumora-moon-${fr()}`;
  return /* @__PURE__ */ R(Oe, { ...e, viewBox: "0 0 24 24", children: [
    /* @__PURE__ */ R("mask", { id: t, children: [
      /* @__PURE__ */ d("rect", { width: "24", height: "24", fill: "#fff" }),
      /* @__PURE__ */ d("circle", { cx: "15.8", cy: "8.2", r: "4.6", fill: "#000" })
    ] }),
    /* @__PURE__ */ d("circle", { cx: "12", cy: "12", r: "7.5", fill: "currentColor", mask: `url(#${t})` })
  ] });
}, mi = ({ title: e, height: t, color: n }) => /* @__PURE__ */ R(
  "svg",
  {
    role: "img",
    "aria-label": e,
    viewBox: "0 0 143 38",
    height: t,
    width: t * 143 / 38,
    style: { display: "block", fill: n, transition: Pn },
    children: [
      /* @__PURE__ */ d("path", { d: "M47.0556 19.7972V5.34429C46.8088 5.38305 46.7507 5.68829 46.6442 5.89178C44.5245 9.8599 43.0533 14.7341 40.9288 18.7022C40.7691 19.0026 40.4496 19.8069 40.1109 19.8069C39.3753 19.8166 34.4438 6.74452 33.1662 5.34429V19.8069H31.8595V1.87036H34.5551L40.6674 15.141L41.0885 15.4075L47.1379 1.87036H49.6689V19.3369C49.6689 19.395 49.6544 19.6567 49.6544 19.7923" }),
      /* @__PURE__ */ d("path", { d: "M79.0544 11.4152L77.1235 11.3764V19.6034H74.3456V1.87036H80.966C82.9212 2.09324 85.3845 3.34327 85.6265 5.79972C85.9362 8.95387 84.3876 9.98588 82.0937 10.9985C81.9243 11.0712 81.813 10.9016 81.871 11.2844L87.4268 19.6082H84.7312M77.1235 10.4704C80.1336 11.1099 84.3827 8.60503 82.3308 4.73865C81.9194 3.96344 80.4385 2.97504 79.6594 2.97504H77.1283V10.4752L77.1235 10.4704Z" }),
      /* @__PURE__ */ d("path", { d: "M60.9113 1.56022C67.2753 0.857678 72.7294 6.97702 70.2903 14.0702C67.8366 21.1973 58.5593 22.2197 54.7651 16.0179C51.1113 10.044 54.6199 2.25791 60.9161 1.56506L60.9113 1.56022ZM60.9064 2.46625C54.8135 3.61938 54.7409 18.6779 61.6856 19.2448C69.8644 19.9134 69.8741 0.770466 60.9064 2.46625Z" }),
      /* @__PURE__ */ d("path", { d: "M16.8233 1.87036V14.2156C16.8233 17.5345 20.7675 19.7293 23.4486 18.707C24.6391 18.2564 26.4539 16.2263 26.6282 14.768V1.87036H27.9348V14.8552C27.9348 15.1653 27.5767 16.3862 27.3977 16.769C24.8375 22.2294 14.21 20.6499 14.21 14.5839V1.87036H16.8233Z" }),
      /* @__PURE__ */ d("path", { d: "M95.669 1.49707L103.432 19.6177H100.736L98.3453 13.789C96.2062 13.789 93.9413 13.7503 91.9039 13.7503C91.6232 13.7503 91.6571 13.7503 91.4732 13.7503L88.9421 19.797H87.6403M91.9232 12.665H97.7161L95.0205 5.89641" }),
      /* @__PURE__ */ d("path", { d: "M4.0761 1.87036V18.5132H12.0855V19.6131H1.29822V2.14653L1.54503 1.87036H4.0761Z" }),
      /* @__PURE__ */ d("path", { d: "M37.7396 32.782V37.3557H36.2684V27.4814H40.111C41.0692 27.4814 41.5725 28.1598 41.829 28.4844C42.5647 29.4146 42.584 31.062 41.829 31.968C41.6597 32.1715 41.1031 32.7335 40.4353 32.7868H37.7396V32.782ZM37.7396 28.0289V32.1424C39.1867 32.5494 40.8563 32.2199 40.8563 30.311C40.8563 28.402 39.1818 27.8351 37.7396 28.0241V28.0289Z" }),
      /* @__PURE__ */ d("path", { d: "M8.81874 29.8504L8.1654 29.957C6.65547 26.6236 2.85645 27.297 1.90307 30.8049C0.543162 35.8292 5.6053 39.5793 8.32027 34.6906L8.8139 34.7924C7.27977 38.9737 1.36588 38.1985 0.238272 34.0559C-1.4362 27.893 6.17152 24.4094 8.8139 29.8504H8.81874Z" }),
      /* @__PURE__ */ d("path", { d: "M26.4589 37.3505L25.0119 37.3262L23.8601 34.1721L19.9207 34.1479L18.5898 37.3262L17.7961 37.3505L22.0452 27.1128M20.2546 33.329H23.3616L21.9678 29.4869" }),
      /* @__PURE__ */ d("path", { d: "M71.2435 27.4766V28.0241H68.1414V37.3508H66.6702V28.0241H63.6455L63.3987 27.4766H71.2435Z" }),
      /* @__PURE__ */ d("path", { d: "M99.5161 27.4766V36.8033H103.925V37.3508H98.04V27.4766H99.5112H99.5161Z" }),
      /* @__PURE__ */ d("path", { d: "M54.0825 27.4766H52.6113V37.3508H54.0825V27.4766Z" }),
      /* @__PURE__ */ d("path", { d: "M112.883 22.8688L112.975 16.7204L133.112 0L133.194 6.31314L112.883 22.8688Z" }),
      /* @__PURE__ */ d("path", { d: "M112.849 37.9998L113.009 32.6169L133.228 15.8433V21.0711L112.854 37.9998H112.849Z" }),
      /* @__PURE__ */ d("path", { d: "M121.913 37.8838V32.4282L142.123 15.2766V21.1489L121.913 37.8838Z" }),
      /* @__PURE__ */ d("path", { d: "M121.792 23.4694V17.7813L142.133 0.828369V6.54557L121.792 23.4694Z" }),
      /* @__PURE__ */ d("path", { d: "M86.8706 37.3505L85.4236 37.3262L84.2718 34.1721L80.3324 34.1479L79.0016 37.3262L78.2079 37.3505L82.457 27.1128M80.6664 33.329H83.7733L82.3796 29.4869" })
    ]
  }
), hn = ({
  brandConfig: e,
  theme: t,
  onToggleColorMode: n,
  showWelcome: r = !0
}) => {
  const o = t.mode === "dark" ? "light" : "dark";
  return /* @__PURE__ */ R(
    g,
    {
      component: "header",
      sx: { "& *": { transition: I } },
      children: [
        /* @__PURE__ */ R(
          g,
          {
            sx: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2
            },
            children: [
              e.logo ? typeof e.logo == "string" ? /* @__PURE__ */ d(
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
              ) : e.logo : /* @__PURE__ */ d(
                mi,
                {
                  title: e.companyName || "Lumora Capital",
                  height: e.logoHeight,
                  color: t.logo
                }
              ),
              /* @__PURE__ */ d(
                pr,
                {
                  title: `Switch to ${o} mode`,
                  slotProps: {
                    tooltip: { sx: { fontFamily: t.bodyFont } }
                  },
                  children: /* @__PURE__ */ R(
                    mr,
                    {
                      "aria-label": `Switch to ${o} mode`,
                      onClick: n,
                      size: "small",
                      disableRipple: !0,
                      sx: {
                        width: 30,
                        height: 30,
                        // Light: white button, amber sun. Dark: the page's own surface, pale moon
                        backgroundColor: t.mode === "dark" ? t.surface : "#ffffff",
                        border: `2px solid ${t.mode === "dark" ? t.border : "#d9dbe1"}`,
                        transition: I,
                        "&:hover": {
                          backgroundColor: t.mode === "dark" ? t.surface : "#ffffff"
                        },
                        "&.Mui-focusVisible": {
                          outline: `2px solid ${t.accent}`,
                          outlineOffset: 2
                        },
                        // Both icons sit in the same spot; the current one shows, the other
                        // fades out with a quarter turn
                        "& .MuiSvgIcon-root": {
                          position: "absolute",
                          fontSize: 17,
                          transition: `${ot("opacity")}, transform ${Pt}ms ${Te}`
                        }
                      },
                      children: [
                        /* @__PURE__ */ d(
                          hi,
                          {
                            sx: {
                              color: "#de9733",
                              opacity: t.mode === "dark" ? 0 : 1,
                              transform: t.mode === "dark" ? "rotate(-90deg) scale(0.6)" : "none"
                            }
                          }
                        ),
                        /* @__PURE__ */ d(
                          pi,
                          {
                            sx: {
                              color: t.heading,
                              opacity: t.mode === "dark" ? 1 : 0,
                              transform: t.mode === "dark" ? "none" : "rotate(90deg) scale(0.6)"
                            }
                          }
                        )
                      ]
                    }
                  )
                }
              )
            ]
          }
        ),
        r && /* @__PURE__ */ R(jt, { children: [
          /* @__PURE__ */ R(
            g,
            {
              component: "h1",
              sx: {
                m: 0,
                mt: 3.5,
                [be]: { mt: 1 },
                fontFamily: t.headingFont,
                fontSize: 42,
                fontWeight: 600,
                lineHeight: 1.12,
                letterSpacing: "-0.01em",
                color: t.welcomeTitle
              },
              children: [
                e.welcomeTitle,
                e.welcomeTitleAccent && /* @__PURE__ */ R(jt, { children: [
                  " ",
                  /* @__PURE__ */ d(
                    g,
                    {
                      component: "span",
                      sx: { color: t.welcomeAccent },
                      children: e.welcomeTitleAccent
                    }
                  )
                ] })
              ]
            }
          ),
          e.tagline && /* @__PURE__ */ d(
            g,
            {
              component: "p",
              sx: {
                m: 0,
                mt: 1.5,
                [be]: { mt: 1 },
                fontFamily: t.bodyFont,
                fontSize: 18,
                fontWeight: 400,
                lineHeight: 1.4,
                color: t.tagline
              },
              children: e.tagline
            }
          )
        ] })
      ]
    }
  );
}, pn = ({
  theme: e,
  icon: t,
  label: n,
  ariaLabel: r,
  loadingLabel: o = "Signing in...",
  isLoading: s = !1,
  disabled: i = !1,
  onClick: a
}) => /* @__PURE__ */ d(
  He,
  {
    fullWidth: !0,
    variant: "outlined",
    "aria-label": s ? o : r,
    startIcon: s ? /* @__PURE__ */ d(Ct, { size: 18, color: "inherit" }) : t,
    onClick: a,
    disabled: i,
    sx: {
      height: 48,
      borderRadius: "10px",
      textTransform: "none",
      // Buttons are set in Montserrat
      fontFamily: e.headingFont,
      fontWeight: 600,
      fontSize: 15,
      whiteSpace: "nowrap",
      transition: I,
      backgroundColor: e.surface,
      borderColor: e.border,
      color: e.heading,
      "& .MuiButton-startIcon .MuiSvgIcon-root": { fontSize: 20 },
      "&:hover": {
        borderColor: e.accent,
        backgroundColor: e.surface
      },
      "&.Mui-focusVisible": {
        outline: `2px solid ${e.accent}`,
        outlineOffset: 2
      },
      "&.Mui-disabled": {
        borderColor: e.border,
        color: e.muted
      }
    },
    children: s ? o : n
  }
), gi = ({ monochrome: e = !1, ...t }) => /* @__PURE__ */ R(Oe, { ...t, viewBox: "0 0 23 23", children: [
  /* @__PURE__ */ d("path", { fill: e ? "currentColor" : "#f35325", d: "M1 1h10v10H1z" }),
  /* @__PURE__ */ d("path", { fill: e ? "currentColor" : "#81bc06", d: "M12 1h10v10H12z" }),
  /* @__PURE__ */ d("path", { fill: e ? "currentColor" : "#05a6f0", d: "M1 12h10v10H1z" }),
  /* @__PURE__ */ d("path", { fill: e ? "currentColor" : "#ffba08", d: "M12 12h10v10H12z" })
] });
function yi(e, t, n) {
  return n === void 0 && (n = {}), function(r, o, s) {
    try {
      return Promise.resolve((function(i, a) {
        try {
          var c = (t != null && t.context && process.env.NODE_ENV === "development" && console.warn("You should not used the yup options context. Please, use the 'useForm' context object instead"), Promise.resolve(e[n.mode === "sync" ? "validateSync" : "validate"](r, Object.assign({ abortEarly: !1 }, t, { context: o }))).then(function(f) {
            return s.shouldUseNativeValidation && Ar({}, s), { values: n.raw ? Object.assign({}, r) : f, errors: {} };
          }));
        } catch (f) {
          return a(f);
        }
        return c && c.then ? c.then(void 0, a) : c;
      })(0, function(i) {
        if (!i.inner) throw i;
        return { values: {}, errors: _r((a = i, c = !s.shouldUseNativeValidation && s.criteriaMode === "all", (a.inner || []).reduce(function(f, u) {
          if (f[u.path] || (f[u.path] = { message: u.message, type: u.type }), c) {
            var p = f[u.path].types, y = p && p[u.type];
            f[u.path] = Or(u.path, c, f, u.type, y ? [].concat(y, u.message) : u.message);
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
const bi = zt.object({
  email: zt.string().email("Please enter a valid email address").required("Email is required")
}), wi = ({
  theme: e,
  isSubmitting: t,
  disabled: n = !1,
  onSubmit: r
}) => {
  const {
    register: o,
    handleSubmit: s,
    formState: { errors: i }
  } = Tr({
    resolver: yi(bi)
  }), a = t || n;
  return /* @__PURE__ */ R(g, { component: "form", noValidate: !0, onSubmit: s(r), children: [
    /* @__PURE__ */ d(
      g,
      {
        component: "label",
        htmlFor: "lumora-work-email",
        sx: {
          display: "block",
          mb: 1.5,
          // Same style as "Where would you like to start?"
          fontFamily: e.bodyFont,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: e.label
        },
        children: "Work email"
      }
    ),
    /* @__PURE__ */ R(g, { sx: { display: "flex", gap: 1.25 }, children: [
      /* @__PURE__ */ d(
        gr,
        {
          ...o("email"),
          id: "lumora-work-email",
          type: "email",
          autoComplete: "email",
          placeholder: "name@lumora.capital",
          disabled: a,
          inputProps: {
            "aria-invalid": !!i.email,
            "aria-describedby": i.email ? "lumora-work-email-error" : void 0
          },
          sx: {
            flex: 1,
            minWidth: 0,
            height: 50,
            px: 2,
            borderRadius: "10px",
            border: `1px solid ${i.email ? "#d14343" : e.border}`,
            backgroundColor: e.surface,
            color: e.label,
            fontFamily: e.bodyFont,
            fontSize: 16,
            transition: I,
            "&.Mui-focused": {
              borderColor: e.accent,
              boxShadow: `0 0 0 3px ${e.accent}26`
            },
            "& input::placeholder": {
              color: e.placeholder,
              opacity: 1,
              transition: I
            }
          }
        }
      ),
      /* @__PURE__ */ d(
        He,
        {
          type: "submit",
          variant: "contained",
          disableElevation: !0,
          disabled: a,
          sx: {
            flexShrink: 0,
            height: 50,
            px: 1.5,
            minWidth: 92,
            borderRadius: "10px",
            textTransform: "none",
            // Button label in the heading font (Montserrat), like the app names
            fontFamily: e.headingFont,
            fontWeight: 600,
            fontSize: 15,
            backgroundColor: e.accent,
            color: e.buttonText,
            transition: I,
            "&:hover": { backgroundColor: e.accentHover },
            ...tt(e),
            "&.Mui-disabled": {
              backgroundColor: e.accent,
              color: e.buttonText,
              opacity: 0.6
            }
          },
          children: t ? /* @__PURE__ */ d(Ct, { size: 20, color: "inherit", "aria-label": "Sending sign-in link" }) : "Magic Link"
        }
      )
    ] }),
    i.email && /* @__PURE__ */ d(
      g,
      {
        id: "lumora-work-email-error",
        role: "status",
        sx: { mt: 1, fontSize: 13, color: "#d14343" },
        children: i.email.message
      }
    )
  ] });
}, Ei = ({
  theme: e,
  title: t,
  description: n,
  onBackToLogin: r
}) => /* @__PURE__ */ R(g, { children: [
  /* @__PURE__ */ d(
    g,
    {
      sx: {
        width: 48,
        height: 48,
        borderRadius: "12px",
        display: "grid",
        placeItems: "center",
        backgroundColor: `${e.accent}1f`,
        color: e.accent
      },
      children: /* @__PURE__ */ d(Sr, {})
    }
  ),
  /* @__PURE__ */ d(
    g,
    {
      component: "h1",
      sx: {
        m: 0,
        mt: 3,
        fontFamily: e.headingFont,
        fontSize: { xs: 28, sm: 32 },
        fontWeight: 600,
        lineHeight: 1.15,
        color: e.heading
      },
      children: t
    }
  ),
  /* @__PURE__ */ d(
    g,
    {
      component: "p",
      sx: {
        m: 0,
        mt: 2,
        fontSize: 16,
        lineHeight: 1.6,
        color: e.label,
        // A blank line in the description is a paragraph break
        whiteSpace: "pre-line"
      },
      children: n
    }
  ),
  /* @__PURE__ */ d(
    He,
    {
      fullWidth: !0,
      variant: "outlined",
      onClick: r,
      sx: {
        mt: 4,
        height: 52,
        borderRadius: "10px",
        borderWidth: 1.5,
        borderColor: e.accent,
        color: e.accent,
        fontFamily: e.headingFont,
        fontWeight: 600,
        fontSize: 13,
        letterSpacing: "0.14em",
        "&:hover": {
          borderWidth: 1.5,
          borderColor: e.accent,
          backgroundColor: `${e.accent}0f`
        },
        ...tt(e)
      },
      children: "Back to sign in"
    }
  )
] }), Si = 1760, Ri = 1120, mn = ({
  weight: e,
  minHeight: t,
  minHeightShort: n
}) => /* @__PURE__ */ d(
  g,
  {
    "aria-hidden": !0,
    sx: {
      flex: `${e} 1 0px`,
      minHeight: t,
      [be]: { minHeight: n }
    }
  }
), gn = ({
  theme: e,
  children: t,
  footer: n,
  hero: r,
  mobileHero: o
}) => {
  const s = Be.Children.toArray(t);
  return (
    // Full-width page background; the layout inside is capped and centred on wide screens
    /* @__PURE__ */ d(
      g,
      {
        sx: {
          minHeight: "100vh",
          backgroundColor: e.pageBg,
          transition: I,
          // Desktop: centres the capped layout vertically on very tall screens
          display: { md: "flex" },
          alignItems: "center",
          ...qr
        },
        children: /* @__PURE__ */ R(
          g,
          {
            sx: {
              // Beyond this the hero would blow its artwork and headline up past their
              // designed size; at 1760px the dashboards show at about 1x
              maxWidth: Si,
              width: "100%",
              mx: "auto",
              minHeight: { xs: "100vh", md: 0 },
              // Desktop: one screen tall, so the page itself never scrolls (no jump on reload,
              // no flash while fonts load), capped so very tall screens do not stretch the hero
              // into an empty band; the sign-in panel scrolls inside if it must
              height: { md: `min(100vh, ${Ri}px)` },
              display: "grid",
              // One row exactly the layout's height: content taller than that (a dashboard
              // image) is clipped by the hero or scrolls in the panel, never stretches the page
              gridTemplateRows: { md: "minmax(0, 1fr)" },
              gridTemplateColumns: {
                // minmax(0, …) lets the column shrink below its content's width on phones
                xs: "minmax(0, 1fr)",
                md: "minmax(400px, 440px) minmax(0, 1fr)",
                xl: "480px minmax(0, 1fr)"
              },
              backgroundColor: e.pageBg,
              color: e.text,
              fontFamily: e.bodyFont,
              boxSizing: "border-box",
              transition: I,
              "& *, & *::before, & *::after": { boxSizing: "border-box" }
            },
            children: [
              /* @__PURE__ */ d(
                g,
                {
                  component: "main",
                  sx: {
                    display: "flex",
                    justifyContent: "center",
                    px: { xs: 3, sm: 6 },
                    py: { xs: 4, sm: 5 },
                    [be]: { py: 2.25 },
                    // Scrolls on its own beside the hero; on phones the page scrolls as usual
                    overflowY: { md: "auto" },
                    overflowX: "clip",
                    // When an error or validation line overflows a laptop-height panel: a thin,
                    // quiet scrollbar. Its space is not reserved, which would narrow the panel
                    // all the time on Windows just to avoid a reflow while an error shows.
                    scrollbarWidth: "thin",
                    scrollbarColor: `${e.border} transparent`
                  },
                  children: /* @__PURE__ */ R(
                    g,
                    {
                      sx: {
                        width: "100%",
                        maxWidth: 440,
                        display: "flex",
                        flexDirection: "column",
                        // Desktop: fill the panel's height (spacers share out the spare). Capped so
                        // very tall screens get a centred panel instead of oversized gaps.
                        height: { md: "min(100%, 960px)" },
                        alignSelf: { md: "center" }
                      },
                      children: [
                        s.map((i, a) => /* @__PURE__ */ R(
                          Be.Fragment,
                          {
                            children: [
                              a > 0 && /* @__PURE__ */ d(
                                mn,
                                {
                                  weight: 1,
                                  minHeight: 18,
                                  minHeightShort: 8
                                }
                              ),
                              /* @__PURE__ */ R(
                                g,
                                {
                                  sx: {
                                    display: "flex",
                                    flexDirection: "column",
                                    animation: se(a * 50)
                                  },
                                  children: [
                                    i,
                                    a === 0 && o && /* @__PURE__ */ d(
                                      g,
                                      {
                                        sx: {
                                          display: {
                                            xs: "block",
                                            md: "none"
                                          },
                                          mt: 2.25
                                        },
                                        children: o
                                      }
                                    )
                                  ]
                                }
                              )
                            ]
                          },
                          Be.isValidElement(i) ? i.key : a
                        )),
                        /* @__PURE__ */ d(mn, { weight: 3, minHeight: 40, minHeightShort: 24 }),
                        /* @__PURE__ */ d(
                          g,
                          {
                            sx: {
                              animation: se(s.length * 50)
                            },
                            children: n
                          }
                        )
                      ]
                    }
                  )
                }
              ),
              /* @__PURE__ */ d(
                g,
                {
                  sx: {
                    display: { xs: "none", md: "block" },
                    height: "100%",
                    p: 2,
                    pl: 0
                  },
                  children: r
                }
              )
            ]
          }
        )
      }
    )
  );
}, Ue = (e) => `var(--mark-primary, ${e})`, yn = "var(--mark-secondary, #3D4C5E)", xi = (e) => `var(--mark-center, ${e})`, Oi = "var(--mark-ring, #ffffff)", cr = ({
  platform: e,
  sx: t,
  ...n
}) => {
  const r = {
    ...n,
    sx: [
      { "& *": { transition: Pn } },
      ...Array.isArray(t) ? t : [t]
    ]
  };
  if (e === "centra") {
    const i = { fill: Ue("#049586") };
    return /* @__PURE__ */ R(Oe, { ...r, viewBox: "0 0 30 30", children: [
      /* @__PURE__ */ d(
        "path",
        {
          style: i,
          d: "M5.60529 3.14542C4.00282 4.40644 2.68044 5.98728 1.72234 7.78732C0.764232 9.58735 0.191389 11.5671 0.0402716 13.6007C-0.110846 15.6342 0.163072 17.6769 0.844589 19.5988C1.52611 21.5207 2.60029 23.2796 3.99877 24.7637L7.18245 21.7635C6.20044 20.7214 5.44614 19.4863 4.96758 18.1368C4.48902 16.7872 4.29667 15.3528 4.40279 13.9249C4.5089 12.4969 4.91115 11.1067 5.58393 9.84273C6.25672 8.57874 7.18529 7.46868 8.31054 6.58319L5.60529 3.14542Z"
        }
      ),
      /* @__PURE__ */ d(
        "path",
        {
          style: { fill: yn },
          d: "M27.6715 7.81562C25.8485 4.37255 22.7324 1.79469 19.0087 0.649137C15.2851 -0.496418 11.2588 -0.115827 7.81575 1.70718L9.86273 5.57326C12.2805 4.29314 15.1077 4.02589 17.7225 4.8303C20.3372 5.63471 22.5253 7.44488 23.8055 9.86261L27.6715 7.81562Z"
        }
      ),
      /* @__PURE__ */ d(
        "path",
        {
          style: { fill: yn },
          d: "M5.52492 3.20912C3.27824 5.00262 1.60718 7.41593 0.718835 10.15L4.87928 11.5018C5.50308 9.58194 6.67649 7.88731 8.25411 6.62792L5.52492 3.20912Z"
        }
      ),
      /* @__PURE__ */ d(
        "path",
        {
          style: i,
          d: "M5.89004 26.4517C7.43504 27.6075 9.19261 28.4476 11.0624 28.924C12.9321 29.4004 14.8774 29.5038 16.7871 29.2283C18.6968 28.9528 20.5336 28.3037 22.1924 27.3182C23.8512 26.3327 25.2996 25.03 26.4549 23.4846L22.9511 20.8653C22.1399 21.9505 21.1228 22.8653 19.958 23.5573C18.7932 24.2493 17.5034 24.7051 16.1624 24.8986C14.8214 25.0921 13.4554 25.0195 12.1425 24.6849C10.8296 24.3504 9.5954 23.7605 8.5105 22.9488L5.89004 26.4517Z"
        }
      ),
      /* @__PURE__ */ d(
        "rect",
        {
          style: i,
          x: "18.9181",
          y: "13.7375",
          width: "10.4612",
          height: "2.44368"
        }
      ),
      /* @__PURE__ */ d(
        "path",
        {
          style: i,
          d: "M14.6851 9.76587C17.5534 9.76607 19.8784 12.0918 19.8784 14.9602C19.8782 17.8285 17.5533 20.1534 14.6851 20.1536C11.8166 20.1536 9.49092 17.8286 9.49072 14.9602C9.49072 12.0917 11.8165 9.76587 14.6851 9.76587ZM14.689 11.3313C12.6824 11.3314 11.0554 12.9576 11.0552 14.9641C11.0552 16.9708 12.6823 18.5978 14.689 18.5979C16.6957 18.5979 18.3228 16.9708 18.3228 14.9641C18.3226 12.9575 16.6956 11.3313 14.689 11.3313Z"
        }
      )
    ] });
  }
  if (e === "xpdite") {
    const i = { fill: Ue("#0F62B0") };
    return /* @__PURE__ */ R(Oe, { ...r, viewBox: "0 0 30 30", children: [
      /* @__PURE__ */ d(
        "rect",
        {
          style: i,
          x: "21.4259",
          y: "23.6411",
          width: "22.6887",
          height: "2.05928",
          transform: "rotate(-134.2 21.4259 23.6411)"
        }
      ),
      /* @__PURE__ */ d(
        "rect",
        {
          style: i,
          width: "25.3429",
          height: "2.05928",
          transform: "matrix(-0.73373 0.679441 0.679441 0.73373 22.6707 5.96777)"
        }
      ),
      /* @__PURE__ */ d("circle", { style: i, cx: "24.063", cy: "24.9252", r: "3.42298" }),
      /* @__PURE__ */ d("circle", { style: i, cx: "4.44975", cy: "24.9252", r: "3.42298" }),
      /* @__PURE__ */ d("circle", { style: i, cx: "4.44975", cy: "4.45204", r: "3.42298" }),
      /* @__PURE__ */ d(
        "circle",
        {
          style: { fill: xi("#0F62B0"), stroke: Oi },
          cx: "14.1725",
          cy: "14.5849",
          r: "3.18086",
          strokeWidth: "1.33541"
        }
      ),
      /* @__PURE__ */ d(
        "circle",
        {
          style: { fill: "none", stroke: Ue("#0F62B0") },
          cx: "3.42298",
          cy: "3.42298",
          r: "2.75528",
          strokeWidth: "1.33541",
          transform: "matrix(-0.982613 -0.185667 -0.185667 0.982613 29.7455 2.17871)"
        }
      )
    ] });
  }
  const o = { fill: Ue("#03463F") }, s = { fill: "none", stroke: Ue("#03463F") };
  return /* @__PURE__ */ R(Oe, { ...r, viewBox: "0 0 30 30", children: [
    /* @__PURE__ */ d(
      "rect",
      {
        style: o,
        x: "9.06116",
        y: "16.5654",
        width: "5.27176",
        height: "1.26303",
        transform: "rotate(-49.64 9.06116 16.5654)"
      }
    ),
    /* @__PURE__ */ d(
      "rect",
      {
        style: o,
        x: "16.2911",
        y: "12.8135",
        width: "5.27176",
        height: "1.26303",
        transform: "rotate(49.64 16.2911 12.8135)"
      }
    ),
    /* @__PURE__ */ d(
      "path",
      {
        style: s,
        strokeWidth: "1.33541",
        d: "M8.99036 16.9846V21.3899L5.1759 23.592L1.36145 21.3899V16.9846L5.1759 14.7825L8.99036 16.9846Z"
      }
    ),
    /* @__PURE__ */ d(
      "path",
      {
        style: s,
        strokeWidth: "1.33541",
        d: "M27.9268 17.259V21.6643L24.1123 23.8665L20.2979 21.6643V17.259L24.1123 15.0569L27.9268 17.259Z"
      }
    ),
    /* @__PURE__ */ d(
      "path",
      {
        style: o,
        d: "M14.7128 4.64917L19.195 7.237V12.4127L14.7128 15.0005L10.2305 12.4127V7.237L14.7128 4.64917Z"
      }
    )
  ] });
}, Ti = ({
  theme: e,
  value: t,
  platformAssets: n,
  disabled: r = !1,
  onChange: o
}) => {
  const s = e.mode === "dark", i = Tn(0), a = de.findIndex((f) => f.id === t);
  a >= 0 && (i.current = a);
  const c = de[i.current];
  return /* @__PURE__ */ R(g, { children: [
    /* @__PURE__ */ d(
      g,
      {
        id: "lumora-platform-label",
        sx: {
          mb: 1.5,
          fontFamily: e.bodyFont,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: e.label
        },
        children: "Where would you like to start?"
      }
    ),
    /* @__PURE__ */ R(
      g,
      {
        sx: {
          position: "relative",
          p: 1,
          borderRadius: "12px",
          backgroundColor: e.surface,
          boxShadow: s ? "none" : Mr,
          border: `1px solid ${s ? e.border : "transparent"}`,
          transition: I
        },
        children: [
          /* @__PURE__ */ d(
            g,
            {
              "aria-hidden": !0,
              sx: {
                position: "absolute",
                top: 8,
                bottom: 8,
                left: 8,
                // Three equal columns with two 4px gaps between them
                width: "calc((100% - 16px - 8px) / 3)",
                borderRadius: "8px",
                backgroundColor: c.uiColor,
                // Dark brand colours (Polymer) need an edge to stand out on a dark page
                boxShadow: s ? `inset 0 0 0 1px ${c.colorOnDark}` : "none",
                transform: `translateX(calc(${i.current} * (100% + 4px))) scale(${a >= 0 ? 1 : 0.92})`,
                opacity: a >= 0 ? 1 : 0,
                transition: `transform ${Pt}ms ${Te}, opacity 200ms ease, ${I}`
              }
            }
          ),
          /* @__PURE__ */ d(
            yr,
            {
              exclusive: !0,
              fullWidth: !0,
              value: t,
              disabled: r,
              "aria-labelledby": "lumora-platform-label",
              onChange: (f, u) => u && o(u),
              sx: { position: "relative", gap: 0.5 },
              children: de.map((f) => {
                const u = s ? f.colorOnDark : f.uiColor, p = n?.[f.id]?.logo;
                return /* @__PURE__ */ R(
                  br,
                  {
                    value: f.id,
                    disableRipple: !0,
                    sx: {
                      flex: 1,
                      gap: 0.75,
                      py: 1.25,
                      px: 1,
                      // Override the group's joined-button borders and radii
                      border: "none !important",
                      borderRadius: "8px !important",
                      m: "0 !important",
                      textTransform: "none",
                      // App names are set in the heading font (Montserrat)
                      fontFamily: e.headingFont,
                      // Montserrat runs wider than the body font
                      fontSize: 14,
                      fontWeight: 600,
                      color: u,
                      // Logo colours: brand on the card, white on the selected tab
                      "--mark-primary": u,
                      "--mark-secondary": s ? e.muted : "#3D4C5E",
                      "--mark-center": u,
                      "--mark-ring": e.surface,
                      // Hover tint stays quick; the text colour follows the highlight
                      transition: `background-color 150ms, ${ot("color")}`,
                      "& .MuiSvgIcon-root": { fontSize: 22 },
                      "&:hover": {
                        backgroundColor: `${u}14`
                      },
                      // The sliding highlight draws the selected background
                      "&.Mui-selected, &.Mui-selected:hover": {
                        backgroundColor: "transparent",
                        color: "#ffffff",
                        // Selected marks: white, with Centra's arcs kept slate and
                        // Xpdite's centre node a white ring around the tab colour
                        "--mark-primary": "#ffffff",
                        "--mark-secondary": "#3D4C5E",
                        "--mark-center": f.uiColor,
                        "--mark-ring": "#ffffff"
                      },
                      "&.Mui-focusVisible": {
                        outline: `2px solid ${u}`,
                        outlineOffset: 2
                      }
                    },
                    children: [
                      p ?? /* @__PURE__ */ d(cr, { platform: f.id }),
                      f.name
                    ]
                  },
                  f.id
                );
              })
            }
          )
        ]
      }
    )
  ] });
}, ve = ({
  width: e,
  height: t = 6
}) => /* @__PURE__ */ d(
  g,
  {
    sx: {
      width: e,
      height: t,
      borderRadius: 1,
      backgroundColor: "rgba(18, 51, 45, 0.09)"
    }
  }
), bn = ({
  title: e,
  barColor: t,
  screenshot: n,
  compact: r = !1,
  sx: o
}) => {
  const s = r ? 22 : 40, i = r ? 6 : 12;
  return n ? /* @__PURE__ */ d(
    g,
    {
      component: "img",
      src: n,
      alt: `${e} dashboard`,
      sx: [
        {
          display: "block",
          minWidth: 0,
          // Pinned to the top-left; the hero clips the right and bottom
          objectFit: "cover",
          objectPosition: "top left",
          // Follows the artwork's rounded corners, unlike box-shadow
          filter: "drop-shadow(0 24px 40px rgba(8, 28, 24, 0.22))"
        },
        ...Array.isArray(o) ? o : [o]
      ]
    }
  ) : /* @__PURE__ */ R(
    g,
    {
      sx: [
        {
          display: "flex",
          flexDirection: "column",
          borderRadius: r ? "8px" : "14px",
          overflow: "hidden",
          backgroundColor: "#ffffff",
          boxShadow: "0 24px 60px rgba(8, 28, 24, 0.22)"
        },
        ...Array.isArray(o) ? o : [o]
      ],
      children: [
        /* @__PURE__ */ d(
          g,
          {
            sx: {
              height: s,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: r ? "4px" : "8px",
              px: r ? 1 : 2,
              backgroundColor: t
            },
            children: [0, 1, 2].map((a) => /* @__PURE__ */ d(
              g,
              {
                sx: {
                  width: i,
                  height: i,
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.55)"
                }
              },
              a
            ))
          }
        ),
        /* @__PURE__ */ d(g, { sx: { flex: 1, minHeight: 0, position: "relative", backgroundColor: "#f7f9f9" }, children: /* @__PURE__ */ R(
          g,
          {
            "data-testid": "screenshot-placeholder",
            sx: { p: r ? 1.25 : 3.5, display: "flex", flexDirection: "column", gap: r ? 1 : 2 },
            children: [
              /* @__PURE__ */ R(g, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
                /* @__PURE__ */ d(
                  g,
                  {
                    sx: {
                      fontSize: r ? 9 : 18,
                      fontWeight: 600,
                      letterSpacing: r ? "0.18em" : 0,
                      textTransform: r ? "uppercase" : "none",
                      color: "#12332d"
                    },
                    children: e
                  }
                ),
                /* @__PURE__ */ d(
                  g,
                  {
                    sx: {
                      width: r ? 12 : 24,
                      height: r ? 12 : 24,
                      borderRadius: "50%",
                      backgroundColor: t,
                      opacity: 0.8
                    }
                  }
                )
              ] }),
              /* @__PURE__ */ d(ve, { width: "22%", height: r ? 4 : 6 }),
              /* @__PURE__ */ d(
                g,
                {
                  sx: {
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: r ? 0.75 : 2,
                    mt: r ? 0.5 : 1
                  },
                  children: Array.from({ length: 6 }).map((a, c) => /* @__PURE__ */ R(
                    g,
                    {
                      sx: {
                        p: r ? 0.75 : 2,
                        borderRadius: r ? "4px" : "10px",
                        backgroundColor: "#ffffff",
                        border: "1px solid rgba(18, 51, 45, 0.08)",
                        borderTop: `${r ? 2 : 3}px solid ${t}`,
                        display: "flex",
                        flexDirection: "column",
                        gap: r ? 0.5 : 1
                      },
                      children: [
                        /* @__PURE__ */ d(ve, { width: "70%", height: r ? 4 : 7 }),
                        /* @__PURE__ */ d(ve, { width: "45%", height: r ? 3 : 5 }),
                        /* @__PURE__ */ d(ve, { width: "85%", height: r ? 3 : 5 }),
                        /* @__PURE__ */ d(ve, { width: "60%", height: r ? 3 : 5 })
                      ]
                    },
                    c
                  ))
                }
              ),
              !r && /* @__PURE__ */ R(
                g,
                {
                  sx: {
                    alignSelf: "flex-start",
                    mt: 1,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 999,
                    border: "1px dashed rgba(18, 51, 45, 0.3)",
                    fontSize: 12,
                    color: "rgba(18, 51, 45, 0.6)"
                  },
                  children: [
                    e,
                    " screenshot placeholder"
                  ]
                }
              )
            ]
          }
        ) })
      ]
    }
  );
}, Ai = 200, wn = "clamp(1.25rem, 5.6vw, 1.6rem)", En = {
  m: 0,
  fontWeight: 600,
  fontSize: "clamp(2.25rem, 4vw, 4.25rem)",
  lineHeight: 1.08,
  letterSpacing: "-0.02em"
}, Sn = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.16em",
  textTransform: "uppercase"
}, xt = (e, t) => t?.[e.id]?.screenshot ?? e.screenshot, _i = "74.6%", Ci = {
  polymer: "28.1%",
  xpdite: "11.7%",
  centra: "-4.9%"
}, Rn = 2.177, ki = {
  polymer: { left: "40%", top: "8%", width: "56%" },
  xpdite: { left: "20%", top: "18%", width: "52%" },
  centra: { left: "0%", top: "30%", width: "56%" }
}, xn = ({
  theme: e,
  platform: t,
  platformAssets: n,
  compact: r = !1
}) => {
  const o = t ? Je(t) : null, s = de.every(
    (a) => n?.[a.id]?.overviewScreenshot
  ), i = r ? 2.25 : { md: 5, lg: 6 };
  return /* @__PURE__ */ d(
    g,
    {
      component: "aside",
      "aria-label": o ? `${o.name} overview` : "Lumora platforms overview",
      sx: {
        position: "relative",
        height: r ? Ai : "100%",
        borderRadius: r ? "16px" : "24px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: e.bodyFont,
        backgroundColor: o ? o.color : e.heroBg,
        // Grid lines: an overlay drawn in currentColor, so its colour fades with the theme
        // (a gradient's own colours cannot transition)
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          color: o ? "rgba(255, 255, 255, 0.06)" : e.heroGrid,
          backgroundImage: $r("currentColor"),
          backgroundSize: "32px 32px",
          transition: I
        },
        // Content above the grid
        "& > *": { position: "relative" },
        color: o ? "#ffffff" : e.heading,
        transition: I
      },
      children: o ? /* @__PURE__ */ R(Be.Fragment, { children: [
        /* @__PURE__ */ R(
          g,
          {
            sx: {
              px: i,
              pt: r ? 2.25 : { md: 7, lg: 9 }
            },
            children: [
              /* @__PURE__ */ R(
                g,
                {
                  sx: {
                    ...Sn,
                    // Platform label ("POLYMER • AI AGENT CONFIGURATION") in Montserrat
                    fontFamily: e.headingFont,
                    ...r && { fontSize: 10, gap: 1 },
                    animation: se(0)
                  },
                  children: [
                    /* @__PURE__ */ d(
                      g,
                      {
                        sx: {
                          width: 22,
                          height: "1px",
                          backgroundColor: "currentColor"
                        }
                      }
                    ),
                    o.name,
                    /* @__PURE__ */ d(
                      g,
                      {
                        component: "span",
                        "aria-hidden": !0,
                        sx: { fontSize: 14 },
                        children: "•"
                      }
                    ),
                    o.area
                  ]
                }
              ),
              /* @__PURE__ */ R(
                g,
                {
                  component: "h2",
                  sx: {
                    ...En,
                    // Laptops: wraps every platform's headline the way Polymer's does ("Build agents.
                    // Govern every" 13.3em fits; Centra 14.3em and Xpdite 15.2em break onto a second line).
                    // Wide screens (xl): no limit, so a headline stays on one line wherever it fits.
                    // In em, so the limit scales with the font.
                    maxWidth: { xs: "13.8em", xl: "none" },
                    ...r && {
                      fontSize: wn
                    },
                    mt: r ? 1 : 2.5,
                    fontFamily: e.headingFont,
                    animation: se(60)
                  },
                  children: [
                    o.headline,
                    " ",
                    /* @__PURE__ */ d(
                      g,
                      {
                        component: "span",
                        sx: { color: o.accent },
                        children: o.headlineAccent
                      }
                    )
                  ]
                }
              ),
              !r && /* @__PURE__ */ d(
                g,
                {
                  sx: {
                    mt: 2,
                    fontSize: 18,
                    lineHeight: 1.5,
                    opacity: 0.92,
                    maxWidth: 640,
                    animation: se(120)
                  },
                  children: o.description
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ d(
          g,
          {
            sx: {
              flex: 1,
              minHeight: r ? 0 : 240,
              mt: r ? 1.75 : { md: 5, lg: 6 },
              ml: i,
              mr: "-14px",
              mb: "-14px",
              display: "flex",
              flexDirection: "column",
              animation: `${Vr} 450ms ${Te} 120ms both`
            },
            children: /* @__PURE__ */ d(
              bn,
              {
                title: o.name,
                barColor: o.frameColor,
                screenshot: xt(o, n),
                sx: xt(o, n) ? {
                  // Scaled by width only, so a tall hero adds space above it
                  // instead of zooming it; sits on the bottom edge and is cut
                  // there when the hero is short
                  width: "100%",
                  height: "auto",
                  flexShrink: 0,
                  mt: "auto"
                } : (
                  // The placeholder window fills the space
                  { flex: 1 }
                )
              }
            )
          }
        )
      ] }, o.id) : /* @__PURE__ */ R(Be.Fragment, { children: [
        /* @__PURE__ */ R(
          g,
          {
            sx: {
              px: i,
              pt: r ? 2.25 : { md: 5, lg: 6 }
            },
            children: [
              /* @__PURE__ */ R(
                g,
                {
                  sx: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    animation: se(0)
                  },
                  children: [
                    /* @__PURE__ */ R(
                      g,
                      {
                        sx: {
                          ...Sn,
                          fontFamily: e.bodyFont,
                          fontSize: 16,
                          fontWeight: 600,
                          // The phone banner keeps a small label so the headline fits
                          ...r && { fontSize: 10, gap: 1 },
                          color: e.eyebrow,
                          transition: I
                        },
                        children: [
                          /* @__PURE__ */ d(
                            g,
                            {
                              sx: {
                                width: 12,
                                height: "1px",
                                backgroundColor: "currentColor"
                              }
                            }
                          ),
                          "A Lumora Capital ecosystem"
                        ]
                      }
                    ),
                    !r && /* @__PURE__ */ R(
                      g,
                      {
                        sx: {
                          flexShrink: 0,
                          px: 1.5,
                          py: 0.75,
                          borderRadius: 999,
                          // Outlined pill on the hero: no fill, slate border, Lumora green text
                          border: "1px solid #546881",
                          backgroundColor: "transparent",
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: e.brandText
                        },
                        children: [
                          de.length,
                          " platforms · 1 account"
                        ]
                      }
                    )
                  ]
                }
              ),
              !r && /* @__PURE__ */ d(
                g,
                {
                  sx: {
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    mt: { md: 5, lg: 7 },
                    animation: se(60)
                  },
                  children: de.map((a) => /* @__PURE__ */ R(
                    g,
                    {
                      sx: {
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        px: 1.75,
                        py: 0.75,
                        borderRadius: 999,
                        backgroundColor: a.uiColor,
                        color: "#ffffff",
                        // Logos as on a selected tab: white, Centra's arcs slate
                        "--mark-primary": "#ffffff",
                        "--mark-secondary": "#3D4C5E",
                        "--mark-center": a.uiColor,
                        "--mark-ring": "#ffffff",
                        // App names are set in the heading font (Montserrat)
                        fontFamily: e.headingFont,
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        "& .MuiSvgIcon-root": {
                          fontSize: 16
                        }
                      },
                      children: [
                        n?.[a.id]?.logo ?? /* @__PURE__ */ d(cr, { platform: a.id }),
                        a.name
                      ]
                    },
                    a.id
                  ))
                }
              ),
              /* @__PURE__ */ R(
                g,
                {
                  component: "h2",
                  sx: {
                    ...En,
                    ...r && {
                      fontSize: wn
                    },
                    mt: r ? 1 : 2,
                    fontFamily: e.headingFont,
                    color: e.heroHeadline,
                    transition: I,
                    animation: se(120)
                  },
                  children: [
                    "One sign-in.",
                    " ",
                    /* @__PURE__ */ d(
                      g,
                      {
                        component: "span",
                        sx: {
                          color: e.heroHeadlineAccent,
                          transition: I
                        },
                        children: "Every platform."
                      }
                    )
                  ]
                }
              ),
              !r && /* @__PURE__ */ d(
                g,
                {
                  sx: {
                    mt: 2,
                    fontFamily: e.bodyFont,
                    fontSize: 18,
                    fontWeight: 500,
                    lineHeight: 1.55,
                    color: e.heroText,
                    maxWidth: 540,
                    animation: se(180)
                  },
                  children: "Centra runs the deals. Polymer builds the agents. Xpdite trains them. One Lumora account opens all three."
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ d(
          g,
          {
            sx: {
              position: "relative",
              flex: 1,
              minHeight: r ? 0 : 220,
              mt: r ? 1.5 : 0,
              mx: i,
              // Lets the overview scene size itself to this box (cqw / cqh units)
              containerType: "size"
            },
            children: s ? /* @__PURE__ */ d(
              g,
              {
                sx: {
                  position: "absolute",
                  left: 0,
                  right: 0,
                  mx: "auto",
                  aspectRatio: String(Rn),
                  // Desktop: the whole stack fits, bottoms on the hero's edge.
                  // Phone banner: full width from the top, bottoms clipped.
                  ...r ? { top: 0, width: "100cqw" } : {
                    bottom: 0,
                    width: `min(100cqw, ${Rn * 100}cqh)`
                  }
                },
                children: [
                  "polymer",
                  "xpdite",
                  "centra"
                ].map((a, c) => /* @__PURE__ */ d(
                  g,
                  {
                    component: "img",
                    src: n?.[a]?.overviewScreenshot,
                    alt: `${Je(a).name} dashboard`,
                    sx: {
                      position: "absolute",
                      bottom: 0,
                      left: Ci[a],
                      width: _i,
                      display: "block",
                      // Back window first, front window last
                      animation: `${Wt} 500ms ${Te} ${200 + c * 60}ms both`
                    }
                  },
                  a
                ))
              }
            ) : ["polymer", "xpdite", "centra"].map((a, c) => {
              const f = Je(a);
              return /* @__PURE__ */ d(
                bn,
                {
                  compact: !0,
                  title: f.name,
                  barColor: f.frameColor,
                  screenshot: xt(
                    f,
                    n
                  ),
                  sx: {
                    position: "absolute",
                    ...ki[a],
                    // Run past the bottom edge, where the hero clips them
                    bottom: "-24px",
                    // Back window first, front window last
                    animation: `${Wt} 500ms ${Te} ${200 + c * 60}ms both`
                  }
                },
                a
              );
            })
          }
        )
      ] }, "ecosystem")
    }
  );
}, Pi = ({ theme: e, title: t, steps: n }) => /* @__PURE__ */ R(
  g,
  {
    component: "section",
    "aria-labelledby": "lumora-first-time-title",
    sx: {
      px: 2.5,
      py: 2,
      [be]: { py: 1.25 },
      borderRadius: "12px",
      border: `1px solid ${e.border}`,
      backgroundColor: e.surface,
      transition: I,
      "& *": { transition: I }
    },
    children: [
      /* @__PURE__ */ d(
        g,
        {
          component: "h2",
          id: "lumora-first-time-title",
          sx: {
            m: 0,
            fontFamily: e.bodyFont,
            fontSize: 18,
            fontWeight: 600,
            color: e.heading
          },
          children: t
        }
      ),
      /* @__PURE__ */ d(
        g,
        {
          component: "ol",
          sx: {
            m: 0,
            mt: 1.25,
            p: 0,
            listStyle: "none",
            display: "grid",
            gap: 1,
            [be]: { mt: 1, gap: 0.75 }
          },
          children: n.map((r, o) => /* @__PURE__ */ R(
            g,
            {
              component: "li",
              sx: { display: "flex", alignItems: "center", gap: 1.5, fontSize: 14.5, color: e.label },
              children: [
                /* @__PURE__ */ d(
                  g,
                  {
                    "aria-hidden": !0,
                    sx: {
                      flexShrink: 0,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      border: `1px solid ${e.divider}`,
                      display: "grid",
                      placeItems: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      color: e.brandText
                    },
                    children: o + 1
                  }
                ),
                r
              ]
            },
            r
          ))
        }
      )
    ]
  }
), On = ({ brandConfig: e, theme: t }) => /* @__PURE__ */ R(
  g,
  {
    component: "footer",
    sx: {
      display: "grid",
      gap: 1,
      [be]: { gap: 0.5 },
      fontSize: 13,
      lineHeight: 1.5,
      color: t.label,
      transition: I,
      // Centred on phones, where the panel is the whole page; left-aligned beside the hero
      textAlign: { xs: "center", md: "left" },
      justifyItems: { xs: "center", md: "start" }
    },
    children: [
      e.securityNote && /* @__PURE__ */ R(
        g,
        {
          sx: {
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "center", md: "flex-start" },
            gap: 0.75
          },
          children: [
            /* @__PURE__ */ d(Rr, { sx: { fontSize: 14 } }),
            e.securityNote
          ]
        }
      ),
      e.supportLabel && /* @__PURE__ */ R(g, { children: [
        "Need access?",
        " ",
        e.supportUrl ? /* @__PURE__ */ d(
          $t,
          {
            href: e.supportUrl,
            sx: {
              color: t.brandText,
              textDecorationColor: "currentColor"
            },
            children: e.supportLabel
          }
        ) : /* @__PURE__ */ d(g, { component: "span", sx: { color: t.brandText }, children: e.supportLabel })
      ] }),
      (e.copyright || e.copyrightHolder) && /* @__PURE__ */ R(g, { children: [
        e.copyright,
        e.copyright && e.copyrightHolder && " ",
        e.copyrightHolder && e.copyrightUrl ? (
          // Only the holder is linked; opens in a new tab so the sign-in page stays open
          /* @__PURE__ */ d(
            $t,
            {
              href: e.copyrightUrl,
              target: "_blank",
              rel: "noopener noreferrer",
              underline: "hover",
              sx: { color: "inherit" },
              children: e.copyrightHolder
            }
          )
        ) : e.copyrightHolder
      ] })
    ]
  }
), oa = ({
  authConfig: e,
  onLoginSuccess: t,
  onLoginError: n,
  enableRecaptcha: r = !1,
  recaptchaSiteKey: o,
  enableGoogleSignIn: s = !0,
  enableMicrosoftSignIn: i = !1,
  enableMagicLinkSignIn: a = !1,
  enablePasskeySignIn: c = !1,
  showErrors: f = !0,
  defaultPlatform: u,
  onPlatformChange: p,
  platformAssets: y,
  defaultColorMode: x,
  onColorModeChange: S,
  branding: C
}) => {
  const [_, h] = Y("idle"), [b, E] = Y(null), [O, F] = Y(!1), [P, N] = Y(
    () => u ?? Ot.get() ?? Hr
  );
  me(() => {
    Ot.set(P);
  }, [P]);
  const { colorMode: V, toggleColorMode: Z } = Gr(
    x,
    S
  ), U = vr(C), T = jr(U, V, P), he = () => `${window.location.origin}/callback`;
  if (me(() => {
    F($e());
  }, []), me(() => {
    try {
      Q(e.apiBaseUrl, e.apiKey);
    } catch (w) {
      console.error("Failed to initialize API client:", w);
    }
  }, [e.apiBaseUrl, e.apiKey]), !s && !i && !a && !c)
    throw new Error(
      "At least one sign-in method must be enabled (enableGoogleSignIn, enableMicrosoftSignIn, enableMagicLinkSignIn or enablePasskeySignIn)"
    );
  if (r && !o)
    throw new Error(
      "recaptchaSiteKey is required when enableRecaptcha is true"
    );
  const Ce = () => window.grecaptcha.execute(o, { action: "login" }).catch(() => {
    throw new Error("reCAPTCHA verification failed");
  }), q = async () => {
    if (!r || !o)
      return "";
    if (typeof window > "u" || !window.grecaptcha)
      throw new Error("reCAPTCHA is not loaded");
    return new Promise((w, k) => {
      const z = () => {
        Ce().then(w).catch(k);
      };
      window.grecaptcha.ready(z);
    });
  }, Re = async (w, k) => {
    te.setTokens(w.accessToken, w.refreshToken);
    const z = k ?? await ie.getCurrentUser();
    h("success"), t({ user: z, tokens: w, platform: P });
  }, lt = (w) => {
    N(w), p?.(w);
  }, ae = (w) => {
    try {
      h(`${w}-loading`), E(null);
      const k = w === "google" ? v.ENDPOINTS.GOOGLE_AUTH : v.ENDPOINTS.MICROSOFT_AUTH;
      setTimeout(() => {
        ie.initiateOAuth(
          k,
          he(),
          e.apiBaseUrl
        );
      }, 300);
    } catch (k) {
      const z = k;
      E({ message: z.message, type: w }), h("error"), n(z);
    }
  }, ke = async () => {
    h("passkey-loading"), E(null);
    try {
      const { tokens: w, user: k } = await ie.loginWithPasskey();
      await Re(w, k);
    } catch (w) {
      const k = w;
      E({ message: k.message, type: "passkey" }), h("error"), n(k);
    }
  }, ct = async (w) => {
    h("magic-link-loading"), E(null);
    try {
      r && await q(), await ie.requestMagicLink(w.email, he()), h("magic-link-success");
    } catch (k) {
      const z = k;
      E({ message: z.message, type: "magic-link" }), h("error"), n(z);
    }
  }, Pe = () => {
    E(null), h("idle");
  };
  me(() => {
    if (r && o && typeof window < "u") {
      const w = document.createElement("script");
      w.src = `https://www.google.com/recaptcha/enterprise.js?render=${o}`, w.async = !0, w.defer = !0, document.head.appendChild(w);
    }
  }, [r, o]);
  const G = c && O, L = Yr(_), X = s || i, le = a || G, ce = /* @__PURE__ */ d(
    xn,
    {
      theme: T,
      platform: P,
      platformAssets: y
    }
  ), Ne = /* @__PURE__ */ d(
    xn,
    {
      theme: T,
      platform: P,
      platformAssets: y,
      compact: !0
    }
  );
  return _ === "magic-link-success" ? /* @__PURE__ */ R(
    gn,
    {
      theme: T,
      hero: ce,
      mobileHero: Ne,
      footer: /* @__PURE__ */ d(On, { brandConfig: U, theme: T }),
      children: [
        /* @__PURE__ */ d(
          hn,
          {
            brandConfig: U,
            theme: T,
            showWelcome: !1,
            onToggleColorMode: Z
          }
        ),
        /* @__PURE__ */ d(g, { sx: { pt: 6 }, children: /* @__PURE__ */ d(
          Ei,
          {
            theme: T,
            title: U.magicLinkSuccessTitle || "Check your inbox",
            description: U.magicLinkSuccessDescription || "If this email address belongs to an active account, we have sent it a sign-in link.",
            onBackToLogin: Pe
          }
        ) })
      ]
    }
  ) : /* @__PURE__ */ R(
    gn,
    {
      theme: T,
      hero: ce,
      mobileHero: Ne,
      footer: /* @__PURE__ */ d(On, { brandConfig: U, theme: T }),
      children: [
        /* @__PURE__ */ d(
          hn,
          {
            brandConfig: U,
            theme: T,
            onToggleColorMode: Z
          }
        ),
        /* @__PURE__ */ d(
          Ti,
          {
            theme: T,
            value: P,
            platformAssets: y,
            disabled: L,
            onChange: lt
          }
        ),
        f && b && /* @__PURE__ */ d(
          wr,
          {
            severity: "error",
            onClose: () => E(null),
            sx: {
              borderRadius: "10px",
              border: `1px solid ${T.errorBorder}`,
              backgroundColor: T.errorBg,
              color: T.errorText,
              fontFamily: T.bodyFont,
              fontSize: 15,
              transition: I,
              "& .MuiAlert-icon": { color: T.errorIcon },
              "& .MuiAlert-action .MuiIconButton-root": {
                color: T.errorText
              }
            },
            children: b.message
          }
        ),
        X && /* @__PURE__ */ R(
          g,
          {
            sx: {
              display: "grid",
              gridTemplateColumns: s && i ? "1fr 1fr" : "1fr",
              gap: 1.5
            },
            children: [
              s && /* @__PURE__ */ d(
                pn,
                {
                  theme: T,
                  icon: /* @__PURE__ */ d(xr, {}),
                  label: "Google",
                  ariaLabel: "Continue with Google",
                  isLoading: _ === "google-loading",
                  disabled: L,
                  onClick: () => ae("google")
                }
              ),
              i && /* @__PURE__ */ d(
                pn,
                {
                  theme: T,
                  icon: /* @__PURE__ */ d(gi, { monochrome: !0 }),
                  label: "Microsoft",
                  ariaLabel: "Continue with Microsoft",
                  isLoading: _ === "microsoft-loading",
                  disabled: L,
                  onClick: () => ae("microsoft")
                }
              )
            ]
          }
        ),
        X && le && /* @__PURE__ */ d(
          Er,
          {
            sx: {
              fontFamily: T.bodyFont,
              fontSize: 16,
              color: T.label,
              transition: I,
              "&::before, &::after": {
                borderColor: T.divider,
                transition: I
              }
            },
            children: "or use your work email"
          }
        ),
        a && /* @__PURE__ */ d(
          wi,
          {
            theme: T,
            isSubmitting: _ === "magic-link-loading",
            disabled: L,
            onSubmit: ct
          }
        ),
        G && /* @__PURE__ */ d(
          He,
          {
            fullWidth: !0,
            variant: "outlined",
            onClick: ke,
            disabled: L,
            startIcon: _ === "passkey-loading" ? /* @__PURE__ */ d(Ct, { size: 16, color: "inherit" }) : void 0,
            sx: {
              height: 52,
              borderRadius: "10px",
              borderWidth: 1.5,
              borderColor: T.accent,
              backgroundColor: T.surface,
              color: T.accent,
              fontFamily: T.headingFont,
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: "0.14em",
              transition: I,
              "&:hover": {
                borderWidth: 1.5,
                borderColor: T.accentHover,
                backgroundColor: `${T.accent}0f`
              },
              "&.Mui-disabled": {
                borderWidth: 1.5,
                borderColor: T.border,
                color: T.muted
              },
              ...tt(T)
            },
            children: _ === "passkey-loading" ? "Waiting for passkey..." : "Sign in with passkey"
          }
        ),
        f && _ === "error" && /* @__PURE__ */ d(
          He,
          {
            variant: "text",
            onClick: Pe,
            sx: {
              alignSelf: "center",
              mt: -1.5,
              color: T.accent,
              fontFamily: T.headingFont,
              textTransform: "none",
              fontWeight: 600,
              ...tt(T)
            },
            children: "Try Again"
          }
        ),
        U.firstTimeSteps && U.firstTimeSteps.length > 0 && /* @__PURE__ */ d(
          Pi,
          {
            theme: T,
            title: U.firstTimeTitle || "First time here?",
            steps: U.firstTimeSteps
          }
        )
      ]
    }
  );
}, sa = (e) => {
  const [t, n] = Y(!0), [r, o] = Y(null), s = Tn(!1);
  return me(() => {
    if (s.current)
      return;
    s.current = !0, (async () => {
      try {
        e?.apiBaseUrl && Q(e.apiBaseUrl, e.apiKey);
        const a = new URLSearchParams(window.location.search);
        let c = a.get("access_token") || a.get("accessToken"), f = a.get("refresh_token") || a.get("refreshToken");
        const u = a.get("magic_token"), p = a.get("user"), y = a.get("error"), x = a.get("message");
        if (y) {
          const _ = decodeURIComponent(x || y);
          throw new Error(_);
        }
        if (u) {
          const _ = await ie.verifyMagicLink(u);
          c = _.accessToken, f = _.refreshToken;
        }
        if (!c || !f)
          throw new Error("Missing authentication tokens in callback URL");
        te.setTokens(c, f);
        let S;
        if (p)
          try {
            const _ = decodeURIComponent(p);
            S = JSON.parse(_);
          } catch (_) {
            console.warn("Failed to parse user from URL, fetching from API:", _), S = await ie.getCurrentUser();
          }
        else
          S = await ie.getCurrentUser();
        e?.onSuccess?.({ accessToken: c, refreshToken: f }, S, Ot.get());
        const C = e?.redirectPath || "/dashboard";
        window.history.replaceState({}, document.title, C), n(!1);
      } catch (a) {
        const c = a;
        o(c), e?.onError?.(c), n(!1);
      }
    })();
  }, [e?.redirectPath]), { loading: t, error: r };
}, ia = (e) => ({ logout: hr(async () => {
  const n = te.getRefreshToken();
  if (e?.apiBaseUrl && n)
    try {
      await ie.logout(n);
    } catch (r) {
      console.error("Logout API call failed:", r);
    }
  te.clearTokens(), window.location.href = "/login";
}, [e?.apiBaseUrl]) }), aa = (e) => {
  const [t, n] = Y(!1), [r, o] = Y(null), [s, i] = Y(!1);
  return me(() => {
    i($e());
  }, []), { registerPasskey: async (c) => {
    n(!0), o(null);
    try {
      return e?.apiBaseUrl && Q(e.apiBaseUrl, e.apiKey), await ie.registerPasskey(c);
    } catch (f) {
      return o(f), null;
    } finally {
      n(!1);
    }
  }, loading: t, error: r, isSupported: s };
};
export {
  mt as ColorModeStorage,
  oa as LumoraLogin,
  de as PLATFORMS,
  Ot as PlatformStorage,
  te as TokenStorage,
  vr as getBrandingConfig,
  Ur as getDefaultBranding,
  sa as useAuthCallback,
  ia as useLogout,
  aa as usePasskeyRegistration
};
