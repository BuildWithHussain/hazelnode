# Copyright (c) 2024, Build With Hussain and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class HazelEventParam(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		fieldname: DF.Data
		fieldtype: DF.Literal['Data', 'Check', 'Number', 'Date']
		parent: DF.Data
		parentfield: DF.Data
		parenttype: DF.Data
		title: DF.Data
	# end: auto-generated types

	pass
