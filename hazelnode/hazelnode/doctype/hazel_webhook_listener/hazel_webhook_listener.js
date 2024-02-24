// Copyright (c) 2024, Build With Hussain and contributors
// For license information, please see license.txt

frappe.ui.form.on("Hazel Webhook Listener", {
  refresh(frm) {
    frm.set_intro(
      `<strong>Webhook Endpoint: </strong><a target="_blank" href="/hazelnode_webhooks/${frm.doc.name}">${frappe.boot.sitename}/hazelnode_webhooks/${frm.doc.name}</a>`,
      "yellow"
    );
  },
});
