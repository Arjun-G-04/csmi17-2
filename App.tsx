import React, { useState, useCallback } from "react";
import {
  Course,
  Teacher,
  Room,
  TimeSlot,
  StudentGroup,
  Assignment,
  Algorithm,
  SolverResult,
} from "./types";
import { InputForm } from "./components/InputForm";
import { TimetableDisplay } from "./components/TimetableDisplay";
import { solve } from "./services/cspSolver";

const DEFAULT_TEACHERS: Teacher[] = [
  { id: "1", name: "Dr. Usha", unavailableTimeSlots: ["1", "2", "3"] },
  { id: "2", name: "Dr. Oswald", unavailableTimeSlots: ["7", "8", "9"] },
  { id: "3", name: "Dr. Sridevi", unavailableTimeSlots: ["4", "5", "6"] },
];

const DEFAULT_GROUPS: StudentGroup[] = [
  {
    id: "1",
    name: "2026 Batch A",
    size: 100,
    unavailableTimeSlots: ["7", "8", "9"],
  },
  {
    id: "2",
    name: "2026 Batch B",
    size: 100,
    unavailableTimeSlots: ["7", "8", "9"],
  },
  {
    id: "3",
    name: "2027 Batch A",
    size: 100,
    unavailableTimeSlots: ["3", "6", "9", "12", "15"],
  },
  {
    id: "4",
    name: "2027 Batch B",
    size: 100,
    unavailableTimeSlots: ["3", "6", "9", "12", "15"],
  },
];

const DEFAULT_ROOMS: Room[] = [
  { id: "1", name: "Orion G1", capacity: 100 },
  { id: "2", name: "Orion G2", capacity: 100 },
  { id: "3", name: "Orion G3", capacity: 100 },
];

const DEFAULT_COURSES: Course[] = [
  { id: "1", teacherId: "1", groupId: "1", hours: 3, name: "AI" },
  { id: "2", teacherId: "1", groupId: "2", hours: 3, name: "AI" },
  { id: "3", teacherId: "2", groupId: "3", hours: 3, name: "DSA" },
  { id: "4", teacherId: "2", groupId: "4", hours: 3, name: "DSA" },
  { id: "5", teacherId: "3", groupId: "1", hours: 3, name: "CN" },
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const times = ["09:00-10:00", "10:00-11:00", "11:00-12:00"];

const DEFAULT_TIMESLOTS: TimeSlot[] = [];

let x = 1;
for (const day of days) {
  for (const time of times) {
    DEFAULT_TIMESLOTS.push({ id: x.toString(), day: day, time: time });
    x++;
  }
}

const App: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(DEFAULT_COURSES);
  const [teachers, setTeachers] = useState<Teacher[]>(DEFAULT_TEACHERS);
  const [rooms, setRooms] = useState<Room[]>(DEFAULT_ROOMS);
  const [studentGroups, setStudentGroups] =
    useState<StudentGroup[]>(DEFAULT_GROUPS);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(DEFAULT_TIMESLOTS);

  const [displayCourses, setDisplayCourses] = useState<Course[]>(courses);
  const [solution, setSolution] = useState<Assignment | null>(null);
  const [status, setStatus] = useState<
    "idle" | "solving" | "solved" | "failed"
  >("idle");
  const [stats, setStats] = useState<SolverResult["stats"] | null>(null);
  const [algorithm, setAlgorithm] = useState<Algorithm>(
    Algorithm.BACKTRACKING_HEURISTICS,
  );

  const handleGenerate = useCallback(() => {
    setStatus("solving");
    setSolution(null);
    setStats(null);

    // Use a timeout to allow the UI to update to the 'solving' state
    setTimeout(() => {
      const result = solve(
        algorithm,
        courses,
        teachers,
        rooms,
        timeSlots,
        studentGroups,
      );
      setSolution(result.solution);
      setStats(result.stats);
      setStatus(result.solution ? "solved" : "failed");
      setDisplayCourses(result.expandedCourses);
    }, 50);
  }, [algorithm, courses, teachers, rooms, timeSlots, studentGroups]);

  const handleReset = () => {
    setCourses(DEFAULT_COURSES);
    setTeachers(DEFAULT_TEACHERS);
    setRooms(DEFAULT_ROOMS);
    setStudentGroups(DEFAULT_GROUPS);
    setTimeSlots(DEFAULT_TIMESLOTS);
    setDisplayCourses(DEFAULT_COURSES);
    setSolution(null);
    setStatus("idle");
    setStats(null);
  };

  return (
    <div className="flex flex-col h-screen font-sans">
      <header className="bg-brand-primary text-white shadow-lg p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Timetable Generator</h1>
      </header>
      <div className="flex flex-grow overflow-hidden">
        <aside className="w-1/3 min-w-[350px] max-w-[500px] bg-gray-100 dark:bg-gray-900 flex flex-col shadow-lg">
          <div className="flex-grow overflow-y-auto">
            <InputForm
              courses={courses}
              setCourses={setCourses}
              teachers={teachers}
              setTeachers={setTeachers}
              rooms={rooms}
              setRooms={setRooms}
              studentGroups={studentGroups}
              setStudentGroups={setStudentGroups}
              timeSlots={timeSlots}
              setTimeSlots={setTimeSlots}
            />
          </div>
          <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Solver Algorithm
              </label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
                className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value={Algorithm.BACKTRACKING_HEURISTICS}>
                  Backtracking with Heuristics
                </option>
                <option value={Algorithm.FORWARD_CHECKING}>
                  Backtracking with Forward Checking
                </option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleGenerate}
                disabled={status === "solving"}
                className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {status === "solving" ? (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "Generate Timetable"
                )}
              </button>
              <button
                onClick={handleReset}
                className="w-1/3 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
              >
                Reset
              </button>
            </div>
          </div>
        </aside>
        <main className="flex-grow bg-white dark:bg-gray-900">
          <TimetableDisplay
            solution={solution}
            courses={displayCourses}
            teachers={teachers}
            rooms={rooms}
            timeSlots={timeSlots}
            studentGroups={studentGroups}
            status={status}
            stats={stats}
          />
        </main>
      </div>
    </div>
  );
};

export default App;
