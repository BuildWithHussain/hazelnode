
export interface HazelEventParam{
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
	/**	Title : Data	*/
	title: string
	/**	Fieldtype : Select	*/
	fieldtype: "Data" | "Check" | "Number" | "Date" | "Select" | "Link"
	/**	Fieldname : Data	*/
	fieldname: string
	/**	Options : Small Text	*/
	options?: string
}
