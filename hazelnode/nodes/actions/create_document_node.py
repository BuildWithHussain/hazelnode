import frappe

from hazelnode.nodes import Node
from hazelnode.nodes.utils import ensure_context, parse_json_field


class CreateDocumentNode(Node):
	"""Creates a new Frappe document."""

	def execute(self, event=None, params=None, context=None):
		context = ensure_context(context)
		params = params or {}

		doctype = params.get('doctype', '')
		if not doctype:
			frappe.throw('DocType is required to create a document')

		# Check permissions before creating document
		ignore_permissions = params.get('ignore_permissions', False)
		if not ignore_permissions and not frappe.has_permission(
			doctype, 'create'
		):
			frappe.throw(f'No permission to create {doctype}')

		field_values = parse_json_field(
			params.get('field_values', '{}'), context, 'field_values'
		)

		doc = frappe.get_doc({'doctype': doctype, **field_values})
		doc.insert(ignore_permissions=ignore_permissions)

		context['created_doc'] = doc.as_dict()
		context['created_doc_name'] = doc.name

		return context
