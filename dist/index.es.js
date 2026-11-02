import { jsxs as y, jsx as d, Fragment as Kt } from "react/jsx-runtime";
import we, { useState as q, useEffect as Y, useId as kr, useRef as ve, useLayoutEffect as Pr, useSyncExternalStore as _n, useCallback as Cn } from "react";
import { clsx as kn } from "clsx";
import { extendTailwindMerge as Pn } from "tailwind-merge";
import { CircleAlertIcon as vn, XIcon as Ln, Loader2Icon as In, MailCheckIcon as Dn, LockIcon as Un } from "lucide-react";
import { cva as Fn } from "class-variance-authority";
import { Tooltip as Me, Label as Bn } from "radix-ui";
import { appendErrors as Mn, useForm as Hn } from "react-hook-form";
import { validateFieldsNatively as jn, toNestErrors as $n } from "@hookform/resolvers";
import * as Wt from "yup";
function se(e) {
  const t = new Uint8Array(e);
  let r = "";
  for (const l of t)
    r += String.fromCharCode(l);
  return btoa(r).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function ht(e) {
  const t = e.replace(/-/g, "+").replace(/_/g, "/"), r = (4 - t.length % 4) % 4, n = t.padEnd(t.length + r, "="), l = atob(n), o = new ArrayBuffer(l.length), s = new Uint8Array(o);
  for (let i = 0; i < l.length; i++)
    s[i] = l.charCodeAt(i);
  return o;
}
function Je() {
  return Vn.stubThis(globalThis?.PublicKeyCredential !== void 0 && typeof globalThis.PublicKeyCredential == "function");
}
const Vn = {
  stubThis: (e) => e
};
function vr(e) {
  const { id: t } = e;
  return {
    ...e,
    id: ht(t),
    transports: e.transports,
    type: e.type
  };
}
function Lr(e) {
  return (
    // Consider localhost valid as well since it's okay wrt Secure Contexts
    e === "localhost" || // Support punycode (ACE) or ascii labels and domains
    /^((xn--[a-z0-9-]+|[a-z0-9]+(-[a-z0-9]+)*)\.)+([a-z]{2,}|xn--[a-z0-9-]+)$/i.test(e)
  );
}
class M extends Error {
  constructor({ message: t, code: r, cause: n, name: l }) {
    super(t, { cause: n }), Object.defineProperty(this, "code", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: void 0
    }), this.name = l ?? n.name, this.code = r;
  }
}
function qn({ error: e, options: t }) {
  const { publicKey: r } = t;
  if (!r)
    throw Error("options was missing required publicKey property");
  if (e.name === "AbortError") {
    if (t.signal instanceof AbortSignal)
      return new M({
        message: "Registration ceremony was sent an abort signal",
        code: "ERROR_CEREMONY_ABORTED",
        cause: e
      });
  } else if (e.name === "ConstraintError") {
    if (r.authenticatorSelection?.requireResidentKey === !0)
      return new M({
        message: "Discoverable credentials were required but no available authenticator supported it",
        code: "ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT",
        cause: e
      });
    if (
      // @ts-ignore: `mediation` doesn't yet exist on CredentialCreationOptions but it's possible as of Sept 2024
      t.mediation === "conditional" && r.authenticatorSelection?.userVerification === "required"
    )
      return new M({
        message: "User verification was required during automatic registration but it could not be performed",
        code: "ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE",
        cause: e
      });
    if (r.authenticatorSelection?.userVerification === "required")
      return new M({
        message: "User verification was required but no available authenticator supported it",
        code: "ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT",
        cause: e
      });
  } else {
    if (e.name === "InvalidStateError")
      return new M({
        message: "The authenticator was previously registered",
        code: "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED",
        cause: e
      });
    if (e.name === "NotAllowedError")
      return new M({
        message: e.message,
        code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
        cause: e
      });
    if (e.name === "NotSupportedError")
      return r.pubKeyCredParams.filter((l) => l.type === "public-key").length === 0 ? new M({
        message: 'No entry in pubKeyCredParams was of type "public-key"',
        code: "ERROR_MALFORMED_PUBKEYCREDPARAMS",
        cause: e
      }) : new M({
        message: "No available authenticator supported any of the specified pubKeyCredParams algorithms",
        code: "ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG",
        cause: e
      });
    if (e.name === "SecurityError") {
      const n = globalThis.location.hostname;
      if (Lr(n)) {
        if (r.rp.id !== n)
          return new M({
            message: `The RP ID "${r.rp.id}" is invalid for this domain`,
            code: "ERROR_INVALID_RP_ID",
            cause: e
          });
      } else return new M({
        message: `${globalThis.location.hostname} is an invalid domain`,
        code: "ERROR_INVALID_DOMAIN",
        cause: e
      });
    } else if (e.name === "TypeError") {
      if (r.user.id.byteLength < 1 || r.user.id.byteLength > 64)
        return new M({
          message: "User ID was not between 1 and 64 characters",
          code: "ERROR_INVALID_USER_ID_LENGTH",
          cause: e
        });
    } else if (e.name === "UnknownError")
      return new M({
        message: "The authenticator was unable to process the specified options, or could not create a new credential",
        code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
        cause: e
      });
  }
  return e;
}
class zn {
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
const Ir = new zn(), Kn = ["cross-platform", "platform"];
function Dr(e) {
  if (e && !(Kn.indexOf(e) < 0))
    return e;
}
async function Wn(e) {
  !e.optionsJSON && e.challenge && (console.warn("startRegistration() was not called correctly. It will try to continue with the provided options, but this call should be refactored to use the expected call structure instead. See https://simplewebauthn.dev/docs/packages/browser#typeerror-cannot-read-properties-of-undefined-reading-challenge for more information."), e = { optionsJSON: e });
  const { optionsJSON: t, useAutoRegister: r = !1 } = e;
  if (!Je())
    throw new Error("WebAuthn is not supported in this browser");
  const n = {
    ...t,
    challenge: ht(t.challenge),
    user: {
      ...t.user,
      id: ht(t.user.id)
    },
    excludeCredentials: t.excludeCredentials?.map(vr)
  }, l = {};
  r && (l.mediation = "conditional"), l.publicKey = n, l.signal = Ir.createNewAbortSignal();
  let o;
  try {
    o = await navigator.credentials.create(
      // TODO: Newer versions of Deno require this casting, revisit once we're using Deno 2.6+
      l
    );
  } catch (x) {
    throw qn({ error: x, options: l });
  }
  if (!o)
    throw new Error("Registration was not completed");
  const { id: s, rawId: i, response: a, type: f } = o;
  let u;
  typeof a.getTransports == "function" && (u = a.getTransports());
  let h;
  if (typeof a.getPublicKeyAlgorithm == "function")
    try {
      h = a.getPublicKeyAlgorithm();
    } catch (x) {
      St("getPublicKeyAlgorithm()", x);
    }
  let g;
  if (typeof a.getPublicKey == "function")
    try {
      const x = a.getPublicKey();
      x !== null && (g = se(x));
    } catch (x) {
      St("getPublicKey()", x);
    }
  let E;
  if (typeof a.getAuthenticatorData == "function")
    try {
      E = se(a.getAuthenticatorData());
    } catch (x) {
      St("getAuthenticatorData()", x);
    }
  return {
    id: s,
    rawId: se(i),
    response: {
      attestationObject: se(a.attestationObject),
      clientDataJSON: se(a.clientDataJSON),
      transports: u,
      publicKeyAlgorithm: h,
      publicKey: g,
      authenticatorData: E
    },
    type: f,
    clientExtensionResults: o.getClientExtensionResults(),
    authenticatorAttachment: Dr(o.authenticatorAttachment)
  };
}
function St(e, t) {
  console.warn(`The browser extension that intercepted this WebAuthn API call incorrectly implemented ${e}. You should report this error to them.
`, t);
}
function Gn() {
  if (!Je())
    return Rt.stubThis(new Promise((t) => t(!1)));
  const e = globalThis.PublicKeyCredential;
  return e?.isConditionalMediationAvailable === void 0 ? Rt.stubThis(new Promise((t) => t(!1))) : Rt.stubThis(e.isConditionalMediationAvailable());
}
const Rt = {
  stubThis: (e) => e
};
function Jn({ error: e, options: t }) {
  const { publicKey: r } = t;
  if (!r)
    throw Error("options was missing required publicKey property");
  if (e.name === "AbortError") {
    if (t.signal instanceof AbortSignal)
      return new M({
        message: "Authentication ceremony was sent an abort signal",
        code: "ERROR_CEREMONY_ABORTED",
        cause: e
      });
  } else {
    if (e.name === "NotAllowedError")
      return new M({
        message: e.message,
        code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
        cause: e
      });
    if (e.name === "SecurityError") {
      const n = globalThis.location.hostname;
      if (Lr(n)) {
        if (r.rpId !== n)
          return new M({
            message: `The RP ID "${r.rpId}" is invalid for this domain`,
            code: "ERROR_INVALID_RP_ID",
            cause: e
          });
      } else return new M({
        message: `${globalThis.location.hostname} is an invalid domain`,
        code: "ERROR_INVALID_DOMAIN",
        cause: e
      });
    } else if (e.name === "UnknownError")
      return new M({
        message: "The authenticator was unable to process the specified options, or could not create a new assertion signature",
        code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
        cause: e
      });
  }
  return e;
}
async function Yn(e) {
  !e.optionsJSON && e.challenge && (console.warn("startAuthentication() was not called correctly. It will try to continue with the provided options, but this call should be refactored to use the expected call structure instead. See https://simplewebauthn.dev/docs/packages/browser#typeerror-cannot-read-properties-of-undefined-reading-challenge for more information."), e = { optionsJSON: e });
  const { optionsJSON: t, useBrowserAutofill: r = !1, verifyBrowserAutofillInput: n = !0 } = e;
  if (!Je())
    throw new Error("WebAuthn is not supported in this browser");
  let l;
  t.allowCredentials?.length !== 0 && (l = t.allowCredentials?.map(vr));
  const o = {
    ...t,
    challenge: ht(t.challenge),
    allowCredentials: l
  }, s = {};
  if (r) {
    if (!await Gn())
      throw Error("Browser does not support WebAuthn autofill");
    if (document.querySelectorAll("input[autocomplete$='webauthn']").length < 1 && n)
      throw Error('No <input> with "webauthn" as the only or last value in its `autocomplete` attribute was detected');
    s.mediation = "conditional", o.allowCredentials = [];
  }
  s.publicKey = o, s.signal = Ir.createNewAbortSignal();
  let i;
  try {
    i = await navigator.credentials.get(
      // TODO: Newer versions of Deno require this casting, revisit once we're using Deno 2.6+
      s
    );
  } catch (E) {
    throw Jn({ error: E, options: s });
  }
  if (!i)
    throw new Error("Authentication was not completed");
  const { id: a, rawId: f, response: u, type: h } = i;
  let g;
  return u.userHandle && (g = se(u.userHandle)), {
    id: a,
    rawId: se(f),
    response: {
      authenticatorData: se(u.authenticatorData),
      clientDataJSON: se(u.clientDataJSON),
      signature: se(u.signature),
      userHandle: g
    },
    type: h,
    clientExtensionResults: i.getClientExtensionResults(),
    authenticatorAttachment: Dr(i.authenticatorAttachment)
  };
}
const Zn = () => ({
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
}), Ur = (e) => ({
  ...Zn(),
  ...e
}), Xn = {
  pageBg: "#0e1d1a",
  surface: "#152824",
  border: "#28403a",
  heading: "#e9f1ef",
  text: "#c2d0cc",
  muted: "#8ea29d",
  heroBg: "#12231f"
}, Z = [
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
    loadScreenshot: (e) => (e === "dark" ? import("./centra-dark-C8ZVwn3t.js") : import("./centra-BoXGfEzi.js")).then((t) => t.default)
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
], Ee = "centra", ke = (e) => Z.find((t) => t.id === e), st = "lumora_platform", pt = {
  /**
   * Get the stored platform
   * @returns The platform id or null when none was chosen
   */
  get: () => {
    try {
      const e = localStorage.getItem(st);
      return Z.some((t) => t.id === e) ? e : null;
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
      e ? localStorage.setItem(st, e) : localStorage.removeItem(st);
    } catch {
    }
  }
}, Ye = "ll:h-[50px] ll:short:h-[46px]", Qn = "0 1px 2px rgba(18, 51, 45, 0.06), 0 8px 24px rgba(18, 51, 45, 0.06)", Fr = (e, t, r) => {
  const n = t === "dark", l = r ? ke(r) : null, o = l ? n ? l.colorOnDark : l.uiColor : e.primaryColor, s = l ? l.dark : Xn;
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
    accent: o,
    // Hover darkens the accent slightly
    accentHover: l ? `color-mix(in srgb, ${o} 85%, #000)` : e.secondaryColor,
    // Dark mode's bright accents fail with white text (about 3:1); dark text passes (5:1+)
    buttonText: n ? "#04201c" : e.buttonTextColor,
    headingFont: e.headingFontFamily,
    bodyFont: e.bodyFontFamily
  };
}, Br = (e) => {
  const t = {};
  return Object.entries(e).forEach(([r, n]) => {
    r !== "mode" && typeof n == "string" && (t[`--lumora-${r.replace(/[A-Z]/g, (l) => `-${l.toLowerCase()}`)}`] = n);
  }), t;
}, Pe = "cubic-bezier(0.2, 0.7, 0.2, 1)", Dt = 350, el = "cubic-bezier(0.4, 0, 0.2, 1)", bt = (...e) => e.map((t) => `${t} ${Dt}ms ${el}`).join(", "), tl = bt(
  "background-color",
  "border-color",
  "color",
  "box-shadow"
), X = "ll:transition-[background-color,border-color,color,box-shadow] ll:duration-[350ms] ll:ease-[cubic-bezier(0.4,0,0.2,1)]", rl = bt("fill", "stroke"), nl = "lumora-fade-up", ll = "lumora-slide-in-frame", Gt = "lumora-rise-in", ue = (e = 0, t = 500) => `${nl} ${t}ms ${Pe} ${e}ms both`, ol = Pn({ prefix: "ll" }), N = (...e) => ol(kn(e)), it = "lumora_color_mode", Ut = "(prefers-color-scheme: dark)", Mr = () => typeof window > "u" || !window.matchMedia ? "light" : window.matchMedia(Ut).matches ? "dark" : "light", at = {
  /**
   * Get the stored colour mode
   * @returns The user's choice, or null when they never toggled
   */
  get: () => {
    try {
      const e = localStorage.getItem(it);
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
      localStorage.setItem(it, e);
    } catch {
    }
  },
  /**
   * Forget the user's choice, so the page follows the system again
   */
  clear: () => {
    try {
      localStorage.removeItem(it);
    } catch {
    }
  }
}, sl = (e, t) => {
  const [r, n] = q(
    () => at.get() !== null
  ), [l, o] = q(
    () => at.get() ?? e ?? Mr()
  ), s = !r && !e;
  return Y(() => {
    if (!s || typeof window > "u" || !window.matchMedia)
      return;
    const a = window.matchMedia(Ut), f = (u) => o(u.matches ? "dark" : "light");
    return a.addEventListener("change", f), () => a.removeEventListener("change", f);
  }, [s]), { colorMode: l, toggleColorMode: () => {
    const a = l === "dark" ? "light" : "dark";
    o(a), n(!0), at.set(a), t?.(a);
  } };
}, il = [
  "google-loading",
  "microsoft-loading",
  "passkey-loading",
  "magic-link-loading"
], al = (e) => il.includes(e), ie = {
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
  hasTokens: () => !!(ie.getAccessToken() && ie.getRefreshToken())
}, U = {
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
}, cl = {
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
function Hr(e, t) {
  return function() {
    return e.apply(t, arguments);
  };
}
const { toString: dl } = Object.prototype, { getPrototypeOf: pe } = Object, { iterator: Ze, toStringTag: jr } = Symbol, We = (({ hasOwnProperty: e }) => (t, r) => e.call(t, r))(Object.prototype), $r = (e) => typeof e == "string" && (e === "__proto__" || e === "constructor" || e === "prototype"), Vr = (e, t, r) => e === Object.prototype || !r && t === null, ul = (e) => {
  if (!Object.isExtensible(e))
    return !1;
  const t = Object.getOwnPropertyNames(e);
  return Object.getOwnPropertySymbols && t.push(...Object.getOwnPropertySymbols(e)), t.every((r) => {
    if ($r(r))
      return !1;
    const n = Object.getOwnPropertyDescriptor(e, r);
    return !!n && n.configurable && n.writable === !0;
  });
}, Ge = (e, t) => {
  let r = e;
  const n = [];
  for (; r != null; ) {
    if (n.indexOf(r) !== -1)
      return !1;
    n.push(r);
    const l = pe(r);
    if (Vr(r, l, r === e))
      return !1;
    if (We(r, t))
      return !0;
    r = l;
  }
  return !1;
}, fl = (e, t) => e != null && Ge(e, t) ? e[t] : void 0, hl = (e) => {
  if (e == null || typeof e != "object" && typeof e != "function")
    return e;
  const t = pe(e);
  if (t === null && ul(e))
    return e;
  const r = /* @__PURE__ */ Object.create(null), n = /* @__PURE__ */ Object.create(null), l = [];
  let o = e;
  for (; o != null && l.indexOf(o) === -1; ) {
    l.push(o);
    const s = o === e ? t : pe(o);
    if (Vr(o, s, o === e))
      break;
    const i = Object.getOwnPropertyNames(o);
    Object.getOwnPropertySymbols && i.push(...Object.getOwnPropertySymbols(o));
    for (const a of i)
      $r(a) || We(n, a) || (r[a] = e[a], n[a] = !0);
    o = s;
  }
  return r;
}, Ft = /* @__PURE__ */ ((e) => (t) => {
  const r = dl.call(t);
  return e[r] || (e[r] = r.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), te = (e) => (e = e.toLowerCase(), (t) => Ft(t) === e), yt = (e) => (t) => typeof t === e, { isArray: Se } = Array, Re = yt("undefined");
function Ie(e) {
  return e !== null && !Re(e) && e.constructor !== null && !Re(e.constructor) && W(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}
const qr = te("ArrayBuffer");
function pl(e) {
  let t;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? t = ArrayBuffer.isView(e) : t = e && e.buffer && qr(e.buffer), t;
}
const ml = yt("string"), W = yt("function"), zr = yt("number"), De = (e) => e !== null && typeof e == "object", gl = (e) => e === !0 || e === !1, ct = (e) => {
  if (!De(e))
    return !1;
  const t = pe(e);
  return (t === null || t === Object.prototype || pe(t) === null) && // Treat safe own/inherited Symbol.toStringTag or Symbol.iterator members as
  // evidence the value is tagged/iterable, while ignoring members reachable
  // only through shared or terminal prototype boundaries.
  !Ge(e, jr) && !Ge(e, Ze);
}, bl = (e) => {
  if (!De(e) || Ie(e))
    return !1;
  try {
    return Object.keys(e).length === 0 && Object.getPrototypeOf(e) === Object.prototype;
  } catch {
    return !1;
  }
}, yl = te("Date"), wl = te("File"), El = (e) => !!(e && typeof e.uri < "u"), xl = (e) => e && typeof e.getParts < "u", Sl = te("Blob"), Rl = te("FileList"), Ol = te("Set"), Nl = (e) => De(e) && W(e.pipe);
function Tl() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
}
const Jt = Tl(), Yt = typeof Jt.FormData < "u" ? Jt.FormData : void 0, Al = (e) => {
  if (!e) return !1;
  if (Yt && e instanceof Yt) return !0;
  const t = pe(e);
  if (!t || t === Object.prototype || !W(e.append)) return !1;
  const r = Ft(e);
  return r === "formdata" || // detect form-data instance
  r === "object" && W(e.toString) && e.toString() === "[object FormData]";
}, _l = te("URLSearchParams"), [Cl, kl, Pl, vl] = [
  "ReadableStream",
  "Request",
  "Response",
  "Headers"
].map(te), Ll = (e) => e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function Xe(e, t, { allOwnKeys: r = !1 } = {}) {
  if (e === null || typeof e > "u")
    return;
  let n, l;
  if (typeof e != "object" && (e = [e]), Se(e))
    for (n = 0, l = e.length; n < l; n++)
      t.call(null, e[n], n, e);
  else {
    if (Ie(e))
      return;
    const o = r ? Object.getOwnPropertyNames(e) : Object.keys(e), s = o.length;
    let i;
    for (n = 0; n < s; n++)
      i = o[n], t.call(null, e[i], i, e);
  }
}
function Kr(e, t) {
  if (Ie(e))
    return null;
  t = t.toLowerCase();
  const r = Object.keys(e);
  let n = r.length, l;
  for (; n-- > 0; )
    if (l = r[n], t === l.toLowerCase())
      return l;
  return null;
}
const ye = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, Wr = (e) => !Re(e) && e !== ye;
function Pt(...e) {
  const { caseless: t, skipUndefined: r } = Wr(this) && this || {}, n = {}, l = (o, s) => {
    if (s === "__proto__" || s === "constructor" || s === "prototype")
      return;
    const i = t && typeof s == "string" && Kr(n, s) || s, a = We(n, i) ? n[i] : void 0;
    ct(a) && ct(o) ? n[i] = Pt(a, o) : ct(o) ? n[i] = Pt({}, o) : Se(o) ? n[i] = o.slice() : (!r || !Re(o)) && (n[i] = o);
  };
  for (let o = 0, s = e.length; o < s; o++) {
    const i = e[o];
    if (!i || Ie(i) || (Xe(i, l), typeof i != "object" || Se(i)))
      continue;
    const a = Object.getOwnPropertySymbols(i);
    for (let f = 0; f < a.length; f++) {
      const u = a[f];
      zl.call(i, u) && l(i[u], u);
    }
  }
  return n;
}
const Il = (e, t, r, { allOwnKeys: n } = {}) => (Xe(
  t,
  (l, o) => {
    r && W(l) ? Object.defineProperty(e, o, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot
      // hijack defineProperty's accessor-vs-data resolution.
      __proto__: null,
      value: Hr(l, r),
      writable: !0,
      enumerable: !0,
      configurable: !0
    }) : Object.defineProperty(e, o, {
      __proto__: null,
      value: l,
      writable: !0,
      enumerable: !0,
      configurable: !0
    });
  },
  { allOwnKeys: n }
), e), Dl = (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e), Ul = (e, t, r, n) => {
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
}, Fl = (e, t, r, n) => {
  let l, o, s;
  const i = {};
  if (t = t || {}, e == null) return t;
  do {
    for (l = Object.getOwnPropertyNames(e), o = l.length; o-- > 0; )
      s = l[o], (!n || n(s, e, t)) && !i[s] && (t[s] = e[s], i[s] = !0);
    e = r !== !1 && pe(e);
  } while (e && (!r || r(e, t)) && e !== Object.prototype);
  return t;
}, Bl = (e, t, r) => {
  e = String(e), (r === void 0 || r > e.length) && (r = e.length), r -= t.length;
  const n = e.indexOf(t, r);
  return n !== -1 && n === r;
}, Ml = (e) => {
  if (!e) return null;
  if (Se(e)) return e;
  let t = e.length;
  if (!zr(t)) return null;
  const r = new Array(t);
  for (; t-- > 0; )
    r[t] = e[t];
  return r;
}, Hl = /* @__PURE__ */ ((e) => (t) => e && t instanceof e)(typeof Uint8Array < "u" && pe(Uint8Array)), jl = (e, t) => {
  const n = (e && e[Ze]).call(e);
  let l;
  for (; (l = n.next()) && !l.done; ) {
    const o = l.value;
    t.call(e, o[0], o[1]);
  }
}, $l = (e, t) => {
  let r;
  const n = [];
  for (; (r = e.exec(t)) !== null; )
    n.push(r);
  return n;
}, Vl = te("HTMLFormElement"), ql = (e) => e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function(r, n, l) {
  return n.toUpperCase() + l;
}), { propertyIsEnumerable: zl } = Object.prototype, Kl = te("RegExp"), Gr = (e, t) => {
  const r = Object.getOwnPropertyDescriptors(e), n = {};
  Xe(r, (l, o) => {
    let s;
    (s = t(l, o, e)) !== !1 && (n[o] = s || l);
  }), Object.defineProperties(e, n);
}, Wl = (e) => {
  Gr(e, (t, r) => {
    if (W(e) && ["arguments", "caller", "callee"].includes(r))
      return !1;
    const n = e[r];
    if (W(n)) {
      if (t.enumerable = !1, "writable" in t) {
        t.writable = !1;
        return;
      }
      t.set || (t.set = () => {
        throw Error("Can not rewrite read-only method '" + r + "'");
      });
    }
  });
}, Gl = (e, t) => {
  const r = {}, n = (l) => {
    l.forEach((o) => {
      r[o] = !0;
    });
  };
  return Se(e) ? n(e) : n(String(e).split(t)), r;
}, Jl = () => {
}, Yl = (e, t) => e != null && Number.isFinite(e = +e) ? e : t;
function Zl(e) {
  return !!(e && W(e.append) && e[jr] === "FormData" && e[Ze]);
}
const Xl = (e) => {
  const t = /* @__PURE__ */ new WeakSet(), r = (n) => {
    if (De(n)) {
      if (t.has(n))
        return;
      if (Ie(n))
        return n;
      if (!("toJSON" in n)) {
        t.add(n);
        let l;
        if (Ol(n)) {
          l = [];
          for (const o of n) {
            const s = r(o);
            !Re(s) && l.push(s);
          }
        } else
          l = Se(n) ? [] : {}, Xe(n, (o, s) => {
            const i = r(o);
            !Re(i) && (l[s] = i);
          });
        return t.delete(n), l;
      }
    }
    return n;
  };
  return r(e);
}, Ql = te("AsyncFunction"), eo = (e) => e && (De(e) || W(e)) && W(e.then) && W(e.catch), Jr = ((e, t) => e ? setImmediate : t ? ((r, n) => (ye.addEventListener(
  "message",
  ({ source: l, data: o }) => {
    l === ye && o === r && n.length && n.shift()();
  },
  !1
), (l) => {
  n.push(l), ye.postMessage(r, "*");
}))(`axios@${Math.random()}`, []) : (r) => setTimeout(r))(typeof setImmediate == "function", W(ye.postMessage)), to = typeof queueMicrotask < "u" ? queueMicrotask.bind(ye) : typeof process < "u" && process.nextTick || Jr, Yr = (e) => e != null && W(e[Ze]), ro = (e) => e != null && Ge(e, Ze) && Yr(e), c = {
  isArray: Se,
  isArrayBuffer: qr,
  isBuffer: Ie,
  isFormData: Al,
  isArrayBufferView: pl,
  isString: ml,
  isNumber: zr,
  isBoolean: gl,
  isObject: De,
  isPlainObject: ct,
  isEmptyObject: bl,
  isReadableStream: Cl,
  isRequest: kl,
  isResponse: Pl,
  isHeaders: vl,
  isUndefined: Re,
  isDate: yl,
  isFile: wl,
  isReactNativeBlob: El,
  isReactNative: xl,
  isBlob: Sl,
  isRegExp: Kl,
  isFunction: W,
  isStream: Nl,
  isURLSearchParams: _l,
  isTypedArray: Hl,
  isFileList: Rl,
  forEach: Xe,
  merge: Pt,
  extend: Il,
  trim: Ll,
  stripBOM: Dl,
  inherits: Ul,
  toFlatObject: Fl,
  kindOf: Ft,
  kindOfTest: te,
  endsWith: Bl,
  toArray: Ml,
  forEachEntry: jl,
  matchAll: $l,
  isHTMLForm: Vl,
  hasOwnProperty: We,
  hasOwnProp: We,
  // an alias to avoid ESLint no-prototype-builtins detection
  hasOwnInPrototypeChain: Ge,
  getSafeProp: fl,
  toSafeFlatObject: hl,
  reduceDescriptors: Gr,
  freezeMethods: Wl,
  toObjectSet: Gl,
  toCamelCase: ql,
  noop: Jl,
  toFiniteNumber: Yl,
  findKey: Kr,
  global: ye,
  isContextDefined: Wr,
  isSpecCompliantForm: Zl,
  toJSONObject: Xl,
  isAsyncFn: Ql,
  isThenable: eo,
  setImmediate: Jr,
  asap: to,
  isIterable: Yr,
  isSafeIterable: ro
}, no = c.toObjectSet([
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
]), lo = (e) => {
  const t = {};
  let r, n, l;
  return e && e.split(`
`).forEach(function(s) {
    l = s.indexOf(":"), r = s.substring(0, l).trim().toLowerCase(), n = s.substring(l + 1).trim();
    const i = c.hasOwnProp(t, r);
    !r || i && c.hasOwnProp(no, r) || (r === "set-cookie" ? i ? t[r].push(n) : t[r] = [n] : t[r] = i ? t[r] + ", " + n : n);
  }), t;
};
function oo(e) {
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
const so = new RegExp("[\\u0000-\\u0008\\u000a-\\u001f\\u007f]+", "g"), io = new RegExp("[^\\u0009\\u0020-\\u007e\\u0080-\\u00ff]+", "g");
function Bt(e, t) {
  return c.isArray(e) ? e.map((r) => Bt(r, t)) : oo(String(e).replace(t, ""));
}
const ao = (e) => Bt(e, so), co = (e) => Bt(e, io);
function Zr(e) {
  const t = /* @__PURE__ */ Object.create(null);
  return c.forEach(e.toJSON(), (r, n) => {
    t[n] = co(r);
  }), t;
}
const Zt = /* @__PURE__ */ Symbol("internals");
function He(e) {
  return e && String(e).trim().toLowerCase();
}
function dt(e) {
  return e === !1 || e == null ? e : c.isArray(e) ? e.map(dt) : ao(String(e));
}
function uo(e) {
  const t = /* @__PURE__ */ Object.create(null), r = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let n;
  for (; n = r.exec(e); )
    t[n[1]] = n[2];
  return t;
}
const fo = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
function Ot(e) {
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
function ho(e) {
  const t = e.length - 1;
  if (t < 1 || e.charCodeAt(0) !== 34 || e.charCodeAt(t) !== 34)
    return e;
  let r = "";
  for (let n = 1; n < t; n++) {
    const l = e.charCodeAt(n);
    if (l === 34 || l === 92 && (n += 1, n >= t))
      return e;
    r += e[n];
  }
  return r;
}
function po(e) {
  const t = /* @__PURE__ */ Object.create(null), r = String(e);
  let n = 0, l = !1, o = !1;
  function s(i) {
    const a = Ot(r.slice(n, i)), f = a.indexOf("=");
    if (f < 1)
      return;
    const u = Ot(a.slice(0, f));
    if (!fo.test(u))
      return;
    const h = u.toLowerCase();
    if (h === "__proto__" || h === "constructor" || h === "prototype")
      return;
    const g = Ot(a.slice(f + 1));
    t[h] = ho(g);
  }
  for (let i = 0; i < r.length; i++) {
    const a = r.charCodeAt(i);
    l ? o ? o = !1 : a === 92 ? o = !0 : a === 34 && (l = !1) : a === 34 ? l = !0 : (a === 44 || a === 59) && (s(i), n = i + 1);
  }
  return s(r.length), t;
}
const mo = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
function Nt(e, t, r, n, l) {
  if (c.isFunction(n))
    return n.call(this, t, r);
  if (l && (t = r), !!c.isString(t)) {
    if (c.isString(n))
      return t.indexOf(n) !== -1;
    if (c.isRegExp(n))
      return n.test(t);
  }
}
function go(e) {
  return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (t, r, n) => r.toUpperCase() + n);
}
function bo(e, t) {
  const r = c.toCamelCase(" " + t);
  ["get", "set", "has"].forEach((n) => {
    Object.defineProperty(e, n + r, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot turn
      // this data descriptor into an accessor descriptor on the way in.
      __proto__: null,
      value: function(l, o, s) {
        return this[n].call(this, t, l, o, s);
      },
      configurable: !0
    });
  });
}
let $ = class {
  constructor(t) {
    t && this.set(t);
  }
  set(t, r, n) {
    const l = this;
    function o(i, a, f) {
      const u = He(a);
      if (!u)
        return;
      const h = c.findKey(l, u);
      (!h || l[h] === void 0 || f === !0 || f === void 0 && l[h] !== !1) && (l[h || a] = dt(i));
    }
    const s = (i, a) => c.forEach(i, (f, u) => o(f, u, a));
    if (c.isPlainObject(t) || t instanceof this.constructor)
      s(t, r);
    else if (c.isString(t) && (t = t.trim()) && !mo(t))
      s(lo(t), r);
    else if (c.isObject(t) && c.isSafeIterable(t)) {
      let i = /* @__PURE__ */ Object.create(null), a, f;
      for (const u of t) {
        if (!c.isArray(u))
          throw new TypeError("Object iterator must return a key-value pair");
        f = u[0], c.hasOwnProp(i, f) ? (a = i[f], i[f] = c.isArray(a) ? [...a, u[1]] : [a, u[1]]) : i[f] = u[1];
      }
      s(i, r);
    } else
      t != null && o(r, t, n);
    return this;
  }
  get(t, r) {
    if (t = He(t), t) {
      const n = c.findKey(this, t);
      if (n) {
        const l = this[n];
        if (!r)
          return l;
        if (r === !0)
          return uo(l);
        if (c.isFunction(r))
          return r.call(this, l, n);
        if (c.isRegExp(r))
          return r.exec(l);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(t, r) {
    if (t = He(t), t) {
      const n = c.findKey(this, t);
      return !!(n && this[n] !== void 0 && (!r || Nt(this, this[n], n, r)));
    }
    return !1;
  }
  delete(t, r) {
    const n = this;
    let l = !1;
    function o(s) {
      if (s = He(s), s) {
        const i = c.findKey(n, s);
        i && (!r || Nt(n, n[i], i, r)) && (delete n[i], l = !0);
      }
    }
    return c.isArray(t) ? t.forEach(o) : o(t), l;
  }
  clear(t) {
    const r = Object.keys(this);
    let n = r.length, l = !1;
    for (; n--; ) {
      const o = r[n];
      (!t || Nt(this, this[o], o, t, !0)) && (delete this[o], l = !0);
    }
    return l;
  }
  normalize(t) {
    const r = this, n = {};
    return c.forEach(this, (l, o) => {
      const s = c.findKey(n, o);
      if (s) {
        r[s] = dt(l), delete r[o];
        return;
      }
      const i = t ? go(o) : String(o).trim();
      i !== o && delete r[o], r[i] = dt(l), n[i] = !0;
    }), this;
  }
  concat(...t) {
    return this.constructor.concat(this, ...t);
  }
  toJSON(t) {
    const r = /* @__PURE__ */ Object.create(null);
    return c.forEach(this, (n, l) => {
      n != null && n !== !1 && (r[l] = t && c.isArray(n) ? n.join(", ") : n);
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
    return c.isArray(t) ? t : t == null || t === !1 ? [] : [t];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(t) {
    return t instanceof this ? t : new this(t);
  }
  static parseParameters(t) {
    return po(t);
  }
  static concat(t, ...r) {
    const n = new this(t);
    return r.forEach((l) => n.set(l)), n;
  }
  static accessor(t) {
    const n = (this[Zt] = this[Zt] = {
      accessors: {}
    }).accessors, l = this.prototype;
    function o(s) {
      const i = He(s);
      n[i] || (bo(l, s), n[i] = !0);
    }
    return c.isArray(t) ? t.forEach(o) : o(t), this;
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
c.reduceDescriptors($.prototype, ({ value: e }, t) => {
  let r = t[0].toUpperCase() + t.slice(1);
  return {
    get: () => e,
    set(n) {
      this[r] = n;
    }
  };
});
c.freezeMethods($);
const mt = "[REDACTED ****]";
function yo(e) {
  if (c.hasOwnProp(e, "toJSON"))
    return !0;
  let t = Object.getPrototypeOf(e);
  for (; t && t !== Object.prototype; ) {
    if (c.hasOwnProp(t, "toJSON"))
      return !0;
    t = Object.getPrototypeOf(t);
  }
  return !1;
}
function wo(e, t) {
  const r = new Set(t.map((o) => String(o).toLowerCase())), n = [], l = (o) => {
    if (o === null || typeof o != "object" || c.isBuffer(o)) return o;
    if (n.indexOf(o) !== -1) return;
    o instanceof $ && (o = o.toJSON()), n.push(o);
    let s;
    if (c.isArray(o))
      s = [], o.forEach((i, a) => {
        const f = l(i);
        c.isUndefined(f) || (s[a] = f);
      });
    else {
      if (!c.isPlainObject(o) && yo(o))
        return n.pop(), o;
      s = /* @__PURE__ */ Object.create(null);
      for (const [i, a] of Object.entries(o)) {
        const f = r.has(i.toLowerCase()) ? mt : l(a);
        c.isUndefined(f) || (s[i] = f);
      }
    }
    return n.pop(), s;
  };
  return l(e);
}
function Xt(e) {
  try {
    return String(e);
  } catch {
    return "";
  }
}
function Eo(e) {
  return e.errors.map((r) => {
    try {
      return r && r.message ? Xt(r.message) : Xt(r);
    } catch {
      return "";
    }
  }).filter(Boolean).join("; ") || e.name || "AggregateError";
}
let m = class Xr extends Error {
  static from(t, r, n, l, o, s) {
    let i = t.message;
    !i && c.isArray(t.errors) && t.errors.length && (i = Eo(t));
    const a = new Xr(i, r || t.code, n, l, o);
    return Object.defineProperty(a, "cause", {
      __proto__: null,
      value: t,
      writable: !0,
      enumerable: !1,
      configurable: !0
    }), a.name = t.name, t.status != null && a.status == null && (a.status = t.status), s && Object.assign(a, s), a;
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
  constructor(t, r, n, l, o) {
    super(t), Object.defineProperty(this, "message", {
      // Null-proto descriptor so a polluted Object.prototype.get cannot turn
      // this data descriptor into an accessor descriptor on the way in.
      __proto__: null,
      value: t,
      enumerable: !0,
      writable: !0,
      configurable: !0
    }), this.name = "AxiosError", this.isAxiosError = !0, r && (this.code = r), n && (this.config = n), l && (this.request = l), o && (this.response = o, this.status = o.status);
  }
  toJSON() {
    const t = this.config, r = t && c.hasOwnProp(t, "redact") ? t.redact : void 0, n = c.isArray(r) && r.length > 0 ? wo(t, r) : c.toJSONObject(t);
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
const xo = null, Qr = 100;
function vt(e) {
  return c.isPlainObject(e) || c.isArray(e);
}
function en(e) {
  return c.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function Tt(e, t, r) {
  return e ? e.concat(t).map(function(l, o) {
    return l = en(l), !r && o ? "[" + l + "]" : l;
  }).join(r ? "." : "") : t;
}
function So(e) {
  return c.isArray(e) && !e.some(vt);
}
const Ro = c.toFlatObject(c, {}, null, function(t) {
  return /^is[A-Z]/.test(t);
});
function wt(e, t, r) {
  if (!c.isObject(e))
    throw new TypeError("target must be an object");
  t = t || new FormData();
  const n = (w, R) => {
    const S = c.getSafeProp(r, w);
    return c.isUndefined(S) ? R : S;
  }, l = n("metaTokens", !0), o = n("visitor") || O, s = n("dots", !1), i = n("indexes", !1), a = n("Blob") || typeof Blob < "u" && Blob, f = n("maxDepth", Qr), u = a && c.isSpecCompliantForm(t), h = [];
  if (!c.isFunction(o))
    throw new TypeError("visitor must be a function");
  function g(w) {
    if (w === null) return "";
    if (c.isDate(w))
      return w.toISOString();
    if (c.isBoolean(w))
      return w.toString();
    if (!u && c.isBlob(w))
      throw new m("Blob is not supported. Use a Buffer instead.");
    if (c.isArrayBuffer(w) || c.isTypedArray(w)) {
      if (u && typeof a == "function")
        return new a([w]);
      throw new m(
        "Blob is not supported. Use a Buffer instead.",
        m.ERR_NOT_SUPPORT
      );
    }
    return w;
  }
  function E(w) {
    if (w > f)
      throw new m(
        "Object is too deeply nested (" + w + " levels). Max depth: " + f,
        m.ERR_FORM_DATA_DEPTH_EXCEEDED
      );
  }
  function x(w, R) {
    if (f === 1 / 0)
      return JSON.stringify(w);
    const S = [];
    return JSON.stringify(w, function(k, _) {
      if (!c.isObject(_))
        return _;
      for (; S.length && S[S.length - 1] !== this; )
        S.pop();
      return S.push(_), E(R + S.length - 1), _;
    });
  }
  function O(w, R, S) {
    let L = w;
    if (c.isReactNative(t) && c.isReactNativeBlob(w))
      return t.append(Tt(S, R, s), g(w)), !1;
    if (w && !S && typeof w == "object") {
      if (c.endsWith(R, "{}"))
        R = l ? R : R.slice(0, -2), w = x(w, 1);
      else if (c.isArray(w) && So(w) || (c.isFileList(w) || c.endsWith(R, "[]")) && (L = c.toArray(w)))
        return R = en(R), L.forEach(function(_, G) {
          !(c.isUndefined(_) || _ === null) && t.append(
            // eslint-disable-next-line no-nested-ternary
            i === !0 ? Tt([R], G, s) : i === null ? R : R + "[]",
            g(_)
          );
        }), !1;
    }
    return vt(w) ? !0 : (t.append(Tt(S, R, s), g(w)), !1);
  }
  const T = Object.assign(Ro, {
    defaultVisitor: O,
    convertValue: g,
    isVisitable: vt
  });
  function p(w, R, S = 0) {
    if (!c.isUndefined(w)) {
      if (E(S), h.indexOf(w) !== -1)
        throw new Error("Circular reference detected in " + R.join("."));
      h.push(w), c.forEach(w, function(k, _) {
        (!(c.isUndefined(k) || k === null) && o.call(t, k, c.isString(_) ? _.trim() : _, R, T)) === !0 && p(k, R ? R.concat(_) : [_], S + 1);
      }), h.pop();
    }
  }
  if (!c.isObject(e))
    throw new TypeError("data must be an object");
  return p(e), t;
}
function Qt(e) {
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
function Mt(e, t) {
  this._pairs = [], e && wt(e, this, t);
}
const tn = Mt.prototype;
tn.append = function(t, r) {
  this._pairs.push([t, r]);
};
tn.toString = function(t) {
  const r = t ? (n) => t.call(this, n, Qt) : Qt;
  return this._pairs.map(function(l) {
    return r(l[0]) + "=" + r(l[1]);
  }, "").join("&");
};
function Oo(e) {
  return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function rn(e, t, r) {
  if (!t)
    return e;
  e = e || "";
  const n = c.isFunction(r) ? {
    serialize: r
  } : r, l = c.getSafeProp(n, "encode") || Oo, o = c.getSafeProp(n, "serialize");
  let s;
  if (o ? s = o(t, n) : s = c.isURLSearchParams(t) ? t.toString() : new Mt(t, n).toString(l), s) {
    const i = e.indexOf("#");
    i !== -1 && (e = e.slice(0, i)), e += (e.indexOf("?") === -1 ? "?" : "&") + s;
  }
  return e;
}
const je = /* @__PURE__ */ Symbol("internals");
function nn(e) {
  return e ? e.length : 0;
}
function er(e) {
  if (e)
    for (; e.length && e[e.length - 1] === null; )
      e.pop();
}
function $e(e, t) {
  const r = e.handlers, n = nn(r);
  r !== t.handlersRef ? (t.handlersRef = r, t.handlerEntries.clear()) : n !== t.handlersLength && (n ? t.handlerEntries.forEach(function(o, s) {
    r[o.index] !== o.handler && t.handlerEntries.delete(s);
  }) : t.handlerEntries.clear()), t.handlersLength = n;
}
class tr {
  constructor() {
    this.handlers = [], this[je] = {
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
    const l = {
      fulfilled: t,
      rejected: r,
      synchronous: n ? n.synchronous : !1,
      runWhen: n ? n.runWhen : null
    }, o = this[je];
    this.handlers == null && (this.handlers = []), $e(this, o);
    const s = o.nextId++;
    return this.handlers.push(l), o.handlerEntries.set(s, {
      handler: l,
      index: this.handlers.length - 1
    }), o.handlersLength = this.handlers.length, s;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {void}
   */
  eject(t) {
    const r = this[je];
    $e(this, r);
    const n = r.handlerEntries.get(t);
    if (n) {
      if (r.handlerEntries.delete(t), this.handlers[n.index] !== n.handler)
        return;
      this.handlers[n.index] = null, r.iterationDepth || (er(this.handlers), r.handlersLength = this.handlers.length);
    }
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    this.handlers && (this.handlers = [], $e(this, this[je]));
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
    const r = this[je];
    $e(this, r), r.iterationDepth++;
    try {
      c.forEach(this.handlers, function(l) {
        l !== null && t(l);
      });
    } finally {
      --r.iterationDepth || ($e(this, r), er(this.handlers), r.handlersLength = nn(this.handlers));
    }
  }
}
const Ht = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1,
  legacyInterceptorReqResOrdering: !0,
  advertiseZstdAcceptEncoding: !1,
  validateStatusUndefinedResolves: !0
}, No = typeof URLSearchParams < "u" ? URLSearchParams : Mt, To = typeof FormData < "u" ? FormData : null, Ao = typeof Blob < "u" ? Blob : null, _o = {
  isBrowser: !0,
  classes: {
    URLSearchParams: No,
    FormData: To,
    Blob: Ao
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
}, jt = typeof window < "u" && typeof document < "u", Lt = typeof navigator == "object" && navigator || void 0, Co = jt && (!Lt || ["ReactNative", "NativeScript", "NS"].indexOf(Lt.product) < 0), ko = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", Po = jt && window.location.href || "http://localhost", vo = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: jt,
  hasStandardBrowserEnv: Co,
  hasStandardBrowserWebWorkerEnv: ko,
  navigator: Lt,
  origin: Po
}, Symbol.toStringTag, { value: "Module" })), F = {
  ...vo,
  ..._o
};
function Lo(e, t) {
  return wt(e, new F.classes.URLSearchParams(), {
    visitor: function(r, n, l, o) {
      return F.isNode && c.isBuffer(r) ? (this.append(n, r.toString("base64")), !1) : o.defaultVisitor.apply(this, arguments);
    },
    ...t
  });
}
const rr = Qr;
function ln(e) {
  if (e > rr)
    throw new m(
      "FormData field is too deeply nested (" + e + " levels). Max depth: " + rr,
      m.ERR_FORM_DATA_DEPTH_EXCEEDED
    );
}
function Io(e) {
  const t = [], r = /[^.[\]]+|\[([^.[\]]*)]/g;
  let n;
  for (; (n = r.exec(e)) !== null; )
    ln(t.length), t.push(n[0] === "[]" ? "" : n[1] || n[0]);
  return t;
}
function Do(e) {
  const t = {}, r = Object.keys(e);
  let n;
  const l = r.length;
  let o;
  for (n = 0; n < l; n++)
    o = r[n], t[o] = e[o];
  return t;
}
function on(e) {
  function t(r, n, l, o) {
    ln(o);
    let s = r[o++];
    if (s === "__proto__") return !0;
    const i = Number.isFinite(+s), a = o >= r.length;
    return s = !s && c.isArray(l) ? l.length : s, a ? (c.hasOwnProp(l, s) ? l[s] = c.isArray(l[s]) ? l[s].concat(n) : [l[s], n] : l[s] = n, !i) : ((!c.hasOwnProp(l, s) || !c.isObject(l[s])) && (l[s] = []), t(r, n, l[s], o) && c.isArray(l[s]) && (l[s] = Do(l[s])), !i);
  }
  if (c.isFormData(e) && c.isFunction(e.entries)) {
    const r = {};
    return c.forEachEntry(e, (n, l) => {
      t(Io(n), l, r, 0);
    }), r;
  }
  return null;
}
const sn = Object.freeze([
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
]), Ce = (e, t) => e != null && c.hasOwnProp(e, t) ? e[t] : void 0;
function Uo(e, t, r) {
  if (c.isString(e))
    try {
      return (t || JSON.parse)(e), c.trim(e);
    } catch (n) {
      if (n.name !== "SyntaxError")
        throw n;
    }
  return (r || JSON.stringify)(e);
}
const Qe = {
  transitional: Ht,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [
    function(t, r) {
      const n = r.getContentType() || "", l = n.indexOf("application/json") > -1, o = c.isObject(t);
      if (o && c.isHTMLForm(t) && (t = new FormData(t)), c.isFormData(t))
        return l ? JSON.stringify(on(t)) : t;
      if (c.isArrayBuffer(t) || c.isBuffer(t) || c.isStream(t) || c.isFile(t) || c.isBlob(t) || c.isReadableStream(t))
        return t;
      if (c.isArrayBufferView(t))
        return t.buffer;
      if (c.isURLSearchParams(t))
        return r.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), t.toString();
      let i;
      if (o) {
        const a = Ce(this, "formSerializer");
        if (n.indexOf("application/x-www-form-urlencoded") > -1)
          return Lo(t, a).toString();
        if ((i = c.isFileList(t)) || n.indexOf("multipart/form-data") > -1) {
          const f = Ce(this, "env"), u = f && f.FormData;
          return wt(
            i ? { "files[]": t } : t,
            u && new u(),
            a
          );
        }
      }
      return o || l ? (r.setContentType("application/json", !1), Uo(t)) : t;
    }
  ],
  transformResponse: [
    function(t) {
      const r = Ce(this, "transitional") || Qe.transitional, n = r && r.forcedJSONParsing, l = Ce(this, "responseType"), o = l === "json";
      if (c.isResponse(t) || c.isReadableStream(t))
        return t;
      if (t && c.isString(t) && (n && !l || o)) {
        const i = !(r && r.silentJSONParsing) && o;
        try {
          return JSON.parse(t, Ce(this, "parseReviver"));
        } catch (a) {
          if (i)
            throw a.name === "SyntaxError" ? m.from(a, m.ERR_BAD_RESPONSE, this, null, Ce(this, "response")) : a;
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
    FormData: F.classes.FormData,
    Blob: F.classes.Blob
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
c.forEach(sn, (e) => {
  Qe.headers[e] = {};
});
function At(e, t) {
  const r = this || Qe, n = t || r, l = $.from(n.headers);
  let o = n.data;
  return c.forEach(e, function(i) {
    o = i.call(r, o, l.normalize(), t ? t.status : void 0);
  }), l.normalize(), o;
}
function an(e) {
  return !!(e && e.__CANCEL__);
}
let et = class extends m {
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
    super(t ?? "canceled", m.ERR_CANCELED, r, n), this.name = "CanceledError", this.__CANCEL__ = !0;
  }
};
function cn(e, t, r) {
  const n = r.config.validateStatus;
  !r.status || !n || n(r.status) ? e(r) : t(new m(
    "Request failed with status code " + r.status,
    r.status >= 400 && r.status < 500 ? m.ERR_BAD_REQUEST : m.ERR_BAD_RESPONSE,
    r.config,
    r.request,
    r
  ));
}
const Fo = /[\t\n\r]/g;
function dn(e) {
  if (typeof e != "string")
    return e;
  let t = 0;
  for (; t < e.length && e.charCodeAt(t) <= 32; )
    t++;
  return e.slice(t).replace(Fo, "");
}
function _t(e) {
  const t = /^([-+\w]{1,25}):(?:\/\/)?/.exec(e);
  return t && t[1] || "";
}
function Bo(e, t) {
  e = e || 10;
  const r = new Array(e), n = new Array(e);
  let l = 0, o = 0, s;
  return t = t !== void 0 ? t : 1e3, function(a) {
    const f = Date.now(), u = n[o];
    s || (s = f), r[l] = a, n[l] = f;
    let h = o, g = 0;
    for (; h !== l; )
      g += r[h++], h = h % e;
    if (l = (l + 1) % e, l === o && (o = (o + 1) % e), f - s < t)
      return;
    const E = u && f - u;
    return E ? Math.round(g * 1e3 / E) : void 0;
  };
}
function Mo(e, t) {
  let r = 0, n = 1e3 / t, l, o;
  const s = (u, h = Date.now()) => {
    r = h, l = null, o && (clearTimeout(o), o = null), e(...u);
  };
  return [(...u) => {
    const h = Date.now(), g = h - r;
    g >= n ? s(u, h) : (l = u, o || (o = setTimeout(() => {
      o = null, s(l);
    }, n - g)));
  }, () => l && s(l), (...u) => s(u)];
}
const gt = (e, t, r = 3) => {
  let n = 0;
  const l = Bo(50, 250);
  return Mo((o) => {
    if (!o || !c.isNumber(o.loaded))
      return;
    const s = o.loaded, i = o.lengthComputable ? o.total : void 0, a = Math.max(0, i != null ? Math.min(s, i) : s), f = Math.max(0, a - n), u = l(f);
    n = Math.max(n, a);
    const h = {
      loaded: a,
      total: i,
      progress: i ? a / i : void 0,
      bytes: f,
      rate: u || void 0,
      estimated: u && i ? (i - a) / u : void 0,
      event: o,
      lengthComputable: i != null,
      [t ? "download" : "upload"]: !0
    };
    e(h);
  }, r);
}, nr = (e, t) => {
  const r = e != null;
  return [
    (n) => t[0]({
      lengthComputable: r,
      total: e,
      loaded: n
    }),
    t[1]
  ];
}, lr = (e, t = c.asap) => (...r) => t(() => e(...r)), Ho = F.hasStandardBrowserEnv ? /* @__PURE__ */ ((e, t) => (r) => (r = new URL(r, F.origin), e.protocol === r.protocol && e.host === r.host && (t || e.port === r.port)))(
  new URL(F.origin),
  F.navigator && /(msie|trident)/i.test(F.navigator.userAgent)
) : () => !0, jo = F.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(e, t, r, n, l, o, s) {
      if (typeof document > "u") return;
      const i = [`${e}=${encodeURIComponent(t)}`];
      c.isNumber(r) && i.push(`expires=${new Date(r).toUTCString()}`), c.isString(n) && i.push(`path=${n}`), c.isString(l) && i.push(`domain=${l}`), o === !0 && i.push("secure"), c.isString(s) && i.push(`SameSite=${s}`), document.cookie = i.join("; ");
    },
    read(e) {
      if (typeof document > "u") return null;
      const t = document.cookie.split(";");
      for (let r = 0; r < t.length; r++) {
        const n = t[r].replace(/^\s+/, ""), l = n.indexOf("=");
        if (l !== -1 && n.slice(0, l) === e)
          try {
            return decodeURIComponent(n.slice(l + 1));
          } catch {
            return n.slice(l + 1);
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
function $o(e) {
  return typeof e != "string" ? !1 : /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
function Vo(e, t) {
  if (!t)
    return e;
  let r = e.length;
  for (; r > 0 && e.charCodeAt(r - 1) === 47; )
    r--;
  return e.slice(0, r) + "/" + t.replace(/^\/+/, "");
}
const qo = /^https?:(?!\/\/)/i;
function zo(e) {
  return e && e.replace(/(^|&)([^=&]*=)?[^&]+/g, (t, r, n = "") => `${r}${n}${mt}`);
}
function Ko(e) {
  const t = e.replace(/^(https?:\/{0,2})[^/?#]*@/i, `$1${mt}@`), r = t.indexOf("#"), l = (r === -1 ? t : t.slice(0, r)).replace(
    /([?&][^=&#]*=)[^&#]*/g,
    `$1${mt}`
  );
  return r === -1 ? l : `${l}#${zo(t.slice(r + 1))}`;
}
function or(e, t) {
  if (typeof e == "string") {
    const r = dn(e);
    if (qo.test(r))
      throw new m(
        `Invalid URL ${JSON.stringify(Ko(r))}: missing "//" after protocol`,
        m.ERR_INVALID_URL,
        t
      );
  }
}
function un(e, t, r, n) {
  or(t, n);
  let l = !$o(t);
  return e && (l || r === !1) ? (or(e, n), Vo(e, t)) : t;
}
const sr = (e) => e instanceof $ ? { ...e } : e, Wo = (e) => Object.getOwnPropertySymbols && Object.getOwnPropertyDescriptor ? Object.keys(e).concat(
  Object.getOwnPropertySymbols(e).filter(
    (t) => Object.getOwnPropertyDescriptor(e, t).enumerable
  )
) : Object.keys(e);
function Oe(e, t) {
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
  function n(u, h, g, E) {
    return c.isPlainObject(u) && c.isPlainObject(h) ? c.merge.call({ caseless: E }, u, h) : c.isPlainObject(h) ? c.merge({}, h) : c.isArray(h) ? h.slice() : h;
  }
  function l(u, h, g, E) {
    if (c.isUndefined(h)) {
      if (!c.isUndefined(u))
        return n(void 0, u, g, E);
    } else return n(u, h, g, E);
  }
  function o(u, h) {
    if (!c.isUndefined(h))
      return n(void 0, h);
  }
  function s(u, h) {
    if (c.isUndefined(h)) {
      if (!c.isUndefined(u))
        return n(void 0, u);
    } else return n(void 0, h);
  }
  function i(u) {
    const h = c.hasOwnProp(t, "transitional") ? t.transitional : void 0;
    if (!c.isUndefined(h))
      if (c.isPlainObject(h)) {
        if (c.hasOwnProp(h, u))
          return h[u];
      } else
        return;
    const g = c.hasOwnProp(e, "transitional") ? e.transitional : void 0;
    if (c.isPlainObject(g) && c.hasOwnProp(g, u))
      return g[u];
  }
  function a(u, h, g) {
    if (c.hasOwnProp(t, g))
      return n(u, h);
    if (c.hasOwnProp(e, g))
      return n(void 0, u);
  }
  const f = {
    url: o,
    method: o,
    data: o,
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
    validateStatus: a,
    headers: (u, h, g) => l(sr(u), sr(h), g, !0)
  };
  return c.forEach(Wo({ ...e, ...t }), function(h) {
    if (h === "__proto__" || h === "constructor" || h === "prototype") return;
    const g = c.hasOwnProp(f, h) ? f[h] : l, E = c.hasOwnProp(e, h) ? e[h] : void 0, x = c.hasOwnProp(t, h) ? t[h] : void 0, O = g(E, x, h);
    c.isUndefined(O) && g !== a || (r[h] = O);
  }), c.hasOwnProp(t, "validateStatus") && c.isUndefined(t.validateStatus) && i("validateStatusUndefinedResolves") === !1 && (c.hasOwnProp(e, "validateStatus") ? r.validateStatus = n(void 0, e.validateStatus) : delete r.validateStatus), r;
}
const Go = ["content-type", "content-length"];
function Jo(e, t, r) {
  if (r !== "content-only") {
    e.set(t);
    return;
  }
  Object.entries(t || {}).forEach(([n, l]) => {
    Go.includes(n.toLowerCase()) && e.set(n, l);
  });
}
const Yo = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, r) => String.fromCharCode(parseInt(r, 16))
);
function fn(e) {
  const t = Oe({}, e), r = (g) => c.hasOwnProp(t, g) ? t[g] : void 0, n = r("data");
  let l = r("withXSRFToken");
  const o = r("xsrfHeaderName"), s = r("xsrfCookieName");
  let i = r("headers");
  const a = r("auth"), f = r("baseURL"), u = r("allowAbsoluteUrls"), h = r("url");
  if (t.headers = i = $.from(i), t.url = rn(
    un(f, h, u, t),
    r("params"),
    r("paramsSerializer")
  ), a) {
    const g = c.getSafeProp(a, "username") || "", E = c.getSafeProp(a, "password") || "";
    try {
      i.set(
        "Authorization",
        "Basic " + btoa(g + ":" + (E ? Yo(E) : ""))
      );
    } catch (x) {
      throw m.from(x, m.ERR_BAD_OPTION_VALUE, e);
    }
  }
  if (c.isFormData(n)) {
    const g = c.getSafeProp(n, "getHeaders");
    F.hasStandardBrowserEnv || F.hasStandardBrowserWebWorkerEnv || c.isReactNative(n) ? i.setContentType(void 0) : c.isFunction(g) && Jo(i, g.call(n), r("formDataHeaderPolicy"));
  }
  if (F.hasStandardBrowserEnv && (c.isFunction(l) && (l = l(t)), l === !0 || l == null && Ho(t.url))) {
    const E = o && s && jo.read(s);
    E && i.set(o, E);
  }
  return t;
}
const Zo = typeof XMLHttpRequest < "u", Xo = Zo && function(e) {
  return new Promise(function(r, n) {
    const l = fn(e);
    let o = l.data;
    const s = $.from(l.headers).normalize();
    let { responseType: i, onUploadProgress: a, onDownloadProgress: f } = l, u, h, g, E, x, O;
    function T() {
      E && E(), x && x(), l.cancelToken && l.cancelToken.unsubscribe(u), l.signal && l.signal.removeEventListener("abort", u);
    }
    let p = new XMLHttpRequest();
    p.open(l.method.toUpperCase(), l.url, !0), p.timeout = l.timeout;
    function w(S) {
      if (!p)
        return;
      if (p.status === 0 && (_t(dn(l.url)) || _t(F.origin)) !== "file" && !(p.responseURL && p.responseURL.startsWith("file:"))) {
        n(new m("Request aborted", m.ECONNABORTED, e, p)), T(), p = null;
        return;
      }
      try {
        S ? O && O(S) : x && x();
      } catch (G) {
        setTimeout(() => {
          throw G;
        });
      }
      if (!p)
        return;
      const L = $.from(
        "getAllResponseHeaders" in p && p.getAllResponseHeaders()
      ), _ = {
        data: !i || i === "text" || i === "json" ? p.responseText : p.response,
        status: p.status,
        statusText: p.statusText,
        headers: L,
        config: e,
        request: p
      };
      cn(
        function(H) {
          r(H), T();
        },
        function(H) {
          n(H), T();
        },
        _
      ), p = null;
    }
    "onloadend" in p ? p.onloadend = w : p.onreadystatechange = function() {
      !p || p.readyState !== 4 || p.status === 0 && !(p.responseURL && p.responseURL.startsWith("file:")) || setTimeout(w);
    }, p.onabort = function() {
      p && (n(new m("Request aborted", m.ECONNABORTED, e, p)), T(), p = null);
    }, p.onerror = function(L) {
      const k = L && L.message ? L.message : "Network Error", _ = new m(k, m.ERR_NETWORK, e, p);
      _.event = L || null, n(_), T(), p = null;
    }, p.ontimeout = function() {
      let L = l.timeout ? "timeout of " + l.timeout + "ms exceeded" : "timeout exceeded";
      const k = l.transitional || Ht;
      l.timeoutErrorMessage && (L = l.timeoutErrorMessage), n(
        new m(
          L,
          k.clarifyTimeoutError ? m.ETIMEDOUT : m.ECONNABORTED,
          e,
          p
        )
      ), T(), p = null;
    }, o === void 0 && s.setContentType(null), "setRequestHeader" in p && c.forEach(Zr(s), function(L, k) {
      p.setRequestHeader(k, L);
    }), c.isUndefined(l.withCredentials) || (p.withCredentials = !!l.withCredentials), i && i !== "json" && (p.responseType = l.responseType), f && ([g, x, O] = gt(
      f,
      !0
    ), p.addEventListener("progress", g)), a && p.upload && ([h, E] = gt(a), p.upload.addEventListener("progress", h), p.upload.addEventListener("loadend", E)), (l.cancelToken || l.signal) && (u = (S) => {
      p && (n(!S || S.type ? new et(null, e, p) : S), p.abort(), T(), p = null);
    }, l.cancelToken && l.cancelToken.subscribe(u), l.signal && (l.signal.aborted ? u() : l.signal.addEventListener("abort", u)));
    const R = _t(l.url);
    if (R && !F.protocols.includes(R)) {
      n(
        new m(
          "Unsupported protocol " + R + ":",
          m.ERR_BAD_REQUEST,
          e
        )
      ), T();
      return;
    }
    p.send(o || null);
  });
}, Qo = (e, t) => {
  if (e = e ? e.filter(Boolean) : [], !t && !e.length)
    return;
  const r = new AbortController();
  let n = !1;
  const l = function(a) {
    if (!n) {
      n = !0, s();
      const f = a instanceof Error ? a : this.reason;
      r.abort(
        f instanceof m ? f : new et(f instanceof Error ? f.message : f)
      );
    }
  };
  let o = t && setTimeout(() => {
    o = null, l(new m(`timeout of ${t}ms exceeded`, m.ETIMEDOUT));
  }, t);
  const s = () => {
    e && (o && clearTimeout(o), o = null, e.forEach((a) => {
      a.unsubscribe ? a.unsubscribe(l) : a.removeEventListener("abort", l);
    }), e = null);
  };
  e.forEach((a) => {
    if (!n) {
      if (a.aborted) {
        l.call(a);
        return;
      }
      a.addEventListener("abort", l, { once: !0 });
    }
  });
  const { signal: i } = r;
  return i.unsubscribe = () => c.asap(s), i;
}, es = function* (e, t) {
  let r = e.byteLength;
  if (r < t) {
    yield e;
    return;
  }
  let n = 0, l;
  for (; n < r; )
    l = n + t, yield e.slice(n, l), n = l;
}, ts = async function* (e, t) {
  for await (const r of rs(e))
    yield* es(r, t);
}, rs = async function* (e) {
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
}, ir = (e, t, r, n) => {
  const l = ts(e, t);
  let o = 0, s, i = (a) => {
    s || (s = !0, n && n(a));
  };
  return new ReadableStream(
    {
      async pull(a) {
        try {
          const { done: f, value: u } = await l.next();
          if (f) {
            i(), a.close();
            return;
          }
          let h = u.byteLength;
          if (r) {
            let g = o += h;
            r(g);
          }
          a.enqueue(new Uint8Array(u));
        } catch (f) {
          throw i(f), f;
        }
      },
      cancel(a) {
        return i(a), l.return();
      }
    },
    {
      highWaterMark: 2
    }
  );
}, ar = (e) => e >= 48 && e <= 57 || e >= 65 && e <= 70 || e >= 97 && e <= 102, hn = (e, t, r) => t + 2 < r && ar(e.charCodeAt(t + 1)) && ar(e.charCodeAt(t + 2)), cr = (e) => e <= 57 ? e - 48 : (e & 223) - 55, ns = (e) => e >= 65 && e <= 90 || // A-Z
e >= 97 && e <= 122 || // a-z
e >= 48 && e <= 57 || // 0-9
e === 43 || // +
e === 47 || // /
e === 45 || // - (base64url)
e === 95, ls = (e) => e === 9 || e === 10 || e === 12 || e === 13 || e === 32, os = (e) => {
  const t = Math.floor(e / 4), r = e % 4;
  return t * 3 + (r === 2 ? 1 : r === 3 ? 2 : 0);
}, ss = (e) => {
  const t = e.length;
  let r = 0;
  return t > 0 && e.charCodeAt(t - 1) === 61 && (r++, t > 1 && e.charCodeAt(t - 2) === 61 && r++), Math.floor((t - r) * 3 / 4);
}, is = (e) => {
  const t = e.length;
  let r = 0, n = 0, l = !1;
  for (let o = 0; o < t; o++) {
    let s = e.charCodeAt(o);
    if (s === 37 && hn(e, o, t) && (s = cr(e.charCodeAt(o + 1)) * 16 + cr(e.charCodeAt(o + 2)), o += 2), !ls(s)) {
      if (s === 61) {
        n++;
        continue;
      }
      if (!ns(s) || n > 0) {
        l = !0;
        continue;
      }
      r++;
    }
  }
  return l || n > 2 || n > 0 && (r + n) % 4 !== 0 || r % 4 === 1 ? ss(e) : os(r);
}, as = (e, t) => {
  if (!e || typeof e != "string" || !e.startsWith("data:")) return 0;
  const r = e.indexOf(",");
  if (r < 0) return 0;
  const n = e.slice(5, r), l = e.slice(r + 1);
  if (/;base64/i.test(n))
    return t(l);
  let s = 0;
  for (let i = 0, a = l.length; i < a; i++) {
    const f = l.charCodeAt(i);
    if (f === 37 && hn(l, i, a))
      s += 1, i += 2;
    else if (f < 128)
      s += 1;
    else if (f < 2048)
      s += 2;
    else if (f >= 55296 && f <= 56319 && i + 1 < a) {
      const u = l.charCodeAt(i + 1);
      u >= 56320 && u <= 57343 ? (s += 4, i++) : s += 3;
    } else
      s += 3;
  }
  return s;
};
function cs(e) {
  const t = typeof e == "string" ? e.indexOf("#") : -1;
  return as(
    t === -1 ? e : e.slice(0, t),
    is
  );
}
const $t = "1.20.0", dr = 64 * 1024, ds = {
  cache: "default",
  redirect: "follow",
  referrer: "about:client",
  referrerPolicy: "",
  mode: "cors",
  integrity: "",
  keepalive: !1,
  priority: "auto",
  window: null
}, { isFunction: lt } = c, us = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, r) => String.fromCharCode(parseInt(r, 16))
), ur = (e) => {
  if (!c.isString(e))
    return e;
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}, fr = (e, ...t) => {
  try {
    return !!e(...t);
  } catch {
    return !1;
  }
}, fs = (e) => {
  const t = e.indexOf("://");
  let r = e;
  return t !== -1 && (r = r.slice(t + 3)), r.includes("@") || r.includes(":");
}, hs = (e) => {
  const t = c.global !== void 0 && c.global !== null ? c.global : globalThis, { ReadableStream: r, TextEncoder: n } = t;
  e = c.merge.call(
    {
      skipUndefined: !0
    },
    {
      Request: t.Request,
      Response: t.Response
    },
    e
  );
  const { fetch: l, Request: o, Response: s } = e, i = l ? lt(l) : typeof fetch == "function", a = lt(o), f = lt(s);
  if (!i)
    return !1;
  const u = i && lt(r), h = i && (typeof n == "function" ? /* @__PURE__ */ ((p) => (w) => p.encode(w))(new n()) : async (p) => new Uint8Array(await new o(p).arrayBuffer())), g = a && u && fr(() => {
    let p = !1;
    const w = new o(F.origin, {
      body: new r(),
      method: "POST",
      get duplex() {
        return p = !0, "half";
      }
    }), R = w.headers.has("Content-Type");
    return w.body != null && w.body.cancel(), p && !R;
  }), E = f && u && fr(() => c.isReadableStream(new s("").body)), x = {
    stream: E && ((p) => p.body)
  };
  i && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((p) => {
    !x[p] && (x[p] = (w, R) => {
      let S = w && w[p];
      if (S)
        return S.call(w);
      throw new m(
        `Response type '${p}' is not supported`,
        m.ERR_NOT_SUPPORT,
        R
      );
    });
  });
  const O = async (p) => {
    if (p == null)
      return 0;
    if (c.isBlob(p))
      return p.size;
    if (c.isSpecCompliantForm(p))
      return (await new o(F.origin, {
        method: "POST",
        body: p
      }).arrayBuffer()).byteLength;
    if (c.isArrayBufferView(p) || c.isArrayBuffer(p))
      return p.byteLength;
    if (c.isURLSearchParams(p) && (p = p + ""), c.isString(p))
      return (await h(p)).byteLength;
  }, T = async (p, w) => {
    const R = c.toFiniteNumber(p.getContentLength());
    return R ?? O(w);
  };
  return async (p) => {
    let {
      url: w,
      method: R,
      data: S,
      signal: L,
      cancelToken: k,
      timeout: _,
      onDownloadProgress: G,
      onUploadProgress: H,
      responseType: ne,
      headers: le,
      withCredentials: me = "same-origin",
      fetchOptions: ae,
      maxContentLength: J,
      maxBodyLength: Ne,
      maxRedirects: xt
    } = fn(p);
    const ce = c.isNumber(J) && J > -1, Te = c.isNumber(Ne) && Ne > -1, tt = (C) => c.hasOwnProp(p, C) ? p[C] : void 0;
    let z = l || fetch;
    ne = ne ? (ne + "").toLowerCase() : "text";
    let V = Qo(
      [L, k && k.toAbortSignal()],
      _
    ), D = null;
    const de = V && V.unsubscribe && (() => {
      V.unsubscribe();
    });
    let he, ge = null;
    const rt = () => new m(
      "Request body larger than maxBodyLength limit",
      m.ERR_BAD_REQUEST,
      p,
      D
    );
    try {
      let C;
      const K = tt("auth");
      if (K) {
        const b = c.getSafeProp(K, "username") || "", A = c.getSafeProp(K, "password") || "";
        C = {
          username: b,
          password: A
        };
      }
      if (fs(w)) {
        const b = new URL(w, F.origin);
        if (!C && (b.username || b.password)) {
          const A = ur(b.username), v = ur(b.password);
          C = {
            username: A,
            password: v
          };
        }
        (b.username || b.password) && (b.username = "", b.password = "", w = b.href);
      }
      if (C && (le.delete("authorization"), le.set(
        "Authorization",
        "Basic " + btoa(us((C.username || "") + ":" + (C.password || "")))
      )), ce && typeof w == "string" && w.startsWith("data:") && cs(w) > J)
        throw new m(
          "maxContentLength size of " + J + " exceeded",
          m.ERR_BAD_RESPONSE,
          p,
          D
        );
      if (Te && R !== "get" && R !== "head") {
        const b = await O(S);
        if (typeof b == "number" && isFinite(b) && (he = b, b > Ne))
          throw rt();
      }
      const Ae = Te && (c.isReadableStream(S) || c.isStream(S)), Ue = (b, A, v) => ir(
        b,
        dr,
        (be) => {
          if (Te && be > Ne)
            throw ge = rt();
          A && A(be);
        },
        v
      );
      if (g && R !== "get" && R !== "head" && (H || Ae)) {
        if (he = he ?? await T(le, S), he !== 0 || Ae) {
          let b = new o(w, {
            method: "POST",
            body: S,
            duplex: "half"
          }), A;
          if (c.isFormData(S) && (A = b.headers.get("content-type")) && le.setContentType(A), b.body) {
            const [v, be] = H && nr(
              he,
              gt(lr(H))
            ) || [];
            S = Ue(b.body, v, be);
          }
        }
      } else if (Ae && !a && u && R !== "get" && R !== "head")
        S = Ue(S);
      else if (Ae && a && !g && R !== "get" && R !== "head")
        throw new m(
          "Stream request bodies are not supported by the current fetch implementation",
          m.ERR_NOT_SUPPORT,
          p,
          D
        );
      c.isString(me) || (me = me ? "include" : "omit");
      const nt = a && "credentials" in o.prototype;
      if (c.isFormData(S)) {
        const b = le.getContentType();
        b && /^multipart\/form-data/i.test(b) && !/boundary=/i.test(b) && le.delete("content-type");
      }
      le.set("User-Agent", "axios/" + $t, !1);
      const B = ae == null ? ae : Object.assign(/* @__PURE__ */ Object.create(null), ae);
      B && (delete B.body, delete B.headers, delete B.method, delete B.signal, delete B.duplex, delete B.credentials);
      const Q = Object.assign(/* @__PURE__ */ Object.create(null), B, {
        signal: V,
        method: R.toUpperCase(),
        headers: Zr(le.normalize()),
        body: S,
        duplex: "half",
        credentials: nt ? me : void 0
      });
      a && (c.forEach(ds, (b, A) => {
        Q[A] === void 0 && (Q[A] = b);
      }), Q.signal === void 0 && (Q.signal = null), Q.body === void 0 && (Q.body = null)), xt === 0 && (Q.redirect = "manual", B && (B.redirect = "manual")), D = a && new o(w, Q);
      let re = await (a ? z(D, B) : z(w, Q));
      const Fe = $.from(re.headers);
      if (ce) {
        const b = c.toFiniteNumber(Fe.getContentLength());
        if (b != null && b > J)
          throw new m(
            "maxContentLength size of " + J + " exceeded",
            m.ERR_BAD_RESPONSE,
            p,
            D
          );
      }
      const _e = E && (ne === "stream" || ne === "response");
      if (E && re.body && (G || ce || _e && de)) {
        const b = {};
        ["status", "statusText", "headers"].forEach((Be) => {
          b[Be] = re[Be];
        });
        const A = c.toFiniteNumber(Fe.getContentLength()), [v, be] = G && nr(
          A,
          gt(lr(G), !0)
        ) || [];
        let zt = 0;
        const An = (Be) => {
          if (ce && (zt = Be, zt > J))
            throw new m(
              "maxContentLength size of " + J + " exceeded",
              m.ERR_BAD_RESPONSE,
              p,
              D
            );
          v && v(Be);
        };
        re = new s(
          ir(re.body, dr, An, () => {
            be && be(), de && de();
          }),
          b
        );
      }
      ne = ne || "text";
      let ee = await x[c.findKey(x, ne) || "text"](
        re,
        p
      );
      if (ce && !E && !_e) {
        let b;
        if (ee != null && (typeof ee.byteLength == "number" ? b = ee.byteLength : typeof ee.size == "number" ? b = ee.size : typeof ee == "string" && (b = typeof n == "function" ? new n().encode(ee).byteLength : ee.length)), typeof b == "number" && b > J)
          throw new m(
            "maxContentLength size of " + J + " exceeded",
            m.ERR_BAD_RESPONSE,
            p,
            D
          );
      }
      return !_e && de && de(), await new Promise((b, A) => {
        cn(b, A, {
          data: ee,
          headers: $.from(re.headers),
          status: re.status,
          statusText: re.statusText,
          config: p,
          request: D
        });
      });
    } catch (C) {
      if (de && de(), V && V.aborted && V.reason instanceof m) {
        const K = V.reason;
        throw K.config = p, D && (K.request = D), C !== K && Object.defineProperty(K, "cause", {
          __proto__: null,
          value: C,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), K;
      }
      if (ge)
        throw D && !ge.request && (ge.request = D), ge;
      if (C instanceof m)
        throw D && !C.request && (C.request = D), C;
      if (C && C.name === "TypeError" && /Load failed|fetch/i.test(C.message)) {
        const K = new m(
          "Network Error",
          m.ERR_NETWORK,
          p,
          D,
          C && C.response
        );
        throw Object.defineProperty(K, "cause", {
          __proto__: null,
          value: C.cause || C,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), K;
      }
      throw m.from(C, C && C.code, p, D, C && C.response);
    }
  };
}, ps = /* @__PURE__ */ new Map(), pn = (e) => {
  let t = e && e.env || {};
  const { fetch: r, Request: n, Response: l } = t, o = [n, l, r];
  let s = o.length, i = s, a, f, u = ps;
  for (; i--; )
    a = o[i], f = u.get(a), f === void 0 && u.set(a, f = i ? /* @__PURE__ */ new Map() : hs(t)), u = f;
  return f;
};
pn();
const Vt = {
  http: xo,
  xhr: Xo,
  fetch: {
    get: pn
  }
};
c.forEach(Vt, (e, t) => {
  if (e) {
    try {
      Object.defineProperty(e, "name", { __proto__: null, value: t });
    } catch {
    }
    Object.defineProperty(e, "adapterName", { __proto__: null, value: t });
  }
});
const hr = (e) => `- ${e}`, ms = (e) => c.isFunction(e) || e === null || e === !1;
function gs(e, t) {
  e = c.isArray(e) ? e : [e];
  const { length: r } = e;
  let n, l;
  const o = {};
  for (let s = 0; s < r; s++) {
    n = e[s];
    let i;
    if (l = n, !ms(n) && (l = Vt[(i = String(n)).toLowerCase()], l === void 0))
      throw new m(`Unknown adapter '${i}'`);
    if (l && (c.isFunction(l) || (l = l.get(t))))
      break;
    o[i || "#" + s] = l;
  }
  if (!l) {
    const s = Object.entries(o).map(
      ([a, f]) => `adapter ${a} ` + (f === !1 ? "is not supported by the environment" : "is not available in the build")
    );
    let i = r ? s.length > 1 ? `since :
` + s.map(hr).join(`
`) : " " + hr(s[0]) : "as no adapter specified";
    throw new m(
      "There is no suitable adapter to dispatch the request " + i,
      m.ERR_NOT_SUPPORT
    );
  }
  return l;
}
const mn = {
  /**
   * Resolve an adapter from a list of adapter names or functions.
   * @type {Function}
   */
  getAdapter: gs,
  /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */
  adapters: Vt
};
function Ct(e) {
  if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted)
    throw new et(null, e);
}
function kt(e) {
  const t = c.toSafeFlatObject(e);
  return Ct(t), t.headers = $.from(c.getSafeProp(t, "headers")), t.data = At.call(t, t.transformRequest), ["post", "put", "patch"].indexOf(t.method) !== -1 && t.headers.setContentType("application/x-www-form-urlencoded", !1), mn.getAdapter(t.adapter || Qe.adapter, t)(t).then(
    function(l) {
      Ct(t), t.response = l;
      try {
        l.data = At.call(t, t.transformResponse, l);
      } finally {
        delete t.response;
      }
      return l.headers = $.from(l.headers), l;
    },
    function(l) {
      if (!an(l) && (Ct(t), l && l.response)) {
        t.response = l.response;
        try {
          l.response.data = At.call(
            t,
            t.transformResponse,
            l.response
          );
        } finally {
          delete t.response;
        }
        l.response.headers = $.from(l.response.headers);
      }
      return Promise.reject(l);
    }
  );
}
const Et = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((e, t) => {
  Et[e] = function(n) {
    return typeof n === e || "a" + (t < 1 ? "n " : " ") + e;
  };
});
const pr = {};
Et.transitional = function(t, r, n) {
  function l(o, s) {
    return "[Axios v" + $t + "] Transitional option '" + o + "'" + s + (n ? ". " + n : "");
  }
  return (o, s, i) => {
    if (t === !1)
      throw new m(
        l(s, " has been removed" + (r ? " in " + r : "")),
        m.ERR_DEPRECATED
      );
    return r && !pr[s] && (pr[s] = !0, console.warn(
      l(
        s,
        " has been deprecated since v" + r + " and will be removed in the near future"
      )
    )), t ? t(o, s, i) : !0;
  };
};
Et.spelling = function(t) {
  return (r, n) => (console.warn(`${n} is likely a misspelling of ${t}`), !0);
};
function bs(e, t, r) {
  if (typeof e != "object" || e === null)
    throw new m("options must be an object", m.ERR_BAD_OPTION_VALUE);
  const n = Object.keys(e);
  let l = n.length;
  for (; l-- > 0; ) {
    const o = n[l], s = Object.prototype.hasOwnProperty.call(t, o) ? t[o] : void 0;
    if (s) {
      const i = e[o], a = i === void 0 || s(i, o, e);
      if (a !== !0)
        throw new m(
          "option " + o + " must be " + a,
          m.ERR_BAD_OPTION_VALUE
        );
      continue;
    }
    if (r !== !0)
      throw new m("Unknown option " + o, m.ERR_BAD_OPTION);
  }
}
const ut = {
  assertOptions: bs,
  validators: Et
}, j = ut.validators;
let xe = class {
  constructor(t) {
    this.defaults = t || {}, this.interceptors = {
      request: new tr(),
      response: new tr()
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
          let l = {};
          Error.captureStackTrace ? Error.captureStackTrace(l) : l = new Error();
          const o = l.stack;
          let s = "";
          if (typeof o == "string") {
            const i = o.indexOf(`
`);
            s = i === -1 ? "" : o.slice(i + 1);
          }
          if (!n.stack)
            n.stack = s;
          else if (s) {
            const i = s.indexOf(`
`), a = i === -1 ? -1 : s.indexOf(`
`, i + 1), f = a === -1 ? "" : s.slice(a + 1);
            String(n.stack).endsWith(f) || (n.stack += `
` + s);
          }
        } catch {
        }
      throw n;
    }
  }
  _request(t, r) {
    typeof t == "string" ? (r = r || {}, r.url = t) : r = t || {}, r = Oe(this.defaults, r);
    const { transitional: n, paramsSerializer: l, headers: o } = r;
    n !== void 0 && ut.assertOptions(
      n,
      {
        silentJSONParsing: j.transitional(j.boolean),
        forcedJSONParsing: j.transitional(j.boolean),
        clarifyTimeoutError: j.transitional(j.boolean),
        legacyInterceptorReqResOrdering: j.transitional(j.boolean),
        advertiseZstdAcceptEncoding: j.transitional(j.boolean),
        validateStatusUndefinedResolves: j.transitional(j.boolean)
      },
      !1
    ), l != null && (c.isFunction(l) ? r.paramsSerializer = {
      serialize: l
    } : ut.assertOptions(
      l,
      {
        encode: j.function,
        serialize: j.function
      },
      !0
    )), r.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? r.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : r.allowAbsoluteUrls = !0), ut.assertOptions(
      r,
      {
        baseUrl: j.spelling("baseURL"),
        withXsrfToken: j.spelling("withXSRFToken")
      },
      !0
    ), r.method = (c.getSafeProp(r, "method") || c.getSafeProp(this.defaults, "method") || "get").toLowerCase();
    let s = o && c.merge(o.common, o[r.method]);
    o && c.forEach(sn.concat("common"), (x) => {
      delete o[x];
    }), r.headers = $.concat(s, o);
    const i = [];
    let a = !0;
    this.interceptors.request.forEach(function(O) {
      if (typeof O.runWhen == "function" && O.runWhen(r) === !1)
        return;
      a = a && O.synchronous;
      const T = r.transitional || Ht;
      T && T.legacyInterceptorReqResOrdering ? i.unshift(O.fulfilled, O.rejected) : i.push(O.fulfilled, O.rejected);
    });
    const f = [];
    this.interceptors.response.forEach(function(O) {
      f.push(O.fulfilled, O.rejected);
    });
    let u, h = 0, g;
    if (!a) {
      const x = [kt.bind(this), void 0];
      for (x.unshift(...i), x.push(...f), g = x.length, u = Promise.resolve(r); h < g; )
        u = u.then(x[h++], x[h++]);
      return u;
    }
    g = i.length;
    let E = r;
    for (; h < g; ) {
      const x = i[h++], O = i[h++];
      try {
        E = x ? x(E) : E;
      } catch (T) {
        if (!O) {
          u = Promise.reject(T);
          break;
        }
        try {
          const p = O.call(this, T);
          c.isThenable(p) && (u = Promise.resolve(p).then(
            () => kt.call(this, E)
          ));
        } catch (p) {
          u = Promise.reject(p);
        }
        break;
      }
    }
    if (!u)
      try {
        u = kt.call(this, E);
      } catch (x) {
        u = Promise.reject(x);
      }
    for (h = 0, g = f.length; h < g; )
      u = u.then(f[h++], f[h++]);
    return u;
  }
  getUri(t) {
    t = Oe(this.defaults, t);
    const r = un(t.baseURL, t.url, t.allowAbsoluteUrls, t);
    return rn(r, t.params, t.paramsSerializer);
  }
};
c.forEach(["delete", "get", "head", "options"], function(t) {
  xe.prototype[t] = function(r, n) {
    return this.request(
      Oe(n || {}, {
        method: t,
        url: r,
        data: n && c.hasOwnProp(n, "data") ? n.data : void 0
      })
    );
  };
});
c.forEach(["post", "put", "patch", "query"], function(t) {
  function r(n) {
    return function(o, s, i) {
      return this.request(
        Oe(i || {}, {
          method: t,
          headers: n ? {
            "Content-Type": "multipart/form-data"
          } : {},
          url: o,
          data: s
        })
      );
    };
  }
  xe.prototype[t] = r(), t !== "query" && (xe.prototype[t + "Form"] = r(!0));
});
let ys = class gn {
  constructor(t) {
    if (typeof t != "function")
      throw new TypeError("executor must be a function.");
    let r;
    this.promise = new Promise(function(o) {
      r = o;
    });
    const n = this;
    this.promise.then((l) => {
      if (!n._listeners) return;
      let o = n._listeners.length;
      for (; o-- > 0; )
        n._listeners[o](l);
      n._listeners = null;
    }), this.promise.then = (l) => {
      let o;
      const s = new Promise((i) => {
        n.subscribe(i), o = i;
      }).then(l);
      return s.cancel = function() {
        n.unsubscribe(o);
      }, s;
    }, t(function(o, s, i) {
      n.reason || (n.reason = new et(o, s, i), r(n.reason));
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
      token: new gn(function(l) {
        t = l;
      }),
      cancel: t
    };
  }
};
function ws(e) {
  return function(r) {
    return e.apply(null, r);
  };
}
function Es(e) {
  return c.isObject(e) && e.isAxiosError === !0;
}
const ft = {
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
Object.entries(ft).forEach(([e, t]) => {
  ft[t] === void 0 && (ft[t] = e);
});
function bn(e) {
  const t = new xe(e), r = Hr(xe.prototype.request, t);
  return c.extend(r, xe.prototype, t, { allOwnKeys: !0 }), c.extend(r, t, null, { allOwnKeys: !0 }), r.create = function(l) {
    return bn(Oe(e, l));
  }, r;
}
const I = bn(Qe);
I.Axios = xe;
I.CanceledError = et;
I.CancelToken = ys;
I.isCancel = an;
I.VERSION = $t;
I.toFormData = wt;
I.AxiosError = m;
I.Cancel = I.CanceledError;
I.all = function(t) {
  return Promise.all(t);
};
I.spread = ws;
I.isAxiosError = Es;
I.mergeConfig = Oe;
I.AxiosHeaders = $;
I.formToJSON = (e) => on(c.isHTMLForm(e) ? new FormData(e) : e);
I.getAdapter = mn.getAdapter;
I.HttpStatusCode = ft;
I.default = I;
const {
  Axios: wi,
  AxiosError: Ei,
  CanceledError: xi,
  isCancel: Si,
  CancelToken: Ri,
  VERSION: Oi,
  all: Ni,
  Cancel: Ti,
  isAxiosError: Ai,
  spread: _i,
  toFormData: Ci,
  AxiosHeaders: ki,
  HttpStatusCode: Pi,
  formToJSON: vi,
  getAdapter: Li,
  mergeConfig: Ii,
  create: Di
} = I, xs = [
  U.ENDPOINTS.REFRESH,
  U.ENDPOINTS.MAGIC_LINK_REQUEST,
  U.ENDPOINTS.MAGIC_LINK_VERIFY,
  U.ENDPOINTS.PASSKEY_LOGIN_OPTIONS,
  U.ENDPOINTS.PASSKEY_LOGIN_VERIFY
], Ss = (e) => !!e && xs.some((t) => e.split("?")[0].endsWith(t)), Rs = (e, t) => {
  const r = I.create({
    baseURL: e,
    timeout: U.DEFAULT_CONFIG.TIMEOUT,
    headers: {
      "Content-Type": "application/json",
      ...t && { "X-API-Key": t }
    }
  });
  return r.interceptors.request.use(
    (n) => {
      const l = ie.getAccessToken();
      return l && n.headers && (n.headers.Authorization = `Bearer ${l}`), n;
    },
    (n) => Promise.reject(n)
  ), r.interceptors.response.use(
    (n) => n,
    async (n) => {
      const l = n.config;
      if (n.response?.status === U.STATUS_CODES.UNAUTHORIZED && !l._retry && !Ss(l.url)) {
        l._retry = !0;
        try {
          const o = ie.getRefreshToken();
          if (!o)
            throw new Error(cl.NO_REFRESH_TOKEN);
          const s = await r.post(U.ENDPOINTS.REFRESH, {
            refreshToken: o
          }), i = {
            accessToken: s.data.accessToken,
            refreshToken: s.data.refreshToken
          };
          return ie.setTokens(i.accessToken, i.refreshToken), l.headers && (l.headers.Authorization = `Bearer ${i.accessToken}`), r(l);
        } catch (o) {
          return ie.clearTokens(), window.location.href = "/login", Promise.reject(o);
        }
      }
      return Promise.reject(n);
    }
  ), r;
};
let ot = null;
const oe = (e, t) => {
  if (!ot && e && (ot = Rs(e, t)), !ot)
    throw new Error("API client not initialized. Please provide baseURL.");
  return ot;
}, mr = (e, t) => e?.name === "NotAllowedError" ? "Passkey request was cancelled or timed out" : e?.name === "InvalidStateError" ? "A passkey for this account is already registered on this device" : e?.response?.data?.message || e?.message || t, fe = {
  /**
   * Logout user and invalidate refresh token
   * @param refreshToken - The refresh token to invalidate
   * @returns Promise resolving when logout is complete
   */
  logout: async (e) => {
    try {
      await oe().post(U.ENDPOINTS.LOGOUT, {
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
      const r = await oe().post(U.ENDPOINTS.REFRESH, {
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
      const t = await oe().get(U.ENDPOINTS.USER_ME), r = t.data?.data ?? t.data;
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
      await oe().post(U.ENDPOINTS.MAGIC_LINK_REQUEST, {
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
      const r = await oe().post(U.ENDPOINTS.MAGIC_LINK_VERIFY, {
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
      const e = oe(), t = await e.post(U.ENDPOINTS.PASSKEY_LOGIN_OPTIONS), { challengeId: r, options: n } = t.data, l = await Yn({ optionsJSON: n }), o = await e.post(
        U.ENDPOINTS.PASSKEY_LOGIN_VERIFY,
        { challengeId: r, response: l },
        { withCredentials: !0 }
      );
      return {
        tokens: {
          accessToken: o.data.accessToken,
          refreshToken: o.data.refreshToken
        },
        user: o.data.user
      };
    } catch (e) {
      throw new Error(mr(e, "Passkey sign-in failed"));
    }
  },
  /**
   * Register a new passkey for the currently signed-in user
   * @param name - Optional friendly name for the passkey (e.g. "MacBook Pro")
   * @returns Promise resolving to the stored passkey info
   */
  registerPasskey: async (e) => {
    try {
      const t = oe(), r = await t.post(U.ENDPOINTS.PASSKEY_REGISTER_OPTIONS), { challengeId: n, options: l } = r.data, o = await Wn({ optionsJSON: l });
      return (await t.post(U.ENDPOINTS.PASSKEY_REGISTER_VERIFY, {
        challengeId: n,
        response: o,
        name: e
      })).data;
    } catch (t) {
      throw new Error(mr(t, "Passkey registration failed"));
    }
  }
}, Os = ({
  className: e,
  children: t,
  onClose: r
}) => /* @__PURE__ */ y(
  "div",
  {
    role: "alert",
    "data-slot": "alert",
    className: N(
      "ll:relative ll:flex ll:items-start ll:gap-3 ll:rounded-[10px] ll:border ll:border-error-border ll:bg-error-bg ll:px-4 ll:py-3 ll:font-body ll:text-[15px] ll:leading-normal ll:text-error-text",
      r && "ll:pr-11",
      X,
      e
    ),
    children: [
      /* @__PURE__ */ d(
        vn,
        {
          "aria-hidden": !0,
          className: "ll:mt-0.5 ll:size-5 ll:shrink-0 ll:text-error-icon"
        }
      ),
      /* @__PURE__ */ d("div", { className: "ll:min-w-0 ll:flex-1", children: t }),
      r && /* @__PURE__ */ d(
        "button",
        {
          type: "button",
          "aria-label": "Close",
          onClick: r,
          className: "ll:absolute ll:top-2.5 ll:right-2.5 ll:inline-flex ll:size-7 ll:items-center ll:justify-center ll:rounded-md ll:text-error-text ll:opacity-80 ll:outline-none ll:hover:bg-error-text/10 ll:hover:opacity-100 ll:focus-visible:outline-2 ll:focus-visible:outline-accent",
          children: /* @__PURE__ */ d(Ln, { "aria-hidden": !0, className: "ll:size-4" })
        }
      )
    ]
  }
), Ns = Fn(
  [
    "ll:inline-flex ll:shrink-0 ll:items-center ll:justify-center ll:gap-2 ll:rounded-[10px] ll:font-heading ll:font-semibold ll:whitespace-nowrap",
    "ll:outline-none ll:focus-visible:outline-2 ll:focus-visible:outline-offset-2 ll:focus-visible:outline-accent",
    "ll:disabled:cursor-default",
    "ll:[&_svg]:pointer-events-none ll:[&_svg]:shrink-0",
    X
  ],
  {
    variants: {
      variant: {
        // Filled accent (Magic Link)
        default: "ll:bg-accent ll:text-accent-foreground ll:hover:bg-accent-hover ll:disabled:bg-accent ll:disabled:opacity-60",
        // Provider buttons (Google, Microsoft)
        outline: "ll:w-full ll:border ll:border-line ll:bg-surface ll:px-4 ll:text-[15px] ll:text-heading ll:hover:border-accent ll:disabled:border-line ll:disabled:text-muted ll:disabled:hover:border-line",
        // Accent hairline (passkey, back to sign in): uppercase and letter-spaced, as before
        "outline-accent": "ll:w-full ll:border-[1.5px] ll:border-accent ll:bg-surface ll:px-4 ll:text-[13px] ll:tracking-[0.14em] ll:text-accent ll:uppercase ll:hover:border-accent-hover ll:hover:bg-accent/6 ll:disabled:border-line ll:disabled:text-muted ll:disabled:hover:bg-surface",
        // Accent label, no box (Try Again)
        ghost: "ll:px-2 ll:py-1.5 ll:text-[15px] ll:text-accent ll:hover:bg-accent/6"
      },
      size: {
        control: Ye,
        auto: ""
      }
    },
    defaultVariants: { variant: "default", size: "control" }
  }
), Le = we.forwardRef(
  ({ className: e, variant: t, size: r, type: n = "button", ...l }, o) => /* @__PURE__ */ d(
    "button",
    {
      ref: o,
      type: n,
      "data-slot": "button",
      className: N(Ns({ variant: t, size: r }), e),
      ...l
    }
  )
);
Le.displayName = "Button";
const qt = ({
  className: e,
  label: t = "Loading"
}) => /* @__PURE__ */ d(
  In,
  {
    role: t ? "status" : void 0,
    "aria-label": t ?? void 0,
    "aria-hidden": t ? void 0 : !0,
    className: N("ll:size-4 ll:animate-spin", e)
  }
), Ts = (e) => /* @__PURE__ */ d(
  "svg",
  {
    viewBox: "0 0 24 24",
    width: "1em",
    height: "1em",
    "aria-hidden": !0,
    focusable: "false",
    ...e,
    children: /* @__PURE__ */ d(
      "path",
      {
        fill: "currentColor",
        d: "M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
      }
    )
  }
), As = ({
  title: e,
  fontFamily: t,
  children: r
}) => /* @__PURE__ */ d(Me.Provider, { delayDuration: 300, children: /* @__PURE__ */ y(Me.Root, { children: [
  /* @__PURE__ */ d(Me.Trigger, { asChild: !0, children: r }),
  /* @__PURE__ */ d(Me.Portal, { children: /* @__PURE__ */ d(
    Me.Content,
    {
      sideOffset: 6,
      style: { fontFamily: t },
      className: "ll:z-[1500] ll:rounded-md ll:bg-tooltip ll:px-2 ll:py-1 ll:text-[12px] ll:font-medium ll:text-tooltip-foreground ll:shadow-md",
      children: e
    }
  ) })
] }) }), _s = [0, 45, 90, 135, 180, 225, 270, 315], Cs = (e) => /* @__PURE__ */ y(
  "svg",
  {
    viewBox: "0 0 24 24",
    width: "1em",
    height: "1em",
    "aria-hidden": !0,
    focusable: "false",
    ...e,
    children: [
      /* @__PURE__ */ d("circle", { cx: "12", cy: "12", r: "4.6", fill: "currentColor" }),
      _s.map((t) => /* @__PURE__ */ d(
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
    ]
  }
), ks = (e) => {
  const t = `lumora-moon-${kr()}`;
  return /* @__PURE__ */ y(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: "1em",
      height: "1em",
      "aria-hidden": !0,
      focusable: "false",
      ...e,
      children: [
        /* @__PURE__ */ y("mask", { id: t, children: [
          /* @__PURE__ */ d("rect", { width: "24", height: "24", fill: "#fff" }),
          /* @__PURE__ */ d("circle", { cx: "15.8", cy: "8.2", r: "4.6", fill: "#000" })
        ] }),
        /* @__PURE__ */ d(
          "circle",
          {
            cx: "12",
            cy: "12",
            r: "7.5",
            fill: "currentColor",
            mask: `url(#${t})`
          }
        )
      ]
    }
  );
}, Ps = ({ title: e, height: t, color: r }) => /* @__PURE__ */ y(
  "svg",
  {
    role: "img",
    "aria-label": e,
    viewBox: "0 0 143 38",
    height: t,
    width: t * 143 / 38,
    style: { display: "block", fill: r, transition: rl },
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
), gr = `${bt("opacity")}, transform ${Dt}ms ${Pe}`, br = ({
  brandConfig: e,
  theme: t,
  onToggleColorMode: r,
  showWelcome: n = !0
}) => {
  const l = t.mode === "dark", o = l ? "light" : "dark";
  return /* @__PURE__ */ y("header", { className: "ll:[&_*]:transition-[background-color,border-color,color,box-shadow] ll:[&_*]:duration-[350ms] ll:[&_*]:ease-[cubic-bezier(0.4,0,0.2,1)]", children: [
    /* @__PURE__ */ y("div", { className: "ll:flex ll:items-center ll:justify-between ll:gap-4", children: [
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
        Ps,
        {
          title: e.companyName || "Lumora Capital",
          height: e.logoHeight,
          color: t.logo
        }
      ),
      /* @__PURE__ */ d(
        As,
        {
          title: `Switch to ${o} mode`,
          fontFamily: t.bodyFont,
          children: /* @__PURE__ */ y(
            "button",
            {
              type: "button",
              "aria-label": `Switch to ${o} mode`,
              onClick: r,
              className: N(
                "ll:relative ll:inline-flex ll:size-[30px] ll:shrink-0 ll:items-center ll:justify-center ll:rounded-full ll:border-2 ll:outline-none ll:focus-visible:outline-2 ll:focus-visible:outline-offset-2 ll:focus-visible:outline-accent",
                // Light: white button, amber sun. Dark: the page's own surface, pale moon
                "ll:border-[#d9dbe1] ll:bg-white ll:dark:border-line ll:dark:bg-surface",
                X
              ),
              children: [
                /* @__PURE__ */ d(
                  Cs,
                  {
                    className: "ll:absolute ll:text-[17px] ll:text-[#de9733]",
                    style: {
                      opacity: l ? 0 : 1,
                      transform: l ? "rotate(-90deg) scale(0.6)" : "none",
                      transition: gr
                    }
                  }
                ),
                /* @__PURE__ */ d(
                  ks,
                  {
                    className: "ll:absolute ll:text-[17px] ll:text-heading",
                    style: {
                      opacity: l ? 1 : 0,
                      transform: l ? "none" : "rotate(90deg) scale(0.6)",
                      transition: gr
                    }
                  }
                )
              ]
            }
          )
        }
      )
    ] }),
    n && /* @__PURE__ */ y(Kt, { children: [
      /* @__PURE__ */ y("h1", { className: "ll:mt-9 ll:font-heading ll:text-[42px] ll:leading-[1.12] ll:font-semibold ll:tracking-[-0.01em] ll:text-welcome ll:short:mt-6", children: [
        e.welcomeTitle,
        e.welcomeTitleAccent && /* @__PURE__ */ y(Kt, { children: [
          " ",
          /* @__PURE__ */ d("span", { className: "ll:text-welcome-accent", children: e.welcomeTitleAccent })
        ] })
      ] }),
      e.tagline && /* @__PURE__ */ d("p", { className: "ll:mt-3 ll:font-body ll:text-[18px] ll:leading-[1.4] ll:font-normal ll:text-tagline ll:short:mt-2", children: e.tagline })
    ] })
  ] });
}, yr = ({
  icon: e,
  label: t,
  ariaLabel: r,
  loadingLabel: n = "Signing in...",
  isLoading: l = !1,
  disabled: o = !1,
  onClick: s
}) => /* @__PURE__ */ y(
  Le,
  {
    variant: "outline",
    "aria-label": l ? n : r,
    onClick: s,
    disabled: o,
    className: "ll:[&_svg]:text-[20px]",
    children: [
      l ? /* @__PURE__ */ d(qt, { label: null, className: "ll:size-[18px]" }) : e,
      l ? n : t
    ]
  }
), vs = ({
  monochrome: e = !1,
  ...t
}) => /* @__PURE__ */ y(
  "svg",
  {
    viewBox: "0 0 23 23",
    width: "1em",
    height: "1em",
    "aria-hidden": !0,
    focusable: "false",
    ...t,
    children: [
      /* @__PURE__ */ d(
        "path",
        {
          fill: e ? "currentColor" : "#f35325",
          d: "M1 1h10v10H1z"
        }
      ),
      /* @__PURE__ */ d(
        "path",
        {
          fill: e ? "currentColor" : "#81bc06",
          d: "M12 1h10v10H12z"
        }
      ),
      /* @__PURE__ */ d(
        "path",
        {
          fill: e ? "currentColor" : "#05a6f0",
          d: "M1 12h10v10H1z"
        }
      ),
      /* @__PURE__ */ d(
        "path",
        {
          fill: e ? "currentColor" : "#ffba08",
          d: "M12 12h10v10H12z"
        }
      )
    ]
  }
);
function Ls(e, t, r) {
  return r === void 0 && (r = {}), function(n, l, o) {
    try {
      return Promise.resolve((function(s, i) {
        try {
          var a = (t != null && t.context && process.env.NODE_ENV === "development" && console.warn("You should not used the yup options context. Please, use the 'useForm' context object instead"), Promise.resolve(e[r.mode === "sync" ? "validateSync" : "validate"](n, Object.assign({ abortEarly: !1 }, t, { context: l }))).then(function(f) {
            return o.shouldUseNativeValidation && jn({}, o), { values: r.raw ? Object.assign({}, n) : f, errors: {} };
          }));
        } catch (f) {
          return i(f);
        }
        return a && a.then ? a.then(void 0, i) : a;
      })(0, function(s) {
        if (!s.inner) throw s;
        return { values: {}, errors: $n((i = s, a = !o.shouldUseNativeValidation && o.criteriaMode === "all", (i.inner || []).reduce(function(f, u) {
          if (f[u.path] || (f[u.path] = { message: u.message, type: u.type }), a) {
            var h = f[u.path].types, g = h && h[u.type];
            f[u.path] = Mn(u.path, a, f, u.type, g ? [].concat(g, u.message) : u.message);
          }
          return f;
        }, {})), o) };
        var i, a;
      }));
    } catch (s) {
      return Promise.reject(s);
    }
  };
}
const Is = N(
  "ll:flex ll:w-full ll:min-w-0 ll:rounded-[10px] ll:border ll:border-input ll:bg-input-bg ll:px-4 ll:font-body ll:text-[16px] ll:text-input-foreground ll:outline-none",
  "ll:transition-[background-color,border-color,color,box-shadow] ll:duration-[350ms] ll:ease-[cubic-bezier(0.4,0,0.2,1)]",
  "ll:placeholder:text-placeholder ll:placeholder:opacity-100 ll:hover:border-input-hover",
  "ll:focus-visible:border-accent ll:focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--lumora-accent)_15%,transparent)]",
  "ll:disabled:cursor-not-allowed ll:disabled:border-dashed ll:disabled:border-input-disabled-border ll:disabled:bg-input-disabled ll:disabled:text-input-disabled-foreground",
  "ll:aria-invalid:border-destructive ll:aria-invalid:hover:border-destructive",
  Ye
), yn = we.forwardRef(({ className: e, type: t = "text", ...r }, n) => /* @__PURE__ */ d(
  "input",
  {
    ref: n,
    type: t,
    "data-slot": "input",
    className: N(Is, e),
    ...r
  }
));
yn.displayName = "Input";
const wn = "ll:block ll:font-body ll:text-[12px] ll:font-bold ll:tracking-[0.14em] ll:uppercase ll:text-label", Ds = ({ className: e, ...t }) => /* @__PURE__ */ d(
  Bn.Root,
  {
    "data-slot": "label",
    className: N(wn, e),
    ...t
  }
), Us = Wt.object({
  email: Wt.string().email("Please enter a valid email address").required("Email is required")
}), Fs = ({
  isSubmitting: e,
  disabled: t = !1,
  onSubmit: r
}) => {
  const {
    register: n,
    handleSubmit: l,
    formState: { errors: o }
  } = Hn({
    resolver: Ls(Us)
  }), s = e || t;
  return /* @__PURE__ */ y("form", { noValidate: !0, onSubmit: l(r), children: [
    /* @__PURE__ */ d(Ds, { htmlFor: "lumora-work-email", className: "ll:mb-3", children: "Work email" }),
    /* @__PURE__ */ y("div", { className: "ll:flex ll:gap-2.5", children: [
      /* @__PURE__ */ d(
        yn,
        {
          ...n("email"),
          id: "lumora-work-email",
          type: "email",
          autoComplete: "email",
          placeholder: "name@lumora.capital",
          disabled: s,
          "aria-invalid": !!o.email,
          "aria-describedby": o.email ? "lumora-work-email-error" : void 0,
          className: "ll:flex-1"
        }
      ),
      /* @__PURE__ */ d(
        Le,
        {
          type: "submit",
          disabled: s,
          className: "ll:min-w-[92px] ll:px-3 ll:text-[15px]",
          children: e ? /* @__PURE__ */ d(
            qt,
            {
              label: "Sending sign-in link",
              className: "ll:size-5"
            }
          ) : "Magic Link"
        }
      )
    ] }),
    o.email && /* @__PURE__ */ d(
      "div",
      {
        id: "lumora-work-email-error",
        role: "status",
        className: "ll:mt-2 ll:text-[13px] ll:text-destructive",
        children: o.email.message
      }
    )
  ] });
}, Bs = ({
  title: e,
  description: t,
  onBackToLogin: r
}) => /* @__PURE__ */ y("div", { children: [
  /* @__PURE__ */ d("div", { className: "ll:grid ll:size-12 ll:place-items-center ll:rounded-[12px] ll:bg-accent/12 ll:text-accent", children: /* @__PURE__ */ d(Dn, { "aria-hidden": !0, className: "ll:size-6" }) }),
  /* @__PURE__ */ d("h1", { className: "ll:mt-6 ll:font-heading ll:text-[28px] ll:leading-[1.15] ll:font-semibold ll:text-heading ll:sm:text-[32px]", children: e }),
  /* @__PURE__ */ d("p", { className: "ll:mt-4 ll:text-[16px] ll:leading-[1.6] ll:whitespace-pre-line ll:text-label", children: t }),
  /* @__PURE__ */ d(
    Le,
    {
      variant: "outline-accent",
      size: "auto",
      onClick: r,
      className: "ll:mt-8 ll:h-[52px]",
      children: "Back to sign in"
    }
  )
] }), Ms = typeof window > "u" ? Y : Pr, wr = ({ weight: e, className: t }) => /* @__PURE__ */ d(
  "div",
  {
    "aria-hidden": !0,
    className: t,
    style: { flex: `${e} 1 0px` }
  }
), It = ({
  mode: e,
  style: t,
  className: r,
  children: n,
  footer: l,
  hero: o,
  mobileHero: s,
  skipEntrance: i = !1
}) => {
  const a = we.Children.toArray(n), [f, u] = q(e), [h, g] = q(!1);
  e !== f && (u(e), g(!0)), Y(() => {
    if (!h) return;
    let O = requestAnimationFrame(() => {
      O = requestAnimationFrame(() => g(!1));
    });
    return () => cancelAnimationFrame(O);
  }, [h, f]);
  const E = ve(null), x = ve(i);
  return Ms(() => {
    if (x.current)
      for (const O of E.current?.getAnimations?.({
        subtree: !0
      }) ?? [])
        O.effect?.getTiming().iterations !== 1 / 0 && O.finish();
  }, []), // Full-width page background; the layout inside is capped and centred on wide screens.
  // Desktop: centres the capped layout vertically on very tall screens.
  /* @__PURE__ */ d(
    "div",
    {
      ref: E,
      "data-color-scheme": e,
      "data-mode-switching": h || void 0,
      className: N(
        "lumora-login ll:min-h-screen ll:items-center ll:bg-page ll:md:flex",
        X,
        r
      ),
      style: t,
      children: /* @__PURE__ */ y(
        "div",
        {
          className: N(
            // Beyond 1760px the hero would blow its artwork and headline up past their designed
            // size; at 1760px the dashboards show at about 1x
            "ll:mx-auto ll:grid ll:min-h-screen ll:w-full ll:max-w-[1760px] ll:md:min-h-0",
            // Desktop: one screen tall, so the page itself never scrolls (no jump on reload, no flash
            // while fonts load), capped at 1120px so very tall screens do not stretch the hero into an
            // empty band; the sign-in panel scrolls inside if it must
            "ll:md:h-[min(100vh,1120px)]",
            // One row exactly the layout's height: content taller than that (a dashboard image) is
            // clipped by the hero or scrolls in the panel, never stretches the page.
            // minmax(0, …) lets the column shrink below its content's width on phones.
            "ll:grid-cols-[minmax(0,1fr)] ll:md:grid-cols-[minmax(400px,440px)_minmax(0,1fr)] ll:md:grid-rows-[minmax(0,1fr)] ll:xl:grid-cols-[480px_minmax(0,1fr)]",
            "ll:bg-page ll:font-body ll:text-body",
            X
          ),
          children: [
            /* @__PURE__ */ d(
              "main",
              {
                className: N(
                  "ll:flex ll:justify-center ll:px-6 ll:pt-10 ll:pb-8 ll:sm:px-12 ll:sm:pt-14 ll:sm:pb-10",
                  "ll:short:pt-9 ll:short:pb-4.5",
                  // Scrolls on its own beside the hero; on phones the page scrolls as usual. When an error
                  // or validation line overflows a laptop-height panel: a thin, quiet scrollbar. Its space
                  // is not reserved, which would narrow the panel all the time on Windows just to avoid a
                  // reflow while an error shows.
                  "ll:overflow-x-clip ll:md:overflow-y-auto ll:[scrollbar-width:thin] ll:[scrollbar-color:var(--lumora-border)_transparent]"
                ),
                children: /* @__PURE__ */ y("div", { className: "ll:flex ll:w-full ll:max-w-[440px] ll:flex-col ll:md:h-[min(100%,960px)] ll:md:self-center", children: [
                  a.map((O, T) => /* @__PURE__ */ y(
                    we.Fragment,
                    {
                      children: [
                        T > 0 && /* @__PURE__ */ d(
                          wr,
                          {
                            weight: 1,
                            className: "ll:min-h-[18px] ll:short:min-h-2"
                          }
                        ),
                        /* @__PURE__ */ y(
                          "div",
                          {
                            className: "ll:flex ll:flex-col",
                            style: {
                              animation: ue(T * 50)
                            },
                            children: [
                              O,
                              T === 0 && s && /* @__PURE__ */ d("div", { className: "ll:mt-[18px] ll:block ll:md:hidden", children: s })
                            ]
                          }
                        )
                      ]
                    },
                    we.isValidElement(O) ? O.key : T
                  )),
                  /* @__PURE__ */ d(
                    wr,
                    {
                      weight: 3,
                      className: "ll:min-h-10 ll:short:min-h-6"
                    }
                  ),
                  /* @__PURE__ */ d(
                    "div",
                    {
                      style: {
                        animation: ue(a.length * 50)
                      },
                      children: l
                    }
                  )
                ] })
              }
            ),
            /* @__PURE__ */ d("div", { className: "ll:hidden ll:h-full ll:p-4 ll:pl-0 ll:md:block", children: o })
          ]
        }
      )
    }
  );
}, Ve = (e) => `var(--mark-primary, ${e})`, Er = "var(--mark-secondary, #3D4C5E)", Hs = (e) => `var(--mark-center, ${e})`, js = "var(--mark-ring, #ffffff)", En = ({ platform: e, className: t }) => {
  const r = {
    viewBox: "0 0 30 30",
    width: "1em",
    height: "1em",
    "aria-hidden": !0,
    focusable: !1,
    className: N(
      "ll:shrink-0 ll:[&_*]:[transition:fill_350ms_cubic-bezier(0.4,0,0.2,1),stroke_350ms_cubic-bezier(0.4,0,0.2,1)]",
      t
    )
  };
  if (e === "centra") {
    const o = { fill: Ve("#049586") };
    return /* @__PURE__ */ y("svg", { ...r, children: [
      /* @__PURE__ */ d(
        "path",
        {
          style: o,
          d: "M5.60529 3.14542C4.00282 4.40644 2.68044 5.98728 1.72234 7.78732C0.764232 9.58735 0.191389 11.5671 0.0402716 13.6007C-0.110846 15.6342 0.163072 17.6769 0.844589 19.5988C1.52611 21.5207 2.60029 23.2796 3.99877 24.7637L7.18245 21.7635C6.20044 20.7214 5.44614 19.4863 4.96758 18.1368C4.48902 16.7872 4.29667 15.3528 4.40279 13.9249C4.5089 12.4969 4.91115 11.1067 5.58393 9.84273C6.25672 8.57874 7.18529 7.46868 8.31054 6.58319L5.60529 3.14542Z"
        }
      ),
      /* @__PURE__ */ d(
        "path",
        {
          style: { fill: Er },
          d: "M27.6715 7.81562C25.8485 4.37255 22.7324 1.79469 19.0087 0.649137C15.2851 -0.496418 11.2588 -0.115827 7.81575 1.70718L9.86273 5.57326C12.2805 4.29314 15.1077 4.02589 17.7225 4.8303C20.3372 5.63471 22.5253 7.44488 23.8055 9.86261L27.6715 7.81562Z"
        }
      ),
      /* @__PURE__ */ d(
        "path",
        {
          style: { fill: Er },
          d: "M5.52492 3.20912C3.27824 5.00262 1.60718 7.41593 0.718835 10.15L4.87928 11.5018C5.50308 9.58194 6.67649 7.88731 8.25411 6.62792L5.52492 3.20912Z"
        }
      ),
      /* @__PURE__ */ d(
        "path",
        {
          style: o,
          d: "M5.89004 26.4517C7.43504 27.6075 9.19261 28.4476 11.0624 28.924C12.9321 29.4004 14.8774 29.5038 16.7871 29.2283C18.6968 28.9528 20.5336 28.3037 22.1924 27.3182C23.8512 26.3327 25.2996 25.03 26.4549 23.4846L22.9511 20.8653C22.1399 21.9505 21.1228 22.8653 19.958 23.5573C18.7932 24.2493 17.5034 24.7051 16.1624 24.8986C14.8214 25.0921 13.4554 25.0195 12.1425 24.6849C10.8296 24.3504 9.5954 23.7605 8.5105 22.9488L5.89004 26.4517Z"
        }
      ),
      /* @__PURE__ */ d(
        "rect",
        {
          style: o,
          x: "18.9181",
          y: "13.7375",
          width: "10.4612",
          height: "2.44368"
        }
      ),
      /* @__PURE__ */ d(
        "path",
        {
          style: o,
          d: "M14.6851 9.76587C17.5534 9.76607 19.8784 12.0918 19.8784 14.9602C19.8782 17.8285 17.5533 20.1534 14.6851 20.1536C11.8166 20.1536 9.49092 17.8286 9.49072 14.9602C9.49072 12.0917 11.8165 9.76587 14.6851 9.76587ZM14.689 11.3313C12.6824 11.3314 11.0554 12.9576 11.0552 14.9641C11.0552 16.9708 12.6823 18.5978 14.689 18.5979C16.6957 18.5979 18.3228 16.9708 18.3228 14.9641C18.3226 12.9575 16.6956 11.3313 14.689 11.3313Z"
        }
      )
    ] });
  }
  if (e === "xpdite") {
    const o = { fill: Ve("#0F62B0") };
    return /* @__PURE__ */ y("svg", { ...r, children: [
      /* @__PURE__ */ d(
        "rect",
        {
          style: o,
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
          style: o,
          width: "25.3429",
          height: "2.05928",
          transform: "matrix(-0.73373 0.679441 0.679441 0.73373 22.6707 5.96777)"
        }
      ),
      /* @__PURE__ */ d("circle", { style: o, cx: "24.063", cy: "24.9252", r: "3.42298" }),
      /* @__PURE__ */ d("circle", { style: o, cx: "4.44975", cy: "24.9252", r: "3.42298" }),
      /* @__PURE__ */ d("circle", { style: o, cx: "4.44975", cy: "4.45204", r: "3.42298" }),
      /* @__PURE__ */ d(
        "circle",
        {
          style: { fill: Hs("#0F62B0"), stroke: js },
          cx: "14.1725",
          cy: "14.5849",
          r: "3.18086",
          strokeWidth: "1.33541"
        }
      ),
      /* @__PURE__ */ d(
        "circle",
        {
          style: { fill: "none", stroke: Ve("#0F62B0") },
          cx: "3.42298",
          cy: "3.42298",
          r: "2.75528",
          strokeWidth: "1.33541",
          transform: "matrix(-0.982613 -0.185667 -0.185667 0.982613 29.7455 2.17871)"
        }
      )
    ] });
  }
  const n = { fill: Ve("#03463F") }, l = { fill: "none", stroke: Ve("#03463F") };
  return /* @__PURE__ */ y("svg", { ...r, children: [
    /* @__PURE__ */ d(
      "rect",
      {
        style: n,
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
        style: n,
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
        style: l,
        strokeWidth: "1.33541",
        d: "M8.99036 16.9846V21.3899L5.1759 23.592L1.36145 21.3899V16.9846L5.1759 14.7825L8.99036 16.9846Z"
      }
    ),
    /* @__PURE__ */ d(
      "path",
      {
        style: l,
        strokeWidth: "1.33541",
        d: "M27.9268 17.259V21.6643L24.1123 23.8665L20.2979 21.6643V17.259L24.1123 15.0569L27.9268 17.259Z"
      }
    ),
    /* @__PURE__ */ d(
      "path",
      {
        style: n,
        d: "M14.7128 4.64917L19.195 7.237V12.4127L14.7128 15.0005L10.2305 12.4127V7.237L14.7128 4.64917Z"
      }
    )
  ] });
}, $s = ({
  theme: e,
  value: t,
  platformAssets: r,
  disabled: n = !1,
  allowClear: l = !1,
  onChange: o
}) => {
  const s = e.mode === "dark", i = ve(0), a = Z.findIndex(
    (u) => u.id === t
  );
  a >= 0 && (i.current = a);
  const f = Z[i.current];
  return /* @__PURE__ */ y("div", { children: [
    /* @__PURE__ */ d(
      "div",
      {
        id: "lumora-platform-label",
        className: N(wn, "ll:mb-3"),
        children: "Where would you like to start?"
      }
    ),
    /* @__PURE__ */ y(
      "div",
      {
        className: N(
          "ll:relative ll:rounded-[12px] ll:border ll:border-transparent ll:bg-surface ll:p-2",
          "ll:dark:border-line",
          X
        ),
        style: s ? void 0 : { boxShadow: Qn },
        children: [
          /* @__PURE__ */ d(
            "div",
            {
              "aria-hidden": !0,
              className: "ll:absolute ll:top-2 ll:bottom-2 ll:left-2 ll:w-[calc((100%-16px-8px)/3)] ll:rounded-[8px]",
              style: {
                backgroundColor: f.uiColor,
                // Dark brand colours (Polymer) need an edge to stand out on a dark page
                boxShadow: s ? `inset 0 0 0 1px ${f.colorOnDark}` : "none",
                transform: `translateX(calc(${i.current} * (100% + 4px))) scale(${a >= 0 ? 1 : 0.92})`,
                opacity: a >= 0 ? 1 : 0,
                transition: `transform ${Dt}ms ${Pe}, opacity 200ms ease, ${tl}`
              }
            }
          ),
          /* @__PURE__ */ d(
            "div",
            {
              role: "group",
              "aria-labelledby": "lumora-platform-label",
              className: "ll:relative ll:flex ll:gap-1",
              children: Z.map((u) => {
                const h = s ? u.colorOnDark : u.uiColor, g = r?.[u.id]?.logo, E = u.id === t;
                return /* @__PURE__ */ y(
                  "button",
                  {
                    type: "button",
                    "aria-pressed": E,
                    disabled: n,
                    onClick: () => {
                      E ? l && o(null) : o(u.id);
                    },
                    className: N(
                      "ll:inline-flex ll:min-w-0 ll:flex-1 ll:items-center ll:justify-center ll:gap-1.5 ll:rounded-[8px] ll:px-2 ll:py-0",
                      // App names are set in the heading font (Montserrat), which runs wider than the body font
                      "ll:font-heading ll:text-[14px] ll:font-semibold",
                      "ll:outline-none ll:focus-visible:outline-2 ll:focus-visible:outline-offset-2 ll:focus-visible:outline-(color:--lumora-tab-color)",
                      "ll:disabled:opacity-[0.38]",
                      // The sliding highlight draws the selected background
                      E ? "ll:text-white" : "ll:text-(color:--lumora-tab-color) ll:hover:bg-[color-mix(in_srgb,var(--lumora-tab-color)_8%,transparent)] ll:disabled:hover:bg-transparent",
                      Ye
                    ),
                    style: {
                      "--lumora-tab-color": h,
                      // Logo colours: brand on the card (Centra's arcs white in dark mode), white on
                      // the selected tab, with XPdite's centre node a white ring around the tab colour
                      "--mark-primary": E ? "#ffffff" : h,
                      "--mark-secondary": E || s ? "#ffffff" : "#3D4C5E",
                      "--mark-center": E ? u.uiColor : h,
                      "--mark-ring": E ? "#ffffff" : e.surface,
                      // Hover tint stays quick; the text colour follows the highlight
                      transition: `background-color 150ms, ${bt("color")}`
                    },
                    children: [
                      g ?? /* @__PURE__ */ d(
                        En,
                        {
                          platform: u.id,
                          className: "ll:size-[22px]"
                        }
                      ),
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
}, qe = ({
  width: e,
  height: t
}) => /* @__PURE__ */ d(
  "div",
  {
    className: "ll:rounded-[4px] ll:bg-[rgba(18,51,45,0.09)]",
    style: { width: e, height: t }
  }
), xr = ({
  title: e,
  barColor: t,
  screenshot: r,
  compact: n = !1,
  className: l,
  style: o
}) => {
  const s = n ? 22 : 40, i = n ? 6 : 12;
  return r ? /* @__PURE__ */ d(
    "img",
    {
      src: r,
      alt: `${e} dashboard`,
      className: N(
        // Pinned to the top-left; the hero clips the right and bottom. The drop shadow follows the
        // artwork's rounded corners, unlike box-shadow
        "ll:block ll:min-w-0 ll:object-cover ll:object-top-left ll:drop-shadow-[0_24px_40px_rgba(8,28,24,0.22)]",
        l
      ),
      style: o
    }
  ) : /* @__PURE__ */ y(
    "div",
    {
      className: N(
        "ll:flex ll:flex-col ll:overflow-hidden ll:bg-white ll:shadow-[0_24px_60px_rgba(8,28,24,0.22)]",
        n ? "ll:rounded-[8px]" : "ll:rounded-[14px]",
        l
      ),
      style: o,
      children: [
        /* @__PURE__ */ d(
          "div",
          {
            className: N(
              "ll:flex ll:shrink-0 ll:items-center",
              n ? "ll:gap-1 ll:px-2" : "ll:gap-2 ll:px-4"
            ),
            style: { height: s, backgroundColor: t },
            children: [0, 1, 2].map((a) => /* @__PURE__ */ d(
              "div",
              {
                className: "ll:rounded-full ll:bg-white/55",
                style: { width: i, height: i }
              },
              a
            ))
          }
        ),
        /* @__PURE__ */ d("div", { className: "ll:relative ll:min-h-0 ll:flex-1 ll:bg-[#f7f9f9]", children: /* @__PURE__ */ y(
          "div",
          {
            "data-testid": "screenshot-placeholder",
            className: N(
              "ll:flex ll:flex-col",
              n ? "ll:gap-2 ll:p-2.5" : "ll:gap-4 ll:p-7"
            ),
            children: [
              /* @__PURE__ */ y("div", { className: "ll:flex ll:items-center ll:justify-between", children: [
                /* @__PURE__ */ d(
                  "div",
                  {
                    className: N(
                      "ll:font-semibold ll:text-[#12332d]",
                      n ? "ll:text-[9px] ll:tracking-[0.18em] ll:uppercase" : "ll:text-[18px]"
                    ),
                    children: e
                  }
                ),
                /* @__PURE__ */ d(
                  "div",
                  {
                    className: N(
                      "ll:rounded-full ll:opacity-80",
                      n ? "ll:size-3" : "ll:size-6"
                    ),
                    style: { backgroundColor: t }
                  }
                )
              ] }),
              /* @__PURE__ */ d(qe, { width: "22%", height: n ? 4 : 6 }),
              /* @__PURE__ */ d(
                "div",
                {
                  className: N(
                    "ll:grid ll:grid-cols-3",
                    n ? "ll:mt-1 ll:gap-1.5" : "ll:mt-2 ll:gap-4"
                  ),
                  children: Array.from({ length: 6 }).map((a, f) => /* @__PURE__ */ y(
                    "div",
                    {
                      className: N(
                        "ll:flex ll:flex-col ll:border ll:border-[rgba(18,51,45,0.08)] ll:bg-white",
                        n ? "ll:gap-1 ll:rounded-[4px] ll:p-1.5" : "ll:gap-2 ll:rounded-[10px] ll:p-4"
                      ),
                      style: {
                        borderTop: `${n ? 2 : 3}px solid ${t}`
                      },
                      children: [
                        /* @__PURE__ */ d(
                          qe,
                          {
                            width: "70%",
                            height: n ? 4 : 7
                          }
                        ),
                        /* @__PURE__ */ d(
                          qe,
                          {
                            width: "45%",
                            height: n ? 3 : 5
                          }
                        ),
                        /* @__PURE__ */ d(
                          qe,
                          {
                            width: "85%",
                            height: n ? 3 : 5
                          }
                        ),
                        /* @__PURE__ */ d(
                          qe,
                          {
                            width: "60%",
                            height: n ? 3 : 5
                          }
                        )
                      ]
                    },
                    f
                  ))
                }
              ),
              !n && /* @__PURE__ */ y("div", { className: "ll:mt-2 ll:self-start ll:rounded-full ll:border ll:border-dashed ll:border-[rgba(18,51,45,0.3)] ll:px-3 ll:py-1 ll:text-[12px] ll:text-[rgba(18,51,45,0.6)]", children: [
                e,
                " screenshot placeholder"
              ] })
            ]
          }
        ) })
      ]
    }
  );
}, Sr = "ll:font-semibold ll:leading-[1.08] ll:tracking-[-0.02em]", Rr = (e) => e ? "ll:text-[length:clamp(1.25rem,5.6vw,1.6rem)]" : "ll:text-[length:clamp(2.25rem,4vw,4.25rem)]", Or = (e) => N(
  "ll:flex ll:items-center ll:font-semibold ll:tracking-[0.16em] ll:uppercase",
  e ? "ll:gap-2 ll:text-[10px]" : "ll:gap-3 ll:text-[12px]"
), xn = /* @__PURE__ */ new Set(), Nr = /* @__PURE__ */ new Map(), Sn = {
  light: {},
  dark: {}
}, Rn = {
  light: {},
  dark: {}
}, Tr = {
  light: {},
  dark: {}
}, On = (e) => {
  let t = Nr.get(e);
  if (!t) {
    const r = typeof Image > "u" ? void 0 : new Image();
    r && (r.src = e), t = (typeof r?.decode == "function" ? r.decode().catch(() => {
    }) : Promise.resolve()).then(() => {
      xn.add(e);
    }), Nr.set(e, t);
  }
  return t;
}, Vs = (e, t) => (Tr[t][e] ??= ke(e).loadScreenshot(t).then((r) => (Sn[t][e] = r, On(r))).catch(() => {
  Rn[t][e] = !0;
}), Tr[t][e]), Nn = (e, t, r) => (t === "dark" ? e?.[`${r}Dark`] : void 0) ?? e?.[r], Tn = (e, t, r, n) => {
  const l = Nn(n?.[e], t, r);
  return l ? On(l) : r === "screenshot" ? Vs(e, t) : Promise.resolve();
}, qs = (e, t, r, n) => {
  const l = Nn(n?.[e], t, r) ?? (r === "screenshot" ? Sn[t][e] : void 0);
  return l ? xn.has(l) ? l : null : r === "overviewScreenshot" || Rn[t][e] ? void 0 : null;
}, zs = (e) => {
  if (typeof window.requestIdleCallback == "function") {
    const r = window.requestIdleCallback(e, { timeout: 3e3 });
    return () => window.cancelIdleCallback(r);
  }
  const t = window.setTimeout(e, 200);
  return () => window.clearTimeout(t);
}, Ks = (e, t) => {
  const r = Z.every(
    (l) => t?.[l.id]?.overviewScreenshot
  ) ? ["screenshot", "overviewScreenshot"] : ["screenshot"], n = (l) => Promise.all(
    Z.flatMap(
      (o) => r.map((s) => Tn(o.id, l, s, t))
    )
  );
  n(e).then(
    () => n(e === "dark" ? "light" : "dark")
  );
}, Ws = (e, t, r, n) => {
  const [, l] = q(0), o = e.join(",");
  return Y(() => {
    let s = !1, i;
    return Promise.all(
      e.map(
        (a) => Tn(a, r, t, n).then(() => {
          s || l((f) => f + 1);
        })
      )
    ).then(() => {
      s || (i = zs(() => Ks(r, n)));
    }), () => {
      s = !0, i?.();
    };
  }, [o, t, r, n]), Object.fromEntries(
    e.map((s) => [s, qs(s, r, t, n)])
  );
}, Gs = "74.6%", Js = {
  polymer: "28.1%",
  xpdite: "11.7%",
  centra: "-4.9%"
}, Ar = 2.177, Ys = {
  polymer: { left: "40%", top: "8%", width: "56%" },
  xpdite: { left: "20%", top: "18%", width: "52%" },
  centra: { left: "0%", top: "30%", width: "56%" }
}, _r = ({
  theme: e,
  platform: t,
  platformAssets: r,
  compact: n = !1
}) => {
  const l = t ? ke(t) : null, o = Z.every(
    (a) => r?.[a.id]?.overviewScreenshot
  ), s = Ws(
    l ? [l.id] : Z.map((a) => a.id),
    !l && o ? "overviewScreenshot" : "screenshot",
    e.mode,
    r
  ), i = n ? "ll:px-[18px]" : "ll:md:px-10 ll:lg:px-12";
  return /* @__PURE__ */ d(
    "aside",
    {
      "aria-label": l ? `${l.name} overview` : "Lumora platforms overview",
      className: N(
        "lumora-grid ll:relative ll:flex ll:flex-col ll:overflow-hidden ll:font-body ll:*:relative",
        n ? "ll:h-[200px] ll:rounded-[16px]" : "ll:h-full ll:rounded-[24px]",
        l ? "ll:text-white" : "ll:bg-hero-bg ll:text-heading",
        X
      ),
      style: {
        backgroundColor: l?.color,
        "--lumora-grid-color": l ? "rgba(255, 255, 255, 0.06)" : "var(--lumora-hero-grid)"
      },
      children: l ? /* @__PURE__ */ y(we.Fragment, { children: [
        /* @__PURE__ */ y(
          "div",
          {
            className: N(
              i,
              n ? "ll:pt-[18px]" : "ll:md:pt-14 ll:lg:pt-18"
            ),
            children: [
              /* @__PURE__ */ y(
                "div",
                {
                  className: N(
                    Or(n),
                    "ll:font-heading"
                  ),
                  style: { animation: ue(0) },
                  children: [
                    /* @__PURE__ */ d("div", { className: "ll:h-px ll:w-[22px] ll:bg-current" }),
                    l.name,
                    /* @__PURE__ */ d("span", { "aria-hidden": !0, className: "ll:text-[14px]", children: "•" }),
                    l.area
                  ]
                }
              ),
              /* @__PURE__ */ y(
                "h2",
                {
                  className: N(
                    Sr,
                    Rr(n),
                    // Laptops: wraps every platform's headline the way Polymer's does ("Build agents.
                    // Govern every" 13.3em fits; Centra 14.3em and XPdite 15.2em break onto a second line).
                    // Wide screens (xl): no limit, so a headline stays on one line wherever it fits.
                    // In em, so the limit scales with the font.
                    "ll:max-w-[13.8em] ll:font-heading ll:xl:max-w-none",
                    n ? "ll:mt-2" : "ll:mt-5"
                  ),
                  style: { animation: ue(60) },
                  children: [
                    l.headline,
                    " ",
                    /* @__PURE__ */ d("span", { style: { color: l.accent }, children: l.headlineAccent })
                  ]
                }
              ),
              !n && /* @__PURE__ */ d(
                "div",
                {
                  className: "ll:mt-4 ll:max-w-[640px] ll:text-[18px] ll:leading-normal ll:opacity-[0.92]",
                  style: { animation: ue(120) },
                  children: l.description
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ d(
          "div",
          {
            className: N(
              "ll:-mr-[14px] ll:-mb-[14px] ll:flex ll:flex-1 ll:flex-col",
              n ? "ll:mt-3.5 ll:ml-[18px] ll:min-h-0" : "ll:min-h-[240px] ll:md:mt-10 ll:md:ml-10 ll:lg:mt-12 ll:lg:ml-12"
            ),
            style: {
              animation: `${ll} 450ms ${Pe} 120ms both`
            },
            children: s[l.id] === null ? null : /* @__PURE__ */ d(
              xr,
              {
                title: l.name,
                barColor: l.frameColor,
                screenshot: s[l.id] ?? void 0,
                className: s[l.id] ? (
                  // Scaled by width only, so a tall hero adds space above it instead of zooming
                  // it; sits on the bottom edge and is cut there when the hero is short
                  "ll:mt-auto ll:h-auto ll:w-full ll:shrink-0"
                ) : (
                  // The placeholder window fills the space
                  "ll:flex-1"
                )
              }
            )
          }
        )
      ] }, l.id) : /* @__PURE__ */ y(we.Fragment, { children: [
        /* @__PURE__ */ y(
          "div",
          {
            className: N(
              i,
              n ? "ll:pt-[18px]" : "ll:md:pt-10 ll:lg:pt-12"
            ),
            children: [
              /* @__PURE__ */ y(
                "div",
                {
                  className: "ll:flex ll:items-center ll:justify-between ll:gap-4",
                  style: { animation: ue(0) },
                  children: [
                    /* @__PURE__ */ y(
                      "div",
                      {
                        className: N(
                          Or(n),
                          "ll:font-body ll:text-eyebrow",
                          // The phone banner keeps a small label so the headline fits
                          !n && "ll:text-[16px]",
                          X
                        ),
                        children: [
                          /* @__PURE__ */ d("div", { className: "ll:h-px ll:w-3 ll:bg-current" }),
                          "A Lumora Capital ecosystem"
                        ]
                      }
                    ),
                    !n && // Outlined pill on the hero: no fill, slate border, Lumora green text
                    /* @__PURE__ */ y("div", { className: "ll:shrink-0 ll:rounded-full ll:border ll:border-[#546881] ll:bg-transparent ll:px-3 ll:py-1.5 ll:text-[11px] ll:font-bold ll:tracking-[0.14em] ll:text-brand-text ll:uppercase", children: [
                      Z.length,
                      " platforms · 1 account"
                    ] })
                  ]
                }
              ),
              !n && /* @__PURE__ */ d(
                "div",
                {
                  className: "ll:flex ll:flex-wrap ll:gap-2 ll:md:mt-10 ll:lg:mt-14",
                  style: { animation: ue(60) },
                  children: Z.map((a) => /* @__PURE__ */ y(
                    "div",
                    {
                      className: "ll:inline-flex ll:items-center ll:gap-2 ll:rounded-full ll:px-3.5 ll:py-1.5 ll:font-heading ll:text-[12px] ll:font-semibold ll:tracking-[0.12em] ll:text-white ll:uppercase",
                      style: {
                        backgroundColor: a.uiColor,
                        // Logos as on a selected tab: all white
                        "--mark-primary": "#ffffff",
                        "--mark-secondary": "#ffffff",
                        "--mark-center": a.uiColor,
                        "--mark-ring": "#ffffff"
                      },
                      children: [
                        r?.[a.id]?.logo ?? /* @__PURE__ */ d(
                          En,
                          {
                            platform: a.id,
                            className: "ll:size-4"
                          }
                        ),
                        a.name
                      ]
                    },
                    a.id
                  ))
                }
              ),
              /* @__PURE__ */ y(
                "h2",
                {
                  className: N(
                    Sr,
                    Rr(n),
                    "ll:font-heading ll:text-hero-headline",
                    n ? "ll:mt-2" : "ll:mt-4",
                    X
                  ),
                  style: { animation: ue(120) },
                  children: [
                    "One sign-in.",
                    " ",
                    /* @__PURE__ */ d(
                      "span",
                      {
                        className: N(
                          "ll:text-hero-headline-accent",
                          X
                        ),
                        children: "Every platform."
                      }
                    )
                  ]
                }
              ),
              !n && /* @__PURE__ */ d(
                "div",
                {
                  className: "ll:mt-4 ll:max-w-[540px] ll:font-body ll:text-[18px] ll:leading-[1.55] ll:font-medium ll:text-hero-text",
                  style: { animation: ue(180) },
                  children: "Centra runs the deals. Polymer builds the agents. XPdite trains them. One Lumora account opens all three."
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ d(
          "div",
          {
            className: N(
              "ll:relative ll:flex-1",
              n ? "ll:mx-[18px] ll:mt-3 ll:min-h-0" : "ll:mt-0 ll:min-h-[220px] ll:md:mx-10 ll:lg:mx-12"
            ),
            style: { containerType: "size" },
            children: o ? /* @__PURE__ */ d(
              "div",
              {
                className: "ll:absolute ll:right-0 ll:left-0 ll:mx-auto",
                style: {
                  aspectRatio: String(Ar),
                  // Desktop: the whole stack fits, bottoms on the hero's edge.
                  // Phone banner: full width from the top, bottoms clipped.
                  ...n ? { top: 0, width: "100cqw" } : {
                    bottom: 0,
                    width: `min(100cqw, ${Ar * 100}cqh)`
                  }
                },
                children: [
                  "polymer",
                  "xpdite",
                  "centra"
                ].map(
                  (a, f) => (
                    // Nothing while the window loads
                    s[a] ? /* @__PURE__ */ d(
                      "img",
                      {
                        src: s[a],
                        alt: `${ke(a).name} dashboard`,
                        className: "ll:absolute ll:bottom-0 ll:block",
                        style: {
                          left: Js[a],
                          width: Gs,
                          // Back window first, front window last
                          animation: `${Gt} 500ms ${Pe} ${200 + f * 60}ms both`
                        }
                      },
                      a
                    ) : null
                  )
                )
              }
            ) : ["polymer", "xpdite", "centra"].map((a, f) => {
              const u = ke(a);
              return s[a] === null ? null : /* @__PURE__ */ d(
                xr,
                {
                  compact: !0,
                  title: u.name,
                  barColor: u.frameColor,
                  screenshot: s[a] ?? void 0,
                  className: "ll:absolute",
                  style: {
                    ...Ys[a],
                    // Run past the bottom edge, where the hero clips them
                    bottom: "-24px",
                    // Back window first, front window last
                    animation: `${Gt} 500ms ${Pe} ${200 + f * 60}ms both`
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
}, Zs = ({ title: e, steps: t }) => /* @__PURE__ */ y(
  "section",
  {
    "aria-labelledby": "lumora-first-time-title",
    className: N(
      "ll:rounded-[12px] ll:border ll:border-line ll:bg-surface ll:px-5 ll:py-4 ll:short:py-2.5",
      "ll:[&_*]:transition-[background-color,border-color,color,box-shadow] ll:[&_*]:duration-[350ms] ll:[&_*]:ease-[cubic-bezier(0.4,0,0.2,1)]",
      X
    ),
    children: [
      /* @__PURE__ */ d(
        "h2",
        {
          id: "lumora-first-time-title",
          className: "ll:font-body ll:text-[18px] ll:font-semibold ll:text-heading",
          children: e
        }
      ),
      /* @__PURE__ */ d("ol", { className: "ll:mt-2.5 ll:grid ll:list-none ll:gap-2 ll:short:mt-2 ll:short:gap-1.5", children: t.map((r, n) => /* @__PURE__ */ y(
        "li",
        {
          className: "ll:flex ll:items-center ll:gap-3 ll:text-[14.5px] ll:text-label",
          children: [
            /* @__PURE__ */ d(
              "span",
              {
                "aria-hidden": !0,
                className: "ll:grid ll:size-6 ll:shrink-0 ll:place-items-center ll:rounded-full ll:border ll:border-divider ll:text-[12px] ll:font-semibold ll:text-brand-text",
                children: n + 1
              }
            ),
            r
          ]
        },
        r
      )) })
    ]
  }
), Cr = ({ brandConfig: e }) => /* @__PURE__ */ y(
  "footer",
  {
    className: N(
      "ll:grid ll:gap-2 ll:text-[13px] ll:leading-normal ll:text-label ll:short:gap-1",
      // Centred on phones, where the panel is the whole page; left-aligned beside the hero
      "ll:justify-items-center ll:text-center ll:md:justify-items-start ll:md:text-left",
      X
    ),
    children: [
      e.securityNote && /* @__PURE__ */ y("div", { className: "ll:flex ll:items-center ll:justify-center ll:gap-1.5 ll:md:justify-start", children: [
        /* @__PURE__ */ d(Un, { "aria-hidden": !0, className: "ll:size-3.5 ll:shrink-0" }),
        e.securityNote
      ] }),
      e.supportLabel && /* @__PURE__ */ y("div", { children: [
        "Need access?",
        " ",
        e.supportUrl ? /* @__PURE__ */ d(
          "a",
          {
            href: e.supportUrl,
            className: "ll:text-brand-text ll:underline ll:decoration-current",
            children: e.supportLabel
          }
        ) : /* @__PURE__ */ d("span", { className: "ll:text-brand-text", children: e.supportLabel })
      ] }),
      (e.copyright || e.copyrightHolder) && /* @__PURE__ */ y("div", { children: [
        e.copyright,
        e.copyright && e.copyrightHolder && " ",
        e.copyrightHolder && e.copyrightUrl ? (
          // Only the holder is linked; opens in a new tab so the sign-in page stays open
          /* @__PURE__ */ d(
            "a",
            {
              href: e.copyrightUrl,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "ll:text-inherit ll:no-underline ll:hover:underline",
              children: e.copyrightHolder
            }
          )
        ) : e.copyrightHolder
      ] })
    ]
  }
), Ui = ({
  authConfig: e,
  onLoginSuccess: t,
  onLoginError: r,
  enableRecaptcha: n = !1,
  recaptchaSiteKey: l,
  enableGoogleSignIn: o = !0,
  enableMicrosoftSignIn: s = !1,
  enableMagicLinkSignIn: i = !1,
  enablePasskeySignIn: a = !1,
  showErrors: f = !0,
  defaultPlatform: u,
  showOverview: h = !1,
  showPlatformSelector: g = !1,
  onPlatformChange: E,
  platformAssets: x,
  defaultColorMode: O,
  onColorModeChange: T,
  branding: p,
  animateEntrance: w = !0,
  className: R
}) => {
  const S = ve(!0);
  Y(() => {
    S.current = !1;
  }, []);
  const L = !w && S.current, [k, _] = q("idle"), [G, H] = q(null), [ne, le] = q(!1), me = () => g ? h ? null : u ?? pt.get() ?? Ee : Ee, [ae, J] = q(
    me
  ), [Ne, xt] = q(h);
  Ne !== h && (xt(h), J(me()));
  const ce = ae ?? Ee;
  Y(() => {
    pt.set(ce);
  }, [ce]);
  const { colorMode: Te, toggleColorMode: tt } = sl(
    O,
    T
  ), z = Ur(p), V = Fr(z, Te, ae), D = () => `${window.location.origin}/callback`;
  if (Y(() => {
    const b = (A) => {
      A.persisted && _(
        (v) => v === "google-loading" || v === "microsoft-loading" ? "idle" : v
      );
    };
    return window.addEventListener("pageshow", b), () => window.removeEventListener("pageshow", b);
  }, []), Y(() => {
    le(Je());
  }, []), Y(() => {
    try {
      oe(e.apiBaseUrl, e.apiKey);
    } catch (b) {
      console.error("Failed to initialize API client:", b);
    }
  }, [e.apiBaseUrl, e.apiKey]), !o && !s && !i && !a)
    throw new Error(
      "At least one sign-in method must be enabled (enableGoogleSignIn, enableMicrosoftSignIn, enableMagicLinkSignIn or enablePasskeySignIn)"
    );
  if (n && !l)
    throw new Error(
      "recaptchaSiteKey is required when enableRecaptcha is true"
    );
  const de = () => window.grecaptcha.execute(l, { action: "login" }).catch(() => {
    throw new Error("reCAPTCHA verification failed");
  }), he = async () => {
    if (!n || !l)
      return "";
    if (typeof window > "u" || !window.grecaptcha)
      throw new Error("reCAPTCHA is not loaded");
    return new Promise((b, A) => {
      const v = () => {
        de().then(b).catch(A);
      };
      window.grecaptcha.ready(v);
    });
  }, ge = async (b, A) => {
    ie.setTokens(b.accessToken, b.refreshToken);
    const v = A ?? await fe.getCurrentUser();
    _("success"), t({ user: v, tokens: b, platform: ce });
  }, rt = (b) => {
    J(b), b && E?.(b);
  }, C = (b) => {
    try {
      _(`${b}-loading`), H(null);
      const A = b === "google" ? U.ENDPOINTS.GOOGLE_AUTH : U.ENDPOINTS.MICROSOFT_AUTH;
      setTimeout(() => {
        fe.initiateOAuth(
          A,
          D(),
          e.apiBaseUrl
        );
      }, 300);
    } catch (A) {
      const v = A;
      H({ message: v.message, type: b }), _("error"), r(v);
    }
  }, K = async () => {
    _("passkey-loading"), H(null);
    try {
      const { tokens: b, user: A } = await fe.loginWithPasskey();
      await ge(b, A);
    } catch (b) {
      const A = b;
      H({ message: A.message, type: "passkey" }), _("error"), r(A);
    }
  }, Ae = async (b) => {
    _("magic-link-loading"), H(null);
    try {
      n && await he(), await fe.requestMagicLink(b.email, D()), _("magic-link-success");
    } catch (A) {
      const v = A;
      H({ message: v.message, type: "magic-link" }), _("error"), r(v);
    }
  }, Ue = () => {
    H(null), _("idle");
  };
  Y(() => {
    if (n && l && typeof window < "u") {
      const b = document.createElement("script");
      b.src = `https://www.google.com/recaptcha/enterprise.js?render=${l}`, b.async = !0, b.defer = !0, document.head.appendChild(b);
    }
  }, [n, l]);
  const nt = a && ne, B = al(k), Q = o || s, re = i || nt, Fe = /* @__PURE__ */ d(
    _r,
    {
      theme: V,
      platform: ae,
      platformAssets: x
    }
  ), _e = /* @__PURE__ */ d(
    _r,
    {
      theme: V,
      platform: ae,
      platformAssets: x,
      compact: !0
    }
  ), ee = {
    mode: Te,
    style: Br(V),
    className: R
  };
  return k === "magic-link-success" ? /* @__PURE__ */ y(
    It,
    {
      ...ee,
      hero: Fe,
      mobileHero: _e,
      skipEntrance: L,
      footer: /* @__PURE__ */ d(Cr, { brandConfig: z }),
      children: [
        /* @__PURE__ */ d(
          br,
          {
            brandConfig: z,
            theme: V,
            showWelcome: !1,
            onToggleColorMode: tt
          }
        ),
        /* @__PURE__ */ d("div", { className: "ll:pt-12", children: /* @__PURE__ */ d(
          Bs,
          {
            title: z.magicLinkSuccessTitle || "Check your inbox",
            description: z.magicLinkSuccessDescription || "If this email address belongs to an active account, we have sent it a sign-in link.",
            onBackToLogin: Ue
          }
        ) })
      ]
    }
  ) : /* @__PURE__ */ y(
    It,
    {
      ...ee,
      hero: Fe,
      mobileHero: _e,
      skipEntrance: L,
      footer: /* @__PURE__ */ d(Cr, { brandConfig: z }),
      children: [
        /* @__PURE__ */ d(
          br,
          {
            brandConfig: z,
            theme: V,
            onToggleColorMode: tt
          }
        ),
        g && /* @__PURE__ */ d(
          $s,
          {
            theme: V,
            value: ae,
            platformAssets: x,
            disabled: B,
            allowClear: h,
            onChange: rt
          }
        ),
        f && G && /* @__PURE__ */ d(Os, { onClose: () => H(null), children: G.message }),
        Q && /* @__PURE__ */ y(
          "div",
          {
            className: N(
              "ll:grid ll:gap-3",
              o && s ? "ll:grid-cols-2" : "ll:grid-cols-1"
            ),
            children: [
              o && /* @__PURE__ */ d(
                yr,
                {
                  icon: /* @__PURE__ */ d(Ts, {}),
                  label: "Google",
                  ariaLabel: "Continue with Google",
                  isLoading: k === "google-loading",
                  disabled: B,
                  onClick: () => C("google")
                }
              ),
              s && /* @__PURE__ */ d(
                yr,
                {
                  icon: /* @__PURE__ */ d(vs, { monochrome: !0 }),
                  label: "Microsoft",
                  ariaLabel: "Continue with Microsoft",
                  isLoading: k === "microsoft-loading",
                  disabled: B,
                  onClick: () => C("microsoft")
                }
              )
            ]
          }
        ),
        Q && re && /* @__PURE__ */ d(
          "div",
          {
            role: "separator",
            className: N(
              "ll:flex ll:items-center ll:gap-4 ll:font-body ll:text-[16px] ll:whitespace-nowrap ll:text-label",
              "ll:before:h-px ll:before:flex-1 ll:before:bg-divider ll:before:content-[''] ll:after:h-px ll:after:flex-1 ll:after:bg-divider ll:after:content-['']",
              X
            ),
            children: "or use your work email"
          }
        ),
        i && /* @__PURE__ */ d(
          Fs,
          {
            isSubmitting: k === "magic-link-loading",
            disabled: B,
            onSubmit: Ae
          }
        ),
        nt && /* @__PURE__ */ y(
          Le,
          {
            variant: "outline-accent",
            onClick: K,
            disabled: B,
            children: [
              k === "passkey-loading" && /* @__PURE__ */ d(qt, { label: null }),
              k === "passkey-loading" ? "Waiting for passkey..." : "Sign in with passkey"
            ]
          }
        ),
        f && k === "error" && /* @__PURE__ */ d(
          Le,
          {
            variant: "ghost",
            size: "auto",
            onClick: Ue,
            className: "ll:-mt-3 ll:self-center",
            children: "Try Again"
          }
        ),
        z.firstTimeSteps && z.firstTimeSteps.length > 0 && /* @__PURE__ */ d(
          Zs,
          {
            title: z.firstTimeTitle || "First time here?",
            steps: z.firstTimeSteps
          }
        )
      ]
    }
  );
}, Xs = ["light", "dark"], Qs = {
  light: "rgba(18, 51, 45, 0.09)",
  dark: "rgba(255, 255, 255, 0.08)"
}, ze = "rgba(255, 255, 255, 0.18)", ei = () => () => {
}, ti = () => _n(
  ei,
  () => !1,
  () => !0
), ri = typeof window > "u" ? Y : Pr, ni = (e, t) => ({
  mode: at.get() ?? e ?? Mr(),
  platform: t ?? pt.get() ?? Ee
}), li = (e, t) => `(function(s){try{var e=s.parentElement,m=null,p=${JSON.stringify(t ?? null)};try{m=localStorage.getItem(${JSON.stringify(it)});if(!p)p=localStorage.getItem(${JSON.stringify(st)})}catch(x){}if(m!=='light'&&m!=='dark')m=${JSON.stringify(e ?? null)}||(window.matchMedia&&matchMedia(${JSON.stringify(Ut)}).matches?'dark':'light');if(${JSON.stringify(Z.map((r) => r.id))}.indexOf(p)<0)p=${JSON.stringify(Ee)};e.setAttribute('data-mode',m);e.setAttribute('data-platform',p)}catch(x){}})(document.currentScript)`, oi = (e, t, r) => ({
  ...Br(Fr(e, t, r)),
  "--lumora-bone": Qs[t],
  "--lumora-hero": ke(r).color
}), si = (e, t, r, n) => {
  const l = `[data-lumora-skeleton=${JSON.stringify(t)}]`, o = (s, i) => `{${Object.entries(oi(e, s, i)).map(([a, f]) => `${a}:${f}`).join(";")}}`;
  return [
    `${l}${o(r, n)}`,
    ...Z.flatMap(
      ({ id: s }) => Xs.map(
        (i) => `${l}[data-mode="${i}"][data-platform="${s}"]${o(i, s)}`
      )
    )
  ].join("");
}, P = ({
  width: e,
  height: t,
  radius: r = 6,
  color: n = "var(--lumora-bone)",
  className: l
}) => /* @__PURE__ */ d(
  "div",
  {
    className: N("lumora-bone ll:shrink-0", l),
    style: { width: e, height: t, borderRadius: r, backgroundColor: n }
  }
), Ke = ({ className: e }) => /* @__PURE__ */ d(P, { radius: "10px", className: N(Ye, e) }), Fi = ({
  defaultColorMode: e,
  defaultPlatform: t,
  showPlatformSelector: r = !1,
  branding: n,
  className: l
}) => {
  const o = r ? t : Ee, s = Ur(n), i = ve(null), a = kr(), f = ti();
  ri(() => {
    const { mode: h, platform: g } = ni(
      e,
      o
    );
    i.current?.setAttribute("data-mode", h), i.current?.setAttribute("data-platform", g);
  }, [e, o]);
  const u = /* @__PURE__ */ y(
    "div",
    {
      className: "lumora-grid ll:relative ll:flex ll:h-full ll:flex-col ll:overflow-hidden ll:rounded-[24px] ll:bg-hero ll:*:relative",
      style: {
        "--lumora-grid-color": "rgba(255, 255, 255, 0.06)"
      },
      children: [
        /* @__PURE__ */ y("div", { className: "ll:md:px-10 ll:md:pt-14 ll:lg:px-12 ll:lg:pt-18", children: [
          /* @__PURE__ */ d(P, { width: 260, height: 12, color: ze }),
          /* @__PURE__ */ d(
            P,
            {
              width: "72%",
              height: 56,
              radius: 10,
              color: ze,
              className: "ll:mt-6"
            }
          ),
          /* @__PURE__ */ d(
            P,
            {
              width: "48%",
              height: 56,
              radius: 10,
              color: ze,
              className: "ll:mt-3"
            }
          ),
          /* @__PURE__ */ d(
            P,
            {
              width: "58%",
              height: 16,
              color: ze,
              className: "ll:mt-6"
            }
          )
        ] }),
        /* @__PURE__ */ d(
          P,
          {
            radius: "14px",
            color: ze,
            className: "ll:-mr-[14px] ll:-mb-[14px] ll:min-h-[240px] ll:flex-1 ll:md:mt-10 ll:md:ml-10 ll:lg:mt-12 ll:lg:ml-12"
          }
        )
      ]
    }
  );
  return /* @__PURE__ */ y(
    "div",
    {
      ref: i,
      role: "status",
      "aria-busy": "true",
      "aria-label": "Loading sign-in",
      "data-testid": "lumora-login-skeleton",
      "data-lumora-skeleton": a,
      suppressHydrationWarning: !0,
      className: l,
      children: [
        /* @__PURE__ */ d(
          "style",
          {
            dangerouslySetInnerHTML: {
              __html: si(
                s,
                a,
                e ?? "light",
                o ?? Ee
              )
            }
          }
        ),
        f && /* @__PURE__ */ d(
          "script",
          {
            dangerouslySetInnerHTML: {
              __html: li(
                e,
                o
              )
            }
          }
        ),
        /* @__PURE__ */ y(
          It,
          {
            hero: u,
            mobileHero: /* @__PURE__ */ d(
              P,
              {
                height: 200,
                radius: "16px",
                color: "var(--lumora-hero)"
              }
            ),
            footer: /* @__PURE__ */ y("div", { className: "ll:flex ll:flex-col ll:gap-2", children: [
              /* @__PURE__ */ d(P, { width: "70%", height: 10 }),
              /* @__PURE__ */ d(P, { width: "55%", height: 10 }),
              /* @__PURE__ */ d(P, { width: "45%", height: 10 })
            ] }),
            children: [
              /* @__PURE__ */ y("div", { children: [
                /* @__PURE__ */ y("div", { className: "ll:flex ll:items-center ll:justify-between", children: [
                  /* @__PURE__ */ d(P, { width: 120, height: 32 }),
                  /* @__PURE__ */ d(P, { width: 30, height: 30, radius: "50%" })
                ] }),
                /* @__PURE__ */ d(
                  P,
                  {
                    width: "78%",
                    height: 42,
                    radius: 8,
                    className: "ll:mt-9 ll:short:mt-6"
                  }
                ),
                /* @__PURE__ */ d(
                  P,
                  {
                    width: "46%",
                    height: 42,
                    radius: 8,
                    className: "ll:mt-2"
                  }
                ),
                /* @__PURE__ */ d(
                  P,
                  {
                    width: "88%",
                    height: 16,
                    className: "ll:mt-4 ll:short:mt-3"
                  }
                ),
                /* @__PURE__ */ d(P, { width: "30%", height: 16, className: "ll:mt-2" })
              ] }),
              r && /* @__PURE__ */ y("div", { children: [
                /* @__PURE__ */ d(P, { width: "58%", height: 12, className: "ll:mb-3" }),
                /* @__PURE__ */ d("div", { className: "ll:flex ll:gap-1 ll:rounded-[12px] ll:border ll:border-line ll:bg-surface ll:p-2", children: [0, 1, 2].map((h) => /* @__PURE__ */ d(
                  P,
                  {
                    radius: "8px",
                    className: N("ll:flex-1", Ye)
                  },
                  h
                )) })
              ] }),
              /* @__PURE__ */ y("div", { className: "ll:grid ll:grid-cols-2 ll:gap-4", children: [
                /* @__PURE__ */ d(Ke, {}),
                /* @__PURE__ */ d(Ke, {})
              ] }),
              /* @__PURE__ */ y("div", { className: "ll:flex ll:items-center ll:gap-4", children: [
                /* @__PURE__ */ d("div", { className: "ll:h-px ll:flex-1 ll:bg-divider" }),
                /* @__PURE__ */ d(P, { width: 150, height: 12 }),
                /* @__PURE__ */ d("div", { className: "ll:h-px ll:flex-1 ll:bg-divider" })
              ] }),
              /* @__PURE__ */ y("div", { children: [
                /* @__PURE__ */ d(P, { width: "30%", height: 12, className: "ll:mb-3" }),
                /* @__PURE__ */ y("div", { className: "ll:flex ll:gap-3", children: [
                  /* @__PURE__ */ d(Ke, { className: "ll:min-w-0 ll:flex-1" }),
                  /* @__PURE__ */ d(Ke, { className: "ll:w-[110px]" })
                ] }),
                /* @__PURE__ */ d(Ke, { className: "ll:mt-4" })
              ] }),
              /* @__PURE__ */ y("div", { className: "ll:flex ll:flex-col ll:gap-2.5 ll:rounded-[12px] ll:border ll:border-line ll:bg-surface ll:p-5 ll:short:py-2.5", children: [
                /* @__PURE__ */ d(P, { width: "40%", height: 16 }),
                /* @__PURE__ */ d(P, { width: "80%", height: 12 }),
                /* @__PURE__ */ d(P, { width: "72%", height: 12 }),
                /* @__PURE__ */ d(P, { width: "86%", height: 12 })
              ] })
            ]
          }
        )
      ]
    }
  );
}, Bi = (e) => {
  const [t, r] = q(!0), [n, l] = q(null), o = ve(!1);
  return Y(() => {
    if (o.current)
      return;
    o.current = !0, (async () => {
      try {
        e?.apiBaseUrl && oe(e.apiBaseUrl, e.apiKey);
        const i = new URLSearchParams(window.location.search);
        let a = i.get("access_token") || i.get("accessToken"), f = i.get("refresh_token") || i.get("refreshToken");
        const u = i.get("magic_token"), h = i.get("user"), g = i.get("error"), E = i.get("message");
        if (g) {
          const T = decodeURIComponent(E || g);
          throw new Error(T);
        }
        if (u) {
          const T = await fe.verifyMagicLink(u);
          a = T.accessToken, f = T.refreshToken;
        }
        if (!a || !f)
          throw new Error("Missing authentication tokens in callback URL");
        ie.setTokens(a, f);
        let x;
        if (h)
          try {
            const T = decodeURIComponent(h);
            x = JSON.parse(T);
          } catch (T) {
            console.warn("Failed to parse user from URL, fetching from API:", T), x = await fe.getCurrentUser();
          }
        else
          x = await fe.getCurrentUser();
        e?.onSuccess?.({ accessToken: a, refreshToken: f }, x, pt.get());
        const O = e?.redirectPath || "/dashboard";
        window.history.replaceState({}, document.title, O), r(!1);
      } catch (i) {
        const a = i;
        l(a), e?.onError?.(a), r(!1);
      }
    })();
  }, [e?.redirectPath]), { loading: t, error: n };
}, Mi = (e) => ({ logout: Cn(async () => {
  const r = ie.getRefreshToken();
  if (e?.apiBaseUrl && r)
    try {
      await fe.logout(r);
    } catch (n) {
      console.error("Logout API call failed:", n);
    }
  ie.clearTokens(), window.location.href = "/login";
}, [e?.apiBaseUrl]) }), Hi = (e) => {
  const [t, r] = q(!1), [n, l] = q(null), [o, s] = q(!1);
  return Y(() => {
    s(Je());
  }, []), { registerPasskey: async (a) => {
    r(!0), l(null);
    try {
      return e?.apiBaseUrl && oe(e.apiBaseUrl, e.apiKey), await fe.registerPasskey(a);
    } catch (f) {
      return l(f), null;
    } finally {
      r(!1);
    }
  }, loading: t, error: n, isSupported: o };
};
export {
  at as ColorModeStorage,
  Ui as LumoraLogin,
  Fi as LumoraLoginSkeleton,
  Z as PLATFORMS,
  pt as PlatformStorage,
  ie as TokenStorage,
  Ur as getBrandingConfig,
  Zn as getDefaultBranding,
  Bi as useAuthCallback,
  Mi as useLogout,
  Hi as usePasskeyRegistration
};
