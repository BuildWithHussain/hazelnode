import { HazelExecutionNodeLog } from './HazelExecutionNodeLog'

export interface HazelWorkflowExecutionLog{
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
	/**	Workflow : Link - Hazel Workflow	*/
	workflow: string
	/**	Workflow Title : Data	*/
	workflow_title?: string
	/**	Status : Select	*/
	status?: "Success" | "Failure" | "Running"
	/**	Traceback : Code	*/
	traceback?: string
	/**	Trigger Type : Data	*/
	trigger_type?: string
	/**	Trigger Config : Code	*/
	trigger_config?: string
	/**	Node Logs : Table - Hazel Execution Node Log	*/
	node_logs?: HazelExecutionNodeLog[]
	/**	Initial Context : Code	*/
	initial_context?: string
}
