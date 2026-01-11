"""Utility functions for workflow nodes."""

import json

import frappe


def parse_json_field(
	field_value: str, context: dict, field_name: str = 'field'
) -> dict:
	"""
	Parse a JSON string field, rendering any template variables.

	Args:
	    field_value: The JSON string to parse (or dict if already parsed)
	    context: The workflow context for template rendering
	    field_name: Name of the field for error messages

	Returns:
	    Parsed dictionary

	Raises:
	    frappe.ValidationError: If JSON is invalid
	"""
	if not field_value:
		return {}

	try:
		if isinstance(field_value, str):
			# Render template variables first
			rendered = frappe.render_template(
				field_value, context or {}
			)
			return json.loads(rendered)
		elif isinstance(field_value, dict):
			return field_value
		else:
			return {}
	except json.JSONDecodeError:
		frappe.throw(f'Invalid JSON in {field_name}: {field_value}')


def render_template_field(value: str, context: dict) -> str:
	"""
	Render template variables in a string field.

	Args:
	    value: The string that may contain {{variable}} templates
	    context: The workflow context for template rendering

	Returns:
	    Rendered string
	"""
	if not value or not isinstance(value, str):
		return value or ''

	if '{{' in value:
		return frappe.render_template(value, context or {})

	return value


def ensure_context(context) -> dict:
	"""Ensure context is a dictionary."""
	return context if isinstance(context, dict) else {}
