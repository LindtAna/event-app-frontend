import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

/**
 * jsdom implementiert PointerEvent und Pointer Capture APIs
 * nicht vollständig. Radix Select benötigt diese APIs,
 * um das Dropdown korrekt zu öffnen und zu bedienen.
 */
class MockPointerEvent extends Event {
    button: number;
    ctrlKey: boolean;
    pointerType: string;
    pointerId: number;
    isPrimary: boolean;

    constructor(type: string, props: PointerEventInit = {}) {
        super(type, props);

        this.button = props.button ?? 0;
        this.ctrlKey = props.ctrlKey ?? false;
        this.pointerType = props.pointerType ?? "mouse";
        this.pointerId = props.pointerId ?? 1;
        this.isPrimary = props.isPrimary ?? true;
    }
}

window.PointerEvent = MockPointerEvent as unknown as typeof PointerEvent;

window.HTMLElement.prototype.hasPointerCapture = () => false;
window.HTMLElement.prototype.setPointerCapture = () => {};
window.HTMLElement.prototype.releasePointerCapture = () => {};
window.HTMLElement.prototype.scrollIntoView = () => {};

afterEach(() => {
    cleanup();
});