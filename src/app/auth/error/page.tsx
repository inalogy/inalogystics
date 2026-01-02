'use client'

import { useSearchParams } from 'next/navigation'
import { Box, Container, Card, CardContent, Typography, Button, Alert } from '@mui/material'
import { Error as ErrorIcon } from '@mui/icons-material'
import Link from 'next/link'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams?.get('error')

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
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />

            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Authentication Error
            </Typography>

            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              {error === 'Configuration' && 'There is a problem with the server configuration.'}
              {error === 'AccessDenied' && 'You do not have permission to sign in.'}
              {error === 'Verification' && 'The verification token has expired or has already been used.'}
              {!error && 'An unknown error occurred during authentication.'}
              {error && !['Configuration', 'AccessDenied', 'Verification'].includes(error) && `Error: ${error}`}
            </Alert>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              If this problem persists, please contact your system administrator.
            </Typography>

            <Button
              component={Link}
              href="/auth/signin"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
            >
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
