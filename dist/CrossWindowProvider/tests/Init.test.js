var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { mockWindoManager } from '../../test-utils';
import { CrossWindowProvider } from '../CrossWindowProvider';
describe('CrossWindowProvider', () => {
    let crossWindowProvider;
    beforeEach(() => {
        crossWindowProvider = CrossWindowProvider.getInstance();
        mockWindoManager();
    });
    it('should be a singleton instance', () => {
        const anotherInstance = CrossWindowProvider.getInstance();
        expect(crossWindowProvider).toBe(anotherInstance);
    });
    it('should initialize correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield crossWindowProvider.init();
        expect(result).toBeTruthy();
        expect(crossWindowProvider.isInitialized()).toBe(true);
    }));
    it('should get address correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        yield crossWindowProvider.init();
        crossWindowProvider.setAddress('testAddress');
        const address = yield crossWindowProvider.getAddress();
        expect(address).toBe('testAddress');
    }));
});
//# sourceMappingURL=Init.test.js.map