// import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { supabase } from "../app/lib/data/supabaseClient";

// type JournalEntry = {
//   id: number;
//   entry_date: string;
//   editorial_text: string | null;
// };

// type JournalTask = {
//   id: number;
//   action: "created" | "edited" | "completed";
//   created_at: string;
//   org_nodes: {
//     id: number;
//     name: string;
//     type: string;
//   };
// };

// async function fetchJournalEntry(date: string): Promise<{
//   entry: JournalEntry | null;
//   tasks: JournalTask[];
// }> {
//   const { data: entry, error: entryError } = await supabase
//     .from("journal_entries")
//     .select("*")
//     .eq("entry_date", date)
//     .maybeSingle();

//   if (entryError) throw entryError;
//   if (!entry) return { entry: null, tasks: [] };

//   const { data: tasks, error: taskError } = await supabase
//     .from("journal_entry_tasks")
//     .select("id, action, created_at, org_nodes(id, name, type)")
//     .eq("journal_entry_id", entry.id)
//     .order("created_at", { ascending: true });

//   if (taskError) throw taskError;

//   return { entry, tasks: tasks ?? [] };
// }

// export default function JournalPage() {
//   const [date] = useState(() => new Date().toISOString().slice(0, 10)); // today

//   const { data, isLoading, error } = useQuery({
//     queryKey: ["journal", date],
//     queryFn: () => fetchJournalEntry(date),
//   });

//   if (isLoading) return <div>Loading journal...</div>;
//   if (error) return <div>Error loading journal</div>;

//   return (
//     <div className="p-6 max-w-2xl mx-auto">
//       <h1 className="text-2xl font-bold mb-4">Journal — {date}</h1>

//       {data?.entry ? (
//         <>
//           {data.entry.editorial_text ? (
//             <p className="mb-6 italic">{data.entry.editorial_text}</p>
//           ) : (
//             <p className="mb-6 text-gray-500">No editorial notes for today.</p>
//           )}

//           <h2 className="text-xl font-semibold mb-2">Tasks</h2>
//           <ul className="space-y-2">
//             {data.tasks.map((t) => (
//               <li
//                 key={t.id}
//                 className="rounded-lg border p-3 flex justify-between items-center"
//               >
//                 <span>
//                   <span className="font-semibold">{t.org_nodes.name}</span> (
//                   {t.org_nodes.type})
//                 </span>
//                 <span
//                   className={
//                     t.action === "completed"
//                       ? "text-green-600"
//                       : t.action === "edited"
//                         ? "text-blue-600"
//                         : "text-gray-700"
//                   }
//                 >
//                   {t.action}
//                 </span>
//               </li>
//             ))}
//           </ul>
//         </>
//       ) : (
//         <p>No journal entry for today yet.</p>
//       )}
//     </div>
//   );
// }
