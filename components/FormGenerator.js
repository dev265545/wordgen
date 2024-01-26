// DynamicFormGenerator.js
import React from 'react';

const DynamicFormGenerator = ({ data }) => {
    const handleClick = ()=>{
        
    }
  const renderFields = (fields) => {
    return fields.map((field, index) => (
      <div key={index}>
        <label>{field}:</label>
        <input type="text" name={field} />
      </div>
    ));
  };

  const renderArrayFields = (array) => {
    return array.map((item, index) => (
      <div key={index}>
        {renderFields(Object.keys(item))}
      </div>
    ));
  };

  return (
    <form className='text-black bg-gray-200'>
      {Object.entries(data).map(([key, value]) => (
        <div key={key}>
          <label>{key}:</label>
          {Array.isArray(value) ? renderArrayFields(value) : <input type="text" name={key} />}
        </div>
      ))}
      <button onClick={()=>{handleClick()}} type="submit">Submit</button>
    </form>
  );
};

export default DynamicFormGenerator;
