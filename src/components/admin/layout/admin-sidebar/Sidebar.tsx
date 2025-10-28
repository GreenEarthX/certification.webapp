"use client";

import React, { useState } from 'react';
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
  Box,
  IconButton,
} from '@mui/material';
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaHome, 
  FaUsers,
  FaLeaf,
  FaCertificate,
  FaChartBar,
  FaCog
} from 'react-icons/fa';

import styles from "../../../../../src/app/styles/sidebar.module.css"; // Adjust the path as necessary

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Function to determine if the current path is active
  const isActive = (path: string) => pathname === path;

  // Toggle sidebar collapse state
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Drawer
      variant="permanent"
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}
      classes={{ paper: `${styles.sidebarPaper} ${isCollapsed ? styles.collapsed : ''}` }}
    >
      {/* Logo Section */}
      <Box 
        className={styles.logoBox} 
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', cursor: 'pointer' }}
        onClick={toggleSidebar}
      >
        <Image
          src="/logoGEX.png"
          alt="Logo"
          width={isCollapsed ? 40 : 50}
          height={isCollapsed ? 40 : 50}
          className={styles.logo}
          style={{ borderRadius: '50%' }}
        />
      </Box>

      {/* Toggle Button (Arrow) - Clickable Full Height Bar */}
      <Box 
        className={styles.toggleButtonContainer}
        sx={{ display: 'flex', justifyContent: 'center', padding: '8px', cursor: 'pointer' }}
        onClick={toggleSidebar}
      >
        <IconButton
          className={styles.toggleButton}
        >
          {isCollapsed ? (
            <FaChevronRight className={styles.arrowIcon} />
          ) : (
            <FaChevronLeft className={styles.arrowIcon} />
          )}
        </IconButton>
      </Box>

      <Divider />

      {/* Navigation Links */}
      <List sx={{ paddingTop: '16px' }}>
        {[
          { text: 'Dashboard', icon: <FaHome />, path: '/admin/dashboard' },
          { text: 'Users', icon: <FaUsers />, path: '/admin/users' },
          { text: 'Plants Details', icon: <FaLeaf />, path: '/admin/manage-plants-details' },
          { text: 'Certifications', icon: <FaCertificate />, path: '/admin/certifications' },
          { text: 'Reports', icon: <FaChartBar />, path: '/admin/reports' },
          { text: 'Settings', icon: <FaCog />, path: '/admin/settings' },
        ].map((item) => (
          <ListItem 
            key={item.text}
            component={Link} 
            href={item.path}
            className={`${styles.listItem} ${isActive(item.path) ? styles.listItemActive : ''}`}
            sx={{ display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-start', padding: '10px 16px' }}
          >
            <ListItemIcon className={styles.listItemIcon} sx={{ minWidth: isCollapsed ? 'auto' : '40px', display: 'flex', justifyContent: 'center' }}>
              {item.icon}
            </ListItemIcon>
            {!isCollapsed && (
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: isActive(item.path) ? 'medium' : 'normal',
                }}
              />
            )}
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;