import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface RiskScoreProps {
  score: number;
}

const RiskScore: React.FC<RiskScoreProps> = ({ score }) => {
  const [hovered, setHovered] = useState(false);
  const [showFullModal, setShowFullModal] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-500";
    if (score <= 40) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div
      className="relative flex items-center space-x-4 p-4"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Maturity Score Label */}
      <span className="text-2xl font-semibold text-[#17598d] cursor-default">
        My Maturity Score
      </span>

      {/* Progress Bar and Score */}
      <div className="flex items-center space-x-2">
        <div className="w-28 h-3 bg-gray-200 rounded-full">
          <div
            className={`${getScoreColor(score).replace("text", "bg")} h-3 rounded-full`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
          {score}%
        </span>
      </div>

      {/* Tooltip with beautiful centered link */}
      {hovered && (
        <div className="absolute top-14 left-0 z-10 w-96 bg-white border border-blue-300 rounded-lg shadow-lg p-4 text-sm text-gray-700 transition-all duration-200">
          <p className="font-semibold mb-2">Maturity Score calculation based on:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="font-medium">Financial Readiness</span></li>
            <li><span className="font-medium">Ownership documents</span></li>
            <li><span className="font-medium">Plant Stage</span></li>
            <li><span className="font-medium">Profile trustworthiness</span></li>
          </ul>
          {/* Styled centered button link */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowFullModal(true)}
              className="bg-blue-600 text-white text-xs font-medium px-4 py-1.5 rounded-full hover:bg-blue-700 flex items-center gap-1 transition"
            >
              <InfoOutlinedIcon fontSize="small" />
              View Full Calculation Process
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Modal styled beautifully */}
      <Dialog
        open={showFullModal}
        onClose={() => setShowFullModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "#f7fbff",
            borderRadius: 3,
            p: 3,
            maxHeight: "95vh",
            overflowY: "auto",
          },
        }}
      >

<DialogContent sx={{ backgroundColor: "#f1f7fd", px: 2, py: 3 }}>
  <Box
    sx={{
      backgroundColor: "#fff",
      borderRadius: "12px",
      border: "1px solid #d0e4f7",
      padding: "24px",
      maxWidth: "100%",
    }}
  >

  
    <Typography
  variant="h6"
  sx={{
    fontWeight: 600,
    color: "#17598d",
    textAlign: "center",
    mb: 1.5,
  }}
>
  Maturity Score Calculation Process
</Typography>

<Divider sx={{ mb: 3 }} />


    {/* Section 1 */}
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ fontWeight: 600, color: "#1565c0", mb: 1 }}>
        1. Data Collection :
      </Typography>
      <Typography sx={{ mb: 1 }}>
        Gather relevant data about the plant, including:
      </Typography>
      <ul className="list-disc pl-6 text-sm text-gray-800 space-y-1">
        <li>Location and geopolitical stability</li>
        <li>Type of operations and technology used</li>
        <li>Safety protocols and incident history</li>
        <li>Environmental performance</li>
        <li>Regulatory compliance</li>
        <li>Supply chain dependencies</li>
      </ul>
    </Box>

    {/* Section 2 */}
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ fontWeight: 600, color: "#1565c0", mb: 1 }}>
        2. Define Risk Categories
      </Typography>
      <Typography sx={{ mb: 1 }}>
        Break down risk into measurable categories:
      </Typography>
      <ul className="list-disc pl-6 text-sm text-gray-800 space-y-1">
        <li>Operational Risk</li>
        <li>Environmental Risk</li>
        <li>Regulatory & Compliance Risk</li>
        <li>Health & Safety Risk</li>
        <li>Reputation Risk</li>
        <li>Financial Risk</li>
      </ul>
    </Box>

    {/* Section 3 */}
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ fontWeight: 600, color: "#1565c0", mb: 1 }}>
        3. Assign Weight to Each Category
      </Typography>
      <Typography>
        Based on the impact and likelihood of each category, assign a weight (e.g., Operational Risk = 25%, Environmental Risk = 20%, etc.).
      </Typography>
    </Box>

    {/* Section 4 */}
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ fontWeight: 600, color: "#1565c0", mb: 1 }}>
        4. Score Each Category
      </Typography>
      <Typography>
        Use a scale from 1 to 5 or 1 to 10 for each category:
      </Typography>
      <ul className="list-disc pl-6 text-sm text-gray-800 space-y-1 mt-1">
        <li>1 = Very Low Risk</li>
        <li>5 or 10 = Very High Risk</li>
      </ul>
      <Typography sx={{ mt: 1 }}>
        Scores can be determined through expert assessment, AI modeling, or historical data.
      </Typography>
    </Box>

    {/* Section 5 */}
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ fontWeight: 600, color: "#1565c0", mb: 1 }}>
        5. Calculate the Weighted Risk Score
      </Typography>
      <Typography sx={{ mb: 0.5 }}>
        Apply the following formula:
      </Typography>
      <Typography sx={{ fontWeight: 500, color: "#0d47a1", fontSize: "0.95rem" }}>
        Risk Score = (Category Score × Category Weight) + ...
      </Typography>
      <Typography sx={{ fontWeight: 500, fontSize: "0.95rem" }}>
        Total Risk Score = Sum of all weighted values.
      </Typography>
    </Box>

    {/* Section 6 */}
    <Box>
      <Typography sx={{ fontWeight: 600, color: "#1565c0", mb: 1 }}>
        6. Categorize Final Risk Score
      </Typography>
      <Typography sx={{ mb: 1 }}>
        Use defined ranges to categorize:
      </Typography>
      <ul className="list-disc pl-6 text-sm text-gray-800 space-y-1">
        <li>0–2: Low Risk</li>
        <li>2.1–3.5: Moderate Risk</li>
        <li>3.6–5: High Risk</li>
      </ul>
    </Box>
  </Box>
</DialogContent>


<DialogActions sx={{ justifyContent: "center", mt: 2, pb: 2 }}>
  <Button
    onClick={() => setShowFullModal(false)}
    variant="contained"
    sx={{
      backgroundColor: "#1976d2",
      px: 3,
      py: 1,
      borderRadius: "6px",
      fontWeight: 500,
      fontSize: "0.85rem",
      textTransform: "none",
      "&:hover": { backgroundColor: "#1565c0" },
    }}
  >
    Close
  </Button>
</DialogActions>

      </Dialog>
    </div>
  );
};

export default RiskScore;
