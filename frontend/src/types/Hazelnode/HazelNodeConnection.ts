export interface HazelNodeConnection {
	name: string
	creation: string
	modified: string
	owner: string
	modified_by: string
	docstatus: 0 | 1 | 2
	parent?: string
	parentfield?: string
	parenttype?: string
	idx?: number
	/**	Source Node ID : Data	*/
	source_node_id: string
	/**	Source Handle : Select - Which output handle this connection comes from	*/
	source_handle?: "default" | "true" | "false"
	/**	Target Node ID : Data	*/
	target_node_id: string
}
