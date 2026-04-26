import { loadStudentsPageData } from "../actions";
import StudentsClient from "./students-client";

export const revalidate = 0;

export default async function StudentsPage() {
  const dashData = await loadStudentsPageData();

  return <StudentsClient initialData={dashData} />;
}
