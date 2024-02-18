# Copyright (c) 2024, Build With Hussain and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class HazelWebhookListener(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		workflow: DF.Link
	# end: auto-generated types

	def validate(self):
		self.validate_unique_workflow()

	def validate_unique_workflow(self):
		if frappe.db.exists(
			'Hazel Webhook Listener', {'workflow': self.workflow}
		):
			frappe.throw('Listener for this workflow already exists!')
