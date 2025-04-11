import CloseIcon from "@mui/icons-material/Close";
import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";

export default function GroupCard(props: GroupCardProps) {
  return (
    <Paper elevation={4} className="group flex flex-col p-4 gap-3">
      <Typography variant="subtitle2" className="relative">
        <em>Group # {props.index + 1}</em>
        {!props.disabled && (
          <IconButton
            onClick={props.onDelete}
            className="absolute top-0 right-0 mt-[-4px]"
            color="error"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        )}
      </Typography>
      <FormControl size="small" required disabled={props.disabled}>
        <InputLabel>Passout Year</InputLabel>
        <Select
          value={props.group.passOutYear || ""}
          label="Passout Year"
          onChange={(event) => {
            props.onChange({
              ...props.group,
              passOutYear: event.target.value as number,
            });
          }}
        >
          {Object.keys(props.allGroups).map((year) => (
            <MenuItem value={Number(year)} key={year}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl
        size="small"
        required
        disabled={props.disabled || !props.group.passOutYear}
      >
        <InputLabel>Program</InputLabel>
        <Select
          value={props.group.program || ""}
          label="Program"
          onChange={(event) => {
            props.onChange({
              ...props.group,
              program: event.target.value,
            });
          }}
        >
          {props.allGroups[props.group.passOutYear]?.map((program) => (
            <MenuItem value={program} key={program}>
              {program}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Paper>
  );
}
