import { WorkflowList } from '@/components/workflows/list';

export default function App() {
  return (
    <div className="w-full">
      <div className="mx-auto my-8 sm:max-w-[60%] px-2">
        <WorkflowList />
      </div>
    </div>
  );
}
