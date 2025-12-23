// Site handler interface

export interface SiteHandler {
  name: string;
  hostPatterns: string[];
  getInputElement(): HTMLElement | null;
  getPromptText(): string;
  setPromptText(text: string): void;
  getButtonContainer(): HTMLElement | null;
}
