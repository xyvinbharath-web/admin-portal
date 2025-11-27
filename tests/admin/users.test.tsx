import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as usersService from "@/services/admin/users";
import AdminUsersPage from "@/app/admin/users/page";

vi.mock("@/services/admin/users");

const mockedService = usersService as unknown as {
  getAdminUsers: ReturnType<typeof vi.fn>;
};

describe("AdminUsersPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders users table", async () => {
    mockedService.getAdminUsers = vi.fn().mockResolvedValue({
      page: 1,
      limit: 10,
      totalPages: 1,
      totalRecords: 1,
      records: [
        {
          _id: "1",
          name: "Test User",
          email: "test@example.com",
          phone: "123",
          role: "user",
          status: "active",
          rewards: 0,
          createdAt: new Date().toISOString(),
        },
      ],
    });

    render(<AdminUsersPage />);

    expect(await screen.findByText("Test User")).toBeInTheDocument();
  });

  it("search updates query (service called with q)", async () => {
    const spy = vi
      .spyOn(usersService, "getAdminUsers")
      .mockResolvedValue({ page: 1, limit: 10, totalPages: 1, totalRecords: 0, records: [] } as any);

    render(<AdminUsersPage />);

    const input = screen.getByPlaceholderText("Search by name or email...");
    fireEvent.change(input, { target: { value: "john" } });

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });
  });

  it("filters by role", async () => {
    const spy = vi
      .spyOn(usersService, "getAdminUsers")
      .mockResolvedValue({ page: 1, limit: 10, totalPages: 1, totalRecords: 0, records: [] } as any);

    render(<AdminUsersPage />);

    const select = screen.getByDisplayValue("All roles") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "admin" } });

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });

    const lastCall = spy.mock.calls.at(-1)?.[0] as any;
    expect(lastCall).toMatchObject({ role: "admin" });
  });

  it("filters by status", async () => {
    const spy = vi
      .spyOn(usersService, "getAdminUsers")
      .mockResolvedValue({ page: 1, limit: 10, totalPages: 1, totalRecords: 0, records: [] } as any);

    render(<AdminUsersPage />);

    const select = screen.getByDisplayValue("All statuses") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "active" } });

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });

    const lastCall = spy.mock.calls.at(-1)?.[0] as any;
    expect(lastCall).toMatchObject({ status: "active" });
  });
});
