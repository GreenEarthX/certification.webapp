"use client";

import { useEffect, useRef, useState } from "react";
import "@/../public/lib/dhtmlx/dhtmlxgantt.css";


declare global {
    interface Window {
      gantt: any;
    }
  }
  

const CertificationGantt = () => {
  const ganttRef = useRef<HTMLDivElement>(null);
  const ganttInstance = useRef<any>(null);
  const [ganttReady, setGanttReady] = useState(false);

  // Zoom configuration
  function setZoom(level: "day" | "week" | "month") {
    const gantt = ganttInstance.current;
    if (!gantt) return;

    switch (level) {
      case "day":
        gantt.config.scale_unit = "day";
        gantt.config.date_scale = "%j";
        gantt.config.subscales = [{ unit: "month", step: 1, date: "%F" }];
        gantt.config.scale_height = 50;
        break;
      case "week":
        gantt.config.scale_unit = "week";
        gantt.config.date_scale = "Week #%W";
        gantt.config.subscales = [{ unit: "month", step: 1, date: "%F" }];
        gantt.config.scale_height = 50;
        break;
      case "month":
        gantt.config.scale_unit = "month";
        gantt.config.date_scale = "%F %Y";
        gantt.config.subscales = [];
        gantt.config.scale_height = 50;
        break;
    }
    gantt.render();
  }

  
  

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/lib/dhtmlx/dhtmlxgantt.js";
    script.async = true;
    script.onload = () => {
      const gantt = window.gantt;
      ganttInstance.current = gantt;
      setGanttReady(true);

      gantt.config.lightbox.sections = [
        { name: "description", height: 38, map_to: "text", type: "textarea", focus: true },
        {
          name: "progress",
          height: 30,
          map_to: "progress",
          type: "select",
          options: [
            { key: 0, label: "Not started" },
            { key: 0.25, label: "25%" },
            { key: 0.5, label: "50%" },
            { key: 0.75, label: "75%" },
            { key: 1, label: "Complete" }
          ]
        },
        { name: "time", type: "duration", map_to: "auto" }
      ];

      gantt.templates.grid_row_class = function (_start: Date, _end: Date, task: any) {
        if (task.text.includes("Consent to Operate")) return "phase-consent";
        if (task.parent === 2 || task.id === 2) return "phase-cert1";
        if (task.parent === 8 || task.id === 8) return "phase-provisional";
        if (task.parent === 12 || task.id === 12) return "phase-final";
        return "";
      };
      

      gantt.templates.task_text = function (_start: Date, _end: Date, task: any) {
        const progress = Math.round((task.progress || 0) * 100);
        return `${task.text}`;
      };

      gantt.templates.task_class = function (_start: Date, _end: Date, task: any) {
        if (task.text.includes("Consent to Operate")) return "phase-consent";
        if (task.parent === 2 || task.id === 2) return "phase-cert1";
        if (task.parent === 8 || task.id === 8) return "phase-provisional";
        if (task.parent === 12 || task.id === 12) return "phase-final";
        return "";
      };

      gantt.config.columns = [
        {
          name: "index",
          label: "#",
          width: 40,
          template: function (task: any) {
            return gantt.getWBSCode(task);
          }
        },
        { name: "text", label: "Task", width: 200, tree: true },
        { name: "start_date", label: "Start Date", width: 100, align: "center" },
        { name: "duration", label: "Dur", width: 40, align: "center" }
      ];

      gantt.getWBSCode = function (task: any) {
        let code = "";
        let current = task;
        while (current) {
          const parent = gantt.getParent(current.id);
          if (!parent || parent === gantt.config.root_id) {
            const index = gantt.getTaskIndex(current.id) + 1;
            code = index + (code ? "." + code : "");
            break;
          }
          const siblings = gantt.getChildren(parent);
          const index = siblings.indexOf(current.id) + 1;
          code = index + (code ? "." + code : "");
          current = gantt.getTask(parent);
        }
        return code;
      };

      gantt.config.readonly = true;
      gantt.config.drag_move = false;
      gantt.config.drag_resize = false;
      gantt.config.drag_links = false;
      gantt.config.drag_progress = false;
      gantt.config.details_on_dblclick = false;
      gantt.config.details_on_create = false;
      gantt.config.select_task = false;

      gantt.attachEvent("onTaskClick", function (id: string) {
        gantt.showLightbox(id);
        return false;
      });

      gantt.attachEvent("onBeforeLightbox", function () {
        setTimeout(() => {
          const lightbox = document.querySelector(".gantt_cal_light");
          if (!lightbox) return;
          lightbox.querySelectorAll("input, textarea, select").forEach((el) => el.setAttribute("disabled", "true"));
          lightbox.querySelectorAll(".gantt_cancel_btn, .gantt_save_btn").forEach((el) => {
            (el as HTMLElement).style.display = "none";
          });
        }, 0);
        return true;
      });

      gantt.config.buttons_left = [];
      gantt.config.buttons_right = [];

      gantt.config.date_format = "%Y-%m-%d";
      gantt.config.scale_unit = "day";
      gantt.config.date_scale = "%j";
      gantt.config.subscales = [{ unit: "month", step: 1, date: "%F" }];
      gantt.config.scale_height = 50;

      gantt.init(ganttRef.current!);

      // your certificationData object goes here exactly as you have it
      const certificationData = {
        data: [
          { id: 1, text: 'Obtain "Consent to Operate"', start_date: "2025-06-02", duration: 6, progress: 0, open: true },
        
          // Certificate 1 Phase
          { id: 2, text: "Facility Level Certificate", start_date: "2025-06-10", duration: 83, type: "project", open: true },
          { id: 3, text: "On-site plant Verification", start_date: "2025-06-10", duration: 21, parent: 2 },
          { id: 4, text: "Prepare Documents", start_date: "2025-07-01", duration: 31, parent: 2 },
          { id: 5, text: "Prepare Data Post Verification", start_date: "2025-07-01", duration: 31, parent: 2 },
          { id: 6, text: "Fill out application for Certificate", start_date: "2025-07-01", duration: 31, parent: 2 },
          { id: 7, text: "Technical Committee & Review", start_date: "2025-08-01", duration: 31, parent: 2 },
        
          // Provisional Certificate Phase
          { id: 8, text: "Provisional Certificate", start_date: "2025-06-11", duration: 82, type: "project", open: true },
          { id: 9, text: "Monthly Hydrogen Production", start_date: "2025-06-11", duration: 20, parent: 8 },
          { id: 10, text: "Submit Monthly production details", start_date: "2025-07-01", duration: 32, parent: 8 },
          { id: 11, text: "Auto-Generated Provisional Certificate", start_date: "2025-08-04", duration: 28, parent: 8 },
        
          // Final Certificate Phase
          { id: 12, text: "Final Certificate", start_date: "2026-04-01", duration: 121, type: "project", open: true },
          { id: 13, text: "Submit data for verification", start_date: "2026-04-01", duration: 30, parent: 12 },
          { id: 14, text: "Undergo Data Verification by ACV", start_date: "2026-05-01", duration: 31, parent: 12 },
          { id: 15, text: "Prepare Evidence & Documentation", start_date: "2026-06-01", duration: 30, parent: 12 },
          { id: 16, text: "Submit Application", start_date: "2026-06-01", duration: 30, parent: 12 },
          { id: 17, text: "Final Review & Certificate Issuance", start_date: "2026-07-01", duration: 31, parent: 12 }
        ],
        links: [
          { id: 1, source: 1, target: 2, type: "0" }, // Consent ➝ Facility Level Cert
          { id: 2, source: 1, target: 8, type: "0" }, // Consent ➝ Provisional Cert
        
          { id: 3, source: 2, target: 3, type: "1" }, // Facility Cert START ➝ On-site Verification START
          { id: 4, source: 2, target: 4, type: "1" }, // Facility Cert START ➝ Prepare Documents START
          { id: 5, source: 8, target: 9, type: "1" }, // Provisional Cert START ➝ Monthly Hydrogen Prod START
        
          { id: 6, source: 3, target: 5, type: "0" }, // On-site Verification ➝ Prepare Data Post Verif
          { id: 7, source: 3, target: 6, type: "0" }, // On-site Verification ➝ Fill out application
        
          { id: 8, source: 9, target: 10, type: "0" }, // Monthly Hydrogen ➝ Submit Monthly Details
        
          { id: 9, source: 4, target: 7, type: "0" }, // Prepare Documents ➝ Committee Review
          { id:10, source: 5, target: 7, type: "0" }, // Prepare Data ➝ Committee Review
          { id:11, source: 6, target: 7, type: "0" }, // Fill App ➝ Committee Review
        
          { id:12, source:10, target:11, type: "0" }, // Submit Monthly ➝ Auto Provisional Cert
        
          { id:13, source: 2, target: 7, type: "0" }, // Facility Cert ➝ Committee Review (Finish to Finish)
          { id:14, source: 8, target:11, type: "0" }, // Provisional Cert ➝ Auto Provisional Cert (Finish to Finish)
        
          { id:15, source:12, target:13, type: "1" }, // Final Cert START ➝ Submit Data START
          { id:16, source:13, target:14, type: "0" }, // Submit Data ➝ Undergo Verification
          { id:17, source:14, target:15, type: "0" }, // Undergo ➝ Prepare Evidence
          { id:18, source:15, target:16, type: "1" }, // Prepare Evidence START ➝ Submit App START
          { id:19, source:16, target:17, type: "0" }, // Submit App ➝ Final Review
          { id:20, source:12, target:17, type: "0" }  // Final Cert ➝ Final Review (Finish to Finish)
        ]
        
      };// keep this part unchanged
      gantt.parse(certificationData);
    };

    document.body.appendChild(script);
  }, []);

  return (
    <div className="gantt-wrapper">
      <div className="gantt-toolbar">
        <button onClick={() => setZoom("day")} disabled={!ganttReady}>Day</button>
        <button onClick={() => setZoom("week")} disabled={!ganttReady}>Week</button>
        <button onClick={() => setZoom("month")} disabled={!ganttReady}>Month</button>
      </div>
      <div className="gantt-container" ref={ganttRef} />
    </div>
  );
};

export default CertificationGantt;
