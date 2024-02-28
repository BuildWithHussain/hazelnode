from hazelnode.utils import (
	cleanup_hazel_scheduled_events,
	sync_hazel_scheduled_events,
)


def before_migrate():
	cleanup_hazel_scheduled_events()


def after_migrate():
	sync_hazel_scheduled_events()
