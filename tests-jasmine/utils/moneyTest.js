import {formatCurrency} from '../../scripts/utils/money.js';

describe('Test Suite: formatCurrency', () => {
    it('Converts cents into dollars', () => {
        expect(formatCurrency(2095)).toBe('20.95');
    });

    it('Works with 0', () => {
        expect(formatCurrency(0)).toBe('0.00');
    });

    describe('Rounding', () => {
        it('Rounds 2000.5 cents up to 20.01', () => {
            expect(formatCurrency(2000.5)).toBe('20.01');
        })

        it('Rounds 2000.4 cents down to 20.00', () => {
            expect(formatCurrency(2000.4)).toBe('20.00');
        })
    });
});

