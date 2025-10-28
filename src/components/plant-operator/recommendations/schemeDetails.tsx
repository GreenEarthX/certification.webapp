"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useServiceDetails } from "@/hooks/useSchemeDetails";
import { Tooltip } from "@mui/material";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useState } from "react";

const SchemeDetailsPage = () => {
  const router = useRouter();
  const {
    complianceScore,
    schemeName,
    content,
    loading,
    activeTab,
    setActiveTab,
  } = useServiceDetails(); 


  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setHovered(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => setHovered(false), 200); // slight delay
    setHoverTimeout(timeout);
  };


  
  const handleStartTracking = () => {
    router.push(`/plant-operator/recommendations/${schemeName}/startTracking`); 
  };

  const renderContent = (activeTab: string, content: Record<string, any> | null) => {
    if (loading) return <p>Loading...</p>;
    if (!content) return <p>No data available.</p>;
    if (content.error) return <p>{content.error}</p>;
  
    return (
      <div className="text-gray-700 whitespace-pre-wrap">
        {/* Overview Section */}
        {activeTab === "overview" && (
          <>
            <div className="text-justify">{content?.description}</div>
            <h2 className="text-lg font-semibold mb-2">{content?.ensure?.title}</h2>
            <ul className="list-disc ml-6 mb-4">
              {content?.ensure?.list?.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <h2 className="text-lg font-semibold mb-2">{content?.types?.title}</h2>
            {content?.types?.types?.map((type: any, index: number) => (
              <div key={index} className="mb-4">
                <h3 className="font-bold">{type.type_title}</h3>
                <ul className="list-disc ml-6">
                  {type.details.map((detail: string, idx: number) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        )}
  
        {/* Requirements Section */}
        {activeTab === "requirements" && (
          <>
            <p className="mb-4 text-justify">{content?.description}</p>
            <h2 className="text-lg font-semibold text-blue-500 mb-2">
              {content?.criteria?.title}
            </h2>
            <ul className="list-disc ml-6 mb-4">
              {content?.criteria?.criteria_list?.map((criterion: any, idx: number) => (
                <li key={idx}>
                  <span className="font-semibold">{criterion.criterion_title} :</span>
                  <ul className="list-disc ml-6">
                    {criterion.details.map((detail: string, i: number) => (
                      <li key={i}>{detail}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
  
            <h2 className="text-lg font-semibold text-blue-400 mb-2">
              {content?.specific_green?.title} :
            </h2>
            <p className="mb-2 text-justify">{content?.specific_green?.description}</p>
            <ul className="list-disc ml-6 mb-4">
              {content?.specific_green?.list?.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
  
            <h2 className="text-lg font-semibold text-blue-400 mb-2">
              {content?.specific_low?.title} :
            </h2>
            <p className="mb-2 text-justify">{content?.specific_low?.description}</p>
            <ul className="list-disc ml-6">
              {content?.specific_low?.list?.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </>
        )}
  
        {/* Process Section */}
        {activeTab === "process" && (
          <>
            {content?.steps?.map((step: any, index: number) => (
              <div key={index} className="mb-6">
                <h2 className="text-lg font-semibold text-blue-500 mb-2">
                  {step.title}
                </h2>
                <ul className="list-disc ml-6">
                  {step.details.map((detail: string, idx: number) => (
                    <li key={idx} className="mb-2">
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        )}
      </div>
    );
  };

  const getComplianceColor = (score: number) => {
    if (score < 40) return "bg-red-500";
    if (score < 75) return "bg-yellow-400";
    return "bg-green-500";
  };
  

  return (
    <section className="p-6 rounded-lg">
      {/* Scheme title and compliance score */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{schemeName}</h1>
        <div
  className="relative flex items-center space-x-3"
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
>

  <span className="font-medium text-gray-700">Your Compliance Score</span>

  <div className="w-40 h-3 bg-gray-200 rounded-full overflow-hidden">
    <div
      className={`h-full ${getComplianceColor(complianceScore)}`}
      style={{ width: `${complianceScore}%` }}
    ></div>
  </div>

  <span className={`font-bold ${getComplianceColor(complianceScore).replace("bg", "text")}`}>
    {complianceScore}%
  </span> 


  {hovered && (
  <div
    className="absolute top-10 left-0 z-10 w-96 bg-white border border-blue-300 rounded-lg shadow-lg p-4 text-sm text-gray-700 transition-all duration-200"
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
  >

      <p className="font-semibold mb-2">Compliance Score calculation includes:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li><span className="font-medium">Plant Details</span></li>
        <li><span className="font-medium">Trading Market & Usage Sector</span></li>
        <li><span className="font-medium">Carbon Footprint & GHG Emissions</span></li>
        <li><span className="font-medium">Traceability & Supply Chain</span></li>
      </ul>
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setShowComplianceModal(true)}
          className="bg-blue-600 text-white text-xs font-medium px-4 py-1.5 rounded-full hover:bg-blue-700 flex items-center gap-1 transition"
        >
          <InfoOutlinedIcon fontSize="small" />
          View Full Calculation Process
        </button>
      </div>
    </div>
  )}
</div>

      </div>

      {/* Card with tabs and content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6 flex justify-center items-center">
        <Image
          src={
            schemeName === "REDcert-EU"
              ? "/RedcertLogo.jpg"
              : schemeName === "Green Hydrogen Certification Scheme of India (GHCI)"
              ? "/GHCSIndia.png"
              : schemeName === "GHCI-Concept Certificate"
              ? "/conceptCertificate.png"
              : schemeName === "GHCI-Facility-Level Certificate"
              ? "/facilityCertificate.png"
              : schemeName === "GHCI-Provisional Certificate"
              ? "/provisionalCertificate.png"
              : schemeName === "GHCI-Final Certificate"
              ? "/finalCertificate.png"
              : "/certifhyScheme.png"
          }
          alt="Scheme Logo"
          width={200}
          height={100}
          className="object-contain"
        />
        </div>

        <div className="flex items-center justify-between border-b border-gray-200 mb-4">
          <nav>
            <ul className="flex gap-6">
              {["overview", "requirements", "process"].map((tab) => (
                <li
                  key={tab}
                  className={`cursor-pointer pb-2 border-b-2 ${
                    activeTab === tab
                      ? "border-green-500 text-green-600 font-semibold"
                      : "border-transparent text-gray-600"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </li>
              ))}
            </ul>
          </nav>
          <button
            onClick={handleStartTracking}
            className="bg-green-600 text-white font-medium py-1 px-3 rounded-full text-sm hover:bg-green-700 transition"
          >
            Start tracking
          </button>
        </div>

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          renderContent(activeTab, content)
        )}
      </div>

      <Dialog
  open={showComplianceModal}
  onClose={() => setShowComplianceModal(false)}
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
    <div className="bg-white border border-blue-200 rounded-xl p-6 text-gray-800">
      <Typography variant="h6" sx={{ fontWeight: 600, color: "#17598d", textAlign: "center", mb: 2 }}>
        Compliance Score Calculation Process
      </Typography>

      <ul className="list-disc pl-6 space-y-3 text-sm">
        <li><strong>Evaluate each requirement</strong> from the certification scheme.</li>
        <li><strong>Check alignment</strong> between submitted data and scheme criteria.</li>
        <li><strong>Assign weights</strong> based on importance of each compliance item.</li>
        <li><strong>Calculate total fulfillment</strong> to generate a score as a percentage.</li>
      </ul>
    </div>
  </DialogContent>

  <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
    <Button
      onClick={() => setShowComplianceModal(false)}
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

    </section>
  );
};

export default SchemeDetailsPage;

