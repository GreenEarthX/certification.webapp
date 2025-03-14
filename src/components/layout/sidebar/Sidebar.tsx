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
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; 
import { 
  FaHome,  
  FaFileAlt, 
  FaBook
} from 'react-icons/fa';

import styles from "../../../app/styles/sidebar.module.css"

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
      <Box className={styles.logoBox}>
        <Image
          src="/logoGEX.png"
          alt="Logo"
          width={isCollapsed ? 50 : 50}
          height={isCollapsed ? 50 : 50}
          className={styles.logo}
        />
      </Box>

      {/* Toggle Button (Arrow) - Full Height */}
      <Box 
        className={styles.toggleButtonContainer}
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
      <List>
        {[
          { text: 'Dashboard', icon: <FaHome />, path: '/dashboard' },
          { text: 'Certifications', icon: <FaFileAlt />, path: '/certifications' },
          { text: 'Recommendations', icon: <FaBook />, path: '/recommendations' },
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