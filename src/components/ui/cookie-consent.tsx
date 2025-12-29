"use client";

/**
 * ✅ FABRK COMPONENT - PRO PACK
 * Cookie Consent - GDPR/Privacy compliance banner
 *
 * Features:
 * - Terminal-styled bottom banner
 * - Accept All / Reject All / Customize options
 * - Modal for granular consent preferences
 * - Persist choices in localStorage + cookie
 * - Respect Do Not Track (DNT) browser setting
 * - Link to privacy policy
 *
 * Design System Integration:
 * - Terminal aesthetic with mode.radius, mode.font
 * - Design tokens only (no hardcoded colors)
 * - 8-point grid spacing
 * - WCAG 2.1 AA compliant
 *
 * @example
 * ```tsx
 * <CookieConsent
 *   onAccept={(preferences) => saveCookiePreferences(preferences)}
 *   privacyPolicyUrl="/privacy"
 * />
 * ```
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { mode } from "@/design-system";
import { Button } from "./button";
import { Card } from "./card";
import { Switch } from "./switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./dialog";
import { Cookie, Shield, BarChart3, Target } from "lucide-react";

export interface CookiePreferences {
  necessary: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export interface CookieConsentProps {
  className?: string;
  onAccept?: (preferences: CookiePreferences) => void;
  onReject?: () => void;
  privacyPolicyUrl?: string;
  cookiePolicyUrl?: string;
}

const COOKIE_NAME = "fabrk_cookie_consent";
const STORAGE_KEY = "fabrk_cookie_preferences";

export function CookieConsent({
  className,
  onAccept,
  onReject,
  privacyPolicyUrl = "/privacy",
  cookiePolicyUrl: _cookiePolicyUrl = "/cookies",
}: CookieConsentProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [showCustomize, setShowCustomize] = React.useState(false);
  const [preferences, setPreferences] = React.useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  // Helper function to save preferences
  const savePreferences = React.useCallback((prefs: CookiePreferences) => {
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));

    // Save to cookie (365 days)
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `${COOKIE_NAME}=${JSON.stringify(prefs)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
  }, []);

  // Check if consent already given or DNT enabled
  React.useEffect(() => {
    // Check Do Not Track setting
    const dnt =
      navigator.doNotTrack === "1" ||
      (window as unknown as { doNotTrack?: string }).doNotTrack === "1" ||
      (navigator as unknown as { msDoNotTrack?: string }).msDoNotTrack === "1";

    if (dnt) {
      // Respect DNT - auto-reject all non-essential
      savePreferences({
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      });
      setIsVisible(false);
      return;
    }

    // Check if user already made a choice
    const savedPreferences = localStorage.getItem(STORAGE_KEY);
    if (savedPreferences) {
      setIsVisible(false);
      return;
    }

    // Show banner after short delay
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, [savePreferences]);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    savePreferences(allAccepted);
    onAccept?.(allAccepted);
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    savePreferences(onlyNecessary);
    onReject?.();
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    savePreferences(preferences);
    onAccept?.(preferences);
    setShowCustomize(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Compact Terminal-Style Banner - Bottom Right */}
      <div
        className={cn("fixed right-4 bottom-4 z-50 w-80", className)}
        role="dialog"
        aria-live="polite"
        aria-label="Cookie consent banner"
      >
        <Card className={cn("border-accent bg-card border", mode.radius)}>
          {/* Terminal Header */}
          <div
            className={cn(
              mode.color.border.default,
              "flex items-center justify-between border-b px-4 py-2"
            )}
          >
            <span className={cn("text-xs", mode.font, mode.color.text.muted)}>
              [0x09] COOKIE_POLICY
            </span>
            <button
              onClick={handleRejectAll}
              className={cn(
                "text-xs",
                mode.state.secondary.opacity,
                "hover:opacity-100",
                mode.color.text.muted
              )}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4 px-4 py-2">
            <p className={cn("text-xs leading-relaxed", mode.font, mode.color.text.muted)}>
              &gt; We use cookies for analytics.{" "}
              <a href={privacyPolicyUrl} className={cn("underline", mode.color.text.accent)}>
                Privacy
              </a>
            </p>

            {/* Actions - Inline */}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className={cn("flex-1 text-xs", mode.radius, mode.font)}
              >
                &gt; ACCEPT
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCustomize(true)}
                className={cn("text-xs", mode.radius, mode.font)}
              >
                CONFIG
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Customize Dialog */}
      <Dialog open={showCustomize} onOpenChange={setShowCustomize}>
        <DialogContent className={cn("max-w-2xl", mode.radius)}>
          <DialogHeader>
            <DialogTitle className={cn(mode.font)}>[ COOKIE PREFERENCES ]</DialogTitle>
            <DialogDescription>
              Manage your cookie preferences. You can enable or disable different types of cookies
              below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Necessary Cookies */}
            <div
              className={cn(
                mode.color.bg.muted,
                mode.color.border.default,
                "flex items-start justify-between gap-4 border p-4",
                mode.radius
              )}
            >
              <div className="flex gap-4">
                <Shield className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className={cn("text-sm font-medium", mode.font)}>[NECESSARY]</p>
                  <p className={cn("text-muted-foreground text-xs", mode.font)}>
                    Essential cookies required for the website to function. These cannot be
                    disabled.
                  </p>
                </div>
              </div>
              <Switch checked disabled aria-label="Necessary cookies (always enabled)" />
            </div>

            {/* Analytics Cookies */}
            <div
              className={cn(
                mode.color.border.default,
                "flex items-start justify-between gap-4 border p-4",
                mode.radius
              )}
            >
              <div className="flex gap-4">
                <BarChart3 className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className={cn("text-sm font-medium", mode.font)}>[ANALYTICS]</p>
                  <p className={cn("text-muted-foreground text-xs", mode.font)}>
                    Help us understand how visitors interact with our website to improve user
                    experience.
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, analytics: checked })
                }
                aria-label="Analytics cookies"
              />
            </div>

            {/* Marketing Cookies */}
            <div
              className={cn(
                mode.color.border.default,
                "flex items-start justify-between gap-4 border p-4",
                mode.radius
              )}
            >
              <div className="flex gap-4">
                <Target className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className={cn("text-sm font-medium", mode.font)}>[MARKETING]</p>
                  <p className={cn("text-muted-foreground text-xs", mode.font)}>
                    Used to track visitors across websites to display relevant ads and measure
                    campaign effectiveness.
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.marketing}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, marketing: checked })
                }
                aria-label="Marketing cookies"
              />
            </div>

            {/* Preferences Cookies */}
            <div
              className={cn(
                mode.color.border.default,
                "flex items-start justify-between gap-4 border p-4",
                mode.radius
              )}
            >
              <div className="flex gap-4">
                <Cookie className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className={cn("text-sm font-medium", mode.font)}>[PREFERENCES]</p>
                  <p className={cn("text-muted-foreground text-xs", mode.font)}>
                    Remember your settings and preferences (theme, language, region) for a
                    personalized experience.
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.preferences}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, preferences: checked })
                }
                aria-label="Preference cookies"
              />
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={handleRejectAll}
              className={cn("w-full sm:w-auto", mode.radius, mode.font)}
            >
              {"> "}REJECT ALL
            </Button>
            <Button
              onClick={handleSaveCustom}
              className={cn("w-full sm:w-auto", mode.radius, mode.font)}
            >
              {"> "}SAVE PREFERENCES
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
