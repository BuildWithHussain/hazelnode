import frappe
from hazelnode.nodes import Node
from hazelnode.nodes.utils import (
    parse_json_field,
    render_template_field,
    ensure_context,
)


class UpdateDocumentNode(Node):
    """Updates an existing Frappe document."""

    def execute(self, event=None, params=None, context=None):
        context = ensure_context(context)
        params = params or {}

        doctype = params.get('doctype', '')
        docname = params.get('docname', '')

        if not doctype:
            frappe.throw('DocType is required to update a document')

        if not docname:
            frappe.throw('Document name is required to update a document')

        # Render template variables in docname
        docname = render_template_field(docname, context)

        field_values = parse_json_field(
            params.get('field_values', '{}'),
            context,
            'field_values'
        )

        doc = frappe.get_doc(doctype, docname)
        for field, value in field_values.items():
            setattr(doc, field, value)
        doc.save(ignore_permissions=True)

        context['updated_doc'] = doc.as_dict()

        return context
