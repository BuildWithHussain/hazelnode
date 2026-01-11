import frappe
from hazelnode.nodes import Node
from hazelnode.nodes.utils import render_template_field, ensure_context


class LogNode(Node):
    """
    Logs a message to the workflow execution log.
    Useful for debugging and monitoring workflow execution.
    """

    def execute(self, event=None, params=None, context=None):
        context = ensure_context(context)
        params = params or {}

        message = render_template_field(params.get('message', ''), context)
        log_level = params.get('log_level', 'Info')

        # Log to console
        if log_level == 'Error':
            frappe.log_error(message, 'Workflow Log')
        else:
            frappe.logger().info(f'[Workflow] {message}')

        # Store log in context for debugging
        if 'logs' not in context:
            context['logs'] = []
        context['logs'].append({
            'level': log_level,
            'message': message
        })

        return context
