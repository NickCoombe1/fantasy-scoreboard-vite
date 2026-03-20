import { ElementType } from "@/models/playerData";

export interface FplBootstrapResponse {
  element_stats: [];
  element_types: [];
  elements: PlayerBootstrapElements;
  events: [];
  fixtures: [];
  settings: [];
  teams: [];
}

export interface PlayerBootstrapData {
  web_name: string;
  id: number;
  chance_of_playing_next_round: number;
  chance_of_playing_this_round: number;
  element_type: ElementType;
  team: number;
}

export type PlayerBootstrapElements = Record<string, PlayerBootstrapData>;
