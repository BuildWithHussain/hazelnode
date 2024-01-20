import frappe


@frappe.whitelist()
def get_current_user_info():
    current_user = frappe.session.user

    return frappe.db.get_value(
        "User", current_user, ["full_name", "user_image"], as_dict=True
    )
