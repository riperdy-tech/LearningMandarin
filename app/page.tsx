import { CourseApp } from "@/components/course-app";
import { courseData } from "@/lib/course-data";

export default function Home() {
  return <CourseApp data={courseData} />;
}
