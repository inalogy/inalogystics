'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
  Desk as DeskIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material'
import Link from 'next/link'

interface NavigationProps {
  currentPage?: 'home' | 'desks' | 'notifications'
}

export default function Navigation({ currentPage }: NavigationProps) {
  const { data: session } = useSession()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSignOut = () => {
    handleClose()
    setMobileMenuOpen(false)
    signOut({ callbackUrl: '/auth/signin' })
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            <Box component={Link} href="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
              <Box component="span" sx={{ color: 'primary.main' }}>INA</Box>
              <Box component="span" sx={{ color: 'secondary.main' }}>LOGYSTICS</Box>
            </Box>
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                color={currentPage === 'desks' ? 'secondary' : 'inherit'}
                href="/desks"
                sx={{ fontWeight: 600 }}
              >
                Desks
              </Button>
              <Button
                color={currentPage === 'notifications' ? 'secondary' : 'inherit'}
                href="/notifications"
                sx={{ fontWeight: 600 }}
              >
                Notifications
              </Button>

              {session?.user && (
                <>
                  <IconButton
                    size="small"
                    onClick={handleMenu}
                    sx={{ ml: 1 }}
                  >
                    <Avatar
                      src={session.user.image || undefined}
                      alt={session.user.name || 'User'}
                      sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                    >
                      {session.user.name?.charAt(0) || 'U'}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    onClick={handleClose}
                    PaperProps={{
                      elevation: 3,
                      sx: {
                        mt: 1.5,
                        minWidth: 200,
                      },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {session.user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {session.user.email}
                      </Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={handleSignOut}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      Sign Out
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          )}

          {/* Mobile Navigation */}
          {isMobile && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {session?.user && (
                <Avatar
                  src={session.user.image || undefined}
                  alt={session.user.name || 'User'}
                  sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                >
                  {session.user.name?.charAt(0) || 'U'}
                </Avatar>
              )}
              <IconButton
                color="inherit"
                aria-label="open menu"
                edge="end"
                onClick={toggleMobileMenu}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer Menu */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: { width: '75%', maxWidth: 300 }
        }}
      >
        <Box sx={{ width: '100%' }} role="presentation">
          {session?.user && (
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Avatar
                  src={session.user.image || undefined}
                  alt={session.user.name || 'User'}
                  sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}
                >
                  {session.user.name?.charAt(0) || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {session.user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {session.user.email}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          <List>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/desks"
                onClick={() => setMobileMenuOpen(false)}
                selected={currentPage === 'desks'}
              >
                <ListItemIcon>
                  <DeskIcon color={currentPage === 'desks' ? 'secondary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText
                  primary="Desks"
                  primaryTypographyProps={{
                    fontWeight: currentPage === 'desks' ? 600 : 400,
                    color: currentPage === 'desks' ? 'secondary.main' : 'inherit'
                  }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                selected={currentPage === 'notifications'}
              >
                <ListItemIcon>
                  <NotificationsIcon color={currentPage === 'notifications' ? 'secondary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText
                  primary="Notifications"
                  primaryTypographyProps={{
                    fontWeight: currentPage === 'notifications' ? 600 : 400,
                    color: currentPage === 'notifications' ? 'secondary.main' : 'inherit'
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>

          <Divider />

          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleSignOut}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Sign Out" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  )
}
