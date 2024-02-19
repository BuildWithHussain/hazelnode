// Copyright (c) 2024, Build With Hussain and contributors
// For license information, please see license.txt

frappe.ui.form.on("Hazel Workflow", {
  refresh(frm) {
    frm.set_query("trigger_type", () => {
      return {
        filters: { kind: "Trigger" },
      };
    });
  },
});
