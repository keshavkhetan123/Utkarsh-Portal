"use client";

import { Container, Divider, Typography } from "@mui/material";

import NOCCard from "./_components/NOCCard.tsx"; // You should create this component similar to ResumeCard

interface INOCSection {
  nocs: { name: string; src: string; id: string; createdAt: Date }[];
}


export default function NOCSection({ nocs }: INOCSection) {
    console.log(nocs);
    return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row justify-between items-center">
        <Typography variant="h5" color="primary" className="px-2">
          NOC
        </Typography>
      </div>
      <Divider />
      {nocs? (
        <NOCCard src={nocs} />
      ) : (
        <div className="flex flex-col justify-center items-center py-20">
          <Typography variant="h6" color="textSecondary">
            NOC not available
          </Typography>
        </div>
      )}
    </div>
  );
}
