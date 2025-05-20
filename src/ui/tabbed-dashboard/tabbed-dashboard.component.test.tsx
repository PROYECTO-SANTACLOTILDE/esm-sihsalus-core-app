import React from 'react';
import { render, screen } from '@testing-library/react';
import TabbedDashboard, { TabConfig } from './tabbed-dashboard.component';

// Mock window.matchMedia for tests to avoid errors
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

describe('TabbedDashboard', () => {
  const tabs: TabConfig[] = [
    { labelKey: 'tab1', icon: () => <span>Icon1</span>, slotName: 'slot1' },
    { labelKey: 'tab2', icon: () => <span>Icon2</span>, slotName: 'slot2' },
  ];

  const patient = { id: 'patient-1' };
  const patientUuid = 'uuid-1234';
  const titleKey = 'dashboardTitle';
  const ariaLabelKey = 'ariaLabel';

  it('renders the dashboard title', () => {
    render(
      <TabbedDashboard
        patient={patient as any}
        patientUuid={patientUuid}
        titleKey={titleKey}
        tabs={tabs}
        ariaLabelKey={ariaLabelKey}
      />,
    );
    expect(screen.getByText(titleKey)).toBeInTheDocument();
  });

  it('renders all tabs with labels and icons', () => {
    render(
      <TabbedDashboard
        patient={patient as any}
        patientUuid={patientUuid}
        titleKey={titleKey}
        tabs={tabs}
        ariaLabelKey={ariaLabelKey}
      />,
    );
    tabs.forEach((tab) => {
      expect(screen.getByText(tab.labelKey)).toBeInTheDocument();
    });
  });

  it('renders ExtensionSlot components for each tab', () => {
    // Since ExtensionSlot is a complex component, we mock it to render a div with data-testid
    jest.mock('@openmrs/esm-framework', () => ({
      ...jest.requireActual('@openmrs/esm-framework'),
      ExtensionSlot: ({ name, children }: any) => (
        <div data-testid={`extension-slot-${name}`}>{children({ id: `extension-${name}` })}</div>
      ),
      Extension: () => <div>Extension Content</div>,
    }));

    render(
      <TabbedDashboard
        patient={patient as any}
        patientUuid={patientUuid}
        titleKey={titleKey}
        tabs={tabs}
        ariaLabelKey={ariaLabelKey}
      />,
    );
    tabs.forEach((tab) => {
      expect(screen.getByTestId(`extension-slot-${tab.slotName}`)).toBeInTheDocument();
    });
  });
});
