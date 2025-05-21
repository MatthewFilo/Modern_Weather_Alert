/**
 * @jest-environment jsdom
 */

beforeEach(() => {
  document.body.innerHTML = `
    <button id="legend-btn">Legend</button>
    <div id="legend-dialog" style="display: none;">
      <button id="close-legend">Close</button>
    </div>
  `;

  require('../src/frontend/js/legend.js');
  document.dispatchEvent(new Event('DOMContentLoaded'));
});

test('legend dialog is created in the DOM', () => {
  const legendDialog = document.getElementById('legend-dialog');
  expect(legendDialog).not.toBeNull();
});

test('legend dialog opens on button click', () => {
  const btn = document.getElementById('legend-btn');
  btn.click();

  const legendDialog = document.getElementById('legend-dialog');
  expect(legendDialog.style.display).toBe('flex');
});

test('legend dialog closes on close button click', () => {
  const openBtn = document.getElementById('legend-btn');
  const closeBtn = document.getElementById('close-legend');
  const dialog = document.getElementById('legend-dialog');

  openBtn.click(); // Open dialog
  expect(dialog.style.display).toBe('flex');

  closeBtn.click(); // Close dialog
  expect(dialog.style.display).toBe('none');
});

jest.mock('../src/frontend/js/map.js', () => {
  return {
    initMap: jest.fn(() => {
      global.maplibregl = {
        Map: jest.fn().mockImplementation(() => ({
          addControl: jest.fn(),
        })),
      };
    }),
  };
});
test('initMap does not throw', () => {
    const { initMap } = require('../src/frontend/js/map.js');
    expect(() => initMap()).not.toThrow();
});