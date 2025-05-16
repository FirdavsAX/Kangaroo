import React, { useState } from "react";
import "./../styles/Input.css";

interface InputProps {
  onSolve: (params: {
    g: string;
    p: string;
    h: string;
    a: string;
    b: string;
    stepFunction: string;
  }) => void;
}

const Input: React.FC<InputProps> = ({ onSolve }) => {
  const [g, setG] = useState("");
  const [h, setH] = useState("");
  const [p, setP] = useState("");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [stepFunction, setStepFunction] = useState("1");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSolve({ g, p, h, a, b, stepFunction });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="g">Generator (g):</label>
        <input
          type="text"
          id="g"
          value={g}
          onChange={(e) => setG(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="h">Target Value (h):</label>
        <input
          type="text"
          id="h"
          value={h}
          onChange={(e) => setH(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="p">Prime Modulus (p):</label>
        <input
          type="text"
          id="p"
          value={p}
          onChange={(e) => setP(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="a">Lower Bound (a):</label>
        <input
          type="text"
          id="a"
          value={a}
          onChange={(e) => setA(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="b">Upper Bound (b):</label>
        <input
          type="text"
          id="b"
          value={b}
          onChange={(e) => setB(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="stepFunction">Step Function (e.g., 'n % 5 + 2'):</label>
        <input
          type="text"
          id="stepFunction"
          value={stepFunction}
          onChange={(e) => setStepFunction(e.target.value)}
        />
      </div>
      <button type="submit">Solve</button>
    </form>
  );
};

export default Input;
