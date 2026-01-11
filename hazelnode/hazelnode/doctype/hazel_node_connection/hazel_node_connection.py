# Copyright (c) 2024, Build With Hussain and contributors
# For license information, please see license.txt

from frappe.model.document import Document


class HazelNodeConnection(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		parent: DF.Data
		parentfield: DF.Data
		parenttype: DF.Data
		source_handle: DF.Literal['default', 'true', 'false']
		source_node_id: DF.Data
		target_node_id: DF.Data
	# end: auto-generated types

	pass
