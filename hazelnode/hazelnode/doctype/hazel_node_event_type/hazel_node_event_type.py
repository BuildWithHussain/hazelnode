# Copyright (c) 2024, Build With Hussain and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class HazelNodeEventType(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		from hazelnode.hazelnode.doctype.hazel_event_param.hazel_event_param import (
			HazelEventParam,
		)

		name: DF.Int | None
		node_type: DF.Link
		params: DF.Table[HazelEventParam]
		title: DF.Data
	# end: auto-generated types

	pass
