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
  FaFileMedical,
  FaCheckCircle,   // For Plausibility Check
  FaTools,         // For Plant Builder
} from 'react-icons/fa';

import styles from "../../../../app/styles/sidebar.module.css";

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Active if path starts with the base route
  const isActive = (path: string) => pathname.startsWith(path);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <Drawer
      variant="permanent"
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}
      classes={{ paper: `${styles.sidebarPaper} ${isCollapsed ? styles.collapsed : ''}` }}
    >
      {/* Logo */}
      <Box
        className={styles.logoBox}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '16px',
          cursor: 'pointer',
        }}
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

      {/* Toggle Arrow */}
      <Box
        className={styles.toggleButtonContainer}
        sx={{ display: 'flex', justifyContent: 'center', padding: '8px', cursor: 'pointer' }}
        onClick={toggleSidebar}
      >
        <IconButton className={styles.toggleButton}>
          {isCollapsed ? (
            <FaChevronRight className={styles.arrowIcon} />
          ) : (
            <FaChevronLeft className={styles.arrowIcon} />
          )}
        </IconButton>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ paddingTop: '16px' }}>
        {[
          { text: 'Dashboard',       icon: <FaHome />,           path: '/plant-operator/dashboard' },
          { text: 'Manage Plants',   icon: <FaSitemap />,        path: '/plant-operator/manage-plants-json' },
          { text: 'Certifications',  icon: <FaFileAlt />,        path: '/plant-operator/certifications' },
          
          // REAL PAGE NAMES
          { text: 'Plausibility Check', icon: <FaCheckCircle />, path: '/plant-operator/plausibility-check' },
          { text: 'Plant Builder',      icon: <FaTools />,       path: '/plant-operator/plant-builder' },

          { text: 'Recommendations', icon: <FaFileMedical />,   path: '/plant-operator/recommendations' },
        ].map((item) => (
          <ListItem
            key={item.text}
            component={Link}
            href={item.path}
            className={`${styles.listItem} ${isActive(item.path) ? styles.listItemActive : ''}`}
            sx={{
              display: 'flex',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              padding: '10px 16px',
            }}
          >
            <ListItemIcon
              className={styles.listItemIcon}
              sx={{
                minWidth: isCollapsed ? 'auto' : '40px',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
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