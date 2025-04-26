"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import { Container, Divider, Typography } from "@mui/material";

import { api } from "~/trpc/react";

import ChatRow from "./_components/ChatRow";

export default function HelpChatPage() {
  // TODO: Add pagination
  
  const { data: session } = useSession();
  const year = session?.user?.year;

  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);

  const {
    data,
    isLoading,
    refetch,
  } = api.helpChat.getLatestAdminHelpChats.useQuery(
    { page, pageSize },
    {
      enabled: !!year, // Only fetch when year is defined
    }
  );

  useEffect(() => {
    if (year) {
      refetch();
    }
  }, [year, refetch]);

  return (
    <Container className="flex flex-col gap-4 py-4">
      <Typography variant="h5" color="primary" className="px-4">
        Help Chats
      </Typography>
      <Divider />
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="flex flex-col gap-2">
          {data?.data?.map((message) => (
            <ChatRow {...message} key={message.participant.id} />
          ))}
        </div>
      )}
    </Container>
  );
}
