import { WindowManager } from '../CrossWindowProvider/WindowManager';

export const mockWindoManager = () =>
  (WindowManager.getInstance = jest.fn().mockReturnValue({
    init: jest.fn().mockResolvedValue(true),
    postMessage: jest.fn().mockResolvedValue({ payload: {} }),
    closeConnection: jest.fn().mockResolvedValue(true)
  }));
