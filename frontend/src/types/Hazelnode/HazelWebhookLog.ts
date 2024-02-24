
export interface HazelWebhookLog{
	creation: string
	name: string
	modified: string
	owner: string
	modified_by: string
	docstatus: 0 | 1 | 2
	parent?: string
	parentfield?: string
	parenttype?: string
	idx?: number
	/**	Webhook : Link - Hazel Webhook Listener	*/
	webhook: string
	/**	Response Status : Select	*/
	response_status?: "Success" | "Failure"
	/**	Context : Code	*/
	context?: string
}
