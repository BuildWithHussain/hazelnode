app_name = 'hazelnode'
app_title = 'Hazelnode'
app_publisher = 'Build With Hussain'
app_description = 'Workflow Automation for the Frappeverse'
app_email = 'buildwithhussain@gmail.com'
app_license = 'agpl-3.0'
# required_apps = []

export_python_type_annotations = True


page_renderer = [
	'hazelnode.nodes.triggers.hazel_webhook_handler.HazelWebhookHandler'
]

fixtures = [
	{'dt': 'Hazel Node Type', 'filters': {'is_standard': 1}},
	{'dt': 'Hazel Node Event Type', 'filters': {'is_standard': 1}},
]

before_migrate = 'hazelnode.utils.cleanup_hazel_scheduled_events'
after_migrate = 'hazelnode.utils.sync_hazel_scheduled_events'

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/hazelnode/css/hazelnode.css"
# app_include_js = "/assets/hazelnode/js/hazelnode.js"

# include js, css files in header of web template
# web_include_css = "/assets/hazelnode/css/hazelnode.css"
# web_include_js = "/assets/hazelnode/js/hazelnode.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "hazelnode/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "hazelnode/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "hazelnode.utils.jinja_methods",
# 	"filters": "hazelnode.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "hazelnode.install.before_install"
# after_install = "hazelnode.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "hazelnode.uninstall.before_uninstall"
# after_uninstall = "hazelnode.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "hazelnode.utils.before_app_install"
# after_app_install = "hazelnode.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "hazelnode.utils.before_app_uninstall"
# after_app_uninstall = "hazelnode.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "hazelnode.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

doc_events = {
	'*': {
		'after_insert': 'hazelnode.nodes.triggers.hazel_document_event_handler.handle',
		'on_change': 'hazelnode.nodes.triggers.hazel_document_event_handler.handle',
		'after_delete': 'hazelnode.nodes.triggers.hazel_document_event_handler.handle',
	}
}

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"hazelnode.tasks.all"
# 	],
# 	"daily": [
# 		"hazelnode.tasks.daily"
# 	],
# 	"hourly": [
# 		"hazelnode.tasks.hourly"
# 	],
# 	"weekly": [
# 		"hazelnode.tasks.weekly"
# 	],
# 	"monthly": [
# 		"hazelnode.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "hazelnode.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "hazelnode.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "hazelnode.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["hazelnode.utils.before_request"]
# after_request = ["hazelnode.utils.after_request"]

# Job Events
# ----------
# before_job = ["hazelnode.utils.before_job"]
# after_job = ["hazelnode.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"hazelnode.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }


website_route_rules = [
	{
		'from_route': '/hazelnode/<path:app_path>',
		'to_route': 'hazelnode',
	},
]
