import React from "react";
import { loadCoursesPageData } from "../actions";
import CoursesClient from "./courses-client";

export default async function CoursesPage() {
  const initialCourses = await loadCoursesPageData();

  return <CoursesClient initialCourses={initialCourses} />;
}
