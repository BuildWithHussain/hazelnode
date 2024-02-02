# Copyright (c) 2024, Build With Hussain and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class HazelNodeType(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		from hazelnode.hazelnode.doctype.hazel_event_param.hazel_event_param import (
			HazelEventParam,
		)

		description: DF.SmallText | None
		kind: DF.Literal['Trigger', 'Action']
		params: DF.Table[HazelEventParam]
		preview_image: DF.AttachImage | None
	# end: auto-generated types

	pass
