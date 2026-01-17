const validateBlueprintCreation = (data) => {
  const errors = [];

  if (!data.name) {
    errors.push('Blueprint name is required');
  } else if (typeof data.name !== 'string') {
    errors.push('Blueprint name must be a string');
  } else if (data.name.trim().length < 3 || data.name.trim().length > 255) {
    errors.push('Blueprint name must be between 3 and 255 characters');
  }

  if (!data.structure) {
    errors.push('Blueprint structure is required');
  } else if (typeof data.structure !== 'object') {
    errors.push('Blueprint structure must be an object');
  } else {
    const structureErrors = validateBlueprintStructure(data.structure);
    errors.push(...structureErrors);
  }

  return errors;
};

const validateBlueprintStructure = (structure) => {
  const errors = [];

  if (!structure.part_a) {
    errors.push('Part A structure is required');
  } else {
    const partAErrors = validatePartA(structure.part_a);
    errors.push(...partAErrors);
  }

  if (!structure.part_b) {
    errors.push('Part B structure is required');
  } else if (!Array.isArray(structure.part_b)) {
    errors.push('Part B must be an array');
  } else if (structure.part_b.length !== 4) {
    errors.push('Part B must have exactly 4 question groups');
  } else {
    structure.part_b.forEach((group, index) => {
      const groupErrors = validatePartBGroup(group, index + 1);
      errors.push(...groupErrors);
    });
  }

  return errors;
};

const validatePartA = (partA) => {
  const errors = [];

  if (typeof partA !== 'object') {
    errors.push('Part A must be an object');
    return errors;
  }

  if (!partA.num_questions) {
    errors.push('Part A: num_questions is required');
  } else if (typeof partA.num_questions !== 'number' || partA.num_questions !== 5) {
    errors.push('Part A: num_questions must be 5');
  }

  if (!partA.marks) {
    errors.push('Part A: marks is required');
  } else if (typeof partA.marks !== 'number' || partA.marks !== 2) {
    errors.push('Part A: marks must be 2');
  }

  if (!partA.co_distribution) {
    errors.push('Part A: co_distribution is required');
  } else if (!Array.isArray(partA.co_distribution)) {
    errors.push('Part A: co_distribution must be an array');
  } else if (partA.co_distribution.length !== 5) {
    errors.push('Part A: co_distribution must have 5 COs (1-5)');
  } else {
    const expectedCOs = [1, 2, 3, 4, 5];
    partA.co_distribution.forEach((co, index) => {
      if (co !== expectedCOs[index]) {
        errors.push(`Part A: co_distribution[${index}] must be ${expectedCOs[index]}`);
      }
    });
  }

  return errors;
};

const validatePartBGroup = (group, groupNumber) => {
  const errors = [];

  if (!group) {
    errors.push(`Part B Group ${groupNumber}: group is missing`);
    return errors;
  }

  if (typeof group !== 'object') {
    errors.push(`Part B Group ${groupNumber}: must be an object`);
    return errors;
  }

  if (!group.group) {
    errors.push(`Part B Group ${groupNumber}: group is required`);
  } else if (typeof group.group !== 'number') {
    errors.push(`Part B Group ${groupNumber}: group must be a number`);
  } else if (group.group < 6 || group.group > 9) {
    errors.push(`Part B Group ${groupNumber}: group must be between 6 and 9`);
  }

  if (!group.marks) {
    errors.push(`Part B Group ${groupNumber}: marks is required`);
  } else if (typeof group.marks !== 'number') {
    errors.push(`Part B Group ${groupNumber}: marks must be a number`);
  } else if (![5, 6, 8].includes(group.marks)) {
    errors.push(`Part B Group ${groupNumber}: marks must be 5, 6, or 8`);
  }

  if (!group.num_options) {
    errors.push(`Part B Group ${groupNumber}: num_options is required`);
  } else if (typeof group.num_options !== 'number' || group.num_options !== 2) {
    errors.push(`Part B Group ${groupNumber}: num_options must be 2`);
  }

  if (!group.co) {
    errors.push(`Part B Group ${groupNumber}: co is required`);
  } else if (typeof group.co !== 'number') {
    errors.push(`Part B Group ${groupNumber}: co must be a number`);
  } else if (group.co < 1 || group.co > 6) {
    errors.push(`Part B Group ${groupNumber}: co must be between 1 and 6`);
  }

  return errors;
};

module.exports = {
  validateBlueprintCreation,
  validateBlueprintStructure,
  validatePartA,
  validatePartBGroup
};
