from hazelnode.nodes import Node


class SetVariableNode(Node):
    """
    Sets a variable in the workflow context.
    Useful for storing intermediate values or transforming data.
    """

    def execute(self, event=None, params=None, context=None):
        context = context or {}

        variable_name = params.get('variable_name', '')
        value = params.get('value', '')

        # Support for simple template expressions like {{doc.name}}
        if isinstance(value, str) and '{{' in value:
            import frappe
            value = frappe.render_template(value, context)

        if variable_name:
            context[variable_name] = value

        return context
