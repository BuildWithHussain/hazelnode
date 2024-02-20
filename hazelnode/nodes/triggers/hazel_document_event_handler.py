import frappe


def handle(doc, state: str):
	HazelDocumentEventHandler(doc, state).handle()


STATE_EVENT_MAP = {
	'New': 'after_insert',
	'On Change': 'on_change',
	'On Delete': 'after_delete',
}


class HazelDocumentEventHandler:
	def __init__(self, doc, state: str):
		self.doc = doc
		self.doctype = doc.doctype
		self.state = state

	def handle(self):
		enabled_document_event_workflows = frappe.db.get_all(
			'Hazel Workflow',
			filters={'enabled': 1, 'trigger_type': 'Document Event'},
			fields=['name', 'trigger_config'],
		)

		for wf in enabled_document_event_workflows:
			wf.trigger_config = frappe.parse_json(wf.trigger_config)
			self.execute_workflow_if_applicable(
				wf.name, wf.trigger_config
			)

	def execute_workflow_if_applicable(
		self, wf_name, wf_trigger_config
	):
		event = wf_trigger_config.get('event')
		doctype = wf_trigger_config.get('doctype')

		if not (
			self.doctype == doctype
			and self.state == STATE_EVENT_MAP[event]
		):
			return

		context = frappe._dict(
			{'trigger_config': wf_trigger_config, 'doc': self.doc}
		)

		if event == 'On Change':
			# TODO: also attach doc before update
			pass

		frappe.enqueue_doc(
			'Hazel Workflow',
			wf_name,
			'execute',
			queue='long',
			context=context,
		)
