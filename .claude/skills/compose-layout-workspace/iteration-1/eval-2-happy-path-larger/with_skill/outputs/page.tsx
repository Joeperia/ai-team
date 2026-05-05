import { Button, Input, Separator } from '$SHADCN_COMPONENT_LIBRARY_PACKAGE';
import React from 'react';

/**
 * Create-an-account page.
 *
 * Implemented from Figma node 1037:71583 (Aperia-Shadcn).
 *
 * Code Connect mappings used:
 *   - Email input    (node 1037:71588) → <Input size="default" shape="default" placeholder="..." />
 *   - Submit button  (node 1037:71589) → <Button variant="default" size="default" shape="default">
 *   - OAuth button   (node 1037:71594) → <Button variant="outline"  size="default" shape="default">
 *
 * No Code Connect mapping (using library equivalent):
 *   - Separator (nodes 1037:71591, 1037:71593) → <Separator /> from $SHADCN_COMPONENT_LIBRARY_PACKAGE
 *
 * Library gaps (improvised inline using semantic Tailwind tokens). When these
 * primitives land in $SHADCN_COMPONENT_LIBRARY_PACKAGE, replace the inline JSX:
 *   - Icon / GitHub mark (node referenced in 1037:71594 — the github logo)
 */

// Inline GitHub mark — replace with library Icon primitive once available.
const GithubIcon: React.FC = () => (
  <svg
    aria-hidden="true"
    className="size-4 shrink-0"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      clipRule="evenodd"
      d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
      fillRule="evenodd"
    />
  </svg>
);

export const CreateAccountPage: React.FC = () => {
  // Layout-only composition — wire to auth/identity/form state when plumbing lands.
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleGithubSignIn = () => {};

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-6">
      <div className="flex w-[350px] flex-col items-stretch gap-6">
        {/* Form title */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-foreground">
            Create an account
          </h1>
          <p className="text-sm leading-5 text-muted-foreground">
            Enter your email below to create your account
          </p>
        </div>

        {/* Form */}
        <form className="flex flex-col items-center gap-6" onSubmit={handleSubmit}>
          <Input
            aria-label="Email"
            autoComplete="email"
            name="email"
            placeholder="name@example.com"
            shape="default"
            size="default"
            type="email"
          />

          <Button
            className="w-full"
            shape="default"
            size="default"
            type="submit"
            variant="default"
          >
            Sign in with Email
          </Button>

          {/* Or-continue-with separator */}
          <div className="flex w-full items-center justify-center gap-6">
            <Separator className="flex-1" />
            <span className="shrink-0 text-sm font-medium leading-5 text-muted-foreground">
              Or continue with
            </span>
            <Separator className="flex-1" />
          </div>

          <Button
            className="w-full"
            onClick={handleGithubSignIn}
            shape="default"
            size="default"
            type="button"
            variant="outline"
          >
            <GithubIcon />
            Github
          </Button>
        </form>

        {/* Terms / Privacy */}
        <p className="text-center text-sm leading-5 text-muted-foreground">
          By clicking continue, you agree to our{' '}
          <a
            className="underline underline-offset-4 hover:text-foreground"
            href="/terms"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            className="underline underline-offset-4 hover:text-foreground"
            href="/privacy"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
};
