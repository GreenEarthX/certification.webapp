"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Button, List, ListItem, ListItemText } from "@mui/material";

interface Recommendation {
  id: number;
  title: string;
  overview: string;
  details: string[];
  certifyingEntity: string;
  validity: string;
}

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    fetch("/api/recommendations")
      .then((res) => res.json())
      .then(setRecommendations)
      .catch(console.error);
  }, []);

  return (
    <div>
      <br />
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {recommendations.map((recommendation) => (
          <Card
            key={recommendation.id}
            sx={{
              width: "100%",
              borderRadius: 2,
              boxShadow: 3,
              "&:hover": { boxShadow: 6 },
            }}
          >
            <CardContent sx={{ padding: "24px" }}>
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
            </CardContent>

            <Button
              variant="contained"
              fullWidth
              sx={{
                borderRadius: "0 0 8px 8px",
                py: 1.5,
                backgroundColor: "#1976d2",
                "&:hover": { backgroundColor: "#1565c0" },
              }}
            >
              View Details
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
