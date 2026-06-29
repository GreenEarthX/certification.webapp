import SchemaBuilderEditor from "./SchemaBuilderEditor";
import SchemaFormRenderer from "./SchemaFormRenderer";
import { SectionSchema } from "@/services/plants/fetchPlantAPI";
import { useSchemaBuilderEditor } from "@/hooks/admin/manage-plants-details/useSchemaBuilderEditor";
import { FiTrash2, FiPlus } from "react-icons/fi";

interface Props {
  sectionKey: string;
  title: string;
  value: SectionSchema;
  onChange: (val: SectionSchema) => void;
}

// Main component that combines schema building and form rendering
export default function SchemaEditor({ title, value, onChange }: Props) {
  const {
    schema,
    formData,
    setFormData,
    newSectionTitle,
    setNewSectionTitle,
    newSectionKey,
    setNewSectionKey,
    handleAddField,
    handleRemoveField,
    handleAddSection,
    handleRemoveSection,
    handleUpdateField,
    handleMoveField, 
    getAllFieldPaths,
  } = useSchemaBuilderEditor(value, onChange);

  const confirmAndRemoveSection = (key: string, title: string) => {
    const confirmed = window.confirm(`Are you sure you want to remove the section "${title}"? This cannot be undone.`);
    if (confirmed) handleRemoveSection(key);
  };


  return (
    <div className="border rounded p-4 mb-6 bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-blue-700">{title}</h2>

      {/* Render each existing section using the SchemaBuilderEditor */}
      {schema.sections.map((section) => (
        <div key={section.key} className="relative mb-6">
          <SchemaBuilderEditor
            sectionKey={section.key}
            sectionTitle={section.title}
            fields={section.fields}
            allFieldPaths={getAllFieldPaths()}
            onAddField={(field) => handleAddField(section.key, field)}
            onRemoveField={(index) => handleRemoveField(section.key, index)}
            onUpdateField={(index, field) => handleUpdateField(section.key, index, field)}
            onMoveField={(index, direction) => handleMoveField(section.key, index, direction)}
          />
          <button
            onClick={() => { confirmAndRemoveSection(section.key, section.title); }}
            className="absolute top-4 right-4 flex items-center gap-1 border border-red-500 text-red-500 px-3 py-1.5 text-sm rounded hover:bg-red-50 transition"
          >
            <FiTrash2 /> Remove Section
          </button>
        </div>
      ))}


      {/* UI to add a new section with a title and key */}
      <div className="flex flex-col md:flex-row items-start gap-2 mb-4">
        <input
          className="border p-2 w-full md:w-1/3"
          placeholder="Section Title"
          value={newSectionTitle}
          onChange={(e) => setNewSectionTitle(e.target.value)}
        />
        <input
          className="border p-2 w-full md:w-1/3"
          placeholder="Section Key"
          value={newSectionKey}
          onChange={(e) => setNewSectionKey(e.target.value)}
        />
        <button
          onClick={handleAddSection}
          className="flex items-center gap-2 border border-green-500 text-green-600 px-4 py-2 rounded hover:bg-green-50 transition"
        >
          <FiPlus /> Add Section
        </button>
      </div>

      <hr className="my-6" />

      {/* Render the form based on the schema */}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Preview Form</h3>
      <SchemaFormRenderer
        schema={schema}
        formData={formData}
        onChange={setFormData}
      />
    </div>
  );
}
