from typing import Optional

import frappe
from werkzeug.wrappers import Response


class HazelWebhookHandler:
	def __init__(self, path: str, status_code: Optional[int] = None):
		self.path = path
		self.webhook_id = None
		self.request_obj = frappe.request

	def can_render(self):
		if not self.path.startswith('hazelnode_webhooks/'):
			return False

		self.webhook_id = self.path.split('/')[-1]
		return frappe.db.exists(
			'Hazel Webhook Listener', self.webhook_id
		)

	def render(self):
		serializable_context = self.get_serializable_context()
		self.create_hazel_webhook_log(serializable_context)
		self.execute_workflow_with_context(serializable_context)

		return Response(f'Handler from hazelnode: {self.webhook_id}')

	def get_serializable_context(self):
		request_data = self.get_request_data()

		return {
			'request_headers': self.request_obj.headers,
			'request_data': request_data.decode(),
			'form_dict': frappe.form_dict,
		}

	def get_request_data(self):
		request_data = None
		if self.request_obj.is_json:
			request_data = self.request_obj.get_json()
		else:
			request_data = self.request_obj.get_data()

		return request_data

	def create_hazel_webhook_log(self, serializable_context):
		frappe.get_doc(
			{
				'doctype': 'Hazel Webhook Log',
				'webhook': self.webhook_id,
				'context': frappe.as_json(serializable_context),
			}
		).insert(ignore_permissions=True)

	def execute_workflow_with_context(self, serializable_context):
		linked_workflow = frappe.db.get_value(
			'Hazel Webhook Listener', self.webhook_id, 'workflow'
		)

		context = frappe._dict(
			{'request_obj': self.request_obj, **serializable_context}
		)
		# execute workflow
		frappe.get_doc('Hazel Workflow', linked_workflow).execute(
			context
		)
