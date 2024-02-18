# Copyright (c) 2024, Build With Hussain and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

from hazelnode.nodes import Node


class HazelNode(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		event: DF.Link | None
		kind: DF.Literal['Trigger', 'Action']
		parameters: DF.JSON | None
		parent: DF.Data
		parentfield: DF.Data
		parenttype: DF.Data
		type: DF.Link
	# end: auto-generated types

	def execute(self, params=None, context=None):
		handler_path = frappe.db.get_value(
			'Hazel Node Type', self.type, 'handler_path'
		)
		module_path, classname = handler_path.rsplit('.', 1)
		module = frappe.get_module(module_path)
		class_ = getattr(module, classname, None)
		obj: Node = class_()
		obj.execute(self.event, params, context)
