import React from 'react';
import { currencyImages } from '../utils/constants';

function CurrencyInput({ 
  platinum, 
  gold, 
  silver, 
  copper, 
  handleChange, 
  handleKeyPress,
  priceDisplayMode, 
  setPriceDisplayMode 
}) {
  return (
    <div className="flex flex-row gap-x-2 mb-4 items-center w-full justify-between">
      <div className="flex items-center flex-grow min-w-0">
        <input
          type="number"
          value={platinum === "0" ? "" : platinum}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          name="Platinum"
          className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white flex-grow min-w-0"
          placeholder="0"
          min="0"
          max="999"
          inputMode="numeric"
          pattern="[0-9]*"
        />
        <img 
          src={currencyImages.platinum || "/placeholder.svg"} 
          alt="Platinum" 
          title="Platinum"
          className="h-7 w-7 ml-2 object-contain" 
        />
      </div>
      
      <div className="flex items-center flex-grow min-w-0">
        <input
          type="number"
          value={gold === "0" ? "" : gold}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          name="Gold"
          className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white flex-grow min-w-0"
          placeholder="0"
          min="0"
          max="999"
          inputMode="numeric"
          pattern="[0-9]*"
        />
        <img 
          src={currencyImages.gold || "/placeholder.svg"} 
          alt="Gold" 
          title="Gold"
          className="h-7 w-7 ml-2 object-contain" 
        />
      </div>
      
      <div className="flex items-center flex-grow min-w-0">
        <input
          type="number"
          value={silver === "0" ? "" : silver}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          name="Silver"
          className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white flex-grow min-w-0"
          placeholder="0"
          min="0"
          max="999"
          inputMode="numeric"
          pattern="[0-9]*"
        />
        <img 
          src={currencyImages.silver || "/placeholder.svg"} 
          alt="Silver" 
          title="Silver"
          className="h-7 w-7 ml-2 object-contain" 
        />
      </div>
      
      <div className="flex items-center flex-grow min-w-0">
        <input
          type="number"
          value={copper === "0" ? "" : copper}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          name="Copper"
          className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white flex-grow min-w-0"
          placeholder="0"
          min="0"
          max="999"
          inputMode="numeric"
          pattern="[0-9]*"
        />
        <img 
          src={currencyImages.copper || "/placeholder.svg"} 
          alt="Copper" 
          title="Copper"
          className="h-7 w-7 ml-2 object-contain" 
        />
        <select
          value={priceDisplayMode}
          onChange={e => setPriceDisplayMode(e.target.value)}
          className="border rounded dark:bg-gray-800 text-black dark:text-white text-sm h-10 px-2 ml-2 min-w-[60px] w-auto"
        >
          <option value="Each">Each</option>
          <option value="Total">Total</option>
        </select>
      </div>
    </div>
  );
}

export default CurrencyInput;
