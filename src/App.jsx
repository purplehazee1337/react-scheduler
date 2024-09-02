import { useCallback, useState } from "react";
import Paper from "@mui/material/Paper";
import {
  ViewState,
  EditingState,
  IntegratedEditing,
} from "@devexpress/dx-react-scheduler";
import {
  Scheduler,
  DayView,
  WeekView,
  MonthView,
  Appointments,
  AppointmentTooltip,
  ConfirmationDialog,
  Toolbar,
  ViewSwitcher,
  AllDayPanel,
  DateNavigator,
  AppointmentForm
} from "@devexpress/dx-react-scheduler-material-ui";

import { appointments } from "./data/appointments";
import { messages } from "./data/messages";

const App = () => {
  const currentDate = new Date().toISOString().slice(0, 10);
  const [language, setLanguage] = useState(messages.pl);
  const [data, setData] = useState(appointments);

  const commitChanges = useCallback(({ added, changed, deleted }) => {
    setData((prevData) => {
      let updatedData = prevData;

      if (added) {
        const startingAddedId =
          updatedData.length > 0
            ? updatedData[updatedData.length - 1].id + 1
            : 0;
        updatedData = [...updatedData, { id: startingAddedId, ...added }];
      }
      if (changed) {
        updatedData = updatedData.map((appointment) =>
          changed[appointment.id]
            ? { ...appointment, ...changed[appointment.id] }
            : appointment
        );
      }
      if (deleted !== undefined) {
        updatedData = updatedData.filter(
          (appointment) => appointment.id !== deleted
        );
      }
      return updatedData;
    });
  }, []);

  const formatValue = date => {console.log(date); return date};

  const DateEditorComponent = (
    { inputFormat, locale, ...restProps },
  ) => <AppointmentForm.DateEditor {...restProps} inputFormat={"DD/MM/YYYY hh:mm"} locale={"pl-PL"} />;

  return (
    <Paper>
      <Scheduler data={data} height={700} locale="pl-PL">
        <ViewState
          defaultCurrentDate={currentDate}
          defaultCurrentViewName="Day"
        />
        <EditingState onCommitChanges={commitChanges} />
        <IntegratedEditing />
        <DayView
          startDayHour={8}
          endDayHour={16}
          displayName={language.dayView}
        />
        <WeekView
          startDayHour={8}
          endDayHour={16}
          displayName={language.weekView}
        />
        <MonthView displayName={language.monthView} />

        <Toolbar />
        <DateNavigator />
        <ViewSwitcher />

        
        <Appointments draggable={true}/>
        <AppointmentTooltip showOpenButton showDeleteButton />
        <AppointmentForm
          messages={language.appointmentForm}
          dateEditorComponent={DateEditorComponent}
        />
        <AllDayPanel messages={language.allDayPanel} />
        <ConfirmationDialog messages={language.confirmationDialog} />
        
      </Scheduler>
    </Paper>
  );
};

export default App;
