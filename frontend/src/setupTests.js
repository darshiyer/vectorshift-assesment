import '@testing-library/jest-dom';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

// React Flow uses pointer events in some places
window.PointerEvent = class PointerEvent extends MouseEvent {
  constructor(type, props) {
    super(type, props);
    this.pointerId = props?.pointerId ?? 1;
    this.pointerType = props?.pointerType ?? 'mouse';
  }
};
