import { jsxs as F, jsx as m, Fragment as Un } from "react/jsx-runtime";
import * as J from "react";
import Lt, { useState as Re, useEffect as Fe, useId as Es, useMemo as ws, useRef as hn, useLayoutEffect as xs, useCallback as Ts } from "react";
import { SvgIcon as St, Box as A, Tooltip as Cs, IconButton as Os, Button as Ft, CircularProgress as mn, InputBase as Rs, ToggleButtonGroup as _s, ToggleButton as As, Link as jn, Alert as vs, Divider as ks, Skeleton as Ps } from "@mui/material";
import { MarkEmailReadOutlined as Ns, LockOutlined as Is, Google as $s } from "@mui/icons-material";
import { keyframes as gn, Global as Ds, ThemeContext as si } from "@emotion/react";
import { appendErrors as Ls, useForm as Ms } from "react-hook-form";
import { validateFieldsNatively as Fs, toNestErrors as Bs } from "@hookform/resolvers";
import * as Hn from "yup";
import "@emotion/styled";
function We(e) {
  const t = new Uint8Array(e);
  let r = "";
  for (const o of t)
    r += String.fromCharCode(o);
  return btoa(r).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function pr(e) {
  const t = e.replace(/-/g, "+").replace(/_/g, "/"), r = (4 - t.length % 4) % 4, n = t.padEnd(t.length + r, "="), o = atob(n), i = new ArrayBuffer(o.length), s = new Uint8Array(i);
  for (let a = 0; a < o.length; a++)
    s[a] = o.charCodeAt(a);
  return i;
}
function Vt() {
  return Us.stubThis(globalThis?.PublicKeyCredential !== void 0 && typeof globalThis.PublicKeyCredential == "function");
}
const Us = {
  stubThis: (e) => e
};
function ai(e) {
  const { id: t } = e;
  return {
    ...e,
    id: pr(t),
    transports: e.transports,
    type: e.type
  };
}
function ci(e) {
  return (
    // Consider localhost valid as well since it's okay wrt Secure Contexts
    e === "localhost" || // Support punycode (ACE) or ascii labels and domains
    /^((xn--[a-z0-9-]+|[a-z0-9]+(-[a-z0-9]+)*)\.)+([a-z]{2,}|xn--[a-z0-9-]+)$/i.test(e)
  );
}
class xe extends Error {
  constructor({ message: t, code: r, cause: n, name: o }) {
    super(t, { cause: n }), Object.defineProperty(this, "code", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: void 0
    }), this.name = o ?? n.name, this.code = r;
  }
}
function js({ error: e, options: t }) {
  const { publicKey: r } = t;
  if (!r)
    throw Error("options was missing required publicKey property");
  if (e.name === "AbortError") {
    if (t.signal instanceof AbortSignal)
      return new xe({
        message: "Registration ceremony was sent an abort signal",
        code: "ERROR_CEREMONY_ABORTED",
        cause: e
      });
  } else if (e.name === "ConstraintError") {
    if (r.authenticatorSelection?.requireResidentKey === !0)
      return new xe({
        message: "Discoverable credentials were required but no available authenticator supported it",
        code: "ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT",
        cause: e
      });
    if (
      // @ts-ignore: `mediation` doesn't yet exist on CredentialCreationOptions but it's possible as of Sept 2024
      t.mediation === "conditional" && r.authenticatorSelection?.userVerification === "required"
    )
      return new xe({
        message: "User verification was required during automatic registration but it could not be performed",
        code: "ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE",
        cause: e
      });
    if (r.authenticatorSelection?.userVerification === "required")
      return new xe({
        message: "User verification was required but no available authenticator supported it",
        code: "ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT",
        cause: e
      });
  } else {
    if (e.name === "InvalidStateError")
      return new xe({
        message: "The authenticator was previously registered",
        code: "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED",
        cause: e
      });
    if (e.name === "NotAllowedError")
      return new xe({
        message: e.message,
        code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
        cause: e
      });
    if (e.name === "NotSupportedError")
      return r.pubKeyCredParams.filter((o) => o.type === "public-key").length === 0 ? new xe({
        message: 'No entry in pubKeyCredParams was of type "public-key"',
        code: "ERROR_MALFORMED_PUBKEYCREDPARAMS",
        cause: e
      }) : new xe({
        message: "No available authenticator supported any of the specified pubKeyCredParams algorithms",
        code: "ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG",
        cause: e
      });
    if (e.name === "SecurityError") {
      const n = globalThis.location.hostname;
      if (ci(n)) {
        if (r.rp.id !== n)
          return new xe({
            message: `The RP ID "${r.rp.id}" is invalid for this domain`,
            code: "ERROR_INVALID_RP_ID",
            cause: e
          });
      } else return new xe({
        message: `${globalThis.location.hostname} is an invalid domain`,
        code: "ERROR_INVALID_DOMAIN",
        cause: e
      });
    } else if (e.name === "TypeError") {
      if (r.user.id.byteLength < 1 || r.user.id.byteLength > 64)
        return new xe({
          message: "User ID was not between 1 and 64 characters",
          code: "ERROR_INVALID_USER_ID_LENGTH",
          cause: e
        });
    } else if (e.name === "UnknownError")
      return new xe({
        message: "The authenticator was unable to process the specified options, or could not create a new credential",
        code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
        cause: e
      });
  }
  return e;
}
class Hs {
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
const li = new Hs(), Vs = ["cross-platform", "platform"];
function ui(e) {
  if (e && !(Vs.indexOf(e) < 0))
    return e;
}
async function Ws(e) {
  !e.optionsJSON && e.challenge && (console.warn("startRegistration() was not called correctly. It will try to continue with the provided options, but this call should be refactored to use the expected call structure instead. See https://simplewebauthn.dev/docs/packages/browser#typeerror-cannot-read-properties-of-undefined-reading-challenge for more information."), e = { optionsJSON: e });
  const { optionsJSON: t, useAutoRegister: r = !1 } = e;
  if (!Vt())
    throw new Error("WebAuthn is not supported in this browser");
  const n = {
    ...t,
    challenge: pr(t.challenge),
    user: {
      ...t.user,
      id: pr(t.user.id)
    },
    excludeCredentials: t.excludeCredentials?.map(ai)
  }, o = {};
  r && (o.mediation = "conditional"), o.publicKey = n, o.signal = li.createNewAbortSignal();
  let i;
  try {
    i = await navigator.credentials.create(
      // TODO: Newer versions of Deno require this casting, revisit once we're using Deno 2.6+
      o
    );
  } catch (b) {
    throw js({ error: b, options: o });
  }
  if (!i)
    throw new Error("Registration was not completed");
  const { id: s, rawId: a, response: c, type: u } = i;
  let d;
  typeof c.getTransports == "function" && (d = c.getTransports());
  let f;
  if (typeof c.getPublicKeyAlgorithm == "function")
    try {
      f = c.getPublicKeyAlgorithm();
    } catch (b) {
      Br("getPublicKeyAlgorithm()", b);
    }
  let g;
  if (typeof c.getPublicKey == "function")
    try {
      const b = c.getPublicKey();
      b !== null && (g = We(b));
    } catch (b) {
      Br("getPublicKey()", b);
    }
  let S;
  if (typeof c.getAuthenticatorData == "function")
    try {
      S = We(c.getAuthenticatorData());
    } catch (b) {
      Br("getAuthenticatorData()", b);
    }
  return {
    id: s,
    rawId: We(a),
    response: {
      attestationObject: We(c.attestationObject),
      clientDataJSON: We(c.clientDataJSON),
      transports: d,
      publicKeyAlgorithm: f,
      publicKey: g,
      authenticatorData: S
    },
    type: u,
    clientExtensionResults: i.getClientExtensionResults(),
    authenticatorAttachment: ui(i.authenticatorAttachment)
  };
}
function Br(e, t) {
  console.warn(`The browser extension that intercepted this WebAuthn API call incorrectly implemented ${e}. You should report this error to them.
`, t);
}
function zs() {
  if (!Vt())
    return Ur.stubThis(new Promise((t) => t(!1)));
  const e = globalThis.PublicKeyCredential;
  return e?.isConditionalMediationAvailable === void 0 ? Ur.stubThis(new Promise((t) => t(!1))) : Ur.stubThis(e.isConditionalMediationAvailable());
}
const Ur = {
  stubThis: (e) => e
};
function qs({ error: e, options: t }) {
  const { publicKey: r } = t;
  if (!r)
    throw Error("options was missing required publicKey property");
  if (e.name === "AbortError") {
    if (t.signal instanceof AbortSignal)
      return new xe({
        message: "Authentication ceremony was sent an abort signal",
        code: "ERROR_CEREMONY_ABORTED",
        cause: e
      });
  } else {
    if (e.name === "NotAllowedError")
      return new xe({
        message: e.message,
        code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
        cause: e
      });
    if (e.name === "SecurityError") {
      const n = globalThis.location.hostname;
      if (ci(n)) {
        if (r.rpId !== n)
          return new xe({
            message: `The RP ID "${r.rpId}" is invalid for this domain`,
            code: "ERROR_INVALID_RP_ID",
            cause: e
          });
      } else return new xe({
        message: `${globalThis.location.hostname} is an invalid domain`,
        code: "ERROR_INVALID_DOMAIN",
        cause: e
      });
    } else if (e.name === "UnknownError")
      return new xe({
        message: "The authenticator was unable to process the specified options, or could not create a new assertion signature",
        code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
        cause: e
      });
  }
  return e;
}
async function Ks(e) {
  !e.optionsJSON && e.challenge && (console.warn("startAuthentication() was not called correctly. It will try to continue with the provided options, but this call should be refactored to use the expected call structure instead. See https://simplewebauthn.dev/docs/packages/browser#typeerror-cannot-read-properties-of-undefined-reading-challenge for more information."), e = { optionsJSON: e });
  const { optionsJSON: t, useBrowserAutofill: r = !1, verifyBrowserAutofillInput: n = !0 } = e;
  if (!Vt())
    throw new Error("WebAuthn is not supported in this browser");
  let o;
  t.allowCredentials?.length !== 0 && (o = t.allowCredentials?.map(ai));
  const i = {
    ...t,
    challenge: pr(t.challenge),
    allowCredentials: o
  }, s = {};
  if (r) {
    if (!await zs())
      throw Error("Browser does not support WebAuthn autofill");
    if (document.querySelectorAll("input[autocomplete$='webauthn']").length < 1 && n)
      throw Error('No <input> with "webauthn" as the only or last value in its `autocomplete` attribute was detected');
    s.mediation = "conditional", i.allowCredentials = [];
  }
  s.publicKey = i, s.signal = li.createNewAbortSignal();
  let a;
  try {
    a = await navigator.credentials.get(
      // TODO: Newer versions of Deno require this casting, revisit once we're using Deno 2.6+
      s
    );
  } catch (S) {
    throw qs({ error: S, options: s });
  }
  if (!a)
    throw new Error("Authentication was not completed");
  const { id: c, rawId: u, response: d, type: f } = a;
  let g;
  return d.userHandle && (g = We(d.userHandle)), {
    id: c,
    rawId: We(u),
    response: {
      authenticatorData: We(d.authenticatorData),
      clientDataJSON: We(d.clientDataJSON),
      signature: We(d.signature),
      userHandle: g
    },
    type: f,
    clientExtensionResults: a.getClientExtensionResults(),
    authenticatorAttachment: ui(a.authenticatorAttachment)
  };
}
const Gs = () => ({
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
}), di = (e) => ({
  ...Gs(),
  ...e
}), Ys = {
  pageBg: "#0e1d1a",
  surface: "#152824",
  border: "#28403a",
  heading: "#e9f1ef",
  text: "#c2d0cc",
  muted: "#8ea29d",
  heroBg: "#12231f"
}, Be = [
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
    },
    loadScreenshot: () => import("./centra-DbISH5uv.js").then((e) => e.default)
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
    },
    loadScreenshot: () => import("./xpdite-BULBoZZ-.js").then((e) => e.default)
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
    },
    loadScreenshot: () => import("./polymer-gl7Z7z7W.js").then((e) => e.default)
  }
], Wt = "centra", Et = (e) => Be.find((t) => t.id === e), sr = "lumora_platform", hr = {
  /**
   * Get the stored platform
   * @returns The platform id or null when none was chosen
   */
  get: () => {
    try {
      const e = localStorage.getItem(sr);
      return Be.some((t) => t.id === e) ? e : null;
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
      e ? localStorage.setItem(sr, e) : localStorage.removeItem(sr);
    } catch {
    }
  }
}, Ue = "@media (max-height: 920px)", lt = {
  height: 50,
  [Ue]: { height: 46 }
}, Js = "0 1px 2px rgba(18, 51, 45, 0.06), 0 8px 24px rgba(18, 51, 45, 0.06)", yn = (e, t, r) => {
  const n = t === "dark", o = r ? Et(r) : null, i = o ? n ? o.colorOnDark : o.uiColor : e.primaryColor, s = o ? o.dark : Ys;
  return {
    mode: t,
    pageBg: n ? s.pageBg : e.backgroundColor,
    surface: n ? s.surface : "#ffffff",
    border: n ? s.border : "#d8e1e2",
    heading: n ? s.heading : e.textColor,
    // The branding colours are near-black greens, so dark mode uses the light heading and a mint
    welcomeTitle: n ? s.heading : e.welcomeTitleColor,
    // Dark mode matches the logo's brighter teal
    welcomeAccent: n ? "#0aa898" : e.welcomeTitleAccentColor,
    text: n ? s.text : "#3b4d49",
    tagline: n ? s.text : "#555555",
    label: n ? s.text : "#555555",
    placeholder: n ? s.muted : "#767676",
    divider: n ? s.border : "#c8cccf",
    // Lumora green; its mint version in dark mode, where #03463f would not show
    brandText: n ? "#45b39d" : "#03463f",
    // #41746e is too dim on the dark hero (3:1), so dark mode lifts it to a lighter teal
    eyebrow: n ? "#6fa59c" : "#41746e",
    // Brand teal; a brighter teal in dark mode so the small "CAPITAL" line stays legible
    logo: n ? "#0aa898" : "#049586",
    // MUI's default alert is a light pink block, which clashes with the dark page
    errorBg: n ? "rgba(209, 67, 67, 0.14)" : "#fdeeee",
    errorBorder: n ? "rgba(239, 107, 107, 0.35)" : "#f3c4c4",
    errorText: n ? "#f3b9b9" : "#8a1f1f",
    errorIcon: n ? "#ef6b6b" : "#d14343",
    heroText: n ? s.text : "#464646",
    // #02453e would vanish on the dark hero; #05a393 reads on both
    heroHeadline: n ? s.heading : "#02453e",
    heroHeadlineAccent: "#05a393",
    muted: n ? s.muted : "#5d6e6a",
    heroBg: n ? s.heroBg : "#f6f7f4",
    heroGrid: n ? "rgba(255, 255, 255, 0.05)" : "rgba(18, 51, 45, 0.06)",
    accent: i,
    // Hover darkens the accent slightly
    accentHover: o ? `color-mix(in srgb, ${i} 85%, #000)` : e.secondaryColor,
    // Dark mode's bright accents fail with white text (about 3:1); dark text passes (5:1+)
    buttonText: n ? "#04201c" : e.buttonTextColor,
    headingFont: e.headingFontFamily,
    bodyFont: e.bodyFontFamily
  };
}, mr = (e) => ({
  "&.Mui-focusVisible": {
    outline: `2px solid ${e.accent}`,
    outlineOffset: 2
  }
}), fi = (e) => `linear-gradient(${e} 1px, transparent 1px), linear-gradient(90deg, ${e} 1px, transparent 1px)`, wt = "cubic-bezier(0.2, 0.7, 0.2, 1)", bn = 350, Xs = "cubic-bezier(0.4, 0, 0.2, 1)", zt = (...e) => e.map((t) => `${t} ${bn}ms ${Xs}`).join(", "), pe = zt(
  "background-color",
  "border-color",
  "color",
  "box-shadow"
), pi = zt("fill", "stroke"), Zs = zt("opacity", "transform"), Qs = gn`
	from {
		opacity: 0;
		transform: translateY(12px);
	}
	to {
		opacity: 1;
		transform: none;
	}
`, ea = gn`
	from {
		opacity: 0;
		transform: translate(16px, 16px);
	}
	to {
		opacity: 1;
		transform: none;
	}
`, Vn = gn`
	from {
		opacity: 0;
		transform: translateY(24px);
	}
	to {
		opacity: 1;
		transform: none;
	}
`, Ke = (e = 0, t = 500) => `${Qs} ${t}ms ${wt} ${e}ms both`, ta = {
  "@media (prefers-reduced-motion: reduce)": {
    "& *, & *::before, & *::after": {
      animationDuration: "1ms !important",
      animationDelay: "0ms !important",
      transitionDuration: "1ms !important"
    }
  }
}, ar = "lumora_color_mode", Sn = "(prefers-color-scheme: dark)", hi = () => typeof window > "u" || !window.matchMedia ? "light" : window.matchMedia(Sn).matches ? "dark" : "light", cr = {
  /**
   * Get the stored colour mode
   * @returns The user's choice, or null when they never toggled
   */
  get: () => {
    try {
      const e = localStorage.getItem(ar);
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
      localStorage.setItem(ar, e);
    } catch {
    }
  },
  /**
   * Forget the user's choice, so the page follows the system again
   */
  clear: () => {
    try {
      localStorage.removeItem(ar);
    } catch {
    }
  }
}, ra = (e, t) => {
  const [r, n] = Re(
    () => cr.get() !== null
  ), [o, i] = Re(
    () => cr.get() ?? e ?? hi()
  ), s = !r && !e;
  return Fe(() => {
    if (!s || typeof window > "u" || !window.matchMedia)
      return;
    const c = window.matchMedia(Sn), u = (d) => i(d.matches ? "dark" : "light");
    return c.addEventListener("change", u), () => c.removeEventListener("change", u);
  }, [s]), { colorMode: o, toggleColorMode: () => {
    const c = o === "dark" ? "light" : "dark";
    i(c), n(!0), cr.set(c), t?.(c);
  } };
}, na = [
  "google-loading",
  "microsoft-loading",
  "passkey-loading",
  "magic-link-loading"
], oa = (e) => na.includes(e), ze = {
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
  hasTokens: () => !!(ze.getAccessToken() && ze.getRefreshToken())
}, be = {
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
}, ia = {
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
function mi(e, t) {
  return function() {
    return e.apply(t, arguments);
  };
}
const { toString: sa } = Object.prototype, { getPrototypeOf: tt } = Object, { iterator: qt, toStringTag: gi } = Symbol, Bt = (({ hasOwnProperty: e }) => (t, r) => e.call(t, r))(Object.prototype), yi = (e) => typeof e == "string" && (e === "__proto__" || e === "constructor" || e === "prototype"), bi = (e, t, r) => e === Object.prototype || !r && t === null, aa = (e) => {
  if (!Object.isExtensible(e))
    return !1;
  const t = Object.getOwnPropertyNames(e);
  return Object.getOwnPropertySymbols && t.push(...Object.getOwnPropertySymbols(e)), t.every((r) => {
    if (yi(r))
      return !1;
    const n = Object.getOwnPropertyDescriptor(e, r);
    return !!n && n.configurable && n.writable === !0;
  });
}, Ut = (e, t) => {
  let r = e;
  const n = [];
  for (; r != null; ) {
    if (n.indexOf(r) !== -1)
      return !1;
    n.push(r);
    const o = tt(r);
    if (bi(r, o, r === e))
      return !1;
    if (Bt(r, t))
      return !0;
    r = o;
  }
  return !1;
}, ca = (e, t) => e != null && Ut(e, t) ? e[t] : void 0, la = (e) => {
  if (e == null || typeof e != "object" && typeof e != "function")
    return e;
  const t = tt(e);
  if (t === null && aa(e))
    return e;
  const r = /* @__PURE__ */ Object.create(null), n = /* @__PURE__ */ Object.create(null), o = [];
  let i = e;
  for (; i != null && o.indexOf(i) === -1; ) {
    o.push(i);
    const s = i === e ? t : tt(i);
    if (bi(i, s, i === e))
      break;
    const a = Object.getOwnPropertyNames(i);
    Object.getOwnPropertySymbols && a.push(...Object.getOwnPropertySymbols(i));
    for (const c of a)
      yi(c) || Bt(n, c) || (r[c] = e[c], n[c] = !0);
    i = s;
  }
  return r;
}, En = /* @__PURE__ */ ((e) => (t) => {
  const r = sa.call(t);
  return e[r] || (e[r] = r.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), De = (e) => (e = e.toLowerCase(), (t) => En(t) === e), wr = (e) => (t) => typeof t === e, { isArray: ut } = Array, dt = wr("undefined");
function Tt(e) {
  return e !== null && !dt(e) && e.constructor !== null && !dt(e.constructor) && _e(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}
const Si = De("ArrayBuffer");
function ua(e) {
  let t;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? t = ArrayBuffer.isView(e) : t = e && e.buffer && Si(e.buffer), t;
}
const da = wr("string"), _e = wr("function"), Ei = wr("number"), Ct = (e) => e !== null && typeof e == "object", fa = (e) => e === !0 || e === !1, lr = (e) => {
  if (!Ct(e))
    return !1;
  const t = tt(e);
  return (t === null || t === Object.prototype || tt(t) === null) && // Treat safe own/inherited Symbol.toStringTag or Symbol.iterator members as
  // evidence the value is tagged/iterable, while ignoring members reachable
  // only through shared or terminal prototype boundaries.
  !Ut(e, gi) && !Ut(e, qt);
}, pa = (e) => {
  if (!Ct(e) || Tt(e))
    return !1;
  try {
    return Object.keys(e).length === 0 && Object.getPrototypeOf(e) === Object.prototype;
  } catch {
    return !1;
  }
}, ha = De("Date"), ma = De("File"), ga = (e) => !!(e && typeof e.uri < "u"), ya = (e) => e && typeof e.getParts < "u", ba = De("Blob"), Sa = De("FileList"), Ea = De("Set"), wa = (e) => Ct(e) && _e(e.pipe);
function xa() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
}
const Wn = xa(), zn = typeof Wn.FormData < "u" ? Wn.FormData : void 0, Ta = (e) => {
  if (!e) return !1;
  if (zn && e instanceof zn) return !0;
  const t = tt(e);
  if (!t || t === Object.prototype || !_e(e.append)) return !1;
  const r = En(e);
  return r === "formdata" || // detect form-data instance
  r === "object" && _e(e.toString) && e.toString() === "[object FormData]";
}, Ca = De("URLSearchParams"), [Oa, Ra, _a, Aa] = [
  "ReadableStream",
  "Request",
  "Response",
  "Headers"
].map(De), va = (e) => e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function Kt(e, t, { allOwnKeys: r = !1 } = {}) {
  if (e === null || typeof e > "u")
    return;
  let n, o;
  if (typeof e != "object" && (e = [e]), ut(e))
    for (n = 0, o = e.length; n < o; n++)
      t.call(null, e[n], n, e);
  else {
    if (Tt(e))
      return;
    const i = r ? Object.getOwnPropertyNames(e) : Object.keys(e), s = i.length;
    let a;
    for (n = 0; n < s; n++)
      a = i[n], t.call(null, e[a], a, e);
  }
}
function wi(e, t) {
  if (Tt(e))
    return null;
  t = t.toLowerCase();
  const r = Object.keys(e);
  let n = r.length, o;
  for (; n-- > 0; )
    if (o = r[n], t === o.toLowerCase())
      return o;
  return null;
}
const st = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, xi = (e) => !dt(e) && e !== st;
function an(...e) {
  const { caseless: t, skipUndefined: r } = xi(this) && this || {}, n = {}, o = (i, s) => {
    if (s === "__proto__" || s === "constructor" || s === "prototype")
      return;
    const a = t && typeof s == "string" && wi(n, s) || s, c = Bt(n, a) ? n[a] : void 0;
    lr(c) && lr(i) ? n[a] = an(c, i) : lr(i) ? n[a] = an({}, i) : ut(i) ? n[a] = i.slice() : (!r || !dt(i)) && (n[a] = i);
  };
  for (let i = 0, s = e.length; i < s; i++) {
    const a = e[i];
    if (!a || Tt(a) || (Kt(a, o), typeof a != "object" || ut(a)))
      continue;
    const c = Object.getOwnPropertySymbols(a);
    for (let u = 0; u < c.length; u++) {
      const d = c[u];
      ja.call(a, d) && o(a[d], d);
    }
  }
  return n;
}
const ka = (e, t, r, { allOwnKeys: n } = {}) => (Kt(
  t,
  (o, i) => {
    r && _e(o) ? Object.defineProperty(e, i, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot
      // hijack defineProperty's accessor-vs-data resolution.
      __proto__: null,
      value: mi(o, r),
      writable: !0,
      enumerable: !0,
      configurable: !0
    }) : Object.defineProperty(e, i, {
      __proto__: null,
      value: o,
      writable: !0,
      enumerable: !0,
      configurable: !0
    });
  },
  { allOwnKeys: n }
), e), Pa = (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e), Na = (e, t, r, n) => {
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
}, Ia = (e, t, r, n) => {
  let o, i, s;
  const a = {};
  if (t = t || {}, e == null) return t;
  do {
    for (o = Object.getOwnPropertyNames(e), i = o.length; i-- > 0; )
      s = o[i], (!n || n(s, e, t)) && !a[s] && (t[s] = e[s], a[s] = !0);
    e = r !== !1 && tt(e);
  } while (e && (!r || r(e, t)) && e !== Object.prototype);
  return t;
}, $a = (e, t, r) => {
  e = String(e), (r === void 0 || r > e.length) && (r = e.length), r -= t.length;
  const n = e.indexOf(t, r);
  return n !== -1 && n === r;
}, Da = (e) => {
  if (!e) return null;
  if (ut(e)) return e;
  let t = e.length;
  if (!Ei(t)) return null;
  const r = new Array(t);
  for (; t-- > 0; )
    r[t] = e[t];
  return r;
}, La = /* @__PURE__ */ ((e) => (t) => e && t instanceof e)(typeof Uint8Array < "u" && tt(Uint8Array)), Ma = (e, t) => {
  const n = (e && e[qt]).call(e);
  let o;
  for (; (o = n.next()) && !o.done; ) {
    const i = o.value;
    t.call(e, i[0], i[1]);
  }
}, Fa = (e, t) => {
  let r;
  const n = [];
  for (; (r = e.exec(t)) !== null; )
    n.push(r);
  return n;
}, Ba = De("HTMLFormElement"), Ua = (e) => e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function(r, n, o) {
  return n.toUpperCase() + o;
}), { propertyIsEnumerable: ja } = Object.prototype, Ha = De("RegExp"), Ti = (e, t) => {
  const r = Object.getOwnPropertyDescriptors(e), n = {};
  Kt(r, (o, i) => {
    let s;
    (s = t(o, i, e)) !== !1 && (n[i] = s || o);
  }), Object.defineProperties(e, n);
}, Va = (e) => {
  Ti(e, (t, r) => {
    if (_e(e) && ["arguments", "caller", "callee"].includes(r))
      return !1;
    const n = e[r];
    if (_e(n)) {
      if (t.enumerable = !1, "writable" in t) {
        t.writable = !1;
        return;
      }
      t.set || (t.set = () => {
        throw Error("Can not rewrite read-only method '" + r + "'");
      });
    }
  });
}, Wa = (e, t) => {
  const r = {}, n = (o) => {
    o.forEach((i) => {
      r[i] = !0;
    });
  };
  return ut(e) ? n(e) : n(String(e).split(t)), r;
}, za = () => {
}, qa = (e, t) => e != null && Number.isFinite(e = +e) ? e : t;
function Ka(e) {
  return !!(e && _e(e.append) && e[gi] === "FormData" && e[qt]);
}
const Ga = (e) => {
  const t = /* @__PURE__ */ new WeakSet(), r = (n) => {
    if (Ct(n)) {
      if (t.has(n))
        return;
      if (Tt(n))
        return n;
      if (!("toJSON" in n)) {
        t.add(n);
        let o;
        if (Ea(n)) {
          o = [];
          for (const i of n) {
            const s = r(i);
            !dt(s) && o.push(s);
          }
        } else
          o = ut(n) ? [] : {}, Kt(n, (i, s) => {
            const a = r(i);
            !dt(a) && (o[s] = a);
          });
        return t.delete(n), o;
      }
    }
    return n;
  };
  return r(e);
}, Ya = De("AsyncFunction"), Ja = (e) => e && (Ct(e) || _e(e)) && _e(e.then) && _e(e.catch), Ci = ((e, t) => e ? setImmediate : t ? ((r, n) => (st.addEventListener(
  "message",
  ({ source: o, data: i }) => {
    o === st && i === r && n.length && n.shift()();
  },
  !1
), (o) => {
  n.push(o), st.postMessage(r, "*");
}))(`axios@${Math.random()}`, []) : (r) => setTimeout(r))(typeof setImmediate == "function", _e(st.postMessage)), Xa = typeof queueMicrotask < "u" ? queueMicrotask.bind(st) : typeof process < "u" && process.nextTick || Ci, Oi = (e) => e != null && _e(e[qt]), Za = (e) => e != null && Ut(e, qt) && Oi(e), p = {
  isArray: ut,
  isArrayBuffer: Si,
  isBuffer: Tt,
  isFormData: Ta,
  isArrayBufferView: ua,
  isString: da,
  isNumber: Ei,
  isBoolean: fa,
  isObject: Ct,
  isPlainObject: lr,
  isEmptyObject: pa,
  isReadableStream: Oa,
  isRequest: Ra,
  isResponse: _a,
  isHeaders: Aa,
  isUndefined: dt,
  isDate: ha,
  isFile: ma,
  isReactNativeBlob: ga,
  isReactNative: ya,
  isBlob: ba,
  isRegExp: Ha,
  isFunction: _e,
  isStream: wa,
  isURLSearchParams: Ca,
  isTypedArray: La,
  isFileList: Sa,
  forEach: Kt,
  merge: an,
  extend: ka,
  trim: va,
  stripBOM: Pa,
  inherits: Na,
  toFlatObject: Ia,
  kindOf: En,
  kindOfTest: De,
  endsWith: $a,
  toArray: Da,
  forEachEntry: Ma,
  matchAll: Fa,
  isHTMLForm: Ba,
  hasOwnProperty: Bt,
  hasOwnProp: Bt,
  // an alias to avoid ESLint no-prototype-builtins detection
  hasOwnInPrototypeChain: Ut,
  getSafeProp: ca,
  toSafeFlatObject: la,
  reduceDescriptors: Ti,
  freezeMethods: Va,
  toObjectSet: Wa,
  toCamelCase: Ua,
  noop: za,
  toFiniteNumber: qa,
  findKey: wi,
  global: st,
  isContextDefined: xi,
  isSpecCompliantForm: Ka,
  toJSONObject: Ga,
  isAsyncFn: Ya,
  isThenable: Ja,
  setImmediate: Ci,
  asap: Xa,
  isIterable: Oi,
  isSafeIterable: Za
}, Qa = p.toObjectSet([
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
]), ec = (e) => {
  const t = {};
  let r, n, o;
  return e && e.split(`
`).forEach(function(s) {
    o = s.indexOf(":"), r = s.substring(0, o).trim().toLowerCase(), n = s.substring(o + 1).trim();
    const a = p.hasOwnProp(t, r);
    !r || a && p.hasOwnProp(Qa, r) || (r === "set-cookie" ? a ? t[r].push(n) : t[r] = [n] : t[r] = a ? t[r] + ", " + n : n);
  }), t;
};
function tc(e) {
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
const rc = new RegExp("[\\u0000-\\u0008\\u000a-\\u001f\\u007f]+", "g"), nc = new RegExp("[^\\u0009\\u0020-\\u007e\\u0080-\\u00ff]+", "g");
function wn(e, t) {
  return p.isArray(e) ? e.map((r) => wn(r, t)) : tc(String(e).replace(t, ""));
}
const oc = (e) => wn(e, rc), ic = (e) => wn(e, nc);
function Ri(e) {
  const t = /* @__PURE__ */ Object.create(null);
  return p.forEach(e.toJSON(), (r, n) => {
    t[n] = ic(r);
  }), t;
}
const qn = /* @__PURE__ */ Symbol("internals");
function Rt(e) {
  return e && String(e).trim().toLowerCase();
}
function ur(e) {
  return e === !1 || e == null ? e : p.isArray(e) ? e.map(ur) : oc(String(e));
}
function sc(e) {
  const t = /* @__PURE__ */ Object.create(null), r = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let n;
  for (; n = r.exec(e); )
    t[n[1]] = n[2];
  return t;
}
const ac = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
function jr(e) {
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
function cc(e) {
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
function lc(e) {
  const t = /* @__PURE__ */ Object.create(null), r = String(e);
  let n = 0, o = !1, i = !1;
  function s(a) {
    const c = jr(r.slice(n, a)), u = c.indexOf("=");
    if (u < 1)
      return;
    const d = jr(c.slice(0, u));
    if (!ac.test(d))
      return;
    const f = d.toLowerCase();
    if (f === "__proto__" || f === "constructor" || f === "prototype")
      return;
    const g = jr(c.slice(u + 1));
    t[f] = cc(g);
  }
  for (let a = 0; a < r.length; a++) {
    const c = r.charCodeAt(a);
    o ? i ? i = !1 : c === 92 ? i = !0 : c === 34 && (o = !1) : c === 34 ? o = !0 : (c === 44 || c === 59) && (s(a), n = a + 1);
  }
  return s(r.length), t;
}
const uc = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
function Hr(e, t, r, n, o) {
  if (p.isFunction(n))
    return n.call(this, t, r);
  if (o && (t = r), !!p.isString(t)) {
    if (p.isString(n))
      return t.indexOf(n) !== -1;
    if (p.isRegExp(n))
      return n.test(t);
  }
}
function dc(e) {
  return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (t, r, n) => r.toUpperCase() + n);
}
function fc(e, t) {
  const r = p.toCamelCase(" " + t);
  ["get", "set", "has"].forEach((n) => {
    Object.defineProperty(e, n + r, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot turn
      // this data descriptor into an accessor descriptor on the way in.
      __proto__: null,
      value: function(o, i, s) {
        return this[n].call(this, t, o, i, s);
      },
      configurable: !0
    });
  });
}
let Ce = class {
  constructor(t) {
    t && this.set(t);
  }
  set(t, r, n) {
    const o = this;
    function i(a, c, u) {
      const d = Rt(c);
      if (!d)
        return;
      const f = p.findKey(o, d);
      (!f || o[f] === void 0 || u === !0 || u === void 0 && o[f] !== !1) && (o[f || c] = ur(a));
    }
    const s = (a, c) => p.forEach(a, (u, d) => i(u, d, c));
    if (p.isPlainObject(t) || t instanceof this.constructor)
      s(t, r);
    else if (p.isString(t) && (t = t.trim()) && !uc(t))
      s(ec(t), r);
    else if (p.isObject(t) && p.isSafeIterable(t)) {
      let a = /* @__PURE__ */ Object.create(null), c, u;
      for (const d of t) {
        if (!p.isArray(d))
          throw new TypeError("Object iterator must return a key-value pair");
        u = d[0], p.hasOwnProp(a, u) ? (c = a[u], a[u] = p.isArray(c) ? [...c, d[1]] : [c, d[1]]) : a[u] = d[1];
      }
      s(a, r);
    } else
      t != null && i(r, t, n);
    return this;
  }
  get(t, r) {
    if (t = Rt(t), t) {
      const n = p.findKey(this, t);
      if (n) {
        const o = this[n];
        if (!r)
          return o;
        if (r === !0)
          return sc(o);
        if (p.isFunction(r))
          return r.call(this, o, n);
        if (p.isRegExp(r))
          return r.exec(o);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(t, r) {
    if (t = Rt(t), t) {
      const n = p.findKey(this, t);
      return !!(n && this[n] !== void 0 && (!r || Hr(this, this[n], n, r)));
    }
    return !1;
  }
  delete(t, r) {
    const n = this;
    let o = !1;
    function i(s) {
      if (s = Rt(s), s) {
        const a = p.findKey(n, s);
        a && (!r || Hr(n, n[a], a, r)) && (delete n[a], o = !0);
      }
    }
    return p.isArray(t) ? t.forEach(i) : i(t), o;
  }
  clear(t) {
    const r = Object.keys(this);
    let n = r.length, o = !1;
    for (; n--; ) {
      const i = r[n];
      (!t || Hr(this, this[i], i, t, !0)) && (delete this[i], o = !0);
    }
    return o;
  }
  normalize(t) {
    const r = this, n = {};
    return p.forEach(this, (o, i) => {
      const s = p.findKey(n, i);
      if (s) {
        r[s] = ur(o), delete r[i];
        return;
      }
      const a = t ? dc(i) : String(i).trim();
      a !== i && delete r[i], r[a] = ur(o), n[a] = !0;
    }), this;
  }
  concat(...t) {
    return this.constructor.concat(this, ...t);
  }
  toJSON(t) {
    const r = /* @__PURE__ */ Object.create(null);
    return p.forEach(this, (n, o) => {
      n != null && n !== !1 && (r[o] = t && p.isArray(n) ? n.join(", ") : n);
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
    return p.isArray(t) ? t : t == null || t === !1 ? [] : [t];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(t) {
    return t instanceof this ? t : new this(t);
  }
  static parseParameters(t) {
    return lc(t);
  }
  static concat(t, ...r) {
    const n = new this(t);
    return r.forEach((o) => n.set(o)), n;
  }
  static accessor(t) {
    const n = (this[qn] = this[qn] = {
      accessors: {}
    }).accessors, o = this.prototype;
    function i(s) {
      const a = Rt(s);
      n[a] || (fc(o, s), n[a] = !0);
    }
    return p.isArray(t) ? t.forEach(i) : i(t), this;
  }
};
Ce.accessor([
  "Content-Type",
  "Content-Length",
  "Accept",
  "Accept-Encoding",
  "User-Agent",
  "Authorization"
]);
p.reduceDescriptors(Ce.prototype, ({ value: e }, t) => {
  let r = t[0].toUpperCase() + t.slice(1);
  return {
    get: () => e,
    set(n) {
      this[r] = n;
    }
  };
});
p.freezeMethods(Ce);
const gr = "[REDACTED ****]";
function pc(e) {
  if (p.hasOwnProp(e, "toJSON"))
    return !0;
  let t = Object.getPrototypeOf(e);
  for (; t && t !== Object.prototype; ) {
    if (p.hasOwnProp(t, "toJSON"))
      return !0;
    t = Object.getPrototypeOf(t);
  }
  return !1;
}
function hc(e, t) {
  const r = new Set(t.map((i) => String(i).toLowerCase())), n = [], o = (i) => {
    if (i === null || typeof i != "object" || p.isBuffer(i)) return i;
    if (n.indexOf(i) !== -1) return;
    i instanceof Ce && (i = i.toJSON()), n.push(i);
    let s;
    if (p.isArray(i))
      s = [], i.forEach((a, c) => {
        const u = o(a);
        p.isUndefined(u) || (s[c] = u);
      });
    else {
      if (!p.isPlainObject(i) && pc(i))
        return n.pop(), i;
      s = /* @__PURE__ */ Object.create(null);
      for (const [a, c] of Object.entries(i)) {
        const u = r.has(a.toLowerCase()) ? gr : o(c);
        p.isUndefined(u) || (s[a] = u);
      }
    }
    return n.pop(), s;
  };
  return o(e);
}
function Kn(e) {
  try {
    return String(e);
  } catch {
    return "";
  }
}
function mc(e) {
  return e.errors.map((r) => {
    try {
      return r && r.message ? Kn(r.message) : Kn(r);
    } catch {
      return "";
    }
  }).filter(Boolean).join("; ") || e.name || "AggregateError";
}
let I = class _i extends Error {
  static from(t, r, n, o, i, s) {
    let a = t.message;
    !a && p.isArray(t.errors) && t.errors.length && (a = mc(t));
    const c = new _i(a, r || t.code, n, o, i);
    return Object.defineProperty(c, "cause", {
      __proto__: null,
      value: t,
      writable: !0,
      enumerable: !1,
      configurable: !0
    }), c.name = t.name, t.status != null && c.status == null && (c.status = t.status), s && Object.assign(c, s), c;
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
  constructor(t, r, n, o, i) {
    super(t), Object.defineProperty(this, "message", {
      // Null-proto descriptor so a polluted Object.prototype.get cannot turn
      // this data descriptor into an accessor descriptor on the way in.
      __proto__: null,
      value: t,
      enumerable: !0,
      writable: !0,
      configurable: !0
    }), this.name = "AxiosError", this.isAxiosError = !0, r && (this.code = r), n && (this.config = n), o && (this.request = o), i && (this.response = i, this.status = i.status);
  }
  toJSON() {
    const t = this.config, r = t && p.hasOwnProp(t, "redact") ? t.redact : void 0, n = p.isArray(r) && r.length > 0 ? hc(t, r) : p.toJSONObject(t);
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
I.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE";
I.ERR_BAD_OPTION = "ERR_BAD_OPTION";
I.ECONNABORTED = "ECONNABORTED";
I.ETIMEDOUT = "ETIMEDOUT";
I.ECONNREFUSED = "ECONNREFUSED";
I.ERR_NETWORK = "ERR_NETWORK";
I.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS";
I.ERR_DEPRECATED = "ERR_DEPRECATED";
I.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE";
I.ERR_BAD_REQUEST = "ERR_BAD_REQUEST";
I.ERR_CANCELED = "ERR_CANCELED";
I.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT";
I.ERR_INVALID_URL = "ERR_INVALID_URL";
I.ERR_FORM_DATA_DEPTH_EXCEEDED = "ERR_FORM_DATA_DEPTH_EXCEEDED";
const gc = null, Ai = 100;
function cn(e) {
  return p.isPlainObject(e) || p.isArray(e);
}
function vi(e) {
  return p.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function Vr(e, t, r) {
  return e ? e.concat(t).map(function(o, i) {
    return o = vi(o), !r && i ? "[" + o + "]" : o;
  }).join(r ? "." : "") : t;
}
function yc(e) {
  return p.isArray(e) && !e.some(cn);
}
const bc = p.toFlatObject(p, {}, null, function(t) {
  return /^is[A-Z]/.test(t);
});
function xr(e, t, r) {
  if (!p.isObject(e))
    throw new TypeError("target must be an object");
  t = t || new FormData();
  const n = (C, _) => {
    const x = p.getSafeProp(r, C);
    return p.isUndefined(x) ? _ : x;
  }, o = n("metaTokens", !0), i = n("visitor") || h, s = n("dots", !1), a = n("indexes", !1), c = n("Blob") || typeof Blob < "u" && Blob, u = n("maxDepth", Ai), d = c && p.isSpecCompliantForm(t), f = [];
  if (!p.isFunction(i))
    throw new TypeError("visitor must be a function");
  function g(C) {
    if (C === null) return "";
    if (p.isDate(C))
      return C.toISOString();
    if (p.isBoolean(C))
      return C.toString();
    if (!d && p.isBlob(C))
      throw new I("Blob is not supported. Use a Buffer instead.");
    if (p.isArrayBuffer(C) || p.isTypedArray(C)) {
      if (d && typeof c == "function")
        return new c([C]);
      throw new I(
        "Blob is not supported. Use a Buffer instead.",
        I.ERR_NOT_SUPPORT
      );
    }
    return C;
  }
  function S(C) {
    if (C > u)
      throw new I(
        "Object is too deeply nested (" + C + " levels). Max depth: " + u,
        I.ERR_FORM_DATA_DEPTH_EXCEEDED
      );
  }
  function b(C, _) {
    if (u === 1 / 0)
      return JSON.stringify(C);
    const x = [];
    return JSON.stringify(C, function($, Y) {
      if (!p.isObject(Y))
        return Y;
      for (; x.length && x[x.length - 1] !== this; )
        x.pop();
      return x.push(Y), S(_ + x.length - 1), Y;
    });
  }
  function h(C, _, x) {
    let T = C;
    if (p.isReactNative(t) && p.isReactNativeBlob(C))
      return t.append(Vr(x, _, s), g(C)), !1;
    if (C && !x && typeof C == "object") {
      if (p.endsWith(_, "{}"))
        _ = o ? _ : _.slice(0, -2), C = b(C, 1);
      else if (p.isArray(C) && yc(C) || (p.isFileList(C) || p.endsWith(_, "[]")) && (T = p.toArray(C)))
        return _ = vi(_), T.forEach(function(Y, V) {
          !(p.isUndefined(Y) || Y === null) && t.append(
            // eslint-disable-next-line no-nested-ternary
            a === !0 ? Vr([_], V, s) : a === null ? _ : _ + "[]",
            g(Y)
          );
        }), !1;
    }
    return cn(C) ? !0 : (t.append(Vr(x, _, s), g(C)), !1);
  }
  const w = Object.assign(bc, {
    defaultVisitor: h,
    convertValue: g,
    isVisitable: cn
  });
  function y(C, _, x = 0) {
    if (!p.isUndefined(C)) {
      if (S(x), f.indexOf(C) !== -1)
        throw new Error("Circular reference detected in " + _.join("."));
      f.push(C), p.forEach(C, function($, Y) {
        (!(p.isUndefined($) || $ === null) && i.call(t, $, p.isString(Y) ? Y.trim() : Y, _, w)) === !0 && y($, _ ? _.concat(Y) : [Y], x + 1);
      }), f.pop();
    }
  }
  if (!p.isObject(e))
    throw new TypeError("data must be an object");
  return y(e), t;
}
function Gn(e) {
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
function xn(e, t) {
  this._pairs = [], e && xr(e, this, t);
}
const ki = xn.prototype;
ki.append = function(t, r) {
  this._pairs.push([t, r]);
};
ki.toString = function(t) {
  const r = t ? (n) => t.call(this, n, Gn) : Gn;
  return this._pairs.map(function(o) {
    return r(o[0]) + "=" + r(o[1]);
  }, "").join("&");
};
function Sc(e) {
  return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function Pi(e, t, r) {
  if (!t)
    return e;
  e = e || "";
  const n = p.isFunction(r) ? {
    serialize: r
  } : r, o = p.getSafeProp(n, "encode") || Sc, i = p.getSafeProp(n, "serialize");
  let s;
  if (i ? s = i(t, n) : s = p.isURLSearchParams(t) ? t.toString() : new xn(t, n).toString(o), s) {
    const a = e.indexOf("#");
    a !== -1 && (e = e.slice(0, a)), e += (e.indexOf("?") === -1 ? "?" : "&") + s;
  }
  return e;
}
const _t = /* @__PURE__ */ Symbol("internals");
function Ni(e) {
  return e ? e.length : 0;
}
function Yn(e) {
  if (e)
    for (; e.length && e[e.length - 1] === null; )
      e.pop();
}
function At(e, t) {
  const r = e.handlers, n = Ni(r);
  r !== t.handlersRef ? (t.handlersRef = r, t.handlerEntries.clear()) : n !== t.handlersLength && (n ? t.handlerEntries.forEach(function(i, s) {
    r[i.index] !== i.handler && t.handlerEntries.delete(s);
  }) : t.handlerEntries.clear()), t.handlersLength = n;
}
class Jn {
  constructor() {
    this.handlers = [], this[_t] = {
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
    }, i = this[_t];
    this.handlers == null && (this.handlers = []), At(this, i);
    const s = i.nextId++;
    return this.handlers.push(o), i.handlerEntries.set(s, {
      handler: o,
      index: this.handlers.length - 1
    }), i.handlersLength = this.handlers.length, s;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {void}
   */
  eject(t) {
    const r = this[_t];
    At(this, r);
    const n = r.handlerEntries.get(t);
    if (n) {
      if (r.handlerEntries.delete(t), this.handlers[n.index] !== n.handler)
        return;
      this.handlers[n.index] = null, r.iterationDepth || (Yn(this.handlers), r.handlersLength = this.handlers.length);
    }
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    this.handlers && (this.handlers = [], At(this, this[_t]));
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
    const r = this[_t];
    At(this, r), r.iterationDepth++;
    try {
      p.forEach(this.handlers, function(o) {
        o !== null && t(o);
      });
    } finally {
      --r.iterationDepth || (At(this, r), Yn(this.handlers), r.handlersLength = Ni(this.handlers));
    }
  }
}
const Tn = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1,
  legacyInterceptorReqResOrdering: !0,
  advertiseZstdAcceptEncoding: !1,
  validateStatusUndefinedResolves: !0
}, Ec = typeof URLSearchParams < "u" ? URLSearchParams : xn, wc = typeof FormData < "u" ? FormData : null, xc = typeof Blob < "u" ? Blob : null, Tc = {
  isBrowser: !0,
  classes: {
    URLSearchParams: Ec,
    FormData: wc,
    Blob: xc
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
}, Cn = typeof window < "u" && typeof document < "u", ln = typeof navigator == "object" && navigator || void 0, Cc = Cn && (!ln || ["ReactNative", "NativeScript", "NS"].indexOf(ln.product) < 0), Oc = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", Rc = Cn && window.location.href || "http://localhost", _c = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: Cn,
  hasStandardBrowserEnv: Cc,
  hasStandardBrowserWebWorkerEnv: Oc,
  navigator: ln,
  origin: Rc
}, Symbol.toStringTag, { value: "Module" })), Ee = {
  ..._c,
  ...Tc
};
function Ac(e, t) {
  return xr(e, new Ee.classes.URLSearchParams(), {
    visitor: function(r, n, o, i) {
      return Ee.isNode && p.isBuffer(r) ? (this.append(n, r.toString("base64")), !1) : i.defaultVisitor.apply(this, arguments);
    },
    ...t
  });
}
const Xn = Ai;
function Ii(e) {
  if (e > Xn)
    throw new I(
      "FormData field is too deeply nested (" + e + " levels). Max depth: " + Xn,
      I.ERR_FORM_DATA_DEPTH_EXCEEDED
    );
}
function vc(e) {
  const t = [], r = /[^.[\]]+|\[([^.[\]]*)]/g;
  let n;
  for (; (n = r.exec(e)) !== null; )
    Ii(t.length), t.push(n[0] === "[]" ? "" : n[1] || n[0]);
  return t;
}
function kc(e) {
  const t = {}, r = Object.keys(e);
  let n;
  const o = r.length;
  let i;
  for (n = 0; n < o; n++)
    i = r[n], t[i] = e[i];
  return t;
}
function $i(e) {
  function t(r, n, o, i) {
    Ii(i);
    let s = r[i++];
    if (s === "__proto__") return !0;
    const a = Number.isFinite(+s), c = i >= r.length;
    return s = !s && p.isArray(o) ? o.length : s, c ? (p.hasOwnProp(o, s) ? o[s] = p.isArray(o[s]) ? o[s].concat(n) : [o[s], n] : o[s] = n, !a) : ((!p.hasOwnProp(o, s) || !p.isObject(o[s])) && (o[s] = []), t(r, n, o[s], i) && p.isArray(o[s]) && (o[s] = kc(o[s])), !a);
  }
  if (p.isFormData(e) && p.isFunction(e.entries)) {
    const r = {};
    return p.forEachEntry(e, (n, o) => {
      t(vc(n), o, r, 0);
    }), r;
  }
  return null;
}
const Di = Object.freeze([
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
]), pt = (e, t) => e != null && p.hasOwnProp(e, t) ? e[t] : void 0;
function Pc(e, t, r) {
  if (p.isString(e))
    try {
      return (t || JSON.parse)(e), p.trim(e);
    } catch (n) {
      if (n.name !== "SyntaxError")
        throw n;
    }
  return (r || JSON.stringify)(e);
}
const Gt = {
  transitional: Tn,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [
    function(t, r) {
      const n = r.getContentType() || "", o = n.indexOf("application/json") > -1, i = p.isObject(t);
      if (i && p.isHTMLForm(t) && (t = new FormData(t)), p.isFormData(t))
        return o ? JSON.stringify($i(t)) : t;
      if (p.isArrayBuffer(t) || p.isBuffer(t) || p.isStream(t) || p.isFile(t) || p.isBlob(t) || p.isReadableStream(t))
        return t;
      if (p.isArrayBufferView(t))
        return t.buffer;
      if (p.isURLSearchParams(t))
        return r.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), t.toString();
      let a;
      if (i) {
        const c = pt(this, "formSerializer");
        if (n.indexOf("application/x-www-form-urlencoded") > -1)
          return Ac(t, c).toString();
        if ((a = p.isFileList(t)) || n.indexOf("multipart/form-data") > -1) {
          const u = pt(this, "env"), d = u && u.FormData;
          return xr(
            a ? { "files[]": t } : t,
            d && new d(),
            c
          );
        }
      }
      return i || o ? (r.setContentType("application/json", !1), Pc(t)) : t;
    }
  ],
  transformResponse: [
    function(t) {
      const r = pt(this, "transitional") || Gt.transitional, n = r && r.forcedJSONParsing, o = pt(this, "responseType"), i = o === "json";
      if (p.isResponse(t) || p.isReadableStream(t))
        return t;
      if (t && p.isString(t) && (n && !o || i)) {
        const a = !(r && r.silentJSONParsing) && i;
        try {
          return JSON.parse(t, pt(this, "parseReviver"));
        } catch (c) {
          if (a)
            throw c.name === "SyntaxError" ? I.from(c, I.ERR_BAD_RESPONSE, this, null, pt(this, "response")) : c;
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
    FormData: Ee.classes.FormData,
    Blob: Ee.classes.Blob
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
p.forEach(Di, (e) => {
  Gt.headers[e] = {};
});
function Wr(e, t) {
  const r = this || Gt, n = t || r, o = Ce.from(n.headers);
  let i = n.data;
  return p.forEach(e, function(a) {
    i = a.call(r, i, o.normalize(), t ? t.status : void 0);
  }), o.normalize(), i;
}
function Li(e) {
  return !!(e && e.__CANCEL__);
}
let Yt = class extends I {
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
    super(t ?? "canceled", I.ERR_CANCELED, r, n), this.name = "CanceledError", this.__CANCEL__ = !0;
  }
};
function Mi(e, t, r) {
  const n = r.config.validateStatus;
  !r.status || !n || n(r.status) ? e(r) : t(new I(
    "Request failed with status code " + r.status,
    r.status >= 400 && r.status < 500 ? I.ERR_BAD_REQUEST : I.ERR_BAD_RESPONSE,
    r.config,
    r.request,
    r
  ));
}
const Nc = /[\t\n\r]/g;
function Fi(e) {
  if (typeof e != "string")
    return e;
  let t = 0;
  for (; t < e.length && e.charCodeAt(t) <= 32; )
    t++;
  return e.slice(t).replace(Nc, "");
}
function zr(e) {
  const t = /^([-+\w]{1,25}):(?:\/\/)?/.exec(e);
  return t && t[1] || "";
}
function Ic(e, t) {
  e = e || 10;
  const r = new Array(e), n = new Array(e);
  let o = 0, i = 0, s;
  return t = t !== void 0 ? t : 1e3, function(c) {
    const u = Date.now(), d = n[i];
    s || (s = u), r[o] = c, n[o] = u;
    let f = i, g = 0;
    for (; f !== o; )
      g += r[f++], f = f % e;
    if (o = (o + 1) % e, o === i && (i = (i + 1) % e), u - s < t)
      return;
    const S = d && u - d;
    return S ? Math.round(g * 1e3 / S) : void 0;
  };
}
function $c(e, t) {
  let r = 0, n = 1e3 / t, o, i;
  const s = (d, f = Date.now()) => {
    r = f, o = null, i && (clearTimeout(i), i = null), e(...d);
  };
  return [(...d) => {
    const f = Date.now(), g = f - r;
    g >= n ? s(d, f) : (o = d, i || (i = setTimeout(() => {
      i = null, s(o);
    }, n - g)));
  }, () => o && s(o), (...d) => s(d)];
}
const yr = (e, t, r = 3) => {
  let n = 0;
  const o = Ic(50, 250);
  return $c((i) => {
    if (!i || !p.isNumber(i.loaded))
      return;
    const s = i.loaded, a = i.lengthComputable ? i.total : void 0, c = Math.max(0, a != null ? Math.min(s, a) : s), u = Math.max(0, c - n), d = o(u);
    n = Math.max(n, c);
    const f = {
      loaded: c,
      total: a,
      progress: a ? c / a : void 0,
      bytes: u,
      rate: d || void 0,
      estimated: d && a ? (a - c) / d : void 0,
      event: i,
      lengthComputable: a != null,
      [t ? "download" : "upload"]: !0
    };
    e(f);
  }, r);
}, Zn = (e, t) => {
  const r = e != null;
  return [
    (n) => t[0]({
      lengthComputable: r,
      total: e,
      loaded: n
    }),
    t[1]
  ];
}, Qn = (e, t = p.asap) => (...r) => t(() => e(...r)), Dc = Ee.hasStandardBrowserEnv ? /* @__PURE__ */ ((e, t) => (r) => (r = new URL(r, Ee.origin), e.protocol === r.protocol && e.host === r.host && (t || e.port === r.port)))(
  new URL(Ee.origin),
  Ee.navigator && /(msie|trident)/i.test(Ee.navigator.userAgent)
) : () => !0, Lc = Ee.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(e, t, r, n, o, i, s) {
      if (typeof document > "u") return;
      const a = [`${e}=${encodeURIComponent(t)}`];
      p.isNumber(r) && a.push(`expires=${new Date(r).toUTCString()}`), p.isString(n) && a.push(`path=${n}`), p.isString(o) && a.push(`domain=${o}`), i === !0 && a.push("secure"), p.isString(s) && a.push(`SameSite=${s}`), document.cookie = a.join("; ");
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
function Mc(e) {
  return typeof e != "string" ? !1 : /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
function Fc(e, t) {
  if (!t)
    return e;
  let r = e.length;
  for (; r > 0 && e.charCodeAt(r - 1) === 47; )
    r--;
  return e.slice(0, r) + "/" + t.replace(/^\/+/, "");
}
const Bc = /^https?:(?!\/\/)/i;
function Uc(e) {
  return e && e.replace(/(^|&)([^=&]*=)?[^&]+/g, (t, r, n = "") => `${r}${n}${gr}`);
}
function jc(e) {
  const t = e.replace(/^(https?:\/{0,2})[^/?#]*@/i, `$1${gr}@`), r = t.indexOf("#"), o = (r === -1 ? t : t.slice(0, r)).replace(
    /([?&][^=&#]*=)[^&#]*/g,
    `$1${gr}`
  );
  return r === -1 ? o : `${o}#${Uc(t.slice(r + 1))}`;
}
function eo(e, t) {
  if (typeof e == "string") {
    const r = Fi(e);
    if (Bc.test(r))
      throw new I(
        `Invalid URL ${JSON.stringify(jc(r))}: missing "//" after protocol`,
        I.ERR_INVALID_URL,
        t
      );
  }
}
function Bi(e, t, r, n) {
  eo(t, n);
  let o = !Mc(t);
  return e && (o || r === !1) ? (eo(e, n), Fc(e, t)) : t;
}
const to = (e) => e instanceof Ce ? { ...e } : e, Hc = (e) => Object.getOwnPropertySymbols && Object.getOwnPropertyDescriptor ? Object.keys(e).concat(
  Object.getOwnPropertySymbols(e).filter(
    (t) => Object.getOwnPropertyDescriptor(e, t).enumerable
  )
) : Object.keys(e);
function ft(e, t) {
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
  function n(d, f, g, S) {
    return p.isPlainObject(d) && p.isPlainObject(f) ? p.merge.call({ caseless: S }, d, f) : p.isPlainObject(f) ? p.merge({}, f) : p.isArray(f) ? f.slice() : f;
  }
  function o(d, f, g, S) {
    if (p.isUndefined(f)) {
      if (!p.isUndefined(d))
        return n(void 0, d, g, S);
    } else return n(d, f, g, S);
  }
  function i(d, f) {
    if (!p.isUndefined(f))
      return n(void 0, f);
  }
  function s(d, f) {
    if (p.isUndefined(f)) {
      if (!p.isUndefined(d))
        return n(void 0, d);
    } else return n(void 0, f);
  }
  function a(d) {
    const f = p.hasOwnProp(t, "transitional") ? t.transitional : void 0;
    if (!p.isUndefined(f))
      if (p.isPlainObject(f)) {
        if (p.hasOwnProp(f, d))
          return f[d];
      } else
        return;
    const g = p.hasOwnProp(e, "transitional") ? e.transitional : void 0;
    if (p.isPlainObject(g) && p.hasOwnProp(g, d))
      return g[d];
  }
  function c(d, f, g) {
    if (p.hasOwnProp(t, g))
      return n(d, f);
    if (p.hasOwnProp(e, g))
      return n(void 0, d);
  }
  const u = {
    url: i,
    method: i,
    data: i,
    baseURL: s,
    transformRequest: s,
    transformResponse: s,
    paramsSerializer: s,
    timeout: s,
    timeoutErrorMessage: s,
    withCredentials: s,
    withXSRFToken: s,
    adapter: s,
    responseType: s,
    xsrfCookieName: s,
    xsrfHeaderName: s,
    onUploadProgress: s,
    onDownloadProgress: s,
    decompress: s,
    maxContentLength: s,
    maxBodyLength: s,
    beforeRedirect: s,
    transport: s,
    httpAgent: s,
    httpsAgent: s,
    cancelToken: s,
    socketPath: s,
    allowedSocketPaths: s,
    responseEncoding: s,
    validateStatus: c,
    headers: (d, f, g) => o(to(d), to(f), g, !0)
  };
  return p.forEach(Hc({ ...e, ...t }), function(f) {
    if (f === "__proto__" || f === "constructor" || f === "prototype") return;
    const g = p.hasOwnProp(u, f) ? u[f] : o, S = p.hasOwnProp(e, f) ? e[f] : void 0, b = p.hasOwnProp(t, f) ? t[f] : void 0, h = g(S, b, f);
    p.isUndefined(h) && g !== c || (r[f] = h);
  }), p.hasOwnProp(t, "validateStatus") && p.isUndefined(t.validateStatus) && a("validateStatusUndefinedResolves") === !1 && (p.hasOwnProp(e, "validateStatus") ? r.validateStatus = n(void 0, e.validateStatus) : delete r.validateStatus), r;
}
const Vc = ["content-type", "content-length"];
function Wc(e, t, r) {
  if (r !== "content-only") {
    e.set(t);
    return;
  }
  Object.entries(t || {}).forEach(([n, o]) => {
    Vc.includes(n.toLowerCase()) && e.set(n, o);
  });
}
const zc = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, r) => String.fromCharCode(parseInt(r, 16))
);
function Ui(e) {
  const t = ft({}, e), r = (g) => p.hasOwnProp(t, g) ? t[g] : void 0, n = r("data");
  let o = r("withXSRFToken");
  const i = r("xsrfHeaderName"), s = r("xsrfCookieName");
  let a = r("headers");
  const c = r("auth"), u = r("baseURL"), d = r("allowAbsoluteUrls"), f = r("url");
  if (t.headers = a = Ce.from(a), t.url = Pi(
    Bi(u, f, d, t),
    r("params"),
    r("paramsSerializer")
  ), c) {
    const g = p.getSafeProp(c, "username") || "", S = p.getSafeProp(c, "password") || "";
    try {
      a.set(
        "Authorization",
        "Basic " + btoa(g + ":" + (S ? zc(S) : ""))
      );
    } catch (b) {
      throw I.from(b, I.ERR_BAD_OPTION_VALUE, e);
    }
  }
  if (p.isFormData(n)) {
    const g = p.getSafeProp(n, "getHeaders");
    Ee.hasStandardBrowserEnv || Ee.hasStandardBrowserWebWorkerEnv || p.isReactNative(n) ? a.setContentType(void 0) : p.isFunction(g) && Wc(a, g.call(n), r("formDataHeaderPolicy"));
  }
  if (Ee.hasStandardBrowserEnv && (p.isFunction(o) && (o = o(t)), o === !0 || o == null && Dc(t.url))) {
    const S = i && s && Lc.read(s);
    S && a.set(i, S);
  }
  return t;
}
const qc = typeof XMLHttpRequest < "u", Kc = qc && function(e) {
  return new Promise(function(r, n) {
    const o = Ui(e);
    let i = o.data;
    const s = Ce.from(o.headers).normalize();
    let { responseType: a, onUploadProgress: c, onDownloadProgress: u } = o, d, f, g, S, b, h;
    function w() {
      S && S(), b && b(), o.cancelToken && o.cancelToken.unsubscribe(d), o.signal && o.signal.removeEventListener("abort", d);
    }
    let y = new XMLHttpRequest();
    y.open(o.method.toUpperCase(), o.url, !0), y.timeout = o.timeout;
    function C(x) {
      if (!y)
        return;
      if (y.status === 0 && (zr(Fi(o.url)) || zr(Ee.origin)) !== "file" && !(y.responseURL && y.responseURL.startsWith("file:"))) {
        n(new I("Request aborted", I.ECONNABORTED, e, y)), w(), y = null;
        return;
      }
      try {
        x ? h && h(x) : b && b();
      } catch (V) {
        setTimeout(() => {
          throw V;
        });
      }
      if (!y)
        return;
      const T = Ce.from(
        "getAllResponseHeaders" in y && y.getAllResponseHeaders()
      ), Y = {
        data: !a || a === "text" || a === "json" ? y.responseText : y.response,
        status: y.status,
        statusText: y.statusText,
        headers: T,
        config: e,
        request: y
      };
      Mi(
        function(B) {
          r(B), w();
        },
        function(B) {
          n(B), w();
        },
        Y
      ), y = null;
    }
    "onloadend" in y ? y.onloadend = C : y.onreadystatechange = function() {
      !y || y.readyState !== 4 || y.status === 0 && !(y.responseURL && y.responseURL.startsWith("file:")) || setTimeout(C);
    }, y.onabort = function() {
      y && (n(new I("Request aborted", I.ECONNABORTED, e, y)), w(), y = null);
    }, y.onerror = function(T) {
      const $ = T && T.message ? T.message : "Network Error", Y = new I($, I.ERR_NETWORK, e, y);
      Y.event = T || null, n(Y), w(), y = null;
    }, y.ontimeout = function() {
      let T = o.timeout ? "timeout of " + o.timeout + "ms exceeded" : "timeout exceeded";
      const $ = o.transitional || Tn;
      o.timeoutErrorMessage && (T = o.timeoutErrorMessage), n(
        new I(
          T,
          $.clarifyTimeoutError ? I.ETIMEDOUT : I.ECONNABORTED,
          e,
          y
        )
      ), w(), y = null;
    }, i === void 0 && s.setContentType(null), "setRequestHeader" in y && p.forEach(Ri(s), function(T, $) {
      y.setRequestHeader($, T);
    }), p.isUndefined(o.withCredentials) || (y.withCredentials = !!o.withCredentials), a && a !== "json" && (y.responseType = o.responseType), u && ([g, b, h] = yr(
      u,
      !0
    ), y.addEventListener("progress", g)), c && y.upload && ([f, S] = yr(c), y.upload.addEventListener("progress", f), y.upload.addEventListener("loadend", S)), (o.cancelToken || o.signal) && (d = (x) => {
      y && (n(!x || x.type ? new Yt(null, e, y) : x), y.abort(), w(), y = null);
    }, o.cancelToken && o.cancelToken.subscribe(d), o.signal && (o.signal.aborted ? d() : o.signal.addEventListener("abort", d)));
    const _ = zr(o.url);
    if (_ && !Ee.protocols.includes(_)) {
      n(
        new I(
          "Unsupported protocol " + _ + ":",
          I.ERR_BAD_REQUEST,
          e
        )
      ), w();
      return;
    }
    y.send(i || null);
  });
}, Gc = (e, t) => {
  if (e = e ? e.filter(Boolean) : [], !t && !e.length)
    return;
  const r = new AbortController();
  let n = !1;
  const o = function(c) {
    if (!n) {
      n = !0, s();
      const u = c instanceof Error ? c : this.reason;
      r.abort(
        u instanceof I ? u : new Yt(u instanceof Error ? u.message : u)
      );
    }
  };
  let i = t && setTimeout(() => {
    i = null, o(new I(`timeout of ${t}ms exceeded`, I.ETIMEDOUT));
  }, t);
  const s = () => {
    e && (i && clearTimeout(i), i = null, e.forEach((c) => {
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
  return a.unsubscribe = () => p.asap(s), a;
}, Yc = function* (e, t) {
  let r = e.byteLength;
  if (r < t) {
    yield e;
    return;
  }
  let n = 0, o;
  for (; n < r; )
    o = n + t, yield e.slice(n, o), n = o;
}, Jc = async function* (e, t) {
  for await (const r of Xc(e))
    yield* Yc(r, t);
}, Xc = async function* (e) {
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
}, ro = (e, t, r, n) => {
  const o = Jc(e, t);
  let i = 0, s, a = (c) => {
    s || (s = !0, n && n(c));
  };
  return new ReadableStream(
    {
      async pull(c) {
        try {
          const { done: u, value: d } = await o.next();
          if (u) {
            a(), c.close();
            return;
          }
          let f = d.byteLength;
          if (r) {
            let g = i += f;
            r(g);
          }
          c.enqueue(new Uint8Array(d));
        } catch (u) {
          throw a(u), u;
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
}, no = (e) => e >= 48 && e <= 57 || e >= 65 && e <= 70 || e >= 97 && e <= 102, ji = (e, t, r) => t + 2 < r && no(e.charCodeAt(t + 1)) && no(e.charCodeAt(t + 2)), oo = (e) => e <= 57 ? e - 48 : (e & 223) - 55, Zc = (e) => e >= 65 && e <= 90 || // A-Z
e >= 97 && e <= 122 || // a-z
e >= 48 && e <= 57 || // 0-9
e === 43 || // +
e === 47 || // /
e === 45 || // - (base64url)
e === 95, Qc = (e) => e === 9 || e === 10 || e === 12 || e === 13 || e === 32, el = (e) => {
  const t = Math.floor(e / 4), r = e % 4;
  return t * 3 + (r === 2 ? 1 : r === 3 ? 2 : 0);
}, tl = (e) => {
  const t = e.length;
  let r = 0;
  return t > 0 && e.charCodeAt(t - 1) === 61 && (r++, t > 1 && e.charCodeAt(t - 2) === 61 && r++), Math.floor((t - r) * 3 / 4);
}, rl = (e) => {
  const t = e.length;
  let r = 0, n = 0, o = !1;
  for (let i = 0; i < t; i++) {
    let s = e.charCodeAt(i);
    if (s === 37 && ji(e, i, t) && (s = oo(e.charCodeAt(i + 1)) * 16 + oo(e.charCodeAt(i + 2)), i += 2), !Qc(s)) {
      if (s === 61) {
        n++;
        continue;
      }
      if (!Zc(s) || n > 0) {
        o = !0;
        continue;
      }
      r++;
    }
  }
  return o || n > 2 || n > 0 && (r + n) % 4 !== 0 || r % 4 === 1 ? tl(e) : el(r);
}, nl = (e, t) => {
  if (!e || typeof e != "string" || !e.startsWith("data:")) return 0;
  const r = e.indexOf(",");
  if (r < 0) return 0;
  const n = e.slice(5, r), o = e.slice(r + 1);
  if (/;base64/i.test(n))
    return t(o);
  let s = 0;
  for (let a = 0, c = o.length; a < c; a++) {
    const u = o.charCodeAt(a);
    if (u === 37 && ji(o, a, c))
      s += 1, a += 2;
    else if (u < 128)
      s += 1;
    else if (u < 2048)
      s += 2;
    else if (u >= 55296 && u <= 56319 && a + 1 < c) {
      const d = o.charCodeAt(a + 1);
      d >= 56320 && d <= 57343 ? (s += 4, a++) : s += 3;
    } else
      s += 3;
  }
  return s;
};
function ol(e) {
  const t = typeof e == "string" ? e.indexOf("#") : -1;
  return nl(
    t === -1 ? e : e.slice(0, t),
    rl
  );
}
const On = "1.20.0", io = 64 * 1024, il = {
  cache: "default",
  redirect: "follow",
  referrer: "about:client",
  referrerPolicy: "",
  mode: "cors",
  integrity: "",
  keepalive: !1,
  priority: "auto",
  window: null
}, { isFunction: Qt } = p, sl = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, r) => String.fromCharCode(parseInt(r, 16))
), so = (e) => {
  if (!p.isString(e))
    return e;
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}, ao = (e, ...t) => {
  try {
    return !!e(...t);
  } catch {
    return !1;
  }
}, al = (e) => {
  const t = e.indexOf("://");
  let r = e;
  return t !== -1 && (r = r.slice(t + 3)), r.includes("@") || r.includes(":");
}, cl = (e) => {
  const t = p.global !== void 0 && p.global !== null ? p.global : globalThis, { ReadableStream: r, TextEncoder: n } = t;
  e = p.merge.call(
    {
      skipUndefined: !0
    },
    {
      Request: t.Request,
      Response: t.Response
    },
    e
  );
  const { fetch: o, Request: i, Response: s } = e, a = o ? Qt(o) : typeof fetch == "function", c = Qt(i), u = Qt(s);
  if (!a)
    return !1;
  const d = a && Qt(r), f = a && (typeof n == "function" ? /* @__PURE__ */ ((y) => (C) => y.encode(C))(new n()) : async (y) => new Uint8Array(await new i(y).arrayBuffer())), g = c && d && ao(() => {
    let y = !1;
    const C = new i(Ee.origin, {
      body: new r(),
      method: "POST",
      get duplex() {
        return y = !0, "half";
      }
    }), _ = C.headers.has("Content-Type");
    return C.body != null && C.body.cancel(), y && !_;
  }), S = u && d && ao(() => p.isReadableStream(new s("").body)), b = {
    stream: S && ((y) => y.body)
  };
  a && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((y) => {
    !b[y] && (b[y] = (C, _) => {
      let x = C && C[y];
      if (x)
        return x.call(C);
      throw new I(
        `Response type '${y}' is not supported`,
        I.ERR_NOT_SUPPORT,
        _
      );
    });
  });
  const h = async (y) => {
    if (y == null)
      return 0;
    if (p.isBlob(y))
      return y.size;
    if (p.isSpecCompliantForm(y))
      return (await new i(Ee.origin, {
        method: "POST",
        body: y
      }).arrayBuffer()).byteLength;
    if (p.isArrayBufferView(y) || p.isArrayBuffer(y))
      return y.byteLength;
    if (p.isURLSearchParams(y) && (y = y + ""), p.isString(y))
      return (await f(y)).byteLength;
  }, w = async (y, C) => {
    const _ = p.toFiniteNumber(y.getContentLength());
    return _ ?? h(C);
  };
  return async (y) => {
    let {
      url: C,
      method: _,
      data: x,
      signal: T,
      cancelToken: $,
      timeout: Y,
      onDownloadProgress: V,
      onUploadProgress: B,
      responseType: M,
      headers: v,
      withCredentials: l = "same-origin",
      fetchOptions: H,
      maxContentLength: k,
      maxBodyLength: X,
      maxRedirects: Z
    } = Ui(y);
    const ae = p.isNumber(k) && k > -1, he = p.isNumber(X) && X > -1, Me = (O) => p.hasOwnProp(y, O) ? y[O] : void 0;
    let R = o || fetch;
    M = M ? (M + "").toLowerCase() : "text";
    let N = Gc(
      [T, $ && $.toAbortSignal()],
      Y
    ), D = null;
    const U = N && N.unsubscribe && (() => {
      N.unsubscribe();
    });
    let W, G = null;
    const K = () => new I(
      "Request body larger than maxBodyLength limit",
      I.ERR_BAD_REQUEST,
      y,
      D
    );
    try {
      let O;
      const L = Me("auth");
      if (L) {
        const q = p.getSafeProp(L, "username") || "", oe = p.getSafeProp(L, "password") || "";
        O = {
          username: q,
          password: oe
        };
      }
      if (al(C)) {
        const q = new URL(C, Ee.origin);
        if (!O && (q.username || q.password)) {
          const oe = so(q.username), Ae = so(q.password);
          O = {
            username: oe,
            password: Ae
          };
        }
        (q.username || q.password) && (q.username = "", q.password = "", C = q.href);
      }
      if (O && (v.delete("authorization"), v.set(
        "Authorization",
        "Basic " + btoa(sl((O.username || "") + ":" + (O.password || "")))
      )), ae && typeof C == "string" && C.startsWith("data:") && ol(C) > k)
        throw new I(
          "maxContentLength size of " + k + " exceeded",
          I.ERR_BAD_RESPONSE,
          y,
          D
        );
      if (he && _ !== "get" && _ !== "head") {
        const q = await h(x);
        if (typeof q == "number" && isFinite(q) && (W = q, q > X))
          throw K();
      }
      const z = he && (p.isReadableStream(x) || p.isStream(x)), Q = (q, oe, Ae) => ro(
        q,
        io,
        (Ne) => {
          if (he && Ne > X)
            throw G = K();
          oe && oe(Ne);
        },
        Ae
      );
      if (g && _ !== "get" && _ !== "head" && (B || z)) {
        if (W = W ?? await w(v, x), W !== 0 || z) {
          let q = new i(C, {
            method: "POST",
            body: x,
            duplex: "half"
          }), oe;
          if (p.isFormData(x) && (oe = q.headers.get("content-type")) && v.setContentType(oe), q.body) {
            const [Ae, Ne] = B && Zn(
              W,
              yr(Qn(B))
            ) || [];
            x = Q(q.body, Ae, Ne);
          }
        }
      } else if (z && !c && d && _ !== "get" && _ !== "head")
        x = Q(x);
      else if (z && c && !g && _ !== "get" && _ !== "head")
        throw new I(
          "Stream request bodies are not supported by the current fetch implementation",
          I.ERR_NOT_SUPPORT,
          y,
          D
        );
      p.isString(l) || (l = l ? "include" : "omit");
      const Se = c && "credentials" in i.prototype;
      if (p.isFormData(x)) {
        const q = v.getContentType();
        q && /^multipart\/form-data/i.test(q) && !/boundary=/i.test(q) && v.delete("content-type");
      }
      v.set("User-Agent", "axios/" + On, !1);
      const P = H == null ? H : Object.assign(/* @__PURE__ */ Object.create(null), H);
      P && (delete P.body, delete P.headers, delete P.method, delete P.signal, delete P.duplex, delete P.credentials);
      const ue = Object.assign(/* @__PURE__ */ Object.create(null), P, {
        signal: N,
        method: _.toUpperCase(),
        headers: Ri(v.normalize()),
        body: x,
        duplex: "half",
        credentials: Se ? l : void 0
      });
      c && (p.forEach(il, (q, oe) => {
        ue[oe] === void 0 && (ue[oe] = q);
      }), ue.signal === void 0 && (ue.signal = null), ue.body === void 0 && (ue.body = null)), Z === 0 && (ue.redirect = "manual", P && (P.redirect = "manual")), D = c && new i(C, ue);
      let we = await (c ? R(D, P) : R(C, ue));
      const Je = Ce.from(we.headers);
      if (ae) {
        const q = p.toFiniteNumber(Je.getContentLength());
        if (q != null && q > k)
          throw new I(
            "maxContentLength size of " + k + " exceeded",
            I.ERR_BAD_RESPONSE,
            y,
            D
          );
      }
      const Ot = S && (M === "stream" || M === "response");
      if (S && we.body && (V || ae || Ot && U)) {
        const q = {};
        ["status", "statusText", "headers"].forEach((Ze) => {
          q[Ze] = we[Ze];
        });
        const oe = p.toFiniteNumber(Je.getContentLength()), [Ae, Ne] = V && Zn(
          oe,
          yr(Qn(V), !0)
        ) || [];
        let Xe = 0;
        const Mr = (Ze) => {
          if (ae && (Xe = Ze, Xe > k))
            throw new I(
              "maxContentLength size of " + k + " exceeded",
              I.ERR_BAD_RESPONSE,
              y,
              D
            );
          Ae && Ae(Ze);
        };
        we = new s(
          ro(we.body, io, Mr, () => {
            Ne && Ne(), U && U();
          }),
          q
        );
      }
      M = M || "text";
      let Pe = await b[p.findKey(b, M) || "text"](
        we,
        y
      );
      if (ae && !S && !Ot) {
        let q;
        if (Pe != null && (typeof Pe.byteLength == "number" ? q = Pe.byteLength : typeof Pe.size == "number" ? q = Pe.size : typeof Pe == "string" && (q = typeof n == "function" ? new n().encode(Pe).byteLength : Pe.length)), typeof q == "number" && q > k)
          throw new I(
            "maxContentLength size of " + k + " exceeded",
            I.ERR_BAD_RESPONSE,
            y,
            D
          );
      }
      return !Ot && U && U(), await new Promise((q, oe) => {
        Mi(q, oe, {
          data: Pe,
          headers: Ce.from(we.headers),
          status: we.status,
          statusText: we.statusText,
          config: y,
          request: D
        });
      });
    } catch (O) {
      if (U && U(), N && N.aborted && N.reason instanceof I) {
        const L = N.reason;
        throw L.config = y, D && (L.request = D), O !== L && Object.defineProperty(L, "cause", {
          __proto__: null,
          value: O,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), L;
      }
      if (G)
        throw D && !G.request && (G.request = D), G;
      if (O instanceof I)
        throw D && !O.request && (O.request = D), O;
      if (O && O.name === "TypeError" && /Load failed|fetch/i.test(O.message)) {
        const L = new I(
          "Network Error",
          I.ERR_NETWORK,
          y,
          D,
          O && O.response
        );
        throw Object.defineProperty(L, "cause", {
          __proto__: null,
          value: O.cause || O,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), L;
      }
      throw I.from(O, O && O.code, y, D, O && O.response);
    }
  };
}, ll = /* @__PURE__ */ new Map(), Hi = (e) => {
  let t = e && e.env || {};
  const { fetch: r, Request: n, Response: o } = t, i = [n, o, r];
  let s = i.length, a = s, c, u, d = ll;
  for (; a--; )
    c = i[a], u = d.get(c), u === void 0 && d.set(c, u = a ? /* @__PURE__ */ new Map() : cl(t)), d = u;
  return u;
};
Hi();
const Rn = {
  http: gc,
  xhr: Kc,
  fetch: {
    get: Hi
  }
};
p.forEach(Rn, (e, t) => {
  if (e) {
    try {
      Object.defineProperty(e, "name", { __proto__: null, value: t });
    } catch {
    }
    Object.defineProperty(e, "adapterName", { __proto__: null, value: t });
  }
});
const co = (e) => `- ${e}`, ul = (e) => p.isFunction(e) || e === null || e === !1;
function dl(e, t) {
  e = p.isArray(e) ? e : [e];
  const { length: r } = e;
  let n, o;
  const i = {};
  for (let s = 0; s < r; s++) {
    n = e[s];
    let a;
    if (o = n, !ul(n) && (o = Rn[(a = String(n)).toLowerCase()], o === void 0))
      throw new I(`Unknown adapter '${a}'`);
    if (o && (p.isFunction(o) || (o = o.get(t))))
      break;
    i[a || "#" + s] = o;
  }
  if (!o) {
    const s = Object.entries(i).map(
      ([c, u]) => `adapter ${c} ` + (u === !1 ? "is not supported by the environment" : "is not available in the build")
    );
    let a = r ? s.length > 1 ? `since :
` + s.map(co).join(`
`) : " " + co(s[0]) : "as no adapter specified";
    throw new I(
      "There is no suitable adapter to dispatch the request " + a,
      I.ERR_NOT_SUPPORT
    );
  }
  return o;
}
const Vi = {
  /**
   * Resolve an adapter from a list of adapter names or functions.
   * @type {Function}
   */
  getAdapter: dl,
  /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */
  adapters: Rn
};
function qr(e) {
  if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted)
    throw new Yt(null, e);
}
function Kr(e) {
  const t = p.toSafeFlatObject(e);
  return qr(t), t.headers = Ce.from(p.getSafeProp(t, "headers")), t.data = Wr.call(t, t.transformRequest), ["post", "put", "patch"].indexOf(t.method) !== -1 && t.headers.setContentType("application/x-www-form-urlencoded", !1), Vi.getAdapter(t.adapter || Gt.adapter, t)(t).then(
    function(o) {
      qr(t), t.response = o;
      try {
        o.data = Wr.call(t, t.transformResponse, o);
      } finally {
        delete t.response;
      }
      return o.headers = Ce.from(o.headers), o;
    },
    function(o) {
      if (!Li(o) && (qr(t), o && o.response)) {
        t.response = o.response;
        try {
          o.response.data = Wr.call(
            t,
            t.transformResponse,
            o.response
          );
        } finally {
          delete t.response;
        }
        o.response.headers = Ce.from(o.response.headers);
      }
      return Promise.reject(o);
    }
  );
}
const Tr = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((e, t) => {
  Tr[e] = function(n) {
    return typeof n === e || "a" + (t < 1 ? "n " : " ") + e;
  };
});
const lo = {};
Tr.transitional = function(t, r, n) {
  function o(i, s) {
    return "[Axios v" + On + "] Transitional option '" + i + "'" + s + (n ? ". " + n : "");
  }
  return (i, s, a) => {
    if (t === !1)
      throw new I(
        o(s, " has been removed" + (r ? " in " + r : "")),
        I.ERR_DEPRECATED
      );
    return r && !lo[s] && (lo[s] = !0, console.warn(
      o(
        s,
        " has been deprecated since v" + r + " and will be removed in the near future"
      )
    )), t ? t(i, s, a) : !0;
  };
};
Tr.spelling = function(t) {
  return (r, n) => (console.warn(`${n} is likely a misspelling of ${t}`), !0);
};
function fl(e, t, r) {
  if (typeof e != "object" || e === null)
    throw new I("options must be an object", I.ERR_BAD_OPTION_VALUE);
  const n = Object.keys(e);
  let o = n.length;
  for (; o-- > 0; ) {
    const i = n[o], s = Object.prototype.hasOwnProperty.call(t, i) ? t[i] : void 0;
    if (s) {
      const a = e[i], c = a === void 0 || s(a, i, e);
      if (c !== !0)
        throw new I(
          "option " + i + " must be " + c,
          I.ERR_BAD_OPTION_VALUE
        );
      continue;
    }
    if (r !== !0)
      throw new I("Unknown option " + i, I.ERR_BAD_OPTION);
  }
}
const dr = {
  assertOptions: fl,
  validators: Tr
}, Te = dr.validators;
let at = class {
  constructor(t) {
    this.defaults = t || {}, this.interceptors = {
      request: new Jn(),
      response: new Jn()
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
          const i = o.stack;
          let s = "";
          if (typeof i == "string") {
            const a = i.indexOf(`
`);
            s = a === -1 ? "" : i.slice(a + 1);
          }
          if (!n.stack)
            n.stack = s;
          else if (s) {
            const a = s.indexOf(`
`), c = a === -1 ? -1 : s.indexOf(`
`, a + 1), u = c === -1 ? "" : s.slice(c + 1);
            String(n.stack).endsWith(u) || (n.stack += `
` + s);
          }
        } catch {
        }
      throw n;
    }
  }
  _request(t, r) {
    typeof t == "string" ? (r = r || {}, r.url = t) : r = t || {}, r = ft(this.defaults, r);
    const { transitional: n, paramsSerializer: o, headers: i } = r;
    n !== void 0 && dr.assertOptions(
      n,
      {
        silentJSONParsing: Te.transitional(Te.boolean),
        forcedJSONParsing: Te.transitional(Te.boolean),
        clarifyTimeoutError: Te.transitional(Te.boolean),
        legacyInterceptorReqResOrdering: Te.transitional(Te.boolean),
        advertiseZstdAcceptEncoding: Te.transitional(Te.boolean),
        validateStatusUndefinedResolves: Te.transitional(Te.boolean)
      },
      !1
    ), o != null && (p.isFunction(o) ? r.paramsSerializer = {
      serialize: o
    } : dr.assertOptions(
      o,
      {
        encode: Te.function,
        serialize: Te.function
      },
      !0
    )), r.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? r.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : r.allowAbsoluteUrls = !0), dr.assertOptions(
      r,
      {
        baseUrl: Te.spelling("baseURL"),
        withXsrfToken: Te.spelling("withXSRFToken")
      },
      !0
    ), r.method = (p.getSafeProp(r, "method") || p.getSafeProp(this.defaults, "method") || "get").toLowerCase();
    let s = i && p.merge(i.common, i[r.method]);
    i && p.forEach(Di.concat("common"), (b) => {
      delete i[b];
    }), r.headers = Ce.concat(s, i);
    const a = [];
    let c = !0;
    this.interceptors.request.forEach(function(h) {
      if (typeof h.runWhen == "function" && h.runWhen(r) === !1)
        return;
      c = c && h.synchronous;
      const w = r.transitional || Tn;
      w && w.legacyInterceptorReqResOrdering ? a.unshift(h.fulfilled, h.rejected) : a.push(h.fulfilled, h.rejected);
    });
    const u = [];
    this.interceptors.response.forEach(function(h) {
      u.push(h.fulfilled, h.rejected);
    });
    let d, f = 0, g;
    if (!c) {
      const b = [Kr.bind(this), void 0];
      for (b.unshift(...a), b.push(...u), g = b.length, d = Promise.resolve(r); f < g; )
        d = d.then(b[f++], b[f++]);
      return d;
    }
    g = a.length;
    let S = r;
    for (; f < g; ) {
      const b = a[f++], h = a[f++];
      try {
        S = b ? b(S) : S;
      } catch (w) {
        if (!h) {
          d = Promise.reject(w);
          break;
        }
        try {
          const y = h.call(this, w);
          p.isThenable(y) && (d = Promise.resolve(y).then(
            () => Kr.call(this, S)
          ));
        } catch (y) {
          d = Promise.reject(y);
        }
        break;
      }
    }
    if (!d)
      try {
        d = Kr.call(this, S);
      } catch (b) {
        d = Promise.reject(b);
      }
    for (f = 0, g = u.length; f < g; )
      d = d.then(u[f++], u[f++]);
    return d;
  }
  getUri(t) {
    t = ft(this.defaults, t);
    const r = Bi(t.baseURL, t.url, t.allowAbsoluteUrls, t);
    return Pi(r, t.params, t.paramsSerializer);
  }
};
p.forEach(["delete", "get", "head", "options"], function(t) {
  at.prototype[t] = function(r, n) {
    return this.request(
      ft(n || {}, {
        method: t,
        url: r,
        data: n && p.hasOwnProp(n, "data") ? n.data : void 0
      })
    );
  };
});
p.forEach(["post", "put", "patch", "query"], function(t) {
  function r(n) {
    return function(i, s, a) {
      return this.request(
        ft(a || {}, {
          method: t,
          headers: n ? {
            "Content-Type": "multipart/form-data"
          } : {},
          url: i,
          data: s
        })
      );
    };
  }
  at.prototype[t] = r(), t !== "query" && (at.prototype[t + "Form"] = r(!0));
});
let pl = class Wi {
  constructor(t) {
    if (typeof t != "function")
      throw new TypeError("executor must be a function.");
    let r;
    this.promise = new Promise(function(i) {
      r = i;
    });
    const n = this;
    this.promise.then((o) => {
      if (!n._listeners) return;
      let i = n._listeners.length;
      for (; i-- > 0; )
        n._listeners[i](o);
      n._listeners = null;
    }), this.promise.then = (o) => {
      let i;
      const s = new Promise((a) => {
        n.subscribe(a), i = a;
      }).then(o);
      return s.cancel = function() {
        n.unsubscribe(i);
      }, s;
    }, t(function(i, s, a) {
      n.reason || (n.reason = new Yt(i, s, a), r(n.reason));
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
      token: new Wi(function(o) {
        t = o;
      }),
      cancel: t
    };
  }
};
function hl(e) {
  return function(r) {
    return e.apply(null, r);
  };
}
function ml(e) {
  return p.isObject(e) && e.isAxiosError === !0;
}
const fr = {
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
Object.entries(fr).forEach(([e, t]) => {
  fr[t] === void 0 && (fr[t] = e);
});
function zi(e) {
  const t = new at(e), r = mi(at.prototype.request, t);
  return p.extend(r, at.prototype, t, { allOwnKeys: !0 }), p.extend(r, t, null, { allOwnKeys: !0 }), r.create = function(o) {
    return zi(ft(e, o));
  }, r;
}
const ge = zi(Gt);
ge.Axios = at;
ge.CanceledError = Yt;
ge.CancelToken = pl;
ge.isCancel = Li;
ge.VERSION = On;
ge.toFormData = xr;
ge.AxiosError = I;
ge.Cancel = ge.CanceledError;
ge.all = function(t) {
  return Promise.all(t);
};
ge.spread = hl;
ge.isAxiosError = ml;
ge.mergeConfig = ft;
ge.AxiosHeaders = Ce;
ge.formToJSON = (e) => $i(p.isHTMLForm(e) ? new FormData(e) : e);
ge.getAdapter = Vi.getAdapter;
ge.HttpStatusCode = fr;
ge.default = ge;
const {
  Axios: Ff,
  AxiosError: Bf,
  CanceledError: Uf,
  isCancel: jf,
  CancelToken: Hf,
  VERSION: Vf,
  all: Wf,
  Cancel: zf,
  isAxiosError: qf,
  spread: Kf,
  toFormData: Gf,
  AxiosHeaders: Yf,
  HttpStatusCode: Jf,
  formToJSON: Xf,
  getAdapter: Zf,
  mergeConfig: Qf,
  create: ep
} = ge, gl = [
  be.ENDPOINTS.REFRESH,
  be.ENDPOINTS.MAGIC_LINK_REQUEST,
  be.ENDPOINTS.MAGIC_LINK_VERIFY,
  be.ENDPOINTS.PASSKEY_LOGIN_OPTIONS,
  be.ENDPOINTS.PASSKEY_LOGIN_VERIFY
], yl = (e) => !!e && gl.some((t) => e.split("?")[0].endsWith(t)), bl = (e, t) => {
  const r = ge.create({
    baseURL: e,
    timeout: be.DEFAULT_CONFIG.TIMEOUT,
    headers: {
      "Content-Type": "application/json",
      ...t && { "X-API-Key": t }
    }
  });
  return r.interceptors.request.use(
    (n) => {
      const o = ze.getAccessToken();
      return o && n.headers && (n.headers.Authorization = `Bearer ${o}`), n;
    },
    (n) => Promise.reject(n)
  ), r.interceptors.response.use(
    (n) => n,
    async (n) => {
      const o = n.config;
      if (n.response?.status === be.STATUS_CODES.UNAUTHORIZED && !o._retry && !yl(o.url)) {
        o._retry = !0;
        try {
          const i = ze.getRefreshToken();
          if (!i)
            throw new Error(ia.NO_REFRESH_TOKEN);
          const s = await r.post(be.ENDPOINTS.REFRESH, {
            refreshToken: i
          }), a = {
            accessToken: s.data.accessToken,
            refreshToken: s.data.refreshToken
          };
          return ze.setTokens(a.accessToken, a.refreshToken), o.headers && (o.headers.Authorization = `Bearer ${a.accessToken}`), r(o);
        } catch (i) {
          return ze.clearTokens(), window.location.href = "/login", Promise.reject(i);
        }
      }
      return Promise.reject(n);
    }
  ), r;
};
let er = null;
const Ve = (e, t) => {
  if (!er && e && (er = bl(e, t)), !er)
    throw new Error("API client not initialized. Please provide baseURL.");
  return er;
}, uo = (e, t) => e?.name === "NotAllowedError" ? "Passkey request was cancelled or timed out" : e?.name === "InvalidStateError" ? "A passkey for this account is already registered on this device" : e?.response?.data?.message || e?.message || t, Ge = {
  /**
   * Logout user and invalidate refresh token
   * @param refreshToken - The refresh token to invalidate
   * @returns Promise resolving when logout is complete
   */
  logout: async (e) => {
    try {
      await Ve().post(be.ENDPOINTS.LOGOUT, {
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
      const r = await Ve().post(be.ENDPOINTS.REFRESH, {
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
      const t = await Ve().get(be.ENDPOINTS.USER_ME), r = t.data?.data ?? t.data;
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
      await Ve().post(be.ENDPOINTS.MAGIC_LINK_REQUEST, {
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
      const r = await Ve().post(be.ENDPOINTS.MAGIC_LINK_VERIFY, {
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
      const e = Ve(), t = await e.post(be.ENDPOINTS.PASSKEY_LOGIN_OPTIONS), { challengeId: r, options: n } = t.data, o = await Ks({ optionsJSON: n }), i = await e.post(
        be.ENDPOINTS.PASSKEY_LOGIN_VERIFY,
        { challengeId: r, response: o },
        { withCredentials: !0 }
      );
      return {
        tokens: {
          accessToken: i.data.accessToken,
          refreshToken: i.data.refreshToken
        },
        user: i.data.user
      };
    } catch (e) {
      throw new Error(uo(e, "Passkey sign-in failed"));
    }
  },
  /**
   * Register a new passkey for the currently signed-in user
   * @param name - Optional friendly name for the passkey (e.g. "MacBook Pro")
   * @returns Promise resolving to the stored passkey info
   */
  registerPasskey: async (e) => {
    try {
      const t = Ve(), r = await t.post(be.ENDPOINTS.PASSKEY_REGISTER_OPTIONS), { challengeId: n, options: o } = r.data, i = await Ws({ optionsJSON: o });
      return (await t.post(be.ENDPOINTS.PASSKEY_REGISTER_VERIFY, {
        challengeId: n,
        response: i,
        name: e
      })).data;
    } catch (t) {
      throw new Error(uo(t, "Passkey registration failed"));
    }
  }
}, Sl = [0, 45, 90, 135, 180, 225, 270, 315], El = (e) => /* @__PURE__ */ F(St, { ...e, viewBox: "0 0 24 24", children: [
  /* @__PURE__ */ m("circle", { cx: "12", cy: "12", r: "4.6", fill: "currentColor" }),
  Sl.map((t) => /* @__PURE__ */ m(
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
] }), wl = (e) => {
  const t = `lumora-moon-${Es()}`;
  return /* @__PURE__ */ F(St, { ...e, viewBox: "0 0 24 24", children: [
    /* @__PURE__ */ F("mask", { id: t, children: [
      /* @__PURE__ */ m("rect", { width: "24", height: "24", fill: "#fff" }),
      /* @__PURE__ */ m("circle", { cx: "15.8", cy: "8.2", r: "4.6", fill: "#000" })
    ] }),
    /* @__PURE__ */ m("circle", { cx: "12", cy: "12", r: "7.5", fill: "currentColor", mask: `url(#${t})` })
  ] });
}, xl = ({ title: e, height: t, color: r }) => /* @__PURE__ */ F(
  "svg",
  {
    role: "img",
    "aria-label": e,
    viewBox: "0 0 143 38",
    height: t,
    width: t * 143 / 38,
    style: { display: "block", fill: r, transition: pi },
    children: [
      /* @__PURE__ */ m("path", { d: "M47.0556 19.7972V5.34429C46.8088 5.38305 46.7507 5.68829 46.6442 5.89178C44.5245 9.8599 43.0533 14.7341 40.9288 18.7022C40.7691 19.0026 40.4496 19.8069 40.1109 19.8069C39.3753 19.8166 34.4438 6.74452 33.1662 5.34429V19.8069H31.8595V1.87036H34.5551L40.6674 15.141L41.0885 15.4075L47.1379 1.87036H49.6689V19.3369C49.6689 19.395 49.6544 19.6567 49.6544 19.7923" }),
      /* @__PURE__ */ m("path", { d: "M79.0544 11.4152L77.1235 11.3764V19.6034H74.3456V1.87036H80.966C82.9212 2.09324 85.3845 3.34327 85.6265 5.79972C85.9362 8.95387 84.3876 9.98588 82.0937 10.9985C81.9243 11.0712 81.813 10.9016 81.871 11.2844L87.4268 19.6082H84.7312M77.1235 10.4704C80.1336 11.1099 84.3827 8.60503 82.3308 4.73865C81.9194 3.96344 80.4385 2.97504 79.6594 2.97504H77.1283V10.4752L77.1235 10.4704Z" }),
      /* @__PURE__ */ m("path", { d: "M60.9113 1.56022C67.2753 0.857678 72.7294 6.97702 70.2903 14.0702C67.8366 21.1973 58.5593 22.2197 54.7651 16.0179C51.1113 10.044 54.6199 2.25791 60.9161 1.56506L60.9113 1.56022ZM60.9064 2.46625C54.8135 3.61938 54.7409 18.6779 61.6856 19.2448C69.8644 19.9134 69.8741 0.770466 60.9064 2.46625Z" }),
      /* @__PURE__ */ m("path", { d: "M16.8233 1.87036V14.2156C16.8233 17.5345 20.7675 19.7293 23.4486 18.707C24.6391 18.2564 26.4539 16.2263 26.6282 14.768V1.87036H27.9348V14.8552C27.9348 15.1653 27.5767 16.3862 27.3977 16.769C24.8375 22.2294 14.21 20.6499 14.21 14.5839V1.87036H16.8233Z" }),
      /* @__PURE__ */ m("path", { d: "M95.669 1.49707L103.432 19.6177H100.736L98.3453 13.789C96.2062 13.789 93.9413 13.7503 91.9039 13.7503C91.6232 13.7503 91.6571 13.7503 91.4732 13.7503L88.9421 19.797H87.6403M91.9232 12.665H97.7161L95.0205 5.89641" }),
      /* @__PURE__ */ m("path", { d: "M4.0761 1.87036V18.5132H12.0855V19.6131H1.29822V2.14653L1.54503 1.87036H4.0761Z" }),
      /* @__PURE__ */ m("path", { d: "M37.7396 32.782V37.3557H36.2684V27.4814H40.111C41.0692 27.4814 41.5725 28.1598 41.829 28.4844C42.5647 29.4146 42.584 31.062 41.829 31.968C41.6597 32.1715 41.1031 32.7335 40.4353 32.7868H37.7396V32.782ZM37.7396 28.0289V32.1424C39.1867 32.5494 40.8563 32.2199 40.8563 30.311C40.8563 28.402 39.1818 27.8351 37.7396 28.0241V28.0289Z" }),
      /* @__PURE__ */ m("path", { d: "M8.81874 29.8504L8.1654 29.957C6.65547 26.6236 2.85645 27.297 1.90307 30.8049C0.543162 35.8292 5.6053 39.5793 8.32027 34.6906L8.8139 34.7924C7.27977 38.9737 1.36588 38.1985 0.238272 34.0559C-1.4362 27.893 6.17152 24.4094 8.8139 29.8504H8.81874Z" }),
      /* @__PURE__ */ m("path", { d: "M26.4589 37.3505L25.0119 37.3262L23.8601 34.1721L19.9207 34.1479L18.5898 37.3262L17.7961 37.3505L22.0452 27.1128M20.2546 33.329H23.3616L21.9678 29.4869" }),
      /* @__PURE__ */ m("path", { d: "M71.2435 27.4766V28.0241H68.1414V37.3508H66.6702V28.0241H63.6455L63.3987 27.4766H71.2435Z" }),
      /* @__PURE__ */ m("path", { d: "M99.5161 27.4766V36.8033H103.925V37.3508H98.04V27.4766H99.5112H99.5161Z" }),
      /* @__PURE__ */ m("path", { d: "M54.0825 27.4766H52.6113V37.3508H54.0825V27.4766Z" }),
      /* @__PURE__ */ m("path", { d: "M112.883 22.8688L112.975 16.7204L133.112 0L133.194 6.31314L112.883 22.8688Z" }),
      /* @__PURE__ */ m("path", { d: "M112.849 37.9998L113.009 32.6169L133.228 15.8433V21.0711L112.854 37.9998H112.849Z" }),
      /* @__PURE__ */ m("path", { d: "M121.913 37.8838V32.4282L142.123 15.2766V21.1489L121.913 37.8838Z" }),
      /* @__PURE__ */ m("path", { d: "M121.792 23.4694V17.7813L142.133 0.828369V6.54557L121.792 23.4694Z" }),
      /* @__PURE__ */ m("path", { d: "M86.8706 37.3505L85.4236 37.3262L84.2718 34.1721L80.3324 34.1479L79.0016 37.3262L78.2079 37.3505L82.457 27.1128M80.6664 33.329H83.7733L82.3796 29.4869" })
    ]
  }
), fo = ({
  brandConfig: e,
  theme: t,
  onToggleColorMode: r,
  showWelcome: n = !0
}) => {
  const o = t.mode === "dark" ? "light" : "dark";
  return /* @__PURE__ */ F(
    A,
    {
      component: "header",
      sx: { "& *": { transition: pe } },
      children: [
        /* @__PURE__ */ F(
          A,
          {
            sx: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2
            },
            children: [
              e.logo ? typeof e.logo == "string" ? /* @__PURE__ */ m(
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
              ) : e.logo : /* @__PURE__ */ m(
                xl,
                {
                  title: e.companyName || "Lumora Capital",
                  height: e.logoHeight,
                  color: t.logo
                }
              ),
              /* @__PURE__ */ m(
                Cs,
                {
                  title: `Switch to ${o} mode`,
                  slotProps: {
                    tooltip: { sx: { fontFamily: t.bodyFont } }
                  },
                  children: /* @__PURE__ */ F(
                    Os,
                    {
                      "aria-label": `Switch to ${o} mode`,
                      onClick: r,
                      size: "small",
                      disableRipple: !0,
                      sx: {
                        width: 30,
                        height: 30,
                        // Light: white button, amber sun. Dark: the page's own surface, pale moon
                        backgroundColor: t.mode === "dark" ? t.surface : "#ffffff",
                        border: `2px solid ${t.mode === "dark" ? t.border : "#d9dbe1"}`,
                        transition: pe,
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
                          transition: `${zt("opacity")}, transform ${bn}ms ${wt}`
                        }
                      },
                      children: [
                        /* @__PURE__ */ m(
                          El,
                          {
                            sx: {
                              color: "#de9733",
                              opacity: t.mode === "dark" ? 0 : 1,
                              transform: t.mode === "dark" ? "rotate(-90deg) scale(0.6)" : "none"
                            }
                          }
                        ),
                        /* @__PURE__ */ m(
                          wl,
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
        n && /* @__PURE__ */ F(Un, { children: [
          /* @__PURE__ */ F(
            A,
            {
              component: "h1",
              sx: {
                m: 0,
                // Clear space between the logo and the welcome title
                mt: 4.5,
                [Ue]: { mt: 3 },
                fontFamily: t.headingFont,
                fontSize: 42,
                fontWeight: 600,
                lineHeight: 1.12,
                letterSpacing: "-0.01em",
                color: t.welcomeTitle
              },
              children: [
                e.welcomeTitle,
                e.welcomeTitleAccent && /* @__PURE__ */ F(Un, { children: [
                  " ",
                  /* @__PURE__ */ m(
                    A,
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
          e.tagline && /* @__PURE__ */ m(
            A,
            {
              component: "p",
              sx: {
                m: 0,
                mt: 1.5,
                [Ue]: { mt: 1 },
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
}, po = ({
  theme: e,
  icon: t,
  label: r,
  ariaLabel: n,
  loadingLabel: o = "Signing in...",
  isLoading: i = !1,
  disabled: s = !1,
  onClick: a
}) => /* @__PURE__ */ m(
  Ft,
  {
    fullWidth: !0,
    variant: "outlined",
    "aria-label": i ? o : n,
    startIcon: i ? /* @__PURE__ */ m(mn, { size: 18, color: "inherit" }) : t,
    onClick: a,
    disabled: s,
    sx: {
      ...lt,
      borderRadius: "10px",
      textTransform: "none",
      // Buttons are set in Montserrat
      fontFamily: e.headingFont,
      fontWeight: 600,
      fontSize: 15,
      whiteSpace: "nowrap",
      transition: pe,
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
    children: i ? o : r
  }
), Tl = ({ monochrome: e = !1, ...t }) => /* @__PURE__ */ F(St, { ...t, viewBox: "0 0 23 23", children: [
  /* @__PURE__ */ m("path", { fill: e ? "currentColor" : "#f35325", d: "M1 1h10v10H1z" }),
  /* @__PURE__ */ m("path", { fill: e ? "currentColor" : "#81bc06", d: "M12 1h10v10H12z" }),
  /* @__PURE__ */ m("path", { fill: e ? "currentColor" : "#05a6f0", d: "M1 12h10v10H1z" }),
  /* @__PURE__ */ m("path", { fill: e ? "currentColor" : "#ffba08", d: "M12 12h10v10H12z" })
] });
function Cl(e, t, r) {
  return r === void 0 && (r = {}), function(n, o, i) {
    try {
      return Promise.resolve((function(s, a) {
        try {
          var c = (t != null && t.context && process.env.NODE_ENV === "development" && console.warn("You should not used the yup options context. Please, use the 'useForm' context object instead"), Promise.resolve(e[r.mode === "sync" ? "validateSync" : "validate"](n, Object.assign({ abortEarly: !1 }, t, { context: o }))).then(function(u) {
            return i.shouldUseNativeValidation && Fs({}, i), { values: r.raw ? Object.assign({}, n) : u, errors: {} };
          }));
        } catch (u) {
          return a(u);
        }
        return c && c.then ? c.then(void 0, a) : c;
      })(0, function(s) {
        if (!s.inner) throw s;
        return { values: {}, errors: Bs((a = s, c = !i.shouldUseNativeValidation && i.criteriaMode === "all", (a.inner || []).reduce(function(u, d) {
          if (u[d.path] || (u[d.path] = { message: d.message, type: d.type }), c) {
            var f = u[d.path].types, g = f && f[d.type];
            u[d.path] = Ls(d.path, c, u, d.type, g ? [].concat(g, d.message) : d.message);
          }
          return u;
        }, {})), i) };
        var a, c;
      }));
    } catch (s) {
      return Promise.reject(s);
    }
  };
}
const Ol = Hn.object({
  email: Hn.string().email("Please enter a valid email address").required("Email is required")
}), Rl = ({
  theme: e,
  isSubmitting: t,
  disabled: r = !1,
  onSubmit: n
}) => {
  const {
    register: o,
    handleSubmit: i,
    formState: { errors: s }
  } = Ms({
    resolver: Cl(Ol)
  }), a = t || r;
  return /* @__PURE__ */ F(A, { component: "form", noValidate: !0, onSubmit: i(n), children: [
    /* @__PURE__ */ m(
      A,
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
    /* @__PURE__ */ F(A, { sx: { display: "flex", gap: 1.25 }, children: [
      /* @__PURE__ */ m(
        Rs,
        {
          ...o("email"),
          id: "lumora-work-email",
          type: "email",
          autoComplete: "email",
          placeholder: "name@lumora.capital",
          disabled: a,
          inputProps: {
            "aria-invalid": !!s.email,
            "aria-describedby": s.email ? "lumora-work-email-error" : void 0
          },
          sx: {
            flex: 1,
            minWidth: 0,
            ...lt,
            px: 2,
            borderRadius: "10px",
            border: `1px solid ${s.email ? "#d14343" : e.border}`,
            backgroundColor: e.surface,
            color: e.label,
            fontFamily: e.bodyFont,
            fontSize: 16,
            transition: pe,
            "&.Mui-focused": {
              borderColor: e.accent,
              boxShadow: `0 0 0 3px ${e.accent}26`
            },
            "& input::placeholder": {
              color: e.placeholder,
              opacity: 1,
              transition: pe
            }
          }
        }
      ),
      /* @__PURE__ */ m(
        Ft,
        {
          type: "submit",
          variant: "contained",
          disableElevation: !0,
          disabled: a,
          sx: {
            flexShrink: 0,
            ...lt,
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
            transition: pe,
            "&:hover": { backgroundColor: e.accentHover },
            ...mr(e),
            "&.Mui-disabled": {
              backgroundColor: e.accent,
              color: e.buttonText,
              opacity: 0.6
            }
          },
          children: t ? /* @__PURE__ */ m(mn, { size: 20, color: "inherit", "aria-label": "Sending sign-in link" }) : "Magic Link"
        }
      )
    ] }),
    s.email && /* @__PURE__ */ m(
      A,
      {
        id: "lumora-work-email-error",
        role: "status",
        sx: { mt: 1, fontSize: 13, color: "#d14343" },
        children: s.email.message
      }
    )
  ] });
}, _l = ({
  theme: e,
  title: t,
  description: r,
  onBackToLogin: n
}) => /* @__PURE__ */ F(A, { children: [
  /* @__PURE__ */ m(
    A,
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
      children: /* @__PURE__ */ m(Ns, {})
    }
  ),
  /* @__PURE__ */ m(
    A,
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
  /* @__PURE__ */ m(
    A,
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
      children: r
    }
  ),
  /* @__PURE__ */ m(
    Ft,
    {
      fullWidth: !0,
      variant: "outlined",
      onClick: n,
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
        ...mr(e)
      },
      children: "Back to sign in"
    }
  )
] });
function rt(e, ...t) {
  const r = new URL(`https://mui.com/production-error/?code=${e}`);
  return t.forEach((n) => r.searchParams.append("args[]", n)), `Minified MUI error #${e}; visit ${r} for the full message.`;
}
const ct = "$$material";
function Al(e) {
  for (var t = 0, r, n = 0, o = e.length; o >= 4; ++n, o -= 4)
    r = e.charCodeAt(n) & 255 | (e.charCodeAt(++n) & 255) << 8 | (e.charCodeAt(++n) & 255) << 16 | (e.charCodeAt(++n) & 255) << 24, r = /* Math.imul(k, m): */
    (r & 65535) * 1540483477 + ((r >>> 16) * 59797 << 16), r ^= /* k >>> r: */
    r >>> 24, t = /* Math.imul(k, m): */
    (r & 65535) * 1540483477 + ((r >>> 16) * 59797 << 16) ^ /* Math.imul(h, m): */
    (t & 65535) * 1540483477 + ((t >>> 16) * 59797 << 16);
  switch (o) {
    case 3:
      t ^= (e.charCodeAt(n + 2) & 255) << 16;
    case 2:
      t ^= (e.charCodeAt(n + 1) & 255) << 8;
    case 1:
      t ^= e.charCodeAt(n) & 255, t = /* Math.imul(h, m): */
      (t & 65535) * 1540483477 + ((t >>> 16) * 59797 << 16);
  }
  return t ^= t >>> 13, t = /* Math.imul(h, m): */
  (t & 65535) * 1540483477 + ((t >>> 16) * 59797 << 16), ((t ^ t >>> 15) >>> 0).toString(36);
}
var vl = {
  animationIterationCount: 1,
  aspectRatio: 1,
  borderImageOutset: 1,
  borderImageSlice: 1,
  borderImageWidth: 1,
  boxFlex: 1,
  boxFlexGroup: 1,
  boxOrdinalGroup: 1,
  columnCount: 1,
  columns: 1,
  flex: 1,
  flexGrow: 1,
  flexPositive: 1,
  flexShrink: 1,
  flexNegative: 1,
  flexOrder: 1,
  gridRow: 1,
  gridRowEnd: 1,
  gridRowSpan: 1,
  gridRowStart: 1,
  gridColumn: 1,
  gridColumnEnd: 1,
  gridColumnSpan: 1,
  gridColumnStart: 1,
  msGridRow: 1,
  msGridRowSpan: 1,
  msGridColumn: 1,
  msGridColumnSpan: 1,
  fontWeight: 1,
  lineHeight: 1,
  opacity: 1,
  order: 1,
  orphans: 1,
  scale: 1,
  tabSize: 1,
  widows: 1,
  zIndex: 1,
  zoom: 1,
  WebkitLineClamp: 1,
  // SVG-related properties
  fillOpacity: 1,
  floodOpacity: 1,
  stopOpacity: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1,
  strokeMiterlimit: 1,
  strokeOpacity: 1,
  strokeWidth: 1
};
function kl(e) {
  var t = /* @__PURE__ */ Object.create(null);
  return function(r) {
    return t[r] === void 0 && (t[r] = e(r)), t[r];
  };
}
var Pl = /[A-Z]|^ms/g, Nl = /_EMO_([^_]+?)_([^]*?)_EMO_/g, qi = function(t) {
  return t.charCodeAt(1) === 45;
}, ho = function(t) {
  return t != null && typeof t != "boolean";
}, Gr = /* @__PURE__ */ kl(function(e) {
  return qi(e) ? e : e.replace(Pl, "-$&").toLowerCase();
}), mo = function(t, r) {
  switch (t) {
    case "animation":
    case "animationName":
      if (typeof r == "string")
        return r.replace(Nl, function(n, o, i) {
          return et = {
            name: o,
            styles: i,
            next: et
          }, o;
        });
  }
  return vl[t] !== 1 && !qi(t) && typeof r == "number" && r !== 0 ? r + "px" : r;
};
function br(e, t, r) {
  if (r == null)
    return "";
  var n = r;
  if (n.__emotion_styles !== void 0)
    return n;
  switch (typeof r) {
    case "boolean":
      return "";
    case "object": {
      var o = r;
      if (o.anim === 1)
        return et = {
          name: o.name,
          styles: o.styles,
          next: et
        }, o.name;
      var i = r;
      if (i.styles !== void 0) {
        var s = i.next;
        if (s !== void 0)
          for (; s !== void 0; )
            et = {
              name: s.name,
              styles: s.styles,
              next: et
            }, s = s.next;
        var a = i.styles + ";";
        return a;
      }
      return Il(e, t, r);
    }
  }
  var c = r;
  return c;
}
function Il(e, t, r) {
  var n = "";
  if (Array.isArray(r))
    for (var o = 0; o < r.length; o++)
      n += br(e, t, r[o]) + ";";
  else
    for (var i in r) {
      var s = r[i];
      if (typeof s != "object") {
        var a = s;
        ho(a) && (n += Gr(i) + ":" + mo(i, a) + ";");
      } else if (Array.isArray(s) && typeof s[0] == "string" && t == null)
        for (var c = 0; c < s.length; c++)
          ho(s[c]) && (n += Gr(i) + ":" + mo(i, s[c]) + ";");
      else {
        var u = br(e, t, s);
        switch (i) {
          case "animation":
          case "animationName": {
            n += Gr(i) + ":" + u + ";";
            break;
          }
          default:
            n += i + "{" + u + "}";
        }
      }
    }
  return n;
}
var go = /label:\s*([^\s;{]+)\s*(;|$)/g, et;
function $l(e, t, r) {
  if (e.length === 1 && typeof e[0] == "object" && e[0] !== null && e[0].styles !== void 0)
    return e[0];
  var n = !0, o = "";
  et = void 0;
  var i = e[0];
  if (i == null || i.raw === void 0)
    n = !1, o += br(r, t, i);
  else {
    var s = i;
    o += s[0];
  }
  for (var a = 1; a < e.length; a++)
    if (o += br(r, t, e[a]), n) {
      var c = i;
      o += c[a];
    }
  go.lastIndex = 0;
  for (var u = "", d; (d = go.exec(o)) !== null; )
    u += "-" + d[1];
  var f = Al(o) + u;
  return {
    name: f,
    styles: o,
    next: et
  };
}
function Dl(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var tr = { exports: {} }, rr = { exports: {} }, ee = {};
var yo;
function Ll() {
  if (yo) return ee;
  yo = 1;
  var e = typeof Symbol == "function" && Symbol.for, t = e ? /* @__PURE__ */ Symbol.for("react.element") : 60103, r = e ? /* @__PURE__ */ Symbol.for("react.portal") : 60106, n = e ? /* @__PURE__ */ Symbol.for("react.fragment") : 60107, o = e ? /* @__PURE__ */ Symbol.for("react.strict_mode") : 60108, i = e ? /* @__PURE__ */ Symbol.for("react.profiler") : 60114, s = e ? /* @__PURE__ */ Symbol.for("react.provider") : 60109, a = e ? /* @__PURE__ */ Symbol.for("react.context") : 60110, c = e ? /* @__PURE__ */ Symbol.for("react.async_mode") : 60111, u = e ? /* @__PURE__ */ Symbol.for("react.concurrent_mode") : 60111, d = e ? /* @__PURE__ */ Symbol.for("react.forward_ref") : 60112, f = e ? /* @__PURE__ */ Symbol.for("react.suspense") : 60113, g = e ? /* @__PURE__ */ Symbol.for("react.suspense_list") : 60120, S = e ? /* @__PURE__ */ Symbol.for("react.memo") : 60115, b = e ? /* @__PURE__ */ Symbol.for("react.lazy") : 60116, h = e ? /* @__PURE__ */ Symbol.for("react.block") : 60121, w = e ? /* @__PURE__ */ Symbol.for("react.fundamental") : 60117, y = e ? /* @__PURE__ */ Symbol.for("react.responder") : 60118, C = e ? /* @__PURE__ */ Symbol.for("react.scope") : 60119;
  function _(T) {
    if (typeof T == "object" && T !== null) {
      var $ = T.$$typeof;
      switch ($) {
        case t:
          switch (T = T.type, T) {
            case c:
            case u:
            case n:
            case i:
            case o:
            case f:
              return T;
            default:
              switch (T = T && T.$$typeof, T) {
                case a:
                case d:
                case b:
                case S:
                case s:
                  return T;
                default:
                  return $;
              }
          }
        case r:
          return $;
      }
    }
  }
  function x(T) {
    return _(T) === u;
  }
  return ee.AsyncMode = c, ee.ConcurrentMode = u, ee.ContextConsumer = a, ee.ContextProvider = s, ee.Element = t, ee.ForwardRef = d, ee.Fragment = n, ee.Lazy = b, ee.Memo = S, ee.Portal = r, ee.Profiler = i, ee.StrictMode = o, ee.Suspense = f, ee.isAsyncMode = function(T) {
    return x(T) || _(T) === c;
  }, ee.isConcurrentMode = x, ee.isContextConsumer = function(T) {
    return _(T) === a;
  }, ee.isContextProvider = function(T) {
    return _(T) === s;
  }, ee.isElement = function(T) {
    return typeof T == "object" && T !== null && T.$$typeof === t;
  }, ee.isForwardRef = function(T) {
    return _(T) === d;
  }, ee.isFragment = function(T) {
    return _(T) === n;
  }, ee.isLazy = function(T) {
    return _(T) === b;
  }, ee.isMemo = function(T) {
    return _(T) === S;
  }, ee.isPortal = function(T) {
    return _(T) === r;
  }, ee.isProfiler = function(T) {
    return _(T) === i;
  }, ee.isStrictMode = function(T) {
    return _(T) === o;
  }, ee.isSuspense = function(T) {
    return _(T) === f;
  }, ee.isValidElementType = function(T) {
    return typeof T == "string" || typeof T == "function" || T === n || T === u || T === i || T === o || T === f || T === g || typeof T == "object" && T !== null && (T.$$typeof === b || T.$$typeof === S || T.$$typeof === s || T.$$typeof === a || T.$$typeof === d || T.$$typeof === w || T.$$typeof === y || T.$$typeof === C || T.$$typeof === h);
  }, ee.typeOf = _, ee;
}
var te = {};
var bo;
function Ml() {
  return bo || (bo = 1, process.env.NODE_ENV !== "production" && (function() {
    var e = typeof Symbol == "function" && Symbol.for, t = e ? /* @__PURE__ */ Symbol.for("react.element") : 60103, r = e ? /* @__PURE__ */ Symbol.for("react.portal") : 60106, n = e ? /* @__PURE__ */ Symbol.for("react.fragment") : 60107, o = e ? /* @__PURE__ */ Symbol.for("react.strict_mode") : 60108, i = e ? /* @__PURE__ */ Symbol.for("react.profiler") : 60114, s = e ? /* @__PURE__ */ Symbol.for("react.provider") : 60109, a = e ? /* @__PURE__ */ Symbol.for("react.context") : 60110, c = e ? /* @__PURE__ */ Symbol.for("react.async_mode") : 60111, u = e ? /* @__PURE__ */ Symbol.for("react.concurrent_mode") : 60111, d = e ? /* @__PURE__ */ Symbol.for("react.forward_ref") : 60112, f = e ? /* @__PURE__ */ Symbol.for("react.suspense") : 60113, g = e ? /* @__PURE__ */ Symbol.for("react.suspense_list") : 60120, S = e ? /* @__PURE__ */ Symbol.for("react.memo") : 60115, b = e ? /* @__PURE__ */ Symbol.for("react.lazy") : 60116, h = e ? /* @__PURE__ */ Symbol.for("react.block") : 60121, w = e ? /* @__PURE__ */ Symbol.for("react.fundamental") : 60117, y = e ? /* @__PURE__ */ Symbol.for("react.responder") : 60118, C = e ? /* @__PURE__ */ Symbol.for("react.scope") : 60119;
    function _(P) {
      return typeof P == "string" || typeof P == "function" || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
      P === n || P === u || P === i || P === o || P === f || P === g || typeof P == "object" && P !== null && (P.$$typeof === b || P.$$typeof === S || P.$$typeof === s || P.$$typeof === a || P.$$typeof === d || P.$$typeof === w || P.$$typeof === y || P.$$typeof === C || P.$$typeof === h);
    }
    function x(P) {
      if (typeof P == "object" && P !== null) {
        var ue = P.$$typeof;
        switch (ue) {
          case t:
            var we = P.type;
            switch (we) {
              case c:
              case u:
              case n:
              case i:
              case o:
              case f:
                return we;
              default:
                var Je = we && we.$$typeof;
                switch (Je) {
                  case a:
                  case d:
                  case b:
                  case S:
                  case s:
                    return Je;
                  default:
                    return ue;
                }
            }
          case r:
            return ue;
        }
      }
    }
    var T = c, $ = u, Y = a, V = s, B = t, M = d, v = n, l = b, H = S, k = r, X = i, Z = o, ae = f, he = !1;
    function Me(P) {
      return he || (he = !0, console.warn("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 17+. Update your code to use ReactIs.isConcurrentMode() instead. It has the exact same API.")), R(P) || x(P) === c;
    }
    function R(P) {
      return x(P) === u;
    }
    function N(P) {
      return x(P) === a;
    }
    function D(P) {
      return x(P) === s;
    }
    function U(P) {
      return typeof P == "object" && P !== null && P.$$typeof === t;
    }
    function W(P) {
      return x(P) === d;
    }
    function G(P) {
      return x(P) === n;
    }
    function K(P) {
      return x(P) === b;
    }
    function O(P) {
      return x(P) === S;
    }
    function L(P) {
      return x(P) === r;
    }
    function z(P) {
      return x(P) === i;
    }
    function Q(P) {
      return x(P) === o;
    }
    function Se(P) {
      return x(P) === f;
    }
    te.AsyncMode = T, te.ConcurrentMode = $, te.ContextConsumer = Y, te.ContextProvider = V, te.Element = B, te.ForwardRef = M, te.Fragment = v, te.Lazy = l, te.Memo = H, te.Portal = k, te.Profiler = X, te.StrictMode = Z, te.Suspense = ae, te.isAsyncMode = Me, te.isConcurrentMode = R, te.isContextConsumer = N, te.isContextProvider = D, te.isElement = U, te.isForwardRef = W, te.isFragment = G, te.isLazy = K, te.isMemo = O, te.isPortal = L, te.isProfiler = z, te.isStrictMode = Q, te.isSuspense = Se, te.isValidElementType = _, te.typeOf = x;
  })()), te;
}
var So;
function Ki() {
  return So || (So = 1, process.env.NODE_ENV === "production" ? rr.exports = Ll() : rr.exports = Ml()), rr.exports;
}
var Yr, Eo;
function Fl() {
  if (Eo) return Yr;
  Eo = 1;
  var e = Object.getOwnPropertySymbols, t = Object.prototype.hasOwnProperty, r = Object.prototype.propertyIsEnumerable;
  function n(i) {
    if (i == null)
      throw new TypeError("Object.assign cannot be called with null or undefined");
    return Object(i);
  }
  function o() {
    try {
      if (!Object.assign)
        return !1;
      var i = new String("abc");
      if (i[5] = "de", Object.getOwnPropertyNames(i)[0] === "5")
        return !1;
      for (var s = {}, a = 0; a < 10; a++)
        s["_" + String.fromCharCode(a)] = a;
      var c = Object.getOwnPropertyNames(s).map(function(d) {
        return s[d];
      });
      if (c.join("") !== "0123456789")
        return !1;
      var u = {};
      return "abcdefghijklmnopqrst".split("").forEach(function(d) {
        u[d] = d;
      }), Object.keys(Object.assign({}, u)).join("") === "abcdefghijklmnopqrst";
    } catch {
      return !1;
    }
  }
  return Yr = o() ? Object.assign : function(i, s) {
    for (var a, c = n(i), u, d = 1; d < arguments.length; d++) {
      a = Object(arguments[d]);
      for (var f in a)
        t.call(a, f) && (c[f] = a[f]);
      if (e) {
        u = e(a);
        for (var g = 0; g < u.length; g++)
          r.call(a, u[g]) && (c[u[g]] = a[u[g]]);
      }
    }
    return c;
  }, Yr;
}
var Jr, wo;
function _n() {
  if (wo) return Jr;
  wo = 1;
  var e = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
  return Jr = e, Jr;
}
var Xr, xo;
function Gi() {
  return xo || (xo = 1, Xr = Function.call.bind(Object.prototype.hasOwnProperty)), Xr;
}
var Zr, To;
function Bl() {
  if (To) return Zr;
  To = 1;
  var e = function() {
  };
  if (process.env.NODE_ENV !== "production") {
    var t = /* @__PURE__ */ _n(), r = {}, n = /* @__PURE__ */ Gi();
    e = function(i) {
      var s = "Warning: " + i;
      typeof console < "u" && console.error(s);
      try {
        throw new Error(s);
      } catch {
      }
    };
  }
  function o(i, s, a, c, u) {
    if (process.env.NODE_ENV !== "production") {
      for (var d in i)
        if (n(i, d)) {
          var f;
          try {
            if (typeof i[d] != "function") {
              var g = Error(
                (c || "React class") + ": " + a + " type `" + d + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof i[d] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`."
              );
              throw g.name = "Invariant Violation", g;
            }
            f = i[d](s, d, c, a, null, t);
          } catch (b) {
            f = b;
          }
          if (f && !(f instanceof Error) && e(
            (c || "React class") + ": type specification of " + a + " `" + d + "` is invalid; the type checker function must return `null` or an `Error` but returned a " + typeof f + ". You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument)."
          ), f instanceof Error && !(f.message in r)) {
            r[f.message] = !0;
            var S = u ? u() : "";
            e(
              "Failed " + a + " type: " + f.message + (S ?? "")
            );
          }
        }
    }
  }
  return o.resetWarningCache = function() {
    process.env.NODE_ENV !== "production" && (r = {});
  }, Zr = o, Zr;
}
var Qr, Co;
function Ul() {
  if (Co) return Qr;
  Co = 1;
  var e = Ki(), t = Fl(), r = /* @__PURE__ */ _n(), n = /* @__PURE__ */ Gi(), o = /* @__PURE__ */ Bl(), i = function() {
  };
  process.env.NODE_ENV !== "production" && (i = function(a) {
    var c = "Warning: " + a;
    typeof console < "u" && console.error(c);
    try {
      throw new Error(c);
    } catch {
    }
  });
  function s() {
    return null;
  }
  return Qr = function(a, c) {
    var u = typeof Symbol == "function" && Symbol.iterator, d = "@@iterator";
    function f(R) {
      var N = R && (u && R[u] || R[d]);
      if (typeof N == "function")
        return N;
    }
    var g = "<<anonymous>>", S = {
      array: y("array"),
      bigint: y("bigint"),
      bool: y("boolean"),
      func: y("function"),
      number: y("number"),
      object: y("object"),
      string: y("string"),
      symbol: y("symbol"),
      any: C(),
      arrayOf: _,
      element: x(),
      elementType: T(),
      instanceOf: $,
      node: M(),
      objectOf: V,
      oneOf: Y,
      oneOfType: B,
      shape: l,
      exact: H
    };
    function b(R, N) {
      return R === N ? R !== 0 || 1 / R === 1 / N : R !== R && N !== N;
    }
    function h(R, N) {
      this.message = R, this.data = N && typeof N == "object" ? N : {}, this.stack = "";
    }
    h.prototype = Error.prototype;
    function w(R) {
      if (process.env.NODE_ENV !== "production")
        var N = {}, D = 0;
      function U(G, K, O, L, z, Q, Se) {
        if (L = L || g, Q = Q || O, Se !== r) {
          if (c) {
            var P = new Error(
              "Calling PropTypes validators directly is not supported by the `prop-types` package. Use `PropTypes.checkPropTypes()` to call them. Read more at http://fb.me/use-check-prop-types"
            );
            throw P.name = "Invariant Violation", P;
          } else if (process.env.NODE_ENV !== "production" && typeof console < "u") {
            var ue = L + ":" + O;
            !N[ue] && // Avoid spamming the console because they are often not actionable except for lib authors
            D < 3 && (i(
              "You are manually calling a React.PropTypes validation function for the `" + Q + "` prop on `" + L + "`. This is deprecated and will throw in the standalone `prop-types` package. You may be seeing this warning due to a third-party PropTypes library. See https://fb.me/react-warning-dont-call-proptypes for details."
            ), N[ue] = !0, D++);
          }
        }
        return K[O] == null ? G ? K[O] === null ? new h("The " + z + " `" + Q + "` is marked as required " + ("in `" + L + "`, but its value is `null`.")) : new h("The " + z + " `" + Q + "` is marked as required in " + ("`" + L + "`, but its value is `undefined`.")) : null : R(K, O, L, z, Q);
      }
      var W = U.bind(null, !1);
      return W.isRequired = U.bind(null, !0), W;
    }
    function y(R) {
      function N(D, U, W, G, K, O) {
        var L = D[U], z = Z(L);
        if (z !== R) {
          var Q = ae(L);
          return new h(
            "Invalid " + G + " `" + K + "` of type " + ("`" + Q + "` supplied to `" + W + "`, expected ") + ("`" + R + "`."),
            { expectedType: R }
          );
        }
        return null;
      }
      return w(N);
    }
    function C() {
      return w(s);
    }
    function _(R) {
      function N(D, U, W, G, K) {
        if (typeof R != "function")
          return new h("Property `" + K + "` of component `" + W + "` has invalid PropType notation inside arrayOf.");
        var O = D[U];
        if (!Array.isArray(O)) {
          var L = Z(O);
          return new h("Invalid " + G + " `" + K + "` of type " + ("`" + L + "` supplied to `" + W + "`, expected an array."));
        }
        for (var z = 0; z < O.length; z++) {
          var Q = R(O, z, W, G, K + "[" + z + "]", r);
          if (Q instanceof Error)
            return Q;
        }
        return null;
      }
      return w(N);
    }
    function x() {
      function R(N, D, U, W, G) {
        var K = N[D];
        if (!a(K)) {
          var O = Z(K);
          return new h("Invalid " + W + " `" + G + "` of type " + ("`" + O + "` supplied to `" + U + "`, expected a single ReactElement."));
        }
        return null;
      }
      return w(R);
    }
    function T() {
      function R(N, D, U, W, G) {
        var K = N[D];
        if (!e.isValidElementType(K)) {
          var O = Z(K);
          return new h("Invalid " + W + " `" + G + "` of type " + ("`" + O + "` supplied to `" + U + "`, expected a single ReactElement type."));
        }
        return null;
      }
      return w(R);
    }
    function $(R) {
      function N(D, U, W, G, K) {
        if (!(D[U] instanceof R)) {
          var O = R.name || g, L = Me(D[U]);
          return new h("Invalid " + G + " `" + K + "` of type " + ("`" + L + "` supplied to `" + W + "`, expected ") + ("instance of `" + O + "`."));
        }
        return null;
      }
      return w(N);
    }
    function Y(R) {
      if (!Array.isArray(R))
        return process.env.NODE_ENV !== "production" && (arguments.length > 1 ? i(
          "Invalid arguments supplied to oneOf, expected an array, got " + arguments.length + " arguments. A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z])."
        ) : i("Invalid argument supplied to oneOf, expected an array.")), s;
      function N(D, U, W, G, K) {
        for (var O = D[U], L = 0; L < R.length; L++)
          if (b(O, R[L]))
            return null;
        var z = JSON.stringify(R, function(Se, P) {
          var ue = ae(P);
          return ue === "symbol" ? String(P) : P;
        });
        return new h("Invalid " + G + " `" + K + "` of value `" + String(O) + "` " + ("supplied to `" + W + "`, expected one of " + z + "."));
      }
      return w(N);
    }
    function V(R) {
      function N(D, U, W, G, K) {
        if (typeof R != "function")
          return new h("Property `" + K + "` of component `" + W + "` has invalid PropType notation inside objectOf.");
        var O = D[U], L = Z(O);
        if (L !== "object")
          return new h("Invalid " + G + " `" + K + "` of type " + ("`" + L + "` supplied to `" + W + "`, expected an object."));
        for (var z in O)
          if (n(O, z)) {
            var Q = R(O, z, W, G, K + "." + z, r);
            if (Q instanceof Error)
              return Q;
          }
        return null;
      }
      return w(N);
    }
    function B(R) {
      if (!Array.isArray(R))
        return process.env.NODE_ENV !== "production" && i("Invalid argument supplied to oneOfType, expected an instance of array."), s;
      for (var N = 0; N < R.length; N++) {
        var D = R[N];
        if (typeof D != "function")
          return i(
            "Invalid argument supplied to oneOfType. Expected an array of check functions, but received " + he(D) + " at index " + N + "."
          ), s;
      }
      function U(W, G, K, O, L) {
        for (var z = [], Q = 0; Q < R.length; Q++) {
          var Se = R[Q], P = Se(W, G, K, O, L, r);
          if (P == null)
            return null;
          P.data && n(P.data, "expectedType") && z.push(P.data.expectedType);
        }
        var ue = z.length > 0 ? ", expected one of type [" + z.join(", ") + "]" : "";
        return new h("Invalid " + O + " `" + L + "` supplied to " + ("`" + K + "`" + ue + "."));
      }
      return w(U);
    }
    function M() {
      function R(N, D, U, W, G) {
        return k(N[D]) ? null : new h("Invalid " + W + " `" + G + "` supplied to " + ("`" + U + "`, expected a ReactNode."));
      }
      return w(R);
    }
    function v(R, N, D, U, W) {
      return new h(
        (R || "React class") + ": " + N + " type `" + D + "." + U + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + W + "`."
      );
    }
    function l(R) {
      function N(D, U, W, G, K) {
        var O = D[U], L = Z(O);
        if (L !== "object")
          return new h("Invalid " + G + " `" + K + "` of type `" + L + "` " + ("supplied to `" + W + "`, expected `object`."));
        for (var z in R) {
          var Q = R[z];
          if (typeof Q != "function")
            return v(W, G, K, z, ae(Q));
          var Se = Q(O, z, W, G, K + "." + z, r);
          if (Se)
            return Se;
        }
        return null;
      }
      return w(N);
    }
    function H(R) {
      function N(D, U, W, G, K) {
        var O = D[U], L = Z(O);
        if (L !== "object")
          return new h("Invalid " + G + " `" + K + "` of type `" + L + "` " + ("supplied to `" + W + "`, expected `object`."));
        var z = t({}, D[U], R);
        for (var Q in z) {
          var Se = R[Q];
          if (n(R, Q) && typeof Se != "function")
            return v(W, G, K, Q, ae(Se));
          if (!Se)
            return new h(
              "Invalid " + G + " `" + K + "` key `" + Q + "` supplied to `" + W + "`.\nBad object: " + JSON.stringify(D[U], null, "  ") + `
Valid keys: ` + JSON.stringify(Object.keys(R), null, "  ")
            );
          var P = Se(O, Q, W, G, K + "." + Q, r);
          if (P)
            return P;
        }
        return null;
      }
      return w(N);
    }
    function k(R) {
      switch (typeof R) {
        case "number":
        case "string":
        case "undefined":
          return !0;
        case "boolean":
          return !R;
        case "object":
          if (Array.isArray(R))
            return R.every(k);
          if (R === null || a(R))
            return !0;
          var N = f(R);
          if (N) {
            var D = N.call(R), U;
            if (N !== R.entries) {
              for (; !(U = D.next()).done; )
                if (!k(U.value))
                  return !1;
            } else
              for (; !(U = D.next()).done; ) {
                var W = U.value;
                if (W && !k(W[1]))
                  return !1;
              }
          } else
            return !1;
          return !0;
        default:
          return !1;
      }
    }
    function X(R, N) {
      return R === "symbol" ? !0 : N ? N["@@toStringTag"] === "Symbol" || typeof Symbol == "function" && N instanceof Symbol : !1;
    }
    function Z(R) {
      var N = typeof R;
      return Array.isArray(R) ? "array" : R instanceof RegExp ? "object" : X(N, R) ? "symbol" : N;
    }
    function ae(R) {
      if (typeof R > "u" || R === null)
        return "" + R;
      var N = Z(R);
      if (N === "object") {
        if (R instanceof Date)
          return "date";
        if (R instanceof RegExp)
          return "regexp";
      }
      return N;
    }
    function he(R) {
      var N = ae(R);
      switch (N) {
        case "array":
        case "object":
          return "an " + N;
        case "boolean":
        case "date":
        case "regexp":
          return "a " + N;
        default:
          return N;
      }
    }
    function Me(R) {
      return !R.constructor || !R.constructor.name ? g : R.constructor.name;
    }
    return S.checkPropTypes = o, S.resetWarningCache = o.resetWarningCache, S.PropTypes = S, S;
  }, Qr;
}
var en, Oo;
function jl() {
  if (Oo) return en;
  Oo = 1;
  var e = /* @__PURE__ */ _n();
  function t() {
  }
  function r() {
  }
  return r.resetWarningCache = t, en = function() {
    function n(s, a, c, u, d, f) {
      if (f !== e) {
        var g = new Error(
          "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types"
        );
        throw g.name = "Invariant Violation", g;
      }
    }
    n.isRequired = n;
    function o() {
      return n;
    }
    var i = {
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
    return i.PropTypes = i, i;
  }, en;
}
var Ro;
function Hl() {
  if (Ro) return tr.exports;
  if (Ro = 1, process.env.NODE_ENV !== "production") {
    var e = Ki(), t = !0;
    tr.exports = /* @__PURE__ */ Ul()(e.isElement, t);
  } else
    tr.exports = /* @__PURE__ */ jl()();
  return tr.exports;
}
var Vl = /* @__PURE__ */ Hl();
const j = /* @__PURE__ */ Dl(Vl);
function Wl(e) {
  return e == null || Object.keys(e).length === 0;
}
function An(e) {
  const {
    styles: t,
    defaultTheme: r = {}
  } = e;
  return /* @__PURE__ */ m(Ds, {
    styles: typeof t == "function" ? (o) => t(Wl(o) ? r : o) : t
  });
}
process.env.NODE_ENV !== "production" && (An.propTypes = {
  defaultTheme: j.object,
  styles: j.oneOfType([j.array, j.string, j.object, j.func])
});
const _o = [];
function zl(e) {
  return _o[0] = e, $l(_o);
}
var nr = { exports: {} }, ie = {};
var Ao;
function ql() {
  if (Ao) return ie;
  Ao = 1;
  var e = /* @__PURE__ */ Symbol.for("react.transitional.element"), t = /* @__PURE__ */ Symbol.for("react.portal"), r = /* @__PURE__ */ Symbol.for("react.fragment"), n = /* @__PURE__ */ Symbol.for("react.strict_mode"), o = /* @__PURE__ */ Symbol.for("react.profiler"), i = /* @__PURE__ */ Symbol.for("react.consumer"), s = /* @__PURE__ */ Symbol.for("react.context"), a = /* @__PURE__ */ Symbol.for("react.forward_ref"), c = /* @__PURE__ */ Symbol.for("react.suspense"), u = /* @__PURE__ */ Symbol.for("react.suspense_list"), d = /* @__PURE__ */ Symbol.for("react.memo"), f = /* @__PURE__ */ Symbol.for("react.lazy"), g = /* @__PURE__ */ Symbol.for("react.view_transition"), S = /* @__PURE__ */ Symbol.for("react.client.reference");
  function b(h) {
    if (typeof h == "object" && h !== null) {
      var w = h.$$typeof;
      switch (w) {
        case e:
          switch (h = h.type, h) {
            case r:
            case o:
            case n:
            case c:
            case u:
            case g:
              return h;
            default:
              switch (h = h && h.$$typeof, h) {
                case s:
                case a:
                case f:
                case d:
                  return h;
                case i:
                  return h;
                default:
                  return w;
              }
          }
        case t:
          return w;
      }
    }
  }
  return ie.ContextConsumer = i, ie.ContextProvider = s, ie.Element = e, ie.ForwardRef = a, ie.Fragment = r, ie.Lazy = f, ie.Memo = d, ie.Portal = t, ie.Profiler = o, ie.StrictMode = n, ie.Suspense = c, ie.SuspenseList = u, ie.isContextConsumer = function(h) {
    return b(h) === i;
  }, ie.isContextProvider = function(h) {
    return b(h) === s;
  }, ie.isElement = function(h) {
    return typeof h == "object" && h !== null && h.$$typeof === e;
  }, ie.isForwardRef = function(h) {
    return b(h) === a;
  }, ie.isFragment = function(h) {
    return b(h) === r;
  }, ie.isLazy = function(h) {
    return b(h) === f;
  }, ie.isMemo = function(h) {
    return b(h) === d;
  }, ie.isPortal = function(h) {
    return b(h) === t;
  }, ie.isProfiler = function(h) {
    return b(h) === o;
  }, ie.isStrictMode = function(h) {
    return b(h) === n;
  }, ie.isSuspense = function(h) {
    return b(h) === c;
  }, ie.isSuspenseList = function(h) {
    return b(h) === u;
  }, ie.isValidElementType = function(h) {
    return typeof h == "string" || typeof h == "function" || h === r || h === o || h === n || h === c || h === u || typeof h == "object" && h !== null && (h.$$typeof === f || h.$$typeof === d || h.$$typeof === s || h.$$typeof === i || h.$$typeof === a || h.$$typeof === S || h.getModuleId !== void 0);
  }, ie.typeOf = b, ie;
}
var se = {};
var vo;
function Kl() {
  return vo || (vo = 1, process.env.NODE_ENV !== "production" && (function() {
    function e(h) {
      if (typeof h == "object" && h !== null) {
        var w = h.$$typeof;
        switch (w) {
          case t:
            switch (h = h.type, h) {
              case n:
              case i:
              case o:
              case u:
              case d:
              case S:
                return h;
              default:
                switch (h = h && h.$$typeof, h) {
                  case a:
                  case c:
                  case g:
                  case f:
                    return h;
                  case s:
                    return h;
                  default:
                    return w;
                }
            }
          case r:
            return w;
        }
      }
    }
    var t = /* @__PURE__ */ Symbol.for("react.transitional.element"), r = /* @__PURE__ */ Symbol.for("react.portal"), n = /* @__PURE__ */ Symbol.for("react.fragment"), o = /* @__PURE__ */ Symbol.for("react.strict_mode"), i = /* @__PURE__ */ Symbol.for("react.profiler"), s = /* @__PURE__ */ Symbol.for("react.consumer"), a = /* @__PURE__ */ Symbol.for("react.context"), c = /* @__PURE__ */ Symbol.for("react.forward_ref"), u = /* @__PURE__ */ Symbol.for("react.suspense"), d = /* @__PURE__ */ Symbol.for("react.suspense_list"), f = /* @__PURE__ */ Symbol.for("react.memo"), g = /* @__PURE__ */ Symbol.for("react.lazy"), S = /* @__PURE__ */ Symbol.for("react.view_transition"), b = /* @__PURE__ */ Symbol.for("react.client.reference");
    se.ContextConsumer = s, se.ContextProvider = a, se.Element = t, se.ForwardRef = c, se.Fragment = n, se.Lazy = g, se.Memo = f, se.Portal = r, se.Profiler = i, se.StrictMode = o, se.Suspense = u, se.SuspenseList = d, se.isContextConsumer = function(h) {
      return e(h) === s;
    }, se.isContextProvider = function(h) {
      return e(h) === a;
    }, se.isElement = function(h) {
      return typeof h == "object" && h !== null && h.$$typeof === t;
    }, se.isForwardRef = function(h) {
      return e(h) === c;
    }, se.isFragment = function(h) {
      return e(h) === n;
    }, se.isLazy = function(h) {
      return e(h) === g;
    }, se.isMemo = function(h) {
      return e(h) === f;
    }, se.isPortal = function(h) {
      return e(h) === r;
    }, se.isProfiler = function(h) {
      return e(h) === i;
    }, se.isStrictMode = function(h) {
      return e(h) === o;
    }, se.isSuspense = function(h) {
      return e(h) === u;
    }, se.isSuspenseList = function(h) {
      return e(h) === d;
    }, se.isValidElementType = function(h) {
      return typeof h == "string" || typeof h == "function" || h === n || h === i || h === o || h === u || h === d || typeof h == "object" && h !== null && (h.$$typeof === g || h.$$typeof === f || h.$$typeof === a || h.$$typeof === s || h.$$typeof === c || h.$$typeof === b || h.getModuleId !== void 0);
    }, se.typeOf = e;
  })()), se;
}
var ko;
function Gl() {
  return ko || (ko = 1, process.env.NODE_ENV === "production" ? nr.exports = /* @__PURE__ */ ql() : nr.exports = /* @__PURE__ */ Kl()), nr.exports;
}
var Yi = /* @__PURE__ */ Gl();
function Qe(e) {
  if (typeof e != "object" || e === null)
    return !1;
  const t = Object.getPrototypeOf(e);
  return (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) && !(Symbol.toStringTag in e) && !(Symbol.iterator in e);
}
function Ji(e) {
  if (/* @__PURE__ */ J.isValidElement(e) || Yi.isValidElementType(e) || !Qe(e))
    return e;
  const t = {};
  return Object.keys(e).forEach((r) => {
    t[r] = Ji(e[r]);
  }), t;
}
function ke(e, t, r = {
  clone: !0
}) {
  const n = r.clone ? {
    ...e
  } : e;
  return Qe(e) && Qe(t) && Object.keys(t).forEach((o) => {
    /* @__PURE__ */ J.isValidElement(t[o]) || Yi.isValidElementType(t[o]) ? n[o] = t[o] : Qe(t[o]) && // Avoid prototype pollution
    Object.prototype.hasOwnProperty.call(e, o) && Qe(e[o]) ? n[o] = ke(e[o], t[o], r) : r.clone ? n[o] = Qe(t[o]) ? Ji(t[o]) : t[o] : n[o] = t[o];
  }), n;
}
const Yl = (e) => {
  const t = Object.keys(e).map((r) => ({
    key: r,
    val: e[r]
  })) || [];
  return t.sort((r, n) => r.val - n.val), t.reduce((r, n) => ({
    ...r,
    [n.key]: n.val
  }), {});
};
function Jl(e) {
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
  } = e, i = Yl(t), s = Object.keys(i);
  function a(g) {
    return `@media (min-width:${typeof t[g] == "number" ? t[g] : g}${r})`;
  }
  function c(g) {
    return `@media (max-width:${(typeof t[g] == "number" ? t[g] : g) - n / 100}${r})`;
  }
  function u(g, S) {
    const b = s.indexOf(S);
    return `@media (min-width:${typeof t[g] == "number" ? t[g] : g}${r}) and (max-width:${(b !== -1 && typeof t[s[b]] == "number" ? t[s[b]] : S) - n / 100}${r})`;
  }
  function d(g) {
    return s.indexOf(g) + 1 < s.length ? u(g, s[s.indexOf(g) + 1]) : a(g);
  }
  function f(g) {
    const S = s.indexOf(g);
    return S === 0 ? a(s[1]) : S === s.length - 1 ? c(s[S]) : u(g, s[s.indexOf(g) + 1]).replace("@media", "@media not all and");
  }
  return {
    keys: s,
    values: i,
    up: a,
    down: c,
    between: u,
    only: d,
    not: f,
    unit: r,
    ...o
  };
}
function Po(e, t) {
  if (!e.containerQueries)
    return t;
  const r = Object.keys(t).filter((n) => n.startsWith("@container")).sort((n, o) => {
    const i = /min-width:\s*([0-9.]+)/;
    return +(n.match(i)?.[1] || 0) - +(o.match(i)?.[1] || 0);
  });
  return r.length ? r.reduce((n, o) => {
    const i = t[o];
    return delete n[o], n[o] = i, n;
  }, {
    ...t
  }) : t;
}
function Xl(e, t) {
  return t === "@" || t.startsWith("@") && (e.some((r) => t.startsWith(`@${r}`)) || !!t.match(/^@\d/));
}
function Zl(e, t) {
  const r = t.match(/^@([^/]+)?\/?(.+)?$/);
  if (!r) {
    if (process.env.NODE_ENV !== "production")
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The provided shorthand ${`(${t})`} is invalid. The format should be \`@<breakpoint | number>\` or \`@<breakpoint | number>/<container>\`.
For example, \`@sm\` or \`@600\` or \`@40rem/sidebar\`.` : rt(18, `(${t})`));
    return null;
  }
  const [, n, o] = r, i = Number.isNaN(+n) ? n || 0 : +n;
  return e.containerQueries(o).up(i);
}
function Ql(e) {
  const t = (i, s) => i.replace("@media", s ? `@container ${s}` : "@container");
  function r(i, s) {
    i.up = (...a) => t(e.breakpoints.up(...a), s), i.down = (...a) => t(e.breakpoints.down(...a), s), i.between = (...a) => t(e.breakpoints.between(...a), s), i.only = (...a) => t(e.breakpoints.only(...a), s), i.not = (...a) => {
      const c = t(e.breakpoints.not(...a), s);
      return c.includes("not all and") ? c.replace("not all and ", "").replace("min-width:", "width<").replace("max-width:", "width>").replace("and", "or") : c;
    };
  }
  const n = {}, o = (i) => (r(n, i), n);
  return r(o), {
    ...e,
    containerQueries: o
  };
}
const eu = {
  borderRadius: 4
}, ot = process.env.NODE_ENV !== "production" ? j.oneOfType([j.number, j.string, j.object, j.array]) : {};
function Mt(e, t) {
  return t ? ke(e, t, {
    clone: !1
    // No need to clone deep, it's way faster.
  }) : e;
}
const Cr = {
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
}, No = {
  // Sorted ASC by size. That's important.
  // It can't be configured as it's used statically for propTypes.
  keys: ["xs", "sm", "md", "lg", "xl"],
  up: (e) => `@media (min-width:${Cr[e]}px)`
}, tu = {
  containerQueries: (e) => ({
    up: (t) => {
      let r = typeof t == "number" ? t : Cr[t] || t;
      return typeof r == "number" && (r = `${r}px`), e ? `@container ${e} (min-width:${r})` : `@container (min-width:${r})`;
    }
  })
};
function Ye(e, t, r) {
  const n = e.theme || {};
  if (Array.isArray(t)) {
    const i = n.breakpoints || No;
    return t.reduce((s, a, c) => (s[i.up(i.keys[c])] = r(t[c]), s), {});
  }
  if (typeof t == "object") {
    const i = n.breakpoints || No;
    return Object.keys(t).reduce((s, a) => {
      if (Xl(i.keys, a)) {
        const c = Zl(n.containerQueries ? n : tu, a);
        c && (s[c] = r(t[a], a));
      } else if (Object.keys(i.values || Cr).includes(a)) {
        const c = i.up(a);
        s[c] = r(t[a], a);
      } else {
        const c = a;
        s[c] = t[c];
      }
      return s;
    }, {});
  }
  return r(t);
}
function ru(e = {}) {
  return e.keys?.reduce((r, n) => {
    const o = e.up(n);
    return r[o] = {}, r;
  }, {}) || {};
}
function Io(e, t) {
  return e.reduce((r, n) => {
    const o = r[n];
    return (!o || Object.keys(o).length === 0) && delete r[n], r;
  }, t);
}
function Xi(e) {
  if (typeof e != "string")
    throw new Error(process.env.NODE_ENV !== "production" ? "MUI: `capitalize(string)` expects a string argument." : rt(7));
  return e.charAt(0).toUpperCase() + e.slice(1);
}
function Or(e, t, r = !0) {
  if (!t || typeof t != "string")
    return null;
  if (e && e.vars && r) {
    const n = `vars.${t}`.split(".").reduce((o, i) => o && o[i] ? o[i] : null, e);
    if (n != null)
      return n;
  }
  return t.split(".").reduce((n, o) => n && n[o] != null ? n[o] : null, e);
}
function Sr(e, t, r, n = r) {
  let o;
  return typeof e == "function" ? o = e(r) : Array.isArray(e) ? o = e[r] || n : o = Or(e, r) || n, t && (o = t(o, n, e)), o;
}
function ye(e) {
  const {
    prop: t,
    cssProperty: r = e.prop,
    themeKey: n,
    transform: o
  } = e, i = (s) => {
    if (s[t] == null)
      return null;
    const a = s[t], c = s.theme, u = Or(c, n) || {};
    return Ye(s, a, (f) => {
      let g = Sr(u, o, f);
      return f === g && typeof f == "string" && (g = Sr(u, o, `${t}${f === "default" ? "" : Xi(f)}`, f)), r === !1 ? g : {
        [r]: g
      };
    });
  };
  return i.propTypes = process.env.NODE_ENV !== "production" ? {
    [t]: ot
  } : {}, i.filterProps = [t], i;
}
function nu(e) {
  const t = {};
  return (r) => (t[r] === void 0 && (t[r] = e(r)), t[r]);
}
const ou = {
  m: "margin",
  p: "padding"
}, iu = {
  t: "Top",
  r: "Right",
  b: "Bottom",
  l: "Left",
  x: ["Left", "Right"],
  y: ["Top", "Bottom"]
}, $o = {
  marginX: "mx",
  marginY: "my",
  paddingX: "px",
  paddingY: "py"
}, su = nu((e) => {
  if (e.length > 2)
    if ($o[e])
      e = $o[e];
    else
      return [e];
  const [t, r] = e.split(""), n = ou[t], o = iu[r] || "";
  return Array.isArray(o) ? o.map((i) => n + i) : [n + o];
}), Rr = ["m", "mt", "mr", "mb", "ml", "mx", "my", "margin", "marginTop", "marginRight", "marginBottom", "marginLeft", "marginX", "marginY", "marginInline", "marginInlineStart", "marginInlineEnd", "marginBlock", "marginBlockStart", "marginBlockEnd"], _r = ["p", "pt", "pr", "pb", "pl", "px", "py", "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "paddingX", "paddingY", "paddingInline", "paddingInlineStart", "paddingInlineEnd", "paddingBlock", "paddingBlockStart", "paddingBlockEnd"], au = [...Rr, ..._r];
function Jt(e, t, r, n) {
  const o = Or(e, t, !0) ?? r;
  return typeof o == "number" || typeof o == "string" ? (i) => typeof i == "string" ? i : (process.env.NODE_ENV !== "production" && typeof i != "number" && console.error(`MUI: Expected ${n} argument to be a number or a string, got ${i}.`), typeof o == "string" ? o.startsWith("var(") && i === 0 ? 0 : o.startsWith("var(") && i === 1 ? o : `calc(${i} * ${o})` : o * i) : Array.isArray(o) ? (i) => {
    if (typeof i == "string")
      return i;
    const s = Math.abs(i);
    process.env.NODE_ENV !== "production" && (Number.isInteger(s) ? s > o.length - 1 && console.error([`MUI: The value provided (${s}) overflows.`, `The supported values are: ${JSON.stringify(o)}.`, `${s} > ${o.length - 1}, you need to add the missing values.`].join(`
`)) : console.error([`MUI: The \`theme.${t}\` array type cannot be combined with non integer values.You should either use an integer value that can be used as index, or define the \`theme.${t}\` as a number.`].join(`
`)));
    const a = o[s];
    return i >= 0 ? a : typeof a == "number" ? -a : typeof a == "string" && a.startsWith("var(") ? `calc(-1 * ${a})` : `-${a}`;
  } : typeof o == "function" ? o : (process.env.NODE_ENV !== "production" && console.error([`MUI: The \`theme.${t}\` value (${o}) is invalid.`, "It should be a number, an array or a function."].join(`
`)), () => {
  });
}
function vn(e) {
  return Jt(e, "spacing", 8, "spacing");
}
function Xt(e, t) {
  return typeof t == "string" || t == null ? t : e(t);
}
function cu(e, t) {
  return (r) => e.reduce((n, o) => (n[o] = Xt(t, r), n), {});
}
function lu(e, t, r, n) {
  if (!t.includes(r))
    return null;
  const o = su(r), i = cu(o, n), s = e[r];
  return Ye(e, s, i);
}
function Zi(e, t) {
  const r = vn(e.theme);
  return Object.keys(e).map((n) => lu(e, t, n, r)).reduce(Mt, {});
}
function de(e) {
  return Zi(e, Rr);
}
de.propTypes = process.env.NODE_ENV !== "production" ? Rr.reduce((e, t) => (e[t] = ot, e), {}) : {};
de.filterProps = Rr;
function fe(e) {
  return Zi(e, _r);
}
fe.propTypes = process.env.NODE_ENV !== "production" ? _r.reduce((e, t) => (e[t] = ot, e), {}) : {};
fe.filterProps = _r;
process.env.NODE_ENV !== "production" && au.reduce((e, t) => (e[t] = ot, e), {});
function Qi(e = 8, t = vn({
  spacing: e
})) {
  if (e.mui)
    return e;
  const r = (...n) => (process.env.NODE_ENV !== "production" && (n.length <= 4 || console.error(`MUI: Too many arguments provided, expected between 0 and 4, got ${n.length}`)), (n.length === 0 ? [1] : n).map((i) => {
    const s = t(i);
    return typeof s == "number" ? `${s}px` : s;
  }).join(" "));
  return r.mui = !0, r;
}
function Ar(...e) {
  const t = e.reduce((n, o) => (o.filterProps.forEach((i) => {
    n[i] = o;
  }), n), {}), r = (n) => Object.keys(n).reduce((o, i) => t[i] ? Mt(o, t[i](n)) : o, {});
  return r.propTypes = process.env.NODE_ENV !== "production" ? e.reduce((n, o) => Object.assign(n, o.propTypes), {}) : {}, r.filterProps = e.reduce((n, o) => n.concat(o.filterProps), []), r;
}
function $e(e) {
  return typeof e != "number" ? e : `${e}px solid`;
}
function Le(e, t) {
  return ye({
    prop: e,
    themeKey: "borders",
    transform: t
  });
}
const uu = Le("border", $e), du = Le("borderTop", $e), fu = Le("borderRight", $e), pu = Le("borderBottom", $e), hu = Le("borderLeft", $e), mu = Le("borderColor"), gu = Le("borderTopColor"), yu = Le("borderRightColor"), bu = Le("borderBottomColor"), Su = Le("borderLeftColor"), Eu = Le("outline", $e), wu = Le("outlineColor"), vr = (e) => {
  if (e.borderRadius !== void 0 && e.borderRadius !== null) {
    const t = Jt(e.theme, "shape.borderRadius", 4, "borderRadius"), r = (n) => ({
      borderRadius: Xt(t, n)
    });
    return Ye(e, e.borderRadius, r);
  }
  return null;
};
vr.propTypes = process.env.NODE_ENV !== "production" ? {
  borderRadius: ot
} : {};
vr.filterProps = ["borderRadius"];
Ar(uu, du, fu, pu, hu, mu, gu, yu, bu, Su, vr, Eu, wu);
const kr = (e) => {
  if (e.gap !== void 0 && e.gap !== null) {
    const t = Jt(e.theme, "spacing", 8, "gap"), r = (n) => ({
      gap: Xt(t, n)
    });
    return Ye(e, e.gap, r);
  }
  return null;
};
kr.propTypes = process.env.NODE_ENV !== "production" ? {
  gap: ot
} : {};
kr.filterProps = ["gap"];
const Pr = (e) => {
  if (e.columnGap !== void 0 && e.columnGap !== null) {
    const t = Jt(e.theme, "spacing", 8, "columnGap"), r = (n) => ({
      columnGap: Xt(t, n)
    });
    return Ye(e, e.columnGap, r);
  }
  return null;
};
Pr.propTypes = process.env.NODE_ENV !== "production" ? {
  columnGap: ot
} : {};
Pr.filterProps = ["columnGap"];
const Nr = (e) => {
  if (e.rowGap !== void 0 && e.rowGap !== null) {
    const t = Jt(e.theme, "spacing", 8, "rowGap"), r = (n) => ({
      rowGap: Xt(t, n)
    });
    return Ye(e, e.rowGap, r);
  }
  return null;
};
Nr.propTypes = process.env.NODE_ENV !== "production" ? {
  rowGap: ot
} : {};
Nr.filterProps = ["rowGap"];
const xu = ye({
  prop: "gridColumn"
}), Tu = ye({
  prop: "gridRow"
}), Cu = ye({
  prop: "gridAutoFlow"
}), Ou = ye({
  prop: "gridAutoColumns"
}), Ru = ye({
  prop: "gridAutoRows"
}), _u = ye({
  prop: "gridTemplateColumns"
}), Au = ye({
  prop: "gridTemplateRows"
}), vu = ye({
  prop: "gridTemplateAreas"
}), ku = ye({
  prop: "gridArea"
});
Ar(kr, Pr, Nr, xu, Tu, Cu, Ou, Ru, _u, Au, vu, ku);
function xt(e, t) {
  return t === "grey" ? t : e;
}
const Pu = ye({
  prop: "color",
  themeKey: "palette",
  transform: xt
}), Nu = ye({
  prop: "bgcolor",
  cssProperty: "backgroundColor",
  themeKey: "palette",
  transform: xt
}), Iu = ye({
  prop: "backgroundColor",
  themeKey: "palette",
  transform: xt
});
Ar(Pu, Nu, Iu);
function ve(e) {
  return e <= 1 && e !== 0 ? `${e * 100}%` : e;
}
const $u = ye({
  prop: "width",
  transform: ve
}), kn = (e) => {
  if (e.maxWidth !== void 0 && e.maxWidth !== null) {
    const t = (r) => {
      const n = e.theme?.breakpoints?.values?.[r] || Cr[r];
      return n ? e.theme?.breakpoints?.unit !== "px" ? {
        maxWidth: `${n}${e.theme.breakpoints.unit}`
      } : {
        maxWidth: n
      } : {
        maxWidth: ve(r)
      };
    };
    return Ye(e, e.maxWidth, t);
  }
  return null;
};
kn.filterProps = ["maxWidth"];
const Du = ye({
  prop: "minWidth",
  transform: ve
}), Lu = ye({
  prop: "height",
  transform: ve
}), Mu = ye({
  prop: "maxHeight",
  transform: ve
}), Fu = ye({
  prop: "minHeight",
  transform: ve
});
ye({
  prop: "size",
  cssProperty: "width",
  transform: ve
});
ye({
  prop: "size",
  cssProperty: "height",
  transform: ve
});
const Bu = ye({
  prop: "boxSizing"
});
Ar($u, kn, Du, Lu, Mu, Fu, Bu);
const Ir = {
  // borders
  border: {
    themeKey: "borders",
    transform: $e
  },
  borderTop: {
    themeKey: "borders",
    transform: $e
  },
  borderRight: {
    themeKey: "borders",
    transform: $e
  },
  borderBottom: {
    themeKey: "borders",
    transform: $e
  },
  borderLeft: {
    themeKey: "borders",
    transform: $e
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
    transform: $e
  },
  outlineColor: {
    themeKey: "palette"
  },
  borderRadius: {
    themeKey: "shape.borderRadius",
    style: vr
  },
  // palette
  color: {
    themeKey: "palette",
    transform: xt
  },
  bgcolor: {
    themeKey: "palette",
    cssProperty: "backgroundColor",
    transform: xt
  },
  backgroundColor: {
    themeKey: "palette",
    transform: xt
  },
  // spacing
  p: {
    style: fe
  },
  pt: {
    style: fe
  },
  pr: {
    style: fe
  },
  pb: {
    style: fe
  },
  pl: {
    style: fe
  },
  px: {
    style: fe
  },
  py: {
    style: fe
  },
  padding: {
    style: fe
  },
  paddingTop: {
    style: fe
  },
  paddingRight: {
    style: fe
  },
  paddingBottom: {
    style: fe
  },
  paddingLeft: {
    style: fe
  },
  paddingX: {
    style: fe
  },
  paddingY: {
    style: fe
  },
  paddingInline: {
    style: fe
  },
  paddingInlineStart: {
    style: fe
  },
  paddingInlineEnd: {
    style: fe
  },
  paddingBlock: {
    style: fe
  },
  paddingBlockStart: {
    style: fe
  },
  paddingBlockEnd: {
    style: fe
  },
  m: {
    style: de
  },
  mt: {
    style: de
  },
  mr: {
    style: de
  },
  mb: {
    style: de
  },
  ml: {
    style: de
  },
  mx: {
    style: de
  },
  my: {
    style: de
  },
  margin: {
    style: de
  },
  marginTop: {
    style: de
  },
  marginRight: {
    style: de
  },
  marginBottom: {
    style: de
  },
  marginLeft: {
    style: de
  },
  marginX: {
    style: de
  },
  marginY: {
    style: de
  },
  marginInline: {
    style: de
  },
  marginInlineStart: {
    style: de
  },
  marginInlineEnd: {
    style: de
  },
  marginBlock: {
    style: de
  },
  marginBlockStart: {
    style: de
  },
  marginBlockEnd: {
    style: de
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
    style: kr
  },
  rowGap: {
    style: Nr
  },
  columnGap: {
    style: Pr
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
    transform: ve
  },
  maxWidth: {
    style: kn
  },
  minWidth: {
    transform: ve
  },
  height: {
    transform: ve
  },
  maxHeight: {
    transform: ve
  },
  minHeight: {
    transform: ve
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
function Uu(...e) {
  const t = e.reduce((n, o) => n.concat(Object.keys(o)), []), r = new Set(t);
  return e.every((n) => r.size === Object.keys(n).length);
}
function ju(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function Hu() {
  function e(r, n, o, i) {
    const s = {
      [r]: n,
      theme: o
    }, a = i[r];
    if (!a)
      return {
        [r]: n
      };
    const {
      cssProperty: c = r,
      themeKey: u,
      transform: d,
      style: f
    } = a;
    if (n == null)
      return null;
    if (u === "typography" && n === "inherit")
      return {
        [r]: n
      };
    const g = Or(o, u) || {};
    return f ? f(s) : Ye(s, n, (b) => {
      let h = Sr(g, d, b);
      return b === h && typeof b == "string" && (h = Sr(g, d, `${r}${b === "default" ? "" : Xi(b)}`, b)), c === !1 ? h : {
        [c]: h
      };
    });
  }
  function t(r) {
    const {
      sx: n,
      theme: o = {},
      nested: i
    } = r || {};
    if (!n)
      return null;
    const s = o.unstable_sxConfig ?? Ir;
    function a(c) {
      let u = c;
      if (typeof c == "function")
        u = c(o);
      else if (typeof c != "object")
        return c;
      if (!u)
        return null;
      const d = ru(o.breakpoints), f = Object.keys(d);
      let g = d;
      return Object.keys(u).forEach((S) => {
        const b = ju(u[S], o);
        if (b != null)
          if (typeof b == "object")
            if (s[S])
              g = Mt(g, e(S, b, o, s));
            else {
              const h = Ye({
                theme: o
              }, b, (w) => ({
                [S]: w
              }));
              Uu(h, b) ? g[S] = t({
                sx: b,
                theme: o,
                nested: !0
              }) : g = Mt(g, h);
            }
          else
            g = Mt(g, e(S, b, o, s));
      }), !i && o.modularCssLayers ? {
        "@layer sx": Po(o, Io(f, g))
      } : Po(o, Io(f, g));
    }
    return Array.isArray(n) ? n.map(a) : a(n);
  }
  return t;
}
const Zt = Hu();
Zt.filterProps = ["sx"];
function Vu(e, t) {
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
function es(e = {}, ...t) {
  const {
    breakpoints: r = {},
    palette: n = {},
    spacing: o,
    shape: i = {},
    ...s
  } = e, a = Jl(r), c = Qi(o);
  let u = ke({
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
      ...eu,
      ...i
    }
  }, s);
  return u = Ql(u), u.applyStyles = Vu, u = t.reduce((d, f) => ke(d, f), u), u.unstable_sxConfig = {
    ...Ir,
    ...s?.unstable_sxConfig
  }, u.unstable_sx = function(f) {
    return Zt({
      sx: f,
      theme: this
    });
  }, u;
}
function Wu(e) {
  return Object.keys(e).length === 0;
}
function Pn(e = null) {
  const t = J.useContext(si);
  return !t || Wu(t) ? e : t;
}
const zu = es();
function ts(e = zu) {
  return Pn(e);
}
function tn(e) {
  const t = zl(e);
  return e !== t && t.styles ? (t.styles.match(/^@layer\s+[^{]*$/) || (t.styles = `@layer global{${t.styles}}`), t) : e;
}
function rs({
  styles: e,
  themeId: t,
  defaultTheme: r = {}
}) {
  const n = ts(r), o = t && n[t] || n;
  let i = typeof e == "function" ? e(o) : e;
  return o.modularCssLayers && (Array.isArray(i) ? i = i.map((s) => tn(typeof s == "function" ? s(o) : s)) : i = tn(i)), /* @__PURE__ */ m(An, {
    styles: i
  });
}
process.env.NODE_ENV !== "production" && (rs.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * @ignore
   */
  defaultTheme: j.object,
  /**
   * @ignore
   */
  styles: j.oneOfType([j.array, j.func, j.number, j.object, j.string, j.bool]),
  /**
   * @ignore
   */
  themeId: j.string
});
const Do = (e) => e, qu = () => {
  let e = Do;
  return {
    configure(t) {
      e = t;
    },
    generate(t) {
      return e(t);
    },
    reset() {
      e = Do;
    }
  };
}, Ku = qu(), Gu = {
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
function Yu(e, t, r = "Mui") {
  const n = Gu[t];
  return n ? `${r}-${n}` : `${Ku.generate(e)}-${t}`;
}
const ns = typeof window < "u" ? J.useLayoutEffect : J.useEffect;
function Ju(e, t = Number.MIN_SAFE_INTEGER, r = Number.MAX_SAFE_INTEGER) {
  return Math.max(t, Math.min(e, r));
}
function Nn(e, t = 0, r = 1) {
  return process.env.NODE_ENV !== "production" && (e < t || e > r) && console.error(`MUI: The value provided ${e} is out of range [${t}, ${r}].`), Ju(e, t, r);
}
function Xu(e) {
  e = e.slice(1);
  const t = new RegExp(`.{1,${e.length >= 6 ? 2 : 1}}`, "g");
  let r = e.match(t);
  return r && r[0].length === 1 && (r = r.map((n) => n + n)), process.env.NODE_ENV !== "production" && e.length !== e.trim().length && console.error(`MUI: The color: "${e}" is invalid. Make sure the color input doesn't contain leading/trailing space.`), r ? `rgb${r.length === 4 ? "a" : ""}(${r.map((n, o) => o < 3 ? parseInt(n, 16) : Math.round(parseInt(n, 16) / 255 * 1e3) / 1e3).join(", ")})` : "";
}
function nt(e) {
  if (e.type)
    return e;
  if (e.charAt(0) === "#")
    return nt(Xu(e));
  const t = e.indexOf("("), r = e.substring(0, t);
  if (!["rgb", "rgba", "hsl", "hsla", "color"].includes(r))
    throw new Error(process.env.NODE_ENV !== "production" ? `MUI: Unsupported \`${e}\` color.
The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().` : rt(9, e));
  let n = e.substring(t + 1, e.length - 1), o;
  if (r === "color") {
    if (n = n.split(" "), o = n.shift(), n.length === 4 && n[3].charAt(0) === "/" && (n[3] = n[3].slice(1)), !["srgb", "display-p3", "a98-rgb", "prophoto-rgb", "rec-2020"].includes(o))
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: unsupported \`${o}\` color space.
The following color spaces are supported: srgb, display-p3, a98-rgb, prophoto-rgb, rec-2020.` : rt(10, o));
  } else
    n = n.split(",");
  return n = n.map((i) => parseFloat(i)), {
    type: r,
    values: n,
    colorSpace: o
  };
}
const Zu = (e) => {
  const t = nt(e);
  return t.values.slice(0, 3).map((r, n) => t.type.includes("hsl") && n !== 0 ? `${r}%` : r).join(" ");
}, $t = (e, t) => {
  try {
    return Zu(e);
  } catch {
    return t && process.env.NODE_ENV !== "production" && console.warn(t), e;
  }
};
function $r(e) {
  const {
    type: t,
    colorSpace: r
  } = e;
  let {
    values: n
  } = e;
  return t.includes("rgb") ? n = n.map((o, i) => i < 3 ? parseInt(o, 10) : o) : t.includes("hsl") && (n[1] = `${n[1]}%`, n[2] = `${n[2]}%`), t.includes("color") ? n = `${r} ${n.join(" ")}` : n = `${n.join(", ")}`, `${t}(${n})`;
}
function os(e) {
  e = nt(e);
  const {
    values: t
  } = e, r = t[0], n = t[1] / 100, o = t[2] / 100, i = n * Math.min(o, 1 - o), s = (u, d = (u + r / 30) % 12) => o - i * Math.max(Math.min(d - 3, 9 - d, 1), -1);
  let a = "rgb";
  const c = [Math.round(s(0) * 255), Math.round(s(8) * 255), Math.round(s(4) * 255)];
  return e.type === "hsla" && (a += "a", c.push(t[3])), $r({
    type: a,
    values: c
  });
}
function un(e) {
  e = nt(e);
  let t = e.type === "hsl" || e.type === "hsla" ? nt(os(e)).values : e.values;
  return t = t.map((r) => (e.type !== "color" && (r /= 255), r <= 0.03928 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4)), Number((0.2126 * t[0] + 0.7152 * t[1] + 0.0722 * t[2]).toFixed(3));
}
function Lo(e, t) {
  const r = un(e), n = un(t);
  return (Math.max(r, n) + 0.05) / (Math.min(r, n) + 0.05);
}
function is(e, t) {
  return e = nt(e), t = Nn(t), (e.type === "rgb" || e.type === "hsl") && (e.type += "a"), e.type === "color" ? e.values[3] = `/${t}` : e.values[3] = t, $r(e);
}
function it(e, t, r) {
  try {
    return is(e, t);
  } catch {
    return r && process.env.NODE_ENV !== "production" && console.warn(r), e;
  }
}
function Dr(e, t) {
  if (e = nt(e), t = Nn(t), e.type.includes("hsl"))
    e.values[2] *= 1 - t;
  else if (e.type.includes("rgb") || e.type.includes("color"))
    for (let r = 0; r < 3; r += 1)
      e.values[r] *= 1 - t;
  return $r(e);
}
function re(e, t, r) {
  try {
    return Dr(e, t);
  } catch {
    return r && process.env.NODE_ENV !== "production" && console.warn(r), e;
  }
}
function Lr(e, t) {
  if (e = nt(e), t = Nn(t), e.type.includes("hsl"))
    e.values[2] += (100 - e.values[2]) * t;
  else if (e.type.includes("rgb"))
    for (let r = 0; r < 3; r += 1)
      e.values[r] += (255 - e.values[r]) * t;
  else if (e.type.includes("color"))
    for (let r = 0; r < 3; r += 1)
      e.values[r] += (1 - e.values[r]) * t;
  return $r(e);
}
function ne(e, t, r) {
  try {
    return Lr(e, t);
  } catch {
    return r && process.env.NODE_ENV !== "production" && console.warn(r), e;
  }
}
function Qu(e, t = 0.15) {
  return un(e) > 0.5 ? Dr(e, t) : Lr(e, t);
}
function or(e, t, r) {
  try {
    return Qu(e, t);
  } catch {
    return e;
  }
}
const ed = "exact-prop: ​";
function ss(e) {
  return process.env.NODE_ENV === "production" ? e : {
    ...e,
    [ed]: (t) => {
      const r = Object.keys(t).filter((n) => !e.hasOwnProperty(n));
      return r.length > 0 ? new Error(`The following props are not supported: ${r.map((n) => `\`${n}\``).join(", ")}. Please remove them.`) : null;
    }
  };
}
const In = /* @__PURE__ */ J.createContext(null);
process.env.NODE_ENV !== "production" && (In.displayName = "ThemeContext");
function $n() {
  const e = J.useContext(In);
  return process.env.NODE_ENV !== "production" && J.useDebugValue(e), e;
}
const td = typeof Symbol == "function" && Symbol.for, rd = td ? /* @__PURE__ */ Symbol.for("mui.nested") : "__THEME_NESTED__";
function nd(e, t) {
  if (typeof t == "function") {
    const r = t(e);
    return process.env.NODE_ENV !== "production" && (r || console.error(["MUI: You should return an object from your theme function, i.e.", "<ThemeProvider theme={() => ({})} />"].join(`
`))), r;
  }
  return {
    ...e,
    ...t
  };
}
function Er(e) {
  const {
    children: t,
    theme: r
  } = e, n = $n();
  process.env.NODE_ENV !== "production" && n === null && typeof r == "function" && console.error(["MUI: You are providing a theme function prop to the ThemeProvider component:", "<ThemeProvider theme={outerTheme => outerTheme} />", "", "However, no outer theme is present.", "Make sure a theme is already injected higher in the React tree or provide a theme object."].join(`
`));
  const o = J.useMemo(() => {
    const i = n === null ? {
      ...r
    } : nd(n, r);
    return i != null && (i[rd] = n !== null), i;
  }, [r, n]);
  return /* @__PURE__ */ m(In.Provider, {
    value: o,
    children: t
  });
}
process.env.NODE_ENV !== "production" && (Er.propTypes = {
  /**
   * Your component tree.
   */
  children: j.node,
  /**
   * A theme object. You can provide a function to extend the outer theme.
   */
  theme: j.oneOfType([j.object, j.func]).isRequired
});
process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "production" && (Er.propTypes = ss(Er.propTypes));
const od = /* @__PURE__ */ J.createContext();
function as({
  value: e,
  ...t
}) {
  return /* @__PURE__ */ m(od.Provider, {
    value: e ?? !0,
    ...t
  });
}
process.env.NODE_ENV !== "production" && (as.propTypes = {
  children: j.node,
  value: j.bool
});
const id = /* @__PURE__ */ J.createContext(void 0);
function cs({
  value: e,
  children: t
}) {
  return /* @__PURE__ */ m(id.Provider, {
    value: e,
    children: t
  });
}
process.env.NODE_ENV !== "production" && (cs.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * @ignore
   */
  children: j.node,
  /**
   * @ignore
   */
  value: j.object
});
let Mo = 0;
function sd(e) {
  const [t, r] = J.useState(e), n = e || t;
  return J.useEffect(() => {
    t == null && (Mo += 1, r(`mui-${Mo}`));
  }, [t]), n;
}
const ad = {
  ...J
}, Fo = ad.useId;
function cd(e) {
  return Fo !== void 0 ? Fo() : sd(e);
}
function ld(e) {
  const t = Pn(), r = cd() || "", {
    modularCssLayers: n
  } = e;
  let o = "mui.global, mui.components, mui.theme, mui.custom, mui.sx";
  return !n || t !== null ? o = "" : typeof n == "string" ? o = n.replace(/mui(?!\.)/g, o) : o = `@layer ${o};`, ns(() => {
    const i = document.querySelector("head");
    if (!i)
      return;
    const s = i.firstChild;
    if (o) {
      if (s && s.hasAttribute?.("data-mui-layer-order") && s.getAttribute("data-mui-layer-order") === r)
        return;
      const a = document.createElement("style");
      a.setAttribute("data-mui-layer-order", r), a.textContent = o, i.prepend(a);
    } else
      i.querySelector(`style[data-mui-layer-order="${r}"]`)?.remove();
  }, [o, r]), o ? /* @__PURE__ */ m(rs, {
    styles: o
  }) : null;
}
const Bo = {};
function Uo(e, t, r, n = !1) {
  return J.useMemo(() => {
    const o = e && t[e] || t;
    if (typeof r == "function") {
      const i = r(o), s = e ? {
        ...t,
        [e]: i
      } : i;
      return n ? () => s : s;
    }
    return e ? {
      ...t,
      [e]: r
    } : {
      ...t,
      ...r
    };
  }, [e, t, r, n]);
}
function jt(e) {
  const {
    children: t,
    theme: r,
    themeId: n
  } = e, o = Pn(Bo), i = $n() || Bo;
  process.env.NODE_ENV !== "production" && (o === null && typeof r == "function" || n && o && !o[n] && typeof r == "function") && console.error(["MUI: You are providing a theme function prop to the ThemeProvider component:", "<ThemeProvider theme={outerTheme => outerTheme} />", "", "However, no outer theme is present.", "Make sure a theme is already injected higher in the React tree or provide a theme object."].join(`
`));
  const s = Uo(n, o, r), a = Uo(n, i, r, !0), c = (n ? s[n] : s).direction === "rtl", u = ld(s);
  return /* @__PURE__ */ m(Er, {
    theme: a,
    children: /* @__PURE__ */ m(si.Provider, {
      value: s,
      children: /* @__PURE__ */ m(as, {
        value: c,
        children: /* @__PURE__ */ F(cs, {
          value: n ? s[n].components : s.components,
          children: [u, t]
        })
      })
    })
  });
}
process.env.NODE_ENV !== "production" && (jt.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Your component tree.
   */
  children: j.node,
  /**
   * A theme object. You can provide a function to extend the outer theme.
   */
  theme: j.oneOfType([j.func, j.object]).isRequired,
  /**
   * The design system's unique id for getting the corresponded theme when there are multiple design systems.
   */
  themeId: j.string
});
process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "production" && (jt.propTypes = ss(jt.propTypes));
const Dn = "mode", Ln = "color-scheme", ud = "data-color-scheme";
function dd(e) {
  const {
    defaultMode: t = "system",
    defaultLightColorScheme: r = "light",
    defaultDarkColorScheme: n = "dark",
    modeStorageKey: o = Dn,
    colorSchemeStorageKey: i = Ln,
    attribute: s = ud,
    colorSchemeNode: a = "document.documentElement",
    nonce: c
  } = e || {};
  let u = "", d = s;
  if (s === "class" && (d = ".%s"), s === "data" && (d = "[data-%s]"), d.startsWith(".")) {
    const g = d.substring(1);
    u += `${a}.classList.remove('${g}'.replace('%s', light), '${g}'.replace('%s', dark));
      ${a}.classList.add('${g}'.replace('%s', colorScheme));`;
  }
  const f = d.match(/\[([^[\]]+)\]/);
  if (f) {
    const [g, S] = f[1].split("=");
    S || (u += `${a}.removeAttribute('${g}'.replace('%s', light));
      ${a}.removeAttribute('${g}'.replace('%s', dark));`), u += `
      ${a}.setAttribute('${g}'.replace('%s', colorScheme), ${S ? `${S}.replace('%s', colorScheme)` : '""'});`;
  } else d !== ".%s" && (u += `${a}.setAttribute('${d}', colorScheme);`);
  return /* @__PURE__ */ m("script", {
    suppressHydrationWarning: !0,
    nonce: typeof window > "u" ? c : "",
    dangerouslySetInnerHTML: {
      __html: `(function() {
try {
  let colorScheme = '';
  const mode = localStorage.getItem('${o}') || '${t}';
  const dark = localStorage.getItem('${i}-dark') || '${n}';
  const light = localStorage.getItem('${i}-light') || '${r}';
  if (mode === 'system') {
    // handle system mode
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    if (mql.matches) {
      colorScheme = dark
    } else {
      colorScheme = light
    }
  }
  if (mode === 'light') {
    colorScheme = light;
  }
  if (mode === 'dark') {
    colorScheme = dark;
  }
  if (colorScheme) {
    ${u}
  }
} catch(e){}})();`
    }
  }, "mui-color-scheme-init");
}
function fd() {
}
const pd = ({
  key: e,
  storageWindow: t
}) => (!t && typeof window < "u" && (t = window), {
  get(r) {
    if (typeof window > "u")
      return;
    if (!t)
      return r;
    let n;
    try {
      n = t.localStorage.getItem(e);
    } catch {
    }
    return n || r;
  },
  set: (r) => {
    if (t)
      try {
        t.localStorage.setItem(e, r);
      } catch {
      }
  },
  subscribe: (r) => {
    if (!t)
      return fd;
    const n = (o) => {
      const i = o.newValue;
      o.key === e && r(i);
    };
    return t.addEventListener("storage", n), () => {
      t.removeEventListener("storage", n);
    };
  }
});
function rn() {
}
function jo(e) {
  if (typeof window < "u" && typeof window.matchMedia == "function" && e === "system")
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function ls(e, t) {
  if (e.mode === "light" || e.mode === "system" && e.systemMode === "light")
    return t("light");
  if (e.mode === "dark" || e.mode === "system" && e.systemMode === "dark")
    return t("dark");
}
function hd(e) {
  return ls(e, (t) => {
    if (t === "light")
      return e.lightColorScheme;
    if (t === "dark")
      return e.darkColorScheme;
  });
}
function md(e) {
  const {
    defaultMode: t = "light",
    defaultLightColorScheme: r,
    defaultDarkColorScheme: n,
    supportedColorSchemes: o = [],
    modeStorageKey: i = Dn,
    colorSchemeStorageKey: s = Ln,
    storageWindow: a = typeof window > "u" ? void 0 : window,
    storageManager: c = pd,
    noSsr: u = !1
  } = e, d = o.join(","), f = o.length > 1, g = J.useMemo(() => c?.({
    key: i,
    storageWindow: a
  }), [c, i, a]), S = J.useMemo(() => c?.({
    key: `${s}-light`,
    storageWindow: a
  }), [c, s, a]), b = J.useMemo(() => c?.({
    key: `${s}-dark`,
    storageWindow: a
  }), [c, s, a]), [h, w] = J.useState(() => {
    const V = g?.get(t) || t, B = S?.get(r) || r, M = b?.get(n) || n;
    return {
      mode: V,
      systemMode: jo(V),
      lightColorScheme: B,
      darkColorScheme: M
    };
  }), [y, C] = J.useState(u || !f);
  J.useEffect(() => {
    C(!0);
  }, []);
  const _ = hd(h), x = J.useCallback((V) => {
    w((B) => {
      if (V === B.mode)
        return B;
      const M = V ?? t;
      return g?.set(M), {
        ...B,
        mode: M,
        systemMode: jo(M)
      };
    });
  }, [g, t]), T = J.useCallback((V) => {
    V ? typeof V == "string" ? V && !d.includes(V) ? console.error(`\`${V}\` does not exist in \`theme.colorSchemes\`.`) : w((B) => {
      const M = {
        ...B
      };
      return ls(B, (v) => {
        v === "light" && (S?.set(V), M.lightColorScheme = V), v === "dark" && (b?.set(V), M.darkColorScheme = V);
      }), M;
    }) : w((B) => {
      const M = {
        ...B
      }, v = V.light === null ? r : V.light, l = V.dark === null ? n : V.dark;
      return v && (d.includes(v) ? (M.lightColorScheme = v, S?.set(v)) : console.error(`\`${v}\` does not exist in \`theme.colorSchemes\`.`)), l && (d.includes(l) ? (M.darkColorScheme = l, b?.set(l)) : console.error(`\`${l}\` does not exist in \`theme.colorSchemes\`.`)), M;
    }) : w((B) => (S?.set(r), b?.set(n), {
      ...B,
      lightColorScheme: r,
      darkColorScheme: n
    }));
  }, [d, S, b, r, n]), $ = J.useCallback((V) => {
    h.mode === "system" && w((B) => {
      const M = V?.matches ? "dark" : "light";
      return B.systemMode === M ? B : {
        ...B,
        systemMode: M
      };
    });
  }, [h.mode]), Y = J.useRef($);
  return Y.current = $, J.useEffect(() => {
    if (typeof window.matchMedia != "function" || !f)
      return;
    const V = (...M) => Y.current(...M), B = window.matchMedia("(prefers-color-scheme: dark)");
    return B.addListener(V), V(B), () => {
      B.removeListener(V);
    };
  }, [f]), J.useEffect(() => {
    if (f) {
      const V = g?.subscribe((v) => {
        (!v || ["light", "dark", "system"].includes(v)) && x(v || t);
      }) || rn, B = S?.subscribe((v) => {
        (!v || d.match(v)) && T({
          light: v
        });
      }) || rn, M = b?.subscribe((v) => {
        (!v || d.match(v)) && T({
          dark: v
        });
      }) || rn;
      return () => {
        V(), B(), M();
      };
    }
  }, [T, x, d, t, a, f, g, S, b]), {
    ...h,
    mode: y ? h.mode : void 0,
    systemMode: y ? h.systemMode : void 0,
    colorScheme: y ? _ : void 0,
    setMode: x,
    setColorScheme: T
  };
}
const gd = "*{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}";
function yd(e) {
  const {
    themeId: t,
    /**
     * This `theme` object needs to follow a certain structure to
     * be used correctly by the finel `CssVarsProvider`. It should have a
     * `colorSchemes` key with the light and dark (and any other) palette.
     * It should also ideally have a vars object created using `prepareCssVars`.
     */
    theme: r = {},
    modeStorageKey: n = Dn,
    colorSchemeStorageKey: o = Ln,
    disableTransitionOnChange: i = !1,
    defaultColorScheme: s,
    resolveTheme: a
  } = e, c = {
    allColorSchemes: [],
    colorScheme: void 0,
    darkColorScheme: void 0,
    lightColorScheme: void 0,
    mode: void 0,
    setColorScheme: () => {
    },
    setMode: () => {
    },
    systemMode: void 0
  }, u = /* @__PURE__ */ J.createContext(void 0);
  process.env.NODE_ENV !== "production" && (u.displayName = "ColorSchemeContext");
  const d = () => J.useContext(u) || c, f = {}, g = {};
  function S(y) {
    const {
      children: C,
      theme: _,
      modeStorageKey: x = n,
      colorSchemeStorageKey: T = o,
      disableTransitionOnChange: $ = i,
      storageManager: Y,
      storageWindow: V = typeof window > "u" ? void 0 : window,
      documentNode: B = typeof document > "u" ? void 0 : document,
      colorSchemeNode: M = typeof document > "u" ? void 0 : document.documentElement,
      disableNestedContext: v = !1,
      disableStyleSheetGeneration: l = !1,
      defaultMode: H = "system",
      forceThemeRerender: k = !1,
      noSsr: X
    } = y, Z = J.useRef(!1), ae = $n(), he = J.useContext(u), Me = !!he && !v, R = J.useMemo(() => _ || (typeof r == "function" ? r() : r), [_]), N = R[t], D = N || R, {
      colorSchemes: U = f,
      components: W = g,
      cssVarPrefix: G
    } = D, K = Object.keys(U).filter((Oe) => !!U[Oe]).join(","), O = J.useMemo(() => K.split(","), [K]), L = typeof s == "string" ? s : s.light, z = typeof s == "string" ? s : s.dark, Q = U[L] && U[z] ? H : U[D.defaultColorScheme]?.palette?.mode || D.palette?.mode, {
      mode: Se,
      setMode: P,
      systemMode: ue,
      lightColorScheme: we,
      darkColorScheme: Je,
      colorScheme: Ot,
      setColorScheme: Pe
    } = md({
      supportedColorSchemes: O,
      defaultLightColorScheme: L,
      defaultDarkColorScheme: z,
      modeStorageKey: x,
      colorSchemeStorageKey: T,
      defaultMode: Q,
      storageManager: Y,
      storageWindow: V,
      noSsr: X
    });
    let q = Se, oe = Ot;
    Me && (q = he.mode, oe = he.colorScheme), process.env.NODE_ENV !== "production" && k && !D.vars && console.warn(["MUI: The `forceThemeRerender` prop should only be used with CSS theme variables.", "Note that it will slow down the app when changing between modes, so only do this when you cannot find a better solution."].join(`
`));
    let Ae = oe || D.defaultColorScheme;
    D.vars && !k && (Ae = D.defaultColorScheme);
    const Ne = J.useMemo(() => {
      const Oe = D.generateThemeVars?.() || D.vars, me = {
        ...D,
        components: W,
        colorSchemes: U,
        cssVarPrefix: G,
        vars: Oe
      };
      if (typeof me.generateSpacing == "function" && (me.spacing = me.generateSpacing()), Ae) {
        const Ie = U[Ae];
        Ie && typeof Ie == "object" && Object.keys(Ie).forEach((je) => {
          Ie[je] && typeof Ie[je] == "object" ? me[je] = {
            ...me[je],
            ...Ie[je]
          } : me[je] = Ie[je];
        });
      }
      return a ? a(me) : me;
    }, [D, Ae, W, U, G]), Xe = D.colorSchemeSelector;
    ns(() => {
      if (oe && M && Xe && Xe !== "media") {
        const Oe = Xe;
        let me = Xe;
        if (Oe === "class" && (me = ".%s"), Oe === "data" && (me = "[data-%s]"), Oe?.startsWith("data-") && !Oe.includes("%s") && (me = `[${Oe}="%s"]`), me.startsWith("."))
          M.classList.remove(...O.map((Ie) => me.substring(1).replace("%s", Ie))), M.classList.add(me.substring(1).replace("%s", oe));
        else {
          const Ie = me.replace("%s", oe).match(/\[([^\]]+)\]/);
          if (Ie) {
            const [je, Fr] = Ie[1].split("=");
            Fr || O.forEach((Ss) => {
              M.removeAttribute(je.replace(oe, Ss));
            }), M.setAttribute(je, Fr ? Fr.replace(/"|'/g, "") : "");
          } else
            M.setAttribute(me, oe);
        }
      }
    }, [oe, Xe, M, O]), J.useEffect(() => {
      let Oe;
      if ($ && Z.current && B) {
        const me = B.createElement("style");
        me.appendChild(B.createTextNode(gd)), B.head.appendChild(me), window.getComputedStyle(B.body), Oe = setTimeout(() => {
          B.head.removeChild(me);
        }, 1);
      }
      return () => {
        clearTimeout(Oe);
      };
    }, [oe, $, B]), J.useEffect(() => (Z.current = !0, () => {
      Z.current = !1;
    }), []);
    const Mr = J.useMemo(() => ({
      allColorSchemes: O,
      colorScheme: oe,
      darkColorScheme: Je,
      lightColorScheme: we,
      mode: q,
      setColorScheme: Pe,
      setMode: process.env.NODE_ENV === "production" ? P : (Oe) => {
        Ne.colorSchemeSelector === "media" && console.error(["MUI: The `setMode` function has no effect if `colorSchemeSelector` is `media` (`media` is the default value).", "To toggle the mode manually, please configure `colorSchemeSelector` to use a class or data attribute.", "To learn more, visit https://mui.com/material-ui/customization/css-theme-variables/configuration/#toggling-dark-mode-manually"].join(`
`)), P(Oe);
      },
      systemMode: ue
    }), [O, oe, Je, we, q, Pe, P, ue, Ne.colorSchemeSelector]);
    let Ze = !0;
    (l || D.cssVariables === !1 || Me && ae?.cssVarPrefix === G) && (Ze = !1);
    const Bn = /* @__PURE__ */ F(J.Fragment, {
      children: [/* @__PURE__ */ m(jt, {
        themeId: N ? t : void 0,
        theme: Ne,
        children: C
      }), Ze && /* @__PURE__ */ m(An, {
        styles: Ne.generateStyleSheets?.() || []
      })]
    });
    return Me ? Bn : /* @__PURE__ */ m(u.Provider, {
      value: Mr,
      children: Bn
    });
  }
  process.env.NODE_ENV !== "production" && (S.propTypes = {
    /**
     * The component tree.
     */
    children: j.node,
    /**
     * The node used to attach the color-scheme attribute
     */
    colorSchemeNode: j.any,
    /**
     * localStorage key used to store `colorScheme`
     */
    colorSchemeStorageKey: j.string,
    /**
     * The default mode when the storage is empty,
     * require the theme to have `colorSchemes` with light and dark.
     */
    defaultMode: j.string,
    /**
     * If `true`, the provider creates its own context and generate stylesheet as if it is a root `CssVarsProvider`.
     */
    disableNestedContext: j.bool,
    /**
     * If `true`, the style sheet won't be generated.
     *
     * This is useful for controlling nested CssVarsProvider behavior.
     */
    disableStyleSheetGeneration: j.bool,
    /**
     * Disable CSS transitions when switching between modes or color schemes.
     */
    disableTransitionOnChange: j.bool,
    /**
     * The document to attach the attribute to.
     */
    documentNode: j.any,
    /**
     * If `true`, theme values are recalculated when the mode changes.
     */
    forceThemeRerender: j.bool,
    /**
     * The key in the local storage used to store current color scheme.
     */
    modeStorageKey: j.string,
    /**
     * If `true`, the mode will be the same value as the storage without an extra rerendering after the hydration.
     * You should use this option in conjunction with `InitColorSchemeScript` component.
     */
    noSsr: j.bool,
    /**
     * The storage manager to be used for storing the mode and color scheme
     * @default using `window.localStorage`
     */
    storageManager: j.func,
    /**
     * The window that attaches the 'storage' event listener.
     * @default window
     */
    storageWindow: j.any,
    /**
     * The calculated theme object that will be passed through context.
     */
    theme: j.object
  });
  const b = typeof s == "string" ? s : s.light, h = typeof s == "string" ? s : s.dark;
  return {
    CssVarsProvider: S,
    useColorScheme: d,
    getInitColorSchemeScript: (y) => dd({
      colorSchemeStorageKey: o,
      defaultLightColorScheme: b,
      defaultDarkColorScheme: h,
      modeStorageKey: n,
      ...y
    })
  };
}
function bd(e = "") {
  function t(...n) {
    if (!n.length)
      return "";
    const o = n[0];
    return typeof o == "string" && !o.match(/(#|\(|\)|(-?(\d*\.)?\d+)(px|em|%|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc))|^(-?(\d*\.)?\d+)$|(\d+ \d+ \d+)/) ? `, var(--${e ? `${e}-` : ""}${o}${t(...n.slice(1))})` : `, ${o}`;
  }
  return (n, ...o) => `var(--${e ? `${e}-` : ""}${n}${t(...o)})`;
}
const Ho = (e, t, r, n = []) => {
  let o = e;
  t.forEach((i, s) => {
    s === t.length - 1 ? Array.isArray(o) ? o[Number(i)] = r : o && typeof o == "object" && (o[i] = r) : o && typeof o == "object" && (o[i] || (o[i] = n.includes(i) ? [] : {}), o = o[i]);
  });
}, Sd = (e, t, r) => {
  function n(o, i = [], s = []) {
    Object.entries(o).forEach(([a, c]) => {
      (!r || r && !r([...i, a])) && c != null && (typeof c == "object" && Object.keys(c).length > 0 ? n(c, [...i, a], Array.isArray(c) ? [...s, a] : s) : t([...i, a], c, s));
    });
  }
  n(e);
}, Ed = (e, t) => typeof t == "number" ? ["lineHeight", "fontWeight", "opacity", "zIndex"].some((n) => e.includes(n)) || e[e.length - 1].toLowerCase().includes("opacity") ? t : `${t}px` : t;
function nn(e, t) {
  const {
    prefix: r,
    shouldSkipGeneratingVar: n
  } = t || {}, o = {}, i = {}, s = {};
  return Sd(
    e,
    (a, c, u) => {
      if ((typeof c == "string" || typeof c == "number") && (!n || !n(a, c))) {
        const d = `--${r ? `${r}-` : ""}${a.join("-")}`, f = Ed(a, c);
        Object.assign(o, {
          [d]: f
        }), Ho(i, a, `var(${d})`, u), Ho(s, a, `var(${d}, ${f})`, u);
      }
    },
    (a) => a[0] === "vars"
    // skip 'vars/*' paths
  ), {
    css: o,
    vars: i,
    varsWithDefaults: s
  };
}
function wd(e, t = {}) {
  const {
    getSelector: r = y,
    disableCssColorScheme: n,
    colorSchemeSelector: o,
    enableContrastVars: i
  } = t, {
    colorSchemes: s = {},
    components: a,
    defaultColorScheme: c = "light",
    ...u
  } = e, {
    vars: d,
    css: f,
    varsWithDefaults: g
  } = nn(u, t);
  let S = g;
  const b = {}, {
    [c]: h,
    ...w
  } = s;
  if (Object.entries(w || {}).forEach(([x, T]) => {
    const {
      vars: $,
      css: Y,
      varsWithDefaults: V
    } = nn(T, t);
    S = ke(S, V), b[x] = {
      css: Y,
      vars: $
    };
  }), h) {
    const {
      css: x,
      vars: T,
      varsWithDefaults: $
    } = nn(h, t);
    S = ke(S, $), b[c] = {
      css: x,
      vars: T
    };
  }
  function y(x, T) {
    let $ = o;
    if (o === "class" && ($ = ".%s"), o === "data" && ($ = "[data-%s]"), o?.startsWith("data-") && !o.includes("%s") && ($ = `[${o}="%s"]`), x) {
      if ($ === "media")
        return e.defaultColorScheme === x ? ":root" : {
          [`@media (prefers-color-scheme: ${s[x]?.palette?.mode || x})`]: {
            ":root": T
          }
        };
      if ($)
        return e.defaultColorScheme === x ? `:root, ${$.replace("%s", String(x))}` : $.replace("%s", String(x));
    }
    return ":root";
  }
  return {
    vars: S,
    generateThemeVars: () => {
      let x = {
        ...d
      };
      return Object.entries(b).forEach(([, {
        vars: T
      }]) => {
        x = ke(x, T);
      }), x;
    },
    generateStyleSheets: () => {
      const x = [], T = e.defaultColorScheme || "light";
      function $(B, M) {
        Object.keys(M).length && x.push(typeof B == "string" ? {
          [B]: {
            ...M
          }
        } : B);
      }
      $(r(void 0, {
        ...f
      }), f);
      const {
        [T]: Y,
        ...V
      } = b;
      if (Y) {
        const {
          css: B
        } = Y, M = s[T]?.palette?.mode, v = !n && M ? {
          colorScheme: M,
          ...B
        } : {
          ...B
        };
        $(r(T, {
          ...v
        }), v);
      }
      return Object.entries(V).forEach(([B, {
        css: M
      }]) => {
        const v = s[B]?.palette?.mode, l = !n && v ? {
          colorScheme: v,
          ...M
        } : {
          ...M
        };
        $(r(B, {
          ...l
        }), l);
      }), i && x.push({
        ":root": {
          // use double underscore to indicate that these are private variables
          "--__l-threshold": "0.7",
          "--__l": "clamp(0, (l / var(--__l-threshold) - 1) * -infinity, 1)",
          "--__a": "clamp(0.87, (l / var(--__l-threshold) - 1) * -infinity, 1)"
          // 0.87 is the default alpha value for black text.
        }
      }), x;
    }
  };
}
function xd(e) {
  return function(r) {
    return e === "media" ? (process.env.NODE_ENV !== "production" && r !== "light" && r !== "dark" && console.error(`MUI: @media (prefers-color-scheme) supports only 'light' or 'dark', but receive '${r}'.`), `@media (prefers-color-scheme: ${r})`) : e ? e.startsWith("data-") && !e.includes("%s") ? `[${e}="${r}"] &` : e === "class" ? `.${r} &` : e === "data" ? `[data-${r}] &` : `${e.replace("%s", r)} &` : "&";
  };
}
const Ht = {
  black: "#000",
  white: "#fff"
}, Td = {
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
}, ht = {
  50: "#f3e5f5",
  200: "#ce93d8",
  300: "#ba68c8",
  400: "#ab47bc",
  500: "#9c27b0",
  700: "#7b1fa2"
}, mt = {
  300: "#e57373",
  400: "#ef5350",
  500: "#f44336",
  700: "#d32f2f",
  800: "#c62828"
}, vt = {
  300: "#ffb74d",
  400: "#ffa726",
  500: "#ff9800",
  700: "#f57c00",
  900: "#e65100"
}, gt = {
  50: "#e3f2fd",
  200: "#90caf9",
  400: "#42a5f5",
  700: "#1976d2",
  800: "#1565c0"
}, yt = {
  300: "#4fc3f7",
  400: "#29b6f6",
  500: "#03a9f4",
  700: "#0288d1",
  900: "#01579b"
}, bt = {
  300: "#81c784",
  400: "#66bb6a",
  500: "#4caf50",
  700: "#388e3c",
  800: "#2e7d32",
  900: "#1b5e20"
};
function us() {
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
      paper: Ht.white,
      default: Ht.white
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
const ds = us();
function fs() {
  return {
    text: {
      primary: Ht.white,
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
      active: Ht.white,
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
const dn = fs();
function Vo(e, t, r, n) {
  const o = n.light || n, i = n.dark || n * 1.5;
  e[t] || (e.hasOwnProperty(r) ? e[t] = e[r] : t === "light" ? e.light = Lr(e.main, o) : t === "dark" && (e.dark = Dr(e.main, i)));
}
function Wo(e, t, r, n, o) {
  const i = o.light || o, s = o.dark || o * 1.5;
  t[r] || (t.hasOwnProperty(n) ? t[r] = t[n] : r === "light" ? t.light = `color-mix(in ${e}, ${t.main}, #fff ${(i * 100).toFixed(0)}%)` : r === "dark" && (t.dark = `color-mix(in ${e}, ${t.main}, #000 ${(s * 100).toFixed(0)}%)`));
}
function Cd(e = "light") {
  return e === "dark" ? {
    main: gt[200],
    light: gt[50],
    dark: gt[400]
  } : {
    main: gt[700],
    light: gt[400],
    dark: gt[800]
  };
}
function Od(e = "light") {
  return e === "dark" ? {
    main: ht[200],
    light: ht[50],
    dark: ht[400]
  } : {
    main: ht[500],
    light: ht[300],
    dark: ht[700]
  };
}
function Rd(e = "light") {
  return e === "dark" ? {
    main: mt[500],
    light: mt[300],
    dark: mt[700]
  } : {
    main: mt[700],
    light: mt[400],
    dark: mt[800]
  };
}
function _d(e = "light") {
  return e === "dark" ? {
    main: yt[400],
    light: yt[300],
    dark: yt[700]
  } : {
    main: yt[700],
    light: yt[500],
    dark: yt[900]
  };
}
function Ad(e = "light") {
  return e === "dark" ? {
    main: bt[400],
    light: bt[300],
    dark: bt[700]
  } : {
    main: bt[800],
    light: bt[500],
    dark: bt[900]
  };
}
function vd(e = "light") {
  return e === "dark" ? {
    main: vt[400],
    light: vt[300],
    dark: vt[700]
  } : {
    main: "#ed6c02",
    // closest to orange[800] that pass 3:1.
    light: vt[500],
    dark: vt[900]
  };
}
function kd(e) {
  return `oklch(from ${e} var(--__l) 0 h / var(--__a))`;
}
function Mn(e) {
  const {
    mode: t = "light",
    contrastThreshold: r = 3,
    tonalOffset: n = 0.2,
    colorSpace: o,
    ...i
  } = e, s = e.primary || Cd(t), a = e.secondary || Od(t), c = e.error || Rd(t), u = e.info || _d(t), d = e.success || Ad(t), f = e.warning || vd(t);
  function g(w) {
    if (o)
      return kd(w);
    const y = Lo(w, dn.text.primary) >= r ? dn.text.primary : ds.text.primary;
    if (process.env.NODE_ENV !== "production") {
      const C = Lo(w, y);
      C < 3 && console.error([`MUI: The contrast ratio of ${C}:1 for ${y} on ${w}`, "falls below the WCAG recommended absolute minimum contrast ratio of 3:1.", "https://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-contrast"].join(`
`));
    }
    return y;
  }
  const S = ({
    color: w,
    name: y,
    mainShade: C = 500,
    lightShade: _ = 300,
    darkShade: x = 700
  }) => {
    if (w = {
      ...w
    }, !w.main && w[C] && (w.main = w[C]), !w.hasOwnProperty("main"))
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The color${y ? ` (${y})` : ""} provided to augmentColor(color) is invalid.
The color object needs to have a \`main\` property or a \`${C}\` property.` : rt(11, y ? ` (${y})` : "", C));
    if (typeof w.main != "string")
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The color${y ? ` (${y})` : ""} provided to augmentColor(color) is invalid.
\`color.main\` should be a string, but \`${JSON.stringify(w.main)}\` was provided instead.

Did you intend to use one of the following approaches?

import { green } from "@mui/material/colors";

const theme1 = createTheme({ palette: {
  primary: green,
} });

const theme2 = createTheme({ palette: {
  primary: { main: green[500] },
} });` : rt(12, y ? ` (${y})` : "", JSON.stringify(w.main)));
    return o ? (Wo(o, w, "light", _, n), Wo(o, w, "dark", x, n)) : (Vo(w, "light", _, n), Vo(w, "dark", x, n)), w.contrastText || (w.contrastText = g(w.main)), w;
  };
  let b;
  return t === "light" ? b = us() : t === "dark" && (b = fs()), process.env.NODE_ENV !== "production" && (b || console.error(`MUI: The palette mode \`${t}\` is not supported.`)), ke({
    // A collection of common colors.
    common: {
      ...Ht
    },
    // prevent mutable object.
    // The palette mode, can be light or dark.
    mode: t,
    // The colors used to represent primary interface elements for a user.
    primary: S({
      color: s,
      name: "primary"
    }),
    // The colors used to represent secondary interface elements for a user.
    secondary: S({
      color: a,
      name: "secondary",
      mainShade: "A400",
      lightShade: "A200",
      darkShade: "A700"
    }),
    // The colors used to represent interface elements that the user should be made aware of.
    error: S({
      color: c,
      name: "error"
    }),
    // The colors used to represent potentially dangerous actions or important messages.
    warning: S({
      color: f,
      name: "warning"
    }),
    // The colors used to present information to the user that is neutral and not necessarily important.
    info: S({
      color: u,
      name: "info"
    }),
    // The colors used to indicate the successful completion of an action that user triggered.
    success: S({
      color: d,
      name: "success"
    }),
    // The grey colors.
    grey: Td,
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    contrastThreshold: r,
    // Takes a background color and returns the text color that maximizes the contrast.
    getContrastText: g,
    // Generate a rich color object.
    augmentColor: S,
    // Used by the functions below to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    tonalOffset: n,
    // The light and dark mode object.
    ...b
  }, i);
}
function Pd(e) {
  const t = {};
  return Object.entries(e).forEach((n) => {
    const [o, i] = n;
    typeof i == "object" && (t[o] = `${i.fontStyle ? `${i.fontStyle} ` : ""}${i.fontVariant ? `${i.fontVariant} ` : ""}${i.fontWeight ? `${i.fontWeight} ` : ""}${i.fontStretch ? `${i.fontStretch} ` : ""}${i.fontSize || ""}${i.lineHeight ? `/${i.lineHeight} ` : ""}${i.fontFamily || ""}`);
  }), t;
}
function Nd(e, t) {
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
function Id(e) {
  return Math.round(e * 1e5) / 1e5;
}
const zo = {
  textTransform: "uppercase"
}, qo = '"Roboto", "Helvetica", "Arial", sans-serif';
function ps(e, t) {
  const {
    fontFamily: r = qo,
    // The default font size of the Material Specification.
    fontSize: n = 14,
    // px
    fontWeightLight: o = 300,
    fontWeightRegular: i = 400,
    fontWeightMedium: s = 500,
    fontWeightBold: a = 700,
    // Tell MUI what's the font-size on the html element.
    // 16px is the default font-size used by browsers.
    htmlFontSize: c = 16,
    // Apply the CSS properties to all the variants.
    allVariants: u,
    pxToRem: d,
    ...f
  } = typeof t == "function" ? t(e) : t;
  process.env.NODE_ENV !== "production" && (typeof n != "number" && console.error("MUI: `fontSize` is required to be a number."), typeof c != "number" && console.error("MUI: `htmlFontSize` is required to be a number."));
  const g = n / 14, S = d || ((w) => `${w / c * g}rem`), b = (w, y, C, _, x) => ({
    fontFamily: r,
    fontWeight: w,
    fontSize: S(y),
    // Unitless following https://meyerweb.com/eric/thoughts/2006/02/08/unitless-line-heights/
    lineHeight: C,
    // The letter spacing was designed for the Roboto font-family. Using the same letter-spacing
    // across font-families can cause issues with the kerning.
    ...r === qo ? {
      letterSpacing: `${Id(_ / y)}em`
    } : {},
    ...x,
    ...u
  }), h = {
    h1: b(o, 96, 1.167, -1.5),
    h2: b(o, 60, 1.2, -0.5),
    h3: b(i, 48, 1.167, 0),
    h4: b(i, 34, 1.235, 0.25),
    h5: b(i, 24, 1.334, 0),
    h6: b(s, 20, 1.6, 0.15),
    subtitle1: b(i, 16, 1.75, 0.15),
    subtitle2: b(s, 14, 1.57, 0.1),
    body1: b(i, 16, 1.5, 0.15),
    body2: b(i, 14, 1.43, 0.15),
    button: b(s, 14, 1.75, 0.4, zo),
    caption: b(i, 12, 1.66, 0.4),
    overline: b(i, 12, 2.66, 1, zo),
    // TODO v6: Remove handling of 'inherit' variant from the theme as it is already handled in Material UI's Typography component. Also, remember to remove the associated types.
    inherit: {
      fontFamily: "inherit",
      fontWeight: "inherit",
      fontSize: "inherit",
      lineHeight: "inherit",
      letterSpacing: "inherit"
    }
  };
  return ke({
    htmlFontSize: c,
    pxToRem: S,
    fontFamily: r,
    fontSize: n,
    fontWeightLight: o,
    fontWeightRegular: i,
    fontWeightMedium: s,
    fontWeightBold: a,
    ...h
  }, f, {
    clone: !1
    // No need to clone deep
  });
}
const $d = 0.2, Dd = 0.14, Ld = 0.12;
function ce(...e) {
  return [`${e[0]}px ${e[1]}px ${e[2]}px ${e[3]}px rgba(0,0,0,${$d})`, `${e[4]}px ${e[5]}px ${e[6]}px ${e[7]}px rgba(0,0,0,${Dd})`, `${e[8]}px ${e[9]}px ${e[10]}px ${e[11]}px rgba(0,0,0,${Ld})`].join(",");
}
const Md = ["none", ce(0, 2, 1, -1, 0, 1, 1, 0, 0, 1, 3, 0), ce(0, 3, 1, -2, 0, 2, 2, 0, 0, 1, 5, 0), ce(0, 3, 3, -2, 0, 3, 4, 0, 0, 1, 8, 0), ce(0, 2, 4, -1, 0, 4, 5, 0, 0, 1, 10, 0), ce(0, 3, 5, -1, 0, 5, 8, 0, 0, 1, 14, 0), ce(0, 3, 5, -1, 0, 6, 10, 0, 0, 1, 18, 0), ce(0, 4, 5, -2, 0, 7, 10, 1, 0, 2, 16, 1), ce(0, 5, 5, -3, 0, 8, 10, 1, 0, 3, 14, 2), ce(0, 5, 6, -3, 0, 9, 12, 1, 0, 3, 16, 2), ce(0, 6, 6, -3, 0, 10, 14, 1, 0, 4, 18, 3), ce(0, 6, 7, -4, 0, 11, 15, 1, 0, 4, 20, 3), ce(0, 7, 8, -4, 0, 12, 17, 2, 0, 5, 22, 4), ce(0, 7, 8, -4, 0, 13, 19, 2, 0, 5, 24, 4), ce(0, 7, 9, -4, 0, 14, 21, 2, 0, 5, 26, 4), ce(0, 8, 9, -5, 0, 15, 22, 2, 0, 6, 28, 5), ce(0, 8, 10, -5, 0, 16, 24, 2, 0, 6, 30, 5), ce(0, 8, 11, -5, 0, 17, 26, 2, 0, 6, 32, 5), ce(0, 9, 11, -5, 0, 18, 28, 2, 0, 7, 34, 6), ce(0, 9, 12, -6, 0, 19, 29, 2, 0, 7, 36, 6), ce(0, 10, 13, -6, 0, 20, 31, 3, 0, 8, 38, 7), ce(0, 10, 13, -6, 0, 21, 33, 3, 0, 8, 40, 7), ce(0, 10, 14, -6, 0, 22, 35, 3, 0, 8, 42, 7), ce(0, 11, 14, -7, 0, 23, 36, 3, 0, 9, 44, 8), ce(0, 11, 15, -7, 0, 24, 38, 3, 0, 9, 46, 8)], Fd = {
  // This is the most common easing curve.
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  // Objects enter the screen at full velocity from off-screen and
  // slowly decelerate to a resting point.
  easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
  // Objects leave the screen at full velocity. They do not decelerate when off-screen.
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  // The sharp curve is used by objects that may return to the screen at any time.
  sharp: "cubic-bezier(0.4, 0, 0.6, 1)"
}, Bd = {
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
function Ko(e) {
  return `${Math.round(e)}ms`;
}
function Ud(e) {
  if (!e)
    return 0;
  const t = e / 36;
  return Math.min(Math.round((4 + 15 * t ** 0.25 + t / 5) * 10), 3e3);
}
function jd(e) {
  const t = {
    ...Fd,
    ...e.easing
  }, r = {
    ...Bd,
    ...e.duration
  };
  return {
    getAutoHeightDuration: Ud,
    create: (o = ["all"], i = {}) => {
      const {
        duration: s = r.standard,
        easing: a = t.easeInOut,
        delay: c = 0,
        ...u
      } = i;
      if (process.env.NODE_ENV !== "production") {
        const d = (g) => typeof g == "string", f = (g) => !Number.isNaN(parseFloat(g));
        !d(o) && !Array.isArray(o) && console.error('MUI: Argument "props" must be a string or Array.'), !f(s) && !d(s) && console.error(`MUI: Argument "duration" must be a number or a string but found ${s}.`), d(a) || console.error('MUI: Argument "easing" must be a string.'), !f(c) && !d(c) && console.error('MUI: Argument "delay" must be a number or a string.'), typeof i != "object" && console.error(["MUI: Secong argument of transition.create must be an object.", "Arguments should be either `create('prop1', options)` or `create(['prop1', 'prop2'], options)`"].join(`
`)), Object.keys(u).length !== 0 && console.error(`MUI: Unrecognized argument(s) [${Object.keys(u).join(",")}].`);
      }
      return (Array.isArray(o) ? o : [o]).map((d) => `${d} ${typeof s == "string" ? s : Ko(s)} ${a} ${typeof c == "string" ? c : Ko(c)}`).join(",");
    },
    ...e,
    easing: t,
    duration: r
  };
}
const Hd = {
  mobileStepper: 1e3,
  fab: 1050,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500
};
function Vd(e) {
  return Qe(e) || typeof e > "u" || typeof e == "string" || typeof e == "boolean" || typeof e == "number" || Array.isArray(e);
}
function hs(e = {}) {
  const t = {
    ...e
  };
  function r(n) {
    const o = Object.entries(n);
    for (let i = 0; i < o.length; i++) {
      const [s, a] = o[i];
      !Vd(a) || s.startsWith("unstable_") ? delete n[s] : Qe(a) && (n[s] = {
        ...a
      }, r(n[s]));
    }
  }
  return r(t), `import { unstable_createBreakpoints as createBreakpoints, createTransitions } from '@mui/material/styles';

const theme = ${JSON.stringify(t, null, 2)};

theme.breakpoints = createBreakpoints(theme.breakpoints || {});
theme.transitions = createTransitions(theme.transitions || {});

export default theme;`;
}
function Go(e) {
  return typeof e == "number" ? `${(e * 100).toFixed(0)}%` : `calc((${e}) * 100%)`;
}
const Wd = (e) => {
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
function zd(e) {
  Object.assign(e, {
    alpha(t, r) {
      const n = this || e;
      return n.colorSpace ? `oklch(from ${t} l c h / ${typeof r == "string" ? `calc(${r})` : r})` : n.vars ? `rgba(${t.replace(/var\(--([^,\s)]+)(?:,[^)]+)?\)+/g, "var(--$1Channel)")} / ${typeof r == "string" ? `calc(${r})` : r})` : is(t, Wd(r));
    },
    lighten(t, r) {
      const n = this || e;
      return n.colorSpace ? `color-mix(in ${n.colorSpace}, ${t}, #fff ${Go(r)})` : Lr(t, r);
    },
    darken(t, r) {
      const n = this || e;
      return n.colorSpace ? `color-mix(in ${n.colorSpace}, ${t}, #000 ${Go(r)})` : Dr(t, r);
    }
  });
}
function fn(e = {}, ...t) {
  const {
    breakpoints: r,
    mixins: n = {},
    spacing: o,
    palette: i = {},
    transitions: s = {},
    typography: a = {},
    shape: c,
    colorSpace: u,
    ...d
  } = e;
  if (e.vars && // The error should throw only for the root theme creation because user is not allowed to use a custom node `vars`.
  // `generateThemeVars` is the closest identifier for checking that the `options` is a result of `createTheme` with CSS variables so that user can create new theme for nested ThemeProvider.
  e.generateThemeVars === void 0)
    throw new Error(process.env.NODE_ENV !== "production" ? "MUI: `vars` is a private field used for CSS variables support.\nPlease use another name or follow the [docs](https://mui.com/material-ui/customization/css-theme-variables/usage/) to enable the feature." : rt(20));
  const f = Mn({
    ...i,
    colorSpace: u
  }), g = es(e);
  let S = ke(g, {
    mixins: Nd(g.breakpoints, n),
    palette: f,
    // Don't use [...shadows] until you've verified its transpiled code is not invoking the iterator protocol.
    shadows: Md.slice(),
    typography: ps(f, a),
    transitions: jd(s),
    zIndex: {
      ...Hd
    }
  });
  if (S = ke(S, d), S = t.reduce((b, h) => ke(b, h), S), process.env.NODE_ENV !== "production") {
    const b = ["active", "checked", "completed", "disabled", "error", "expanded", "focused", "focusVisible", "required", "selected"], h = (w, y) => {
      let C;
      for (C in w) {
        const _ = w[C];
        if (b.includes(C) && Object.keys(_).length > 0) {
          if (process.env.NODE_ENV !== "production") {
            const x = Yu("", C);
            console.error([`MUI: The \`${y}\` component increases the CSS specificity of the \`${C}\` internal state.`, "You can not override it like this: ", JSON.stringify(w, null, 2), "", `Instead, you need to use the '&.${x}' syntax:`, JSON.stringify({
              root: {
                [`&.${x}`]: _
              }
            }, null, 2), "", "https://mui.com/r/state-classes-guide"].join(`
`));
          }
          w[C] = {};
        }
      }
    };
    Object.keys(S.components).forEach((w) => {
      const y = S.components[w].styleOverrides;
      y && w.startsWith("Mui") && h(y, w);
    });
  }
  return S.unstable_sxConfig = {
    ...Ir,
    ...d?.unstable_sxConfig
  }, S.unstable_sx = function(h) {
    return Zt({
      sx: h,
      theme: this
    });
  }, S.toRuntimeSource = hs, zd(S), S;
}
function qd(e) {
  let t;
  return e < 1 ? t = 5.11916 * e ** 2 : t = 4.5 * Math.log(e + 1) + 2, Math.round(t * 10) / 1e3;
}
const Kd = [...Array(25)].map((e, t) => {
  if (t === 0)
    return "none";
  const r = qd(t);
  return `linear-gradient(rgba(255 255 255 / ${r}), rgba(255 255 255 / ${r}))`;
});
function ms(e) {
  return {
    inputPlaceholder: e === "dark" ? 0.5 : 0.42,
    inputUnderline: e === "dark" ? 0.7 : 0.42,
    switchTrackDisabled: e === "dark" ? 0.2 : 0.12,
    switchTrack: e === "dark" ? 0.3 : 0.38
  };
}
function gs(e) {
  return e === "dark" ? Kd : [];
}
function Gd(e) {
  const {
    palette: t = {
      mode: "light"
    },
    // need to cast to avoid module augmentation test
    opacity: r,
    overlays: n,
    colorSpace: o,
    ...i
  } = e, s = Mn({
    ...t,
    colorSpace: o
  });
  return {
    palette: s,
    opacity: {
      ...ms(s.mode),
      ...r
    },
    overlays: n || gs(s.mode),
    ...i
  };
}
function Yd(e) {
  return !!e[0].match(/(cssVarPrefix|colorSchemeSelector|modularCssLayers|rootSelector|typography|mixins|breakpoints|direction|transitions)/) || !!e[0].match(/sxConfig$/) || // ends with sxConfig
  e[0] === "palette" && !!e[1]?.match(/(mode|contrastThreshold|tonalOffset)/);
}
const Jd = (e) => [...[...Array(25)].map((t, r) => `--${e ? `${e}-` : ""}overlays-${r}`), `--${e ? `${e}-` : ""}palette-AppBar-darkBg`, `--${e ? `${e}-` : ""}palette-AppBar-darkColor`], Xd = (e) => (t, r) => {
  const n = e.rootSelector || ":root", o = e.colorSchemeSelector;
  let i = o;
  if (o === "class" && (i = ".%s"), o === "data" && (i = "[data-%s]"), o?.startsWith("data-") && !o.includes("%s") && (i = `[${o}="%s"]`), e.defaultColorScheme === t) {
    if (t === "dark") {
      const s = {};
      return Jd(e.cssVarPrefix).forEach((a) => {
        s[a] = r[a], delete r[a];
      }), i === "media" ? {
        [n]: r,
        "@media (prefers-color-scheme: dark)": {
          [n]: s
        }
      } : i ? {
        [i.replace("%s", t)]: s,
        [`${n}, ${i.replace("%s", t)}`]: r
      } : {
        [n]: {
          ...r,
          ...s
        }
      };
    }
    if (i && i !== "media")
      return `${n}, ${i.replace("%s", String(t))}`;
  } else if (t) {
    if (i === "media")
      return {
        [`@media (prefers-color-scheme: ${String(t)})`]: {
          [n]: r
        }
      };
    if (i)
      return i.replace("%s", String(t));
  }
  return n;
};
function Zd(e, t) {
  t.forEach((r) => {
    e[r] || (e[r] = {});
  });
}
function E(e, t, r) {
  !e[t] && r && (e[t] = r);
}
function Dt(e) {
  return typeof e != "string" || !e.startsWith("hsl") ? e : os(e);
}
function qe(e, t) {
  `${t}Channel` in e || (e[`${t}Channel`] = $t(Dt(e[t]), `MUI: Can't create \`palette.${t}Channel\` because \`palette.${t}\` is not one of these formats: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().
To suppress this warning, you need to explicitly provide the \`palette.${t}Channel\` as a string (in rgb format, for example "12 12 12") or undefined if you want to remove the channel token.`));
}
function Qd(e) {
  return typeof e == "number" ? `${e}px` : typeof e == "string" || typeof e == "function" || Array.isArray(e) ? e : "8px";
}
const He = (e) => {
  try {
    return e();
  } catch {
  }
}, ef = (e = "mui") => bd(e);
function on(e, t, r, n, o) {
  if (!r)
    return;
  r = r === !0 ? {} : r;
  const i = o === "dark" ? "dark" : "light";
  if (!n) {
    t[o] = Gd({
      ...r,
      palette: {
        mode: i,
        ...r?.palette
      },
      colorSpace: e
    });
    return;
  }
  const {
    palette: s,
    ...a
  } = fn({
    ...n,
    palette: {
      mode: i,
      ...r?.palette
    },
    colorSpace: e
  });
  return t[o] = {
    ...r,
    palette: s,
    opacity: {
      ...ms(i),
      ...r?.opacity
    },
    overlays: r?.overlays || gs(i)
  }, a;
}
function tf(e = {}, ...t) {
  const {
    colorSchemes: r = {
      light: !0
    },
    defaultColorScheme: n,
    disableCssColorScheme: o = !1,
    cssVarPrefix: i = "mui",
    nativeColor: s = !1,
    shouldSkipGeneratingVar: a = Yd,
    colorSchemeSelector: c = r.light && r.dark ? "media" : void 0,
    rootSelector: u = ":root",
    ...d
  } = e, f = Object.keys(r)[0], g = n || (r.light && f !== "light" ? "light" : f), S = ef(i), {
    [g]: b,
    light: h,
    dark: w,
    ...y
  } = r, C = {
    ...y
  };
  let _ = b;
  if ((g === "dark" && !("dark" in r) || g === "light" && !("light" in r)) && (_ = !0), !_)
    throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The \`colorSchemes.${g}\` option is either missing or invalid.` : rt(21, g));
  let x;
  s && (x = "oklch");
  const T = on(x, C, _, d, g);
  h && !C.light && on(x, C, h, void 0, "light"), w && !C.dark && on(x, C, w, void 0, "dark");
  let $ = {
    defaultColorScheme: g,
    ...T,
    cssVarPrefix: i,
    colorSchemeSelector: c,
    rootSelector: u,
    getCssVar: S,
    colorSchemes: C,
    font: {
      ...Pd(T.typography),
      ...T.font
    },
    spacing: Qd(d.spacing)
  };
  Object.keys($.colorSchemes).forEach((v) => {
    const l = $.colorSchemes[v].palette, H = (X) => {
      const Z = X.split("-"), ae = Z[1], he = Z[2];
      return S(X, l[ae][he]);
    };
    l.mode === "light" && (E(l.common, "background", "#fff"), E(l.common, "onBackground", "#000")), l.mode === "dark" && (E(l.common, "background", "#000"), E(l.common, "onBackground", "#fff"));
    function k(X, Z, ae) {
      if (x) {
        let he;
        return X === it && (he = `transparent ${((1 - ae) * 100).toFixed(0)}%`), X === re && (he = `#000 ${(ae * 100).toFixed(0)}%`), X === ne && (he = `#fff ${(ae * 100).toFixed(0)}%`), `color-mix(in ${x}, ${Z}, ${he})`;
      }
      return X(Z, ae);
    }
    if (Zd(l, ["Alert", "AppBar", "Avatar", "Button", "Chip", "FilledInput", "LinearProgress", "Skeleton", "Slider", "SnackbarContent", "SpeedDialAction", "StepConnector", "StepContent", "Switch", "TableCell", "Tooltip"]), l.mode === "light") {
      E(l.Alert, "errorColor", k(re, l.error.light, 0.6)), E(l.Alert, "infoColor", k(re, l.info.light, 0.6)), E(l.Alert, "successColor", k(re, l.success.light, 0.6)), E(l.Alert, "warningColor", k(re, l.warning.light, 0.6)), E(l.Alert, "errorFilledBg", H("palette-error-main")), E(l.Alert, "infoFilledBg", H("palette-info-main")), E(l.Alert, "successFilledBg", H("palette-success-main")), E(l.Alert, "warningFilledBg", H("palette-warning-main")), E(l.Alert, "errorFilledColor", He(() => l.getContrastText(l.error.main))), E(l.Alert, "infoFilledColor", He(() => l.getContrastText(l.info.main))), E(l.Alert, "successFilledColor", He(() => l.getContrastText(l.success.main))), E(l.Alert, "warningFilledColor", He(() => l.getContrastText(l.warning.main))), E(l.Alert, "errorStandardBg", k(ne, l.error.light, 0.9)), E(l.Alert, "infoStandardBg", k(ne, l.info.light, 0.9)), E(l.Alert, "successStandardBg", k(ne, l.success.light, 0.9)), E(l.Alert, "warningStandardBg", k(ne, l.warning.light, 0.9)), E(l.Alert, "errorIconColor", H("palette-error-main")), E(l.Alert, "infoIconColor", H("palette-info-main")), E(l.Alert, "successIconColor", H("palette-success-main")), E(l.Alert, "warningIconColor", H("palette-warning-main")), E(l.AppBar, "defaultBg", H("palette-grey-100")), E(l.Avatar, "defaultBg", H("palette-grey-400")), E(l.Button, "inheritContainedBg", H("palette-grey-300")), E(l.Button, "inheritContainedHoverBg", H("palette-grey-A100")), E(l.Chip, "defaultBorder", H("palette-grey-400")), E(l.Chip, "defaultAvatarColor", H("palette-grey-700")), E(l.Chip, "defaultIconColor", H("palette-grey-700")), E(l.FilledInput, "bg", "rgba(0, 0, 0, 0.06)"), E(l.FilledInput, "hoverBg", "rgba(0, 0, 0, 0.09)"), E(l.FilledInput, "disabledBg", "rgba(0, 0, 0, 0.12)"), E(l.LinearProgress, "primaryBg", k(ne, l.primary.main, 0.62)), E(l.LinearProgress, "secondaryBg", k(ne, l.secondary.main, 0.62)), E(l.LinearProgress, "errorBg", k(ne, l.error.main, 0.62)), E(l.LinearProgress, "infoBg", k(ne, l.info.main, 0.62)), E(l.LinearProgress, "successBg", k(ne, l.success.main, 0.62)), E(l.LinearProgress, "warningBg", k(ne, l.warning.main, 0.62)), E(l.Skeleton, "bg", x ? k(it, l.text.primary, 0.11) : `rgba(${H("palette-text-primaryChannel")} / 0.11)`), E(l.Slider, "primaryTrack", k(ne, l.primary.main, 0.62)), E(l.Slider, "secondaryTrack", k(ne, l.secondary.main, 0.62)), E(l.Slider, "errorTrack", k(ne, l.error.main, 0.62)), E(l.Slider, "infoTrack", k(ne, l.info.main, 0.62)), E(l.Slider, "successTrack", k(ne, l.success.main, 0.62)), E(l.Slider, "warningTrack", k(ne, l.warning.main, 0.62));
      const X = x ? k(re, l.background.default, 0.6825) : or(l.background.default, 0.8);
      E(l.SnackbarContent, "bg", X), E(l.SnackbarContent, "color", He(() => x ? dn.text.primary : l.getContrastText(X))), E(l.SpeedDialAction, "fabHoverBg", or(l.background.paper, 0.15)), E(l.StepConnector, "border", H("palette-grey-400")), E(l.StepContent, "border", H("palette-grey-400")), E(l.Switch, "defaultColor", H("palette-common-white")), E(l.Switch, "defaultDisabledColor", H("palette-grey-100")), E(l.Switch, "primaryDisabledColor", k(ne, l.primary.main, 0.62)), E(l.Switch, "secondaryDisabledColor", k(ne, l.secondary.main, 0.62)), E(l.Switch, "errorDisabledColor", k(ne, l.error.main, 0.62)), E(l.Switch, "infoDisabledColor", k(ne, l.info.main, 0.62)), E(l.Switch, "successDisabledColor", k(ne, l.success.main, 0.62)), E(l.Switch, "warningDisabledColor", k(ne, l.warning.main, 0.62)), E(l.TableCell, "border", k(ne, k(it, l.divider, 1), 0.88)), E(l.Tooltip, "bg", k(it, l.grey[700], 0.92));
    }
    if (l.mode === "dark") {
      E(l.Alert, "errorColor", k(ne, l.error.light, 0.6)), E(l.Alert, "infoColor", k(ne, l.info.light, 0.6)), E(l.Alert, "successColor", k(ne, l.success.light, 0.6)), E(l.Alert, "warningColor", k(ne, l.warning.light, 0.6)), E(l.Alert, "errorFilledBg", H("palette-error-dark")), E(l.Alert, "infoFilledBg", H("palette-info-dark")), E(l.Alert, "successFilledBg", H("palette-success-dark")), E(l.Alert, "warningFilledBg", H("palette-warning-dark")), E(l.Alert, "errorFilledColor", He(() => l.getContrastText(l.error.dark))), E(l.Alert, "infoFilledColor", He(() => l.getContrastText(l.info.dark))), E(l.Alert, "successFilledColor", He(() => l.getContrastText(l.success.dark))), E(l.Alert, "warningFilledColor", He(() => l.getContrastText(l.warning.dark))), E(l.Alert, "errorStandardBg", k(re, l.error.light, 0.9)), E(l.Alert, "infoStandardBg", k(re, l.info.light, 0.9)), E(l.Alert, "successStandardBg", k(re, l.success.light, 0.9)), E(l.Alert, "warningStandardBg", k(re, l.warning.light, 0.9)), E(l.Alert, "errorIconColor", H("palette-error-main")), E(l.Alert, "infoIconColor", H("palette-info-main")), E(l.Alert, "successIconColor", H("palette-success-main")), E(l.Alert, "warningIconColor", H("palette-warning-main")), E(l.AppBar, "defaultBg", H("palette-grey-900")), E(l.AppBar, "darkBg", H("palette-background-paper")), E(l.AppBar, "darkColor", H("palette-text-primary")), E(l.Avatar, "defaultBg", H("palette-grey-600")), E(l.Button, "inheritContainedBg", H("palette-grey-800")), E(l.Button, "inheritContainedHoverBg", H("palette-grey-700")), E(l.Chip, "defaultBorder", H("palette-grey-700")), E(l.Chip, "defaultAvatarColor", H("palette-grey-300")), E(l.Chip, "defaultIconColor", H("palette-grey-300")), E(l.FilledInput, "bg", "rgba(255, 255, 255, 0.09)"), E(l.FilledInput, "hoverBg", "rgba(255, 255, 255, 0.13)"), E(l.FilledInput, "disabledBg", "rgba(255, 255, 255, 0.12)"), E(l.LinearProgress, "primaryBg", k(re, l.primary.main, 0.5)), E(l.LinearProgress, "secondaryBg", k(re, l.secondary.main, 0.5)), E(l.LinearProgress, "errorBg", k(re, l.error.main, 0.5)), E(l.LinearProgress, "infoBg", k(re, l.info.main, 0.5)), E(l.LinearProgress, "successBg", k(re, l.success.main, 0.5)), E(l.LinearProgress, "warningBg", k(re, l.warning.main, 0.5)), E(l.Skeleton, "bg", x ? k(it, l.text.primary, 0.13) : `rgba(${H("palette-text-primaryChannel")} / 0.13)`), E(l.Slider, "primaryTrack", k(re, l.primary.main, 0.5)), E(l.Slider, "secondaryTrack", k(re, l.secondary.main, 0.5)), E(l.Slider, "errorTrack", k(re, l.error.main, 0.5)), E(l.Slider, "infoTrack", k(re, l.info.main, 0.5)), E(l.Slider, "successTrack", k(re, l.success.main, 0.5)), E(l.Slider, "warningTrack", k(re, l.warning.main, 0.5));
      const X = x ? k(ne, l.background.default, 0.985) : or(l.background.default, 0.98);
      E(l.SnackbarContent, "bg", X), E(l.SnackbarContent, "color", He(() => x ? ds.text.primary : l.getContrastText(X))), E(l.SpeedDialAction, "fabHoverBg", or(l.background.paper, 0.15)), E(l.StepConnector, "border", H("palette-grey-600")), E(l.StepContent, "border", H("palette-grey-600")), E(l.Switch, "defaultColor", H("palette-grey-300")), E(l.Switch, "defaultDisabledColor", H("palette-grey-600")), E(l.Switch, "primaryDisabledColor", k(re, l.primary.main, 0.55)), E(l.Switch, "secondaryDisabledColor", k(re, l.secondary.main, 0.55)), E(l.Switch, "errorDisabledColor", k(re, l.error.main, 0.55)), E(l.Switch, "infoDisabledColor", k(re, l.info.main, 0.55)), E(l.Switch, "successDisabledColor", k(re, l.success.main, 0.55)), E(l.Switch, "warningDisabledColor", k(re, l.warning.main, 0.55)), E(l.TableCell, "border", k(re, k(it, l.divider, 1), 0.68)), E(l.Tooltip, "bg", k(it, l.grey[700], 0.92));
    }
    qe(l.background, "default"), qe(l.background, "paper"), qe(l.common, "background"), qe(l.common, "onBackground"), qe(l, "divider"), Object.keys(l).forEach((X) => {
      const Z = l[X];
      X !== "tonalOffset" && Z && typeof Z == "object" && (Z.main && E(l[X], "mainChannel", $t(Dt(Z.main))), Z.light && E(l[X], "lightChannel", $t(Dt(Z.light))), Z.dark && E(l[X], "darkChannel", $t(Dt(Z.dark))), Z.contrastText && E(l[X], "contrastTextChannel", $t(Dt(Z.contrastText))), X === "text" && (qe(l[X], "primary"), qe(l[X], "secondary")), X === "action" && (Z.active && qe(l[X], "active"), Z.selected && qe(l[X], "selected")));
    });
  }), $ = t.reduce((v, l) => ke(v, l), $);
  const Y = {
    prefix: i,
    disableCssColorScheme: o,
    shouldSkipGeneratingVar: a,
    getSelector: Xd($),
    enableContrastVars: s
  }, {
    vars: V,
    generateThemeVars: B,
    generateStyleSheets: M
  } = wd($, Y);
  return $.vars = V, Object.entries($.colorSchemes[$.defaultColorScheme]).forEach(([v, l]) => {
    $[v] = l;
  }), $.generateThemeVars = B, $.generateStyleSheets = M, $.generateSpacing = function() {
    return Qi(d.spacing, vn(this));
  }, $.getColorSchemeSelector = xd(c), $.spacing = $.generateSpacing(), $.shouldSkipGeneratingVar = a, $.unstable_sxConfig = {
    ...Ir,
    ...d?.unstable_sxConfig
  }, $.unstable_sx = function(l) {
    return Zt({
      sx: l,
      theme: this
    });
  }, $.toRuntimeSource = hs, $;
}
function Yo(e, t, r) {
  e.colorSchemes && r && (e.colorSchemes[t] = {
    ...r !== !0 && r,
    palette: Mn({
      ...r === !0 ? {} : r.palette,
      mode: t
    })
    // cast type to skip module augmentation test
  });
}
function Fn(e = {}, ...t) {
  const {
    palette: r,
    cssVariables: n = !1,
    colorSchemes: o = r ? void 0 : {
      light: !0
    },
    defaultColorScheme: i = r?.mode,
    ...s
  } = e, a = i || "light", c = o?.[a], u = {
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
      return fn(e, ...t);
    let d = r;
    "palette" in e || u[a] && (u[a] !== !0 ? d = u[a].palette : a === "dark" && (d = {
      mode: "dark"
    }));
    const f = fn({
      ...e,
      palette: d
    }, ...t);
    return f.defaultColorScheme = a, f.colorSchemes = u, f.palette.mode === "light" && (f.colorSchemes.light = {
      ...u.light !== !0 && u.light,
      palette: f.palette
    }, Yo(f, "dark", u.dark)), f.palette.mode === "dark" && (f.colorSchemes.dark = {
      ...u.dark !== !0 && u.dark,
      palette: f.palette
    }, Yo(f, "light", u.light)), f;
  }
  return !r && !("light" in u) && a === "light" && (u.light = !0), tf({
    ...s,
    colorSchemes: u,
    defaultColorScheme: a,
    ...typeof n != "boolean" && n
  }, ...t);
}
const rf = Fn();
function nf() {
  const e = ts(rf);
  return process.env.NODE_ENV !== "production" && J.useDebugValue(e), e[ct] || e;
}
function of({
  theme: e,
  ...t
}) {
  const r = ct in e ? e[ct] : void 0;
  return /* @__PURE__ */ m(jt, {
    ...t,
    themeId: r ? ct : void 0,
    theme: r || e
  });
}
const ir = {
  colorSchemeStorageKey: "mui-color-scheme",
  defaultLightColorScheme: "light",
  defaultDarkColorScheme: "dark",
  modeStorageKey: "mui-mode"
};
process.env.NODE_ENV !== "production" && (j.string, j.string, j.string, j.string, j.string, j.oneOf(["dark", "light", "system"]), j.string, j.string);
const {
  CssVarsProvider: sf
} = yd({
  themeId: ct,
  // @ts-ignore ignore module augmentation tests
  theme: () => Fn({
    cssVariables: !0
  }),
  colorSchemeStorageKey: ir.colorSchemeStorageKey,
  modeStorageKey: ir.modeStorageKey,
  defaultColorScheme: {
    light: ir.defaultLightColorScheme,
    dark: ir.defaultDarkColorScheme
  },
  resolveTheme: (e) => {
    const t = {
      ...e,
      typography: ps(e.palette, e.typography)
    };
    return t.unstable_sx = function(n) {
      return Zt({
        sx: n,
        theme: this
      });
    }, t;
  }
}), af = sf;
function cf({
  theme: e,
  ...t
}) {
  const r = J.useMemo(() => {
    if (typeof e == "function")
      return e;
    const n = ct in e ? e[ct] : e;
    return "colorSchemes" in n ? null : "vars" in n ? e : {
      ...e,
      vars: null
    };
  }, [e]);
  return r ? /* @__PURE__ */ m(of, {
    theme: r,
    ...t
  }) : /* @__PURE__ */ m(af, {
    theme: e,
    ...t
  });
}
const lf = Fn({ spacing: 8 }).spacing, uf = 1760, df = 1120, Jo = ({
  weight: e,
  minHeight: t,
  minHeightShort: r
}) => /* @__PURE__ */ m(
  A,
  {
    "aria-hidden": !0,
    sx: {
      flex: `${e} 1 0px`,
      minHeight: t,
      [Ue]: { minHeight: r }
    }
  }
), pn = ({
  theme: e,
  children: t,
  footer: r,
  hero: n,
  mobileHero: o
}) => {
  const i = Lt.Children.toArray(t), s = nf(), a = ws(
    () => ({ ...s, spacing: lf }),
    [s]
  ), [c, u] = Re(e.mode), [d, f] = Re(!1);
  return e.mode !== c && (u(e.mode), f(!0)), Fe(() => {
    if (!d) return;
    let g = requestAnimationFrame(() => {
      g = requestAnimationFrame(() => f(!1));
    });
    return () => cancelAnimationFrame(g);
  }, [d, c]), // Own spacing unit, so the layout looks the same in every host app.
  // Full-width page background; the layout inside is capped and centred on wide screens
  /* @__PURE__ */ m(cf, { theme: a, children: /* @__PURE__ */ m(
    A,
    {
      "data-mode-switching": d || void 0,
      sx: {
        minHeight: "100vh",
        backgroundColor: e.pageBg,
        transition: pe,
        // Desktop: centres the capped layout vertically on very tall screens
        display: { md: "flex" },
        alignItems: "center",
        // Light / dark switch: colours change at once on every element, MUI's own
        // transitions included (see MODE_SWITCH_TRANSITION)
        "&[data-mode-switching], &[data-mode-switching] *, &[data-mode-switching] *::before, &[data-mode-switching] *::after": { transition: `${Zs} !important` },
        ...ta
      },
      children: /* @__PURE__ */ F(
        A,
        {
          sx: {
            // Beyond this the hero would blow its artwork and headline up past their
            // designed size; at 1760px the dashboards show at about 1x
            maxWidth: uf,
            width: "100%",
            mx: "auto",
            minHeight: { xs: "100vh", md: 0 },
            // Desktop: one screen tall, so the page itself never scrolls (no jump on reload,
            // no flash while fonts load), capped so very tall screens do not stretch the hero
            // into an empty band; the sign-in panel scrolls inside if it must
            height: { md: `min(100vh, ${df}px)` },
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
            transition: pe,
            "& *, & *::before, & *::after": { boxSizing: "border-box" }
          },
          children: [
            /* @__PURE__ */ m(
              A,
              {
                component: "main",
                sx: {
                  display: "flex",
                  justifyContent: "center",
                  px: { xs: 3, sm: 6 },
                  // Extra room above the logo
                  pt: { xs: 5, sm: 7 },
                  pb: { xs: 4, sm: 5 },
                  [Ue]: { pt: 4.5, pb: 2.25 },
                  // Scrolls on its own beside the hero; on phones the page scrolls as usual
                  overflowY: { md: "auto" },
                  overflowX: "clip",
                  // When an error or validation line overflows a laptop-height panel: a thin,
                  // quiet scrollbar. Its space is not reserved, which would narrow the panel
                  // all the time on Windows just to avoid a reflow while an error shows.
                  scrollbarWidth: "thin",
                  scrollbarColor: `${e.border} transparent`
                },
                children: /* @__PURE__ */ F(
                  A,
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
                      i.map((g, S) => /* @__PURE__ */ F(
                        Lt.Fragment,
                        {
                          children: [
                            S > 0 && /* @__PURE__ */ m(
                              Jo,
                              {
                                weight: 1,
                                minHeight: 18,
                                minHeightShort: 8
                              }
                            ),
                            /* @__PURE__ */ F(
                              A,
                              {
                                sx: {
                                  display: "flex",
                                  flexDirection: "column",
                                  animation: Ke(S * 50)
                                },
                                children: [
                                  g,
                                  S === 0 && o && /* @__PURE__ */ m(
                                    A,
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
                        Lt.isValidElement(g) ? g.key : S
                      )),
                      /* @__PURE__ */ m(Jo, { weight: 3, minHeight: 40, minHeightShort: 24 }),
                      /* @__PURE__ */ m(
                        A,
                        {
                          sx: {
                            animation: Ke(i.length * 50)
                          },
                          children: r
                        }
                      )
                    ]
                  }
                )
              }
            ),
            /* @__PURE__ */ m(
              A,
              {
                sx: {
                  display: { xs: "none", md: "block" },
                  height: "100%",
                  p: 2,
                  pl: 0
                },
                children: n
              }
            )
          ]
        }
      )
    }
  ) });
}, kt = (e) => `var(--mark-primary, ${e})`, Xo = "var(--mark-secondary, #3D4C5E)", ff = (e) => `var(--mark-center, ${e})`, pf = "var(--mark-ring, #ffffff)", ys = ({
  platform: e,
  sx: t,
  ...r
}) => {
  const n = {
    ...r,
    sx: [
      { "& *": { transition: pi } },
      ...Array.isArray(t) ? t : [t]
    ]
  };
  if (e === "centra") {
    const s = { fill: kt("#049586") };
    return /* @__PURE__ */ F(St, { ...n, viewBox: "0 0 30 30", children: [
      /* @__PURE__ */ m(
        "path",
        {
          style: s,
          d: "M5.60529 3.14542C4.00282 4.40644 2.68044 5.98728 1.72234 7.78732C0.764232 9.58735 0.191389 11.5671 0.0402716 13.6007C-0.110846 15.6342 0.163072 17.6769 0.844589 19.5988C1.52611 21.5207 2.60029 23.2796 3.99877 24.7637L7.18245 21.7635C6.20044 20.7214 5.44614 19.4863 4.96758 18.1368C4.48902 16.7872 4.29667 15.3528 4.40279 13.9249C4.5089 12.4969 4.91115 11.1067 5.58393 9.84273C6.25672 8.57874 7.18529 7.46868 8.31054 6.58319L5.60529 3.14542Z"
        }
      ),
      /* @__PURE__ */ m(
        "path",
        {
          style: { fill: Xo },
          d: "M27.6715 7.81562C25.8485 4.37255 22.7324 1.79469 19.0087 0.649137C15.2851 -0.496418 11.2588 -0.115827 7.81575 1.70718L9.86273 5.57326C12.2805 4.29314 15.1077 4.02589 17.7225 4.8303C20.3372 5.63471 22.5253 7.44488 23.8055 9.86261L27.6715 7.81562Z"
        }
      ),
      /* @__PURE__ */ m(
        "path",
        {
          style: { fill: Xo },
          d: "M5.52492 3.20912C3.27824 5.00262 1.60718 7.41593 0.718835 10.15L4.87928 11.5018C5.50308 9.58194 6.67649 7.88731 8.25411 6.62792L5.52492 3.20912Z"
        }
      ),
      /* @__PURE__ */ m(
        "path",
        {
          style: s,
          d: "M5.89004 26.4517C7.43504 27.6075 9.19261 28.4476 11.0624 28.924C12.9321 29.4004 14.8774 29.5038 16.7871 29.2283C18.6968 28.9528 20.5336 28.3037 22.1924 27.3182C23.8512 26.3327 25.2996 25.03 26.4549 23.4846L22.9511 20.8653C22.1399 21.9505 21.1228 22.8653 19.958 23.5573C18.7932 24.2493 17.5034 24.7051 16.1624 24.8986C14.8214 25.0921 13.4554 25.0195 12.1425 24.6849C10.8296 24.3504 9.5954 23.7605 8.5105 22.9488L5.89004 26.4517Z"
        }
      ),
      /* @__PURE__ */ m(
        "rect",
        {
          style: s,
          x: "18.9181",
          y: "13.7375",
          width: "10.4612",
          height: "2.44368"
        }
      ),
      /* @__PURE__ */ m(
        "path",
        {
          style: s,
          d: "M14.6851 9.76587C17.5534 9.76607 19.8784 12.0918 19.8784 14.9602C19.8782 17.8285 17.5533 20.1534 14.6851 20.1536C11.8166 20.1536 9.49092 17.8286 9.49072 14.9602C9.49072 12.0917 11.8165 9.76587 14.6851 9.76587ZM14.689 11.3313C12.6824 11.3314 11.0554 12.9576 11.0552 14.9641C11.0552 16.9708 12.6823 18.5978 14.689 18.5979C16.6957 18.5979 18.3228 16.9708 18.3228 14.9641C18.3226 12.9575 16.6956 11.3313 14.689 11.3313Z"
        }
      )
    ] });
  }
  if (e === "xpdite") {
    const s = { fill: kt("#0F62B0") };
    return /* @__PURE__ */ F(St, { ...n, viewBox: "0 0 30 30", children: [
      /* @__PURE__ */ m(
        "rect",
        {
          style: s,
          x: "21.4259",
          y: "23.6411",
          width: "22.6887",
          height: "2.05928",
          transform: "rotate(-134.2 21.4259 23.6411)"
        }
      ),
      /* @__PURE__ */ m(
        "rect",
        {
          style: s,
          width: "25.3429",
          height: "2.05928",
          transform: "matrix(-0.73373 0.679441 0.679441 0.73373 22.6707 5.96777)"
        }
      ),
      /* @__PURE__ */ m("circle", { style: s, cx: "24.063", cy: "24.9252", r: "3.42298" }),
      /* @__PURE__ */ m("circle", { style: s, cx: "4.44975", cy: "24.9252", r: "3.42298" }),
      /* @__PURE__ */ m("circle", { style: s, cx: "4.44975", cy: "4.45204", r: "3.42298" }),
      /* @__PURE__ */ m(
        "circle",
        {
          style: { fill: ff("#0F62B0"), stroke: pf },
          cx: "14.1725",
          cy: "14.5849",
          r: "3.18086",
          strokeWidth: "1.33541"
        }
      ),
      /* @__PURE__ */ m(
        "circle",
        {
          style: { fill: "none", stroke: kt("#0F62B0") },
          cx: "3.42298",
          cy: "3.42298",
          r: "2.75528",
          strokeWidth: "1.33541",
          transform: "matrix(-0.982613 -0.185667 -0.185667 0.982613 29.7455 2.17871)"
        }
      )
    ] });
  }
  const o = { fill: kt("#03463F") }, i = { fill: "none", stroke: kt("#03463F") };
  return /* @__PURE__ */ F(St, { ...n, viewBox: "0 0 30 30", children: [
    /* @__PURE__ */ m(
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
    /* @__PURE__ */ m(
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
    /* @__PURE__ */ m(
      "path",
      {
        style: i,
        strokeWidth: "1.33541",
        d: "M8.99036 16.9846V21.3899L5.1759 23.592L1.36145 21.3899V16.9846L5.1759 14.7825L8.99036 16.9846Z"
      }
    ),
    /* @__PURE__ */ m(
      "path",
      {
        style: i,
        strokeWidth: "1.33541",
        d: "M27.9268 17.259V21.6643L24.1123 23.8665L20.2979 21.6643V17.259L24.1123 15.0569L27.9268 17.259Z"
      }
    ),
    /* @__PURE__ */ m(
      "path",
      {
        style: o,
        d: "M14.7128 4.64917L19.195 7.237V12.4127L14.7128 15.0005L10.2305 12.4127V7.237L14.7128 4.64917Z"
      }
    )
  ] });
}, hf = ({
  theme: e,
  value: t,
  platformAssets: r,
  disabled: n = !1,
  onChange: o
}) => {
  const i = e.mode === "dark", s = hn(0), a = Be.findIndex((u) => u.id === t);
  a >= 0 && (s.current = a);
  const c = Be[s.current];
  return /* @__PURE__ */ F(A, { children: [
    /* @__PURE__ */ m(
      A,
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
    /* @__PURE__ */ F(
      A,
      {
        sx: {
          position: "relative",
          p: 1,
          borderRadius: "12px",
          backgroundColor: e.surface,
          boxShadow: i ? "none" : Js,
          border: `1px solid ${i ? e.border : "transparent"}`,
          transition: pe
        },
        children: [
          /* @__PURE__ */ m(
            A,
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
                boxShadow: i ? `inset 0 0 0 1px ${c.colorOnDark}` : "none",
                transform: `translateX(calc(${s.current} * (100% + 4px))) scale(${a >= 0 ? 1 : 0.92})`,
                opacity: a >= 0 ? 1 : 0,
                transition: `transform ${bn}ms ${wt}, opacity 200ms ease, ${pe}`
              }
            }
          ),
          /* @__PURE__ */ m(
            _s,
            {
              exclusive: !0,
              fullWidth: !0,
              value: t,
              disabled: n,
              "aria-labelledby": "lumora-platform-label",
              onChange: (u, d) => d && o(d),
              sx: { position: "relative", gap: 0.5 },
              children: Be.map((u) => {
                const d = i ? u.colorOnDark : u.uiColor, f = r?.[u.id]?.logo;
                return /* @__PURE__ */ F(
                  As,
                  {
                    value: u.id,
                    disableRipple: !0,
                    sx: {
                      flex: 1,
                      gap: 0.75,
                      ...lt,
                      py: 0,
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
                      color: d,
                      // Logo colours: brand on the card, white on the selected tab
                      "--mark-primary": d,
                      "--mark-secondary": i ? e.muted : "#3D4C5E",
                      "--mark-center": d,
                      "--mark-ring": e.surface,
                      // Hover tint stays quick; the text colour follows the highlight
                      transition: `background-color 150ms, ${zt("color")}`,
                      "& .MuiSvgIcon-root": { fontSize: 22 },
                      "&:hover": {
                        backgroundColor: `${d}14`
                      },
                      // The sliding highlight draws the selected background
                      "&.Mui-selected, &.Mui-selected:hover": {
                        backgroundColor: "transparent",
                        color: "#ffffff",
                        // Selected marks: white, with Centra's arcs kept slate and
                        // Xpdite's centre node a white ring around the tab colour
                        "--mark-primary": "#ffffff",
                        "--mark-secondary": "#3D4C5E",
                        "--mark-center": u.uiColor,
                        "--mark-ring": "#ffffff"
                      },
                      "&.Mui-focusVisible": {
                        outline: `2px solid ${d}`,
                        outlineOffset: 2
                      }
                    },
                    children: [
                      f ?? /* @__PURE__ */ m(ys, { platform: u.id }),
                      u.name
                    ]
                  },
                  u.id
                );
              })
            }
          )
        ]
      }
    )
  ] });
}, Pt = ({
  width: e,
  height: t = 6
}) => /* @__PURE__ */ m(
  A,
  {
    sx: {
      width: e,
      height: t,
      borderRadius: 1,
      backgroundColor: "rgba(18, 51, 45, 0.09)"
    }
  }
), Zo = ({
  title: e,
  barColor: t,
  screenshot: r,
  compact: n = !1,
  sx: o
}) => {
  const i = n ? 22 : 40, s = n ? 6 : 12;
  return r ? /* @__PURE__ */ m(
    A,
    {
      component: "img",
      src: r,
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
  ) : /* @__PURE__ */ F(
    A,
    {
      sx: [
        {
          display: "flex",
          flexDirection: "column",
          borderRadius: n ? "8px" : "14px",
          overflow: "hidden",
          backgroundColor: "#ffffff",
          boxShadow: "0 24px 60px rgba(8, 28, 24, 0.22)"
        },
        ...Array.isArray(o) ? o : [o]
      ],
      children: [
        /* @__PURE__ */ m(
          A,
          {
            sx: {
              height: i,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: n ? "4px" : "8px",
              px: n ? 1 : 2,
              backgroundColor: t
            },
            children: [0, 1, 2].map((a) => /* @__PURE__ */ m(
              A,
              {
                sx: {
                  width: s,
                  height: s,
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.55)"
                }
              },
              a
            ))
          }
        ),
        /* @__PURE__ */ m(A, { sx: { flex: 1, minHeight: 0, position: "relative", backgroundColor: "#f7f9f9" }, children: /* @__PURE__ */ F(
          A,
          {
            "data-testid": "screenshot-placeholder",
            sx: { p: n ? 1.25 : 3.5, display: "flex", flexDirection: "column", gap: n ? 1 : 2 },
            children: [
              /* @__PURE__ */ F(A, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
                /* @__PURE__ */ m(
                  A,
                  {
                    sx: {
                      fontSize: n ? 9 : 18,
                      fontWeight: 600,
                      letterSpacing: n ? "0.18em" : 0,
                      textTransform: n ? "uppercase" : "none",
                      color: "#12332d"
                    },
                    children: e
                  }
                ),
                /* @__PURE__ */ m(
                  A,
                  {
                    sx: {
                      width: n ? 12 : 24,
                      height: n ? 12 : 24,
                      borderRadius: "50%",
                      backgroundColor: t,
                      opacity: 0.8
                    }
                  }
                )
              ] }),
              /* @__PURE__ */ m(Pt, { width: "22%", height: n ? 4 : 6 }),
              /* @__PURE__ */ m(
                A,
                {
                  sx: {
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: n ? 0.75 : 2,
                    mt: n ? 0.5 : 1
                  },
                  children: Array.from({ length: 6 }).map((a, c) => /* @__PURE__ */ F(
                    A,
                    {
                      sx: {
                        p: n ? 0.75 : 2,
                        borderRadius: n ? "4px" : "10px",
                        backgroundColor: "#ffffff",
                        border: "1px solid rgba(18, 51, 45, 0.08)",
                        borderTop: `${n ? 2 : 3}px solid ${t}`,
                        display: "flex",
                        flexDirection: "column",
                        gap: n ? 0.5 : 1
                      },
                      children: [
                        /* @__PURE__ */ m(Pt, { width: "70%", height: n ? 4 : 7 }),
                        /* @__PURE__ */ m(Pt, { width: "45%", height: n ? 3 : 5 }),
                        /* @__PURE__ */ m(Pt, { width: "85%", height: n ? 3 : 5 }),
                        /* @__PURE__ */ m(Pt, { width: "60%", height: n ? 3 : 5 })
                      ]
                    },
                    c
                  ))
                }
              ),
              !n && /* @__PURE__ */ F(
                A,
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
}, mf = 200, Qo = "clamp(1.25rem, 5.6vw, 1.6rem)", ei = {
  m: 0,
  fontWeight: 600,
  fontSize: "clamp(2.25rem, 4vw, 4.25rem)",
  lineHeight: 1.08,
  letterSpacing: "-0.02em"
}, ti = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.16em",
  textTransform: "uppercase"
}, sn = {}, gf = (e, t) => {
  const [, r] = Re(0), n = e.join(",");
  return Fe(() => {
    let o = !1;
    return e.forEach((i) => {
      t?.[i]?.screenshot || sn[i] || Et(i).loadScreenshot().then((s) => {
        sn[i] = s, o || r((a) => a + 1);
      }).catch(() => {
      });
    }), () => {
      o = !0;
    };
  }, [n, t]), Object.fromEntries(
    e.map((o) => [
      o,
      t?.[o]?.screenshot ?? sn[o]
    ])
  );
}, yf = "74.6%", bf = {
  polymer: "28.1%",
  xpdite: "11.7%",
  centra: "-4.9%"
}, ri = 2.177, Sf = {
  polymer: { left: "40%", top: "8%", width: "56%" },
  xpdite: { left: "20%", top: "18%", width: "52%" },
  centra: { left: "0%", top: "30%", width: "56%" }
}, ni = ({
  theme: e,
  platform: t,
  platformAssets: r,
  compact: n = !1
}) => {
  const o = t ? Et(t) : null, i = gf(
    o ? [o.id] : Be.map((c) => c.id),
    r
  ), s = Be.every(
    (c) => r?.[c.id]?.overviewScreenshot
  ), a = n ? 2.25 : { md: 5, lg: 6 };
  return /* @__PURE__ */ m(
    A,
    {
      component: "aside",
      "aria-label": o ? `${o.name} overview` : "Lumora platforms overview",
      sx: {
        position: "relative",
        height: n ? mf : "100%",
        borderRadius: n ? "16px" : "24px",
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
          backgroundImage: fi("currentColor"),
          backgroundSize: "32px 32px",
          transition: pe
        },
        // Content above the grid
        "& > *": { position: "relative" },
        color: o ? "#ffffff" : e.heading,
        transition: pe
      },
      children: o ? /* @__PURE__ */ F(Lt.Fragment, { children: [
        /* @__PURE__ */ F(
          A,
          {
            sx: {
              px: a,
              pt: n ? 2.25 : { md: 7, lg: 9 }
            },
            children: [
              /* @__PURE__ */ F(
                A,
                {
                  sx: {
                    ...ti,
                    // Platform label ("POLYMER • AI AGENT CONFIGURATION") in Montserrat
                    fontFamily: e.headingFont,
                    ...n && { fontSize: 10, gap: 1 },
                    animation: Ke(0)
                  },
                  children: [
                    /* @__PURE__ */ m(
                      A,
                      {
                        sx: {
                          width: 22,
                          height: "1px",
                          backgroundColor: "currentColor"
                        }
                      }
                    ),
                    o.name,
                    /* @__PURE__ */ m(
                      A,
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
              /* @__PURE__ */ F(
                A,
                {
                  component: "h2",
                  sx: {
                    ...ei,
                    // Laptops: wraps every platform's headline the way Polymer's does ("Build agents.
                    // Govern every" 13.3em fits; Centra 14.3em and Xpdite 15.2em break onto a second line).
                    // Wide screens (xl): no limit, so a headline stays on one line wherever it fits.
                    // In em, so the limit scales with the font.
                    maxWidth: { xs: "13.8em", xl: "none" },
                    ...n && {
                      fontSize: Qo
                    },
                    mt: n ? 1 : 2.5,
                    fontFamily: e.headingFont,
                    animation: Ke(60)
                  },
                  children: [
                    o.headline,
                    " ",
                    /* @__PURE__ */ m(
                      A,
                      {
                        component: "span",
                        sx: { color: o.accent },
                        children: o.headlineAccent
                      }
                    )
                  ]
                }
              ),
              !n && /* @__PURE__ */ m(
                A,
                {
                  sx: {
                    mt: 2,
                    fontSize: 18,
                    lineHeight: 1.5,
                    opacity: 0.92,
                    maxWidth: 640,
                    animation: Ke(120)
                  },
                  children: o.description
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ m(
          A,
          {
            sx: {
              flex: 1,
              minHeight: n ? 0 : 240,
              mt: n ? 1.75 : { md: 5, lg: 6 },
              ml: a,
              mr: "-14px",
              mb: "-14px",
              display: "flex",
              flexDirection: "column",
              animation: `${ea} 450ms ${wt} 120ms both`
            },
            children: /* @__PURE__ */ m(
              Zo,
              {
                title: o.name,
                barColor: o.frameColor,
                screenshot: i[o.id],
                sx: i[o.id] ? {
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
      ] }, o.id) : /* @__PURE__ */ F(Lt.Fragment, { children: [
        /* @__PURE__ */ F(
          A,
          {
            sx: {
              px: a,
              pt: n ? 2.25 : { md: 5, lg: 6 }
            },
            children: [
              /* @__PURE__ */ F(
                A,
                {
                  sx: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    animation: Ke(0)
                  },
                  children: [
                    /* @__PURE__ */ F(
                      A,
                      {
                        sx: {
                          ...ti,
                          fontFamily: e.bodyFont,
                          fontSize: 16,
                          fontWeight: 600,
                          // The phone banner keeps a small label so the headline fits
                          ...n && { fontSize: 10, gap: 1 },
                          color: e.eyebrow,
                          transition: pe
                        },
                        children: [
                          /* @__PURE__ */ m(
                            A,
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
                    !n && /* @__PURE__ */ F(
                      A,
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
                          Be.length,
                          " platforms · 1 account"
                        ]
                      }
                    )
                  ]
                }
              ),
              !n && /* @__PURE__ */ m(
                A,
                {
                  sx: {
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    mt: { md: 5, lg: 7 },
                    animation: Ke(60)
                  },
                  children: Be.map((c) => /* @__PURE__ */ F(
                    A,
                    {
                      sx: {
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        px: 1.75,
                        py: 0.75,
                        borderRadius: 999,
                        backgroundColor: c.uiColor,
                        color: "#ffffff",
                        // Logos as on a selected tab: white, Centra's arcs slate
                        "--mark-primary": "#ffffff",
                        "--mark-secondary": "#3D4C5E",
                        "--mark-center": c.uiColor,
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
                        r?.[c.id]?.logo ?? /* @__PURE__ */ m(ys, { platform: c.id }),
                        c.name
                      ]
                    },
                    c.id
                  ))
                }
              ),
              /* @__PURE__ */ F(
                A,
                {
                  component: "h2",
                  sx: {
                    ...ei,
                    ...n && {
                      fontSize: Qo
                    },
                    mt: n ? 1 : 2,
                    fontFamily: e.headingFont,
                    color: e.heroHeadline,
                    transition: pe,
                    animation: Ke(120)
                  },
                  children: [
                    "One sign-in.",
                    " ",
                    /* @__PURE__ */ m(
                      A,
                      {
                        component: "span",
                        sx: {
                          color: e.heroHeadlineAccent,
                          transition: pe
                        },
                        children: "Every platform."
                      }
                    )
                  ]
                }
              ),
              !n && /* @__PURE__ */ m(
                A,
                {
                  sx: {
                    mt: 2,
                    fontFamily: e.bodyFont,
                    fontSize: 18,
                    fontWeight: 500,
                    lineHeight: 1.55,
                    color: e.heroText,
                    maxWidth: 540,
                    animation: Ke(180)
                  },
                  children: "Centra runs the deals. Polymer builds the agents. Xpdite trains them. One Lumora account opens all three."
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ m(
          A,
          {
            sx: {
              position: "relative",
              flex: 1,
              minHeight: n ? 0 : 220,
              mt: n ? 1.5 : 0,
              mx: a,
              // Lets the overview scene size itself to this box (cqw / cqh units)
              containerType: "size"
            },
            children: s ? /* @__PURE__ */ m(
              A,
              {
                sx: {
                  position: "absolute",
                  left: 0,
                  right: 0,
                  mx: "auto",
                  aspectRatio: String(ri),
                  // Desktop: the whole stack fits, bottoms on the hero's edge.
                  // Phone banner: full width from the top, bottoms clipped.
                  ...n ? { top: 0, width: "100cqw" } : {
                    bottom: 0,
                    width: `min(100cqw, ${ri * 100}cqh)`
                  }
                },
                children: [
                  "polymer",
                  "xpdite",
                  "centra"
                ].map((c, u) => /* @__PURE__ */ m(
                  A,
                  {
                    component: "img",
                    src: r?.[c]?.overviewScreenshot,
                    alt: `${Et(c).name} dashboard`,
                    sx: {
                      position: "absolute",
                      bottom: 0,
                      left: bf[c],
                      width: yf,
                      display: "block",
                      // Back window first, front window last
                      animation: `${Vn} 500ms ${wt} ${200 + u * 60}ms both`
                    }
                  },
                  c
                ))
              }
            ) : ["polymer", "xpdite", "centra"].map((c, u) => {
              const d = Et(c);
              return /* @__PURE__ */ m(
                Zo,
                {
                  compact: !0,
                  title: d.name,
                  barColor: d.frameColor,
                  screenshot: i[c],
                  sx: {
                    position: "absolute",
                    ...Sf[c],
                    // Run past the bottom edge, where the hero clips them
                    bottom: "-24px",
                    // Back window first, front window last
                    animation: `${Vn} 500ms ${wt} ${200 + u * 60}ms both`
                  }
                },
                c
              );
            })
          }
        )
      ] }, "ecosystem")
    }
  );
}, Ef = ({ theme: e, title: t, steps: r }) => /* @__PURE__ */ F(
  A,
  {
    component: "section",
    "aria-labelledby": "lumora-first-time-title",
    sx: {
      px: 2.5,
      py: 2,
      [Ue]: { py: 1.25 },
      borderRadius: "12px",
      border: `1px solid ${e.border}`,
      backgroundColor: e.surface,
      transition: pe,
      "& *": { transition: pe }
    },
    children: [
      /* @__PURE__ */ m(
        A,
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
      /* @__PURE__ */ m(
        A,
        {
          component: "ol",
          sx: {
            m: 0,
            mt: 1.25,
            p: 0,
            listStyle: "none",
            display: "grid",
            gap: 1,
            [Ue]: { mt: 1, gap: 0.75 }
          },
          children: r.map((n, o) => /* @__PURE__ */ F(
            A,
            {
              component: "li",
              sx: { display: "flex", alignItems: "center", gap: 1.5, fontSize: 14.5, color: e.label },
              children: [
                /* @__PURE__ */ m(
                  A,
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
                n
              ]
            },
            n
          ))
        }
      )
    ]
  }
), oi = ({ brandConfig: e, theme: t }) => /* @__PURE__ */ F(
  A,
  {
    component: "footer",
    sx: {
      display: "grid",
      gap: 1,
      [Ue]: { gap: 0.5 },
      fontSize: 13,
      lineHeight: 1.5,
      color: t.label,
      transition: pe,
      // Centred on phones, where the panel is the whole page; left-aligned beside the hero
      textAlign: { xs: "center", md: "left" },
      justifyItems: { xs: "center", md: "start" }
    },
    children: [
      e.securityNote && /* @__PURE__ */ F(
        A,
        {
          sx: {
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "center", md: "flex-start" },
            gap: 0.75
          },
          children: [
            /* @__PURE__ */ m(Is, { sx: { fontSize: 14 } }),
            e.securityNote
          ]
        }
      ),
      e.supportLabel && /* @__PURE__ */ F(A, { children: [
        "Need access?",
        " ",
        e.supportUrl ? /* @__PURE__ */ m(
          jn,
          {
            href: e.supportUrl,
            sx: {
              color: t.brandText,
              textDecorationColor: "currentColor"
            },
            children: e.supportLabel
          }
        ) : /* @__PURE__ */ m(A, { component: "span", sx: { color: t.brandText }, children: e.supportLabel })
      ] }),
      (e.copyright || e.copyrightHolder) && /* @__PURE__ */ F(A, { children: [
        e.copyright,
        e.copyright && e.copyrightHolder && " ",
        e.copyrightHolder && e.copyrightUrl ? (
          // Only the holder is linked; opens in a new tab so the sign-in page stays open
          /* @__PURE__ */ m(
            jn,
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
), tp = ({
  authConfig: e,
  onLoginSuccess: t,
  onLoginError: r,
  enableRecaptcha: n = !1,
  recaptchaSiteKey: o,
  enableGoogleSignIn: i = !0,
  enableMicrosoftSignIn: s = !1,
  enableMagicLinkSignIn: a = !1,
  enablePasskeySignIn: c = !1,
  showErrors: u = !0,
  defaultPlatform: d,
  onPlatformChange: f,
  platformAssets: g,
  defaultColorMode: S,
  onColorModeChange: b,
  branding: h
}) => {
  const [w, y] = Re("idle"), [C, _] = Re(null), [x, T] = Re(!1), [$, Y] = Re(
    () => d ?? hr.get() ?? Wt
  );
  Fe(() => {
    hr.set($);
  }, [$]);
  const { colorMode: V, toggleColorMode: B } = ra(
    S,
    b
  ), M = di(h), v = yn(M, V, $), l = () => `${window.location.origin}/callback`;
  if (Fe(() => {
    const O = (L) => {
      L.persisted && y(
        (z) => z === "google-loading" || z === "microsoft-loading" ? "idle" : z
      );
    };
    return window.addEventListener("pageshow", O), () => window.removeEventListener("pageshow", O);
  }, []), Fe(() => {
    T(Vt());
  }, []), Fe(() => {
    try {
      Ve(e.apiBaseUrl, e.apiKey);
    } catch (O) {
      console.error("Failed to initialize API client:", O);
    }
  }, [e.apiBaseUrl, e.apiKey]), !i && !s && !a && !c)
    throw new Error(
      "At least one sign-in method must be enabled (enableGoogleSignIn, enableMicrosoftSignIn, enableMagicLinkSignIn or enablePasskeySignIn)"
    );
  if (n && !o)
    throw new Error(
      "recaptchaSiteKey is required when enableRecaptcha is true"
    );
  const H = () => window.grecaptcha.execute(o, { action: "login" }).catch(() => {
    throw new Error("reCAPTCHA verification failed");
  }), k = async () => {
    if (!n || !o)
      return "";
    if (typeof window > "u" || !window.grecaptcha)
      throw new Error("reCAPTCHA is not loaded");
    return new Promise((O, L) => {
      const z = () => {
        H().then(O).catch(L);
      };
      window.grecaptcha.ready(z);
    });
  }, X = async (O, L) => {
    ze.setTokens(O.accessToken, O.refreshToken);
    const z = L ?? await Ge.getCurrentUser();
    y("success"), t({ user: z, tokens: O, platform: $ });
  }, Z = (O) => {
    Y(O), f?.(O);
  }, ae = (O) => {
    try {
      y(`${O}-loading`), _(null);
      const L = O === "google" ? be.ENDPOINTS.GOOGLE_AUTH : be.ENDPOINTS.MICROSOFT_AUTH;
      setTimeout(() => {
        Ge.initiateOAuth(
          L,
          l(),
          e.apiBaseUrl
        );
      }, 300);
    } catch (L) {
      const z = L;
      _({ message: z.message, type: O }), y("error"), r(z);
    }
  }, he = async () => {
    y("passkey-loading"), _(null);
    try {
      const { tokens: O, user: L } = await Ge.loginWithPasskey();
      await X(O, L);
    } catch (O) {
      const L = O;
      _({ message: L.message, type: "passkey" }), y("error"), r(L);
    }
  }, Me = async (O) => {
    y("magic-link-loading"), _(null);
    try {
      n && await k(), await Ge.requestMagicLink(O.email, l()), y("magic-link-success");
    } catch (L) {
      const z = L;
      _({ message: z.message, type: "magic-link" }), y("error"), r(z);
    }
  }, R = () => {
    _(null), y("idle");
  };
  Fe(() => {
    if (n && o && typeof window < "u") {
      const O = document.createElement("script");
      O.src = `https://www.google.com/recaptcha/enterprise.js?render=${o}`, O.async = !0, O.defer = !0, document.head.appendChild(O);
    }
  }, [n, o]);
  const N = c && x, D = oa(w), U = i || s, W = a || N, G = /* @__PURE__ */ m(
    ni,
    {
      theme: v,
      platform: $,
      platformAssets: g
    }
  ), K = /* @__PURE__ */ m(
    ni,
    {
      theme: v,
      platform: $,
      platformAssets: g,
      compact: !0
    }
  );
  return w === "magic-link-success" ? /* @__PURE__ */ F(
    pn,
    {
      theme: v,
      hero: G,
      mobileHero: K,
      footer: /* @__PURE__ */ m(oi, { brandConfig: M, theme: v }),
      children: [
        /* @__PURE__ */ m(
          fo,
          {
            brandConfig: M,
            theme: v,
            showWelcome: !1,
            onToggleColorMode: B
          }
        ),
        /* @__PURE__ */ m(A, { sx: { pt: 6 }, children: /* @__PURE__ */ m(
          _l,
          {
            theme: v,
            title: M.magicLinkSuccessTitle || "Check your inbox",
            description: M.magicLinkSuccessDescription || "If this email address belongs to an active account, we have sent it a sign-in link.",
            onBackToLogin: R
          }
        ) })
      ]
    }
  ) : /* @__PURE__ */ F(
    pn,
    {
      theme: v,
      hero: G,
      mobileHero: K,
      footer: /* @__PURE__ */ m(oi, { brandConfig: M, theme: v }),
      children: [
        /* @__PURE__ */ m(
          fo,
          {
            brandConfig: M,
            theme: v,
            onToggleColorMode: B
          }
        ),
        /* @__PURE__ */ m(
          hf,
          {
            theme: v,
            value: $,
            platformAssets: g,
            disabled: D,
            onChange: Z
          }
        ),
        u && C && /* @__PURE__ */ m(
          vs,
          {
            severity: "error",
            onClose: () => _(null),
            sx: {
              borderRadius: "10px",
              border: `1px solid ${v.errorBorder}`,
              backgroundColor: v.errorBg,
              color: v.errorText,
              fontFamily: v.bodyFont,
              fontSize: 15,
              transition: pe,
              "& .MuiAlert-icon": { color: v.errorIcon },
              "& .MuiAlert-action .MuiIconButton-root": {
                color: v.errorText
              }
            },
            children: C.message
          }
        ),
        U && /* @__PURE__ */ F(
          A,
          {
            sx: {
              display: "grid",
              gridTemplateColumns: i && s ? "1fr 1fr" : "1fr",
              gap: 1.5
            },
            children: [
              i && /* @__PURE__ */ m(
                po,
                {
                  theme: v,
                  icon: /* @__PURE__ */ m($s, {}),
                  label: "Google",
                  ariaLabel: "Continue with Google",
                  isLoading: w === "google-loading",
                  disabled: D,
                  onClick: () => ae("google")
                }
              ),
              s && /* @__PURE__ */ m(
                po,
                {
                  theme: v,
                  icon: /* @__PURE__ */ m(Tl, { monochrome: !0 }),
                  label: "Microsoft",
                  ariaLabel: "Continue with Microsoft",
                  isLoading: w === "microsoft-loading",
                  disabled: D,
                  onClick: () => ae("microsoft")
                }
              )
            ]
          }
        ),
        U && W && /* @__PURE__ */ m(
          ks,
          {
            sx: {
              fontFamily: v.bodyFont,
              fontSize: 16,
              color: v.label,
              transition: pe,
              "&::before, &::after": {
                borderColor: v.divider,
                transition: pe
              }
            },
            children: "or use your work email"
          }
        ),
        a && /* @__PURE__ */ m(
          Rl,
          {
            theme: v,
            isSubmitting: w === "magic-link-loading",
            disabled: D,
            onSubmit: Me
          }
        ),
        N && /* @__PURE__ */ m(
          Ft,
          {
            fullWidth: !0,
            variant: "outlined",
            onClick: he,
            disabled: D,
            startIcon: w === "passkey-loading" ? /* @__PURE__ */ m(mn, { size: 16, color: "inherit" }) : void 0,
            sx: {
              ...lt,
              borderRadius: "10px",
              borderWidth: 1.5,
              borderColor: v.accent,
              backgroundColor: v.surface,
              color: v.accent,
              fontFamily: v.headingFont,
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: "0.14em",
              transition: pe,
              "&:hover": {
                borderWidth: 1.5,
                borderColor: v.accentHover,
                backgroundColor: `${v.accent}0f`
              },
              "&.Mui-disabled": {
                borderWidth: 1.5,
                borderColor: v.border,
                color: v.muted
              },
              ...mr(v)
            },
            children: w === "passkey-loading" ? "Waiting for passkey..." : "Sign in with passkey"
          }
        ),
        u && w === "error" && /* @__PURE__ */ m(
          Ft,
          {
            variant: "text",
            onClick: R,
            sx: {
              alignSelf: "center",
              mt: -1.5,
              color: v.accent,
              fontFamily: v.headingFont,
              textTransform: "none",
              fontWeight: 600,
              ...mr(v)
            },
            children: "Try Again"
          }
        ),
        M.firstTimeSteps && M.firstTimeSteps.length > 0 && /* @__PURE__ */ m(
          Ef,
          {
            theme: v,
            title: M.firstTimeTitle || "First time here?",
            steps: M.firstTimeSteps
          }
        )
      ]
    }
  );
}, wf = ["light", "dark"], xf = {
  light: "rgba(18, 51, 45, 0.09)",
  dark: "rgba(255, 255, 255, 0.08)"
}, Nt = "rgba(255, 255, 255, 0.18)", Tf = typeof window > "u" ? Fe : xs, Cf = (e, t) => ({
  mode: cr.get() ?? e ?? hi(),
  platform: t ?? hr.get() ?? Wt
}), Of = (e, t) => `(function(s){try{var e=s.parentElement,m=null,p=${JSON.stringify(t ?? null)};try{m=localStorage.getItem(${JSON.stringify(ar)});if(!p)p=localStorage.getItem(${JSON.stringify(sr)})}catch(x){}if(m!=='light'&&m!=='dark')m=${JSON.stringify(e ?? null)}||(window.matchMedia&&matchMedia(${JSON.stringify(Sn)}).matches?'dark':'light');if(${JSON.stringify(Be.map((r) => r.id))}.indexOf(p)<0)p=${JSON.stringify(Wt)};e.setAttribute('data-mode',m);e.setAttribute('data-platform',p)}catch(x){}})(document.currentScript)`, bs = (e) => `--lumora-${e}-color`, ii = (e, t, r) => {
  const n = yn(e, t, r), o = {
    "--lumora-bone": xf[t],
    "--lumora-hero": Et(r).color
  };
  return Object.entries(n).forEach(([i, s]) => {
    i !== "mode" && typeof s == "string" && (o[bs(i)] = s);
  }), o;
}, Rf = (e) => {
  const t = yn(e, "light", Wt);
  return Object.fromEntries(
    Object.entries(t).map(([r, n]) => [
      r,
      r === "mode" || typeof n != "string" ? n : `var(${bs(r)})`
    ])
  );
}, le = ({ width: e, height: t, radius: r = 6, color: n = "var(--lumora-bone)", sx: o }) => /* @__PURE__ */ m(
  Ps,
  {
    variant: "rounded",
    animation: "wave",
    width: e,
    height: t,
    sx: { bgcolor: n, borderRadius: r, flexShrink: 0, transform: "none", ...o }
  }
), It = ({ sx: e }) => /* @__PURE__ */ m(le, { radius: "10px", sx: { ...lt, ...e } }), rp = ({
  defaultColorMode: e,
  defaultPlatform: t,
  branding: r
}) => {
  const n = di(r), o = Rf(n), i = hn(null);
  Tf(() => {
    const { mode: c, platform: u } = Cf(e, t);
    i.current?.setAttribute("data-mode", c), i.current?.setAttribute("data-platform", u);
  }, [e, t]);
  const s = {};
  Be.forEach(
    ({ id: c }) => wf.forEach((u) => {
      s[`&[data-mode="${u}"][data-platform="${c}"]`] = ii(
        n,
        u,
        c
      );
    })
  );
  const a = /* @__PURE__ */ F(
    A,
    {
      sx: {
        position: "relative",
        height: "100%",
        borderRadius: "24px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--lumora-hero)",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: fi("rgba(255, 255, 255, 0.06)"),
          backgroundSize: "32px 32px"
        },
        "& > *": { position: "relative" }
      },
      children: [
        /* @__PURE__ */ F(A, { sx: { px: { md: 5, lg: 6 }, pt: { md: 7, lg: 9 } }, children: [
          /* @__PURE__ */ m(le, { width: 260, height: 12, color: Nt }),
          /* @__PURE__ */ m(le, { width: "72%", height: 56, radius: 10, color: Nt, sx: { mt: 3 } }),
          /* @__PURE__ */ m(le, { width: "48%", height: 56, radius: 10, color: Nt, sx: { mt: 1.5 } }),
          /* @__PURE__ */ m(le, { width: "58%", height: 16, color: Nt, sx: { mt: 3 } })
        ] }),
        /* @__PURE__ */ m(
          le,
          {
            radius: "14px",
            color: Nt,
            sx: { flex: 1, minHeight: 240, mt: { md: 5, lg: 6 }, ml: { md: 5, lg: 6 }, mr: "-14px", mb: "-14px" }
          }
        )
      ]
    }
  );
  return /* @__PURE__ */ F(
    A,
    {
      ref: i,
      role: "status",
      "aria-busy": "true",
      "aria-label": "Loading sign-in",
      "data-testid": "lumora-login-skeleton",
      suppressHydrationWarning: !0,
      sx: {
        ...ii(
          n,
          e ?? "light",
          t ?? Wt
        ),
        ...s
      },
      children: [
        /* @__PURE__ */ m(
          "script",
          {
            dangerouslySetInnerHTML: {
              __html: Of(e, t)
            }
          }
        ),
        /* @__PURE__ */ F(
          pn,
          {
            theme: o,
            hero: a,
            mobileHero: /* @__PURE__ */ m(le, { height: 200, radius: "16px", color: "var(--lumora-hero)" }),
            footer: /* @__PURE__ */ F(A, { sx: { display: "flex", flexDirection: "column", gap: 1 }, children: [
              /* @__PURE__ */ m(le, { width: "70%", height: 10 }),
              /* @__PURE__ */ m(le, { width: "55%", height: 10 }),
              /* @__PURE__ */ m(le, { width: "45%", height: 10 })
            ] }),
            children: [
              /* @__PURE__ */ F(A, { children: [
                /* @__PURE__ */ F(A, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
                  /* @__PURE__ */ m(le, { width: 120, height: 32 }),
                  /* @__PURE__ */ m(le, { width: 30, height: 30, radius: "50%" })
                ] }),
                /* @__PURE__ */ m(le, { width: "78%", height: 42, radius: 8, sx: { mt: 4.5, [Ue]: { mt: 3 } } }),
                /* @__PURE__ */ m(le, { width: "46%", height: 42, radius: 8, sx: { mt: 1 } }),
                /* @__PURE__ */ m(le, { width: "88%", height: 16, sx: { mt: 2, [Ue]: { mt: 1.5 } } }),
                /* @__PURE__ */ m(le, { width: "30%", height: 16, sx: { mt: 1 } })
              ] }),
              /* @__PURE__ */ F(A, { children: [
                /* @__PURE__ */ m(le, { width: "58%", height: 12, sx: { mb: 1.5 } }),
                /* @__PURE__ */ m(
                  A,
                  {
                    sx: {
                      display: "flex",
                      gap: 0.5,
                      p: 1,
                      borderRadius: "12px",
                      backgroundColor: o.surface,
                      border: `1px solid ${o.border}`
                    },
                    children: [0, 1, 2].map((c) => /* @__PURE__ */ m(le, { radius: "8px", sx: { flex: 1, ...lt } }, c))
                  }
                )
              ] }),
              /* @__PURE__ */ F(A, { sx: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }, children: [
                /* @__PURE__ */ m(It, {}),
                /* @__PURE__ */ m(It, {})
              ] }),
              /* @__PURE__ */ F(A, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
                /* @__PURE__ */ m(A, { sx: { flex: 1, height: "1px", backgroundColor: o.divider } }),
                /* @__PURE__ */ m(le, { width: 150, height: 12 }),
                /* @__PURE__ */ m(A, { sx: { flex: 1, height: "1px", backgroundColor: o.divider } })
              ] }),
              /* @__PURE__ */ F(A, { children: [
                /* @__PURE__ */ m(le, { width: "30%", height: 12, sx: { mb: 1.5 } }),
                /* @__PURE__ */ F(A, { sx: { display: "flex", gap: 1.5 }, children: [
                  /* @__PURE__ */ m(It, { sx: { flex: 1, minWidth: 0 } }),
                  /* @__PURE__ */ m(It, { sx: { width: 110 } })
                ] }),
                /* @__PURE__ */ m(It, { sx: { mt: 2 } })
              ] }),
              /* @__PURE__ */ F(
                A,
                {
                  sx: {
                    p: 2.5,
                    [Ue]: { py: 1.25 },
                    borderRadius: "12px",
                    backgroundColor: o.surface,
                    border: `1px solid ${o.border}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.25
                  },
                  children: [
                    /* @__PURE__ */ m(le, { width: "40%", height: 16 }),
                    /* @__PURE__ */ m(le, { width: "80%", height: 12 }),
                    /* @__PURE__ */ m(le, { width: "72%", height: 12 }),
                    /* @__PURE__ */ m(le, { width: "86%", height: 12 })
                  ]
                }
              )
            ]
          }
        )
      ]
    }
  );
}, np = (e) => {
  const [t, r] = Re(!0), [n, o] = Re(null), i = hn(!1);
  return Fe(() => {
    if (i.current)
      return;
    i.current = !0, (async () => {
      try {
        e?.apiBaseUrl && Ve(e.apiBaseUrl, e.apiKey);
        const a = new URLSearchParams(window.location.search);
        let c = a.get("access_token") || a.get("accessToken"), u = a.get("refresh_token") || a.get("refreshToken");
        const d = a.get("magic_token"), f = a.get("user"), g = a.get("error"), S = a.get("message");
        if (g) {
          const w = decodeURIComponent(S || g);
          throw new Error(w);
        }
        if (d) {
          const w = await Ge.verifyMagicLink(d);
          c = w.accessToken, u = w.refreshToken;
        }
        if (!c || !u)
          throw new Error("Missing authentication tokens in callback URL");
        ze.setTokens(c, u);
        let b;
        if (f)
          try {
            const w = decodeURIComponent(f);
            b = JSON.parse(w);
          } catch (w) {
            console.warn("Failed to parse user from URL, fetching from API:", w), b = await Ge.getCurrentUser();
          }
        else
          b = await Ge.getCurrentUser();
        e?.onSuccess?.({ accessToken: c, refreshToken: u }, b, hr.get());
        const h = e?.redirectPath || "/dashboard";
        window.history.replaceState({}, document.title, h), r(!1);
      } catch (a) {
        const c = a;
        o(c), e?.onError?.(c), r(!1);
      }
    })();
  }, [e?.redirectPath]), { loading: t, error: n };
}, op = (e) => ({ logout: Ts(async () => {
  const r = ze.getRefreshToken();
  if (e?.apiBaseUrl && r)
    try {
      await Ge.logout(r);
    } catch (n) {
      console.error("Logout API call failed:", n);
    }
  ze.clearTokens(), window.location.href = "/login";
}, [e?.apiBaseUrl]) }), ip = (e) => {
  const [t, r] = Re(!1), [n, o] = Re(null), [i, s] = Re(!1);
  return Fe(() => {
    s(Vt());
  }, []), { registerPasskey: async (c) => {
    r(!0), o(null);
    try {
      return e?.apiBaseUrl && Ve(e.apiBaseUrl, e.apiKey), await Ge.registerPasskey(c);
    } catch (u) {
      return o(u), null;
    } finally {
      r(!1);
    }
  }, loading: t, error: n, isSupported: i };
};
export {
  cr as ColorModeStorage,
  tp as LumoraLogin,
  rp as LumoraLoginSkeleton,
  Be as PLATFORMS,
  hr as PlatformStorage,
  ze as TokenStorage,
  di as getBrandingConfig,
  Gs as getDefaultBranding,
  np as useAuthCallback,
  op as useLogout,
  ip as usePasskeyRegistration
};
