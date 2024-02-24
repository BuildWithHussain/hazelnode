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

		from hazelnode.hazelnode.doctype.hazel_execution_node_log.hazel_execution_node_log import (
			HazelExecutionNodeLog,
		)

		amended_from: DF.Link | None
		initial_context: DF.Code | None
		name: DF.Int | None
		node_logs: DF.Table[HazelExecutionNodeLog]
		status: DF.Literal['Success', 'Failure', 'Running']
		traceback: DF.Code | None
		trigger_config: DF.Code | None
		trigger_type: DF.Data | None
		workflow: DF.Link
		workflow_title: DF.Data | None
	# end: auto-generated types

	pass
