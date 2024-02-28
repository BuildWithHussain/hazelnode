import frappe


def cleanup_hazel_scheduled_events():
	hazel_events = frappe.db.get_all(
		'Hazel Scheduled Event', pluck='name'
	)
	for name in hazel_events:
		frappe.delete_doc('Hazel Scheduled Event', name)


def sync_hazel_scheduled_events():
	print('Hazelnode: Syncing scheduled events...')
	workflows_with_scheduled_triggers = frappe.db.get_all(
		'Hazel Workflow',
		filters={'trigger_type': 'Schedule Event'},
		fields=['trigger_config'],
	)

	for wf in workflows_with_scheduled_triggers:
		trigger_config = frappe.parse_json(wf.trigger_config)
		cron_expression = trigger_config['cron_expression']
		already_exists = frappe.db.exists(
			'Hazel Scheduled Event',
			{'cron_expression': cron_expression},
		)
		if already_exists:
			continue

		frappe.get_doc(
			doctype='Hazel Scheduled Event',
			cron_expression=cron_expression,
		).insert()
