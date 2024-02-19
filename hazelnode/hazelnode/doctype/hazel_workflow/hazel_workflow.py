# Copyright (c) 2024, Build With Hussain and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class HazelWorkflow(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		from hazelnode.hazelnode.doctype.hazel_node.hazel_node import (
			HazelNode,
		)

		enabled: DF.Check
		name: DF.Int | None
		nodes: DF.Table[HazelNode]
		title: DF.Data
		trigger_config: DF.JSON | None
		trigger_type: DF.Link | None
	# end: auto-generated types

	def validate(self):
		self.validate_nodes()

	def validate_nodes(self):
		self.validate_trigger_is_required()

		for i, node in enumerate(self.nodes):
			if not node.kind == 'Action':
				frappe.throw(
					f'Node {frappe.bold(node.type)}, on row #{i+1} must be an action node!'
				)

	def validate_trigger_is_required(self):
		if len(self.nodes) > 0 and not self.trigger_type:
			frappe.throw('Trigger is required for the workflow!')

	def execute(self, context=None):
		if not self.enabled:
			return

		execution_log = frappe.new_doc('Hazel Workflow Execution Log')
		execution_log.workflow = self.name
		# execution_log.status = "Running"

		try:
			for node in self.nodes:
				print('executing: ', node, node.type, node.event)
				parameters = frappe.parse_json(node.parameters)
				context = node.execute(parameters, context)
			execution_log.status = 'Success'
		except Exception:
			execution_log.status = 'Failure'
		finally:
			execution_log.insert(ignore_permissions=True)
			execution_log.submit()
