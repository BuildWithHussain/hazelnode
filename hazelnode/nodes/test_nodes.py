# Copyright (c) 2024, Build With Hussain and Contributors
# See license.txt

"""
Comprehensive tests for workflow nodes and utilities.
"""

import frappe
from frappe.tests.utils import FrappeTestCase

from hazelnode.nodes.actions.create_document_node import (
	CreateDocumentNode,
)
from hazelnode.nodes.actions.update_document_node import (
	UpdateDocumentNode,
)
from hazelnode.nodes.utils import (
	ensure_context,
	parse_json_field,
	render_template_field,
)


class TestNodeUtils(FrappeTestCase):
	"""Tests for node utility functions."""

	# ===== ensure_context TESTS =====

	def test_ensure_context_returns_dict_when_dict(self):
		"""Test ensure_context returns dict as-is."""
		ctx = {'key': 'value'}
		result = ensure_context(ctx)
		self.assertEqual(result, ctx)

	def test_ensure_context_returns_empty_dict_for_none(self):
		"""Test ensure_context returns empty dict for None."""
		result = ensure_context(None)
		self.assertEqual(result, {})

	def test_ensure_context_returns_empty_dict_for_string(self):
		"""Test ensure_context returns empty dict for non-dict types."""
		result = ensure_context('not a dict')
		self.assertEqual(result, {})

	def test_ensure_context_returns_empty_dict_for_list(self):
		"""Test ensure_context returns empty dict for list."""
		result = ensure_context([1, 2, 3])
		self.assertEqual(result, {})

	def test_ensure_context_returns_empty_dict_for_int(self):
		"""Test ensure_context returns empty dict for integer."""
		result = ensure_context(42)
		self.assertEqual(result, {})

	# ===== render_template_field TESTS =====

	def test_render_template_field_simple(self):
		"""Test rendering simple template variable."""
		result = render_template_field(
			'Hello, {{ name }}!', {'name': 'Alice'}
		)
		self.assertEqual(result, 'Hello, Alice!')

	def test_render_template_field_multiple_vars(self):
		"""Test rendering multiple template variables."""
		result = render_template_field(
			'{{ greeting }}, {{ name }}!',
			{'greeting': 'Hi', 'name': 'Bob'},
		)
		self.assertEqual(result, 'Hi, Bob!')

	def test_render_template_field_no_template(self):
		"""Test that plain strings are returned as-is."""
		result = render_template_field('plain text', {})
		self.assertEqual(result, 'plain text')

	def test_render_template_field_empty_string(self):
		"""Test rendering empty string."""
		result = render_template_field('', {})
		self.assertEqual(result, '')

	def test_render_template_field_none_value(self):
		"""Test rendering None value."""
		result = render_template_field(None, {})
		self.assertEqual(result, '')

	def test_render_template_field_none_context(self):
		"""Test rendering with None context."""
		result = render_template_field('plain text', None)
		self.assertEqual(result, 'plain text')

	def test_render_template_field_nested_variable(self):
		"""Test rendering nested variable."""
		result = render_template_field(
			'User: {{ user.name }}',
			{'user': {'name': 'Charlie'}},
		)
		self.assertEqual(result, 'User: Charlie')

	# ===== parse_json_field TESTS =====

	def test_parse_json_field_valid_json(self):
		"""Test parsing valid JSON string."""
		result = parse_json_field('{"key": "value"}', {}, 'test')
		self.assertEqual(result, {'key': 'value'})

	def test_parse_json_field_empty_string(self):
		"""Test parsing empty string returns empty dict."""
		result = parse_json_field('', {}, 'test')
		self.assertEqual(result, {})

	def test_parse_json_field_none(self):
		"""Test parsing None returns empty dict."""
		result = parse_json_field(None, {}, 'test')
		self.assertEqual(result, {})

	def test_parse_json_field_already_dict(self):
		"""Test that dict is returned as-is."""
		input_dict = {'key': 'value'}
		result = parse_json_field(input_dict, {}, 'test')
		self.assertEqual(result, input_dict)

	def test_parse_json_field_with_template(self):
		"""Test parsing JSON with template variables."""
		result = parse_json_field(
			'{"greeting": "Hello, {{ name }}!"}',
			{'name': 'World'},
			'test',
		)
		self.assertEqual(result, {'greeting': 'Hello, World!'})

	def test_parse_json_field_invalid_json_throws(self):
		"""Test that invalid JSON throws an error."""
		with self.assertRaises(Exception):
			parse_json_field('not valid json', {}, 'test')

	def test_parse_json_field_nested_json(self):
		"""Test parsing nested JSON structure."""
		result = parse_json_field(
			'{"user": {"name": "Alice", "age": 30}}', {}, 'test'
		)
		self.assertEqual(
			result,
			{'user': {'name': 'Alice', 'age': 30}},
		)

	def test_parse_json_field_array_json(self):
		"""Test parsing JSON array."""
		result = parse_json_field('[1, 2, 3]', {}, 'test')
		self.assertEqual(result, [1, 2, 3])


class TestCreateDocumentNode(FrappeTestCase):
	"""Tests for the Create Document Node."""

	def setUp(self):
		self.node = CreateDocumentNode()
		# Clean up test ToDos
		for todo in frappe.get_all(
			'ToDo',
			filters={'description': ['like', 'Test%']},
		):
			frappe.delete_doc('ToDo', todo.name, force=True)
		frappe.db.commit()

	def tearDown(self):
		# Clean up test ToDos
		for todo in frappe.get_all(
			'ToDo',
			filters={'description': ['like', 'Test%']},
		):
			frappe.delete_doc('ToDo', todo.name, force=True)
		frappe.db.commit()

	def test_create_document_basic(self):
		"""Test creating a basic document."""
		result = self.node.execute(
			params={
				'doctype': 'ToDo',
				'field_values': '{"description": "Test create basic"}',
				'ignore_permissions': True,
			}
		)

		self.assertIn('created_doc', result)
		self.assertIn('created_doc_name', result)
		self.assertEqual(
			result['created_doc']['description'], 'Test create basic'
		)

		# Verify document exists in database
		self.assertTrue(
			frappe.db.exists('ToDo', result['created_doc_name'])
		)

	def test_create_document_with_template_values(self):
		"""Test creating document with template-rendered field values."""
		result = self.node.execute(
			params={
				'doctype': 'ToDo',
				'field_values': '{"description": "Test {{ task_name }}"}',
				'ignore_permissions': True,
			},
			context={'task_name': 'template task'},
		)

		self.assertEqual(
			result['created_doc']['description'],
			'Test template task',
		)

	def test_create_document_missing_doctype_throws(self):
		"""Test that missing doctype throws an error."""
		with self.assertRaises(Exception):
			self.node.execute(
				params={
					'field_values': '{"description": "Test"}',
				}
			)

	def test_create_document_preserves_context(self):
		"""Test that existing context is preserved."""
		result = self.node.execute(
			params={
				'doctype': 'ToDo',
				'field_values': '{"description": "Test preserve context"}',
				'ignore_permissions': True,
			},
			context={'existing_key': 'existing_value'},
		)

		self.assertEqual(
			result.get('existing_key'), 'existing_value'
		)

	def test_create_document_empty_field_values(self):
		"""Test creating document with empty field values."""
		result = self.node.execute(
			params={
				'doctype': 'ToDo',
				'field_values': '{}',
				'ignore_permissions': True,
			}
		)

		self.assertIn('created_doc_name', result)


class TestUpdateDocumentNode(FrappeTestCase):
	"""Tests for the Update Document Node."""

	def setUp(self):
		self.node = UpdateDocumentNode()
		# Create a test document
		self.test_todo = frappe.get_doc({
			'doctype': 'ToDo',
			'description': 'Test original description',
		})
		self.test_todo.insert(ignore_permissions=True)
		frappe.db.commit()

	def tearDown(self):
		# Clean up test ToDos
		for todo in frappe.get_all(
			'ToDo',
			filters={'description': ['like', 'Test%']},
		):
			frappe.delete_doc('ToDo', todo.name, force=True)
		frappe.db.commit()

	def test_update_document_basic(self):
		"""Test updating a document."""
		result = self.node.execute(
			params={
				'doctype': 'ToDo',
				'docname': self.test_todo.name,
				'field_values': '{"description": "Test updated description"}',
				'ignore_permissions': True,
			}
		)

		self.assertIn('updated_doc', result)
		self.assertEqual(
			result['updated_doc']['description'],
			'Test updated description',
		)

		# Verify update in database
		updated_doc = frappe.get_doc('ToDo', self.test_todo.name)
		self.assertEqual(
			updated_doc.description, 'Test updated description'
		)

	def test_update_document_with_template_docname(self):
		"""Test updating document with template-rendered docname."""
		result = self.node.execute(
			params={
				'doctype': 'ToDo',
				'docname': '{{ todo_name }}',
				'field_values': '{"description": "Test template update"}',
				'ignore_permissions': True,
			},
			context={'todo_name': self.test_todo.name},
		)

		self.assertEqual(
			result['updated_doc']['description'],
			'Test template update',
		)

	def test_update_document_with_template_values(self):
		"""Test updating document with template-rendered field values."""
		result = self.node.execute(
			params={
				'doctype': 'ToDo',
				'docname': self.test_todo.name,
				'field_values': '{"description": "Test {{ new_desc }}"}',
				'ignore_permissions': True,
			},
			context={'new_desc': 'dynamic value'},
		)

		self.assertEqual(
			result['updated_doc']['description'],
			'Test dynamic value',
		)

	def test_update_document_missing_doctype_throws(self):
		"""Test that missing doctype throws an error."""
		with self.assertRaises(Exception):
			self.node.execute(
				params={
					'docname': 'some-name',
					'field_values': '{}',
				}
			)

	def test_update_document_missing_docname_throws(self):
		"""Test that missing docname throws an error."""
		with self.assertRaises(Exception):
			self.node.execute(
				params={
					'doctype': 'ToDo',
					'field_values': '{}',
				}
			)

	def test_update_document_preserves_context(self):
		"""Test that existing context is preserved."""
		result = self.node.execute(
			params={
				'doctype': 'ToDo',
				'docname': self.test_todo.name,
				'field_values': '{"description": "Test preserve update"}',
				'ignore_permissions': True,
			},
			context={'existing_key': 'existing_value'},
		)

		self.assertEqual(
			result.get('existing_key'), 'existing_value'
		)

	def test_update_document_nonexistent_throws(self):
		"""Test that updating non-existent document throws."""
		with self.assertRaises(Exception):
			self.node.execute(
				params={
					'doctype': 'ToDo',
					'docname': 'nonexistent-todo-12345',
					'field_values': '{}',
					'ignore_permissions': True,
				}
			)


class TestCreateUpdateDocumentIntegration(FrappeTestCase):
	"""Integration tests for Create and Update document nodes."""

	def setUp(self):
		self.create_node = CreateDocumentNode()
		self.update_node = UpdateDocumentNode()

	def tearDown(self):
		# Clean up test ToDos
		for todo in frappe.get_all(
			'ToDo',
			filters={'description': ['like', 'Test%']},
		):
			frappe.delete_doc('ToDo', todo.name, force=True)
		frappe.db.commit()

	def test_create_then_update_workflow(self):
		"""Test creating a document then updating it."""
		# Create document
		context = self.create_node.execute(
			params={
				'doctype': 'ToDo',
				'field_values': '{"description": "Test initial"}',
				'ignore_permissions': True,
			},
			context={},
		)

		# Update the created document using its name from context
		context = self.update_node.execute(
			params={
				'doctype': 'ToDo',
				'docname': '{{ created_doc_name }}',
				'field_values': '{"description": "Test final"}',
				'ignore_permissions': True,
			},
			context=context,
		)

		# Verify both documents info in context
		self.assertIn('created_doc', context)
		self.assertIn('updated_doc', context)
		self.assertEqual(
			context['updated_doc']['description'], 'Test final'
		)

	def test_chained_context_passing(self):
		"""Test context accumulates through multiple operations."""
		# Create first document
		context = self.create_node.execute(
			params={
				'doctype': 'ToDo',
				'field_values': '{"description": "Test first"}',
				'ignore_permissions': True,
			},
			context={'step': 1},
		)

		first_name = context['created_doc_name']

		# Create second document
		context = self.create_node.execute(
			params={
				'doctype': 'ToDo',
				'field_values': '{"description": "Test second"}',
				'ignore_permissions': True,
			},
			context=context,
		)

		# Verify context accumulation
		self.assertEqual(context['step'], 1)
		self.assertEqual(
			context['created_doc']['description'], 'Test second'
		)
		# First document should still exist
		self.assertTrue(frappe.db.exists('ToDo', first_name))
