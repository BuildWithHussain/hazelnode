
export interface HazelExecutionNodeLog{
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
	/**	Node Type : Data	*/
	node_type: string
	/**	Context : Code	*/
	context?: string
	/**	Output : Code	*/
	output?: string
	/**	Event : Data	*/
	event?: string
	/**	Params : Code	*/
	params?: string
}
