import { generateId, debounce, throttle, getDistance, getRandomColor, isValidPoint } from '@/lib/utils';

describe('Utils', () => {
  describe('generateId', () => {
    it('should generate a unique ID', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should debounce function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('test');
      debouncedFn('test');
      debouncedFn('test');

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('test');
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should throttle function calls', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn('test1');
      throttledFn('test2');
      throttledFn('test3');

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('test1');

      jest.advanceTimersByTime(100);

      throttledFn('test4');
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith('test4');
    });
  });

  describe('getDistance', () => {
    it('should calculate distance between two points', () => {
      const point1 = { x: 0, y: 0 };
      const point2 = { x: 3, y: 4 };
      
      const distance = getDistance(point1, point2);
      expect(distance).toBe(5);
    });

    it('should return 0 for same points', () => {
      const point1 = { x: 5, y: 5 };
      const point2 = { x: 5, y: 5 };
      
      const distance = getDistance(point1, point2);
      expect(distance).toBe(0);
    });
  });

  describe('getRandomColor', () => {
    it('should return a valid hex color', () => {
      const color = getRandomColor();
      
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('should return different colors on multiple calls', () => {
      const colors = new Set();
      for (let i = 0; i < 10; i++) {
        colors.add(getRandomColor());
      }
      
      // Should have some variety (not all the same)
      expect(colors.size).toBeGreaterThan(1);
    });
  });

  describe('isValidPoint', () => {
    it('should validate correct point objects', () => {
      expect(isValidPoint({ x: 0, y: 0 })).toBe(true);
      expect(isValidPoint({ x: 100, y: 200 })).toBe(true);
      expect(isValidPoint({ x: -10, y: 5.5 })).toBe(true);
    });

    it('should reject invalid point objects', () => {
      expect(isValidPoint(null)).toBe(false);
      expect(isValidPoint(undefined)).toBe(false);
      expect(isValidPoint({})).toBe(false);
      expect(isValidPoint({ x: 0 })).toBe(false);
      expect(isValidPoint({ y: 0 })).toBe(false);
      expect(isValidPoint({ x: '0', y: 0 })).toBe(false);
      expect(isValidPoint({ x: 0, y: '0' })).toBe(false);
      expect(isValidPoint({ x: NaN, y: 0 })).toBe(false);
      expect(isValidPoint({ x: 0, y: NaN })).toBe(false);
    });
  });
});
