import { jsxs as L, jsx as g, Fragment as Bn } from "react/jsx-runtime";
import * as ee from "react";
import Mt, { useState as Re, useEffect as Ue, useId as vs, useMemo as As, useRef as pn, useSyncExternalStore as _s, useLayoutEffect as ks, useCallback as Ps } from "react";
import { SvgIcon as Et, Box as v, Tooltip as Ns, IconButton as Is, Button as Bt, CircularProgress as hn, InputBase as $s, ToggleButtonGroup as Ls, ToggleButton as Ds, Link as Un, Alert as Ms, Divider as Fs, Skeleton as Bs } from "@mui/material";
import { MarkEmailReadOutlined as Us, LockOutlined as js, Google as Hs } from "@mui/icons-material";
import { keyframes as mn, Global as Vs, ThemeContext as ai } from "@emotion/react";
import { appendErrors as Ws, useForm as zs } from "react-hook-form";
import { validateFieldsNatively as qs, toNestErrors as Ks } from "@hookform/resolvers";
import * as jn from "yup";
import "@emotion/styled";
function ze(e) {
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
function Wt() {
  return Gs.stubThis(globalThis?.PublicKeyCredential !== void 0 && typeof globalThis.PublicKeyCredential == "function");
}
const Gs = {
  stubThis: (e) => e
};
function ci(e) {
  const { id: t } = e;
  return {
    ...e,
    id: pr(t),
    transports: e.transports,
    type: e.type
  };
}
function li(e) {
  return (
    // Consider localhost valid as well since it's okay wrt Secure Contexts
    e === "localhost" || // Support punycode (ACE) or ascii labels and domains
    /^((xn--[a-z0-9-]+|[a-z0-9]+(-[a-z0-9]+)*)\.)+([a-z]{2,}|xn--[a-z0-9-]+)$/i.test(e)
  );
}
class Te extends Error {
  constructor({ message: t, code: r, cause: n, name: o }) {
    super(t, { cause: n }), Object.defineProperty(this, "code", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: void 0
    }), this.name = o ?? n.name, this.code = r;
  }
}
function Ys({ error: e, options: t }) {
  const { publicKey: r } = t;
  if (!r)
    throw Error("options was missing required publicKey property");
  if (e.name === "AbortError") {
    if (t.signal instanceof AbortSignal)
      return new Te({
        message: "Registration ceremony was sent an abort signal",
        code: "ERROR_CEREMONY_ABORTED",
        cause: e
      });
  } else if (e.name === "ConstraintError") {
    if (r.authenticatorSelection?.requireResidentKey === !0)
      return new Te({
        message: "Discoverable credentials were required but no available authenticator supported it",
        code: "ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT",
        cause: e
      });
    if (
      // @ts-ignore: `mediation` doesn't yet exist on CredentialCreationOptions but it's possible as of Sept 2024
      t.mediation === "conditional" && r.authenticatorSelection?.userVerification === "required"
    )
      return new Te({
        message: "User verification was required during automatic registration but it could not be performed",
        code: "ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE",
        cause: e
      });
    if (r.authenticatorSelection?.userVerification === "required")
      return new Te({
        message: "User verification was required but no available authenticator supported it",
        code: "ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT",
        cause: e
      });
  } else {
    if (e.name === "InvalidStateError")
      return new Te({
        message: "The authenticator was previously registered",
        code: "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED",
        cause: e
      });
    if (e.name === "NotAllowedError")
      return new Te({
        message: e.message,
        code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
        cause: e
      });
    if (e.name === "NotSupportedError")
      return r.pubKeyCredParams.filter((o) => o.type === "public-key").length === 0 ? new Te({
        message: 'No entry in pubKeyCredParams was of type "public-key"',
        code: "ERROR_MALFORMED_PUBKEYCREDPARAMS",
        cause: e
      }) : new Te({
        message: "No available authenticator supported any of the specified pubKeyCredParams algorithms",
        code: "ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG",
        cause: e
      });
    if (e.name === "SecurityError") {
      const n = globalThis.location.hostname;
      if (li(n)) {
        if (r.rp.id !== n)
          return new Te({
            message: `The RP ID "${r.rp.id}" is invalid for this domain`,
            code: "ERROR_INVALID_RP_ID",
            cause: e
          });
      } else return new Te({
        message: `${globalThis.location.hostname} is an invalid domain`,
        code: "ERROR_INVALID_DOMAIN",
        cause: e
      });
    } else if (e.name === "TypeError") {
      if (r.user.id.byteLength < 1 || r.user.id.byteLength > 64)
        return new Te({
          message: "User ID was not between 1 and 64 characters",
          code: "ERROR_INVALID_USER_ID_LENGTH",
          cause: e
        });
    } else if (e.name === "UnknownError")
      return new Te({
        message: "The authenticator was unable to process the specified options, or could not create a new credential",
        code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
        cause: e
      });
  }
  return e;
}
class Js {
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
const ui = new Js(), Xs = ["cross-platform", "platform"];
function di(e) {
  if (e && !(Xs.indexOf(e) < 0))
    return e;
}
async function Zs(e) {
  !e.optionsJSON && e.challenge && (console.warn("startRegistration() was not called correctly. It will try to continue with the provided options, but this call should be refactored to use the expected call structure instead. See https://simplewebauthn.dev/docs/packages/browser#typeerror-cannot-read-properties-of-undefined-reading-challenge for more information."), e = { optionsJSON: e });
  const { optionsJSON: t, useAutoRegister: r = !1 } = e;
  if (!Wt())
    throw new Error("WebAuthn is not supported in this browser");
  const n = {
    ...t,
    challenge: pr(t.challenge),
    user: {
      ...t.user,
      id: pr(t.user.id)
    },
    excludeCredentials: t.excludeCredentials?.map(ci)
  }, o = {};
  r && (o.mediation = "conditional"), o.publicKey = n, o.signal = ui.createNewAbortSignal();
  let i;
  try {
    i = await navigator.credentials.create(
      // TODO: Newer versions of Deno require this casting, revisit once we're using Deno 2.6+
      o
    );
  } catch (b) {
    throw Ys({ error: b, options: o });
  }
  if (!i)
    throw new Error("Registration was not completed");
  const { id: s, rawId: a, response: c, type: d } = i;
  let u;
  typeof c.getTransports == "function" && (u = c.getTransports());
  let f;
  if (typeof c.getPublicKeyAlgorithm == "function")
    try {
      f = c.getPublicKeyAlgorithm();
    } catch (b) {
      Br("getPublicKeyAlgorithm()", b);
    }
  let m;
  if (typeof c.getPublicKey == "function")
    try {
      const b = c.getPublicKey();
      b !== null && (m = ze(b));
    } catch (b) {
      Br("getPublicKey()", b);
    }
  let S;
  if (typeof c.getAuthenticatorData == "function")
    try {
      S = ze(c.getAuthenticatorData());
    } catch (b) {
      Br("getAuthenticatorData()", b);
    }
  return {
    id: s,
    rawId: ze(a),
    response: {
      attestationObject: ze(c.attestationObject),
      clientDataJSON: ze(c.clientDataJSON),
      transports: u,
      publicKeyAlgorithm: f,
      publicKey: m,
      authenticatorData: S
    },
    type: d,
    clientExtensionResults: i.getClientExtensionResults(),
    authenticatorAttachment: di(i.authenticatorAttachment)
  };
}
function Br(e, t) {
  console.warn(`The browser extension that intercepted this WebAuthn API call incorrectly implemented ${e}. You should report this error to them.
`, t);
}
function Qs() {
  if (!Wt())
    return Ur.stubThis(new Promise((t) => t(!1)));
  const e = globalThis.PublicKeyCredential;
  return e?.isConditionalMediationAvailable === void 0 ? Ur.stubThis(new Promise((t) => t(!1))) : Ur.stubThis(e.isConditionalMediationAvailable());
}
const Ur = {
  stubThis: (e) => e
};
function ea({ error: e, options: t }) {
  const { publicKey: r } = t;
  if (!r)
    throw Error("options was missing required publicKey property");
  if (e.name === "AbortError") {
    if (t.signal instanceof AbortSignal)
      return new Te({
        message: "Authentication ceremony was sent an abort signal",
        code: "ERROR_CEREMONY_ABORTED",
        cause: e
      });
  } else {
    if (e.name === "NotAllowedError")
      return new Te({
        message: e.message,
        code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
        cause: e
      });
    if (e.name === "SecurityError") {
      const n = globalThis.location.hostname;
      if (li(n)) {
        if (r.rpId !== n)
          return new Te({
            message: `The RP ID "${r.rpId}" is invalid for this domain`,
            code: "ERROR_INVALID_RP_ID",
            cause: e
          });
      } else return new Te({
        message: `${globalThis.location.hostname} is an invalid domain`,
        code: "ERROR_INVALID_DOMAIN",
        cause: e
      });
    } else if (e.name === "UnknownError")
      return new Te({
        message: "The authenticator was unable to process the specified options, or could not create a new assertion signature",
        code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
        cause: e
      });
  }
  return e;
}
async function ta(e) {
  !e.optionsJSON && e.challenge && (console.warn("startAuthentication() was not called correctly. It will try to continue with the provided options, but this call should be refactored to use the expected call structure instead. See https://simplewebauthn.dev/docs/packages/browser#typeerror-cannot-read-properties-of-undefined-reading-challenge for more information."), e = { optionsJSON: e });
  const { optionsJSON: t, useBrowserAutofill: r = !1, verifyBrowserAutofillInput: n = !0 } = e;
  if (!Wt())
    throw new Error("WebAuthn is not supported in this browser");
  let o;
  t.allowCredentials?.length !== 0 && (o = t.allowCredentials?.map(ci));
  const i = {
    ...t,
    challenge: pr(t.challenge),
    allowCredentials: o
  }, s = {};
  if (r) {
    if (!await Qs())
      throw Error("Browser does not support WebAuthn autofill");
    if (document.querySelectorAll("input[autocomplete$='webauthn']").length < 1 && n)
      throw Error('No <input> with "webauthn" as the only or last value in its `autocomplete` attribute was detected');
    s.mediation = "conditional", i.allowCredentials = [];
  }
  s.publicKey = i, s.signal = ui.createNewAbortSignal();
  let a;
  try {
    a = await navigator.credentials.get(
      // TODO: Newer versions of Deno require this casting, revisit once we're using Deno 2.6+
      s
    );
  } catch (S) {
    throw ea({ error: S, options: s });
  }
  if (!a)
    throw new Error("Authentication was not completed");
  const { id: c, rawId: d, response: u, type: f } = a;
  let m;
  return u.userHandle && (m = ze(u.userHandle)), {
    id: c,
    rawId: ze(d),
    response: {
      authenticatorData: ze(u.authenticatorData),
      clientDataJSON: ze(u.clientDataJSON),
      signature: ze(u.signature),
      userHandle: m
    },
    type: f,
    clientExtensionResults: a.getClientExtensionResults(),
    authenticatorAttachment: di(a.authenticatorAttachment)
  };
}
const ra = () => ({
  // Company branding
  companyName: "Lumora Capital",
  // Title reads "<welcomeTitle> <welcomeTitleAccent>", each part in its own colour (light mode)
  welcomeTitle: "Welcome to",
  welcomeTitleAccent: "Lumora.",
  welcomeTitleColor: "#072d29",
  welcomeTitleAccentColor: "#049586",
  tagline: "One Lumora account for Centra, XPdite and Polymer.",
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
}), fi = (e) => ({
  ...ra(),
  ...e
}), na = {
  pageBg: "#0e1d1a",
  surface: "#152824",
  border: "#28403a",
  heading: "#e9f1ef",
  text: "#c2d0cc",
  muted: "#8ea29d",
  heroBg: "#12231f"
}, Pe = [
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
    // Dark art is made from the light by scripts/dark-dashboards.mjs
    loadScreenshot: (e) => (e === "dark" ? import("./centra-dark-CrCj8Iej.js") : import("./centra-B7uv4jxP.js")).then((t) => t.default)
  },
  {
    id: "xpdite",
    name: "XPdite",
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
    // Dark art is made from the light by scripts/dark-dashboards.mjs
    loadScreenshot: (e) => (e === "dark" ? import("./xpdite-dark-CQgzXlKo.js") : import("./xpdite-BULBoZZ-.js")).then((t) => t.default)
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
    // Dark art is made from the light by scripts/dark-dashboards.mjs
    loadScreenshot: (e) => (e === "dark" ? import("./polymer-dark-BO9MGWvk.js") : import("./polymer-gl7Z7z7W.js")).then((t) => t.default)
  }
], tt = "centra", wt = (e) => Pe.find((t) => t.id === e), sr = "lumora_platform", hr = {
  /**
   * Get the stored platform
   * @returns The platform id or null when none was chosen
   */
  get: () => {
    try {
      const e = localStorage.getItem(sr);
      return Pe.some((t) => t.id === e) ? e : null;
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
}, je = "@media (max-height: 920px)", ut = {
  height: 50,
  [je]: { height: 46 }
}, oa = "0 1px 2px rgba(18, 51, 45, 0.06), 0 8px 24px rgba(18, 51, 45, 0.06)", gn = (e, t, r) => {
  const n = t === "dark", o = r ? wt(r) : null, i = o ? n ? o.colorOnDark : o.uiColor : e.primaryColor, s = o ? o.dark : na;
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
}), pi = (e) => `linear-gradient(${e} 1px, transparent 1px), linear-gradient(90deg, ${e} 1px, transparent 1px)`, xt = "cubic-bezier(0.2, 0.7, 0.2, 1)", yn = 350, ia = "cubic-bezier(0.4, 0, 0.2, 1)", zt = (...e) => e.map((t) => `${t} ${yn}ms ${ia}`).join(", "), ge = zt(
  "background-color",
  "border-color",
  "color",
  "box-shadow"
), hi = zt("fill", "stroke"), sa = zt("opacity", "transform"), aa = mn`
	from {
		opacity: 0;
		transform: translateY(12px);
	}
	to {
		opacity: 1;
		transform: none;
	}
`, ca = mn`
	from {
		opacity: 0;
		transform: translate(16px, 16px);
	}
	to {
		opacity: 1;
		transform: none;
	}
`, Hn = mn`
	from {
		opacity: 0;
		transform: translateY(24px);
	}
	to {
		opacity: 1;
		transform: none;
	}
`, Ge = (e = 0, t = 500) => `${aa} ${t}ms ${xt} ${e}ms both`, la = {
  "@media (prefers-reduced-motion: reduce)": {
    "& *, & *::before, & *::after": {
      animationDuration: "1ms !important",
      animationDelay: "0ms !important",
      transitionDuration: "1ms !important"
    }
  }
}, ar = "lumora_color_mode", bn = "(prefers-color-scheme: dark)", mi = () => typeof window > "u" || !window.matchMedia ? "light" : window.matchMedia(bn).matches ? "dark" : "light", cr = {
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
}, ua = (e, t) => {
  const [r, n] = Re(
    () => cr.get() !== null
  ), [o, i] = Re(
    () => cr.get() ?? e ?? mi()
  ), s = !r && !e;
  return Ue(() => {
    if (!s || typeof window > "u" || !window.matchMedia)
      return;
    const c = window.matchMedia(bn), d = (u) => i(u.matches ? "dark" : "light");
    return c.addEventListener("change", d), () => c.removeEventListener("change", d);
  }, [s]), { colorMode: o, toggleColorMode: () => {
    const c = o === "dark" ? "light" : "dark";
    i(c), n(!0), cr.set(c), t?.(c);
  } };
}, da = [
  "google-loading",
  "microsoft-loading",
  "passkey-loading",
  "magic-link-loading"
], fa = (e) => da.includes(e), qe = {
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
  hasTokens: () => !!(qe.getAccessToken() && qe.getRefreshToken())
}, we = {
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
}, pa = {
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
function gi(e, t) {
  return function() {
    return e.apply(t, arguments);
  };
}
const { toString: ha } = Object.prototype, { getPrototypeOf: rt } = Object, { iterator: qt, toStringTag: yi } = Symbol, Ut = (({ hasOwnProperty: e }) => (t, r) => e.call(t, r))(Object.prototype), bi = (e) => typeof e == "string" && (e === "__proto__" || e === "constructor" || e === "prototype"), Si = (e, t, r) => e === Object.prototype || !r && t === null, ma = (e) => {
  if (!Object.isExtensible(e))
    return !1;
  const t = Object.getOwnPropertyNames(e);
  return Object.getOwnPropertySymbols && t.push(...Object.getOwnPropertySymbols(e)), t.every((r) => {
    if (bi(r))
      return !1;
    const n = Object.getOwnPropertyDescriptor(e, r);
    return !!n && n.configurable && n.writable === !0;
  });
}, jt = (e, t) => {
  let r = e;
  const n = [];
  for (; r != null; ) {
    if (n.indexOf(r) !== -1)
      return !1;
    n.push(r);
    const o = rt(r);
    if (Si(r, o, r === e))
      return !1;
    if (Ut(r, t))
      return !0;
    r = o;
  }
  return !1;
}, ga = (e, t) => e != null && jt(e, t) ? e[t] : void 0, ya = (e) => {
  if (e == null || typeof e != "object" && typeof e != "function")
    return e;
  const t = rt(e);
  if (t === null && ma(e))
    return e;
  const r = /* @__PURE__ */ Object.create(null), n = /* @__PURE__ */ Object.create(null), o = [];
  let i = e;
  for (; i != null && o.indexOf(i) === -1; ) {
    o.push(i);
    const s = i === e ? t : rt(i);
    if (Si(i, s, i === e))
      break;
    const a = Object.getOwnPropertyNames(i);
    Object.getOwnPropertySymbols && a.push(...Object.getOwnPropertySymbols(i));
    for (const c of a)
      bi(c) || Ut(n, c) || (r[c] = e[c], n[c] = !0);
    i = s;
  }
  return r;
}, Sn = /* @__PURE__ */ ((e) => (t) => {
  const r = ha.call(t);
  return e[r] || (e[r] = r.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), Me = (e) => (e = e.toLowerCase(), (t) => Sn(t) === e), wr = (e) => (t) => typeof t === e, { isArray: dt } = Array, ft = wr("undefined");
function Ct(e) {
  return e !== null && !ft(e) && e.constructor !== null && !ft(e.constructor) && Ae(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}
const Ei = Me("ArrayBuffer");
function ba(e) {
  let t;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? t = ArrayBuffer.isView(e) : t = e && e.buffer && Ei(e.buffer), t;
}
const Sa = wr("string"), Ae = wr("function"), wi = wr("number"), Ot = (e) => e !== null && typeof e == "object", Ea = (e) => e === !0 || e === !1, lr = (e) => {
  if (!Ot(e))
    return !1;
  const t = rt(e);
  return (t === null || t === Object.prototype || rt(t) === null) && // Treat safe own/inherited Symbol.toStringTag or Symbol.iterator members as
  // evidence the value is tagged/iterable, while ignoring members reachable
  // only through shared or terminal prototype boundaries.
  !jt(e, yi) && !jt(e, qt);
}, wa = (e) => {
  if (!Ot(e) || Ct(e))
    return !1;
  try {
    return Object.keys(e).length === 0 && Object.getPrototypeOf(e) === Object.prototype;
  } catch {
    return !1;
  }
}, xa = Me("Date"), Ta = Me("File"), Ca = (e) => !!(e && typeof e.uri < "u"), Oa = (e) => e && typeof e.getParts < "u", Ra = Me("Blob"), va = Me("FileList"), Aa = Me("Set"), _a = (e) => Ot(e) && Ae(e.pipe);
function ka() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
}
const Vn = ka(), Wn = typeof Vn.FormData < "u" ? Vn.FormData : void 0, Pa = (e) => {
  if (!e) return !1;
  if (Wn && e instanceof Wn) return !0;
  const t = rt(e);
  if (!t || t === Object.prototype || !Ae(e.append)) return !1;
  const r = Sn(e);
  return r === "formdata" || // detect form-data instance
  r === "object" && Ae(e.toString) && e.toString() === "[object FormData]";
}, Na = Me("URLSearchParams"), [Ia, $a, La, Da] = [
  "ReadableStream",
  "Request",
  "Response",
  "Headers"
].map(Me), Ma = (e) => e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function Kt(e, t, { allOwnKeys: r = !1 } = {}) {
  if (e === null || typeof e > "u")
    return;
  let n, o;
  if (typeof e != "object" && (e = [e]), dt(e))
    for (n = 0, o = e.length; n < o; n++)
      t.call(null, e[n], n, e);
  else {
    if (Ct(e))
      return;
    const i = r ? Object.getOwnPropertyNames(e) : Object.keys(e), s = i.length;
    let a;
    for (n = 0; n < s; n++)
      a = i[n], t.call(null, e[a], a, e);
  }
}
function xi(e, t) {
  if (Ct(e))
    return null;
  t = t.toLowerCase();
  const r = Object.keys(e);
  let n = r.length, o;
  for (; n-- > 0; )
    if (o = r[n], t === o.toLowerCase())
      return o;
  return null;
}
const at = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, Ti = (e) => !ft(e) && e !== at;
function sn(...e) {
  const { caseless: t, skipUndefined: r } = Ti(this) && this || {}, n = {}, o = (i, s) => {
    if (s === "__proto__" || s === "constructor" || s === "prototype")
      return;
    const a = t && typeof s == "string" && xi(n, s) || s, c = Ut(n, a) ? n[a] : void 0;
    lr(c) && lr(i) ? n[a] = sn(c, i) : lr(i) ? n[a] = sn({}, i) : dt(i) ? n[a] = i.slice() : (!r || !ft(i)) && (n[a] = i);
  };
  for (let i = 0, s = e.length; i < s; i++) {
    const a = e[i];
    if (!a || Ct(a) || (Kt(a, o), typeof a != "object" || dt(a)))
      continue;
    const c = Object.getOwnPropertySymbols(a);
    for (let d = 0; d < c.length; d++) {
      const u = c[d];
      Ya.call(a, u) && o(a[u], u);
    }
  }
  return n;
}
const Fa = (e, t, r, { allOwnKeys: n } = {}) => (Kt(
  t,
  (o, i) => {
    r && Ae(o) ? Object.defineProperty(e, i, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot
      // hijack defineProperty's accessor-vs-data resolution.
      __proto__: null,
      value: gi(o, r),
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
), e), Ba = (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e), Ua = (e, t, r, n) => {
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
}, ja = (e, t, r, n) => {
  let o, i, s;
  const a = {};
  if (t = t || {}, e == null) return t;
  do {
    for (o = Object.getOwnPropertyNames(e), i = o.length; i-- > 0; )
      s = o[i], (!n || n(s, e, t)) && !a[s] && (t[s] = e[s], a[s] = !0);
    e = r !== !1 && rt(e);
  } while (e && (!r || r(e, t)) && e !== Object.prototype);
  return t;
}, Ha = (e, t, r) => {
  e = String(e), (r === void 0 || r > e.length) && (r = e.length), r -= t.length;
  const n = e.indexOf(t, r);
  return n !== -1 && n === r;
}, Va = (e) => {
  if (!e) return null;
  if (dt(e)) return e;
  let t = e.length;
  if (!wi(t)) return null;
  const r = new Array(t);
  for (; t-- > 0; )
    r[t] = e[t];
  return r;
}, Wa = /* @__PURE__ */ ((e) => (t) => e && t instanceof e)(typeof Uint8Array < "u" && rt(Uint8Array)), za = (e, t) => {
  const n = (e && e[qt]).call(e);
  let o;
  for (; (o = n.next()) && !o.done; ) {
    const i = o.value;
    t.call(e, i[0], i[1]);
  }
}, qa = (e, t) => {
  let r;
  const n = [];
  for (; (r = e.exec(t)) !== null; )
    n.push(r);
  return n;
}, Ka = Me("HTMLFormElement"), Ga = (e) => e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function(r, n, o) {
  return n.toUpperCase() + o;
}), { propertyIsEnumerable: Ya } = Object.prototype, Ja = Me("RegExp"), Ci = (e, t) => {
  const r = Object.getOwnPropertyDescriptors(e), n = {};
  Kt(r, (o, i) => {
    let s;
    (s = t(o, i, e)) !== !1 && (n[i] = s || o);
  }), Object.defineProperties(e, n);
}, Xa = (e) => {
  Ci(e, (t, r) => {
    if (Ae(e) && ["arguments", "caller", "callee"].includes(r))
      return !1;
    const n = e[r];
    if (Ae(n)) {
      if (t.enumerable = !1, "writable" in t) {
        t.writable = !1;
        return;
      }
      t.set || (t.set = () => {
        throw Error("Can not rewrite read-only method '" + r + "'");
      });
    }
  });
}, Za = (e, t) => {
  const r = {}, n = (o) => {
    o.forEach((i) => {
      r[i] = !0;
    });
  };
  return dt(e) ? n(e) : n(String(e).split(t)), r;
}, Qa = () => {
}, ec = (e, t) => e != null && Number.isFinite(e = +e) ? e : t;
function tc(e) {
  return !!(e && Ae(e.append) && e[yi] === "FormData" && e[qt]);
}
const rc = (e) => {
  const t = /* @__PURE__ */ new WeakSet(), r = (n) => {
    if (Ot(n)) {
      if (t.has(n))
        return;
      if (Ct(n))
        return n;
      if (!("toJSON" in n)) {
        t.add(n);
        let o;
        if (Aa(n)) {
          o = [];
          for (const i of n) {
            const s = r(i);
            !ft(s) && o.push(s);
          }
        } else
          o = dt(n) ? [] : {}, Kt(n, (i, s) => {
            const a = r(i);
            !ft(a) && (o[s] = a);
          });
        return t.delete(n), o;
      }
    }
    return n;
  };
  return r(e);
}, nc = Me("AsyncFunction"), oc = (e) => e && (Ot(e) || Ae(e)) && Ae(e.then) && Ae(e.catch), Oi = ((e, t) => e ? setImmediate : t ? ((r, n) => (at.addEventListener(
  "message",
  ({ source: o, data: i }) => {
    o === at && i === r && n.length && n.shift()();
  },
  !1
), (o) => {
  n.push(o), at.postMessage(r, "*");
}))(`axios@${Math.random()}`, []) : (r) => setTimeout(r))(typeof setImmediate == "function", Ae(at.postMessage)), ic = typeof queueMicrotask < "u" ? queueMicrotask.bind(at) : typeof process < "u" && process.nextTick || Oi, Ri = (e) => e != null && Ae(e[qt]), sc = (e) => e != null && jt(e, qt) && Ri(e), p = {
  isArray: dt,
  isArrayBuffer: Ei,
  isBuffer: Ct,
  isFormData: Pa,
  isArrayBufferView: ba,
  isString: Sa,
  isNumber: wi,
  isBoolean: Ea,
  isObject: Ot,
  isPlainObject: lr,
  isEmptyObject: wa,
  isReadableStream: Ia,
  isRequest: $a,
  isResponse: La,
  isHeaders: Da,
  isUndefined: ft,
  isDate: xa,
  isFile: Ta,
  isReactNativeBlob: Ca,
  isReactNative: Oa,
  isBlob: Ra,
  isRegExp: Ja,
  isFunction: Ae,
  isStream: _a,
  isURLSearchParams: Na,
  isTypedArray: Wa,
  isFileList: va,
  forEach: Kt,
  merge: sn,
  extend: Fa,
  trim: Ma,
  stripBOM: Ba,
  inherits: Ua,
  toFlatObject: ja,
  kindOf: Sn,
  kindOfTest: Me,
  endsWith: Ha,
  toArray: Va,
  forEachEntry: za,
  matchAll: qa,
  isHTMLForm: Ka,
  hasOwnProperty: Ut,
  hasOwnProp: Ut,
  // an alias to avoid ESLint no-prototype-builtins detection
  hasOwnInPrototypeChain: jt,
  getSafeProp: ga,
  toSafeFlatObject: ya,
  reduceDescriptors: Ci,
  freezeMethods: Xa,
  toObjectSet: Za,
  toCamelCase: Ga,
  noop: Qa,
  toFiniteNumber: ec,
  findKey: xi,
  global: at,
  isContextDefined: Ti,
  isSpecCompliantForm: tc,
  toJSONObject: rc,
  isAsyncFn: nc,
  isThenable: oc,
  setImmediate: Oi,
  asap: ic,
  isIterable: Ri,
  isSafeIterable: sc
}, ac = p.toObjectSet([
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
]), cc = (e) => {
  const t = {};
  let r, n, o;
  return e && e.split(`
`).forEach(function(s) {
    o = s.indexOf(":"), r = s.substring(0, o).trim().toLowerCase(), n = s.substring(o + 1).trim();
    const a = p.hasOwnProp(t, r);
    !r || a && p.hasOwnProp(ac, r) || (r === "set-cookie" ? a ? t[r].push(n) : t[r] = [n] : t[r] = a ? t[r] + ", " + n : n);
  }), t;
};
function lc(e) {
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
const uc = new RegExp("[\\u0000-\\u0008\\u000a-\\u001f\\u007f]+", "g"), dc = new RegExp("[^\\u0009\\u0020-\\u007e\\u0080-\\u00ff]+", "g");
function En(e, t) {
  return p.isArray(e) ? e.map((r) => En(r, t)) : lc(String(e).replace(t, ""));
}
const fc = (e) => En(e, uc), pc = (e) => En(e, dc);
function vi(e) {
  const t = /* @__PURE__ */ Object.create(null);
  return p.forEach(e.toJSON(), (r, n) => {
    t[n] = pc(r);
  }), t;
}
const zn = /* @__PURE__ */ Symbol("internals");
function vt(e) {
  return e && String(e).trim().toLowerCase();
}
function ur(e) {
  return e === !1 || e == null ? e : p.isArray(e) ? e.map(ur) : fc(String(e));
}
function hc(e) {
  const t = /* @__PURE__ */ Object.create(null), r = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let n;
  for (; n = r.exec(e); )
    t[n[1]] = n[2];
  return t;
}
const mc = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
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
function gc(e) {
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
function yc(e) {
  const t = /* @__PURE__ */ Object.create(null), r = String(e);
  let n = 0, o = !1, i = !1;
  function s(a) {
    const c = jr(r.slice(n, a)), d = c.indexOf("=");
    if (d < 1)
      return;
    const u = jr(c.slice(0, d));
    if (!mc.test(u))
      return;
    const f = u.toLowerCase();
    if (f === "__proto__" || f === "constructor" || f === "prototype")
      return;
    const m = jr(c.slice(d + 1));
    t[f] = gc(m);
  }
  for (let a = 0; a < r.length; a++) {
    const c = r.charCodeAt(a);
    o ? i ? i = !1 : c === 92 ? i = !0 : c === 34 && (o = !1) : c === 34 ? o = !0 : (c === 44 || c === 59) && (s(a), n = a + 1);
  }
  return s(r.length), t;
}
const bc = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
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
function Sc(e) {
  return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (t, r, n) => r.toUpperCase() + n);
}
function Ec(e, t) {
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
let Oe = class {
  constructor(t) {
    t && this.set(t);
  }
  set(t, r, n) {
    const o = this;
    function i(a, c, d) {
      const u = vt(c);
      if (!u)
        return;
      const f = p.findKey(o, u);
      (!f || o[f] === void 0 || d === !0 || d === void 0 && o[f] !== !1) && (o[f || c] = ur(a));
    }
    const s = (a, c) => p.forEach(a, (d, u) => i(d, u, c));
    if (p.isPlainObject(t) || t instanceof this.constructor)
      s(t, r);
    else if (p.isString(t) && (t = t.trim()) && !bc(t))
      s(cc(t), r);
    else if (p.isObject(t) && p.isSafeIterable(t)) {
      let a = /* @__PURE__ */ Object.create(null), c, d;
      for (const u of t) {
        if (!p.isArray(u))
          throw new TypeError("Object iterator must return a key-value pair");
        d = u[0], p.hasOwnProp(a, d) ? (c = a[d], a[d] = p.isArray(c) ? [...c, u[1]] : [c, u[1]]) : a[d] = u[1];
      }
      s(a, r);
    } else
      t != null && i(r, t, n);
    return this;
  }
  get(t, r) {
    if (t = vt(t), t) {
      const n = p.findKey(this, t);
      if (n) {
        const o = this[n];
        if (!r)
          return o;
        if (r === !0)
          return hc(o);
        if (p.isFunction(r))
          return r.call(this, o, n);
        if (p.isRegExp(r))
          return r.exec(o);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(t, r) {
    if (t = vt(t), t) {
      const n = p.findKey(this, t);
      return !!(n && this[n] !== void 0 && (!r || Hr(this, this[n], n, r)));
    }
    return !1;
  }
  delete(t, r) {
    const n = this;
    let o = !1;
    function i(s) {
      if (s = vt(s), s) {
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
      const a = t ? Sc(i) : String(i).trim();
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
    return yc(t);
  }
  static concat(t, ...r) {
    const n = new this(t);
    return r.forEach((o) => n.set(o)), n;
  }
  static accessor(t) {
    const n = (this[zn] = this[zn] = {
      accessors: {}
    }).accessors, o = this.prototype;
    function i(s) {
      const a = vt(s);
      n[a] || (Ec(o, s), n[a] = !0);
    }
    return p.isArray(t) ? t.forEach(i) : i(t), this;
  }
};
Oe.accessor([
  "Content-Type",
  "Content-Length",
  "Accept",
  "Accept-Encoding",
  "User-Agent",
  "Authorization"
]);
p.reduceDescriptors(Oe.prototype, ({ value: e }, t) => {
  let r = t[0].toUpperCase() + t.slice(1);
  return {
    get: () => e,
    set(n) {
      this[r] = n;
    }
  };
});
p.freezeMethods(Oe);
const gr = "[REDACTED ****]";
function wc(e) {
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
function xc(e, t) {
  const r = new Set(t.map((i) => String(i).toLowerCase())), n = [], o = (i) => {
    if (i === null || typeof i != "object" || p.isBuffer(i)) return i;
    if (n.indexOf(i) !== -1) return;
    i instanceof Oe && (i = i.toJSON()), n.push(i);
    let s;
    if (p.isArray(i))
      s = [], i.forEach((a, c) => {
        const d = o(a);
        p.isUndefined(d) || (s[c] = d);
      });
    else {
      if (!p.isPlainObject(i) && wc(i))
        return n.pop(), i;
      s = /* @__PURE__ */ Object.create(null);
      for (const [a, c] of Object.entries(i)) {
        const d = r.has(a.toLowerCase()) ? gr : o(c);
        p.isUndefined(d) || (s[a] = d);
      }
    }
    return n.pop(), s;
  };
  return o(e);
}
function qn(e) {
  try {
    return String(e);
  } catch {
    return "";
  }
}
function Tc(e) {
  return e.errors.map((r) => {
    try {
      return r && r.message ? qn(r.message) : qn(r);
    } catch {
      return "";
    }
  }).filter(Boolean).join("; ") || e.name || "AggregateError";
}
let k = class Ai extends Error {
  static from(t, r, n, o, i, s) {
    let a = t.message;
    !a && p.isArray(t.errors) && t.errors.length && (a = Tc(t));
    const c = new Ai(a, r || t.code, n, o, i);
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
    const t = this.config, r = t && p.hasOwnProp(t, "redact") ? t.redact : void 0, n = p.isArray(r) && r.length > 0 ? xc(t, r) : p.toJSONObject(t);
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
k.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE";
k.ERR_BAD_OPTION = "ERR_BAD_OPTION";
k.ECONNABORTED = "ECONNABORTED";
k.ETIMEDOUT = "ETIMEDOUT";
k.ECONNREFUSED = "ECONNREFUSED";
k.ERR_NETWORK = "ERR_NETWORK";
k.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS";
k.ERR_DEPRECATED = "ERR_DEPRECATED";
k.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE";
k.ERR_BAD_REQUEST = "ERR_BAD_REQUEST";
k.ERR_CANCELED = "ERR_CANCELED";
k.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT";
k.ERR_INVALID_URL = "ERR_INVALID_URL";
k.ERR_FORM_DATA_DEPTH_EXCEEDED = "ERR_FORM_DATA_DEPTH_EXCEEDED";
const Cc = null, _i = 100;
function an(e) {
  return p.isPlainObject(e) || p.isArray(e);
}
function ki(e) {
  return p.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function Vr(e, t, r) {
  return e ? e.concat(t).map(function(o, i) {
    return o = ki(o), !r && i ? "[" + o + "]" : o;
  }).join(r ? "." : "") : t;
}
function Oc(e) {
  return p.isArray(e) && !e.some(an);
}
const Rc = p.toFlatObject(p, {}, null, function(t) {
  return /^is[A-Z]/.test(t);
});
function xr(e, t, r) {
  if (!p.isObject(e))
    throw new TypeError("target must be an object");
  t = t || new FormData();
  const n = (T, R) => {
    const x = p.getSafeProp(r, T);
    return p.isUndefined(x) ? R : x;
  }, o = n("metaTokens", !0), i = n("visitor") || h, s = n("dots", !1), a = n("indexes", !1), c = n("Blob") || typeof Blob < "u" && Blob, d = n("maxDepth", _i), u = c && p.isSpecCompliantForm(t), f = [];
  if (!p.isFunction(i))
    throw new TypeError("visitor must be a function");
  function m(T) {
    if (T === null) return "";
    if (p.isDate(T))
      return T.toISOString();
    if (p.isBoolean(T))
      return T.toString();
    if (!u && p.isBlob(T))
      throw new k("Blob is not supported. Use a Buffer instead.");
    if (p.isArrayBuffer(T) || p.isTypedArray(T)) {
      if (u && typeof c == "function")
        return new c([T]);
      throw new k(
        "Blob is not supported. Use a Buffer instead.",
        k.ERR_NOT_SUPPORT
      );
    }
    return T;
  }
  function S(T) {
    if (T > d)
      throw new k(
        "Object is too deeply nested (" + T + " levels). Max depth: " + d,
        k.ERR_FORM_DATA_DEPTH_EXCEEDED
      );
  }
  function b(T, R) {
    if (d === 1 / 0)
      return JSON.stringify(T);
    const x = [];
    return JSON.stringify(T, function(I, X) {
      if (!p.isObject(X))
        return X;
      for (; x.length && x[x.length - 1] !== this; )
        x.pop();
      return x.push(X), S(R + x.length - 1), X;
    });
  }
  function h(T, R, x) {
    let w = T;
    if (p.isReactNative(t) && p.isReactNativeBlob(T))
      return t.append(Vr(x, R, s), m(T)), !1;
    if (T && !x && typeof T == "object") {
      if (p.endsWith(R, "{}"))
        R = o ? R : R.slice(0, -2), T = b(T, 1);
      else if (p.isArray(T) && Oc(T) || (p.isFileList(T) || p.endsWith(R, "[]")) && (w = p.toArray(T)))
        return R = ki(R), w.forEach(function(X, V) {
          !(p.isUndefined(X) || X === null) && t.append(
            // eslint-disable-next-line no-nested-ternary
            a === !0 ? Vr([R], V, s) : a === null ? R : R + "[]",
            m(X)
          );
        }), !1;
    }
    return an(T) ? !0 : (t.append(Vr(x, R, s), m(T)), !1);
  }
  const C = Object.assign(Rc, {
    defaultVisitor: h,
    convertValue: m,
    isVisitable: an
  });
  function y(T, R, x = 0) {
    if (!p.isUndefined(T)) {
      if (S(x), f.indexOf(T) !== -1)
        throw new Error("Circular reference detected in " + R.join("."));
      f.push(T), p.forEach(T, function(I, X) {
        (!(p.isUndefined(I) || I === null) && i.call(t, I, p.isString(X) ? X.trim() : X, R, C)) === !0 && y(I, R ? R.concat(X) : [X], x + 1);
      }), f.pop();
    }
  }
  if (!p.isObject(e))
    throw new TypeError("data must be an object");
  return y(e), t;
}
function Kn(e) {
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
function wn(e, t) {
  this._pairs = [], e && xr(e, this, t);
}
const Pi = wn.prototype;
Pi.append = function(t, r) {
  this._pairs.push([t, r]);
};
Pi.toString = function(t) {
  const r = t ? (n) => t.call(this, n, Kn) : Kn;
  return this._pairs.map(function(o) {
    return r(o[0]) + "=" + r(o[1]);
  }, "").join("&");
};
function vc(e) {
  return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function Ni(e, t, r) {
  if (!t)
    return e;
  e = e || "";
  const n = p.isFunction(r) ? {
    serialize: r
  } : r, o = p.getSafeProp(n, "encode") || vc, i = p.getSafeProp(n, "serialize");
  let s;
  if (i ? s = i(t, n) : s = p.isURLSearchParams(t) ? t.toString() : new wn(t, n).toString(o), s) {
    const a = e.indexOf("#");
    a !== -1 && (e = e.slice(0, a)), e += (e.indexOf("?") === -1 ? "?" : "&") + s;
  }
  return e;
}
const At = /* @__PURE__ */ Symbol("internals");
function Ii(e) {
  return e ? e.length : 0;
}
function Gn(e) {
  if (e)
    for (; e.length && e[e.length - 1] === null; )
      e.pop();
}
function _t(e, t) {
  const r = e.handlers, n = Ii(r);
  r !== t.handlersRef ? (t.handlersRef = r, t.handlerEntries.clear()) : n !== t.handlersLength && (n ? t.handlerEntries.forEach(function(i, s) {
    r[i.index] !== i.handler && t.handlerEntries.delete(s);
  }) : t.handlerEntries.clear()), t.handlersLength = n;
}
class Yn {
  constructor() {
    this.handlers = [], this[At] = {
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
    }, i = this[At];
    this.handlers == null && (this.handlers = []), _t(this, i);
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
    const r = this[At];
    _t(this, r);
    const n = r.handlerEntries.get(t);
    if (n) {
      if (r.handlerEntries.delete(t), this.handlers[n.index] !== n.handler)
        return;
      this.handlers[n.index] = null, r.iterationDepth || (Gn(this.handlers), r.handlersLength = this.handlers.length);
    }
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    this.handlers && (this.handlers = [], _t(this, this[At]));
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
    const r = this[At];
    _t(this, r), r.iterationDepth++;
    try {
      p.forEach(this.handlers, function(o) {
        o !== null && t(o);
      });
    } finally {
      --r.iterationDepth || (_t(this, r), Gn(this.handlers), r.handlersLength = Ii(this.handlers));
    }
  }
}
const xn = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1,
  legacyInterceptorReqResOrdering: !0,
  advertiseZstdAcceptEncoding: !1,
  validateStatusUndefinedResolves: !0
}, Ac = typeof URLSearchParams < "u" ? URLSearchParams : wn, _c = typeof FormData < "u" ? FormData : null, kc = typeof Blob < "u" ? Blob : null, Pc = {
  isBrowser: !0,
  classes: {
    URLSearchParams: Ac,
    FormData: _c,
    Blob: kc
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
}, Tn = typeof window < "u" && typeof document < "u", cn = typeof navigator == "object" && navigator || void 0, Nc = Tn && (!cn || ["ReactNative", "NativeScript", "NS"].indexOf(cn.product) < 0), Ic = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", $c = Tn && window.location.href || "http://localhost", Lc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: Tn,
  hasStandardBrowserEnv: Nc,
  hasStandardBrowserWebWorkerEnv: Ic,
  navigator: cn,
  origin: $c
}, Symbol.toStringTag, { value: "Module" })), xe = {
  ...Lc,
  ...Pc
};
function Dc(e, t) {
  return xr(e, new xe.classes.URLSearchParams(), {
    visitor: function(r, n, o, i) {
      return xe.isNode && p.isBuffer(r) ? (this.append(n, r.toString("base64")), !1) : i.defaultVisitor.apply(this, arguments);
    },
    ...t
  });
}
const Jn = _i;
function $i(e) {
  if (e > Jn)
    throw new k(
      "FormData field is too deeply nested (" + e + " levels). Max depth: " + Jn,
      k.ERR_FORM_DATA_DEPTH_EXCEEDED
    );
}
function Mc(e) {
  const t = [], r = /[^.[\]]+|\[([^.[\]]*)]/g;
  let n;
  for (; (n = r.exec(e)) !== null; )
    $i(t.length), t.push(n[0] === "[]" ? "" : n[1] || n[0]);
  return t;
}
function Fc(e) {
  const t = {}, r = Object.keys(e);
  let n;
  const o = r.length;
  let i;
  for (n = 0; n < o; n++)
    i = r[n], t[i] = e[i];
  return t;
}
function Li(e) {
  function t(r, n, o, i) {
    $i(i);
    let s = r[i++];
    if (s === "__proto__") return !0;
    const a = Number.isFinite(+s), c = i >= r.length;
    return s = !s && p.isArray(o) ? o.length : s, c ? (p.hasOwnProp(o, s) ? o[s] = p.isArray(o[s]) ? o[s].concat(n) : [o[s], n] : o[s] = n, !a) : ((!p.hasOwnProp(o, s) || !p.isObject(o[s])) && (o[s] = []), t(r, n, o[s], i) && p.isArray(o[s]) && (o[s] = Fc(o[s])), !a);
  }
  if (p.isFormData(e) && p.isFunction(e.entries)) {
    const r = {};
    return p.forEachEntry(e, (n, o) => {
      t(Mc(n), o, r, 0);
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
]), ht = (e, t) => e != null && p.hasOwnProp(e, t) ? e[t] : void 0;
function Bc(e, t, r) {
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
  transitional: xn,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [
    function(t, r) {
      const n = r.getContentType() || "", o = n.indexOf("application/json") > -1, i = p.isObject(t);
      if (i && p.isHTMLForm(t) && (t = new FormData(t)), p.isFormData(t))
        return o ? JSON.stringify(Li(t)) : t;
      if (p.isArrayBuffer(t) || p.isBuffer(t) || p.isStream(t) || p.isFile(t) || p.isBlob(t) || p.isReadableStream(t))
        return t;
      if (p.isArrayBufferView(t))
        return t.buffer;
      if (p.isURLSearchParams(t))
        return r.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), t.toString();
      let a;
      if (i) {
        const c = ht(this, "formSerializer");
        if (n.indexOf("application/x-www-form-urlencoded") > -1)
          return Dc(t, c).toString();
        if ((a = p.isFileList(t)) || n.indexOf("multipart/form-data") > -1) {
          const d = ht(this, "env"), u = d && d.FormData;
          return xr(
            a ? { "files[]": t } : t,
            u && new u(),
            c
          );
        }
      }
      return i || o ? (r.setContentType("application/json", !1), Bc(t)) : t;
    }
  ],
  transformResponse: [
    function(t) {
      const r = ht(this, "transitional") || Gt.transitional, n = r && r.forcedJSONParsing, o = ht(this, "responseType"), i = o === "json";
      if (p.isResponse(t) || p.isReadableStream(t))
        return t;
      if (t && p.isString(t) && (n && !o || i)) {
        const a = !(r && r.silentJSONParsing) && i;
        try {
          return JSON.parse(t, ht(this, "parseReviver"));
        } catch (c) {
          if (a)
            throw c.name === "SyntaxError" ? k.from(c, k.ERR_BAD_RESPONSE, this, null, ht(this, "response")) : c;
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
    FormData: xe.classes.FormData,
    Blob: xe.classes.Blob
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
  const r = this || Gt, n = t || r, o = Oe.from(n.headers);
  let i = n.data;
  return p.forEach(e, function(a) {
    i = a.call(r, i, o.normalize(), t ? t.status : void 0);
  }), o.normalize(), i;
}
function Mi(e) {
  return !!(e && e.__CANCEL__);
}
let Yt = class extends k {
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
    super(t ?? "canceled", k.ERR_CANCELED, r, n), this.name = "CanceledError", this.__CANCEL__ = !0;
  }
};
function Fi(e, t, r) {
  const n = r.config.validateStatus;
  !r.status || !n || n(r.status) ? e(r) : t(new k(
    "Request failed with status code " + r.status,
    r.status >= 400 && r.status < 500 ? k.ERR_BAD_REQUEST : k.ERR_BAD_RESPONSE,
    r.config,
    r.request,
    r
  ));
}
const Uc = /[\t\n\r]/g;
function Bi(e) {
  if (typeof e != "string")
    return e;
  let t = 0;
  for (; t < e.length && e.charCodeAt(t) <= 32; )
    t++;
  return e.slice(t).replace(Uc, "");
}
function zr(e) {
  const t = /^([-+\w]{1,25}):(?:\/\/)?/.exec(e);
  return t && t[1] || "";
}
function jc(e, t) {
  e = e || 10;
  const r = new Array(e), n = new Array(e);
  let o = 0, i = 0, s;
  return t = t !== void 0 ? t : 1e3, function(c) {
    const d = Date.now(), u = n[i];
    s || (s = d), r[o] = c, n[o] = d;
    let f = i, m = 0;
    for (; f !== o; )
      m += r[f++], f = f % e;
    if (o = (o + 1) % e, o === i && (i = (i + 1) % e), d - s < t)
      return;
    const S = u && d - u;
    return S ? Math.round(m * 1e3 / S) : void 0;
  };
}
function Hc(e, t) {
  let r = 0, n = 1e3 / t, o, i;
  const s = (u, f = Date.now()) => {
    r = f, o = null, i && (clearTimeout(i), i = null), e(...u);
  };
  return [(...u) => {
    const f = Date.now(), m = f - r;
    m >= n ? s(u, f) : (o = u, i || (i = setTimeout(() => {
      i = null, s(o);
    }, n - m)));
  }, () => o && s(o), (...u) => s(u)];
}
const yr = (e, t, r = 3) => {
  let n = 0;
  const o = jc(50, 250);
  return Hc((i) => {
    if (!i || !p.isNumber(i.loaded))
      return;
    const s = i.loaded, a = i.lengthComputable ? i.total : void 0, c = Math.max(0, a != null ? Math.min(s, a) : s), d = Math.max(0, c - n), u = o(d);
    n = Math.max(n, c);
    const f = {
      loaded: c,
      total: a,
      progress: a ? c / a : void 0,
      bytes: d,
      rate: u || void 0,
      estimated: u && a ? (a - c) / u : void 0,
      event: i,
      lengthComputable: a != null,
      [t ? "download" : "upload"]: !0
    };
    e(f);
  }, r);
}, Xn = (e, t) => {
  const r = e != null;
  return [
    (n) => t[0]({
      lengthComputable: r,
      total: e,
      loaded: n
    }),
    t[1]
  ];
}, Zn = (e, t = p.asap) => (...r) => t(() => e(...r)), Vc = xe.hasStandardBrowserEnv ? /* @__PURE__ */ ((e, t) => (r) => (r = new URL(r, xe.origin), e.protocol === r.protocol && e.host === r.host && (t || e.port === r.port)))(
  new URL(xe.origin),
  xe.navigator && /(msie|trident)/i.test(xe.navigator.userAgent)
) : () => !0, Wc = xe.hasStandardBrowserEnv ? (
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
function zc(e) {
  return typeof e != "string" ? !1 : /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
function qc(e, t) {
  if (!t)
    return e;
  let r = e.length;
  for (; r > 0 && e.charCodeAt(r - 1) === 47; )
    r--;
  return e.slice(0, r) + "/" + t.replace(/^\/+/, "");
}
const Kc = /^https?:(?!\/\/)/i;
function Gc(e) {
  return e && e.replace(/(^|&)([^=&]*=)?[^&]+/g, (t, r, n = "") => `${r}${n}${gr}`);
}
function Yc(e) {
  const t = e.replace(/^(https?:\/{0,2})[^/?#]*@/i, `$1${gr}@`), r = t.indexOf("#"), o = (r === -1 ? t : t.slice(0, r)).replace(
    /([?&][^=&#]*=)[^&#]*/g,
    `$1${gr}`
  );
  return r === -1 ? o : `${o}#${Gc(t.slice(r + 1))}`;
}
function Qn(e, t) {
  if (typeof e == "string") {
    const r = Bi(e);
    if (Kc.test(r))
      throw new k(
        `Invalid URL ${JSON.stringify(Yc(r))}: missing "//" after protocol`,
        k.ERR_INVALID_URL,
        t
      );
  }
}
function Ui(e, t, r, n) {
  Qn(t, n);
  let o = !zc(t);
  return e && (o || r === !1) ? (Qn(e, n), qc(e, t)) : t;
}
const eo = (e) => e instanceof Oe ? { ...e } : e, Jc = (e) => Object.getOwnPropertySymbols && Object.getOwnPropertyDescriptor ? Object.keys(e).concat(
  Object.getOwnPropertySymbols(e).filter(
    (t) => Object.getOwnPropertyDescriptor(e, t).enumerable
  )
) : Object.keys(e);
function pt(e, t) {
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
  function n(u, f, m, S) {
    return p.isPlainObject(u) && p.isPlainObject(f) ? p.merge.call({ caseless: S }, u, f) : p.isPlainObject(f) ? p.merge({}, f) : p.isArray(f) ? f.slice() : f;
  }
  function o(u, f, m, S) {
    if (p.isUndefined(f)) {
      if (!p.isUndefined(u))
        return n(void 0, u, m, S);
    } else return n(u, f, m, S);
  }
  function i(u, f) {
    if (!p.isUndefined(f))
      return n(void 0, f);
  }
  function s(u, f) {
    if (p.isUndefined(f)) {
      if (!p.isUndefined(u))
        return n(void 0, u);
    } else return n(void 0, f);
  }
  function a(u) {
    const f = p.hasOwnProp(t, "transitional") ? t.transitional : void 0;
    if (!p.isUndefined(f))
      if (p.isPlainObject(f)) {
        if (p.hasOwnProp(f, u))
          return f[u];
      } else
        return;
    const m = p.hasOwnProp(e, "transitional") ? e.transitional : void 0;
    if (p.isPlainObject(m) && p.hasOwnProp(m, u))
      return m[u];
  }
  function c(u, f, m) {
    if (p.hasOwnProp(t, m))
      return n(u, f);
    if (p.hasOwnProp(e, m))
      return n(void 0, u);
  }
  const d = {
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
    headers: (u, f, m) => o(eo(u), eo(f), m, !0)
  };
  return p.forEach(Jc({ ...e, ...t }), function(f) {
    if (f === "__proto__" || f === "constructor" || f === "prototype") return;
    const m = p.hasOwnProp(d, f) ? d[f] : o, S = p.hasOwnProp(e, f) ? e[f] : void 0, b = p.hasOwnProp(t, f) ? t[f] : void 0, h = m(S, b, f);
    p.isUndefined(h) && m !== c || (r[f] = h);
  }), p.hasOwnProp(t, "validateStatus") && p.isUndefined(t.validateStatus) && a("validateStatusUndefinedResolves") === !1 && (p.hasOwnProp(e, "validateStatus") ? r.validateStatus = n(void 0, e.validateStatus) : delete r.validateStatus), r;
}
const Xc = ["content-type", "content-length"];
function Zc(e, t, r) {
  if (r !== "content-only") {
    e.set(t);
    return;
  }
  Object.entries(t || {}).forEach(([n, o]) => {
    Xc.includes(n.toLowerCase()) && e.set(n, o);
  });
}
const Qc = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, r) => String.fromCharCode(parseInt(r, 16))
);
function ji(e) {
  const t = pt({}, e), r = (m) => p.hasOwnProp(t, m) ? t[m] : void 0, n = r("data");
  let o = r("withXSRFToken");
  const i = r("xsrfHeaderName"), s = r("xsrfCookieName");
  let a = r("headers");
  const c = r("auth"), d = r("baseURL"), u = r("allowAbsoluteUrls"), f = r("url");
  if (t.headers = a = Oe.from(a), t.url = Ni(
    Ui(d, f, u, t),
    r("params"),
    r("paramsSerializer")
  ), c) {
    const m = p.getSafeProp(c, "username") || "", S = p.getSafeProp(c, "password") || "";
    try {
      a.set(
        "Authorization",
        "Basic " + btoa(m + ":" + (S ? Qc(S) : ""))
      );
    } catch (b) {
      throw k.from(b, k.ERR_BAD_OPTION_VALUE, e);
    }
  }
  if (p.isFormData(n)) {
    const m = p.getSafeProp(n, "getHeaders");
    xe.hasStandardBrowserEnv || xe.hasStandardBrowserWebWorkerEnv || p.isReactNative(n) ? a.setContentType(void 0) : p.isFunction(m) && Zc(a, m.call(n), r("formDataHeaderPolicy"));
  }
  if (xe.hasStandardBrowserEnv && (p.isFunction(o) && (o = o(t)), o === !0 || o == null && Vc(t.url))) {
    const S = i && s && Wc.read(s);
    S && a.set(i, S);
  }
  return t;
}
const el = typeof XMLHttpRequest < "u", tl = el && function(e) {
  return new Promise(function(r, n) {
    const o = ji(e);
    let i = o.data;
    const s = Oe.from(o.headers).normalize();
    let { responseType: a, onUploadProgress: c, onDownloadProgress: d } = o, u, f, m, S, b, h;
    function C() {
      S && S(), b && b(), o.cancelToken && o.cancelToken.unsubscribe(u), o.signal && o.signal.removeEventListener("abort", u);
    }
    let y = new XMLHttpRequest();
    y.open(o.method.toUpperCase(), o.url, !0), y.timeout = o.timeout;
    function T(x) {
      if (!y)
        return;
      if (y.status === 0 && (zr(Bi(o.url)) || zr(xe.origin)) !== "file" && !(y.responseURL && y.responseURL.startsWith("file:"))) {
        n(new k("Request aborted", k.ECONNABORTED, e, y)), C(), y = null;
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
      const w = Oe.from(
        "getAllResponseHeaders" in y && y.getAllResponseHeaders()
      ), X = {
        data: !a || a === "text" || a === "json" ? y.responseText : y.response,
        status: y.status,
        statusText: y.statusText,
        headers: w,
        config: e,
        request: y
      };
      Fi(
        function(D) {
          r(D), C();
        },
        function(D) {
          n(D), C();
        },
        X
      ), y = null;
    }
    "onloadend" in y ? y.onloadend = T : y.onreadystatechange = function() {
      !y || y.readyState !== 4 || y.status === 0 && !(y.responseURL && y.responseURL.startsWith("file:")) || setTimeout(T);
    }, y.onabort = function() {
      y && (n(new k("Request aborted", k.ECONNABORTED, e, y)), C(), y = null);
    }, y.onerror = function(w) {
      const I = w && w.message ? w.message : "Network Error", X = new k(I, k.ERR_NETWORK, e, y);
      X.event = w || null, n(X), C(), y = null;
    }, y.ontimeout = function() {
      let w = o.timeout ? "timeout of " + o.timeout + "ms exceeded" : "timeout exceeded";
      const I = o.transitional || xn;
      o.timeoutErrorMessage && (w = o.timeoutErrorMessage), n(
        new k(
          w,
          I.clarifyTimeoutError ? k.ETIMEDOUT : k.ECONNABORTED,
          e,
          y
        )
      ), C(), y = null;
    }, i === void 0 && s.setContentType(null), "setRequestHeader" in y && p.forEach(vi(s), function(w, I) {
      y.setRequestHeader(I, w);
    }), p.isUndefined(o.withCredentials) || (y.withCredentials = !!o.withCredentials), a && a !== "json" && (y.responseType = o.responseType), d && ([m, b, h] = yr(
      d,
      !0
    ), y.addEventListener("progress", m)), c && y.upload && ([f, S] = yr(c), y.upload.addEventListener("progress", f), y.upload.addEventListener("loadend", S)), (o.cancelToken || o.signal) && (u = (x) => {
      y && (n(!x || x.type ? new Yt(null, e, y) : x), y.abort(), C(), y = null);
    }, o.cancelToken && o.cancelToken.subscribe(u), o.signal && (o.signal.aborted ? u() : o.signal.addEventListener("abort", u)));
    const R = zr(o.url);
    if (R && !xe.protocols.includes(R)) {
      n(
        new k(
          "Unsupported protocol " + R + ":",
          k.ERR_BAD_REQUEST,
          e
        )
      ), C();
      return;
    }
    y.send(i || null);
  });
}, rl = (e, t) => {
  if (e = e ? e.filter(Boolean) : [], !t && !e.length)
    return;
  const r = new AbortController();
  let n = !1;
  const o = function(c) {
    if (!n) {
      n = !0, s();
      const d = c instanceof Error ? c : this.reason;
      r.abort(
        d instanceof k ? d : new Yt(d instanceof Error ? d.message : d)
      );
    }
  };
  let i = t && setTimeout(() => {
    i = null, o(new k(`timeout of ${t}ms exceeded`, k.ETIMEDOUT));
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
}, nl = function* (e, t) {
  let r = e.byteLength;
  if (r < t) {
    yield e;
    return;
  }
  let n = 0, o;
  for (; n < r; )
    o = n + t, yield e.slice(n, o), n = o;
}, ol = async function* (e, t) {
  for await (const r of il(e))
    yield* nl(r, t);
}, il = async function* (e) {
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
}, to = (e, t, r, n) => {
  const o = ol(e, t);
  let i = 0, s, a = (c) => {
    s || (s = !0, n && n(c));
  };
  return new ReadableStream(
    {
      async pull(c) {
        try {
          const { done: d, value: u } = await o.next();
          if (d) {
            a(), c.close();
            return;
          }
          let f = u.byteLength;
          if (r) {
            let m = i += f;
            r(m);
          }
          c.enqueue(new Uint8Array(u));
        } catch (d) {
          throw a(d), d;
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
}, ro = (e) => e >= 48 && e <= 57 || e >= 65 && e <= 70 || e >= 97 && e <= 102, Hi = (e, t, r) => t + 2 < r && ro(e.charCodeAt(t + 1)) && ro(e.charCodeAt(t + 2)), no = (e) => e <= 57 ? e - 48 : (e & 223) - 55, sl = (e) => e >= 65 && e <= 90 || // A-Z
e >= 97 && e <= 122 || // a-z
e >= 48 && e <= 57 || // 0-9
e === 43 || // +
e === 47 || // /
e === 45 || // - (base64url)
e === 95, al = (e) => e === 9 || e === 10 || e === 12 || e === 13 || e === 32, cl = (e) => {
  const t = Math.floor(e / 4), r = e % 4;
  return t * 3 + (r === 2 ? 1 : r === 3 ? 2 : 0);
}, ll = (e) => {
  const t = e.length;
  let r = 0;
  return t > 0 && e.charCodeAt(t - 1) === 61 && (r++, t > 1 && e.charCodeAt(t - 2) === 61 && r++), Math.floor((t - r) * 3 / 4);
}, ul = (e) => {
  const t = e.length;
  let r = 0, n = 0, o = !1;
  for (let i = 0; i < t; i++) {
    let s = e.charCodeAt(i);
    if (s === 37 && Hi(e, i, t) && (s = no(e.charCodeAt(i + 1)) * 16 + no(e.charCodeAt(i + 2)), i += 2), !al(s)) {
      if (s === 61) {
        n++;
        continue;
      }
      if (!sl(s) || n > 0) {
        o = !0;
        continue;
      }
      r++;
    }
  }
  return o || n > 2 || n > 0 && (r + n) % 4 !== 0 || r % 4 === 1 ? ll(e) : cl(r);
}, dl = (e, t) => {
  if (!e || typeof e != "string" || !e.startsWith("data:")) return 0;
  const r = e.indexOf(",");
  if (r < 0) return 0;
  const n = e.slice(5, r), o = e.slice(r + 1);
  if (/;base64/i.test(n))
    return t(o);
  let s = 0;
  for (let a = 0, c = o.length; a < c; a++) {
    const d = o.charCodeAt(a);
    if (d === 37 && Hi(o, a, c))
      s += 1, a += 2;
    else if (d < 128)
      s += 1;
    else if (d < 2048)
      s += 2;
    else if (d >= 55296 && d <= 56319 && a + 1 < c) {
      const u = o.charCodeAt(a + 1);
      u >= 56320 && u <= 57343 ? (s += 4, a++) : s += 3;
    } else
      s += 3;
  }
  return s;
};
function fl(e) {
  const t = typeof e == "string" ? e.indexOf("#") : -1;
  return dl(
    t === -1 ? e : e.slice(0, t),
    ul
  );
}
const Cn = "1.20.0", oo = 64 * 1024, pl = {
  cache: "default",
  redirect: "follow",
  referrer: "about:client",
  referrerPolicy: "",
  mode: "cors",
  integrity: "",
  keepalive: !1,
  priority: "auto",
  window: null
}, { isFunction: Qt } = p, hl = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, r) => String.fromCharCode(parseInt(r, 16))
), io = (e) => {
  if (!p.isString(e))
    return e;
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}, so = (e, ...t) => {
  try {
    return !!e(...t);
  } catch {
    return !1;
  }
}, ml = (e) => {
  const t = e.indexOf("://");
  let r = e;
  return t !== -1 && (r = r.slice(t + 3)), r.includes("@") || r.includes(":");
}, gl = (e) => {
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
  const { fetch: o, Request: i, Response: s } = e, a = o ? Qt(o) : typeof fetch == "function", c = Qt(i), d = Qt(s);
  if (!a)
    return !1;
  const u = a && Qt(r), f = a && (typeof n == "function" ? /* @__PURE__ */ ((y) => (T) => y.encode(T))(new n()) : async (y) => new Uint8Array(await new i(y).arrayBuffer())), m = c && u && so(() => {
    let y = !1;
    const T = new i(xe.origin, {
      body: new r(),
      method: "POST",
      get duplex() {
        return y = !0, "half";
      }
    }), R = T.headers.has("Content-Type");
    return T.body != null && T.body.cancel(), y && !R;
  }), S = d && u && so(() => p.isReadableStream(new s("").body)), b = {
    stream: S && ((y) => y.body)
  };
  a && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((y) => {
    !b[y] && (b[y] = (T, R) => {
      let x = T && T[y];
      if (x)
        return x.call(T);
      throw new k(
        `Response type '${y}' is not supported`,
        k.ERR_NOT_SUPPORT,
        R
      );
    });
  });
  const h = async (y) => {
    if (y == null)
      return 0;
    if (p.isBlob(y))
      return y.size;
    if (p.isSpecCompliantForm(y))
      return (await new i(xe.origin, {
        method: "POST",
        body: y
      }).arrayBuffer()).byteLength;
    if (p.isArrayBufferView(y) || p.isArrayBuffer(y))
      return y.byteLength;
    if (p.isURLSearchParams(y) && (y = y + ""), p.isString(y))
      return (await f(y)).byteLength;
  }, C = async (y, T) => {
    const R = p.toFiniteNumber(y.getContentLength());
    return R ?? h(T);
  };
  return async (y) => {
    let {
      url: T,
      method: R,
      data: x,
      signal: w,
      cancelToken: I,
      timeout: X,
      onDownloadProgress: V,
      onUploadProgress: D,
      responseType: U,
      headers: z,
      withCredentials: l = "same-origin",
      fetchOptions: F,
      maxContentLength: _,
      maxBodyLength: Z,
      maxRedirects: K
    } = ji(y);
    const M = p.isNumber(_) && _ > -1, fe = p.isNumber(Z) && Z > -1, Be = (N) => p.hasOwnProp(y, N) ? y[N] : void 0;
    let O = o || fetch;
    U = U ? (U + "").toLowerCase() : "text";
    let P = rl(
      [w, I && I.toAbortSignal()],
      X
    ), $ = null;
    const B = P && P.unsubscribe && (() => {
      P.unsubscribe();
    });
    let q, J = null;
    const Y = () => new k(
      "Request body larger than maxBodyLength limit",
      k.ERR_BAD_REQUEST,
      y,
      $
    );
    try {
      let N;
      const H = Be("auth");
      if (H) {
        const G = p.getSafeProp(H, "username") || "", ae = p.getSafeProp(H, "password") || "";
        N = {
          username: G,
          password: ae
        };
      }
      if (ml(T)) {
        const G = new URL(T, xe.origin);
        if (!N && (G.username || G.password)) {
          const ae = io(G.username), _e = io(G.password);
          N = {
            username: ae,
            password: _e
          };
        }
        (G.username || G.password) && (G.username = "", G.password = "", T = G.href);
      }
      if (N && (z.delete("authorization"), z.set(
        "Authorization",
        "Basic " + btoa(hl((N.username || "") + ":" + (N.password || "")))
      )), M && typeof T == "string" && T.startsWith("data:") && fl(T) > _)
        throw new k(
          "maxContentLength size of " + _ + " exceeded",
          k.ERR_BAD_RESPONSE,
          y,
          $
        );
      if (fe && R !== "get" && R !== "head") {
        const G = await h(x);
        if (typeof G == "number" && isFinite(G) && (q = G, G > Z))
          throw Y();
      }
      const Q = fe && (p.isReadableStream(x) || p.isStream(x)), te = (G, ae, _e) => to(
        G,
        oo,
        ($e) => {
          if (fe && $e > Z)
            throw J = Y();
          ae && ae($e);
        },
        _e
      );
      if (m && R !== "get" && R !== "head" && (D || Q)) {
        if (q = q ?? await C(z, x), q !== 0 || Q) {
          let G = new i(T, {
            method: "POST",
            body: x,
            duplex: "half"
          }), ae;
          if (p.isFormData(x) && (ae = G.headers.get("content-type")) && z.setContentType(ae), G.body) {
            const [_e, $e] = D && Xn(
              q,
              yr(Zn(D))
            ) || [];
            x = te(G.body, _e, $e);
          }
        }
      } else if (Q && !c && u && R !== "get" && R !== "head")
        x = te(x);
      else if (Q && c && !m && R !== "get" && R !== "head")
        throw new k(
          "Stream request bodies are not supported by the current fetch implementation",
          k.ERR_NOT_SUPPORT,
          y,
          $
        );
      p.isString(l) || (l = l ? "include" : "omit");
      const ye = c && "credentials" in i.prototype;
      if (p.isFormData(x)) {
        const G = z.getContentType();
        G && /^multipart\/form-data/i.test(G) && !/boundary=/i.test(G) && z.delete("content-type");
      }
      z.set("User-Agent", "axios/" + Cn, !1);
      const A = F == null ? F : Object.assign(/* @__PURE__ */ Object.create(null), F);
      A && (delete A.body, delete A.headers, delete A.method, delete A.signal, delete A.duplex, delete A.credentials);
      const W = Object.assign(/* @__PURE__ */ Object.create(null), A, {
        signal: P,
        method: R.toUpperCase(),
        headers: vi(z.normalize()),
        body: x,
        duplex: "half",
        credentials: ye ? l : void 0
      });
      c && (p.forEach(pl, (G, ae) => {
        W[ae] === void 0 && (W[ae] = G);
      }), W.signal === void 0 && (W.signal = null), W.body === void 0 && (W.body = null)), K === 0 && (W.redirect = "manual", A && (A.redirect = "manual")), $ = c && new i(T, W);
      let re = await (c ? O($, A) : O(T, W));
      const pe = Oe.from(re.headers);
      if (M) {
        const G = p.toFiniteNumber(pe.getContentLength());
        if (G != null && G > _)
          throw new k(
            "maxContentLength size of " + _ + " exceeded",
            k.ERR_BAD_RESPONSE,
            y,
            $
          );
      }
      const Rt = S && (U === "stream" || U === "response");
      if (S && re.body && (V || M || Rt && B)) {
        const G = {};
        ["status", "statusText", "headers"].forEach((Ze) => {
          G[Ze] = re[Ze];
        });
        const ae = p.toFiniteNumber(pe.getContentLength()), [_e, $e] = V && Xn(
          ae,
          yr(Zn(V), !0)
        ) || [];
        let Xe = 0;
        const Mr = (Ze) => {
          if (M && (Xe = Ze, Xe > _))
            throw new k(
              "maxContentLength size of " + _ + " exceeded",
              k.ERR_BAD_RESPONSE,
              y,
              $
            );
          _e && _e(Ze);
        };
        re = new s(
          to(re.body, oo, Mr, () => {
            $e && $e(), B && B();
          }),
          G
        );
      }
      U = U || "text";
      let Ie = await b[p.findKey(b, U) || "text"](
        re,
        y
      );
      if (M && !S && !Rt) {
        let G;
        if (Ie != null && (typeof Ie.byteLength == "number" ? G = Ie.byteLength : typeof Ie.size == "number" ? G = Ie.size : typeof Ie == "string" && (G = typeof n == "function" ? new n().encode(Ie).byteLength : Ie.length)), typeof G == "number" && G > _)
          throw new k(
            "maxContentLength size of " + _ + " exceeded",
            k.ERR_BAD_RESPONSE,
            y,
            $
          );
      }
      return !Rt && B && B(), await new Promise((G, ae) => {
        Fi(G, ae, {
          data: Ie,
          headers: Oe.from(re.headers),
          status: re.status,
          statusText: re.statusText,
          config: y,
          request: $
        });
      });
    } catch (N) {
      if (B && B(), P && P.aborted && P.reason instanceof k) {
        const H = P.reason;
        throw H.config = y, $ && (H.request = $), N !== H && Object.defineProperty(H, "cause", {
          __proto__: null,
          value: N,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), H;
      }
      if (J)
        throw $ && !J.request && (J.request = $), J;
      if (N instanceof k)
        throw $ && !N.request && (N.request = $), N;
      if (N && N.name === "TypeError" && /Load failed|fetch/i.test(N.message)) {
        const H = new k(
          "Network Error",
          k.ERR_NETWORK,
          y,
          $,
          N && N.response
        );
        throw Object.defineProperty(H, "cause", {
          __proto__: null,
          value: N.cause || N,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), H;
      }
      throw k.from(N, N && N.code, y, $, N && N.response);
    }
  };
}, yl = /* @__PURE__ */ new Map(), Vi = (e) => {
  let t = e && e.env || {};
  const { fetch: r, Request: n, Response: o } = t, i = [n, o, r];
  let s = i.length, a = s, c, d, u = yl;
  for (; a--; )
    c = i[a], d = u.get(c), d === void 0 && u.set(c, d = a ? /* @__PURE__ */ new Map() : gl(t)), u = d;
  return d;
};
Vi();
const On = {
  http: Cc,
  xhr: tl,
  fetch: {
    get: Vi
  }
};
p.forEach(On, (e, t) => {
  if (e) {
    try {
      Object.defineProperty(e, "name", { __proto__: null, value: t });
    } catch {
    }
    Object.defineProperty(e, "adapterName", { __proto__: null, value: t });
  }
});
const ao = (e) => `- ${e}`, bl = (e) => p.isFunction(e) || e === null || e === !1;
function Sl(e, t) {
  e = p.isArray(e) ? e : [e];
  const { length: r } = e;
  let n, o;
  const i = {};
  for (let s = 0; s < r; s++) {
    n = e[s];
    let a;
    if (o = n, !bl(n) && (o = On[(a = String(n)).toLowerCase()], o === void 0))
      throw new k(`Unknown adapter '${a}'`);
    if (o && (p.isFunction(o) || (o = o.get(t))))
      break;
    i[a || "#" + s] = o;
  }
  if (!o) {
    const s = Object.entries(i).map(
      ([c, d]) => `adapter ${c} ` + (d === !1 ? "is not supported by the environment" : "is not available in the build")
    );
    let a = r ? s.length > 1 ? `since :
` + s.map(ao).join(`
`) : " " + ao(s[0]) : "as no adapter specified";
    throw new k(
      "There is no suitable adapter to dispatch the request " + a,
      k.ERR_NOT_SUPPORT
    );
  }
  return o;
}
const Wi = {
  /**
   * Resolve an adapter from a list of adapter names or functions.
   * @type {Function}
   */
  getAdapter: Sl,
  /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */
  adapters: On
};
function qr(e) {
  if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted)
    throw new Yt(null, e);
}
function Kr(e) {
  const t = p.toSafeFlatObject(e);
  return qr(t), t.headers = Oe.from(p.getSafeProp(t, "headers")), t.data = Wr.call(t, t.transformRequest), ["post", "put", "patch"].indexOf(t.method) !== -1 && t.headers.setContentType("application/x-www-form-urlencoded", !1), Wi.getAdapter(t.adapter || Gt.adapter, t)(t).then(
    function(o) {
      qr(t), t.response = o;
      try {
        o.data = Wr.call(t, t.transformResponse, o);
      } finally {
        delete t.response;
      }
      return o.headers = Oe.from(o.headers), o;
    },
    function(o) {
      if (!Mi(o) && (qr(t), o && o.response)) {
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
        o.response.headers = Oe.from(o.response.headers);
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
const co = {};
Tr.transitional = function(t, r, n) {
  function o(i, s) {
    return "[Axios v" + Cn + "] Transitional option '" + i + "'" + s + (n ? ". " + n : "");
  }
  return (i, s, a) => {
    if (t === !1)
      throw new k(
        o(s, " has been removed" + (r ? " in " + r : "")),
        k.ERR_DEPRECATED
      );
    return r && !co[s] && (co[s] = !0, console.warn(
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
function El(e, t, r) {
  if (typeof e != "object" || e === null)
    throw new k("options must be an object", k.ERR_BAD_OPTION_VALUE);
  const n = Object.keys(e);
  let o = n.length;
  for (; o-- > 0; ) {
    const i = n[o], s = Object.prototype.hasOwnProperty.call(t, i) ? t[i] : void 0;
    if (s) {
      const a = e[i], c = a === void 0 || s(a, i, e);
      if (c !== !0)
        throw new k(
          "option " + i + " must be " + c,
          k.ERR_BAD_OPTION_VALUE
        );
      continue;
    }
    if (r !== !0)
      throw new k("Unknown option " + i, k.ERR_BAD_OPTION);
  }
}
const dr = {
  assertOptions: El,
  validators: Tr
}, Ce = dr.validators;
let ct = class {
  constructor(t) {
    this.defaults = t || {}, this.interceptors = {
      request: new Yn(),
      response: new Yn()
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
`, a + 1), d = c === -1 ? "" : s.slice(c + 1);
            String(n.stack).endsWith(d) || (n.stack += `
` + s);
          }
        } catch {
        }
      throw n;
    }
  }
  _request(t, r) {
    typeof t == "string" ? (r = r || {}, r.url = t) : r = t || {}, r = pt(this.defaults, r);
    const { transitional: n, paramsSerializer: o, headers: i } = r;
    n !== void 0 && dr.assertOptions(
      n,
      {
        silentJSONParsing: Ce.transitional(Ce.boolean),
        forcedJSONParsing: Ce.transitional(Ce.boolean),
        clarifyTimeoutError: Ce.transitional(Ce.boolean),
        legacyInterceptorReqResOrdering: Ce.transitional(Ce.boolean),
        advertiseZstdAcceptEncoding: Ce.transitional(Ce.boolean),
        validateStatusUndefinedResolves: Ce.transitional(Ce.boolean)
      },
      !1
    ), o != null && (p.isFunction(o) ? r.paramsSerializer = {
      serialize: o
    } : dr.assertOptions(
      o,
      {
        encode: Ce.function,
        serialize: Ce.function
      },
      !0
    )), r.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? r.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : r.allowAbsoluteUrls = !0), dr.assertOptions(
      r,
      {
        baseUrl: Ce.spelling("baseURL"),
        withXsrfToken: Ce.spelling("withXSRFToken")
      },
      !0
    ), r.method = (p.getSafeProp(r, "method") || p.getSafeProp(this.defaults, "method") || "get").toLowerCase();
    let s = i && p.merge(i.common, i[r.method]);
    i && p.forEach(Di.concat("common"), (b) => {
      delete i[b];
    }), r.headers = Oe.concat(s, i);
    const a = [];
    let c = !0;
    this.interceptors.request.forEach(function(h) {
      if (typeof h.runWhen == "function" && h.runWhen(r) === !1)
        return;
      c = c && h.synchronous;
      const C = r.transitional || xn;
      C && C.legacyInterceptorReqResOrdering ? a.unshift(h.fulfilled, h.rejected) : a.push(h.fulfilled, h.rejected);
    });
    const d = [];
    this.interceptors.response.forEach(function(h) {
      d.push(h.fulfilled, h.rejected);
    });
    let u, f = 0, m;
    if (!c) {
      const b = [Kr.bind(this), void 0];
      for (b.unshift(...a), b.push(...d), m = b.length, u = Promise.resolve(r); f < m; )
        u = u.then(b[f++], b[f++]);
      return u;
    }
    m = a.length;
    let S = r;
    for (; f < m; ) {
      const b = a[f++], h = a[f++];
      try {
        S = b ? b(S) : S;
      } catch (C) {
        if (!h) {
          u = Promise.reject(C);
          break;
        }
        try {
          const y = h.call(this, C);
          p.isThenable(y) && (u = Promise.resolve(y).then(
            () => Kr.call(this, S)
          ));
        } catch (y) {
          u = Promise.reject(y);
        }
        break;
      }
    }
    if (!u)
      try {
        u = Kr.call(this, S);
      } catch (b) {
        u = Promise.reject(b);
      }
    for (f = 0, m = d.length; f < m; )
      u = u.then(d[f++], d[f++]);
    return u;
  }
  getUri(t) {
    t = pt(this.defaults, t);
    const r = Ui(t.baseURL, t.url, t.allowAbsoluteUrls, t);
    return Ni(r, t.params, t.paramsSerializer);
  }
};
p.forEach(["delete", "get", "head", "options"], function(t) {
  ct.prototype[t] = function(r, n) {
    return this.request(
      pt(n || {}, {
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
        pt(a || {}, {
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
  ct.prototype[t] = r(), t !== "query" && (ct.prototype[t + "Form"] = r(!0));
});
let wl = class zi {
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
      token: new zi(function(o) {
        t = o;
      }),
      cancel: t
    };
  }
};
function xl(e) {
  return function(r) {
    return e.apply(null, r);
  };
}
function Tl(e) {
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
function qi(e) {
  const t = new ct(e), r = gi(ct.prototype.request, t);
  return p.extend(r, ct.prototype, t, { allOwnKeys: !0 }), p.extend(r, t, null, { allOwnKeys: !0 }), r.create = function(o) {
    return qi(pt(e, o));
  }, r;
}
const Se = qi(Gt);
Se.Axios = ct;
Se.CanceledError = Yt;
Se.CancelToken = wl;
Se.isCancel = Mi;
Se.VERSION = Cn;
Se.toFormData = xr;
Se.AxiosError = k;
Se.Cancel = Se.CanceledError;
Se.all = function(t) {
  return Promise.all(t);
};
Se.spread = xl;
Se.isAxiosError = Tl;
Se.mergeConfig = pt;
Se.AxiosHeaders = Oe;
Se.formToJSON = (e) => Li(p.isHTMLForm(e) ? new FormData(e) : e);
Se.getAdapter = Wi.getAdapter;
Se.HttpStatusCode = fr;
Se.default = Se;
const {
  Axios: Zf,
  AxiosError: Qf,
  CanceledError: ep,
  isCancel: tp,
  CancelToken: rp,
  VERSION: np,
  all: op,
  Cancel: ip,
  isAxiosError: sp,
  spread: ap,
  toFormData: cp,
  AxiosHeaders: lp,
  HttpStatusCode: up,
  formToJSON: dp,
  getAdapter: fp,
  mergeConfig: pp,
  create: hp
} = Se, Cl = [
  we.ENDPOINTS.REFRESH,
  we.ENDPOINTS.MAGIC_LINK_REQUEST,
  we.ENDPOINTS.MAGIC_LINK_VERIFY,
  we.ENDPOINTS.PASSKEY_LOGIN_OPTIONS,
  we.ENDPOINTS.PASSKEY_LOGIN_VERIFY
], Ol = (e) => !!e && Cl.some((t) => e.split("?")[0].endsWith(t)), Rl = (e, t) => {
  const r = Se.create({
    baseURL: e,
    timeout: we.DEFAULT_CONFIG.TIMEOUT,
    headers: {
      "Content-Type": "application/json",
      ...t && { "X-API-Key": t }
    }
  });
  return r.interceptors.request.use(
    (n) => {
      const o = qe.getAccessToken();
      return o && n.headers && (n.headers.Authorization = `Bearer ${o}`), n;
    },
    (n) => Promise.reject(n)
  ), r.interceptors.response.use(
    (n) => n,
    async (n) => {
      const o = n.config;
      if (n.response?.status === we.STATUS_CODES.UNAUTHORIZED && !o._retry && !Ol(o.url)) {
        o._retry = !0;
        try {
          const i = qe.getRefreshToken();
          if (!i)
            throw new Error(pa.NO_REFRESH_TOKEN);
          const s = await r.post(we.ENDPOINTS.REFRESH, {
            refreshToken: i
          }), a = {
            accessToken: s.data.accessToken,
            refreshToken: s.data.refreshToken
          };
          return qe.setTokens(a.accessToken, a.refreshToken), o.headers && (o.headers.Authorization = `Bearer ${a.accessToken}`), r(o);
        } catch (i) {
          return qe.clearTokens(), window.location.href = "/login", Promise.reject(i);
        }
      }
      return Promise.reject(n);
    }
  ), r;
};
let er = null;
const We = (e, t) => {
  if (!er && e && (er = Rl(e, t)), !er)
    throw new Error("API client not initialized. Please provide baseURL.");
  return er;
}, lo = (e, t) => e?.name === "NotAllowedError" ? "Passkey request was cancelled or timed out" : e?.name === "InvalidStateError" ? "A passkey for this account is already registered on this device" : e?.response?.data?.message || e?.message || t, Ye = {
  /**
   * Logout user and invalidate refresh token
   * @param refreshToken - The refresh token to invalidate
   * @returns Promise resolving when logout is complete
   */
  logout: async (e) => {
    try {
      await We().post(we.ENDPOINTS.LOGOUT, {
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
      const r = await We().post(we.ENDPOINTS.REFRESH, {
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
      const t = await We().get(we.ENDPOINTS.USER_ME), r = t.data?.data ?? t.data;
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
      await We().post(we.ENDPOINTS.MAGIC_LINK_REQUEST, {
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
      const r = await We().post(we.ENDPOINTS.MAGIC_LINK_VERIFY, {
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
      const e = We(), t = await e.post(we.ENDPOINTS.PASSKEY_LOGIN_OPTIONS), { challengeId: r, options: n } = t.data, o = await ta({ optionsJSON: n }), i = await e.post(
        we.ENDPOINTS.PASSKEY_LOGIN_VERIFY,
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
      throw new Error(lo(e, "Passkey sign-in failed"));
    }
  },
  /**
   * Register a new passkey for the currently signed-in user
   * @param name - Optional friendly name for the passkey (e.g. "MacBook Pro")
   * @returns Promise resolving to the stored passkey info
   */
  registerPasskey: async (e) => {
    try {
      const t = We(), r = await t.post(we.ENDPOINTS.PASSKEY_REGISTER_OPTIONS), { challengeId: n, options: o } = r.data, i = await Zs({ optionsJSON: o });
      return (await t.post(we.ENDPOINTS.PASSKEY_REGISTER_VERIFY, {
        challengeId: n,
        response: i,
        name: e
      })).data;
    } catch (t) {
      throw new Error(lo(t, "Passkey registration failed"));
    }
  }
}, vl = [0, 45, 90, 135, 180, 225, 270, 315], Al = (e) => /* @__PURE__ */ L(Et, { ...e, viewBox: "0 0 24 24", children: [
  /* @__PURE__ */ g("circle", { cx: "12", cy: "12", r: "4.6", fill: "currentColor" }),
  vl.map((t) => /* @__PURE__ */ g(
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
] }), _l = (e) => {
  const t = `lumora-moon-${vs()}`;
  return /* @__PURE__ */ L(Et, { ...e, viewBox: "0 0 24 24", children: [
    /* @__PURE__ */ L("mask", { id: t, children: [
      /* @__PURE__ */ g("rect", { width: "24", height: "24", fill: "#fff" }),
      /* @__PURE__ */ g("circle", { cx: "15.8", cy: "8.2", r: "4.6", fill: "#000" })
    ] }),
    /* @__PURE__ */ g("circle", { cx: "12", cy: "12", r: "7.5", fill: "currentColor", mask: `url(#${t})` })
  ] });
}, kl = ({ title: e, height: t, color: r }) => /* @__PURE__ */ L(
  "svg",
  {
    role: "img",
    "aria-label": e,
    viewBox: "0 0 143 38",
    height: t,
    width: t * 143 / 38,
    style: { display: "block", fill: r, transition: hi },
    children: [
      /* @__PURE__ */ g("path", { d: "M47.0556 19.7972V5.34429C46.8088 5.38305 46.7507 5.68829 46.6442 5.89178C44.5245 9.8599 43.0533 14.7341 40.9288 18.7022C40.7691 19.0026 40.4496 19.8069 40.1109 19.8069C39.3753 19.8166 34.4438 6.74452 33.1662 5.34429V19.8069H31.8595V1.87036H34.5551L40.6674 15.141L41.0885 15.4075L47.1379 1.87036H49.6689V19.3369C49.6689 19.395 49.6544 19.6567 49.6544 19.7923" }),
      /* @__PURE__ */ g("path", { d: "M79.0544 11.4152L77.1235 11.3764V19.6034H74.3456V1.87036H80.966C82.9212 2.09324 85.3845 3.34327 85.6265 5.79972C85.9362 8.95387 84.3876 9.98588 82.0937 10.9985C81.9243 11.0712 81.813 10.9016 81.871 11.2844L87.4268 19.6082H84.7312M77.1235 10.4704C80.1336 11.1099 84.3827 8.60503 82.3308 4.73865C81.9194 3.96344 80.4385 2.97504 79.6594 2.97504H77.1283V10.4752L77.1235 10.4704Z" }),
      /* @__PURE__ */ g("path", { d: "M60.9113 1.56022C67.2753 0.857678 72.7294 6.97702 70.2903 14.0702C67.8366 21.1973 58.5593 22.2197 54.7651 16.0179C51.1113 10.044 54.6199 2.25791 60.9161 1.56506L60.9113 1.56022ZM60.9064 2.46625C54.8135 3.61938 54.7409 18.6779 61.6856 19.2448C69.8644 19.9134 69.8741 0.770466 60.9064 2.46625Z" }),
      /* @__PURE__ */ g("path", { d: "M16.8233 1.87036V14.2156C16.8233 17.5345 20.7675 19.7293 23.4486 18.707C24.6391 18.2564 26.4539 16.2263 26.6282 14.768V1.87036H27.9348V14.8552C27.9348 15.1653 27.5767 16.3862 27.3977 16.769C24.8375 22.2294 14.21 20.6499 14.21 14.5839V1.87036H16.8233Z" }),
      /* @__PURE__ */ g("path", { d: "M95.669 1.49707L103.432 19.6177H100.736L98.3453 13.789C96.2062 13.789 93.9413 13.7503 91.9039 13.7503C91.6232 13.7503 91.6571 13.7503 91.4732 13.7503L88.9421 19.797H87.6403M91.9232 12.665H97.7161L95.0205 5.89641" }),
      /* @__PURE__ */ g("path", { d: "M4.0761 1.87036V18.5132H12.0855V19.6131H1.29822V2.14653L1.54503 1.87036H4.0761Z" }),
      /* @__PURE__ */ g("path", { d: "M37.7396 32.782V37.3557H36.2684V27.4814H40.111C41.0692 27.4814 41.5725 28.1598 41.829 28.4844C42.5647 29.4146 42.584 31.062 41.829 31.968C41.6597 32.1715 41.1031 32.7335 40.4353 32.7868H37.7396V32.782ZM37.7396 28.0289V32.1424C39.1867 32.5494 40.8563 32.2199 40.8563 30.311C40.8563 28.402 39.1818 27.8351 37.7396 28.0241V28.0289Z" }),
      /* @__PURE__ */ g("path", { d: "M8.81874 29.8504L8.1654 29.957C6.65547 26.6236 2.85645 27.297 1.90307 30.8049C0.543162 35.8292 5.6053 39.5793 8.32027 34.6906L8.8139 34.7924C7.27977 38.9737 1.36588 38.1985 0.238272 34.0559C-1.4362 27.893 6.17152 24.4094 8.8139 29.8504H8.81874Z" }),
      /* @__PURE__ */ g("path", { d: "M26.4589 37.3505L25.0119 37.3262L23.8601 34.1721L19.9207 34.1479L18.5898 37.3262L17.7961 37.3505L22.0452 27.1128M20.2546 33.329H23.3616L21.9678 29.4869" }),
      /* @__PURE__ */ g("path", { d: "M71.2435 27.4766V28.0241H68.1414V37.3508H66.6702V28.0241H63.6455L63.3987 27.4766H71.2435Z" }),
      /* @__PURE__ */ g("path", { d: "M99.5161 27.4766V36.8033H103.925V37.3508H98.04V27.4766H99.5112H99.5161Z" }),
      /* @__PURE__ */ g("path", { d: "M54.0825 27.4766H52.6113V37.3508H54.0825V27.4766Z" }),
      /* @__PURE__ */ g("path", { d: "M112.883 22.8688L112.975 16.7204L133.112 0L133.194 6.31314L112.883 22.8688Z" }),
      /* @__PURE__ */ g("path", { d: "M112.849 37.9998L113.009 32.6169L133.228 15.8433V21.0711L112.854 37.9998H112.849Z" }),
      /* @__PURE__ */ g("path", { d: "M121.913 37.8838V32.4282L142.123 15.2766V21.1489L121.913 37.8838Z" }),
      /* @__PURE__ */ g("path", { d: "M121.792 23.4694V17.7813L142.133 0.828369V6.54557L121.792 23.4694Z" }),
      /* @__PURE__ */ g("path", { d: "M86.8706 37.3505L85.4236 37.3262L84.2718 34.1721L80.3324 34.1479L79.0016 37.3262L78.2079 37.3505L82.457 27.1128M80.6664 33.329H83.7733L82.3796 29.4869" })
    ]
  }
), uo = ({
  brandConfig: e,
  theme: t,
  onToggleColorMode: r,
  showWelcome: n = !0
}) => {
  const o = t.mode === "dark" ? "light" : "dark";
  return /* @__PURE__ */ L(
    v,
    {
      component: "header",
      sx: { "& *": { transition: ge } },
      children: [
        /* @__PURE__ */ L(
          v,
          {
            sx: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2
            },
            children: [
              e.logo ? typeof e.logo == "string" ? /* @__PURE__ */ g(
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
              ) : e.logo : /* @__PURE__ */ g(
                kl,
                {
                  title: e.companyName || "Lumora Capital",
                  height: e.logoHeight,
                  color: t.logo
                }
              ),
              /* @__PURE__ */ g(
                Ns,
                {
                  title: `Switch to ${o} mode`,
                  slotProps: {
                    tooltip: { sx: { fontFamily: t.bodyFont } }
                  },
                  children: /* @__PURE__ */ L(
                    Is,
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
                        transition: ge,
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
                          transition: `${zt("opacity")}, transform ${yn}ms ${xt}`
                        }
                      },
                      children: [
                        /* @__PURE__ */ g(
                          Al,
                          {
                            sx: {
                              color: "#de9733",
                              opacity: t.mode === "dark" ? 0 : 1,
                              transform: t.mode === "dark" ? "rotate(-90deg) scale(0.6)" : "none"
                            }
                          }
                        ),
                        /* @__PURE__ */ g(
                          _l,
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
        n && /* @__PURE__ */ L(Bn, { children: [
          /* @__PURE__ */ L(
            v,
            {
              component: "h1",
              sx: {
                m: 0,
                // Clear space between the logo and the welcome title
                mt: 4.5,
                [je]: { mt: 3 },
                fontFamily: t.headingFont,
                fontSize: 42,
                fontWeight: 600,
                lineHeight: 1.12,
                letterSpacing: "-0.01em",
                color: t.welcomeTitle
              },
              children: [
                e.welcomeTitle,
                e.welcomeTitleAccent && /* @__PURE__ */ L(Bn, { children: [
                  " ",
                  /* @__PURE__ */ g(
                    v,
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
          e.tagline && /* @__PURE__ */ g(
            v,
            {
              component: "p",
              sx: {
                m: 0,
                mt: 1.5,
                [je]: { mt: 1 },
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
}, fo = ({
  theme: e,
  icon: t,
  label: r,
  ariaLabel: n,
  loadingLabel: o = "Signing in...",
  isLoading: i = !1,
  disabled: s = !1,
  onClick: a
}) => /* @__PURE__ */ g(
  Bt,
  {
    fullWidth: !0,
    variant: "outlined",
    "aria-label": i ? o : n,
    startIcon: i ? /* @__PURE__ */ g(hn, { size: 18, color: "inherit" }) : t,
    onClick: a,
    disabled: s,
    sx: {
      ...ut,
      borderRadius: "10px",
      textTransform: "none",
      // Buttons are set in Montserrat
      fontFamily: e.headingFont,
      fontWeight: 600,
      fontSize: 15,
      whiteSpace: "nowrap",
      transition: ge,
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
), Pl = ({ monochrome: e = !1, ...t }) => /* @__PURE__ */ L(Et, { ...t, viewBox: "0 0 23 23", children: [
  /* @__PURE__ */ g("path", { fill: e ? "currentColor" : "#f35325", d: "M1 1h10v10H1z" }),
  /* @__PURE__ */ g("path", { fill: e ? "currentColor" : "#81bc06", d: "M12 1h10v10H12z" }),
  /* @__PURE__ */ g("path", { fill: e ? "currentColor" : "#05a6f0", d: "M1 12h10v10H1z" }),
  /* @__PURE__ */ g("path", { fill: e ? "currentColor" : "#ffba08", d: "M12 12h10v10H12z" })
] });
function Nl(e, t, r) {
  return r === void 0 && (r = {}), function(n, o, i) {
    try {
      return Promise.resolve((function(s, a) {
        try {
          var c = (t != null && t.context && process.env.NODE_ENV === "development" && console.warn("You should not used the yup options context. Please, use the 'useForm' context object instead"), Promise.resolve(e[r.mode === "sync" ? "validateSync" : "validate"](n, Object.assign({ abortEarly: !1 }, t, { context: o }))).then(function(d) {
            return i.shouldUseNativeValidation && qs({}, i), { values: r.raw ? Object.assign({}, n) : d, errors: {} };
          }));
        } catch (d) {
          return a(d);
        }
        return c && c.then ? c.then(void 0, a) : c;
      })(0, function(s) {
        if (!s.inner) throw s;
        return { values: {}, errors: Ks((a = s, c = !i.shouldUseNativeValidation && i.criteriaMode === "all", (a.inner || []).reduce(function(d, u) {
          if (d[u.path] || (d[u.path] = { message: u.message, type: u.type }), c) {
            var f = d[u.path].types, m = f && f[u.type];
            d[u.path] = Ws(u.path, c, d, u.type, m ? [].concat(m, u.message) : u.message);
          }
          return d;
        }, {})), i) };
        var a, c;
      }));
    } catch (s) {
      return Promise.reject(s);
    }
  };
}
const Il = jn.object({
  email: jn.string().email("Please enter a valid email address").required("Email is required")
}), $l = ({
  theme: e,
  isSubmitting: t,
  disabled: r = !1,
  onSubmit: n
}) => {
  const {
    register: o,
    handleSubmit: i,
    formState: { errors: s }
  } = zs({
    resolver: Nl(Il)
  }), a = t || r;
  return /* @__PURE__ */ L(v, { component: "form", noValidate: !0, onSubmit: i(n), children: [
    /* @__PURE__ */ g(
      v,
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
    /* @__PURE__ */ L(v, { sx: { display: "flex", gap: 1.25 }, children: [
      /* @__PURE__ */ g(
        $s,
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
            ...ut,
            px: 2,
            borderRadius: "10px",
            border: `1px solid ${s.email ? "#d14343" : e.border}`,
            backgroundColor: e.surface,
            color: e.label,
            fontFamily: e.bodyFont,
            fontSize: 16,
            transition: ge,
            "&.Mui-focused": {
              borderColor: e.accent,
              boxShadow: `0 0 0 3px ${e.accent}26`
            },
            "& input::placeholder": {
              color: e.placeholder,
              opacity: 1,
              transition: ge
            }
          }
        }
      ),
      /* @__PURE__ */ g(
        Bt,
        {
          type: "submit",
          variant: "contained",
          disableElevation: !0,
          disabled: a,
          sx: {
            flexShrink: 0,
            ...ut,
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
            transition: ge,
            "&:hover": { backgroundColor: e.accentHover },
            ...mr(e),
            "&.Mui-disabled": {
              backgroundColor: e.accent,
              color: e.buttonText,
              opacity: 0.6
            }
          },
          children: t ? /* @__PURE__ */ g(hn, { size: 20, color: "inherit", "aria-label": "Sending sign-in link" }) : "Magic Link"
        }
      )
    ] }),
    s.email && /* @__PURE__ */ g(
      v,
      {
        id: "lumora-work-email-error",
        role: "status",
        sx: { mt: 1, fontSize: 13, color: "#d14343" },
        children: s.email.message
      }
    )
  ] });
}, Ll = ({
  theme: e,
  title: t,
  description: r,
  onBackToLogin: n
}) => /* @__PURE__ */ L(v, { children: [
  /* @__PURE__ */ g(
    v,
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
      children: /* @__PURE__ */ g(Us, {})
    }
  ),
  /* @__PURE__ */ g(
    v,
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
  /* @__PURE__ */ g(
    v,
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
  /* @__PURE__ */ g(
    Bt,
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
function nt(e, ...t) {
  const r = new URL(`https://mui.com/production-error/?code=${e}`);
  return t.forEach((n) => r.searchParams.append("args[]", n)), `Minified MUI error #${e}; visit ${r} for the full message.`;
}
const lt = "$$material";
function Dl(e) {
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
var Ml = {
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
function Fl(e) {
  var t = /* @__PURE__ */ Object.create(null);
  return function(r) {
    return t[r] === void 0 && (t[r] = e(r)), t[r];
  };
}
var Bl = /[A-Z]|^ms/g, Ul = /_EMO_([^_]+?)_([^]*?)_EMO_/g, Ki = function(t) {
  return t.charCodeAt(1) === 45;
}, po = function(t) {
  return t != null && typeof t != "boolean";
}, Gr = /* @__PURE__ */ Fl(function(e) {
  return Ki(e) ? e : e.replace(Bl, "-$&").toLowerCase();
}), ho = function(t, r) {
  switch (t) {
    case "animation":
    case "animationName":
      if (typeof r == "string")
        return r.replace(Ul, function(n, o, i) {
          return et = {
            name: o,
            styles: i,
            next: et
          }, o;
        });
  }
  return Ml[t] !== 1 && !Ki(t) && typeof r == "number" && r !== 0 ? r + "px" : r;
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
      return jl(e, t, r);
    }
  }
  var c = r;
  return c;
}
function jl(e, t, r) {
  var n = "";
  if (Array.isArray(r))
    for (var o = 0; o < r.length; o++)
      n += br(e, t, r[o]) + ";";
  else
    for (var i in r) {
      var s = r[i];
      if (typeof s != "object") {
        var a = s;
        po(a) && (n += Gr(i) + ":" + ho(i, a) + ";");
      } else if (Array.isArray(s) && typeof s[0] == "string" && t == null)
        for (var c = 0; c < s.length; c++)
          po(s[c]) && (n += Gr(i) + ":" + ho(i, s[c]) + ";");
      else {
        var d = br(e, t, s);
        switch (i) {
          case "animation":
          case "animationName": {
            n += Gr(i) + ":" + d + ";";
            break;
          }
          default:
            n += i + "{" + d + "}";
        }
      }
    }
  return n;
}
var mo = /label:\s*([^\s;{]+)\s*(;|$)/g, et;
function Hl(e, t, r) {
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
  mo.lastIndex = 0;
  for (var d = "", u; (u = mo.exec(o)) !== null; )
    d += "-" + u[1];
  var f = Dl(o) + d;
  return {
    name: f,
    styles: o,
    next: et
  };
}
function Vl(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var tr = { exports: {} }, rr = { exports: {} }, ne = {};
var go;
function Wl() {
  if (go) return ne;
  go = 1;
  var e = typeof Symbol == "function" && Symbol.for, t = e ? /* @__PURE__ */ Symbol.for("react.element") : 60103, r = e ? /* @__PURE__ */ Symbol.for("react.portal") : 60106, n = e ? /* @__PURE__ */ Symbol.for("react.fragment") : 60107, o = e ? /* @__PURE__ */ Symbol.for("react.strict_mode") : 60108, i = e ? /* @__PURE__ */ Symbol.for("react.profiler") : 60114, s = e ? /* @__PURE__ */ Symbol.for("react.provider") : 60109, a = e ? /* @__PURE__ */ Symbol.for("react.context") : 60110, c = e ? /* @__PURE__ */ Symbol.for("react.async_mode") : 60111, d = e ? /* @__PURE__ */ Symbol.for("react.concurrent_mode") : 60111, u = e ? /* @__PURE__ */ Symbol.for("react.forward_ref") : 60112, f = e ? /* @__PURE__ */ Symbol.for("react.suspense") : 60113, m = e ? /* @__PURE__ */ Symbol.for("react.suspense_list") : 60120, S = e ? /* @__PURE__ */ Symbol.for("react.memo") : 60115, b = e ? /* @__PURE__ */ Symbol.for("react.lazy") : 60116, h = e ? /* @__PURE__ */ Symbol.for("react.block") : 60121, C = e ? /* @__PURE__ */ Symbol.for("react.fundamental") : 60117, y = e ? /* @__PURE__ */ Symbol.for("react.responder") : 60118, T = e ? /* @__PURE__ */ Symbol.for("react.scope") : 60119;
  function R(w) {
    if (typeof w == "object" && w !== null) {
      var I = w.$$typeof;
      switch (I) {
        case t:
          switch (w = w.type, w) {
            case c:
            case d:
            case n:
            case i:
            case o:
            case f:
              return w;
            default:
              switch (w = w && w.$$typeof, w) {
                case a:
                case u:
                case b:
                case S:
                case s:
                  return w;
                default:
                  return I;
              }
          }
        case r:
          return I;
      }
    }
  }
  function x(w) {
    return R(w) === d;
  }
  return ne.AsyncMode = c, ne.ConcurrentMode = d, ne.ContextConsumer = a, ne.ContextProvider = s, ne.Element = t, ne.ForwardRef = u, ne.Fragment = n, ne.Lazy = b, ne.Memo = S, ne.Portal = r, ne.Profiler = i, ne.StrictMode = o, ne.Suspense = f, ne.isAsyncMode = function(w) {
    return x(w) || R(w) === c;
  }, ne.isConcurrentMode = x, ne.isContextConsumer = function(w) {
    return R(w) === a;
  }, ne.isContextProvider = function(w) {
    return R(w) === s;
  }, ne.isElement = function(w) {
    return typeof w == "object" && w !== null && w.$$typeof === t;
  }, ne.isForwardRef = function(w) {
    return R(w) === u;
  }, ne.isFragment = function(w) {
    return R(w) === n;
  }, ne.isLazy = function(w) {
    return R(w) === b;
  }, ne.isMemo = function(w) {
    return R(w) === S;
  }, ne.isPortal = function(w) {
    return R(w) === r;
  }, ne.isProfiler = function(w) {
    return R(w) === i;
  }, ne.isStrictMode = function(w) {
    return R(w) === o;
  }, ne.isSuspense = function(w) {
    return R(w) === f;
  }, ne.isValidElementType = function(w) {
    return typeof w == "string" || typeof w == "function" || w === n || w === d || w === i || w === o || w === f || w === m || typeof w == "object" && w !== null && (w.$$typeof === b || w.$$typeof === S || w.$$typeof === s || w.$$typeof === a || w.$$typeof === u || w.$$typeof === C || w.$$typeof === y || w.$$typeof === T || w.$$typeof === h);
  }, ne.typeOf = R, ne;
}
var oe = {};
var yo;
function zl() {
  return yo || (yo = 1, process.env.NODE_ENV !== "production" && (function() {
    var e = typeof Symbol == "function" && Symbol.for, t = e ? /* @__PURE__ */ Symbol.for("react.element") : 60103, r = e ? /* @__PURE__ */ Symbol.for("react.portal") : 60106, n = e ? /* @__PURE__ */ Symbol.for("react.fragment") : 60107, o = e ? /* @__PURE__ */ Symbol.for("react.strict_mode") : 60108, i = e ? /* @__PURE__ */ Symbol.for("react.profiler") : 60114, s = e ? /* @__PURE__ */ Symbol.for("react.provider") : 60109, a = e ? /* @__PURE__ */ Symbol.for("react.context") : 60110, c = e ? /* @__PURE__ */ Symbol.for("react.async_mode") : 60111, d = e ? /* @__PURE__ */ Symbol.for("react.concurrent_mode") : 60111, u = e ? /* @__PURE__ */ Symbol.for("react.forward_ref") : 60112, f = e ? /* @__PURE__ */ Symbol.for("react.suspense") : 60113, m = e ? /* @__PURE__ */ Symbol.for("react.suspense_list") : 60120, S = e ? /* @__PURE__ */ Symbol.for("react.memo") : 60115, b = e ? /* @__PURE__ */ Symbol.for("react.lazy") : 60116, h = e ? /* @__PURE__ */ Symbol.for("react.block") : 60121, C = e ? /* @__PURE__ */ Symbol.for("react.fundamental") : 60117, y = e ? /* @__PURE__ */ Symbol.for("react.responder") : 60118, T = e ? /* @__PURE__ */ Symbol.for("react.scope") : 60119;
    function R(A) {
      return typeof A == "string" || typeof A == "function" || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
      A === n || A === d || A === i || A === o || A === f || A === m || typeof A == "object" && A !== null && (A.$$typeof === b || A.$$typeof === S || A.$$typeof === s || A.$$typeof === a || A.$$typeof === u || A.$$typeof === C || A.$$typeof === y || A.$$typeof === T || A.$$typeof === h);
    }
    function x(A) {
      if (typeof A == "object" && A !== null) {
        var W = A.$$typeof;
        switch (W) {
          case t:
            var re = A.type;
            switch (re) {
              case c:
              case d:
              case n:
              case i:
              case o:
              case f:
                return re;
              default:
                var pe = re && re.$$typeof;
                switch (pe) {
                  case a:
                  case u:
                  case b:
                  case S:
                  case s:
                    return pe;
                  default:
                    return W;
                }
            }
          case r:
            return W;
        }
      }
    }
    var w = c, I = d, X = a, V = s, D = t, U = u, z = n, l = b, F = S, _ = r, Z = i, K = o, M = f, fe = !1;
    function Be(A) {
      return fe || (fe = !0, console.warn("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 17+. Update your code to use ReactIs.isConcurrentMode() instead. It has the exact same API.")), O(A) || x(A) === c;
    }
    function O(A) {
      return x(A) === d;
    }
    function P(A) {
      return x(A) === a;
    }
    function $(A) {
      return x(A) === s;
    }
    function B(A) {
      return typeof A == "object" && A !== null && A.$$typeof === t;
    }
    function q(A) {
      return x(A) === u;
    }
    function J(A) {
      return x(A) === n;
    }
    function Y(A) {
      return x(A) === b;
    }
    function N(A) {
      return x(A) === S;
    }
    function H(A) {
      return x(A) === r;
    }
    function Q(A) {
      return x(A) === i;
    }
    function te(A) {
      return x(A) === o;
    }
    function ye(A) {
      return x(A) === f;
    }
    oe.AsyncMode = w, oe.ConcurrentMode = I, oe.ContextConsumer = X, oe.ContextProvider = V, oe.Element = D, oe.ForwardRef = U, oe.Fragment = z, oe.Lazy = l, oe.Memo = F, oe.Portal = _, oe.Profiler = Z, oe.StrictMode = K, oe.Suspense = M, oe.isAsyncMode = Be, oe.isConcurrentMode = O, oe.isContextConsumer = P, oe.isContextProvider = $, oe.isElement = B, oe.isForwardRef = q, oe.isFragment = J, oe.isLazy = Y, oe.isMemo = N, oe.isPortal = H, oe.isProfiler = Q, oe.isStrictMode = te, oe.isSuspense = ye, oe.isValidElementType = R, oe.typeOf = x;
  })()), oe;
}
var bo;
function Gi() {
  return bo || (bo = 1, process.env.NODE_ENV === "production" ? rr.exports = Wl() : rr.exports = zl()), rr.exports;
}
var Yr, So;
function ql() {
  if (So) return Yr;
  So = 1;
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
      var c = Object.getOwnPropertyNames(s).map(function(u) {
        return s[u];
      });
      if (c.join("") !== "0123456789")
        return !1;
      var d = {};
      return "abcdefghijklmnopqrst".split("").forEach(function(u) {
        d[u] = u;
      }), Object.keys(Object.assign({}, d)).join("") === "abcdefghijklmnopqrst";
    } catch {
      return !1;
    }
  }
  return Yr = o() ? Object.assign : function(i, s) {
    for (var a, c = n(i), d, u = 1; u < arguments.length; u++) {
      a = Object(arguments[u]);
      for (var f in a)
        t.call(a, f) && (c[f] = a[f]);
      if (e) {
        d = e(a);
        for (var m = 0; m < d.length; m++)
          r.call(a, d[m]) && (c[d[m]] = a[d[m]]);
      }
    }
    return c;
  }, Yr;
}
var Jr, Eo;
function Rn() {
  if (Eo) return Jr;
  Eo = 1;
  var e = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
  return Jr = e, Jr;
}
var Xr, wo;
function Yi() {
  return wo || (wo = 1, Xr = Function.call.bind(Object.prototype.hasOwnProperty)), Xr;
}
var Zr, xo;
function Kl() {
  if (xo) return Zr;
  xo = 1;
  var e = function() {
  };
  if (process.env.NODE_ENV !== "production") {
    var t = /* @__PURE__ */ Rn(), r = {}, n = /* @__PURE__ */ Yi();
    e = function(i) {
      var s = "Warning: " + i;
      typeof console < "u" && console.error(s);
      try {
        throw new Error(s);
      } catch {
      }
    };
  }
  function o(i, s, a, c, d) {
    if (process.env.NODE_ENV !== "production") {
      for (var u in i)
        if (n(i, u)) {
          var f;
          try {
            if (typeof i[u] != "function") {
              var m = Error(
                (c || "React class") + ": " + a + " type `" + u + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof i[u] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`."
              );
              throw m.name = "Invariant Violation", m;
            }
            f = i[u](s, u, c, a, null, t);
          } catch (b) {
            f = b;
          }
          if (f && !(f instanceof Error) && e(
            (c || "React class") + ": type specification of " + a + " `" + u + "` is invalid; the type checker function must return `null` or an `Error` but returned a " + typeof f + ". You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument)."
          ), f instanceof Error && !(f.message in r)) {
            r[f.message] = !0;
            var S = d ? d() : "";
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
var Qr, To;
function Gl() {
  if (To) return Qr;
  To = 1;
  var e = Gi(), t = ql(), r = /* @__PURE__ */ Rn(), n = /* @__PURE__ */ Yi(), o = /* @__PURE__ */ Kl(), i = function() {
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
    var d = typeof Symbol == "function" && Symbol.iterator, u = "@@iterator";
    function f(O) {
      var P = O && (d && O[d] || O[u]);
      if (typeof P == "function")
        return P;
    }
    var m = "<<anonymous>>", S = {
      array: y("array"),
      bigint: y("bigint"),
      bool: y("boolean"),
      func: y("function"),
      number: y("number"),
      object: y("object"),
      string: y("string"),
      symbol: y("symbol"),
      any: T(),
      arrayOf: R,
      element: x(),
      elementType: w(),
      instanceOf: I,
      node: U(),
      objectOf: V,
      oneOf: X,
      oneOfType: D,
      shape: l,
      exact: F
    };
    function b(O, P) {
      return O === P ? O !== 0 || 1 / O === 1 / P : O !== O && P !== P;
    }
    function h(O, P) {
      this.message = O, this.data = P && typeof P == "object" ? P : {}, this.stack = "";
    }
    h.prototype = Error.prototype;
    function C(O) {
      if (process.env.NODE_ENV !== "production")
        var P = {}, $ = 0;
      function B(J, Y, N, H, Q, te, ye) {
        if (H = H || m, te = te || N, ye !== r) {
          if (c) {
            var A = new Error(
              "Calling PropTypes validators directly is not supported by the `prop-types` package. Use `PropTypes.checkPropTypes()` to call them. Read more at http://fb.me/use-check-prop-types"
            );
            throw A.name = "Invariant Violation", A;
          } else if (process.env.NODE_ENV !== "production" && typeof console < "u") {
            var W = H + ":" + N;
            !P[W] && // Avoid spamming the console because they are often not actionable except for lib authors
            $ < 3 && (i(
              "You are manually calling a React.PropTypes validation function for the `" + te + "` prop on `" + H + "`. This is deprecated and will throw in the standalone `prop-types` package. You may be seeing this warning due to a third-party PropTypes library. See https://fb.me/react-warning-dont-call-proptypes for details."
            ), P[W] = !0, $++);
          }
        }
        return Y[N] == null ? J ? Y[N] === null ? new h("The " + Q + " `" + te + "` is marked as required " + ("in `" + H + "`, but its value is `null`.")) : new h("The " + Q + " `" + te + "` is marked as required in " + ("`" + H + "`, but its value is `undefined`.")) : null : O(Y, N, H, Q, te);
      }
      var q = B.bind(null, !1);
      return q.isRequired = B.bind(null, !0), q;
    }
    function y(O) {
      function P($, B, q, J, Y, N) {
        var H = $[B], Q = K(H);
        if (Q !== O) {
          var te = M(H);
          return new h(
            "Invalid " + J + " `" + Y + "` of type " + ("`" + te + "` supplied to `" + q + "`, expected ") + ("`" + O + "`."),
            { expectedType: O }
          );
        }
        return null;
      }
      return C(P);
    }
    function T() {
      return C(s);
    }
    function R(O) {
      function P($, B, q, J, Y) {
        if (typeof O != "function")
          return new h("Property `" + Y + "` of component `" + q + "` has invalid PropType notation inside arrayOf.");
        var N = $[B];
        if (!Array.isArray(N)) {
          var H = K(N);
          return new h("Invalid " + J + " `" + Y + "` of type " + ("`" + H + "` supplied to `" + q + "`, expected an array."));
        }
        for (var Q = 0; Q < N.length; Q++) {
          var te = O(N, Q, q, J, Y + "[" + Q + "]", r);
          if (te instanceof Error)
            return te;
        }
        return null;
      }
      return C(P);
    }
    function x() {
      function O(P, $, B, q, J) {
        var Y = P[$];
        if (!a(Y)) {
          var N = K(Y);
          return new h("Invalid " + q + " `" + J + "` of type " + ("`" + N + "` supplied to `" + B + "`, expected a single ReactElement."));
        }
        return null;
      }
      return C(O);
    }
    function w() {
      function O(P, $, B, q, J) {
        var Y = P[$];
        if (!e.isValidElementType(Y)) {
          var N = K(Y);
          return new h("Invalid " + q + " `" + J + "` of type " + ("`" + N + "` supplied to `" + B + "`, expected a single ReactElement type."));
        }
        return null;
      }
      return C(O);
    }
    function I(O) {
      function P($, B, q, J, Y) {
        if (!($[B] instanceof O)) {
          var N = O.name || m, H = Be($[B]);
          return new h("Invalid " + J + " `" + Y + "` of type " + ("`" + H + "` supplied to `" + q + "`, expected ") + ("instance of `" + N + "`."));
        }
        return null;
      }
      return C(P);
    }
    function X(O) {
      if (!Array.isArray(O))
        return process.env.NODE_ENV !== "production" && (arguments.length > 1 ? i(
          "Invalid arguments supplied to oneOf, expected an array, got " + arguments.length + " arguments. A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z])."
        ) : i("Invalid argument supplied to oneOf, expected an array.")), s;
      function P($, B, q, J, Y) {
        for (var N = $[B], H = 0; H < O.length; H++)
          if (b(N, O[H]))
            return null;
        var Q = JSON.stringify(O, function(ye, A) {
          var W = M(A);
          return W === "symbol" ? String(A) : A;
        });
        return new h("Invalid " + J + " `" + Y + "` of value `" + String(N) + "` " + ("supplied to `" + q + "`, expected one of " + Q + "."));
      }
      return C(P);
    }
    function V(O) {
      function P($, B, q, J, Y) {
        if (typeof O != "function")
          return new h("Property `" + Y + "` of component `" + q + "` has invalid PropType notation inside objectOf.");
        var N = $[B], H = K(N);
        if (H !== "object")
          return new h("Invalid " + J + " `" + Y + "` of type " + ("`" + H + "` supplied to `" + q + "`, expected an object."));
        for (var Q in N)
          if (n(N, Q)) {
            var te = O(N, Q, q, J, Y + "." + Q, r);
            if (te instanceof Error)
              return te;
          }
        return null;
      }
      return C(P);
    }
    function D(O) {
      if (!Array.isArray(O))
        return process.env.NODE_ENV !== "production" && i("Invalid argument supplied to oneOfType, expected an instance of array."), s;
      for (var P = 0; P < O.length; P++) {
        var $ = O[P];
        if (typeof $ != "function")
          return i(
            "Invalid argument supplied to oneOfType. Expected an array of check functions, but received " + fe($) + " at index " + P + "."
          ), s;
      }
      function B(q, J, Y, N, H) {
        for (var Q = [], te = 0; te < O.length; te++) {
          var ye = O[te], A = ye(q, J, Y, N, H, r);
          if (A == null)
            return null;
          A.data && n(A.data, "expectedType") && Q.push(A.data.expectedType);
        }
        var W = Q.length > 0 ? ", expected one of type [" + Q.join(", ") + "]" : "";
        return new h("Invalid " + N + " `" + H + "` supplied to " + ("`" + Y + "`" + W + "."));
      }
      return C(B);
    }
    function U() {
      function O(P, $, B, q, J) {
        return _(P[$]) ? null : new h("Invalid " + q + " `" + J + "` supplied to " + ("`" + B + "`, expected a ReactNode."));
      }
      return C(O);
    }
    function z(O, P, $, B, q) {
      return new h(
        (O || "React class") + ": " + P + " type `" + $ + "." + B + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + q + "`."
      );
    }
    function l(O) {
      function P($, B, q, J, Y) {
        var N = $[B], H = K(N);
        if (H !== "object")
          return new h("Invalid " + J + " `" + Y + "` of type `" + H + "` " + ("supplied to `" + q + "`, expected `object`."));
        for (var Q in O) {
          var te = O[Q];
          if (typeof te != "function")
            return z(q, J, Y, Q, M(te));
          var ye = te(N, Q, q, J, Y + "." + Q, r);
          if (ye)
            return ye;
        }
        return null;
      }
      return C(P);
    }
    function F(O) {
      function P($, B, q, J, Y) {
        var N = $[B], H = K(N);
        if (H !== "object")
          return new h("Invalid " + J + " `" + Y + "` of type `" + H + "` " + ("supplied to `" + q + "`, expected `object`."));
        var Q = t({}, $[B], O);
        for (var te in Q) {
          var ye = O[te];
          if (n(O, te) && typeof ye != "function")
            return z(q, J, Y, te, M(ye));
          if (!ye)
            return new h(
              "Invalid " + J + " `" + Y + "` key `" + te + "` supplied to `" + q + "`.\nBad object: " + JSON.stringify($[B], null, "  ") + `
Valid keys: ` + JSON.stringify(Object.keys(O), null, "  ")
            );
          var A = ye(N, te, q, J, Y + "." + te, r);
          if (A)
            return A;
        }
        return null;
      }
      return C(P);
    }
    function _(O) {
      switch (typeof O) {
        case "number":
        case "string":
        case "undefined":
          return !0;
        case "boolean":
          return !O;
        case "object":
          if (Array.isArray(O))
            return O.every(_);
          if (O === null || a(O))
            return !0;
          var P = f(O);
          if (P) {
            var $ = P.call(O), B;
            if (P !== O.entries) {
              for (; !(B = $.next()).done; )
                if (!_(B.value))
                  return !1;
            } else
              for (; !(B = $.next()).done; ) {
                var q = B.value;
                if (q && !_(q[1]))
                  return !1;
              }
          } else
            return !1;
          return !0;
        default:
          return !1;
      }
    }
    function Z(O, P) {
      return O === "symbol" ? !0 : P ? P["@@toStringTag"] === "Symbol" || typeof Symbol == "function" && P instanceof Symbol : !1;
    }
    function K(O) {
      var P = typeof O;
      return Array.isArray(O) ? "array" : O instanceof RegExp ? "object" : Z(P, O) ? "symbol" : P;
    }
    function M(O) {
      if (typeof O > "u" || O === null)
        return "" + O;
      var P = K(O);
      if (P === "object") {
        if (O instanceof Date)
          return "date";
        if (O instanceof RegExp)
          return "regexp";
      }
      return P;
    }
    function fe(O) {
      var P = M(O);
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
    function Be(O) {
      return !O.constructor || !O.constructor.name ? m : O.constructor.name;
    }
    return S.checkPropTypes = o, S.resetWarningCache = o.resetWarningCache, S.PropTypes = S, S;
  }, Qr;
}
var en, Co;
function Yl() {
  if (Co) return en;
  Co = 1;
  var e = /* @__PURE__ */ Rn();
  function t() {
  }
  function r() {
  }
  return r.resetWarningCache = t, en = function() {
    function n(s, a, c, d, u, f) {
      if (f !== e) {
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
  }, en;
}
var Oo;
function Jl() {
  if (Oo) return tr.exports;
  if (Oo = 1, process.env.NODE_ENV !== "production") {
    var e = Gi(), t = !0;
    tr.exports = /* @__PURE__ */ Gl()(e.isElement, t);
  } else
    tr.exports = /* @__PURE__ */ Yl()();
  return tr.exports;
}
var Xl = /* @__PURE__ */ Jl();
const j = /* @__PURE__ */ Vl(Xl);
function Zl(e) {
  return e == null || Object.keys(e).length === 0;
}
function vn(e) {
  const {
    styles: t,
    defaultTheme: r = {}
  } = e;
  return /* @__PURE__ */ g(Vs, {
    styles: typeof t == "function" ? (o) => t(Zl(o) ? r : o) : t
  });
}
process.env.NODE_ENV !== "production" && (vn.propTypes = {
  defaultTheme: j.object,
  styles: j.oneOfType([j.array, j.string, j.object, j.func])
});
const Ro = [];
function Ql(e) {
  return Ro[0] = e, Hl(Ro);
}
var nr = { exports: {} }, ce = {};
var vo;
function eu() {
  if (vo) return ce;
  vo = 1;
  var e = /* @__PURE__ */ Symbol.for("react.transitional.element"), t = /* @__PURE__ */ Symbol.for("react.portal"), r = /* @__PURE__ */ Symbol.for("react.fragment"), n = /* @__PURE__ */ Symbol.for("react.strict_mode"), o = /* @__PURE__ */ Symbol.for("react.profiler"), i = /* @__PURE__ */ Symbol.for("react.consumer"), s = /* @__PURE__ */ Symbol.for("react.context"), a = /* @__PURE__ */ Symbol.for("react.forward_ref"), c = /* @__PURE__ */ Symbol.for("react.suspense"), d = /* @__PURE__ */ Symbol.for("react.suspense_list"), u = /* @__PURE__ */ Symbol.for("react.memo"), f = /* @__PURE__ */ Symbol.for("react.lazy"), m = /* @__PURE__ */ Symbol.for("react.view_transition"), S = /* @__PURE__ */ Symbol.for("react.client.reference");
  function b(h) {
    if (typeof h == "object" && h !== null) {
      var C = h.$$typeof;
      switch (C) {
        case e:
          switch (h = h.type, h) {
            case r:
            case o:
            case n:
            case c:
            case d:
            case m:
              return h;
            default:
              switch (h = h && h.$$typeof, h) {
                case s:
                case a:
                case f:
                case u:
                  return h;
                case i:
                  return h;
                default:
                  return C;
              }
          }
        case t:
          return C;
      }
    }
  }
  return ce.ContextConsumer = i, ce.ContextProvider = s, ce.Element = e, ce.ForwardRef = a, ce.Fragment = r, ce.Lazy = f, ce.Memo = u, ce.Portal = t, ce.Profiler = o, ce.StrictMode = n, ce.Suspense = c, ce.SuspenseList = d, ce.isContextConsumer = function(h) {
    return b(h) === i;
  }, ce.isContextProvider = function(h) {
    return b(h) === s;
  }, ce.isElement = function(h) {
    return typeof h == "object" && h !== null && h.$$typeof === e;
  }, ce.isForwardRef = function(h) {
    return b(h) === a;
  }, ce.isFragment = function(h) {
    return b(h) === r;
  }, ce.isLazy = function(h) {
    return b(h) === f;
  }, ce.isMemo = function(h) {
    return b(h) === u;
  }, ce.isPortal = function(h) {
    return b(h) === t;
  }, ce.isProfiler = function(h) {
    return b(h) === o;
  }, ce.isStrictMode = function(h) {
    return b(h) === n;
  }, ce.isSuspense = function(h) {
    return b(h) === c;
  }, ce.isSuspenseList = function(h) {
    return b(h) === d;
  }, ce.isValidElementType = function(h) {
    return typeof h == "string" || typeof h == "function" || h === r || h === o || h === n || h === c || h === d || typeof h == "object" && h !== null && (h.$$typeof === f || h.$$typeof === u || h.$$typeof === s || h.$$typeof === i || h.$$typeof === a || h.$$typeof === S || h.getModuleId !== void 0);
  }, ce.typeOf = b, ce;
}
var le = {};
var Ao;
function tu() {
  return Ao || (Ao = 1, process.env.NODE_ENV !== "production" && (function() {
    function e(h) {
      if (typeof h == "object" && h !== null) {
        var C = h.$$typeof;
        switch (C) {
          case t:
            switch (h = h.type, h) {
              case n:
              case i:
              case o:
              case d:
              case u:
              case S:
                return h;
              default:
                switch (h = h && h.$$typeof, h) {
                  case a:
                  case c:
                  case m:
                  case f:
                    return h;
                  case s:
                    return h;
                  default:
                    return C;
                }
            }
          case r:
            return C;
        }
      }
    }
    var t = /* @__PURE__ */ Symbol.for("react.transitional.element"), r = /* @__PURE__ */ Symbol.for("react.portal"), n = /* @__PURE__ */ Symbol.for("react.fragment"), o = /* @__PURE__ */ Symbol.for("react.strict_mode"), i = /* @__PURE__ */ Symbol.for("react.profiler"), s = /* @__PURE__ */ Symbol.for("react.consumer"), a = /* @__PURE__ */ Symbol.for("react.context"), c = /* @__PURE__ */ Symbol.for("react.forward_ref"), d = /* @__PURE__ */ Symbol.for("react.suspense"), u = /* @__PURE__ */ Symbol.for("react.suspense_list"), f = /* @__PURE__ */ Symbol.for("react.memo"), m = /* @__PURE__ */ Symbol.for("react.lazy"), S = /* @__PURE__ */ Symbol.for("react.view_transition"), b = /* @__PURE__ */ Symbol.for("react.client.reference");
    le.ContextConsumer = s, le.ContextProvider = a, le.Element = t, le.ForwardRef = c, le.Fragment = n, le.Lazy = m, le.Memo = f, le.Portal = r, le.Profiler = i, le.StrictMode = o, le.Suspense = d, le.SuspenseList = u, le.isContextConsumer = function(h) {
      return e(h) === s;
    }, le.isContextProvider = function(h) {
      return e(h) === a;
    }, le.isElement = function(h) {
      return typeof h == "object" && h !== null && h.$$typeof === t;
    }, le.isForwardRef = function(h) {
      return e(h) === c;
    }, le.isFragment = function(h) {
      return e(h) === n;
    }, le.isLazy = function(h) {
      return e(h) === m;
    }, le.isMemo = function(h) {
      return e(h) === f;
    }, le.isPortal = function(h) {
      return e(h) === r;
    }, le.isProfiler = function(h) {
      return e(h) === i;
    }, le.isStrictMode = function(h) {
      return e(h) === o;
    }, le.isSuspense = function(h) {
      return e(h) === d;
    }, le.isSuspenseList = function(h) {
      return e(h) === u;
    }, le.isValidElementType = function(h) {
      return typeof h == "string" || typeof h == "function" || h === n || h === i || h === o || h === d || h === u || typeof h == "object" && h !== null && (h.$$typeof === m || h.$$typeof === f || h.$$typeof === a || h.$$typeof === s || h.$$typeof === c || h.$$typeof === b || h.getModuleId !== void 0);
    }, le.typeOf = e;
  })()), le;
}
var _o;
function ru() {
  return _o || (_o = 1, process.env.NODE_ENV === "production" ? nr.exports = /* @__PURE__ */ eu() : nr.exports = /* @__PURE__ */ tu()), nr.exports;
}
var Ji = /* @__PURE__ */ ru();
function Qe(e) {
  if (typeof e != "object" || e === null)
    return !1;
  const t = Object.getPrototypeOf(e);
  return (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) && !(Symbol.toStringTag in e) && !(Symbol.iterator in e);
}
function Xi(e) {
  if (/* @__PURE__ */ ee.isValidElement(e) || Ji.isValidElementType(e) || !Qe(e))
    return e;
  const t = {};
  return Object.keys(e).forEach((r) => {
    t[r] = Xi(e[r]);
  }), t;
}
function Ne(e, t, r = {
  clone: !0
}) {
  const n = r.clone ? {
    ...e
  } : e;
  return Qe(e) && Qe(t) && Object.keys(t).forEach((o) => {
    /* @__PURE__ */ ee.isValidElement(t[o]) || Ji.isValidElementType(t[o]) ? n[o] = t[o] : Qe(t[o]) && // Avoid prototype pollution
    Object.prototype.hasOwnProperty.call(e, o) && Qe(e[o]) ? n[o] = Ne(e[o], t[o], r) : r.clone ? n[o] = Qe(t[o]) ? Xi(t[o]) : t[o] : n[o] = t[o];
  }), n;
}
const nu = (e) => {
  const t = Object.keys(e).map((r) => ({
    key: r,
    val: e[r]
  })) || [];
  return t.sort((r, n) => r.val - n.val), t.reduce((r, n) => ({
    ...r,
    [n.key]: n.val
  }), {});
};
function ou(e) {
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
  } = e, i = nu(t), s = Object.keys(i);
  function a(m) {
    return `@media (min-width:${typeof t[m] == "number" ? t[m] : m}${r})`;
  }
  function c(m) {
    return `@media (max-width:${(typeof t[m] == "number" ? t[m] : m) - n / 100}${r})`;
  }
  function d(m, S) {
    const b = s.indexOf(S);
    return `@media (min-width:${typeof t[m] == "number" ? t[m] : m}${r}) and (max-width:${(b !== -1 && typeof t[s[b]] == "number" ? t[s[b]] : S) - n / 100}${r})`;
  }
  function u(m) {
    return s.indexOf(m) + 1 < s.length ? d(m, s[s.indexOf(m) + 1]) : a(m);
  }
  function f(m) {
    const S = s.indexOf(m);
    return S === 0 ? a(s[1]) : S === s.length - 1 ? c(s[S]) : d(m, s[s.indexOf(m) + 1]).replace("@media", "@media not all and");
  }
  return {
    keys: s,
    values: i,
    up: a,
    down: c,
    between: d,
    only: u,
    not: f,
    unit: r,
    ...o
  };
}
function ko(e, t) {
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
function iu(e, t) {
  return t === "@" || t.startsWith("@") && (e.some((r) => t.startsWith(`@${r}`)) || !!t.match(/^@\d/));
}
function su(e, t) {
  const r = t.match(/^@([^/]+)?\/?(.+)?$/);
  if (!r) {
    if (process.env.NODE_ENV !== "production")
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The provided shorthand ${`(${t})`} is invalid. The format should be \`@<breakpoint | number>\` or \`@<breakpoint | number>/<container>\`.
For example, \`@sm\` or \`@600\` or \`@40rem/sidebar\`.` : nt(18, `(${t})`));
    return null;
  }
  const [, n, o] = r, i = Number.isNaN(+n) ? n || 0 : +n;
  return e.containerQueries(o).up(i);
}
function au(e) {
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
const cu = {
  borderRadius: 4
}, it = process.env.NODE_ENV !== "production" ? j.oneOfType([j.number, j.string, j.object, j.array]) : {};
function Ft(e, t) {
  return t ? Ne(e, t, {
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
}, Po = {
  // Sorted ASC by size. That's important.
  // It can't be configured as it's used statically for propTypes.
  keys: ["xs", "sm", "md", "lg", "xl"],
  up: (e) => `@media (min-width:${Cr[e]}px)`
}, lu = {
  containerQueries: (e) => ({
    up: (t) => {
      let r = typeof t == "number" ? t : Cr[t] || t;
      return typeof r == "number" && (r = `${r}px`), e ? `@container ${e} (min-width:${r})` : `@container (min-width:${r})`;
    }
  })
};
function Je(e, t, r) {
  const n = e.theme || {};
  if (Array.isArray(t)) {
    const i = n.breakpoints || Po;
    return t.reduce((s, a, c) => (s[i.up(i.keys[c])] = r(t[c]), s), {});
  }
  if (typeof t == "object") {
    const i = n.breakpoints || Po;
    return Object.keys(t).reduce((s, a) => {
      if (iu(i.keys, a)) {
        const c = su(n.containerQueries ? n : lu, a);
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
function uu(e = {}) {
  return e.keys?.reduce((r, n) => {
    const o = e.up(n);
    return r[o] = {}, r;
  }, {}) || {};
}
function No(e, t) {
  return e.reduce((r, n) => {
    const o = r[n];
    return (!o || Object.keys(o).length === 0) && delete r[n], r;
  }, t);
}
function Zi(e) {
  if (typeof e != "string")
    throw new Error(process.env.NODE_ENV !== "production" ? "MUI: `capitalize(string)` expects a string argument." : nt(7));
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
function Ee(e) {
  const {
    prop: t,
    cssProperty: r = e.prop,
    themeKey: n,
    transform: o
  } = e, i = (s) => {
    if (s[t] == null)
      return null;
    const a = s[t], c = s.theme, d = Or(c, n) || {};
    return Je(s, a, (f) => {
      let m = Sr(d, o, f);
      return f === m && typeof f == "string" && (m = Sr(d, o, `${t}${f === "default" ? "" : Zi(f)}`, f)), r === !1 ? m : {
        [r]: m
      };
    });
  };
  return i.propTypes = process.env.NODE_ENV !== "production" ? {
    [t]: it
  } : {}, i.filterProps = [t], i;
}
function du(e) {
  const t = {};
  return (r) => (t[r] === void 0 && (t[r] = e(r)), t[r]);
}
const fu = {
  m: "margin",
  p: "padding"
}, pu = {
  t: "Top",
  r: "Right",
  b: "Bottom",
  l: "Left",
  x: ["Left", "Right"],
  y: ["Top", "Bottom"]
}, Io = {
  marginX: "mx",
  marginY: "my",
  paddingX: "px",
  paddingY: "py"
}, hu = du((e) => {
  if (e.length > 2)
    if (Io[e])
      e = Io[e];
    else
      return [e];
  const [t, r] = e.split(""), n = fu[t], o = pu[r] || "";
  return Array.isArray(o) ? o.map((i) => n + i) : [n + o];
}), Rr = ["m", "mt", "mr", "mb", "ml", "mx", "my", "margin", "marginTop", "marginRight", "marginBottom", "marginLeft", "marginX", "marginY", "marginInline", "marginInlineStart", "marginInlineEnd", "marginBlock", "marginBlockStart", "marginBlockEnd"], vr = ["p", "pt", "pr", "pb", "pl", "px", "py", "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "paddingX", "paddingY", "paddingInline", "paddingInlineStart", "paddingInlineEnd", "paddingBlock", "paddingBlockStart", "paddingBlockEnd"], mu = [...Rr, ...vr];
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
function An(e) {
  return Jt(e, "spacing", 8, "spacing");
}
function Xt(e, t) {
  return typeof t == "string" || t == null ? t : e(t);
}
function gu(e, t) {
  return (r) => e.reduce((n, o) => (n[o] = Xt(t, r), n), {});
}
function yu(e, t, r, n) {
  if (!t.includes(r))
    return null;
  const o = hu(r), i = gu(o, n), s = e[r];
  return Je(e, s, i);
}
function Qi(e, t) {
  const r = An(e.theme);
  return Object.keys(e).map((n) => yu(e, t, n, r)).reduce(Ft, {});
}
function he(e) {
  return Qi(e, Rr);
}
he.propTypes = process.env.NODE_ENV !== "production" ? Rr.reduce((e, t) => (e[t] = it, e), {}) : {};
he.filterProps = Rr;
function me(e) {
  return Qi(e, vr);
}
me.propTypes = process.env.NODE_ENV !== "production" ? vr.reduce((e, t) => (e[t] = it, e), {}) : {};
me.filterProps = vr;
process.env.NODE_ENV !== "production" && mu.reduce((e, t) => (e[t] = it, e), {});
function es(e = 8, t = An({
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
  }), n), {}), r = (n) => Object.keys(n).reduce((o, i) => t[i] ? Ft(o, t[i](n)) : o, {});
  return r.propTypes = process.env.NODE_ENV !== "production" ? e.reduce((n, o) => Object.assign(n, o.propTypes), {}) : {}, r.filterProps = e.reduce((n, o) => n.concat(o.filterProps), []), r;
}
function De(e) {
  return typeof e != "number" ? e : `${e}px solid`;
}
function Fe(e, t) {
  return Ee({
    prop: e,
    themeKey: "borders",
    transform: t
  });
}
const bu = Fe("border", De), Su = Fe("borderTop", De), Eu = Fe("borderRight", De), wu = Fe("borderBottom", De), xu = Fe("borderLeft", De), Tu = Fe("borderColor"), Cu = Fe("borderTopColor"), Ou = Fe("borderRightColor"), Ru = Fe("borderBottomColor"), vu = Fe("borderLeftColor"), Au = Fe("outline", De), _u = Fe("outlineColor"), _r = (e) => {
  if (e.borderRadius !== void 0 && e.borderRadius !== null) {
    const t = Jt(e.theme, "shape.borderRadius", 4, "borderRadius"), r = (n) => ({
      borderRadius: Xt(t, n)
    });
    return Je(e, e.borderRadius, r);
  }
  return null;
};
_r.propTypes = process.env.NODE_ENV !== "production" ? {
  borderRadius: it
} : {};
_r.filterProps = ["borderRadius"];
Ar(bu, Su, Eu, wu, xu, Tu, Cu, Ou, Ru, vu, _r, Au, _u);
const kr = (e) => {
  if (e.gap !== void 0 && e.gap !== null) {
    const t = Jt(e.theme, "spacing", 8, "gap"), r = (n) => ({
      gap: Xt(t, n)
    });
    return Je(e, e.gap, r);
  }
  return null;
};
kr.propTypes = process.env.NODE_ENV !== "production" ? {
  gap: it
} : {};
kr.filterProps = ["gap"];
const Pr = (e) => {
  if (e.columnGap !== void 0 && e.columnGap !== null) {
    const t = Jt(e.theme, "spacing", 8, "columnGap"), r = (n) => ({
      columnGap: Xt(t, n)
    });
    return Je(e, e.columnGap, r);
  }
  return null;
};
Pr.propTypes = process.env.NODE_ENV !== "production" ? {
  columnGap: it
} : {};
Pr.filterProps = ["columnGap"];
const Nr = (e) => {
  if (e.rowGap !== void 0 && e.rowGap !== null) {
    const t = Jt(e.theme, "spacing", 8, "rowGap"), r = (n) => ({
      rowGap: Xt(t, n)
    });
    return Je(e, e.rowGap, r);
  }
  return null;
};
Nr.propTypes = process.env.NODE_ENV !== "production" ? {
  rowGap: it
} : {};
Nr.filterProps = ["rowGap"];
const ku = Ee({
  prop: "gridColumn"
}), Pu = Ee({
  prop: "gridRow"
}), Nu = Ee({
  prop: "gridAutoFlow"
}), Iu = Ee({
  prop: "gridAutoColumns"
}), $u = Ee({
  prop: "gridAutoRows"
}), Lu = Ee({
  prop: "gridTemplateColumns"
}), Du = Ee({
  prop: "gridTemplateRows"
}), Mu = Ee({
  prop: "gridTemplateAreas"
}), Fu = Ee({
  prop: "gridArea"
});
Ar(kr, Pr, Nr, ku, Pu, Nu, Iu, $u, Lu, Du, Mu, Fu);
function Tt(e, t) {
  return t === "grey" ? t : e;
}
const Bu = Ee({
  prop: "color",
  themeKey: "palette",
  transform: Tt
}), Uu = Ee({
  prop: "bgcolor",
  cssProperty: "backgroundColor",
  themeKey: "palette",
  transform: Tt
}), ju = Ee({
  prop: "backgroundColor",
  themeKey: "palette",
  transform: Tt
});
Ar(Bu, Uu, ju);
function ke(e) {
  return e <= 1 && e !== 0 ? `${e * 100}%` : e;
}
const Hu = Ee({
  prop: "width",
  transform: ke
}), _n = (e) => {
  if (e.maxWidth !== void 0 && e.maxWidth !== null) {
    const t = (r) => {
      const n = e.theme?.breakpoints?.values?.[r] || Cr[r];
      return n ? e.theme?.breakpoints?.unit !== "px" ? {
        maxWidth: `${n}${e.theme.breakpoints.unit}`
      } : {
        maxWidth: n
      } : {
        maxWidth: ke(r)
      };
    };
    return Je(e, e.maxWidth, t);
  }
  return null;
};
_n.filterProps = ["maxWidth"];
const Vu = Ee({
  prop: "minWidth",
  transform: ke
}), Wu = Ee({
  prop: "height",
  transform: ke
}), zu = Ee({
  prop: "maxHeight",
  transform: ke
}), qu = Ee({
  prop: "minHeight",
  transform: ke
});
Ee({
  prop: "size",
  cssProperty: "width",
  transform: ke
});
Ee({
  prop: "size",
  cssProperty: "height",
  transform: ke
});
const Ku = Ee({
  prop: "boxSizing"
});
Ar(Hu, _n, Vu, Wu, zu, qu, Ku);
const Ir = {
  // borders
  border: {
    themeKey: "borders",
    transform: De
  },
  borderTop: {
    themeKey: "borders",
    transform: De
  },
  borderRight: {
    themeKey: "borders",
    transform: De
  },
  borderBottom: {
    themeKey: "borders",
    transform: De
  },
  borderLeft: {
    themeKey: "borders",
    transform: De
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
    transform: De
  },
  outlineColor: {
    themeKey: "palette"
  },
  borderRadius: {
    themeKey: "shape.borderRadius",
    style: _r
  },
  // palette
  color: {
    themeKey: "palette",
    transform: Tt
  },
  bgcolor: {
    themeKey: "palette",
    cssProperty: "backgroundColor",
    transform: Tt
  },
  backgroundColor: {
    themeKey: "palette",
    transform: Tt
  },
  // spacing
  p: {
    style: me
  },
  pt: {
    style: me
  },
  pr: {
    style: me
  },
  pb: {
    style: me
  },
  pl: {
    style: me
  },
  px: {
    style: me
  },
  py: {
    style: me
  },
  padding: {
    style: me
  },
  paddingTop: {
    style: me
  },
  paddingRight: {
    style: me
  },
  paddingBottom: {
    style: me
  },
  paddingLeft: {
    style: me
  },
  paddingX: {
    style: me
  },
  paddingY: {
    style: me
  },
  paddingInline: {
    style: me
  },
  paddingInlineStart: {
    style: me
  },
  paddingInlineEnd: {
    style: me
  },
  paddingBlock: {
    style: me
  },
  paddingBlockStart: {
    style: me
  },
  paddingBlockEnd: {
    style: me
  },
  m: {
    style: he
  },
  mt: {
    style: he
  },
  mr: {
    style: he
  },
  mb: {
    style: he
  },
  ml: {
    style: he
  },
  mx: {
    style: he
  },
  my: {
    style: he
  },
  margin: {
    style: he
  },
  marginTop: {
    style: he
  },
  marginRight: {
    style: he
  },
  marginBottom: {
    style: he
  },
  marginLeft: {
    style: he
  },
  marginX: {
    style: he
  },
  marginY: {
    style: he
  },
  marginInline: {
    style: he
  },
  marginInlineStart: {
    style: he
  },
  marginInlineEnd: {
    style: he
  },
  marginBlock: {
    style: he
  },
  marginBlockStart: {
    style: he
  },
  marginBlockEnd: {
    style: he
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
    transform: ke
  },
  maxWidth: {
    style: _n
  },
  minWidth: {
    transform: ke
  },
  height: {
    transform: ke
  },
  maxHeight: {
    transform: ke
  },
  minHeight: {
    transform: ke
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
function Gu(...e) {
  const t = e.reduce((n, o) => n.concat(Object.keys(o)), []), r = new Set(t);
  return e.every((n) => r.size === Object.keys(n).length);
}
function Yu(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function Ju() {
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
      themeKey: d,
      transform: u,
      style: f
    } = a;
    if (n == null)
      return null;
    if (d === "typography" && n === "inherit")
      return {
        [r]: n
      };
    const m = Or(o, d) || {};
    return f ? f(s) : Je(s, n, (b) => {
      let h = Sr(m, u, b);
      return b === h && typeof b == "string" && (h = Sr(m, u, `${r}${b === "default" ? "" : Zi(b)}`, b)), c === !1 ? h : {
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
      let d = c;
      if (typeof c == "function")
        d = c(o);
      else if (typeof c != "object")
        return c;
      if (!d)
        return null;
      const u = uu(o.breakpoints), f = Object.keys(u);
      let m = u;
      return Object.keys(d).forEach((S) => {
        const b = Yu(d[S], o);
        if (b != null)
          if (typeof b == "object")
            if (s[S])
              m = Ft(m, e(S, b, o, s));
            else {
              const h = Je({
                theme: o
              }, b, (C) => ({
                [S]: C
              }));
              Gu(h, b) ? m[S] = t({
                sx: b,
                theme: o,
                nested: !0
              }) : m = Ft(m, h);
            }
          else
            m = Ft(m, e(S, b, o, s));
      }), !i && o.modularCssLayers ? {
        "@layer sx": ko(o, No(f, m))
      } : ko(o, No(f, m));
    }
    return Array.isArray(n) ? n.map(a) : a(n);
  }
  return t;
}
const Zt = Ju();
Zt.filterProps = ["sx"];
function Xu(e, t) {
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
function ts(e = {}, ...t) {
  const {
    breakpoints: r = {},
    palette: n = {},
    spacing: o,
    shape: i = {},
    ...s
  } = e, a = ou(r), c = es(o);
  let d = Ne({
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
      ...cu,
      ...i
    }
  }, s);
  return d = au(d), d.applyStyles = Xu, d = t.reduce((u, f) => Ne(u, f), d), d.unstable_sxConfig = {
    ...Ir,
    ...s?.unstable_sxConfig
  }, d.unstable_sx = function(f) {
    return Zt({
      sx: f,
      theme: this
    });
  }, d;
}
function Zu(e) {
  return Object.keys(e).length === 0;
}
function kn(e = null) {
  const t = ee.useContext(ai);
  return !t || Zu(t) ? e : t;
}
const Qu = ts();
function rs(e = Qu) {
  return kn(e);
}
function tn(e) {
  const t = Ql(e);
  return e !== t && t.styles ? (t.styles.match(/^@layer\s+[^{]*$/) || (t.styles = `@layer global{${t.styles}}`), t) : e;
}
function ns({
  styles: e,
  themeId: t,
  defaultTheme: r = {}
}) {
  const n = rs(r), o = t && n[t] || n;
  let i = typeof e == "function" ? e(o) : e;
  return o.modularCssLayers && (Array.isArray(i) ? i = i.map((s) => tn(typeof s == "function" ? s(o) : s)) : i = tn(i)), /* @__PURE__ */ g(vn, {
    styles: i
  });
}
process.env.NODE_ENV !== "production" && (ns.propTypes = {
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
const $o = (e) => e, ed = () => {
  let e = $o;
  return {
    configure(t) {
      e = t;
    },
    generate(t) {
      return e(t);
    },
    reset() {
      e = $o;
    }
  };
}, td = ed(), rd = {
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
function nd(e, t, r = "Mui") {
  const n = rd[t];
  return n ? `${r}-${n}` : `${td.generate(e)}-${t}`;
}
const os = typeof window < "u" ? ee.useLayoutEffect : ee.useEffect;
function od(e, t = Number.MIN_SAFE_INTEGER, r = Number.MAX_SAFE_INTEGER) {
  return Math.max(t, Math.min(e, r));
}
function Pn(e, t = 0, r = 1) {
  return process.env.NODE_ENV !== "production" && (e < t || e > r) && console.error(`MUI: The value provided ${e} is out of range [${t}, ${r}].`), od(e, t, r);
}
function id(e) {
  e = e.slice(1);
  const t = new RegExp(`.{1,${e.length >= 6 ? 2 : 1}}`, "g");
  let r = e.match(t);
  return r && r[0].length === 1 && (r = r.map((n) => n + n)), process.env.NODE_ENV !== "production" && e.length !== e.trim().length && console.error(`MUI: The color: "${e}" is invalid. Make sure the color input doesn't contain leading/trailing space.`), r ? `rgb${r.length === 4 ? "a" : ""}(${r.map((n, o) => o < 3 ? parseInt(n, 16) : Math.round(parseInt(n, 16) / 255 * 1e3) / 1e3).join(", ")})` : "";
}
function ot(e) {
  if (e.type)
    return e;
  if (e.charAt(0) === "#")
    return ot(id(e));
  const t = e.indexOf("("), r = e.substring(0, t);
  if (!["rgb", "rgba", "hsl", "hsla", "color"].includes(r))
    throw new Error(process.env.NODE_ENV !== "production" ? `MUI: Unsupported \`${e}\` color.
The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().` : nt(9, e));
  let n = e.substring(t + 1, e.length - 1), o;
  if (r === "color") {
    if (n = n.split(" "), o = n.shift(), n.length === 4 && n[3].charAt(0) === "/" && (n[3] = n[3].slice(1)), !["srgb", "display-p3", "a98-rgb", "prophoto-rgb", "rec-2020"].includes(o))
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: unsupported \`${o}\` color space.
The following color spaces are supported: srgb, display-p3, a98-rgb, prophoto-rgb, rec-2020.` : nt(10, o));
  } else
    n = n.split(",");
  return n = n.map((i) => parseFloat(i)), {
    type: r,
    values: n,
    colorSpace: o
  };
}
const sd = (e) => {
  const t = ot(e);
  return t.values.slice(0, 3).map((r, n) => t.type.includes("hsl") && n !== 0 ? `${r}%` : r).join(" ");
}, Lt = (e, t) => {
  try {
    return sd(e);
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
function is(e) {
  e = ot(e);
  const {
    values: t
  } = e, r = t[0], n = t[1] / 100, o = t[2] / 100, i = n * Math.min(o, 1 - o), s = (d, u = (d + r / 30) % 12) => o - i * Math.max(Math.min(u - 3, 9 - u, 1), -1);
  let a = "rgb";
  const c = [Math.round(s(0) * 255), Math.round(s(8) * 255), Math.round(s(4) * 255)];
  return e.type === "hsla" && (a += "a", c.push(t[3])), $r({
    type: a,
    values: c
  });
}
function ln(e) {
  e = ot(e);
  let t = e.type === "hsl" || e.type === "hsla" ? ot(is(e)).values : e.values;
  return t = t.map((r) => (e.type !== "color" && (r /= 255), r <= 0.03928 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4)), Number((0.2126 * t[0] + 0.7152 * t[1] + 0.0722 * t[2]).toFixed(3));
}
function Lo(e, t) {
  const r = ln(e), n = ln(t);
  return (Math.max(r, n) + 0.05) / (Math.min(r, n) + 0.05);
}
function ss(e, t) {
  return e = ot(e), t = Pn(t), (e.type === "rgb" || e.type === "hsl") && (e.type += "a"), e.type === "color" ? e.values[3] = `/${t}` : e.values[3] = t, $r(e);
}
function st(e, t, r) {
  try {
    return ss(e, t);
  } catch {
    return r && process.env.NODE_ENV !== "production" && console.warn(r), e;
  }
}
function Lr(e, t) {
  if (e = ot(e), t = Pn(t), e.type.includes("hsl"))
    e.values[2] *= 1 - t;
  else if (e.type.includes("rgb") || e.type.includes("color"))
    for (let r = 0; r < 3; r += 1)
      e.values[r] *= 1 - t;
  return $r(e);
}
function ie(e, t, r) {
  try {
    return Lr(e, t);
  } catch {
    return r && process.env.NODE_ENV !== "production" && console.warn(r), e;
  }
}
function Dr(e, t) {
  if (e = ot(e), t = Pn(t), e.type.includes("hsl"))
    e.values[2] += (100 - e.values[2]) * t;
  else if (e.type.includes("rgb"))
    for (let r = 0; r < 3; r += 1)
      e.values[r] += (255 - e.values[r]) * t;
  else if (e.type.includes("color"))
    for (let r = 0; r < 3; r += 1)
      e.values[r] += (1 - e.values[r]) * t;
  return $r(e);
}
function se(e, t, r) {
  try {
    return Dr(e, t);
  } catch {
    return r && process.env.NODE_ENV !== "production" && console.warn(r), e;
  }
}
function ad(e, t = 0.15) {
  return ln(e) > 0.5 ? Lr(e, t) : Dr(e, t);
}
function or(e, t, r) {
  try {
    return ad(e, t);
  } catch {
    return e;
  }
}
const cd = "exact-prop: ​";
function as(e) {
  return process.env.NODE_ENV === "production" ? e : {
    ...e,
    [cd]: (t) => {
      const r = Object.keys(t).filter((n) => !e.hasOwnProperty(n));
      return r.length > 0 ? new Error(`The following props are not supported: ${r.map((n) => `\`${n}\``).join(", ")}. Please remove them.`) : null;
    }
  };
}
const Nn = /* @__PURE__ */ ee.createContext(null);
process.env.NODE_ENV !== "production" && (Nn.displayName = "ThemeContext");
function In() {
  const e = ee.useContext(Nn);
  return process.env.NODE_ENV !== "production" && ee.useDebugValue(e), e;
}
const ld = typeof Symbol == "function" && Symbol.for, ud = ld ? /* @__PURE__ */ Symbol.for("mui.nested") : "__THEME_NESTED__";
function dd(e, t) {
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
  } = e, n = In();
  process.env.NODE_ENV !== "production" && n === null && typeof r == "function" && console.error(["MUI: You are providing a theme function prop to the ThemeProvider component:", "<ThemeProvider theme={outerTheme => outerTheme} />", "", "However, no outer theme is present.", "Make sure a theme is already injected higher in the React tree or provide a theme object."].join(`
`));
  const o = ee.useMemo(() => {
    const i = n === null ? {
      ...r
    } : dd(n, r);
    return i != null && (i[ud] = n !== null), i;
  }, [r, n]);
  return /* @__PURE__ */ g(Nn.Provider, {
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
process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "production" && (Er.propTypes = as(Er.propTypes));
const fd = /* @__PURE__ */ ee.createContext();
function cs({
  value: e,
  ...t
}) {
  return /* @__PURE__ */ g(fd.Provider, {
    value: e ?? !0,
    ...t
  });
}
process.env.NODE_ENV !== "production" && (cs.propTypes = {
  children: j.node,
  value: j.bool
});
const pd = /* @__PURE__ */ ee.createContext(void 0);
function ls({
  value: e,
  children: t
}) {
  return /* @__PURE__ */ g(pd.Provider, {
    value: e,
    children: t
  });
}
process.env.NODE_ENV !== "production" && (ls.propTypes = {
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
let Do = 0;
function hd(e) {
  const [t, r] = ee.useState(e), n = e || t;
  return ee.useEffect(() => {
    t == null && (Do += 1, r(`mui-${Do}`));
  }, [t]), n;
}
const md = {
  ...ee
}, Mo = md.useId;
function gd(e) {
  return Mo !== void 0 ? Mo() : hd(e);
}
function yd(e) {
  const t = kn(), r = gd() || "", {
    modularCssLayers: n
  } = e;
  let o = "mui.global, mui.components, mui.theme, mui.custom, mui.sx";
  return !n || t !== null ? o = "" : typeof n == "string" ? o = n.replace(/mui(?!\.)/g, o) : o = `@layer ${o};`, os(() => {
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
  }, [o, r]), o ? /* @__PURE__ */ g(ns, {
    styles: o
  }) : null;
}
const Fo = {};
function Bo(e, t, r, n = !1) {
  return ee.useMemo(() => {
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
function Ht(e) {
  const {
    children: t,
    theme: r,
    themeId: n
  } = e, o = kn(Fo), i = In() || Fo;
  process.env.NODE_ENV !== "production" && (o === null && typeof r == "function" || n && o && !o[n] && typeof r == "function") && console.error(["MUI: You are providing a theme function prop to the ThemeProvider component:", "<ThemeProvider theme={outerTheme => outerTheme} />", "", "However, no outer theme is present.", "Make sure a theme is already injected higher in the React tree or provide a theme object."].join(`
`));
  const s = Bo(n, o, r), a = Bo(n, i, r, !0), c = (n ? s[n] : s).direction === "rtl", d = yd(s);
  return /* @__PURE__ */ g(Er, {
    theme: a,
    children: /* @__PURE__ */ g(ai.Provider, {
      value: s,
      children: /* @__PURE__ */ g(cs, {
        value: c,
        children: /* @__PURE__ */ L(ls, {
          value: n ? s[n].components : s.components,
          children: [d, t]
        })
      })
    })
  });
}
process.env.NODE_ENV !== "production" && (Ht.propTypes = {
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
process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "production" && (Ht.propTypes = as(Ht.propTypes));
const $n = "mode", Ln = "color-scheme", bd = "data-color-scheme";
function Sd(e) {
  const {
    defaultMode: t = "system",
    defaultLightColorScheme: r = "light",
    defaultDarkColorScheme: n = "dark",
    modeStorageKey: o = $n,
    colorSchemeStorageKey: i = Ln,
    attribute: s = bd,
    colorSchemeNode: a = "document.documentElement",
    nonce: c
  } = e || {};
  let d = "", u = s;
  if (s === "class" && (u = ".%s"), s === "data" && (u = "[data-%s]"), u.startsWith(".")) {
    const m = u.substring(1);
    d += `${a}.classList.remove('${m}'.replace('%s', light), '${m}'.replace('%s', dark));
      ${a}.classList.add('${m}'.replace('%s', colorScheme));`;
  }
  const f = u.match(/\[([^[\]]+)\]/);
  if (f) {
    const [m, S] = f[1].split("=");
    S || (d += `${a}.removeAttribute('${m}'.replace('%s', light));
      ${a}.removeAttribute('${m}'.replace('%s', dark));`), d += `
      ${a}.setAttribute('${m}'.replace('%s', colorScheme), ${S ? `${S}.replace('%s', colorScheme)` : '""'});`;
  } else u !== ".%s" && (d += `${a}.setAttribute('${u}', colorScheme);`);
  return /* @__PURE__ */ g("script", {
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
    ${d}
  }
} catch(e){}})();`
    }
  }, "mui-color-scheme-init");
}
function Ed() {
}
const wd = ({
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
      return Ed;
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
function Uo(e) {
  if (typeof window < "u" && typeof window.matchMedia == "function" && e === "system")
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function us(e, t) {
  if (e.mode === "light" || e.mode === "system" && e.systemMode === "light")
    return t("light");
  if (e.mode === "dark" || e.mode === "system" && e.systemMode === "dark")
    return t("dark");
}
function xd(e) {
  return us(e, (t) => {
    if (t === "light")
      return e.lightColorScheme;
    if (t === "dark")
      return e.darkColorScheme;
  });
}
function Td(e) {
  const {
    defaultMode: t = "light",
    defaultLightColorScheme: r,
    defaultDarkColorScheme: n,
    supportedColorSchemes: o = [],
    modeStorageKey: i = $n,
    colorSchemeStorageKey: s = Ln,
    storageWindow: a = typeof window > "u" ? void 0 : window,
    storageManager: c = wd,
    noSsr: d = !1
  } = e, u = o.join(","), f = o.length > 1, m = ee.useMemo(() => c?.({
    key: i,
    storageWindow: a
  }), [c, i, a]), S = ee.useMemo(() => c?.({
    key: `${s}-light`,
    storageWindow: a
  }), [c, s, a]), b = ee.useMemo(() => c?.({
    key: `${s}-dark`,
    storageWindow: a
  }), [c, s, a]), [h, C] = ee.useState(() => {
    const V = m?.get(t) || t, D = S?.get(r) || r, U = b?.get(n) || n;
    return {
      mode: V,
      systemMode: Uo(V),
      lightColorScheme: D,
      darkColorScheme: U
    };
  }), [y, T] = ee.useState(d || !f);
  ee.useEffect(() => {
    T(!0);
  }, []);
  const R = xd(h), x = ee.useCallback((V) => {
    C((D) => {
      if (V === D.mode)
        return D;
      const U = V ?? t;
      return m?.set(U), {
        ...D,
        mode: U,
        systemMode: Uo(U)
      };
    });
  }, [m, t]), w = ee.useCallback((V) => {
    V ? typeof V == "string" ? V && !u.includes(V) ? console.error(`\`${V}\` does not exist in \`theme.colorSchemes\`.`) : C((D) => {
      const U = {
        ...D
      };
      return us(D, (z) => {
        z === "light" && (S?.set(V), U.lightColorScheme = V), z === "dark" && (b?.set(V), U.darkColorScheme = V);
      }), U;
    }) : C((D) => {
      const U = {
        ...D
      }, z = V.light === null ? r : V.light, l = V.dark === null ? n : V.dark;
      return z && (u.includes(z) ? (U.lightColorScheme = z, S?.set(z)) : console.error(`\`${z}\` does not exist in \`theme.colorSchemes\`.`)), l && (u.includes(l) ? (U.darkColorScheme = l, b?.set(l)) : console.error(`\`${l}\` does not exist in \`theme.colorSchemes\`.`)), U;
    }) : C((D) => (S?.set(r), b?.set(n), {
      ...D,
      lightColorScheme: r,
      darkColorScheme: n
    }));
  }, [u, S, b, r, n]), I = ee.useCallback((V) => {
    h.mode === "system" && C((D) => {
      const U = V?.matches ? "dark" : "light";
      return D.systemMode === U ? D : {
        ...D,
        systemMode: U
      };
    });
  }, [h.mode]), X = ee.useRef(I);
  return X.current = I, ee.useEffect(() => {
    if (typeof window.matchMedia != "function" || !f)
      return;
    const V = (...U) => X.current(...U), D = window.matchMedia("(prefers-color-scheme: dark)");
    return D.addListener(V), V(D), () => {
      D.removeListener(V);
    };
  }, [f]), ee.useEffect(() => {
    if (f) {
      const V = m?.subscribe((z) => {
        (!z || ["light", "dark", "system"].includes(z)) && x(z || t);
      }) || rn, D = S?.subscribe((z) => {
        (!z || u.match(z)) && w({
          light: z
        });
      }) || rn, U = b?.subscribe((z) => {
        (!z || u.match(z)) && w({
          dark: z
        });
      }) || rn;
      return () => {
        V(), D(), U();
      };
    }
  }, [w, x, u, t, a, f, m, S, b]), {
    ...h,
    mode: y ? h.mode : void 0,
    systemMode: y ? h.systemMode : void 0,
    colorScheme: y ? R : void 0,
    setMode: x,
    setColorScheme: w
  };
}
const Cd = "*{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}";
function Od(e) {
  const {
    themeId: t,
    /**
     * This `theme` object needs to follow a certain structure to
     * be used correctly by the finel `CssVarsProvider`. It should have a
     * `colorSchemes` key with the light and dark (and any other) palette.
     * It should also ideally have a vars object created using `prepareCssVars`.
     */
    theme: r = {},
    modeStorageKey: n = $n,
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
  }, d = /* @__PURE__ */ ee.createContext(void 0);
  process.env.NODE_ENV !== "production" && (d.displayName = "ColorSchemeContext");
  const u = () => ee.useContext(d) || c, f = {}, m = {};
  function S(y) {
    const {
      children: T,
      theme: R,
      modeStorageKey: x = n,
      colorSchemeStorageKey: w = o,
      disableTransitionOnChange: I = i,
      storageManager: X,
      storageWindow: V = typeof window > "u" ? void 0 : window,
      documentNode: D = typeof document > "u" ? void 0 : document,
      colorSchemeNode: U = typeof document > "u" ? void 0 : document.documentElement,
      disableNestedContext: z = !1,
      disableStyleSheetGeneration: l = !1,
      defaultMode: F = "system",
      forceThemeRerender: _ = !1,
      noSsr: Z
    } = y, K = ee.useRef(!1), M = In(), fe = ee.useContext(d), Be = !!fe && !z, O = ee.useMemo(() => R || (typeof r == "function" ? r() : r), [R]), P = O[t], $ = P || O, {
      colorSchemes: B = f,
      components: q = m,
      cssVarPrefix: J
    } = $, Y = Object.keys(B).filter((ve) => !!B[ve]).join(","), N = ee.useMemo(() => Y.split(","), [Y]), H = typeof s == "string" ? s : s.light, Q = typeof s == "string" ? s : s.dark, te = B[H] && B[Q] ? F : B[$.defaultColorScheme]?.palette?.mode || $.palette?.mode, {
      mode: ye,
      setMode: A,
      systemMode: W,
      lightColorScheme: re,
      darkColorScheme: pe,
      colorScheme: Rt,
      setColorScheme: Ie
    } = Td({
      supportedColorSchemes: N,
      defaultLightColorScheme: H,
      defaultDarkColorScheme: Q,
      modeStorageKey: x,
      colorSchemeStorageKey: w,
      defaultMode: te,
      storageManager: X,
      storageWindow: V,
      noSsr: Z
    });
    let G = ye, ae = Rt;
    Be && (G = fe.mode, ae = fe.colorScheme), process.env.NODE_ENV !== "production" && _ && !$.vars && console.warn(["MUI: The `forceThemeRerender` prop should only be used with CSS theme variables.", "Note that it will slow down the app when changing between modes, so only do this when you cannot find a better solution."].join(`
`));
    let _e = ae || $.defaultColorScheme;
    $.vars && !_ && (_e = $.defaultColorScheme);
    const $e = ee.useMemo(() => {
      const ve = $.generateThemeVars?.() || $.vars, be = {
        ...$,
        components: q,
        colorSchemes: B,
        cssVarPrefix: J,
        vars: ve
      };
      if (typeof be.generateSpacing == "function" && (be.spacing = be.generateSpacing()), _e) {
        const Le = B[_e];
        Le && typeof Le == "object" && Object.keys(Le).forEach((He) => {
          Le[He] && typeof Le[He] == "object" ? be[He] = {
            ...be[He],
            ...Le[He]
          } : be[He] = Le[He];
        });
      }
      return a ? a(be) : be;
    }, [$, _e, q, B, J]), Xe = $.colorSchemeSelector;
    os(() => {
      if (ae && U && Xe && Xe !== "media") {
        const ve = Xe;
        let be = Xe;
        if (ve === "class" && (be = ".%s"), ve === "data" && (be = "[data-%s]"), ve?.startsWith("data-") && !ve.includes("%s") && (be = `[${ve}="%s"]`), be.startsWith("."))
          U.classList.remove(...N.map((Le) => be.substring(1).replace("%s", Le))), U.classList.add(be.substring(1).replace("%s", ae));
        else {
          const Le = be.replace("%s", ae).match(/\[([^\]]+)\]/);
          if (Le) {
            const [He, Fr] = Le[1].split("=");
            Fr || N.forEach((Rs) => {
              U.removeAttribute(He.replace(ae, Rs));
            }), U.setAttribute(He, Fr ? Fr.replace(/"|'/g, "") : "");
          } else
            U.setAttribute(be, ae);
        }
      }
    }, [ae, Xe, U, N]), ee.useEffect(() => {
      let ve;
      if (I && K.current && D) {
        const be = D.createElement("style");
        be.appendChild(D.createTextNode(Cd)), D.head.appendChild(be), window.getComputedStyle(D.body), ve = setTimeout(() => {
          D.head.removeChild(be);
        }, 1);
      }
      return () => {
        clearTimeout(ve);
      };
    }, [ae, I, D]), ee.useEffect(() => (K.current = !0, () => {
      K.current = !1;
    }), []);
    const Mr = ee.useMemo(() => ({
      allColorSchemes: N,
      colorScheme: ae,
      darkColorScheme: pe,
      lightColorScheme: re,
      mode: G,
      setColorScheme: Ie,
      setMode: process.env.NODE_ENV === "production" ? A : (ve) => {
        $e.colorSchemeSelector === "media" && console.error(["MUI: The `setMode` function has no effect if `colorSchemeSelector` is `media` (`media` is the default value).", "To toggle the mode manually, please configure `colorSchemeSelector` to use a class or data attribute.", "To learn more, visit https://mui.com/material-ui/customization/css-theme-variables/configuration/#toggling-dark-mode-manually"].join(`
`)), A(ve);
      },
      systemMode: W
    }), [N, ae, pe, re, G, Ie, A, W, $e.colorSchemeSelector]);
    let Ze = !0;
    (l || $.cssVariables === !1 || Be && M?.cssVarPrefix === J) && (Ze = !1);
    const Fn = /* @__PURE__ */ L(ee.Fragment, {
      children: [/* @__PURE__ */ g(Ht, {
        themeId: P ? t : void 0,
        theme: $e,
        children: T
      }), Ze && /* @__PURE__ */ g(vn, {
        styles: $e.generateStyleSheets?.() || []
      })]
    });
    return Be ? Fn : /* @__PURE__ */ g(d.Provider, {
      value: Mr,
      children: Fn
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
    useColorScheme: u,
    getInitColorSchemeScript: (y) => Sd({
      colorSchemeStorageKey: o,
      defaultLightColorScheme: b,
      defaultDarkColorScheme: h,
      modeStorageKey: n,
      ...y
    })
  };
}
function Rd(e = "") {
  function t(...n) {
    if (!n.length)
      return "";
    const o = n[0];
    return typeof o == "string" && !o.match(/(#|\(|\)|(-?(\d*\.)?\d+)(px|em|%|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc))|^(-?(\d*\.)?\d+)$|(\d+ \d+ \d+)/) ? `, var(--${e ? `${e}-` : ""}${o}${t(...n.slice(1))})` : `, ${o}`;
  }
  return (n, ...o) => `var(--${e ? `${e}-` : ""}${n}${t(...o)})`;
}
const jo = (e, t, r, n = []) => {
  let o = e;
  t.forEach((i, s) => {
    s === t.length - 1 ? Array.isArray(o) ? o[Number(i)] = r : o && typeof o == "object" && (o[i] = r) : o && typeof o == "object" && (o[i] || (o[i] = n.includes(i) ? [] : {}), o = o[i]);
  });
}, vd = (e, t, r) => {
  function n(o, i = [], s = []) {
    Object.entries(o).forEach(([a, c]) => {
      (!r || r && !r([...i, a])) && c != null && (typeof c == "object" && Object.keys(c).length > 0 ? n(c, [...i, a], Array.isArray(c) ? [...s, a] : s) : t([...i, a], c, s));
    });
  }
  n(e);
}, Ad = (e, t) => typeof t == "number" ? ["lineHeight", "fontWeight", "opacity", "zIndex"].some((n) => e.includes(n)) || e[e.length - 1].toLowerCase().includes("opacity") ? t : `${t}px` : t;
function nn(e, t) {
  const {
    prefix: r,
    shouldSkipGeneratingVar: n
  } = t || {}, o = {}, i = {}, s = {};
  return vd(
    e,
    (a, c, d) => {
      if ((typeof c == "string" || typeof c == "number") && (!n || !n(a, c))) {
        const u = `--${r ? `${r}-` : ""}${a.join("-")}`, f = Ad(a, c);
        Object.assign(o, {
          [u]: f
        }), jo(i, a, `var(${u})`, d), jo(s, a, `var(${u}, ${f})`, d);
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
function _d(e, t = {}) {
  const {
    getSelector: r = y,
    disableCssColorScheme: n,
    colorSchemeSelector: o,
    enableContrastVars: i
  } = t, {
    colorSchemes: s = {},
    components: a,
    defaultColorScheme: c = "light",
    ...d
  } = e, {
    vars: u,
    css: f,
    varsWithDefaults: m
  } = nn(d, t);
  let S = m;
  const b = {}, {
    [c]: h,
    ...C
  } = s;
  if (Object.entries(C || {}).forEach(([x, w]) => {
    const {
      vars: I,
      css: X,
      varsWithDefaults: V
    } = nn(w, t);
    S = Ne(S, V), b[x] = {
      css: X,
      vars: I
    };
  }), h) {
    const {
      css: x,
      vars: w,
      varsWithDefaults: I
    } = nn(h, t);
    S = Ne(S, I), b[c] = {
      css: x,
      vars: w
    };
  }
  function y(x, w) {
    let I = o;
    if (o === "class" && (I = ".%s"), o === "data" && (I = "[data-%s]"), o?.startsWith("data-") && !o.includes("%s") && (I = `[${o}="%s"]`), x) {
      if (I === "media")
        return e.defaultColorScheme === x ? ":root" : {
          [`@media (prefers-color-scheme: ${s[x]?.palette?.mode || x})`]: {
            ":root": w
          }
        };
      if (I)
        return e.defaultColorScheme === x ? `:root, ${I.replace("%s", String(x))}` : I.replace("%s", String(x));
    }
    return ":root";
  }
  return {
    vars: S,
    generateThemeVars: () => {
      let x = {
        ...u
      };
      return Object.entries(b).forEach(([, {
        vars: w
      }]) => {
        x = Ne(x, w);
      }), x;
    },
    generateStyleSheets: () => {
      const x = [], w = e.defaultColorScheme || "light";
      function I(D, U) {
        Object.keys(U).length && x.push(typeof D == "string" ? {
          [D]: {
            ...U
          }
        } : D);
      }
      I(r(void 0, {
        ...f
      }), f);
      const {
        [w]: X,
        ...V
      } = b;
      if (X) {
        const {
          css: D
        } = X, U = s[w]?.palette?.mode, z = !n && U ? {
          colorScheme: U,
          ...D
        } : {
          ...D
        };
        I(r(w, {
          ...z
        }), z);
      }
      return Object.entries(V).forEach(([D, {
        css: U
      }]) => {
        const z = s[D]?.palette?.mode, l = !n && z ? {
          colorScheme: z,
          ...U
        } : {
          ...U
        };
        I(r(D, {
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
function kd(e) {
  return function(r) {
    return e === "media" ? (process.env.NODE_ENV !== "production" && r !== "light" && r !== "dark" && console.error(`MUI: @media (prefers-color-scheme) supports only 'light' or 'dark', but receive '${r}'.`), `@media (prefers-color-scheme: ${r})`) : e ? e.startsWith("data-") && !e.includes("%s") ? `[${e}="${r}"] &` : e === "class" ? `.${r} &` : e === "data" ? `[data-${r}] &` : `${e.replace("%s", r)} &` : "&";
  };
}
const Vt = {
  black: "#000",
  white: "#fff"
}, Pd = {
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
}, mt = {
  50: "#f3e5f5",
  200: "#ce93d8",
  300: "#ba68c8",
  400: "#ab47bc",
  500: "#9c27b0",
  700: "#7b1fa2"
}, gt = {
  300: "#e57373",
  400: "#ef5350",
  500: "#f44336",
  700: "#d32f2f",
  800: "#c62828"
}, kt = {
  300: "#ffb74d",
  400: "#ffa726",
  500: "#ff9800",
  700: "#f57c00",
  900: "#e65100"
}, yt = {
  50: "#e3f2fd",
  200: "#90caf9",
  400: "#42a5f5",
  700: "#1976d2",
  800: "#1565c0"
}, bt = {
  300: "#4fc3f7",
  400: "#29b6f6",
  500: "#03a9f4",
  700: "#0288d1",
  900: "#01579b"
}, St = {
  300: "#81c784",
  400: "#66bb6a",
  500: "#4caf50",
  700: "#388e3c",
  800: "#2e7d32",
  900: "#1b5e20"
};
function ds() {
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
      paper: Vt.white,
      default: Vt.white
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
const fs = ds();
function ps() {
  return {
    text: {
      primary: Vt.white,
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
      active: Vt.white,
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
const un = ps();
function Ho(e, t, r, n) {
  const o = n.light || n, i = n.dark || n * 1.5;
  e[t] || (e.hasOwnProperty(r) ? e[t] = e[r] : t === "light" ? e.light = Dr(e.main, o) : t === "dark" && (e.dark = Lr(e.main, i)));
}
function Vo(e, t, r, n, o) {
  const i = o.light || o, s = o.dark || o * 1.5;
  t[r] || (t.hasOwnProperty(n) ? t[r] = t[n] : r === "light" ? t.light = `color-mix(in ${e}, ${t.main}, #fff ${(i * 100).toFixed(0)}%)` : r === "dark" && (t.dark = `color-mix(in ${e}, ${t.main}, #000 ${(s * 100).toFixed(0)}%)`));
}
function Nd(e = "light") {
  return e === "dark" ? {
    main: yt[200],
    light: yt[50],
    dark: yt[400]
  } : {
    main: yt[700],
    light: yt[400],
    dark: yt[800]
  };
}
function Id(e = "light") {
  return e === "dark" ? {
    main: mt[200],
    light: mt[50],
    dark: mt[400]
  } : {
    main: mt[500],
    light: mt[300],
    dark: mt[700]
  };
}
function $d(e = "light") {
  return e === "dark" ? {
    main: gt[500],
    light: gt[300],
    dark: gt[700]
  } : {
    main: gt[700],
    light: gt[400],
    dark: gt[800]
  };
}
function Ld(e = "light") {
  return e === "dark" ? {
    main: bt[400],
    light: bt[300],
    dark: bt[700]
  } : {
    main: bt[700],
    light: bt[500],
    dark: bt[900]
  };
}
function Dd(e = "light") {
  return e === "dark" ? {
    main: St[400],
    light: St[300],
    dark: St[700]
  } : {
    main: St[800],
    light: St[500],
    dark: St[900]
  };
}
function Md(e = "light") {
  return e === "dark" ? {
    main: kt[400],
    light: kt[300],
    dark: kt[700]
  } : {
    main: "#ed6c02",
    // closest to orange[800] that pass 3:1.
    light: kt[500],
    dark: kt[900]
  };
}
function Fd(e) {
  return `oklch(from ${e} var(--__l) 0 h / var(--__a))`;
}
function Dn(e) {
  const {
    mode: t = "light",
    contrastThreshold: r = 3,
    tonalOffset: n = 0.2,
    colorSpace: o,
    ...i
  } = e, s = e.primary || Nd(t), a = e.secondary || Id(t), c = e.error || $d(t), d = e.info || Ld(t), u = e.success || Dd(t), f = e.warning || Md(t);
  function m(C) {
    if (o)
      return Fd(C);
    const y = Lo(C, un.text.primary) >= r ? un.text.primary : fs.text.primary;
    if (process.env.NODE_ENV !== "production") {
      const T = Lo(C, y);
      T < 3 && console.error([`MUI: The contrast ratio of ${T}:1 for ${y} on ${C}`, "falls below the WCAG recommended absolute minimum contrast ratio of 3:1.", "https://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-contrast"].join(`
`));
    }
    return y;
  }
  const S = ({
    color: C,
    name: y,
    mainShade: T = 500,
    lightShade: R = 300,
    darkShade: x = 700
  }) => {
    if (C = {
      ...C
    }, !C.main && C[T] && (C.main = C[T]), !C.hasOwnProperty("main"))
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The color${y ? ` (${y})` : ""} provided to augmentColor(color) is invalid.
The color object needs to have a \`main\` property or a \`${T}\` property.` : nt(11, y ? ` (${y})` : "", T));
    if (typeof C.main != "string")
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The color${y ? ` (${y})` : ""} provided to augmentColor(color) is invalid.
\`color.main\` should be a string, but \`${JSON.stringify(C.main)}\` was provided instead.

Did you intend to use one of the following approaches?

import { green } from "@mui/material/colors";

const theme1 = createTheme({ palette: {
  primary: green,
} });

const theme2 = createTheme({ palette: {
  primary: { main: green[500] },
} });` : nt(12, y ? ` (${y})` : "", JSON.stringify(C.main)));
    return o ? (Vo(o, C, "light", R, n), Vo(o, C, "dark", x, n)) : (Ho(C, "light", R, n), Ho(C, "dark", x, n)), C.contrastText || (C.contrastText = m(C.main)), C;
  };
  let b;
  return t === "light" ? b = ds() : t === "dark" && (b = ps()), process.env.NODE_ENV !== "production" && (b || console.error(`MUI: The palette mode \`${t}\` is not supported.`)), Ne({
    // A collection of common colors.
    common: {
      ...Vt
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
      color: d,
      name: "info"
    }),
    // The colors used to indicate the successful completion of an action that user triggered.
    success: S({
      color: u,
      name: "success"
    }),
    // The grey colors.
    grey: Pd,
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
function Bd(e) {
  const t = {};
  return Object.entries(e).forEach((n) => {
    const [o, i] = n;
    typeof i == "object" && (t[o] = `${i.fontStyle ? `${i.fontStyle} ` : ""}${i.fontVariant ? `${i.fontVariant} ` : ""}${i.fontWeight ? `${i.fontWeight} ` : ""}${i.fontStretch ? `${i.fontStretch} ` : ""}${i.fontSize || ""}${i.lineHeight ? `/${i.lineHeight} ` : ""}${i.fontFamily || ""}`);
  }), t;
}
function Ud(e, t) {
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
function jd(e) {
  return Math.round(e * 1e5) / 1e5;
}
const Wo = {
  textTransform: "uppercase"
}, zo = '"Roboto", "Helvetica", "Arial", sans-serif';
function hs(e, t) {
  const {
    fontFamily: r = zo,
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
    allVariants: d,
    pxToRem: u,
    ...f
  } = typeof t == "function" ? t(e) : t;
  process.env.NODE_ENV !== "production" && (typeof n != "number" && console.error("MUI: `fontSize` is required to be a number."), typeof c != "number" && console.error("MUI: `htmlFontSize` is required to be a number."));
  const m = n / 14, S = u || ((C) => `${C / c * m}rem`), b = (C, y, T, R, x) => ({
    fontFamily: r,
    fontWeight: C,
    fontSize: S(y),
    // Unitless following https://meyerweb.com/eric/thoughts/2006/02/08/unitless-line-heights/
    lineHeight: T,
    // The letter spacing was designed for the Roboto font-family. Using the same letter-spacing
    // across font-families can cause issues with the kerning.
    ...r === zo ? {
      letterSpacing: `${jd(R / y)}em`
    } : {},
    ...x,
    ...d
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
    button: b(s, 14, 1.75, 0.4, Wo),
    caption: b(i, 12, 1.66, 0.4),
    overline: b(i, 12, 2.66, 1, Wo),
    // TODO v6: Remove handling of 'inherit' variant from the theme as it is already handled in Material UI's Typography component. Also, remember to remove the associated types.
    inherit: {
      fontFamily: "inherit",
      fontWeight: "inherit",
      fontSize: "inherit",
      lineHeight: "inherit",
      letterSpacing: "inherit"
    }
  };
  return Ne({
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
const Hd = 0.2, Vd = 0.14, Wd = 0.12;
function ue(...e) {
  return [`${e[0]}px ${e[1]}px ${e[2]}px ${e[3]}px rgba(0,0,0,${Hd})`, `${e[4]}px ${e[5]}px ${e[6]}px ${e[7]}px rgba(0,0,0,${Vd})`, `${e[8]}px ${e[9]}px ${e[10]}px ${e[11]}px rgba(0,0,0,${Wd})`].join(",");
}
const zd = ["none", ue(0, 2, 1, -1, 0, 1, 1, 0, 0, 1, 3, 0), ue(0, 3, 1, -2, 0, 2, 2, 0, 0, 1, 5, 0), ue(0, 3, 3, -2, 0, 3, 4, 0, 0, 1, 8, 0), ue(0, 2, 4, -1, 0, 4, 5, 0, 0, 1, 10, 0), ue(0, 3, 5, -1, 0, 5, 8, 0, 0, 1, 14, 0), ue(0, 3, 5, -1, 0, 6, 10, 0, 0, 1, 18, 0), ue(0, 4, 5, -2, 0, 7, 10, 1, 0, 2, 16, 1), ue(0, 5, 5, -3, 0, 8, 10, 1, 0, 3, 14, 2), ue(0, 5, 6, -3, 0, 9, 12, 1, 0, 3, 16, 2), ue(0, 6, 6, -3, 0, 10, 14, 1, 0, 4, 18, 3), ue(0, 6, 7, -4, 0, 11, 15, 1, 0, 4, 20, 3), ue(0, 7, 8, -4, 0, 12, 17, 2, 0, 5, 22, 4), ue(0, 7, 8, -4, 0, 13, 19, 2, 0, 5, 24, 4), ue(0, 7, 9, -4, 0, 14, 21, 2, 0, 5, 26, 4), ue(0, 8, 9, -5, 0, 15, 22, 2, 0, 6, 28, 5), ue(0, 8, 10, -5, 0, 16, 24, 2, 0, 6, 30, 5), ue(0, 8, 11, -5, 0, 17, 26, 2, 0, 6, 32, 5), ue(0, 9, 11, -5, 0, 18, 28, 2, 0, 7, 34, 6), ue(0, 9, 12, -6, 0, 19, 29, 2, 0, 7, 36, 6), ue(0, 10, 13, -6, 0, 20, 31, 3, 0, 8, 38, 7), ue(0, 10, 13, -6, 0, 21, 33, 3, 0, 8, 40, 7), ue(0, 10, 14, -6, 0, 22, 35, 3, 0, 8, 42, 7), ue(0, 11, 14, -7, 0, 23, 36, 3, 0, 9, 44, 8), ue(0, 11, 15, -7, 0, 24, 38, 3, 0, 9, 46, 8)], qd = {
  // This is the most common easing curve.
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  // Objects enter the screen at full velocity from off-screen and
  // slowly decelerate to a resting point.
  easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
  // Objects leave the screen at full velocity. They do not decelerate when off-screen.
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  // The sharp curve is used by objects that may return to the screen at any time.
  sharp: "cubic-bezier(0.4, 0, 0.6, 1)"
}, Kd = {
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
function qo(e) {
  return `${Math.round(e)}ms`;
}
function Gd(e) {
  if (!e)
    return 0;
  const t = e / 36;
  return Math.min(Math.round((4 + 15 * t ** 0.25 + t / 5) * 10), 3e3);
}
function Yd(e) {
  const t = {
    ...qd,
    ...e.easing
  }, r = {
    ...Kd,
    ...e.duration
  };
  return {
    getAutoHeightDuration: Gd,
    create: (o = ["all"], i = {}) => {
      const {
        duration: s = r.standard,
        easing: a = t.easeInOut,
        delay: c = 0,
        ...d
      } = i;
      if (process.env.NODE_ENV !== "production") {
        const u = (m) => typeof m == "string", f = (m) => !Number.isNaN(parseFloat(m));
        !u(o) && !Array.isArray(o) && console.error('MUI: Argument "props" must be a string or Array.'), !f(s) && !u(s) && console.error(`MUI: Argument "duration" must be a number or a string but found ${s}.`), u(a) || console.error('MUI: Argument "easing" must be a string.'), !f(c) && !u(c) && console.error('MUI: Argument "delay" must be a number or a string.'), typeof i != "object" && console.error(["MUI: Secong argument of transition.create must be an object.", "Arguments should be either `create('prop1', options)` or `create(['prop1', 'prop2'], options)`"].join(`
`)), Object.keys(d).length !== 0 && console.error(`MUI: Unrecognized argument(s) [${Object.keys(d).join(",")}].`);
      }
      return (Array.isArray(o) ? o : [o]).map((u) => `${u} ${typeof s == "string" ? s : qo(s)} ${a} ${typeof c == "string" ? c : qo(c)}`).join(",");
    },
    ...e,
    easing: t,
    duration: r
  };
}
const Jd = {
  mobileStepper: 1e3,
  fab: 1050,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500
};
function Xd(e) {
  return Qe(e) || typeof e > "u" || typeof e == "string" || typeof e == "boolean" || typeof e == "number" || Array.isArray(e);
}
function ms(e = {}) {
  const t = {
    ...e
  };
  function r(n) {
    const o = Object.entries(n);
    for (let i = 0; i < o.length; i++) {
      const [s, a] = o[i];
      !Xd(a) || s.startsWith("unstable_") ? delete n[s] : Qe(a) && (n[s] = {
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
function Ko(e) {
  return typeof e == "number" ? `${(e * 100).toFixed(0)}%` : `calc((${e}) * 100%)`;
}
const Zd = (e) => {
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
function Qd(e) {
  Object.assign(e, {
    alpha(t, r) {
      const n = this || e;
      return n.colorSpace ? `oklch(from ${t} l c h / ${typeof r == "string" ? `calc(${r})` : r})` : n.vars ? `rgba(${t.replace(/var\(--([^,\s)]+)(?:,[^)]+)?\)+/g, "var(--$1Channel)")} / ${typeof r == "string" ? `calc(${r})` : r})` : ss(t, Zd(r));
    },
    lighten(t, r) {
      const n = this || e;
      return n.colorSpace ? `color-mix(in ${n.colorSpace}, ${t}, #fff ${Ko(r)})` : Dr(t, r);
    },
    darken(t, r) {
      const n = this || e;
      return n.colorSpace ? `color-mix(in ${n.colorSpace}, ${t}, #000 ${Ko(r)})` : Lr(t, r);
    }
  });
}
function dn(e = {}, ...t) {
  const {
    breakpoints: r,
    mixins: n = {},
    spacing: o,
    palette: i = {},
    transitions: s = {},
    typography: a = {},
    shape: c,
    colorSpace: d,
    ...u
  } = e;
  if (e.vars && // The error should throw only for the root theme creation because user is not allowed to use a custom node `vars`.
  // `generateThemeVars` is the closest identifier for checking that the `options` is a result of `createTheme` with CSS variables so that user can create new theme for nested ThemeProvider.
  e.generateThemeVars === void 0)
    throw new Error(process.env.NODE_ENV !== "production" ? "MUI: `vars` is a private field used for CSS variables support.\nPlease use another name or follow the [docs](https://mui.com/material-ui/customization/css-theme-variables/usage/) to enable the feature." : nt(20));
  const f = Dn({
    ...i,
    colorSpace: d
  }), m = ts(e);
  let S = Ne(m, {
    mixins: Ud(m.breakpoints, n),
    palette: f,
    // Don't use [...shadows] until you've verified its transpiled code is not invoking the iterator protocol.
    shadows: zd.slice(),
    typography: hs(f, a),
    transitions: Yd(s),
    zIndex: {
      ...Jd
    }
  });
  if (S = Ne(S, u), S = t.reduce((b, h) => Ne(b, h), S), process.env.NODE_ENV !== "production") {
    const b = ["active", "checked", "completed", "disabled", "error", "expanded", "focused", "focusVisible", "required", "selected"], h = (C, y) => {
      let T;
      for (T in C) {
        const R = C[T];
        if (b.includes(T) && Object.keys(R).length > 0) {
          if (process.env.NODE_ENV !== "production") {
            const x = nd("", T);
            console.error([`MUI: The \`${y}\` component increases the CSS specificity of the \`${T}\` internal state.`, "You can not override it like this: ", JSON.stringify(C, null, 2), "", `Instead, you need to use the '&.${x}' syntax:`, JSON.stringify({
              root: {
                [`&.${x}`]: R
              }
            }, null, 2), "", "https://mui.com/r/state-classes-guide"].join(`
`));
          }
          C[T] = {};
        }
      }
    };
    Object.keys(S.components).forEach((C) => {
      const y = S.components[C].styleOverrides;
      y && C.startsWith("Mui") && h(y, C);
    });
  }
  return S.unstable_sxConfig = {
    ...Ir,
    ...u?.unstable_sxConfig
  }, S.unstable_sx = function(h) {
    return Zt({
      sx: h,
      theme: this
    });
  }, S.toRuntimeSource = ms, Qd(S), S;
}
function ef(e) {
  let t;
  return e < 1 ? t = 5.11916 * e ** 2 : t = 4.5 * Math.log(e + 1) + 2, Math.round(t * 10) / 1e3;
}
const tf = [...Array(25)].map((e, t) => {
  if (t === 0)
    return "none";
  const r = ef(t);
  return `linear-gradient(rgba(255 255 255 / ${r}), rgba(255 255 255 / ${r}))`;
});
function gs(e) {
  return {
    inputPlaceholder: e === "dark" ? 0.5 : 0.42,
    inputUnderline: e === "dark" ? 0.7 : 0.42,
    switchTrackDisabled: e === "dark" ? 0.2 : 0.12,
    switchTrack: e === "dark" ? 0.3 : 0.38
  };
}
function ys(e) {
  return e === "dark" ? tf : [];
}
function rf(e) {
  const {
    palette: t = {
      mode: "light"
    },
    // need to cast to avoid module augmentation test
    opacity: r,
    overlays: n,
    colorSpace: o,
    ...i
  } = e, s = Dn({
    ...t,
    colorSpace: o
  });
  return {
    palette: s,
    opacity: {
      ...gs(s.mode),
      ...r
    },
    overlays: n || ys(s.mode),
    ...i
  };
}
function nf(e) {
  return !!e[0].match(/(cssVarPrefix|colorSchemeSelector|modularCssLayers|rootSelector|typography|mixins|breakpoints|direction|transitions)/) || !!e[0].match(/sxConfig$/) || // ends with sxConfig
  e[0] === "palette" && !!e[1]?.match(/(mode|contrastThreshold|tonalOffset)/);
}
const of = (e) => [...[...Array(25)].map((t, r) => `--${e ? `${e}-` : ""}overlays-${r}`), `--${e ? `${e}-` : ""}palette-AppBar-darkBg`, `--${e ? `${e}-` : ""}palette-AppBar-darkColor`], sf = (e) => (t, r) => {
  const n = e.rootSelector || ":root", o = e.colorSchemeSelector;
  let i = o;
  if (o === "class" && (i = ".%s"), o === "data" && (i = "[data-%s]"), o?.startsWith("data-") && !o.includes("%s") && (i = `[${o}="%s"]`), e.defaultColorScheme === t) {
    if (t === "dark") {
      const s = {};
      return of(e.cssVarPrefix).forEach((a) => {
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
function af(e, t) {
  t.forEach((r) => {
    e[r] || (e[r] = {});
  });
}
function E(e, t, r) {
  !e[t] && r && (e[t] = r);
}
function Dt(e) {
  return typeof e != "string" || !e.startsWith("hsl") ? e : is(e);
}
function Ke(e, t) {
  `${t}Channel` in e || (e[`${t}Channel`] = Lt(Dt(e[t]), `MUI: Can't create \`palette.${t}Channel\` because \`palette.${t}\` is not one of these formats: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().
To suppress this warning, you need to explicitly provide the \`palette.${t}Channel\` as a string (in rgb format, for example "12 12 12") or undefined if you want to remove the channel token.`));
}
function cf(e) {
  return typeof e == "number" ? `${e}px` : typeof e == "string" || typeof e == "function" || Array.isArray(e) ? e : "8px";
}
const Ve = (e) => {
  try {
    return e();
  } catch {
  }
}, lf = (e = "mui") => Rd(e);
function on(e, t, r, n, o) {
  if (!r)
    return;
  r = r === !0 ? {} : r;
  const i = o === "dark" ? "dark" : "light";
  if (!n) {
    t[o] = rf({
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
  } = dn({
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
      ...gs(i),
      ...r?.opacity
    },
    overlays: r?.overlays || ys(i)
  }, a;
}
function uf(e = {}, ...t) {
  const {
    colorSchemes: r = {
      light: !0
    },
    defaultColorScheme: n,
    disableCssColorScheme: o = !1,
    cssVarPrefix: i = "mui",
    nativeColor: s = !1,
    shouldSkipGeneratingVar: a = nf,
    colorSchemeSelector: c = r.light && r.dark ? "media" : void 0,
    rootSelector: d = ":root",
    ...u
  } = e, f = Object.keys(r)[0], m = n || (r.light && f !== "light" ? "light" : f), S = lf(i), {
    [m]: b,
    light: h,
    dark: C,
    ...y
  } = r, T = {
    ...y
  };
  let R = b;
  if ((m === "dark" && !("dark" in r) || m === "light" && !("light" in r)) && (R = !0), !R)
    throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The \`colorSchemes.${m}\` option is either missing or invalid.` : nt(21, m));
  let x;
  s && (x = "oklch");
  const w = on(x, T, R, u, m);
  h && !T.light && on(x, T, h, void 0, "light"), C && !T.dark && on(x, T, C, void 0, "dark");
  let I = {
    defaultColorScheme: m,
    ...w,
    cssVarPrefix: i,
    colorSchemeSelector: c,
    rootSelector: d,
    getCssVar: S,
    colorSchemes: T,
    font: {
      ...Bd(w.typography),
      ...w.font
    },
    spacing: cf(u.spacing)
  };
  Object.keys(I.colorSchemes).forEach((z) => {
    const l = I.colorSchemes[z].palette, F = (Z) => {
      const K = Z.split("-"), M = K[1], fe = K[2];
      return S(Z, l[M][fe]);
    };
    l.mode === "light" && (E(l.common, "background", "#fff"), E(l.common, "onBackground", "#000")), l.mode === "dark" && (E(l.common, "background", "#000"), E(l.common, "onBackground", "#fff"));
    function _(Z, K, M) {
      if (x) {
        let fe;
        return Z === st && (fe = `transparent ${((1 - M) * 100).toFixed(0)}%`), Z === ie && (fe = `#000 ${(M * 100).toFixed(0)}%`), Z === se && (fe = `#fff ${(M * 100).toFixed(0)}%`), `color-mix(in ${x}, ${K}, ${fe})`;
      }
      return Z(K, M);
    }
    if (af(l, ["Alert", "AppBar", "Avatar", "Button", "Chip", "FilledInput", "LinearProgress", "Skeleton", "Slider", "SnackbarContent", "SpeedDialAction", "StepConnector", "StepContent", "Switch", "TableCell", "Tooltip"]), l.mode === "light") {
      E(l.Alert, "errorColor", _(ie, l.error.light, 0.6)), E(l.Alert, "infoColor", _(ie, l.info.light, 0.6)), E(l.Alert, "successColor", _(ie, l.success.light, 0.6)), E(l.Alert, "warningColor", _(ie, l.warning.light, 0.6)), E(l.Alert, "errorFilledBg", F("palette-error-main")), E(l.Alert, "infoFilledBg", F("palette-info-main")), E(l.Alert, "successFilledBg", F("palette-success-main")), E(l.Alert, "warningFilledBg", F("palette-warning-main")), E(l.Alert, "errorFilledColor", Ve(() => l.getContrastText(l.error.main))), E(l.Alert, "infoFilledColor", Ve(() => l.getContrastText(l.info.main))), E(l.Alert, "successFilledColor", Ve(() => l.getContrastText(l.success.main))), E(l.Alert, "warningFilledColor", Ve(() => l.getContrastText(l.warning.main))), E(l.Alert, "errorStandardBg", _(se, l.error.light, 0.9)), E(l.Alert, "infoStandardBg", _(se, l.info.light, 0.9)), E(l.Alert, "successStandardBg", _(se, l.success.light, 0.9)), E(l.Alert, "warningStandardBg", _(se, l.warning.light, 0.9)), E(l.Alert, "errorIconColor", F("palette-error-main")), E(l.Alert, "infoIconColor", F("palette-info-main")), E(l.Alert, "successIconColor", F("palette-success-main")), E(l.Alert, "warningIconColor", F("palette-warning-main")), E(l.AppBar, "defaultBg", F("palette-grey-100")), E(l.Avatar, "defaultBg", F("palette-grey-400")), E(l.Button, "inheritContainedBg", F("palette-grey-300")), E(l.Button, "inheritContainedHoverBg", F("palette-grey-A100")), E(l.Chip, "defaultBorder", F("palette-grey-400")), E(l.Chip, "defaultAvatarColor", F("palette-grey-700")), E(l.Chip, "defaultIconColor", F("palette-grey-700")), E(l.FilledInput, "bg", "rgba(0, 0, 0, 0.06)"), E(l.FilledInput, "hoverBg", "rgba(0, 0, 0, 0.09)"), E(l.FilledInput, "disabledBg", "rgba(0, 0, 0, 0.12)"), E(l.LinearProgress, "primaryBg", _(se, l.primary.main, 0.62)), E(l.LinearProgress, "secondaryBg", _(se, l.secondary.main, 0.62)), E(l.LinearProgress, "errorBg", _(se, l.error.main, 0.62)), E(l.LinearProgress, "infoBg", _(se, l.info.main, 0.62)), E(l.LinearProgress, "successBg", _(se, l.success.main, 0.62)), E(l.LinearProgress, "warningBg", _(se, l.warning.main, 0.62)), E(l.Skeleton, "bg", x ? _(st, l.text.primary, 0.11) : `rgba(${F("palette-text-primaryChannel")} / 0.11)`), E(l.Slider, "primaryTrack", _(se, l.primary.main, 0.62)), E(l.Slider, "secondaryTrack", _(se, l.secondary.main, 0.62)), E(l.Slider, "errorTrack", _(se, l.error.main, 0.62)), E(l.Slider, "infoTrack", _(se, l.info.main, 0.62)), E(l.Slider, "successTrack", _(se, l.success.main, 0.62)), E(l.Slider, "warningTrack", _(se, l.warning.main, 0.62));
      const Z = x ? _(ie, l.background.default, 0.6825) : or(l.background.default, 0.8);
      E(l.SnackbarContent, "bg", Z), E(l.SnackbarContent, "color", Ve(() => x ? un.text.primary : l.getContrastText(Z))), E(l.SpeedDialAction, "fabHoverBg", or(l.background.paper, 0.15)), E(l.StepConnector, "border", F("palette-grey-400")), E(l.StepContent, "border", F("palette-grey-400")), E(l.Switch, "defaultColor", F("palette-common-white")), E(l.Switch, "defaultDisabledColor", F("palette-grey-100")), E(l.Switch, "primaryDisabledColor", _(se, l.primary.main, 0.62)), E(l.Switch, "secondaryDisabledColor", _(se, l.secondary.main, 0.62)), E(l.Switch, "errorDisabledColor", _(se, l.error.main, 0.62)), E(l.Switch, "infoDisabledColor", _(se, l.info.main, 0.62)), E(l.Switch, "successDisabledColor", _(se, l.success.main, 0.62)), E(l.Switch, "warningDisabledColor", _(se, l.warning.main, 0.62)), E(l.TableCell, "border", _(se, _(st, l.divider, 1), 0.88)), E(l.Tooltip, "bg", _(st, l.grey[700], 0.92));
    }
    if (l.mode === "dark") {
      E(l.Alert, "errorColor", _(se, l.error.light, 0.6)), E(l.Alert, "infoColor", _(se, l.info.light, 0.6)), E(l.Alert, "successColor", _(se, l.success.light, 0.6)), E(l.Alert, "warningColor", _(se, l.warning.light, 0.6)), E(l.Alert, "errorFilledBg", F("palette-error-dark")), E(l.Alert, "infoFilledBg", F("palette-info-dark")), E(l.Alert, "successFilledBg", F("palette-success-dark")), E(l.Alert, "warningFilledBg", F("palette-warning-dark")), E(l.Alert, "errorFilledColor", Ve(() => l.getContrastText(l.error.dark))), E(l.Alert, "infoFilledColor", Ve(() => l.getContrastText(l.info.dark))), E(l.Alert, "successFilledColor", Ve(() => l.getContrastText(l.success.dark))), E(l.Alert, "warningFilledColor", Ve(() => l.getContrastText(l.warning.dark))), E(l.Alert, "errorStandardBg", _(ie, l.error.light, 0.9)), E(l.Alert, "infoStandardBg", _(ie, l.info.light, 0.9)), E(l.Alert, "successStandardBg", _(ie, l.success.light, 0.9)), E(l.Alert, "warningStandardBg", _(ie, l.warning.light, 0.9)), E(l.Alert, "errorIconColor", F("palette-error-main")), E(l.Alert, "infoIconColor", F("palette-info-main")), E(l.Alert, "successIconColor", F("palette-success-main")), E(l.Alert, "warningIconColor", F("palette-warning-main")), E(l.AppBar, "defaultBg", F("palette-grey-900")), E(l.AppBar, "darkBg", F("palette-background-paper")), E(l.AppBar, "darkColor", F("palette-text-primary")), E(l.Avatar, "defaultBg", F("palette-grey-600")), E(l.Button, "inheritContainedBg", F("palette-grey-800")), E(l.Button, "inheritContainedHoverBg", F("palette-grey-700")), E(l.Chip, "defaultBorder", F("palette-grey-700")), E(l.Chip, "defaultAvatarColor", F("palette-grey-300")), E(l.Chip, "defaultIconColor", F("palette-grey-300")), E(l.FilledInput, "bg", "rgba(255, 255, 255, 0.09)"), E(l.FilledInput, "hoverBg", "rgba(255, 255, 255, 0.13)"), E(l.FilledInput, "disabledBg", "rgba(255, 255, 255, 0.12)"), E(l.LinearProgress, "primaryBg", _(ie, l.primary.main, 0.5)), E(l.LinearProgress, "secondaryBg", _(ie, l.secondary.main, 0.5)), E(l.LinearProgress, "errorBg", _(ie, l.error.main, 0.5)), E(l.LinearProgress, "infoBg", _(ie, l.info.main, 0.5)), E(l.LinearProgress, "successBg", _(ie, l.success.main, 0.5)), E(l.LinearProgress, "warningBg", _(ie, l.warning.main, 0.5)), E(l.Skeleton, "bg", x ? _(st, l.text.primary, 0.13) : `rgba(${F("palette-text-primaryChannel")} / 0.13)`), E(l.Slider, "primaryTrack", _(ie, l.primary.main, 0.5)), E(l.Slider, "secondaryTrack", _(ie, l.secondary.main, 0.5)), E(l.Slider, "errorTrack", _(ie, l.error.main, 0.5)), E(l.Slider, "infoTrack", _(ie, l.info.main, 0.5)), E(l.Slider, "successTrack", _(ie, l.success.main, 0.5)), E(l.Slider, "warningTrack", _(ie, l.warning.main, 0.5));
      const Z = x ? _(se, l.background.default, 0.985) : or(l.background.default, 0.98);
      E(l.SnackbarContent, "bg", Z), E(l.SnackbarContent, "color", Ve(() => x ? fs.text.primary : l.getContrastText(Z))), E(l.SpeedDialAction, "fabHoverBg", or(l.background.paper, 0.15)), E(l.StepConnector, "border", F("palette-grey-600")), E(l.StepContent, "border", F("palette-grey-600")), E(l.Switch, "defaultColor", F("palette-grey-300")), E(l.Switch, "defaultDisabledColor", F("palette-grey-600")), E(l.Switch, "primaryDisabledColor", _(ie, l.primary.main, 0.55)), E(l.Switch, "secondaryDisabledColor", _(ie, l.secondary.main, 0.55)), E(l.Switch, "errorDisabledColor", _(ie, l.error.main, 0.55)), E(l.Switch, "infoDisabledColor", _(ie, l.info.main, 0.55)), E(l.Switch, "successDisabledColor", _(ie, l.success.main, 0.55)), E(l.Switch, "warningDisabledColor", _(ie, l.warning.main, 0.55)), E(l.TableCell, "border", _(ie, _(st, l.divider, 1), 0.68)), E(l.Tooltip, "bg", _(st, l.grey[700], 0.92));
    }
    Ke(l.background, "default"), Ke(l.background, "paper"), Ke(l.common, "background"), Ke(l.common, "onBackground"), Ke(l, "divider"), Object.keys(l).forEach((Z) => {
      const K = l[Z];
      Z !== "tonalOffset" && K && typeof K == "object" && (K.main && E(l[Z], "mainChannel", Lt(Dt(K.main))), K.light && E(l[Z], "lightChannel", Lt(Dt(K.light))), K.dark && E(l[Z], "darkChannel", Lt(Dt(K.dark))), K.contrastText && E(l[Z], "contrastTextChannel", Lt(Dt(K.contrastText))), Z === "text" && (Ke(l[Z], "primary"), Ke(l[Z], "secondary")), Z === "action" && (K.active && Ke(l[Z], "active"), K.selected && Ke(l[Z], "selected")));
    });
  }), I = t.reduce((z, l) => Ne(z, l), I);
  const X = {
    prefix: i,
    disableCssColorScheme: o,
    shouldSkipGeneratingVar: a,
    getSelector: sf(I),
    enableContrastVars: s
  }, {
    vars: V,
    generateThemeVars: D,
    generateStyleSheets: U
  } = _d(I, X);
  return I.vars = V, Object.entries(I.colorSchemes[I.defaultColorScheme]).forEach(([z, l]) => {
    I[z] = l;
  }), I.generateThemeVars = D, I.generateStyleSheets = U, I.generateSpacing = function() {
    return es(u.spacing, An(this));
  }, I.getColorSchemeSelector = kd(c), I.spacing = I.generateSpacing(), I.shouldSkipGeneratingVar = a, I.unstable_sxConfig = {
    ...Ir,
    ...u?.unstable_sxConfig
  }, I.unstable_sx = function(l) {
    return Zt({
      sx: l,
      theme: this
    });
  }, I.toRuntimeSource = ms, I;
}
function Go(e, t, r) {
  e.colorSchemes && r && (e.colorSchemes[t] = {
    ...r !== !0 && r,
    palette: Dn({
      ...r === !0 ? {} : r.palette,
      mode: t
    })
    // cast type to skip module augmentation test
  });
}
function Mn(e = {}, ...t) {
  const {
    palette: r,
    cssVariables: n = !1,
    colorSchemes: o = r ? void 0 : {
      light: !0
    },
    defaultColorScheme: i = r?.mode,
    ...s
  } = e, a = i || "light", c = o?.[a], d = {
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
      return dn(e, ...t);
    let u = r;
    "palette" in e || d[a] && (d[a] !== !0 ? u = d[a].palette : a === "dark" && (u = {
      mode: "dark"
    }));
    const f = dn({
      ...e,
      palette: u
    }, ...t);
    return f.defaultColorScheme = a, f.colorSchemes = d, f.palette.mode === "light" && (f.colorSchemes.light = {
      ...d.light !== !0 && d.light,
      palette: f.palette
    }, Go(f, "dark", d.dark)), f.palette.mode === "dark" && (f.colorSchemes.dark = {
      ...d.dark !== !0 && d.dark,
      palette: f.palette
    }, Go(f, "light", d.light)), f;
  }
  return !r && !("light" in d) && a === "light" && (d.light = !0), uf({
    ...s,
    colorSchemes: d,
    defaultColorScheme: a,
    ...typeof n != "boolean" && n
  }, ...t);
}
const df = Mn();
function ff() {
  const e = rs(df);
  return process.env.NODE_ENV !== "production" && ee.useDebugValue(e), e[lt] || e;
}
function pf({
  theme: e,
  ...t
}) {
  const r = lt in e ? e[lt] : void 0;
  return /* @__PURE__ */ g(Ht, {
    ...t,
    themeId: r ? lt : void 0,
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
  CssVarsProvider: hf
} = Od({
  themeId: lt,
  // @ts-ignore ignore module augmentation tests
  theme: () => Mn({
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
      typography: hs(e.palette, e.typography)
    };
    return t.unstable_sx = function(n) {
      return Zt({
        sx: n,
        theme: this
      });
    }, t;
  }
}), mf = hf;
function gf({
  theme: e,
  ...t
}) {
  const r = ee.useMemo(() => {
    if (typeof e == "function")
      return e;
    const n = lt in e ? e[lt] : e;
    return "colorSchemes" in n ? null : "vars" in n ? e : {
      ...e,
      vars: null
    };
  }, [e]);
  return r ? /* @__PURE__ */ g(pf, {
    theme: r,
    ...t
  }) : /* @__PURE__ */ g(mf, {
    theme: e,
    ...t
  });
}
const yf = Mn({ spacing: 8 }).spacing, bf = 1760, Sf = 1120, Yo = ({
  weight: e,
  minHeight: t,
  minHeightShort: r
}) => /* @__PURE__ */ g(
  v,
  {
    "aria-hidden": !0,
    sx: {
      flex: `${e} 1 0px`,
      minHeight: t,
      [je]: { minHeight: r }
    }
  }
), fn = ({
  theme: e,
  children: t,
  footer: r,
  hero: n,
  mobileHero: o
}) => {
  const i = Mt.Children.toArray(t), s = ff(), a = As(
    () => ({ ...s, spacing: yf }),
    [s]
  ), [c, d] = Re(e.mode), [u, f] = Re(!1);
  return e.mode !== c && (d(e.mode), f(!0)), Ue(() => {
    if (!u) return;
    let m = requestAnimationFrame(() => {
      m = requestAnimationFrame(() => f(!1));
    });
    return () => cancelAnimationFrame(m);
  }, [u, c]), // Own spacing unit, so the layout looks the same in every host app.
  // Full-width page background; the layout inside is capped and centred on wide screens
  /* @__PURE__ */ g(gf, { theme: a, children: /* @__PURE__ */ g(
    v,
    {
      "data-mode-switching": u || void 0,
      sx: {
        minHeight: "100vh",
        backgroundColor: e.pageBg,
        transition: ge,
        // Desktop: centres the capped layout vertically on very tall screens
        display: { md: "flex" },
        alignItems: "center",
        // Light / dark switch: colours change at once on every element, MUI's own
        // transitions included (see MODE_SWITCH_TRANSITION)
        "&[data-mode-switching], &[data-mode-switching] *, &[data-mode-switching] *::before, &[data-mode-switching] *::after": { transition: `${sa} !important` },
        ...la
      },
      children: /* @__PURE__ */ L(
        v,
        {
          sx: {
            // Beyond this the hero would blow its artwork and headline up past their
            // designed size; at 1760px the dashboards show at about 1x
            maxWidth: bf,
            width: "100%",
            mx: "auto",
            minHeight: { xs: "100vh", md: 0 },
            // Desktop: one screen tall, so the page itself never scrolls (no jump on reload,
            // no flash while fonts load), capped so very tall screens do not stretch the hero
            // into an empty band; the sign-in panel scrolls inside if it must
            height: { md: `min(100vh, ${Sf}px)` },
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
            transition: ge,
            "& *, & *::before, & *::after": { boxSizing: "border-box" }
          },
          children: [
            /* @__PURE__ */ g(
              v,
              {
                component: "main",
                sx: {
                  display: "flex",
                  justifyContent: "center",
                  px: { xs: 3, sm: 6 },
                  // Extra room above the logo
                  pt: { xs: 5, sm: 7 },
                  pb: { xs: 4, sm: 5 },
                  [je]: { pt: 4.5, pb: 2.25 },
                  // Scrolls on its own beside the hero; on phones the page scrolls as usual
                  overflowY: { md: "auto" },
                  overflowX: "clip",
                  // When an error or validation line overflows a laptop-height panel: a thin,
                  // quiet scrollbar. Its space is not reserved, which would narrow the panel
                  // all the time on Windows just to avoid a reflow while an error shows.
                  scrollbarWidth: "thin",
                  scrollbarColor: `${e.border} transparent`
                },
                children: /* @__PURE__ */ L(
                  v,
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
                      i.map((m, S) => /* @__PURE__ */ L(
                        Mt.Fragment,
                        {
                          children: [
                            S > 0 && /* @__PURE__ */ g(
                              Yo,
                              {
                                weight: 1,
                                minHeight: 18,
                                minHeightShort: 8
                              }
                            ),
                            /* @__PURE__ */ L(
                              v,
                              {
                                sx: {
                                  display: "flex",
                                  flexDirection: "column",
                                  animation: Ge(S * 50)
                                },
                                children: [
                                  m,
                                  S === 0 && o && /* @__PURE__ */ g(
                                    v,
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
                        Mt.isValidElement(m) ? m.key : S
                      )),
                      /* @__PURE__ */ g(Yo, { weight: 3, minHeight: 40, minHeightShort: 24 }),
                      /* @__PURE__ */ g(
                        v,
                        {
                          sx: {
                            animation: Ge(i.length * 50)
                          },
                          children: r
                        }
                      )
                    ]
                  }
                )
              }
            ),
            /* @__PURE__ */ g(
              v,
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
}, Pt = (e) => `var(--mark-primary, ${e})`, Jo = "var(--mark-secondary, #3D4C5E)", Ef = (e) => `var(--mark-center, ${e})`, wf = "var(--mark-ring, #ffffff)", bs = ({
  platform: e,
  sx: t,
  ...r
}) => {
  const n = {
    ...r,
    sx: [
      { "& *": { transition: hi } },
      ...Array.isArray(t) ? t : [t]
    ]
  };
  if (e === "centra") {
    const s = { fill: Pt("#049586") };
    return /* @__PURE__ */ L(Et, { ...n, viewBox: "0 0 30 30", children: [
      /* @__PURE__ */ g(
        "path",
        {
          style: s,
          d: "M5.60529 3.14542C4.00282 4.40644 2.68044 5.98728 1.72234 7.78732C0.764232 9.58735 0.191389 11.5671 0.0402716 13.6007C-0.110846 15.6342 0.163072 17.6769 0.844589 19.5988C1.52611 21.5207 2.60029 23.2796 3.99877 24.7637L7.18245 21.7635C6.20044 20.7214 5.44614 19.4863 4.96758 18.1368C4.48902 16.7872 4.29667 15.3528 4.40279 13.9249C4.5089 12.4969 4.91115 11.1067 5.58393 9.84273C6.25672 8.57874 7.18529 7.46868 8.31054 6.58319L5.60529 3.14542Z"
        }
      ),
      /* @__PURE__ */ g(
        "path",
        {
          style: { fill: Jo },
          d: "M27.6715 7.81562C25.8485 4.37255 22.7324 1.79469 19.0087 0.649137C15.2851 -0.496418 11.2588 -0.115827 7.81575 1.70718L9.86273 5.57326C12.2805 4.29314 15.1077 4.02589 17.7225 4.8303C20.3372 5.63471 22.5253 7.44488 23.8055 9.86261L27.6715 7.81562Z"
        }
      ),
      /* @__PURE__ */ g(
        "path",
        {
          style: { fill: Jo },
          d: "M5.52492 3.20912C3.27824 5.00262 1.60718 7.41593 0.718835 10.15L4.87928 11.5018C5.50308 9.58194 6.67649 7.88731 8.25411 6.62792L5.52492 3.20912Z"
        }
      ),
      /* @__PURE__ */ g(
        "path",
        {
          style: s,
          d: "M5.89004 26.4517C7.43504 27.6075 9.19261 28.4476 11.0624 28.924C12.9321 29.4004 14.8774 29.5038 16.7871 29.2283C18.6968 28.9528 20.5336 28.3037 22.1924 27.3182C23.8512 26.3327 25.2996 25.03 26.4549 23.4846L22.9511 20.8653C22.1399 21.9505 21.1228 22.8653 19.958 23.5573C18.7932 24.2493 17.5034 24.7051 16.1624 24.8986C14.8214 25.0921 13.4554 25.0195 12.1425 24.6849C10.8296 24.3504 9.5954 23.7605 8.5105 22.9488L5.89004 26.4517Z"
        }
      ),
      /* @__PURE__ */ g(
        "rect",
        {
          style: s,
          x: "18.9181",
          y: "13.7375",
          width: "10.4612",
          height: "2.44368"
        }
      ),
      /* @__PURE__ */ g(
        "path",
        {
          style: s,
          d: "M14.6851 9.76587C17.5534 9.76607 19.8784 12.0918 19.8784 14.9602C19.8782 17.8285 17.5533 20.1534 14.6851 20.1536C11.8166 20.1536 9.49092 17.8286 9.49072 14.9602C9.49072 12.0917 11.8165 9.76587 14.6851 9.76587ZM14.689 11.3313C12.6824 11.3314 11.0554 12.9576 11.0552 14.9641C11.0552 16.9708 12.6823 18.5978 14.689 18.5979C16.6957 18.5979 18.3228 16.9708 18.3228 14.9641C18.3226 12.9575 16.6956 11.3313 14.689 11.3313Z"
        }
      )
    ] });
  }
  if (e === "xpdite") {
    const s = { fill: Pt("#0F62B0") };
    return /* @__PURE__ */ L(Et, { ...n, viewBox: "0 0 30 30", children: [
      /* @__PURE__ */ g(
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
      /* @__PURE__ */ g(
        "rect",
        {
          style: s,
          width: "25.3429",
          height: "2.05928",
          transform: "matrix(-0.73373 0.679441 0.679441 0.73373 22.6707 5.96777)"
        }
      ),
      /* @__PURE__ */ g("circle", { style: s, cx: "24.063", cy: "24.9252", r: "3.42298" }),
      /* @__PURE__ */ g("circle", { style: s, cx: "4.44975", cy: "24.9252", r: "3.42298" }),
      /* @__PURE__ */ g("circle", { style: s, cx: "4.44975", cy: "4.45204", r: "3.42298" }),
      /* @__PURE__ */ g(
        "circle",
        {
          style: { fill: Ef("#0F62B0"), stroke: wf },
          cx: "14.1725",
          cy: "14.5849",
          r: "3.18086",
          strokeWidth: "1.33541"
        }
      ),
      /* @__PURE__ */ g(
        "circle",
        {
          style: { fill: "none", stroke: Pt("#0F62B0") },
          cx: "3.42298",
          cy: "3.42298",
          r: "2.75528",
          strokeWidth: "1.33541",
          transform: "matrix(-0.982613 -0.185667 -0.185667 0.982613 29.7455 2.17871)"
        }
      )
    ] });
  }
  const o = { fill: Pt("#03463F") }, i = { fill: "none", stroke: Pt("#03463F") };
  return /* @__PURE__ */ L(Et, { ...n, viewBox: "0 0 30 30", children: [
    /* @__PURE__ */ g(
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
    /* @__PURE__ */ g(
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
    /* @__PURE__ */ g(
      "path",
      {
        style: i,
        strokeWidth: "1.33541",
        d: "M8.99036 16.9846V21.3899L5.1759 23.592L1.36145 21.3899V16.9846L5.1759 14.7825L8.99036 16.9846Z"
      }
    ),
    /* @__PURE__ */ g(
      "path",
      {
        style: i,
        strokeWidth: "1.33541",
        d: "M27.9268 17.259V21.6643L24.1123 23.8665L20.2979 21.6643V17.259L24.1123 15.0569L27.9268 17.259Z"
      }
    ),
    /* @__PURE__ */ g(
      "path",
      {
        style: o,
        d: "M14.7128 4.64917L19.195 7.237V12.4127L14.7128 15.0005L10.2305 12.4127V7.237L14.7128 4.64917Z"
      }
    )
  ] });
}, xf = ({
  theme: e,
  value: t,
  platformAssets: r,
  disabled: n = !1,
  allowClear: o = !1,
  onChange: i
}) => {
  const s = e.mode === "dark", a = pn(0), c = Pe.findIndex((u) => u.id === t);
  c >= 0 && (a.current = c);
  const d = Pe[a.current];
  return /* @__PURE__ */ L(v, { children: [
    /* @__PURE__ */ g(
      v,
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
    /* @__PURE__ */ L(
      v,
      {
        sx: {
          position: "relative",
          p: 1,
          borderRadius: "12px",
          backgroundColor: e.surface,
          boxShadow: s ? "none" : oa,
          border: `1px solid ${s ? e.border : "transparent"}`,
          transition: ge
        },
        children: [
          /* @__PURE__ */ g(
            v,
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
                backgroundColor: d.uiColor,
                // Dark brand colours (Polymer) need an edge to stand out on a dark page
                boxShadow: s ? `inset 0 0 0 1px ${d.colorOnDark}` : "none",
                transform: `translateX(calc(${a.current} * (100% + 4px))) scale(${c >= 0 ? 1 : 0.92})`,
                opacity: c >= 0 ? 1 : 0,
                transition: `transform ${yn}ms ${xt}, opacity 200ms ease, ${ge}`
              }
            }
          ),
          /* @__PURE__ */ g(
            Ls,
            {
              exclusive: !0,
              fullWidth: !0,
              value: t,
              disabled: n,
              "aria-labelledby": "lumora-platform-label",
              onChange: (u, f) => (f || o) && i(f),
              sx: { position: "relative", gap: 0.5 },
              children: Pe.map((u) => {
                const f = s ? u.colorOnDark : u.uiColor, m = r?.[u.id]?.logo;
                return /* @__PURE__ */ L(
                  Ds,
                  {
                    value: u.id,
                    disableRipple: !0,
                    sx: {
                      flex: 1,
                      gap: 0.75,
                      ...ut,
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
                      color: f,
                      // Logo colours: brand on the card (Centra's arcs white in dark mode), white on the selected tab
                      "--mark-primary": f,
                      "--mark-secondary": s ? "#ffffff" : "#3D4C5E",
                      "--mark-center": f,
                      "--mark-ring": e.surface,
                      // Hover tint stays quick; the text colour follows the highlight
                      transition: `background-color 150ms, ${zt("color")}`,
                      "& .MuiSvgIcon-root": { fontSize: 22 },
                      "&:hover": {
                        backgroundColor: `${f}14`
                      },
                      // The sliding highlight draws the selected background
                      "&.Mui-selected, &.Mui-selected:hover": {
                        backgroundColor: "transparent",
                        color: "#ffffff",
                        // Selected marks: all white, with XPdite's centre node
                        // a white ring around the tab colour
                        "--mark-primary": "#ffffff",
                        "--mark-secondary": "#ffffff",
                        "--mark-center": u.uiColor,
                        "--mark-ring": "#ffffff"
                      },
                      "&.Mui-focusVisible": {
                        outline: `2px solid ${f}`,
                        outlineOffset: 2
                      }
                    },
                    children: [
                      m ?? /* @__PURE__ */ g(bs, { platform: u.id }),
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
}, Nt = ({
  width: e,
  height: t = 6
}) => /* @__PURE__ */ g(
  v,
  {
    sx: {
      width: e,
      height: t,
      borderRadius: 1,
      backgroundColor: "rgba(18, 51, 45, 0.09)"
    }
  }
), Xo = ({
  title: e,
  barColor: t,
  screenshot: r,
  compact: n = !1,
  sx: o
}) => {
  const i = n ? 22 : 40, s = n ? 6 : 12;
  return r ? /* @__PURE__ */ g(
    v,
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
  ) : /* @__PURE__ */ L(
    v,
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
        /* @__PURE__ */ g(
          v,
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
            children: [0, 1, 2].map((a) => /* @__PURE__ */ g(
              v,
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
        /* @__PURE__ */ g(v, { sx: { flex: 1, minHeight: 0, position: "relative", backgroundColor: "#f7f9f9" }, children: /* @__PURE__ */ L(
          v,
          {
            "data-testid": "screenshot-placeholder",
            sx: { p: n ? 1.25 : 3.5, display: "flex", flexDirection: "column", gap: n ? 1 : 2 },
            children: [
              /* @__PURE__ */ L(v, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
                /* @__PURE__ */ g(
                  v,
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
                /* @__PURE__ */ g(
                  v,
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
              /* @__PURE__ */ g(Nt, { width: "22%", height: n ? 4 : 6 }),
              /* @__PURE__ */ g(
                v,
                {
                  sx: {
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: n ? 0.75 : 2,
                    mt: n ? 0.5 : 1
                  },
                  children: Array.from({ length: 6 }).map((a, c) => /* @__PURE__ */ L(
                    v,
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
                        /* @__PURE__ */ g(Nt, { width: "70%", height: n ? 4 : 7 }),
                        /* @__PURE__ */ g(Nt, { width: "45%", height: n ? 3 : 5 }),
                        /* @__PURE__ */ g(Nt, { width: "85%", height: n ? 3 : 5 }),
                        /* @__PURE__ */ g(Nt, { width: "60%", height: n ? 3 : 5 })
                      ]
                    },
                    c
                  ))
                }
              ),
              !n && /* @__PURE__ */ L(
                v,
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
}, Tf = 200, Zo = "clamp(1.25rem, 5.6vw, 1.6rem)", Qo = {
  m: 0,
  fontWeight: 600,
  fontSize: "clamp(2.25rem, 4vw, 4.25rem)",
  lineHeight: 1.08,
  letterSpacing: "-0.02em"
}, ei = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.16em",
  textTransform: "uppercase"
}, Ss = /* @__PURE__ */ new Set(), ti = /* @__PURE__ */ new Map(), Es = {
  light: {},
  dark: {}
}, ws = {
  light: {},
  dark: {}
}, ri = {
  light: {},
  dark: {}
}, xs = (e) => {
  let t = ti.get(e);
  if (!t) {
    const r = typeof Image > "u" ? void 0 : new Image();
    r && (r.src = e), t = (typeof r?.decode == "function" ? r.decode().catch(() => {
    }) : Promise.resolve()).then(() => {
      Ss.add(e);
    }), ti.set(e, t);
  }
  return t;
}, Cf = (e, t) => (ri[t][e] ??= wt(e).loadScreenshot(t).then((r) => (Es[t][e] = r, xs(r))).catch(() => {
  ws[t][e] = !0;
}), ri[t][e]), Ts = (e, t, r) => (t === "dark" ? e?.[`${r}Dark`] : void 0) ?? e?.[r], Cs = (e, t, r, n) => {
  const o = Ts(n?.[e], t, r);
  return o ? xs(o) : r === "screenshot" ? Cf(e, t) : Promise.resolve();
}, Of = (e, t, r, n) => {
  const o = Ts(n?.[e], t, r) ?? (r === "screenshot" ? Es[t][e] : void 0);
  return o ? Ss.has(o) ? o : null : r === "overviewScreenshot" || ws[t][e] ? void 0 : null;
}, Rf = (e) => {
  if (typeof window.requestIdleCallback == "function") {
    const r = window.requestIdleCallback(e, { timeout: 3e3 });
    return () => window.cancelIdleCallback(r);
  }
  const t = window.setTimeout(e, 200);
  return () => window.clearTimeout(t);
}, vf = (e, t) => {
  const r = Pe.every(
    (o) => t?.[o.id]?.overviewScreenshot
  ) ? ["screenshot", "overviewScreenshot"] : ["screenshot"], n = (o) => Promise.all(
    Pe.flatMap(
      (i) => r.map((s) => Cs(i.id, o, s, t))
    )
  );
  n(e).then(
    () => n(e === "dark" ? "light" : "dark")
  );
}, Af = (e, t, r, n) => {
  const [, o] = Re(0), i = e.join(",");
  return Ue(() => {
    let s = !1, a;
    return Promise.all(
      e.map(
        (c) => Cs(c, r, t, n).then(() => {
          s || o((d) => d + 1);
        })
      )
    ).then(() => {
      s || (a = Rf(() => vf(r, n)));
    }), () => {
      s = !0, a?.();
    };
  }, [i, t, r, n]), Object.fromEntries(
    e.map((s) => [s, Of(s, r, t, n)])
  );
}, _f = "74.6%", kf = {
  polymer: "28.1%",
  xpdite: "11.7%",
  centra: "-4.9%"
}, ni = 2.177, Pf = {
  polymer: { left: "40%", top: "8%", width: "56%" },
  xpdite: { left: "20%", top: "18%", width: "52%" },
  centra: { left: "0%", top: "30%", width: "56%" }
}, oi = ({
  theme: e,
  platform: t,
  platformAssets: r,
  compact: n = !1
}) => {
  const o = t ? wt(t) : null, i = Pe.every(
    (c) => r?.[c.id]?.overviewScreenshot
  ), s = Af(
    o ? [o.id] : Pe.map((c) => c.id),
    !o && i ? "overviewScreenshot" : "screenshot",
    e.mode,
    r
  ), a = n ? 2.25 : { md: 5, lg: 6 };
  return /* @__PURE__ */ g(
    v,
    {
      component: "aside",
      "aria-label": o ? `${o.name} overview` : "Lumora platforms overview",
      sx: {
        position: "relative",
        height: n ? Tf : "100%",
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
          backgroundImage: pi("currentColor"),
          backgroundSize: "32px 32px",
          transition: ge
        },
        // Content above the grid
        "& > *": { position: "relative" },
        color: o ? "#ffffff" : e.heading,
        transition: ge
      },
      children: o ? /* @__PURE__ */ L(Mt.Fragment, { children: [
        /* @__PURE__ */ L(
          v,
          {
            sx: {
              px: a,
              pt: n ? 2.25 : { md: 7, lg: 9 }
            },
            children: [
              /* @__PURE__ */ L(
                v,
                {
                  sx: {
                    ...ei,
                    // Platform label ("POLYMER • AI AGENT CONFIGURATION") in Montserrat
                    fontFamily: e.headingFont,
                    ...n && { fontSize: 10, gap: 1 },
                    animation: Ge(0)
                  },
                  children: [
                    /* @__PURE__ */ g(
                      v,
                      {
                        sx: {
                          width: 22,
                          height: "1px",
                          backgroundColor: "currentColor"
                        }
                      }
                    ),
                    o.name,
                    /* @__PURE__ */ g(
                      v,
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
              /* @__PURE__ */ L(
                v,
                {
                  component: "h2",
                  sx: {
                    ...Qo,
                    // Laptops: wraps every platform's headline the way Polymer's does ("Build agents.
                    // Govern every" 13.3em fits; Centra 14.3em and XPdite 15.2em break onto a second line).
                    // Wide screens (xl): no limit, so a headline stays on one line wherever it fits.
                    // In em, so the limit scales with the font.
                    maxWidth: { xs: "13.8em", xl: "none" },
                    ...n && {
                      fontSize: Zo
                    },
                    mt: n ? 1 : 2.5,
                    fontFamily: e.headingFont,
                    animation: Ge(60)
                  },
                  children: [
                    o.headline,
                    " ",
                    /* @__PURE__ */ g(
                      v,
                      {
                        component: "span",
                        sx: { color: o.accent },
                        children: o.headlineAccent
                      }
                    )
                  ]
                }
              ),
              !n && /* @__PURE__ */ g(
                v,
                {
                  sx: {
                    mt: 2,
                    fontSize: 18,
                    lineHeight: 1.5,
                    opacity: 0.92,
                    maxWidth: 640,
                    animation: Ge(120)
                  },
                  children: o.description
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ g(
          v,
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
              animation: `${ca} 450ms ${xt} 120ms both`
            },
            children: s[o.id] === null ? null : /* @__PURE__ */ g(
              Xo,
              {
                title: o.name,
                barColor: o.frameColor,
                screenshot: s[o.id] ?? void 0,
                sx: s[o.id] ? {
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
      ] }, o.id) : /* @__PURE__ */ L(Mt.Fragment, { children: [
        /* @__PURE__ */ L(
          v,
          {
            sx: {
              px: a,
              pt: n ? 2.25 : { md: 5, lg: 6 }
            },
            children: [
              /* @__PURE__ */ L(
                v,
                {
                  sx: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    animation: Ge(0)
                  },
                  children: [
                    /* @__PURE__ */ L(
                      v,
                      {
                        sx: {
                          ...ei,
                          fontFamily: e.bodyFont,
                          fontSize: 16,
                          fontWeight: 600,
                          // The phone banner keeps a small label so the headline fits
                          ...n && { fontSize: 10, gap: 1 },
                          color: e.eyebrow,
                          transition: ge
                        },
                        children: [
                          /* @__PURE__ */ g(
                            v,
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
                    !n && /* @__PURE__ */ L(
                      v,
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
                          Pe.length,
                          " platforms · 1 account"
                        ]
                      }
                    )
                  ]
                }
              ),
              !n && /* @__PURE__ */ g(
                v,
                {
                  sx: {
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    mt: { md: 5, lg: 7 },
                    animation: Ge(60)
                  },
                  children: Pe.map((c) => /* @__PURE__ */ L(
                    v,
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
                        // Logos as on a selected tab: all white
                        "--mark-primary": "#ffffff",
                        "--mark-secondary": "#ffffff",
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
                        r?.[c.id]?.logo ?? /* @__PURE__ */ g(bs, { platform: c.id }),
                        c.name
                      ]
                    },
                    c.id
                  ))
                }
              ),
              /* @__PURE__ */ L(
                v,
                {
                  component: "h2",
                  sx: {
                    ...Qo,
                    ...n && {
                      fontSize: Zo
                    },
                    mt: n ? 1 : 2,
                    fontFamily: e.headingFont,
                    color: e.heroHeadline,
                    transition: ge,
                    animation: Ge(120)
                  },
                  children: [
                    "One sign-in.",
                    " ",
                    /* @__PURE__ */ g(
                      v,
                      {
                        component: "span",
                        sx: {
                          color: e.heroHeadlineAccent,
                          transition: ge
                        },
                        children: "Every platform."
                      }
                    )
                  ]
                }
              ),
              !n && /* @__PURE__ */ g(
                v,
                {
                  sx: {
                    mt: 2,
                    fontFamily: e.bodyFont,
                    fontSize: 18,
                    fontWeight: 500,
                    lineHeight: 1.55,
                    color: e.heroText,
                    maxWidth: 540,
                    animation: Ge(180)
                  },
                  children: "Centra runs the deals. Polymer builds the agents. XPdite trains them. One Lumora account opens all three."
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ g(
          v,
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
            children: i ? /* @__PURE__ */ g(
              v,
              {
                sx: {
                  position: "absolute",
                  left: 0,
                  right: 0,
                  mx: "auto",
                  aspectRatio: String(ni),
                  // Desktop: the whole stack fits, bottoms on the hero's edge.
                  // Phone banner: full width from the top, bottoms clipped.
                  ...n ? { top: 0, width: "100cqw" } : {
                    bottom: 0,
                    width: `min(100cqw, ${ni * 100}cqh)`
                  }
                },
                children: [
                  "polymer",
                  "xpdite",
                  "centra"
                ].map(
                  (c, d) => (
                    // Nothing while the window loads
                    s[c] ? /* @__PURE__ */ g(
                      v,
                      {
                        component: "img",
                        src: s[c],
                        alt: `${wt(c).name} dashboard`,
                        sx: {
                          position: "absolute",
                          bottom: 0,
                          left: kf[c],
                          width: _f,
                          display: "block",
                          // Back window first, front window last
                          animation: `${Hn} 500ms ${xt} ${200 + d * 60}ms both`
                        }
                      },
                      c
                    ) : null
                  )
                )
              }
            ) : ["polymer", "xpdite", "centra"].map((c, d) => {
              const u = wt(c);
              return s[c] === null ? null : /* @__PURE__ */ g(
                Xo,
                {
                  compact: !0,
                  title: u.name,
                  barColor: u.frameColor,
                  screenshot: s[c] ?? void 0,
                  sx: {
                    position: "absolute",
                    ...Pf[c],
                    // Run past the bottom edge, where the hero clips them
                    bottom: "-24px",
                    // Back window first, front window last
                    animation: `${Hn} 500ms ${xt} ${200 + d * 60}ms both`
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
}, Nf = ({ theme: e, title: t, steps: r }) => /* @__PURE__ */ L(
  v,
  {
    component: "section",
    "aria-labelledby": "lumora-first-time-title",
    sx: {
      px: 2.5,
      py: 2,
      [je]: { py: 1.25 },
      borderRadius: "12px",
      border: `1px solid ${e.border}`,
      backgroundColor: e.surface,
      transition: ge,
      "& *": { transition: ge }
    },
    children: [
      /* @__PURE__ */ g(
        v,
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
      /* @__PURE__ */ g(
        v,
        {
          component: "ol",
          sx: {
            m: 0,
            mt: 1.25,
            p: 0,
            listStyle: "none",
            display: "grid",
            gap: 1,
            [je]: { mt: 1, gap: 0.75 }
          },
          children: r.map((n, o) => /* @__PURE__ */ L(
            v,
            {
              component: "li",
              sx: { display: "flex", alignItems: "center", gap: 1.5, fontSize: 14.5, color: e.label },
              children: [
                /* @__PURE__ */ g(
                  v,
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
), ii = ({ brandConfig: e, theme: t }) => /* @__PURE__ */ L(
  v,
  {
    component: "footer",
    sx: {
      display: "grid",
      gap: 1,
      [je]: { gap: 0.5 },
      fontSize: 13,
      lineHeight: 1.5,
      color: t.label,
      transition: ge,
      // Centred on phones, where the panel is the whole page; left-aligned beside the hero
      textAlign: { xs: "center", md: "left" },
      justifyItems: { xs: "center", md: "start" }
    },
    children: [
      e.securityNote && /* @__PURE__ */ L(
        v,
        {
          sx: {
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "center", md: "flex-start" },
            gap: 0.75
          },
          children: [
            /* @__PURE__ */ g(js, { sx: { fontSize: 14 } }),
            e.securityNote
          ]
        }
      ),
      e.supportLabel && /* @__PURE__ */ L(v, { children: [
        "Need access?",
        " ",
        e.supportUrl ? /* @__PURE__ */ g(
          Un,
          {
            href: e.supportUrl,
            sx: {
              color: t.brandText,
              textDecorationColor: "currentColor"
            },
            children: e.supportLabel
          }
        ) : /* @__PURE__ */ g(v, { component: "span", sx: { color: t.brandText }, children: e.supportLabel })
      ] }),
      (e.copyright || e.copyrightHolder) && /* @__PURE__ */ L(v, { children: [
        e.copyright,
        e.copyright && e.copyrightHolder && " ",
        e.copyrightHolder && e.copyrightUrl ? (
          // Only the holder is linked; opens in a new tab so the sign-in page stays open
          /* @__PURE__ */ g(
            Un,
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
), mp = ({
  authConfig: e,
  onLoginSuccess: t,
  onLoginError: r,
  enableRecaptcha: n = !1,
  recaptchaSiteKey: o,
  enableGoogleSignIn: i = !0,
  enableMicrosoftSignIn: s = !1,
  enableMagicLinkSignIn: a = !1,
  enablePasskeySignIn: c = !1,
  showErrors: d = !0,
  defaultPlatform: u,
  showOverview: f = !1,
  showPlatformSelector: m = !1,
  onPlatformChange: S,
  platformAssets: b,
  defaultColorMode: h,
  onColorModeChange: C,
  branding: y
}) => {
  const [T, R] = Re("idle"), [x, w] = Re(null), [I, X] = Re(!1), V = () => m ? f ? null : u ?? hr.get() ?? tt : tt, [D, U] = Re(
    V
  ), [z, l] = Re(f);
  z !== f && (l(f), U(V()));
  const F = D ?? tt;
  Ue(() => {
    hr.set(F);
  }, [F]);
  const { colorMode: _, toggleColorMode: Z } = ua(
    h,
    C
  ), K = fi(y), M = gn(K, _, D), fe = () => `${window.location.origin}/callback`;
  if (Ue(() => {
    const W = (re) => {
      re.persisted && R(
        (pe) => pe === "google-loading" || pe === "microsoft-loading" ? "idle" : pe
      );
    };
    return window.addEventListener("pageshow", W), () => window.removeEventListener("pageshow", W);
  }, []), Ue(() => {
    X(Wt());
  }, []), Ue(() => {
    try {
      We(e.apiBaseUrl, e.apiKey);
    } catch (W) {
      console.error("Failed to initialize API client:", W);
    }
  }, [e.apiBaseUrl, e.apiKey]), !i && !s && !a && !c)
    throw new Error(
      "At least one sign-in method must be enabled (enableGoogleSignIn, enableMicrosoftSignIn, enableMagicLinkSignIn or enablePasskeySignIn)"
    );
  if (n && !o)
    throw new Error(
      "recaptchaSiteKey is required when enableRecaptcha is true"
    );
  const Be = () => window.grecaptcha.execute(o, { action: "login" }).catch(() => {
    throw new Error("reCAPTCHA verification failed");
  }), O = async () => {
    if (!n || !o)
      return "";
    if (typeof window > "u" || !window.grecaptcha)
      throw new Error("reCAPTCHA is not loaded");
    return new Promise((W, re) => {
      const pe = () => {
        Be().then(W).catch(re);
      };
      window.grecaptcha.ready(pe);
    });
  }, P = async (W, re) => {
    qe.setTokens(W.accessToken, W.refreshToken);
    const pe = re ?? await Ye.getCurrentUser();
    R("success"), t({ user: pe, tokens: W, platform: F });
  }, $ = (W) => {
    U(W), W && S?.(W);
  }, B = (W) => {
    try {
      R(`${W}-loading`), w(null);
      const re = W === "google" ? we.ENDPOINTS.GOOGLE_AUTH : we.ENDPOINTS.MICROSOFT_AUTH;
      setTimeout(() => {
        Ye.initiateOAuth(
          re,
          fe(),
          e.apiBaseUrl
        );
      }, 300);
    } catch (re) {
      const pe = re;
      w({ message: pe.message, type: W }), R("error"), r(pe);
    }
  }, q = async () => {
    R("passkey-loading"), w(null);
    try {
      const { tokens: W, user: re } = await Ye.loginWithPasskey();
      await P(W, re);
    } catch (W) {
      const re = W;
      w({ message: re.message, type: "passkey" }), R("error"), r(re);
    }
  }, J = async (W) => {
    R("magic-link-loading"), w(null);
    try {
      n && await O(), await Ye.requestMagicLink(W.email, fe()), R("magic-link-success");
    } catch (re) {
      const pe = re;
      w({ message: pe.message, type: "magic-link" }), R("error"), r(pe);
    }
  }, Y = () => {
    w(null), R("idle");
  };
  Ue(() => {
    if (n && o && typeof window < "u") {
      const W = document.createElement("script");
      W.src = `https://www.google.com/recaptcha/enterprise.js?render=${o}`, W.async = !0, W.defer = !0, document.head.appendChild(W);
    }
  }, [n, o]);
  const N = c && I, H = fa(T), Q = i || s, te = a || N, ye = /* @__PURE__ */ g(
    oi,
    {
      theme: M,
      platform: D,
      platformAssets: b
    }
  ), A = /* @__PURE__ */ g(
    oi,
    {
      theme: M,
      platform: D,
      platformAssets: b,
      compact: !0
    }
  );
  return T === "magic-link-success" ? /* @__PURE__ */ L(
    fn,
    {
      theme: M,
      hero: ye,
      mobileHero: A,
      footer: /* @__PURE__ */ g(ii, { brandConfig: K, theme: M }),
      children: [
        /* @__PURE__ */ g(
          uo,
          {
            brandConfig: K,
            theme: M,
            showWelcome: !1,
            onToggleColorMode: Z
          }
        ),
        /* @__PURE__ */ g(v, { sx: { pt: 6 }, children: /* @__PURE__ */ g(
          Ll,
          {
            theme: M,
            title: K.magicLinkSuccessTitle || "Check your inbox",
            description: K.magicLinkSuccessDescription || "If this email address belongs to an active account, we have sent it a sign-in link.",
            onBackToLogin: Y
          }
        ) })
      ]
    }
  ) : /* @__PURE__ */ L(
    fn,
    {
      theme: M,
      hero: ye,
      mobileHero: A,
      footer: /* @__PURE__ */ g(ii, { brandConfig: K, theme: M }),
      children: [
        /* @__PURE__ */ g(
          uo,
          {
            brandConfig: K,
            theme: M,
            onToggleColorMode: Z
          }
        ),
        m && /* @__PURE__ */ g(
          xf,
          {
            theme: M,
            value: D,
            platformAssets: b,
            disabled: H,
            allowClear: f,
            onChange: $
          }
        ),
        d && x && /* @__PURE__ */ g(
          Ms,
          {
            severity: "error",
            onClose: () => w(null),
            sx: {
              borderRadius: "10px",
              border: `1px solid ${M.errorBorder}`,
              backgroundColor: M.errorBg,
              color: M.errorText,
              fontFamily: M.bodyFont,
              fontSize: 15,
              transition: ge,
              "& .MuiAlert-icon": { color: M.errorIcon },
              "& .MuiAlert-action .MuiIconButton-root": {
                color: M.errorText
              }
            },
            children: x.message
          }
        ),
        Q && /* @__PURE__ */ L(
          v,
          {
            sx: {
              display: "grid",
              gridTemplateColumns: i && s ? "1fr 1fr" : "1fr",
              gap: 1.5
            },
            children: [
              i && /* @__PURE__ */ g(
                fo,
                {
                  theme: M,
                  icon: /* @__PURE__ */ g(Hs, {}),
                  label: "Google",
                  ariaLabel: "Continue with Google",
                  isLoading: T === "google-loading",
                  disabled: H,
                  onClick: () => B("google")
                }
              ),
              s && /* @__PURE__ */ g(
                fo,
                {
                  theme: M,
                  icon: /* @__PURE__ */ g(Pl, { monochrome: !0 }),
                  label: "Microsoft",
                  ariaLabel: "Continue with Microsoft",
                  isLoading: T === "microsoft-loading",
                  disabled: H,
                  onClick: () => B("microsoft")
                }
              )
            ]
          }
        ),
        Q && te && /* @__PURE__ */ g(
          Fs,
          {
            sx: {
              fontFamily: M.bodyFont,
              fontSize: 16,
              color: M.label,
              transition: ge,
              "&::before, &::after": {
                borderColor: M.divider,
                transition: ge
              }
            },
            children: "or use your work email"
          }
        ),
        a && /* @__PURE__ */ g(
          $l,
          {
            theme: M,
            isSubmitting: T === "magic-link-loading",
            disabled: H,
            onSubmit: J
          }
        ),
        N && /* @__PURE__ */ g(
          Bt,
          {
            fullWidth: !0,
            variant: "outlined",
            onClick: q,
            disabled: H,
            startIcon: T === "passkey-loading" ? /* @__PURE__ */ g(hn, { size: 16, color: "inherit" }) : void 0,
            sx: {
              ...ut,
              borderRadius: "10px",
              borderWidth: 1.5,
              borderColor: M.accent,
              backgroundColor: M.surface,
              color: M.accent,
              fontFamily: M.headingFont,
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: "0.14em",
              transition: ge,
              "&:hover": {
                borderWidth: 1.5,
                borderColor: M.accentHover,
                backgroundColor: `${M.accent}0f`
              },
              "&.Mui-disabled": {
                borderWidth: 1.5,
                borderColor: M.border,
                color: M.muted
              },
              ...mr(M)
            },
            children: T === "passkey-loading" ? "Waiting for passkey..." : "Sign in with passkey"
          }
        ),
        d && T === "error" && /* @__PURE__ */ g(
          Bt,
          {
            variant: "text",
            onClick: Y,
            sx: {
              alignSelf: "center",
              mt: -1.5,
              color: M.accent,
              fontFamily: M.headingFont,
              textTransform: "none",
              fontWeight: 600,
              ...mr(M)
            },
            children: "Try Again"
          }
        ),
        K.firstTimeSteps && K.firstTimeSteps.length > 0 && /* @__PURE__ */ g(
          Nf,
          {
            theme: M,
            title: K.firstTimeTitle || "First time here?",
            steps: K.firstTimeSteps
          }
        )
      ]
    }
  );
}, If = ["light", "dark"], $f = {
  light: "rgba(18, 51, 45, 0.09)",
  dark: "rgba(255, 255, 255, 0.08)"
}, It = "rgba(255, 255, 255, 0.18)", Lf = () => () => {
}, Df = () => _s(
  Lf,
  () => !1,
  () => !0
), Mf = typeof window > "u" ? Ue : ks, Ff = (e, t) => ({
  mode: cr.get() ?? e ?? mi(),
  platform: t ?? hr.get() ?? tt
}), Bf = (e, t) => `(function(s){try{var e=s.parentElement,m=null,p=${JSON.stringify(t ?? null)};try{m=localStorage.getItem(${JSON.stringify(ar)});if(!p)p=localStorage.getItem(${JSON.stringify(sr)})}catch(x){}if(m!=='light'&&m!=='dark')m=${JSON.stringify(e ?? null)}||(window.matchMedia&&matchMedia(${JSON.stringify(bn)}).matches?'dark':'light');if(${JSON.stringify(Pe.map((r) => r.id))}.indexOf(p)<0)p=${JSON.stringify(tt)};e.setAttribute('data-mode',m);e.setAttribute('data-platform',p)}catch(x){}})(document.currentScript)`, Os = (e) => `--lumora-${e}-color`, si = (e, t, r) => {
  const n = gn(e, t, r), o = {
    "--lumora-bone": $f[t],
    "--lumora-hero": wt(r).color
  };
  return Object.entries(n).forEach(([i, s]) => {
    i !== "mode" && typeof s == "string" && (o[Os(i)] = s);
  }), o;
}, Uf = (e) => {
  const t = gn(e, "light", tt);
  return Object.fromEntries(
    Object.entries(t).map(([r, n]) => [
      r,
      r === "mode" || typeof n != "string" ? n : `var(${Os(r)})`
    ])
  );
}, de = ({ width: e, height: t, radius: r = 6, color: n = "var(--lumora-bone)", sx: o }) => /* @__PURE__ */ g(
  Bs,
  {
    variant: "rounded",
    animation: "wave",
    width: e,
    height: t,
    sx: { bgcolor: n, borderRadius: r, flexShrink: 0, transform: "none", ...o }
  }
), $t = ({ sx: e }) => /* @__PURE__ */ g(de, { radius: "10px", sx: { ...ut, ...e } }), gp = ({
  defaultColorMode: e,
  defaultPlatform: t,
  showPlatformSelector: r = !1,
  branding: n
}) => {
  const o = r ? t : tt, i = fi(n), s = Uf(i), a = pn(null), c = Df();
  Mf(() => {
    const { mode: f, platform: m } = Ff(e, o);
    a.current?.setAttribute("data-mode", f), a.current?.setAttribute("data-platform", m);
  }, [e, o]);
  const d = {};
  Pe.forEach(
    ({ id: f }) => If.forEach((m) => {
      d[`&[data-mode="${m}"][data-platform="${f}"]`] = si(
        i,
        m,
        f
      );
    })
  );
  const u = /* @__PURE__ */ L(
    v,
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
          backgroundImage: pi("rgba(255, 255, 255, 0.06)"),
          backgroundSize: "32px 32px"
        },
        "& > *": { position: "relative" }
      },
      children: [
        /* @__PURE__ */ L(v, { sx: { px: { md: 5, lg: 6 }, pt: { md: 7, lg: 9 } }, children: [
          /* @__PURE__ */ g(de, { width: 260, height: 12, color: It }),
          /* @__PURE__ */ g(de, { width: "72%", height: 56, radius: 10, color: It, sx: { mt: 3 } }),
          /* @__PURE__ */ g(de, { width: "48%", height: 56, radius: 10, color: It, sx: { mt: 1.5 } }),
          /* @__PURE__ */ g(de, { width: "58%", height: 16, color: It, sx: { mt: 3 } })
        ] }),
        /* @__PURE__ */ g(
          de,
          {
            radius: "14px",
            color: It,
            sx: { flex: 1, minHeight: 240, mt: { md: 5, lg: 6 }, ml: { md: 5, lg: 6 }, mr: "-14px", mb: "-14px" }
          }
        )
      ]
    }
  );
  return /* @__PURE__ */ L(
    v,
    {
      ref: a,
      role: "status",
      "aria-busy": "true",
      "aria-label": "Loading sign-in",
      "data-testid": "lumora-login-skeleton",
      suppressHydrationWarning: !0,
      sx: {
        ...si(
          i,
          e ?? "light",
          o ?? tt
        ),
        ...d
      },
      children: [
        c && /* @__PURE__ */ g(
          "script",
          {
            dangerouslySetInnerHTML: {
              __html: Bf(e, o)
            }
          }
        ),
        /* @__PURE__ */ L(
          fn,
          {
            theme: s,
            hero: u,
            mobileHero: /* @__PURE__ */ g(de, { height: 200, radius: "16px", color: "var(--lumora-hero)" }),
            footer: /* @__PURE__ */ L(v, { sx: { display: "flex", flexDirection: "column", gap: 1 }, children: [
              /* @__PURE__ */ g(de, { width: "70%", height: 10 }),
              /* @__PURE__ */ g(de, { width: "55%", height: 10 }),
              /* @__PURE__ */ g(de, { width: "45%", height: 10 })
            ] }),
            children: [
              /* @__PURE__ */ L(v, { children: [
                /* @__PURE__ */ L(v, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
                  /* @__PURE__ */ g(de, { width: 120, height: 32 }),
                  /* @__PURE__ */ g(de, { width: 30, height: 30, radius: "50%" })
                ] }),
                /* @__PURE__ */ g(de, { width: "78%", height: 42, radius: 8, sx: { mt: 4.5, [je]: { mt: 3 } } }),
                /* @__PURE__ */ g(de, { width: "46%", height: 42, radius: 8, sx: { mt: 1 } }),
                /* @__PURE__ */ g(de, { width: "88%", height: 16, sx: { mt: 2, [je]: { mt: 1.5 } } }),
                /* @__PURE__ */ g(de, { width: "30%", height: 16, sx: { mt: 1 } })
              ] }),
              r && /* @__PURE__ */ L(v, { children: [
                /* @__PURE__ */ g(de, { width: "58%", height: 12, sx: { mb: 1.5 } }),
                /* @__PURE__ */ g(
                  v,
                  {
                    sx: {
                      display: "flex",
                      gap: 0.5,
                      p: 1,
                      borderRadius: "12px",
                      backgroundColor: s.surface,
                      border: `1px solid ${s.border}`
                    },
                    children: [0, 1, 2].map((f) => /* @__PURE__ */ g(de, { radius: "8px", sx: { flex: 1, ...ut } }, f))
                  }
                )
              ] }),
              /* @__PURE__ */ L(v, { sx: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }, children: [
                /* @__PURE__ */ g($t, {}),
                /* @__PURE__ */ g($t, {})
              ] }),
              /* @__PURE__ */ L(v, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
                /* @__PURE__ */ g(v, { sx: { flex: 1, height: "1px", backgroundColor: s.divider } }),
                /* @__PURE__ */ g(de, { width: 150, height: 12 }),
                /* @__PURE__ */ g(v, { sx: { flex: 1, height: "1px", backgroundColor: s.divider } })
              ] }),
              /* @__PURE__ */ L(v, { children: [
                /* @__PURE__ */ g(de, { width: "30%", height: 12, sx: { mb: 1.5 } }),
                /* @__PURE__ */ L(v, { sx: { display: "flex", gap: 1.5 }, children: [
                  /* @__PURE__ */ g($t, { sx: { flex: 1, minWidth: 0 } }),
                  /* @__PURE__ */ g($t, { sx: { width: 110 } })
                ] }),
                /* @__PURE__ */ g($t, { sx: { mt: 2 } })
              ] }),
              /* @__PURE__ */ L(
                v,
                {
                  sx: {
                    p: 2.5,
                    [je]: { py: 1.25 },
                    borderRadius: "12px",
                    backgroundColor: s.surface,
                    border: `1px solid ${s.border}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.25
                  },
                  children: [
                    /* @__PURE__ */ g(de, { width: "40%", height: 16 }),
                    /* @__PURE__ */ g(de, { width: "80%", height: 12 }),
                    /* @__PURE__ */ g(de, { width: "72%", height: 12 }),
                    /* @__PURE__ */ g(de, { width: "86%", height: 12 })
                  ]
                }
              )
            ]
          }
        )
      ]
    }
  );
}, yp = (e) => {
  const [t, r] = Re(!0), [n, o] = Re(null), i = pn(!1);
  return Ue(() => {
    if (i.current)
      return;
    i.current = !0, (async () => {
      try {
        e?.apiBaseUrl && We(e.apiBaseUrl, e.apiKey);
        const a = new URLSearchParams(window.location.search);
        let c = a.get("access_token") || a.get("accessToken"), d = a.get("refresh_token") || a.get("refreshToken");
        const u = a.get("magic_token"), f = a.get("user"), m = a.get("error"), S = a.get("message");
        if (m) {
          const C = decodeURIComponent(S || m);
          throw new Error(C);
        }
        if (u) {
          const C = await Ye.verifyMagicLink(u);
          c = C.accessToken, d = C.refreshToken;
        }
        if (!c || !d)
          throw new Error("Missing authentication tokens in callback URL");
        qe.setTokens(c, d);
        let b;
        if (f)
          try {
            const C = decodeURIComponent(f);
            b = JSON.parse(C);
          } catch (C) {
            console.warn("Failed to parse user from URL, fetching from API:", C), b = await Ye.getCurrentUser();
          }
        else
          b = await Ye.getCurrentUser();
        e?.onSuccess?.({ accessToken: c, refreshToken: d }, b, hr.get());
        const h = e?.redirectPath || "/dashboard";
        window.history.replaceState({}, document.title, h), r(!1);
      } catch (a) {
        const c = a;
        o(c), e?.onError?.(c), r(!1);
      }
    })();
  }, [e?.redirectPath]), { loading: t, error: n };
}, bp = (e) => ({ logout: Ps(async () => {
  const r = qe.getRefreshToken();
  if (e?.apiBaseUrl && r)
    try {
      await Ye.logout(r);
    } catch (n) {
      console.error("Logout API call failed:", n);
    }
  qe.clearTokens(), window.location.href = "/login";
}, [e?.apiBaseUrl]) }), Sp = (e) => {
  const [t, r] = Re(!1), [n, o] = Re(null), [i, s] = Re(!1);
  return Ue(() => {
    s(Wt());
  }, []), { registerPasskey: async (c) => {
    r(!0), o(null);
    try {
      return e?.apiBaseUrl && We(e.apiBaseUrl, e.apiKey), await Ye.registerPasskey(c);
    } catch (d) {
      return o(d), null;
    } finally {
      r(!1);
    }
  }, loading: t, error: n, isSupported: i };
};
export {
  cr as ColorModeStorage,
  mp as LumoraLogin,
  gp as LumoraLoginSkeleton,
  Pe as PLATFORMS,
  hr as PlatformStorage,
  qe as TokenStorage,
  fi as getBrandingConfig,
  ra as getDefaultBranding,
  yp as useAuthCallback,
  bp as useLogout,
  Sp as usePasskeyRegistration
};
