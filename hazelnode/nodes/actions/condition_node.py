# Copyright (c) 2024, Build With Hussain and contributors
# For license information, please see license.txt

import operator

from hazelnode.nodes import Node


class ConditionNode(Node):
	"""
	A conditional node that evaluates an expression and returns a branch result.

	The node evaluates: left_operand <operator> right_operand

	Returns:
		dict: {'branch': 'true'} or {'branch': 'false'} based on evaluation
		      Also includes 'context' with the original context for downstream nodes
	"""

	OPERATORS = {
		'equals': operator.eq,
		'not_equals': operator.ne,
		'greater_than': operator.gt,
		'less_than': operator.lt,
		'greater_than_or_equal': operator.ge,
		'less_than_or_equal': operator.le,
		'contains': lambda a, b: b in str(a),
		'not_contains': lambda a, b: b not in str(a),
		'starts_with': lambda a, b: str(a).startswith(str(b)),
		'ends_with': lambda a, b: str(a).endswith(str(b)),
		'is_empty': lambda a, _: not a,
		'is_not_empty': lambda a, _: bool(a),
	}

	def execute(self, event=None, params=None, context=None):
		if params is None:
			params = {}
		if context is None:
			context = {}

		left_operand = params.get('left_operand', '')
		op = params.get('operator', 'equals')
		right_operand = params.get('right_operand', '')

		# Resolve variables from context
		left_value = self._resolve_value(left_operand, context)
		right_value = self._resolve_value(right_operand, context)

		# Get the operator function
		op_func = self.OPERATORS.get(op, operator.eq)

		# Evaluate the condition
		try:
			result = op_func(left_value, right_value)
		except Exception:
			result = False

		branch = 'true' if result else 'false'

		return {
			'branch': branch,
			'condition_result': result,
			'evaluated': {
				'left': left_value,
				'operator': op,
				'right': right_value,
			},
			**context,  # Pass through the original context
		}

	def _resolve_value(self, value, context):
		"""
		Resolve a value that might be a variable reference.

		If the value starts with '{{' and ends with '}}', treat it as a
		variable reference and look it up in the context.
		"""
		if isinstance(value, str):
			value = value.strip()
			if value.startswith('{{') and value.endswith('}}'):
				var_name = value[2:-2].strip()
				return self._get_nested_value(context, var_name)
		return value

	def _get_nested_value(self, obj, path):
		"""Get a nested value from a dict using dot notation."""
		keys = path.split('.')
		current = obj
		for key in keys:
			if isinstance(current, dict):
				current = current.get(key)
			else:
				return None
		return current
