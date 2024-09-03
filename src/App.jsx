import React, { useEffect, useState } from "react";
import {Paper } from "@mui/material";
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
  AppointmentForm,
} from "@devexpress/dx-react-scheduler-material-ui";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./config/firestore";
import { messages } from "./data/messages";

import CustomDateEditor from "./components/CustomDateEditor";



const currentDate = new Date().toISOString();
const language = messages.pl;

const App = () => {
  const [appointments, setAppointments] = useState();

  const getAppointments = async () => {
    const querySnapshot = await getDocs(collection(db, "appointments"));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAppointments(data);
  };

  useEffect(() => {
    getAppointments();
  }, []);

  async function addAppoinment(newAppoinment) {
    if (newAppoinment.startDate) {
      newAppoinment.startDate = newAppoinment.startDate.toISOString();
    }
    if (newAppoinment.endDate) {
      newAppoinment.endDate = newAppoinment.endDate.toISOString();
    }
    await addDoc(collection(db, "appointments"), { ...newAppoinment });
  }

  async function editAppoinment(selectedAppointment) {
    const id = Object.keys(selectedAppointment)[0];
    if (selectedAppointment[id].startDate)
      selectedAppointment[id].startDate =
        selectedAppointment[id].startDate.toISOString();
    if (selectedAppointment[id].endDate)
      selectedAppointment[id].endDate =
        selectedAppointment[id].endDate.toISOString();
    await updateDoc(doc(db, "appointments", id), {
      ...selectedAppointment[id],
    });
  }

  async function deleteAppoinment(appointmentID) {
    await deleteDoc(doc(db, "appointments", appointmentID));
  }

  async function commitChanges({ added, changed, deleted }) {
    if (added) {
      await addAppoinment(added);
    }
    if (changed) {
      await editAppoinment(changed);
    }
    if (deleted !== undefined) {
      await deleteAppoinment(deleted);
    }
    getAppointments();
  }

  return (
    <Paper>
      <Scheduler data={appointments} height={'auto'} locale="pl">
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

        <Appointments />
        <AppointmentTooltip showOpenButton showDeleteButton showCloseButton />
        <AppointmentForm
          messages={language.appointmentForm}
          dateEditorComponent={CustomDateEditor}
          booleanEditorComponent={() => {
            return 
            }}
        />
        
        <ConfirmationDialog messages={language.confirmationDialog} />
      </Scheduler>
    </Paper>
  );
};

export default App;
