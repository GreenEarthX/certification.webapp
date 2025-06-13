'use client';

import React from 'react';
import { useEffect } from 'react';

// Common question components used for various field types
import QuestionWithSelect from './common/QuestionWithSelect';
import QuestionWithRadio from './common/QuestionWithRadio';
import QuestionWithMultiSelect from './common/QuestionWithMultiSelect';
import QuestionWithTextInput from './common/QuestionWithTextInput';
import QuestionWithDate from './common/QuestionWithDate';
import QuestionWithNumber from './common/QuestionWithNumber';
import QuestionWithRadioGroup from './common/QuestionWithRadioGroup';
import QuestionWithRadioAndInput from './common/QuestionWithRadioAndInput';
import DisabledQuestionWithSelect from './common/DisabledQuestionWithSelect';
import QuestionWithLocationPortion from './common/QuestionWithLocationPortion';
import QuestionWithTextarea from './common/QuestionWithTextarea';


// Field interface describes the shape of a form field
interface Field {
  type: string;
  key: string;
  label: string;
  options?: string[];
  required?: boolean;
  condition?: {
    field: string;
    value: string | string[] | boolean | Record<string, string>;
  };
  withInputKey?: string;
  withInputLabel?: string;
  validation?: {
    maxTotal?: number;
    errorMessage?: string;
  };
}

// Nested subsection of a section
interface Subsection {
  title: string;
  key: string;
  condition?: {
    field: string;
    value: string | string[] | boolean | Record<string, string>;
  };
  fields: Field[];
}

// Top-level section containing fields and optional subsections
interface Section {
  title: string;
  key: string;
  fields: Field[];
  subsections?: Subsection[];
}

// Root schema object
interface Schema {
  sectionKey: string;
  sections: Section[];
}

// Component props
interface Props {
  schema: Schema;
  formData: any;
  onChange: (updated: any) => void;
}

// Main component for rendering the schema-based form
const SchemaFormRenderer: React.FC<Props> = ({ schema, formData, onChange}) => {
  const sectionKey = schema.sectionKey;
  const localData = formData[sectionKey] || {};


  // Handles updating nested form fields and resets hidden ones
  const handleChange = (section: string, keyPath: string, value: any) => {
    const keys = keyPath.split('.');
    const sectionData = { ...(formData[sectionKey]?.[section] || {}) };


    // Set value at nested path
    let target = sectionData;
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      target[k] = target[k] || {};
      target = target[k];
    }
    target[keys[keys.length - 1]] = value;

    const updated = {
      ...formData,
      [sectionKey]: {
        ...formData[sectionKey],
        [section]: sectionData
      }
    };


    // Reset any fields that are hidden due to conditions
    const currentSection = schema.sections.find(s => s.key === section);
    if (!currentSection) return onChange(updated);

    const checkCondition = (condition?: Field['condition']) => {
      if (!condition) return true;
      const actual = getValueFromPath(updated, condition.field);
      const expected = condition.value;

      if (typeof expected === 'object' && !Array.isArray(expected)) {
        return Object.entries(expected).every(([k, v]) => actual?.[k] === v);
      }

      return Array.isArray(expected)
        ? expected.includes(actual)
        : actual === expected;
    };


    // Reset top-level fields
    for (const field of currentSection.fields) {
      if (field.condition && !checkCondition(field.condition)) {
        sectionData[field.key] = field.type === 'multiSelect' ? [] : '';
        if (field.withInputKey) sectionData[field.withInputKey] = '';
      }
    }


    // Reset subsection fields
    currentSection.subsections?.forEach((sub) => {
      const subVisible = sub.condition ? checkCondition(sub.condition) : true;
      const subData = sectionData[sub.key] || {};

      for (const field of sub.fields) {
        const fieldVisible = field.condition ? checkCondition(field.condition) : true;

        if (!subVisible || !fieldVisible) {
          subData[field.key] = field.type === 'multiSelect' ? [] : '';
          if (field.withInputKey) subData[field.withInputKey] = '';
        }
      }

      sectionData[sub.key] = subData;
    });

    updated[sectionKey][section] = sectionData;

    console.log('🧾 Updated formData:', updated);
    onChange(updated);
  };


  // Initializes form data with default values
  const normalizeFormData = (): any => {
    const output: any = { [sectionKey]: {} };

    for (const section of schema.sections) {
      const sectionData: any = {};
      
      for (const field of section.fields) {
        const existing = getValueFromPath(formData, `${sectionKey}.${section.key}.${field.key}`);
        if (field.type === 'locationPortion') {
          sectionData[field.key] =
            Array.isArray(existing) && existing.length > 0
              ? existing
              : [{ country: '', portion: 0 }];
        } else {
          sectionData[field.key] = existing ?? (
            field.type === 'multiSelect' ? [] :
            field.type === 'radio' ? false :
            null
          );
        }
      }

      // Add subsection data
      if (section.subsections) {
        for (const subsection of section.subsections) {
          const isRelevant = shouldShowCondition(subsection.condition);
          const subData: any = {};

          for (const field of subsection.fields) {
            const key = field.key;
            const val = getValueFromPath(formData, `${sectionKey}.${section.key}.${subsection.key}.${key}`);
            subData[key] = val ?? (
              field.type === 'multiSelect' ? [] :
              field.type === 'radio' ? false :
              ''
            );

            if (field.withInputKey) {
              const inputVal = getValueFromPath(formData, `${sectionKey}.${section.key}.${subsection.key}.${field.withInputKey}`);
              subData[field.withInputKey] = inputVal ?? '';
            }
          }

          // Only attach the subsection data if relevant, else nullify
          sectionData[subsection.key] = isRelevant ? subData : null;
        }
      }

      output[sectionKey][section.key] = sectionData;
    }

    return output;
  };


  // Get nested value by string path
  const getValueFromPath = (data: any, path: string): any => {
    return path.split('.').reduce((obj, key) => obj?.[key], data);
  };

  // Check whether a field should be shown based on its condition
  const shouldShowField = (field: Field): boolean => {
    if (!field.condition) return true;

    const actual = getValueFromPath(formData, field.condition.field);
    const expected = field.condition.value;

    if (typeof expected === 'object' && !Array.isArray(expected)) {
      return Object.entries(expected).every(
        ([k, v]) => actual?.[k] === v
      );
    }

    return Array.isArray(expected)
      ? expected.includes(actual)
      : actual === expected;
  };


  // Check whether a condition (field or subsection) is met
  const shouldShowCondition = (condition?: Field['condition']): boolean => {
    if (!condition) return true;

    const actual = getValueFromPath(formData, condition.field);
    const expected = condition.value;

    if (typeof expected === 'object' && !Array.isArray(expected)) {
      return Object.entries(expected).every(([k, v]) => actual?.[k] === v);
    }

    return Array.isArray(expected)
      ? expected.includes(actual)
      : actual === expected;
  };




  // Dynamically renders a field based on its type
  const renderField = (field: Field, section: string, subKey?: string) => {
    const sectionData = localData[section] || {};
    const fieldData = subKey ? sectionData[subKey] || {} : sectionData;
    const value = fieldData[field.key];

    const getInputValue = (key: string) =>
      subKey ? fieldData[key] : sectionData[key];

    const updateValue = (key: string, val: any) =>
      handleChange(section, subKey ? `${subKey}.${key}` : key, val);


    switch (field.type) {
      case 'select':
        return (
          <QuestionWithSelect
            key={field.key}
            question={{ label: field.label, options: field.options || [] }}
            value={value || ''}
            onChange={(val) => updateValue(field.key, val)}
          />
        );

      case 'disabledSelect':
        return (
          <DisabledQuestionWithSelect
            key={field.key}
            question={{ label: field.label, options: field.options || [] }}
            value={value || ''}
            onChange={(val) => updateValue(field.key, val)}
          />
        );  

      case 'radio':
        return (
          <QuestionWithRadio
            key={field.key}
            label={field.label}
            checked={value}
            onCheck={(val) => updateValue(field.key, val)}
          />
        );

      case 'radioWithInput':
        return (
          <QuestionWithRadioAndInput
            key={field.key}
            label={field.label}
            checked={value || false}
            percentage={getInputValue(field.withInputKey || '') || ''}
            onCheck={(val) => updateValue(field.key, val)}
            onPercentageChange={(val) => updateValue(field.withInputKey || '', val)}
            onPercentageBlur={() => {}}
          />
        );

      case 'radioGroup':
        return (
          <QuestionWithRadioGroup
            key={field.key}
            label={field.label}
            value={value || ''}
            options={field.options || []}
            onChange={(val) => updateValue(field.key, val)}
          />
        );

      case 'multiSelect':
        return (
          <QuestionWithMultiSelect
            key={field.key}
            label={field.label}
            options={field.options || []}
            selected={value || []}
            onChange={(val) => updateValue(field.key, val)}
          />
        );

      case 'text':
        return (
          <QuestionWithTextInput
            key={field.key}
            label={field.label}
            value={value || ''}
            onChange={(val) => updateValue(field.key, val)}
          />
        );

      case 'number':
        return (
          <QuestionWithNumber
            key={field.key}
            label={field.label}
            value={value || ''}
            onChange={(val) => updateValue(field.key, val)}
          />
        );

      case 'date':
        return (
          <QuestionWithDate
            key={field.key}
            label={field.label}
            value={value || ''}
            onChange={(val) => updateValue(field.key, val)}
          />
        );

      case 'textarea':
        return (
          <QuestionWithTextarea
            key={field.key}
            label={field.label}
            value={value || ''}
            onChange={(val) => updateValue(field.key, val)}
          />
        );

      case 'locationPortion':
        return (
          <QuestionWithLocationPortion
            key={field.key}
            label={field.label}
            value={value || []}
            onChange={(val) => updateValue(field.key, val)}
            validation={field.validation}
          />
        );

      default:
        return null;
    }
  };


  // Final component render: render sections and output
  return (
    <div className="space-y-6">
     {schema.sections.map((section) => (
        <div key={section.key} className="bg-white shadow rounded-lg p-6 mb-4">
            <h3 className="text-md font-semibold text-gray-800 mb-4">{section.title}</h3>
            {section.fields.filter((f) => shouldShowField(f)).map((field) => (
              <React.Fragment key={field.key}>{renderField(field, section.key)}</React.Fragment>
            ))}

            {section.subsections?.map((subsection) => {
              const shouldShowSub = shouldShowCondition(subsection.condition);

              if (!shouldShowSub) return null;


              return (
                <div key={subsection.key} className="mt-6 border-t pt-4 space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700">{subsection.title}</h4>
                  {subsection.fields
                    .filter((subField) => shouldShowField(subField))
                    .map((subField) => (
                      <React.Fragment key={subField.key}>
                        {renderField(subField, section.key, subsection.key)}
                      </React.Fragment>
                  ))}
                </div>
              );
            })}

        </div>
      ))}
    </div>
  );
};

export default SchemaFormRenderer;
