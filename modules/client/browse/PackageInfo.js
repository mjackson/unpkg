import React, { createContext, useContext } from 'react';

const Context = createContext();

export function PackageInfoProvider({ children, ...rest }) {
  return <Context.Provider children={children} value={rest} />;
}

export function usePackageInfo() {
  return useContext(Context);
}
