// app/spec-dynamic/page.tsx (example)
import DynamicEntityForm from "./DynamicEntityForm";
import { exampleEntityDefinition } from "./exampleEntityDefinition";

export default function Page() {
  return (
    <div className="min-h-screen bg-white py-10">
      <DynamicEntityForm definition={exampleEntityDefinition} />
    </div>
  );
}
