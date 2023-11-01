const fs = require('fs');
const csv = require('csv-parser');

function hardBracketToKatex(answer, characterType) {
  const basicExpressions = ['NumbersWhole', 'NumbersRational', 'AlgebraBasic', 'AlgebraAdvanced', 'Operators', 'GeneralMath'];
  const units = ['Units', 'NumbersAndUnits', 'Time'];
  const unitsWithoutSpace = ['Currency', 'GeomAngles', 'Percent'];
  const coordinates = ['GeomCoordinate'];

  if (basicExpressions.includes(characterType)) {
    return convertExpression(answer);
  }
  else if (units.includes(characterType)){
    // Strip whitespace
    answer = answer.replace(/\s+/g, '');

    // Extract the numeric part (all characters until a letter is reached)
    const numericPartMatch = answer.match(/^[^a-zA-Z]+/);
    const numericPart = numericPartMatch ? numericPartMatch[0] : '';
    const stringWithoutNumeric = answer.slice(numericPart.length);

    // Extract the unit part (all characters until "^" is reached)
    const unitPartMatch = stringWithoutNumeric.match(/^[^^]+/);
    const unitPart = unitPartMatch ? unitPartMatch[0] : '';
    const stringWithoutUnit = stringWithoutNumeric.slice(unitPart.length);

    // The remaining part is the optional exponent part
    const exponentPart = stringWithoutUnit.trim();
    if (exponentPart.length>0){
      return convertExpression(numericPart) + " " + unitPart + convertExpression(exponentPart);
    }
    else{
      return convertExpression(numericPart) + " " + unitPart;
    }
  }
  else if (unitsWithoutSpace.includes(characterType)){
    answer = answer.replace((/kr/g, ' kr')) // adding space before kr, an exception to the no space rule hehe
    answer = answer.replace(/\$/g, '\\$'); // adding breaking character since dollar is what we use to wrap katex
    return answer
  }
  else if (coordinates.includes(characterType)){
    const match = answer.match(/\(([^,]+),([^)]+)\)/);
    if (match){
      const x = convertExpression(match[1]).replace(/\$/g, '');
      const y = convertExpression(match[2]).replace(/\$/g, '');
      return `$(${x},${y})$`
    }
    else{
      return answer;
    }

  }

  return "NOT SUPPORTED YET";
}











function replaceExponent(input){}

function convertExpression(expression) {
  // Numbers, minus sign, latin letters, greek letters
  const charGroup = '[0-9a-zA-Z-αβγδεζηθικλμνξοπρστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ]';

  // Patterns
  const percentagePattern = /(\d+(\.|,)?\d*|\([\w\s+-/*]+\))%/;
  const exponentPattern = new RegExp(`\\^\\[?(${charGroup}+)\\]?`, 'g');
  const sqrtPattern = new RegExp(`√\\[(${charGroup}+)\\]`, 'g');


  // Percentage
  expression = expression.replace(percentagePattern, "$1\\%");

  // Fractions
  expression = fractionToObject(expression);

  // Exponents
  expression = expression.replace(exponentPattern, "^{$1}");

  // Square roots
  expression = expression.replace(sqrtPattern, "\\sqrt{$1}");

  // Replace , with {,}
  expression = expression.replace(/,/g, "{,}");

  // Replace * with ×
  expression = expression.replace(/\*/g, '×');


  // Greek character to LaTeX replacements (condensed for readability)
  const greekToLatexMap = {'α': '\\alpha', 'β': '\\beta', 'γ': '\\gamma', 'δ': '\\delta', 'ε': '\\epsilon', 'ζ': '\\zeta', 'η': '\\eta', 'θ': '\\theta', 'ι': '\\iota', 'κ': '\\kappa', 'λ': '\\lambda', 'μ': '\\mu', 'ν': '\\nu', 'ξ': '\\xi', 'ο': 'o', 'π': '\\pi', 'ρ': '\\rho', 'σ': '\\sigma', 'τ': '\\tau', 'υ': '\\upsilon', 'φ': '\\phi', 'χ': '\\chi', 'ψ': '\\psi', 'ω': '\\omega', 'Α': 'A', 'Β': 'B', 'Γ': '\\Gamma', 'Δ': '\\Delta', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'H', 'Θ': '\\Theta', 'Ι': 'I', 'Κ': 'K', 'Λ': '\\Lambda', 'Μ': 'M', 'Ν': 'N', 'Ξ': '\\Xi', 'Ο': 'O', 'Π': '\\Pi', 'Ρ': 'P', 'Σ': '\\Sigma', 'Τ': 'T', 'Υ': '\\Upsilon', 'Φ': '\\Phi', 'Χ': 'X', 'Ψ': '\\Psi', 'Ω': '\\Omega'};
  for (const [char, latex] of Object.entries(greekToLatexMap)) {
    const regex = new RegExp(char, 'g');
    expression = expression.replace(regex, latex);
  }

  // Return the converted expression wrapped in dollar signs
  return `$${expression}$`;
}

function disassemble(string, destructor) {
  let initial = string
  let prev = initial
  while (initial) {
    initial = destructor(initial)
    if(initial === prev) return
    prev = initial
  }
}

function findExternalBrackets(input){
  let counter = 0
  let start = -1
  for (let i = 0; i < input.length; i++) {
    if (input[i] === '[') {
      counter++;
      if(start === -1) start = i
    } else if (input[i] === ']') {
      counter--;
    }
    if (counter === 0 && start !== -1) return {start, end: i,};
  }
  return null
}

function findExternalFractionPosition(input) {
  let counter = 0
  let start = -1
  let operator = -1
  for (let i = 0; i < input.length; i++) {
    if (input[i] === '[') {
      counter++;
      if(start === -1) start = i
    } else if (input[i] === ']') {
      counter--;
    }
    if(start === -1) continue
    if (counter === 0) {
      if(operator === -1) return null;
      return {start, operator, end: i,};
    }
    if (counter === 1 && input[i] === '/') operator = i
  }
  return null
}

function fractionToObject(input, position){
  return {
    type: 'frac',
    start: position.start,
    end: position.end,
    numerator: bracketsToObject(input.slice(position.start + 1, position.operator)),
    denominator: bracketsToObject(input.slice(position.operator + 1, position.end)),
  }
}


function sqrtToObject(input, position){
  return {
    type: 'sqrt',
    start: position.start,
    end: position.end,
    value: bracketsToObject(input.slice(position.start + 1, position.end)),
  }
}

function exponentToObject(input, position){
  return {
    type: 'exp',
    start: position.start,
    end: position.end,
    value: bracketsToObject(input.slice(position.start + 1, position.end)),
  }
}

function formatText(value){
  return value.replace(/([%$])/g, '\\$1').replace(/π/g, '\\pi')
}

function bracketsToObject(input){
  const nodes = []
  disassemble(input, (current) => {
    const isFrac = /^\[.+\/.+]/.test(current)

    if(isFrac){
      const position = findExternalFractionPosition(current)
      if(!position) {
        const unwrappedFrac = current.match(/^\[.+]\/\[.+]/)
        if(unwrappedFrac?.[0]) return current.replace(unwrappedFrac, `[${unwrappedFrac}]`)
        return current
      }
      const frac = fractionToObject(current, position)
      nodes.push(frac)
      return current.slice(frac.end + 1)
    }
    const isSqrt = /^√\[/.test(current)
    if(isSqrt){
      const position = findExternalBrackets(current)
      if(!position) return current
      const sqrt =sqrtToObject(current, position)
      nodes.push(sqrt)
      return current.slice(sqrt.end + 1)
    }
    const isExponent = /^\^\[/.test(current)
    if(isExponent){
      const position = findExternalBrackets(current)
      if(!position) return current
      const exp = exponentToObject(current, position)
      nodes.push(exp)
      return current.slice(exp.end + 1)
    }
    const isGroup = /^\[/.test(current)
    if(isGroup){
      const position = findExternalBrackets(current)
      if(!position) return current
      return current.slice(position.start + 1, position.end) + current.slice(position.end + 1)
    }
    const nonExpression = current.match(/^[\w=\-+.,×()]+/)?.[0]
    if(nonExpression){
      nodes.push({
        type: 'text',
        value: formatText(nonExpression)
      })
      return current.slice(nonExpression.length)
    }
    nodes.push({
      type: 'text',
      value: formatText(current),
    })
    return ''
  })
  return nodes
}

function objectToKatex(nodes){
  return nodes.reduce((acc, node) => {
    if(node.type === 'frac'){
      return acc + `\\frac{${objectToKatex(node.numerator)}}{${objectToKatex(node.denominator)}}`
    }
    if(node.type === 'sqrt'){
      return acc + `\\sqrt{${objectToKatex(node.value)}}`
    }
    if(node.type === 'exp'){
      return acc + `^{${objectToKatex(node.value)}}`
    }
    return acc + node.value
  }, '')
}


const units = /(min)|(gal)|(AM)|(pm)|(mm)|(cm)|(km)|(mi)|(qt)|(yd)|(ft)|(in)|(oz)|m|s|l/

function divideUnits(input){
  const unitsDerived = input.match(units)
  if(!unitsDerived) return {major: input, units: ''}
  const unitsPart = input.slice(unitsDerived.index)
  const nonUnitPart = unitsPart.replace(unitsDerived[0], '')
  if(!nonUnitPart) {
    return {
      major: input.slice(0, unitsDerived.index),
      units: ` ${unitsPart}`,
    };
  }
  const katex = objectToKatex(bracketsToObject(nonUnitPart))
  return {
    major: input.slice(0, unitsDerived.index),
    units: ` ${unitsDerived[0]}$${katex}$`
  }
}
function toKatex(value){
  const separated = divideUnits(value)
  const object = bracketsToObject(separated.major)
  const katex = objectToKatex(object).trim()
  if(katex.startsWith('\\$')) return katex
  if(katex !== value || /[=\-+,×:()><]/.test(value) || /^\d+$/.test(katex)) return `$${katex}$${separated.units}`
  return `${separated.major}${separated.units}`
}



let results = [];
fs.createReadStream('input.csv')
  .pipe(csv())
  .on('data', (row) => {
    let convertedAnswer = toKatex(row['answer'], row['characterType']);
    row['converted'] = convertedAnswer;

    row['status'] = (row['katex'] === convertedAnswer) ? 'Passed' : 'Failed';

    results.push(row);
  })
  .on('end', () => {
    // Sort results so that 'Passed' comes before 'Failed'
    results.sort((a, b) => {
      if (a.status === 'Passed' && b.status === 'Failed') return -1;
      if (a.status === 'Failed' && b.status === 'Passed') return 1;
      return 0;
    });

    console.table(results);
  });
