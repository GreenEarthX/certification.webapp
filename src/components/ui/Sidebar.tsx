"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Box 
} from '@mui/material';
import {
  Home as HomeIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  LibraryBooks as LibraryBooksIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';

import styles from '../../app/styles/sidebar.module.css';

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  // Function to determine if the current path is active
  const isActive = (path: string) => pathname === path;

  return (
    <Drawer
      variant="permanent"
      className={styles.sidebar}
      classes={{ paper: styles.sidebarPaper }}
    >
      {/* Logo Section */}
      <Box className={styles.logoBox}>
        <Image
          src="/logoGEX.png"
          alt="Logo"
          width={50}
          height={50}
          className={styles.logo}
        />
      </Box>

      <Divider />

      {/* Navigation Links */}
      <List>
        {[
          { text: 'Dashboard', icon: <HomeIcon />, path: '/dashboard' },
          { text: 'Manage Plants', icon: <BusinessIcon />, path: '/plants' },
          { text: 'Certifications', icon: <AssignmentIcon />, path: '/certifications' },
          { text: 'Recommendations', icon: <LibraryBooksIcon />, path: '/recommendations' },
          { text: 'Calendar', icon: <CalendarIcon />, path: '/calendar' },
          { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
        ].map((item) => (
          <ListItem 
            key={item.text}
            component={Link} 
            href={item.path}
            className={`${styles.listItem} ${isActive(item.path) ? styles.listItemActive : ''}`}
          >
            <ListItemIcon className={styles.listItemIcon}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: isActive(item.path) ? 'medium' : 'normal',
              }}
            />
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Sign Out Link */}
      <List>
        <ListItem 
          component={Link} 
          href="/logout"
          className={`${styles.listItem} ${styles.signOutItem}`}
        >
          <ListItemIcon className={styles.listItemIcon}>
            <ExitToAppIcon />
          </ListItemIcon>
          <ListItemText primary="Sign Out" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;