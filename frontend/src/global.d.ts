export {};

import type { HazelWorkflow as DocTypeWorkflow } from '@/types/Hazelnode/HazelWorkflow';
import type { HazelNode as DocTypeHazelNode } from '@/types/Hazelnode/HazelNode';
import type { HazelWorkflowExecutionLog as DocTypeHazelWorkflowExecutionLog } from '@/types/Hazelnode/HazelWorkflowExecutionLog';
import type { HazelNodeType as DocTypeHazelNodeType } from '@/types/Hazelnode/HazelNodeType';
import type { HazelNodeEventType as DocTypeHazelNodeEventType } from './types/Hazelnode/HazelNodeEventType';
import type { HazelEventParam as DocTypeHazelEventParam } from './types/Hazelnode/HazelEventParam';

declare global {
  type HazelWorkflow = DocTypeWorkflow;
  type HazelNode = DocTypeHazelNode;
  type HazelWorkflowExecutionLog = DocTypeHazelWorkflowExecutionLog;
  type HazelNodeType = DocTypeHazelNodeType;
  type HazelNodeEventType = DocTypeHazelNodeEventType;
  type HazelEventParam = DocTypeHazelEventParam;
}
