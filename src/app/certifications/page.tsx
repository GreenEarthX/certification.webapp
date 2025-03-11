"use client";

import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useMediaQuery } from "@mui/material";

const columns: GridColDef[] = [
  { field: "Certification", headerName: "Certification", flex: 1, minWidth: 120 },
  { field: "Plant Name", headerName: "Plant Name", flex: 1, minWidth: 120 },
  { field: "Entity", headerName: "Entity", flex: 1, minWidth: 120 },
  { field: "Submission Date", headerName: "Submission Date", flex: 1, minWidth: 120 },
  { field: "Type", headerName: "Type", flex: 1, minWidth: 100 },
  {
    field: "View",
    headerName: "Details",
    flex: 1,
    minWidth: 100,
    renderCell: (params) => (
      <a href={`/certifications/${params.row.id}`} className="text-blue-600 hover:text-blue-700">
        View Details
      </a>
    ),
  },
  {
    field: "Status",
    headerName: "Status",
    flex: 1,
    minWidth: 100,
    renderCell: (params) => {
      const status = params.value;

      // Determine the label class based on the status
      const getStatusClass = () => {
        switch (status.toLowerCase()) {
          case "active":
            return "bg-green-500 text-white";
          case "expiring":
            return "bg-yellow-500 text-white";
          case "expired":
            return "bg-red-500 text-white";
          default:
            return "bg-gray-500 text-white";
        }
      };

      return (
        <div
          className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusClass()}`}
          style={{
            width: "90px",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {status}
        </div>
      );
    },
  },
];

export default function CertificationsTable() {
  const isSmallScreen = useMediaQuery("(max-width: 600px)");
  const [certifications, setCertifications] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/certifications");
        const data = await response.json();
        setCertifications(data);
      } catch (error) {
        console.error("Error fetching certifications:", error);
      }
    }

    fetchData();
  }, []);

  return (
    <div>
      <br />
      <section className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Certifications List</h2>
        <br />

        <div
          style={{
            height: "100%",
            width: "100%", // Full width
            overflow: "hidden",
            backgroundColor: "#fff",
            borderRadius: "8px",
          }}
        >
          <DataGrid
            rows={certifications}
            columns={columns}
            pageSizeOptions={[5]}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            checkboxSelection={false}
            getRowId={(row) => row.id}
            sx={{
              width: "100%",
              maxWidth: "100%",
              height: "100%",
              fontFamily: "inherit",
              backgroundColor: "#fff",
              "& .MuiDataGrid-virtualScroller": {
                overflow: "auto",
              },
              "& .MuiDataGrid-columnHeader": {
                fontSize: isSmallScreen ? "12px" : "13px",
                padding: "5px 8px",
                backgroundColor: "#fff",
                borderBottom: "1px solid #ddd",
              },
              "& .MuiDataGrid-cell": {
                fontSize: isSmallScreen ? "12px" : "13px",
                padding: "5px 8px",
                backgroundColor: "#fff",
                borderBottom: "1px solid #ddd",
              },
            }}
          />
        </div>
      </section>
    </div>
  );
}
