'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
} from '@mui/material'
import { Business as BusinessIcon } from '@mui/icons-material'

export default function SignInPage() {
  const searchParams = useSearchParams()
  const error = searchParams?.get('error')
  const callbackUrl = searchParams?.get('callbackUrl') || '/'

  const handleSignIn = () => {
    signIn('azure-ad', { callbackUrl })
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #014059 0%, #2A5A72 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent sx={{ p: 6 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                <Box component="span" sx={{ color: 'primary.main' }}>INA</Box>
                <Box component="span" sx={{ color: 'secondary.main' }}>LOGYSTICS</Box>
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Office Space Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to access parking and desk booking
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error === 'OAuthSignin' && 'Error occurred during sign in. Please try again.'}
                {error === 'OAuthCallback' && 'Error occurred during authentication callback.'}
                {error === 'OAuthCreateAccount' && 'Could not create account.'}
                {error === 'EmailCreateAccount' && 'Could not create account.'}
                {error === 'Callback' && 'Error in callback handler.'}
                {error === 'OAuthAccountNotLinked' && 'Account not linked. Please use a different provider.'}
                {error === 'EmailSignin' && 'Check your email for sign in link.'}
                {error === 'CredentialsSignin' && 'Sign in failed. Check your credentials.'}
                {error === 'SessionRequired' && 'Please sign in to access this page.'}
                {!['OAuthSignin', 'OAuthCallback', 'OAuthCreateAccount', 'EmailCreateAccount', 'Callback', 'OAuthAccountNotLinked', 'EmailSignin', 'CredentialsSignin', 'SessionRequired'].includes(error) && 'An error occurred. Please try again.'}
              </Alert>
            )}

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleSignIn}
              startIcon={<BusinessIcon />}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                textTransform: 'none',
                background: 'linear-gradient(135deg, #014059 0%, #2A5A72 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #002A3A 0%, #014059 100%)',
                },
              }}
            >
              Sign in with Microsoft Entra
            </Button>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
              You will be redirected to Microsoft login page
            </Typography>
          </CardContent>
        </Card>

        <Typography variant="body2" color="white" sx={{ textAlign: 'center', mt: 3, opacity: 0.8 }}>
          &copy; 2024 InaLogystics. All rights reserved.
        </Typography>
      </Container>
    </Box>
  )
}
