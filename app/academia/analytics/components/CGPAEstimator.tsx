import React, { useState } from 'react';

const CGPAEstimator: React.FC = () => {
    const [grades, setGrades] = useState<number[]>([]);
    const [credits, setCredits] = useState<number[]>([]);
    const [cgpa, setCgpa] = useState<number | null>(null);

    const calculateCGPA = () => {
        if (grades.length !== credits.length || grades.length === 0) {
            alert('Please ensure grades and credits are entered correctly.');
            return;
        }

        const totalCredits = credits.reduce((acc, credit) => acc + credit, 0);
        const weightedSum = grades.reduce((acc, grade, index) => acc + grade * credits[index], 0);

        setCgpa(weightedSum / totalCredits);
    };

    const handleAddCourse = () => {
        setGrades([...grades, 0]);
        setCredits([...credits, 0]);
    };

    const handleGradeChange = (index: number, value: number) => {
        const updatedGrades = [...grades];
        updatedGrades[index] = value;
        setGrades(updatedGrades);
    };

    const handleCreditChange = (index: number, value: number) => {
        const updatedCredits = [...credits];
        updatedCredits[index] = value;
        setCredits(updatedCredits);
    };

    return (
        <div className="cgpa-estimator">
            <h2 className="text-2xl font-semibold">CGPA Estimator</h2>
            {grades.map((_, index) => (
                <div key={index} className="course-input">
                    <input
                        type="number"
                        placeholder="Grade"
                        value={grades[index]}
                        onChange={(e) => handleGradeChange(index, parseFloat(e.target.value))}
                        className="input-grade"
                    />
                    <input
                        type="number"
                        placeholder="Credits"
                        value={credits[index]}
                        onChange={(e) => handleCreditChange(index, parseFloat(e.target.value))}
                        className="input-credit"
                    />
                </div>
            ))}
            <button onClick={handleAddCourse} className="add-course-button">Add Course</button>
            <button onClick={calculateCGPA} className="calculate-button">Calculate CGPA</button>
            {cgpa !== null && <p className="cgpa-result">Your CGPA is: {cgpa.toFixed(2)}</p>}
        </div>
    );
};

export default CGPAEstimator;