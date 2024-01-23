import { HazelNode } from './HazelNode';

export interface HazelWorkflow {
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
  /**	Enabled? : Check	*/
  enabled?: 0 | 1;
  /**	Title : Data	*/
  title: string;
  /**	Nodes : Table - Hazel Node	*/
  nodes?: HazelNode[];
}
