export type DictValue = string | Record<string, string>;
export type Dict = Record<string, Record<string, DictValue>>;

export interface InstallPromptProps {
  dict: Dict;
  lang: string;
}

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export type Platform = "ios" | "android" | "desktop" | "unknown";

export interface InstallState {
  showPrompt: boolean;
  platform: Platform;
  isInstalled: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
}
