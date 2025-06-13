"use client";
import { useState } from "react";
import React from "react";
import { useRouter } from "next/navigation"; 
import {
  Card,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';


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
  const router = useRouter(); 
  const [openDialog, setOpenDialog] = useState(false);

  const handleStartSubmission = () => {
    console.log("Start Submission clicked");
    // Additional logic like API calls can be added here
    setOpenDialog(true); // Show the modal
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleViewDetails = () => {
    // Update the route to match your folder structure
    router.push(`/plant-operator/recommendations/${recommendation.id}`);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
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
            <strong>Certification Bodies:</strong> {recommendation.certifyingEntity}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Validity:</strong> {recommendation.validity}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Coverage:</strong> {recommendation.certificationCoverage}
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
          <Typography variant="h4" sx={{ fontWeight: "bold", color: getComplianceColor(recommendation.compliancePercentage || 0) }}>
            {recommendation.compliancePercentage !== undefined ? `${recommendation.compliancePercentage}%` : "N/A"}
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

      {/* Two Half-Width Buttons */}
      <Box sx={{ display: "flex", width: "100%" }}>
        <Button
          variant="contained"
          sx={{
            flex: 1,
            borderRadius: "0 0 0 8px",
            py: 1.5,
            backgroundColor: "#1976d2",
            "&:hover": { backgroundColor: "#1565c0" },
          }}
          onClick={handleViewDetails}
        >
          View Details
        </Button>

        <Button
          variant="contained"
          sx={{
            flex: 1,
            borderRadius: "0 0 8px 0",
            py: 1.5,
            backgroundColor: "#00c851",
            "&:hover": { backgroundColor: "#1b5e20" },
          }}
          onClick={handleStartSubmission}
        >
          Start Submission
        </Button>
      </Box>

      {/* Modal */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 3,
            minWidth: 350,
            textAlign: "center",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem", color: "#00C851" }}>
          Submission Started!
        </DialogTitle>

        <DialogContent>
          <CheckCircleOutlineIcon sx={{ fontSize: 60, color: "#00C851", mb: 2 }} />
          <Typography variant="body1" sx={{ mb: 2 }}>
            Your certification process has started successfully.
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            This recommendation is now being tracked and added to your Gantt chart.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", mt: 2 }}>
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            sx={{
              backgroundColor: "#00C851",
              px: 4,
              borderRadius: 2,
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#1b5e20" },
            }}
          >
            Got It
          </Button>
        </DialogActions>
      </Dialog>


    </Box>
  );
};