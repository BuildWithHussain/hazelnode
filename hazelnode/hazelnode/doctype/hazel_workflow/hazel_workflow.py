# Copyright (c) 2024, Build With Hussain and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class HazelWorkflow(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		from hazelnode.hazelnode.doctype.hazel_node.hazel_node import (
			HazelNode,
		)

		enabled: DF.Check
		name: DF.Int | None
		nodes: DF.Table[HazelNode]
		title: DF.Data
	# end: auto-generated types

	pass
