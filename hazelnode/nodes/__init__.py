from abc import ABC, abstractmethod


class Node(ABC):
	@abstractmethod
	def execute(self, event, params=None, context=None):
		...
