import React from 'react';
import { currencyImages } from '../utils/constants';

function CurrencyInput({ 
  platinum, 
  gold, 
  silver, 
  copper, 
  handleChange 
}) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      <div className="flex items-center">
        <input
          type="number"
          value={platinum === "0" ? "" : platinum}
          onChange={handleChange}
          name="Platinum"
          className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full"
          placeholder="0"
          min="0"
          max="999"
        />
        <img 
          src={currencyImages.platinum || "/placeholder.svg"} 
          alt="Platinum" 
          title="Platinum"
          className="h-7 w-7 ml-2 object-contain" 
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="number"
          value={gold === "0" ? "" : gold}
          onChange={handleChange}
          name="Gold"
          className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full"
          placeholder="0"
          min="0"
          max="999"
        />
        <img 
          src={currencyImages.gold || "/placeholder.svg"} 
          alt="Gold" 
          title="Gold"
          className="h-7 w-7 ml-2 object-contain" 
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="number"
          value={silver === "0" ? "" : silver}
          onChange={handleChange}
          name="Silver"
          className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full"
          placeholder="0"
          min="0"
          max="999"
        />
        <img 
          src={currencyImages.silver || "/placeholder.svg"} 
          alt="Silver" 
          title="Silver"
          className="h-7 w-7 ml-2 object-contain" 
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="number"
          value={copper === "0" ? "" : copper}
          onChange={handleChange}
          name="Copper"
          className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full"
          placeholder="0"
          min="0"
          max="999"
        />
        <img 
          src={currencyImages.copper || "/placeholder.svg"} 
          alt="Copper" 
          title="Copper"
          className="h-7 w-7 ml-2 object-contain" 
        />
      </div>
    </div>
  );
}

export default CurrencyInput;
