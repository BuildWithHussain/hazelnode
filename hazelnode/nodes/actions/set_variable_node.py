from hazelnode.nodes import Node
from hazelnode.nodes.utils import (
	ensure_context,
	render_template_field,
)


class SetVariableNode(Node):
	"""
	Sets a variable in the workflow context.
	Useful for storing intermediate values or transforming data.
	"""

	def execute(self, event=None, params=None, context=None):
		context = ensure_context(context)
		params = params or {}

		variable_name = params.get('variable_name', '')
		value = render_template_field(
			params.get('value', ''), context
		)

		if variable_name:
			context[variable_name] = value

		return context
