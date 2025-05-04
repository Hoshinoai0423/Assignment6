export function getTree(data, attributes) {
    if (attributes.length === 0) {
      return [];
    }
  
    const attr = attributes[0];
  
    // Label mapping for better display
    const labelMap = {
      heart_disease: { "0": "Heart Disease: No", "1": "Heart Disease: Yes" },
      hypertension: { "0": "Hypertension: No", "1": "Hypertension: Yes" },
      ever_married: { "Yes": "Ever Married: Yes", "No": "Ever Married: No" },
      gender: { "Male": "Gender: Male", "Female": "Gender: Female", "Other": "Gender: Other" },
      stroke: { "0": "Stroke: No", "1": "Stroke: Yes" },
    };
  
    const groups = {};
    data.forEach(d => {
      const rawValue = d[attr];
      const label = labelMap[attr]?.[rawValue] ?? `${attr}: ${rawValue}`;
      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(d);
    });
  
    const children = Object.entries(groups).map(([label, records]) => {
      if (attributes.length === 1) {
        return {
          name: label,
          value: records.length
        };
      } else {
        return {
          name: label,
          children: getTree(records, attributes.slice(1))
        };
      }
    });
  
    return children;
  } 