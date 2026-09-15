"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Network,
  FileText,
  CheckCircle2,   // For Plausibility Check
  Wrench,         // For Plant Builder
  Lightbulb,
} from 'lucide-react';

import styles from "../../../../app/styles/sidebar.module.css";

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Active if path starts with the base route
  const isActive = (path: string) => pathname.startsWith(path);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  useEffect(() => {
    const handleClose = () => setIsCollapsed(true);
    window.addEventListener("plant-builder:close-sidebar", handleClose);
    return () => window.removeEventListener("plant-builder:close-sidebar", handleClose);
  }, []);

  return (
    <Drawer
      variant="permanent"
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}
      classes={{ paper: `${styles.sidebarPaper} ${isCollapsed ? styles.collapsed : ''}` }}
      PaperProps={{
        sx: {
          top: "var(--navbar-height, 80px)",
          height: "calc(100vh - var(--navbar-height, 80px))",
        },
      }}
    >
      {/* Toggle Arrow */}
      <Box
        className={styles.toggleButtonContainer}
        sx={{ display: 'flex', justifyContent: 'center', padding: '8px', cursor: 'pointer' }}
        onClick={toggleSidebar}
      >
        <IconButton className={styles.toggleButton}>
          {isCollapsed ? (
            <ChevronRight className={styles.arrowIcon} />
          ) : (
            <ChevronLeft className={styles.arrowIcon} />
          )}
        </IconButton>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ paddingTop: '16px' }}>
        {[
          { text: 'Dashboard',       icon: <LayoutDashboard />,           path: '/plant-operator/dashboard' },
          { text: 'Manage Plants',   icon: <Network />,        path: '/plant-operator/manage-plants-json' },
          { text: 'Certifications',  icon: <FileText />,        path: '/plant-operator/certifications' },
          
          // REAL PAGE NAMES
          { text: 'Plausibility Check', icon: <CheckCircle2 />, path: '/plant-operator/plausibility-check' },
          { text: 'Plant Builder',      icon: <Wrench />,       path: '/plant-operator/plant-builder' },

          { text: 'Recommendations', icon: <Lightbulb />,   path: '/plant-operator/recommendations' },
        ].map((item) => (
          <ListItem
            key={item.text}
            component={Link}
            href={item.path}
            className={`${styles.listItem} ${isActive(item.path) ? styles.listItemActive : ''}`}
            sx={{
              display: 'flex',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              padding: '10px 14px',
            }}
          >
            <ListItemIcon
              className={styles.listItemIcon}
              sx={{
                minWidth: isCollapsed ? 'auto' : '36px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {item.icon}
            </ListItemIcon>
            {!isCollapsed && (
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: isActive(item.path) ? 'medium' : 'normal',
                  fontSize: '0.9rem',
                  color: isActive(item.path) ? '#1e40af' : '#0f172a',
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
