import frappe

from hazelnode.nodes import Node


class EmailNode(Node):
	def execute(self, params=None, context=None):
		return frappe.sendmail(
			subject=params.get('subject'),
			recipient=params.get('recipient'),
			message=frappe.render_template(
				params.get('message'), context
			),
		)
