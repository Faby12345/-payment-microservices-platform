import React from 'react';
import { cn } from '../../../utils/cn';

interface ${COMPONENT_NAME}Props {
  className?: string;
  children?: React.ReactNode;
}

export const ${COMPONENT_NAME}: React.FC<${COMPONENT_NAME}Props> = ({ className, children }) => {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
};
