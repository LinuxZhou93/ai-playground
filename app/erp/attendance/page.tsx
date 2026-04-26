import { loadAttendanceData } from "../actions";
import AttendanceClient from "./attendance-client";

export const revalidate = 0;

export default async function ERPAttendance() {
  const dashData = await loadAttendanceData();

  return <AttendanceClient initialData={dashData} />;
}
