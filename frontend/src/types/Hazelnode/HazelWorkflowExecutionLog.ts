export interface HazelWorkflowExecutionLog {
  creation: string;
  name: string;
  modified: string;
  owner: string;
  modified_by: string;
  docstatus: 0 | 1 | 2;
  parent?: string;
  parentfield?: string;
  parenttype?: string;
  idx?: number;
  /**	Workflow : Link - Hazel Workflow	*/
  workflow: string;
  /**	Workflow Title : Data	*/
  workflow_title?: string;
  /**	Amended From : Link - Hazel Workflow Execution Log	*/
  amended_from?: string;
  /**	Status : Select	*/
  status?: 'Success' | 'Failure' | 'Running';
}
