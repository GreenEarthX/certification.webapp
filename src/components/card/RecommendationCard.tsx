"use client";

import React from "react";
import {
  Card,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";

import { Recommendation } from "@/models/recommendation";

interface RecommendationCardProps {
  recommendation: Recommendation;
}

const getComplianceColor = (percentage: number) => {
  if (percentage < 30) return "#ff4444"; 
  if (percentage < 70) return "#ffbb33"; 
  return "#00C851"; 
};

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {/* Card with Left Data and Right Compliance Bar */}
      <Card
        sx={{
          width: "100%",
          borderRadius: 2,
          boxShadow: 3,
          "&:hover": { boxShadow: 6 },
          display: "flex",
          position: "relative",
          minHeight: "300px",
        }}
      >
        {/* Left Part: Data */}
        <Box sx={{ flex: 3, padding: "24px" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            {recommendation.title}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {recommendation.overview}
          </Typography>

          <List dense>
            {recommendation.details.map((detail, index) => (
              <ListItem key={index} sx={{ py: 0 }}>
                <ListItemText primary={`• ${detail}`} />
              </ListItem>
            ))}
          </List>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Certifying Entity:</strong> {recommendation.certifyingEntity}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Validity:</strong> {recommendation.validity}
          </Typography>
        </Box>

        {/* Vertical Divider */}
        <Box sx={{ width: "1px", backgroundColor: "#e0e0e0", my: 2 }} />

        {/* Right Part: Compliance Bar */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#ffff", 
            padding: "24px",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: "bold", color: getComplianceColor(recommendation.compliancePercentage) }}>
            {recommendation.compliancePercentage}%
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
            Your compliance score
          </Typography>

          {/* Compliance Bar */}
          <Box
            sx={{
              width: "8px",
              height: "150px", 
              backgroundColor: "#e0e0e0",
              position: "relative",
              borderRadius: "4px",
              overflow: "hidden",
              mt: 2,
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: `${recommendation.compliancePercentage}%`, 
                backgroundColor: getComplianceColor(recommendation.compliancePercentage),
                position: "absolute",
                bottom: 0,
                transition: "height 0.5s ease",
              }}
            />
          </Box>
        </Box>
      </Card>

      {/* Full-Width Buttons */}
      <Box
        sx={{
          display: "flex",
          width: "100%",
          gap: 0,
        }}
      >
        <Button
          variant="contained"
          sx={{
            flex: 1,
            borderRadius: "0 0 0 8px",
            py: 1.5,
            backgroundColor: "#1976d2",
            "&:hover": { backgroundColor: "#1565c0" },
          }}
        >
          View Details
        </Button>
      </Box>
    </Box>
  );
};
