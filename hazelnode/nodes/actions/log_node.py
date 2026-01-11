import frappe
from hazelnode.nodes import Node


class LogNode(Node):
    """
    Logs a message to the workflow execution log.
    Useful for debugging and monitoring workflow execution.
    """

    def execute(self, event=None, params=None, context=None):
        context = context or {}

        message = params.get('message', '')
        log_level = params.get('log_level', 'Info')

        # Render template variables in message
        if isinstance(message, str) and '{{' in message:
            message = frappe.render_template(message, context)

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
