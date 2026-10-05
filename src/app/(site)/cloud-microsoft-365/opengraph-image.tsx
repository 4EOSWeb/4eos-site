import { getService } from "@/lib/content";
import { ogContentType, ogSize, serviceOg } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = `${getService("cloud-microsoft-365").title} from 4EOS in Fort Wayne`;

export default function Image() {
  return serviceOg("cloud-microsoft-365");
}
