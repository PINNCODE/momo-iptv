import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle sidebar visibility when pressing key M/m outside input', () => {
    expect(component.sidebarVisible).toBe(true);

    const event = new KeyboardEvent('keydown', { key: 'm' });
    document.dispatchEvent(event);
    expect(component.sidebarVisible).toBe(false);

    const event2 = new KeyboardEvent('keydown', { key: 'M' });
    document.dispatchEvent(event2);
    expect(component.sidebarVisible).toBe(true);
  });

  it('should NOT toggle sidebar visibility when pressing key M/m inside a text input', () => {
    expect(component.sidebarVisible).toBe(true);

    const input = document.createElement('input');
    input.type = 'text';
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent('keydown', { key: 'm', bubbles: true });
    input.dispatchEvent(event);

    expect(component.sidebarVisible).toBe(true);

    document.body.removeChild(input);
  });
});
