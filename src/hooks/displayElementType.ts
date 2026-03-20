import { ElementType } from "@/models/playerData";

export default function getElementTypeShortName(type: ElementType): string {
  switch (type) {
    case ElementType.Goalkeeper:
      return "GKP";
    case ElementType.Defender:
      return "DEF";
    case ElementType.Midfielder:
      return "MID";
    case ElementType.Forward:
      return "FWD";
    default:
      return "Unknown";
  }
}
