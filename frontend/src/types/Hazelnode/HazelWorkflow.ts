import { HazelNode } from './HazelNode'
import { HazelNodeConnection } from './HazelNodeConnection'

export interface HazelWorkflow{
	name: number
	creation: string
	modified: string
	owner: string
	modified_by: string
	docstatus: 0 | 1 | 2
	parent?: string
	parentfield?: string
	parenttype?: string
	idx?: number
	/**	Enabled? : Check	*/
	enabled?: 0 | 1
	/**	Title : Data	*/
	title: string
	/**	Trigger Type : Link - Hazel Node Type	*/
	trigger_type?: string
	/**	Trigger Config : JSON	*/
	trigger_config?: any
	/**	Nodes : Table - Hazel Node	*/
	nodes?: HazelNode[]
	/**	Connections : Table - Hazel Node Connection	*/
	connections?: HazelNodeConnection[]
}
