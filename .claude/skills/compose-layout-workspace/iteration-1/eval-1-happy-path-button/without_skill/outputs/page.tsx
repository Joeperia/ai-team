import { Box, Button } from '@mui/material';
import React from 'react';

/**
 * Demo page rendering the Figma "Sign in with Email" button.
 *
 * Source: https://www.figma.com/design/Rt3p2w3NtM1X7d9NzDlMdO/Aperia-Shadcn?node-id=1037-71589
 *
 * Design tokens from Figma:
 *   - background: general/primary (#f54a00) -> MUI palette `primary.main`
 *     (mapped via the contained variant + primary color)
 *   - foreground: general/primary foreground (#fafafa)
 *   - typography: paragraph small / bold (Geist 14px / 600 / 20px line-height)
 *   - radius: rounded-lg (8px)
 *   - paddings: xs (8px) vertical / md (16px) horizontal
 *
 * The visual color/typography come from the application theme; the sx overrides
 * here only pin the radius, padding and label weight to match the Figma frame.
 */
export const SignInWithEmailPage: React.FC = () => {
  const handleClick = () => {
    // Placeholder click handler for the demo page.
  };

  return (
    <Box
      data-testid="SignInWithEmailPage"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 2,
      }}
    >
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleClick}
        sx={{
          maxWidth: 360,
          borderRadius: '8px',
          paddingY: '8px',
          paddingX: '16px',
          fontFamily: 'Geist, sans-serif',
          fontSize: '14px',
          fontWeight: 600,
          lineHeight: '20px',
          letterSpacing: 0,
          textTransform: 'none',
        }}
      >
        Sign in with Email
      </Button>
    </Box>
  );
};

export default SignInWithEmailPage;
