import { PlayerPick } from "@/models/playerPick";

export interface ScoringData {
  totalPoints: number;
  picks: PlayerPick[];
  playersPlayed: number;
}
