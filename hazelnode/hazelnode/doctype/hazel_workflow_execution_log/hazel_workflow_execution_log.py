# Copyright (c) 2024, Build With Hussain and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class HazelWorkflowExecutionLog(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		amended_from: DF.Link | None
		name: DF.Int | None
		status: DF.Literal['Success', 'Failure', 'Running']
		traceback: DF.Code | None
		workflow: DF.Link
		workflow_title: DF.Data | None
	# end: auto-generated types

	pass
