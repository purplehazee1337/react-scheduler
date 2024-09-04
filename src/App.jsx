import React, { useEffect, useState } from "react";
import { Paper } from "@mui/material";
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
  DateNavigator,
  AppointmentForm,
} from "@devexpress/dx-react-scheduler-material-ui";
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./config/firestore";
import { messages } from "./data/messages";
import Alert from "./components/Alert";
import CustomDateEditor from "./components/CustomDateEditor";

const currentDate = new Date().toISOString();
const language = messages.pl;

const App = () => {
  const [appointments, setAppointments] = useState();
  const [alertState, setAlertState] = useState({
    visibility: false,
    message: "",
    severity: "",
  });

  //Alert Func
  const handleAlertOpen = (message, severity) => {
    setAlertState({ visibility: true, message: message, severity: severity });
  };

  const handleAlertClose = () => {
    setAlertState({ visibility: false, message: "", severity: "" });
  };

  //Database func
  async function getAppointments() {
    const querySnapshot = await getDocs(collection(db, "appointments"));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAppointments(data);
  }

  async function addAppoinment(newAppoinment) {
    await addDoc(collection(db, "appointments"), { ...newAppoinment });
  }

  async function editAppoinment(selectedAppointment) {
    const id = Object.keys(selectedAppointment)[0];
    await updateDoc(doc(db, "appointments", id), {
      ...selectedAppointment[id],
    });
  }

  async function deleteAppoinment(appointmentID) {
    await deleteDoc(doc(db, "appointments", appointmentID));
  }

  useEffect(() => {
    getAppointments();
  }, []);

  //Scheduler endpoint
  async function commitChanges({ added, changed, deleted }) {
    if (added) {
      added.startDate = added.startDate.toISOString();
      added.endDate = added.endDate.toISOString();

      added.endDate >= added.startDate &&
      added.title != "" &&
      added.title != undefined
        ? (async () => {
            await addAppoinment(added);
            handleAlertOpen("Spotkanie zostało dodane.", "success");
          })()
        : handleAlertOpen(
            "Spotkanie nie zostało dodane. Wprowadzono nie poprawne dane.",
            "error"
          );
    }
    if (changed) {
      const id = Object.keys(changed)[0];
      const docSnap = await getDoc(doc(db, "appointments", id));
      const prevAppoinment = docSnap.data();
      const newAppoinment = changed[id];
      if (newAppoinment.startDate)
        newAppoinment.startDate = newAppoinment.startDate.toISOString();
      if (newAppoinment.endDate)
        newAppoinment.endDate = newAppoinment.endDate.toISOString();

      const updatedAppoinment = {
        [id]: {
          ...prevAppoinment,
          ...newAppoinment,
        },
      };

      updatedAppoinment[id].endDate >= updatedAppoinment[id].startDate &&
      updatedAppoinment[id].title != undefined &&
      updatedAppoinment[id].title != ""
        ? (async () => {
            await editAppoinment(updatedAppoinment);
            handleAlertOpen("Spotkanie zostało zmienione.", "success");
          })()
        : handleAlertOpen(
            "Spotkanie nie zostało zmienione. Wprowadzono nie poprawne dane.",
            "error"
          );
    }
    if (deleted !== undefined) {
      await deleteAppoinment(deleted);
    }

    await getAppointments();
  }

  return (
    <>
      <Alert
        open={alertState.visibility}
        message={alertState.message}
        handleClose={handleAlertClose}
        severity={alertState.severity}
      />
      <Paper>
        <Scheduler data={appointments} height={"auto"} locale="pl">
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
              return;
            }}
          />

          <ConfirmationDialog messages={language.confirmationDialog} />
        </Scheduler>
      </Paper>
    </>
  );
};

export default App;
