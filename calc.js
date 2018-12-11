(function(){
const calc = document.getElementById('calculator'),
      expressionLine = document.getElementById('expressionLine'),
      display = document.getElementById('display'),
      history = document.getElementById('history');

calc.addEventListener('click', btnPress);
window.addEventListener('keypress', keyPress);

const NUMBER = 'NUMBER',
      MATH_OPERATOR = 'MATH_OPERATOR',
      BACKSPACE = 'BACKSPACE',
      DOT = 'DOT',
      CLEAR = 'CLEAR',
      EQUALS = 'EQUALS',
      PERCENT = 'PERCENT';


function setButtonsDisabledStateForNumberEdit(state) {
  const operatorButtons = document.getElementsByClassName('button-operator'),
        clearButton = document.getElementsByClassName('button-clear')[0],
        equals = document.getElementsByClassName('button-equals')[0];
  clearButton.disabled = state;

  for (var i = 0; i < operatorButtons.length; i++) {
    operatorButtons[i].disabled = state;
  }

  if (state) {
    equals.textContent = 'OK';
  } else {
    equals.textContent = '=';
  }
}


function setButtonsDisabledStateForOperatorEdit(state) {
  const numberButtons = document.getElementsByClassName('button-number');
  const clearButton = document.getElementsByClassName('button-clear')[0];
  const backspaceButton = document.getElementsByClassName('button-backspace')[0];
  const dotButton = document.getElementsByClassName('button-dot')[0];
  const percentButton = document.getElementsByClassName('button-percent')[0];
  const equals = document.getElementsByClassName('button-equals')[0];
  clearButton.disabled = state;
  backspaceButton.disabled = state;
  dotButton.disabled = state;
  percentButton.disabled = state;

  for (var i = 0; i < numberButtons.length; i++) {
    numberButtons[i].disabled = state;
  }

  if (state) {
    equals.textContent = 'OK';
  } else {
    equals.textContent = '=';
  }
}


const Expression = function() {
  let expressionElements = [],
      calculated = false,
      result = null,
      edited = false;

  this.isCalculated = function() {
    return calculated;
  }

  this.isEdited = function() {
    return edited;
  }

  this.addToHistory = function() {
    const divider = document.createElement('DIV');
    divider.className = 'divider';
    const result = expressionLine.cloneNode(true);
    result.removeAttribute('id');
    history.appendChild(result);
    history.appendChild(divider);
  }

  this.isFirst = () => {
    if (expressionElements.length > 1) {
      return false;
    } else {
      return true;
    }
  }

  this.addElement = function(value, Element) {
    const element = new Element(value, result);
    element.onclick = () => {
      this.current.finishEdit();
      this.current = element;
      this.current.edit();
      edited = true;
    }

    expressionElements.push(element);
    this.current = element;
  }

  this.finishEdit = function() {
    this.current.finishEdit();
    this.current = expressionElements[expressionElements.length-1];

    if (this.isCalculated()) {
      this.calculate();
    }

    edited = false;
  }

  this.removeLast = function() {
    if (this.isFirst()) return;

    expressionElements[expressionElements.length-1].remove();
    expressionElements.pop();
    this.current = expressionElements[expressionElements.length-1];
  }

  this.clear = function() {
    expressionElements = [];
    expressionLine.innerHTML = '';
    this.addElement(0, _Number);
    calculated = false;
  }

  this.calculate = function() {
    let result;

    if (this.isFirst()) return;

    if (this.current instanceof Operator) {
      this.removeLast();
    }

    result = eval(expressionElements.join(''));
    result = +result.toFixed(10);

    if (Number.isNaN(result)) {
      this.printResult(0);
    } else {
      this.printResult(result);
    }

    calculated = true;
  }

  this.printResult = function(value) {
    if (!this.isCalculated()) {
      const equals = document.createElement('SPAN');
      equals.className = 'expression-element no-cursor';
      result = document.createElement('SPAN');
      result.className = 'expression-element no-cursor';
      equals.textContent = '=';
      expressionLine.appendChild(equals);
      expressionLine.appendChild(result);
    }
    result.textContent = value;
  }

  this.addElement(0, _Number);
}


function _Number(initValue) {
  const span = document.createElement('SPAN');
  let float = false;
  let value = initValue;
  let edited = false;
  let oldValue;

  span.textContent = value;
  span.className = 'expression-element';  

  span.onclick = () => {
    this.onclick();
  }

  this.isOneSymbol = () => {
    if (span.textContent.length > 1) {
      return false;
    } else {
      return true;
    }
  }

  this.addChar = function(character) {
    if (edited && value === null) {
      span.textContent = value = character;
      return;
    }

    if (float) {
      value += character;
      span.textContent = value;
      return;
    }

    if (!float && +span.textContent === 0) {
      value = character;
    } else {
      value += character;      
    }

    span.textContent = value;
  }

  this.getValue = function() {
    return +value;
  }

  this.addDot = function() {
    if (float) return;

    if (edited) {
      value = oldValue + '.';
    } else {
      value = value + '.';
    }

    span.textContent = value;
    float = true;
  }

  this.setPercent = function() {
    let result;

    if (edited && !float) {
      value = +oldValue;
    } else {
      value = +value;
    }

    if (!float && value === 0) return;

    result = value / 100;
    span.textContent = value = +result.toFixed(10);

    float = true;
  }

  this.reset = function() {
    span.textContent = value = 0;
    float = false;
  }

  this.deleteChar = function() {
    if (span.textContent[span.textContent.length-1] === '.') {
      float = false;
    }

    if (edited && value === null) {
      value = oldValue.toString().slice(0, -1);
    } else {
      value = value.toString().slice(0, -1);
    }

    span.textContent = value;
  }

  this.remove = function() {
    expressionLine.removeChild(span);
  }

  this.edit = function() {
    setButtonsDisabledStateForNumberEdit(true);
    edited = true;
    span.className = "expression-element edited";
    oldValue = value;
    value = null;
  }

  this.finishEdit = function() {
    setButtonsDisabledStateForNumberEdit(false);
    edited = false;
    span.className = "expression-element";
    if (value === null) {
      value = oldValue;
    }
  }

  this.toString = function() {
    return value;
  }

  expressionLine.appendChild(span);
}


function Operator(operator) {
  const span = document.createElement('SPAN');
  let value = operator;

  span.textContent = operator;
  span.className = 'expression-element';

  span.onclick = () => {
    this.onclick();
  }

  this.setOperator = function(operator) {
    span.textContent = value = operator;
  }

  this.remove = function() {
    expressionLine.removeChild(span);
  }

  this.edit = function() {
    setButtonsDisabledStateForOperatorEdit(true);
    span.className = "expression-element edited";
  }

  this.finishEdit = function() {
    setButtonsDisabledStateForOperatorEdit(false);
    span.className = "expression-element";
  }

  this.toString = function() {
    return value;
  }

  expressionLine.appendChild(span);
}


function keyPress(e) {
  const character = String.fromCharCode(e.which);
  
  switch ( getTypeOfKeyCode(e.which) ) {
    case NUMBER: handleNumberPress(character);
      break;
    case BACKSPACE:
      e.preventDefault(); 
      handleBackspacePress();
      break;
    case MATH_OPERATOR: handleOperatorPress(character);
      break;
    case CLEAR: expression.clear();
      break;
    case DOT: handleDotPress();
      break;
    case PERCENT: handlePercentPress();
      break;
    case EQUALS: handlePressEquals();
      break;
  }
  
  display.scrollBy(0, 100);
}


function btnPress(e) {
  if (e.target.nodeName != 'BUTTON') return;

  const which = +e.target.getAttribute('data-which');
  const character = String.fromCharCode(which);

  switch ( getTypeOfKeyCode(which) ) {
    case NUMBER: handleNumberPress(character);
      break;
    case BACKSPACE: handleBackspacePress();
      break;
    case MATH_OPERATOR: handleOperatorPress(character);
      break;
    case CLEAR: expression.clear();
      break;
    case DOT: handleDotPress();
      break;
    case PERCENT: handlePercentPress();
      break;
    case EQUALS: handlePressEquals();
      break;
  }

  display.scrollBy(0, 100);
}


function handleDotPress() {
  if ( expression.isCalculated() && !expression.isEdited() ) {
    expression.addToHistory();
    expression.clear();
  }

  if (expression.current instanceof _Number) {
    expression.current.addDot();
  }
}


function handlePercentPress() {
  if (!(expression.current instanceof _Number)) return;
    expression.current.setPercent();
}


function handleNumberPress(character) {
  if ( expression.isCalculated() && !expression.isEdited() ) {
    expression.addToHistory();
    expression.clear();
  }


  if (expression.current instanceof _Number) {
    expression.current.addChar(character);
  } else {
    expression.addElement(character, _Number);
  }

}


function handleOperatorPress(character) {
  if ( expression.isCalculated() && !expression.isEdited() ) return;

  if (expression.current instanceof Operator) {
    expression.current.setOperator(character);
  } else {
    expression.addElement(character, Operator);
  }
}


function handlePressEquals() {
  if (expression.isEdited()) {
    expression.finishEdit();
    return;
  }

  if (expression.isCalculated()) {
    expression.addToHistory();
    expression.clear();
    return;
  }

  expression.calculate();
}


function handleBackspacePress() {
  if ( expression.isCalculated() && !expression.isEdited() ) {
    expression.addToHistory();
    expression.clear();
    return;
  }

  if ( expression.current instanceof _Number &&
       expression.current.isOneSymbol() &&
       expression.isFirst() ) {
    expression.current.reset();
  } else if ( expression.current instanceof _Number &&
              expression.current.isOneSymbol() && 
              !expression.isFirst() &&
              !expression.isEdited() ) {
    expression.removeLast();
  } else if ( expression.current instanceof _Number &&
              expression.current.isOneSymbol() && 
              !expression.isFirst() &&
              expression.isEdited() ) {
    expression.current.reset();
  } else if (expression.current instanceof _Number && !expression.current.isOneSymbol()) {
    expression.current.deleteChar();
  } else if (expression.current instanceof Operator) {
    expression.removeLast();
  }
}


function getTypeOfKeyCode(which) {
  if (which > 47 && which < 58) {
    return NUMBER;
  } else if (which === 8) {
    return BACKSPACE;
  } else if ([42,43,45,47].filter(n => n === which).length) {
    return MATH_OPERATOR;
  } else if (which === 18) {
    return CLEAR;
  } else if (which === 46) {
    return DOT;
  } else if (which === 61) {
    return EQUALS;
  } else if (which === 37) {
    return PERCENT;
  }
}

const expression = new Expression();

})();