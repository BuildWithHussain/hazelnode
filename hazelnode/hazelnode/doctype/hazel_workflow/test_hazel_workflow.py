# Copyright (c) 2024, Build With Hussain and Contributors
# See license.txt

from frappe.tests.utils import FrappeTestCase


class TestHazelWorkflow(FrappeTestCase):
	"""Minimal tests for the Hazel Workflow."""

	def test_sanity(self):
		"""Simple sanity test to verify test framework works."""
		self.assertEqual(1 + 1, 2)
