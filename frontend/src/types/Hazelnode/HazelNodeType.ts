
export interface HazelNodeType{
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
	/**	Preview Image : Attach Image	*/
	preview_image?: string
	/**	Description : Small Text	*/
	description?: string
}
