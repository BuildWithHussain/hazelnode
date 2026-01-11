import time

from hazelnode.nodes import Node


class DelayNode(Node):
	"""
	Pauses workflow execution for a specified duration.
	Note: For long delays, consider using scheduled jobs instead.
	"""

	def execute(self, event=None, params=None, context=None):
		context = context or {}

		delay_seconds = params.get('delay_seconds', 0)

		try:
			delay_seconds = int(delay_seconds)
		except (ValueError, TypeError):
			delay_seconds = 0

		# Limit delay to prevent abuse (max 60 seconds for synchronous execution)
		delay_seconds = min(delay_seconds, 60)

		if delay_seconds > 0:
			time.sleep(delay_seconds)

		return context
