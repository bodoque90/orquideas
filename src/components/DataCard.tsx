// src/components/DataCard.tsx
import React from 'react';
import styled from 'styled-components';
import type { CardProps } from '../types';

// Estilos
const CardContainer = styled.div<{ $isOptimal: boolean }>`
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  min-height: 120px;
`;

const Title = styled.h3`
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
`;

const Value = styled.p`
  font-size: 28px;
  font-weight: bold;
  color: ${props => props.color || '#38A169'}; /* Verde para valores principales */
  margin: 0;
`;

const Range = styled.p`
  font-size: 14px;
  color: #666;
  margin-top: 5px;
`;

const DataCard: React.FC<CardProps> = ({ title, value, range, unit, isOptimal = true }) => {
  // Ajuste para el color de la frecuencia que no tiene rango
  const valueColor = title.includes('Frecuencia') ? '#3182CE' : (isOptimal ? '#38A169' : '#D53F8C');

  return (
    <CardContainer $isOptimal={isOptimal}>
      <Title>{title}</Title>
      <Value color={valueColor}>
        {value}
        {unit && <span style={{ fontSize: '18px', marginLeft: '4px' }}>{unit}</span>}
      </Value>
      {range && <Range>Rango: {range}</Range>}
    </CardContainer>
  );
};

export default DataCard;