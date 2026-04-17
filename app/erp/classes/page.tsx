import React from "react";
import { loadClassesPageData } from "../actions";
import ClassesClient from "./classes-client";

export default async function ClassesPage() {
  const { classes: initialClasses, courses } = await loadClassesPageData();

  return <ClassesClient initialClasses={initialClasses} courses={courses} />;
}
