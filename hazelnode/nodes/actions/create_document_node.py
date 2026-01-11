import frappe
from hazelnode.nodes import Node
from hazelnode.nodes.utils import parse_json_field, ensure_context


class CreateDocumentNode(Node):
    """Creates a new Frappe document."""

    def execute(self, event=None, params=None, context=None):
        context = ensure_context(context)
        params = params or {}

        doctype = params.get('doctype', '')
        if not doctype:
            frappe.throw('DocType is required to create a document')

        field_values = parse_json_field(
            params.get('field_values', '{}'),
            context,
            'field_values'
        )

        doc = frappe.get_doc({
            'doctype': doctype,
            **field_values
        })
        doc.insert(ignore_permissions=True)

        context['created_doc'] = doc.as_dict()
        context['created_doc_name'] = doc.name

        return context
