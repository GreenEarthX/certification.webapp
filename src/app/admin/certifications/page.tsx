import { Suspense } from "react";
import CertificationClient from "./CertificationClient";

const CertificationPage =() => {

  return (
   <Suspense fallback={<div className="p-6">Loading...</div>}>
    <CertificationClient />
   </Suspense>  
  );
};

export default CertificationPage;
