import { PlayerData } from "@/models/playerData";

type PlayerElements = Record<string, PlayerData>;

export interface PlayerDataResponse {
  elements: PlayerElements;
}
