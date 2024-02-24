# Copyright (c) 2024, Build With Hussain and contributors
# For license information, please see license.txt

import click
import frappe
from frappe.model.document import Document


class HazelScheduledEvent(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		cron_expression: DF.Data
		job_type: DF.Link | None
	# end: auto-generated types

	def before_save(self):
		if not self.job_type:
			job_type_doc = insert_and_get_single_event(
				'Cron',
				'hazelnode.nodes.triggers.hazel_schedule_handler.handle',
				self.cron_expression,
			)
			self.job_type = job_type_doc.name

	def after_delete(self):
		frappe.delete_doc('Scheduled Job Type', self.job_type)


def insert_and_get_single_event(
	frequency: str, event: str, cron_format: str | None = None
):
	cron_expr = {'cron_format': cron_format} if cron_format else {}

	try:
		frappe.get_attr(event)
	except Exception as e:
		click.secho(
			f'{event} is not a valid method: {e}', fg='yellow'
		)

	doc = frappe.get_doc(
		{
			'doctype': 'Scheduled Job Type',
			'method': event,
			'cron_format': cron_format,
			'frequency': frequency,
		}
	)

	if not frappe.db.exists(
		'Scheduled Job Type',
		{'method': event, 'frequency': frequency, **cron_expr},
	):
		savepoint = 'scheduled_job_type_creation'
		try:
			frappe.db.savepoint(savepoint)
			doc.insert()
		except frappe.UniqueValidationError:
			frappe.db.rollback(save_point=savepoint)
			doc.delete()
			doc.insert()

	return doc
