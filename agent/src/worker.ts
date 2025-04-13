import { GameWorker } from "@virtuals-protocol/game";
import {
  genCourseContentByOutlineFunction,
  genCourseOutlineFunction,
} from "./functions";

// Create a demo worker with our functions
export const courseGenWorker = new GameWorker({
  id: "course_gen",
  name: "Course Generator",
  description: "Generate a course based on the user's input",
  functions: [genCourseOutlineFunction, genCourseContentByOutlineFunction],
});
