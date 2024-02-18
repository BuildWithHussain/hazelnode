import frappe
import requests

from . import Node


class HTTPRequestNode(Node):
	def execute(self, event, params=None, context=None):
		event_title = frappe.db.get_value(
			'Hazel Node Event Type', event, 'title'
		)

		print(event, event_title)

		if event_title == 'GET':
			url = params.get('url')
			if not url:
				frappe.throw(
					'URL is required to make HTTP GET Request'
				)
			response = requests.get(url)
			print('Response', response.json())
			return response
