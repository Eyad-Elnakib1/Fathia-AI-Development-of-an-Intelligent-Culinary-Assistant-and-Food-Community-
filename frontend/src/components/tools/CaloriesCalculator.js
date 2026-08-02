import React, { useState, useEffect } from 'react';
import './CaloriesCalculator.css';
import Navbar from '../common/Navbar';
import ThemeToggle from '../common/ThemeToggle';

const CaloriesCalculator = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState('sedentary');
  const [calories, setCalories] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('themePreference');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let darkMode = true;
    if (savedTheme === 'light') darkMode = false;
    else if (!savedTheme && !prefersDark) darkMode = false;
    setIsDarkMode(darkMode);
    document.documentElement.style.setProperty('--on', darkMode ? 0 : 1);
    applyTheme(darkMode);
  }, []);

  const applyTheme = (darkMode) => {
    document.documentElement.style.setProperty('--bg', darkMode ? 'var(--bg-dark)' : 'var(--bg-light)');
    document.documentElement.style.setProperty('--text-color', darkMode ? 'var(--text-dark)' : 'var(--text-light)');
    document.documentElement.style.setProperty('--shadow-color', darkMode ? 'var(--shadow-dark)' : 'var(--shadow-light)');
    document.documentElement.style.setProperty('--menu-bg', darkMode ? 'var(--menu-bg-dark)' : 'var(--menu-bg-light)');
    document.documentElement.style.setProperty('--menu-hover', darkMode ? 'var(--menu-hover-dark)' : 'var(--menu-hover-light)');
    document.documentElement.style.setProperty('--icon-bg', darkMode ? 'var(--icon-bg-dark)' : 'var(--icon-bg-light)');
    document.documentElement.style.setProperty('--bg-recipe-container', darkMode ? 'var(--bg-recipe-container-dark)' : 'var(--bg-recipe-container-light)');
  };

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.style.setProperty('--on', newDarkMode ? 0 : 1);
    applyTheme(newDarkMode);
    localStorage.setItem('themePreference', newDarkMode ? 'dark' : 'light');
  };

  const calculateCalories = (e) => {
    e.preventDefault();
    if (!age || !weight || !height) {
      alert('Please fill in all fields.');
      return;
    }

    const ageNum = parseInt(age, 10);
    const weightKg = parseFloat(weight);
    const heightCm = parseFloat(height);

    let bmr;
    if (gender === 'male') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum - 161;
    }

    const activityMultipliers = {
      sedentary: 1.2,
      lightlyActive: 1.375,
      moderatelyActive: 1.55,
      veryActive: 1.725,
      extremelyActive: 1.9,
    };

    const tdee = Math.round(bmr * activityMultipliers[activityLevel]);
    setCalories(tdee);
  };

  return (
    <div className="calculator-page">
      <img src="/images/ff.png" alt="Fridge Fusion Logo" className="fridge-logo" />

      <Navbar activePage="/calculator" />

      <div className="fridge-container">
        <div className="fridge-title">CALORIES CALCULATOR</div>
        <div className="fridge-search-container">
          <div className="fridge-placeholder" />
          <ThemeToggle toggleTheme={toggleTheme} />
        </div>
      </div>

      <div className="calculator-container">
        <div className="calculator-card">
          <h2 className="calculator-title">Calculate Your Daily Calorie Needs</h2>
          <form className="calculator-form" onSubmit={calculateCalories}>
            <div className="calculator-form-group">
              <label htmlFor="age">Age (years)</label>
              <input
                type="number"
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
                required
              />
            </div>
            <div className="calculator-form-group">
              <label htmlFor="weight">Weight (kg)</label>
              <input
                type="number"
                id="weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter your weight"
                step="0.1"
                required
              />
            </div>
            <div className="calculator-form-group">
              <label htmlFor="height">Height (cm)</label>
              <input
                type="number"
                id="height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="Enter your height"
                step="0.1"
                required
              />
            </div>
            <div className="calculator-form-group">
              <label htmlFor="gender">Gender</label>
              <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="calculator-form-group">
              <label htmlFor="activityLevel">Activity Level</label>
              <select id="activityLevel" value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)}>
                <option value="sedentary">Sedentary (little or no exercise)</option>
                <option value="lightlyActive">Lightly Active (light exercise/sports 1-3 days/week)</option>
                <option value="moderatelyActive">Moderately Active (moderate exercise/sports 3-5 days/week)</option>
                <option value="veryActive">Very Active (hard exercise/sports 6-7 days/week)</option>
                <option value="extremelyActive">Extremely Active (very hard exercise/sports & physical job)</option>
              </select>
            </div>
            <button type="submit" className="calculator-submit-button">Calculate</button>
          </form>
          {calories !== null && (
            <div className="calculator-result">
              <h3>Your Daily Calorie Needs</h3>
              <p>{calories} kcal/day</p>
              <p className="calculator-note">
                This is an estimate of your Total Daily Energy Expenditure (TDEE) based on the Mifflin-St Jeor Equation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaloriesCalculator;
