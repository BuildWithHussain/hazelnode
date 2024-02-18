from typing import Optional

import frappe
from werkzeug.wrappers import Response


class HazelWebhookHandler:
	def __init__(self, path: str, status_code: Optional[int] = None):
		self.path = path
		self.webhook_id = None

	def can_render(self):
		if not self.path.startswith('hazelnode_webhooks/'):
			return False

		self.webhook_id = self.path.split('/')[-1]
		return frappe.db.exists(
			'Hazel Webhook Listener', self.webhook_id
		)

	def render(self):
		linked_workflow = frappe.db.get_value(
			'Hazel Webhook Listener', self.webhook_id, 'workflow'
		)
		frappe.get_doc('Hazel Workflow', linked_workflow).execute()
		return Response(f'Handler from hazelnode: {self.webhook_id}')
