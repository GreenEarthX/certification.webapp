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
import { FaChevronLeft, FaChevronRight, FaHome } from 'react-icons/fa'; 
import { 
  FaSitemap, 
  FaFileAlt, 
  FaFileMedical
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
      <Box 
        className={styles.logoBox} 
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', cursor: 'pointer' }}
        onClick={toggleSidebar} // Make the entire box clickable to toggle sidebar
      >
        <Image
          src="/logoGEX.png"
          alt="Logo"
          width={isCollapsed ? 40 : 50}  // Adjusted size for better symmetry
          height={isCollapsed ? 40 : 50}
          className={styles.logo}
          style={{ borderRadius: '50%' }} // Make the logo circular
        />
      </Box>

      {/* Toggle Button (Arrow) - Clickable Full Height Bar */}
      <Box 
        className={styles.toggleButtonContainer}
        sx={{ display: 'flex', justifyContent: 'center', padding: '8px', cursor: 'pointer' }}
        onClick={toggleSidebar} // Make the toggle bar clickable
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
          { text: 'Dashboard', icon: <FaHome />, path: '/dashboards/dashboard' }, // Add leading slash
          { text: 'Manage Plants', icon: <FaSitemap />, path: '/dashboards/manage-plants-final' }, // Add leading slash
          { text: 'Certifications', icon: <FaFileAlt />, path: '/dashboards/certifications' }, // Add leading slash
          { text: 'Recommendations', icon: <FaFileMedical />, path: '/dashboards/recommendations' }, // Add leading slash
        ].map((item) => (
          <ListItem 
            key={item.text}
            component={Link} 
            href={item.path} // Use absolute paths here
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
