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
		from hazelnode.hazelnode.doctype.hazel_node_connection.hazel_node_connection import (
			HazelNodeConnection,
		)

		connections: DF.Table[HazelNodeConnection]
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

	def get_node_by_id(self, node_id):
		"""Get a node by its node_id."""
		for node in self.nodes:
			if node.node_id == node_id:
				return node
		return None

	def get_outgoing_connections(self, node_id, handle=None):
		"""Get all outgoing connections from a node, optionally filtered by handle."""
		connections = []
		for conn in self.connections:
			if conn.source_node_id == node_id:
				if handle is None or conn.source_handle == handle:
					connections.append(conn)
		return connections

	def get_start_node(self):
		"""Get the first node after trigger (connected from trigger)."""
		# Find the node connected from trigger
		trigger_connections = self.get_outgoing_connections('trigger')
		if trigger_connections:
			return self.get_node_by_id(
				trigger_connections[0].target_node_id
			)
		# Fallback to first node in array for backward compatibility
		return self.nodes[0] if self.nodes else None

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

			# Use graph-based execution if connections exist
			if self.connections:
				context = self._execute_graph(context, execution_log)
			else:
				# Fallback to linear execution for backward compatibility
				context = self._execute_linear(context, execution_log)

			execution_log.db_set('status', 'Success')
		except Exception:
			frappe.db.rollback(save_point='workflow_execution_start')
			execution_log.db_set('status', 'Failure')
			execution_log.db_set('traceback', frappe.get_traceback())
			if raise_exception:
				raise

		return context

	def _execute_linear(self, context, execution_log):
		"""Execute nodes in linear order (backward compatibility)."""
		for node in self.nodes:
			context = self._execute_node(node, context, execution_log)
		return context

	def _execute_graph(self, context, execution_log):
		"""Execute nodes following the connection graph."""
		visited = set()
		current_node = self.get_start_node()

		while current_node and current_node.node_id not in visited:
			visited.add(current_node.node_id)
			result = self._execute_node(
				current_node, context, execution_log
			)

			# Determine next node based on result
			next_node_id = self._get_next_node_id(
				current_node, result
			)
			if next_node_id:
				current_node = self.get_node_by_id(next_node_id)
				context = result
			else:
				current_node = None
				context = result

		return context

	def _execute_node(self, node, context, execution_log):
		"""Execute a single node and log the result."""
		parameters = frappe.parse_json(node.parameters)
		output = node.execute(parameters, context)
		execution_log.append(
			'node_logs',
			{
				'node_type': node.type,
				'event': node.event,
				'context': frappe.as_json(context),
				'params': node.parameters,
				'output': frappe.as_json(output),
			},
		)
		execution_log.save(ignore_permissions=True)
		return output

	def _get_next_node_id(self, current_node, result):
		"""Get the next node ID based on the current node type and result."""
		# Check if this is a condition node
		node_type = frappe.db.get_value(
			'Hazel Node Type', current_node.type, 'kind'
		)

		# For condition nodes, check the branch in result
		if isinstance(result, dict) and 'branch' in result:
			branch = result.get('branch')
			if branch in ('true', 'false'):
				connections = self.get_outgoing_connections(
					current_node.node_id, branch
				)
				if connections:
					return connections[0].target_node_id

		# Default: follow the 'default' connection
		connections = self.get_outgoing_connections(
			current_node.node_id, 'default'
		)
		if connections:
			return connections[0].target_node_id

		return None
