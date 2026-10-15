import { jsxs as D, jsx as m, Fragment as Bn } from "react/jsx-runtime";
import * as Q from "react";
import Mt, { useState as Oe, useEffect as Be, useId as vs, useMemo as As, useRef as pn, useSyncExternalStore as _s, useLayoutEffect as ks, useCallback as Ps } from "react";
import { SvgIcon as Et, Box as A, Tooltip as Ns, IconButton as Is, Button as Ut, CircularProgress as hn, InputBase as $s, ToggleButtonGroup as Ls, ToggleButton as Ds, Link as Un, Alert as Ms, Divider as Fs, Skeleton as Bs } from "@mui/material";
import { MarkEmailReadOutlined as Us, LockOutlined as js, Google as Hs } from "@mui/icons-material";
import { keyframes as mn, Global as Vs, ThemeContext as ai } from "@emotion/react";
import { appendErrors as Ws, useForm as zs } from "react-hook-form";
import { validateFieldsNatively as qs, toNestErrors as Ks } from "@hookform/resolvers";
import * as jn from "yup";
import "@emotion/styled";
function We(e) {
  const t = new Uint8Array(e);
  let r = "";
  for (const o of t)
    r += String.fromCharCode(o);
  return btoa(r).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function hr(e) {
  const t = e.replace(/-/g, "+").replace(/_/g, "/"), r = (4 - t.length % 4) % 4, n = t.padEnd(t.length + r, "="), o = atob(n), i = new ArrayBuffer(o.length), s = new Uint8Array(i);
  for (let a = 0; a < o.length; a++)
    s[a] = o.charCodeAt(a);
  return i;
}
function zt() {
  return Gs.stubThis(globalThis?.PublicKeyCredential !== void 0 && typeof globalThis.PublicKeyCredential == "function");
}
const Gs = {
  stubThis: (e) => e
};
function ci(e) {
  const { id: t } = e;
  return {
    ...e,
    id: hr(t),
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
function Ys({ error: e, options: t }) {
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
      if (li(n)) {
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
  if (!zt())
    throw new Error("WebAuthn is not supported in this browser");
  const n = {
    ...t,
    challenge: hr(t.challenge),
    user: {
      ...t.user,
      id: hr(t.user.id)
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
  } catch (S) {
    throw Ys({ error: S, options: o });
  }
  if (!i)
    throw new Error("Registration was not completed");
  const { id: s, rawId: a, response: c, type: d } = i;
  let l;
  typeof c.getTransports == "function" && (l = c.getTransports());
  let f;
  if (typeof c.getPublicKeyAlgorithm == "function")
    try {
      f = c.getPublicKeyAlgorithm();
    } catch (S) {
      Br("getPublicKeyAlgorithm()", S);
    }
  let g;
  if (typeof c.getPublicKey == "function")
    try {
      const S = c.getPublicKey();
      S !== null && (g = We(S));
    } catch (S) {
      Br("getPublicKey()", S);
    }
  let b;
  if (typeof c.getAuthenticatorData == "function")
    try {
      b = We(c.getAuthenticatorData());
    } catch (S) {
      Br("getAuthenticatorData()", S);
    }
  return {
    id: s,
    rawId: We(a),
    response: {
      attestationObject: We(c.attestationObject),
      clientDataJSON: We(c.clientDataJSON),
      transports: l,
      publicKeyAlgorithm: f,
      publicKey: g,
      authenticatorData: b
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
  if (!zt())
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
      if (li(n)) {
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
async function ta(e) {
  !e.optionsJSON && e.challenge && (console.warn("startAuthentication() was not called correctly. It will try to continue with the provided options, but this call should be refactored to use the expected call structure instead. See https://simplewebauthn.dev/docs/packages/browser#typeerror-cannot-read-properties-of-undefined-reading-challenge for more information."), e = { optionsJSON: e });
  const { optionsJSON: t, useBrowserAutofill: r = !1, verifyBrowserAutofillInput: n = !0 } = e;
  if (!zt())
    throw new Error("WebAuthn is not supported in this browser");
  let o;
  t.allowCredentials?.length !== 0 && (o = t.allowCredentials?.map(ci));
  const i = {
    ...t,
    challenge: hr(t.challenge),
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
  } catch (b) {
    throw ea({ error: b, options: s });
  }
  if (!a)
    throw new Error("Authentication was not completed");
  const { id: c, rawId: d, response: l, type: f } = a;
  let g;
  return l.userHandle && (g = We(l.userHandle)), {
    id: c,
    rawId: We(d),
    response: {
      authenticatorData: We(l.authenticatorData),
      clientDataJSON: We(l.clientDataJSON),
      signature: We(l.signature),
      userHandle: g
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
}, ke = [
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
    loadScreenshot: (e) => (e === "dark" ? import("./centra-dark-vZM88mSa.js") : import("./centra-C0W0TJb-.js")).then((t) => t.default)
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
], at = "centra", wt = (e) => ke.find((t) => t.id === e), ar = "lumora_platform", Ft = {
  /**
   * Get the stored platform
   * @returns The platform id or null when none was chosen
   */
  get: () => {
    try {
      const e = localStorage.getItem(ar);
      return ke.some((t) => t.id === e) ? e : null;
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
      e ? localStorage.setItem(ar, e) : localStorage.removeItem(ar);
    } catch {
    }
  }
}, Ue = "@media (max-height: 920px)", ut = {
  height: 50,
  [Ue]: { height: 46 }
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
}), pi = (e) => `linear-gradient(${e} 1px, transparent 1px), linear-gradient(90deg, ${e} 1px, transparent 1px)`, xt = "cubic-bezier(0.2, 0.7, 0.2, 1)", yn = 350, ia = "cubic-bezier(0.4, 0, 0.2, 1)", qt = (...e) => e.map((t) => `${t} ${yn}ms ${ia}`).join(", "), he = qt(
  "background-color",
  "border-color",
  "color",
  "box-shadow"
), hi = qt("fill", "stroke"), sa = qt("opacity", "transform"), aa = mn`
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
`, Ke = (e = 0, t = 500) => `${aa} ${t}ms ${xt} ${e}ms both`, la = {
  "@media (prefers-reduced-motion: reduce)": {
    "& *, & *::before, & *::after": {
      animationDuration: "1ms !important",
      animationDelay: "0ms !important",
      transitionDuration: "1ms !important"
    }
  }
}, cr = "lumora_color_mode", bn = "(prefers-color-scheme: dark)", mi = () => typeof window > "u" || !window.matchMedia ? "light" : window.matchMedia(bn).matches ? "dark" : "light", lr = {
  /**
   * Get the stored colour mode
   * @returns The user's choice, or null when they never toggled
   */
  get: () => {
    try {
      const e = localStorage.getItem(cr);
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
      localStorage.setItem(cr, e);
    } catch {
    }
  },
  /**
   * Forget the user's choice, so the page follows the system again
   */
  clear: () => {
    try {
      localStorage.removeItem(cr);
    } catch {
    }
  }
}, ua = (e, t) => {
  const [r, n] = Oe(
    () => lr.get() !== null
  ), [o, i] = Oe(
    () => lr.get() ?? e ?? mi()
  ), s = !r && !e;
  return Be(() => {
    if (!s || typeof window > "u" || !window.matchMedia)
      return;
    const c = window.matchMedia(bn), d = (l) => i(l.matches ? "dark" : "light");
    return c.addEventListener("change", d), () => c.removeEventListener("change", d);
  }, [s]), { colorMode: o, toggleColorMode: () => {
    const c = o === "dark" ? "light" : "dark";
    i(c), n(!0), lr.set(c), t?.(c);
  } };
}, da = [
  "google-loading",
  "microsoft-loading",
  "passkey-loading",
  "magic-link-loading"
], fa = (e) => da.includes(e), ze = {
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
}, Se = {
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
const { toString: ha } = Object.prototype, { getPrototypeOf: tt } = Object, { iterator: Kt, toStringTag: yi } = Symbol, jt = (({ hasOwnProperty: e }) => (t, r) => e.call(t, r))(Object.prototype), bi = (e) => typeof e == "string" && (e === "__proto__" || e === "constructor" || e === "prototype"), Si = (e, t, r) => e === Object.prototype || !r && t === null, ma = (e) => {
  if (!Object.isExtensible(e))
    return !1;
  const t = Object.getOwnPropertyNames(e);
  return Object.getOwnPropertySymbols && t.push(...Object.getOwnPropertySymbols(e)), t.every((r) => {
    if (bi(r))
      return !1;
    const n = Object.getOwnPropertyDescriptor(e, r);
    return !!n && n.configurable && n.writable === !0;
  });
}, Ht = (e, t) => {
  let r = e;
  const n = [];
  for (; r != null; ) {
    if (n.indexOf(r) !== -1)
      return !1;
    n.push(r);
    const o = tt(r);
    if (Si(r, o, r === e))
      return !1;
    if (jt(r, t))
      return !0;
    r = o;
  }
  return !1;
}, ga = (e, t) => e != null && Ht(e, t) ? e[t] : void 0, ya = (e) => {
  if (e == null || typeof e != "object" && typeof e != "function")
    return e;
  const t = tt(e);
  if (t === null && ma(e))
    return e;
  const r = /* @__PURE__ */ Object.create(null), n = /* @__PURE__ */ Object.create(null), o = [];
  let i = e;
  for (; i != null && o.indexOf(i) === -1; ) {
    o.push(i);
    const s = i === e ? t : tt(i);
    if (Si(i, s, i === e))
      break;
    const a = Object.getOwnPropertyNames(i);
    Object.getOwnPropertySymbols && a.push(...Object.getOwnPropertySymbols(i));
    for (const c of a)
      bi(c) || jt(n, c) || (r[c] = e[c], n[c] = !0);
    i = s;
  }
  return r;
}, Sn = /* @__PURE__ */ ((e) => (t) => {
  const r = ha.call(t);
  return e[r] || (e[r] = r.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), De = (e) => (e = e.toLowerCase(), (t) => Sn(t) === e), wr = (e) => (t) => typeof t === e, { isArray: dt } = Array, ft = wr("undefined");
function Ct(e) {
  return e !== null && !ft(e) && e.constructor !== null && !ft(e.constructor) && ve(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}
const Ei = De("ArrayBuffer");
function ba(e) {
  let t;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? t = ArrayBuffer.isView(e) : t = e && e.buffer && Ei(e.buffer), t;
}
const Sa = wr("string"), ve = wr("function"), wi = wr("number"), Ot = (e) => e !== null && typeof e == "object", Ea = (e) => e === !0 || e === !1, ur = (e) => {
  if (!Ot(e))
    return !1;
  const t = tt(e);
  return (t === null || t === Object.prototype || tt(t) === null) && // Treat safe own/inherited Symbol.toStringTag or Symbol.iterator members as
  // evidence the value is tagged/iterable, while ignoring members reachable
  // only through shared or terminal prototype boundaries.
  !Ht(e, yi) && !Ht(e, Kt);
}, wa = (e) => {
  if (!Ot(e) || Ct(e))
    return !1;
  try {
    return Object.keys(e).length === 0 && Object.getPrototypeOf(e) === Object.prototype;
  } catch {
    return !1;
  }
}, xa = De("Date"), Ta = De("File"), Ca = (e) => !!(e && typeof e.uri < "u"), Oa = (e) => e && typeof e.getParts < "u", Ra = De("Blob"), va = De("FileList"), Aa = De("Set"), _a = (e) => Ot(e) && ve(e.pipe);
function ka() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
}
const Vn = ka(), Wn = typeof Vn.FormData < "u" ? Vn.FormData : void 0, Pa = (e) => {
  if (!e) return !1;
  if (Wn && e instanceof Wn) return !0;
  const t = tt(e);
  if (!t || t === Object.prototype || !ve(e.append)) return !1;
  const r = Sn(e);
  return r === "formdata" || // detect form-data instance
  r === "object" && ve(e.toString) && e.toString() === "[object FormData]";
}, Na = De("URLSearchParams"), [Ia, $a, La, Da] = [
  "ReadableStream",
  "Request",
  "Response",
  "Headers"
].map(De), Ma = (e) => e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function Gt(e, t, { allOwnKeys: r = !1 } = {}) {
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
const st = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, Ti = (e) => !ft(e) && e !== st;
function sn(...e) {
  const { caseless: t, skipUndefined: r } = Ti(this) && this || {}, n = {}, o = (i, s) => {
    if (s === "__proto__" || s === "constructor" || s === "prototype")
      return;
    const a = t && typeof s == "string" && xi(n, s) || s, c = jt(n, a) ? n[a] : void 0;
    ur(c) && ur(i) ? n[a] = sn(c, i) : ur(i) ? n[a] = sn({}, i) : dt(i) ? n[a] = i.slice() : (!r || !ft(i)) && (n[a] = i);
  };
  for (let i = 0, s = e.length; i < s; i++) {
    const a = e[i];
    if (!a || Ct(a) || (Gt(a, o), typeof a != "object" || dt(a)))
      continue;
    const c = Object.getOwnPropertySymbols(a);
    for (let d = 0; d < c.length; d++) {
      const l = c[d];
      Ya.call(a, l) && o(a[l], l);
    }
  }
  return n;
}
const Fa = (e, t, r, { allOwnKeys: n } = {}) => (Gt(
  t,
  (o, i) => {
    r && ve(o) ? Object.defineProperty(e, i, {
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
    e = r !== !1 && tt(e);
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
}, Wa = /* @__PURE__ */ ((e) => (t) => e && t instanceof e)(typeof Uint8Array < "u" && tt(Uint8Array)), za = (e, t) => {
  const n = (e && e[Kt]).call(e);
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
}, Ka = De("HTMLFormElement"), Ga = (e) => e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function(r, n, o) {
  return n.toUpperCase() + o;
}), { propertyIsEnumerable: Ya } = Object.prototype, Ja = De("RegExp"), Ci = (e, t) => {
  const r = Object.getOwnPropertyDescriptors(e), n = {};
  Gt(r, (o, i) => {
    let s;
    (s = t(o, i, e)) !== !1 && (n[i] = s || o);
  }), Object.defineProperties(e, n);
}, Xa = (e) => {
  Ci(e, (t, r) => {
    if (ve(e) && ["arguments", "caller", "callee"].includes(r))
      return !1;
    const n = e[r];
    if (ve(n)) {
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
  return !!(e && ve(e.append) && e[yi] === "FormData" && e[Kt]);
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
          o = dt(n) ? [] : {}, Gt(n, (i, s) => {
            const a = r(i);
            !ft(a) && (o[s] = a);
          });
        return t.delete(n), o;
      }
    }
    return n;
  };
  return r(e);
}, nc = De("AsyncFunction"), oc = (e) => e && (Ot(e) || ve(e)) && ve(e.then) && ve(e.catch), Oi = ((e, t) => e ? setImmediate : t ? ((r, n) => (st.addEventListener(
  "message",
  ({ source: o, data: i }) => {
    o === st && i === r && n.length && n.shift()();
  },
  !1
), (o) => {
  n.push(o), st.postMessage(r, "*");
}))(`axios@${Math.random()}`, []) : (r) => setTimeout(r))(typeof setImmediate == "function", ve(st.postMessage)), ic = typeof queueMicrotask < "u" ? queueMicrotask.bind(st) : typeof process < "u" && process.nextTick || Oi, Ri = (e) => e != null && ve(e[Kt]), sc = (e) => e != null && Ht(e, Kt) && Ri(e), p = {
  isArray: dt,
  isArrayBuffer: Ei,
  isBuffer: Ct,
  isFormData: Pa,
  isArrayBufferView: ba,
  isString: Sa,
  isNumber: wi,
  isBoolean: Ea,
  isObject: Ot,
  isPlainObject: ur,
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
  isFunction: ve,
  isStream: _a,
  isURLSearchParams: Na,
  isTypedArray: Wa,
  isFileList: va,
  forEach: Gt,
  merge: sn,
  extend: Fa,
  trim: Ma,
  stripBOM: Ba,
  inherits: Ua,
  toFlatObject: ja,
  kindOf: Sn,
  kindOfTest: De,
  endsWith: Ha,
  toArray: Va,
  forEachEntry: za,
  matchAll: qa,
  isHTMLForm: Ka,
  hasOwnProperty: jt,
  hasOwnProp: jt,
  // an alias to avoid ESLint no-prototype-builtins detection
  hasOwnInPrototypeChain: Ht,
  getSafeProp: ga,
  toSafeFlatObject: ya,
  reduceDescriptors: Ci,
  freezeMethods: Xa,
  toObjectSet: Za,
  toCamelCase: Ga,
  noop: Qa,
  toFiniteNumber: ec,
  findKey: xi,
  global: st,
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
function dr(e) {
  return e === !1 || e == null ? e : p.isArray(e) ? e.map(dr) : fc(String(e));
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
    const l = jr(c.slice(0, d));
    if (!mc.test(l))
      return;
    const f = l.toLowerCase();
    if (f === "__proto__" || f === "constructor" || f === "prototype")
      return;
    const g = jr(c.slice(d + 1));
    t[f] = gc(g);
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
let Ce = class {
  constructor(t) {
    t && this.set(t);
  }
  set(t, r, n) {
    const o = this;
    function i(a, c, d) {
      const l = vt(c);
      if (!l)
        return;
      const f = p.findKey(o, l);
      (!f || o[f] === void 0 || d === !0 || d === void 0 && o[f] !== !1) && (o[f || c] = dr(a));
    }
    const s = (a, c) => p.forEach(a, (d, l) => i(d, l, c));
    if (p.isPlainObject(t) || t instanceof this.constructor)
      s(t, r);
    else if (p.isString(t) && (t = t.trim()) && !bc(t))
      s(cc(t), r);
    else if (p.isObject(t) && p.isSafeIterable(t)) {
      let a = /* @__PURE__ */ Object.create(null), c, d;
      for (const l of t) {
        if (!p.isArray(l))
          throw new TypeError("Object iterator must return a key-value pair");
        d = l[0], p.hasOwnProp(a, d) ? (c = a[d], a[d] = p.isArray(c) ? [...c, l[1]] : [c, l[1]]) : a[d] = l[1];
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
        r[s] = dr(o), delete r[i];
        return;
      }
      const a = t ? Sc(i) : String(i).trim();
      a !== i && delete r[i], r[a] = dr(o), n[a] = !0;
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
    i instanceof Ce && (i = i.toJSON()), n.push(i);
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
let P = class Ai extends Error {
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
P.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE";
P.ERR_BAD_OPTION = "ERR_BAD_OPTION";
P.ECONNABORTED = "ECONNABORTED";
P.ETIMEDOUT = "ETIMEDOUT";
P.ECONNREFUSED = "ECONNREFUSED";
P.ERR_NETWORK = "ERR_NETWORK";
P.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS";
P.ERR_DEPRECATED = "ERR_DEPRECATED";
P.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE";
P.ERR_BAD_REQUEST = "ERR_BAD_REQUEST";
P.ERR_CANCELED = "ERR_CANCELED";
P.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT";
P.ERR_INVALID_URL = "ERR_INVALID_URL";
P.ERR_FORM_DATA_DEPTH_EXCEEDED = "ERR_FORM_DATA_DEPTH_EXCEEDED";
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
  const n = (x, _) => {
    const w = p.getSafeProp(r, x);
    return p.isUndefined(w) ? _ : w;
  }, o = n("metaTokens", !0), i = n("visitor") || h, s = n("dots", !1), a = n("indexes", !1), c = n("Blob") || typeof Blob < "u" && Blob, d = n("maxDepth", _i), l = c && p.isSpecCompliantForm(t), f = [];
  if (!p.isFunction(i))
    throw new TypeError("visitor must be a function");
  function g(x) {
    if (x === null) return "";
    if (p.isDate(x))
      return x.toISOString();
    if (p.isBoolean(x))
      return x.toString();
    if (!l && p.isBlob(x))
      throw new P("Blob is not supported. Use a Buffer instead.");
    if (p.isArrayBuffer(x) || p.isTypedArray(x)) {
      if (l && typeof c == "function")
        return new c([x]);
      throw new P(
        "Blob is not supported. Use a Buffer instead.",
        P.ERR_NOT_SUPPORT
      );
    }
    return x;
  }
  function b(x) {
    if (x > d)
      throw new P(
        "Object is too deeply nested (" + x + " levels). Max depth: " + d,
        P.ERR_FORM_DATA_DEPTH_EXCEEDED
      );
  }
  function S(x, _) {
    if (d === 1 / 0)
      return JSON.stringify(x);
    const w = [];
    return JSON.stringify(x, function($, J) {
      if (!p.isObject(J))
        return J;
      for (; w.length && w[w.length - 1] !== this; )
        w.pop();
      return w.push(J), b(_ + w.length - 1), J;
    });
  }
  function h(x, _, w) {
    let T = x;
    if (p.isReactNative(t) && p.isReactNativeBlob(x))
      return t.append(Vr(w, _, s), g(x)), !1;
    if (x && !w && typeof x == "object") {
      if (p.endsWith(_, "{}"))
        _ = o ? _ : _.slice(0, -2), x = S(x, 1);
      else if (p.isArray(x) && Oc(x) || (p.isFileList(x) || p.endsWith(_, "[]")) && (T = p.toArray(x)))
        return _ = ki(_), T.forEach(function(J, V) {
          !(p.isUndefined(J) || J === null) && t.append(
            // eslint-disable-next-line no-nested-ternary
            a === !0 ? Vr([_], V, s) : a === null ? _ : _ + "[]",
            g(J)
          );
        }), !1;
    }
    return an(x) ? !0 : (t.append(Vr(w, _, s), g(x)), !1);
  }
  const C = Object.assign(Rc, {
    defaultVisitor: h,
    convertValue: g,
    isVisitable: an
  });
  function y(x, _, w = 0) {
    if (!p.isUndefined(x)) {
      if (b(w), f.indexOf(x) !== -1)
        throw new Error("Circular reference detected in " + _.join("."));
      f.push(x), p.forEach(x, function($, J) {
        (!(p.isUndefined($) || $ === null) && i.call(t, $, p.isString(J) ? J.trim() : J, _, C)) === !0 && y($, _ ? _.concat(J) : [J], w + 1);
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
}, Symbol.toStringTag, { value: "Module" })), Ee = {
  ...Lc,
  ...Pc
};
function Dc(e, t) {
  return xr(e, new Ee.classes.URLSearchParams(), {
    visitor: function(r, n, o, i) {
      return Ee.isNode && p.isBuffer(r) ? (this.append(n, r.toString("base64")), !1) : i.defaultVisitor.apply(this, arguments);
    },
    ...t
  });
}
const Jn = _i;
function $i(e) {
  if (e > Jn)
    throw new P(
      "FormData field is too deeply nested (" + e + " levels). Max depth: " + Jn,
      P.ERR_FORM_DATA_DEPTH_EXCEEDED
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
const Yt = {
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
          const d = ht(this, "env"), l = d && d.FormData;
          return xr(
            a ? { "files[]": t } : t,
            l && new l(),
            c
          );
        }
      }
      return i || o ? (r.setContentType("application/json", !1), Bc(t)) : t;
    }
  ],
  transformResponse: [
    function(t) {
      const r = ht(this, "transitional") || Yt.transitional, n = r && r.forcedJSONParsing, o = ht(this, "responseType"), i = o === "json";
      if (p.isResponse(t) || p.isReadableStream(t))
        return t;
      if (t && p.isString(t) && (n && !o || i)) {
        const a = !(r && r.silentJSONParsing) && i;
        try {
          return JSON.parse(t, ht(this, "parseReviver"));
        } catch (c) {
          if (a)
            throw c.name === "SyntaxError" ? P.from(c, P.ERR_BAD_RESPONSE, this, null, ht(this, "response")) : c;
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
  Yt.headers[e] = {};
});
function Wr(e, t) {
  const r = this || Yt, n = t || r, o = Ce.from(n.headers);
  let i = n.data;
  return p.forEach(e, function(a) {
    i = a.call(r, i, o.normalize(), t ? t.status : void 0);
  }), o.normalize(), i;
}
function Mi(e) {
  return !!(e && e.__CANCEL__);
}
let Jt = class extends P {
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
    super(t ?? "canceled", P.ERR_CANCELED, r, n), this.name = "CanceledError", this.__CANCEL__ = !0;
  }
};
function Fi(e, t, r) {
  const n = r.config.validateStatus;
  !r.status || !n || n(r.status) ? e(r) : t(new P(
    "Request failed with status code " + r.status,
    r.status >= 400 && r.status < 500 ? P.ERR_BAD_REQUEST : P.ERR_BAD_RESPONSE,
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
    const d = Date.now(), l = n[i];
    s || (s = d), r[o] = c, n[o] = d;
    let f = i, g = 0;
    for (; f !== o; )
      g += r[f++], f = f % e;
    if (o = (o + 1) % e, o === i && (i = (i + 1) % e), d - s < t)
      return;
    const b = l && d - l;
    return b ? Math.round(g * 1e3 / b) : void 0;
  };
}
function Hc(e, t) {
  let r = 0, n = 1e3 / t, o, i;
  const s = (l, f = Date.now()) => {
    r = f, o = null, i && (clearTimeout(i), i = null), e(...l);
  };
  return [(...l) => {
    const f = Date.now(), g = f - r;
    g >= n ? s(l, f) : (o = l, i || (i = setTimeout(() => {
      i = null, s(o);
    }, n - g)));
  }, () => o && s(o), (...l) => s(l)];
}
const yr = (e, t, r = 3) => {
  let n = 0;
  const o = jc(50, 250);
  return Hc((i) => {
    if (!i || !p.isNumber(i.loaded))
      return;
    const s = i.loaded, a = i.lengthComputable ? i.total : void 0, c = Math.max(0, a != null ? Math.min(s, a) : s), d = Math.max(0, c - n), l = o(d);
    n = Math.max(n, c);
    const f = {
      loaded: c,
      total: a,
      progress: a ? c / a : void 0,
      bytes: d,
      rate: l || void 0,
      estimated: l && a ? (a - c) / l : void 0,
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
}, Zn = (e, t = p.asap) => (...r) => t(() => e(...r)), Vc = Ee.hasStandardBrowserEnv ? /* @__PURE__ */ ((e, t) => (r) => (r = new URL(r, Ee.origin), e.protocol === r.protocol && e.host === r.host && (t || e.port === r.port)))(
  new URL(Ee.origin),
  Ee.navigator && /(msie|trident)/i.test(Ee.navigator.userAgent)
) : () => !0, Wc = Ee.hasStandardBrowserEnv ? (
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
      throw new P(
        `Invalid URL ${JSON.stringify(Yc(r))}: missing "//" after protocol`,
        P.ERR_INVALID_URL,
        t
      );
  }
}
function Ui(e, t, r, n) {
  Qn(t, n);
  let o = !zc(t);
  return e && (o || r === !1) ? (Qn(e, n), qc(e, t)) : t;
}
const eo = (e) => e instanceof Ce ? { ...e } : e, Jc = (e) => Object.getOwnPropertySymbols && Object.getOwnPropertyDescriptor ? Object.keys(e).concat(
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
  function n(l, f, g, b) {
    return p.isPlainObject(l) && p.isPlainObject(f) ? p.merge.call({ caseless: b }, l, f) : p.isPlainObject(f) ? p.merge({}, f) : p.isArray(f) ? f.slice() : f;
  }
  function o(l, f, g, b) {
    if (p.isUndefined(f)) {
      if (!p.isUndefined(l))
        return n(void 0, l, g, b);
    } else return n(l, f, g, b);
  }
  function i(l, f) {
    if (!p.isUndefined(f))
      return n(void 0, f);
  }
  function s(l, f) {
    if (p.isUndefined(f)) {
      if (!p.isUndefined(l))
        return n(void 0, l);
    } else return n(void 0, f);
  }
  function a(l) {
    const f = p.hasOwnProp(t, "transitional") ? t.transitional : void 0;
    if (!p.isUndefined(f))
      if (p.isPlainObject(f)) {
        if (p.hasOwnProp(f, l))
          return f[l];
      } else
        return;
    const g = p.hasOwnProp(e, "transitional") ? e.transitional : void 0;
    if (p.isPlainObject(g) && p.hasOwnProp(g, l))
      return g[l];
  }
  function c(l, f, g) {
    if (p.hasOwnProp(t, g))
      return n(l, f);
    if (p.hasOwnProp(e, g))
      return n(void 0, l);
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
    headers: (l, f, g) => o(eo(l), eo(f), g, !0)
  };
  return p.forEach(Jc({ ...e, ...t }), function(f) {
    if (f === "__proto__" || f === "constructor" || f === "prototype") return;
    const g = p.hasOwnProp(d, f) ? d[f] : o, b = p.hasOwnProp(e, f) ? e[f] : void 0, S = p.hasOwnProp(t, f) ? t[f] : void 0, h = g(b, S, f);
    p.isUndefined(h) && g !== c || (r[f] = h);
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
  const t = pt({}, e), r = (g) => p.hasOwnProp(t, g) ? t[g] : void 0, n = r("data");
  let o = r("withXSRFToken");
  const i = r("xsrfHeaderName"), s = r("xsrfCookieName");
  let a = r("headers");
  const c = r("auth"), d = r("baseURL"), l = r("allowAbsoluteUrls"), f = r("url");
  if (t.headers = a = Ce.from(a), t.url = Ni(
    Ui(d, f, l, t),
    r("params"),
    r("paramsSerializer")
  ), c) {
    const g = p.getSafeProp(c, "username") || "", b = p.getSafeProp(c, "password") || "";
    try {
      a.set(
        "Authorization",
        "Basic " + btoa(g + ":" + (b ? Qc(b) : ""))
      );
    } catch (S) {
      throw P.from(S, P.ERR_BAD_OPTION_VALUE, e);
    }
  }
  if (p.isFormData(n)) {
    const g = p.getSafeProp(n, "getHeaders");
    Ee.hasStandardBrowserEnv || Ee.hasStandardBrowserWebWorkerEnv || p.isReactNative(n) ? a.setContentType(void 0) : p.isFunction(g) && Zc(a, g.call(n), r("formDataHeaderPolicy"));
  }
  if (Ee.hasStandardBrowserEnv && (p.isFunction(o) && (o = o(t)), o === !0 || o == null && Vc(t.url))) {
    const b = i && s && Wc.read(s);
    b && a.set(i, b);
  }
  return t;
}
const el = typeof XMLHttpRequest < "u", tl = el && function(e) {
  return new Promise(function(r, n) {
    const o = ji(e);
    let i = o.data;
    const s = Ce.from(o.headers).normalize();
    let { responseType: a, onUploadProgress: c, onDownloadProgress: d } = o, l, f, g, b, S, h;
    function C() {
      b && b(), S && S(), o.cancelToken && o.cancelToken.unsubscribe(l), o.signal && o.signal.removeEventListener("abort", l);
    }
    let y = new XMLHttpRequest();
    y.open(o.method.toUpperCase(), o.url, !0), y.timeout = o.timeout;
    function x(w) {
      if (!y)
        return;
      if (y.status === 0 && (zr(Bi(o.url)) || zr(Ee.origin)) !== "file" && !(y.responseURL && y.responseURL.startsWith("file:"))) {
        n(new P("Request aborted", P.ECONNABORTED, e, y)), C(), y = null;
        return;
      }
      try {
        w ? h && h(w) : S && S();
      } catch (V) {
        setTimeout(() => {
          throw V;
        });
      }
      if (!y)
        return;
      const T = Ce.from(
        "getAllResponseHeaders" in y && y.getAllResponseHeaders()
      ), J = {
        data: !a || a === "text" || a === "json" ? y.responseText : y.response,
        status: y.status,
        statusText: y.statusText,
        headers: T,
        config: e,
        request: y
      };
      Fi(
        function(M) {
          r(M), C();
        },
        function(M) {
          n(M), C();
        },
        J
      ), y = null;
    }
    "onloadend" in y ? y.onloadend = x : y.onreadystatechange = function() {
      !y || y.readyState !== 4 || y.status === 0 && !(y.responseURL && y.responseURL.startsWith("file:")) || setTimeout(x);
    }, y.onabort = function() {
      y && (n(new P("Request aborted", P.ECONNABORTED, e, y)), C(), y = null);
    }, y.onerror = function(T) {
      const $ = T && T.message ? T.message : "Network Error", J = new P($, P.ERR_NETWORK, e, y);
      J.event = T || null, n(J), C(), y = null;
    }, y.ontimeout = function() {
      let T = o.timeout ? "timeout of " + o.timeout + "ms exceeded" : "timeout exceeded";
      const $ = o.transitional || xn;
      o.timeoutErrorMessage && (T = o.timeoutErrorMessage), n(
        new P(
          T,
          $.clarifyTimeoutError ? P.ETIMEDOUT : P.ECONNABORTED,
          e,
          y
        )
      ), C(), y = null;
    }, i === void 0 && s.setContentType(null), "setRequestHeader" in y && p.forEach(vi(s), function(T, $) {
      y.setRequestHeader($, T);
    }), p.isUndefined(o.withCredentials) || (y.withCredentials = !!o.withCredentials), a && a !== "json" && (y.responseType = o.responseType), d && ([g, S, h] = yr(
      d,
      !0
    ), y.addEventListener("progress", g)), c && y.upload && ([f, b] = yr(c), y.upload.addEventListener("progress", f), y.upload.addEventListener("loadend", b)), (o.cancelToken || o.signal) && (l = (w) => {
      y && (n(!w || w.type ? new Jt(null, e, y) : w), y.abort(), C(), y = null);
    }, o.cancelToken && o.cancelToken.subscribe(l), o.signal && (o.signal.aborted ? l() : o.signal.addEventListener("abort", l)));
    const _ = zr(o.url);
    if (_ && !Ee.protocols.includes(_)) {
      n(
        new P(
          "Unsupported protocol " + _ + ":",
          P.ERR_BAD_REQUEST,
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
        d instanceof P ? d : new Jt(d instanceof Error ? d.message : d)
      );
    }
  };
  let i = t && setTimeout(() => {
    i = null, o(new P(`timeout of ${t}ms exceeded`, P.ETIMEDOUT));
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
          const { done: d, value: l } = await o.next();
          if (d) {
            a(), c.close();
            return;
          }
          let f = l.byteLength;
          if (r) {
            let g = i += f;
            r(g);
          }
          c.enqueue(new Uint8Array(l));
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
      const l = o.charCodeAt(a + 1);
      l >= 56320 && l <= 57343 ? (s += 4, a++) : s += 3;
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
}, { isFunction: er } = p, hl = (e) => encodeURIComponent(e).replace(
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
  const { fetch: o, Request: i, Response: s } = e, a = o ? er(o) : typeof fetch == "function", c = er(i), d = er(s);
  if (!a)
    return !1;
  const l = a && er(r), f = a && (typeof n == "function" ? /* @__PURE__ */ ((y) => (x) => y.encode(x))(new n()) : async (y) => new Uint8Array(await new i(y).arrayBuffer())), g = c && l && so(() => {
    let y = !1;
    const x = new i(Ee.origin, {
      body: new r(),
      method: "POST",
      get duplex() {
        return y = !0, "half";
      }
    }), _ = x.headers.has("Content-Type");
    return x.body != null && x.body.cancel(), y && !_;
  }), b = d && l && so(() => p.isReadableStream(new s("").body)), S = {
    stream: b && ((y) => y.body)
  };
  a && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((y) => {
    !S[y] && (S[y] = (x, _) => {
      let w = x && x[y];
      if (w)
        return w.call(x);
      throw new P(
        `Response type '${y}' is not supported`,
        P.ERR_NOT_SUPPORT,
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
  }, C = async (y, x) => {
    const _ = p.toFiniteNumber(y.getContentLength());
    return _ ?? h(x);
  };
  return async (y) => {
    let {
      url: x,
      method: _,
      data: w,
      signal: T,
      cancelToken: $,
      timeout: J,
      onDownloadProgress: V,
      onUploadProgress: M,
      responseType: j,
      headers: H,
      withCredentials: u = "same-origin",
      fetchOptions: F,
      maxContentLength: R,
      maxBodyLength: I,
      maxRedirects: ee
    } = ji(y);
    const le = p.isNumber(R) && R > -1, me = p.isNumber(I) && I > -1, Fe = (N) => p.hasOwnProp(y, N) ? y[N] : void 0;
    let v = o || fetch;
    j = j ? (j + "").toLowerCase() : "text";
    let k = rl(
      [T, $ && $.toAbortSignal()],
      J
    ), L = null;
    const B = k && k.unsubscribe && (() => {
      k.unsubscribe();
    });
    let W, Y = null;
    const q = () => new P(
      "Request body larger than maxBodyLength limit",
      P.ERR_BAD_REQUEST,
      y,
      L
    );
    try {
      let N;
      const z = Fe("auth");
      if (z) {
        const G = p.getSafeProp(z, "username") || "", se = p.getSafeProp(z, "password") || "";
        N = {
          username: G,
          password: se
        };
      }
      if (ml(x)) {
        const G = new URL(x, Ee.origin);
        if (!N && (G.username || G.password)) {
          const se = io(G.username), Ae = io(G.password);
          N = {
            username: se,
            password: Ae
          };
        }
        (G.username || G.password) && (G.username = "", G.password = "", x = G.href);
      }
      if (N && (H.delete("authorization"), H.set(
        "Authorization",
        "Basic " + btoa(hl((N.username || "") + ":" + (N.password || "")))
      )), le && typeof x == "string" && x.startsWith("data:") && fl(x) > R)
        throw new P(
          "maxContentLength size of " + R + " exceeded",
          P.ERR_BAD_RESPONSE,
          y,
          L
        );
      if (me && _ !== "get" && _ !== "head") {
        const G = await h(w);
        if (typeof G == "number" && isFinite(G) && (W = G, G > I))
          throw q();
      }
      const X = me && (p.isReadableStream(w) || p.isStream(w)), Z = (G, se, Ae) => to(
        G,
        oo,
        (Ie) => {
          if (me && Ie > I)
            throw Y = q();
          se && se(Ie);
        },
        Ae
      );
      if (g && _ !== "get" && _ !== "head" && (M || X)) {
        if (W = W ?? await C(H, w), W !== 0 || X) {
          let G = new i(x, {
            method: "POST",
            body: w,
            duplex: "half"
          }), se;
          if (p.isFormData(w) && (se = G.headers.get("content-type")) && H.setContentType(se), G.body) {
            const [Ae, Ie] = M && Xn(
              W,
              yr(Zn(M))
            ) || [];
            w = Z(G.body, Ae, Ie);
          }
        }
      } else if (X && !c && l && _ !== "get" && _ !== "head")
        w = Z(w);
      else if (X && c && !g && _ !== "get" && _ !== "head")
        throw new P(
          "Stream request bodies are not supported by the current fetch implementation",
          P.ERR_NOT_SUPPORT,
          y,
          L
        );
      p.isString(u) || (u = u ? "include" : "omit");
      const K = c && "credentials" in i.prototype;
      if (p.isFormData(w)) {
        const G = H.getContentType();
        G && /^multipart\/form-data/i.test(G) && !/boundary=/i.test(G) && H.delete("content-type");
      }
      H.set("User-Agent", "axios/" + Cn, !1);
      const O = F == null ? F : Object.assign(/* @__PURE__ */ Object.create(null), F);
      O && (delete O.body, delete O.headers, delete O.method, delete O.signal, delete O.duplex, delete O.credentials);
      const te = Object.assign(/* @__PURE__ */ Object.create(null), O, {
        signal: k,
        method: _.toUpperCase(),
        headers: vi(H.normalize()),
        body: w,
        duplex: "half",
        credentials: K ? u : void 0
      });
      c && (p.forEach(pl, (G, se) => {
        te[se] === void 0 && (te[se] = G);
      }), te.signal === void 0 && (te.signal = null), te.body === void 0 && (te.body = null)), ee === 0 && (te.redirect = "manual", O && (O.redirect = "manual")), L = c && new i(x, te);
      let we = await (c ? v(L, O) : v(x, te));
      const Je = Ce.from(we.headers);
      if (le) {
        const G = p.toFiniteNumber(Je.getContentLength());
        if (G != null && G > R)
          throw new P(
            "maxContentLength size of " + R + " exceeded",
            P.ERR_BAD_RESPONSE,
            y,
            L
          );
      }
      const Rt = b && (j === "stream" || j === "response");
      if (b && we.body && (V || le || Rt && B)) {
        const G = {};
        ["status", "statusText", "headers"].forEach((Ze) => {
          G[Ze] = we[Ze];
        });
        const se = p.toFiniteNumber(Je.getContentLength()), [Ae, Ie] = V && Xn(
          se,
          yr(Zn(V), !0)
        ) || [];
        let Xe = 0;
        const Mr = (Ze) => {
          if (le && (Xe = Ze, Xe > R))
            throw new P(
              "maxContentLength size of " + R + " exceeded",
              P.ERR_BAD_RESPONSE,
              y,
              L
            );
          Ae && Ae(Ze);
        };
        we = new s(
          to(we.body, oo, Mr, () => {
            Ie && Ie(), B && B();
          }),
          G
        );
      }
      j = j || "text";
      let Ne = await S[p.findKey(S, j) || "text"](
        we,
        y
      );
      if (le && !b && !Rt) {
        let G;
        if (Ne != null && (typeof Ne.byteLength == "number" ? G = Ne.byteLength : typeof Ne.size == "number" ? G = Ne.size : typeof Ne == "string" && (G = typeof n == "function" ? new n().encode(Ne).byteLength : Ne.length)), typeof G == "number" && G > R)
          throw new P(
            "maxContentLength size of " + R + " exceeded",
            P.ERR_BAD_RESPONSE,
            y,
            L
          );
      }
      return !Rt && B && B(), await new Promise((G, se) => {
        Fi(G, se, {
          data: Ne,
          headers: Ce.from(we.headers),
          status: we.status,
          statusText: we.statusText,
          config: y,
          request: L
        });
      });
    } catch (N) {
      if (B && B(), k && k.aborted && k.reason instanceof P) {
        const z = k.reason;
        throw z.config = y, L && (z.request = L), N !== z && Object.defineProperty(z, "cause", {
          __proto__: null,
          value: N,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), z;
      }
      if (Y)
        throw L && !Y.request && (Y.request = L), Y;
      if (N instanceof P)
        throw L && !N.request && (N.request = L), N;
      if (N && N.name === "TypeError" && /Load failed|fetch/i.test(N.message)) {
        const z = new P(
          "Network Error",
          P.ERR_NETWORK,
          y,
          L,
          N && N.response
        );
        throw Object.defineProperty(z, "cause", {
          __proto__: null,
          value: N.cause || N,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), z;
      }
      throw P.from(N, N && N.code, y, L, N && N.response);
    }
  };
}, yl = /* @__PURE__ */ new Map(), Vi = (e) => {
  let t = e && e.env || {};
  const { fetch: r, Request: n, Response: o } = t, i = [n, o, r];
  let s = i.length, a = s, c, d, l = yl;
  for (; a--; )
    c = i[a], d = l.get(c), d === void 0 && l.set(c, d = a ? /* @__PURE__ */ new Map() : gl(t)), l = d;
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
      throw new P(`Unknown adapter '${a}'`);
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
    throw new P(
      "There is no suitable adapter to dispatch the request " + a,
      P.ERR_NOT_SUPPORT
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
    throw new Jt(null, e);
}
function Kr(e) {
  const t = p.toSafeFlatObject(e);
  return qr(t), t.headers = Ce.from(p.getSafeProp(t, "headers")), t.data = Wr.call(t, t.transformRequest), ["post", "put", "patch"].indexOf(t.method) !== -1 && t.headers.setContentType("application/x-www-form-urlencoded", !1), Wi.getAdapter(t.adapter || Yt.adapter, t)(t).then(
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
const co = {};
Tr.transitional = function(t, r, n) {
  function o(i, s) {
    return "[Axios v" + Cn + "] Transitional option '" + i + "'" + s + (n ? ". " + n : "");
  }
  return (i, s, a) => {
    if (t === !1)
      throw new P(
        o(s, " has been removed" + (r ? " in " + r : "")),
        P.ERR_DEPRECATED
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
    throw new P("options must be an object", P.ERR_BAD_OPTION_VALUE);
  const n = Object.keys(e);
  let o = n.length;
  for (; o-- > 0; ) {
    const i = n[o], s = Object.prototype.hasOwnProperty.call(t, i) ? t[i] : void 0;
    if (s) {
      const a = e[i], c = a === void 0 || s(a, i, e);
      if (c !== !0)
        throw new P(
          "option " + i + " must be " + c,
          P.ERR_BAD_OPTION_VALUE
        );
      continue;
    }
    if (r !== !0)
      throw new P("Unknown option " + i, P.ERR_BAD_OPTION);
  }
}
const fr = {
  assertOptions: El,
  validators: Tr
}, Te = fr.validators;
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
    n !== void 0 && fr.assertOptions(
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
    } : fr.assertOptions(
      o,
      {
        encode: Te.function,
        serialize: Te.function
      },
      !0
    )), r.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? r.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : r.allowAbsoluteUrls = !0), fr.assertOptions(
      r,
      {
        baseUrl: Te.spelling("baseURL"),
        withXsrfToken: Te.spelling("withXSRFToken")
      },
      !0
    ), r.method = (p.getSafeProp(r, "method") || p.getSafeProp(this.defaults, "method") || "get").toLowerCase();
    let s = i && p.merge(i.common, i[r.method]);
    i && p.forEach(Di.concat("common"), (S) => {
      delete i[S];
    }), r.headers = Ce.concat(s, i);
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
    let l, f = 0, g;
    if (!c) {
      const S = [Kr.bind(this), void 0];
      for (S.unshift(...a), S.push(...d), g = S.length, l = Promise.resolve(r); f < g; )
        l = l.then(S[f++], S[f++]);
      return l;
    }
    g = a.length;
    let b = r;
    for (; f < g; ) {
      const S = a[f++], h = a[f++];
      try {
        b = S ? S(b) : b;
      } catch (C) {
        if (!h) {
          l = Promise.reject(C);
          break;
        }
        try {
          const y = h.call(this, C);
          p.isThenable(y) && (l = Promise.resolve(y).then(
            () => Kr.call(this, b)
          ));
        } catch (y) {
          l = Promise.reject(y);
        }
        break;
      }
    }
    if (!l)
      try {
        l = Kr.call(this, b);
      } catch (S) {
        l = Promise.reject(S);
      }
    for (f = 0, g = d.length; f < g; )
      l = l.then(d[f++], d[f++]);
    return l;
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
      n.reason || (n.reason = new Jt(i, s, a), r(n.reason));
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
const pr = {
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
Object.entries(pr).forEach(([e, t]) => {
  pr[t] === void 0 && (pr[t] = e);
});
function qi(e) {
  const t = new ct(e), r = gi(ct.prototype.request, t);
  return p.extend(r, ct.prototype, t, { allOwnKeys: !0 }), p.extend(r, t, null, { allOwnKeys: !0 }), r.create = function(o) {
    return qi(pt(e, o));
  }, r;
}
const ye = qi(Yt);
ye.Axios = ct;
ye.CanceledError = Jt;
ye.CancelToken = wl;
ye.isCancel = Mi;
ye.VERSION = Cn;
ye.toFormData = xr;
ye.AxiosError = P;
ye.Cancel = ye.CanceledError;
ye.all = function(t) {
  return Promise.all(t);
};
ye.spread = xl;
ye.isAxiosError = Tl;
ye.mergeConfig = pt;
ye.AxiosHeaders = Ce;
ye.formToJSON = (e) => Li(p.isHTMLForm(e) ? new FormData(e) : e);
ye.getAdapter = Wi.getAdapter;
ye.HttpStatusCode = pr;
ye.default = ye;
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
} = ye, Cl = [
  Se.ENDPOINTS.REFRESH,
  Se.ENDPOINTS.MAGIC_LINK_REQUEST,
  Se.ENDPOINTS.MAGIC_LINK_VERIFY,
  Se.ENDPOINTS.PASSKEY_LOGIN_OPTIONS,
  Se.ENDPOINTS.PASSKEY_LOGIN_VERIFY
], Ol = (e) => !!e && Cl.some((t) => e.split("?")[0].endsWith(t)), Rl = (e, t) => {
  const r = ye.create({
    baseURL: e,
    timeout: Se.DEFAULT_CONFIG.TIMEOUT,
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
      if (n.response?.status === Se.STATUS_CODES.UNAUTHORIZED && !o._retry && !Ol(o.url)) {
        o._retry = !0;
        try {
          const i = ze.getRefreshToken();
          if (!i)
            throw new Error(pa.NO_REFRESH_TOKEN);
          const s = await r.post(Se.ENDPOINTS.REFRESH, {
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
let tr = null;
const Ve = (e, t) => {
  if (!tr && e && (tr = Rl(e, t)), !tr)
    throw new Error("API client not initialized. Please provide baseURL.");
  return tr;
}, lo = (e, t) => e?.name === "NotAllowedError" ? "Passkey request was cancelled or timed out" : e?.name === "InvalidStateError" ? "A passkey for this account is already registered on this device" : e?.response?.data?.message || e?.message || t, Ge = {
  /**
   * Logout user and invalidate refresh token
   * @param refreshToken - The refresh token to invalidate
   * @returns Promise resolving when logout is complete
   */
  logout: async (e) => {
    try {
      await Ve().post(Se.ENDPOINTS.LOGOUT, {
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
      const r = await Ve().post(Se.ENDPOINTS.REFRESH, {
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
      const t = await Ve().get(Se.ENDPOINTS.USER_ME), r = t.data?.data ?? t.data;
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
      await Ve().post(Se.ENDPOINTS.MAGIC_LINK_REQUEST, {
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
      const r = await Ve().post(Se.ENDPOINTS.MAGIC_LINK_VERIFY, {
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
      const e = Ve(), t = await e.post(Se.ENDPOINTS.PASSKEY_LOGIN_OPTIONS), { challengeId: r, options: n } = t.data, o = await ta({ optionsJSON: n }), i = await e.post(
        Se.ENDPOINTS.PASSKEY_LOGIN_VERIFY,
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
      const t = Ve(), r = await t.post(Se.ENDPOINTS.PASSKEY_REGISTER_OPTIONS), { challengeId: n, options: o } = r.data, i = await Zs({ optionsJSON: o });
      return (await t.post(Se.ENDPOINTS.PASSKEY_REGISTER_VERIFY, {
        challengeId: n,
        response: i,
        name: e
      })).data;
    } catch (t) {
      throw new Error(lo(t, "Passkey registration failed"));
    }
  }
}, vl = [0, 45, 90, 135, 180, 225, 270, 315], Al = (e) => /* @__PURE__ */ D(Et, { ...e, viewBox: "0 0 24 24", children: [
  /* @__PURE__ */ m("circle", { cx: "12", cy: "12", r: "4.6", fill: "currentColor" }),
  vl.map((t) => /* @__PURE__ */ m(
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
  return /* @__PURE__ */ D(Et, { ...e, viewBox: "0 0 24 24", children: [
    /* @__PURE__ */ D("mask", { id: t, children: [
      /* @__PURE__ */ m("rect", { width: "24", height: "24", fill: "#fff" }),
      /* @__PURE__ */ m("circle", { cx: "15.8", cy: "8.2", r: "4.6", fill: "#000" })
    ] }),
    /* @__PURE__ */ m("circle", { cx: "12", cy: "12", r: "7.5", fill: "currentColor", mask: `url(#${t})` })
  ] });
}, kl = ({ title: e, height: t, color: r }) => /* @__PURE__ */ D(
  "svg",
  {
    role: "img",
    "aria-label": e,
    viewBox: "0 0 143 38",
    height: t,
    width: t * 143 / 38,
    style: { display: "block", fill: r, transition: hi },
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
), uo = ({
  brandConfig: e,
  theme: t,
  onToggleColorMode: r,
  showWelcome: n = !0
}) => {
  const o = t.mode === "dark" ? "light" : "dark";
  return /* @__PURE__ */ D(
    A,
    {
      component: "header",
      sx: { "& *": { transition: he } },
      children: [
        /* @__PURE__ */ D(
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
                kl,
                {
                  title: e.companyName || "Lumora Capital",
                  height: e.logoHeight,
                  color: t.logo
                }
              ),
              /* @__PURE__ */ m(
                Ns,
                {
                  title: `Switch to ${o} mode`,
                  slotProps: {
                    tooltip: { sx: { fontFamily: t.bodyFont } }
                  },
                  children: /* @__PURE__ */ D(
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
                        transition: he,
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
                          transition: `${qt("opacity")}, transform ${yn}ms ${xt}`
                        }
                      },
                      children: [
                        /* @__PURE__ */ m(
                          Al,
                          {
                            sx: {
                              color: "#de9733",
                              opacity: t.mode === "dark" ? 0 : 1,
                              transform: t.mode === "dark" ? "rotate(-90deg) scale(0.6)" : "none"
                            }
                          }
                        ),
                        /* @__PURE__ */ m(
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
        n && /* @__PURE__ */ D(Bn, { children: [
          /* @__PURE__ */ D(
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
                e.welcomeTitleAccent && /* @__PURE__ */ D(Bn, { children: [
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
}, fo = ({
  theme: e,
  icon: t,
  label: r,
  ariaLabel: n,
  loadingLabel: o = "Signing in...",
  isLoading: i = !1,
  disabled: s = !1,
  onClick: a
}) => /* @__PURE__ */ m(
  Ut,
  {
    fullWidth: !0,
    variant: "outlined",
    "aria-label": i ? o : n,
    startIcon: i ? /* @__PURE__ */ m(hn, { size: 18, color: "inherit" }) : t,
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
      transition: he,
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
), Pl = ({ monochrome: e = !1, ...t }) => /* @__PURE__ */ D(Et, { ...t, viewBox: "0 0 23 23", children: [
  /* @__PURE__ */ m("path", { fill: e ? "currentColor" : "#f35325", d: "M1 1h10v10H1z" }),
  /* @__PURE__ */ m("path", { fill: e ? "currentColor" : "#81bc06", d: "M12 1h10v10H12z" }),
  /* @__PURE__ */ m("path", { fill: e ? "currentColor" : "#05a6f0", d: "M1 12h10v10H1z" }),
  /* @__PURE__ */ m("path", { fill: e ? "currentColor" : "#ffba08", d: "M12 12h10v10H12z" })
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
        return { values: {}, errors: Ks((a = s, c = !i.shouldUseNativeValidation && i.criteriaMode === "all", (a.inner || []).reduce(function(d, l) {
          if (d[l.path] || (d[l.path] = { message: l.message, type: l.type }), c) {
            var f = d[l.path].types, g = f && f[l.type];
            d[l.path] = Ws(l.path, c, d, l.type, g ? [].concat(g, l.message) : l.message);
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
  return /* @__PURE__ */ D(A, { component: "form", noValidate: !0, onSubmit: i(n), children: [
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
    /* @__PURE__ */ D(A, { sx: { display: "flex", gap: 1.25 }, children: [
      /* @__PURE__ */ m(
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
            transition: he,
            "&.Mui-focused": {
              borderColor: e.accent,
              boxShadow: `0 0 0 3px ${e.accent}26`
            },
            "& input::placeholder": {
              color: e.placeholder,
              opacity: 1,
              transition: he
            }
          }
        }
      ),
      /* @__PURE__ */ m(
        Ut,
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
            transition: he,
            "&:hover": { backgroundColor: e.accentHover },
            ...mr(e),
            "&.Mui-disabled": {
              backgroundColor: e.accent,
              color: e.buttonText,
              opacity: 0.6
            }
          },
          children: t ? /* @__PURE__ */ m(hn, { size: 20, color: "inherit", "aria-label": "Sending sign-in link" }) : "Magic Link"
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
}, Ll = ({
  theme: e,
  title: t,
  description: r,
  onBackToLogin: n
}) => /* @__PURE__ */ D(A, { children: [
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
      children: /* @__PURE__ */ m(Us, {})
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
    Ut,
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
  for (var d = "", l; (l = mo.exec(o)) !== null; )
    d += "-" + l[1];
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
var rr = { exports: {} }, nr = { exports: {} }, re = {};
var go;
function Wl() {
  if (go) return re;
  go = 1;
  var e = typeof Symbol == "function" && Symbol.for, t = e ? /* @__PURE__ */ Symbol.for("react.element") : 60103, r = e ? /* @__PURE__ */ Symbol.for("react.portal") : 60106, n = e ? /* @__PURE__ */ Symbol.for("react.fragment") : 60107, o = e ? /* @__PURE__ */ Symbol.for("react.strict_mode") : 60108, i = e ? /* @__PURE__ */ Symbol.for("react.profiler") : 60114, s = e ? /* @__PURE__ */ Symbol.for("react.provider") : 60109, a = e ? /* @__PURE__ */ Symbol.for("react.context") : 60110, c = e ? /* @__PURE__ */ Symbol.for("react.async_mode") : 60111, d = e ? /* @__PURE__ */ Symbol.for("react.concurrent_mode") : 60111, l = e ? /* @__PURE__ */ Symbol.for("react.forward_ref") : 60112, f = e ? /* @__PURE__ */ Symbol.for("react.suspense") : 60113, g = e ? /* @__PURE__ */ Symbol.for("react.suspense_list") : 60120, b = e ? /* @__PURE__ */ Symbol.for("react.memo") : 60115, S = e ? /* @__PURE__ */ Symbol.for("react.lazy") : 60116, h = e ? /* @__PURE__ */ Symbol.for("react.block") : 60121, C = e ? /* @__PURE__ */ Symbol.for("react.fundamental") : 60117, y = e ? /* @__PURE__ */ Symbol.for("react.responder") : 60118, x = e ? /* @__PURE__ */ Symbol.for("react.scope") : 60119;
  function _(T) {
    if (typeof T == "object" && T !== null) {
      var $ = T.$$typeof;
      switch ($) {
        case t:
          switch (T = T.type, T) {
            case c:
            case d:
            case n:
            case i:
            case o:
            case f:
              return T;
            default:
              switch (T = T && T.$$typeof, T) {
                case a:
                case l:
                case S:
                case b:
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
  function w(T) {
    return _(T) === d;
  }
  return re.AsyncMode = c, re.ConcurrentMode = d, re.ContextConsumer = a, re.ContextProvider = s, re.Element = t, re.ForwardRef = l, re.Fragment = n, re.Lazy = S, re.Memo = b, re.Portal = r, re.Profiler = i, re.StrictMode = o, re.Suspense = f, re.isAsyncMode = function(T) {
    return w(T) || _(T) === c;
  }, re.isConcurrentMode = w, re.isContextConsumer = function(T) {
    return _(T) === a;
  }, re.isContextProvider = function(T) {
    return _(T) === s;
  }, re.isElement = function(T) {
    return typeof T == "object" && T !== null && T.$$typeof === t;
  }, re.isForwardRef = function(T) {
    return _(T) === l;
  }, re.isFragment = function(T) {
    return _(T) === n;
  }, re.isLazy = function(T) {
    return _(T) === S;
  }, re.isMemo = function(T) {
    return _(T) === b;
  }, re.isPortal = function(T) {
    return _(T) === r;
  }, re.isProfiler = function(T) {
    return _(T) === i;
  }, re.isStrictMode = function(T) {
    return _(T) === o;
  }, re.isSuspense = function(T) {
    return _(T) === f;
  }, re.isValidElementType = function(T) {
    return typeof T == "string" || typeof T == "function" || T === n || T === d || T === i || T === o || T === f || T === g || typeof T == "object" && T !== null && (T.$$typeof === S || T.$$typeof === b || T.$$typeof === s || T.$$typeof === a || T.$$typeof === l || T.$$typeof === C || T.$$typeof === y || T.$$typeof === x || T.$$typeof === h);
  }, re.typeOf = _, re;
}
var ne = {};
var yo;
function zl() {
  return yo || (yo = 1, process.env.NODE_ENV !== "production" && (function() {
    var e = typeof Symbol == "function" && Symbol.for, t = e ? /* @__PURE__ */ Symbol.for("react.element") : 60103, r = e ? /* @__PURE__ */ Symbol.for("react.portal") : 60106, n = e ? /* @__PURE__ */ Symbol.for("react.fragment") : 60107, o = e ? /* @__PURE__ */ Symbol.for("react.strict_mode") : 60108, i = e ? /* @__PURE__ */ Symbol.for("react.profiler") : 60114, s = e ? /* @__PURE__ */ Symbol.for("react.provider") : 60109, a = e ? /* @__PURE__ */ Symbol.for("react.context") : 60110, c = e ? /* @__PURE__ */ Symbol.for("react.async_mode") : 60111, d = e ? /* @__PURE__ */ Symbol.for("react.concurrent_mode") : 60111, l = e ? /* @__PURE__ */ Symbol.for("react.forward_ref") : 60112, f = e ? /* @__PURE__ */ Symbol.for("react.suspense") : 60113, g = e ? /* @__PURE__ */ Symbol.for("react.suspense_list") : 60120, b = e ? /* @__PURE__ */ Symbol.for("react.memo") : 60115, S = e ? /* @__PURE__ */ Symbol.for("react.lazy") : 60116, h = e ? /* @__PURE__ */ Symbol.for("react.block") : 60121, C = e ? /* @__PURE__ */ Symbol.for("react.fundamental") : 60117, y = e ? /* @__PURE__ */ Symbol.for("react.responder") : 60118, x = e ? /* @__PURE__ */ Symbol.for("react.scope") : 60119;
    function _(O) {
      return typeof O == "string" || typeof O == "function" || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
      O === n || O === d || O === i || O === o || O === f || O === g || typeof O == "object" && O !== null && (O.$$typeof === S || O.$$typeof === b || O.$$typeof === s || O.$$typeof === a || O.$$typeof === l || O.$$typeof === C || O.$$typeof === y || O.$$typeof === x || O.$$typeof === h);
    }
    function w(O) {
      if (typeof O == "object" && O !== null) {
        var te = O.$$typeof;
        switch (te) {
          case t:
            var we = O.type;
            switch (we) {
              case c:
              case d:
              case n:
              case i:
              case o:
              case f:
                return we;
              default:
                var Je = we && we.$$typeof;
                switch (Je) {
                  case a:
                  case l:
                  case S:
                  case b:
                  case s:
                    return Je;
                  default:
                    return te;
                }
            }
          case r:
            return te;
        }
      }
    }
    var T = c, $ = d, J = a, V = s, M = t, j = l, H = n, u = S, F = b, R = r, I = i, ee = o, le = f, me = !1;
    function Fe(O) {
      return me || (me = !0, console.warn("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 17+. Update your code to use ReactIs.isConcurrentMode() instead. It has the exact same API.")), v(O) || w(O) === c;
    }
    function v(O) {
      return w(O) === d;
    }
    function k(O) {
      return w(O) === a;
    }
    function L(O) {
      return w(O) === s;
    }
    function B(O) {
      return typeof O == "object" && O !== null && O.$$typeof === t;
    }
    function W(O) {
      return w(O) === l;
    }
    function Y(O) {
      return w(O) === n;
    }
    function q(O) {
      return w(O) === S;
    }
    function N(O) {
      return w(O) === b;
    }
    function z(O) {
      return w(O) === r;
    }
    function X(O) {
      return w(O) === i;
    }
    function Z(O) {
      return w(O) === o;
    }
    function K(O) {
      return w(O) === f;
    }
    ne.AsyncMode = T, ne.ConcurrentMode = $, ne.ContextConsumer = J, ne.ContextProvider = V, ne.Element = M, ne.ForwardRef = j, ne.Fragment = H, ne.Lazy = u, ne.Memo = F, ne.Portal = R, ne.Profiler = I, ne.StrictMode = ee, ne.Suspense = le, ne.isAsyncMode = Fe, ne.isConcurrentMode = v, ne.isContextConsumer = k, ne.isContextProvider = L, ne.isElement = B, ne.isForwardRef = W, ne.isFragment = Y, ne.isLazy = q, ne.isMemo = N, ne.isPortal = z, ne.isProfiler = X, ne.isStrictMode = Z, ne.isSuspense = K, ne.isValidElementType = _, ne.typeOf = w;
  })()), ne;
}
var bo;
function Gi() {
  return bo || (bo = 1, process.env.NODE_ENV === "production" ? nr.exports = Wl() : nr.exports = zl()), nr.exports;
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
      var c = Object.getOwnPropertyNames(s).map(function(l) {
        return s[l];
      });
      if (c.join("") !== "0123456789")
        return !1;
      var d = {};
      return "abcdefghijklmnopqrst".split("").forEach(function(l) {
        d[l] = l;
      }), Object.keys(Object.assign({}, d)).join("") === "abcdefghijklmnopqrst";
    } catch {
      return !1;
    }
  }
  return Yr = o() ? Object.assign : function(i, s) {
    for (var a, c = n(i), d, l = 1; l < arguments.length; l++) {
      a = Object(arguments[l]);
      for (var f in a)
        t.call(a, f) && (c[f] = a[f]);
      if (e) {
        d = e(a);
        for (var g = 0; g < d.length; g++)
          r.call(a, d[g]) && (c[d[g]] = a[d[g]]);
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
      for (var l in i)
        if (n(i, l)) {
          var f;
          try {
            if (typeof i[l] != "function") {
              var g = Error(
                (c || "React class") + ": " + a + " type `" + l + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof i[l] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`."
              );
              throw g.name = "Invariant Violation", g;
            }
            f = i[l](s, l, c, a, null, t);
          } catch (S) {
            f = S;
          }
          if (f && !(f instanceof Error) && e(
            (c || "React class") + ": type specification of " + a + " `" + l + "` is invalid; the type checker function must return `null` or an `Error` but returned a " + typeof f + ". You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument)."
          ), f instanceof Error && !(f.message in r)) {
            r[f.message] = !0;
            var b = d ? d() : "";
            e(
              "Failed " + a + " type: " + f.message + (b ?? "")
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
    var d = typeof Symbol == "function" && Symbol.iterator, l = "@@iterator";
    function f(v) {
      var k = v && (d && v[d] || v[l]);
      if (typeof k == "function")
        return k;
    }
    var g = "<<anonymous>>", b = {
      array: y("array"),
      bigint: y("bigint"),
      bool: y("boolean"),
      func: y("function"),
      number: y("number"),
      object: y("object"),
      string: y("string"),
      symbol: y("symbol"),
      any: x(),
      arrayOf: _,
      element: w(),
      elementType: T(),
      instanceOf: $,
      node: j(),
      objectOf: V,
      oneOf: J,
      oneOfType: M,
      shape: u,
      exact: F
    };
    function S(v, k) {
      return v === k ? v !== 0 || 1 / v === 1 / k : v !== v && k !== k;
    }
    function h(v, k) {
      this.message = v, this.data = k && typeof k == "object" ? k : {}, this.stack = "";
    }
    h.prototype = Error.prototype;
    function C(v) {
      if (process.env.NODE_ENV !== "production")
        var k = {}, L = 0;
      function B(Y, q, N, z, X, Z, K) {
        if (z = z || g, Z = Z || N, K !== r) {
          if (c) {
            var O = new Error(
              "Calling PropTypes validators directly is not supported by the `prop-types` package. Use `PropTypes.checkPropTypes()` to call them. Read more at http://fb.me/use-check-prop-types"
            );
            throw O.name = "Invariant Violation", O;
          } else if (process.env.NODE_ENV !== "production" && typeof console < "u") {
            var te = z + ":" + N;
            !k[te] && // Avoid spamming the console because they are often not actionable except for lib authors
            L < 3 && (i(
              "You are manually calling a React.PropTypes validation function for the `" + Z + "` prop on `" + z + "`. This is deprecated and will throw in the standalone `prop-types` package. You may be seeing this warning due to a third-party PropTypes library. See https://fb.me/react-warning-dont-call-proptypes for details."
            ), k[te] = !0, L++);
          }
        }
        return q[N] == null ? Y ? q[N] === null ? new h("The " + X + " `" + Z + "` is marked as required " + ("in `" + z + "`, but its value is `null`.")) : new h("The " + X + " `" + Z + "` is marked as required in " + ("`" + z + "`, but its value is `undefined`.")) : null : v(q, N, z, X, Z);
      }
      var W = B.bind(null, !1);
      return W.isRequired = B.bind(null, !0), W;
    }
    function y(v) {
      function k(L, B, W, Y, q, N) {
        var z = L[B], X = ee(z);
        if (X !== v) {
          var Z = le(z);
          return new h(
            "Invalid " + Y + " `" + q + "` of type " + ("`" + Z + "` supplied to `" + W + "`, expected ") + ("`" + v + "`."),
            { expectedType: v }
          );
        }
        return null;
      }
      return C(k);
    }
    function x() {
      return C(s);
    }
    function _(v) {
      function k(L, B, W, Y, q) {
        if (typeof v != "function")
          return new h("Property `" + q + "` of component `" + W + "` has invalid PropType notation inside arrayOf.");
        var N = L[B];
        if (!Array.isArray(N)) {
          var z = ee(N);
          return new h("Invalid " + Y + " `" + q + "` of type " + ("`" + z + "` supplied to `" + W + "`, expected an array."));
        }
        for (var X = 0; X < N.length; X++) {
          var Z = v(N, X, W, Y, q + "[" + X + "]", r);
          if (Z instanceof Error)
            return Z;
        }
        return null;
      }
      return C(k);
    }
    function w() {
      function v(k, L, B, W, Y) {
        var q = k[L];
        if (!a(q)) {
          var N = ee(q);
          return new h("Invalid " + W + " `" + Y + "` of type " + ("`" + N + "` supplied to `" + B + "`, expected a single ReactElement."));
        }
        return null;
      }
      return C(v);
    }
    function T() {
      function v(k, L, B, W, Y) {
        var q = k[L];
        if (!e.isValidElementType(q)) {
          var N = ee(q);
          return new h("Invalid " + W + " `" + Y + "` of type " + ("`" + N + "` supplied to `" + B + "`, expected a single ReactElement type."));
        }
        return null;
      }
      return C(v);
    }
    function $(v) {
      function k(L, B, W, Y, q) {
        if (!(L[B] instanceof v)) {
          var N = v.name || g, z = Fe(L[B]);
          return new h("Invalid " + Y + " `" + q + "` of type " + ("`" + z + "` supplied to `" + W + "`, expected ") + ("instance of `" + N + "`."));
        }
        return null;
      }
      return C(k);
    }
    function J(v) {
      if (!Array.isArray(v))
        return process.env.NODE_ENV !== "production" && (arguments.length > 1 ? i(
          "Invalid arguments supplied to oneOf, expected an array, got " + arguments.length + " arguments. A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z])."
        ) : i("Invalid argument supplied to oneOf, expected an array.")), s;
      function k(L, B, W, Y, q) {
        for (var N = L[B], z = 0; z < v.length; z++)
          if (S(N, v[z]))
            return null;
        var X = JSON.stringify(v, function(K, O) {
          var te = le(O);
          return te === "symbol" ? String(O) : O;
        });
        return new h("Invalid " + Y + " `" + q + "` of value `" + String(N) + "` " + ("supplied to `" + W + "`, expected one of " + X + "."));
      }
      return C(k);
    }
    function V(v) {
      function k(L, B, W, Y, q) {
        if (typeof v != "function")
          return new h("Property `" + q + "` of component `" + W + "` has invalid PropType notation inside objectOf.");
        var N = L[B], z = ee(N);
        if (z !== "object")
          return new h("Invalid " + Y + " `" + q + "` of type " + ("`" + z + "` supplied to `" + W + "`, expected an object."));
        for (var X in N)
          if (n(N, X)) {
            var Z = v(N, X, W, Y, q + "." + X, r);
            if (Z instanceof Error)
              return Z;
          }
        return null;
      }
      return C(k);
    }
    function M(v) {
      if (!Array.isArray(v))
        return process.env.NODE_ENV !== "production" && i("Invalid argument supplied to oneOfType, expected an instance of array."), s;
      for (var k = 0; k < v.length; k++) {
        var L = v[k];
        if (typeof L != "function")
          return i(
            "Invalid argument supplied to oneOfType. Expected an array of check functions, but received " + me(L) + " at index " + k + "."
          ), s;
      }
      function B(W, Y, q, N, z) {
        for (var X = [], Z = 0; Z < v.length; Z++) {
          var K = v[Z], O = K(W, Y, q, N, z, r);
          if (O == null)
            return null;
          O.data && n(O.data, "expectedType") && X.push(O.data.expectedType);
        }
        var te = X.length > 0 ? ", expected one of type [" + X.join(", ") + "]" : "";
        return new h("Invalid " + N + " `" + z + "` supplied to " + ("`" + q + "`" + te + "."));
      }
      return C(B);
    }
    function j() {
      function v(k, L, B, W, Y) {
        return R(k[L]) ? null : new h("Invalid " + W + " `" + Y + "` supplied to " + ("`" + B + "`, expected a ReactNode."));
      }
      return C(v);
    }
    function H(v, k, L, B, W) {
      return new h(
        (v || "React class") + ": " + k + " type `" + L + "." + B + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + W + "`."
      );
    }
    function u(v) {
      function k(L, B, W, Y, q) {
        var N = L[B], z = ee(N);
        if (z !== "object")
          return new h("Invalid " + Y + " `" + q + "` of type `" + z + "` " + ("supplied to `" + W + "`, expected `object`."));
        for (var X in v) {
          var Z = v[X];
          if (typeof Z != "function")
            return H(W, Y, q, X, le(Z));
          var K = Z(N, X, W, Y, q + "." + X, r);
          if (K)
            return K;
        }
        return null;
      }
      return C(k);
    }
    function F(v) {
      function k(L, B, W, Y, q) {
        var N = L[B], z = ee(N);
        if (z !== "object")
          return new h("Invalid " + Y + " `" + q + "` of type `" + z + "` " + ("supplied to `" + W + "`, expected `object`."));
        var X = t({}, L[B], v);
        for (var Z in X) {
          var K = v[Z];
          if (n(v, Z) && typeof K != "function")
            return H(W, Y, q, Z, le(K));
          if (!K)
            return new h(
              "Invalid " + Y + " `" + q + "` key `" + Z + "` supplied to `" + W + "`.\nBad object: " + JSON.stringify(L[B], null, "  ") + `
Valid keys: ` + JSON.stringify(Object.keys(v), null, "  ")
            );
          var O = K(N, Z, W, Y, q + "." + Z, r);
          if (O)
            return O;
        }
        return null;
      }
      return C(k);
    }
    function R(v) {
      switch (typeof v) {
        case "number":
        case "string":
        case "undefined":
          return !0;
        case "boolean":
          return !v;
        case "object":
          if (Array.isArray(v))
            return v.every(R);
          if (v === null || a(v))
            return !0;
          var k = f(v);
          if (k) {
            var L = k.call(v), B;
            if (k !== v.entries) {
              for (; !(B = L.next()).done; )
                if (!R(B.value))
                  return !1;
            } else
              for (; !(B = L.next()).done; ) {
                var W = B.value;
                if (W && !R(W[1]))
                  return !1;
              }
          } else
            return !1;
          return !0;
        default:
          return !1;
      }
    }
    function I(v, k) {
      return v === "symbol" ? !0 : k ? k["@@toStringTag"] === "Symbol" || typeof Symbol == "function" && k instanceof Symbol : !1;
    }
    function ee(v) {
      var k = typeof v;
      return Array.isArray(v) ? "array" : v instanceof RegExp ? "object" : I(k, v) ? "symbol" : k;
    }
    function le(v) {
      if (typeof v > "u" || v === null)
        return "" + v;
      var k = ee(v);
      if (k === "object") {
        if (v instanceof Date)
          return "date";
        if (v instanceof RegExp)
          return "regexp";
      }
      return k;
    }
    function me(v) {
      var k = le(v);
      switch (k) {
        case "array":
        case "object":
          return "an " + k;
        case "boolean":
        case "date":
        case "regexp":
          return "a " + k;
        default:
          return k;
      }
    }
    function Fe(v) {
      return !v.constructor || !v.constructor.name ? g : v.constructor.name;
    }
    return b.checkPropTypes = o, b.resetWarningCache = o.resetWarningCache, b.PropTypes = b, b;
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
    function n(s, a, c, d, l, f) {
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
var Oo;
function Jl() {
  if (Oo) return rr.exports;
  if (Oo = 1, process.env.NODE_ENV !== "production") {
    var e = Gi(), t = !0;
    rr.exports = /* @__PURE__ */ Gl()(e.isElement, t);
  } else
    rr.exports = /* @__PURE__ */ Yl()();
  return rr.exports;
}
var Xl = /* @__PURE__ */ Jl();
const U = /* @__PURE__ */ Vl(Xl);
function Zl(e) {
  return e == null || Object.keys(e).length === 0;
}
function vn(e) {
  const {
    styles: t,
    defaultTheme: r = {}
  } = e;
  return /* @__PURE__ */ m(Vs, {
    styles: typeof t == "function" ? (o) => t(Zl(o) ? r : o) : t
  });
}
process.env.NODE_ENV !== "production" && (vn.propTypes = {
  defaultTheme: U.object,
  styles: U.oneOfType([U.array, U.string, U.object, U.func])
});
const Ro = [];
function Ql(e) {
  return Ro[0] = e, Hl(Ro);
}
var or = { exports: {} }, ae = {};
var vo;
function eu() {
  if (vo) return ae;
  vo = 1;
  var e = /* @__PURE__ */ Symbol.for("react.transitional.element"), t = /* @__PURE__ */ Symbol.for("react.portal"), r = /* @__PURE__ */ Symbol.for("react.fragment"), n = /* @__PURE__ */ Symbol.for("react.strict_mode"), o = /* @__PURE__ */ Symbol.for("react.profiler"), i = /* @__PURE__ */ Symbol.for("react.consumer"), s = /* @__PURE__ */ Symbol.for("react.context"), a = /* @__PURE__ */ Symbol.for("react.forward_ref"), c = /* @__PURE__ */ Symbol.for("react.suspense"), d = /* @__PURE__ */ Symbol.for("react.suspense_list"), l = /* @__PURE__ */ Symbol.for("react.memo"), f = /* @__PURE__ */ Symbol.for("react.lazy"), g = /* @__PURE__ */ Symbol.for("react.view_transition"), b = /* @__PURE__ */ Symbol.for("react.client.reference");
  function S(h) {
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
            case g:
              return h;
            default:
              switch (h = h && h.$$typeof, h) {
                case s:
                case a:
                case f:
                case l:
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
  return ae.ContextConsumer = i, ae.ContextProvider = s, ae.Element = e, ae.ForwardRef = a, ae.Fragment = r, ae.Lazy = f, ae.Memo = l, ae.Portal = t, ae.Profiler = o, ae.StrictMode = n, ae.Suspense = c, ae.SuspenseList = d, ae.isContextConsumer = function(h) {
    return S(h) === i;
  }, ae.isContextProvider = function(h) {
    return S(h) === s;
  }, ae.isElement = function(h) {
    return typeof h == "object" && h !== null && h.$$typeof === e;
  }, ae.isForwardRef = function(h) {
    return S(h) === a;
  }, ae.isFragment = function(h) {
    return S(h) === r;
  }, ae.isLazy = function(h) {
    return S(h) === f;
  }, ae.isMemo = function(h) {
    return S(h) === l;
  }, ae.isPortal = function(h) {
    return S(h) === t;
  }, ae.isProfiler = function(h) {
    return S(h) === o;
  }, ae.isStrictMode = function(h) {
    return S(h) === n;
  }, ae.isSuspense = function(h) {
    return S(h) === c;
  }, ae.isSuspenseList = function(h) {
    return S(h) === d;
  }, ae.isValidElementType = function(h) {
    return typeof h == "string" || typeof h == "function" || h === r || h === o || h === n || h === c || h === d || typeof h == "object" && h !== null && (h.$$typeof === f || h.$$typeof === l || h.$$typeof === s || h.$$typeof === i || h.$$typeof === a || h.$$typeof === b || h.getModuleId !== void 0);
  }, ae.typeOf = S, ae;
}
var ce = {};
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
              case l:
              case b:
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
                    return C;
                }
            }
          case r:
            return C;
        }
      }
    }
    var t = /* @__PURE__ */ Symbol.for("react.transitional.element"), r = /* @__PURE__ */ Symbol.for("react.portal"), n = /* @__PURE__ */ Symbol.for("react.fragment"), o = /* @__PURE__ */ Symbol.for("react.strict_mode"), i = /* @__PURE__ */ Symbol.for("react.profiler"), s = /* @__PURE__ */ Symbol.for("react.consumer"), a = /* @__PURE__ */ Symbol.for("react.context"), c = /* @__PURE__ */ Symbol.for("react.forward_ref"), d = /* @__PURE__ */ Symbol.for("react.suspense"), l = /* @__PURE__ */ Symbol.for("react.suspense_list"), f = /* @__PURE__ */ Symbol.for("react.memo"), g = /* @__PURE__ */ Symbol.for("react.lazy"), b = /* @__PURE__ */ Symbol.for("react.view_transition"), S = /* @__PURE__ */ Symbol.for("react.client.reference");
    ce.ContextConsumer = s, ce.ContextProvider = a, ce.Element = t, ce.ForwardRef = c, ce.Fragment = n, ce.Lazy = g, ce.Memo = f, ce.Portal = r, ce.Profiler = i, ce.StrictMode = o, ce.Suspense = d, ce.SuspenseList = l, ce.isContextConsumer = function(h) {
      return e(h) === s;
    }, ce.isContextProvider = function(h) {
      return e(h) === a;
    }, ce.isElement = function(h) {
      return typeof h == "object" && h !== null && h.$$typeof === t;
    }, ce.isForwardRef = function(h) {
      return e(h) === c;
    }, ce.isFragment = function(h) {
      return e(h) === n;
    }, ce.isLazy = function(h) {
      return e(h) === g;
    }, ce.isMemo = function(h) {
      return e(h) === f;
    }, ce.isPortal = function(h) {
      return e(h) === r;
    }, ce.isProfiler = function(h) {
      return e(h) === i;
    }, ce.isStrictMode = function(h) {
      return e(h) === o;
    }, ce.isSuspense = function(h) {
      return e(h) === d;
    }, ce.isSuspenseList = function(h) {
      return e(h) === l;
    }, ce.isValidElementType = function(h) {
      return typeof h == "string" || typeof h == "function" || h === n || h === i || h === o || h === d || h === l || typeof h == "object" && h !== null && (h.$$typeof === g || h.$$typeof === f || h.$$typeof === a || h.$$typeof === s || h.$$typeof === c || h.$$typeof === S || h.getModuleId !== void 0);
    }, ce.typeOf = e;
  })()), ce;
}
var _o;
function ru() {
  return _o || (_o = 1, process.env.NODE_ENV === "production" ? or.exports = /* @__PURE__ */ eu() : or.exports = /* @__PURE__ */ tu()), or.exports;
}
var Ji = /* @__PURE__ */ ru();
function Qe(e) {
  if (typeof e != "object" || e === null)
    return !1;
  const t = Object.getPrototypeOf(e);
  return (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) && !(Symbol.toStringTag in e) && !(Symbol.iterator in e);
}
function Xi(e) {
  if (/* @__PURE__ */ Q.isValidElement(e) || Ji.isValidElementType(e) || !Qe(e))
    return e;
  const t = {};
  return Object.keys(e).forEach((r) => {
    t[r] = Xi(e[r]);
  }), t;
}
function Pe(e, t, r = {
  clone: !0
}) {
  const n = r.clone ? {
    ...e
  } : e;
  return Qe(e) && Qe(t) && Object.keys(t).forEach((o) => {
    /* @__PURE__ */ Q.isValidElement(t[o]) || Ji.isValidElementType(t[o]) ? n[o] = t[o] : Qe(t[o]) && // Avoid prototype pollution
    Object.prototype.hasOwnProperty.call(e, o) && Qe(e[o]) ? n[o] = Pe(e[o], t[o], r) : r.clone ? n[o] = Qe(t[o]) ? Xi(t[o]) : t[o] : n[o] = t[o];
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
  function a(g) {
    return `@media (min-width:${typeof t[g] == "number" ? t[g] : g}${r})`;
  }
  function c(g) {
    return `@media (max-width:${(typeof t[g] == "number" ? t[g] : g) - n / 100}${r})`;
  }
  function d(g, b) {
    const S = s.indexOf(b);
    return `@media (min-width:${typeof t[g] == "number" ? t[g] : g}${r}) and (max-width:${(S !== -1 && typeof t[s[S]] == "number" ? t[s[S]] : b) - n / 100}${r})`;
  }
  function l(g) {
    return s.indexOf(g) + 1 < s.length ? d(g, s[s.indexOf(g) + 1]) : a(g);
  }
  function f(g) {
    const b = s.indexOf(g);
    return b === 0 ? a(s[1]) : b === s.length - 1 ? c(s[b]) : d(g, s[s.indexOf(g) + 1]).replace("@media", "@media not all and");
  }
  return {
    keys: s,
    values: i,
    up: a,
    down: c,
    between: d,
    only: l,
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
For example, \`@sm\` or \`@600\` or \`@40rem/sidebar\`.` : rt(18, `(${t})`));
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
}, ot = process.env.NODE_ENV !== "production" ? U.oneOfType([U.number, U.string, U.object, U.array]) : {};
function Bt(e, t) {
  return t ? Pe(e, t, {
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
function Ye(e, t, r) {
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
function be(e) {
  const {
    prop: t,
    cssProperty: r = e.prop,
    themeKey: n,
    transform: o
  } = e, i = (s) => {
    if (s[t] == null)
      return null;
    const a = s[t], c = s.theme, d = Or(c, n) || {};
    return Ye(s, a, (f) => {
      let g = Sr(d, o, f);
      return f === g && typeof f == "string" && (g = Sr(d, o, `${t}${f === "default" ? "" : Zi(f)}`, f)), r === !1 ? g : {
        [r]: g
      };
    });
  };
  return i.propTypes = process.env.NODE_ENV !== "production" ? {
    [t]: ot
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
function Xt(e, t, r, n) {
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
  return Xt(e, "spacing", 8, "spacing");
}
function Zt(e, t) {
  return typeof t == "string" || t == null ? t : e(t);
}
function gu(e, t) {
  return (r) => e.reduce((n, o) => (n[o] = Zt(t, r), n), {});
}
function yu(e, t, r, n) {
  if (!t.includes(r))
    return null;
  const o = hu(r), i = gu(o, n), s = e[r];
  return Ye(e, s, i);
}
function Qi(e, t) {
  const r = An(e.theme);
  return Object.keys(e).map((n) => yu(e, t, n, r)).reduce(Bt, {});
}
function fe(e) {
  return Qi(e, Rr);
}
fe.propTypes = process.env.NODE_ENV !== "production" ? Rr.reduce((e, t) => (e[t] = ot, e), {}) : {};
fe.filterProps = Rr;
function pe(e) {
  return Qi(e, vr);
}
pe.propTypes = process.env.NODE_ENV !== "production" ? vr.reduce((e, t) => (e[t] = ot, e), {}) : {};
pe.filterProps = vr;
process.env.NODE_ENV !== "production" && mu.reduce((e, t) => (e[t] = ot, e), {});
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
  }), n), {}), r = (n) => Object.keys(n).reduce((o, i) => t[i] ? Bt(o, t[i](n)) : o, {});
  return r.propTypes = process.env.NODE_ENV !== "production" ? e.reduce((n, o) => Object.assign(n, o.propTypes), {}) : {}, r.filterProps = e.reduce((n, o) => n.concat(o.filterProps), []), r;
}
function Le(e) {
  return typeof e != "number" ? e : `${e}px solid`;
}
function Me(e, t) {
  return be({
    prop: e,
    themeKey: "borders",
    transform: t
  });
}
const bu = Me("border", Le), Su = Me("borderTop", Le), Eu = Me("borderRight", Le), wu = Me("borderBottom", Le), xu = Me("borderLeft", Le), Tu = Me("borderColor"), Cu = Me("borderTopColor"), Ou = Me("borderRightColor"), Ru = Me("borderBottomColor"), vu = Me("borderLeftColor"), Au = Me("outline", Le), _u = Me("outlineColor"), _r = (e) => {
  if (e.borderRadius !== void 0 && e.borderRadius !== null) {
    const t = Xt(e.theme, "shape.borderRadius", 4, "borderRadius"), r = (n) => ({
      borderRadius: Zt(t, n)
    });
    return Ye(e, e.borderRadius, r);
  }
  return null;
};
_r.propTypes = process.env.NODE_ENV !== "production" ? {
  borderRadius: ot
} : {};
_r.filterProps = ["borderRadius"];
Ar(bu, Su, Eu, wu, xu, Tu, Cu, Ou, Ru, vu, _r, Au, _u);
const kr = (e) => {
  if (e.gap !== void 0 && e.gap !== null) {
    const t = Xt(e.theme, "spacing", 8, "gap"), r = (n) => ({
      gap: Zt(t, n)
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
    const t = Xt(e.theme, "spacing", 8, "columnGap"), r = (n) => ({
      columnGap: Zt(t, n)
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
    const t = Xt(e.theme, "spacing", 8, "rowGap"), r = (n) => ({
      rowGap: Zt(t, n)
    });
    return Ye(e, e.rowGap, r);
  }
  return null;
};
Nr.propTypes = process.env.NODE_ENV !== "production" ? {
  rowGap: ot
} : {};
Nr.filterProps = ["rowGap"];
const ku = be({
  prop: "gridColumn"
}), Pu = be({
  prop: "gridRow"
}), Nu = be({
  prop: "gridAutoFlow"
}), Iu = be({
  prop: "gridAutoColumns"
}), $u = be({
  prop: "gridAutoRows"
}), Lu = be({
  prop: "gridTemplateColumns"
}), Du = be({
  prop: "gridTemplateRows"
}), Mu = be({
  prop: "gridTemplateAreas"
}), Fu = be({
  prop: "gridArea"
});
Ar(kr, Pr, Nr, ku, Pu, Nu, Iu, $u, Lu, Du, Mu, Fu);
function Tt(e, t) {
  return t === "grey" ? t : e;
}
const Bu = be({
  prop: "color",
  themeKey: "palette",
  transform: Tt
}), Uu = be({
  prop: "bgcolor",
  cssProperty: "backgroundColor",
  themeKey: "palette",
  transform: Tt
}), ju = be({
  prop: "backgroundColor",
  themeKey: "palette",
  transform: Tt
});
Ar(Bu, Uu, ju);
function _e(e) {
  return e <= 1 && e !== 0 ? `${e * 100}%` : e;
}
const Hu = be({
  prop: "width",
  transform: _e
}), _n = (e) => {
  if (e.maxWidth !== void 0 && e.maxWidth !== null) {
    const t = (r) => {
      const n = e.theme?.breakpoints?.values?.[r] || Cr[r];
      return n ? e.theme?.breakpoints?.unit !== "px" ? {
        maxWidth: `${n}${e.theme.breakpoints.unit}`
      } : {
        maxWidth: n
      } : {
        maxWidth: _e(r)
      };
    };
    return Ye(e, e.maxWidth, t);
  }
  return null;
};
_n.filterProps = ["maxWidth"];
const Vu = be({
  prop: "minWidth",
  transform: _e
}), Wu = be({
  prop: "height",
  transform: _e
}), zu = be({
  prop: "maxHeight",
  transform: _e
}), qu = be({
  prop: "minHeight",
  transform: _e
});
be({
  prop: "size",
  cssProperty: "width",
  transform: _e
});
be({
  prop: "size",
  cssProperty: "height",
  transform: _e
});
const Ku = be({
  prop: "boxSizing"
});
Ar(Hu, _n, Vu, Wu, zu, qu, Ku);
const Ir = {
  // borders
  border: {
    themeKey: "borders",
    transform: Le
  },
  borderTop: {
    themeKey: "borders",
    transform: Le
  },
  borderRight: {
    themeKey: "borders",
    transform: Le
  },
  borderBottom: {
    themeKey: "borders",
    transform: Le
  },
  borderLeft: {
    themeKey: "borders",
    transform: Le
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
    transform: Le
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
    style: pe
  },
  pt: {
    style: pe
  },
  pr: {
    style: pe
  },
  pb: {
    style: pe
  },
  pl: {
    style: pe
  },
  px: {
    style: pe
  },
  py: {
    style: pe
  },
  padding: {
    style: pe
  },
  paddingTop: {
    style: pe
  },
  paddingRight: {
    style: pe
  },
  paddingBottom: {
    style: pe
  },
  paddingLeft: {
    style: pe
  },
  paddingX: {
    style: pe
  },
  paddingY: {
    style: pe
  },
  paddingInline: {
    style: pe
  },
  paddingInlineStart: {
    style: pe
  },
  paddingInlineEnd: {
    style: pe
  },
  paddingBlock: {
    style: pe
  },
  paddingBlockStart: {
    style: pe
  },
  paddingBlockEnd: {
    style: pe
  },
  m: {
    style: fe
  },
  mt: {
    style: fe
  },
  mr: {
    style: fe
  },
  mb: {
    style: fe
  },
  ml: {
    style: fe
  },
  mx: {
    style: fe
  },
  my: {
    style: fe
  },
  margin: {
    style: fe
  },
  marginTop: {
    style: fe
  },
  marginRight: {
    style: fe
  },
  marginBottom: {
    style: fe
  },
  marginLeft: {
    style: fe
  },
  marginX: {
    style: fe
  },
  marginY: {
    style: fe
  },
  marginInline: {
    style: fe
  },
  marginInlineStart: {
    style: fe
  },
  marginInlineEnd: {
    style: fe
  },
  marginBlock: {
    style: fe
  },
  marginBlockStart: {
    style: fe
  },
  marginBlockEnd: {
    style: fe
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
    transform: _e
  },
  maxWidth: {
    style: _n
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
      transform: l,
      style: f
    } = a;
    if (n == null)
      return null;
    if (d === "typography" && n === "inherit")
      return {
        [r]: n
      };
    const g = Or(o, d) || {};
    return f ? f(s) : Ye(s, n, (S) => {
      let h = Sr(g, l, S);
      return S === h && typeof S == "string" && (h = Sr(g, l, `${r}${S === "default" ? "" : Zi(S)}`, S)), c === !1 ? h : {
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
      const l = uu(o.breakpoints), f = Object.keys(l);
      let g = l;
      return Object.keys(d).forEach((b) => {
        const S = Yu(d[b], o);
        if (S != null)
          if (typeof S == "object")
            if (s[b])
              g = Bt(g, e(b, S, o, s));
            else {
              const h = Ye({
                theme: o
              }, S, (C) => ({
                [b]: C
              }));
              Gu(h, S) ? g[b] = t({
                sx: S,
                theme: o,
                nested: !0
              }) : g = Bt(g, h);
            }
          else
            g = Bt(g, e(b, S, o, s));
      }), !i && o.modularCssLayers ? {
        "@layer sx": ko(o, No(f, g))
      } : ko(o, No(f, g));
    }
    return Array.isArray(n) ? n.map(a) : a(n);
  }
  return t;
}
const Qt = Ju();
Qt.filterProps = ["sx"];
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
  let d = Pe({
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
  return d = au(d), d.applyStyles = Xu, d = t.reduce((l, f) => Pe(l, f), d), d.unstable_sxConfig = {
    ...Ir,
    ...s?.unstable_sxConfig
  }, d.unstable_sx = function(f) {
    return Qt({
      sx: f,
      theme: this
    });
  }, d;
}
function Zu(e) {
  return Object.keys(e).length === 0;
}
function kn(e = null) {
  const t = Q.useContext(ai);
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
  return o.modularCssLayers && (Array.isArray(i) ? i = i.map((s) => tn(typeof s == "function" ? s(o) : s)) : i = tn(i)), /* @__PURE__ */ m(vn, {
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
const os = typeof window < "u" ? Q.useLayoutEffect : Q.useEffect;
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
function nt(e) {
  if (e.type)
    return e;
  if (e.charAt(0) === "#")
    return nt(id(e));
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
const sd = (e) => {
  const t = nt(e);
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
  e = nt(e);
  const {
    values: t
  } = e, r = t[0], n = t[1] / 100, o = t[2] / 100, i = n * Math.min(o, 1 - o), s = (d, l = (d + r / 30) % 12) => o - i * Math.max(Math.min(l - 3, 9 - l, 1), -1);
  let a = "rgb";
  const c = [Math.round(s(0) * 255), Math.round(s(8) * 255), Math.round(s(4) * 255)];
  return e.type === "hsla" && (a += "a", c.push(t[3])), $r({
    type: a,
    values: c
  });
}
function ln(e) {
  e = nt(e);
  let t = e.type === "hsl" || e.type === "hsla" ? nt(is(e)).values : e.values;
  return t = t.map((r) => (e.type !== "color" && (r /= 255), r <= 0.03928 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4)), Number((0.2126 * t[0] + 0.7152 * t[1] + 0.0722 * t[2]).toFixed(3));
}
function Lo(e, t) {
  const r = ln(e), n = ln(t);
  return (Math.max(r, n) + 0.05) / (Math.min(r, n) + 0.05);
}
function ss(e, t) {
  return e = nt(e), t = Pn(t), (e.type === "rgb" || e.type === "hsl") && (e.type += "a"), e.type === "color" ? e.values[3] = `/${t}` : e.values[3] = t, $r(e);
}
function it(e, t, r) {
  try {
    return ss(e, t);
  } catch {
    return r && process.env.NODE_ENV !== "production" && console.warn(r), e;
  }
}
function Lr(e, t) {
  if (e = nt(e), t = Pn(t), e.type.includes("hsl"))
    e.values[2] *= 1 - t;
  else if (e.type.includes("rgb") || e.type.includes("color"))
    for (let r = 0; r < 3; r += 1)
      e.values[r] *= 1 - t;
  return $r(e);
}
function oe(e, t, r) {
  try {
    return Lr(e, t);
  } catch {
    return r && process.env.NODE_ENV !== "production" && console.warn(r), e;
  }
}
function Dr(e, t) {
  if (e = nt(e), t = Pn(t), e.type.includes("hsl"))
    e.values[2] += (100 - e.values[2]) * t;
  else if (e.type.includes("rgb"))
    for (let r = 0; r < 3; r += 1)
      e.values[r] += (255 - e.values[r]) * t;
  else if (e.type.includes("color"))
    for (let r = 0; r < 3; r += 1)
      e.values[r] += (1 - e.values[r]) * t;
  return $r(e);
}
function ie(e, t, r) {
  try {
    return Dr(e, t);
  } catch {
    return r && process.env.NODE_ENV !== "production" && console.warn(r), e;
  }
}
function ad(e, t = 0.15) {
  return ln(e) > 0.5 ? Lr(e, t) : Dr(e, t);
}
function ir(e, t, r) {
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
const Nn = /* @__PURE__ */ Q.createContext(null);
process.env.NODE_ENV !== "production" && (Nn.displayName = "ThemeContext");
function In() {
  const e = Q.useContext(Nn);
  return process.env.NODE_ENV !== "production" && Q.useDebugValue(e), e;
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
  const o = Q.useMemo(() => {
    const i = n === null ? {
      ...r
    } : dd(n, r);
    return i != null && (i[ud] = n !== null), i;
  }, [r, n]);
  return /* @__PURE__ */ m(Nn.Provider, {
    value: o,
    children: t
  });
}
process.env.NODE_ENV !== "production" && (Er.propTypes = {
  /**
   * Your component tree.
   */
  children: U.node,
  /**
   * A theme object. You can provide a function to extend the outer theme.
   */
  theme: U.oneOfType([U.object, U.func]).isRequired
});
process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "production" && (Er.propTypes = as(Er.propTypes));
const fd = /* @__PURE__ */ Q.createContext();
function cs({
  value: e,
  ...t
}) {
  return /* @__PURE__ */ m(fd.Provider, {
    value: e ?? !0,
    ...t
  });
}
process.env.NODE_ENV !== "production" && (cs.propTypes = {
  children: U.node,
  value: U.bool
});
const pd = /* @__PURE__ */ Q.createContext(void 0);
function ls({
  value: e,
  children: t
}) {
  return /* @__PURE__ */ m(pd.Provider, {
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
  children: U.node,
  /**
   * @ignore
   */
  value: U.object
});
let Do = 0;
function hd(e) {
  const [t, r] = Q.useState(e), n = e || t;
  return Q.useEffect(() => {
    t == null && (Do += 1, r(`mui-${Do}`));
  }, [t]), n;
}
const md = {
  ...Q
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
  }, [o, r]), o ? /* @__PURE__ */ m(ns, {
    styles: o
  }) : null;
}
const Fo = {};
function Bo(e, t, r, n = !1) {
  return Q.useMemo(() => {
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
function Vt(e) {
  const {
    children: t,
    theme: r,
    themeId: n
  } = e, o = kn(Fo), i = In() || Fo;
  process.env.NODE_ENV !== "production" && (o === null && typeof r == "function" || n && o && !o[n] && typeof r == "function") && console.error(["MUI: You are providing a theme function prop to the ThemeProvider component:", "<ThemeProvider theme={outerTheme => outerTheme} />", "", "However, no outer theme is present.", "Make sure a theme is already injected higher in the React tree or provide a theme object."].join(`
`));
  const s = Bo(n, o, r), a = Bo(n, i, r, !0), c = (n ? s[n] : s).direction === "rtl", d = yd(s);
  return /* @__PURE__ */ m(Er, {
    theme: a,
    children: /* @__PURE__ */ m(ai.Provider, {
      value: s,
      children: /* @__PURE__ */ m(cs, {
        value: c,
        children: /* @__PURE__ */ D(ls, {
          value: n ? s[n].components : s.components,
          children: [d, t]
        })
      })
    })
  });
}
process.env.NODE_ENV !== "production" && (Vt.propTypes = {
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
process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "production" && (Vt.propTypes = as(Vt.propTypes));
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
  let d = "", l = s;
  if (s === "class" && (l = ".%s"), s === "data" && (l = "[data-%s]"), l.startsWith(".")) {
    const g = l.substring(1);
    d += `${a}.classList.remove('${g}'.replace('%s', light), '${g}'.replace('%s', dark));
      ${a}.classList.add('${g}'.replace('%s', colorScheme));`;
  }
  const f = l.match(/\[([^[\]]+)\]/);
  if (f) {
    const [g, b] = f[1].split("=");
    b || (d += `${a}.removeAttribute('${g}'.replace('%s', light));
      ${a}.removeAttribute('${g}'.replace('%s', dark));`), d += `
      ${a}.setAttribute('${g}'.replace('%s', colorScheme), ${b ? `${b}.replace('%s', colorScheme)` : '""'});`;
  } else l !== ".%s" && (d += `${a}.setAttribute('${l}', colorScheme);`);
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
  } = e, l = o.join(","), f = o.length > 1, g = Q.useMemo(() => c?.({
    key: i,
    storageWindow: a
  }), [c, i, a]), b = Q.useMemo(() => c?.({
    key: `${s}-light`,
    storageWindow: a
  }), [c, s, a]), S = Q.useMemo(() => c?.({
    key: `${s}-dark`,
    storageWindow: a
  }), [c, s, a]), [h, C] = Q.useState(() => {
    const V = g?.get(t) || t, M = b?.get(r) || r, j = S?.get(n) || n;
    return {
      mode: V,
      systemMode: Uo(V),
      lightColorScheme: M,
      darkColorScheme: j
    };
  }), [y, x] = Q.useState(d || !f);
  Q.useEffect(() => {
    x(!0);
  }, []);
  const _ = xd(h), w = Q.useCallback((V) => {
    C((M) => {
      if (V === M.mode)
        return M;
      const j = V ?? t;
      return g?.set(j), {
        ...M,
        mode: j,
        systemMode: Uo(j)
      };
    });
  }, [g, t]), T = Q.useCallback((V) => {
    V ? typeof V == "string" ? V && !l.includes(V) ? console.error(`\`${V}\` does not exist in \`theme.colorSchemes\`.`) : C((M) => {
      const j = {
        ...M
      };
      return us(M, (H) => {
        H === "light" && (b?.set(V), j.lightColorScheme = V), H === "dark" && (S?.set(V), j.darkColorScheme = V);
      }), j;
    }) : C((M) => {
      const j = {
        ...M
      }, H = V.light === null ? r : V.light, u = V.dark === null ? n : V.dark;
      return H && (l.includes(H) ? (j.lightColorScheme = H, b?.set(H)) : console.error(`\`${H}\` does not exist in \`theme.colorSchemes\`.`)), u && (l.includes(u) ? (j.darkColorScheme = u, S?.set(u)) : console.error(`\`${u}\` does not exist in \`theme.colorSchemes\`.`)), j;
    }) : C((M) => (b?.set(r), S?.set(n), {
      ...M,
      lightColorScheme: r,
      darkColorScheme: n
    }));
  }, [l, b, S, r, n]), $ = Q.useCallback((V) => {
    h.mode === "system" && C((M) => {
      const j = V?.matches ? "dark" : "light";
      return M.systemMode === j ? M : {
        ...M,
        systemMode: j
      };
    });
  }, [h.mode]), J = Q.useRef($);
  return J.current = $, Q.useEffect(() => {
    if (typeof window.matchMedia != "function" || !f)
      return;
    const V = (...j) => J.current(...j), M = window.matchMedia("(prefers-color-scheme: dark)");
    return M.addListener(V), V(M), () => {
      M.removeListener(V);
    };
  }, [f]), Q.useEffect(() => {
    if (f) {
      const V = g?.subscribe((H) => {
        (!H || ["light", "dark", "system"].includes(H)) && w(H || t);
      }) || rn, M = b?.subscribe((H) => {
        (!H || l.match(H)) && T({
          light: H
        });
      }) || rn, j = S?.subscribe((H) => {
        (!H || l.match(H)) && T({
          dark: H
        });
      }) || rn;
      return () => {
        V(), M(), j();
      };
    }
  }, [T, w, l, t, a, f, g, b, S]), {
    ...h,
    mode: y ? h.mode : void 0,
    systemMode: y ? h.systemMode : void 0,
    colorScheme: y ? _ : void 0,
    setMode: w,
    setColorScheme: T
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
  }, d = /* @__PURE__ */ Q.createContext(void 0);
  process.env.NODE_ENV !== "production" && (d.displayName = "ColorSchemeContext");
  const l = () => Q.useContext(d) || c, f = {}, g = {};
  function b(y) {
    const {
      children: x,
      theme: _,
      modeStorageKey: w = n,
      colorSchemeStorageKey: T = o,
      disableTransitionOnChange: $ = i,
      storageManager: J,
      storageWindow: V = typeof window > "u" ? void 0 : window,
      documentNode: M = typeof document > "u" ? void 0 : document,
      colorSchemeNode: j = typeof document > "u" ? void 0 : document.documentElement,
      disableNestedContext: H = !1,
      disableStyleSheetGeneration: u = !1,
      defaultMode: F = "system",
      forceThemeRerender: R = !1,
      noSsr: I
    } = y, ee = Q.useRef(!1), le = In(), me = Q.useContext(d), Fe = !!me && !H, v = Q.useMemo(() => _ || (typeof r == "function" ? r() : r), [_]), k = v[t], L = k || v, {
      colorSchemes: B = f,
      components: W = g,
      cssVarPrefix: Y
    } = L, q = Object.keys(B).filter((Re) => !!B[Re]).join(","), N = Q.useMemo(() => q.split(","), [q]), z = typeof s == "string" ? s : s.light, X = typeof s == "string" ? s : s.dark, Z = B[z] && B[X] ? F : B[L.defaultColorScheme]?.palette?.mode || L.palette?.mode, {
      mode: K,
      setMode: O,
      systemMode: te,
      lightColorScheme: we,
      darkColorScheme: Je,
      colorScheme: Rt,
      setColorScheme: Ne
    } = Td({
      supportedColorSchemes: N,
      defaultLightColorScheme: z,
      defaultDarkColorScheme: X,
      modeStorageKey: w,
      colorSchemeStorageKey: T,
      defaultMode: Z,
      storageManager: J,
      storageWindow: V,
      noSsr: I
    });
    let G = K, se = Rt;
    Fe && (G = me.mode, se = me.colorScheme), process.env.NODE_ENV !== "production" && R && !L.vars && console.warn(["MUI: The `forceThemeRerender` prop should only be used with CSS theme variables.", "Note that it will slow down the app when changing between modes, so only do this when you cannot find a better solution."].join(`
`));
    let Ae = se || L.defaultColorScheme;
    L.vars && !R && (Ae = L.defaultColorScheme);
    const Ie = Q.useMemo(() => {
      const Re = L.generateThemeVars?.() || L.vars, ge = {
        ...L,
        components: W,
        colorSchemes: B,
        cssVarPrefix: Y,
        vars: Re
      };
      if (typeof ge.generateSpacing == "function" && (ge.spacing = ge.generateSpacing()), Ae) {
        const $e = B[Ae];
        $e && typeof $e == "object" && Object.keys($e).forEach((je) => {
          $e[je] && typeof $e[je] == "object" ? ge[je] = {
            ...ge[je],
            ...$e[je]
          } : ge[je] = $e[je];
        });
      }
      return a ? a(ge) : ge;
    }, [L, Ae, W, B, Y]), Xe = L.colorSchemeSelector;
    os(() => {
      if (se && j && Xe && Xe !== "media") {
        const Re = Xe;
        let ge = Xe;
        if (Re === "class" && (ge = ".%s"), Re === "data" && (ge = "[data-%s]"), Re?.startsWith("data-") && !Re.includes("%s") && (ge = `[${Re}="%s"]`), ge.startsWith("."))
          j.classList.remove(...N.map(($e) => ge.substring(1).replace("%s", $e))), j.classList.add(ge.substring(1).replace("%s", se));
        else {
          const $e = ge.replace("%s", se).match(/\[([^\]]+)\]/);
          if ($e) {
            const [je, Fr] = $e[1].split("=");
            Fr || N.forEach((Rs) => {
              j.removeAttribute(je.replace(se, Rs));
            }), j.setAttribute(je, Fr ? Fr.replace(/"|'/g, "") : "");
          } else
            j.setAttribute(ge, se);
        }
      }
    }, [se, Xe, j, N]), Q.useEffect(() => {
      let Re;
      if ($ && ee.current && M) {
        const ge = M.createElement("style");
        ge.appendChild(M.createTextNode(Cd)), M.head.appendChild(ge), window.getComputedStyle(M.body), Re = setTimeout(() => {
          M.head.removeChild(ge);
        }, 1);
      }
      return () => {
        clearTimeout(Re);
      };
    }, [se, $, M]), Q.useEffect(() => (ee.current = !0, () => {
      ee.current = !1;
    }), []);
    const Mr = Q.useMemo(() => ({
      allColorSchemes: N,
      colorScheme: se,
      darkColorScheme: Je,
      lightColorScheme: we,
      mode: G,
      setColorScheme: Ne,
      setMode: process.env.NODE_ENV === "production" ? O : (Re) => {
        Ie.colorSchemeSelector === "media" && console.error(["MUI: The `setMode` function has no effect if `colorSchemeSelector` is `media` (`media` is the default value).", "To toggle the mode manually, please configure `colorSchemeSelector` to use a class or data attribute.", "To learn more, visit https://mui.com/material-ui/customization/css-theme-variables/configuration/#toggling-dark-mode-manually"].join(`
`)), O(Re);
      },
      systemMode: te
    }), [N, se, Je, we, G, Ne, O, te, Ie.colorSchemeSelector]);
    let Ze = !0;
    (u || L.cssVariables === !1 || Fe && le?.cssVarPrefix === Y) && (Ze = !1);
    const Fn = /* @__PURE__ */ D(Q.Fragment, {
      children: [/* @__PURE__ */ m(Vt, {
        themeId: k ? t : void 0,
        theme: Ie,
        children: x
      }), Ze && /* @__PURE__ */ m(vn, {
        styles: Ie.generateStyleSheets?.() || []
      })]
    });
    return Fe ? Fn : /* @__PURE__ */ m(d.Provider, {
      value: Mr,
      children: Fn
    });
  }
  process.env.NODE_ENV !== "production" && (b.propTypes = {
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
  const S = typeof s == "string" ? s : s.light, h = typeof s == "string" ? s : s.dark;
  return {
    CssVarsProvider: b,
    useColorScheme: l,
    getInitColorSchemeScript: (y) => Sd({
      colorSchemeStorageKey: o,
      defaultLightColorScheme: S,
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
        const l = `--${r ? `${r}-` : ""}${a.join("-")}`, f = Ad(a, c);
        Object.assign(o, {
          [l]: f
        }), jo(i, a, `var(${l})`, d), jo(s, a, `var(${l}, ${f})`, d);
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
    vars: l,
    css: f,
    varsWithDefaults: g
  } = nn(d, t);
  let b = g;
  const S = {}, {
    [c]: h,
    ...C
  } = s;
  if (Object.entries(C || {}).forEach(([w, T]) => {
    const {
      vars: $,
      css: J,
      varsWithDefaults: V
    } = nn(T, t);
    b = Pe(b, V), S[w] = {
      css: J,
      vars: $
    };
  }), h) {
    const {
      css: w,
      vars: T,
      varsWithDefaults: $
    } = nn(h, t);
    b = Pe(b, $), S[c] = {
      css: w,
      vars: T
    };
  }
  function y(w, T) {
    let $ = o;
    if (o === "class" && ($ = ".%s"), o === "data" && ($ = "[data-%s]"), o?.startsWith("data-") && !o.includes("%s") && ($ = `[${o}="%s"]`), w) {
      if ($ === "media")
        return e.defaultColorScheme === w ? ":root" : {
          [`@media (prefers-color-scheme: ${s[w]?.palette?.mode || w})`]: {
            ":root": T
          }
        };
      if ($)
        return e.defaultColorScheme === w ? `:root, ${$.replace("%s", String(w))}` : $.replace("%s", String(w));
    }
    return ":root";
  }
  return {
    vars: b,
    generateThemeVars: () => {
      let w = {
        ...l
      };
      return Object.entries(S).forEach(([, {
        vars: T
      }]) => {
        w = Pe(w, T);
      }), w;
    },
    generateStyleSheets: () => {
      const w = [], T = e.defaultColorScheme || "light";
      function $(M, j) {
        Object.keys(j).length && w.push(typeof M == "string" ? {
          [M]: {
            ...j
          }
        } : M);
      }
      $(r(void 0, {
        ...f
      }), f);
      const {
        [T]: J,
        ...V
      } = S;
      if (J) {
        const {
          css: M
        } = J, j = s[T]?.palette?.mode, H = !n && j ? {
          colorScheme: j,
          ...M
        } : {
          ...M
        };
        $(r(T, {
          ...H
        }), H);
      }
      return Object.entries(V).forEach(([M, {
        css: j
      }]) => {
        const H = s[M]?.palette?.mode, u = !n && H ? {
          colorScheme: H,
          ...j
        } : {
          ...j
        };
        $(r(M, {
          ...u
        }), u);
      }), i && w.push({
        ":root": {
          // use double underscore to indicate that these are private variables
          "--__l-threshold": "0.7",
          "--__l": "clamp(0, (l / var(--__l-threshold) - 1) * -infinity, 1)",
          "--__a": "clamp(0.87, (l / var(--__l-threshold) - 1) * -infinity, 1)"
          // 0.87 is the default alpha value for black text.
        }
      }), w;
    }
  };
}
function kd(e) {
  return function(r) {
    return e === "media" ? (process.env.NODE_ENV !== "production" && r !== "light" && r !== "dark" && console.error(`MUI: @media (prefers-color-scheme) supports only 'light' or 'dark', but receive '${r}'.`), `@media (prefers-color-scheme: ${r})`) : e ? e.startsWith("data-") && !e.includes("%s") ? `[${e}="${r}"] &` : e === "class" ? `.${r} &` : e === "data" ? `[data-${r}] &` : `${e.replace("%s", r)} &` : "&";
  };
}
const Wt = {
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
      paper: Wt.white,
      default: Wt.white
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
      primary: Wt.white,
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
      active: Wt.white,
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
  } = e, s = e.primary || Nd(t), a = e.secondary || Id(t), c = e.error || $d(t), d = e.info || Ld(t), l = e.success || Dd(t), f = e.warning || Md(t);
  function g(C) {
    if (o)
      return Fd(C);
    const y = Lo(C, un.text.primary) >= r ? un.text.primary : fs.text.primary;
    if (process.env.NODE_ENV !== "production") {
      const x = Lo(C, y);
      x < 3 && console.error([`MUI: The contrast ratio of ${x}:1 for ${y} on ${C}`, "falls below the WCAG recommended absolute minimum contrast ratio of 3:1.", "https://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-contrast"].join(`
`));
    }
    return y;
  }
  const b = ({
    color: C,
    name: y,
    mainShade: x = 500,
    lightShade: _ = 300,
    darkShade: w = 700
  }) => {
    if (C = {
      ...C
    }, !C.main && C[x] && (C.main = C[x]), !C.hasOwnProperty("main"))
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The color${y ? ` (${y})` : ""} provided to augmentColor(color) is invalid.
The color object needs to have a \`main\` property or a \`${x}\` property.` : rt(11, y ? ` (${y})` : "", x));
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
} });` : rt(12, y ? ` (${y})` : "", JSON.stringify(C.main)));
    return o ? (Vo(o, C, "light", _, n), Vo(o, C, "dark", w, n)) : (Ho(C, "light", _, n), Ho(C, "dark", w, n)), C.contrastText || (C.contrastText = g(C.main)), C;
  };
  let S;
  return t === "light" ? S = ds() : t === "dark" && (S = ps()), process.env.NODE_ENV !== "production" && (S || console.error(`MUI: The palette mode \`${t}\` is not supported.`)), Pe({
    // A collection of common colors.
    common: {
      ...Wt
    },
    // prevent mutable object.
    // The palette mode, can be light or dark.
    mode: t,
    // The colors used to represent primary interface elements for a user.
    primary: b({
      color: s,
      name: "primary"
    }),
    // The colors used to represent secondary interface elements for a user.
    secondary: b({
      color: a,
      name: "secondary",
      mainShade: "A400",
      lightShade: "A200",
      darkShade: "A700"
    }),
    // The colors used to represent interface elements that the user should be made aware of.
    error: b({
      color: c,
      name: "error"
    }),
    // The colors used to represent potentially dangerous actions or important messages.
    warning: b({
      color: f,
      name: "warning"
    }),
    // The colors used to present information to the user that is neutral and not necessarily important.
    info: b({
      color: d,
      name: "info"
    }),
    // The colors used to indicate the successful completion of an action that user triggered.
    success: b({
      color: l,
      name: "success"
    }),
    // The grey colors.
    grey: Pd,
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    contrastThreshold: r,
    // Takes a background color and returns the text color that maximizes the contrast.
    getContrastText: g,
    // Generate a rich color object.
    augmentColor: b,
    // Used by the functions below to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    tonalOffset: n,
    // The light and dark mode object.
    ...S
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
    pxToRem: l,
    ...f
  } = typeof t == "function" ? t(e) : t;
  process.env.NODE_ENV !== "production" && (typeof n != "number" && console.error("MUI: `fontSize` is required to be a number."), typeof c != "number" && console.error("MUI: `htmlFontSize` is required to be a number."));
  const g = n / 14, b = l || ((C) => `${C / c * g}rem`), S = (C, y, x, _, w) => ({
    fontFamily: r,
    fontWeight: C,
    fontSize: b(y),
    // Unitless following https://meyerweb.com/eric/thoughts/2006/02/08/unitless-line-heights/
    lineHeight: x,
    // The letter spacing was designed for the Roboto font-family. Using the same letter-spacing
    // across font-families can cause issues with the kerning.
    ...r === zo ? {
      letterSpacing: `${jd(_ / y)}em`
    } : {},
    ...w,
    ...d
  }), h = {
    h1: S(o, 96, 1.167, -1.5),
    h2: S(o, 60, 1.2, -0.5),
    h3: S(i, 48, 1.167, 0),
    h4: S(i, 34, 1.235, 0.25),
    h5: S(i, 24, 1.334, 0),
    h6: S(s, 20, 1.6, 0.15),
    subtitle1: S(i, 16, 1.75, 0.15),
    subtitle2: S(s, 14, 1.57, 0.1),
    body1: S(i, 16, 1.5, 0.15),
    body2: S(i, 14, 1.43, 0.15),
    button: S(s, 14, 1.75, 0.4, Wo),
    caption: S(i, 12, 1.66, 0.4),
    overline: S(i, 12, 2.66, 1, Wo),
    // TODO v6: Remove handling of 'inherit' variant from the theme as it is already handled in Material UI's Typography component. Also, remember to remove the associated types.
    inherit: {
      fontFamily: "inherit",
      fontWeight: "inherit",
      fontSize: "inherit",
      lineHeight: "inherit",
      letterSpacing: "inherit"
    }
  };
  return Pe({
    htmlFontSize: c,
    pxToRem: b,
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
        const l = (g) => typeof g == "string", f = (g) => !Number.isNaN(parseFloat(g));
        !l(o) && !Array.isArray(o) && console.error('MUI: Argument "props" must be a string or Array.'), !f(s) && !l(s) && console.error(`MUI: Argument "duration" must be a number or a string but found ${s}.`), l(a) || console.error('MUI: Argument "easing" must be a string.'), !f(c) && !l(c) && console.error('MUI: Argument "delay" must be a number or a string.'), typeof i != "object" && console.error(["MUI: Secong argument of transition.create must be an object.", "Arguments should be either `create('prop1', options)` or `create(['prop1', 'prop2'], options)`"].join(`
`)), Object.keys(d).length !== 0 && console.error(`MUI: Unrecognized argument(s) [${Object.keys(d).join(",")}].`);
      }
      return (Array.isArray(o) ? o : [o]).map((l) => `${l} ${typeof s == "string" ? s : qo(s)} ${a} ${typeof c == "string" ? c : qo(c)}`).join(",");
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
    ...l
  } = e;
  if (e.vars && // The error should throw only for the root theme creation because user is not allowed to use a custom node `vars`.
  // `generateThemeVars` is the closest identifier for checking that the `options` is a result of `createTheme` with CSS variables so that user can create new theme for nested ThemeProvider.
  e.generateThemeVars === void 0)
    throw new Error(process.env.NODE_ENV !== "production" ? "MUI: `vars` is a private field used for CSS variables support.\nPlease use another name or follow the [docs](https://mui.com/material-ui/customization/css-theme-variables/usage/) to enable the feature." : rt(20));
  const f = Dn({
    ...i,
    colorSpace: d
  }), g = ts(e);
  let b = Pe(g, {
    mixins: Ud(g.breakpoints, n),
    palette: f,
    // Don't use [...shadows] until you've verified its transpiled code is not invoking the iterator protocol.
    shadows: zd.slice(),
    typography: hs(f, a),
    transitions: Yd(s),
    zIndex: {
      ...Jd
    }
  });
  if (b = Pe(b, l), b = t.reduce((S, h) => Pe(S, h), b), process.env.NODE_ENV !== "production") {
    const S = ["active", "checked", "completed", "disabled", "error", "expanded", "focused", "focusVisible", "required", "selected"], h = (C, y) => {
      let x;
      for (x in C) {
        const _ = C[x];
        if (S.includes(x) && Object.keys(_).length > 0) {
          if (process.env.NODE_ENV !== "production") {
            const w = nd("", x);
            console.error([`MUI: The \`${y}\` component increases the CSS specificity of the \`${x}\` internal state.`, "You can not override it like this: ", JSON.stringify(C, null, 2), "", `Instead, you need to use the '&.${w}' syntax:`, JSON.stringify({
              root: {
                [`&.${w}`]: _
              }
            }, null, 2), "", "https://mui.com/r/state-classes-guide"].join(`
`));
          }
          C[x] = {};
        }
      }
    };
    Object.keys(b.components).forEach((C) => {
      const y = b.components[C].styleOverrides;
      y && C.startsWith("Mui") && h(y, C);
    });
  }
  return b.unstable_sxConfig = {
    ...Ir,
    ...l?.unstable_sxConfig
  }, b.unstable_sx = function(h) {
    return Qt({
      sx: h,
      theme: this
    });
  }, b.toRuntimeSource = ms, Qd(b), b;
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
function qe(e, t) {
  `${t}Channel` in e || (e[`${t}Channel`] = Lt(Dt(e[t]), `MUI: Can't create \`palette.${t}Channel\` because \`palette.${t}\` is not one of these formats: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().
To suppress this warning, you need to explicitly provide the \`palette.${t}Channel\` as a string (in rgb format, for example "12 12 12") or undefined if you want to remove the channel token.`));
}
function cf(e) {
  return typeof e == "number" ? `${e}px` : typeof e == "string" || typeof e == "function" || Array.isArray(e) ? e : "8px";
}
const He = (e) => {
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
    ...l
  } = e, f = Object.keys(r)[0], g = n || (r.light && f !== "light" ? "light" : f), b = lf(i), {
    [g]: S,
    light: h,
    dark: C,
    ...y
  } = r, x = {
    ...y
  };
  let _ = S;
  if ((g === "dark" && !("dark" in r) || g === "light" && !("light" in r)) && (_ = !0), !_)
    throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The \`colorSchemes.${g}\` option is either missing or invalid.` : rt(21, g));
  let w;
  s && (w = "oklch");
  const T = on(w, x, _, l, g);
  h && !x.light && on(w, x, h, void 0, "light"), C && !x.dark && on(w, x, C, void 0, "dark");
  let $ = {
    defaultColorScheme: g,
    ...T,
    cssVarPrefix: i,
    colorSchemeSelector: c,
    rootSelector: d,
    getCssVar: b,
    colorSchemes: x,
    font: {
      ...Bd(T.typography),
      ...T.font
    },
    spacing: cf(l.spacing)
  };
  Object.keys($.colorSchemes).forEach((H) => {
    const u = $.colorSchemes[H].palette, F = (I) => {
      const ee = I.split("-"), le = ee[1], me = ee[2];
      return b(I, u[le][me]);
    };
    u.mode === "light" && (E(u.common, "background", "#fff"), E(u.common, "onBackground", "#000")), u.mode === "dark" && (E(u.common, "background", "#000"), E(u.common, "onBackground", "#fff"));
    function R(I, ee, le) {
      if (w) {
        let me;
        return I === it && (me = `transparent ${((1 - le) * 100).toFixed(0)}%`), I === oe && (me = `#000 ${(le * 100).toFixed(0)}%`), I === ie && (me = `#fff ${(le * 100).toFixed(0)}%`), `color-mix(in ${w}, ${ee}, ${me})`;
      }
      return I(ee, le);
    }
    if (af(u, ["Alert", "AppBar", "Avatar", "Button", "Chip", "FilledInput", "LinearProgress", "Skeleton", "Slider", "SnackbarContent", "SpeedDialAction", "StepConnector", "StepContent", "Switch", "TableCell", "Tooltip"]), u.mode === "light") {
      E(u.Alert, "errorColor", R(oe, u.error.light, 0.6)), E(u.Alert, "infoColor", R(oe, u.info.light, 0.6)), E(u.Alert, "successColor", R(oe, u.success.light, 0.6)), E(u.Alert, "warningColor", R(oe, u.warning.light, 0.6)), E(u.Alert, "errorFilledBg", F("palette-error-main")), E(u.Alert, "infoFilledBg", F("palette-info-main")), E(u.Alert, "successFilledBg", F("palette-success-main")), E(u.Alert, "warningFilledBg", F("palette-warning-main")), E(u.Alert, "errorFilledColor", He(() => u.getContrastText(u.error.main))), E(u.Alert, "infoFilledColor", He(() => u.getContrastText(u.info.main))), E(u.Alert, "successFilledColor", He(() => u.getContrastText(u.success.main))), E(u.Alert, "warningFilledColor", He(() => u.getContrastText(u.warning.main))), E(u.Alert, "errorStandardBg", R(ie, u.error.light, 0.9)), E(u.Alert, "infoStandardBg", R(ie, u.info.light, 0.9)), E(u.Alert, "successStandardBg", R(ie, u.success.light, 0.9)), E(u.Alert, "warningStandardBg", R(ie, u.warning.light, 0.9)), E(u.Alert, "errorIconColor", F("palette-error-main")), E(u.Alert, "infoIconColor", F("palette-info-main")), E(u.Alert, "successIconColor", F("palette-success-main")), E(u.Alert, "warningIconColor", F("palette-warning-main")), E(u.AppBar, "defaultBg", F("palette-grey-100")), E(u.Avatar, "defaultBg", F("palette-grey-400")), E(u.Button, "inheritContainedBg", F("palette-grey-300")), E(u.Button, "inheritContainedHoverBg", F("palette-grey-A100")), E(u.Chip, "defaultBorder", F("palette-grey-400")), E(u.Chip, "defaultAvatarColor", F("palette-grey-700")), E(u.Chip, "defaultIconColor", F("palette-grey-700")), E(u.FilledInput, "bg", "rgba(0, 0, 0, 0.06)"), E(u.FilledInput, "hoverBg", "rgba(0, 0, 0, 0.09)"), E(u.FilledInput, "disabledBg", "rgba(0, 0, 0, 0.12)"), E(u.LinearProgress, "primaryBg", R(ie, u.primary.main, 0.62)), E(u.LinearProgress, "secondaryBg", R(ie, u.secondary.main, 0.62)), E(u.LinearProgress, "errorBg", R(ie, u.error.main, 0.62)), E(u.LinearProgress, "infoBg", R(ie, u.info.main, 0.62)), E(u.LinearProgress, "successBg", R(ie, u.success.main, 0.62)), E(u.LinearProgress, "warningBg", R(ie, u.warning.main, 0.62)), E(u.Skeleton, "bg", w ? R(it, u.text.primary, 0.11) : `rgba(${F("palette-text-primaryChannel")} / 0.11)`), E(u.Slider, "primaryTrack", R(ie, u.primary.main, 0.62)), E(u.Slider, "secondaryTrack", R(ie, u.secondary.main, 0.62)), E(u.Slider, "errorTrack", R(ie, u.error.main, 0.62)), E(u.Slider, "infoTrack", R(ie, u.info.main, 0.62)), E(u.Slider, "successTrack", R(ie, u.success.main, 0.62)), E(u.Slider, "warningTrack", R(ie, u.warning.main, 0.62));
      const I = w ? R(oe, u.background.default, 0.6825) : ir(u.background.default, 0.8);
      E(u.SnackbarContent, "bg", I), E(u.SnackbarContent, "color", He(() => w ? un.text.primary : u.getContrastText(I))), E(u.SpeedDialAction, "fabHoverBg", ir(u.background.paper, 0.15)), E(u.StepConnector, "border", F("palette-grey-400")), E(u.StepContent, "border", F("palette-grey-400")), E(u.Switch, "defaultColor", F("palette-common-white")), E(u.Switch, "defaultDisabledColor", F("palette-grey-100")), E(u.Switch, "primaryDisabledColor", R(ie, u.primary.main, 0.62)), E(u.Switch, "secondaryDisabledColor", R(ie, u.secondary.main, 0.62)), E(u.Switch, "errorDisabledColor", R(ie, u.error.main, 0.62)), E(u.Switch, "infoDisabledColor", R(ie, u.info.main, 0.62)), E(u.Switch, "successDisabledColor", R(ie, u.success.main, 0.62)), E(u.Switch, "warningDisabledColor", R(ie, u.warning.main, 0.62)), E(u.TableCell, "border", R(ie, R(it, u.divider, 1), 0.88)), E(u.Tooltip, "bg", R(it, u.grey[700], 0.92));
    }
    if (u.mode === "dark") {
      E(u.Alert, "errorColor", R(ie, u.error.light, 0.6)), E(u.Alert, "infoColor", R(ie, u.info.light, 0.6)), E(u.Alert, "successColor", R(ie, u.success.light, 0.6)), E(u.Alert, "warningColor", R(ie, u.warning.light, 0.6)), E(u.Alert, "errorFilledBg", F("palette-error-dark")), E(u.Alert, "infoFilledBg", F("palette-info-dark")), E(u.Alert, "successFilledBg", F("palette-success-dark")), E(u.Alert, "warningFilledBg", F("palette-warning-dark")), E(u.Alert, "errorFilledColor", He(() => u.getContrastText(u.error.dark))), E(u.Alert, "infoFilledColor", He(() => u.getContrastText(u.info.dark))), E(u.Alert, "successFilledColor", He(() => u.getContrastText(u.success.dark))), E(u.Alert, "warningFilledColor", He(() => u.getContrastText(u.warning.dark))), E(u.Alert, "errorStandardBg", R(oe, u.error.light, 0.9)), E(u.Alert, "infoStandardBg", R(oe, u.info.light, 0.9)), E(u.Alert, "successStandardBg", R(oe, u.success.light, 0.9)), E(u.Alert, "warningStandardBg", R(oe, u.warning.light, 0.9)), E(u.Alert, "errorIconColor", F("palette-error-main")), E(u.Alert, "infoIconColor", F("palette-info-main")), E(u.Alert, "successIconColor", F("palette-success-main")), E(u.Alert, "warningIconColor", F("palette-warning-main")), E(u.AppBar, "defaultBg", F("palette-grey-900")), E(u.AppBar, "darkBg", F("palette-background-paper")), E(u.AppBar, "darkColor", F("palette-text-primary")), E(u.Avatar, "defaultBg", F("palette-grey-600")), E(u.Button, "inheritContainedBg", F("palette-grey-800")), E(u.Button, "inheritContainedHoverBg", F("palette-grey-700")), E(u.Chip, "defaultBorder", F("palette-grey-700")), E(u.Chip, "defaultAvatarColor", F("palette-grey-300")), E(u.Chip, "defaultIconColor", F("palette-grey-300")), E(u.FilledInput, "bg", "rgba(255, 255, 255, 0.09)"), E(u.FilledInput, "hoverBg", "rgba(255, 255, 255, 0.13)"), E(u.FilledInput, "disabledBg", "rgba(255, 255, 255, 0.12)"), E(u.LinearProgress, "primaryBg", R(oe, u.primary.main, 0.5)), E(u.LinearProgress, "secondaryBg", R(oe, u.secondary.main, 0.5)), E(u.LinearProgress, "errorBg", R(oe, u.error.main, 0.5)), E(u.LinearProgress, "infoBg", R(oe, u.info.main, 0.5)), E(u.LinearProgress, "successBg", R(oe, u.success.main, 0.5)), E(u.LinearProgress, "warningBg", R(oe, u.warning.main, 0.5)), E(u.Skeleton, "bg", w ? R(it, u.text.primary, 0.13) : `rgba(${F("palette-text-primaryChannel")} / 0.13)`), E(u.Slider, "primaryTrack", R(oe, u.primary.main, 0.5)), E(u.Slider, "secondaryTrack", R(oe, u.secondary.main, 0.5)), E(u.Slider, "errorTrack", R(oe, u.error.main, 0.5)), E(u.Slider, "infoTrack", R(oe, u.info.main, 0.5)), E(u.Slider, "successTrack", R(oe, u.success.main, 0.5)), E(u.Slider, "warningTrack", R(oe, u.warning.main, 0.5));
      const I = w ? R(ie, u.background.default, 0.985) : ir(u.background.default, 0.98);
      E(u.SnackbarContent, "bg", I), E(u.SnackbarContent, "color", He(() => w ? fs.text.primary : u.getContrastText(I))), E(u.SpeedDialAction, "fabHoverBg", ir(u.background.paper, 0.15)), E(u.StepConnector, "border", F("palette-grey-600")), E(u.StepContent, "border", F("palette-grey-600")), E(u.Switch, "defaultColor", F("palette-grey-300")), E(u.Switch, "defaultDisabledColor", F("palette-grey-600")), E(u.Switch, "primaryDisabledColor", R(oe, u.primary.main, 0.55)), E(u.Switch, "secondaryDisabledColor", R(oe, u.secondary.main, 0.55)), E(u.Switch, "errorDisabledColor", R(oe, u.error.main, 0.55)), E(u.Switch, "infoDisabledColor", R(oe, u.info.main, 0.55)), E(u.Switch, "successDisabledColor", R(oe, u.success.main, 0.55)), E(u.Switch, "warningDisabledColor", R(oe, u.warning.main, 0.55)), E(u.TableCell, "border", R(oe, R(it, u.divider, 1), 0.68)), E(u.Tooltip, "bg", R(it, u.grey[700], 0.92));
    }
    qe(u.background, "default"), qe(u.background, "paper"), qe(u.common, "background"), qe(u.common, "onBackground"), qe(u, "divider"), Object.keys(u).forEach((I) => {
      const ee = u[I];
      I !== "tonalOffset" && ee && typeof ee == "object" && (ee.main && E(u[I], "mainChannel", Lt(Dt(ee.main))), ee.light && E(u[I], "lightChannel", Lt(Dt(ee.light))), ee.dark && E(u[I], "darkChannel", Lt(Dt(ee.dark))), ee.contrastText && E(u[I], "contrastTextChannel", Lt(Dt(ee.contrastText))), I === "text" && (qe(u[I], "primary"), qe(u[I], "secondary")), I === "action" && (ee.active && qe(u[I], "active"), ee.selected && qe(u[I], "selected")));
    });
  }), $ = t.reduce((H, u) => Pe(H, u), $);
  const J = {
    prefix: i,
    disableCssColorScheme: o,
    shouldSkipGeneratingVar: a,
    getSelector: sf($),
    enableContrastVars: s
  }, {
    vars: V,
    generateThemeVars: M,
    generateStyleSheets: j
  } = _d($, J);
  return $.vars = V, Object.entries($.colorSchemes[$.defaultColorScheme]).forEach(([H, u]) => {
    $[H] = u;
  }), $.generateThemeVars = M, $.generateStyleSheets = j, $.generateSpacing = function() {
    return es(l.spacing, An(this));
  }, $.getColorSchemeSelector = kd(c), $.spacing = $.generateSpacing(), $.shouldSkipGeneratingVar = a, $.unstable_sxConfig = {
    ...Ir,
    ...l?.unstable_sxConfig
  }, $.unstable_sx = function(u) {
    return Qt({
      sx: u,
      theme: this
    });
  }, $.toRuntimeSource = ms, $;
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
    let l = r;
    "palette" in e || d[a] && (d[a] !== !0 ? l = d[a].palette : a === "dark" && (l = {
      mode: "dark"
    }));
    const f = dn({
      ...e,
      palette: l
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
  return process.env.NODE_ENV !== "production" && Q.useDebugValue(e), e[lt] || e;
}
function pf({
  theme: e,
  ...t
}) {
  const r = lt in e ? e[lt] : void 0;
  return /* @__PURE__ */ m(Vt, {
    ...t,
    themeId: r ? lt : void 0,
    theme: r || e
  });
}
const sr = {
  colorSchemeStorageKey: "mui-color-scheme",
  defaultLightColorScheme: "light",
  defaultDarkColorScheme: "dark",
  modeStorageKey: "mui-mode"
};
process.env.NODE_ENV !== "production" && (U.string, U.string, U.string, U.string, U.string, U.oneOf(["dark", "light", "system"]), U.string, U.string);
const {
  CssVarsProvider: hf
} = Od({
  themeId: lt,
  // @ts-ignore ignore module augmentation tests
  theme: () => Mn({
    cssVariables: !0
  }),
  colorSchemeStorageKey: sr.colorSchemeStorageKey,
  modeStorageKey: sr.modeStorageKey,
  defaultColorScheme: {
    light: sr.defaultLightColorScheme,
    dark: sr.defaultDarkColorScheme
  },
  resolveTheme: (e) => {
    const t = {
      ...e,
      typography: hs(e.palette, e.typography)
    };
    return t.unstable_sx = function(n) {
      return Qt({
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
  const r = Q.useMemo(() => {
    if (typeof e == "function")
      return e;
    const n = lt in e ? e[lt] : e;
    return "colorSchemes" in n ? null : "vars" in n ? e : {
      ...e,
      vars: null
    };
  }, [e]);
  return r ? /* @__PURE__ */ m(pf, {
    theme: r,
    ...t
  }) : /* @__PURE__ */ m(mf, {
    theme: e,
    ...t
  });
}
const yf = Mn({ spacing: 8 }).spacing, bf = 1760, Sf = 1120, Yo = ({
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
  ), [c, d] = Oe(e.mode), [l, f] = Oe(!1);
  return e.mode !== c && (d(e.mode), f(!0)), Be(() => {
    if (!l) return;
    let g = requestAnimationFrame(() => {
      g = requestAnimationFrame(() => f(!1));
    });
    return () => cancelAnimationFrame(g);
  }, [l, c]), // Own spacing unit, so the layout looks the same in every host app.
  // Full-width page background; the layout inside is capped and centred on wide screens
  /* @__PURE__ */ m(gf, { theme: a, children: /* @__PURE__ */ m(
    A,
    {
      "data-mode-switching": l || void 0,
      sx: {
        minHeight: "100vh",
        backgroundColor: e.pageBg,
        transition: he,
        // Desktop: centres the capped layout vertically on very tall screens
        display: { md: "flex" },
        alignItems: "center",
        // Light / dark switch: colours change at once on every element, MUI's own
        // transitions included (see MODE_SWITCH_TRANSITION)
        "&[data-mode-switching], &[data-mode-switching] *, &[data-mode-switching] *::before, &[data-mode-switching] *::after": { transition: `${sa} !important` },
        ...la
      },
      children: /* @__PURE__ */ D(
        A,
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
            transition: he,
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
                children: /* @__PURE__ */ D(
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
                      i.map((g, b) => /* @__PURE__ */ D(
                        Mt.Fragment,
                        {
                          children: [
                            b > 0 && /* @__PURE__ */ m(
                              Yo,
                              {
                                weight: 1,
                                minHeight: 18,
                                minHeightShort: 8
                              }
                            ),
                            /* @__PURE__ */ D(
                              A,
                              {
                                sx: {
                                  display: "flex",
                                  flexDirection: "column",
                                  animation: Ke(b * 50)
                                },
                                children: [
                                  g,
                                  b === 0 && o && /* @__PURE__ */ m(
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
                        Mt.isValidElement(g) ? g.key : b
                      )),
                      /* @__PURE__ */ m(Yo, { weight: 3, minHeight: 40, minHeightShort: 24 }),
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
    return /* @__PURE__ */ D(Et, { ...n, viewBox: "0 0 30 30", children: [
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
          style: { fill: Jo },
          d: "M27.6715 7.81562C25.8485 4.37255 22.7324 1.79469 19.0087 0.649137C15.2851 -0.496418 11.2588 -0.115827 7.81575 1.70718L9.86273 5.57326C12.2805 4.29314 15.1077 4.02589 17.7225 4.8303C20.3372 5.63471 22.5253 7.44488 23.8055 9.86261L27.6715 7.81562Z"
        }
      ),
      /* @__PURE__ */ m(
        "path",
        {
          style: { fill: Jo },
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
    const s = { fill: Pt("#0F62B0") };
    return /* @__PURE__ */ D(Et, { ...n, viewBox: "0 0 30 30", children: [
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
          style: { fill: Ef("#0F62B0"), stroke: wf },
          cx: "14.1725",
          cy: "14.5849",
          r: "3.18086",
          strokeWidth: "1.33541"
        }
      ),
      /* @__PURE__ */ m(
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
  return /* @__PURE__ */ D(Et, { ...n, viewBox: "0 0 30 30", children: [
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
}, xf = ({
  theme: e,
  value: t,
  platformAssets: r,
  disabled: n = !1,
  allowClear: o = !1,
  onChange: i
}) => {
  const s = e.mode === "dark", a = pn(0), c = ke.findIndex((l) => l.id === t);
  c >= 0 && (a.current = c);
  const d = ke[a.current];
  return /* @__PURE__ */ D(A, { children: [
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
    /* @__PURE__ */ D(
      A,
      {
        sx: {
          position: "relative",
          p: 1,
          borderRadius: "12px",
          backgroundColor: e.surface,
          boxShadow: s ? "none" : oa,
          border: `1px solid ${s ? e.border : "transparent"}`,
          transition: he
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
                backgroundColor: d.uiColor,
                // Dark brand colours (Polymer) need an edge to stand out on a dark page
                boxShadow: s ? `inset 0 0 0 1px ${d.colorOnDark}` : "none",
                transform: `translateX(calc(${a.current} * (100% + 4px))) scale(${c >= 0 ? 1 : 0.92})`,
                opacity: c >= 0 ? 1 : 0,
                transition: `transform ${yn}ms ${xt}, opacity 200ms ease, ${he}`
              }
            }
          ),
          /* @__PURE__ */ m(
            Ls,
            {
              exclusive: !0,
              fullWidth: !0,
              value: t,
              disabled: n,
              "aria-labelledby": "lumora-platform-label",
              onChange: (l, f) => (f || o) && i(f),
              sx: { position: "relative", gap: 0.5 },
              children: ke.map((l) => {
                const f = s ? l.colorOnDark : l.uiColor, g = r?.[l.id]?.logo;
                return /* @__PURE__ */ D(
                  Ds,
                  {
                    value: l.id,
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
                      transition: `background-color 150ms, ${qt("color")}`,
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
                        "--mark-center": l.uiColor,
                        "--mark-ring": "#ffffff"
                      },
                      "&.Mui-focusVisible": {
                        outline: `2px solid ${f}`,
                        outlineOffset: 2
                      }
                    },
                    children: [
                      g ?? /* @__PURE__ */ m(bs, { platform: l.id }),
                      l.name
                    ]
                  },
                  l.id
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
), Xo = ({
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
  ) : /* @__PURE__ */ D(
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
        /* @__PURE__ */ m(A, { sx: { flex: 1, minHeight: 0, position: "relative", backgroundColor: "#f7f9f9" }, children: /* @__PURE__ */ D(
          A,
          {
            "data-testid": "screenshot-placeholder",
            sx: { p: n ? 1.25 : 3.5, display: "flex", flexDirection: "column", gap: n ? 1 : 2 },
            children: [
              /* @__PURE__ */ D(A, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
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
              /* @__PURE__ */ m(Nt, { width: "22%", height: n ? 4 : 6 }),
              /* @__PURE__ */ m(
                A,
                {
                  sx: {
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: n ? 0.75 : 2,
                    mt: n ? 0.5 : 1
                  },
                  children: Array.from({ length: 6 }).map((a, c) => /* @__PURE__ */ D(
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
                        /* @__PURE__ */ m(Nt, { width: "70%", height: n ? 4 : 7 }),
                        /* @__PURE__ */ m(Nt, { width: "45%", height: n ? 3 : 5 }),
                        /* @__PURE__ */ m(Nt, { width: "85%", height: n ? 3 : 5 }),
                        /* @__PURE__ */ m(Nt, { width: "60%", height: n ? 3 : 5 })
                      ]
                    },
                    c
                  ))
                }
              ),
              !n && /* @__PURE__ */ D(
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
  const r = ke.every(
    (o) => t?.[o.id]?.overviewScreenshot
  ) ? ["screenshot", "overviewScreenshot"] : ["screenshot"], n = (o) => Promise.all(
    ke.flatMap(
      (i) => r.map((s) => Cs(i.id, o, s, t))
    )
  );
  n(e).then(
    () => n(e === "dark" ? "light" : "dark")
  );
}, Af = (e, t, r, n) => {
  const [, o] = Oe(0), i = e.join(",");
  return Be(() => {
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
  const o = t ? wt(t) : null, i = ke.every(
    (c) => r?.[c.id]?.overviewScreenshot
  ), s = Af(
    o ? [o.id] : ke.map((c) => c.id),
    !o && i ? "overviewScreenshot" : "screenshot",
    e.mode,
    r
  ), a = n ? 2.25 : { md: 5, lg: 6 };
  return /* @__PURE__ */ m(
    A,
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
          transition: he
        },
        // Content above the grid
        "& > *": { position: "relative" },
        color: o ? "#ffffff" : e.heading,
        transition: he
      },
      children: o ? /* @__PURE__ */ D(Mt.Fragment, { children: [
        /* @__PURE__ */ D(
          A,
          {
            sx: {
              px: a,
              pt: n ? 2.25 : { md: 7, lg: 9 }
            },
            children: [
              /* @__PURE__ */ D(
                A,
                {
                  sx: {
                    ...ei,
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
              /* @__PURE__ */ D(
                A,
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
              animation: `${ca} 450ms ${xt} 120ms both`
            },
            children: s[o.id] === null ? null : /* @__PURE__ */ m(
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
      ] }, o.id) : /* @__PURE__ */ D(Mt.Fragment, { children: [
        /* @__PURE__ */ D(
          A,
          {
            sx: {
              px: a,
              pt: n ? 2.25 : { md: 5, lg: 6 }
            },
            children: [
              /* @__PURE__ */ D(
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
                    /* @__PURE__ */ D(
                      A,
                      {
                        sx: {
                          ...ei,
                          fontFamily: e.bodyFont,
                          fontSize: 16,
                          fontWeight: 600,
                          // The phone banner keeps a small label so the headline fits
                          ...n && { fontSize: 10, gap: 1 },
                          color: e.eyebrow,
                          transition: he
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
                    !n && /* @__PURE__ */ D(
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
                          ke.length,
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
                  children: ke.map((c) => /* @__PURE__ */ D(
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
                        r?.[c.id]?.logo ?? /* @__PURE__ */ m(bs, { platform: c.id }),
                        c.name
                      ]
                    },
                    c.id
                  ))
                }
              ),
              /* @__PURE__ */ D(
                A,
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
                    transition: he,
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
                          transition: he
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
                  children: "Centra runs the deals. Polymer builds the agents. XPdite trains them. One Lumora account opens all three."
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
            children: i ? /* @__PURE__ */ m(
              A,
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
                    s[c] ? /* @__PURE__ */ m(
                      A,
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
              const l = wt(c);
              return s[c] === null ? null : /* @__PURE__ */ m(
                Xo,
                {
                  compact: !0,
                  title: l.name,
                  barColor: l.frameColor,
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
}, Nf = ({ theme: e, title: t, steps: r }) => /* @__PURE__ */ D(
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
      transition: he,
      "& *": { transition: he }
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
          children: r.map((n, o) => /* @__PURE__ */ D(
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
), ii = ({ brandConfig: e, theme: t }) => /* @__PURE__ */ D(
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
      transition: he,
      // Centred on phones, where the panel is the whole page; left-aligned beside the hero
      textAlign: { xs: "center", md: "left" },
      justifyItems: { xs: "center", md: "start" }
    },
    children: [
      e.securityNote && /* @__PURE__ */ D(
        A,
        {
          sx: {
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "center", md: "flex-start" },
            gap: 0.75
          },
          children: [
            /* @__PURE__ */ m(js, { sx: { fontSize: 14 } }),
            e.securityNote
          ]
        }
      ),
      e.supportLabel && /* @__PURE__ */ D(A, { children: [
        "Need access?",
        " ",
        e.supportUrl ? /* @__PURE__ */ m(
          Un,
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
      (e.copyright || e.copyrightHolder) && /* @__PURE__ */ D(A, { children: [
        e.copyright,
        e.copyright && e.copyrightHolder && " ",
        e.copyrightHolder && e.copyrightUrl ? (
          // Only the holder is linked; opens in a new tab so the sign-in page stays open
          /* @__PURE__ */ m(
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
  defaultPlatform: l,
  showOverview: f = !1,
  onPlatformChange: g,
  platformAssets: b,
  defaultColorMode: S,
  onColorModeChange: h,
  branding: C
}) => {
  const [y, x] = Oe("idle"), [_, w] = Oe(null), [T, $] = Oe(!1), [J, V] = Oe(
    () => f ? null : l ?? Ft.get() ?? at
  ), [M, j] = Oe(f);
  M !== f && (j(f), V(
    f ? null : l ?? Ft.get() ?? at
  ));
  const H = J ?? at;
  Be(() => {
    Ft.set(H);
  }, [H]);
  const { colorMode: u, toggleColorMode: F } = ua(
    S,
    h
  ), R = fi(C), I = gn(R, u, J), ee = () => `${window.location.origin}/callback`;
  if (Be(() => {
    const K = (O) => {
      O.persisted && x(
        (te) => te === "google-loading" || te === "microsoft-loading" ? "idle" : te
      );
    };
    return window.addEventListener("pageshow", K), () => window.removeEventListener("pageshow", K);
  }, []), Be(() => {
    $(zt());
  }, []), Be(() => {
    try {
      Ve(e.apiBaseUrl, e.apiKey);
    } catch (K) {
      console.error("Failed to initialize API client:", K);
    }
  }, [e.apiBaseUrl, e.apiKey]), !i && !s && !a && !c)
    throw new Error(
      "At least one sign-in method must be enabled (enableGoogleSignIn, enableMicrosoftSignIn, enableMagicLinkSignIn or enablePasskeySignIn)"
    );
  if (n && !o)
    throw new Error(
      "recaptchaSiteKey is required when enableRecaptcha is true"
    );
  const le = () => window.grecaptcha.execute(o, { action: "login" }).catch(() => {
    throw new Error("reCAPTCHA verification failed");
  }), me = async () => {
    if (!n || !o)
      return "";
    if (typeof window > "u" || !window.grecaptcha)
      throw new Error("reCAPTCHA is not loaded");
    return new Promise((K, O) => {
      const te = () => {
        le().then(K).catch(O);
      };
      window.grecaptcha.ready(te);
    });
  }, Fe = async (K, O) => {
    ze.setTokens(K.accessToken, K.refreshToken);
    const te = O ?? await Ge.getCurrentUser();
    x("success"), t({ user: te, tokens: K, platform: H });
  }, v = (K) => {
    V(K), K && g?.(K);
  }, k = (K) => {
    try {
      x(`${K}-loading`), w(null);
      const O = K === "google" ? Se.ENDPOINTS.GOOGLE_AUTH : Se.ENDPOINTS.MICROSOFT_AUTH;
      setTimeout(() => {
        Ge.initiateOAuth(
          O,
          ee(),
          e.apiBaseUrl
        );
      }, 300);
    } catch (O) {
      const te = O;
      w({ message: te.message, type: K }), x("error"), r(te);
    }
  }, L = async () => {
    x("passkey-loading"), w(null);
    try {
      const { tokens: K, user: O } = await Ge.loginWithPasskey();
      await Fe(K, O);
    } catch (K) {
      const O = K;
      w({ message: O.message, type: "passkey" }), x("error"), r(O);
    }
  }, B = async (K) => {
    x("magic-link-loading"), w(null);
    try {
      n && await me(), await Ge.requestMagicLink(K.email, ee()), x("magic-link-success");
    } catch (O) {
      const te = O;
      w({ message: te.message, type: "magic-link" }), x("error"), r(te);
    }
  }, W = () => {
    w(null), x("idle");
  };
  Be(() => {
    if (n && o && typeof window < "u") {
      const K = document.createElement("script");
      K.src = `https://www.google.com/recaptcha/enterprise.js?render=${o}`, K.async = !0, K.defer = !0, document.head.appendChild(K);
    }
  }, [n, o]);
  const Y = c && T, q = fa(y), N = i || s, z = a || Y, X = /* @__PURE__ */ m(
    oi,
    {
      theme: I,
      platform: J,
      platformAssets: b
    }
  ), Z = /* @__PURE__ */ m(
    oi,
    {
      theme: I,
      platform: J,
      platformAssets: b,
      compact: !0
    }
  );
  return y === "magic-link-success" ? /* @__PURE__ */ D(
    fn,
    {
      theme: I,
      hero: X,
      mobileHero: Z,
      footer: /* @__PURE__ */ m(ii, { brandConfig: R, theme: I }),
      children: [
        /* @__PURE__ */ m(
          uo,
          {
            brandConfig: R,
            theme: I,
            showWelcome: !1,
            onToggleColorMode: F
          }
        ),
        /* @__PURE__ */ m(A, { sx: { pt: 6 }, children: /* @__PURE__ */ m(
          Ll,
          {
            theme: I,
            title: R.magicLinkSuccessTitle || "Check your inbox",
            description: R.magicLinkSuccessDescription || "If this email address belongs to an active account, we have sent it a sign-in link.",
            onBackToLogin: W
          }
        ) })
      ]
    }
  ) : /* @__PURE__ */ D(
    fn,
    {
      theme: I,
      hero: X,
      mobileHero: Z,
      footer: /* @__PURE__ */ m(ii, { brandConfig: R, theme: I }),
      children: [
        /* @__PURE__ */ m(
          uo,
          {
            brandConfig: R,
            theme: I,
            onToggleColorMode: F
          }
        ),
        /* @__PURE__ */ m(
          xf,
          {
            theme: I,
            value: J,
            platformAssets: b,
            disabled: q,
            allowClear: f,
            onChange: v
          }
        ),
        d && _ && /* @__PURE__ */ m(
          Ms,
          {
            severity: "error",
            onClose: () => w(null),
            sx: {
              borderRadius: "10px",
              border: `1px solid ${I.errorBorder}`,
              backgroundColor: I.errorBg,
              color: I.errorText,
              fontFamily: I.bodyFont,
              fontSize: 15,
              transition: he,
              "& .MuiAlert-icon": { color: I.errorIcon },
              "& .MuiAlert-action .MuiIconButton-root": {
                color: I.errorText
              }
            },
            children: _.message
          }
        ),
        N && /* @__PURE__ */ D(
          A,
          {
            sx: {
              display: "grid",
              gridTemplateColumns: i && s ? "1fr 1fr" : "1fr",
              gap: 1.5
            },
            children: [
              i && /* @__PURE__ */ m(
                fo,
                {
                  theme: I,
                  icon: /* @__PURE__ */ m(Hs, {}),
                  label: "Google",
                  ariaLabel: "Continue with Google",
                  isLoading: y === "google-loading",
                  disabled: q,
                  onClick: () => k("google")
                }
              ),
              s && /* @__PURE__ */ m(
                fo,
                {
                  theme: I,
                  icon: /* @__PURE__ */ m(Pl, { monochrome: !0 }),
                  label: "Microsoft",
                  ariaLabel: "Continue with Microsoft",
                  isLoading: y === "microsoft-loading",
                  disabled: q,
                  onClick: () => k("microsoft")
                }
              )
            ]
          }
        ),
        N && z && /* @__PURE__ */ m(
          Fs,
          {
            sx: {
              fontFamily: I.bodyFont,
              fontSize: 16,
              color: I.label,
              transition: he,
              "&::before, &::after": {
                borderColor: I.divider,
                transition: he
              }
            },
            children: "or use your work email"
          }
        ),
        a && /* @__PURE__ */ m(
          $l,
          {
            theme: I,
            isSubmitting: y === "magic-link-loading",
            disabled: q,
            onSubmit: B
          }
        ),
        Y && /* @__PURE__ */ m(
          Ut,
          {
            fullWidth: !0,
            variant: "outlined",
            onClick: L,
            disabled: q,
            startIcon: y === "passkey-loading" ? /* @__PURE__ */ m(hn, { size: 16, color: "inherit" }) : void 0,
            sx: {
              ...ut,
              borderRadius: "10px",
              borderWidth: 1.5,
              borderColor: I.accent,
              backgroundColor: I.surface,
              color: I.accent,
              fontFamily: I.headingFont,
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: "0.14em",
              transition: he,
              "&:hover": {
                borderWidth: 1.5,
                borderColor: I.accentHover,
                backgroundColor: `${I.accent}0f`
              },
              "&.Mui-disabled": {
                borderWidth: 1.5,
                borderColor: I.border,
                color: I.muted
              },
              ...mr(I)
            },
            children: y === "passkey-loading" ? "Waiting for passkey..." : "Sign in with passkey"
          }
        ),
        d && y === "error" && /* @__PURE__ */ m(
          Ut,
          {
            variant: "text",
            onClick: W,
            sx: {
              alignSelf: "center",
              mt: -1.5,
              color: I.accent,
              fontFamily: I.headingFont,
              textTransform: "none",
              fontWeight: 600,
              ...mr(I)
            },
            children: "Try Again"
          }
        ),
        R.firstTimeSteps && R.firstTimeSteps.length > 0 && /* @__PURE__ */ m(
          Nf,
          {
            theme: I,
            title: R.firstTimeTitle || "First time here?",
            steps: R.firstTimeSteps
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
), Mf = typeof window > "u" ? Be : ks, Ff = (e, t) => ({
  mode: lr.get() ?? e ?? mi(),
  platform: t ?? Ft.get() ?? at
}), Bf = (e, t) => `(function(s){try{var e=s.parentElement,m=null,p=${JSON.stringify(t ?? null)};try{m=localStorage.getItem(${JSON.stringify(cr)});if(!p)p=localStorage.getItem(${JSON.stringify(ar)})}catch(x){}if(m!=='light'&&m!=='dark')m=${JSON.stringify(e ?? null)}||(window.matchMedia&&matchMedia(${JSON.stringify(bn)}).matches?'dark':'light');if(${JSON.stringify(ke.map((r) => r.id))}.indexOf(p)<0)p=${JSON.stringify(at)};e.setAttribute('data-mode',m);e.setAttribute('data-platform',p)}catch(x){}})(document.currentScript)`, Os = (e) => `--lumora-${e}-color`, si = (e, t, r) => {
  const n = gn(e, t, r), o = {
    "--lumora-bone": $f[t],
    "--lumora-hero": wt(r).color
  };
  return Object.entries(n).forEach(([i, s]) => {
    i !== "mode" && typeof s == "string" && (o[Os(i)] = s);
  }), o;
}, Uf = (e) => {
  const t = gn(e, "light", at);
  return Object.fromEntries(
    Object.entries(t).map(([r, n]) => [
      r,
      r === "mode" || typeof n != "string" ? n : `var(${Os(r)})`
    ])
  );
}, de = ({ width: e, height: t, radius: r = 6, color: n = "var(--lumora-bone)", sx: o }) => /* @__PURE__ */ m(
  Bs,
  {
    variant: "rounded",
    animation: "wave",
    width: e,
    height: t,
    sx: { bgcolor: n, borderRadius: r, flexShrink: 0, transform: "none", ...o }
  }
), $t = ({ sx: e }) => /* @__PURE__ */ m(de, { radius: "10px", sx: { ...ut, ...e } }), gp = ({
  defaultColorMode: e,
  defaultPlatform: t,
  branding: r
}) => {
  const n = fi(r), o = Uf(n), i = pn(null), s = Df();
  Mf(() => {
    const { mode: d, platform: l } = Ff(e, t);
    i.current?.setAttribute("data-mode", d), i.current?.setAttribute("data-platform", l);
  }, [e, t]);
  const a = {};
  ke.forEach(
    ({ id: d }) => If.forEach((l) => {
      a[`&[data-mode="${l}"][data-platform="${d}"]`] = si(
        n,
        l,
        d
      );
    })
  );
  const c = /* @__PURE__ */ D(
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
          backgroundImage: pi("rgba(255, 255, 255, 0.06)"),
          backgroundSize: "32px 32px"
        },
        "& > *": { position: "relative" }
      },
      children: [
        /* @__PURE__ */ D(A, { sx: { px: { md: 5, lg: 6 }, pt: { md: 7, lg: 9 } }, children: [
          /* @__PURE__ */ m(de, { width: 260, height: 12, color: It }),
          /* @__PURE__ */ m(de, { width: "72%", height: 56, radius: 10, color: It, sx: { mt: 3 } }),
          /* @__PURE__ */ m(de, { width: "48%", height: 56, radius: 10, color: It, sx: { mt: 1.5 } }),
          /* @__PURE__ */ m(de, { width: "58%", height: 16, color: It, sx: { mt: 3 } })
        ] }),
        /* @__PURE__ */ m(
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
  return /* @__PURE__ */ D(
    A,
    {
      ref: i,
      role: "status",
      "aria-busy": "true",
      "aria-label": "Loading sign-in",
      "data-testid": "lumora-login-skeleton",
      suppressHydrationWarning: !0,
      sx: {
        ...si(
          n,
          e ?? "light",
          t ?? at
        ),
        ...a
      },
      children: [
        s && /* @__PURE__ */ m(
          "script",
          {
            dangerouslySetInnerHTML: {
              __html: Bf(e, t)
            }
          }
        ),
        /* @__PURE__ */ D(
          fn,
          {
            theme: o,
            hero: c,
            mobileHero: /* @__PURE__ */ m(de, { height: 200, radius: "16px", color: "var(--lumora-hero)" }),
            footer: /* @__PURE__ */ D(A, { sx: { display: "flex", flexDirection: "column", gap: 1 }, children: [
              /* @__PURE__ */ m(de, { width: "70%", height: 10 }),
              /* @__PURE__ */ m(de, { width: "55%", height: 10 }),
              /* @__PURE__ */ m(de, { width: "45%", height: 10 })
            ] }),
            children: [
              /* @__PURE__ */ D(A, { children: [
                /* @__PURE__ */ D(A, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
                  /* @__PURE__ */ m(de, { width: 120, height: 32 }),
                  /* @__PURE__ */ m(de, { width: 30, height: 30, radius: "50%" })
                ] }),
                /* @__PURE__ */ m(de, { width: "78%", height: 42, radius: 8, sx: { mt: 4.5, [Ue]: { mt: 3 } } }),
                /* @__PURE__ */ m(de, { width: "46%", height: 42, radius: 8, sx: { mt: 1 } }),
                /* @__PURE__ */ m(de, { width: "88%", height: 16, sx: { mt: 2, [Ue]: { mt: 1.5 } } }),
                /* @__PURE__ */ m(de, { width: "30%", height: 16, sx: { mt: 1 } })
              ] }),
              /* @__PURE__ */ D(A, { children: [
                /* @__PURE__ */ m(de, { width: "58%", height: 12, sx: { mb: 1.5 } }),
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
                    children: [0, 1, 2].map((d) => /* @__PURE__ */ m(de, { radius: "8px", sx: { flex: 1, ...ut } }, d))
                  }
                )
              ] }),
              /* @__PURE__ */ D(A, { sx: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }, children: [
                /* @__PURE__ */ m($t, {}),
                /* @__PURE__ */ m($t, {})
              ] }),
              /* @__PURE__ */ D(A, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
                /* @__PURE__ */ m(A, { sx: { flex: 1, height: "1px", backgroundColor: o.divider } }),
                /* @__PURE__ */ m(de, { width: 150, height: 12 }),
                /* @__PURE__ */ m(A, { sx: { flex: 1, height: "1px", backgroundColor: o.divider } })
              ] }),
              /* @__PURE__ */ D(A, { children: [
                /* @__PURE__ */ m(de, { width: "30%", height: 12, sx: { mb: 1.5 } }),
                /* @__PURE__ */ D(A, { sx: { display: "flex", gap: 1.5 }, children: [
                  /* @__PURE__ */ m($t, { sx: { flex: 1, minWidth: 0 } }),
                  /* @__PURE__ */ m($t, { sx: { width: 110 } })
                ] }),
                /* @__PURE__ */ m($t, { sx: { mt: 2 } })
              ] }),
              /* @__PURE__ */ D(
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
                    /* @__PURE__ */ m(de, { width: "40%", height: 16 }),
                    /* @__PURE__ */ m(de, { width: "80%", height: 12 }),
                    /* @__PURE__ */ m(de, { width: "72%", height: 12 }),
                    /* @__PURE__ */ m(de, { width: "86%", height: 12 })
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
  const [t, r] = Oe(!0), [n, o] = Oe(null), i = pn(!1);
  return Be(() => {
    if (i.current)
      return;
    i.current = !0, (async () => {
      try {
        e?.apiBaseUrl && Ve(e.apiBaseUrl, e.apiKey);
        const a = new URLSearchParams(window.location.search);
        let c = a.get("access_token") || a.get("accessToken"), d = a.get("refresh_token") || a.get("refreshToken");
        const l = a.get("magic_token"), f = a.get("user"), g = a.get("error"), b = a.get("message");
        if (g) {
          const C = decodeURIComponent(b || g);
          throw new Error(C);
        }
        if (l) {
          const C = await Ge.verifyMagicLink(l);
          c = C.accessToken, d = C.refreshToken;
        }
        if (!c || !d)
          throw new Error("Missing authentication tokens in callback URL");
        ze.setTokens(c, d);
        let S;
        if (f)
          try {
            const C = decodeURIComponent(f);
            S = JSON.parse(C);
          } catch (C) {
            console.warn("Failed to parse user from URL, fetching from API:", C), S = await Ge.getCurrentUser();
          }
        else
          S = await Ge.getCurrentUser();
        e?.onSuccess?.({ accessToken: c, refreshToken: d }, S, Ft.get());
        const h = e?.redirectPath || "/dashboard";
        window.history.replaceState({}, document.title, h), r(!1);
      } catch (a) {
        const c = a;
        o(c), e?.onError?.(c), r(!1);
      }
    })();
  }, [e?.redirectPath]), { loading: t, error: n };
}, bp = (e) => ({ logout: Ps(async () => {
  const r = ze.getRefreshToken();
  if (e?.apiBaseUrl && r)
    try {
      await Ge.logout(r);
    } catch (n) {
      console.error("Logout API call failed:", n);
    }
  ze.clearTokens(), window.location.href = "/login";
}, [e?.apiBaseUrl]) }), Sp = (e) => {
  const [t, r] = Oe(!1), [n, o] = Oe(null), [i, s] = Oe(!1);
  return Be(() => {
    s(zt());
  }, []), { registerPasskey: async (c) => {
    r(!0), o(null);
    try {
      return e?.apiBaseUrl && Ve(e.apiBaseUrl, e.apiKey), await Ge.registerPasskey(c);
    } catch (d) {
      return o(d), null;
    } finally {
      r(!1);
    }
  }, loading: t, error: n, isSupported: i };
};
export {
  lr as ColorModeStorage,
  mp as LumoraLogin,
  gp as LumoraLoginSkeleton,
  ke as PLATFORMS,
  Ft as PlatformStorage,
  ze as TokenStorage,
  fi as getBrandingConfig,
  ra as getDefaultBranding,
  yp as useAuthCallback,
  bp as useLogout,
  Sp as usePasskeyRegistration
};
