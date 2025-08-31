import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateJournalEntry } from "../lib/journal";
import type { JournalEntry } from "../types/journal";

export function useEditJournal() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (editData: {
      id: number;
      editorial_text?: string;
      entry_date?: string;
    }) => {
      console.log("🚀 EDIT JOURNAL MUTATION: Starting", editData);
      const result = await updateJournalEntry(editData.id, editData);
      console.log("✅ EDIT JOURNAL MUTATION: Server returned", result);
      return result;
    },

    onMutate: async (editData) => {
      await queryClient.cancelQueries({
        queryKey: ["journalEntry", editData.id],
      });

      const previousEntry = queryClient.getQueryData<JournalEntry>([
        "journalEntry",
        editData.id,
      ]);
      console.log("🔄 EDIT JOURNAL ONMUTATE: Previous entry:", previousEntry);

      if (previousEntry) {
        const newEntry = {
          ...previousEntry,
          ...editData,
          updated_at: new Date().toISOString(),
        };

        queryClient.setQueryData(["journalEntry", editData.id], newEntry);
        console.log(
          "🔄 EDIT JOURNAL ONMUTATE: Optimistically updated cache",
          newEntry
        );
      }

      return { previousEntry };
    },

    onError: (error, editData, context) => {
      console.error("❌ EDIT JOURNAL ONERROR:", error);
      if (context?.previousEntry) {
        queryClient.setQueryData(
          ["journalEntry", editData.id],
          context.previousEntry
        );
      }
    },

    onSettled: (_data, _error, editData) => {
      console.log("🔄 EDIT JOURNAL ONSETTLED: Refetching entry", editData?.id);
      queryClient.invalidateQueries({
        queryKey: ["journalEntry", editData?.id],
      });
    },
  });

  return mutation;
}
