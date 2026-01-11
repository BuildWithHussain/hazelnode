export interface HazelNode{
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
	/**	Node ID : Data - Unique identifier for this node within the workflow	*/
	node_id: string
	/**	Type : Link - Hazel Node Type	*/
	type: string
	/**	Kind : Select	*/
	kind?: "Trigger" | "Action"
	/**	Position X : Int	*/
	position_x?: number
	/**	Position Y : Int	*/
	position_y?: number
	/**	Event : Link - Hazel Node Event Type	*/
	event?: string
	/**	Parameters : JSON	*/
	parameters?: any
}
