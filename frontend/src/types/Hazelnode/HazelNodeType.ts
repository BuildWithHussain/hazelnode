import { HazelEventParam } from './HazelEventParam'

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
	/**	Kind : Select	*/
	kind: "Trigger" | "Action"
	/**	Handler Path : Data - Dotted path to the handler class	*/
	handler_path?: string
	/**	Is Standard? : Check	*/
	is_standard?: 0 | 1
	/**	Params : Table - Hazel Event Param	*/
	params?: HazelEventParam[]
}
