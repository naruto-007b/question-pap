const validateCourseCreation = (data) => {
  const errors = [];
  
  if (!data.code) {
    errors.push('Course code is required');
  } else if (typeof data.code !== 'string') {
    errors.push('Course code must be a string');
  } else if (!/^[A-Za-z0-9]+$/.test(data.code)) {
    errors.push('Course code must be alphanumeric');
  } else if (data.code.length < 2 || data.code.length > 10) {
    errors.push('Course code must be between 2 and 10 characters');
  }
  
  if (!data.name) {
    errors.push('Course name is required');
  } else if (typeof data.name !== 'string') {
    errors.push('Course name must be a string');
  } else if (data.name.trim().length < 3 || data.name.trim().length > 100) {
    errors.push('Course name must be between 3 and 100 characters');
  }
  
  if (!Array.isArray(data.units)) {
    errors.push('Units must be an array');
  } else if (data.units.length !== 4) {
    errors.push('Exactly 4 units are required');
  } else {
    data.units.forEach((unit, index) => {
      const unitErrors = validateUnitData(unit, index + 1);
      errors.push(...unitErrors);
    });
  }
  
  if (!Array.isArray(data.cos)) {
    errors.push('Course outcomes must be an array');
  } else if (data.cos.length !== 6) {
    errors.push('Exactly 6 course outcomes are required');
  } else {
    data.cos.forEach((co, index) => {
      const coErrors = validateCOData(co, index + 1);
      errors.push(...coErrors);
    });
  }
  
  return errors;
};

const validateUnitData = (unit, unitNumber) => {
  const errors = [];
  
  if (!unit) {
    errors.push(`Unit ${unitNumber} is missing`);
    return errors;
  }
  
  if (unit.unit_number === undefined) {
    errors.push(`Unit ${unitNumber}: unit_number is required`);
  } else if (typeof unit.unit_number !== 'number' || unit.unit_number < 1 || unit.unit_number > 4) {
    errors.push(`Unit ${unitNumber}: unit_number must be between 1 and 4`);
  }
  
  if (!unit.content) {
    errors.push(`Unit ${unitNumber}: content is required`);
  } else if (typeof unit.content !== 'string') {
    errors.push(`Unit ${unitNumber}: content must be a string`);
  } else if (unit.content.trim().length < 10) {
    errors.push(`Unit ${unitNumber}: content must be at least 10 characters`);
  }
  
  return errors;
};

const validateCOData = (co, coNumber) => {
  const errors = [];
  
  if (!co) {
    errors.push(`CO${coNumber} is missing`);
    return errors;
  }
  
  if (co.co_number === undefined) {
    errors.push(`CO${coNumber}: co_number is required`);
  } else if (typeof co.co_number !== 'number' || co.co_number < 1 || co.co_number > 6) {
    errors.push(`CO${coNumber}: co_number must be between 1 and 6`);
  }
  
  if (!co.description) {
    errors.push(`CO${coNumber}: description is required`);
  } else if (typeof co.description !== 'string') {
    errors.push(`CO${coNumber}: description must be a string`);
  } else if (co.description.trim().length < 10) {
    errors.push(`CO${coNumber}: description must be at least 10 characters`);
  }
  
  return errors;
};

module.exports = {
  validateCourseCreation,
  validateUnitData,
  validateCOData
};
