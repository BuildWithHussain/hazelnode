from typing import Optional

import frappe


def handle():
	HazelScheduleHandler(frappe.job.cron_format).handle()


class HazelScheduleHandler:
	def __init__(
		self,
		cron_expression: Optional[str] = None,
	):
		self.cron_expression = cron_expression

	def handle(self):
		enabled_schedule_event_workflows = frappe.db.get_all(
			'Hazel Workflow',
			filters={'enabled': 1, 'trigger_type': 'Schedule Event'},
			fields=['name', 'trigger_config'],
		)

		for wf in enabled_schedule_event_workflows:
			wf.trigger_config = frappe.parse_json(wf.trigger_config)
			self.execute_workflow_if_applicable(
				wf.name, wf.trigger_config
			)

	def execute_workflow_if_applicable(
		self, wf_name, wf_trigger_config
	):
		cron_expression = wf_trigger_config.get('cron_expression')

		if cron_expression != self.cron_expression:
			return

		context = frappe._dict({'cron_expression': cron_expression})

		frappe.log_error('Executing workflow: ', wf_name)

		frappe.enqueue_doc(
			'Hazel Workflow',
			wf_name,
			'execute',
			queue='long',
			context=context,
		)
