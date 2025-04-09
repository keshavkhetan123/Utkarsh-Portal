import LoadingButton from "@mui/lab/LoadingButton";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";

import dayjs from "dayjs";

import { type SectionProps } from "../types";

export default function Section1(props: SectionProps) {
  return (
    <>
      <div className="flex flex-col w-full gap-3 mb-4">
        <FormHelperText>Please provide your personal details</FormHelperText>
        <FormControl>
          <InputLabel>Select your gender *</InputLabel>
          <Select
            value={props.onboarding.gender}
            onChange={(e) =>
              props.setOnboarding({
                ...props.onboarding,
                gender: e.target.value,
              })
            }
            autoComplete="sex"
            label="Select your gender"
            required
          >
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
          </Select>
        </FormControl>
        <DatePicker
          value={props.onboarding.dob}
          label="Date of Birth *"
          onChange={(date) =>
            props.setOnboarding({
              ...props.onboarding,
              dob: date,
            })
          }
          format="DD/MM/YYYY"
        />
        <DatePicker
          views={['year']}
          label="Passout Year *"
          value={props.onboarding.passOutYear ? dayjs(`${props.onboarding.passOutYear}-01-01`) : null}
          onChange={(year) =>
            props.setOnboarding({
              ...props.onboarding,
              passOutYear: year ? year.year() : null,
            })
          }
          openTo="year"
          format="YYYY"
        />
      </div>
      <Box sx={{ mb: 1 }}>
        <div>
          {props.onNext && (
            <Button
              variant="contained"
              onClick={props.onNext}
              sx={{ mt: 1, mr: 1 }}
              disabled={
                props.isLoading ||
                !props.onboarding.gender ||
                !props.onboarding.dob ||
                !props.onboarding.passOutYear
              }
            >
              Continue
            </Button>
          )}
          {props.onFinish && (
            <LoadingButton
              variant="contained"
              onClick={props.onFinish}
              loading={props.isLoading}
              disabled={!props.onboarding.gender || !props.onboarding.dob}
              sx={{ mt: 1, mr: 1 }}
            >
              Finish
            </LoadingButton>
          )}
          {props.onPrevious && (
            <Button
              onClick={props.onPrevious}
              sx={{ mt: 1, mr: 1 }}
              disabled={props.isLoading}
            >
              Back
            </Button>
          )}
        </div>
      </Box>
    </>
  );
}
