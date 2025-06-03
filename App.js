import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, SafeAreaView, TouchableOpacity, Switch } from 'react-native';
import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const windowWidth = Dimensions.get('window').width;

export default function App() {
  // Core calculator state
  const [answerValue, setAnswerValue] = useState("0");
  const [readyToReplace, setReadyToReplace] = useState(true);
  const [operatorValue, setOperatorValue] = useState(0);
  const [mathEquation, setMathEquation] = useState('');
  const [lastCalculation, setLastCalculation] = useState('');
  const [fontSize, setFontSize] = useState(80);
  
  // UI state
  const [darkMode, setDarkMode] = useState(true);

  // Dynamic styling based on mode
  const colorScheme = {
    background: darkMode ? '#101014' : '#f8f9fa',
    displayBg: darkMode ? '#1a1a23' : '#e9ecef',
    textColor: darkMode ? '#ffffff' : '#212529',
    digitButtonBg: darkMode ? '#2d2d39' : '#e9ecef',
    digitButtonShadow: darkMode ? '#222230' : '#d8dbe0',
    operationButtonBg: darkMode ? '#0088ff' : '#0088ff',
    operationButtonShadow: darkMode ? '#0066cc' : '#0077dd',
    specialButtonBg: darkMode ? '#9e9ea7' : '#ced4da',
    specialButtonShadow: darkMode ? '#89898f' : '#b1b6bc',
  };

  // Handle text size based on length
  useEffect(() => {
    if (typeof answerValue === 'string' && answerValue.length > 8) {
      setFontSize(80 - (answerValue.length - 8) * 5);
    } else {
      setFontSize(80);
    }
  }, [answerValue]);

  // Improved button press handling
  const buttonPressed = (value) => {
    // Handle numbers and decimal point
    if (!isNaN(value) || value === '.') {
      handleNumberInput(value);
    }
    // Handle clear
    else if (value === "C") {
      handleClear();
    }
    // Handle basic operations
    else if (["+", "-", "×", "÷", "+/-", "%"].includes(value)) {
      handleOperation(value);
    }
    // Handle equals
    else if (value === "=") {
      handleEquals();
    }
  };

  // Enhanced number input handling
  const handleNumberInput = (value) => {
    if (readyToReplace) {
      if (value === '.') {
        setAnswerValue('0.');
      } else {
        setAnswerValue(String(value));
      }
      setReadyToReplace(false);
      if (operatorValue !== 0) {
        setMathEquation(mathEquation + value);
      } else {
        setMathEquation(String(value));
      }
    } else {
      // Prevent multiple decimals
      if (value === '.' && answerValue.includes('.')) {
        return;
      }
      // Prevent leading zeros
      if (answerValue === '0' && value !== '.') {
        setAnswerValue(String(value));
        setMathEquation(value);
      } else {
        setAnswerValue(answerValue + value);
        setMathEquation(mathEquation + value);
      }
    }
  };

  // Clear handling
  const handleClear = () => {
    setAnswerValue("0");
    setOperatorValue(0);
    setMathEquation('');
    setReadyToReplace(true);
  };

  // Basic operations handling
  const handleOperation = (value) => {
    if (value === "+/-") {
      const current = parseFloat(answerValue);
      setAnswerValue(String(-current));
      return;
    }
    
    const current = parseFloat(answerValue);
    setOperatorValue(value);
    setReadyToReplace(true);
    
    // Update equation display
    const displayOperator = value === "×" ? "×" : 
                            value === "÷" ? "/" : value;
                            
    setMathEquation(`${current} ${displayOperator} `);
  };

  // Enhanced equals handling
  const handleEquals = () => {
    if (operatorValue === 0) return;
    
    const previous = parseFloat(mathEquation.split(' ')[0]);
    const current = parseFloat(answerValue);
    let result;
    
    switch (operatorValue) {
      case "+":
        result = previous + current;
        break;
      case "-":
        result = previous - current;
        break;
      case "×":
        result = previous * current;
        break;
      case "÷":
        result = previous / current;
        break;
      case "%":
        result = previous * (current / 100);
        break;
      default:
        result = current;
    }
    
    // Format the result to avoid unnecessary decimals
    const formattedResult = Number.isInteger(result) ? 
      String(result) : 
      String(parseFloat(result.toFixed(8)));
    
    // Create calculation string for display
    const calculationString = `${previous} ${operatorValue} ${current} = ${formattedResult}`;
    
    setLastCalculation(calculationString);
    
    setAnswerValue(formattedResult);
    setMathEquation('');
    setOperatorValue(0);
    setReadyToReplace(true);
  };

  const renderButton = (text, style, onPress) => {
    let backgroundColor, shadowColor, textColor;
    
    switch(style) {
      case 'operation':
        backgroundColor = colorScheme.operationButtonBg;
        shadowColor = colorScheme.operationButtonShadow;
        textColor = '#ffffff';
        break;
      case 'special':
        backgroundColor = colorScheme.specialButtonBg;
        shadowColor = colorScheme.specialButtonShadow;
        textColor = darkMode ? '#1a1a23' : '#495057';
        break;
      default: // digit
        backgroundColor = colorScheme.digitButtonBg;
        shadowColor = colorScheme.digitButtonShadow;
        textColor = colorScheme.textColor;
    }
    
    return (
      <TouchableOpacity 
        style={[
          styles.buttonContainer,
          { backgroundColor: backgroundColor }
        ]}
        activeOpacity={0.7}
        onPress={() => onPress(text)}
      >
        <View style={[
          styles.buttonInner,
          {
            backgroundColor: backgroundColor,
            shadowColor: shadowColor,
          }
        ]}>
          <Text style={[
            styles.button, 
            { color: textColor }
          ]}>
            {text}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colorScheme.background}]}>
      <StatusBar style={darkMode ? "light" : "dark"} />
      
      {/* Header with theme switch */}
      <View style={styles.header}>
        <View style={styles.switchContainer}>
          <Text style={[styles.switchLabel, {color: colorScheme.textColor}]}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={() => setDarkMode(!darkMode)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={darkMode ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </View>
      
      {/* Main calculator area */}
      <View style={styles.calculatorArea}>
        <View style={[styles.displayArea, {backgroundColor: colorScheme.displayBg}]}>
          <Text style={[styles.equationField, {color: colorScheme.textColor}]}>{mathEquation}</Text>
          <Text style={[styles.resultsField, {color: colorScheme.textColor, fontSize: fontSize}]}>{answerValue}</Text>
          <Text style={[styles.lastCalculation, {color: colorScheme.textColor === '#ffffff' ? '#9e9ea7' : '#6c757d'}]}>{lastCalculation}</Text>
        </View>
        
        <View style={styles.buttonArea}>
          <View style={styles.row}>
            {renderButton("C", 'special', buttonPressed)}
            {renderButton("+/-", 'special', buttonPressed)}
            {renderButton("%", 'special', buttonPressed)}
            {renderButton("÷", 'operation', buttonPressed)}
          </View>

          <View style={styles.row}>
            {renderButton(7, 'digit', buttonPressed)}
            {renderButton(8, 'digit', buttonPressed)}
            {renderButton(9, 'digit', buttonPressed)}
            {renderButton("×", 'operation', buttonPressed)}
          </View>

          <View style={styles.row}>
            {renderButton(4, 'digit', buttonPressed)}
            {renderButton(5, 'digit', buttonPressed)}
            {renderButton(6, 'digit', buttonPressed)}
            {renderButton("-", 'operation', buttonPressed)}
          </View>

          <View style={styles.row}>
            {renderButton(1, 'digit', buttonPressed)}
            {renderButton(2, 'digit', buttonPressed)}
            {renderButton(3, 'digit', buttonPressed)}
            {renderButton("+", 'operation', buttonPressed)}
          </View>

          <View style={styles.row}>
            <TouchableOpacity 
              style={[
                styles.buttonContainer, 
                styles.zeroButton, 
                { backgroundColor: colorScheme.digitButtonBg }
              ]} 
              activeOpacity={0.7}
              onPress={() => buttonPressed(0)}
            >
              <View style={[
                styles.buttonInner,
                styles.zeroButtonInner,
                {
                  backgroundColor: colorScheme.digitButtonBg,
                  shadowColor: colorScheme.digitButtonShadow,
                }
              ]}>
                <Text style={[styles.button, {color: colorScheme.textColor}]}>0</Text>
              </View>
            </TouchableOpacity>
            {renderButton(".", 'digit', buttonPressed)}
            {renderButton("=", 'operation', buttonPressed)}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  switchLabel: {
    marginRight: 8,
    fontWeight: '500',
  },
  calculatorArea: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 15,
  },
  displayArea: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
    marginBottom: 20,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonArea: {
    marginBottom: 20,
  },
  equationField: {
    textAlign: 'right',
    marginRight: 10,
    marginBottom: 10,
    fontSize: 24,
    opacity: 0.7,
    fontFamily: 'System',
  },
  lastCalculation: {
    textAlign: 'right',
    marginRight: 10,
    marginBottom: 10,
    fontSize: 16,
    fontFamily: 'System',
  },
  resultsField: {
    textAlign: 'right',
    marginRight: 10,
    marginBottom: 10,
    fontSize: 80,
    fontWeight: '500',
    fontFamily: 'System',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: (windowWidth - 75) / 4,
    height: (windowWidth - 75) / 4,
    borderRadius: (windowWidth - 75) / 8,
    overflow: 'hidden',
  },
  buttonInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: (windowWidth - 75) / 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  zeroButton: {
    width: (windowWidth - 75) / 2,
  },
  zeroButtonInner: {
    width: '100%',
    alignItems: 'flex-start',
    paddingLeft: ((windowWidth - 75) / 4) / 2,
  },
  button: {
    fontSize: 26,
    fontWeight: '600',
    fontFamily: 'System',
  },
});