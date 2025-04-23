"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Container, Typography, Alert, Button, TextField, FormControl, FormHelperText, FormControlLabel, Checkbox, Autocomplete, Avatar, CircularProgress } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { api } from "~/trpc/react";
import { DEFAULT_COMPANY } from "./constants";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function GenerateHRLinkPage() {
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const { control, handleSubmit, reset } = useForm<{ companyName: string }>({
    defaultValues: { companyName: "" },
  });
  const [companyDetails, setCompanyDetails] = useState(DEFAULT_COMPANY);
  const [manualCompany, setManualCompany] = useState(false);
  const [companyQuery, setCompanyQuery] = useState("");


  const generateLinkMutation = api.hrToken.generateHRToken.useMutation({
    onSuccess: (data) => {
      setGeneratedLink(data.link);
      setLinkError(null);
    },
    onError: (err: any) => {
      setLinkError(err.message || "Error generating link");
    },
  });

  const onSubmit = () => {
    setGeneratedLink(null);
    setLinkError(null);
    generateLinkMutation.mutate(companyDetails);
    reset(); // Reset the form after submission
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
    }
  };

  function useDebounce(value, delay) {
      const [debouncedValue, setDebouncedValue] = useState(value);
  
      useEffect(() => {
        const handler = setTimeout(() => {
          setDebouncedValue(value);
        }, delay);
  
        return () => clearTimeout(handler);
      }, [value, delay]);
  
      return debouncedValue;
    }
  
    const debouncedQuery = useDebounce(companyQuery, 300);
  
    const { data: companyOptions, isLoading: isCompaniesLoading } = useQuery({
      queryKey: ["companies", debouncedQuery],
      queryFn: async () => {
        if (!debouncedQuery) return [];
        try {
          const {data} = await axios.get(`https://api.logo.dev/search?q=${debouncedQuery}`, {
            headers: {
              Authorization: "Bearer sk_Rl11eB1fQhSeO-zqN5LdEQ",
            },
          });
  
          const transformedData = data.map((company: { name: string; domain: string; logo_url: string }) => ({
            name: company.name,
            website: company.domain,
            logo: company.logo_url,
          }));
          
          return transformedData;
        } catch (error) {
          return [];
        }
      },
      enabled: !!debouncedQuery,
    });

  return (
    <Container className="flex flex-col gap-4 py-4" maxWidth="sm">
      <Typography variant="h5" color="primary">
        Generate HR Link
      </Typography>
        <form >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={manualCompany}
                    onChange={(e) => {
                      setManualCompany(e.target.checked);
                      setCompanyDetails({
                        ...companyDetails,
                        name: "",
                      });
                    }}
                  />
                }
                label="Enter company manually"
              />
      
              {manualCompany ? (
                <div className="flex flex-col gap-2">
                  <TextField
                    label="Company Name"
                    name="companyName"
                    value={companyDetails.name}
                    onChange={(e) =>
                      setCompanyDetails({
                        ...companyDetails,
                        name: e.target.value
                      })
                    }
                    required
                  />
                  <TextField
                    label="Company Website"
                    name="companyWebsite"
                    value={companyDetails.website}
                    onChange={(e) =>
                      setCompanyDetails({
                        ...companyDetails,
                        website: e.target.value
                      })
                    }
                    required
                  />
                  <TextField
                    label="Company Logo URL"
                    name="companyLogo"
                    value={companyDetails.logo}
                    onChange={(e) =>
                      setCompanyDetails({
                        ...companyDetails,
                        logo: e.target.value
                      })
                    }
                    required
                  />
                </div>
              ) : (
                <Autocomplete
                  value={companyDetails}
                  onChange={(_, newValue) =>
                    setCompanyDetails(newValue)
                  }
                  options={companyOptions || []}
                  getOptionKey={(option) => option.website}
                  getOptionLabel={(option) => option.name}
                  renderOption={(props, option) => (
                    // @ts-ignore
                    <div
                      {...props}
                      className="flex flex-row items-center gap-2 px-3 py-2 cursor-pointer"
                    >
                      <Avatar
                        sx={{ borderRadius: 1 }}
                        variant="square"
                        src={option.logo}
                      />
                      <Typography variant="body2">{option.name}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        ({option.website})
                      </Typography>
                    </div>
                  )}
                  renderInput={(params) => (
                    <div className="flex flex-row gap-2 items-center">
                      {companyDetails?.logo && (
                        <Avatar
                          sx={{ borderRadius: 1, height: 54, width: 54 }}
                          variant="square"
                          src={companyDetails.logo}
                        />
                      )}
                      <TextField
                        {...params}
                        label="Company"
                        name="company"
                        onChange={(e) => setCompanyQuery(e.target.value)}
                        InputProps={{
                          ...params.InputProps,
                          required: true,
                          endAdornment: (
                            <React.Fragment>
                              {debouncedQuery && isCompaniesLoading ? (
                                <CircularProgress color="inherit" size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </React.Fragment>
                          ),
                        }}
                        required
                      />
                    </div>
                  )}
                />
              )}
          <LoadingButton
            type="submit"
            variant="contained"
            loading={generateLinkMutation.isLoading}
            onClick={onSubmit}
            className="mt-5"
          >
            Generate Link
          </LoadingButton>
        </form>
      {generatedLink && (
        <>
          <Alert severity="success">
            Your HR link: <strong>{generatedLink}</strong>
          </Alert>
          <Button variant="outlined" onClick={copyToClipboard}>
            Copy Link
          </Button>
        </>
      )}
      {linkError && <Alert severity="error">{linkError}</Alert>}
    </Container>
  );
}
