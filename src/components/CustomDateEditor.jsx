import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker, LocalizationProvider, plPL } from "@mui/x-date-pickers";
import { TextField } from "@mui/material";
import "dayjs/locale/pl";


export default function CustomDateEditor({ value, onValueChange }) {
    return (
      <div style={{padding: '8px 0px' }}>
      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        adapterLocale="pl"
        localeText={
          plPL.components.MuiLocalizationProvider.defaultProps.localeText
        }
      >
        <DateTimePicker
          renderInput={(props) => <TextField {...props} />}
          value={value}
          onChange={onValueChange}
          ampm={false}
          inputFormat= 'DD/MM/YYYY HH:mm'
        />
      </LocalizationProvider>
      </div>
    );
  };