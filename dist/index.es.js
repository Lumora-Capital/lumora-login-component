import { jsxs as z, jsx as y, Fragment as Nn } from "react/jsx-runtime";
import * as J from "react";
import Pt, { useState as Ie, useEffect as We, useId as us, useMemo as ds, useRef as Zo, useCallback as fs } from "react";
import { SvgIcon as yt, Box as D, Tooltip as ps, IconButton as hs, Button as $t, CircularProgress as ln, InputBase as ms, ToggleButtonGroup as gs, ToggleButton as ys, Link as In, Alert as bs, Divider as Ss } from "@mui/material";
import { MarkEmailReadOutlined as Es, LockOutlined as ws, Google as Ts } from "@mui/icons-material";
import { keyframes as un, Global as Cs, ThemeContext as Qo } from "@emotion/react";
import { appendErrors as xs, useForm as Os } from "react-hook-form";
import { validateFieldsNatively as Rs, toNestErrors as _s } from "@hookform/resolvers";
import * as $n from "yup";
import "@emotion/styled";
function Ue(e) {
  const t = new Uint8Array(e);
  let r = "";
  for (const o of t)
    r += String.fromCharCode(o);
  return btoa(r).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function ir(e) {
  const t = e.replace(/-/g, "+").replace(/_/g, "/"), r = (4 - t.length % 4) % 4, n = t.padEnd(t.length + r, "="), o = atob(n), i = new ArrayBuffer(o.length), s = new Uint8Array(i);
  for (let a = 0; a < o.length; a++)
    s[a] = o.charCodeAt(a);
  return i;
}
function Ut() {
  return As.stubThis(globalThis?.PublicKeyCredential !== void 0 && typeof globalThis.PublicKeyCredential == "function");
}
const As = {
  stubThis: (e) => e
};
function ei(e) {
  const { id: t } = e;
  return {
    ...e,
    id: ir(t),
    transports: e.transports,
    type: e.type
  };
}
function ti(e) {
  return (
    // Consider localhost valid as well since it's okay wrt Secure Contexts
    e === "localhost" || // Support punycode (ACE) or ascii labels and domains
    /^((xn--[a-z0-9-]+|[a-z0-9]+(-[a-z0-9]+)*)\.)+([a-z]{2,}|xn--[a-z0-9-]+)$/i.test(e)
  );
}
class we extends Error {
  constructor({ message: t, code: r, cause: n, name: o }) {
    super(t, { cause: n }), Object.defineProperty(this, "code", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: void 0
    }), this.name = o ?? n.name, this.code = r;
  }
}
function vs({ error: e, options: t }) {
  const { publicKey: r } = t;
  if (!r)
    throw Error("options was missing required publicKey property");
  if (e.name === "AbortError") {
    if (t.signal instanceof AbortSignal)
      return new we({
        message: "Registration ceremony was sent an abort signal",
        code: "ERROR_CEREMONY_ABORTED",
        cause: e
      });
  } else if (e.name === "ConstraintError") {
    if (r.authenticatorSelection?.requireResidentKey === !0)
      return new we({
        message: "Discoverable credentials were required but no available authenticator supported it",
        code: "ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT",
        cause: e
      });
    if (
      // @ts-ignore: `mediation` doesn't yet exist on CredentialCreationOptions but it's possible as of Sept 2024
      t.mediation === "conditional" && r.authenticatorSelection?.userVerification === "required"
    )
      return new we({
        message: "User verification was required during automatic registration but it could not be performed",
        code: "ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE",
        cause: e
      });
    if (r.authenticatorSelection?.userVerification === "required")
      return new we({
        message: "User verification was required but no available authenticator supported it",
        code: "ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT",
        cause: e
      });
  } else {
    if (e.name === "InvalidStateError")
      return new we({
        message: "The authenticator was previously registered",
        code: "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED",
        cause: e
      });
    if (e.name === "NotAllowedError")
      return new we({
        message: e.message,
        code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
        cause: e
      });
    if (e.name === "NotSupportedError")
      return r.pubKeyCredParams.filter((o) => o.type === "public-key").length === 0 ? new we({
        message: 'No entry in pubKeyCredParams was of type "public-key"',
        code: "ERROR_MALFORMED_PUBKEYCREDPARAMS",
        cause: e
      }) : new we({
        message: "No available authenticator supported any of the specified pubKeyCredParams algorithms",
        code: "ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG",
        cause: e
      });
    if (e.name === "SecurityError") {
      const n = globalThis.location.hostname;
      if (ti(n)) {
        if (r.rp.id !== n)
          return new we({
            message: `The RP ID "${r.rp.id}" is invalid for this domain`,
            code: "ERROR_INVALID_RP_ID",
            cause: e
          });
      } else return new we({
        message: `${globalThis.location.hostname} is an invalid domain`,
        code: "ERROR_INVALID_DOMAIN",
        cause: e
      });
    } else if (e.name === "TypeError") {
      if (r.user.id.byteLength < 1 || r.user.id.byteLength > 64)
        return new we({
          message: "User ID was not between 1 and 64 characters",
          code: "ERROR_INVALID_USER_ID_LENGTH",
          cause: e
        });
    } else if (e.name === "UnknownError")
      return new we({
        message: "The authenticator was unable to process the specified options, or could not create a new credential",
        code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
        cause: e
      });
  }
  return e;
}
class ks {
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
const ri = new ks(), Ps = ["cross-platform", "platform"];
function ni(e) {
  if (e && !(Ps.indexOf(e) < 0))
    return e;
}
async function Ns(e) {
  !e.optionsJSON && e.challenge && (console.warn("startRegistration() was not called correctly. It will try to continue with the provided options, but this call should be refactored to use the expected call structure instead. See https://simplewebauthn.dev/docs/packages/browser#typeerror-cannot-read-properties-of-undefined-reading-challenge for more information."), e = { optionsJSON: e });
  const { optionsJSON: t, useAutoRegister: r = !1 } = e;
  if (!Ut())
    throw new Error("WebAuthn is not supported in this browser");
  const n = {
    ...t,
    challenge: ir(t.challenge),
    user: {
      ...t.user,
      id: ir(t.user.id)
    },
    excludeCredentials: t.excludeCredentials?.map(ei)
  }, o = {};
  r && (o.mediation = "conditional"), o.publicKey = n, o.signal = ri.createNewAbortSignal();
  let i;
  try {
    i = await navigator.credentials.create(
      // TODO: Newer versions of Deno require this casting, revisit once we're using Deno 2.6+
      o
    );
  } catch (b) {
    throw vs({ error: b, options: o });
  }
  if (!i)
    throw new Error("Registration was not completed");
  const { id: s, rawId: a, response: c, type: u } = i;
  let d;
  typeof c.getTransports == "function" && (d = c.getTransports());
  let p;
  if (typeof c.getPublicKeyAlgorithm == "function")
    try {
      p = c.getPublicKeyAlgorithm();
    } catch (b) {
      Pr("getPublicKeyAlgorithm()", b);
    }
  let m;
  if (typeof c.getPublicKey == "function")
    try {
      const b = c.getPublicKey();
      b !== null && (m = Ue(b));
    } catch (b) {
      Pr("getPublicKey()", b);
    }
  let S;
  if (typeof c.getAuthenticatorData == "function")
    try {
      S = Ue(c.getAuthenticatorData());
    } catch (b) {
      Pr("getAuthenticatorData()", b);
    }
  return {
    id: s,
    rawId: Ue(a),
    response: {
      attestationObject: Ue(c.attestationObject),
      clientDataJSON: Ue(c.clientDataJSON),
      transports: d,
      publicKeyAlgorithm: p,
      publicKey: m,
      authenticatorData: S
    },
    type: u,
    clientExtensionResults: i.getClientExtensionResults(),
    authenticatorAttachment: ni(i.authenticatorAttachment)
  };
}
function Pr(e, t) {
  console.warn(`The browser extension that intercepted this WebAuthn API call incorrectly implemented ${e}. You should report this error to them.
`, t);
}
function Is() {
  if (!Ut())
    return Nr.stubThis(new Promise((t) => t(!1)));
  const e = globalThis.PublicKeyCredential;
  return e?.isConditionalMediationAvailable === void 0 ? Nr.stubThis(new Promise((t) => t(!1))) : Nr.stubThis(e.isConditionalMediationAvailable());
}
const Nr = {
  stubThis: (e) => e
};
function $s({ error: e, options: t }) {
  const { publicKey: r } = t;
  if (!r)
    throw Error("options was missing required publicKey property");
  if (e.name === "AbortError") {
    if (t.signal instanceof AbortSignal)
      return new we({
        message: "Authentication ceremony was sent an abort signal",
        code: "ERROR_CEREMONY_ABORTED",
        cause: e
      });
  } else {
    if (e.name === "NotAllowedError")
      return new we({
        message: e.message,
        code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
        cause: e
      });
    if (e.name === "SecurityError") {
      const n = globalThis.location.hostname;
      if (ti(n)) {
        if (r.rpId !== n)
          return new we({
            message: `The RP ID "${r.rpId}" is invalid for this domain`,
            code: "ERROR_INVALID_RP_ID",
            cause: e
          });
      } else return new we({
        message: `${globalThis.location.hostname} is an invalid domain`,
        code: "ERROR_INVALID_DOMAIN",
        cause: e
      });
    } else if (e.name === "UnknownError")
      return new we({
        message: "The authenticator was unable to process the specified options, or could not create a new assertion signature",
        code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
        cause: e
      });
  }
  return e;
}
async function Ds(e) {
  !e.optionsJSON && e.challenge && (console.warn("startAuthentication() was not called correctly. It will try to continue with the provided options, but this call should be refactored to use the expected call structure instead. See https://simplewebauthn.dev/docs/packages/browser#typeerror-cannot-read-properties-of-undefined-reading-challenge for more information."), e = { optionsJSON: e });
  const { optionsJSON: t, useBrowserAutofill: r = !1, verifyBrowserAutofillInput: n = !0 } = e;
  if (!Ut())
    throw new Error("WebAuthn is not supported in this browser");
  let o;
  t.allowCredentials?.length !== 0 && (o = t.allowCredentials?.map(ei));
  const i = {
    ...t,
    challenge: ir(t.challenge),
    allowCredentials: o
  }, s = {};
  if (r) {
    if (!await Is())
      throw Error("Browser does not support WebAuthn autofill");
    if (document.querySelectorAll("input[autocomplete$='webauthn']").length < 1 && n)
      throw Error('No <input> with "webauthn" as the only or last value in its `autocomplete` attribute was detected');
    s.mediation = "conditional", i.allowCredentials = [];
  }
  s.publicKey = i, s.signal = ri.createNewAbortSignal();
  let a;
  try {
    a = await navigator.credentials.get(
      // TODO: Newer versions of Deno require this casting, revisit once we're using Deno 2.6+
      s
    );
  } catch (S) {
    throw $s({ error: S, options: s });
  }
  if (!a)
    throw new Error("Authentication was not completed");
  const { id: c, rawId: u, response: d, type: p } = a;
  let m;
  return d.userHandle && (m = Ue(d.userHandle)), {
    id: c,
    rawId: Ue(u),
    response: {
      authenticatorData: Ue(d.authenticatorData),
      clientDataJSON: Ue(d.clientDataJSON),
      signature: Ue(d.signature),
      userHandle: m
    },
    type: p,
    clientExtensionResults: a.getClientExtensionResults(),
    authenticatorAttachment: ni(a.authenticatorAttachment)
  };
}
const Ls = () => ({
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
}), Ms = (e) => ({
  ...Ls(),
  ...e
}), Fs = {
  pageBg: "#0e1d1a",
  surface: "#152824",
  border: "#28403a",
  heading: "#e9f1ef",
  text: "#c2d0cc",
  muted: "#8ea29d",
  heroBg: "#12231f"
}, ze = [
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
], Bs = "centra", Nt = (e) => ze.find((t) => t.id === e), Ir = "lumora_platform", tn = {
  /**
   * Get the stored platform
   * @returns The platform id or null when none was chosen
   */
  get: () => {
    try {
      const e = localStorage.getItem(Ir);
      return ze.some((t) => t.id === e) ? e : null;
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
      e ? localStorage.setItem(Ir, e) : localStorage.removeItem(Ir);
    } catch {
    }
  }
}, Qe = "@media (max-height: 920px)", Dt = {
  height: 50,
  [Qe]: { height: 46 }
}, Us = "0 1px 2px rgba(18, 51, 45, 0.06), 0 8px 24px rgba(18, 51, 45, 0.06)", js = (e, t, r) => {
  const n = t === "dark", o = r ? Nt(r) : null, i = o ? n ? o.colorOnDark : o.uiColor : e.primaryColor, s = o ? o.dark : Fs;
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
}, sr = (e) => ({
  "&.Mui-focusVisible": {
    outline: `2px solid ${e.accent}`,
    outlineOffset: 2
  }
}), Hs = (e) => `linear-gradient(${e} 1px, transparent 1px), linear-gradient(90deg, ${e} 1px, transparent 1px)`, bt = "cubic-bezier(0.2, 0.7, 0.2, 1)", dn = 350, Vs = "cubic-bezier(0.4, 0, 0.2, 1)", fr = (...e) => e.map((t) => `${t} ${dn}ms ${Vs}`).join(", "), fe = fr(
  "background-color",
  "border-color",
  "color",
  "box-shadow"
), oi = fr("fill", "stroke"), Ws = un`
	from {
		opacity: 0;
		transform: translateY(12px);
	}
	to {
		opacity: 1;
		transform: none;
	}
`, zs = un`
	from {
		opacity: 0;
		transform: translate(16px, 16px);
	}
	to {
		opacity: 1;
		transform: none;
	}
`, Dn = un`
	from {
		opacity: 0;
		transform: translateY(24px);
	}
	to {
		opacity: 1;
		transform: none;
	}
`, Ve = (e = 0, t = 500) => `${Ws} ${t}ms ${bt} ${e}ms both`, qs = {
  "@media (prefers-reduced-motion: reduce)": {
    "& *, & *::before, & *::after": {
      animationDuration: "1ms !important",
      animationDelay: "0ms !important",
      transitionDuration: "1ms !important"
    }
  }
}, $r = "lumora_color_mode", ii = "(prefers-color-scheme: dark)", Ks = () => typeof window > "u" || !window.matchMedia ? "light" : window.matchMedia(ii).matches ? "dark" : "light", Dr = {
  /**
   * Get the stored colour mode
   * @returns The user's choice, or null when they never toggled
   */
  get: () => {
    try {
      const e = localStorage.getItem($r);
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
      localStorage.setItem($r, e);
    } catch {
    }
  },
  /**
   * Forget the user's choice, so the page follows the system again
   */
  clear: () => {
    try {
      localStorage.removeItem($r);
    } catch {
    }
  }
}, Gs = (e, t) => {
  const [r, n] = Ie(
    () => Dr.get() !== null
  ), [o, i] = Ie(
    () => Dr.get() ?? e ?? Ks()
  ), s = !r && !e;
  return We(() => {
    if (!s || typeof window > "u" || !window.matchMedia)
      return;
    const c = window.matchMedia(ii), u = (d) => i(d.matches ? "dark" : "light");
    return c.addEventListener("change", u), () => c.removeEventListener("change", u);
  }, [s]), { colorMode: o, toggleColorMode: () => {
    const c = o === "dark" ? "light" : "dark";
    i(c), n(!0), Dr.set(c), t?.(c);
  } };
}, Ys = [
  "google-loading",
  "microsoft-loading",
  "passkey-loading",
  "magic-link-loading"
], Js = (e) => Ys.includes(e), je = {
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
  hasTokens: () => !!(je.getAccessToken() && je.getRefreshToken())
}, ye = {
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
}, Xs = {
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
function si(e, t) {
  return function() {
    return e.apply(t, arguments);
  };
}
const { toString: Zs } = Object.prototype, { getPrototypeOf: et } = Object, { iterator: jt, toStringTag: ai } = Symbol, Lt = (({ hasOwnProperty: e }) => (t, r) => e.call(t, r))(Object.prototype), ci = (e) => typeof e == "string" && (e === "__proto__" || e === "constructor" || e === "prototype"), li = (e, t, r) => e === Object.prototype || !r && t === null, Qs = (e) => {
  if (!Object.isExtensible(e))
    return !1;
  const t = Object.getOwnPropertyNames(e);
  return Object.getOwnPropertySymbols && t.push(...Object.getOwnPropertySymbols(e)), t.every((r) => {
    if (ci(r))
      return !1;
    const n = Object.getOwnPropertyDescriptor(e, r);
    return !!n && n.configurable && n.writable === !0;
  });
}, Mt = (e, t) => {
  let r = e;
  const n = [];
  for (; r != null; ) {
    if (n.indexOf(r) !== -1)
      return !1;
    n.push(r);
    const o = et(r);
    if (li(r, o, r === e))
      return !1;
    if (Lt(r, t))
      return !0;
    r = o;
  }
  return !1;
}, ea = (e, t) => e != null && Mt(e, t) ? e[t] : void 0, ta = (e) => {
  if (e == null || typeof e != "object" && typeof e != "function")
    return e;
  const t = et(e);
  if (t === null && Qs(e))
    return e;
  const r = /* @__PURE__ */ Object.create(null), n = /* @__PURE__ */ Object.create(null), o = [];
  let i = e;
  for (; i != null && o.indexOf(i) === -1; ) {
    o.push(i);
    const s = i === e ? t : et(i);
    if (li(i, s, i === e))
      break;
    const a = Object.getOwnPropertyNames(i);
    Object.getOwnPropertySymbols && a.push(...Object.getOwnPropertySymbols(i));
    for (const c of a)
      ci(c) || Lt(n, c) || (r[c] = e[c], n[c] = !0);
    i = s;
  }
  return r;
}, fn = /* @__PURE__ */ ((e) => (t) => {
  const r = Zs.call(t);
  return e[r] || (e[r] = r.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), $e = (e) => (e = e.toLowerCase(), (t) => fn(t) === e), pr = (e) => (t) => typeof t === e, { isArray: ct } = Array, lt = pr("undefined");
function Et(e) {
  return e !== null && !lt(e) && e.constructor !== null && !lt(e.constructor) && Oe(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}
const ui = $e("ArrayBuffer");
function ra(e) {
  let t;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? t = ArrayBuffer.isView(e) : t = e && e.buffer && ui(e.buffer), t;
}
const na = pr("string"), Oe = pr("function"), di = pr("number"), wt = (e) => e !== null && typeof e == "object", oa = (e) => e === !0 || e === !1, tr = (e) => {
  if (!wt(e))
    return !1;
  const t = et(e);
  return (t === null || t === Object.prototype || et(t) === null) && // Treat safe own/inherited Symbol.toStringTag or Symbol.iterator members as
  // evidence the value is tagged/iterable, while ignoring members reachable
  // only through shared or terminal prototype boundaries.
  !Mt(e, ai) && !Mt(e, jt);
}, ia = (e) => {
  if (!wt(e) || Et(e))
    return !1;
  try {
    return Object.keys(e).length === 0 && Object.getPrototypeOf(e) === Object.prototype;
  } catch {
    return !1;
  }
}, sa = $e("Date"), aa = $e("File"), ca = (e) => !!(e && typeof e.uri < "u"), la = (e) => e && typeof e.getParts < "u", ua = $e("Blob"), da = $e("FileList"), fa = $e("Set"), pa = (e) => wt(e) && Oe(e.pipe);
function ha() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
}
const Ln = ha(), Mn = typeof Ln.FormData < "u" ? Ln.FormData : void 0, ma = (e) => {
  if (!e) return !1;
  if (Mn && e instanceof Mn) return !0;
  const t = et(e);
  if (!t || t === Object.prototype || !Oe(e.append)) return !1;
  const r = fn(e);
  return r === "formdata" || // detect form-data instance
  r === "object" && Oe(e.toString) && e.toString() === "[object FormData]";
}, ga = $e("URLSearchParams"), [ya, ba, Sa, Ea] = [
  "ReadableStream",
  "Request",
  "Response",
  "Headers"
].map($e), wa = (e) => e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function Ht(e, t, { allOwnKeys: r = !1 } = {}) {
  if (e === null || typeof e > "u")
    return;
  let n, o;
  if (typeof e != "object" && (e = [e]), ct(e))
    for (n = 0, o = e.length; n < o; n++)
      t.call(null, e[n], n, e);
  else {
    if (Et(e))
      return;
    const i = r ? Object.getOwnPropertyNames(e) : Object.keys(e), s = i.length;
    let a;
    for (n = 0; n < s; n++)
      a = i[n], t.call(null, e[a], a, e);
  }
}
function fi(e, t) {
  if (Et(e))
    return null;
  t = t.toLowerCase();
  const r = Object.keys(e);
  let n = r.length, o;
  for (; n-- > 0; )
    if (o = r[n], t === o.toLowerCase())
      return o;
  return null;
}
const it = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, pi = (e) => !lt(e) && e !== it;
function rn(...e) {
  const { caseless: t, skipUndefined: r } = pi(this) && this || {}, n = {}, o = (i, s) => {
    if (s === "__proto__" || s === "constructor" || s === "prototype")
      return;
    const a = t && typeof s == "string" && fi(n, s) || s, c = Lt(n, a) ? n[a] : void 0;
    tr(c) && tr(i) ? n[a] = rn(c, i) : tr(i) ? n[a] = rn({}, i) : ct(i) ? n[a] = i.slice() : (!r || !lt(i)) && (n[a] = i);
  };
  for (let i = 0, s = e.length; i < s; i++) {
    const a = e[i];
    if (!a || Et(a) || (Ht(a, o), typeof a != "object" || ct(a)))
      continue;
    const c = Object.getOwnPropertySymbols(a);
    for (let u = 0; u < c.length; u++) {
      const d = c[u];
      Ia.call(a, d) && o(a[d], d);
    }
  }
  return n;
}
const Ta = (e, t, r, { allOwnKeys: n } = {}) => (Ht(
  t,
  (o, i) => {
    r && Oe(o) ? Object.defineProperty(e, i, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot
      // hijack defineProperty's accessor-vs-data resolution.
      __proto__: null,
      value: si(o, r),
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
), e), Ca = (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e), xa = (e, t, r, n) => {
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
}, Oa = (e, t, r, n) => {
  let o, i, s;
  const a = {};
  if (t = t || {}, e == null) return t;
  do {
    for (o = Object.getOwnPropertyNames(e), i = o.length; i-- > 0; )
      s = o[i], (!n || n(s, e, t)) && !a[s] && (t[s] = e[s], a[s] = !0);
    e = r !== !1 && et(e);
  } while (e && (!r || r(e, t)) && e !== Object.prototype);
  return t;
}, Ra = (e, t, r) => {
  e = String(e), (r === void 0 || r > e.length) && (r = e.length), r -= t.length;
  const n = e.indexOf(t, r);
  return n !== -1 && n === r;
}, _a = (e) => {
  if (!e) return null;
  if (ct(e)) return e;
  let t = e.length;
  if (!di(t)) return null;
  const r = new Array(t);
  for (; t-- > 0; )
    r[t] = e[t];
  return r;
}, Aa = /* @__PURE__ */ ((e) => (t) => e && t instanceof e)(typeof Uint8Array < "u" && et(Uint8Array)), va = (e, t) => {
  const n = (e && e[jt]).call(e);
  let o;
  for (; (o = n.next()) && !o.done; ) {
    const i = o.value;
    t.call(e, i[0], i[1]);
  }
}, ka = (e, t) => {
  let r;
  const n = [];
  for (; (r = e.exec(t)) !== null; )
    n.push(r);
  return n;
}, Pa = $e("HTMLFormElement"), Na = (e) => e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function(r, n, o) {
  return n.toUpperCase() + o;
}), { propertyIsEnumerable: Ia } = Object.prototype, $a = $e("RegExp"), hi = (e, t) => {
  const r = Object.getOwnPropertyDescriptors(e), n = {};
  Ht(r, (o, i) => {
    let s;
    (s = t(o, i, e)) !== !1 && (n[i] = s || o);
  }), Object.defineProperties(e, n);
}, Da = (e) => {
  hi(e, (t, r) => {
    if (Oe(e) && ["arguments", "caller", "callee"].includes(r))
      return !1;
    const n = e[r];
    if (Oe(n)) {
      if (t.enumerable = !1, "writable" in t) {
        t.writable = !1;
        return;
      }
      t.set || (t.set = () => {
        throw Error("Can not rewrite read-only method '" + r + "'");
      });
    }
  });
}, La = (e, t) => {
  const r = {}, n = (o) => {
    o.forEach((i) => {
      r[i] = !0;
    });
  };
  return ct(e) ? n(e) : n(String(e).split(t)), r;
}, Ma = () => {
}, Fa = (e, t) => e != null && Number.isFinite(e = +e) ? e : t;
function Ba(e) {
  return !!(e && Oe(e.append) && e[ai] === "FormData" && e[jt]);
}
const Ua = (e) => {
  const t = /* @__PURE__ */ new WeakSet(), r = (n) => {
    if (wt(n)) {
      if (t.has(n))
        return;
      if (Et(n))
        return n;
      if (!("toJSON" in n)) {
        t.add(n);
        let o;
        if (fa(n)) {
          o = [];
          for (const i of n) {
            const s = r(i);
            !lt(s) && o.push(s);
          }
        } else
          o = ct(n) ? [] : {}, Ht(n, (i, s) => {
            const a = r(i);
            !lt(a) && (o[s] = a);
          });
        return t.delete(n), o;
      }
    }
    return n;
  };
  return r(e);
}, ja = $e("AsyncFunction"), Ha = (e) => e && (wt(e) || Oe(e)) && Oe(e.then) && Oe(e.catch), mi = ((e, t) => e ? setImmediate : t ? ((r, n) => (it.addEventListener(
  "message",
  ({ source: o, data: i }) => {
    o === it && i === r && n.length && n.shift()();
  },
  !1
), (o) => {
  n.push(o), it.postMessage(r, "*");
}))(`axios@${Math.random()}`, []) : (r) => setTimeout(r))(typeof setImmediate == "function", Oe(it.postMessage)), Va = typeof queueMicrotask < "u" ? queueMicrotask.bind(it) : typeof process < "u" && process.nextTick || mi, gi = (e) => e != null && Oe(e[jt]), Wa = (e) => e != null && Mt(e, jt) && gi(e), f = {
  isArray: ct,
  isArrayBuffer: ui,
  isBuffer: Et,
  isFormData: ma,
  isArrayBufferView: ra,
  isString: na,
  isNumber: di,
  isBoolean: oa,
  isObject: wt,
  isPlainObject: tr,
  isEmptyObject: ia,
  isReadableStream: ya,
  isRequest: ba,
  isResponse: Sa,
  isHeaders: Ea,
  isUndefined: lt,
  isDate: sa,
  isFile: aa,
  isReactNativeBlob: ca,
  isReactNative: la,
  isBlob: ua,
  isRegExp: $a,
  isFunction: Oe,
  isStream: pa,
  isURLSearchParams: ga,
  isTypedArray: Aa,
  isFileList: da,
  forEach: Ht,
  merge: rn,
  extend: Ta,
  trim: wa,
  stripBOM: Ca,
  inherits: xa,
  toFlatObject: Oa,
  kindOf: fn,
  kindOfTest: $e,
  endsWith: Ra,
  toArray: _a,
  forEachEntry: va,
  matchAll: ka,
  isHTMLForm: Pa,
  hasOwnProperty: Lt,
  hasOwnProp: Lt,
  // an alias to avoid ESLint no-prototype-builtins detection
  hasOwnInPrototypeChain: Mt,
  getSafeProp: ea,
  toSafeFlatObject: ta,
  reduceDescriptors: hi,
  freezeMethods: Da,
  toObjectSet: La,
  toCamelCase: Na,
  noop: Ma,
  toFiniteNumber: Fa,
  findKey: fi,
  global: it,
  isContextDefined: pi,
  isSpecCompliantForm: Ba,
  toJSONObject: Ua,
  isAsyncFn: ja,
  isThenable: Ha,
  setImmediate: mi,
  asap: Va,
  isIterable: gi,
  isSafeIterable: Wa
}, za = f.toObjectSet([
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
]), qa = (e) => {
  const t = {};
  let r, n, o;
  return e && e.split(`
`).forEach(function(s) {
    o = s.indexOf(":"), r = s.substring(0, o).trim().toLowerCase(), n = s.substring(o + 1).trim();
    const a = f.hasOwnProp(t, r);
    !r || a && f.hasOwnProp(za, r) || (r === "set-cookie" ? a ? t[r].push(n) : t[r] = [n] : t[r] = a ? t[r] + ", " + n : n);
  }), t;
};
function Ka(e) {
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
const Ga = new RegExp("[\\u0000-\\u0008\\u000a-\\u001f\\u007f]+", "g"), Ya = new RegExp("[^\\u0009\\u0020-\\u007e\\u0080-\\u00ff]+", "g");
function pn(e, t) {
  return f.isArray(e) ? e.map((r) => pn(r, t)) : Ka(String(e).replace(t, ""));
}
const Ja = (e) => pn(e, Ga), Xa = (e) => pn(e, Ya);
function yi(e) {
  const t = /* @__PURE__ */ Object.create(null);
  return f.forEach(e.toJSON(), (r, n) => {
    t[n] = Xa(r);
  }), t;
}
const Fn = /* @__PURE__ */ Symbol("internals");
function Ct(e) {
  return e && String(e).trim().toLowerCase();
}
function rr(e) {
  return e === !1 || e == null ? e : f.isArray(e) ? e.map(rr) : Ja(String(e));
}
function Za(e) {
  const t = /* @__PURE__ */ Object.create(null), r = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let n;
  for (; n = r.exec(e); )
    t[n[1]] = n[2];
  return t;
}
const Qa = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
function Lr(e) {
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
function ec(e) {
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
function tc(e) {
  const t = /* @__PURE__ */ Object.create(null), r = String(e);
  let n = 0, o = !1, i = !1;
  function s(a) {
    const c = Lr(r.slice(n, a)), u = c.indexOf("=");
    if (u < 1)
      return;
    const d = Lr(c.slice(0, u));
    if (!Qa.test(d))
      return;
    const p = d.toLowerCase();
    if (p === "__proto__" || p === "constructor" || p === "prototype")
      return;
    const m = Lr(c.slice(u + 1));
    t[p] = ec(m);
  }
  for (let a = 0; a < r.length; a++) {
    const c = r.charCodeAt(a);
    o ? i ? i = !1 : c === 92 ? i = !0 : c === 34 && (o = !1) : c === 34 ? o = !0 : (c === 44 || c === 59) && (s(a), n = a + 1);
  }
  return s(r.length), t;
}
const rc = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
function Mr(e, t, r, n, o) {
  if (f.isFunction(n))
    return n.call(this, t, r);
  if (o && (t = r), !!f.isString(t)) {
    if (f.isString(n))
      return t.indexOf(n) !== -1;
    if (f.isRegExp(n))
      return n.test(t);
  }
}
function nc(e) {
  return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (t, r, n) => r.toUpperCase() + n);
}
function oc(e, t) {
  const r = f.toCamelCase(" " + t);
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
      const d = Ct(c);
      if (!d)
        return;
      const p = f.findKey(o, d);
      (!p || o[p] === void 0 || u === !0 || u === void 0 && o[p] !== !1) && (o[p || c] = rr(a));
    }
    const s = (a, c) => f.forEach(a, (u, d) => i(u, d, c));
    if (f.isPlainObject(t) || t instanceof this.constructor)
      s(t, r);
    else if (f.isString(t) && (t = t.trim()) && !rc(t))
      s(qa(t), r);
    else if (f.isObject(t) && f.isSafeIterable(t)) {
      let a = /* @__PURE__ */ Object.create(null), c, u;
      for (const d of t) {
        if (!f.isArray(d))
          throw new TypeError("Object iterator must return a key-value pair");
        u = d[0], f.hasOwnProp(a, u) ? (c = a[u], a[u] = f.isArray(c) ? [...c, d[1]] : [c, d[1]]) : a[u] = d[1];
      }
      s(a, r);
    } else
      t != null && i(r, t, n);
    return this;
  }
  get(t, r) {
    if (t = Ct(t), t) {
      const n = f.findKey(this, t);
      if (n) {
        const o = this[n];
        if (!r)
          return o;
        if (r === !0)
          return Za(o);
        if (f.isFunction(r))
          return r.call(this, o, n);
        if (f.isRegExp(r))
          return r.exec(o);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(t, r) {
    if (t = Ct(t), t) {
      const n = f.findKey(this, t);
      return !!(n && this[n] !== void 0 && (!r || Mr(this, this[n], n, r)));
    }
    return !1;
  }
  delete(t, r) {
    const n = this;
    let o = !1;
    function i(s) {
      if (s = Ct(s), s) {
        const a = f.findKey(n, s);
        a && (!r || Mr(n, n[a], a, r)) && (delete n[a], o = !0);
      }
    }
    return f.isArray(t) ? t.forEach(i) : i(t), o;
  }
  clear(t) {
    const r = Object.keys(this);
    let n = r.length, o = !1;
    for (; n--; ) {
      const i = r[n];
      (!t || Mr(this, this[i], i, t, !0)) && (delete this[i], o = !0);
    }
    return o;
  }
  normalize(t) {
    const r = this, n = {};
    return f.forEach(this, (o, i) => {
      const s = f.findKey(n, i);
      if (s) {
        r[s] = rr(o), delete r[i];
        return;
      }
      const a = t ? nc(i) : String(i).trim();
      a !== i && delete r[i], r[a] = rr(o), n[a] = !0;
    }), this;
  }
  concat(...t) {
    return this.constructor.concat(this, ...t);
  }
  toJSON(t) {
    const r = /* @__PURE__ */ Object.create(null);
    return f.forEach(this, (n, o) => {
      n != null && n !== !1 && (r[o] = t && f.isArray(n) ? n.join(", ") : n);
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
    return f.isArray(t) ? t : t == null || t === !1 ? [] : [t];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(t) {
    return t instanceof this ? t : new this(t);
  }
  static parseParameters(t) {
    return tc(t);
  }
  static concat(t, ...r) {
    const n = new this(t);
    return r.forEach((o) => n.set(o)), n;
  }
  static accessor(t) {
    const n = (this[Fn] = this[Fn] = {
      accessors: {}
    }).accessors, o = this.prototype;
    function i(s) {
      const a = Ct(s);
      n[a] || (oc(o, s), n[a] = !0);
    }
    return f.isArray(t) ? t.forEach(i) : i(t), this;
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
f.reduceDescriptors(Ce.prototype, ({ value: e }, t) => {
  let r = t[0].toUpperCase() + t.slice(1);
  return {
    get: () => e,
    set(n) {
      this[r] = n;
    }
  };
});
f.freezeMethods(Ce);
const ar = "[REDACTED ****]";
function ic(e) {
  if (f.hasOwnProp(e, "toJSON"))
    return !0;
  let t = Object.getPrototypeOf(e);
  for (; t && t !== Object.prototype; ) {
    if (f.hasOwnProp(t, "toJSON"))
      return !0;
    t = Object.getPrototypeOf(t);
  }
  return !1;
}
function sc(e, t) {
  const r = new Set(t.map((i) => String(i).toLowerCase())), n = [], o = (i) => {
    if (i === null || typeof i != "object" || f.isBuffer(i)) return i;
    if (n.indexOf(i) !== -1) return;
    i instanceof Ce && (i = i.toJSON()), n.push(i);
    let s;
    if (f.isArray(i))
      s = [], i.forEach((a, c) => {
        const u = o(a);
        f.isUndefined(u) || (s[c] = u);
      });
    else {
      if (!f.isPlainObject(i) && ic(i))
        return n.pop(), i;
      s = /* @__PURE__ */ Object.create(null);
      for (const [a, c] of Object.entries(i)) {
        const u = r.has(a.toLowerCase()) ? ar : o(c);
        f.isUndefined(u) || (s[a] = u);
      }
    }
    return n.pop(), s;
  };
  return o(e);
}
function Bn(e) {
  try {
    return String(e);
  } catch {
    return "";
  }
}
function ac(e) {
  return e.errors.map((r) => {
    try {
      return r && r.message ? Bn(r.message) : Bn(r);
    } catch {
      return "";
    }
  }).filter(Boolean).join("; ") || e.name || "AggregateError";
}
let N = class bi extends Error {
  static from(t, r, n, o, i, s) {
    let a = t.message;
    !a && f.isArray(t.errors) && t.errors.length && (a = ac(t));
    const c = new bi(a, r || t.code, n, o, i);
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
    const t = this.config, r = t && f.hasOwnProp(t, "redact") ? t.redact : void 0, n = f.isArray(r) && r.length > 0 ? sc(t, r) : f.toJSONObject(t);
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
N.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE";
N.ERR_BAD_OPTION = "ERR_BAD_OPTION";
N.ECONNABORTED = "ECONNABORTED";
N.ETIMEDOUT = "ETIMEDOUT";
N.ECONNREFUSED = "ECONNREFUSED";
N.ERR_NETWORK = "ERR_NETWORK";
N.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS";
N.ERR_DEPRECATED = "ERR_DEPRECATED";
N.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE";
N.ERR_BAD_REQUEST = "ERR_BAD_REQUEST";
N.ERR_CANCELED = "ERR_CANCELED";
N.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT";
N.ERR_INVALID_URL = "ERR_INVALID_URL";
N.ERR_FORM_DATA_DEPTH_EXCEEDED = "ERR_FORM_DATA_DEPTH_EXCEEDED";
const cc = null, Si = 100;
function nn(e) {
  return f.isPlainObject(e) || f.isArray(e);
}
function Ei(e) {
  return f.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function Fr(e, t, r) {
  return e ? e.concat(t).map(function(o, i) {
    return o = Ei(o), !r && i ? "[" + o + "]" : o;
  }).join(r ? "." : "") : t;
}
function lc(e) {
  return f.isArray(e) && !e.some(nn);
}
const uc = f.toFlatObject(f, {}, null, function(t) {
  return /^is[A-Z]/.test(t);
});
function hr(e, t, r) {
  if (!f.isObject(e))
    throw new TypeError("target must be an object");
  t = t || new FormData();
  const n = (x, _) => {
    const T = f.getSafeProp(r, x);
    return f.isUndefined(T) ? _ : T;
  }, o = n("metaTokens", !0), i = n("visitor") || h, s = n("dots", !1), a = n("indexes", !1), c = n("Blob") || typeof Blob < "u" && Blob, u = n("maxDepth", Si), d = c && f.isSpecCompliantForm(t), p = [];
  if (!f.isFunction(i))
    throw new TypeError("visitor must be a function");
  function m(x) {
    if (x === null) return "";
    if (f.isDate(x))
      return x.toISOString();
    if (f.isBoolean(x))
      return x.toString();
    if (!d && f.isBlob(x))
      throw new N("Blob is not supported. Use a Buffer instead.");
    if (f.isArrayBuffer(x) || f.isTypedArray(x)) {
      if (d && typeof c == "function")
        return new c([x]);
      throw new N(
        "Blob is not supported. Use a Buffer instead.",
        N.ERR_NOT_SUPPORT
      );
    }
    return x;
  }
  function S(x) {
    if (x > u)
      throw new N(
        "Object is too deeply nested (" + x + " levels). Max depth: " + u,
        N.ERR_FORM_DATA_DEPTH_EXCEEDED
      );
  }
  function b(x, _) {
    if (u === 1 / 0)
      return JSON.stringify(x);
    const T = [];
    return JSON.stringify(x, function(I, Y) {
      if (!f.isObject(Y))
        return Y;
      for (; T.length && T[T.length - 1] !== this; )
        T.pop();
      return T.push(Y), S(_ + T.length - 1), Y;
    });
  }
  function h(x, _, T) {
    let C = x;
    if (f.isReactNative(t) && f.isReactNativeBlob(x))
      return t.append(Fr(T, _, s), m(x)), !1;
    if (x && !T && typeof x == "object") {
      if (f.endsWith(_, "{}"))
        _ = o ? _ : _.slice(0, -2), x = b(x, 1);
      else if (f.isArray(x) && lc(x) || (f.isFileList(x) || f.endsWith(_, "[]")) && (C = f.toArray(x)))
        return _ = Ei(_), C.forEach(function(Y, H) {
          !(f.isUndefined(Y) || Y === null) && t.append(
            // eslint-disable-next-line no-nested-ternary
            a === !0 ? Fr([_], H, s) : a === null ? _ : _ + "[]",
            m(Y)
          );
        }), !1;
    }
    return nn(x) ? !0 : (t.append(Fr(T, _, s), m(x)), !1);
  }
  const w = Object.assign(uc, {
    defaultVisitor: h,
    convertValue: m,
    isVisitable: nn
  });
  function g(x, _, T = 0) {
    if (!f.isUndefined(x)) {
      if (S(T), p.indexOf(x) !== -1)
        throw new Error("Circular reference detected in " + _.join("."));
      p.push(x), f.forEach(x, function(I, Y) {
        (!(f.isUndefined(I) || I === null) && i.call(t, I, f.isString(Y) ? Y.trim() : Y, _, w)) === !0 && g(I, _ ? _.concat(Y) : [Y], T + 1);
      }), p.pop();
    }
  }
  if (!f.isObject(e))
    throw new TypeError("data must be an object");
  return g(e), t;
}
function Un(e) {
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
function hn(e, t) {
  this._pairs = [], e && hr(e, this, t);
}
const wi = hn.prototype;
wi.append = function(t, r) {
  this._pairs.push([t, r]);
};
wi.toString = function(t) {
  const r = t ? (n) => t.call(this, n, Un) : Un;
  return this._pairs.map(function(o) {
    return r(o[0]) + "=" + r(o[1]);
  }, "").join("&");
};
function dc(e) {
  return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function Ti(e, t, r) {
  if (!t)
    return e;
  e = e || "";
  const n = f.isFunction(r) ? {
    serialize: r
  } : r, o = f.getSafeProp(n, "encode") || dc, i = f.getSafeProp(n, "serialize");
  let s;
  if (i ? s = i(t, n) : s = f.isURLSearchParams(t) ? t.toString() : new hn(t, n).toString(o), s) {
    const a = e.indexOf("#");
    a !== -1 && (e = e.slice(0, a)), e += (e.indexOf("?") === -1 ? "?" : "&") + s;
  }
  return e;
}
const xt = /* @__PURE__ */ Symbol("internals");
function Ci(e) {
  return e ? e.length : 0;
}
function jn(e) {
  if (e)
    for (; e.length && e[e.length - 1] === null; )
      e.pop();
}
function Ot(e, t) {
  const r = e.handlers, n = Ci(r);
  r !== t.handlersRef ? (t.handlersRef = r, t.handlerEntries.clear()) : n !== t.handlersLength && (n ? t.handlerEntries.forEach(function(i, s) {
    r[i.index] !== i.handler && t.handlerEntries.delete(s);
  }) : t.handlerEntries.clear()), t.handlersLength = n;
}
class Hn {
  constructor() {
    this.handlers = [], this[xt] = {
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
    }, i = this[xt];
    this.handlers == null && (this.handlers = []), Ot(this, i);
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
    const r = this[xt];
    Ot(this, r);
    const n = r.handlerEntries.get(t);
    if (n) {
      if (r.handlerEntries.delete(t), this.handlers[n.index] !== n.handler)
        return;
      this.handlers[n.index] = null, r.iterationDepth || (jn(this.handlers), r.handlersLength = this.handlers.length);
    }
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    this.handlers && (this.handlers = [], Ot(this, this[xt]));
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
    const r = this[xt];
    Ot(this, r), r.iterationDepth++;
    try {
      f.forEach(this.handlers, function(o) {
        o !== null && t(o);
      });
    } finally {
      --r.iterationDepth || (Ot(this, r), jn(this.handlers), r.handlersLength = Ci(this.handlers));
    }
  }
}
const mn = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1,
  legacyInterceptorReqResOrdering: !0,
  advertiseZstdAcceptEncoding: !1,
  validateStatusUndefinedResolves: !0
}, fc = typeof URLSearchParams < "u" ? URLSearchParams : hn, pc = typeof FormData < "u" ? FormData : null, hc = typeof Blob < "u" ? Blob : null, mc = {
  isBrowser: !0,
  classes: {
    URLSearchParams: fc,
    FormData: pc,
    Blob: hc
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
}, gn = typeof window < "u" && typeof document < "u", on = typeof navigator == "object" && navigator || void 0, gc = gn && (!on || ["ReactNative", "NativeScript", "NS"].indexOf(on.product) < 0), yc = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", bc = gn && window.location.href || "http://localhost", Sc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: gn,
  hasStandardBrowserEnv: gc,
  hasStandardBrowserWebWorkerEnv: yc,
  navigator: on,
  origin: bc
}, Symbol.toStringTag, { value: "Module" })), Se = {
  ...Sc,
  ...mc
};
function Ec(e, t) {
  return hr(e, new Se.classes.URLSearchParams(), {
    visitor: function(r, n, o, i) {
      return Se.isNode && f.isBuffer(r) ? (this.append(n, r.toString("base64")), !1) : i.defaultVisitor.apply(this, arguments);
    },
    ...t
  });
}
const Vn = Si;
function xi(e) {
  if (e > Vn)
    throw new N(
      "FormData field is too deeply nested (" + e + " levels). Max depth: " + Vn,
      N.ERR_FORM_DATA_DEPTH_EXCEEDED
    );
}
function wc(e) {
  const t = [], r = /[^.[\]]+|\[([^.[\]]*)]/g;
  let n;
  for (; (n = r.exec(e)) !== null; )
    xi(t.length), t.push(n[0] === "[]" ? "" : n[1] || n[0]);
  return t;
}
function Tc(e) {
  const t = {}, r = Object.keys(e);
  let n;
  const o = r.length;
  let i;
  for (n = 0; n < o; n++)
    i = r[n], t[i] = e[i];
  return t;
}
function Oi(e) {
  function t(r, n, o, i) {
    xi(i);
    let s = r[i++];
    if (s === "__proto__") return !0;
    const a = Number.isFinite(+s), c = i >= r.length;
    return s = !s && f.isArray(o) ? o.length : s, c ? (f.hasOwnProp(o, s) ? o[s] = f.isArray(o[s]) ? o[s].concat(n) : [o[s], n] : o[s] = n, !a) : ((!f.hasOwnProp(o, s) || !f.isObject(o[s])) && (o[s] = []), t(r, n, o[s], i) && f.isArray(o[s]) && (o[s] = Tc(o[s])), !a);
  }
  if (f.isFormData(e) && f.isFunction(e.entries)) {
    const r = {};
    return f.forEachEntry(e, (n, o) => {
      t(wc(n), o, r, 0);
    }), r;
  }
  return null;
}
const Ri = Object.freeze([
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
]), dt = (e, t) => e != null && f.hasOwnProp(e, t) ? e[t] : void 0;
function Cc(e, t, r) {
  if (f.isString(e))
    try {
      return (t || JSON.parse)(e), f.trim(e);
    } catch (n) {
      if (n.name !== "SyntaxError")
        throw n;
    }
  return (r || JSON.stringify)(e);
}
const Vt = {
  transitional: mn,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [
    function(t, r) {
      const n = r.getContentType() || "", o = n.indexOf("application/json") > -1, i = f.isObject(t);
      if (i && f.isHTMLForm(t) && (t = new FormData(t)), f.isFormData(t))
        return o ? JSON.stringify(Oi(t)) : t;
      if (f.isArrayBuffer(t) || f.isBuffer(t) || f.isStream(t) || f.isFile(t) || f.isBlob(t) || f.isReadableStream(t))
        return t;
      if (f.isArrayBufferView(t))
        return t.buffer;
      if (f.isURLSearchParams(t))
        return r.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), t.toString();
      let a;
      if (i) {
        const c = dt(this, "formSerializer");
        if (n.indexOf("application/x-www-form-urlencoded") > -1)
          return Ec(t, c).toString();
        if ((a = f.isFileList(t)) || n.indexOf("multipart/form-data") > -1) {
          const u = dt(this, "env"), d = u && u.FormData;
          return hr(
            a ? { "files[]": t } : t,
            d && new d(),
            c
          );
        }
      }
      return i || o ? (r.setContentType("application/json", !1), Cc(t)) : t;
    }
  ],
  transformResponse: [
    function(t) {
      const r = dt(this, "transitional") || Vt.transitional, n = r && r.forcedJSONParsing, o = dt(this, "responseType"), i = o === "json";
      if (f.isResponse(t) || f.isReadableStream(t))
        return t;
      if (t && f.isString(t) && (n && !o || i)) {
        const a = !(r && r.silentJSONParsing) && i;
        try {
          return JSON.parse(t, dt(this, "parseReviver"));
        } catch (c) {
          if (a)
            throw c.name === "SyntaxError" ? N.from(c, N.ERR_BAD_RESPONSE, this, null, dt(this, "response")) : c;
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
    FormData: Se.classes.FormData,
    Blob: Se.classes.Blob
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
f.forEach(Ri, (e) => {
  Vt.headers[e] = {};
});
function Br(e, t) {
  const r = this || Vt, n = t || r, o = Ce.from(n.headers);
  let i = n.data;
  return f.forEach(e, function(a) {
    i = a.call(r, i, o.normalize(), t ? t.status : void 0);
  }), o.normalize(), i;
}
function _i(e) {
  return !!(e && e.__CANCEL__);
}
let Wt = class extends N {
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
    super(t ?? "canceled", N.ERR_CANCELED, r, n), this.name = "CanceledError", this.__CANCEL__ = !0;
  }
};
function Ai(e, t, r) {
  const n = r.config.validateStatus;
  !r.status || !n || n(r.status) ? e(r) : t(new N(
    "Request failed with status code " + r.status,
    r.status >= 400 && r.status < 500 ? N.ERR_BAD_REQUEST : N.ERR_BAD_RESPONSE,
    r.config,
    r.request,
    r
  ));
}
const xc = /[\t\n\r]/g;
function vi(e) {
  if (typeof e != "string")
    return e;
  let t = 0;
  for (; t < e.length && e.charCodeAt(t) <= 32; )
    t++;
  return e.slice(t).replace(xc, "");
}
function Ur(e) {
  const t = /^([-+\w]{1,25}):(?:\/\/)?/.exec(e);
  return t && t[1] || "";
}
function Oc(e, t) {
  e = e || 10;
  const r = new Array(e), n = new Array(e);
  let o = 0, i = 0, s;
  return t = t !== void 0 ? t : 1e3, function(c) {
    const u = Date.now(), d = n[i];
    s || (s = u), r[o] = c, n[o] = u;
    let p = i, m = 0;
    for (; p !== o; )
      m += r[p++], p = p % e;
    if (o = (o + 1) % e, o === i && (i = (i + 1) % e), u - s < t)
      return;
    const S = d && u - d;
    return S ? Math.round(m * 1e3 / S) : void 0;
  };
}
function Rc(e, t) {
  let r = 0, n = 1e3 / t, o, i;
  const s = (d, p = Date.now()) => {
    r = p, o = null, i && (clearTimeout(i), i = null), e(...d);
  };
  return [(...d) => {
    const p = Date.now(), m = p - r;
    m >= n ? s(d, p) : (o = d, i || (i = setTimeout(() => {
      i = null, s(o);
    }, n - m)));
  }, () => o && s(o), (...d) => s(d)];
}
const cr = (e, t, r = 3) => {
  let n = 0;
  const o = Oc(50, 250);
  return Rc((i) => {
    if (!i || !f.isNumber(i.loaded))
      return;
    const s = i.loaded, a = i.lengthComputable ? i.total : void 0, c = Math.max(0, a != null ? Math.min(s, a) : s), u = Math.max(0, c - n), d = o(u);
    n = Math.max(n, c);
    const p = {
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
    e(p);
  }, r);
}, Wn = (e, t) => {
  const r = e != null;
  return [
    (n) => t[0]({
      lengthComputable: r,
      total: e,
      loaded: n
    }),
    t[1]
  ];
}, zn = (e, t = f.asap) => (...r) => t(() => e(...r)), _c = Se.hasStandardBrowserEnv ? /* @__PURE__ */ ((e, t) => (r) => (r = new URL(r, Se.origin), e.protocol === r.protocol && e.host === r.host && (t || e.port === r.port)))(
  new URL(Se.origin),
  Se.navigator && /(msie|trident)/i.test(Se.navigator.userAgent)
) : () => !0, Ac = Se.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(e, t, r, n, o, i, s) {
      if (typeof document > "u") return;
      const a = [`${e}=${encodeURIComponent(t)}`];
      f.isNumber(r) && a.push(`expires=${new Date(r).toUTCString()}`), f.isString(n) && a.push(`path=${n}`), f.isString(o) && a.push(`domain=${o}`), i === !0 && a.push("secure"), f.isString(s) && a.push(`SameSite=${s}`), document.cookie = a.join("; ");
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
function vc(e) {
  return typeof e != "string" ? !1 : /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
function kc(e, t) {
  if (!t)
    return e;
  let r = e.length;
  for (; r > 0 && e.charCodeAt(r - 1) === 47; )
    r--;
  return e.slice(0, r) + "/" + t.replace(/^\/+/, "");
}
const Pc = /^https?:(?!\/\/)/i;
function Nc(e) {
  return e && e.replace(/(^|&)([^=&]*=)?[^&]+/g, (t, r, n = "") => `${r}${n}${ar}`);
}
function Ic(e) {
  const t = e.replace(/^(https?:\/{0,2})[^/?#]*@/i, `$1${ar}@`), r = t.indexOf("#"), o = (r === -1 ? t : t.slice(0, r)).replace(
    /([?&][^=&#]*=)[^&#]*/g,
    `$1${ar}`
  );
  return r === -1 ? o : `${o}#${Nc(t.slice(r + 1))}`;
}
function qn(e, t) {
  if (typeof e == "string") {
    const r = vi(e);
    if (Pc.test(r))
      throw new N(
        `Invalid URL ${JSON.stringify(Ic(r))}: missing "//" after protocol`,
        N.ERR_INVALID_URL,
        t
      );
  }
}
function ki(e, t, r, n) {
  qn(t, n);
  let o = !vc(t);
  return e && (o || r === !1) ? (qn(e, n), kc(e, t)) : t;
}
const Kn = (e) => e instanceof Ce ? { ...e } : e, $c = (e) => Object.getOwnPropertySymbols && Object.getOwnPropertyDescriptor ? Object.keys(e).concat(
  Object.getOwnPropertySymbols(e).filter(
    (t) => Object.getOwnPropertyDescriptor(e, t).enumerable
  )
) : Object.keys(e);
function ut(e, t) {
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
  function n(d, p, m, S) {
    return f.isPlainObject(d) && f.isPlainObject(p) ? f.merge.call({ caseless: S }, d, p) : f.isPlainObject(p) ? f.merge({}, p) : f.isArray(p) ? p.slice() : p;
  }
  function o(d, p, m, S) {
    if (f.isUndefined(p)) {
      if (!f.isUndefined(d))
        return n(void 0, d, m, S);
    } else return n(d, p, m, S);
  }
  function i(d, p) {
    if (!f.isUndefined(p))
      return n(void 0, p);
  }
  function s(d, p) {
    if (f.isUndefined(p)) {
      if (!f.isUndefined(d))
        return n(void 0, d);
    } else return n(void 0, p);
  }
  function a(d) {
    const p = f.hasOwnProp(t, "transitional") ? t.transitional : void 0;
    if (!f.isUndefined(p))
      if (f.isPlainObject(p)) {
        if (f.hasOwnProp(p, d))
          return p[d];
      } else
        return;
    const m = f.hasOwnProp(e, "transitional") ? e.transitional : void 0;
    if (f.isPlainObject(m) && f.hasOwnProp(m, d))
      return m[d];
  }
  function c(d, p, m) {
    if (f.hasOwnProp(t, m))
      return n(d, p);
    if (f.hasOwnProp(e, m))
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
    headers: (d, p, m) => o(Kn(d), Kn(p), m, !0)
  };
  return f.forEach($c({ ...e, ...t }), function(p) {
    if (p === "__proto__" || p === "constructor" || p === "prototype") return;
    const m = f.hasOwnProp(u, p) ? u[p] : o, S = f.hasOwnProp(e, p) ? e[p] : void 0, b = f.hasOwnProp(t, p) ? t[p] : void 0, h = m(S, b, p);
    f.isUndefined(h) && m !== c || (r[p] = h);
  }), f.hasOwnProp(t, "validateStatus") && f.isUndefined(t.validateStatus) && a("validateStatusUndefinedResolves") === !1 && (f.hasOwnProp(e, "validateStatus") ? r.validateStatus = n(void 0, e.validateStatus) : delete r.validateStatus), r;
}
const Dc = ["content-type", "content-length"];
function Lc(e, t, r) {
  if (r !== "content-only") {
    e.set(t);
    return;
  }
  Object.entries(t || {}).forEach(([n, o]) => {
    Dc.includes(n.toLowerCase()) && e.set(n, o);
  });
}
const Mc = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, r) => String.fromCharCode(parseInt(r, 16))
);
function Pi(e) {
  const t = ut({}, e), r = (m) => f.hasOwnProp(t, m) ? t[m] : void 0, n = r("data");
  let o = r("withXSRFToken");
  const i = r("xsrfHeaderName"), s = r("xsrfCookieName");
  let a = r("headers");
  const c = r("auth"), u = r("baseURL"), d = r("allowAbsoluteUrls"), p = r("url");
  if (t.headers = a = Ce.from(a), t.url = Ti(
    ki(u, p, d, t),
    r("params"),
    r("paramsSerializer")
  ), c) {
    const m = f.getSafeProp(c, "username") || "", S = f.getSafeProp(c, "password") || "";
    try {
      a.set(
        "Authorization",
        "Basic " + btoa(m + ":" + (S ? Mc(S) : ""))
      );
    } catch (b) {
      throw N.from(b, N.ERR_BAD_OPTION_VALUE, e);
    }
  }
  if (f.isFormData(n)) {
    const m = f.getSafeProp(n, "getHeaders");
    Se.hasStandardBrowserEnv || Se.hasStandardBrowserWebWorkerEnv || f.isReactNative(n) ? a.setContentType(void 0) : f.isFunction(m) && Lc(a, m.call(n), r("formDataHeaderPolicy"));
  }
  if (Se.hasStandardBrowserEnv && (f.isFunction(o) && (o = o(t)), o === !0 || o == null && _c(t.url))) {
    const S = i && s && Ac.read(s);
    S && a.set(i, S);
  }
  return t;
}
const Fc = typeof XMLHttpRequest < "u", Bc = Fc && function(e) {
  return new Promise(function(r, n) {
    const o = Pi(e);
    let i = o.data;
    const s = Ce.from(o.headers).normalize();
    let { responseType: a, onUploadProgress: c, onDownloadProgress: u } = o, d, p, m, S, b, h;
    function w() {
      S && S(), b && b(), o.cancelToken && o.cancelToken.unsubscribe(d), o.signal && o.signal.removeEventListener("abort", d);
    }
    let g = new XMLHttpRequest();
    g.open(o.method.toUpperCase(), o.url, !0), g.timeout = o.timeout;
    function x(T) {
      if (!g)
        return;
      if (g.status === 0 && (Ur(vi(o.url)) || Ur(Se.origin)) !== "file" && !(g.responseURL && g.responseURL.startsWith("file:"))) {
        n(new N("Request aborted", N.ECONNABORTED, e, g)), w(), g = null;
        return;
      }
      try {
        T ? h && h(T) : b && b();
      } catch (H) {
        setTimeout(() => {
          throw H;
        });
      }
      if (!g)
        return;
      const C = Ce.from(
        "getAllResponseHeaders" in g && g.getAllResponseHeaders()
      ), Y = {
        data: !a || a === "text" || a === "json" ? g.responseText : g.response,
        status: g.status,
        statusText: g.statusText,
        headers: C,
        config: e,
        request: g
      };
      Ai(
        function(F) {
          r(F), w();
        },
        function(F) {
          n(F), w();
        },
        Y
      ), g = null;
    }
    "onloadend" in g ? g.onloadend = x : g.onreadystatechange = function() {
      !g || g.readyState !== 4 || g.status === 0 && !(g.responseURL && g.responseURL.startsWith("file:")) || setTimeout(x);
    }, g.onabort = function() {
      g && (n(new N("Request aborted", N.ECONNABORTED, e, g)), w(), g = null);
    }, g.onerror = function(C) {
      const I = C && C.message ? C.message : "Network Error", Y = new N(I, N.ERR_NETWORK, e, g);
      Y.event = C || null, n(Y), w(), g = null;
    }, g.ontimeout = function() {
      let C = o.timeout ? "timeout of " + o.timeout + "ms exceeded" : "timeout exceeded";
      const I = o.transitional || mn;
      o.timeoutErrorMessage && (C = o.timeoutErrorMessage), n(
        new N(
          C,
          I.clarifyTimeoutError ? N.ETIMEDOUT : N.ECONNABORTED,
          e,
          g
        )
      ), w(), g = null;
    }, i === void 0 && s.setContentType(null), "setRequestHeader" in g && f.forEach(yi(s), function(C, I) {
      g.setRequestHeader(I, C);
    }), f.isUndefined(o.withCredentials) || (g.withCredentials = !!o.withCredentials), a && a !== "json" && (g.responseType = o.responseType), u && ([m, b, h] = cr(
      u,
      !0
    ), g.addEventListener("progress", m)), c && g.upload && ([p, S] = cr(c), g.upload.addEventListener("progress", p), g.upload.addEventListener("loadend", S)), (o.cancelToken || o.signal) && (d = (T) => {
      g && (n(!T || T.type ? new Wt(null, e, g) : T), g.abort(), w(), g = null);
    }, o.cancelToken && o.cancelToken.subscribe(d), o.signal && (o.signal.aborted ? d() : o.signal.addEventListener("abort", d)));
    const _ = Ur(o.url);
    if (_ && !Se.protocols.includes(_)) {
      n(
        new N(
          "Unsupported protocol " + _ + ":",
          N.ERR_BAD_REQUEST,
          e
        )
      ), w();
      return;
    }
    g.send(i || null);
  });
}, Uc = (e, t) => {
  if (e = e ? e.filter(Boolean) : [], !t && !e.length)
    return;
  const r = new AbortController();
  let n = !1;
  const o = function(c) {
    if (!n) {
      n = !0, s();
      const u = c instanceof Error ? c : this.reason;
      r.abort(
        u instanceof N ? u : new Wt(u instanceof Error ? u.message : u)
      );
    }
  };
  let i = t && setTimeout(() => {
    i = null, o(new N(`timeout of ${t}ms exceeded`, N.ETIMEDOUT));
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
  return a.unsubscribe = () => f.asap(s), a;
}, jc = function* (e, t) {
  let r = e.byteLength;
  if (r < t) {
    yield e;
    return;
  }
  let n = 0, o;
  for (; n < r; )
    o = n + t, yield e.slice(n, o), n = o;
}, Hc = async function* (e, t) {
  for await (const r of Vc(e))
    yield* jc(r, t);
}, Vc = async function* (e) {
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
}, Gn = (e, t, r, n) => {
  const o = Hc(e, t);
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
          let p = d.byteLength;
          if (r) {
            let m = i += p;
            r(m);
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
}, Yn = (e) => e >= 48 && e <= 57 || e >= 65 && e <= 70 || e >= 97 && e <= 102, Ni = (e, t, r) => t + 2 < r && Yn(e.charCodeAt(t + 1)) && Yn(e.charCodeAt(t + 2)), Jn = (e) => e <= 57 ? e - 48 : (e & 223) - 55, Wc = (e) => e >= 65 && e <= 90 || // A-Z
e >= 97 && e <= 122 || // a-z
e >= 48 && e <= 57 || // 0-9
e === 43 || // +
e === 47 || // /
e === 45 || // - (base64url)
e === 95, zc = (e) => e === 9 || e === 10 || e === 12 || e === 13 || e === 32, qc = (e) => {
  const t = Math.floor(e / 4), r = e % 4;
  return t * 3 + (r === 2 ? 1 : r === 3 ? 2 : 0);
}, Kc = (e) => {
  const t = e.length;
  let r = 0;
  return t > 0 && e.charCodeAt(t - 1) === 61 && (r++, t > 1 && e.charCodeAt(t - 2) === 61 && r++), Math.floor((t - r) * 3 / 4);
}, Gc = (e) => {
  const t = e.length;
  let r = 0, n = 0, o = !1;
  for (let i = 0; i < t; i++) {
    let s = e.charCodeAt(i);
    if (s === 37 && Ni(e, i, t) && (s = Jn(e.charCodeAt(i + 1)) * 16 + Jn(e.charCodeAt(i + 2)), i += 2), !zc(s)) {
      if (s === 61) {
        n++;
        continue;
      }
      if (!Wc(s) || n > 0) {
        o = !0;
        continue;
      }
      r++;
    }
  }
  return o || n > 2 || n > 0 && (r + n) % 4 !== 0 || r % 4 === 1 ? Kc(e) : qc(r);
}, Yc = (e, t) => {
  if (!e || typeof e != "string" || !e.startsWith("data:")) return 0;
  const r = e.indexOf(",");
  if (r < 0) return 0;
  const n = e.slice(5, r), o = e.slice(r + 1);
  if (/;base64/i.test(n))
    return t(o);
  let s = 0;
  for (let a = 0, c = o.length; a < c; a++) {
    const u = o.charCodeAt(a);
    if (u === 37 && Ni(o, a, c))
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
function Jc(e) {
  const t = typeof e == "string" ? e.indexOf("#") : -1;
  return Yc(
    t === -1 ? e : e.slice(0, t),
    Gc
  );
}
const yn = "1.20.0", Xn = 64 * 1024, Xc = {
  cache: "default",
  redirect: "follow",
  referrer: "about:client",
  referrerPolicy: "",
  mode: "cors",
  integrity: "",
  keepalive: !1,
  priority: "auto",
  window: null
}, { isFunction: Gt } = f, Zc = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, r) => String.fromCharCode(parseInt(r, 16))
), Zn = (e) => {
  if (!f.isString(e))
    return e;
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}, Qn = (e, ...t) => {
  try {
    return !!e(...t);
  } catch {
    return !1;
  }
}, Qc = (e) => {
  const t = e.indexOf("://");
  let r = e;
  return t !== -1 && (r = r.slice(t + 3)), r.includes("@") || r.includes(":");
}, el = (e) => {
  const t = f.global !== void 0 && f.global !== null ? f.global : globalThis, { ReadableStream: r, TextEncoder: n } = t;
  e = f.merge.call(
    {
      skipUndefined: !0
    },
    {
      Request: t.Request,
      Response: t.Response
    },
    e
  );
  const { fetch: o, Request: i, Response: s } = e, a = o ? Gt(o) : typeof fetch == "function", c = Gt(i), u = Gt(s);
  if (!a)
    return !1;
  const d = a && Gt(r), p = a && (typeof n == "function" ? /* @__PURE__ */ ((g) => (x) => g.encode(x))(new n()) : async (g) => new Uint8Array(await new i(g).arrayBuffer())), m = c && d && Qn(() => {
    let g = !1;
    const x = new i(Se.origin, {
      body: new r(),
      method: "POST",
      get duplex() {
        return g = !0, "half";
      }
    }), _ = x.headers.has("Content-Type");
    return x.body != null && x.body.cancel(), g && !_;
  }), S = u && d && Qn(() => f.isReadableStream(new s("").body)), b = {
    stream: S && ((g) => g.body)
  };
  a && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((g) => {
    !b[g] && (b[g] = (x, _) => {
      let T = x && x[g];
      if (T)
        return T.call(x);
      throw new N(
        `Response type '${g}' is not supported`,
        N.ERR_NOT_SUPPORT,
        _
      );
    });
  });
  const h = async (g) => {
    if (g == null)
      return 0;
    if (f.isBlob(g))
      return g.size;
    if (f.isSpecCompliantForm(g))
      return (await new i(Se.origin, {
        method: "POST",
        body: g
      }).arrayBuffer()).byteLength;
    if (f.isArrayBufferView(g) || f.isArrayBuffer(g))
      return g.byteLength;
    if (f.isURLSearchParams(g) && (g = g + ""), f.isString(g))
      return (await p(g)).byteLength;
  }, w = async (g, x) => {
    const _ = f.toFiniteNumber(g.getContentLength());
    return _ ?? h(x);
  };
  return async (g) => {
    let {
      url: x,
      method: _,
      data: T,
      signal: C,
      cancelToken: I,
      timeout: Y,
      onDownloadProgress: H,
      onUploadProgress: F,
      responseType: M,
      headers: A,
      withCredentials: l = "same-origin",
      fetchOptions: j,
      maxContentLength: v,
      maxBodyLength: X,
      maxRedirects: Z
    } = Pi(g);
    const ae = f.isNumber(v) && v > -1, pe = f.isNumber(X) && X > -1, Le = (O) => f.hasOwnProp(g, O) ? g[O] : void 0;
    let R = o || fetch;
    M = M ? (M + "").toLowerCase() : "text";
    let P = Uc(
      [C, I && I.toAbortSignal()],
      Y
    ), $ = null;
    const B = P && P.unsubscribe && (() => {
      P.unsubscribe();
    });
    let V, G = null;
    const K = () => new N(
      "Request body larger than maxBodyLength limit",
      N.ERR_BAD_REQUEST,
      g,
      $
    );
    try {
      let O;
      const L = Le("auth");
      if (L) {
        const q = f.getSafeProp(L, "username") || "", oe = f.getSafeProp(L, "password") || "";
        O = {
          username: q,
          password: oe
        };
      }
      if (Qc(x)) {
        const q = new URL(x, Se.origin);
        if (!O && (q.username || q.password)) {
          const oe = Zn(q.username), Re = Zn(q.password);
          O = {
            username: oe,
            password: Re
          };
        }
        (q.username || q.password) && (q.username = "", q.password = "", x = q.href);
      }
      if (O && (A.delete("authorization"), A.set(
        "Authorization",
        "Basic " + btoa(Zc((O.username || "") + ":" + (O.password || "")))
      )), ae && typeof x == "string" && x.startsWith("data:") && Jc(x) > v)
        throw new N(
          "maxContentLength size of " + v + " exceeded",
          N.ERR_BAD_RESPONSE,
          g,
          $
        );
      if (pe && _ !== "get" && _ !== "head") {
        const q = await h(T);
        if (typeof q == "number" && isFinite(q) && (V = q, q > X))
          throw K();
      }
      const W = pe && (f.isReadableStream(T) || f.isStream(T)), Q = (q, oe, Re) => Gn(
        q,
        Xn,
        (ke) => {
          if (pe && ke > X)
            throw G = K();
          oe && oe(ke);
        },
        Re
      );
      if (m && _ !== "get" && _ !== "head" && (F || W)) {
        if (V = V ?? await w(A, T), V !== 0 || W) {
          let q = new i(x, {
            method: "POST",
            body: T,
            duplex: "half"
          }), oe;
          if (f.isFormData(T) && (oe = q.headers.get("content-type")) && A.setContentType(oe), q.body) {
            const [Re, ke] = F && Wn(
              V,
              cr(zn(F))
            ) || [];
            T = Q(q.body, Re, ke);
          }
        }
      } else if (W && !c && d && _ !== "get" && _ !== "head")
        T = Q(T);
      else if (W && c && !m && _ !== "get" && _ !== "head")
        throw new N(
          "Stream request bodies are not supported by the current fetch implementation",
          N.ERR_NOT_SUPPORT,
          g,
          $
        );
      f.isString(l) || (l = l ? "include" : "omit");
      const be = c && "credentials" in i.prototype;
      if (f.isFormData(T)) {
        const q = A.getContentType();
        q && /^multipart\/form-data/i.test(q) && !/boundary=/i.test(q) && A.delete("content-type");
      }
      A.set("User-Agent", "axios/" + yn, !1);
      const k = j == null ? j : Object.assign(/* @__PURE__ */ Object.create(null), j);
      k && (delete k.body, delete k.headers, delete k.method, delete k.signal, delete k.duplex, delete k.credentials);
      const le = Object.assign(/* @__PURE__ */ Object.create(null), k, {
        signal: P,
        method: _.toUpperCase(),
        headers: yi(A.normalize()),
        body: T,
        duplex: "half",
        credentials: be ? l : void 0
      });
      c && (f.forEach(Xc, (q, oe) => {
        le[oe] === void 0 && (le[oe] = q);
      }), le.signal === void 0 && (le.signal = null), le.body === void 0 && (le.body = null)), Z === 0 && (le.redirect = "manual", k && (k.redirect = "manual")), $ = c && new i(x, le);
      let Ee = await (c ? R($, k) : R(x, le));
      const Ge = Ce.from(Ee.headers);
      if (ae) {
        const q = f.toFiniteNumber(Ge.getContentLength());
        if (q != null && q > v)
          throw new N(
            "maxContentLength size of " + v + " exceeded",
            N.ERR_BAD_RESPONSE,
            g,
            $
          );
      }
      const Tt = S && (M === "stream" || M === "response");
      if (S && Ee.body && (H || ae || Tt && B)) {
        const q = {};
        ["status", "statusText", "headers"].forEach((Je) => {
          q[Je] = Ee[Je];
        });
        const oe = f.toFiniteNumber(Ge.getContentLength()), [Re, ke] = H && Wn(
          oe,
          cr(zn(H), !0)
        ) || [];
        let Ye = 0;
        const vr = (Je) => {
          if (ae && (Ye = Je, Ye > v))
            throw new N(
              "maxContentLength size of " + v + " exceeded",
              N.ERR_BAD_RESPONSE,
              g,
              $
            );
          Re && Re(Je);
        };
        Ee = new s(
          Gn(Ee.body, Xn, vr, () => {
            ke && ke(), B && B();
          }),
          q
        );
      }
      M = M || "text";
      let ve = await b[f.findKey(b, M) || "text"](
        Ee,
        g
      );
      if (ae && !S && !Tt) {
        let q;
        if (ve != null && (typeof ve.byteLength == "number" ? q = ve.byteLength : typeof ve.size == "number" ? q = ve.size : typeof ve == "string" && (q = typeof n == "function" ? new n().encode(ve).byteLength : ve.length)), typeof q == "number" && q > v)
          throw new N(
            "maxContentLength size of " + v + " exceeded",
            N.ERR_BAD_RESPONSE,
            g,
            $
          );
      }
      return !Tt && B && B(), await new Promise((q, oe) => {
        Ai(q, oe, {
          data: ve,
          headers: Ce.from(Ee.headers),
          status: Ee.status,
          statusText: Ee.statusText,
          config: g,
          request: $
        });
      });
    } catch (O) {
      if (B && B(), P && P.aborted && P.reason instanceof N) {
        const L = P.reason;
        throw L.config = g, $ && (L.request = $), O !== L && Object.defineProperty(L, "cause", {
          __proto__: null,
          value: O,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), L;
      }
      if (G)
        throw $ && !G.request && (G.request = $), G;
      if (O instanceof N)
        throw $ && !O.request && (O.request = $), O;
      if (O && O.name === "TypeError" && /Load failed|fetch/i.test(O.message)) {
        const L = new N(
          "Network Error",
          N.ERR_NETWORK,
          g,
          $,
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
      throw N.from(O, O && O.code, g, $, O && O.response);
    }
  };
}, tl = /* @__PURE__ */ new Map(), Ii = (e) => {
  let t = e && e.env || {};
  const { fetch: r, Request: n, Response: o } = t, i = [n, o, r];
  let s = i.length, a = s, c, u, d = tl;
  for (; a--; )
    c = i[a], u = d.get(c), u === void 0 && d.set(c, u = a ? /* @__PURE__ */ new Map() : el(t)), d = u;
  return u;
};
Ii();
const bn = {
  http: cc,
  xhr: Bc,
  fetch: {
    get: Ii
  }
};
f.forEach(bn, (e, t) => {
  if (e) {
    try {
      Object.defineProperty(e, "name", { __proto__: null, value: t });
    } catch {
    }
    Object.defineProperty(e, "adapterName", { __proto__: null, value: t });
  }
});
const eo = (e) => `- ${e}`, rl = (e) => f.isFunction(e) || e === null || e === !1;
function nl(e, t) {
  e = f.isArray(e) ? e : [e];
  const { length: r } = e;
  let n, o;
  const i = {};
  for (let s = 0; s < r; s++) {
    n = e[s];
    let a;
    if (o = n, !rl(n) && (o = bn[(a = String(n)).toLowerCase()], o === void 0))
      throw new N(`Unknown adapter '${a}'`);
    if (o && (f.isFunction(o) || (o = o.get(t))))
      break;
    i[a || "#" + s] = o;
  }
  if (!o) {
    const s = Object.entries(i).map(
      ([c, u]) => `adapter ${c} ` + (u === !1 ? "is not supported by the environment" : "is not available in the build")
    );
    let a = r ? s.length > 1 ? `since :
` + s.map(eo).join(`
`) : " " + eo(s[0]) : "as no adapter specified";
    throw new N(
      "There is no suitable adapter to dispatch the request " + a,
      N.ERR_NOT_SUPPORT
    );
  }
  return o;
}
const $i = {
  /**
   * Resolve an adapter from a list of adapter names or functions.
   * @type {Function}
   */
  getAdapter: nl,
  /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */
  adapters: bn
};
function jr(e) {
  if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted)
    throw new Wt(null, e);
}
function Hr(e) {
  const t = f.toSafeFlatObject(e);
  return jr(t), t.headers = Ce.from(f.getSafeProp(t, "headers")), t.data = Br.call(t, t.transformRequest), ["post", "put", "patch"].indexOf(t.method) !== -1 && t.headers.setContentType("application/x-www-form-urlencoded", !1), $i.getAdapter(t.adapter || Vt.adapter, t)(t).then(
    function(o) {
      jr(t), t.response = o;
      try {
        o.data = Br.call(t, t.transformResponse, o);
      } finally {
        delete t.response;
      }
      return o.headers = Ce.from(o.headers), o;
    },
    function(o) {
      if (!_i(o) && (jr(t), o && o.response)) {
        t.response = o.response;
        try {
          o.response.data = Br.call(
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
const mr = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((e, t) => {
  mr[e] = function(n) {
    return typeof n === e || "a" + (t < 1 ? "n " : " ") + e;
  };
});
const to = {};
mr.transitional = function(t, r, n) {
  function o(i, s) {
    return "[Axios v" + yn + "] Transitional option '" + i + "'" + s + (n ? ". " + n : "");
  }
  return (i, s, a) => {
    if (t === !1)
      throw new N(
        o(s, " has been removed" + (r ? " in " + r : "")),
        N.ERR_DEPRECATED
      );
    return r && !to[s] && (to[s] = !0, console.warn(
      o(
        s,
        " has been deprecated since v" + r + " and will be removed in the near future"
      )
    )), t ? t(i, s, a) : !0;
  };
};
mr.spelling = function(t) {
  return (r, n) => (console.warn(`${n} is likely a misspelling of ${t}`), !0);
};
function ol(e, t, r) {
  if (typeof e != "object" || e === null)
    throw new N("options must be an object", N.ERR_BAD_OPTION_VALUE);
  const n = Object.keys(e);
  let o = n.length;
  for (; o-- > 0; ) {
    const i = n[o], s = Object.prototype.hasOwnProperty.call(t, i) ? t[i] : void 0;
    if (s) {
      const a = e[i], c = a === void 0 || s(a, i, e);
      if (c !== !0)
        throw new N(
          "option " + i + " must be " + c,
          N.ERR_BAD_OPTION_VALUE
        );
      continue;
    }
    if (r !== !0)
      throw new N("Unknown option " + i, N.ERR_BAD_OPTION);
  }
}
const nr = {
  assertOptions: ol,
  validators: mr
}, Te = nr.validators;
let st = class {
  constructor(t) {
    this.defaults = t || {}, this.interceptors = {
      request: new Hn(),
      response: new Hn()
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
    typeof t == "string" ? (r = r || {}, r.url = t) : r = t || {}, r = ut(this.defaults, r);
    const { transitional: n, paramsSerializer: o, headers: i } = r;
    n !== void 0 && nr.assertOptions(
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
    ), o != null && (f.isFunction(o) ? r.paramsSerializer = {
      serialize: o
    } : nr.assertOptions(
      o,
      {
        encode: Te.function,
        serialize: Te.function
      },
      !0
    )), r.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? r.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : r.allowAbsoluteUrls = !0), nr.assertOptions(
      r,
      {
        baseUrl: Te.spelling("baseURL"),
        withXsrfToken: Te.spelling("withXSRFToken")
      },
      !0
    ), r.method = (f.getSafeProp(r, "method") || f.getSafeProp(this.defaults, "method") || "get").toLowerCase();
    let s = i && f.merge(i.common, i[r.method]);
    i && f.forEach(Ri.concat("common"), (b) => {
      delete i[b];
    }), r.headers = Ce.concat(s, i);
    const a = [];
    let c = !0;
    this.interceptors.request.forEach(function(h) {
      if (typeof h.runWhen == "function" && h.runWhen(r) === !1)
        return;
      c = c && h.synchronous;
      const w = r.transitional || mn;
      w && w.legacyInterceptorReqResOrdering ? a.unshift(h.fulfilled, h.rejected) : a.push(h.fulfilled, h.rejected);
    });
    const u = [];
    this.interceptors.response.forEach(function(h) {
      u.push(h.fulfilled, h.rejected);
    });
    let d, p = 0, m;
    if (!c) {
      const b = [Hr.bind(this), void 0];
      for (b.unshift(...a), b.push(...u), m = b.length, d = Promise.resolve(r); p < m; )
        d = d.then(b[p++], b[p++]);
      return d;
    }
    m = a.length;
    let S = r;
    for (; p < m; ) {
      const b = a[p++], h = a[p++];
      try {
        S = b ? b(S) : S;
      } catch (w) {
        if (!h) {
          d = Promise.reject(w);
          break;
        }
        try {
          const g = h.call(this, w);
          f.isThenable(g) && (d = Promise.resolve(g).then(
            () => Hr.call(this, S)
          ));
        } catch (g) {
          d = Promise.reject(g);
        }
        break;
      }
    }
    if (!d)
      try {
        d = Hr.call(this, S);
      } catch (b) {
        d = Promise.reject(b);
      }
    for (p = 0, m = u.length; p < m; )
      d = d.then(u[p++], u[p++]);
    return d;
  }
  getUri(t) {
    t = ut(this.defaults, t);
    const r = ki(t.baseURL, t.url, t.allowAbsoluteUrls, t);
    return Ti(r, t.params, t.paramsSerializer);
  }
};
f.forEach(["delete", "get", "head", "options"], function(t) {
  st.prototype[t] = function(r, n) {
    return this.request(
      ut(n || {}, {
        method: t,
        url: r,
        data: n && f.hasOwnProp(n, "data") ? n.data : void 0
      })
    );
  };
});
f.forEach(["post", "put", "patch", "query"], function(t) {
  function r(n) {
    return function(i, s, a) {
      return this.request(
        ut(a || {}, {
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
  st.prototype[t] = r(), t !== "query" && (st.prototype[t + "Form"] = r(!0));
});
let il = class Di {
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
      n.reason || (n.reason = new Wt(i, s, a), r(n.reason));
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
      token: new Di(function(o) {
        t = o;
      }),
      cancel: t
    };
  }
};
function sl(e) {
  return function(r) {
    return e.apply(null, r);
  };
}
function al(e) {
  return f.isObject(e) && e.isAxiosError === !0;
}
const or = {
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
Object.entries(or).forEach(([e, t]) => {
  or[t] === void 0 && (or[t] = e);
});
function Li(e) {
  const t = new st(e), r = si(st.prototype.request, t);
  return f.extend(r, st.prototype, t, { allOwnKeys: !0 }), f.extend(r, t, null, { allOwnKeys: !0 }), r.create = function(o) {
    return Li(ut(e, o));
  }, r;
}
const me = Li(Vt);
me.Axios = st;
me.CanceledError = Wt;
me.CancelToken = il;
me.isCancel = _i;
me.VERSION = yn;
me.toFormData = hr;
me.AxiosError = N;
me.Cancel = me.CanceledError;
me.all = function(t) {
  return Promise.all(t);
};
me.spread = sl;
me.isAxiosError = al;
me.mergeConfig = ut;
me.AxiosHeaders = Ce;
me.formToJSON = (e) => Oi(f.isHTMLForm(e) ? new FormData(e) : e);
me.getAdapter = $i.getAdapter;
me.HttpStatusCode = or;
me.default = me;
const {
  Axios: xf,
  AxiosError: Of,
  CanceledError: Rf,
  isCancel: _f,
  CancelToken: Af,
  VERSION: vf,
  all: kf,
  Cancel: Pf,
  isAxiosError: Nf,
  spread: If,
  toFormData: $f,
  AxiosHeaders: Df,
  HttpStatusCode: Lf,
  formToJSON: Mf,
  getAdapter: Ff,
  mergeConfig: Bf,
  create: Uf
} = me, cl = [
  ye.ENDPOINTS.REFRESH,
  ye.ENDPOINTS.MAGIC_LINK_REQUEST,
  ye.ENDPOINTS.MAGIC_LINK_VERIFY,
  ye.ENDPOINTS.PASSKEY_LOGIN_OPTIONS,
  ye.ENDPOINTS.PASSKEY_LOGIN_VERIFY
], ll = (e) => !!e && cl.some((t) => e.split("?")[0].endsWith(t)), ul = (e, t) => {
  const r = me.create({
    baseURL: e,
    timeout: ye.DEFAULT_CONFIG.TIMEOUT,
    headers: {
      "Content-Type": "application/json",
      ...t && { "X-API-Key": t }
    }
  });
  return r.interceptors.request.use(
    (n) => {
      const o = je.getAccessToken();
      return o && n.headers && (n.headers.Authorization = `Bearer ${o}`), n;
    },
    (n) => Promise.reject(n)
  ), r.interceptors.response.use(
    (n) => n,
    async (n) => {
      const o = n.config;
      if (n.response?.status === ye.STATUS_CODES.UNAUTHORIZED && !o._retry && !ll(o.url)) {
        o._retry = !0;
        try {
          const i = je.getRefreshToken();
          if (!i)
            throw new Error(Xs.NO_REFRESH_TOKEN);
          const s = await r.post(ye.ENDPOINTS.REFRESH, {
            refreshToken: i
          }), a = {
            accessToken: s.data.accessToken,
            refreshToken: s.data.refreshToken
          };
          return je.setTokens(a.accessToken, a.refreshToken), o.headers && (o.headers.Authorization = `Bearer ${a.accessToken}`), r(o);
        } catch (i) {
          return je.clearTokens(), window.location.href = "/login", Promise.reject(i);
        }
      }
      return Promise.reject(n);
    }
  ), r;
};
let Yt = null;
const Be = (e, t) => {
  if (!Yt && e && (Yt = ul(e, t)), !Yt)
    throw new Error("API client not initialized. Please provide baseURL.");
  return Yt;
}, ro = (e, t) => e?.name === "NotAllowedError" ? "Passkey request was cancelled or timed out" : e?.name === "InvalidStateError" ? "A passkey for this account is already registered on this device" : e?.response?.data?.message || e?.message || t, qe = {
  /**
   * Logout user and invalidate refresh token
   * @param refreshToken - The refresh token to invalidate
   * @returns Promise resolving when logout is complete
   */
  logout: async (e) => {
    try {
      await Be().post(ye.ENDPOINTS.LOGOUT, {
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
      const r = await Be().post(ye.ENDPOINTS.REFRESH, {
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
      const t = await Be().get(ye.ENDPOINTS.USER_ME), r = t.data?.data ?? t.data;
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
      await Be().post(ye.ENDPOINTS.MAGIC_LINK_REQUEST, {
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
      const r = await Be().post(ye.ENDPOINTS.MAGIC_LINK_VERIFY, {
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
      const e = Be(), t = await e.post(ye.ENDPOINTS.PASSKEY_LOGIN_OPTIONS), { challengeId: r, options: n } = t.data, o = await Ds({ optionsJSON: n }), i = await e.post(
        ye.ENDPOINTS.PASSKEY_LOGIN_VERIFY,
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
      throw new Error(ro(e, "Passkey sign-in failed"));
    }
  },
  /**
   * Register a new passkey for the currently signed-in user
   * @param name - Optional friendly name for the passkey (e.g. "MacBook Pro")
   * @returns Promise resolving to the stored passkey info
   */
  registerPasskey: async (e) => {
    try {
      const t = Be(), r = await t.post(ye.ENDPOINTS.PASSKEY_REGISTER_OPTIONS), { challengeId: n, options: o } = r.data, i = await Ns({ optionsJSON: o });
      return (await t.post(ye.ENDPOINTS.PASSKEY_REGISTER_VERIFY, {
        challengeId: n,
        response: i,
        name: e
      })).data;
    } catch (t) {
      throw new Error(ro(t, "Passkey registration failed"));
    }
  }
}, dl = [0, 45, 90, 135, 180, 225, 270, 315], fl = (e) => /* @__PURE__ */ z(yt, { ...e, viewBox: "0 0 24 24", children: [
  /* @__PURE__ */ y("circle", { cx: "12", cy: "12", r: "4.6", fill: "currentColor" }),
  dl.map((t) => /* @__PURE__ */ y(
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
] }), pl = (e) => {
  const t = `lumora-moon-${us()}`;
  return /* @__PURE__ */ z(yt, { ...e, viewBox: "0 0 24 24", children: [
    /* @__PURE__ */ z("mask", { id: t, children: [
      /* @__PURE__ */ y("rect", { width: "24", height: "24", fill: "#fff" }),
      /* @__PURE__ */ y("circle", { cx: "15.8", cy: "8.2", r: "4.6", fill: "#000" })
    ] }),
    /* @__PURE__ */ y("circle", { cx: "12", cy: "12", r: "7.5", fill: "currentColor", mask: `url(#${t})` })
  ] });
}, hl = ({ title: e, height: t, color: r }) => /* @__PURE__ */ z(
  "svg",
  {
    role: "img",
    "aria-label": e,
    viewBox: "0 0 143 38",
    height: t,
    width: t * 143 / 38,
    style: { display: "block", fill: r, transition: oi },
    children: [
      /* @__PURE__ */ y("path", { d: "M47.0556 19.7972V5.34429C46.8088 5.38305 46.7507 5.68829 46.6442 5.89178C44.5245 9.8599 43.0533 14.7341 40.9288 18.7022C40.7691 19.0026 40.4496 19.8069 40.1109 19.8069C39.3753 19.8166 34.4438 6.74452 33.1662 5.34429V19.8069H31.8595V1.87036H34.5551L40.6674 15.141L41.0885 15.4075L47.1379 1.87036H49.6689V19.3369C49.6689 19.395 49.6544 19.6567 49.6544 19.7923" }),
      /* @__PURE__ */ y("path", { d: "M79.0544 11.4152L77.1235 11.3764V19.6034H74.3456V1.87036H80.966C82.9212 2.09324 85.3845 3.34327 85.6265 5.79972C85.9362 8.95387 84.3876 9.98588 82.0937 10.9985C81.9243 11.0712 81.813 10.9016 81.871 11.2844L87.4268 19.6082H84.7312M77.1235 10.4704C80.1336 11.1099 84.3827 8.60503 82.3308 4.73865C81.9194 3.96344 80.4385 2.97504 79.6594 2.97504H77.1283V10.4752L77.1235 10.4704Z" }),
      /* @__PURE__ */ y("path", { d: "M60.9113 1.56022C67.2753 0.857678 72.7294 6.97702 70.2903 14.0702C67.8366 21.1973 58.5593 22.2197 54.7651 16.0179C51.1113 10.044 54.6199 2.25791 60.9161 1.56506L60.9113 1.56022ZM60.9064 2.46625C54.8135 3.61938 54.7409 18.6779 61.6856 19.2448C69.8644 19.9134 69.8741 0.770466 60.9064 2.46625Z" }),
      /* @__PURE__ */ y("path", { d: "M16.8233 1.87036V14.2156C16.8233 17.5345 20.7675 19.7293 23.4486 18.707C24.6391 18.2564 26.4539 16.2263 26.6282 14.768V1.87036H27.9348V14.8552C27.9348 15.1653 27.5767 16.3862 27.3977 16.769C24.8375 22.2294 14.21 20.6499 14.21 14.5839V1.87036H16.8233Z" }),
      /* @__PURE__ */ y("path", { d: "M95.669 1.49707L103.432 19.6177H100.736L98.3453 13.789C96.2062 13.789 93.9413 13.7503 91.9039 13.7503C91.6232 13.7503 91.6571 13.7503 91.4732 13.7503L88.9421 19.797H87.6403M91.9232 12.665H97.7161L95.0205 5.89641" }),
      /* @__PURE__ */ y("path", { d: "M4.0761 1.87036V18.5132H12.0855V19.6131H1.29822V2.14653L1.54503 1.87036H4.0761Z" }),
      /* @__PURE__ */ y("path", { d: "M37.7396 32.782V37.3557H36.2684V27.4814H40.111C41.0692 27.4814 41.5725 28.1598 41.829 28.4844C42.5647 29.4146 42.584 31.062 41.829 31.968C41.6597 32.1715 41.1031 32.7335 40.4353 32.7868H37.7396V32.782ZM37.7396 28.0289V32.1424C39.1867 32.5494 40.8563 32.2199 40.8563 30.311C40.8563 28.402 39.1818 27.8351 37.7396 28.0241V28.0289Z" }),
      /* @__PURE__ */ y("path", { d: "M8.81874 29.8504L8.1654 29.957C6.65547 26.6236 2.85645 27.297 1.90307 30.8049C0.543162 35.8292 5.6053 39.5793 8.32027 34.6906L8.8139 34.7924C7.27977 38.9737 1.36588 38.1985 0.238272 34.0559C-1.4362 27.893 6.17152 24.4094 8.8139 29.8504H8.81874Z" }),
      /* @__PURE__ */ y("path", { d: "M26.4589 37.3505L25.0119 37.3262L23.8601 34.1721L19.9207 34.1479L18.5898 37.3262L17.7961 37.3505L22.0452 27.1128M20.2546 33.329H23.3616L21.9678 29.4869" }),
      /* @__PURE__ */ y("path", { d: "M71.2435 27.4766V28.0241H68.1414V37.3508H66.6702V28.0241H63.6455L63.3987 27.4766H71.2435Z" }),
      /* @__PURE__ */ y("path", { d: "M99.5161 27.4766V36.8033H103.925V37.3508H98.04V27.4766H99.5112H99.5161Z" }),
      /* @__PURE__ */ y("path", { d: "M54.0825 27.4766H52.6113V37.3508H54.0825V27.4766Z" }),
      /* @__PURE__ */ y("path", { d: "M112.883 22.8688L112.975 16.7204L133.112 0L133.194 6.31314L112.883 22.8688Z" }),
      /* @__PURE__ */ y("path", { d: "M112.849 37.9998L113.009 32.6169L133.228 15.8433V21.0711L112.854 37.9998H112.849Z" }),
      /* @__PURE__ */ y("path", { d: "M121.913 37.8838V32.4282L142.123 15.2766V21.1489L121.913 37.8838Z" }),
      /* @__PURE__ */ y("path", { d: "M121.792 23.4694V17.7813L142.133 0.828369V6.54557L121.792 23.4694Z" }),
      /* @__PURE__ */ y("path", { d: "M86.8706 37.3505L85.4236 37.3262L84.2718 34.1721L80.3324 34.1479L79.0016 37.3262L78.2079 37.3505L82.457 27.1128M80.6664 33.329H83.7733L82.3796 29.4869" })
    ]
  }
), no = ({
  brandConfig: e,
  theme: t,
  onToggleColorMode: r,
  showWelcome: n = !0
}) => {
  const o = t.mode === "dark" ? "light" : "dark";
  return /* @__PURE__ */ z(
    D,
    {
      component: "header",
      sx: { "& *": { transition: fe } },
      children: [
        /* @__PURE__ */ z(
          D,
          {
            sx: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2
            },
            children: [
              e.logo ? typeof e.logo == "string" ? /* @__PURE__ */ y(
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
              ) : e.logo : /* @__PURE__ */ y(
                hl,
                {
                  title: e.companyName || "Lumora Capital",
                  height: e.logoHeight,
                  color: t.logo
                }
              ),
              /* @__PURE__ */ y(
                ps,
                {
                  title: `Switch to ${o} mode`,
                  slotProps: {
                    tooltip: { sx: { fontFamily: t.bodyFont } }
                  },
                  children: /* @__PURE__ */ z(
                    hs,
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
                        transition: fe,
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
                          transition: `${fr("opacity")}, transform ${dn}ms ${bt}`
                        }
                      },
                      children: [
                        /* @__PURE__ */ y(
                          fl,
                          {
                            sx: {
                              color: "#de9733",
                              opacity: t.mode === "dark" ? 0 : 1,
                              transform: t.mode === "dark" ? "rotate(-90deg) scale(0.6)" : "none"
                            }
                          }
                        ),
                        /* @__PURE__ */ y(
                          pl,
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
        n && /* @__PURE__ */ z(Nn, { children: [
          /* @__PURE__ */ z(
            D,
            {
              component: "h1",
              sx: {
                m: 0,
                // Clear space between the logo and the welcome title
                mt: 4.5,
                [Qe]: { mt: 3 },
                fontFamily: t.headingFont,
                fontSize: 42,
                fontWeight: 600,
                lineHeight: 1.12,
                letterSpacing: "-0.01em",
                color: t.welcomeTitle
              },
              children: [
                e.welcomeTitle,
                e.welcomeTitleAccent && /* @__PURE__ */ z(Nn, { children: [
                  " ",
                  /* @__PURE__ */ y(
                    D,
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
          e.tagline && /* @__PURE__ */ y(
            D,
            {
              component: "p",
              sx: {
                m: 0,
                mt: 1.5,
                [Qe]: { mt: 1 },
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
}, oo = ({
  theme: e,
  icon: t,
  label: r,
  ariaLabel: n,
  loadingLabel: o = "Signing in...",
  isLoading: i = !1,
  disabled: s = !1,
  onClick: a
}) => /* @__PURE__ */ y(
  $t,
  {
    fullWidth: !0,
    variant: "outlined",
    "aria-label": i ? o : n,
    startIcon: i ? /* @__PURE__ */ y(ln, { size: 18, color: "inherit" }) : t,
    onClick: a,
    disabled: s,
    sx: {
      ...Dt,
      borderRadius: "10px",
      textTransform: "none",
      // Buttons are set in Montserrat
      fontFamily: e.headingFont,
      fontWeight: 600,
      fontSize: 15,
      whiteSpace: "nowrap",
      transition: fe,
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
), ml = ({ monochrome: e = !1, ...t }) => /* @__PURE__ */ z(yt, { ...t, viewBox: "0 0 23 23", children: [
  /* @__PURE__ */ y("path", { fill: e ? "currentColor" : "#f35325", d: "M1 1h10v10H1z" }),
  /* @__PURE__ */ y("path", { fill: e ? "currentColor" : "#81bc06", d: "M12 1h10v10H12z" }),
  /* @__PURE__ */ y("path", { fill: e ? "currentColor" : "#05a6f0", d: "M1 12h10v10H1z" }),
  /* @__PURE__ */ y("path", { fill: e ? "currentColor" : "#ffba08", d: "M12 12h10v10H12z" })
] });
function gl(e, t, r) {
  return r === void 0 && (r = {}), function(n, o, i) {
    try {
      return Promise.resolve((function(s, a) {
        try {
          var c = (t != null && t.context && process.env.NODE_ENV === "development" && console.warn("You should not used the yup options context. Please, use the 'useForm' context object instead"), Promise.resolve(e[r.mode === "sync" ? "validateSync" : "validate"](n, Object.assign({ abortEarly: !1 }, t, { context: o }))).then(function(u) {
            return i.shouldUseNativeValidation && Rs({}, i), { values: r.raw ? Object.assign({}, n) : u, errors: {} };
          }));
        } catch (u) {
          return a(u);
        }
        return c && c.then ? c.then(void 0, a) : c;
      })(0, function(s) {
        if (!s.inner) throw s;
        return { values: {}, errors: _s((a = s, c = !i.shouldUseNativeValidation && i.criteriaMode === "all", (a.inner || []).reduce(function(u, d) {
          if (u[d.path] || (u[d.path] = { message: d.message, type: d.type }), c) {
            var p = u[d.path].types, m = p && p[d.type];
            u[d.path] = xs(d.path, c, u, d.type, m ? [].concat(m, d.message) : d.message);
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
const yl = $n.object({
  email: $n.string().email("Please enter a valid email address").required("Email is required")
}), bl = ({
  theme: e,
  isSubmitting: t,
  disabled: r = !1,
  onSubmit: n
}) => {
  const {
    register: o,
    handleSubmit: i,
    formState: { errors: s }
  } = Os({
    resolver: gl(yl)
  }), a = t || r;
  return /* @__PURE__ */ z(D, { component: "form", noValidate: !0, onSubmit: i(n), children: [
    /* @__PURE__ */ y(
      D,
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
    /* @__PURE__ */ z(D, { sx: { display: "flex", gap: 1.25 }, children: [
      /* @__PURE__ */ y(
        ms,
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
            ...Dt,
            px: 2,
            borderRadius: "10px",
            border: `1px solid ${s.email ? "#d14343" : e.border}`,
            backgroundColor: e.surface,
            color: e.label,
            fontFamily: e.bodyFont,
            fontSize: 16,
            transition: fe,
            "&.Mui-focused": {
              borderColor: e.accent,
              boxShadow: `0 0 0 3px ${e.accent}26`
            },
            "& input::placeholder": {
              color: e.placeholder,
              opacity: 1,
              transition: fe
            }
          }
        }
      ),
      /* @__PURE__ */ y(
        $t,
        {
          type: "submit",
          variant: "contained",
          disableElevation: !0,
          disabled: a,
          sx: {
            flexShrink: 0,
            ...Dt,
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
            transition: fe,
            "&:hover": { backgroundColor: e.accentHover },
            ...sr(e),
            "&.Mui-disabled": {
              backgroundColor: e.accent,
              color: e.buttonText,
              opacity: 0.6
            }
          },
          children: t ? /* @__PURE__ */ y(ln, { size: 20, color: "inherit", "aria-label": "Sending sign-in link" }) : "Magic Link"
        }
      )
    ] }),
    s.email && /* @__PURE__ */ y(
      D,
      {
        id: "lumora-work-email-error",
        role: "status",
        sx: { mt: 1, fontSize: 13, color: "#d14343" },
        children: s.email.message
      }
    )
  ] });
}, Sl = ({
  theme: e,
  title: t,
  description: r,
  onBackToLogin: n
}) => /* @__PURE__ */ z(D, { children: [
  /* @__PURE__ */ y(
    D,
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
      children: /* @__PURE__ */ y(Es, {})
    }
  ),
  /* @__PURE__ */ y(
    D,
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
  /* @__PURE__ */ y(
    D,
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
  /* @__PURE__ */ y(
    $t,
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
        ...sr(e)
      },
      children: "Back to sign in"
    }
  )
] });
function tt(e, ...t) {
  const r = new URL(`https://mui.com/production-error/?code=${e}`);
  return t.forEach((n) => r.searchParams.append("args[]", n)), `Minified MUI error #${e}; visit ${r} for the full message.`;
}
const at = "$$material";
function El(e) {
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
var wl = {
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
function Tl(e) {
  var t = /* @__PURE__ */ Object.create(null);
  return function(r) {
    return t[r] === void 0 && (t[r] = e(r)), t[r];
  };
}
var Cl = /[A-Z]|^ms/g, xl = /_EMO_([^_]+?)_([^]*?)_EMO_/g, Mi = function(t) {
  return t.charCodeAt(1) === 45;
}, io = function(t) {
  return t != null && typeof t != "boolean";
}, Vr = /* @__PURE__ */ Tl(function(e) {
  return Mi(e) ? e : e.replace(Cl, "-$&").toLowerCase();
}), so = function(t, r) {
  switch (t) {
    case "animation":
    case "animationName":
      if (typeof r == "string")
        return r.replace(xl, function(n, o, i) {
          return Ze = {
            name: o,
            styles: i,
            next: Ze
          }, o;
        });
  }
  return wl[t] !== 1 && !Mi(t) && typeof r == "number" && r !== 0 ? r + "px" : r;
};
function lr(e, t, r) {
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
        return Ze = {
          name: o.name,
          styles: o.styles,
          next: Ze
        }, o.name;
      var i = r;
      if (i.styles !== void 0) {
        var s = i.next;
        if (s !== void 0)
          for (; s !== void 0; )
            Ze = {
              name: s.name,
              styles: s.styles,
              next: Ze
            }, s = s.next;
        var a = i.styles + ";";
        return a;
      }
      return Ol(e, t, r);
    }
  }
  var c = r;
  return c;
}
function Ol(e, t, r) {
  var n = "";
  if (Array.isArray(r))
    for (var o = 0; o < r.length; o++)
      n += lr(e, t, r[o]) + ";";
  else
    for (var i in r) {
      var s = r[i];
      if (typeof s != "object") {
        var a = s;
        io(a) && (n += Vr(i) + ":" + so(i, a) + ";");
      } else if (Array.isArray(s) && typeof s[0] == "string" && t == null)
        for (var c = 0; c < s.length; c++)
          io(s[c]) && (n += Vr(i) + ":" + so(i, s[c]) + ";");
      else {
        var u = lr(e, t, s);
        switch (i) {
          case "animation":
          case "animationName": {
            n += Vr(i) + ":" + u + ";";
            break;
          }
          default:
            n += i + "{" + u + "}";
        }
      }
    }
  return n;
}
var ao = /label:\s*([^\s;{]+)\s*(;|$)/g, Ze;
function Rl(e, t, r) {
  if (e.length === 1 && typeof e[0] == "object" && e[0] !== null && e[0].styles !== void 0)
    return e[0];
  var n = !0, o = "";
  Ze = void 0;
  var i = e[0];
  if (i == null || i.raw === void 0)
    n = !1, o += lr(r, t, i);
  else {
    var s = i;
    o += s[0];
  }
  for (var a = 1; a < e.length; a++)
    if (o += lr(r, t, e[a]), n) {
      var c = i;
      o += c[a];
    }
  ao.lastIndex = 0;
  for (var u = "", d; (d = ao.exec(o)) !== null; )
    u += "-" + d[1];
  var p = El(o) + u;
  return {
    name: p,
    styles: o,
    next: Ze
  };
}
function _l(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Jt = { exports: {} }, Xt = { exports: {} }, ee = {};
var co;
function Al() {
  if (co) return ee;
  co = 1;
  var e = typeof Symbol == "function" && Symbol.for, t = e ? /* @__PURE__ */ Symbol.for("react.element") : 60103, r = e ? /* @__PURE__ */ Symbol.for("react.portal") : 60106, n = e ? /* @__PURE__ */ Symbol.for("react.fragment") : 60107, o = e ? /* @__PURE__ */ Symbol.for("react.strict_mode") : 60108, i = e ? /* @__PURE__ */ Symbol.for("react.profiler") : 60114, s = e ? /* @__PURE__ */ Symbol.for("react.provider") : 60109, a = e ? /* @__PURE__ */ Symbol.for("react.context") : 60110, c = e ? /* @__PURE__ */ Symbol.for("react.async_mode") : 60111, u = e ? /* @__PURE__ */ Symbol.for("react.concurrent_mode") : 60111, d = e ? /* @__PURE__ */ Symbol.for("react.forward_ref") : 60112, p = e ? /* @__PURE__ */ Symbol.for("react.suspense") : 60113, m = e ? /* @__PURE__ */ Symbol.for("react.suspense_list") : 60120, S = e ? /* @__PURE__ */ Symbol.for("react.memo") : 60115, b = e ? /* @__PURE__ */ Symbol.for("react.lazy") : 60116, h = e ? /* @__PURE__ */ Symbol.for("react.block") : 60121, w = e ? /* @__PURE__ */ Symbol.for("react.fundamental") : 60117, g = e ? /* @__PURE__ */ Symbol.for("react.responder") : 60118, x = e ? /* @__PURE__ */ Symbol.for("react.scope") : 60119;
  function _(C) {
    if (typeof C == "object" && C !== null) {
      var I = C.$$typeof;
      switch (I) {
        case t:
          switch (C = C.type, C) {
            case c:
            case u:
            case n:
            case i:
            case o:
            case p:
              return C;
            default:
              switch (C = C && C.$$typeof, C) {
                case a:
                case d:
                case b:
                case S:
                case s:
                  return C;
                default:
                  return I;
              }
          }
        case r:
          return I;
      }
    }
  }
  function T(C) {
    return _(C) === u;
  }
  return ee.AsyncMode = c, ee.ConcurrentMode = u, ee.ContextConsumer = a, ee.ContextProvider = s, ee.Element = t, ee.ForwardRef = d, ee.Fragment = n, ee.Lazy = b, ee.Memo = S, ee.Portal = r, ee.Profiler = i, ee.StrictMode = o, ee.Suspense = p, ee.isAsyncMode = function(C) {
    return T(C) || _(C) === c;
  }, ee.isConcurrentMode = T, ee.isContextConsumer = function(C) {
    return _(C) === a;
  }, ee.isContextProvider = function(C) {
    return _(C) === s;
  }, ee.isElement = function(C) {
    return typeof C == "object" && C !== null && C.$$typeof === t;
  }, ee.isForwardRef = function(C) {
    return _(C) === d;
  }, ee.isFragment = function(C) {
    return _(C) === n;
  }, ee.isLazy = function(C) {
    return _(C) === b;
  }, ee.isMemo = function(C) {
    return _(C) === S;
  }, ee.isPortal = function(C) {
    return _(C) === r;
  }, ee.isProfiler = function(C) {
    return _(C) === i;
  }, ee.isStrictMode = function(C) {
    return _(C) === o;
  }, ee.isSuspense = function(C) {
    return _(C) === p;
  }, ee.isValidElementType = function(C) {
    return typeof C == "string" || typeof C == "function" || C === n || C === u || C === i || C === o || C === p || C === m || typeof C == "object" && C !== null && (C.$$typeof === b || C.$$typeof === S || C.$$typeof === s || C.$$typeof === a || C.$$typeof === d || C.$$typeof === w || C.$$typeof === g || C.$$typeof === x || C.$$typeof === h);
  }, ee.typeOf = _, ee;
}
var te = {};
var lo;
function vl() {
  return lo || (lo = 1, process.env.NODE_ENV !== "production" && (function() {
    var e = typeof Symbol == "function" && Symbol.for, t = e ? /* @__PURE__ */ Symbol.for("react.element") : 60103, r = e ? /* @__PURE__ */ Symbol.for("react.portal") : 60106, n = e ? /* @__PURE__ */ Symbol.for("react.fragment") : 60107, o = e ? /* @__PURE__ */ Symbol.for("react.strict_mode") : 60108, i = e ? /* @__PURE__ */ Symbol.for("react.profiler") : 60114, s = e ? /* @__PURE__ */ Symbol.for("react.provider") : 60109, a = e ? /* @__PURE__ */ Symbol.for("react.context") : 60110, c = e ? /* @__PURE__ */ Symbol.for("react.async_mode") : 60111, u = e ? /* @__PURE__ */ Symbol.for("react.concurrent_mode") : 60111, d = e ? /* @__PURE__ */ Symbol.for("react.forward_ref") : 60112, p = e ? /* @__PURE__ */ Symbol.for("react.suspense") : 60113, m = e ? /* @__PURE__ */ Symbol.for("react.suspense_list") : 60120, S = e ? /* @__PURE__ */ Symbol.for("react.memo") : 60115, b = e ? /* @__PURE__ */ Symbol.for("react.lazy") : 60116, h = e ? /* @__PURE__ */ Symbol.for("react.block") : 60121, w = e ? /* @__PURE__ */ Symbol.for("react.fundamental") : 60117, g = e ? /* @__PURE__ */ Symbol.for("react.responder") : 60118, x = e ? /* @__PURE__ */ Symbol.for("react.scope") : 60119;
    function _(k) {
      return typeof k == "string" || typeof k == "function" || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
      k === n || k === u || k === i || k === o || k === p || k === m || typeof k == "object" && k !== null && (k.$$typeof === b || k.$$typeof === S || k.$$typeof === s || k.$$typeof === a || k.$$typeof === d || k.$$typeof === w || k.$$typeof === g || k.$$typeof === x || k.$$typeof === h);
    }
    function T(k) {
      if (typeof k == "object" && k !== null) {
        var le = k.$$typeof;
        switch (le) {
          case t:
            var Ee = k.type;
            switch (Ee) {
              case c:
              case u:
              case n:
              case i:
              case o:
              case p:
                return Ee;
              default:
                var Ge = Ee && Ee.$$typeof;
                switch (Ge) {
                  case a:
                  case d:
                  case b:
                  case S:
                  case s:
                    return Ge;
                  default:
                    return le;
                }
            }
          case r:
            return le;
        }
      }
    }
    var C = c, I = u, Y = a, H = s, F = t, M = d, A = n, l = b, j = S, v = r, X = i, Z = o, ae = p, pe = !1;
    function Le(k) {
      return pe || (pe = !0, console.warn("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 17+. Update your code to use ReactIs.isConcurrentMode() instead. It has the exact same API.")), R(k) || T(k) === c;
    }
    function R(k) {
      return T(k) === u;
    }
    function P(k) {
      return T(k) === a;
    }
    function $(k) {
      return T(k) === s;
    }
    function B(k) {
      return typeof k == "object" && k !== null && k.$$typeof === t;
    }
    function V(k) {
      return T(k) === d;
    }
    function G(k) {
      return T(k) === n;
    }
    function K(k) {
      return T(k) === b;
    }
    function O(k) {
      return T(k) === S;
    }
    function L(k) {
      return T(k) === r;
    }
    function W(k) {
      return T(k) === i;
    }
    function Q(k) {
      return T(k) === o;
    }
    function be(k) {
      return T(k) === p;
    }
    te.AsyncMode = C, te.ConcurrentMode = I, te.ContextConsumer = Y, te.ContextProvider = H, te.Element = F, te.ForwardRef = M, te.Fragment = A, te.Lazy = l, te.Memo = j, te.Portal = v, te.Profiler = X, te.StrictMode = Z, te.Suspense = ae, te.isAsyncMode = Le, te.isConcurrentMode = R, te.isContextConsumer = P, te.isContextProvider = $, te.isElement = B, te.isForwardRef = V, te.isFragment = G, te.isLazy = K, te.isMemo = O, te.isPortal = L, te.isProfiler = W, te.isStrictMode = Q, te.isSuspense = be, te.isValidElementType = _, te.typeOf = T;
  })()), te;
}
var uo;
function Fi() {
  return uo || (uo = 1, process.env.NODE_ENV === "production" ? Xt.exports = Al() : Xt.exports = vl()), Xt.exports;
}
var Wr, fo;
function kl() {
  if (fo) return Wr;
  fo = 1;
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
  return Wr = o() ? Object.assign : function(i, s) {
    for (var a, c = n(i), u, d = 1; d < arguments.length; d++) {
      a = Object(arguments[d]);
      for (var p in a)
        t.call(a, p) && (c[p] = a[p]);
      if (e) {
        u = e(a);
        for (var m = 0; m < u.length; m++)
          r.call(a, u[m]) && (c[u[m]] = a[u[m]]);
      }
    }
    return c;
  }, Wr;
}
var zr, po;
function Sn() {
  if (po) return zr;
  po = 1;
  var e = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
  return zr = e, zr;
}
var qr, ho;
function Bi() {
  return ho || (ho = 1, qr = Function.call.bind(Object.prototype.hasOwnProperty)), qr;
}
var Kr, mo;
function Pl() {
  if (mo) return Kr;
  mo = 1;
  var e = function() {
  };
  if (process.env.NODE_ENV !== "production") {
    var t = /* @__PURE__ */ Sn(), r = {}, n = /* @__PURE__ */ Bi();
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
          var p;
          try {
            if (typeof i[d] != "function") {
              var m = Error(
                (c || "React class") + ": " + a + " type `" + d + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof i[d] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`."
              );
              throw m.name = "Invariant Violation", m;
            }
            p = i[d](s, d, c, a, null, t);
          } catch (b) {
            p = b;
          }
          if (p && !(p instanceof Error) && e(
            (c || "React class") + ": type specification of " + a + " `" + d + "` is invalid; the type checker function must return `null` or an `Error` but returned a " + typeof p + ". You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument)."
          ), p instanceof Error && !(p.message in r)) {
            r[p.message] = !0;
            var S = u ? u() : "";
            e(
              "Failed " + a + " type: " + p.message + (S ?? "")
            );
          }
        }
    }
  }
  return o.resetWarningCache = function() {
    process.env.NODE_ENV !== "production" && (r = {});
  }, Kr = o, Kr;
}
var Gr, go;
function Nl() {
  if (go) return Gr;
  go = 1;
  var e = Fi(), t = kl(), r = /* @__PURE__ */ Sn(), n = /* @__PURE__ */ Bi(), o = /* @__PURE__ */ Pl(), i = function() {
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
  return Gr = function(a, c) {
    var u = typeof Symbol == "function" && Symbol.iterator, d = "@@iterator";
    function p(R) {
      var P = R && (u && R[u] || R[d]);
      if (typeof P == "function")
        return P;
    }
    var m = "<<anonymous>>", S = {
      array: g("array"),
      bigint: g("bigint"),
      bool: g("boolean"),
      func: g("function"),
      number: g("number"),
      object: g("object"),
      string: g("string"),
      symbol: g("symbol"),
      any: x(),
      arrayOf: _,
      element: T(),
      elementType: C(),
      instanceOf: I,
      node: M(),
      objectOf: H,
      oneOf: Y,
      oneOfType: F,
      shape: l,
      exact: j
    };
    function b(R, P) {
      return R === P ? R !== 0 || 1 / R === 1 / P : R !== R && P !== P;
    }
    function h(R, P) {
      this.message = R, this.data = P && typeof P == "object" ? P : {}, this.stack = "";
    }
    h.prototype = Error.prototype;
    function w(R) {
      if (process.env.NODE_ENV !== "production")
        var P = {}, $ = 0;
      function B(G, K, O, L, W, Q, be) {
        if (L = L || m, Q = Q || O, be !== r) {
          if (c) {
            var k = new Error(
              "Calling PropTypes validators directly is not supported by the `prop-types` package. Use `PropTypes.checkPropTypes()` to call them. Read more at http://fb.me/use-check-prop-types"
            );
            throw k.name = "Invariant Violation", k;
          } else if (process.env.NODE_ENV !== "production" && typeof console < "u") {
            var le = L + ":" + O;
            !P[le] && // Avoid spamming the console because they are often not actionable except for lib authors
            $ < 3 && (i(
              "You are manually calling a React.PropTypes validation function for the `" + Q + "` prop on `" + L + "`. This is deprecated and will throw in the standalone `prop-types` package. You may be seeing this warning due to a third-party PropTypes library. See https://fb.me/react-warning-dont-call-proptypes for details."
            ), P[le] = !0, $++);
          }
        }
        return K[O] == null ? G ? K[O] === null ? new h("The " + W + " `" + Q + "` is marked as required " + ("in `" + L + "`, but its value is `null`.")) : new h("The " + W + " `" + Q + "` is marked as required in " + ("`" + L + "`, but its value is `undefined`.")) : null : R(K, O, L, W, Q);
      }
      var V = B.bind(null, !1);
      return V.isRequired = B.bind(null, !0), V;
    }
    function g(R) {
      function P($, B, V, G, K, O) {
        var L = $[B], W = Z(L);
        if (W !== R) {
          var Q = ae(L);
          return new h(
            "Invalid " + G + " `" + K + "` of type " + ("`" + Q + "` supplied to `" + V + "`, expected ") + ("`" + R + "`."),
            { expectedType: R }
          );
        }
        return null;
      }
      return w(P);
    }
    function x() {
      return w(s);
    }
    function _(R) {
      function P($, B, V, G, K) {
        if (typeof R != "function")
          return new h("Property `" + K + "` of component `" + V + "` has invalid PropType notation inside arrayOf.");
        var O = $[B];
        if (!Array.isArray(O)) {
          var L = Z(O);
          return new h("Invalid " + G + " `" + K + "` of type " + ("`" + L + "` supplied to `" + V + "`, expected an array."));
        }
        for (var W = 0; W < O.length; W++) {
          var Q = R(O, W, V, G, K + "[" + W + "]", r);
          if (Q instanceof Error)
            return Q;
        }
        return null;
      }
      return w(P);
    }
    function T() {
      function R(P, $, B, V, G) {
        var K = P[$];
        if (!a(K)) {
          var O = Z(K);
          return new h("Invalid " + V + " `" + G + "` of type " + ("`" + O + "` supplied to `" + B + "`, expected a single ReactElement."));
        }
        return null;
      }
      return w(R);
    }
    function C() {
      function R(P, $, B, V, G) {
        var K = P[$];
        if (!e.isValidElementType(K)) {
          var O = Z(K);
          return new h("Invalid " + V + " `" + G + "` of type " + ("`" + O + "` supplied to `" + B + "`, expected a single ReactElement type."));
        }
        return null;
      }
      return w(R);
    }
    function I(R) {
      function P($, B, V, G, K) {
        if (!($[B] instanceof R)) {
          var O = R.name || m, L = Le($[B]);
          return new h("Invalid " + G + " `" + K + "` of type " + ("`" + L + "` supplied to `" + V + "`, expected ") + ("instance of `" + O + "`."));
        }
        return null;
      }
      return w(P);
    }
    function Y(R) {
      if (!Array.isArray(R))
        return process.env.NODE_ENV !== "production" && (arguments.length > 1 ? i(
          "Invalid arguments supplied to oneOf, expected an array, got " + arguments.length + " arguments. A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z])."
        ) : i("Invalid argument supplied to oneOf, expected an array.")), s;
      function P($, B, V, G, K) {
        for (var O = $[B], L = 0; L < R.length; L++)
          if (b(O, R[L]))
            return null;
        var W = JSON.stringify(R, function(be, k) {
          var le = ae(k);
          return le === "symbol" ? String(k) : k;
        });
        return new h("Invalid " + G + " `" + K + "` of value `" + String(O) + "` " + ("supplied to `" + V + "`, expected one of " + W + "."));
      }
      return w(P);
    }
    function H(R) {
      function P($, B, V, G, K) {
        if (typeof R != "function")
          return new h("Property `" + K + "` of component `" + V + "` has invalid PropType notation inside objectOf.");
        var O = $[B], L = Z(O);
        if (L !== "object")
          return new h("Invalid " + G + " `" + K + "` of type " + ("`" + L + "` supplied to `" + V + "`, expected an object."));
        for (var W in O)
          if (n(O, W)) {
            var Q = R(O, W, V, G, K + "." + W, r);
            if (Q instanceof Error)
              return Q;
          }
        return null;
      }
      return w(P);
    }
    function F(R) {
      if (!Array.isArray(R))
        return process.env.NODE_ENV !== "production" && i("Invalid argument supplied to oneOfType, expected an instance of array."), s;
      for (var P = 0; P < R.length; P++) {
        var $ = R[P];
        if (typeof $ != "function")
          return i(
            "Invalid argument supplied to oneOfType. Expected an array of check functions, but received " + pe($) + " at index " + P + "."
          ), s;
      }
      function B(V, G, K, O, L) {
        for (var W = [], Q = 0; Q < R.length; Q++) {
          var be = R[Q], k = be(V, G, K, O, L, r);
          if (k == null)
            return null;
          k.data && n(k.data, "expectedType") && W.push(k.data.expectedType);
        }
        var le = W.length > 0 ? ", expected one of type [" + W.join(", ") + "]" : "";
        return new h("Invalid " + O + " `" + L + "` supplied to " + ("`" + K + "`" + le + "."));
      }
      return w(B);
    }
    function M() {
      function R(P, $, B, V, G) {
        return v(P[$]) ? null : new h("Invalid " + V + " `" + G + "` supplied to " + ("`" + B + "`, expected a ReactNode."));
      }
      return w(R);
    }
    function A(R, P, $, B, V) {
      return new h(
        (R || "React class") + ": " + P + " type `" + $ + "." + B + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + V + "`."
      );
    }
    function l(R) {
      function P($, B, V, G, K) {
        var O = $[B], L = Z(O);
        if (L !== "object")
          return new h("Invalid " + G + " `" + K + "` of type `" + L + "` " + ("supplied to `" + V + "`, expected `object`."));
        for (var W in R) {
          var Q = R[W];
          if (typeof Q != "function")
            return A(V, G, K, W, ae(Q));
          var be = Q(O, W, V, G, K + "." + W, r);
          if (be)
            return be;
        }
        return null;
      }
      return w(P);
    }
    function j(R) {
      function P($, B, V, G, K) {
        var O = $[B], L = Z(O);
        if (L !== "object")
          return new h("Invalid " + G + " `" + K + "` of type `" + L + "` " + ("supplied to `" + V + "`, expected `object`."));
        var W = t({}, $[B], R);
        for (var Q in W) {
          var be = R[Q];
          if (n(R, Q) && typeof be != "function")
            return A(V, G, K, Q, ae(be));
          if (!be)
            return new h(
              "Invalid " + G + " `" + K + "` key `" + Q + "` supplied to `" + V + "`.\nBad object: " + JSON.stringify($[B], null, "  ") + `
Valid keys: ` + JSON.stringify(Object.keys(R), null, "  ")
            );
          var k = be(O, Q, V, G, K + "." + Q, r);
          if (k)
            return k;
        }
        return null;
      }
      return w(P);
    }
    function v(R) {
      switch (typeof R) {
        case "number":
        case "string":
        case "undefined":
          return !0;
        case "boolean":
          return !R;
        case "object":
          if (Array.isArray(R))
            return R.every(v);
          if (R === null || a(R))
            return !0;
          var P = p(R);
          if (P) {
            var $ = P.call(R), B;
            if (P !== R.entries) {
              for (; !(B = $.next()).done; )
                if (!v(B.value))
                  return !1;
            } else
              for (; !(B = $.next()).done; ) {
                var V = B.value;
                if (V && !v(V[1]))
                  return !1;
              }
          } else
            return !1;
          return !0;
        default:
          return !1;
      }
    }
    function X(R, P) {
      return R === "symbol" ? !0 : P ? P["@@toStringTag"] === "Symbol" || typeof Symbol == "function" && P instanceof Symbol : !1;
    }
    function Z(R) {
      var P = typeof R;
      return Array.isArray(R) ? "array" : R instanceof RegExp ? "object" : X(P, R) ? "symbol" : P;
    }
    function ae(R) {
      if (typeof R > "u" || R === null)
        return "" + R;
      var P = Z(R);
      if (P === "object") {
        if (R instanceof Date)
          return "date";
        if (R instanceof RegExp)
          return "regexp";
      }
      return P;
    }
    function pe(R) {
      var P = ae(R);
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
    function Le(R) {
      return !R.constructor || !R.constructor.name ? m : R.constructor.name;
    }
    return S.checkPropTypes = o, S.resetWarningCache = o.resetWarningCache, S.PropTypes = S, S;
  }, Gr;
}
var Yr, yo;
function Il() {
  if (yo) return Yr;
  yo = 1;
  var e = /* @__PURE__ */ Sn();
  function t() {
  }
  function r() {
  }
  return r.resetWarningCache = t, Yr = function() {
    function n(s, a, c, u, d, p) {
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
  }, Yr;
}
var bo;
function $l() {
  if (bo) return Jt.exports;
  if (bo = 1, process.env.NODE_ENV !== "production") {
    var e = Fi(), t = !0;
    Jt.exports = /* @__PURE__ */ Nl()(e.isElement, t);
  } else
    Jt.exports = /* @__PURE__ */ Il()();
  return Jt.exports;
}
var Dl = /* @__PURE__ */ $l();
const U = /* @__PURE__ */ _l(Dl);
function Ll(e) {
  return e == null || Object.keys(e).length === 0;
}
function En(e) {
  const {
    styles: t,
    defaultTheme: r = {}
  } = e;
  return /* @__PURE__ */ y(Cs, {
    styles: typeof t == "function" ? (o) => t(Ll(o) ? r : o) : t
  });
}
process.env.NODE_ENV !== "production" && (En.propTypes = {
  defaultTheme: U.object,
  styles: U.oneOfType([U.array, U.string, U.object, U.func])
});
const So = [];
function Ml(e) {
  return So[0] = e, Rl(So);
}
var Zt = { exports: {} }, ie = {};
var Eo;
function Fl() {
  if (Eo) return ie;
  Eo = 1;
  var e = /* @__PURE__ */ Symbol.for("react.transitional.element"), t = /* @__PURE__ */ Symbol.for("react.portal"), r = /* @__PURE__ */ Symbol.for("react.fragment"), n = /* @__PURE__ */ Symbol.for("react.strict_mode"), o = /* @__PURE__ */ Symbol.for("react.profiler"), i = /* @__PURE__ */ Symbol.for("react.consumer"), s = /* @__PURE__ */ Symbol.for("react.context"), a = /* @__PURE__ */ Symbol.for("react.forward_ref"), c = /* @__PURE__ */ Symbol.for("react.suspense"), u = /* @__PURE__ */ Symbol.for("react.suspense_list"), d = /* @__PURE__ */ Symbol.for("react.memo"), p = /* @__PURE__ */ Symbol.for("react.lazy"), m = /* @__PURE__ */ Symbol.for("react.view_transition"), S = /* @__PURE__ */ Symbol.for("react.client.reference");
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
            case m:
              return h;
            default:
              switch (h = h && h.$$typeof, h) {
                case s:
                case a:
                case p:
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
  return ie.ContextConsumer = i, ie.ContextProvider = s, ie.Element = e, ie.ForwardRef = a, ie.Fragment = r, ie.Lazy = p, ie.Memo = d, ie.Portal = t, ie.Profiler = o, ie.StrictMode = n, ie.Suspense = c, ie.SuspenseList = u, ie.isContextConsumer = function(h) {
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
    return b(h) === p;
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
    return typeof h == "string" || typeof h == "function" || h === r || h === o || h === n || h === c || h === u || typeof h == "object" && h !== null && (h.$$typeof === p || h.$$typeof === d || h.$$typeof === s || h.$$typeof === i || h.$$typeof === a || h.$$typeof === S || h.getModuleId !== void 0);
  }, ie.typeOf = b, ie;
}
var se = {};
var wo;
function Bl() {
  return wo || (wo = 1, process.env.NODE_ENV !== "production" && (function() {
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
                  case m:
                  case p:
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
    var t = /* @__PURE__ */ Symbol.for("react.transitional.element"), r = /* @__PURE__ */ Symbol.for("react.portal"), n = /* @__PURE__ */ Symbol.for("react.fragment"), o = /* @__PURE__ */ Symbol.for("react.strict_mode"), i = /* @__PURE__ */ Symbol.for("react.profiler"), s = /* @__PURE__ */ Symbol.for("react.consumer"), a = /* @__PURE__ */ Symbol.for("react.context"), c = /* @__PURE__ */ Symbol.for("react.forward_ref"), u = /* @__PURE__ */ Symbol.for("react.suspense"), d = /* @__PURE__ */ Symbol.for("react.suspense_list"), p = /* @__PURE__ */ Symbol.for("react.memo"), m = /* @__PURE__ */ Symbol.for("react.lazy"), S = /* @__PURE__ */ Symbol.for("react.view_transition"), b = /* @__PURE__ */ Symbol.for("react.client.reference");
    se.ContextConsumer = s, se.ContextProvider = a, se.Element = t, se.ForwardRef = c, se.Fragment = n, se.Lazy = m, se.Memo = p, se.Portal = r, se.Profiler = i, se.StrictMode = o, se.Suspense = u, se.SuspenseList = d, se.isContextConsumer = function(h) {
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
      return e(h) === m;
    }, se.isMemo = function(h) {
      return e(h) === p;
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
      return typeof h == "string" || typeof h == "function" || h === n || h === i || h === o || h === u || h === d || typeof h == "object" && h !== null && (h.$$typeof === m || h.$$typeof === p || h.$$typeof === a || h.$$typeof === s || h.$$typeof === c || h.$$typeof === b || h.getModuleId !== void 0);
    }, se.typeOf = e;
  })()), se;
}
var To;
function Ul() {
  return To || (To = 1, process.env.NODE_ENV === "production" ? Zt.exports = /* @__PURE__ */ Fl() : Zt.exports = /* @__PURE__ */ Bl()), Zt.exports;
}
var Ui = /* @__PURE__ */ Ul();
function Xe(e) {
  if (typeof e != "object" || e === null)
    return !1;
  const t = Object.getPrototypeOf(e);
  return (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) && !(Symbol.toStringTag in e) && !(Symbol.iterator in e);
}
function ji(e) {
  if (/* @__PURE__ */ J.isValidElement(e) || Ui.isValidElementType(e) || !Xe(e))
    return e;
  const t = {};
  return Object.keys(e).forEach((r) => {
    t[r] = ji(e[r]);
  }), t;
}
function Ae(e, t, r = {
  clone: !0
}) {
  const n = r.clone ? {
    ...e
  } : e;
  return Xe(e) && Xe(t) && Object.keys(t).forEach((o) => {
    /* @__PURE__ */ J.isValidElement(t[o]) || Ui.isValidElementType(t[o]) ? n[o] = t[o] : Xe(t[o]) && // Avoid prototype pollution
    Object.prototype.hasOwnProperty.call(e, o) && Xe(e[o]) ? n[o] = Ae(e[o], t[o], r) : r.clone ? n[o] = Xe(t[o]) ? ji(t[o]) : t[o] : n[o] = t[o];
  }), n;
}
const jl = (e) => {
  const t = Object.keys(e).map((r) => ({
    key: r,
    val: e[r]
  })) || [];
  return t.sort((r, n) => r.val - n.val), t.reduce((r, n) => ({
    ...r,
    [n.key]: n.val
  }), {});
};
function Hl(e) {
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
  } = e, i = jl(t), s = Object.keys(i);
  function a(m) {
    return `@media (min-width:${typeof t[m] == "number" ? t[m] : m}${r})`;
  }
  function c(m) {
    return `@media (max-width:${(typeof t[m] == "number" ? t[m] : m) - n / 100}${r})`;
  }
  function u(m, S) {
    const b = s.indexOf(S);
    return `@media (min-width:${typeof t[m] == "number" ? t[m] : m}${r}) and (max-width:${(b !== -1 && typeof t[s[b]] == "number" ? t[s[b]] : S) - n / 100}${r})`;
  }
  function d(m) {
    return s.indexOf(m) + 1 < s.length ? u(m, s[s.indexOf(m) + 1]) : a(m);
  }
  function p(m) {
    const S = s.indexOf(m);
    return S === 0 ? a(s[1]) : S === s.length - 1 ? c(s[S]) : u(m, s[s.indexOf(m) + 1]).replace("@media", "@media not all and");
  }
  return {
    keys: s,
    values: i,
    up: a,
    down: c,
    between: u,
    only: d,
    not: p,
    unit: r,
    ...o
  };
}
function Co(e, t) {
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
function Vl(e, t) {
  return t === "@" || t.startsWith("@") && (e.some((r) => t.startsWith(`@${r}`)) || !!t.match(/^@\d/));
}
function Wl(e, t) {
  const r = t.match(/^@([^/]+)?\/?(.+)?$/);
  if (!r) {
    if (process.env.NODE_ENV !== "production")
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The provided shorthand ${`(${t})`} is invalid. The format should be \`@<breakpoint | number>\` or \`@<breakpoint | number>/<container>\`.
For example, \`@sm\` or \`@600\` or \`@40rem/sidebar\`.` : tt(18, `(${t})`));
    return null;
  }
  const [, n, o] = r, i = Number.isNaN(+n) ? n || 0 : +n;
  return e.containerQueries(o).up(i);
}
function zl(e) {
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
const ql = {
  borderRadius: 4
}, nt = process.env.NODE_ENV !== "production" ? U.oneOfType([U.number, U.string, U.object, U.array]) : {};
function It(e, t) {
  return t ? Ae(e, t, {
    clone: !1
    // No need to clone deep, it's way faster.
  }) : e;
}
const gr = {
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
}, xo = {
  // Sorted ASC by size. That's important.
  // It can't be configured as it's used statically for propTypes.
  keys: ["xs", "sm", "md", "lg", "xl"],
  up: (e) => `@media (min-width:${gr[e]}px)`
}, Kl = {
  containerQueries: (e) => ({
    up: (t) => {
      let r = typeof t == "number" ? t : gr[t] || t;
      return typeof r == "number" && (r = `${r}px`), e ? `@container ${e} (min-width:${r})` : `@container (min-width:${r})`;
    }
  })
};
function Ke(e, t, r) {
  const n = e.theme || {};
  if (Array.isArray(t)) {
    const i = n.breakpoints || xo;
    return t.reduce((s, a, c) => (s[i.up(i.keys[c])] = r(t[c]), s), {});
  }
  if (typeof t == "object") {
    const i = n.breakpoints || xo;
    return Object.keys(t).reduce((s, a) => {
      if (Vl(i.keys, a)) {
        const c = Wl(n.containerQueries ? n : Kl, a);
        c && (s[c] = r(t[a], a));
      } else if (Object.keys(i.values || gr).includes(a)) {
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
function Gl(e = {}) {
  return e.keys?.reduce((r, n) => {
    const o = e.up(n);
    return r[o] = {}, r;
  }, {}) || {};
}
function Oo(e, t) {
  return e.reduce((r, n) => {
    const o = r[n];
    return (!o || Object.keys(o).length === 0) && delete r[n], r;
  }, t);
}
function Hi(e) {
  if (typeof e != "string")
    throw new Error(process.env.NODE_ENV !== "production" ? "MUI: `capitalize(string)` expects a string argument." : tt(7));
  return e.charAt(0).toUpperCase() + e.slice(1);
}
function yr(e, t, r = !0) {
  if (!t || typeof t != "string")
    return null;
  if (e && e.vars && r) {
    const n = `vars.${t}`.split(".").reduce((o, i) => o && o[i] ? o[i] : null, e);
    if (n != null)
      return n;
  }
  return t.split(".").reduce((n, o) => n && n[o] != null ? n[o] : null, e);
}
function ur(e, t, r, n = r) {
  let o;
  return typeof e == "function" ? o = e(r) : Array.isArray(e) ? o = e[r] || n : o = yr(e, r) || n, t && (o = t(o, n, e)), o;
}
function ge(e) {
  const {
    prop: t,
    cssProperty: r = e.prop,
    themeKey: n,
    transform: o
  } = e, i = (s) => {
    if (s[t] == null)
      return null;
    const a = s[t], c = s.theme, u = yr(c, n) || {};
    return Ke(s, a, (p) => {
      let m = ur(u, o, p);
      return p === m && typeof p == "string" && (m = ur(u, o, `${t}${p === "default" ? "" : Hi(p)}`, p)), r === !1 ? m : {
        [r]: m
      };
    });
  };
  return i.propTypes = process.env.NODE_ENV !== "production" ? {
    [t]: nt
  } : {}, i.filterProps = [t], i;
}
function Yl(e) {
  const t = {};
  return (r) => (t[r] === void 0 && (t[r] = e(r)), t[r]);
}
const Jl = {
  m: "margin",
  p: "padding"
}, Xl = {
  t: "Top",
  r: "Right",
  b: "Bottom",
  l: "Left",
  x: ["Left", "Right"],
  y: ["Top", "Bottom"]
}, Ro = {
  marginX: "mx",
  marginY: "my",
  paddingX: "px",
  paddingY: "py"
}, Zl = Yl((e) => {
  if (e.length > 2)
    if (Ro[e])
      e = Ro[e];
    else
      return [e];
  const [t, r] = e.split(""), n = Jl[t], o = Xl[r] || "";
  return Array.isArray(o) ? o.map((i) => n + i) : [n + o];
}), br = ["m", "mt", "mr", "mb", "ml", "mx", "my", "margin", "marginTop", "marginRight", "marginBottom", "marginLeft", "marginX", "marginY", "marginInline", "marginInlineStart", "marginInlineEnd", "marginBlock", "marginBlockStart", "marginBlockEnd"], Sr = ["p", "pt", "pr", "pb", "pl", "px", "py", "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "paddingX", "paddingY", "paddingInline", "paddingInlineStart", "paddingInlineEnd", "paddingBlock", "paddingBlockStart", "paddingBlockEnd"], Ql = [...br, ...Sr];
function zt(e, t, r, n) {
  const o = yr(e, t, !0) ?? r;
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
function wn(e) {
  return zt(e, "spacing", 8, "spacing");
}
function qt(e, t) {
  return typeof t == "string" || t == null ? t : e(t);
}
function eu(e, t) {
  return (r) => e.reduce((n, o) => (n[o] = qt(t, r), n), {});
}
function tu(e, t, r, n) {
  if (!t.includes(r))
    return null;
  const o = Zl(r), i = eu(o, n), s = e[r];
  return Ke(e, s, i);
}
function Vi(e, t) {
  const r = wn(e.theme);
  return Object.keys(e).map((n) => tu(e, t, n, r)).reduce(It, {});
}
function ue(e) {
  return Vi(e, br);
}
ue.propTypes = process.env.NODE_ENV !== "production" ? br.reduce((e, t) => (e[t] = nt, e), {}) : {};
ue.filterProps = br;
function de(e) {
  return Vi(e, Sr);
}
de.propTypes = process.env.NODE_ENV !== "production" ? Sr.reduce((e, t) => (e[t] = nt, e), {}) : {};
de.filterProps = Sr;
process.env.NODE_ENV !== "production" && Ql.reduce((e, t) => (e[t] = nt, e), {});
function Wi(e = 8, t = wn({
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
function Er(...e) {
  const t = e.reduce((n, o) => (o.filterProps.forEach((i) => {
    n[i] = o;
  }), n), {}), r = (n) => Object.keys(n).reduce((o, i) => t[i] ? It(o, t[i](n)) : o, {});
  return r.propTypes = process.env.NODE_ENV !== "production" ? e.reduce((n, o) => Object.assign(n, o.propTypes), {}) : {}, r.filterProps = e.reduce((n, o) => n.concat(o.filterProps), []), r;
}
function Ne(e) {
  return typeof e != "number" ? e : `${e}px solid`;
}
function De(e, t) {
  return ge({
    prop: e,
    themeKey: "borders",
    transform: t
  });
}
const ru = De("border", Ne), nu = De("borderTop", Ne), ou = De("borderRight", Ne), iu = De("borderBottom", Ne), su = De("borderLeft", Ne), au = De("borderColor"), cu = De("borderTopColor"), lu = De("borderRightColor"), uu = De("borderBottomColor"), du = De("borderLeftColor"), fu = De("outline", Ne), pu = De("outlineColor"), wr = (e) => {
  if (e.borderRadius !== void 0 && e.borderRadius !== null) {
    const t = zt(e.theme, "shape.borderRadius", 4, "borderRadius"), r = (n) => ({
      borderRadius: qt(t, n)
    });
    return Ke(e, e.borderRadius, r);
  }
  return null;
};
wr.propTypes = process.env.NODE_ENV !== "production" ? {
  borderRadius: nt
} : {};
wr.filterProps = ["borderRadius"];
Er(ru, nu, ou, iu, su, au, cu, lu, uu, du, wr, fu, pu);
const Tr = (e) => {
  if (e.gap !== void 0 && e.gap !== null) {
    const t = zt(e.theme, "spacing", 8, "gap"), r = (n) => ({
      gap: qt(t, n)
    });
    return Ke(e, e.gap, r);
  }
  return null;
};
Tr.propTypes = process.env.NODE_ENV !== "production" ? {
  gap: nt
} : {};
Tr.filterProps = ["gap"];
const Cr = (e) => {
  if (e.columnGap !== void 0 && e.columnGap !== null) {
    const t = zt(e.theme, "spacing", 8, "columnGap"), r = (n) => ({
      columnGap: qt(t, n)
    });
    return Ke(e, e.columnGap, r);
  }
  return null;
};
Cr.propTypes = process.env.NODE_ENV !== "production" ? {
  columnGap: nt
} : {};
Cr.filterProps = ["columnGap"];
const xr = (e) => {
  if (e.rowGap !== void 0 && e.rowGap !== null) {
    const t = zt(e.theme, "spacing", 8, "rowGap"), r = (n) => ({
      rowGap: qt(t, n)
    });
    return Ke(e, e.rowGap, r);
  }
  return null;
};
xr.propTypes = process.env.NODE_ENV !== "production" ? {
  rowGap: nt
} : {};
xr.filterProps = ["rowGap"];
const hu = ge({
  prop: "gridColumn"
}), mu = ge({
  prop: "gridRow"
}), gu = ge({
  prop: "gridAutoFlow"
}), yu = ge({
  prop: "gridAutoColumns"
}), bu = ge({
  prop: "gridAutoRows"
}), Su = ge({
  prop: "gridTemplateColumns"
}), Eu = ge({
  prop: "gridTemplateRows"
}), wu = ge({
  prop: "gridTemplateAreas"
}), Tu = ge({
  prop: "gridArea"
});
Er(Tr, Cr, xr, hu, mu, gu, yu, bu, Su, Eu, wu, Tu);
function St(e, t) {
  return t === "grey" ? t : e;
}
const Cu = ge({
  prop: "color",
  themeKey: "palette",
  transform: St
}), xu = ge({
  prop: "bgcolor",
  cssProperty: "backgroundColor",
  themeKey: "palette",
  transform: St
}), Ou = ge({
  prop: "backgroundColor",
  themeKey: "palette",
  transform: St
});
Er(Cu, xu, Ou);
function _e(e) {
  return e <= 1 && e !== 0 ? `${e * 100}%` : e;
}
const Ru = ge({
  prop: "width",
  transform: _e
}), Tn = (e) => {
  if (e.maxWidth !== void 0 && e.maxWidth !== null) {
    const t = (r) => {
      const n = e.theme?.breakpoints?.values?.[r] || gr[r];
      return n ? e.theme?.breakpoints?.unit !== "px" ? {
        maxWidth: `${n}${e.theme.breakpoints.unit}`
      } : {
        maxWidth: n
      } : {
        maxWidth: _e(r)
      };
    };
    return Ke(e, e.maxWidth, t);
  }
  return null;
};
Tn.filterProps = ["maxWidth"];
const _u = ge({
  prop: "minWidth",
  transform: _e
}), Au = ge({
  prop: "height",
  transform: _e
}), vu = ge({
  prop: "maxHeight",
  transform: _e
}), ku = ge({
  prop: "minHeight",
  transform: _e
});
ge({
  prop: "size",
  cssProperty: "width",
  transform: _e
});
ge({
  prop: "size",
  cssProperty: "height",
  transform: _e
});
const Pu = ge({
  prop: "boxSizing"
});
Er(Ru, Tn, _u, Au, vu, ku, Pu);
const Or = {
  // borders
  border: {
    themeKey: "borders",
    transform: Ne
  },
  borderTop: {
    themeKey: "borders",
    transform: Ne
  },
  borderRight: {
    themeKey: "borders",
    transform: Ne
  },
  borderBottom: {
    themeKey: "borders",
    transform: Ne
  },
  borderLeft: {
    themeKey: "borders",
    transform: Ne
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
    transform: Ne
  },
  outlineColor: {
    themeKey: "palette"
  },
  borderRadius: {
    themeKey: "shape.borderRadius",
    style: wr
  },
  // palette
  color: {
    themeKey: "palette",
    transform: St
  },
  bgcolor: {
    themeKey: "palette",
    cssProperty: "backgroundColor",
    transform: St
  },
  backgroundColor: {
    themeKey: "palette",
    transform: St
  },
  // spacing
  p: {
    style: de
  },
  pt: {
    style: de
  },
  pr: {
    style: de
  },
  pb: {
    style: de
  },
  pl: {
    style: de
  },
  px: {
    style: de
  },
  py: {
    style: de
  },
  padding: {
    style: de
  },
  paddingTop: {
    style: de
  },
  paddingRight: {
    style: de
  },
  paddingBottom: {
    style: de
  },
  paddingLeft: {
    style: de
  },
  paddingX: {
    style: de
  },
  paddingY: {
    style: de
  },
  paddingInline: {
    style: de
  },
  paddingInlineStart: {
    style: de
  },
  paddingInlineEnd: {
    style: de
  },
  paddingBlock: {
    style: de
  },
  paddingBlockStart: {
    style: de
  },
  paddingBlockEnd: {
    style: de
  },
  m: {
    style: ue
  },
  mt: {
    style: ue
  },
  mr: {
    style: ue
  },
  mb: {
    style: ue
  },
  ml: {
    style: ue
  },
  mx: {
    style: ue
  },
  my: {
    style: ue
  },
  margin: {
    style: ue
  },
  marginTop: {
    style: ue
  },
  marginRight: {
    style: ue
  },
  marginBottom: {
    style: ue
  },
  marginLeft: {
    style: ue
  },
  marginX: {
    style: ue
  },
  marginY: {
    style: ue
  },
  marginInline: {
    style: ue
  },
  marginInlineStart: {
    style: ue
  },
  marginInlineEnd: {
    style: ue
  },
  marginBlock: {
    style: ue
  },
  marginBlockStart: {
    style: ue
  },
  marginBlockEnd: {
    style: ue
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
    style: Tr
  },
  rowGap: {
    style: xr
  },
  columnGap: {
    style: Cr
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
    transform: _e
  },
  maxWidth: {
    style: Tn
  },
  minWidth: {
    transform: _e
  },
  height: {
    transform: _e
  },
  maxHeight: {
    transform: _e
  },
  minHeight: {
    transform: _e
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
function Nu(...e) {
  const t = e.reduce((n, o) => n.concat(Object.keys(o)), []), r = new Set(t);
  return e.every((n) => r.size === Object.keys(n).length);
}
function Iu(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function $u() {
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
      style: p
    } = a;
    if (n == null)
      return null;
    if (u === "typography" && n === "inherit")
      return {
        [r]: n
      };
    const m = yr(o, u) || {};
    return p ? p(s) : Ke(s, n, (b) => {
      let h = ur(m, d, b);
      return b === h && typeof b == "string" && (h = ur(m, d, `${r}${b === "default" ? "" : Hi(b)}`, b)), c === !1 ? h : {
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
    const s = o.unstable_sxConfig ?? Or;
    function a(c) {
      let u = c;
      if (typeof c == "function")
        u = c(o);
      else if (typeof c != "object")
        return c;
      if (!u)
        return null;
      const d = Gl(o.breakpoints), p = Object.keys(d);
      let m = d;
      return Object.keys(u).forEach((S) => {
        const b = Iu(u[S], o);
        if (b != null)
          if (typeof b == "object")
            if (s[S])
              m = It(m, e(S, b, o, s));
            else {
              const h = Ke({
                theme: o
              }, b, (w) => ({
                [S]: w
              }));
              Nu(h, b) ? m[S] = t({
                sx: b,
                theme: o,
                nested: !0
              }) : m = It(m, h);
            }
          else
            m = It(m, e(S, b, o, s));
      }), !i && o.modularCssLayers ? {
        "@layer sx": Co(o, Oo(p, m))
      } : Co(o, Oo(p, m));
    }
    return Array.isArray(n) ? n.map(a) : a(n);
  }
  return t;
}
const Kt = $u();
Kt.filterProps = ["sx"];
function Du(e, t) {
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
function zi(e = {}, ...t) {
  const {
    breakpoints: r = {},
    palette: n = {},
    spacing: o,
    shape: i = {},
    ...s
  } = e, a = Hl(r), c = Wi(o);
  let u = Ae({
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
      ...ql,
      ...i
    }
  }, s);
  return u = zl(u), u.applyStyles = Du, u = t.reduce((d, p) => Ae(d, p), u), u.unstable_sxConfig = {
    ...Or,
    ...s?.unstable_sxConfig
  }, u.unstable_sx = function(p) {
    return Kt({
      sx: p,
      theme: this
    });
  }, u;
}
function Lu(e) {
  return Object.keys(e).length === 0;
}
function Cn(e = null) {
  const t = J.useContext(Qo);
  return !t || Lu(t) ? e : t;
}
const Mu = zi();
function qi(e = Mu) {
  return Cn(e);
}
function Jr(e) {
  const t = Ml(e);
  return e !== t && t.styles ? (t.styles.match(/^@layer\s+[^{]*$/) || (t.styles = `@layer global{${t.styles}}`), t) : e;
}
function Ki({
  styles: e,
  themeId: t,
  defaultTheme: r = {}
}) {
  const n = qi(r), o = t && n[t] || n;
  let i = typeof e == "function" ? e(o) : e;
  return o.modularCssLayers && (Array.isArray(i) ? i = i.map((s) => Jr(typeof s == "function" ? s(o) : s)) : i = Jr(i)), /* @__PURE__ */ y(En, {
    styles: i
  });
}
process.env.NODE_ENV !== "production" && (Ki.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * @ignore
   */
  defaultTheme: U.object,
  /**
   * @ignore
   */
  styles: U.oneOfType([U.array, U.func, U.number, U.object, U.string, U.bool]),
  /**
   * @ignore
   */
  themeId: U.string
});
const _o = (e) => e, Fu = () => {
  let e = _o;
  return {
    configure(t) {
      e = t;
    },
    generate(t) {
      return e(t);
    },
    reset() {
      e = _o;
    }
  };
}, Bu = Fu(), Uu = {
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
function ju(e, t, r = "Mui") {
  const n = Uu[t];
  return n ? `${r}-${n}` : `${Bu.generate(e)}-${t}`;
}
const Gi = typeof window < "u" ? J.useLayoutEffect : J.useEffect;
function Hu(e, t = Number.MIN_SAFE_INTEGER, r = Number.MAX_SAFE_INTEGER) {
  return Math.max(t, Math.min(e, r));
}
function xn(e, t = 0, r = 1) {
  return process.env.NODE_ENV !== "production" && (e < t || e > r) && console.error(`MUI: The value provided ${e} is out of range [${t}, ${r}].`), Hu(e, t, r);
}
function Vu(e) {
  e = e.slice(1);
  const t = new RegExp(`.{1,${e.length >= 6 ? 2 : 1}}`, "g");
  let r = e.match(t);
  return r && r[0].length === 1 && (r = r.map((n) => n + n)), process.env.NODE_ENV !== "production" && e.length !== e.trim().length && console.error(`MUI: The color: "${e}" is invalid. Make sure the color input doesn't contain leading/trailing space.`), r ? `rgb${r.length === 4 ? "a" : ""}(${r.map((n, o) => o < 3 ? parseInt(n, 16) : Math.round(parseInt(n, 16) / 255 * 1e3) / 1e3).join(", ")})` : "";
}
function rt(e) {
  if (e.type)
    return e;
  if (e.charAt(0) === "#")
    return rt(Vu(e));
  const t = e.indexOf("("), r = e.substring(0, t);
  if (!["rgb", "rgba", "hsl", "hsla", "color"].includes(r))
    throw new Error(process.env.NODE_ENV !== "production" ? `MUI: Unsupported \`${e}\` color.
The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().` : tt(9, e));
  let n = e.substring(t + 1, e.length - 1), o;
  if (r === "color") {
    if (n = n.split(" "), o = n.shift(), n.length === 4 && n[3].charAt(0) === "/" && (n[3] = n[3].slice(1)), !["srgb", "display-p3", "a98-rgb", "prophoto-rgb", "rec-2020"].includes(o))
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: unsupported \`${o}\` color space.
The following color spaces are supported: srgb, display-p3, a98-rgb, prophoto-rgb, rec-2020.` : tt(10, o));
  } else
    n = n.split(",");
  return n = n.map((i) => parseFloat(i)), {
    type: r,
    values: n,
    colorSpace: o
  };
}
const Wu = (e) => {
  const t = rt(e);
  return t.values.slice(0, 3).map((r, n) => t.type.includes("hsl") && n !== 0 ? `${r}%` : r).join(" ");
}, vt = (e, t) => {
  try {
    return Wu(e);
  } catch {
    return t && process.env.NODE_ENV !== "production" && console.warn(t), e;
  }
};
function Rr(e) {
  const {
    type: t,
    colorSpace: r
  } = e;
  let {
    values: n
  } = e;
  return t.includes("rgb") ? n = n.map((o, i) => i < 3 ? parseInt(o, 10) : o) : t.includes("hsl") && (n[1] = `${n[1]}%`, n[2] = `${n[2]}%`), t.includes("color") ? n = `${r} ${n.join(" ")}` : n = `${n.join(", ")}`, `${t}(${n})`;
}
function Yi(e) {
  e = rt(e);
  const {
    values: t
  } = e, r = t[0], n = t[1] / 100, o = t[2] / 100, i = n * Math.min(o, 1 - o), s = (u, d = (u + r / 30) % 12) => o - i * Math.max(Math.min(d - 3, 9 - d, 1), -1);
  let a = "rgb";
  const c = [Math.round(s(0) * 255), Math.round(s(8) * 255), Math.round(s(4) * 255)];
  return e.type === "hsla" && (a += "a", c.push(t[3])), Rr({
    type: a,
    values: c
  });
}
function sn(e) {
  e = rt(e);
  let t = e.type === "hsl" || e.type === "hsla" ? rt(Yi(e)).values : e.values;
  return t = t.map((r) => (e.type !== "color" && (r /= 255), r <= 0.03928 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4)), Number((0.2126 * t[0] + 0.7152 * t[1] + 0.0722 * t[2]).toFixed(3));
}
function Ao(e, t) {
  const r = sn(e), n = sn(t);
  return (Math.max(r, n) + 0.05) / (Math.min(r, n) + 0.05);
}
function Ji(e, t) {
  return e = rt(e), t = xn(t), (e.type === "rgb" || e.type === "hsl") && (e.type += "a"), e.type === "color" ? e.values[3] = `/${t}` : e.values[3] = t, Rr(e);
}
function ot(e, t, r) {
  try {
    return Ji(e, t);
  } catch {
    return r && process.env.NODE_ENV !== "production" && console.warn(r), e;
  }
}
function _r(e, t) {
  if (e = rt(e), t = xn(t), e.type.includes("hsl"))
    e.values[2] *= 1 - t;
  else if (e.type.includes("rgb") || e.type.includes("color"))
    for (let r = 0; r < 3; r += 1)
      e.values[r] *= 1 - t;
  return Rr(e);
}
function re(e, t, r) {
  try {
    return _r(e, t);
  } catch {
    return r && process.env.NODE_ENV !== "production" && console.warn(r), e;
  }
}
function Ar(e, t) {
  if (e = rt(e), t = xn(t), e.type.includes("hsl"))
    e.values[2] += (100 - e.values[2]) * t;
  else if (e.type.includes("rgb"))
    for (let r = 0; r < 3; r += 1)
      e.values[r] += (255 - e.values[r]) * t;
  else if (e.type.includes("color"))
    for (let r = 0; r < 3; r += 1)
      e.values[r] += (1 - e.values[r]) * t;
  return Rr(e);
}
function ne(e, t, r) {
  try {
    return Ar(e, t);
  } catch {
    return r && process.env.NODE_ENV !== "production" && console.warn(r), e;
  }
}
function zu(e, t = 0.15) {
  return sn(e) > 0.5 ? _r(e, t) : Ar(e, t);
}
function Qt(e, t, r) {
  try {
    return zu(e, t);
  } catch {
    return e;
  }
}
const qu = "exact-prop: ​";
function Xi(e) {
  return process.env.NODE_ENV === "production" ? e : {
    ...e,
    [qu]: (t) => {
      const r = Object.keys(t).filter((n) => !e.hasOwnProperty(n));
      return r.length > 0 ? new Error(`The following props are not supported: ${r.map((n) => `\`${n}\``).join(", ")}. Please remove them.`) : null;
    }
  };
}
const On = /* @__PURE__ */ J.createContext(null);
process.env.NODE_ENV !== "production" && (On.displayName = "ThemeContext");
function Rn() {
  const e = J.useContext(On);
  return process.env.NODE_ENV !== "production" && J.useDebugValue(e), e;
}
const Ku = typeof Symbol == "function" && Symbol.for, Gu = Ku ? /* @__PURE__ */ Symbol.for("mui.nested") : "__THEME_NESTED__";
function Yu(e, t) {
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
function dr(e) {
  const {
    children: t,
    theme: r
  } = e, n = Rn();
  process.env.NODE_ENV !== "production" && n === null && typeof r == "function" && console.error(["MUI: You are providing a theme function prop to the ThemeProvider component:", "<ThemeProvider theme={outerTheme => outerTheme} />", "", "However, no outer theme is present.", "Make sure a theme is already injected higher in the React tree or provide a theme object."].join(`
`));
  const o = J.useMemo(() => {
    const i = n === null ? {
      ...r
    } : Yu(n, r);
    return i != null && (i[Gu] = n !== null), i;
  }, [r, n]);
  return /* @__PURE__ */ y(On.Provider, {
    value: o,
    children: t
  });
}
process.env.NODE_ENV !== "production" && (dr.propTypes = {
  /**
   * Your component tree.
   */
  children: U.node,
  /**
   * A theme object. You can provide a function to extend the outer theme.
   */
  theme: U.oneOfType([U.object, U.func]).isRequired
});
process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "production" && (dr.propTypes = Xi(dr.propTypes));
const Ju = /* @__PURE__ */ J.createContext();
function Zi({
  value: e,
  ...t
}) {
  return /* @__PURE__ */ y(Ju.Provider, {
    value: e ?? !0,
    ...t
  });
}
process.env.NODE_ENV !== "production" && (Zi.propTypes = {
  children: U.node,
  value: U.bool
});
const Xu = /* @__PURE__ */ J.createContext(void 0);
function Qi({
  value: e,
  children: t
}) {
  return /* @__PURE__ */ y(Xu.Provider, {
    value: e,
    children: t
  });
}
process.env.NODE_ENV !== "production" && (Qi.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * @ignore
   */
  children: U.node,
  /**
   * @ignore
   */
  value: U.object
});
let vo = 0;
function Zu(e) {
  const [t, r] = J.useState(e), n = e || t;
  return J.useEffect(() => {
    t == null && (vo += 1, r(`mui-${vo}`));
  }, [t]), n;
}
const Qu = {
  ...J
}, ko = Qu.useId;
function ed(e) {
  return ko !== void 0 ? ko() : Zu(e);
}
function td(e) {
  const t = Cn(), r = ed() || "", {
    modularCssLayers: n
  } = e;
  let o = "mui.global, mui.components, mui.theme, mui.custom, mui.sx";
  return !n || t !== null ? o = "" : typeof n == "string" ? o = n.replace(/mui(?!\.)/g, o) : o = `@layer ${o};`, Gi(() => {
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
  }, [o, r]), o ? /* @__PURE__ */ y(Ki, {
    styles: o
  }) : null;
}
const Po = {};
function No(e, t, r, n = !1) {
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
function Ft(e) {
  const {
    children: t,
    theme: r,
    themeId: n
  } = e, o = Cn(Po), i = Rn() || Po;
  process.env.NODE_ENV !== "production" && (o === null && typeof r == "function" || n && o && !o[n] && typeof r == "function") && console.error(["MUI: You are providing a theme function prop to the ThemeProvider component:", "<ThemeProvider theme={outerTheme => outerTheme} />", "", "However, no outer theme is present.", "Make sure a theme is already injected higher in the React tree or provide a theme object."].join(`
`));
  const s = No(n, o, r), a = No(n, i, r, !0), c = (n ? s[n] : s).direction === "rtl", u = td(s);
  return /* @__PURE__ */ y(dr, {
    theme: a,
    children: /* @__PURE__ */ y(Qo.Provider, {
      value: s,
      children: /* @__PURE__ */ y(Zi, {
        value: c,
        children: /* @__PURE__ */ z(Qi, {
          value: n ? s[n].components : s.components,
          children: [u, t]
        })
      })
    })
  });
}
process.env.NODE_ENV !== "production" && (Ft.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Your component tree.
   */
  children: U.node,
  /**
   * A theme object. You can provide a function to extend the outer theme.
   */
  theme: U.oneOfType([U.func, U.object]).isRequired,
  /**
   * The design system's unique id for getting the corresponded theme when there are multiple design systems.
   */
  themeId: U.string
});
process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "production" && (Ft.propTypes = Xi(Ft.propTypes));
const _n = "mode", An = "color-scheme", rd = "data-color-scheme";
function nd(e) {
  const {
    defaultMode: t = "system",
    defaultLightColorScheme: r = "light",
    defaultDarkColorScheme: n = "dark",
    modeStorageKey: o = _n,
    colorSchemeStorageKey: i = An,
    attribute: s = rd,
    colorSchemeNode: a = "document.documentElement",
    nonce: c
  } = e || {};
  let u = "", d = s;
  if (s === "class" && (d = ".%s"), s === "data" && (d = "[data-%s]"), d.startsWith(".")) {
    const m = d.substring(1);
    u += `${a}.classList.remove('${m}'.replace('%s', light), '${m}'.replace('%s', dark));
      ${a}.classList.add('${m}'.replace('%s', colorScheme));`;
  }
  const p = d.match(/\[([^[\]]+)\]/);
  if (p) {
    const [m, S] = p[1].split("=");
    S || (u += `${a}.removeAttribute('${m}'.replace('%s', light));
      ${a}.removeAttribute('${m}'.replace('%s', dark));`), u += `
      ${a}.setAttribute('${m}'.replace('%s', colorScheme), ${S ? `${S}.replace('%s', colorScheme)` : '""'});`;
  } else d !== ".%s" && (u += `${a}.setAttribute('${d}', colorScheme);`);
  return /* @__PURE__ */ y("script", {
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
function od() {
}
const id = ({
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
      return od;
    const n = (o) => {
      const i = o.newValue;
      o.key === e && r(i);
    };
    return t.addEventListener("storage", n), () => {
      t.removeEventListener("storage", n);
    };
  }
});
function Xr() {
}
function Io(e) {
  if (typeof window < "u" && typeof window.matchMedia == "function" && e === "system")
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function es(e, t) {
  if (e.mode === "light" || e.mode === "system" && e.systemMode === "light")
    return t("light");
  if (e.mode === "dark" || e.mode === "system" && e.systemMode === "dark")
    return t("dark");
}
function sd(e) {
  return es(e, (t) => {
    if (t === "light")
      return e.lightColorScheme;
    if (t === "dark")
      return e.darkColorScheme;
  });
}
function ad(e) {
  const {
    defaultMode: t = "light",
    defaultLightColorScheme: r,
    defaultDarkColorScheme: n,
    supportedColorSchemes: o = [],
    modeStorageKey: i = _n,
    colorSchemeStorageKey: s = An,
    storageWindow: a = typeof window > "u" ? void 0 : window,
    storageManager: c = id,
    noSsr: u = !1
  } = e, d = o.join(","), p = o.length > 1, m = J.useMemo(() => c?.({
    key: i,
    storageWindow: a
  }), [c, i, a]), S = J.useMemo(() => c?.({
    key: `${s}-light`,
    storageWindow: a
  }), [c, s, a]), b = J.useMemo(() => c?.({
    key: `${s}-dark`,
    storageWindow: a
  }), [c, s, a]), [h, w] = J.useState(() => {
    const H = m?.get(t) || t, F = S?.get(r) || r, M = b?.get(n) || n;
    return {
      mode: H,
      systemMode: Io(H),
      lightColorScheme: F,
      darkColorScheme: M
    };
  }), [g, x] = J.useState(u || !p);
  J.useEffect(() => {
    x(!0);
  }, []);
  const _ = sd(h), T = J.useCallback((H) => {
    w((F) => {
      if (H === F.mode)
        return F;
      const M = H ?? t;
      return m?.set(M), {
        ...F,
        mode: M,
        systemMode: Io(M)
      };
    });
  }, [m, t]), C = J.useCallback((H) => {
    H ? typeof H == "string" ? H && !d.includes(H) ? console.error(`\`${H}\` does not exist in \`theme.colorSchemes\`.`) : w((F) => {
      const M = {
        ...F
      };
      return es(F, (A) => {
        A === "light" && (S?.set(H), M.lightColorScheme = H), A === "dark" && (b?.set(H), M.darkColorScheme = H);
      }), M;
    }) : w((F) => {
      const M = {
        ...F
      }, A = H.light === null ? r : H.light, l = H.dark === null ? n : H.dark;
      return A && (d.includes(A) ? (M.lightColorScheme = A, S?.set(A)) : console.error(`\`${A}\` does not exist in \`theme.colorSchemes\`.`)), l && (d.includes(l) ? (M.darkColorScheme = l, b?.set(l)) : console.error(`\`${l}\` does not exist in \`theme.colorSchemes\`.`)), M;
    }) : w((F) => (S?.set(r), b?.set(n), {
      ...F,
      lightColorScheme: r,
      darkColorScheme: n
    }));
  }, [d, S, b, r, n]), I = J.useCallback((H) => {
    h.mode === "system" && w((F) => {
      const M = H?.matches ? "dark" : "light";
      return F.systemMode === M ? F : {
        ...F,
        systemMode: M
      };
    });
  }, [h.mode]), Y = J.useRef(I);
  return Y.current = I, J.useEffect(() => {
    if (typeof window.matchMedia != "function" || !p)
      return;
    const H = (...M) => Y.current(...M), F = window.matchMedia("(prefers-color-scheme: dark)");
    return F.addListener(H), H(F), () => {
      F.removeListener(H);
    };
  }, [p]), J.useEffect(() => {
    if (p) {
      const H = m?.subscribe((A) => {
        (!A || ["light", "dark", "system"].includes(A)) && T(A || t);
      }) || Xr, F = S?.subscribe((A) => {
        (!A || d.match(A)) && C({
          light: A
        });
      }) || Xr, M = b?.subscribe((A) => {
        (!A || d.match(A)) && C({
          dark: A
        });
      }) || Xr;
      return () => {
        H(), F(), M();
      };
    }
  }, [C, T, d, t, a, p, m, S, b]), {
    ...h,
    mode: g ? h.mode : void 0,
    systemMode: g ? h.systemMode : void 0,
    colorScheme: g ? _ : void 0,
    setMode: T,
    setColorScheme: C
  };
}
const cd = "*{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}";
function ld(e) {
  const {
    themeId: t,
    /**
     * This `theme` object needs to follow a certain structure to
     * be used correctly by the finel `CssVarsProvider`. It should have a
     * `colorSchemes` key with the light and dark (and any other) palette.
     * It should also ideally have a vars object created using `prepareCssVars`.
     */
    theme: r = {},
    modeStorageKey: n = _n,
    colorSchemeStorageKey: o = An,
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
  const d = () => J.useContext(u) || c, p = {}, m = {};
  function S(g) {
    const {
      children: x,
      theme: _,
      modeStorageKey: T = n,
      colorSchemeStorageKey: C = o,
      disableTransitionOnChange: I = i,
      storageManager: Y,
      storageWindow: H = typeof window > "u" ? void 0 : window,
      documentNode: F = typeof document > "u" ? void 0 : document,
      colorSchemeNode: M = typeof document > "u" ? void 0 : document.documentElement,
      disableNestedContext: A = !1,
      disableStyleSheetGeneration: l = !1,
      defaultMode: j = "system",
      forceThemeRerender: v = !1,
      noSsr: X
    } = g, Z = J.useRef(!1), ae = Rn(), pe = J.useContext(u), Le = !!pe && !A, R = J.useMemo(() => _ || (typeof r == "function" ? r() : r), [_]), P = R[t], $ = P || R, {
      colorSchemes: B = p,
      components: V = m,
      cssVarPrefix: G
    } = $, K = Object.keys(B).filter((xe) => !!B[xe]).join(","), O = J.useMemo(() => K.split(","), [K]), L = typeof s == "string" ? s : s.light, W = typeof s == "string" ? s : s.dark, Q = B[L] && B[W] ? j : B[$.defaultColorScheme]?.palette?.mode || $.palette?.mode, {
      mode: be,
      setMode: k,
      systemMode: le,
      lightColorScheme: Ee,
      darkColorScheme: Ge,
      colorScheme: Tt,
      setColorScheme: ve
    } = ad({
      supportedColorSchemes: O,
      defaultLightColorScheme: L,
      defaultDarkColorScheme: W,
      modeStorageKey: T,
      colorSchemeStorageKey: C,
      defaultMode: Q,
      storageManager: Y,
      storageWindow: H,
      noSsr: X
    });
    let q = be, oe = Tt;
    Le && (q = pe.mode, oe = pe.colorScheme), process.env.NODE_ENV !== "production" && v && !$.vars && console.warn(["MUI: The `forceThemeRerender` prop should only be used with CSS theme variables.", "Note that it will slow down the app when changing between modes, so only do this when you cannot find a better solution."].join(`
`));
    let Re = oe || $.defaultColorScheme;
    $.vars && !v && (Re = $.defaultColorScheme);
    const ke = J.useMemo(() => {
      const xe = $.generateThemeVars?.() || $.vars, he = {
        ...$,
        components: V,
        colorSchemes: B,
        cssVarPrefix: G,
        vars: xe
      };
      if (typeof he.generateSpacing == "function" && (he.spacing = he.generateSpacing()), Re) {
        const Pe = B[Re];
        Pe && typeof Pe == "object" && Object.keys(Pe).forEach((Me) => {
          Pe[Me] && typeof Pe[Me] == "object" ? he[Me] = {
            ...he[Me],
            ...Pe[Me]
          } : he[Me] = Pe[Me];
        });
      }
      return a ? a(he) : he;
    }, [$, Re, V, B, G]), Ye = $.colorSchemeSelector;
    Gi(() => {
      if (oe && M && Ye && Ye !== "media") {
        const xe = Ye;
        let he = Ye;
        if (xe === "class" && (he = ".%s"), xe === "data" && (he = "[data-%s]"), xe?.startsWith("data-") && !xe.includes("%s") && (he = `[${xe}="%s"]`), he.startsWith("."))
          M.classList.remove(...O.map((Pe) => he.substring(1).replace("%s", Pe))), M.classList.add(he.substring(1).replace("%s", oe));
        else {
          const Pe = he.replace("%s", oe).match(/\[([^\]]+)\]/);
          if (Pe) {
            const [Me, kr] = Pe[1].split("=");
            kr || O.forEach((ls) => {
              M.removeAttribute(Me.replace(oe, ls));
            }), M.setAttribute(Me, kr ? kr.replace(/"|'/g, "") : "");
          } else
            M.setAttribute(he, oe);
        }
      }
    }, [oe, Ye, M, O]), J.useEffect(() => {
      let xe;
      if (I && Z.current && F) {
        const he = F.createElement("style");
        he.appendChild(F.createTextNode(cd)), F.head.appendChild(he), window.getComputedStyle(F.body), xe = setTimeout(() => {
          F.head.removeChild(he);
        }, 1);
      }
      return () => {
        clearTimeout(xe);
      };
    }, [oe, I, F]), J.useEffect(() => (Z.current = !0, () => {
      Z.current = !1;
    }), []);
    const vr = J.useMemo(() => ({
      allColorSchemes: O,
      colorScheme: oe,
      darkColorScheme: Ge,
      lightColorScheme: Ee,
      mode: q,
      setColorScheme: ve,
      setMode: process.env.NODE_ENV === "production" ? k : (xe) => {
        ke.colorSchemeSelector === "media" && console.error(["MUI: The `setMode` function has no effect if `colorSchemeSelector` is `media` (`media` is the default value).", "To toggle the mode manually, please configure `colorSchemeSelector` to use a class or data attribute.", "To learn more, visit https://mui.com/material-ui/customization/css-theme-variables/configuration/#toggling-dark-mode-manually"].join(`
`)), k(xe);
      },
      systemMode: le
    }), [O, oe, Ge, Ee, q, ve, k, le, ke.colorSchemeSelector]);
    let Je = !0;
    (l || $.cssVariables === !1 || Le && ae?.cssVarPrefix === G) && (Je = !1);
    const Pn = /* @__PURE__ */ z(J.Fragment, {
      children: [/* @__PURE__ */ y(Ft, {
        themeId: P ? t : void 0,
        theme: ke,
        children: x
      }), Je && /* @__PURE__ */ y(En, {
        styles: ke.generateStyleSheets?.() || []
      })]
    });
    return Le ? Pn : /* @__PURE__ */ y(u.Provider, {
      value: vr,
      children: Pn
    });
  }
  process.env.NODE_ENV !== "production" && (S.propTypes = {
    /**
     * The component tree.
     */
    children: U.node,
    /**
     * The node used to attach the color-scheme attribute
     */
    colorSchemeNode: U.any,
    /**
     * localStorage key used to store `colorScheme`
     */
    colorSchemeStorageKey: U.string,
    /**
     * The default mode when the storage is empty,
     * require the theme to have `colorSchemes` with light and dark.
     */
    defaultMode: U.string,
    /**
     * If `true`, the provider creates its own context and generate stylesheet as if it is a root `CssVarsProvider`.
     */
    disableNestedContext: U.bool,
    /**
     * If `true`, the style sheet won't be generated.
     *
     * This is useful for controlling nested CssVarsProvider behavior.
     */
    disableStyleSheetGeneration: U.bool,
    /**
     * Disable CSS transitions when switching between modes or color schemes.
     */
    disableTransitionOnChange: U.bool,
    /**
     * The document to attach the attribute to.
     */
    documentNode: U.any,
    /**
     * If `true`, theme values are recalculated when the mode changes.
     */
    forceThemeRerender: U.bool,
    /**
     * The key in the local storage used to store current color scheme.
     */
    modeStorageKey: U.string,
    /**
     * If `true`, the mode will be the same value as the storage without an extra rerendering after the hydration.
     * You should use this option in conjunction with `InitColorSchemeScript` component.
     */
    noSsr: U.bool,
    /**
     * The storage manager to be used for storing the mode and color scheme
     * @default using `window.localStorage`
     */
    storageManager: U.func,
    /**
     * The window that attaches the 'storage' event listener.
     * @default window
     */
    storageWindow: U.any,
    /**
     * The calculated theme object that will be passed through context.
     */
    theme: U.object
  });
  const b = typeof s == "string" ? s : s.light, h = typeof s == "string" ? s : s.dark;
  return {
    CssVarsProvider: S,
    useColorScheme: d,
    getInitColorSchemeScript: (g) => nd({
      colorSchemeStorageKey: o,
      defaultLightColorScheme: b,
      defaultDarkColorScheme: h,
      modeStorageKey: n,
      ...g
    })
  };
}
function ud(e = "") {
  function t(...n) {
    if (!n.length)
      return "";
    const o = n[0];
    return typeof o == "string" && !o.match(/(#|\(|\)|(-?(\d*\.)?\d+)(px|em|%|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc))|^(-?(\d*\.)?\d+)$|(\d+ \d+ \d+)/) ? `, var(--${e ? `${e}-` : ""}${o}${t(...n.slice(1))})` : `, ${o}`;
  }
  return (n, ...o) => `var(--${e ? `${e}-` : ""}${n}${t(...o)})`;
}
const $o = (e, t, r, n = []) => {
  let o = e;
  t.forEach((i, s) => {
    s === t.length - 1 ? Array.isArray(o) ? o[Number(i)] = r : o && typeof o == "object" && (o[i] = r) : o && typeof o == "object" && (o[i] || (o[i] = n.includes(i) ? [] : {}), o = o[i]);
  });
}, dd = (e, t, r) => {
  function n(o, i = [], s = []) {
    Object.entries(o).forEach(([a, c]) => {
      (!r || r && !r([...i, a])) && c != null && (typeof c == "object" && Object.keys(c).length > 0 ? n(c, [...i, a], Array.isArray(c) ? [...s, a] : s) : t([...i, a], c, s));
    });
  }
  n(e);
}, fd = (e, t) => typeof t == "number" ? ["lineHeight", "fontWeight", "opacity", "zIndex"].some((n) => e.includes(n)) || e[e.length - 1].toLowerCase().includes("opacity") ? t : `${t}px` : t;
function Zr(e, t) {
  const {
    prefix: r,
    shouldSkipGeneratingVar: n
  } = t || {}, o = {}, i = {}, s = {};
  return dd(
    e,
    (a, c, u) => {
      if ((typeof c == "string" || typeof c == "number") && (!n || !n(a, c))) {
        const d = `--${r ? `${r}-` : ""}${a.join("-")}`, p = fd(a, c);
        Object.assign(o, {
          [d]: p
        }), $o(i, a, `var(${d})`, u), $o(s, a, `var(${d}, ${p})`, u);
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
function pd(e, t = {}) {
  const {
    getSelector: r = g,
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
    css: p,
    varsWithDefaults: m
  } = Zr(u, t);
  let S = m;
  const b = {}, {
    [c]: h,
    ...w
  } = s;
  if (Object.entries(w || {}).forEach(([T, C]) => {
    const {
      vars: I,
      css: Y,
      varsWithDefaults: H
    } = Zr(C, t);
    S = Ae(S, H), b[T] = {
      css: Y,
      vars: I
    };
  }), h) {
    const {
      css: T,
      vars: C,
      varsWithDefaults: I
    } = Zr(h, t);
    S = Ae(S, I), b[c] = {
      css: T,
      vars: C
    };
  }
  function g(T, C) {
    let I = o;
    if (o === "class" && (I = ".%s"), o === "data" && (I = "[data-%s]"), o?.startsWith("data-") && !o.includes("%s") && (I = `[${o}="%s"]`), T) {
      if (I === "media")
        return e.defaultColorScheme === T ? ":root" : {
          [`@media (prefers-color-scheme: ${s[T]?.palette?.mode || T})`]: {
            ":root": C
          }
        };
      if (I)
        return e.defaultColorScheme === T ? `:root, ${I.replace("%s", String(T))}` : I.replace("%s", String(T));
    }
    return ":root";
  }
  return {
    vars: S,
    generateThemeVars: () => {
      let T = {
        ...d
      };
      return Object.entries(b).forEach(([, {
        vars: C
      }]) => {
        T = Ae(T, C);
      }), T;
    },
    generateStyleSheets: () => {
      const T = [], C = e.defaultColorScheme || "light";
      function I(F, M) {
        Object.keys(M).length && T.push(typeof F == "string" ? {
          [F]: {
            ...M
          }
        } : F);
      }
      I(r(void 0, {
        ...p
      }), p);
      const {
        [C]: Y,
        ...H
      } = b;
      if (Y) {
        const {
          css: F
        } = Y, M = s[C]?.palette?.mode, A = !n && M ? {
          colorScheme: M,
          ...F
        } : {
          ...F
        };
        I(r(C, {
          ...A
        }), A);
      }
      return Object.entries(H).forEach(([F, {
        css: M
      }]) => {
        const A = s[F]?.palette?.mode, l = !n && A ? {
          colorScheme: A,
          ...M
        } : {
          ...M
        };
        I(r(F, {
          ...l
        }), l);
      }), i && T.push({
        ":root": {
          // use double underscore to indicate that these are private variables
          "--__l-threshold": "0.7",
          "--__l": "clamp(0, (l / var(--__l-threshold) - 1) * -infinity, 1)",
          "--__a": "clamp(0.87, (l / var(--__l-threshold) - 1) * -infinity, 1)"
          // 0.87 is the default alpha value for black text.
        }
      }), T;
    }
  };
}
function hd(e) {
  return function(r) {
    return e === "media" ? (process.env.NODE_ENV !== "production" && r !== "light" && r !== "dark" && console.error(`MUI: @media (prefers-color-scheme) supports only 'light' or 'dark', but receive '${r}'.`), `@media (prefers-color-scheme: ${r})`) : e ? e.startsWith("data-") && !e.includes("%s") ? `[${e}="${r}"] &` : e === "class" ? `.${r} &` : e === "data" ? `[data-${r}] &` : `${e.replace("%s", r)} &` : "&";
  };
}
const Bt = {
  black: "#000",
  white: "#fff"
}, md = {
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
}, ft = {
  50: "#f3e5f5",
  200: "#ce93d8",
  300: "#ba68c8",
  400: "#ab47bc",
  500: "#9c27b0",
  700: "#7b1fa2"
}, pt = {
  300: "#e57373",
  400: "#ef5350",
  500: "#f44336",
  700: "#d32f2f",
  800: "#c62828"
}, Rt = {
  300: "#ffb74d",
  400: "#ffa726",
  500: "#ff9800",
  700: "#f57c00",
  900: "#e65100"
}, ht = {
  50: "#e3f2fd",
  200: "#90caf9",
  400: "#42a5f5",
  700: "#1976d2",
  800: "#1565c0"
}, mt = {
  300: "#4fc3f7",
  400: "#29b6f6",
  500: "#03a9f4",
  700: "#0288d1",
  900: "#01579b"
}, gt = {
  300: "#81c784",
  400: "#66bb6a",
  500: "#4caf50",
  700: "#388e3c",
  800: "#2e7d32",
  900: "#1b5e20"
};
function ts() {
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
      paper: Bt.white,
      default: Bt.white
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
const rs = ts();
function ns() {
  return {
    text: {
      primary: Bt.white,
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
      active: Bt.white,
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
const an = ns();
function Do(e, t, r, n) {
  const o = n.light || n, i = n.dark || n * 1.5;
  e[t] || (e.hasOwnProperty(r) ? e[t] = e[r] : t === "light" ? e.light = Ar(e.main, o) : t === "dark" && (e.dark = _r(e.main, i)));
}
function Lo(e, t, r, n, o) {
  const i = o.light || o, s = o.dark || o * 1.5;
  t[r] || (t.hasOwnProperty(n) ? t[r] = t[n] : r === "light" ? t.light = `color-mix(in ${e}, ${t.main}, #fff ${(i * 100).toFixed(0)}%)` : r === "dark" && (t.dark = `color-mix(in ${e}, ${t.main}, #000 ${(s * 100).toFixed(0)}%)`));
}
function gd(e = "light") {
  return e === "dark" ? {
    main: ht[200],
    light: ht[50],
    dark: ht[400]
  } : {
    main: ht[700],
    light: ht[400],
    dark: ht[800]
  };
}
function yd(e = "light") {
  return e === "dark" ? {
    main: ft[200],
    light: ft[50],
    dark: ft[400]
  } : {
    main: ft[500],
    light: ft[300],
    dark: ft[700]
  };
}
function bd(e = "light") {
  return e === "dark" ? {
    main: pt[500],
    light: pt[300],
    dark: pt[700]
  } : {
    main: pt[700],
    light: pt[400],
    dark: pt[800]
  };
}
function Sd(e = "light") {
  return e === "dark" ? {
    main: mt[400],
    light: mt[300],
    dark: mt[700]
  } : {
    main: mt[700],
    light: mt[500],
    dark: mt[900]
  };
}
function Ed(e = "light") {
  return e === "dark" ? {
    main: gt[400],
    light: gt[300],
    dark: gt[700]
  } : {
    main: gt[800],
    light: gt[500],
    dark: gt[900]
  };
}
function wd(e = "light") {
  return e === "dark" ? {
    main: Rt[400],
    light: Rt[300],
    dark: Rt[700]
  } : {
    main: "#ed6c02",
    // closest to orange[800] that pass 3:1.
    light: Rt[500],
    dark: Rt[900]
  };
}
function Td(e) {
  return `oklch(from ${e} var(--__l) 0 h / var(--__a))`;
}
function vn(e) {
  const {
    mode: t = "light",
    contrastThreshold: r = 3,
    tonalOffset: n = 0.2,
    colorSpace: o,
    ...i
  } = e, s = e.primary || gd(t), a = e.secondary || yd(t), c = e.error || bd(t), u = e.info || Sd(t), d = e.success || Ed(t), p = e.warning || wd(t);
  function m(w) {
    if (o)
      return Td(w);
    const g = Ao(w, an.text.primary) >= r ? an.text.primary : rs.text.primary;
    if (process.env.NODE_ENV !== "production") {
      const x = Ao(w, g);
      x < 3 && console.error([`MUI: The contrast ratio of ${x}:1 for ${g} on ${w}`, "falls below the WCAG recommended absolute minimum contrast ratio of 3:1.", "https://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-contrast"].join(`
`));
    }
    return g;
  }
  const S = ({
    color: w,
    name: g,
    mainShade: x = 500,
    lightShade: _ = 300,
    darkShade: T = 700
  }) => {
    if (w = {
      ...w
    }, !w.main && w[x] && (w.main = w[x]), !w.hasOwnProperty("main"))
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The color${g ? ` (${g})` : ""} provided to augmentColor(color) is invalid.
The color object needs to have a \`main\` property or a \`${x}\` property.` : tt(11, g ? ` (${g})` : "", x));
    if (typeof w.main != "string")
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The color${g ? ` (${g})` : ""} provided to augmentColor(color) is invalid.
\`color.main\` should be a string, but \`${JSON.stringify(w.main)}\` was provided instead.

Did you intend to use one of the following approaches?

import { green } from "@mui/material/colors";

const theme1 = createTheme({ palette: {
  primary: green,
} });

const theme2 = createTheme({ palette: {
  primary: { main: green[500] },
} });` : tt(12, g ? ` (${g})` : "", JSON.stringify(w.main)));
    return o ? (Lo(o, w, "light", _, n), Lo(o, w, "dark", T, n)) : (Do(w, "light", _, n), Do(w, "dark", T, n)), w.contrastText || (w.contrastText = m(w.main)), w;
  };
  let b;
  return t === "light" ? b = ts() : t === "dark" && (b = ns()), process.env.NODE_ENV !== "production" && (b || console.error(`MUI: The palette mode \`${t}\` is not supported.`)), Ae({
    // A collection of common colors.
    common: {
      ...Bt
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
      color: p,
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
    grey: md,
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    contrastThreshold: r,
    // Takes a background color and returns the text color that maximizes the contrast.
    getContrastText: m,
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
function Cd(e) {
  const t = {};
  return Object.entries(e).forEach((n) => {
    const [o, i] = n;
    typeof i == "object" && (t[o] = `${i.fontStyle ? `${i.fontStyle} ` : ""}${i.fontVariant ? `${i.fontVariant} ` : ""}${i.fontWeight ? `${i.fontWeight} ` : ""}${i.fontStretch ? `${i.fontStretch} ` : ""}${i.fontSize || ""}${i.lineHeight ? `/${i.lineHeight} ` : ""}${i.fontFamily || ""}`);
  }), t;
}
function xd(e, t) {
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
function Od(e) {
  return Math.round(e * 1e5) / 1e5;
}
const Mo = {
  textTransform: "uppercase"
}, Fo = '"Roboto", "Helvetica", "Arial", sans-serif';
function os(e, t) {
  const {
    fontFamily: r = Fo,
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
    ...p
  } = typeof t == "function" ? t(e) : t;
  process.env.NODE_ENV !== "production" && (typeof n != "number" && console.error("MUI: `fontSize` is required to be a number."), typeof c != "number" && console.error("MUI: `htmlFontSize` is required to be a number."));
  const m = n / 14, S = d || ((w) => `${w / c * m}rem`), b = (w, g, x, _, T) => ({
    fontFamily: r,
    fontWeight: w,
    fontSize: S(g),
    // Unitless following https://meyerweb.com/eric/thoughts/2006/02/08/unitless-line-heights/
    lineHeight: x,
    // The letter spacing was designed for the Roboto font-family. Using the same letter-spacing
    // across font-families can cause issues with the kerning.
    ...r === Fo ? {
      letterSpacing: `${Od(_ / g)}em`
    } : {},
    ...T,
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
    button: b(s, 14, 1.75, 0.4, Mo),
    caption: b(i, 12, 1.66, 0.4),
    overline: b(i, 12, 2.66, 1, Mo),
    // TODO v6: Remove handling of 'inherit' variant from the theme as it is already handled in Material UI's Typography component. Also, remember to remove the associated types.
    inherit: {
      fontFamily: "inherit",
      fontWeight: "inherit",
      fontSize: "inherit",
      lineHeight: "inherit",
      letterSpacing: "inherit"
    }
  };
  return Ae({
    htmlFontSize: c,
    pxToRem: S,
    fontFamily: r,
    fontSize: n,
    fontWeightLight: o,
    fontWeightRegular: i,
    fontWeightMedium: s,
    fontWeightBold: a,
    ...h
  }, p, {
    clone: !1
    // No need to clone deep
  });
}
const Rd = 0.2, _d = 0.14, Ad = 0.12;
function ce(...e) {
  return [`${e[0]}px ${e[1]}px ${e[2]}px ${e[3]}px rgba(0,0,0,${Rd})`, `${e[4]}px ${e[5]}px ${e[6]}px ${e[7]}px rgba(0,0,0,${_d})`, `${e[8]}px ${e[9]}px ${e[10]}px ${e[11]}px rgba(0,0,0,${Ad})`].join(",");
}
const vd = ["none", ce(0, 2, 1, -1, 0, 1, 1, 0, 0, 1, 3, 0), ce(0, 3, 1, -2, 0, 2, 2, 0, 0, 1, 5, 0), ce(0, 3, 3, -2, 0, 3, 4, 0, 0, 1, 8, 0), ce(0, 2, 4, -1, 0, 4, 5, 0, 0, 1, 10, 0), ce(0, 3, 5, -1, 0, 5, 8, 0, 0, 1, 14, 0), ce(0, 3, 5, -1, 0, 6, 10, 0, 0, 1, 18, 0), ce(0, 4, 5, -2, 0, 7, 10, 1, 0, 2, 16, 1), ce(0, 5, 5, -3, 0, 8, 10, 1, 0, 3, 14, 2), ce(0, 5, 6, -3, 0, 9, 12, 1, 0, 3, 16, 2), ce(0, 6, 6, -3, 0, 10, 14, 1, 0, 4, 18, 3), ce(0, 6, 7, -4, 0, 11, 15, 1, 0, 4, 20, 3), ce(0, 7, 8, -4, 0, 12, 17, 2, 0, 5, 22, 4), ce(0, 7, 8, -4, 0, 13, 19, 2, 0, 5, 24, 4), ce(0, 7, 9, -4, 0, 14, 21, 2, 0, 5, 26, 4), ce(0, 8, 9, -5, 0, 15, 22, 2, 0, 6, 28, 5), ce(0, 8, 10, -5, 0, 16, 24, 2, 0, 6, 30, 5), ce(0, 8, 11, -5, 0, 17, 26, 2, 0, 6, 32, 5), ce(0, 9, 11, -5, 0, 18, 28, 2, 0, 7, 34, 6), ce(0, 9, 12, -6, 0, 19, 29, 2, 0, 7, 36, 6), ce(0, 10, 13, -6, 0, 20, 31, 3, 0, 8, 38, 7), ce(0, 10, 13, -6, 0, 21, 33, 3, 0, 8, 40, 7), ce(0, 10, 14, -6, 0, 22, 35, 3, 0, 8, 42, 7), ce(0, 11, 14, -7, 0, 23, 36, 3, 0, 9, 44, 8), ce(0, 11, 15, -7, 0, 24, 38, 3, 0, 9, 46, 8)], kd = {
  // This is the most common easing curve.
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  // Objects enter the screen at full velocity from off-screen and
  // slowly decelerate to a resting point.
  easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
  // Objects leave the screen at full velocity. They do not decelerate when off-screen.
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  // The sharp curve is used by objects that may return to the screen at any time.
  sharp: "cubic-bezier(0.4, 0, 0.6, 1)"
}, Pd = {
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
function Bo(e) {
  return `${Math.round(e)}ms`;
}
function Nd(e) {
  if (!e)
    return 0;
  const t = e / 36;
  return Math.min(Math.round((4 + 15 * t ** 0.25 + t / 5) * 10), 3e3);
}
function Id(e) {
  const t = {
    ...kd,
    ...e.easing
  }, r = {
    ...Pd,
    ...e.duration
  };
  return {
    getAutoHeightDuration: Nd,
    create: (o = ["all"], i = {}) => {
      const {
        duration: s = r.standard,
        easing: a = t.easeInOut,
        delay: c = 0,
        ...u
      } = i;
      if (process.env.NODE_ENV !== "production") {
        const d = (m) => typeof m == "string", p = (m) => !Number.isNaN(parseFloat(m));
        !d(o) && !Array.isArray(o) && console.error('MUI: Argument "props" must be a string or Array.'), !p(s) && !d(s) && console.error(`MUI: Argument "duration" must be a number or a string but found ${s}.`), d(a) || console.error('MUI: Argument "easing" must be a string.'), !p(c) && !d(c) && console.error('MUI: Argument "delay" must be a number or a string.'), typeof i != "object" && console.error(["MUI: Secong argument of transition.create must be an object.", "Arguments should be either `create('prop1', options)` or `create(['prop1', 'prop2'], options)`"].join(`
`)), Object.keys(u).length !== 0 && console.error(`MUI: Unrecognized argument(s) [${Object.keys(u).join(",")}].`);
      }
      return (Array.isArray(o) ? o : [o]).map((d) => `${d} ${typeof s == "string" ? s : Bo(s)} ${a} ${typeof c == "string" ? c : Bo(c)}`).join(",");
    },
    ...e,
    easing: t,
    duration: r
  };
}
const $d = {
  mobileStepper: 1e3,
  fab: 1050,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500
};
function Dd(e) {
  return Xe(e) || typeof e > "u" || typeof e == "string" || typeof e == "boolean" || typeof e == "number" || Array.isArray(e);
}
function is(e = {}) {
  const t = {
    ...e
  };
  function r(n) {
    const o = Object.entries(n);
    for (let i = 0; i < o.length; i++) {
      const [s, a] = o[i];
      !Dd(a) || s.startsWith("unstable_") ? delete n[s] : Xe(a) && (n[s] = {
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
function Uo(e) {
  return typeof e == "number" ? `${(e * 100).toFixed(0)}%` : `calc((${e}) * 100%)`;
}
const Ld = (e) => {
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
function Md(e) {
  Object.assign(e, {
    alpha(t, r) {
      const n = this || e;
      return n.colorSpace ? `oklch(from ${t} l c h / ${typeof r == "string" ? `calc(${r})` : r})` : n.vars ? `rgba(${t.replace(/var\(--([^,\s)]+)(?:,[^)]+)?\)+/g, "var(--$1Channel)")} / ${typeof r == "string" ? `calc(${r})` : r})` : Ji(t, Ld(r));
    },
    lighten(t, r) {
      const n = this || e;
      return n.colorSpace ? `color-mix(in ${n.colorSpace}, ${t}, #fff ${Uo(r)})` : Ar(t, r);
    },
    darken(t, r) {
      const n = this || e;
      return n.colorSpace ? `color-mix(in ${n.colorSpace}, ${t}, #000 ${Uo(r)})` : _r(t, r);
    }
  });
}
function cn(e = {}, ...t) {
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
    throw new Error(process.env.NODE_ENV !== "production" ? "MUI: `vars` is a private field used for CSS variables support.\nPlease use another name or follow the [docs](https://mui.com/material-ui/customization/css-theme-variables/usage/) to enable the feature." : tt(20));
  const p = vn({
    ...i,
    colorSpace: u
  }), m = zi(e);
  let S = Ae(m, {
    mixins: xd(m.breakpoints, n),
    palette: p,
    // Don't use [...shadows] until you've verified its transpiled code is not invoking the iterator protocol.
    shadows: vd.slice(),
    typography: os(p, a),
    transitions: Id(s),
    zIndex: {
      ...$d
    }
  });
  if (S = Ae(S, d), S = t.reduce((b, h) => Ae(b, h), S), process.env.NODE_ENV !== "production") {
    const b = ["active", "checked", "completed", "disabled", "error", "expanded", "focused", "focusVisible", "required", "selected"], h = (w, g) => {
      let x;
      for (x in w) {
        const _ = w[x];
        if (b.includes(x) && Object.keys(_).length > 0) {
          if (process.env.NODE_ENV !== "production") {
            const T = ju("", x);
            console.error([`MUI: The \`${g}\` component increases the CSS specificity of the \`${x}\` internal state.`, "You can not override it like this: ", JSON.stringify(w, null, 2), "", `Instead, you need to use the '&.${T}' syntax:`, JSON.stringify({
              root: {
                [`&.${T}`]: _
              }
            }, null, 2), "", "https://mui.com/r/state-classes-guide"].join(`
`));
          }
          w[x] = {};
        }
      }
    };
    Object.keys(S.components).forEach((w) => {
      const g = S.components[w].styleOverrides;
      g && w.startsWith("Mui") && h(g, w);
    });
  }
  return S.unstable_sxConfig = {
    ...Or,
    ...d?.unstable_sxConfig
  }, S.unstable_sx = function(h) {
    return Kt({
      sx: h,
      theme: this
    });
  }, S.toRuntimeSource = is, Md(S), S;
}
function Fd(e) {
  let t;
  return e < 1 ? t = 5.11916 * e ** 2 : t = 4.5 * Math.log(e + 1) + 2, Math.round(t * 10) / 1e3;
}
const Bd = [...Array(25)].map((e, t) => {
  if (t === 0)
    return "none";
  const r = Fd(t);
  return `linear-gradient(rgba(255 255 255 / ${r}), rgba(255 255 255 / ${r}))`;
});
function ss(e) {
  return {
    inputPlaceholder: e === "dark" ? 0.5 : 0.42,
    inputUnderline: e === "dark" ? 0.7 : 0.42,
    switchTrackDisabled: e === "dark" ? 0.2 : 0.12,
    switchTrack: e === "dark" ? 0.3 : 0.38
  };
}
function as(e) {
  return e === "dark" ? Bd : [];
}
function Ud(e) {
  const {
    palette: t = {
      mode: "light"
    },
    // need to cast to avoid module augmentation test
    opacity: r,
    overlays: n,
    colorSpace: o,
    ...i
  } = e, s = vn({
    ...t,
    colorSpace: o
  });
  return {
    palette: s,
    opacity: {
      ...ss(s.mode),
      ...r
    },
    overlays: n || as(s.mode),
    ...i
  };
}
function jd(e) {
  return !!e[0].match(/(cssVarPrefix|colorSchemeSelector|modularCssLayers|rootSelector|typography|mixins|breakpoints|direction|transitions)/) || !!e[0].match(/sxConfig$/) || // ends with sxConfig
  e[0] === "palette" && !!e[1]?.match(/(mode|contrastThreshold|tonalOffset)/);
}
const Hd = (e) => [...[...Array(25)].map((t, r) => `--${e ? `${e}-` : ""}overlays-${r}`), `--${e ? `${e}-` : ""}palette-AppBar-darkBg`, `--${e ? `${e}-` : ""}palette-AppBar-darkColor`], Vd = (e) => (t, r) => {
  const n = e.rootSelector || ":root", o = e.colorSchemeSelector;
  let i = o;
  if (o === "class" && (i = ".%s"), o === "data" && (i = "[data-%s]"), o?.startsWith("data-") && !o.includes("%s") && (i = `[${o}="%s"]`), e.defaultColorScheme === t) {
    if (t === "dark") {
      const s = {};
      return Hd(e.cssVarPrefix).forEach((a) => {
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
function Wd(e, t) {
  t.forEach((r) => {
    e[r] || (e[r] = {});
  });
}
function E(e, t, r) {
  !e[t] && r && (e[t] = r);
}
function kt(e) {
  return typeof e != "string" || !e.startsWith("hsl") ? e : Yi(e);
}
function He(e, t) {
  `${t}Channel` in e || (e[`${t}Channel`] = vt(kt(e[t]), `MUI: Can't create \`palette.${t}Channel\` because \`palette.${t}\` is not one of these formats: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().
To suppress this warning, you need to explicitly provide the \`palette.${t}Channel\` as a string (in rgb format, for example "12 12 12") or undefined if you want to remove the channel token.`));
}
function zd(e) {
  return typeof e == "number" ? `${e}px` : typeof e == "string" || typeof e == "function" || Array.isArray(e) ? e : "8px";
}
const Fe = (e) => {
  try {
    return e();
  } catch {
  }
}, qd = (e = "mui") => ud(e);
function Qr(e, t, r, n, o) {
  if (!r)
    return;
  r = r === !0 ? {} : r;
  const i = o === "dark" ? "dark" : "light";
  if (!n) {
    t[o] = Ud({
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
  } = cn({
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
      ...ss(i),
      ...r?.opacity
    },
    overlays: r?.overlays || as(i)
  }, a;
}
function Kd(e = {}, ...t) {
  const {
    colorSchemes: r = {
      light: !0
    },
    defaultColorScheme: n,
    disableCssColorScheme: o = !1,
    cssVarPrefix: i = "mui",
    nativeColor: s = !1,
    shouldSkipGeneratingVar: a = jd,
    colorSchemeSelector: c = r.light && r.dark ? "media" : void 0,
    rootSelector: u = ":root",
    ...d
  } = e, p = Object.keys(r)[0], m = n || (r.light && p !== "light" ? "light" : p), S = qd(i), {
    [m]: b,
    light: h,
    dark: w,
    ...g
  } = r, x = {
    ...g
  };
  let _ = b;
  if ((m === "dark" && !("dark" in r) || m === "light" && !("light" in r)) && (_ = !0), !_)
    throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The \`colorSchemes.${m}\` option is either missing or invalid.` : tt(21, m));
  let T;
  s && (T = "oklch");
  const C = Qr(T, x, _, d, m);
  h && !x.light && Qr(T, x, h, void 0, "light"), w && !x.dark && Qr(T, x, w, void 0, "dark");
  let I = {
    defaultColorScheme: m,
    ...C,
    cssVarPrefix: i,
    colorSchemeSelector: c,
    rootSelector: u,
    getCssVar: S,
    colorSchemes: x,
    font: {
      ...Cd(C.typography),
      ...C.font
    },
    spacing: zd(d.spacing)
  };
  Object.keys(I.colorSchemes).forEach((A) => {
    const l = I.colorSchemes[A].palette, j = (X) => {
      const Z = X.split("-"), ae = Z[1], pe = Z[2];
      return S(X, l[ae][pe]);
    };
    l.mode === "light" && (E(l.common, "background", "#fff"), E(l.common, "onBackground", "#000")), l.mode === "dark" && (E(l.common, "background", "#000"), E(l.common, "onBackground", "#fff"));
    function v(X, Z, ae) {
      if (T) {
        let pe;
        return X === ot && (pe = `transparent ${((1 - ae) * 100).toFixed(0)}%`), X === re && (pe = `#000 ${(ae * 100).toFixed(0)}%`), X === ne && (pe = `#fff ${(ae * 100).toFixed(0)}%`), `color-mix(in ${T}, ${Z}, ${pe})`;
      }
      return X(Z, ae);
    }
    if (Wd(l, ["Alert", "AppBar", "Avatar", "Button", "Chip", "FilledInput", "LinearProgress", "Skeleton", "Slider", "SnackbarContent", "SpeedDialAction", "StepConnector", "StepContent", "Switch", "TableCell", "Tooltip"]), l.mode === "light") {
      E(l.Alert, "errorColor", v(re, l.error.light, 0.6)), E(l.Alert, "infoColor", v(re, l.info.light, 0.6)), E(l.Alert, "successColor", v(re, l.success.light, 0.6)), E(l.Alert, "warningColor", v(re, l.warning.light, 0.6)), E(l.Alert, "errorFilledBg", j("palette-error-main")), E(l.Alert, "infoFilledBg", j("palette-info-main")), E(l.Alert, "successFilledBg", j("palette-success-main")), E(l.Alert, "warningFilledBg", j("palette-warning-main")), E(l.Alert, "errorFilledColor", Fe(() => l.getContrastText(l.error.main))), E(l.Alert, "infoFilledColor", Fe(() => l.getContrastText(l.info.main))), E(l.Alert, "successFilledColor", Fe(() => l.getContrastText(l.success.main))), E(l.Alert, "warningFilledColor", Fe(() => l.getContrastText(l.warning.main))), E(l.Alert, "errorStandardBg", v(ne, l.error.light, 0.9)), E(l.Alert, "infoStandardBg", v(ne, l.info.light, 0.9)), E(l.Alert, "successStandardBg", v(ne, l.success.light, 0.9)), E(l.Alert, "warningStandardBg", v(ne, l.warning.light, 0.9)), E(l.Alert, "errorIconColor", j("palette-error-main")), E(l.Alert, "infoIconColor", j("palette-info-main")), E(l.Alert, "successIconColor", j("palette-success-main")), E(l.Alert, "warningIconColor", j("palette-warning-main")), E(l.AppBar, "defaultBg", j("palette-grey-100")), E(l.Avatar, "defaultBg", j("palette-grey-400")), E(l.Button, "inheritContainedBg", j("palette-grey-300")), E(l.Button, "inheritContainedHoverBg", j("palette-grey-A100")), E(l.Chip, "defaultBorder", j("palette-grey-400")), E(l.Chip, "defaultAvatarColor", j("palette-grey-700")), E(l.Chip, "defaultIconColor", j("palette-grey-700")), E(l.FilledInput, "bg", "rgba(0, 0, 0, 0.06)"), E(l.FilledInput, "hoverBg", "rgba(0, 0, 0, 0.09)"), E(l.FilledInput, "disabledBg", "rgba(0, 0, 0, 0.12)"), E(l.LinearProgress, "primaryBg", v(ne, l.primary.main, 0.62)), E(l.LinearProgress, "secondaryBg", v(ne, l.secondary.main, 0.62)), E(l.LinearProgress, "errorBg", v(ne, l.error.main, 0.62)), E(l.LinearProgress, "infoBg", v(ne, l.info.main, 0.62)), E(l.LinearProgress, "successBg", v(ne, l.success.main, 0.62)), E(l.LinearProgress, "warningBg", v(ne, l.warning.main, 0.62)), E(l.Skeleton, "bg", T ? v(ot, l.text.primary, 0.11) : `rgba(${j("palette-text-primaryChannel")} / 0.11)`), E(l.Slider, "primaryTrack", v(ne, l.primary.main, 0.62)), E(l.Slider, "secondaryTrack", v(ne, l.secondary.main, 0.62)), E(l.Slider, "errorTrack", v(ne, l.error.main, 0.62)), E(l.Slider, "infoTrack", v(ne, l.info.main, 0.62)), E(l.Slider, "successTrack", v(ne, l.success.main, 0.62)), E(l.Slider, "warningTrack", v(ne, l.warning.main, 0.62));
      const X = T ? v(re, l.background.default, 0.6825) : Qt(l.background.default, 0.8);
      E(l.SnackbarContent, "bg", X), E(l.SnackbarContent, "color", Fe(() => T ? an.text.primary : l.getContrastText(X))), E(l.SpeedDialAction, "fabHoverBg", Qt(l.background.paper, 0.15)), E(l.StepConnector, "border", j("palette-grey-400")), E(l.StepContent, "border", j("palette-grey-400")), E(l.Switch, "defaultColor", j("palette-common-white")), E(l.Switch, "defaultDisabledColor", j("palette-grey-100")), E(l.Switch, "primaryDisabledColor", v(ne, l.primary.main, 0.62)), E(l.Switch, "secondaryDisabledColor", v(ne, l.secondary.main, 0.62)), E(l.Switch, "errorDisabledColor", v(ne, l.error.main, 0.62)), E(l.Switch, "infoDisabledColor", v(ne, l.info.main, 0.62)), E(l.Switch, "successDisabledColor", v(ne, l.success.main, 0.62)), E(l.Switch, "warningDisabledColor", v(ne, l.warning.main, 0.62)), E(l.TableCell, "border", v(ne, v(ot, l.divider, 1), 0.88)), E(l.Tooltip, "bg", v(ot, l.grey[700], 0.92));
    }
    if (l.mode === "dark") {
      E(l.Alert, "errorColor", v(ne, l.error.light, 0.6)), E(l.Alert, "infoColor", v(ne, l.info.light, 0.6)), E(l.Alert, "successColor", v(ne, l.success.light, 0.6)), E(l.Alert, "warningColor", v(ne, l.warning.light, 0.6)), E(l.Alert, "errorFilledBg", j("palette-error-dark")), E(l.Alert, "infoFilledBg", j("palette-info-dark")), E(l.Alert, "successFilledBg", j("palette-success-dark")), E(l.Alert, "warningFilledBg", j("palette-warning-dark")), E(l.Alert, "errorFilledColor", Fe(() => l.getContrastText(l.error.dark))), E(l.Alert, "infoFilledColor", Fe(() => l.getContrastText(l.info.dark))), E(l.Alert, "successFilledColor", Fe(() => l.getContrastText(l.success.dark))), E(l.Alert, "warningFilledColor", Fe(() => l.getContrastText(l.warning.dark))), E(l.Alert, "errorStandardBg", v(re, l.error.light, 0.9)), E(l.Alert, "infoStandardBg", v(re, l.info.light, 0.9)), E(l.Alert, "successStandardBg", v(re, l.success.light, 0.9)), E(l.Alert, "warningStandardBg", v(re, l.warning.light, 0.9)), E(l.Alert, "errorIconColor", j("palette-error-main")), E(l.Alert, "infoIconColor", j("palette-info-main")), E(l.Alert, "successIconColor", j("palette-success-main")), E(l.Alert, "warningIconColor", j("palette-warning-main")), E(l.AppBar, "defaultBg", j("palette-grey-900")), E(l.AppBar, "darkBg", j("palette-background-paper")), E(l.AppBar, "darkColor", j("palette-text-primary")), E(l.Avatar, "defaultBg", j("palette-grey-600")), E(l.Button, "inheritContainedBg", j("palette-grey-800")), E(l.Button, "inheritContainedHoverBg", j("palette-grey-700")), E(l.Chip, "defaultBorder", j("palette-grey-700")), E(l.Chip, "defaultAvatarColor", j("palette-grey-300")), E(l.Chip, "defaultIconColor", j("palette-grey-300")), E(l.FilledInput, "bg", "rgba(255, 255, 255, 0.09)"), E(l.FilledInput, "hoverBg", "rgba(255, 255, 255, 0.13)"), E(l.FilledInput, "disabledBg", "rgba(255, 255, 255, 0.12)"), E(l.LinearProgress, "primaryBg", v(re, l.primary.main, 0.5)), E(l.LinearProgress, "secondaryBg", v(re, l.secondary.main, 0.5)), E(l.LinearProgress, "errorBg", v(re, l.error.main, 0.5)), E(l.LinearProgress, "infoBg", v(re, l.info.main, 0.5)), E(l.LinearProgress, "successBg", v(re, l.success.main, 0.5)), E(l.LinearProgress, "warningBg", v(re, l.warning.main, 0.5)), E(l.Skeleton, "bg", T ? v(ot, l.text.primary, 0.13) : `rgba(${j("palette-text-primaryChannel")} / 0.13)`), E(l.Slider, "primaryTrack", v(re, l.primary.main, 0.5)), E(l.Slider, "secondaryTrack", v(re, l.secondary.main, 0.5)), E(l.Slider, "errorTrack", v(re, l.error.main, 0.5)), E(l.Slider, "infoTrack", v(re, l.info.main, 0.5)), E(l.Slider, "successTrack", v(re, l.success.main, 0.5)), E(l.Slider, "warningTrack", v(re, l.warning.main, 0.5));
      const X = T ? v(ne, l.background.default, 0.985) : Qt(l.background.default, 0.98);
      E(l.SnackbarContent, "bg", X), E(l.SnackbarContent, "color", Fe(() => T ? rs.text.primary : l.getContrastText(X))), E(l.SpeedDialAction, "fabHoverBg", Qt(l.background.paper, 0.15)), E(l.StepConnector, "border", j("palette-grey-600")), E(l.StepContent, "border", j("palette-grey-600")), E(l.Switch, "defaultColor", j("palette-grey-300")), E(l.Switch, "defaultDisabledColor", j("palette-grey-600")), E(l.Switch, "primaryDisabledColor", v(re, l.primary.main, 0.55)), E(l.Switch, "secondaryDisabledColor", v(re, l.secondary.main, 0.55)), E(l.Switch, "errorDisabledColor", v(re, l.error.main, 0.55)), E(l.Switch, "infoDisabledColor", v(re, l.info.main, 0.55)), E(l.Switch, "successDisabledColor", v(re, l.success.main, 0.55)), E(l.Switch, "warningDisabledColor", v(re, l.warning.main, 0.55)), E(l.TableCell, "border", v(re, v(ot, l.divider, 1), 0.68)), E(l.Tooltip, "bg", v(ot, l.grey[700], 0.92));
    }
    He(l.background, "default"), He(l.background, "paper"), He(l.common, "background"), He(l.common, "onBackground"), He(l, "divider"), Object.keys(l).forEach((X) => {
      const Z = l[X];
      X !== "tonalOffset" && Z && typeof Z == "object" && (Z.main && E(l[X], "mainChannel", vt(kt(Z.main))), Z.light && E(l[X], "lightChannel", vt(kt(Z.light))), Z.dark && E(l[X], "darkChannel", vt(kt(Z.dark))), Z.contrastText && E(l[X], "contrastTextChannel", vt(kt(Z.contrastText))), X === "text" && (He(l[X], "primary"), He(l[X], "secondary")), X === "action" && (Z.active && He(l[X], "active"), Z.selected && He(l[X], "selected")));
    });
  }), I = t.reduce((A, l) => Ae(A, l), I);
  const Y = {
    prefix: i,
    disableCssColorScheme: o,
    shouldSkipGeneratingVar: a,
    getSelector: Vd(I),
    enableContrastVars: s
  }, {
    vars: H,
    generateThemeVars: F,
    generateStyleSheets: M
  } = pd(I, Y);
  return I.vars = H, Object.entries(I.colorSchemes[I.defaultColorScheme]).forEach(([A, l]) => {
    I[A] = l;
  }), I.generateThemeVars = F, I.generateStyleSheets = M, I.generateSpacing = function() {
    return Wi(d.spacing, wn(this));
  }, I.getColorSchemeSelector = hd(c), I.spacing = I.generateSpacing(), I.shouldSkipGeneratingVar = a, I.unstable_sxConfig = {
    ...Or,
    ...d?.unstable_sxConfig
  }, I.unstable_sx = function(l) {
    return Kt({
      sx: l,
      theme: this
    });
  }, I.toRuntimeSource = is, I;
}
function jo(e, t, r) {
  e.colorSchemes && r && (e.colorSchemes[t] = {
    ...r !== !0 && r,
    palette: vn({
      ...r === !0 ? {} : r.palette,
      mode: t
    })
    // cast type to skip module augmentation test
  });
}
function kn(e = {}, ...t) {
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
      return cn(e, ...t);
    let d = r;
    "palette" in e || u[a] && (u[a] !== !0 ? d = u[a].palette : a === "dark" && (d = {
      mode: "dark"
    }));
    const p = cn({
      ...e,
      palette: d
    }, ...t);
    return p.defaultColorScheme = a, p.colorSchemes = u, p.palette.mode === "light" && (p.colorSchemes.light = {
      ...u.light !== !0 && u.light,
      palette: p.palette
    }, jo(p, "dark", u.dark)), p.palette.mode === "dark" && (p.colorSchemes.dark = {
      ...u.dark !== !0 && u.dark,
      palette: p.palette
    }, jo(p, "light", u.light)), p;
  }
  return !r && !("light" in u) && a === "light" && (u.light = !0), Kd({
    ...s,
    colorSchemes: u,
    defaultColorScheme: a,
    ...typeof n != "boolean" && n
  }, ...t);
}
const Gd = kn();
function Yd() {
  const e = qi(Gd);
  return process.env.NODE_ENV !== "production" && J.useDebugValue(e), e[at] || e;
}
function Jd({
  theme: e,
  ...t
}) {
  const r = at in e ? e[at] : void 0;
  return /* @__PURE__ */ y(Ft, {
    ...t,
    themeId: r ? at : void 0,
    theme: r || e
  });
}
const er = {
  colorSchemeStorageKey: "mui-color-scheme",
  defaultLightColorScheme: "light",
  defaultDarkColorScheme: "dark",
  modeStorageKey: "mui-mode"
};
process.env.NODE_ENV !== "production" && (U.string, U.string, U.string, U.string, U.string, U.oneOf(["dark", "light", "system"]), U.string, U.string);
const {
  CssVarsProvider: Xd
} = ld({
  themeId: at,
  // @ts-ignore ignore module augmentation tests
  theme: () => kn({
    cssVariables: !0
  }),
  colorSchemeStorageKey: er.colorSchemeStorageKey,
  modeStorageKey: er.modeStorageKey,
  defaultColorScheme: {
    light: er.defaultLightColorScheme,
    dark: er.defaultDarkColorScheme
  },
  resolveTheme: (e) => {
    const t = {
      ...e,
      typography: os(e.palette, e.typography)
    };
    return t.unstable_sx = function(n) {
      return Kt({
        sx: n,
        theme: this
      });
    }, t;
  }
}), Zd = Xd;
function Qd({
  theme: e,
  ...t
}) {
  const r = J.useMemo(() => {
    if (typeof e == "function")
      return e;
    const n = at in e ? e[at] : e;
    return "colorSchemes" in n ? null : "vars" in n ? e : {
      ...e,
      vars: null
    };
  }, [e]);
  return r ? /* @__PURE__ */ y(Jd, {
    theme: r,
    ...t
  }) : /* @__PURE__ */ y(Zd, {
    theme: e,
    ...t
  });
}
const ef = kn({ spacing: 8 }).spacing, tf = 1760, rf = 1120, Ho = ({
  weight: e,
  minHeight: t,
  minHeightShort: r
}) => /* @__PURE__ */ y(
  D,
  {
    "aria-hidden": !0,
    sx: {
      flex: `${e} 1 0px`,
      minHeight: t,
      [Qe]: { minHeight: r }
    }
  }
), Vo = ({
  theme: e,
  children: t,
  footer: r,
  hero: n,
  mobileHero: o
}) => {
  const i = Pt.Children.toArray(t), s = Yd(), a = ds(
    () => ({ ...s, spacing: ef }),
    [s]
  );
  return (
    // Own spacing unit, so the layout looks the same in every host app.
    // Full-width page background; the layout inside is capped and centred on wide screens
    /* @__PURE__ */ y(Qd, { theme: a, children: /* @__PURE__ */ y(
      D,
      {
        sx: {
          minHeight: "100vh",
          backgroundColor: e.pageBg,
          transition: fe,
          // Desktop: centres the capped layout vertically on very tall screens
          display: { md: "flex" },
          alignItems: "center",
          ...qs
        },
        children: /* @__PURE__ */ z(
          D,
          {
            sx: {
              // Beyond this the hero would blow its artwork and headline up past their
              // designed size; at 1760px the dashboards show at about 1x
              maxWidth: tf,
              width: "100%",
              mx: "auto",
              minHeight: { xs: "100vh", md: 0 },
              // Desktop: one screen tall, so the page itself never scrolls (no jump on reload,
              // no flash while fonts load), capped so very tall screens do not stretch the hero
              // into an empty band; the sign-in panel scrolls inside if it must
              height: { md: `min(100vh, ${rf}px)` },
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
              transition: fe,
              "& *, & *::before, & *::after": { boxSizing: "border-box" }
            },
            children: [
              /* @__PURE__ */ y(
                D,
                {
                  component: "main",
                  sx: {
                    display: "flex",
                    justifyContent: "center",
                    px: { xs: 3, sm: 6 },
                    // Extra room above the logo
                    pt: { xs: 5, sm: 7 },
                    pb: { xs: 4, sm: 5 },
                    [Qe]: { pt: 4.5, pb: 2.25 },
                    // Scrolls on its own beside the hero; on phones the page scrolls as usual
                    overflowY: { md: "auto" },
                    overflowX: "clip",
                    // When an error or validation line overflows a laptop-height panel: a thin,
                    // quiet scrollbar. Its space is not reserved, which would narrow the panel
                    // all the time on Windows just to avoid a reflow while an error shows.
                    scrollbarWidth: "thin",
                    scrollbarColor: `${e.border} transparent`
                  },
                  children: /* @__PURE__ */ z(
                    D,
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
                        i.map((c, u) => /* @__PURE__ */ z(
                          Pt.Fragment,
                          {
                            children: [
                              u > 0 && /* @__PURE__ */ y(
                                Ho,
                                {
                                  weight: 1,
                                  minHeight: 18,
                                  minHeightShort: 8
                                }
                              ),
                              /* @__PURE__ */ z(
                                D,
                                {
                                  sx: {
                                    display: "flex",
                                    flexDirection: "column",
                                    animation: Ve(u * 50)
                                  },
                                  children: [
                                    c,
                                    u === 0 && o && /* @__PURE__ */ y(
                                      D,
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
                          Pt.isValidElement(c) ? c.key : u
                        )),
                        /* @__PURE__ */ y(Ho, { weight: 3, minHeight: 40, minHeightShort: 24 }),
                        /* @__PURE__ */ y(
                          D,
                          {
                            sx: {
                              animation: Ve(i.length * 50)
                            },
                            children: r
                          }
                        )
                      ]
                    }
                  )
                }
              ),
              /* @__PURE__ */ y(
                D,
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
    ) })
  );
}, _t = (e) => `var(--mark-primary, ${e})`, Wo = "var(--mark-secondary, #3D4C5E)", nf = (e) => `var(--mark-center, ${e})`, of = "var(--mark-ring, #ffffff)", cs = ({
  platform: e,
  sx: t,
  ...r
}) => {
  const n = {
    ...r,
    sx: [
      { "& *": { transition: oi } },
      ...Array.isArray(t) ? t : [t]
    ]
  };
  if (e === "centra") {
    const s = { fill: _t("#049586") };
    return /* @__PURE__ */ z(yt, { ...n, viewBox: "0 0 30 30", children: [
      /* @__PURE__ */ y(
        "path",
        {
          style: s,
          d: "M5.60529 3.14542C4.00282 4.40644 2.68044 5.98728 1.72234 7.78732C0.764232 9.58735 0.191389 11.5671 0.0402716 13.6007C-0.110846 15.6342 0.163072 17.6769 0.844589 19.5988C1.52611 21.5207 2.60029 23.2796 3.99877 24.7637L7.18245 21.7635C6.20044 20.7214 5.44614 19.4863 4.96758 18.1368C4.48902 16.7872 4.29667 15.3528 4.40279 13.9249C4.5089 12.4969 4.91115 11.1067 5.58393 9.84273C6.25672 8.57874 7.18529 7.46868 8.31054 6.58319L5.60529 3.14542Z"
        }
      ),
      /* @__PURE__ */ y(
        "path",
        {
          style: { fill: Wo },
          d: "M27.6715 7.81562C25.8485 4.37255 22.7324 1.79469 19.0087 0.649137C15.2851 -0.496418 11.2588 -0.115827 7.81575 1.70718L9.86273 5.57326C12.2805 4.29314 15.1077 4.02589 17.7225 4.8303C20.3372 5.63471 22.5253 7.44488 23.8055 9.86261L27.6715 7.81562Z"
        }
      ),
      /* @__PURE__ */ y(
        "path",
        {
          style: { fill: Wo },
          d: "M5.52492 3.20912C3.27824 5.00262 1.60718 7.41593 0.718835 10.15L4.87928 11.5018C5.50308 9.58194 6.67649 7.88731 8.25411 6.62792L5.52492 3.20912Z"
        }
      ),
      /* @__PURE__ */ y(
        "path",
        {
          style: s,
          d: "M5.89004 26.4517C7.43504 27.6075 9.19261 28.4476 11.0624 28.924C12.9321 29.4004 14.8774 29.5038 16.7871 29.2283C18.6968 28.9528 20.5336 28.3037 22.1924 27.3182C23.8512 26.3327 25.2996 25.03 26.4549 23.4846L22.9511 20.8653C22.1399 21.9505 21.1228 22.8653 19.958 23.5573C18.7932 24.2493 17.5034 24.7051 16.1624 24.8986C14.8214 25.0921 13.4554 25.0195 12.1425 24.6849C10.8296 24.3504 9.5954 23.7605 8.5105 22.9488L5.89004 26.4517Z"
        }
      ),
      /* @__PURE__ */ y(
        "rect",
        {
          style: s,
          x: "18.9181",
          y: "13.7375",
          width: "10.4612",
          height: "2.44368"
        }
      ),
      /* @__PURE__ */ y(
        "path",
        {
          style: s,
          d: "M14.6851 9.76587C17.5534 9.76607 19.8784 12.0918 19.8784 14.9602C19.8782 17.8285 17.5533 20.1534 14.6851 20.1536C11.8166 20.1536 9.49092 17.8286 9.49072 14.9602C9.49072 12.0917 11.8165 9.76587 14.6851 9.76587ZM14.689 11.3313C12.6824 11.3314 11.0554 12.9576 11.0552 14.9641C11.0552 16.9708 12.6823 18.5978 14.689 18.5979C16.6957 18.5979 18.3228 16.9708 18.3228 14.9641C18.3226 12.9575 16.6956 11.3313 14.689 11.3313Z"
        }
      )
    ] });
  }
  if (e === "xpdite") {
    const s = { fill: _t("#0F62B0") };
    return /* @__PURE__ */ z(yt, { ...n, viewBox: "0 0 30 30", children: [
      /* @__PURE__ */ y(
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
      /* @__PURE__ */ y(
        "rect",
        {
          style: s,
          width: "25.3429",
          height: "2.05928",
          transform: "matrix(-0.73373 0.679441 0.679441 0.73373 22.6707 5.96777)"
        }
      ),
      /* @__PURE__ */ y("circle", { style: s, cx: "24.063", cy: "24.9252", r: "3.42298" }),
      /* @__PURE__ */ y("circle", { style: s, cx: "4.44975", cy: "24.9252", r: "3.42298" }),
      /* @__PURE__ */ y("circle", { style: s, cx: "4.44975", cy: "4.45204", r: "3.42298" }),
      /* @__PURE__ */ y(
        "circle",
        {
          style: { fill: nf("#0F62B0"), stroke: of },
          cx: "14.1725",
          cy: "14.5849",
          r: "3.18086",
          strokeWidth: "1.33541"
        }
      ),
      /* @__PURE__ */ y(
        "circle",
        {
          style: { fill: "none", stroke: _t("#0F62B0") },
          cx: "3.42298",
          cy: "3.42298",
          r: "2.75528",
          strokeWidth: "1.33541",
          transform: "matrix(-0.982613 -0.185667 -0.185667 0.982613 29.7455 2.17871)"
        }
      )
    ] });
  }
  const o = { fill: _t("#03463F") }, i = { fill: "none", stroke: _t("#03463F") };
  return /* @__PURE__ */ z(yt, { ...n, viewBox: "0 0 30 30", children: [
    /* @__PURE__ */ y(
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
    /* @__PURE__ */ y(
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
    /* @__PURE__ */ y(
      "path",
      {
        style: i,
        strokeWidth: "1.33541",
        d: "M8.99036 16.9846V21.3899L5.1759 23.592L1.36145 21.3899V16.9846L5.1759 14.7825L8.99036 16.9846Z"
      }
    ),
    /* @__PURE__ */ y(
      "path",
      {
        style: i,
        strokeWidth: "1.33541",
        d: "M27.9268 17.259V21.6643L24.1123 23.8665L20.2979 21.6643V17.259L24.1123 15.0569L27.9268 17.259Z"
      }
    ),
    /* @__PURE__ */ y(
      "path",
      {
        style: o,
        d: "M14.7128 4.64917L19.195 7.237V12.4127L14.7128 15.0005L10.2305 12.4127V7.237L14.7128 4.64917Z"
      }
    )
  ] });
}, sf = ({
  theme: e,
  value: t,
  platformAssets: r,
  disabled: n = !1,
  onChange: o
}) => {
  const i = e.mode === "dark", s = Zo(0), a = ze.findIndex((u) => u.id === t);
  a >= 0 && (s.current = a);
  const c = ze[s.current];
  return /* @__PURE__ */ z(D, { children: [
    /* @__PURE__ */ y(
      D,
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
    /* @__PURE__ */ z(
      D,
      {
        sx: {
          position: "relative",
          p: 1,
          borderRadius: "12px",
          backgroundColor: e.surface,
          boxShadow: i ? "none" : Us,
          border: `1px solid ${i ? e.border : "transparent"}`,
          transition: fe
        },
        children: [
          /* @__PURE__ */ y(
            D,
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
                transition: `transform ${dn}ms ${bt}, opacity 200ms ease, ${fe}`
              }
            }
          ),
          /* @__PURE__ */ y(
            gs,
            {
              exclusive: !0,
              fullWidth: !0,
              value: t,
              disabled: n,
              "aria-labelledby": "lumora-platform-label",
              onChange: (u, d) => d && o(d),
              sx: { position: "relative", gap: 0.5 },
              children: ze.map((u) => {
                const d = i ? u.colorOnDark : u.uiColor, p = r?.[u.id]?.logo;
                return /* @__PURE__ */ z(
                  ys,
                  {
                    value: u.id,
                    disableRipple: !0,
                    sx: {
                      flex: 1,
                      gap: 0.75,
                      ...Dt,
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
                      transition: `background-color 150ms, ${fr("color")}`,
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
                      p ?? /* @__PURE__ */ y(cs, { platform: u.id }),
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
}, At = ({
  width: e,
  height: t = 6
}) => /* @__PURE__ */ y(
  D,
  {
    sx: {
      width: e,
      height: t,
      borderRadius: 1,
      backgroundColor: "rgba(18, 51, 45, 0.09)"
    }
  }
), zo = ({
  title: e,
  barColor: t,
  screenshot: r,
  compact: n = !1,
  sx: o
}) => {
  const i = n ? 22 : 40, s = n ? 6 : 12;
  return r ? /* @__PURE__ */ y(
    D,
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
  ) : /* @__PURE__ */ z(
    D,
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
        /* @__PURE__ */ y(
          D,
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
            children: [0, 1, 2].map((a) => /* @__PURE__ */ y(
              D,
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
        /* @__PURE__ */ y(D, { sx: { flex: 1, minHeight: 0, position: "relative", backgroundColor: "#f7f9f9" }, children: /* @__PURE__ */ z(
          D,
          {
            "data-testid": "screenshot-placeholder",
            sx: { p: n ? 1.25 : 3.5, display: "flex", flexDirection: "column", gap: n ? 1 : 2 },
            children: [
              /* @__PURE__ */ z(D, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
                /* @__PURE__ */ y(
                  D,
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
                /* @__PURE__ */ y(
                  D,
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
              /* @__PURE__ */ y(At, { width: "22%", height: n ? 4 : 6 }),
              /* @__PURE__ */ y(
                D,
                {
                  sx: {
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: n ? 0.75 : 2,
                    mt: n ? 0.5 : 1
                  },
                  children: Array.from({ length: 6 }).map((a, c) => /* @__PURE__ */ z(
                    D,
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
                        /* @__PURE__ */ y(At, { width: "70%", height: n ? 4 : 7 }),
                        /* @__PURE__ */ y(At, { width: "45%", height: n ? 3 : 5 }),
                        /* @__PURE__ */ y(At, { width: "85%", height: n ? 3 : 5 }),
                        /* @__PURE__ */ y(At, { width: "60%", height: n ? 3 : 5 })
                      ]
                    },
                    c
                  ))
                }
              ),
              !n && /* @__PURE__ */ z(
                D,
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
}, af = 200, qo = "clamp(1.25rem, 5.6vw, 1.6rem)", Ko = {
  m: 0,
  fontWeight: 600,
  fontSize: "clamp(2.25rem, 4vw, 4.25rem)",
  lineHeight: 1.08,
  letterSpacing: "-0.02em"
}, Go = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.16em",
  textTransform: "uppercase"
}, en = {}, cf = (e, t) => {
  const [, r] = Ie(0), n = e.join(",");
  return We(() => {
    let o = !1;
    return e.forEach((i) => {
      t?.[i]?.screenshot || en[i] || Nt(i).loadScreenshot().then((s) => {
        en[i] = s, o || r((a) => a + 1);
      }).catch(() => {
      });
    }), () => {
      o = !0;
    };
  }, [n, t]), Object.fromEntries(
    e.map((o) => [
      o,
      t?.[o]?.screenshot ?? en[o]
    ])
  );
}, lf = "74.6%", uf = {
  polymer: "28.1%",
  xpdite: "11.7%",
  centra: "-4.9%"
}, Yo = 2.177, df = {
  polymer: { left: "40%", top: "8%", width: "56%" },
  xpdite: { left: "20%", top: "18%", width: "52%" },
  centra: { left: "0%", top: "30%", width: "56%" }
}, Jo = ({
  theme: e,
  platform: t,
  platformAssets: r,
  compact: n = !1
}) => {
  const o = t ? Nt(t) : null, i = cf(
    o ? [o.id] : ze.map((c) => c.id),
    r
  ), s = ze.every(
    (c) => r?.[c.id]?.overviewScreenshot
  ), a = n ? 2.25 : { md: 5, lg: 6 };
  return /* @__PURE__ */ y(
    D,
    {
      component: "aside",
      "aria-label": o ? `${o.name} overview` : "Lumora platforms overview",
      sx: {
        position: "relative",
        height: n ? af : "100%",
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
          backgroundImage: Hs("currentColor"),
          backgroundSize: "32px 32px",
          transition: fe
        },
        // Content above the grid
        "& > *": { position: "relative" },
        color: o ? "#ffffff" : e.heading,
        transition: fe
      },
      children: o ? /* @__PURE__ */ z(Pt.Fragment, { children: [
        /* @__PURE__ */ z(
          D,
          {
            sx: {
              px: a,
              pt: n ? 2.25 : { md: 7, lg: 9 }
            },
            children: [
              /* @__PURE__ */ z(
                D,
                {
                  sx: {
                    ...Go,
                    // Platform label ("POLYMER • AI AGENT CONFIGURATION") in Montserrat
                    fontFamily: e.headingFont,
                    ...n && { fontSize: 10, gap: 1 },
                    animation: Ve(0)
                  },
                  children: [
                    /* @__PURE__ */ y(
                      D,
                      {
                        sx: {
                          width: 22,
                          height: "1px",
                          backgroundColor: "currentColor"
                        }
                      }
                    ),
                    o.name,
                    /* @__PURE__ */ y(
                      D,
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
              /* @__PURE__ */ z(
                D,
                {
                  component: "h2",
                  sx: {
                    ...Ko,
                    // Laptops: wraps every platform's headline the way Polymer's does ("Build agents.
                    // Govern every" 13.3em fits; Centra 14.3em and Xpdite 15.2em break onto a second line).
                    // Wide screens (xl): no limit, so a headline stays on one line wherever it fits.
                    // In em, so the limit scales with the font.
                    maxWidth: { xs: "13.8em", xl: "none" },
                    ...n && {
                      fontSize: qo
                    },
                    mt: n ? 1 : 2.5,
                    fontFamily: e.headingFont,
                    animation: Ve(60)
                  },
                  children: [
                    o.headline,
                    " ",
                    /* @__PURE__ */ y(
                      D,
                      {
                        component: "span",
                        sx: { color: o.accent },
                        children: o.headlineAccent
                      }
                    )
                  ]
                }
              ),
              !n && /* @__PURE__ */ y(
                D,
                {
                  sx: {
                    mt: 2,
                    fontSize: 18,
                    lineHeight: 1.5,
                    opacity: 0.92,
                    maxWidth: 640,
                    animation: Ve(120)
                  },
                  children: o.description
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ y(
          D,
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
              animation: `${zs} 450ms ${bt} 120ms both`
            },
            children: /* @__PURE__ */ y(
              zo,
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
      ] }, o.id) : /* @__PURE__ */ z(Pt.Fragment, { children: [
        /* @__PURE__ */ z(
          D,
          {
            sx: {
              px: a,
              pt: n ? 2.25 : { md: 5, lg: 6 }
            },
            children: [
              /* @__PURE__ */ z(
                D,
                {
                  sx: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    animation: Ve(0)
                  },
                  children: [
                    /* @__PURE__ */ z(
                      D,
                      {
                        sx: {
                          ...Go,
                          fontFamily: e.bodyFont,
                          fontSize: 16,
                          fontWeight: 600,
                          // The phone banner keeps a small label so the headline fits
                          ...n && { fontSize: 10, gap: 1 },
                          color: e.eyebrow,
                          transition: fe
                        },
                        children: [
                          /* @__PURE__ */ y(
                            D,
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
                    !n && /* @__PURE__ */ z(
                      D,
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
                          ze.length,
                          " platforms · 1 account"
                        ]
                      }
                    )
                  ]
                }
              ),
              !n && /* @__PURE__ */ y(
                D,
                {
                  sx: {
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    mt: { md: 5, lg: 7 },
                    animation: Ve(60)
                  },
                  children: ze.map((c) => /* @__PURE__ */ z(
                    D,
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
                        r?.[c.id]?.logo ?? /* @__PURE__ */ y(cs, { platform: c.id }),
                        c.name
                      ]
                    },
                    c.id
                  ))
                }
              ),
              /* @__PURE__ */ z(
                D,
                {
                  component: "h2",
                  sx: {
                    ...Ko,
                    ...n && {
                      fontSize: qo
                    },
                    mt: n ? 1 : 2,
                    fontFamily: e.headingFont,
                    color: e.heroHeadline,
                    transition: fe,
                    animation: Ve(120)
                  },
                  children: [
                    "One sign-in.",
                    " ",
                    /* @__PURE__ */ y(
                      D,
                      {
                        component: "span",
                        sx: {
                          color: e.heroHeadlineAccent,
                          transition: fe
                        },
                        children: "Every platform."
                      }
                    )
                  ]
                }
              ),
              !n && /* @__PURE__ */ y(
                D,
                {
                  sx: {
                    mt: 2,
                    fontFamily: e.bodyFont,
                    fontSize: 18,
                    fontWeight: 500,
                    lineHeight: 1.55,
                    color: e.heroText,
                    maxWidth: 540,
                    animation: Ve(180)
                  },
                  children: "Centra runs the deals. Polymer builds the agents. Xpdite trains them. One Lumora account opens all three."
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ y(
          D,
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
            children: s ? /* @__PURE__ */ y(
              D,
              {
                sx: {
                  position: "absolute",
                  left: 0,
                  right: 0,
                  mx: "auto",
                  aspectRatio: String(Yo),
                  // Desktop: the whole stack fits, bottoms on the hero's edge.
                  // Phone banner: full width from the top, bottoms clipped.
                  ...n ? { top: 0, width: "100cqw" } : {
                    bottom: 0,
                    width: `min(100cqw, ${Yo * 100}cqh)`
                  }
                },
                children: [
                  "polymer",
                  "xpdite",
                  "centra"
                ].map((c, u) => /* @__PURE__ */ y(
                  D,
                  {
                    component: "img",
                    src: r?.[c]?.overviewScreenshot,
                    alt: `${Nt(c).name} dashboard`,
                    sx: {
                      position: "absolute",
                      bottom: 0,
                      left: uf[c],
                      width: lf,
                      display: "block",
                      // Back window first, front window last
                      animation: `${Dn} 500ms ${bt} ${200 + u * 60}ms both`
                    }
                  },
                  c
                ))
              }
            ) : ["polymer", "xpdite", "centra"].map((c, u) => {
              const d = Nt(c);
              return /* @__PURE__ */ y(
                zo,
                {
                  compact: !0,
                  title: d.name,
                  barColor: d.frameColor,
                  screenshot: i[c],
                  sx: {
                    position: "absolute",
                    ...df[c],
                    // Run past the bottom edge, where the hero clips them
                    bottom: "-24px",
                    // Back window first, front window last
                    animation: `${Dn} 500ms ${bt} ${200 + u * 60}ms both`
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
}, ff = ({ theme: e, title: t, steps: r }) => /* @__PURE__ */ z(
  D,
  {
    component: "section",
    "aria-labelledby": "lumora-first-time-title",
    sx: {
      px: 2.5,
      py: 2,
      [Qe]: { py: 1.25 },
      borderRadius: "12px",
      border: `1px solid ${e.border}`,
      backgroundColor: e.surface,
      transition: fe,
      "& *": { transition: fe }
    },
    children: [
      /* @__PURE__ */ y(
        D,
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
      /* @__PURE__ */ y(
        D,
        {
          component: "ol",
          sx: {
            m: 0,
            mt: 1.25,
            p: 0,
            listStyle: "none",
            display: "grid",
            gap: 1,
            [Qe]: { mt: 1, gap: 0.75 }
          },
          children: r.map((n, o) => /* @__PURE__ */ z(
            D,
            {
              component: "li",
              sx: { display: "flex", alignItems: "center", gap: 1.5, fontSize: 14.5, color: e.label },
              children: [
                /* @__PURE__ */ y(
                  D,
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
), Xo = ({ brandConfig: e, theme: t }) => /* @__PURE__ */ z(
  D,
  {
    component: "footer",
    sx: {
      display: "grid",
      gap: 1,
      [Qe]: { gap: 0.5 },
      fontSize: 13,
      lineHeight: 1.5,
      color: t.label,
      transition: fe,
      // Centred on phones, where the panel is the whole page; left-aligned beside the hero
      textAlign: { xs: "center", md: "left" },
      justifyItems: { xs: "center", md: "start" }
    },
    children: [
      e.securityNote && /* @__PURE__ */ z(
        D,
        {
          sx: {
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "center", md: "flex-start" },
            gap: 0.75
          },
          children: [
            /* @__PURE__ */ y(ws, { sx: { fontSize: 14 } }),
            e.securityNote
          ]
        }
      ),
      e.supportLabel && /* @__PURE__ */ z(D, { children: [
        "Need access?",
        " ",
        e.supportUrl ? /* @__PURE__ */ y(
          In,
          {
            href: e.supportUrl,
            sx: {
              color: t.brandText,
              textDecorationColor: "currentColor"
            },
            children: e.supportLabel
          }
        ) : /* @__PURE__ */ y(D, { component: "span", sx: { color: t.brandText }, children: e.supportLabel })
      ] }),
      (e.copyright || e.copyrightHolder) && /* @__PURE__ */ z(D, { children: [
        e.copyright,
        e.copyright && e.copyrightHolder && " ",
        e.copyrightHolder && e.copyrightUrl ? (
          // Only the holder is linked; opens in a new tab so the sign-in page stays open
          /* @__PURE__ */ y(
            In,
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
), jf = ({
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
  onPlatformChange: p,
  platformAssets: m,
  defaultColorMode: S,
  onColorModeChange: b,
  branding: h
}) => {
  const [w, g] = Ie("idle"), [x, _] = Ie(null), [T, C] = Ie(!1), [I, Y] = Ie(
    () => d ?? tn.get() ?? Bs
  );
  We(() => {
    tn.set(I);
  }, [I]);
  const { colorMode: H, toggleColorMode: F } = Gs(
    S,
    b
  ), M = Ms(h), A = js(M, H, I), l = () => `${window.location.origin}/callback`;
  if (We(() => {
    const O = (L) => {
      L.persisted && g(
        (W) => W === "google-loading" || W === "microsoft-loading" ? "idle" : W
      );
    };
    return window.addEventListener("pageshow", O), () => window.removeEventListener("pageshow", O);
  }, []), We(() => {
    C(Ut());
  }, []), We(() => {
    try {
      Be(e.apiBaseUrl, e.apiKey);
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
  const j = () => window.grecaptcha.execute(o, { action: "login" }).catch(() => {
    throw new Error("reCAPTCHA verification failed");
  }), v = async () => {
    if (!n || !o)
      return "";
    if (typeof window > "u" || !window.grecaptcha)
      throw new Error("reCAPTCHA is not loaded");
    return new Promise((O, L) => {
      const W = () => {
        j().then(O).catch(L);
      };
      window.grecaptcha.ready(W);
    });
  }, X = async (O, L) => {
    je.setTokens(O.accessToken, O.refreshToken);
    const W = L ?? await qe.getCurrentUser();
    g("success"), t({ user: W, tokens: O, platform: I });
  }, Z = (O) => {
    Y(O), p?.(O);
  }, ae = (O) => {
    try {
      g(`${O}-loading`), _(null);
      const L = O === "google" ? ye.ENDPOINTS.GOOGLE_AUTH : ye.ENDPOINTS.MICROSOFT_AUTH;
      setTimeout(() => {
        qe.initiateOAuth(
          L,
          l(),
          e.apiBaseUrl
        );
      }, 300);
    } catch (L) {
      const W = L;
      _({ message: W.message, type: O }), g("error"), r(W);
    }
  }, pe = async () => {
    g("passkey-loading"), _(null);
    try {
      const { tokens: O, user: L } = await qe.loginWithPasskey();
      await X(O, L);
    } catch (O) {
      const L = O;
      _({ message: L.message, type: "passkey" }), g("error"), r(L);
    }
  }, Le = async (O) => {
    g("magic-link-loading"), _(null);
    try {
      n && await v(), await qe.requestMagicLink(O.email, l()), g("magic-link-success");
    } catch (L) {
      const W = L;
      _({ message: W.message, type: "magic-link" }), g("error"), r(W);
    }
  }, R = () => {
    _(null), g("idle");
  };
  We(() => {
    if (n && o && typeof window < "u") {
      const O = document.createElement("script");
      O.src = `https://www.google.com/recaptcha/enterprise.js?render=${o}`, O.async = !0, O.defer = !0, document.head.appendChild(O);
    }
  }, [n, o]);
  const P = c && T, $ = Js(w), B = i || s, V = a || P, G = /* @__PURE__ */ y(
    Jo,
    {
      theme: A,
      platform: I,
      platformAssets: m
    }
  ), K = /* @__PURE__ */ y(
    Jo,
    {
      theme: A,
      platform: I,
      platformAssets: m,
      compact: !0
    }
  );
  return w === "magic-link-success" ? /* @__PURE__ */ z(
    Vo,
    {
      theme: A,
      hero: G,
      mobileHero: K,
      footer: /* @__PURE__ */ y(Xo, { brandConfig: M, theme: A }),
      children: [
        /* @__PURE__ */ y(
          no,
          {
            brandConfig: M,
            theme: A,
            showWelcome: !1,
            onToggleColorMode: F
          }
        ),
        /* @__PURE__ */ y(D, { sx: { pt: 6 }, children: /* @__PURE__ */ y(
          Sl,
          {
            theme: A,
            title: M.magicLinkSuccessTitle || "Check your inbox",
            description: M.magicLinkSuccessDescription || "If this email address belongs to an active account, we have sent it a sign-in link.",
            onBackToLogin: R
          }
        ) })
      ]
    }
  ) : /* @__PURE__ */ z(
    Vo,
    {
      theme: A,
      hero: G,
      mobileHero: K,
      footer: /* @__PURE__ */ y(Xo, { brandConfig: M, theme: A }),
      children: [
        /* @__PURE__ */ y(
          no,
          {
            brandConfig: M,
            theme: A,
            onToggleColorMode: F
          }
        ),
        /* @__PURE__ */ y(
          sf,
          {
            theme: A,
            value: I,
            platformAssets: m,
            disabled: $,
            onChange: Z
          }
        ),
        u && x && /* @__PURE__ */ y(
          bs,
          {
            severity: "error",
            onClose: () => _(null),
            sx: {
              borderRadius: "10px",
              border: `1px solid ${A.errorBorder}`,
              backgroundColor: A.errorBg,
              color: A.errorText,
              fontFamily: A.bodyFont,
              fontSize: 15,
              transition: fe,
              "& .MuiAlert-icon": { color: A.errorIcon },
              "& .MuiAlert-action .MuiIconButton-root": {
                color: A.errorText
              }
            },
            children: x.message
          }
        ),
        B && /* @__PURE__ */ z(
          D,
          {
            sx: {
              display: "grid",
              gridTemplateColumns: i && s ? "1fr 1fr" : "1fr",
              gap: 1.5
            },
            children: [
              i && /* @__PURE__ */ y(
                oo,
                {
                  theme: A,
                  icon: /* @__PURE__ */ y(Ts, {}),
                  label: "Google",
                  ariaLabel: "Continue with Google",
                  isLoading: w === "google-loading",
                  disabled: $,
                  onClick: () => ae("google")
                }
              ),
              s && /* @__PURE__ */ y(
                oo,
                {
                  theme: A,
                  icon: /* @__PURE__ */ y(ml, { monochrome: !0 }),
                  label: "Microsoft",
                  ariaLabel: "Continue with Microsoft",
                  isLoading: w === "microsoft-loading",
                  disabled: $,
                  onClick: () => ae("microsoft")
                }
              )
            ]
          }
        ),
        B && V && /* @__PURE__ */ y(
          Ss,
          {
            sx: {
              fontFamily: A.bodyFont,
              fontSize: 16,
              color: A.label,
              transition: fe,
              "&::before, &::after": {
                borderColor: A.divider,
                transition: fe
              }
            },
            children: "or use your work email"
          }
        ),
        a && /* @__PURE__ */ y(
          bl,
          {
            theme: A,
            isSubmitting: w === "magic-link-loading",
            disabled: $,
            onSubmit: Le
          }
        ),
        P && /* @__PURE__ */ y(
          $t,
          {
            fullWidth: !0,
            variant: "outlined",
            onClick: pe,
            disabled: $,
            startIcon: w === "passkey-loading" ? /* @__PURE__ */ y(ln, { size: 16, color: "inherit" }) : void 0,
            sx: {
              ...Dt,
              borderRadius: "10px",
              borderWidth: 1.5,
              borderColor: A.accent,
              backgroundColor: A.surface,
              color: A.accent,
              fontFamily: A.headingFont,
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: "0.14em",
              transition: fe,
              "&:hover": {
                borderWidth: 1.5,
                borderColor: A.accentHover,
                backgroundColor: `${A.accent}0f`
              },
              "&.Mui-disabled": {
                borderWidth: 1.5,
                borderColor: A.border,
                color: A.muted
              },
              ...sr(A)
            },
            children: w === "passkey-loading" ? "Waiting for passkey..." : "Sign in with passkey"
          }
        ),
        u && w === "error" && /* @__PURE__ */ y(
          $t,
          {
            variant: "text",
            onClick: R,
            sx: {
              alignSelf: "center",
              mt: -1.5,
              color: A.accent,
              fontFamily: A.headingFont,
              textTransform: "none",
              fontWeight: 600,
              ...sr(A)
            },
            children: "Try Again"
          }
        ),
        M.firstTimeSteps && M.firstTimeSteps.length > 0 && /* @__PURE__ */ y(
          ff,
          {
            theme: A,
            title: M.firstTimeTitle || "First time here?",
            steps: M.firstTimeSteps
          }
        )
      ]
    }
  );
}, Hf = (e) => {
  const [t, r] = Ie(!0), [n, o] = Ie(null), i = Zo(!1);
  return We(() => {
    if (i.current)
      return;
    i.current = !0, (async () => {
      try {
        e?.apiBaseUrl && Be(e.apiBaseUrl, e.apiKey);
        const a = new URLSearchParams(window.location.search);
        let c = a.get("access_token") || a.get("accessToken"), u = a.get("refresh_token") || a.get("refreshToken");
        const d = a.get("magic_token"), p = a.get("user"), m = a.get("error"), S = a.get("message");
        if (m) {
          const w = decodeURIComponent(S || m);
          throw new Error(w);
        }
        if (d) {
          const w = await qe.verifyMagicLink(d);
          c = w.accessToken, u = w.refreshToken;
        }
        if (!c || !u)
          throw new Error("Missing authentication tokens in callback URL");
        je.setTokens(c, u);
        let b;
        if (p)
          try {
            const w = decodeURIComponent(p);
            b = JSON.parse(w);
          } catch (w) {
            console.warn("Failed to parse user from URL, fetching from API:", w), b = await qe.getCurrentUser();
          }
        else
          b = await qe.getCurrentUser();
        e?.onSuccess?.({ accessToken: c, refreshToken: u }, b, tn.get());
        const h = e?.redirectPath || "/dashboard";
        window.history.replaceState({}, document.title, h), r(!1);
      } catch (a) {
        const c = a;
        o(c), e?.onError?.(c), r(!1);
      }
    })();
  }, [e?.redirectPath]), { loading: t, error: n };
}, Vf = (e) => ({ logout: fs(async () => {
  const r = je.getRefreshToken();
  if (e?.apiBaseUrl && r)
    try {
      await qe.logout(r);
    } catch (n) {
      console.error("Logout API call failed:", n);
    }
  je.clearTokens(), window.location.href = "/login";
}, [e?.apiBaseUrl]) }), Wf = (e) => {
  const [t, r] = Ie(!1), [n, o] = Ie(null), [i, s] = Ie(!1);
  return We(() => {
    s(Ut());
  }, []), { registerPasskey: async (c) => {
    r(!0), o(null);
    try {
      return e?.apiBaseUrl && Be(e.apiBaseUrl, e.apiKey), await qe.registerPasskey(c);
    } catch (u) {
      return o(u), null;
    } finally {
      r(!1);
    }
  }, loading: t, error: n, isSupported: i };
};
export {
  Dr as ColorModeStorage,
  jf as LumoraLogin,
  ze as PLATFORMS,
  tn as PlatformStorage,
  je as TokenStorage,
  Ms as getBrandingConfig,
  Ls as getDefaultBranding,
  Hf as useAuthCallback,
  Vf as useLogout,
  Wf as usePasskeyRegistration
};
