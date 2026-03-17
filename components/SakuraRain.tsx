
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import SakuraPetal from './SakuraPetal';

const SakuraRain: React.FC = () => {
  // 生成 20 个花瓣
  const petals = Array.from({ length: 20 });

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {petals.map((_, index) => (
        <SakuraPetal key={index} />
      ))}
    </div>
  );
};

export default SakuraRain;
