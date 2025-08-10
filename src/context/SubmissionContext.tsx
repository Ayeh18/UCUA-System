import React, { createContext, useContext, useState } from 'react';

const SubmissionContext = createContext({
  submissionCount: 0,
  incrementSubmission: () => {},
});

export const useSubmission = () => useContext(SubmissionContext);

export const SubmissionProvider = ({ children }: { children: React.ReactNode }) => {
  const [submissionCount, setSubmissionCount] = useState(0);

  const incrementSubmission = () => {
    setSubmissionCount((prev) => prev + 1);
  };

  return (
    <SubmissionContext.Provider value={{ submissionCount, incrementSubmission }}>
      {children}
    </SubmissionContext.Provider>
  );
};
