import frappe

from hazelnode.nodes import Node


class EmailNode(Node):
	def execute(self, event, params=None, context=None):
		# TODO: frappe.sendmail()
		pass
