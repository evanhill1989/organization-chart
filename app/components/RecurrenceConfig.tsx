// app/components/RecurrenceConfig.tsx
import { useState, useEffect } from "react";
import type { RecurrenceType } from "../types/orgChart";
import { getRecurrenceDescription } from "../lib/recurrenceUtils";

interface RecurrenceConfigProps {
  initialConfig?: {
    type: RecurrenceType;
    interval: number;
    dayOfWeek?: number;
    dayOfMonth?: number;
    endDate?: string;
  };
  onChange: (config: {
    recurrence_type: RecurrenceType;
    recurrence_interval?: number;
    recurrence_day_of_week?: number;
    recurrence_day_of_month?: number;
    recurrence_end_date?: string;
    is_recurring_template?: boolean;
  }) => void;
  disabled?: boolean;
  className?: string;
}

export default function RecurrenceConfig({
  initialConfig,
  onChange,
  disabled = false,
  className = "",
}: RecurrenceConfigProps) {
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(
    initialConfig?.type || "none",
  );
  const [recurrenceInterval, setRecurrenceInterval] = useState(
    initialConfig?.interval || 1,
  );
  const [recurrenceDayOfWeek, setRecurrenceDayOfWeek] = useState<number | "">(
    initialConfig?.dayOfWeek ?? "",
  );
  const [recurrenceDayOfMonth, setRecurrenceDayOfMonth] = useState<number | "">(
    initialConfig?.dayOfMonth ?? "",
  );
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(
    initialConfig?.endDate || "",
  );

  // ✅ FIX: Update state when initialConfig changes
  useEffect(() => {
    if (initialConfig) {
      console.log(
        "🔄 RecurrenceConfig: Updating from initialConfig:",
        initialConfig,
      );
      setRecurrenceType(initialConfig.type || "none");
      setRecurrenceInterval(initialConfig.interval || 1);
      setRecurrenceDayOfWeek(initialConfig.dayOfWeek ?? "");
      setRecurrenceDayOfMonth(initialConfig.dayOfMonth ?? "");
      setRecurrenceEndDate(initialConfig.endDate || "");
    }
  }, [initialConfig]);

  // Emit changes to parent
  useEffect(() => {
    const config = {
      recurrence_type: recurrenceType,
      recurrence_interval:
        recurrenceType !== "none" ? recurrenceInterval : undefined,
      recurrence_day_of_week:
        recurrenceType === "weekly" && recurrenceDayOfWeek !== ""
          ? Number(recurrenceDayOfWeek)
          : undefined,
      recurrence_day_of_month:
        recurrenceType === "monthly" && recurrenceDayOfMonth !== ""
          ? Number(recurrenceDayOfMonth)
          : undefined,
      recurrence_end_date:
        recurrenceType !== "none" && recurrenceEndDate
          ? recurrenceEndDate
          : undefined,
      is_recurring_template: recurrenceType !== "none",
    };

    console.log("🔄 RecurrenceConfig: Emitting config change:", config);
    onChange(config);
  }, [
    recurrenceType,
    recurrenceInterval,
    recurrenceDayOfWeek,
    recurrenceDayOfMonth,
    recurrenceEndDate,
    onChange,
  ]);

  return (
    <div
      className={`rounded border bg-gray-50 p-4 dark:bg-gray-800 ${className}`}
    >
      <h4 className="mb-3 flex items-center font-medium text-gray-700 dark:text-gray-300">
        <svg
          className="mr-2 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Repeat Task
      </h4>

      {/* Recurrence Type Selector */}
      <div className="mb-3">
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Repeat:
        </label>
        <select
          className="w-full rounded border border-gray-300 px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          value={recurrenceType}
          onChange={(e) => {
            console.log(
              "🔄 RecurrenceConfig: Type changed to:",
              e.target.value,
            );
            setRecurrenceType(e.target.value as RecurrenceType);
          }}
          disabled={disabled}
        >
          <option value="none">No repeat</option>
          <option value="minutely">Every minute (testing)</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Show additional options when not 'none' */}
      {recurrenceType !== "none" && (
        <>
          {/* Interval Input */}
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Every:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="365"
                className="w-20 rounded border border-gray-300 px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={recurrenceInterval}
                onChange={(e) => setRecurrenceInterval(Number(e.target.value))}
                disabled={disabled}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {recurrenceType === "minutely" &&
                  (recurrenceInterval === 1 ? "minute" : "minutes")}
                {recurrenceType === "daily" &&
                  (recurrenceInterval === 1 ? "day" : "days")}
                {recurrenceType === "weekly" &&
                  (recurrenceInterval === 1 ? "week" : "weeks")}
                {recurrenceType === "monthly" &&
                  (recurrenceInterval === 1 ? "month" : "months")}
                {recurrenceType === "yearly" &&
                  (recurrenceInterval === 1 ? "year" : "years")}
              </span>
            </div>
          </div>

          {/* Weekly: Day of Week Selector */}
          {recurrenceType === "weekly" && (
            <div className="mb-3">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                On day:
              </label>
              <select
                className="w-full rounded border border-gray-300 px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={recurrenceDayOfWeek}
                onChange={(e) =>
                  setRecurrenceDayOfWeek(
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                disabled={disabled}
              >
                <option value="">Same day as deadline</option>
                <option value="0">Sunday</option>
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
              </select>
            </div>
          )}

          {/* Monthly: Day of Month Selector */}
          {recurrenceType === "monthly" && (
            <div className="mb-3">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                On day of month:
              </label>
              <select
                className="w-full rounded border border-gray-300 px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={recurrenceDayOfMonth}
                onChange={(e) =>
                  setRecurrenceDayOfMonth(
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                disabled={disabled}
              >
                <option value="">Same day as deadline</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* End Date */}
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              End repeat (optional):
            </label>
            <input
              type="date"
              className="w-full rounded border border-gray-300 px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={recurrenceEndDate}
              onChange={(e) => setRecurrenceEndDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              disabled={disabled}
            />
          </div>

          {/* Preview */}
          <div className="mt-3 rounded border-l-4 border-blue-400 bg-blue-50 p-2 dark:bg-blue-900/20">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Pattern:</strong>{" "}
              {getRecurrenceDescription({
                type: recurrenceType,
                interval: recurrenceInterval,
                dayOfWeek:
                  recurrenceDayOfWeek !== ""
                    ? Number(recurrenceDayOfWeek)
                    : undefined,
                dayOfMonth:
                  recurrenceDayOfMonth !== ""
                    ? Number(recurrenceDayOfMonth)
                    : undefined,
              })}
            </p>
            {recurrenceEndDate && (
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                <strong>Ends:</strong>{" "}
                {new Date(recurrenceEndDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
