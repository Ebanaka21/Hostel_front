import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div className="mx-auto w-max-full text-center justify-center bg-[#1A1A1A]">
      {children}
    </div>
  );
};

export default Container;