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

        # Check permissions before updating document
        ignore_permissions = params.get('ignore_permissions', False)
        if not ignore_permissions and not frappe.has_permission(doctype, 'write'):
            frappe.throw(f'No permission to update {doctype}')

        field_values = parse_json_field(
            params.get('field_values', '{}'),
            context,
            'field_values'
        )

        doc = frappe.get_doc(doctype, docname)
        for field, value in field_values.items():
            setattr(doc, field, value)
        doc.save(ignore_permissions=ignore_permissions)

        context['updated_doc'] = doc.as_dict()

        return context
