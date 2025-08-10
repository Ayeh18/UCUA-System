import React, { createContext, useState } from "react";

interface ReportContextType {
  reportCount: number;
  incrementReportCount: () => void;
}

export const ReportContext = createContext<ReportContextType>({
  reportCount: 0,
  incrementReportCount: () => {},
});

export const ReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reportCount, setReportCount] = useState(0);

  const incrementReportCount = () => setReportCount((prev) => prev + 1);

  return (
    <ReportContext.Provider value={{ reportCount, incrementReportCount }}>
      {children}
    </ReportContext.Provider>
  );
};
