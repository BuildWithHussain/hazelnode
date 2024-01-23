export {};

import type { HazelWorkflow as DocTypeWorkflow } from '@/types/Hazelnode/HazelWorkflow';
import type { HazelNode as DocTypeHazelNode } from '@/types/Hazelnode/HazelNode';
import type { HazelWorkflowExecutionLog as DocTypeHazelWorkflowExecutionLog } from '@/types/Hazelnode/HazelWorkflowExecutionLog';
import type { HazelNodeType as DocTypeHazelNodeType } from '@/types/Hazelnode/HazelNodeType';

declare global {
  type HazelWorkflow = DocTypeWorkflow;
  type HazelNode = DocTypeHazelNode;
  type HazelWorkflowExecutionLog = DocTypeHazelWorkflowExecutionLog;
  type HazelNodeType = DocTypeHazelNodeType;
}
