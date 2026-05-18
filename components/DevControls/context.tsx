import React, { createContext, useContext, useEffect, useCallback, useSyncExternalStore } from "react";
import { createMachine, assign } from "xstate";
import { createActor } from "xstate";
import { useSelector } from "@xstate/react";
import type { Actor } from "xstate";
import {
  DERIVED_KEYS,
  CUSTOM_DERIVED_KEYS,
  computeDerivedValue,
  computeCustomDerived,
  getNamedGoldenSteps,
  GOLDEN_SCALE,
} from "../../constants/spacing";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DevOverrides {
  baseSpacing: number;
  // Top bar (separate X/Y)
  topBarPaddingX: number;
  topBarPaddingY: number;
  topBarPaddingDesktopX: number;
  topBarPaddingDesktopY: number;
  topFadeHeight: number;
  topFadeWidth: number;
  // Content area
  contentTopPadding: number;
  contentTopPaddingMd: number;
  contentTopPaddingLg: number;
  contentBottomPadding: number;
  contentPaddingX: number;
  contentMaxWidth: number;
  // Typography
  fontSizeClampMin: number;
  fontSizeClampMax: number;
  fontSizeClampVw: number;
  fontSizeClampBase: number;
  fontSizeOffset: number;
  lineHeight: number;
  letterSpacing: number;
  paragraphSpacing: number;
  // Sidebar
  sidebarWidth: number;
  sidebarPaddingX: number;
  sidebarPaddingY: number;
  bookmarkYClampMin: number;
  bookmarkYClampVh: number;
  bookmarkYClampMax: number;
  // Desktop syntax panel
  desktopPanelWidthVw: number;
  desktopPanelWidthMin: number;
  desktopPanelPaddingX: number;
  desktopPanelPaddingY: number;
  desktopPanelRight: number;
  // Harmonica stages
  hClosedW: number;
  hClosedH: number;
  hPeekW: number;
  hPeekH: number;
  hExpandW: number;
  hExpandH: number;
  hFullW: number;
  hFullH: number;
  hSpringDuration: number;
  // Toolbar
  toolbarPaddingX: number;
  toolbarPaddingY: number;
  toolbarButtonGap: number;
  toolbarIconSize: number;
  toolbarLabelFontSize: number;
  toolbarFadeWidth: number;
  toolbarDimOpacity: number;
  // Theme selector
  themeSelectorGap: number;
  themeSelectorPaddingX: number;
  themeSelectorPaddingY: number;
  themeDotSize: number;
  topBarButtonGap: number;
  // Breakpoints
  breakpoint1: number;
  breakpoint2: number;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

export const DEFAULT_OVERRIDES: DevOverrides = {
  baseSpacing: 8,
  topBarPaddingX: 13,
  topBarPaddingY: 8,
  topBarPaddingDesktopX: 21,
  topBarPaddingDesktopY: 13,
  topFadeHeight: 144,
  topFadeWidth: 280,
  contentTopPadding: 70,
  contentTopPaddingMd: 80,
  contentTopPaddingLg: 80,
  contentBottomPadding: 55,
  contentPaddingX: 13,
  contentMaxWidth: 800,
  fontSizeClampMin: 18,
  fontSizeClampMax: 24,
  fontSizeClampVw: 1.1,
  fontSizeClampBase: 10,
  fontSizeOffset: 0,
  lineHeight: 1.6,
  letterSpacing: 0,
  paragraphSpacing: 0.5,
  sidebarWidth: 280,
  sidebarPaddingX: 20,
  sidebarPaddingY: 16,
  bookmarkYClampMin: 160,
  bookmarkYClampVh: 24,
  bookmarkYClampMax: 220,
  desktopPanelWidthVw: 40,
  desktopPanelWidthMin: 500,
  desktopPanelPaddingX: 16,
  desktopPanelPaddingY: 16,
  desktopPanelRight: 0,
  hClosedW: 56,
  hClosedH: 80,
  hPeekW: 140,
  hPeekH: 80,
  hExpandW: 140,
  hExpandH: 180,
  hFullW: 320,
  hFullH: 480,
  hSpringDuration: 350,
  toolbarPaddingX: 13,
  toolbarPaddingY: 8,
  toolbarButtonGap: 6,
  toolbarIconSize: 24,
  toolbarLabelFontSize: 12,
  toolbarFadeWidth: 40,
  toolbarDimOpacity: 0.5,
  themeSelectorGap: 12,
  themeSelectorPaddingX: 20,
  themeSelectorPaddingY: 12,
  themeDotSize: 36,
  topBarButtonGap: 6,
  breakpoint1: 768,
  breakpoint2: 1024,
};

// ─── Serialization ───────────────────────────────────────────────────────────

const STORAGE_KEY = "clean_writer_dev_overrides";

export function loadDevOverrides(): DevOverrides | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_OVERRIDES, ...parsed };
  } catch {
    return null;
  }
}

export function saveDevOverrides(o: DevOverrides): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(o));
  } catch { /* noop */ }
}

// ─── Machine ─────────────────────────────────────────────────────────────────

interface DevMachineContext {
  devEnabled: boolean;
  baseSpacing: number;
  overrides: DevOverrides;
  overriddenKeys: Set<string>;
}

type DevMachineEvent =
  | { type: "SET_BASE"; value: number }
  | { type: "SET_OVERRIDE"; key: keyof DevOverrides; value: number }
  | { type: "RESET_KEY"; key: keyof DevOverrides }
  | { type: "RESET_ALL" }
  | { type: "TOGGLE" }
  | { type: "IMPORT"; overrides: DevOverrides }
  | { type: "LOAD"; overrides: DevOverrides; overriddenKeys?: string[] };

function isDerivableKey(key: string): boolean {
  return DERIVED_KEYS.has(key) || CUSTOM_DERIVED_KEYS.has(key);
}

function rebaseOverrides(base: number, prev: DevOverrides, overridden: Set<string>): DevOverrides {
  const next = { ...prev, baseSpacing: base };
  for (const key of DERIVED_KEYS) {
    if (!overridden.has(key)) {
      (next as unknown as Record<string, number>)[key] = computeDerivedValue(key, base);
    }
  }
  for (const key of CUSTOM_DERIVED_KEYS) {
    if (!overridden.has(key)) {
      (next as unknown as Record<string, number>)[key] = computeCustomDerived(key, base);
    }
  }
  return next;
}

const devMachine = createMachine({
  types: {} as {
    context: DevMachineContext;
    events: DevMachineEvent;
    input: { initial: DevOverrides };
  },
  id: "devControls",
  context: ({ input }) => ({
    devEnabled: false,
    baseSpacing: input.initial.baseSpacing,
    overrides: { ...input.initial },
    overriddenKeys: new Set<string>(),
  }),
  on: {
    TOGGLE: {
      actions: assign({
        devEnabled: ({ context }) => !context.devEnabled,
      }),
    },
    SET_BASE: {
      actions: assign({
        overrides: ({ context, event }) =>
          rebaseOverrides(event.value, context.overrides, context.overriddenKeys),
        baseSpacing: ({ event }) => event.value,
      }),
    },
    SET_OVERRIDE: {
      actions: assign({
        overrides: ({ context, event }) => {
          const next = { ...context.overrides };
          (next as unknown as Record<string, number>)[event.key] = event.value;
          return next;
        },
        overriddenKeys: ({ context, event }) => {
          if (!isDerivableKey(event.key)) return context.overriddenKeys;
          const next = new Set(context.overriddenKeys);
          next.add(event.key);
          return next;
        },
      }),
    },
    RESET_KEY: {
      actions: assign({
        overrides: ({ context, event }) => {
          const key = event.key;
          const next = { ...context.overrides };
          if (isDerivableKey(key)) {
            (next as unknown as Record<string, number>)[key] =
              DERIVED_KEYS.has(key)
                ? computeDerivedValue(key, context.baseSpacing)
                : computeCustomDerived(key, context.baseSpacing);
          } else {
            (next as unknown as Record<string, number>)[key] =
              (DEFAULT_OVERRIDES as unknown as Record<string, number>)[key];
          }
          return next;
        },
        overriddenKeys: ({ context, event }) => {
          if (!isDerivableKey(event.key)) return context.overriddenKeys;
          const next = new Set(context.overriddenKeys);
          next.delete(event.key);
          return next;
        },
      }),
    },
    RESET_ALL: {
      actions: assign({
        baseSpacing: DEFAULT_OVERRIDES.baseSpacing,
        overrides: { ...DEFAULT_OVERRIDES },
        overriddenKeys: () => new Set<string>(),
      }),
    },
    IMPORT: {
      actions: assign({
        overrides: ({ event }) => ({ ...DEFAULT_OVERRIDES, ...event.overrides }),
        baseSpacing: ({ context, event }) =>
          event.overrides.baseSpacing ?? context.baseSpacing,
        overriddenKeys: ({ event }) => {
          const keys = new Set<string>();
          for (const k of Object.keys(event.overrides)) {
            if (isDerivableKey(k)) keys.add(k);
          }
          return keys;
        },
      }),
    },
    LOAD: {
      actions: assign({
        overrides: ({ event }) => ({ ...DEFAULT_OVERRIDES, ...event.overrides }),
        baseSpacing: ({ event }) =>
          event.overrides.baseSpacing ?? DEFAULT_OVERRIDES.baseSpacing,
        overriddenKeys: ({ event }) =>
          new Set(event.overriddenKeys ?? []),
      }),
    },
  },
});

// ─── Actor (module-level — persisted across renders, survives hot reload) ────

type DevActor = Actor<typeof devMachine>;

let _devActor: DevActor | null = null;

export function getDevActor(): DevActor {
  if (!_devActor) {
    const saved = loadDevOverrides();
    _devActor = createActor(devMachine, {
      input: { initial: saved ?? { ...DEFAULT_OVERRIDES } },
    });
    _devActor.start();
    if (saved) {
      _devActor.send({ type: "LOAD", overrides: saved });
    }
    // Auto-persist on every state change
    _devActor.subscribe((snap) => {
      saveDevOverrides(snap.context.overrides);
    });
  }
  return _devActor;
}

// ─── Derived builders ────────────────────────────────────────────────────────

export function buildFluidFontSize(o: DevOverrides): string {
  const base = o.fontSizeClampMin;
  const vw = o.fontSizeClampVw;
  const vwBase = o.fontSizeClampBase;
  const max = o.fontSizeClampMax;
  const offset = o.fontSizeOffset;
  const clamp = `clamp(${base}px, ${vwBase}px + ${vw}vw, ${max}px)`;
  if (offset === 0) return clamp;
  return `calc(${clamp} + ${offset}px)`;
}

export function buildBookmarkY(o: DevOverrides): string {
  return `clamp(${o.bookmarkYClampMin}px, ${o.bookmarkYClampVh}vh, ${o.bookmarkYClampMax}px)`;
}

export function buildDesktopPanelWidth(o: DevOverrides): string {
  return `min(${o.desktopPanelWidthMin}px, ${o.desktopPanelWidthVw}vw)`;
}

// ─── CSS Variable sync ───────────────────────────────────────────────────────

const CSS_VAR_MAP: [keyof DevOverrides, string, string][] = [
  ["baseSpacing", "--dev-base-spacing", "px"],
  ["topBarPaddingX", "--dev-topbar-pad-x", "px"],
  ["topBarPaddingY", "--dev-topbar-pad-y", "px"],
  ["topBarPaddingDesktopX", "--dev-topbar-pad-d-x", "px"],
  ["topBarPaddingDesktopY", "--dev-topbar-pad-d-y", "px"],
  ["topFadeHeight", "--dev-topfade-height", "px"],
  ["topFadeWidth", "--dev-topfade-width", "px"],
  ["contentTopPadding", "--dev-content-top", "px"],
  ["contentTopPaddingMd", "--dev-content-top-md", "px"],
  ["contentTopPaddingLg", "--dev-content-top-lg", "px"],
  ["contentBottomPadding", "--dev-content-bottom", "px"],
  ["contentPaddingX", "--dev-content-pad-x", "px"],
  ["contentMaxWidth", "--dev-content-maxw", "px"],
  ["fontSizeClampMin", "--dev-fs-min", "px"],
  ["fontSizeClampMax", "--dev-fs-max", "px"],
  ["fontSizeClampVw", "--dev-fs-vw", "vw"],
  ["fontSizeClampBase", "--dev-fs-base", "px"],
  ["fontSizeOffset", "--dev-fs-offset", "px"],
  ["lineHeight", "--dev-line-height", ""],
  ["letterSpacing", "--dev-letter-spacing", "em"],
  ["paragraphSpacing", "--dev-para-spacing", "em"],
  ["sidebarWidth", "--dev-sidebar-width", "px"],
  ["sidebarPaddingX", "--dev-sidebar-pad-x", "px"],
  ["sidebarPaddingY", "--dev-sidebar-pad-y", "px"],
  ["bookmarkYClampMin", "--dev-bookmark-y-min", "px"],
  ["bookmarkYClampVh", "--dev-bookmark-y-vh", "vh"],
  ["bookmarkYClampMax", "--dev-bookmark-y-max", "px"],
  ["desktopPanelWidthVw", "--dev-panel-vw", "vw"],
  ["desktopPanelWidthMin", "--dev-panel-min", "px"],
  ["desktopPanelPaddingX", "--dev-panel-pad-x", "px"],
  ["desktopPanelPaddingY", "--dev-panel-pad-y", "px"],
  ["desktopPanelRight", "--dev-panel-right", "px"],
  ["hClosedW", "--dev-h-closed-w", "px"],
  ["hClosedH", "--dev-h-closed-h", "px"],
  ["hPeekW", "--dev-h-peek-w", "px"],
  ["hPeekH", "--dev-h-peek-h", "px"],
  ["hExpandW", "--dev-h-expand-w", "px"],
  ["hExpandH", "--dev-h-expand-h", "px"],
  ["hFullW", "--dev-h-full-w", "px"],
  ["hFullH", "--dev-h-full-h", "px"],
  ["hSpringDuration", "--dev-h-spring", "ms"],
  ["toolbarPaddingX", "--dev-tb-pad-x", "px"],
  ["toolbarPaddingY", "--dev-tb-pad-y", "px"],
  ["toolbarButtonGap", "--dev-tb-gap", "px"],
  ["toolbarIconSize", "--dev-tb-icon", "px"],
  ["toolbarLabelFontSize", "--dev-tb-label-fs", "px"],
  ["toolbarFadeWidth", "--dev-tb-fade-w", "px"],
  ["toolbarDimOpacity", "--dev-tb-dim", ""],
  ["themeSelectorGap", "--dev-ts-gap", "px"],
  ["themeSelectorPaddingX", "--dev-ts-pad-x", "px"],
  ["themeSelectorPaddingY", "--dev-ts-pad-y", "px"],
  ["themeDotSize", "--dev-ts-dot-size", "px"],
  ["topBarButtonGap", "--dev-topbar-btn-gap", "px"],
  ["breakpoint1", "--dev-bp1", "px"],
  ["breakpoint2", "--dev-bp2", "px"],
];

function syncCSSVars(o: DevOverrides): void {
  const root = document.documentElement;
  // Dev override vars
  for (const [key, varName, unit] of CSS_VAR_MAP) {
    root.style.setProperty(varName, String(o[key]) + unit);
  }
  // Derived builder strings
  root.style.setProperty("--dev-fluid-font-size", buildFluidFontSize(o));
  root.style.setProperty("--dev-bookmark-y", buildBookmarkY(o));
  root.style.setProperty("--dev-desktop-panel-width", buildDesktopPanelWidth(o));
  // Golden ratio scale — the base unit actually drives these now
  const { xs, sm, md, lg, xl, xxl, xxxl } = getNamedGoldenSteps(o.baseSpacing);
  root.style.setProperty("--space-xs", `${xs}px`);
  root.style.setProperty("--space-sm", `${sm}px`);
  root.style.setProperty("--space-md", `${md}px`);
  root.style.setProperty("--space-lg", `${lg}px`);
  root.style.setProperty("--space-xl", `${xl}px`);
  root.style.setProperty("--space-xxl", `${xxl}px`);
  root.style.setProperty("--space-xxxl", `${xxxl}px`);
}

function clearCSSVars(): void {
  const root = document.documentElement;
  for (const [, varName] of CSS_VAR_MAP) {
    root.style.removeProperty(varName);
  }
  root.style.removeProperty("--dev-fluid-font-size");
  root.style.removeProperty("--dev-bookmark-y");
  root.style.removeProperty("--dev-desktop-panel-width");
  // Restore static golden scale values (remove inline overrides so :root in index.css takes over)
  root.style.removeProperty("--space-xs");
  root.style.removeProperty("--space-sm");
  root.style.removeProperty("--space-md");
  root.style.removeProperty("--space-lg");
  root.style.removeProperty("--space-xl");
  root.style.removeProperty("--space-xxl");
  root.style.removeProperty("--space-xxxl");
}

// ─── React Context ───────────────────────────────────────────────────────────

interface DevContextValue {
  actorRef: DevActor;
}

const DevContext = createContext<DevContextValue | null>(null);

export const DevControlsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const actorRef = getDevActor();

  // Subscribe to actor snapshot for reactive CSS sync
  const snapshot = useSyncExternalStore(
    useCallback((cb: () => void) => {
      const sub = actorRef.subscribe(cb);
      return () => sub.unsubscribe();
    }, [actorRef]),
    () => actorRef.getSnapshot(),
  );

  useEffect(() => {
    if (snapshot.context.devEnabled) {
      syncCSSVars(snapshot.context.overrides);
    } else {
      clearCSSVars();
    }
    return () => {
      clearCSSVars();
    };
  }, [snapshot]);

  const value = React.useMemo(
    () => ({ actorRef }),
    [actorRef],
  );

  return <DevContext.Provider value={value}>{children}</DevContext.Provider>;
};

// ─── Public Hooks ────────────────────────────────────────────────────────────

/** Returns effective layout values. When dev mode is off, returns defaults. */
export function useDevLayout(): DevOverrides {
  const ctx = useContext(DevContext);
  const actorRef = ctx?.actorRef ?? getDevActor();
  const snap = useSelector(actorRef, (snap) => snap.context);
  if (!snap?.devEnabled) return DEFAULT_OVERRIDES;
  return snap.overrides;
}

/** Setter — fires SET_OVERRIDE events to the machine. */
export function useDevOverridesSetter(): (patch: Partial<DevOverrides>) => void {
  const ctx = useContext(DevContext);
  const ref = ctx?.actorRef ?? getDevActor();
  return useCallback(
    (patch: Partial<DevOverrides>) => {
      for (const [key, value] of Object.entries(patch)) {
        ref.send({ type: "SET_OVERRIDE", key: key as keyof DevOverrides, value: value as number });
      }
    },
    [ref],
  );
}

/** Whether dev controls panel should be shown. */
export function useIsDevMode(): boolean {
  const ctx = useContext(DevContext);
  const actorRef = ctx?.actorRef ?? getDevActor();
  return useSelector(actorRef, (snap) => snap?.context?.devEnabled ?? false);
}

/** Reset all dev overrides to defaults. */
export function useDevReset(): () => void {
  const ctx = useContext(DevContext);
  const ref = ctx?.actorRef ?? getDevActor();
  return useCallback(() => {
    ref.send({ type: "RESET_ALL" });
  }, [ref]);
}

/** Returns the actor ref for advanced usage. */
export function useDevActor(): DevActor | null {
  const ctx = useContext(DevContext);
  return ctx?.actorRef ?? getDevActor();
}

/** Whether a key is currently manually overridden (not derived from base). */
export function useIsKeyOverridden(key: keyof DevOverrides): boolean {
  const ctx = useContext(DevContext);
  const actorRef = ctx?.actorRef ?? getDevActor();
  return useSelector(actorRef, (snap) => snap?.context?.overriddenKeys?.has(key) ?? false);
}
