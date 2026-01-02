'use client'

import * as React from 'react'
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  Button,
} from '@mui/material'
import {
  Desk as DeskIcon,
  Notifications as NotificationsIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function Home() {
  return (
    <>
      <Navigation currentPage="home" />

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #014059 0%, #2A5A72 100%)',
          color: 'white',
          py: { xs: 6, sm: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem', lg: '4.5rem' },
                mb: { xs: 2, sm: 3 },
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              Smart Office Space Management
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: { xs: 3, sm: 4 },
                color: 'rgba(255,255,255,0.9)',
                fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                px: { xs: 2, sm: 0 }
              }}
            >
              Streamline your workplace with intelligent booking solutions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', px: { xs: 2, sm: 0 } }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                href="/desks"
                sx={{
                  px: { xs: 3, sm: 4 },
                  py: { xs: 1.25, sm: 1.5 },
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                Reserve Desk
              </Button>
              <Button
                variant="outlined"
                size="large"
                href="/notifications"
                sx={{
                  px: { xs: 3, sm: 4 },
                  py: { xs: 1.25, sm: 1.5 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Manage Alerts
              </Button>
            </Box>
          </Box>
        </Container>

        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            bgcolor: 'secondary.main',
            opacity: 0.1,
            borderRadius: '50%',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 250,
            height: 250,
            bgcolor: 'secondary.main',
            opacity: 0.1,
            borderRadius: '50%',
          }}
        />
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, sm: 8, md: 10 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 5, md: 6 } }}>
          <Typography
            variant="h3"
            color="primary"
            gutterBottom
            sx={{ fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}
          >
            Office Solutions
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, px: { xs: 2, sm: 0 } }}
          >
            Everything you need for efficient workspace management
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 3, sm: 4 }}>
          {/* Desk Card */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'secondary.light',
                    color: 'secondary.main',
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  <DeskIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h4" color="primary" gutterBottom>
                  Shared Desks
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Interactive floor plans with desk amenities and real-time availability
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                  component={Link}
                  href="/desks"
                  color="secondary"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ fontWeight: 600 }}
                >
                  View Desks
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Notifications Card */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'secondary.light',
                    color: 'secondary.main',
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  <NotificationsIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h4" color="primary" gutterBottom>
                  Smart Alerts
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Real-time notifications for bookings, reminders, and space availability
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                  component={Link}
                  href="/notifications"
                  color="secondary"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ fontWeight: 600 }}
                >
                  Manage Alerts
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #014059 0%, #2A5A72 100%)',
          color: 'white',
          py: { xs: 6, sm: 8 },
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Grid container spacing={{ xs: 3, sm: 4 }} sx={{ textAlign: 'center' }}>
            <Grid item xs={12} md={4}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}>
                80+
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                SHARED DESKS
              </Typography>
            </Grid>
            <Grid item xs={6} md={4}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}>
                24/7
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                ACCESS CONTROL
              </Typography>
            </Grid>
            <Grid item xs={6} md={4}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}>
                100%
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                DIGITAL BOOKING
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', py: { xs: 3, sm: 4 }, mt: { xs: 6, sm: 8 } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            &copy; 2024 InaLogystics. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </>
  )
}
