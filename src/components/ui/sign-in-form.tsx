"use client";

import * as React from "react";
import Link from "next/link";
import { Github, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { mode } from "@/design-system";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export interface SignInFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SocialProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  onClick?: () => void | Promise<void>;
}

export interface SignInFormProps {
  /** Form submission handler */
  onSubmit?: (data: SignInFormData) => void | Promise<void>;
  /** Social auth providers */
  socialProviders?: SocialProvider[];
  /** Forgot password link URL */
  forgotPasswordHref?: string;
  /** Sign up link URL */
  signUpHref?: string;
  /** Show remember me checkbox */
  showRememberMe?: boolean;
  /** Initial email value */
  defaultEmail?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error message to display */
  error?: string;
  /** Additional className */
  className?: string;
}

const defaultSocialProviders: SocialProvider[] = [
  {
    id: "github",
    name: "GitHub",
    icon: <Github className="h-4 w-4" />,
  },
  {
    id: "google",
    name: "Google",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
    ),
  },
];

/* ----- Shared Components ----- */

interface ErrorMessageProps {
  error: string;
}

function ErrorMessage({ error }: ErrorMessageProps) {
  return (
    <div
      className={cn(
        mode.color.border.danger,
        mode.color.bg.dangerMuted,
        mode.color.text.danger,
        "border px-4 py-2 text-xs",
        mode.radius,
        mode.font
      )}
    >
      [ERROR]: {error}
    </div>
  );
}

interface SocialAuthDividerProps {
  label?: string;
}

function SocialAuthDivider({ label = "Or continue with" }: SocialAuthDividerProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className={cn(mode.color.border.default, "w-full border-t")} />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className={cn("bg-background text-muted-foreground px-2", mode.font)}>{label}</span>
      </div>
    </div>
  );
}

interface SocialAuthButtonsProps {
  providers: SocialProvider[];
  isLoading: boolean;
  loadingProvider: string | null;
  onAuth: (provider: SocialProvider) => void | Promise<void>;
}

function SocialAuthButtons({
  providers,
  isLoading,
  loadingProvider,
  onAuth,
}: SocialAuthButtonsProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        providers.length === 1 && "grid-cols-1",
        providers.length === 2 && "grid-cols-2",
        providers.length >= 3 && "grid-cols-2 sm:grid-cols-3"
      )}
    >
      {providers.map((provider) => (
        <Button
          key={provider.id}
          variant="outline"
          type="button"
          onClick={() => onAuth(provider)}
          disabled={isLoading || loadingProvider !== null}
        >
          {loadingProvider === provider.id ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <span className="mr-2">{provider.icon}</span>
          )}
          {provider.name}
        </Button>
      ))}
    </div>
  );
}

export function SignInForm({
  onSubmit,
  socialProviders = defaultSocialProviders,
  forgotPasswordHref = "/forgot-password",
  signUpHref = "/sign-up",
  showRememberMe = true,
  defaultEmail = "",
  isLoading = false,
  error,
  className,
}: SignInFormProps) {
  const [email, setEmail] = React.useState(defaultEmail);
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [loadingProvider, setLoadingProvider] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit?.({ email, password, rememberMe });
  };

  const handleSocialAuth = async (provider: SocialProvider) => {
    setLoadingProvider(provider.id);
    try {
      await provider.onClick?.();
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Error Message */}
      {error && <ErrorMessage error={error} />}

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signin-email" className={cn(mode.font, "text-xs")}>
            [EMAIL]:
          </Label>
          <Input
            id="signin-email"
            placeholder="name@example.com"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="signin-password" className={cn(mode.font, "text-xs")}>
              [PASSWORD]:
            </Label>
            {forgotPasswordHref && (
              <Link
                href={forgotPasswordHref}
                className={cn("text-primary text-xs hover:underline", mode.font)}
              >
                Forgot password?
              </Link>
            )}
          </div>
          <Input
            id="signin-password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        {showRememberMe && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="signin-remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
              disabled={isLoading}
              className={mode.radius}
            />
            <Label
              htmlFor="signin-remember"
              className={cn(mode.font, "text-muted-foreground text-xs font-normal")}
            >
              Remember me for 30 days
            </Label>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              SIGNING_IN...
            </>
          ) : (
            "&gt; SIGN IN"
          )}
        </Button>
      </form>

      {/* Social Auth */}
      {socialProviders.length > 0 && (
        <>
          <SocialAuthDivider />
          <SocialAuthButtons
            providers={socialProviders}
            isLoading={isLoading}
            loadingProvider={loadingProvider}
            onAuth={handleSocialAuth}
          />
        </>
      )}

      {/* Sign Up Link */}
      {signUpHref && (
        <p className={cn("text-muted-foreground text-center text-xs", mode.font)}>
          Don&apos;t have an account?{" "}
          <Link
            href={signUpHref}
            className={cn("hover:text-primary underline underline-offset-4", mode.font)}
          >
            Sign up
          </Link>
        </p>
      )}
    </div>
  );
}

/* ----- Sign Up Form Variant ----- */

export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}

export interface SignUpFormProps {
  /** Form submission handler */
  onSubmit?: (data: SignUpFormData) => void | Promise<void>;
  /** Social auth providers */
  socialProviders?: SocialProvider[];
  /** Sign in link URL */
  signInHref?: string;
  /** Terms of service URL */
  termsHref?: string;
  /** Privacy policy URL */
  privacyHref?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error message to display */
  error?: string;
  /** Additional className */
  className?: string;
}

export function SignUpForm({
  onSubmit,
  socialProviders = defaultSocialProviders,
  signInHref = "/sign-in",
  termsHref = "/terms",
  privacyHref = "/privacy",
  isLoading = false,
  error,
  className,
}: SignUpFormProps) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [loadingProvider, setLoadingProvider] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit?.({ name, email, password, acceptTerms });
  };

  const handleSocialAuth = async (provider: SocialProvider) => {
    setLoadingProvider(provider.id);
    try {
      await provider.onClick?.();
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Error Message */}
      {error && <ErrorMessage error={error} />}

      {/* Sign Up Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signup-name" className={cn(mode.font, "text-xs")}>
            [NAME]:
          </Label>
          <Input
            id="signup-name"
            placeholder="John Doe"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-email" className={cn(mode.font, "text-xs")}>
            [EMAIL]:
          </Label>
          <Input
            id="signup-email"
            placeholder="name@example.com"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-password" className={cn(mode.font, "text-xs")}>
            [PASSWORD]:
          </Label>
          <Input
            id="signup-password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="signup-terms"
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(checked === true)}
            disabled={isLoading}
            className={cn(mode.radius, "mt-0.5")}
          />
          <Label
            htmlFor="signup-terms"
            className={cn(mode.font, "text-muted-foreground text-xs leading-relaxed font-normal")}
          >
            I agree to the{" "}
            <Link href={termsHref} className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href={privacyHref} className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </Label>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading || !acceptTerms}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              CREATING_ACCOUNT...
            </>
          ) : (
            "&gt; CREATE ACCOUNT"
          )}
        </Button>
      </form>

      {/* Social Auth */}
      {socialProviders.length > 0 && (
        <>
          <SocialAuthDivider />
          <SocialAuthButtons
            providers={socialProviders}
            isLoading={isLoading}
            loadingProvider={loadingProvider}
            onAuth={handleSocialAuth}
          />
        </>
      )}

      {/* Sign In Link */}
      {signInHref && (
        <p className={cn("text-muted-foreground text-center text-xs", mode.font)}>
          Already have an account?{" "}
          <Link
            href={signInHref}
            className={cn("hover:text-primary underline underline-offset-4", mode.font)}
          >
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}
