"use client";

import {
  Box,
  CircularProgress,
  Container,
  Divider,
  Typography,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";

import FaqRow from "./components/FaqRow";
import NewfaqModal from "./NewFaq";

function Page() {
  const { data: session } = useSession();
  const year = session?.user?.year;

  const {
    data: allFaqs,
    isLoading,
    refetch,
} = api.faq.getFaqs.useQuery(undefined, {
    enabled: !!year,
});

useEffect(() => {
  if (year) {
    refetch();
  }
}, [year, refetch]);
  return (
    <>
      <Container className="flex flex-col gap-4 py-4">
        <div className="flex flex-row justify-between">
          <Typography variant="h5" color="primary" className="px-4">
            All Faqs
          </Typography>
          <div className="flex gap-2">
            <NewfaqModal />
          </div>
        </div>
        <Divider />
        {isLoading && (
          <Container className="h-96 w-full flex justify-center items-center">
            <CircularProgress />
          </Container>
        )}
        {
          <Box className="flex flex-col gap-2">
            {allFaqs &&
              allFaqs.map((faqs) => (
                <FaqRow
                  id={faqs.id}
                  key={faqs.id}
                  question={faqs.question}
                  answer={faqs.answer}
                  createdAt={faqs.createdAt}
                  author={faqs.author}
                />
              ))}
          </Box>
        }
      </Container>
    </>
  );
}

export default Page;
