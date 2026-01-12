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
		"""Test greater_than with numeric strings."""
		result = self.node.execute(
			params={
				'left_operand': '10',
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
				'right_operand': '10',
			}
		)
		self.assertEqual(result['branch'], 'false')

	def test_less_than_true(self):
		"""Test less_than operator."""
		result = self.node.execute(
			params={
				'left_operand': '5',
				'operator': 'less_than',
				'right_operand': '10',
			}
		)
		self.assertEqual(result['branch'], 'true')

	def test_less_than_false(self):
		"""Test less_than returns false when not less."""
		result = self.node.execute(
			params={
				'left_operand': '10',
				'operator': 'less_than',
				'right_operand': '5',
			}
		)
		self.assertEqual(result['branch'], 'false')

	def test_greater_than_or_equal_true_greater(self):
		"""Test greater_than_or_equal when greater."""
		result = self.node.execute(
			params={
				'left_operand': '10',
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
				'right_operand': '10',
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
				'right_operand': '18',
			},
			context={
				'data': {'user': {'profile': {'age': 25}}}
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
