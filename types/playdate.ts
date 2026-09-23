export type PlaydateStatus = "active" | "moved" | "cancelled";

export type WeatherStatus =
  | "weather_permitting"
  | "weather_pending"
  | "confirmed"
  | "cancelled_due_to_weather"
  | null;

export interface Playdate {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  start_time: string; // "HH:MM:SS"
  end_time: string | null;
  host_name: string;
  host_phone: string | null;
  location_name: string | null;
  address: string | null;
  info: string | null;
  status: PlaydateStatus;
  weather_status: WeatherStatus;
  original_date: string | null;
  original_start_time: string | null;
  original_end_time: string | null;
  moved_note: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
}

// Fields a DGL submits when creating a playdate
export interface PlaydateInput {
  title: string;
  date: string;
  start_time: string;
  end_time?: string | null;
  host_name: string;
  host_phone?: string | null;
  location_name?: string | null;
  address?: string | null;
  info?: string | null;
  weather_status?: WeatherStatus;
}

// A synthetic "moved-from" marker rendered on the original date's cell.
// Not a database row on its own — derived from a playdate whose
// original_date differs from its current date.
export interface MovedStub {
  kind: "moved_stub";
  playdateId: string;
  title: string;
  originalDate: string;
  currentDate: string;
}
