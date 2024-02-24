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

	def execute(self, context=None, raise_exception=False):
		execution_log = frappe.new_doc('Hazel Workflow Execution Log')
		execution_log.workflow = self.name
		execution_log.status = 'Running'
		execution_log.trigger_type = self.trigger_type
		execution_log.trigger_config = self.trigger_config
		execution_log.initial_context = frappe.as_json(context)
		execution_log.insert(ignore_permissions=True)

		try:
			frappe.db.savepoint('workflow_execution_start')
			for node in self.nodes:
				print('executing: ', node, node.type, node.event)
				parameters = frappe.parse_json(node.parameters)
				output = node.execute(parameters, context)
				execution_log.append(
					'node_logs',
					{
						'node_type': node.type,
						'event': node.event,
						'context': frappe.as_json(context),
						'params': node.parameters,
						'output': output,
					},
				)
				execution_log.save(ignore_permissions=True)
				context = output

			execution_log.db_set('status', 'Success')
		except Exception:
			frappe.db.rollback(save_point='workflow_execution_start')
			execution_log.db_set('status', 'Failure')
			execution_log.db_set('traceback', frappe.get_traceback())
		finally:
			execution_log.reload()
			execution_log.submit()

			if execution_log.status == 'Failure' and raise_exception:
				raise
