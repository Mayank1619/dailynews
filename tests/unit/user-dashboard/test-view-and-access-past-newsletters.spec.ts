import { describe, expect, it } from "vitest";
import { createDashboardHomeViewModel } from "../../../apps/web/src/features/user-dashboard/view-my-dashboard-home";

describe("US4 unit: view and access past newsletters", () => {
  it("shows empty state when no history exists", () => {
    const vm = createDashboardHomeViewModel({
      preferenceSummary: null,
      history: [],
      emptyHistory: true
    });

    expect(vm.showEmptyState).toBe(true);
    expect(vm.historyCount).toBe(0);
  });

  it("suppresses empty state when history entries are present", () => {
    const vm = createDashboardHomeViewModel({
      preferenceSummary: null,
      history: [{ newsletterId: "n1", date: "2026-05-27", status: "sent", viewUrl: "/n1" }],
      emptyHistory: false
    });

    expect(vm.showEmptyState).toBe(false);
    expect(vm.historyCount).toBe(1);
  });
});
