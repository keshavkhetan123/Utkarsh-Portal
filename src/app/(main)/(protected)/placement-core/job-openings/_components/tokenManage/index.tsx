"use client";

import { Avatar, Button, Container, Paper, Typography } from "@mui/material";
import Alert from "@mui/material/Alert";
import React, { useEffect, useState } from "react";
import { api } from "~/trpc/react";

interface TokenProps {
  company: {
    name: string;
    logo: string;
  };
  token: string;
}

export default function Token(props: TokenProps) {
    const {data:data , isLoading} = api.hrToken.adminGetTokenStatus.useQuery({
        token:props.token
    });

    const [disabled,setDisabled] = useState(true);
    useEffect(() => {
        const temp = isLoading?true:!data.data.viewPermissions;
        setDisabled(temp);
    },[isLoading,data])

    

    if(!isLoading){
    console.log(data);
    console.log(disabled);
    }
    
    const disable = api.hrToken.adminDisableToken.useMutation({
        onSuccess: (data) => {
            setDisabled(true);
        }
    });
    const enable = api.hrToken.adminEnableToken.useMutation({
        onSuccess: (data) => {
            setDisabled(false);
        }
    });
    const handleClickDisable = () => {
        disable.mutate({ token: props.token });
    }
    const handleClickEnable = () => {
        enable.mutate({ token: props.token });
    }
  return (
    <Paper className="flex flex-col py-3 px-3">
      <div className="flex items-start justify-between mt-3">
        <div className="flex flex-col items-center">
          <Avatar
            alt="Company Logo"
            src={props.company.logo}
            variant="square"
            style={{
              borderRadius: "8px",
              width: 48,
              height: 48,
            }}
          />
          <Typography variant="body2" className="mt-1 text-center">
            {props.company.name}
          </Typography>
        </div>

        {disabled
        ?<Container maxWidth="sm" disableGutters>
            <Alert severity="warning">
                <strong className="text-gray-400 line-through">{props.token}</strong>
            </Alert>
        </Container>
        :<Container maxWidth="sm" disableGutters>
          <Alert severity="info">
            <strong>{props.token}</strong>
          </Alert>
        </Container>
        }
        <div className="ml-2">
        {disabled
        ?<Button
            variant="outlined"
            color="primary"
            className="inline-flex p-2 min-w-0"
            onClick={handleClickEnable}
            disabled={!disabled}
        >
            Enable
        </Button>
        :<Button
            variant="outlined"
            color="primary"
            className="inline-flex p-2 min-w-0"
            onClick={handleClickDisable}
            disabled={disabled}
        >
            Disable
        </Button>
        }
        </div>
      </div>
    </Paper>
  );
}
