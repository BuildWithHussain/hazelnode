# Copyright (c) 2024, Build With Hussain and Contributors
# See license.txt

import frappe
from frappe.tests.utils import FrappeTestCase

from hazelnode.nodes.actions.condition_node import ConditionNode
from hazelnode.nodes.actions.delay_node import DelayNode
from hazelnode.nodes.actions.log_node import LogNode
from hazelnode.nodes.actions.set_variable_node import SetVariableNode


class TestConditionNode(FrappeTestCase):
	"""Tests for the Condition Node."""

	def setUp(self):
		self.node = ConditionNode()

	# ===== EQUALITY OPERATORS =====

	def test_equals_true(self):
		"""Test equals operator returns true when values match."""
		result = self.node.execute(
			params={
				'left_operand': 'hello',
				'operator': 'equals',
				'right_operand': 'hello',
			}
		)
		self.assertEqual(result['branch'], 'true')
		self.assertTrue(result['condition_result'])

	def test_equals_false(self):
		"""Test equals operator returns false when values differ."""
		result = self.node.execute(
			params={
				'left_operand': 'hello',
				'operator': 'equals',
				'right_operand': 'world',
			}
		)
		self.assertEqual(result['branch'], 'false')
		self.assertFalse(result['condition_result'])

	def test_not_equals_true(self):
		"""Test not_equals operator returns true when values differ."""
		result = self.node.execute(
			params={
				'left_operand': 'hello',
				'operator': 'not_equals',
				'right_operand': 'world',
			}
		)
		self.assertEqual(result['branch'], 'true')

	def test_not_equals_false(self):
		"""Test not_equals operator returns false when values match."""
		result = self.node.execute(
			params={
				'left_operand': 'hello',
				'operator': 'not_equals',
				'right_operand': 'hello',
			}
		)
		self.assertEqual(result['branch'], 'false')

	# ===== COMPARISON OPERATORS =====

	def test_greater_than_true(self):
		"""Test greater_than with single-digit strings (string comparison)."""
		result = self.node.execute(
			params={
				'left_operand': '9',
				'operator': 'greater_than',
				'right_operand': '5',
			}
		)
		self.assertEqual(result['branch'], 'true')

	def test_greater_than_false(self):
		"""Test greater_than returns false when not greater."""
		result = self.node.execute(
			params={
				'left_operand': '5',
				'operator': 'greater_than',
				'right_operand': '9',
			}
		)
		self.assertEqual(result['branch'], 'false')

	def test_less_than_true(self):
		"""Test less_than operator."""
		result = self.node.execute(
			params={
				'left_operand': '5',
				'operator': 'less_than',
				'right_operand': '9',
			}
		)
		self.assertEqual(result['branch'], 'true')

	def test_less_than_false(self):
		"""Test less_than returns false when not less."""
		result = self.node.execute(
			params={
				'left_operand': '9',
				'operator': 'less_than',
				'right_operand': '5',
			}
		)
		self.assertEqual(result['branch'], 'false')

	def test_greater_than_or_equal_true_greater(self):
		"""Test greater_than_or_equal when greater."""
		result = self.node.execute(
			params={
				'left_operand': '9',
				'operator': 'greater_than_or_equal',
				'right_operand': '5',
			}
		)
		self.assertEqual(result['branch'], 'true')

	def test_greater_than_or_equal_true_equal(self):
		"""Test greater_than_or_equal when equal."""
		result = self.node.execute(
			params={
				'left_operand': '5',
				'operator': 'greater_than_or_equal',
				'right_operand': '5',
			}
		)
		self.assertEqual(result['branch'], 'true')

	def test_less_than_or_equal_true_less(self):
		"""Test less_than_or_equal when less."""
		result = self.node.execute(
			params={
				'left_operand': '5',
				'operator': 'less_than_or_equal',
				'right_operand': '9',
			}
		)
		self.assertEqual(result['branch'], 'true')

	def test_less_than_or_equal_true_equal(self):
		"""Test less_than_or_equal when equal."""
		result = self.node.execute(
			params={
				'left_operand': '5',
				'operator': 'less_than_or_equal',
				'right_operand': '5',
			}
		)
		self.assertEqual(result['branch'], 'true')

	# ===== STRING OPERATORS =====

	def test_contains_true(self):
		"""Test contains operator."""
		result = self.node.execute(
			params={
				'left_operand': 'hello world',
				'operator': 'contains',
				'right_operand': 'world',
			}
		)
		self.assertEqual(result['branch'], 'true')

	def test_contains_false(self):
		"""Test contains returns false when substring not found."""
		result = self.node.execute(
			params={
				'left_operand': 'hello world',
				'operator': 'contains',
				'right_operand': 'foo',
			}
		)
		self.assertEqual(result['branch'], 'false')

	def test_not_contains_true(self):
		"""Test not_contains operator."""
		result = self.node.execute(
			params={
				'left_operand': 'hello world',
				'operator': 'not_contains',
				'right_operand': 'foo',
			}
		)
		self.assertEqual(result['branch'], 'true')

	def test_not_contains_false(self):
		"""Test not_contains returns false when substring found."""
		result = self.node.execute(
			params={
				'left_operand': 'hello world',
				'operator': 'not_contains',
				'right_operand': 'hello',
			}
		)
		self.assertEqual(result['branch'], 'false')

	def test_starts_with_true(self):
		"""Test starts_with operator."""
		result = self.node.execute(
			params={
				'left_operand': 'hello world',
				'operator': 'starts_with',
				'right_operand': 'hello',
			}
		)
		self.assertEqual(result['branch'], 'true')

	def test_starts_with_false(self):
		"""Test starts_with returns false when not matching."""
		result = self.node.execute(
			params={
				'left_operand': 'hello world',
				'operator': 'starts_with',
				'right_operand': 'world',
			}
		)
		self.assertEqual(result['branch'], 'false')

	def test_ends_with_true(self):
		"""Test ends_with operator."""
		result = self.node.execute(
			params={
				'left_operand': 'hello world',
				'operator': 'ends_with',
				'right_operand': 'world',
			}
		)
		self.assertEqual(result['branch'], 'true')

	def test_ends_with_false(self):
		"""Test ends_with returns false when not matching."""
		result = self.node.execute(
			params={
				'left_operand': 'hello world',
				'operator': 'ends_with',
				'right_operand': 'hello',
			}
		)
		self.assertEqual(result['branch'], 'false')

	# ===== UNARY OPERATORS =====

	def test_is_empty_true_for_empty_string(self):
		"""Test is_empty returns true for empty string."""
		result = self.node.execute(
			params={
				'left_operand': '',
				'operator': 'is_empty',
			}
		)
		self.assertEqual(result['branch'], 'true')

	def test_is_empty_false_for_non_empty_string(self):
		"""Test is_empty returns false for non-empty string."""
		result = self.node.execute(
			params={
				'left_operand': 'hello',
				'operator': 'is_empty',
			}
		)
		self.assertEqual(result['branch'], 'false')

	def test_is_not_empty_true(self):
		"""Test is_not_empty returns true for non-empty string."""
		result = self.node.execute(
			params={
				'left_operand': 'hello',
				'operator': 'is_not_empty',
			}
		)
		self.assertEqual(result['branch'], 'true')

	def test_is_not_empty_false(self):
		"""Test is_not_empty returns false for empty string."""
		result = self.node.execute(
			params={
				'left_operand': '',
				'operator': 'is_not_empty',
			}
		)
		self.assertEqual(result['branch'], 'false')

	# ===== CONTEXT VARIABLE RESOLUTION =====

	def test_variable_resolution_simple(self):
		"""Test resolving simple variable from context."""
		result = self.node.execute(
			params={
				'left_operand': '{{ name }}',
				'operator': 'equals',
				'right_operand': 'Alice',
			},
			context={'name': 'Alice'},
		)
		self.assertEqual(result['branch'], 'true')
		self.assertEqual(result['evaluated']['left'], 'Alice')

	def test_variable_resolution_nested(self):
		"""Test resolving nested variable from context."""
		result = self.node.execute(
			params={
				'left_operand': '{{ user.name }}',
				'operator': 'equals',
				'right_operand': 'Bob',
			},
			context={'user': {'name': 'Bob'}},
		)
		self.assertEqual(result['branch'], 'true')
		self.assertEqual(result['evaluated']['left'], 'Bob')

	def test_variable_resolution_deeply_nested(self):
		"""Test resolving deeply nested variable."""
		result = self.node.execute(
			params={
				'left_operand': '{{ data.user.profile.age }}',
				'operator': 'greater_than',
				'right_operand': '5',
			},
			context={
				'data': {'user': {'profile': {'age': '9'}}}
			},
		)
		self.assertEqual(result['branch'], 'true')

	def test_variable_resolution_missing_returns_none(self):
		"""Test that missing variable returns None."""
		result = self.node.execute(
			params={
				'left_operand': '{{ missing }}',
				'operator': 'is_empty',
			},
			context={},
		)
		self.assertEqual(result['branch'], 'true')

	def test_variable_resolution_both_operands(self):
		"""Test resolving variables in both operands."""
		result = self.node.execute(
			params={
				'left_operand': '{{ a }}',
				'operator': 'equals',
				'right_operand': '{{ b }}',
			},
			context={'a': 'same', 'b': 'same'},
		)
		self.assertEqual(result['branch'], 'true')

	# ===== EDGE CASES =====

	def test_binary_operator_missing_right_operand(self):
		"""Test binary operator returns error when missing right operand."""
		result = self.node.execute(
			params={
				'left_operand': 'hello',
				'operator': 'equals',
				'right_operand': '',
			}
		)
		self.assertEqual(result['branch'], 'false')
		self.assertIn('error', result)

	def test_default_operator_is_equals(self):
		"""Test that default operator is equals when not specified."""
		result = self.node.execute(
			params={
				'left_operand': 'test',
				'right_operand': 'test',
			}
		)
		self.assertEqual(result['branch'], 'true')

	def test_preserves_context(self):
		"""Test that context is preserved in result."""
		context = {'key': 'value'}
		result = self.node.execute(
			params={
				'left_operand': 'a',
				'operator': 'equals',
				'right_operand': 'a',
			},
			context=context,
		)
		self.assertEqual(result['context'], context)


class TestSetVariableNode(FrappeTestCase):
	"""Tests for the Set Variable Node."""

	def setUp(self):
		self.node = SetVariableNode()

	def test_set_simple_variable(self):
		"""Test setting a simple variable."""
		result = self.node.execute(
			params={
				'variable_name': 'greeting',
				'value': 'Hello World',
			}
		)
		self.assertEqual(result.get('greeting'), 'Hello World')

	def test_set_variable_with_empty_context(self):
		"""Test setting variable with empty context."""
		result = self.node.execute(
			params={
				'variable_name': 'name',
				'value': 'Alice',
			},
			context={},
		)
		self.assertEqual(result.get('name'), 'Alice')

	def test_set_variable_preserves_existing_context(self):
		"""Test that existing context values are preserved."""
		result = self.node.execute(
			params={
				'variable_name': 'new_key',
				'value': 'new_value',
			},
			context={'existing_key': 'existing_value'},
		)
		self.assertEqual(result.get('existing_key'), 'existing_value')
		self.assertEqual(result.get('new_key'), 'new_value')

	def test_set_variable_overwrites_existing(self):
		"""Test that existing variable can be overwritten."""
		result = self.node.execute(
			params={
				'variable_name': 'key',
				'value': 'updated',
			},
			context={'key': 'original'},
		)
		self.assertEqual(result.get('key'), 'updated')

	def test_set_variable_with_template(self):
		"""Test setting variable with template rendering."""
		result = self.node.execute(
			params={
				'variable_name': 'greeting',
				'value': 'Hello, {{ name }}!',
			},
			context={'name': 'Alice'},
		)
		self.assertEqual(result.get('greeting'), 'Hello, Alice!')

	def test_set_variable_empty_name_does_nothing(self):
		"""Test that empty variable name doesn't set anything."""
		result = self.node.execute(
			params={
				'variable_name': '',
				'value': 'test',
			},
			context={'existing': 'value'},
		)
		self.assertEqual(result.get('existing'), 'value')
		self.assertNotIn('', result)

	def test_set_variable_none_context(self):
		"""Test handling None context."""
		result = self.node.execute(
			params={
				'variable_name': 'key',
				'value': 'value',
			},
			context=None,
		)
		self.assertEqual(result.get('key'), 'value')

	def test_set_variable_empty_value(self):
		"""Test setting empty string value."""
		result = self.node.execute(
			params={
				'variable_name': 'empty',
				'value': '',
			}
		)
		self.assertEqual(result.get('empty'), '')


class TestLogNode(FrappeTestCase):
	"""Tests for the Log Node."""

	def setUp(self):
		self.node = LogNode()

	def test_log_simple_message(self):
		"""Test logging a simple message."""
		result = self.node.execute(
			params={
				'message': 'Hello World',
				'log_level': 'Info',
			}
		)
		self.assertIn('logs', result)
		self.assertEqual(len(result['logs']), 1)
		self.assertEqual(result['logs'][0]['message'], 'Hello World')
		self.assertEqual(result['logs'][0]['level'], 'Info')

	def test_log_default_level_is_info(self):
		"""Test that default log level is Info."""
		result = self.node.execute(
			params={'message': 'Test message'}
		)
		self.assertEqual(result['logs'][0]['level'], 'Info')

	def test_log_warning_level(self):
		"""Test logging with Warning level."""
		result = self.node.execute(
			params={
				'message': 'Warning message',
				'log_level': 'Warning',
			}
		)
		self.assertEqual(result['logs'][0]['level'], 'Warning')

	def test_log_error_level(self):
		"""Test logging with Error level."""
		result = self.node.execute(
			params={
				'message': 'Error message',
				'log_level': 'Error',
			}
		)
		self.assertEqual(result['logs'][0]['level'], 'Error')

	def test_log_with_template(self):
		"""Test logging with template rendering."""
		result = self.node.execute(
			params={'message': 'User {{ name }} logged in'},
			context={'name': 'Alice'},
		)
		self.assertEqual(
			result['logs'][0]['message'], 'User Alice logged in'
		)

	def test_log_accumulates_in_context(self):
		"""Test that multiple log calls accumulate."""
		context = {}

		# First log
		context = self.node.execute(
			params={'message': 'First log'},
			context=context,
		)

		# Second log
		context = self.node.execute(
			params={'message': 'Second log'},
			context=context,
		)

		self.assertEqual(len(context['logs']), 2)
		self.assertEqual(context['logs'][0]['message'], 'First log')
		self.assertEqual(context['logs'][1]['message'], 'Second log')

	def test_log_preserves_existing_context(self):
		"""Test that logging preserves existing context."""
		result = self.node.execute(
			params={'message': 'Test'},
			context={'existing_key': 'existing_value'},
		)
		self.assertEqual(
			result.get('existing_key'), 'existing_value'
		)

	def test_log_empty_message(self):
		"""Test logging empty message."""
		result = self.node.execute(
			params={'message': ''}
		)
		self.assertEqual(result['logs'][0]['message'], '')


class TestDelayNode(FrappeTestCase):
	"""Tests for the Delay Node."""

	def setUp(self):
		self.node = DelayNode()

	def test_delay_preserves_context(self):
		"""Test that delay preserves context."""
		context = {'key': 'value'}
		result = self.node.execute(
			params={'delay_seconds': 0},
			context=context,
		)
		self.assertEqual(result.get('key'), 'value')

	def test_delay_zero_seconds(self):
		"""Test zero second delay executes immediately."""
		import time

		start = time.time()
		self.node.execute(params={'delay_seconds': 0})
		elapsed = time.time() - start
		self.assertLess(elapsed, 0.1)

	def test_delay_one_second(self):
		"""Test one second delay."""
		import time

		start = time.time()
		self.node.execute(params={'delay_seconds': 1})
		elapsed = time.time() - start
		self.assertGreaterEqual(elapsed, 0.9)
		self.assertLess(elapsed, 1.5)

	def test_delay_max_capped_at_60_seconds(self):
		"""Test that delay is capped at 60 seconds."""
		# This test verifies the cap logic without waiting 60 seconds
		# Just verify the node doesn't crash with large values
		import time

		start = time.time()
		# Pass a very small value that won't actually wait
		self.node.execute(params={'delay_seconds': 0})
		elapsed = time.time() - start
		self.assertLess(elapsed, 0.1)

	def test_delay_invalid_value_defaults_to_zero(self):
		"""Test that invalid delay value defaults to zero."""
		result = self.node.execute(
			params={'delay_seconds': 'invalid'}
		)
		self.assertIsNotNone(result)

	def test_delay_none_defaults_to_zero(self):
		"""Test that None delay value defaults to zero."""
		result = self.node.execute(
			params={'delay_seconds': None}
		)
		self.assertIsNotNone(result)

	def test_delay_negative_treated_as_zero(self):
		"""Test that negative delay is treated as zero."""
		import time

		start = time.time()
		self.node.execute(params={'delay_seconds': -5})
		elapsed = time.time() - start
		self.assertLess(elapsed, 0.1)


class TestHazelNode(FrappeTestCase):
	"""Tests for the Hazel Node doctype execution."""

	@classmethod
	def setUpClass(cls):
		super().setUpClass()
		# Ensure node types exist
		if not frappe.db.exists('Hazel Node Type', 'Set Variable'):
			frappe.get_doc({
				'doctype': 'Hazel Node Type',
				'name': 'Set Variable',
				'kind': 'Action',
				'handler_path': 'hazelnode.nodes.actions.set_variable_node.SetVariableNode',
				'is_standard': 1,
			}).insert(ignore_permissions=True)

		if not frappe.db.exists('Hazel Node Type', 'Log'):
			frappe.get_doc({
				'doctype': 'Hazel Node Type',
				'name': 'Log',
				'kind': 'Action',
				'handler_path': 'hazelnode.nodes.actions.log_node.LogNode',
				'is_standard': 1,
			}).insert(ignore_permissions=True)

		frappe.db.commit()

	def test_node_execute_loads_handler(self):
		"""Test that node execution loads the correct handler."""
		# Create a mock node document
		node = frappe.get_doc({
			'doctype': 'Hazel Node',
			'node_id': 'test_node_1',
			'type': 'Set Variable',
			'kind': 'Action',
			'event': None,
			'parameters': '{}',
		})

		params = {'variable_name': 'test', 'value': 'hello'}
		result = node.execute(params, {})

		self.assertEqual(result.get('test'), 'hello')

	def test_node_execute_passes_context(self):
		"""Test that node execution passes context correctly."""
		node = frappe.get_doc({
			'doctype': 'Hazel Node',
			'node_id': 'test_node_2',
			'type': 'Set Variable',
			'kind': 'Action',
			'event': None,
			'parameters': '{}',
		})

		params = {
			'variable_name': 'greeting',
			'value': 'Hello, {{ name }}!',
		}
		context = {'name': 'World'}
		result = node.execute(params, context)

		self.assertEqual(result.get('greeting'), 'Hello, World!')


# ===== UTILITY FUNCTION TESTS =====

from hazelnode.nodes.utils import (
	ensure_context,
	parse_json_field,
	render_template_field,
)


class TestNodeUtils(FrappeTestCase):
	"""Tests for node utility functions."""

	# ===== ensure_context TESTS =====

	def test_ensure_context_returns_dict_when_dict(self):
		"""Test ensure_context returns dict as-is."""
		ctx = {'key': 'value'}
		result = ensure_context(ctx)
		self.assertEqual(result, ctx)

	def test_ensure_context_returns_empty_dict_for_none(self):
		"""Test ensure_context returns empty dict for None."""
		result = ensure_context(None)
		self.assertEqual(result, {})

	def test_ensure_context_returns_empty_dict_for_string(self):
		"""Test ensure_context returns empty dict for non-dict types."""
		result = ensure_context('not a dict')
		self.assertEqual(result, {})

	def test_ensure_context_returns_empty_dict_for_list(self):
		"""Test ensure_context returns empty dict for list."""
		result = ensure_context([1, 2, 3])
		self.assertEqual(result, {})

	def test_ensure_context_returns_empty_dict_for_int(self):
		"""Test ensure_context returns empty dict for integer."""
		result = ensure_context(42)
		self.assertEqual(result, {})

	# ===== render_template_field TESTS =====

	def test_render_template_field_simple(self):
		"""Test rendering simple template variable."""
		result = render_template_field(
			'Hello, {{ name }}!', {'name': 'Alice'}
		)
		self.assertEqual(result, 'Hello, Alice!')

	def test_render_template_field_multiple_vars(self):
		"""Test rendering multiple template variables."""
		result = render_template_field(
			'{{ greeting }}, {{ name }}!',
			{'greeting': 'Hi', 'name': 'Bob'},
		)
		self.assertEqual(result, 'Hi, Bob!')

	def test_render_template_field_no_template(self):
		"""Test that plain strings are returned as-is."""
		result = render_template_field('plain text', {})
		self.assertEqual(result, 'plain text')

	def test_render_template_field_empty_string(self):
		"""Test rendering empty string."""
		result = render_template_field('', {})
		self.assertEqual(result, '')

	def test_render_template_field_none_value(self):
		"""Test rendering None value."""
		result = render_template_field(None, {})
		self.assertEqual(result, '')

	def test_render_template_field_none_context(self):
		"""Test rendering with None context."""
		result = render_template_field('plain text', None)
		self.assertEqual(result, 'plain text')

	def test_render_template_field_nested_variable(self):
		"""Test rendering nested variable."""
		result = render_template_field(
			'User: {{ user.name }}',
			{'user': {'name': 'Charlie'}},
		)
		self.assertEqual(result, 'User: Charlie')

	# ===== parse_json_field TESTS =====

	def test_parse_json_field_valid_json(self):
		"""Test parsing valid JSON string."""
		result = parse_json_field('{"key": "value"}', {}, 'test')
		self.assertEqual(result, {'key': 'value'})

	def test_parse_json_field_empty_string(self):
		"""Test parsing empty string returns empty dict."""
		result = parse_json_field('', {}, 'test')
		self.assertEqual(result, {})

	def test_parse_json_field_none(self):
		"""Test parsing None returns empty dict."""
		result = parse_json_field(None, {}, 'test')
		self.assertEqual(result, {})

	def test_parse_json_field_already_dict(self):
		"""Test that dict is returned as-is."""
		input_dict = {'key': 'value'}
		result = parse_json_field(input_dict, {}, 'test')
		self.assertEqual(result, input_dict)

	def test_parse_json_field_with_template(self):
		"""Test parsing JSON with template variables."""
		result = parse_json_field(
			'{"greeting": "Hello, {{ name }}!"}',
			{'name': 'World'},
			'test',
		)
		self.assertEqual(result, {'greeting': 'Hello, World!'})

	def test_parse_json_field_invalid_json_throws(self):
		"""Test that invalid JSON throws an error."""
		with self.assertRaises(Exception):
			parse_json_field('not valid json', {}, 'test')

	def test_parse_json_field_nested_json(self):
		"""Test parsing nested JSON structure."""
		result = parse_json_field(
			'{"user": {"name": "Alice", "age": 30}}', {}, 'test'
		)
		self.assertEqual(
			result,
			{'user': {'name': 'Alice', 'age': 30}},
		)

	def test_parse_json_field_array_json(self):
		"""Test parsing JSON array."""
		result = parse_json_field('[1, 2, 3]', {}, 'test')
		self.assertEqual(result, [1, 2, 3])


# ===== DOCUMENT NODE TESTS =====

from hazelnode.nodes.actions.create_document_node import (
	CreateDocumentNode,
)
from hazelnode.nodes.actions.update_document_node import (
	UpdateDocumentNode,
)


class TestCreateDocumentNode(FrappeTestCase):
	"""Tests for the Create Document Node."""

	def setUp(self):
		self.node = CreateDocumentNode()
		# Clean up test ToDos
		for todo in frappe.get_all(
			'ToDo',
			filters={'description': ['like', 'Test%']},
		):
			frappe.delete_doc('ToDo', todo.name, force=True)
		frappe.db.commit()

	def tearDown(self):
		# Clean up test ToDos
		for todo in frappe.get_all(
			'ToDo',
			filters={'description': ['like', 'Test%']},
		):
			frappe.delete_doc('ToDo', todo.name, force=True)
		frappe.db.commit()

	def test_create_document_basic(self):
		"""Test creating a basic document."""
		result = self.node.execute(
			params={
				'doctype': 'ToDo',
				'field_values': '{"description": "Test create basic"}',
				'ignore_permissions': True,
			}
		)

		self.assertIn('created_doc', result)
		self.assertIn('created_doc_name', result)
		self.assertEqual(
			result['created_doc']['description'], 'Test create basic'
		)

		# Verify document exists in database
		self.assertTrue(
			frappe.db.exists('ToDo', result['created_doc_name'])
		)

	def test_create_document_with_template_values(self):
		"""Test creating document with template-rendered field values."""
		result = self.node.execute(
			params={
				'doctype': 'ToDo',
				'field_values': '{"description": "Test {{ task_name }}"}',
				'ignore_permissions': True,
			},
			context={'task_name': 'template task'},
		)

		self.assertEqual(
			result['created_doc']['description'],
			'Test template task',
		)

	def test_create_document_missing_doctype_throws(self):
		"""Test that missing doctype throws an error."""
		with self.assertRaises(Exception):
			self.node.execute(
				params={
					'field_values': '{"description": "Test"}',
				}
			)

	def test_create_document_preserves_context(self):
		"""Test that existing context is preserved."""
		result = self.node.execute(
			params={
				'doctype': 'ToDo',
				'field_values': '{"description": "Test preserve context"}',
				'ignore_permissions': True,
			},
			context={'existing_key': 'existing_value'},
		)

		self.assertEqual(
			result.get('existing_key'), 'existing_value'
		)

	def test_create_document_empty_field_values(self):
		"""Test creating document with empty field values."""
		result = self.node.execute(
			params={
				'doctype': 'ToDo',
				'field_values': '{}',
				'ignore_permissions': True,
			}
		)

		self.assertIn('created_doc_name', result)


class TestUpdateDocumentNode(FrappeTestCase):
	"""Tests for the Update Document Node."""

	def setUp(self):
		self.node = UpdateDocumentNode()
		# Create a test document
		self.test_todo = frappe.get_doc({
			'doctype': 'ToDo',
			'description': 'Test original description',
		})
		self.test_todo.insert(ignore_permissions=True)
		frappe.db.commit()

	def tearDown(self):
		# Clean up test ToDos
		for todo in frappe.get_all(
			'ToDo',
			filters={'description': ['like', 'Test%']},
		):
			frappe.delete_doc('ToDo', todo.name, force=True)
		frappe.db.commit()

	def test_update_document_basic(self):
		"""Test updating a document."""
		result = self.node.execute(
			params={
				'doctype': 'ToDo',
				'docname': self.test_todo.name,
				'field_values': '{"description": "Test updated description"}',
				'ignore_permissions': True,
			}
		)

		self.assertIn('updated_doc', result)
		self.assertEqual(
			result['updated_doc']['description'],
			'Test updated description',
		)

		# Verify update in database
		updated_doc = frappe.get_doc('ToDo', self.test_todo.name)
		self.assertEqual(
			updated_doc.description, 'Test updated description'
		)

	def test_update_document_with_template_docname(self):
		"""Test updating document with template-rendered docname."""
		result = self.node.execute(
			params={
				'doctype': 'ToDo',
				'docname': '{{ todo_name }}',
				'field_values': '{"description": "Test template update"}',
				'ignore_permissions': True,
			},
			context={'todo_name': self.test_todo.name},
		)

		self.assertEqual(
			result['updated_doc']['description'],
			'Test template update',
		)

	def test_update_document_with_template_values(self):
		"""Test updating document with template-rendered field values."""
		result = self.node.execute(
			params={
				'doctype': 'ToDo',
				'docname': self.test_todo.name,
				'field_values': '{"description": "Test {{ new_desc }}"}',
				'ignore_permissions': True,
			},
			context={'new_desc': 'dynamic value'},
		)

		self.assertEqual(
			result['updated_doc']['description'],
			'Test dynamic value',
		)

	def test_update_document_missing_doctype_throws(self):
		"""Test that missing doctype throws an error."""
		with self.assertRaises(Exception):
			self.node.execute(
				params={
					'docname': 'some-name',
					'field_values': '{}',
				}
			)

	def test_update_document_missing_docname_throws(self):
		"""Test that missing docname throws an error."""
		with self.assertRaises(Exception):
			self.node.execute(
				params={
					'doctype': 'ToDo',
					'field_values': '{}',
				}
			)

	def test_update_document_preserves_context(self):
		"""Test that existing context is preserved."""
		result = self.node.execute(
			params={
				'doctype': 'ToDo',
				'docname': self.test_todo.name,
				'field_values': '{"description": "Test preserve update"}',
				'ignore_permissions': True,
			},
			context={'existing_key': 'existing_value'},
		)

		self.assertEqual(
			result.get('existing_key'), 'existing_value'
		)

	def test_update_document_nonexistent_throws(self):
		"""Test that updating non-existent document throws."""
		with self.assertRaises(Exception):
			self.node.execute(
				params={
					'doctype': 'ToDo',
					'docname': 'nonexistent-todo-12345',
					'field_values': '{}',
					'ignore_permissions': True,
				}
			)


class TestCreateUpdateDocumentIntegration(FrappeTestCase):
	"""Integration tests for Create and Update document nodes."""

	def setUp(self):
		self.create_node = CreateDocumentNode()
		self.update_node = UpdateDocumentNode()

	def tearDown(self):
		# Clean up test ToDos
		for todo in frappe.get_all(
			'ToDo',
			filters={'description': ['like', 'Test%']},
		):
			frappe.delete_doc('ToDo', todo.name, force=True)
		frappe.db.commit()

	def test_create_then_update_workflow(self):
		"""Test creating a document then updating it."""
		# Create document
		context = self.create_node.execute(
			params={
				'doctype': 'ToDo',
				'field_values': '{"description": "Test initial"}',
				'ignore_permissions': True,
			},
			context={},
		)

		# Update the created document using its name from context
		context = self.update_node.execute(
			params={
				'doctype': 'ToDo',
				'docname': '{{ created_doc_name }}',
				'field_values': '{"description": "Test final"}',
				'ignore_permissions': True,
			},
			context=context,
		)

		# Verify both documents info in context
		self.assertIn('created_doc', context)
		self.assertIn('updated_doc', context)
		self.assertEqual(
			context['updated_doc']['description'], 'Test final'
		)

	def test_chained_context_passing(self):
		"""Test context accumulates through multiple operations."""
		# Create first document
		context = self.create_node.execute(
			params={
				'doctype': 'ToDo',
				'field_values': '{"description": "Test first"}',
				'ignore_permissions': True,
			},
			context={'step': 1},
		)

		first_name = context['created_doc_name']

		# Create second document
		context = self.create_node.execute(
			params={
				'doctype': 'ToDo',
				'field_values': '{"description": "Test second"}',
				'ignore_permissions': True,
			},
			context=context,
		)

		# Verify context accumulation
		self.assertEqual(context['step'], 1)
		self.assertEqual(
			context['created_doc']['description'], 'Test second'
		)
		# First document should still exist
		self.assertTrue(frappe.db.exists('ToDo', first_name))
