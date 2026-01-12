# Copyright (c) 2024, Build With Hussain and Contributors
# See license.txt

import frappe
from frappe.tests.utils import FrappeTestCase


class TestHazelWorkflow(FrappeTestCase):
	"""
	Comprehensive tests for the Hazel Workflow execution engine.

	Tests cover linear and graph-based execution modes,
	condition node branching, context passing, and error handling.
	"""

	@classmethod
	def setUpClass(cls):
		super().setUpClass()
		# Ensure node types are loaded from fixtures
		cls._ensure_node_types_exist()
		frappe.db.commit()

	@classmethod
	def _ensure_node_types_exist(cls):
		"""Create node types if they don't exist (for test environment)."""
		node_types = [
			{
				'name': 'Set Variable',
				'kind': 'Action',
				'handler_path': 'hazelnode.nodes.actions.set_variable_node.SetVariableNode',
			},
			{
				'name': 'Log',
				'kind': 'Action',
				'handler_path': 'hazelnode.nodes.actions.log_node.LogNode',
			},
			{
				'name': 'Condition',
				'kind': 'Action',
				'handler_path': 'hazelnode.nodes.actions.condition_node.ConditionNode',
			},
			{
				'name': 'Delay',
				'kind': 'Action',
				'handler_path': 'hazelnode.nodes.actions.delay_node.DelayNode',
			},
			{
				'name': 'Create Document',
				'kind': 'Action',
				'handler_path': 'hazelnode.nodes.actions.create_document_node.CreateDocumentNode',
			},
			{
				'name': 'Update Document',
				'kind': 'Action',
				'handler_path': 'hazelnode.nodes.actions.update_document_node.UpdateDocumentNode',
			},
			{
				'name': 'Schedule Event',
				'kind': 'Trigger',
				'handler_path': None,
			},
			{
				'name': 'Document Event',
				'kind': 'Trigger',
				'handler_path': None,
			},
			{
				'name': 'Webhook Listener',
				'kind': 'Trigger',
				'handler_path': None,
			},
		]

		for node_type in node_types:
			if not frappe.db.exists('Hazel Node Type', node_type['name']):
				doc = frappe.get_doc({
					'doctype': 'Hazel Node Type',
					'name': node_type['name'],
					'kind': node_type['kind'],
					'handler_path': node_type['handler_path'],
					'is_standard': 1,
				})
				doc.insert(ignore_permissions=True)

	def setUp(self):
		"""Set up test fixtures before each test method."""
		# Clean up any test workflows from previous runs
		self._cleanup_test_data()

	def tearDown(self):
		"""Clean up after each test."""
		self._cleanup_test_data()

	def _cleanup_test_data(self):
		"""Remove test data created during tests."""
		# Delete test workflows
		for wf in frappe.get_all(
			'Hazel Workflow',
			filters={'title': ['like', 'Test%']},
		):
			frappe.delete_doc(
				'Hazel Workflow', wf.name, force=True
			)

		# Delete test execution logs
		for log in frappe.get_all('Hazel Workflow Execution Log'):
			frappe.delete_doc(
				'Hazel Workflow Execution Log',
				log.name,
				force=True,
			)

		# Delete test ToDo documents
		for todo in frappe.get_all(
			'ToDo',
			filters={'description': ['like', 'Test%']},
		):
			frappe.delete_doc('ToDo', todo.name, force=True)

		frappe.db.commit()

	def _create_workflow(
		self, title, trigger_type, nodes, connections=None
	):
		"""Helper to create a test workflow."""
		workflow = frappe.get_doc({
			'doctype': 'Hazel Workflow',
			'title': title,
			'enabled': 1,
			'trigger_type': trigger_type,
			'trigger_config': '{}',
			'nodes': nodes,
			'connections': connections or [],
		})
		workflow.insert(ignore_permissions=True)
		return workflow

	# ===== LINEAR EXECUTION TESTS =====

	def test_linear_execution_single_node(self):
		"""Test linear execution with a single node."""
		workflow = self._create_workflow(
			title='Test Linear Single Node',
			trigger_type='Schedule Event',
			nodes=[
				{
					'node_id': 'node_1',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'greeting',
						'value': 'Hello World',
					}),
				}
			],
		)

		context = workflow.execute()

		self.assertIsNotNone(context)
		self.assertEqual(context.get('greeting'), 'Hello World')

	def test_linear_execution_multiple_nodes(self):
		"""Test linear execution with multiple nodes in sequence."""
		workflow = self._create_workflow(
			title='Test Linear Multiple Nodes',
			trigger_type='Schedule Event',
			nodes=[
				{
					'node_id': 'node_1',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'step1',
						'value': 'first',
					}),
				},
				{
					'node_id': 'node_2',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'step2',
						'value': 'second',
					}),
				},
				{
					'node_id': 'node_3',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'step3',
						'value': 'third',
					}),
				},
			],
		)

		context = workflow.execute()

		self.assertEqual(context.get('step1'), 'first')
		self.assertEqual(context.get('step2'), 'second')
		self.assertEqual(context.get('step3'), 'third')

	def test_linear_execution_with_initial_context(self):
		"""Test that initial context is passed through linear execution."""
		workflow = self._create_workflow(
			title='Test Linear With Initial Context',
			trigger_type='Schedule Event',
			nodes=[
				{
					'node_id': 'node_1',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'new_var',
						'value': '{{ initial_value }}',
					}),
				}
			],
		)

		context = workflow.execute(
			context={'initial_value': 'from_context'}
		)

		self.assertEqual(context.get('new_var'), 'from_context')
		self.assertEqual(context.get('initial_value'), 'from_context')

	# ===== GRAPH EXECUTION TESTS =====

	def test_graph_execution_simple_chain(self):
		"""Test graph execution with simple node chain."""
		workflow = self._create_workflow(
			title='Test Graph Simple Chain',
			trigger_type='Schedule Event',
			nodes=[
				{
					'node_id': 'node_1',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'first',
						'value': 'step1',
					}),
				},
				{
					'node_id': 'node_2',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'second',
						'value': 'step2',
					}),
				},
			],
			connections=[
				{
					'source_node_id': 'trigger',
					'target_node_id': 'node_1',
					'source_handle': 'default',
				},
				{
					'source_node_id': 'node_1',
					'target_node_id': 'node_2',
					'source_handle': 'default',
				},
			],
		)

		context = workflow.execute()

		self.assertEqual(context.get('first'), 'step1')
		self.assertEqual(context.get('second'), 'step2')

	def test_graph_execution_respects_connections(self):
		"""Test that graph execution only visits connected nodes."""
		workflow = self._create_workflow(
			title='Test Graph Respects Connections',
			trigger_type='Schedule Event',
			nodes=[
				{
					'node_id': 'node_1',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'connected',
						'value': 'yes',
					}),
				},
				{
					'node_id': 'node_2',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'disconnected',
						'value': 'should_not_run',
					}),
				},
			],
			connections=[
				{
					'source_node_id': 'trigger',
					'target_node_id': 'node_1',
					'source_handle': 'default',
				},
				# Note: node_2 is NOT connected
			],
		)

		context = workflow.execute()

		self.assertEqual(context.get('connected'), 'yes')
		self.assertIsNone(context.get('disconnected'))

	def test_graph_execution_prevents_infinite_loops(self):
		"""Test that graph execution prevents infinite loops with visited set."""
		workflow = self._create_workflow(
			title='Test Graph Loop Prevention',
			trigger_type='Schedule Event',
			nodes=[
				{
					'node_id': 'node_1',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'counter',
						'value': 'executed',
					}),
				},
				{
					'node_id': 'node_2',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'second',
						'value': 'also_executed',
					}),
				},
			],
			connections=[
				{
					'source_node_id': 'trigger',
					'target_node_id': 'node_1',
					'source_handle': 'default',
				},
				{
					'source_node_id': 'node_1',
					'target_node_id': 'node_2',
					'source_handle': 'default',
				},
				{
					# Create a loop back to node_1
					'source_node_id': 'node_2',
					'target_node_id': 'node_1',
					'source_handle': 'default',
				},
			],
		)

		# Should complete without hanging
		context = workflow.execute()

		self.assertEqual(context.get('counter'), 'executed')
		self.assertEqual(context.get('second'), 'also_executed')

	# ===== BRANCHING / CONDITION TESTS =====

	def test_condition_node_true_branch(self):
		"""Test condition node routes to true branch."""
		workflow = self._create_workflow(
			title='Test Condition True Branch',
			trigger_type='Schedule Event',
			nodes=[
				{
					'node_id': 'condition_node',
					'type': 'Condition',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'left_operand': '9',
						'operator': 'greater_than',
						'right_operand': '5',
					}),
				},
				{
					'node_id': 'true_node',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'result',
						'value': 'took_true_path',
					}),
				},
				{
					'node_id': 'false_node',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'result',
						'value': 'took_false_path',
					}),
				},
			],
			connections=[
				{
					'source_node_id': 'trigger',
					'target_node_id': 'condition_node',
					'source_handle': 'default',
				},
				{
					'source_node_id': 'condition_node',
					'target_node_id': 'true_node',
					'source_handle': 'true',
				},
				{
					'source_node_id': 'condition_node',
					'target_node_id': 'false_node',
					'source_handle': 'false',
				},
			],
		)

		context = workflow.execute()

		self.assertEqual(context.get('result'), 'took_true_path')

	def test_condition_node_false_branch(self):
		"""Test condition node routes to false branch."""
		workflow = self._create_workflow(
			title='Test Condition False Branch',
			trigger_type='Schedule Event',
			nodes=[
				{
					'node_id': 'condition_node',
					'type': 'Condition',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'left_operand': '5',
						'operator': 'greater_than',
						'right_operand': '9',
					}),
				},
				{
					'node_id': 'true_node',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'result',
						'value': 'took_true_path',
					}),
				},
				{
					'node_id': 'false_node',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'result',
						'value': 'took_false_path',
					}),
				},
			],
			connections=[
				{
					'source_node_id': 'trigger',
					'target_node_id': 'condition_node',
					'source_handle': 'default',
				},
				{
					'source_node_id': 'condition_node',
					'target_node_id': 'true_node',
					'source_handle': 'true',
				},
				{
					'source_node_id': 'condition_node',
					'target_node_id': 'false_node',
					'source_handle': 'false',
				},
			],
		)

		context = workflow.execute()

		self.assertEqual(context.get('result'), 'took_false_path')

	def test_condition_with_context_variables(self):
		"""Test condition node resolves variables from context."""
		workflow = self._create_workflow(
			title='Test Condition Context Variables',
			trigger_type='Schedule Event',
			nodes=[
				{
					'node_id': 'set_value',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'score',
						'value': '9',
					}),
				},
				{
					'node_id': 'condition_node',
					'type': 'Condition',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'left_operand': '{{ score }}',
						'operator': 'greater_than',
						'right_operand': '5',
					}),
				},
				{
					'node_id': 'high_score',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'message',
						'value': 'High score!',
					}),
				},
			],
			connections=[
				{
					'source_node_id': 'trigger',
					'target_node_id': 'set_value',
					'source_handle': 'default',
				},
				{
					'source_node_id': 'set_value',
					'target_node_id': 'condition_node',
					'source_handle': 'default',
				},
				{
					'source_node_id': 'condition_node',
					'target_node_id': 'high_score',
					'source_handle': 'true',
				},
			],
		)

		context = workflow.execute()

		self.assertEqual(context.get('message'), 'High score!')

	def test_nested_conditions(self):
		"""Test multiple nested condition nodes."""
		workflow = self._create_workflow(
			title='Test Nested Conditions',
			trigger_type='Schedule Event',
			nodes=[
				{
					'node_id': 'condition_1',
					'type': 'Condition',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'left_operand': '9',
						'operator': 'greater_than',
						'right_operand': '5',
					}),
				},
				{
					'node_id': 'condition_2',
					'type': 'Condition',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'left_operand': '8',
						'operator': 'greater_than',
						'right_operand': '4',
					}),
				},
				{
					'node_id': 'final_node',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'result',
						'value': 'both_conditions_true',
					}),
				},
			],
			connections=[
				{
					'source_node_id': 'trigger',
					'target_node_id': 'condition_1',
					'source_handle': 'default',
				},
				{
					'source_node_id': 'condition_1',
					'target_node_id': 'condition_2',
					'source_handle': 'true',
				},
				{
					'source_node_id': 'condition_2',
					'target_node_id': 'final_node',
					'source_handle': 'true',
				},
			],
		)

		context = workflow.execute()

		self.assertEqual(context.get('result'), 'both_conditions_true')

	# ===== CONTEXT PASSING TESTS =====

	def test_context_accumulation(self):
		"""Test context accumulates values across multiple nodes."""
		workflow = self._create_workflow(
			title='Test Context Accumulation',
			trigger_type='Schedule Event',
			nodes=[
				{
					'node_id': 'node_1',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'a',
						'value': '1',
					}),
				},
				{
					'node_id': 'node_2',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'b',
						'value': '2',
					}),
				},
				{
					'node_id': 'node_3',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'c',
						'value': '3',
					}),
				},
			],
			connections=[
				{
					'source_node_id': 'trigger',
					'target_node_id': 'node_1',
					'source_handle': 'default',
				},
				{
					'source_node_id': 'node_1',
					'target_node_id': 'node_2',
					'source_handle': 'default',
				},
				{
					'source_node_id': 'node_2',
					'target_node_id': 'node_3',
					'source_handle': 'default',
				},
			],
		)

		context = workflow.execute()

		self.assertEqual(context.get('a'), '1')
		self.assertEqual(context.get('b'), '2')
		self.assertEqual(context.get('c'), '3')

	def test_context_template_rendering(self):
		"""Test template variables are rendered with context values."""
		workflow = self._create_workflow(
			title='Test Template Rendering',
			trigger_type='Schedule Event',
			nodes=[
				{
					'node_id': 'node_1',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'name',
						'value': 'Alice',
					}),
				},
				{
					'node_id': 'node_2',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'greeting',
						'value': 'Hello, {{ name }}!',
					}),
				},
			],
			connections=[
				{
					'source_node_id': 'trigger',
					'target_node_id': 'node_1',
					'source_handle': 'default',
				},
				{
					'source_node_id': 'node_1',
					'target_node_id': 'node_2',
					'source_handle': 'default',
				},
			],
		)

		context = workflow.execute()

		self.assertEqual(context.get('greeting'), 'Hello, Alice!')

	def test_context_variable_overwriting(self):
		"""Test that later nodes can overwrite earlier context values."""
		workflow = self._create_workflow(
			title='Test Variable Overwriting',
			trigger_type='Schedule Event',
			nodes=[
				{
					'node_id': 'node_1',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'value',
						'value': 'original',
					}),
				},
				{
					'node_id': 'node_2',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'value',
						'value': 'updated',
					}),
				},
			],
			connections=[
				{
					'source_node_id': 'trigger',
					'target_node_id': 'node_1',
					'source_handle': 'default',
				},
				{
					'source_node_id': 'node_1',
					'target_node_id': 'node_2',
					'source_handle': 'default',
				},
			],
		)

		context = workflow.execute()

		self.assertEqual(context.get('value'), 'updated')

	# ===== EXECUTION LOGGING TESTS =====

	def test_execution_log_created(self):
		"""Test that execution creates a log document."""
		workflow = self._create_workflow(
			title='Test Execution Log Created',
			trigger_type='Schedule Event',
			nodes=[
				{
					'node_id': 'node_1',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'test',
						'value': 'value',
					}),
				}
			],
			connections=[
				{
					'source_node_id': 'trigger',
					'target_node_id': 'node_1',
					'source_handle': 'default',
				},
			],
		)

		workflow.execute()

		logs = frappe.get_all(
			'Hazel Workflow Execution Log',
			filters={'workflow': workflow.name},
		)
		self.assertEqual(len(logs), 1)

	def test_execution_log_status_success(self):
		"""Test that successful execution sets status to Success."""
		workflow = self._create_workflow(
			title='Test Execution Log Success',
			trigger_type='Schedule Event',
			nodes=[
				{
					'node_id': 'node_1',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'test',
						'value': 'value',
					}),
				}
			],
			connections=[
				{
					'source_node_id': 'trigger',
					'target_node_id': 'node_1',
					'source_handle': 'default',
				},
			],
		)

		workflow.execute()

		log = frappe.get_last_doc(
			'Hazel Workflow Execution Log',
			filters={'workflow': workflow.name},
		)
		self.assertEqual(log.status, 'Success')

	def test_execution_log_records_initial_context(self):
		"""Test that execution log records initial context."""
		workflow = self._create_workflow(
			title='Test Log Initial Context',
			trigger_type='Schedule Event',
			nodes=[
				{
					'node_id': 'node_1',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'test',
						'value': 'value',
					}),
				}
			],
			connections=[
				{
					'source_node_id': 'trigger',
					'target_node_id': 'node_1',
					'source_handle': 'default',
				},
			],
		)

		initial = {'initial_key': 'initial_value'}
		workflow.execute(context=initial)

		log = frappe.get_last_doc(
			'Hazel Workflow Execution Log',
			filters={'workflow': workflow.name},
		)
		stored_context = frappe.parse_json(log.initial_context)
		self.assertEqual(
			stored_context.get('initial_key'), 'initial_value'
		)

	def test_execution_log_records_node_logs(self):
		"""Test that each node execution is logged."""
		workflow = self._create_workflow(
			title='Test Node Logs',
			trigger_type='Schedule Event',
			nodes=[
				{
					'node_id': 'node_1',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'a',
						'value': '1',
					}),
				},
				{
					'node_id': 'node_2',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'b',
						'value': '2',
					}),
				},
			],
			connections=[
				{
					'source_node_id': 'trigger',
					'target_node_id': 'node_1',
					'source_handle': 'default',
				},
				{
					'source_node_id': 'node_1',
					'target_node_id': 'node_2',
					'source_handle': 'default',
				},
			],
		)

		workflow.execute()

		log = frappe.get_last_doc(
			'Hazel Workflow Execution Log',
			filters={'workflow': workflow.name},
		)
		self.assertEqual(len(log.node_logs), 2)

	# ===== WORKFLOW VALIDATION TESTS =====

	def test_validation_trigger_required(self):
		"""Test that workflow with nodes requires a trigger type."""
		with self.assertRaises(frappe.exceptions.ValidationError):
			frappe.get_doc({
				'doctype': 'Hazel Workflow',
				'title': 'Test No Trigger',
				'enabled': 1,
				'nodes': [
					{
						'node_id': 'node_1',
						'type': 'Set Variable',
						'kind': 'Action',
						'parameters': '{}',
					}
				],
			}).insert(ignore_permissions=True)

	def test_validation_nodes_must_be_action(self):
		"""Test that nodes in workflow must be Action kind."""
		with self.assertRaises(frappe.exceptions.ValidationError):
			frappe.get_doc({
				'doctype': 'Hazel Workflow',
				'title': 'Test Invalid Node Kind',
				'enabled': 1,
				'trigger_type': 'Schedule Event',
				'nodes': [
					{
						'node_id': 'node_1',
						'type': 'Schedule Event',
						'kind': 'Trigger',
						'parameters': '{}',
					}
				],
			}).insert(ignore_permissions=True)

	# ===== HELPER METHOD TESTS =====

	def test_get_node_by_id(self):
		"""Test get_node_by_id returns correct node."""
		workflow = self._create_workflow(
			title='Test Get Node By ID',
			trigger_type='Schedule Event',
			nodes=[
				{
					'node_id': 'node_1',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': '{}',
				},
				{
					'node_id': 'node_2',
					'type': 'Log',
					'kind': 'Action',
					'parameters': '{}',
				},
			],
		)

		node = workflow.get_node_by_id('node_2')
		self.assertIsNotNone(node)
		self.assertEqual(node.type, 'Log')

	def test_get_node_by_id_returns_none_for_invalid_id(self):
		"""Test get_node_by_id returns None for non-existent ID."""
		workflow = self._create_workflow(
			title='Test Get Node By ID Invalid',
			trigger_type='Schedule Event',
			nodes=[
				{
					'node_id': 'node_1',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': '{}',
				}
			],
		)

		node = workflow.get_node_by_id('nonexistent')
		self.assertIsNone(node)

	def test_get_outgoing_connections(self):
		"""Test get_outgoing_connections returns correct connections."""
		workflow = self._create_workflow(
			title='Test Get Outgoing Connections',
			trigger_type='Schedule Event',
			nodes=[
				{
					'node_id': 'node_1',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': '{}',
				},
				{
					'node_id': 'node_2',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': '{}',
				},
			],
			connections=[
				{
					'source_node_id': 'trigger',
					'target_node_id': 'node_1',
					'source_handle': 'default',
				},
				{
					'source_node_id': 'node_1',
					'target_node_id': 'node_2',
					'source_handle': 'default',
				},
			],
		)

		connections = workflow.get_outgoing_connections('node_1')
		self.assertEqual(len(connections), 1)
		self.assertEqual(connections[0].target_node_id, 'node_2')

	def test_get_outgoing_connections_with_handle_filter(self):
		"""Test get_outgoing_connections filters by handle."""
		workflow = self._create_workflow(
			title='Test Get Outgoing With Handle',
			trigger_type='Schedule Event',
			nodes=[
				{
					'node_id': 'condition',
					'type': 'Condition',
					'kind': 'Action',
					'parameters': '{}',
				},
				{
					'node_id': 'true_node',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': '{}',
				},
				{
					'node_id': 'false_node',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': '{}',
				},
			],
			connections=[
				{
					'source_node_id': 'trigger',
					'target_node_id': 'condition',
					'source_handle': 'default',
				},
				{
					'source_node_id': 'condition',
					'target_node_id': 'true_node',
					'source_handle': 'true',
				},
				{
					'source_node_id': 'condition',
					'target_node_id': 'false_node',
					'source_handle': 'false',
				},
			],
		)

		true_connections = workflow.get_outgoing_connections(
			'condition', 'true'
		)
		false_connections = workflow.get_outgoing_connections(
			'condition', 'false'
		)

		self.assertEqual(len(true_connections), 1)
		self.assertEqual(true_connections[0].target_node_id, 'true_node')
		self.assertEqual(len(false_connections), 1)
		self.assertEqual(
			false_connections[0].target_node_id, 'false_node'
		)

	def test_get_start_node(self):
		"""Test get_start_node returns node connected from trigger."""
		workflow = self._create_workflow(
			title='Test Get Start Node',
			trigger_type='Schedule Event',
			nodes=[
				{
					'node_id': 'first_node',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': '{}',
				},
				{
					'node_id': 'second_node',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': '{}',
				},
			],
			connections=[
				{
					'source_node_id': 'trigger',
					'target_node_id': 'first_node',
					'source_handle': 'default',
				},
			],
		)

		start_node = workflow.get_start_node()
		self.assertEqual(start_node.node_id, 'first_node')

	def test_get_start_node_fallback(self):
		"""Test get_start_node falls back to first node without connections."""
		workflow = self._create_workflow(
			title='Test Get Start Node Fallback',
			trigger_type='Schedule Event',
			nodes=[
				{
					'node_id': 'first_node',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': '{}',
				}
			],
		)

		start_node = workflow.get_start_node()
		self.assertEqual(start_node.node_id, 'first_node')

	# ===== COMPLEX WORKFLOW TESTS =====

	def test_complex_workflow_with_logging(self):
		"""Test complex workflow with Set Variable and Log nodes."""
		workflow = self._create_workflow(
			title='Test Complex With Logging',
			trigger_type='Schedule Event',
			nodes=[
				{
					'node_id': 'set_name',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'user_name',
						'value': 'TestUser',
					}),
				},
				{
					'node_id': 'log_welcome',
					'type': 'Log',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'message': 'Welcome, {{ user_name }}!',
						'log_level': 'Info',
					}),
				},
				{
					'node_id': 'set_status',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'status',
						'value': 'completed',
					}),
				},
			],
			connections=[
				{
					'source_node_id': 'trigger',
					'target_node_id': 'set_name',
					'source_handle': 'default',
				},
				{
					'source_node_id': 'set_name',
					'target_node_id': 'log_welcome',
					'source_handle': 'default',
				},
				{
					'source_node_id': 'log_welcome',
					'target_node_id': 'set_status',
					'source_handle': 'default',
				},
			],
		)

		context = workflow.execute()

		self.assertEqual(context.get('user_name'), 'TestUser')
		self.assertEqual(context.get('status'), 'completed')
		self.assertIn('logs', context)
		self.assertEqual(len(context['logs']), 1)
		self.assertEqual(
			context['logs'][0]['message'], 'Welcome, TestUser!'
		)

	def test_multi_branch_workflow(self):
		"""Test workflow with multiple branches converging."""
		workflow = self._create_workflow(
			title='Test Multi Branch',
			trigger_type='Schedule Event',
			nodes=[
				{
					'node_id': 'init',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'value',
						'value': '9',
					}),
				},
				{
					'node_id': 'check_high',
					'type': 'Condition',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'left_operand': '{{ value }}',
						'operator': 'greater_than',
						'right_operand': '5',
					}),
				},
				{
					'node_id': 'high_value',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'category',
						'value': 'high',
					}),
				},
				{
					'node_id': 'low_value',
					'type': 'Set Variable',
					'kind': 'Action',
					'parameters': frappe.as_json({
						'variable_name': 'category',
						'value': 'low',
					}),
				},
			],
			connections=[
				{
					'source_node_id': 'trigger',
					'target_node_id': 'init',
					'source_handle': 'default',
				},
				{
					'source_node_id': 'init',
					'target_node_id': 'check_high',
					'source_handle': 'default',
				},
				{
					'source_node_id': 'check_high',
					'target_node_id': 'high_value',
					'source_handle': 'true',
				},
				{
					'source_node_id': 'check_high',
					'target_node_id': 'low_value',
					'source_handle': 'false',
				},
			],
		)

		context = workflow.execute()

		self.assertEqual(context.get('category'), 'high')

	# ===== ERROR HANDLING TESTS =====

	def test_execution_handles_exception(self):
		"""Test that execution handles exceptions gracefully."""
		workflow = self._create_workflow(
			title='Test Exception Handling',
			trigger_type='Schedule Event',
			nodes=[
				{
					'node_id': 'node_1',
					'type': 'Create Document',
					'kind': 'Action',
					# Missing required doctype
					'parameters': frappe.as_json({}),
				}
			],
			connections=[
				{
					'source_node_id': 'trigger',
					'target_node_id': 'node_1',
					'source_handle': 'default',
				},
			],
		)

		# Should not raise by default
		workflow.execute()

		log = frappe.get_last_doc(
			'Hazel Workflow Execution Log',
			filters={'workflow': workflow.name},
		)
		self.assertEqual(log.status, 'Failure')
		self.assertIsNotNone(log.traceback)

	def test_execution_raises_exception_when_requested(self):
		"""Test that execution can raise exceptions if requested."""
		workflow = self._create_workflow(
			title='Test Raise Exception',
			trigger_type='Schedule Event',
			nodes=[
				{
					'node_id': 'node_1',
					'type': 'Create Document',
					'kind': 'Action',
					'parameters': frappe.as_json({}),
				}
			],
			connections=[
				{
					'source_node_id': 'trigger',
					'target_node_id': 'node_1',
					'source_handle': 'default',
				},
			],
		)

		with self.assertRaises(Exception):
			workflow.execute(raise_exception=True)

	def test_empty_workflow_execution(self):
		"""Test workflow with no nodes executes without error."""
		workflow = frappe.get_doc({
			'doctype': 'Hazel Workflow',
			'title': 'Test Empty Workflow',
			'enabled': 1,
		})
		workflow.insert(ignore_permissions=True)

		# Should not raise
		context = workflow.execute()
		self.assertIsNone(context)
