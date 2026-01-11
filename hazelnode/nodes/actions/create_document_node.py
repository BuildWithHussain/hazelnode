import frappe
import json
from hazelnode.nodes import Node


class CreateDocumentNode(Node):
    """
    Creates a new Frappe document.
    """

    def execute(self, event=None, params=None, context=None):
        context = context or {}

        doctype = params.get('doctype', '')
        field_values_json = params.get('field_values', '{}')

        if not doctype:
            frappe.throw('DocType is required to create a document')

        # Parse field values - support JSON or simple key=value format
        try:
            if isinstance(field_values_json, str):
                # Render template variables
                field_values_json = frappe.render_template(field_values_json, context)
                field_values = json.loads(field_values_json)
            else:
                field_values = field_values_json or {}
        except json.JSONDecodeError:
            frappe.throw(f'Invalid JSON in field_values: {field_values_json}')

        # Create the document
        doc = frappe.get_doc({
            'doctype': doctype,
            **field_values
        })
        doc.insert(ignore_permissions=True)

        # Add the created document to context
        context['created_doc'] = doc.as_dict()
        context['created_doc_name'] = doc.name

        return context
