import React, { Suspense } from "react";
import Result from "./client/Result";

const ResultPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Result />
    </Suspense>
  );
};

export default ResultPage;
