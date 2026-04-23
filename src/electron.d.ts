export interface IElectronAPI {
  readDB: () => Promise<any>;
  writeDB: (data: any) => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}