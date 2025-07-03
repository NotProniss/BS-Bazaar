import React from 'react';
import { currencyImages } from './constants';

// Helper to format time ago as HH:MM Ago, supports ms timestamps
export function formatTimeAgo(dateInput) {
  if (!dateInput) return '';
  let created;
  if (typeof dateInput === 'number') {
    created = new Date(dateInput);
  } else if (!isNaN(Number(dateInput))) {
    created = new Date(Number(dateInput));
  } else {
    created = new Date(dateInput);
  }
  if (isNaN(created.getTime())) return '';
  const now = new Date();
  const diffMs = now - created;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay > 0) {
    return `${diffDay} Day${diffDay > 1 ? 's' : ''} Ago`;
  } else if (diffHour > 0) {
    return `${diffHour} Hour${diffHour > 1 ? 's' : ''} Ago`;
  } else if (diffMin > 0) {
    return `${diffMin} Min${diffMin > 1 ? 's' : ''} Ago`;
  } else {
    return `${diffSec} Second${diffSec !== 1 ? 's' : ''} Ago`;
  }
}

export function formatPrice(totalCopper) {
  // 1 platinum = 1,000,000,000 copper
  // 1 gold = 1,000,000 copper
  // 1 silver = 1,000 copper
  // 1 copper = 1 copper
  const platinum = Math.floor(totalCopper / 1000000000)
  const gold = Math.floor((totalCopper % 1000000000) / 1000000)
  const silver = Math.floor((totalCopper % 1000000) / 1000)
  const copper = totalCopper % 1000

  const parts = []
  if (platinum) parts.push(
    <span key="Platinum" style={{display: 'inline-flex', alignItems: 'center', fontSize: '1.5rem', fontWeight: 700, lineHeight: 1}}>
      {platinum}
      <img src={currencyImages.platinum || "/placeholder.svg"} alt="Platinum" title="Platinum" style={{height: '2em', width: '2em', marginLeft: '0.25em', objectFit: 'contain', flexShrink: 0}} />
    </span>
  )
  if (gold) parts.push(
    <span key="Gold" style={{display: 'inline-flex', alignItems: 'center', fontSize: '1.5rem', fontWeight: 700, lineHeight: 1}}>
      {gold}
      <img src={currencyImages.gold || "/placeholder.svg"} alt="Gold" title="Gold" style={{height: '2em', width: '2em', marginLeft: '0.25em', objectFit: 'contain', flexShrink: 0}} />
    </span>
  )
  if (silver) parts.push(
    <span key="Silver" style={{display: 'inline-flex', alignItems: 'center', fontSize: '1.5rem', fontWeight: 700, lineHeight: 1}}>
      {silver}
      <img src={currencyImages.silver || "/placeholder.svg"} alt="Silver" title="Silver" style={{height: '2em', width: '2em', marginLeft: '0.25em', objectFit: 'contain', flexShrink: 0}} />
    </span>
  )
  if (copper || parts.length === 0) parts.push(
    <span key="Copper" style={{display: 'inline-flex', alignItems: 'center', fontSize: '1.5rem', fontWeight: 700, lineHeight: 1}}>
      {copper}
      <img src={currencyImages.copper || "/placeholder.svg"} alt="Copper" title="Copper" style={{height: '2em', width: '2em', marginLeft: '0.25em', objectFit: 'contain', flexShrink: 0}} />
    </span>
  )
  return <>{parts}</>
}

export function calculateTotalCopper(platinum, gold, silver, copper) {
  return (
    Number.parseInt(platinum || 0) * 1000000000 +
    Number.parseInt(gold || 0) * 1000000 +
    Number.parseInt(silver || 0) * 1000 +
    Number.parseInt(copper || 0)
  );
}
