import frappe
import json
from hazelnode.nodes import Node


class UpdateDocumentNode(Node):
    """
    Updates an existing Frappe document.
    """

    def execute(self, event=None, params=None, context=None):
        context = context or {}

        doctype = params.get('doctype', '')
        docname = params.get('docname', '')
        field_values_json = params.get('field_values', '{}')

        if not doctype:
            frappe.throw('DocType is required to update a document')

        if not docname:
            frappe.throw('Document name is required to update a document')

        # Render template variables in docname
        docname = frappe.render_template(docname, context)

        # Parse field values
        try:
            if isinstance(field_values_json, str):
                field_values_json = frappe.render_template(field_values_json, context)
                field_values = json.loads(field_values_json)
            else:
                field_values = field_values_json or {}
        except json.JSONDecodeError:
            frappe.throw(f'Invalid JSON in field_values: {field_values_json}')

        # Update the document
        doc = frappe.get_doc(doctype, docname)
        for field, value in field_values.items():
            setattr(doc, field, value)
        doc.save(ignore_permissions=True)

        # Add the updated document to context
        context['updated_doc'] = doc.as_dict()

        return context
