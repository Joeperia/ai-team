import GitHubIcon from '@mui/icons-material/GitHub';
import { Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';
import {
  TapBox,
  TapButton,
  TapDivider,
  TapTextField,
  TapTypography,
} from '$TARGET_REPO_PACKAGE/common';

export type CreateAccountPageProps = {
  onSubmitEmail?: (email: string) => void;
  onContinueWithGithub?: () => void;
  termsHref?: string;
  privacyHref?: string;
};

/**
 * Create-an-account form page composed from the Figma design at
 * https://www.figma.com/design/Rt3p2w3NtM1X7d9NzDlMdO/Aperia-Shadcn?node-id=1037-71583
 *
 * Built using primitives from $TARGET_REPO_PACKAGE (the design system installed
 * in $TARGET_REPO, which wraps MUI v6).
 */
export const CreateAccountPage: React.FC<CreateAccountPageProps> = ({
  onSubmitEmail,
  onContinueWithGithub,
  termsHref = 'https://ui.shadcn.com/terms',
  privacyHref = 'https://ui.shadcn.com/privacy',
}) => {
  const [email, setEmail] = React.useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmitEmail?.(email);
  };

  return (
    <Root data-testid="CreateAccountPage">
      <FormContainer onSubmit={handleSubmit} noValidate>
        <TitleBlock>
          <TapTypography variant="h3" weight="semibold" align="center">
            Create an account
          </TapTypography>
          <TapTypography variant="small-body" color="text.secondary" align="center">
            Enter your email below to create your account
          </TapTypography>
        </TitleBlock>

        <FormBlock>
          <TapTextField
            fullWidth
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputProps={{ 'aria-label': 'Email address' }}
          />

          <TapButton
            type="submit"
            variant="solid"
            color="primary"
            size="large"
            fullWidth
          >
            Sign in with Email
          </TapButton>

          <DividerRow>
            <TapDivider sx={{ flex: 1 }} />
            <TapTypography variant="small-body" weight="medium" color="text.secondary">
              Or continue with
            </TapTypography>
            <TapDivider sx={{ flex: 1 }} />
          </DividerRow>

          <TapButton
            type="button"
            variant="ghost"
            color="secondary"
            size="large"
            fullWidth
            startIcon={<GitHubIcon sx={{ fontSize: 16 }} />}
            onClick={onContinueWithGithub}
          >
            Github
          </TapButton>
        </FormBlock>

        <TapTypography variant="small-body" color="text.secondary" align="center">
          By clicking continue, you agree to our{' '}
          <Link
            href={termsHref}
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            underline="always"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href={privacyHref}
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            underline="always"
          >
            Privacy Policy
          </Link>
          .
        </TapTypography>
      </FormContainer>
    </Root>
  );
};

const Root = styled(TapBox, {
  name: 'CreateAccountPage',
  slot: 'root',
})(() => ({
  width: '100%',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
}));

const FormContainer = styled('form', {
  name: 'CreateAccountPage',
  slot: 'form',
})(() => ({
  width: '100%',
  maxWidth: 360,
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
}));

const TitleBlock = styled(TapBox, {
  name: 'CreateAccountPage',
  slot: 'titleBlock',
})(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  alignItems: 'center',
  textAlign: 'center',
}));

const FormBlock = styled(TapBox, {
  name: 'CreateAccountPage',
  slot: 'formBlock',
})(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  width: '100%',
}));

const DividerRow = styled(TapBox, {
  name: 'CreateAccountPage',
  slot: 'dividerRow',
})(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 24,
  width: '100%',
}));

