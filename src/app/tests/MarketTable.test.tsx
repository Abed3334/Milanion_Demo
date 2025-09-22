import { render, screen } from "@testing-library/react";
import MarketTable from "@/app/components/MarketTable";
import { MarketProvider } from "@/app/context/MarketContext";

function renderWithProviders(ui: React.ReactNode) {
  return render(<MarketProvider>{ui}</MarketProvider>);
}

test("renders Market header", () => {
  renderWithProviders(<MarketTable />);
  expect(screen.getByRole("heading", { name: /market/i })).toBeInTheDocument();
});
