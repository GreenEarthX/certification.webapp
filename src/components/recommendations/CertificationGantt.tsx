"use client";

import { useEffect, useRef } from "react";
import "@/../public/lib/dhtmlx/dhtmlxgantt.css";

const CertificationGantt = () => {
  const ganttRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/lib/dhtmlx/dhtmlxgantt.js";
    script.async = true;
    script.onload = () => {
      // @ts-ignore: gantt comes from external script
      const gantt = window.gantt;

      // Configure the lightbox (read-only via JS later)
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

      // Row coloring based on progress
      gantt.templates.grid_row_class = function (_start: Date, _end: Date, task: { progress?: number }) {
        if (task.progress === 1) return "task-complete";
        if (task.progress && task.progress > 0) return "task-in-progress";
        return "task-pending";
      };

      // Task label inside bar
      gantt.templates.task_text = function (_start: Date, _end: Date, task: { text: string; progress?: number }) {
        const progress = Math.round((task.progress || 0) * 100);
        return `${task.text} (${progress}%)`;
      };

      // Define visible columns in grid (with row index column)
      gantt.config.columns = [
        {
          name: "index",
          label: "#",
          width: 60,
          template: function (task: any) {
            return gantt.getWBSCode(task);
          }
        },
        {
          name: "text",
          label: "Task",
          width: 200, 
          tree: true
        },
        {
          name: "start_date",
          label: "Start Date",
          width: 100, 
          align: "center"
        },
        {
          name: "duration",
          label: "Duration",
          width: 60,
          align: "center"
        }
      ];

      gantt.getWBSCode = function(task: any) {
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
      
      


      // Make it read-only except for lightbox view
      gantt.config.readonly = true;
      gantt.config.drag_move = false;
      gantt.config.drag_resize = false;
      gantt.config.drag_links = false;
      gantt.config.drag_progress = false;
      gantt.config.details_on_dblclick = false;
      gantt.attachEvent("onTaskClick", function (id: string) {
        gantt.showLightbox(id);
        return false; // prevent default behavior
      });

      gantt.config.details_on_create = false;
      gantt.config.select_task = false;

      // Disable editing inside the lightbox
      gantt.attachEvent("onBeforeLightbox", function (id: string) {
        setTimeout(() => {
          const lightbox = document.querySelector(".gantt_cal_light");
          if (!lightbox) return;
      
          // Disable all inputs as soon as lightbox is created
          lightbox.querySelectorAll("input, textarea, select").forEach((el) => {
            el.setAttribute("disabled", "true");
          });
      
          // Hide save/cancel buttons
          lightbox.querySelectorAll(".gantt_cancel_btn, .gantt_save_btn").forEach((el) => {
            (el as HTMLElement).style.display = "none";
          });
        }, 0);
      
        return true; // allow the lightbox to open
      });
      
      // Remove buttons 
      gantt.config.buttons_left = [];
      gantt.config.buttons_right = [];



      gantt.config.date_format = "%Y-%m-%d";
      gantt.init(ganttRef.current!);

      fetch("/data/certificationTimelineData.json")
        .then((res) => res.json())
        .then((data) => gantt.parse(data));
    };

    document.body.appendChild(script);
  }, []);

  return (
    <div style={{ height: "600px", width: "100%" }}>
      <div ref={ganttRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default CertificationGantt;
